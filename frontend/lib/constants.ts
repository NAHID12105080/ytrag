export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const DEFAULT_LANGUAGE = "en";

export const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/upload", label: "Upload" },
  { href: "/knowledge-base", label: "Knowledge Base" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
  { href: "/about", label: "About" },
] as const;
