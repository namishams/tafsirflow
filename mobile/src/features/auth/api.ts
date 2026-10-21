import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { SITE } from "@/lib/api";
import type { User } from "@/lib/auth";
import { request } from "@/features/extra/http";

// Server calls for sign-in with an e-mail code, passkeys and the security screen (same routes as the website:
// /api/auth/code/*, /api/auth/passkey/*, /api/account/security). App requests need no captcha (header x-qmc-app).
export type Session = { user: User; token?: string };
export type CodeAnswer = { ok: boolean; status: number; data: { error?: string; left?: number; retryAfter?: number; resendIn?: number; user?: User; token?: string; registrationRequired?: boolean; ticket?: string } };

export const codeApi = {
  request: (email: string, locale: string) => request<CodeAnswer["data"]>("/api/auth/code/request", { email, locale }),
  confirmRequest: (locale: string) => request<CodeAnswer["data"]>("/api/auth/code/request", { purpose: "confirm", locale }),
  verify: (email: string, code: string) => request<CodeAnswer["data"]>("/api/auth/code/verify", { email, code }),
  register: (body: Record<string, unknown>) => request<CodeAnswer["data"]>("/api/auth/code/register", body),
  confirm: (code: string) => request<CodeAnswer["data"]>("/api/auth/code/confirm", { code }),
};

export type Passkey = { id: number; name: string; createdAt: string; lastUsedAt: string | null; synced: boolean };
export type DeviceSession = { id: string; current: boolean; createdAt: string | null; method: string | null; client: string | null; device: string };
export type Security = { email: string; hasPassword: boolean; confirmed: boolean; passkeys: Passkey[]; sessions: DeviceSession[] };

export const securityApi = {
  load: () => request<Security & { error?: string }>("/api/account/security"),
  act: (body: Record<string, unknown>) => request<{ ok?: boolean; error?: string; id?: string; secret?: string }>("/api/account/security", body),
  setPassword: (email: string, locale: string) => request("/api/auth/forgot", { email, locale }),
};

// Passkeys in the app: the passkey ceremony runs on the website's /account/passkey page inside the system sign-in
// sheet (ASWebAuthenticationSession on iOS, Custom Tab on Android), which uses the passkeys saved for
// quranmasterclass.com (iCloud Keychain, Google Password Manager, other providers). No native module is needed.
// Sign-in: the app holds a secret, the page only an id; the app redeems the finished handoff for its own session.
const CALLBACK = "quranmasterclass://passkey";
export const passkeysAvailable = Platform.OS === "ios" || Platform.OS === "android";

export async function passkeySignIn(lang: string): Promise<{ ok: true; session: Session } | { ok: false; error: "cancelled" | "failed" | "rate" | "offline" }> {
  let start;
  try { start = await request<{ id?: string; secret?: string; error?: string }>("/api/auth/passkey/app-start", {}); } catch { return { ok: false, error: "offline" }; }
  if (!start.ok || !start.data.id || !start.data.secret) return { ok: false, error: start.data.error === "rate" ? "rate" : "failed" };
  const res = await WebBrowser.openAuthSessionAsync(`${SITE}/${lang}/account/passkey?h=${encodeURIComponent(start.data.id)}`, CALLBACK).catch(() => null);
  // also after "dismiss": on Android the redirect can end the tab before the result arrives
  const fin = await request<{ user?: User; token?: string; error?: string }>("/api/auth/passkey/app-finish", { id: start.data.id, secret: start.data.secret }).catch(() => null);
  if (fin?.ok && fin.data.user && fin.data.token) return { ok: true, session: { user: fin.data.user, token: fin.data.token } };
  if (!res || res.type !== "success") return { ok: false, error: "cancelled" };
  return { ok: false, error: "failed" };
}

/** adds a passkey for the signed-in account; "reauth" = confirm with an e-mail code first */
export async function addPasskey(lang: string): Promise<"added" | "cancelled" | "reauth" | "failed"> {
  const link = await securityApi.act({ action: "passkey-link" });
  if (link.status === 403 && link.data.error === "reauth") return "reauth";
  if (!link.ok || !link.data.id || !link.data.secret) return "failed";
  // the secret travels in the fragment: it never reaches a server log or a referrer
  const res = await WebBrowser.openAuthSessionAsync(`${SITE}/${lang}/account/passkey#r=${encodeURIComponent(`${link.data.id}.${link.data.secret}`)}`, CALLBACK).catch(() => null);
  if (res?.type === "success" && /status=added/.test(res.url)) return "added";
  return "cancelled";
}
