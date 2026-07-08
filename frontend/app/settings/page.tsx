"use client";

import { useQuery } from "@tanstack/react-query";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { DEFAULT_LANGUAGE } from "@/lib/constants";
import { getHealth } from "@/services/health";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const [defaultLanguage, setDefaultLanguage] = useLocalStorage(
    "ytrag:default-language",
    DEFAULT_LANGUAGE,
  );

  const healthQuery = useQuery({ queryKey: ["health"], queryFn: getHealth });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Preferences are stored locally in your browser.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Choose how ytrag looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={mounted ? (theme ?? "system") : undefined}
            onValueChange={setTheme}
            className="grid grid-cols-3 gap-3"
          >
            {THEME_OPTIONS.map((option) => (
              <label
                key={option.value}
                htmlFor={`theme-${option.value}`}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-border p-3 text-sm data-checked:border-primary"
                data-checked={mounted && theme === option.value ? "" : undefined}
              >
                <option.icon className="size-4" />
                <span className="flex items-center gap-1.5">
                  <RadioGroupItem id={`theme-${option.value}`} value={option.value} />
                  {option.label}
                </span>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Defaults</CardTitle>
          <CardDescription>Used to pre-fill the new-session form.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label htmlFor="default-language">Default video language code</Label>
          <Input
            id="default-language"
            value={defaultLanguage}
            onChange={(e) => setDefaultLanguage(e.target.value)}
            className="max-w-32"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backend</CardTitle>
          <CardDescription>Live configuration reported by the API.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {healthQuery.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : healthQuery.isError || !healthQuery.data ? (
            <p className="text-destructive">Couldn&apos;t reach the backend.</p>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{healthQuery.data.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">LLM model</span>
                <span className="font-medium">{healthQuery.data.llm_model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Embedding model</span>
                <span className="font-medium">{healthQuery.data.embedding_model}</span>
              </div>
            </>
          )}
          <Button variant="outline" size="sm" render={<Link href="/settings/api-keys" />} className="mt-2 self-start">
            View API key status
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
