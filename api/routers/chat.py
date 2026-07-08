import json
from collections.abc import Generator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from api import schemas, store
from core.exceptions import YtragError
from core.rag import create_chunks, create_vector_store, rag_answer, stream_rag_answer

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/videos/{video_session_id}/chat-sessions", response_model=schemas.ChatSessionResponse)
def create_chat_session(video_session_id: str) -> schemas.ChatSessionResponse:
    try:
        video_session = store.get_video_session(video_session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Video session not found") from None

    try:
        chunks = create_chunks(video_session.transcript)
        vector_store = create_vector_store(chunks)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to build vector store: {e}") from e

    session = store.ChatSessionRecord(
        id=store.new_id(),
        video_session_id=video_session.id,
        video_id=video_session.video_id,
        youtube_url=video_session.youtube_url,
        vector_store=vector_store,
        created_at=store.now(),
    )
    store.chat_sessions[session.id] = session

    return _to_session_response(session)


@router.get("/chat-sessions", response_model=list[schemas.ChatSessionResponse])
def list_chat_sessions() -> list[schemas.ChatSessionResponse]:
    sessions = sorted(store.chat_sessions.values(), key=lambda s: s.created_at, reverse=True)
    return [_to_session_response(s) for s in sessions]


@router.get("/chat-sessions/{chat_session_id}", response_model=schemas.ChatSessionResponse)
def get_chat_session(chat_session_id: str) -> schemas.ChatSessionResponse:
    session = _require_chat_session(chat_session_id)
    return _to_session_response(session)


@router.get("/chat-sessions/{chat_session_id}/messages", response_model=schemas.ChatMessagesResponse)
def get_messages(chat_session_id: str) -> schemas.ChatMessagesResponse:
    session = _require_chat_session(chat_session_id)
    return schemas.ChatMessagesResponse(
        session_id=session.id,
        messages=[_to_message(m) for m in session.messages],
    )


@router.post("/chat-sessions/{chat_session_id}/messages", response_model=schemas.MessageCreateResponse)
def create_message(chat_session_id: str, payload: schemas.MessageCreateRequest) -> schemas.MessageCreateResponse:
    session = _require_chat_session(chat_session_id)

    session.messages.append(store.ChatMessageRecord(role="user", content=payload.question, created_at=store.now()))

    try:
        answer = rag_answer(payload.question, session.vector_store)
    except YtragError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    session.messages.append(store.ChatMessageRecord(role="assistant", content=answer, created_at=store.now()))

    return schemas.MessageCreateResponse(answer=answer, messages=[_to_message(m) for m in session.messages])


@router.get("/chat-sessions/{chat_session_id}/stream")
def stream_message(chat_session_id: str, question: str) -> StreamingResponse:
    session = _require_chat_session(chat_session_id)

    if not question.strip():
        raise HTTPException(status_code=422, detail="question is required")

    session.messages.append(store.ChatMessageRecord(role="user", content=question, created_at=store.now()))

    return StreamingResponse(_stream_answer(session, question), media_type="text/event-stream")


@router.delete("/chat-sessions/{chat_session_id}/messages", status_code=204)
def clear_messages(chat_session_id: str) -> None:
    session = _require_chat_session(chat_session_id)
    session.messages.clear()


def _stream_answer(session: store.ChatSessionRecord, question: str) -> Generator[str, None, None]:
    chunks: list[str] = []
    try:
        for token in stream_rag_answer(question, session.vector_store):
            chunks.append(token)
            yield _sse_event({"token": token})
    except YtragError as e:
        yield _sse_event({"detail": str(e)}, event="error")
        return

    answer = "".join(chunks)
    session.messages.append(store.ChatMessageRecord(role="assistant", content=answer, created_at=store.now()))
    yield _sse_event({"answer": answer}, event="done")


def _sse_event(data: dict, event: str | None = None) -> str:
    prefix = f"event: {event}\n" if event else ""
    return f"{prefix}data: {json.dumps(data)}\n\n"


def _require_chat_session(chat_session_id: str) -> store.ChatSessionRecord:
    try:
        return store.get_chat_session(chat_session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Chat session not found") from None


def _to_message(message: store.ChatMessageRecord) -> schemas.ChatMessage:
    return schemas.ChatMessage(role=message.role, content=message.content, created_at=message.created_at)


def _to_session_response(session: store.ChatSessionRecord) -> schemas.ChatSessionResponse:
    return schemas.ChatSessionResponse(
        id=session.id,
        video_session_id=session.video_session_id,
        video_id=session.video_id,
        youtube_url=session.youtube_url,
        created_at=session.created_at,
        message_count=len(session.messages),
    )
