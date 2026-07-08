export interface VideoSession {
  id: string;
  video_id: string;
  youtube_url: string;
  language: string;
  translated: boolean;
  transcript_length: number;
  transcript_preview: string;
  created_at: string;
}

export interface NotesResult {
  video_session_id: string;
  topics: string;
  notes: string;
}

export interface ChatSession {
  id: string;
  video_session_id: string;
  video_id: string;
  youtube_url: string;
  created_at: string;
  message_count: number;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  created_at: string;
}

export interface ChatMessagesResult {
  session_id: string;
  messages: ChatMessage[];
}

export interface MessageCreateResult {
  answer: string;
  messages: ChatMessage[];
}

export interface HealthStatus {
  status: "ok" | "degraded";
  gemini_configured: boolean;
  llm_model: string;
  embedding_model: string;
}
