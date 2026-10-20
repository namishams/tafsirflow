import type { NextRequest } from "next/server";
import { rateLimited } from "./http";

// Requests from the native app carry the header x-qmc-app (as in /api/auth/[action]). The app cannot show Google
// reCAPTCHA, so forms that need it on the website accept app requests without it – but only after the caller has
// checked that the user is signed in with a confirmed e-mail, and with tighter limits per account and per address
// than on the website (these come on top of the route's own per-account limit).
export const fromApp = (req: NextRequest) => !!req.headers.get("x-qmc-app");

type Limit = { max: number; windowMs: number };
const HOUR = 60 * 60_000;
export const APP_LIMITS = {
  // feedback posts (website: 5 per hour and account)
  feedback: { user: [{ max: 2, windowMs: HOUR }, { max: 6, windowMs: 24 * HOUR }], ip: [{ max: 4, windowMs: HOUR }, { max: 12, windowMs: 24 * HOUR }] },
  // comments under verses (website: 5 per 10 minutes and account)
  comment: { user: [{ max: 3, windowMs: 10 * 60_000 }, { max: 30, windowMs: 24 * HOUR }], ip: [{ max: 6, windowMs: 10 * 60_000 }, { max: 60, windowMs: 24 * HOUR }] },
} satisfies Record<string, { user: Limit[]; ip: Limit[] }>;

/** true when an app request without reCAPTCHA has used up its stricter allowance */
export function appRateLimited(kind: keyof typeof APP_LIMITS, userId: number, ip: string) {
  const l = APP_LIMITS[kind];
  const hit = (key: string, list: Limit[]) => list.map((x, i) => rateLimited(`app-${kind}:${key}:${i}`, x.max, x.windowMs)).some(Boolean);
  // evaluate both, so a busy address cannot be used to spare the account counter (and the other way round)
  const u = hit(`u:${userId}`, l.user);
  const a = hit(`ip:${ip}`, l.ip);
  return u || a;
}
