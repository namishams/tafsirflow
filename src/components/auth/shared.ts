"use client";
import { useEffect, useState } from "react";

// Small helpers shared by the sign-in, confirmation and security components (website)
export const inputCls = "h-12 w-full rounded-lg border border-line bg-surface px-3.5 text-[15px] text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/15";

export async function postJSON<T = Record<string, unknown>>(url: string, body: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body ?? {}) });
  return { ok: r.ok, status: r.status, data: (await r.json().catch(() => ({}))) as T };
}

/** seconds until "send a new code" is possible again; start(n) after each sent code */
export function useCountdown(): [number, (n: number) => void] {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return [left, setLeft];
}

/** whether this browser can use passkeys (loaded lazily, so pages without passkeys do not load the library) */
export function usePasskeySupport(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    import("@simplewebauthn/browser").then((m) => setOk(m.browserSupportsWebAuthn())).catch(() => setOk(false));
  }, []);
  return ok;
}

/** the user cancelled the system passkey dialog (no error message for that) */
export const cancelled = (e: unknown) => {
  const n = (e as { name?: string; cause?: { name?: string } })?.name ?? "";
  const c = (e as { cause?: { name?: string } })?.cause?.name ?? "";
  return n === "NotAllowedError" || c === "NotAllowedError" || n === "AbortError" || (e as { code?: string })?.code === "ERROR_CEREMONY_ABORTED";
};
