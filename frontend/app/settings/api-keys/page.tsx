"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, KeyRound, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getHealth } from "@/services/health";

export default function ApiKeysPage() {
  const healthQuery = useQuery({ queryKey: ["health"], queryFn: getHealth });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API keys</h1>
        <p className="text-sm text-muted-foreground">
          ytrag is a single-user local app — the Gemini API key lives only in the
          backend&apos;s environment and is never sent to, or stored in, the browser.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="size-4" /> Google Gemini
          </CardTitle>
          <CardDescription>Status reported by the backend&apos;s /api/health endpoint.</CardDescription>
        </CardHeader>
        <CardContent>
          {healthQuery.isLoading ? (
            <Skeleton className="h-8 w-40" />
          ) : healthQuery.isError || !healthQuery.data ? (
            <p className="text-sm text-destructive">Couldn&apos;t reach the backend.</p>
          ) : healthQuery.data.gemini_configured ? (
            <Badge className="gap-1.5">
              <CheckCircle2 className="size-3.5" /> Connected
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1.5">
              <XCircle className="size-3.5" /> Not configured
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How to set it</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>Add your key to a `.env` file in the backend project root:</p>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
            GOOGLE_API_KEY=&quot;your-gemini-api-key-here&quot;
          </pre>
          <p>Then restart the backend for it to take effect.</p>
        </CardContent>
      </Card>
    </div>
  );
}
