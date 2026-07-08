from fastapi import APIRouter, HTTPException

from api import schemas, store
from core.exceptions import YtragError
from core.notes import generate_notes, get_important_topics

router = APIRouter(prefix="/api/videos", tags=["notes"])


@router.post("/{video_session_id}/notes", response_model=schemas.NotesResponse)
def create_notes(video_session_id: str) -> schemas.NotesResponse:
    try:
        session = store.get_video_session(video_session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Video session not found") from None

    if session.topics is not None and session.notes is not None:
        return schemas.NotesResponse(
            video_session_id=session.id,
            topics=session.topics,
            notes=session.notes,
        )

    try:
        topics = get_important_topics(session.transcript)
        notes = generate_notes(session.transcript)
    except YtragError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    session.topics = topics
    session.notes = notes

    return schemas.NotesResponse(video_session_id=session.id, topics=topics, notes=notes)
