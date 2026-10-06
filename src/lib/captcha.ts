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
