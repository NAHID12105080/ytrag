"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError } from "@/services/api-client";
import { createChatSession } from "@/services/chat";
import { createNotes, createVideoSession } from "@/services/videos";

export type ProcessingStepStatus = "idle" | "active" | "done" | "error";

export interface ProcessingStepState {
  id: "transcript" | "generate";
  label: string;
  status: ProcessingStepStatus;
}

export interface StartProcessingInput {
  youtubeUrl: string;
  language: string;
  mode: "chat" | "notes";
}

function updateStep(
  steps: ProcessingStepState[],
  id: ProcessingStepState["id"],
  status: ProcessingStepStatus,
): ProcessingStepState[] {
  return steps.map((step) => (step.id === id ? { ...step, status } : step));
}

export function useVideoProcessing() {
  const router = useRouter();
  const [steps, setSteps] = useState<ProcessingStepState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function start({ youtubeUrl, language, mode }: StartProcessingInput) {
    setError(null);
    setIsProcessing(true);
    setSteps([
      { id: "transcript", label: "Fetching transcript", status: "active" },
      {
        id: "generate",
        label: mode === "chat" ? "Building chat index" : "Extracting topics & notes",
        status: "idle",
      },
    ]);

    try {
      const videoSession = await createVideoSession({ youtubeUrl, language });
      setSteps((prev) => updateStep(updateStep(prev, "transcript", "done"), "generate", "active"));

      if (mode === "notes") {
        await createNotes(videoSession.id);
        setSteps((prev) => updateStep(prev, "generate", "done"));
        router.push(`/notes/${videoSession.id}`);
      } else {
        const chatSession = await createChatSession(videoSession.id);
        setSteps((prev) => updateStep(prev, "generate", "done"));
        router.push(`/chat/${chatSession.id}`);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong.";
      setError(message);
      setSteps((prev) =>
        prev.map((step) => (step.status === "active" ? { ...step, status: "error" } : step)),
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return { steps, error, isProcessing, start };
}
