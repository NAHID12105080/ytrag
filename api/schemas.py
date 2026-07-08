from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

TaskMode = Literal["chat", "notes"]


class VideoCreateRequest(BaseModel):
    youtube_url: str = Field(min_length=1)
    language: str = Field(default="en", min_length=2, max_length=10)


class VideoSessionResponse(BaseModel):
    id: str
    video_id: str
    youtube_url: str
    language: str
    translated: bool
    transcript_length: int
    transcript_preview: str
    created_at: datetime


class NotesResponse(BaseModel):
    video_session_id: str
    topics: str
    notes: str


class ChatSessionCreateRequest(BaseModel):
    video_session_id: str


class ChatSessionResponse(BaseModel):
    id: str
    video_session_id: str
    video_id: str
    youtube_url: str
    created_at: datetime
    message_count: int


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime


class ChatMessagesResponse(BaseModel):
    session_id: str
    messages: list[ChatMessage]


class MessageCreateRequest(BaseModel):
    question: str = Field(min_length=1)


class MessageCreateResponse(BaseModel):
    answer: str
    messages: list[ChatMessage]


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    gemini_configured: bool
    llm_model: str
    embedding_model: str


class ErrorResponse(BaseModel):
    detail: str
