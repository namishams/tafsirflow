import { Platform } from "react-native";
import { getToken } from "./storage";

// Everything comes from the same server as the website, so app and website show the same content and progress.
// EXPO_PUBLIC_SITE only for local previews (e.g. the web preview against a test server)
export const SITE = process.env.EXPO_PUBLIC_SITE ?? "https://quranmasterclass.com";

export class ApiError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}

/**
 * A read (GET) that got no answer in this time fails (captive portals, a dead connection), so screens show their error
 * state with a retry instead of a spinner that never ends. Writes have no default limit (the assistant and the dua
 * generator may think for a while); `timeoutMs` sets one for any request.
 */
export const API_TIMEOUT_MS = 15000;

export async function api<T>(path: string, init: { method?: string; body?: unknown; headers?: Record<string, string>; timeoutMs?: number } = {}): Promise<T> {
  const token = await getToken();
  const method = init.method ?? (init.body !== undefined ? "POST" : "GET");
  const limit = init.timeoutMs ?? (method === "GET" ? API_TIMEOUT_MS : 0);
  const ctrl = limit > 0 && typeof AbortController === "function" ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), limit) : null;
  try {
    const res = await fetch(`${SITE}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "x-qmc-app": Platform.OS,
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: ctrl?.signal,
    });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      throw new ApiError(res.status, d.error ?? `http_${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
