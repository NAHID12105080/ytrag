import { API_BASE_URL } from "@/lib/constants";
import { apiRequest } from "@/services/api-client";
import type { ChatMessagesResult, ChatSession, MessageCreateResult } from "@/types/api";

export function createChatSession(videoSessionId: string): Promise<ChatSession> {
  return apiRequest<ChatSession>(`/api/videos/${videoSessionId}/chat-sessions`, {
    method: "POST",
    timeoutMs: 60_000,
  });
}

export function listChatSessions(): Promise<ChatSession[]> {
  return apiRequest<ChatSession[]>("/api/chat-sessions");
}

export function getChatSession(chatSessionId: string): Promise<ChatSession> {
  return apiRequest<ChatSession>(`/api/chat-sessions/${chatSessionId}`);
}

export function getChatMessages(chatSessionId: string): Promise<ChatMessagesResult> {
  return apiRequest<ChatMessagesResult>(`/api/chat-sessions/${chatSessionId}/messages`);
}

export function sendChatMessage(
  chatSessionId: string,
  question: string,
): Promise<MessageCreateResult> {
  return apiRequest<MessageCreateResult>(`/api/chat-sessions/${chatSessionId}/messages`, {
    method: "POST",
    body: { question },
  });
}

export function clearChatMessages(chatSessionId: string): Promise<void> {
  return apiRequest<void>(`/api/chat-sessions/${chatSessionId}/messages`, {
    method: "DELETE",
  });
}

interface StreamChatHandlers {
  onToken: (token: string) => void;
  onDone: (answer: string) => void;
  onError: (detail: string) => void;
}

/** Opens an SSE connection for a streaming answer. Caller is responsible for closing it. */
export function streamChatMessage(
  chatSessionId: string,
  question: string,
  handlers: StreamChatHandlers,
): EventSource {
  const url = new URL(`/api/chat-sessions/${chatSessionId}/stream`, API_BASE_URL);
  url.searchParams.set("question", question);

  const source = new EventSource(url.toString());

  source.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as { token: string };
      handlers.onToken(data.token);
    } catch {
      handlers.onError("Received a malformed response from the server.");
    }
  };

  source.addEventListener("done", (event) => {
    try {
      const data = JSON.parse((event as MessageEvent).data) as { answer: string };
      handlers.onDone(data.answer);
    } catch {
      handlers.onError("Received a malformed response from the server.");
    } finally {
      source.close();
    }
  });

  source.addEventListener("error", (event) => {
    const messageEvent = event as MessageEvent;
    if (messageEvent.data) {
      try {
        const data = JSON.parse(messageEvent.data) as { detail: string };
        handlers.onError(data.detail);
      } catch {
        handlers.onError("The connection to the server was lost.");
      }
    } else {
      handlers.onError("The connection to the server was lost.");
    }
    source.close();
  });

  return source;
}
