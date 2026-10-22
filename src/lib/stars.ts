import crypto from "node:crypto";
import { pool } from "./db";
import { RECITER_BIOS, type ReciterBio } from "./reciters";
import { STARS } from "./usernameFilter";

// Star profiles (owner 22.10.2026): every well-known reciter of the reciters data has a reserved username (STARS in
// usernameFilter.ts) and a public, unclaimed profile that shows only facts already in the app (name, country, the
// biography, the recitations in the player). The reciter or his official team can take it over (star_claims); an admin
// approves with one click, which moves the reserved username to that account and sets the "star" badge.
export type Star = { username: string; reciter: ReciterBio };

export function starByUsername(username: string): Star | null {
  const s = STARS.find((x) => x[0] === username);
  const reciter = s ? RECITER_BIOS.find((r) => r.slug === s[1]) : undefined;
  return s && reciter ? { username: s[0], reciter } : null;
}
export const starByReciter = (slug: string) => {
  const s = STARS.find((x) => x[1] === slug);
  return s ? starByUsername(s[0]) : null;
};

/** claimed state from the database (null without a database: shown as unclaimed) */
export async function starClaimed(username: string): Promise<boolean> {
  const p = pool();
  if (!p) return false;
  try {
    const r = await p.query("SELECT claimed_by FROM star_profiles WHERE slug = $1", [username]);
    return !!r.rows[0]?.claimed_by;
  } catch { return false; }
}

// ---------- personal invite link for the owner (signed, 30 days) ----------
const key = () => process.env.STAR_INVITE_SECRET || process.env.AUTH_CODE_SECRET || process.env.CERT_SECRET || "quran-masterclass-star-invite";
const sig = (body: string) => crypto.createHmac("sha256", key()).update(`star|${body}`).digest("base64url").slice(0, 32);
export const INVITE_DAYS = 30;
export function starInviteToken(username: string, now = Date.now()): string {
  const body = `${username}.${Math.floor(now / 1000) + INVITE_DAYS * 86400}`;
  return `${Buffer.from(body).toString("base64url")}.${sig(body)}`;
}
/** true when the token was made for this star and has not expired */
export function starInviteValid(username: string, token: unknown): boolean {
  if (typeof token !== "string" || token.length > 200) return false;
  const [b64, s] = token.split(".");
  if (!b64 || !s) return false;
  const body = Buffer.from(b64, "base64url").toString();
  const i = body.lastIndexOf(".");
  if (body.slice(0, i) !== username || Number(body.slice(i + 1)) * 1000 < Date.now()) return false;
  const want = sig(body);
  return want.length === s.length && crypto.timingSafeEqual(Buffer.from(want), Buffer.from(s));
}

/** https link to a verified public channel (Instagram, X, YouTube, TikTok, Facebook or an own website) */
export function cleanChannel(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, 300);
  try {
    const u = new URL(s);
    if (u.protocol !== "https:" || !u.hostname.includes(".") || u.username || u.password) return null;
    return u.toString();
  } catch { return null; }
}
