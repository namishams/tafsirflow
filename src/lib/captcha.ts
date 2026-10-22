// Bot protection with Google reCAPTCHA: v3 runs invisibly on every protected form; if its score looks like a bot
// and a v2 key is configured, the user gets the "I'm not a robot" checkbox instead of being refused outright.
// Keys live only in the server environment (.env.app), never in the repository:
//   RECAPTCHA_V3_SITE_KEY / RECAPTCHA_V3_SECRET, RECAPTCHA_V2_SITE_KEY / RECAPTCHA_V2_SECRET, optional RECAPTCHA_MIN_SCORE (default 0.5)
// Without a v3 secret the check is switched off (local development).

export type CaptchaInput = { captcha?: unknown; captchaV2?: unknown };
export type CaptchaResult = "ok" | "challenge" | "fail";

export const captchaSiteKeys = () => ({ v3: process.env.RECAPTCHA_V3_SITE_KEY ?? "", v2: process.env.RECAPTCHA_V2_SITE_KEY ?? "" });
export const captchaEnabled = () => !!(process.env.RECAPTCHA_V3_SECRET && process.env.RECAPTCHA_V3_SITE_KEY);

async function siteverify(secret: string, token: string, ip: string) {
  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") body.set("remoteip", ip);
  const r = await fetch("https://www.google.com/recaptcha/api/siteverify", { method: "POST", body, signal: AbortSignal.timeout(6000) });
  return (await r.json()) as { success?: boolean; score?: number; action?: string; hostname?: string; "error-codes"?: string[] };
}

export async function checkCaptcha(input: CaptchaInput, action: string, ip: string): Promise<CaptchaResult> {
  if (!captchaEnabled()) return "ok";
  const v2Secret = process.env.RECAPTCHA_V2_SECRET, v2Site = process.env.RECAPTCHA_V2_SITE_KEY;
  try {
    // the checkbox was solved: that decides
    if (typeof input.captchaV2 === "string" && input.captchaV2 && v2Secret) {
      const r = await siteverify(v2Secret, input.captchaV2.slice(0, 4000), ip);
      return r.success ? "ok" : "fail";
    }
    const token = typeof input.captcha === "string" ? input.captcha.slice(0, 4000) : "";
    if (token) {
      const r = await siteverify(process.env.RECAPTCHA_V3_SECRET!, token, ip);
      const min = Number(process.env.RECAPTCHA_MIN_SCORE ?? 0.5);
      if (r.success && r.action === action && (r.score ?? 0) >= min) return "ok";
      if (!r.success && r["error-codes"]?.some((c) => c.includes("secret"))) { console.error("reCAPTCHA: secret rejected", r["error-codes"]); return "ok"; }
    }
    return v2Secret && v2Site ? "challenge" : "fail";
  } catch (e) {
    // Google unreachable: don't lock everyone out – rate limits and moderation still apply
    console.error("reCAPTCHA check failed", e);
    return "ok";
  }
}

// Strict check for the contact forms (/suggestions, /reciters/apply; owner 22.10.2026): the "I'm not a robot" checkbox
// is always required and the invisible v3 score is checked as well. Without a v2 key only v3 applies (logged).
export async function checkCaptchaStrict(input: CaptchaInput, action: string, ip: string): Promise<boolean> {
  if (!captchaEnabled()) return true;
  const v2Secret = process.env.RECAPTCHA_V2_SECRET, v2Site = process.env.RECAPTCHA_V2_SITE_KEY;
  if (!v2Secret || !v2Site) {
    console.warn(`reCAPTCHA v2 not configured: ${action} falls back to v3 only`);
    return (await checkCaptcha({ captcha: input.captcha }, action, ip)) === "ok";
  }
  const v2 = typeof input.captchaV2 === "string" ? input.captchaV2.slice(0, 4000) : "";
  const v3 = typeof input.captcha === "string" ? input.captcha.slice(0, 4000) : "";
  if (!v2) return false;
  try {
    const r2 = await siteverify(v2Secret, v2, ip);
    if (!r2.success) return false;
    if (!v3) return false;
    const r3 = await siteverify(process.env.RECAPTCHA_V3_SECRET!, v3, ip);
    if (!r3.success && r3["error-codes"]?.some((c) => c.includes("secret"))) { console.error("reCAPTCHA: secret rejected", r3["error-codes"]); return true; }
    return !!r3.success && r3.action === action && (r3.score ?? 0) >= Number(process.env.RECAPTCHA_MIN_SCORE ?? 0.5);
  } catch (e) {
    console.error("reCAPTCHA check failed", e);
    return true;
  }
}
