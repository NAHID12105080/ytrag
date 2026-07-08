"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageSquare, MessagesSquare } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError } from "@/services/api-client";
import { listChatSessions } from "@/services/chat";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function HistoryPage() {
  const query = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: listChatSessions,
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conversation history</h1>
        <p className="text-sm text-muted-foreground">
          Past chat sessions from this backend process. Sessions are in-memory and
          reset on server restart.
        </p>
      </div>

      {query.isLoading && <LoadingSkeleton rows={4} />}

      {query.isError && (
        <ErrorState
          message={
            query.error instanceof ApiError ? query.error.message : "Couldn't load history."
          }
          onRetry={() => query.refetch()}
        />
      )}

      {query.data && query.data.length === 0 && (
        <EmptyState
          icon={MessagesSquare}
          title="No conversations yet"
          description="Start a new chat session to see it appear here."
          action={
            <Link href="/chat" className="text-sm font-medium text-primary hover:underline">
              Start a chat
            </Link>
          }
        />
      )}

      {query.data && query.data.length > 0 && (
        <div className="flex flex-col gap-3">
          {query.data.map((session) => (
            <Link key={session.id} href={`/chat/${session.id}`}>
              <Card className="transition-colors hover:border-primary/40">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <MessageSquare className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{session.youtube_url}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(session.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{session.message_count} messages</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
