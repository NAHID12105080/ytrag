import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone

from langchain_chroma import Chroma


@dataclass
class VideoSessionRecord:
    id: str
    video_id: str
    youtube_url: str
    language: str
    transcript: str
    translated: bool
    created_at: datetime
    topics: str | None = None
    notes: str | None = None


@dataclass
class ChatMessageRecord:
    role: str
    content: str
    created_at: datetime


@dataclass
class ChatSessionRecord:
    id: str
    video_session_id: str
    video_id: str
    youtube_url: str
    vector_store: Chroma
    created_at: datetime
    messages: list[ChatMessageRecord] = field(default_factory=list)


video_sessions: dict[str, VideoSessionRecord] = {}
chat_sessions: dict[str, ChatSessionRecord] = {}


def new_id() -> str:
    return uuid.uuid4().hex


def now() -> datetime:
    return datetime.now(timezone.utc)


def get_video_session(video_session_id: str) -> VideoSessionRecord:
    session = video_sessions.get(video_session_id)
    if session is None:
        raise KeyError(video_session_id)
    return session


def get_chat_session(chat_session_id: str) -> ChatSessionRecord:
    session = chat_sessions.get(chat_session_id)
    if session is None:
        raise KeyError(chat_session_id)
    return session
