import { AlertCircle, Bot, RotateCw, User } from "lucide-react";

import { CopyButton } from "@/components/chat/copy-button";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UiMessage } from "@/hooks/use-chat-session";

interface ChatBubbleProps {
  message: UiMessage;
  onRetry?: () => void;
}

export function ChatBubble({ message, onRetry }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      <div className={cn("group/bubble flex max-w-[80%] flex-col gap-1", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted",
            message.status === "error" && "border border-destructive/40 bg-destructive/5",
          )}
        >
          {message.status === "streaming" && message.content.length === 0 ? (
            <TypingIndicator />
          ) : message.status === "error" ? (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>Couldn&apos;t get a response. Please try again.</span>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/bubble:opacity-100">
          {message.status === "error" && onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              <RotateCw className="size-3.5" /> Retry
            </Button>
          )}
          {message.status === "done" && message.content && <CopyButton value={message.content} />}
        </div>
      </div>
    </div>
  );
}
