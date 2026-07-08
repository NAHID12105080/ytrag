from fastapi import APIRouter, HTTPException

from api import schemas, store
from core.exceptions import YtragError
from core.translation import translate_transcript
from core.youtube import extract_video_id, get_transcript

router = APIRouter(prefix="/api/videos", tags=["videos"])

_PREVIEW_LENGTH = 400


@router.post("", response_model=schemas.VideoSessionResponse)
def create_video_session(payload: schemas.VideoCreateRequest) -> schemas.VideoSessionResponse:
    try:
        video_id = extract_video_id(payload.youtube_url)
        transcript = get_transcript(video_id, payload.language)

        translated = False
        if payload.language != "en":
            transcript = translate_transcript(transcript)
            translated = True

    except YtragError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    session = store.VideoSessionRecord(
        id=store.new_id(),
        video_id=video_id,
        youtube_url=payload.youtube_url,
        language=payload.language,
        transcript=transcript,
        translated=translated,
        created_at=store.now(),
    )
    store.video_sessions[session.id] = session

    return _to_response(session)


@router.get("/{video_session_id}", response_model=schemas.VideoSessionResponse)
def get_video_session(video_session_id: str) -> schemas.VideoSessionResponse:
    try:
        session = store.get_video_session(video_session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Video session not found") from None

    return _to_response(session)


def _to_response(session: store.VideoSessionRecord) -> schemas.VideoSessionResponse:
    return schemas.VideoSessionResponse(
        id=session.id,
        video_id=session.video_id,
        youtube_url=session.youtube_url,
        language=session.language,
        translated=session.translated,
        transcript_length=len(session.transcript),
        transcript_preview=session.transcript[:_PREVIEW_LENGTH],
        created_at=session.created_at,
    )
