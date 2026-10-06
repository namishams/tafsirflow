"use client";
// Loads Google reCAPTCHA only when a protected form is used (never on normal pages).
type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (key: string, o: { action: string }) => Promise<string>;
  render: (el: HTMLElement, o: { sitekey: string; callback: (t: string) => void; "expired-callback"?: () => void; theme?: string }) => number;
};
declare global { interface Window { grecaptcha?: Grecaptcha } }

let keys: Promise<{ v3: string; v2: string }> | null = null;
let script: Promise<void> | null = null;

export const captchaKeys = () => (keys ??= fetch("/api/captcha").then((r) => r.json()).catch(() => ({ v3: "", v2: "" })));

function load(v3: string): Promise<void> {
  return (script ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(v3)}`;
    s.async = true;
    s.onload = () => window.grecaptcha!.ready(() => resolve());
    s.onerror = () => { script = null; reject(new Error("recaptcha")); };
    document.head.appendChild(s);
  }));
}

// call early (e.g. when the form mounts) so the token is quick when the user submits
export async function warmCaptcha() {
  const k = await captchaKeys();
  if (k.v3) await load(k.v3).catch(() => undefined);
}

// invisible v3 token for one action; empty string when bot protection is off or Google is unreachable
export async function captchaToken(action: string): Promise<string> {
  const k = await captchaKeys();
  if (!k.v3) return "";
  try {
    await load(k.v3);
    return await window.grecaptcha!.execute(k.v3, { action });
  } catch {
    return "";
  }
}

export async function renderCheckbox(el: HTMLElement, onToken: (t: string) => void) {
  const k = await captchaKeys();
  if (!k.v2 || !k.v3) return;
  await load(k.v3);
  el.innerHTML = "";
  window.grecaptcha!.render(el, { sitekey: k.v2, callback: onToken, "expired-callback": () => onToken(""), theme: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" });
}
