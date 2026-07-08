"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { useChatStream } from "@/hooks/use-chat-stream";
import { clearChatMessages, getChatMessages, getChatSession } from "@/services/chat";
import type { ChatMessagesResult } from "@/types/api";

export interface UiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "done" | "streaming" | "error";
}

let uid = 0;
function nextId(): string {
  uid += 1;
  return `local-${uid}`;
}

function replaceLast(messages: UiMessage[], updater: (last: UiMessage) => UiMessage): UiMessage[] {
  if (messages.length === 0) return messages;
  const lastIndex = messages.length - 1;
  return [...messages.slice(0, lastIndex), updater(messages[lastIndex])];
}

export function useChatSession(chatSessionId: string) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["chat-session", chatSessionId],
    queryFn: () => getChatSession(chatSessionId),
  });

  const messagesQuery = useQuery({
    queryKey: ["chat-messages", chatSessionId],
    queryFn: () => getChatMessages(chatSessionId),
  });

  const [messages, setMessages] = useState<UiMessage[]>([]);

  // Seed local state from the fetched history exactly once, the first time it
  // arrives — done during render (React's documented pattern for "adjusting
  // state when a prop changes") rather than in an effect, so it commits
  // before paint instead of causing an extra render pass.
  const [hydratedFrom, setHydratedFrom] = useState<ChatMessagesResult | undefined>(undefined);
  if (messagesQuery.data && messagesQuery.data !== hydratedFrom) {
    setHydratedFrom(messagesQuery.data);
    setMessages(
      messagesQuery.data.messages.map((m) => ({
        id: nextId(),
        role: m.role,
        content: m.content,
        status: "done" as const,
      })),
    );
  }

  const { streamingText, isStreaming, error: streamError, send } = useChatStream(
    chatSessionId,
    (answer) => {
      setMessages((prev) => replaceLast(prev, (last) => ({ ...last, content: answer, status: "done" })));
    },
  );

  // Derive what's actually shown from committed messages + in-flight stream
  // state, instead of syncing the stream into `messages` via an effect.
  const displayMessages = useMemo(() => {
    if (messages.length === 0) return messages;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant" || last.status !== "streaming") return messages;

    if (streamError) {
      return replaceLast(messages, (m) => ({ ...m, status: "error" }));
    }
    if (isStreaming) {
      return replaceLast(messages, (m) => ({ ...m, content: streamingText }));
    }
    return messages;
  }, [messages, isStreaming, streamingText, streamError]);

  function sendMessage(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isStreaming) return;

    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", content: trimmed, status: "done" },
      { id: nextId(), role: "assistant", content: "", status: "streaming" },
    ]);

    send(trimmed);
  }

  function retryLast() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser || isStreaming) return;

    setMessages((prev) => {
      const last = prev[prev.length - 1];
      const withoutFailedTail = last && last.role === "assistant" && last.status !== "done" ? prev.slice(0, -1) : prev;
      return [...withoutFailedTail, { id: nextId(), role: "assistant", content: "", status: "streaming" }];
    });

    send(lastUser.content);
  }

  async function clearConversation() {
    await clearChatMessages(chatSessionId);
    setMessages([]);
    queryClient.invalidateQueries({ queryKey: ["chat-messages", chatSessionId] });
    queryClient.invalidateQueries({ queryKey: ["chat-session", chatSessionId] });
  }

  return {
    session: sessionQuery.data,
    isLoadingSession: sessionQuery.isLoading,
    sessionError: sessionQuery.error,
    messages: displayMessages,
    isLoadingMessages: messagesQuery.isLoading && !hydratedFrom,
    isStreaming,
    streamError,
    sendMessage,
    retryLast,
    clearConversation,
  };
}
