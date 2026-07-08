import { ChatWindow } from "@/components/chat/chat-window";

export default async function ChatSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <ChatWindow chatSessionId={sessionId} />;
}
