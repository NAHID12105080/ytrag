import { apiRequest } from "@/services/api-client";
import type { NotesResult, VideoSession } from "@/types/api";

export interface CreateVideoSessionInput {
  youtubeUrl: string;
  language: string;
}

export function createVideoSession({
  youtubeUrl,
  language,
}: CreateVideoSessionInput): Promise<VideoSession> {
  return apiRequest<VideoSession>("/api/videos", {
    method: "POST",
    body: { youtube_url: youtubeUrl, language },
  });
}

export function getVideoSession(videoSessionId: string): Promise<VideoSession> {
  return apiRequest<VideoSession>(`/api/videos/${videoSessionId}`);
}

export function createNotes(videoSessionId: string): Promise<NotesResult> {
  return apiRequest<NotesResult>(`/api/videos/${videoSessionId}/notes`, {
    method: "POST",
    timeoutMs: 60_000,
  });
}
