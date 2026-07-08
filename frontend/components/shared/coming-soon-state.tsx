import { Construction } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface ComingSoonStateProps {
  title: string;
  description: string;
}

/**
 * Honest placeholder for pages whose backend capability doesn't exist yet
 * (no fake data, no calls to endpoints that don't exist).
 */
export function ComingSoonState({ title, description }: ComingSoonStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-24 text-center">
      <Construction className="size-10 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="secondary">Coming soon</Badge>
      </div>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
