import { ComingSoonState } from "@/components/shared/coming-soon-state";

export default function UploadPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload documents</h1>
        <p className="text-sm text-muted-foreground">
          Bring your own PDFs and other documents into ytrag.
        </p>
      </div>
      <ComingSoonState
        title="Document upload isn't wired up yet"
        description="The backend currently only ingests YouTube video transcripts. PDF/OCR ingestion needs a new backend pipeline before this page can do anything real — tracked as a follow-up."
      />
    </div>
  );
}
