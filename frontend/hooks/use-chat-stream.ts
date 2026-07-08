"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { streamChatMessage } from "@/services/chat";

export function useChatStream(chatSessionId: string, onDone: (answer: string) => void) {
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sourceRef = useRef<EventSource | null>(null);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const send = useCallback(
    (question: string) => {
      sourceRef.current?.close();
      setStreamingText("");
      setError(null);
      setIsStreaming(true);

      sourceRef.current = streamChatMessage(chatSessionId, question, {
        onToken: (token) => setStreamingText((prev) => prev + token),
        onDone: (answer) => {
          setIsStreaming(false);
          onDoneRef.current(answer);
        },
        onError: (detail) => {
          setIsStreaming(false);
          setError(detail);
        },
      });
    },
    [chatSessionId],
  );

  const cancel = useCallback(() => {
    sourceRef.current?.close();
    setIsStreaming(false);
  }, []);

  return { streamingText, isStreaming, error, send, cancel };
}
