import { Compass } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <Compass className="size-12 text-muted-foreground" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="max-w-sm text-muted-foreground">
        This page doesn&apos;t exist. It might have been moved, or the URL might be
        mistyped.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>
        Back to home
      </Button>
    </div>
  );
}
