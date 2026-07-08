import { NotesResult } from "@/components/notes/notes-result";

export default async function NotesPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <NotesResult videoSessionId={sessionId} />;
}
