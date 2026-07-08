"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, ListChecks } from "lucide-react";
import Link from "next/link";

import { CopyButton } from "@/components/chat/copy-button";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/services/api-client";
import { createNotes, getVideoSession } from "@/services/videos";

export function NotesResult({ videoSessionId }: { videoSessionId: string }) {
  const sessionQuery = useQuery({
    queryKey: ["video-session", videoSessionId],
    queryFn: () => getVideoSession(videoSessionId),
  });

  const notesQuery = useQuery({
    queryKey: ["notes", videoSessionId],
    queryFn: () => createNotes(videoSessionId),
  });

  if (notesQuery.isLoading || sessionQuery.isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  if (notesQuery.isError) {
    const message =
      notesQuery.error instanceof ApiError
        ? notesQuery.error.message
        : "Couldn't generate notes for this video.";
    return <ErrorState message={message} onRetry={() => notesQuery.refetch()} />;
  }

  const notes = notesQuery.data;
  const session = sessionQuery.data;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
        {session && (
          <a
            href={session.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:underline"
          >
            {session.youtube_url}
          </a>
        )}
      </div>

      {notes && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <ListChecks className="size-4 text-primary" /> Important topics
              </CardTitle>
              <CopyButton value={notes.topics} />
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={notes.topics} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4 text-primary" /> Notes
              </CardTitle>
              <CopyButton value={notes.notes} />
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={notes.notes} />
            </CardContent>
          </Card>
        </>
      )}

      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href="/chat" />}
        className="self-start"
      >
        Start another session
      </Button>
    </div>
  );
}
