import type { ApiErrorBody } from "@/types/api";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth/tokens";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(message: string, status: number, body: ApiErrorBody | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export type ApiFetchOptions = RequestInit & {
  /** Attach Bearer access token (client only). Default false. */
  auth?: boolean;
  /** Internal: already retried after refresh. */
  _retried?: boolean;
};

function joinUrl(path: string): string {
  if (!API_BASE) {
    throw new ApiError("NEXT_PUBLIC_API_URL is not configured", 0);
  }
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseBody(res: Response): Promise<ApiErrorBody | null> {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  try {
    return (await res.json()) as ApiErrorBody;
  } catch {
    return null;
  }
}

function messageFromBody(body: ApiErrorBody | null, fallback: string): string {
  if (!body) return fallback;
  if (typeof body.detail === "string") return body.detail;
  const nested = body.error as { detail?: string; code?: string } | undefined;
  if (nested && typeof nested.detail === "string") return nested.detail;
  // DRF field errors: { field: ["msg"] }
  for (const [k, v] of Object.entries(body)) {
    if (k === "code") continue;
    if (Array.isArray(v) && typeof v[0] === "string") return v[0];
    if (typeof v === "string") return v;
  }
  return fallback;
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) {
      clearTokens();
      return null;
    }
    try {
      const res = await fetch(joinUrl("/auth/token/refresh/"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) {
        clearTokens();
        return null;
      }
      const data = (await res.json()) as { access?: string };
      if (!data.access) {
        clearTokens();
        return null;
      }
      setTokens(data.access, refresh);
      return data.access;
    } catch {
      clearTokens();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = false, _retried = false, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders || {});
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const access = getAccessToken();
    if (access) headers.set("Authorization", `Bearer ${access}`);
  }

  let res: Response;
  try {
    res = await fetch(joinUrl(path), { ...rest, headers });
  } catch {
    throw new ApiError("Network error — check your connection and API URL.", 0);
  }

  if (res.status === 401 && auth && !_retried && typeof window !== "undefined") {
    const next = await refreshAccess();
    if (next) {
      return apiFetch<T>(path, { ...options, _retried: true });
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("caitech:auth-cleared"));
    }
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  if (!res.ok) {
    const body = await parseBody(res);
    throw new ApiError(
      messageFromBody(body, res.statusText || "Request failed"),
      res.status,
      body,
    );
  }

  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return undefined as T;
  return (await res.json()) as T;
}

/** Field-level DRF errors for forms */
export function fieldErrors(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError) || !err.body) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(err.body)) {
    if (k === "detail" || k === "code") continue;
    if (Array.isArray(v) && typeof v[0] === "string") out[k] = v[0];
    else if (typeof v === "string") out[k] = v;
  }
  return out;
}
