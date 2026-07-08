import { GitBranch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STACK = [
  { group: "Frontend", items: ["Next.js (App Router)", "TypeScript", "Tailwind CSS", "shadcn/ui", "TanStack Query"] },
  { group: "Backend", items: ["FastAPI", "LangChain", "ChromaDB", "Google Gemini 2.5 Flash"] },
  { group: "Data", items: ["YouTube Transcript API", "Gemini embeddings"] },
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">About ytrag</h1>
        <p className="text-sm text-muted-foreground">
          A YouTube transcript RAG summarizer and chatbot. Paste a video, get study
          notes or ask questions grounded in what was actually said.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            The backend fetches the video&apos;s transcript, translates it to English if
            needed, and either extracts topics/notes directly or chunks + embeds it
            into a vector store for retrieval-augmented chat. All AI logic runs
            server-side in Python — this frontend only handles presentation and talks
            to the backend over HTTP.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tech stack</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {STACK.map((group) => (
            <div key={group.group}>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {group.group}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="size-4" /> Source
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This project migrated from a Streamlit prototype to this Next.js +
          FastAPI architecture, keeping the same RAG pipeline underneath.
        </CardContent>
      </Card>
    </div>
  );
}
