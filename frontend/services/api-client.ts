import { API_BASE_URL, DEFAULT_REQUEST_TIMEOUT_MS } from "@/lib/constants";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
  }
}

type HttpMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  timeoutMs?: number;
  /** Only honored for GET requests — mutating requests are never auto-retried. */
  retries?: number;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseErrorDetail(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") return data.detail;
  } catch {
    // response wasn't JSON — fall through
  }
  return res.statusText || `Request failed with status ${res.status}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    params,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
    retries = method === "GET" ? 2 : 0,
    signal,
  } = options;

  const url = buildUrl(path, params);
  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    signal?.addEventListener("abort", onAbort);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new ApiError(res.status, await parseErrorDetail(res));
      }

      if (res.status === 204) {
        return undefined as T;
      }

      return (await res.json()) as T;
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      const normalized = isAbort
        ? new ApiError(0, "Request timed out. Please try again.")
        : err instanceof ApiError
          ? err
          : new ApiError(0, err instanceof Error ? err.message : "Network error");

      const retryable = normalized.status === 0 || normalized.status >= 500;
      if (!retryable || attempt >= retries) {
        throw normalized;
      }

      attempt += 1;
      await delay(300 * attempt);
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", onAbort);
    }
  }
}
