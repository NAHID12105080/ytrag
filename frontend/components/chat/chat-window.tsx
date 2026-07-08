"use client";

import { MessageSquare } from "lucide-react";
import { useEffect, useRef } from "react";

import { ChatBubble } from "@/components/chat/chat-bubble";
import { ClearConversationDialog } from "@/components/chat/clear-conversation-dialog";
import { MessageInput } from "@/components/chat/message-input";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useChatSession } from "@/hooks/use-chat-session";

export function ChatWindow({ chatSessionId }: { chatSessionId: string }) {
  const {
    session,
    isLoadingSession,
    messages,
    isLoadingMessages,
    isStreaming,
    sendMessage,
    retryLast,
    clearConversation,
  } = useChatSession(chatSessionId);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Chat with video</h2>
          {session && (
            <a
              href={session.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-xs text-muted-foreground hover:underline"
            >
              {session.youtube_url}
            </a>
          )}
        </div>
        <ClearConversationDialog
          onConfirm={clearConversation}
          disabled={!session || isLoadingSession}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoadingMessages ? (
          <LoadingSkeleton rows={3} />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Ask a question about the video to get started."
          />
        ) : (
          <div className="flex flex-col gap-5">
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                onRetry={message.status === "error" ? retryLast : undefined}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <MessageInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
