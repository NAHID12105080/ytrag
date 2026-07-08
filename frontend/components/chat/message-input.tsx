"use client";

import { SendHorizonal } from "lucide-react";
import { useState } from "react";
import type { KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState("");

  function submit() {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-border bg-background p-3">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything about the video..."
        disabled={disabled}
        rows={1}
        className="max-h-40 min-h-10 resize-none"
      />
      <Button
        type="button"
        size="icon"
        disabled={disabled || !value.trim()}
        onClick={submit}
        aria-label="Send message"
      >
        <SendHorizonal className="size-4" />
      </Button>
    </div>
  );
}
