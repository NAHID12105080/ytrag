"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { ProcessingStepper } from "@/components/chat/processing-stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useVideoProcessing } from "@/hooks/use-video-processing";
import { DEFAULT_LANGUAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  youtubeUrl: z
    .string()
    .trim()
    .min(1, "Enter a YouTube URL")
    .refine((v) => /youtu\.?be/i.test(v), "Enter a valid YouTube URL"),
  language: z
    .string()
    .trim()
    .min(2, "Use a language code, e.g. en")
    .max(10, "Use a short language code, e.g. en"),
  mode: z.enum(["chat", "notes"]),
});

type FormValues = z.infer<typeof formSchema>;

const MODE_OPTIONS = [
  { value: "chat" as const, label: "Chat with video", description: "Ask questions, get grounded answers" },
  { value: "notes" as const, label: "Generate notes", description: "Key topics + structured study notes" },
];

export default function NewChatSessionPage() {
  const { steps, error, isProcessing, start } = useVideoProcessing();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { youtubeUrl: "", language: DEFAULT_LANGUAGE, mode: "chat" },
  });

  const mode = useWatch({ control: form.control, name: "mode" });

  function onSubmit(values: FormValues) {
    start(values);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Start a new session</h1>
        <p className="text-sm text-muted-foreground">
          Paste a YouTube URL and choose what you&apos;d like to do with it.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input
                id="youtubeUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isProcessing}
                {...form.register("youtubeUrl")}
              />
              {form.formState.errors.youtubeUrl && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.youtubeUrl.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="language">Video language code</Label>
              <Input
                id="language"
                placeholder="en"
                disabled={isProcessing}
                {...form.register("language")}
              />
              {form.formState.errors.language && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.language.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>What do you want to do?</Label>
              <RadioGroup
                value={mode}
                onValueChange={(value) => form.setValue("mode", value as FormValues["mode"])}
                disabled={isProcessing}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {MODE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`mode-${option.value}`}
                    className={cn(
                      "flex cursor-pointer flex-col gap-1 rounded-md border border-border p-3 text-sm transition-colors",
                      mode === option.value && "border-primary bg-primary/5",
                    )}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <RadioGroupItem id={`mode-${option.value}`} value={option.value} />
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Start processing
            </Button>
          </form>
        </CardContent>
      </Card>

      {steps.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <ProcessingStepper steps={steps} />
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
