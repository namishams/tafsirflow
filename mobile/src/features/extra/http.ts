import { Platform } from "react-native";
import { SITE } from "@/lib/api";
import { getToken } from "@/lib/storage";

// Like lib/api.ts, but returns status and the whole JSON body also for errors (some routes explain a refusal,
// e.g. /api/social/comment answers 422 with { error: "rejected", reason: "links" }).
export async function request<T = Record<string, unknown>>(path: string, body?: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  const token = await getToken();
  const res = await fetch(`${SITE}${path}`, {
    method: body !== undefined ? "POST" : "GET",
    headers: {
      Accept: "application/json",
      "x-qmc-app": Platform.OS,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}
