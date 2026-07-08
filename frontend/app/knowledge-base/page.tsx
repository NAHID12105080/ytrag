import { ComingSoonState } from "@/components/shared/coming-soon-state";

export default function KnowledgeBasePage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge base</h1>
        <p className="text-sm text-muted-foreground">
          A persistent, multi-document index you can chat across.
        </p>
      </div>
      <ComingSoonState
        title="Multi-document knowledge base isn't available yet"
        description="Today, each chat session is a single video's transcript in an in-memory vector store. A shared, persistent knowledge base across documents needs new backend storage and ingestion work — tracked as a follow-up."
      />
    </div>
  );
}
