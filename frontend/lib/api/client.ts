import type { ApiErrorBody } from "@/types/api";

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(message: string, status: number, body: ApiErrorBody | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!base) {
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:8000/api/v1";
    }
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return base.endsWith("/api/v1") ? base : `${base}/api/v1`;
}

export type ApiFetchOptions = RequestInit & {
  /** Attach Bearer token when present (client or server caller supplies it). */
  token?: string | null;
  /** Skip JSON content-type (e.g. FormData). */
  rawBody?: boolean;
};

/**
 * Thin fetch wrapper. No React Query / SWR in Phase 1.
 * Callers decide cache (RSC fetch cache, no-store, etc.).
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, rawBody, headers: initHeaders, ...init } = options;
  const url = path.startsWith("http")
    ? path
    : `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(initHeaders);
  if (!rawBody && !headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Accept", "application/json");

  const res = await fetch(url, {
    ...init,
    headers,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { detail: text };
    }
  }

  if (!res.ok) {
    const body = (data as ApiErrorBody) ?? null;
    const message =
      (body && typeof body.detail === "string" && body.detail) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, body);
  }

  return data as T;
}

export function getApiBaseUrl(): string {
  return getBaseUrl();
}
