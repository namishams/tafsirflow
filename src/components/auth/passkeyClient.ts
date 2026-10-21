"use client";
import type { Me } from "@/lib/sync";
import { cancelled, postJSON } from "./shared";

// Passkey ceremonies in the browser (@simplewebauthn/browser, loaded only when used). handoff = the app's sign-in sheet.
export type PasskeyResult = { ok: true; user?: Me } | { ok: false; error: "cancelled" | "unknown" | "reauth" | "handoff" | "unsupported" | "rate" | "failed" | "exists" | "limit" };

export async function passkeySignIn(handoff?: string): Promise<PasskeyResult> {
  const { startAuthentication, browserSupportsWebAuthn } = await import("@simplewebauthn/browser");
  if (!browserSupportsWebAuthn()) return { ok: false, error: "unsupported" };
  const o = await postJSON<{ options: Parameters<typeof startAuthentication>[0]["optionsJSON"]; challengeId: string; error?: string }>("/api/auth/passkey/login-options", {});
  if (!o.ok) return { ok: false, error: o.data.error === "rate" ? "rate" : "failed" };
  let response;
  try {
    response = await startAuthentication({ optionsJSON: o.data.options });
  } catch (e) {
    return { ok: false, error: cancelled(e) ? "cancelled" : "failed" };
  }
  const v = await postJSON<{ user?: Me; error?: string }>("/api/auth/passkey/login-verify", { challengeId: o.data.challengeId, response, ...(handoff ? { handoff } : {}) });
  if (!v.ok) return { ok: false, error: v.data.error === "unknown" ? "unknown" : v.data.error === "handoff" ? "handoff" : v.data.error === "rate" ? "rate" : "failed" };
  return { ok: true, user: v.data.user };
}

export async function passkeyRegister(handoff?: string): Promise<PasskeyResult> {
  const { startRegistration, browserSupportsWebAuthn } = await import("@simplewebauthn/browser");
  if (!browserSupportsWebAuthn()) return { ok: false, error: "unsupported" };
  const o = await postJSON<{ options: Parameters<typeof startRegistration>[0]["optionsJSON"]; challengeId: string; error?: string }>("/api/auth/passkey/register-options", handoff ? { handoff } : {});
  if (!o.ok) {
    const e = o.data.error;
    return { ok: false, error: e === "reauth" ? "reauth" : e === "handoff" ? "handoff" : e === "limit" ? "limit" : e === "rate" ? "rate" : "failed" };
  }
  let response;
  try {
    response = await startRegistration({ optionsJSON: o.data.options });
  } catch (e) {
    // InvalidStateError: this authenticator already holds a passkey for the account
    if ((e as { name?: string })?.name === "InvalidStateError" || (e as { code?: string })?.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED") return { ok: false, error: "exists" };
    return { ok: false, error: cancelled(e) ? "cancelled" : "failed" };
  }
  const v = await postJSON<{ error?: string }>("/api/auth/passkey/register-verify", { challengeId: o.data.challengeId, response, ...(handoff ? { handoff } : {}) });
  if (!v.ok) return { ok: false, error: v.data.error === "exists" ? "exists" : v.data.error === "handoff" ? "handoff" : "failed" };
  return { ok: true };
}
