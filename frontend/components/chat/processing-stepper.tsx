import { Check, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProcessingStepState } from "@/hooks/use-video-processing";

export function ProcessingStepper({ steps }: { steps: ProcessingStepState[] }) {
  if (steps.length === 0) return null;

  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step) => (
        <li key={step.id} className="flex items-center gap-3 text-sm">
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border",
              step.status === "done" && "border-primary bg-primary text-primary-foreground",
              step.status === "active" && "border-primary text-primary",
              step.status === "error" && "border-destructive text-destructive",
              step.status === "idle" && "border-border text-muted-foreground",
            )}
          >
            {step.status === "done" && <Check className="size-3.5" />}
            {step.status === "active" && <Loader2 className="size-3.5 animate-spin" />}
            {step.status === "error" && <X className="size-3.5" />}
          </span>
          <span className={cn(step.status === "idle" && "text-muted-foreground")}>
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
