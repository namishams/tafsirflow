import { Platform } from "react-native";
import { getToken } from "./storage";

// Everything comes from the same server as the website, so app and website show the same content and progress.
// EXPO_PUBLIC_SITE only for local previews (e.g. the web preview against a test server)
export const SITE = process.env.EXPO_PUBLIC_SITE ?? "https://quranmasterclass.com";

export class ApiError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown; headers?: Record<string, string> } = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${SITE}${path}`, {
    method: init.method ?? (init.body !== undefined ? "POST" : "GET"),
    headers: {
      Accept: "application/json",
      "x-qmc-app": Platform.OS,
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) {
    const d = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, d.error ?? `http_${res.status}`);
  }
  return (await res.json()) as T;
}
