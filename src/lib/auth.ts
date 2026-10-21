import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";
import { pool } from "./db";
import { isHttps } from "./http";

const COOKIE = "tf_session";
const TTL_DAYS = 30;

export type User = { id: number; email: string; name: string | null; role: "user" | "admin"; plan: string; emailVerified: boolean; birthYear: number | null };

export function hashPassword(pw: string) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(pw, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export function verifyPassword(pw: string, stored: string) {
  const [alg, saltHex, keyHex] = stored.split("$");
  if (alg !== "scrypt" || !saltHex || !keyHex) return false;
  const key = crypto.scryptSync(pw, Buffer.from(saltHex, "hex"), 64);
  const want = Buffer.from(keyHex, "hex");
  return key.length === want.length && crypto.timingSafeEqual(key, want);
}

const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

// The owner's e-mail (env ADMIN_EMAIL) is always an admin
export const isAdminEmail = (email: string) => !!process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();

// returns the session token: the website keeps it in an httpOnly cookie, the mobile app stores it in the
// device keychain and sends it as "Authorization: Bearer <token>"
// method (password | code | passkey | register) and the client are shown on the security screen; a session that started
// with a sign-in counts as a fresh confirmation for 15 minutes (recentlyConfirmed)
export async function startSession(userId: number, req: NextRequest, method?: SessionMethod): Promise<string> {
  const p = pool()!;
  const token = crypto.randomBytes(32).toString("base64url");
  const app = req.headers.get("x-qmc-app");
  const client = app === "ios" || app === "android" ? app : app ? "app" : "web";
  try {
    await p.query("INSERT INTO sessions (token_hash, user_id, expires_at, created_at, method, client, user_agent) VALUES ($1, $2, now() + $3::int * interval '1 day', now(), $4, $5, $6)",
      [sha(token), userId, TTL_DAYS, method ?? null, client, (req.headers.get("user-agent") ?? "").slice(0, 200) || null]);
  } catch (e) {
    // database without the new session columns yet (schema not applied): the plain session still works
    if ((e as { code?: string }).code !== "42703") throw e;
    await p.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + $3::int * interval '1 day')", [sha(token), userId, TTL_DAYS]);
  }
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: isHttps(req), path: "/", maxAge: TTL_DAYS * 86400 });
  return token;
}

async function bearer(): Promise<string | undefined> {
  const h = (await headers()).get("authorization") ?? "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() || undefined : undefined;
}

export type SessionMethod = "password" | "code" | "passkey" | "register";

/** sha256 of the token of the current request's session (cookie or bearer), to tell "this device" from the others */
export async function currentSessionHash(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value ?? (await bearer());
  return token ? sha(token) : null;
}

// Sensitive steps (add a passkey, delete the account without a password, set a password) need a sign-in or a
// confirmation (e-mail code or password) of the last 15 minutes in this very session.
export async function recentlyConfirmed(): Promise<boolean> {
  const h = await currentSessionHash();
  if (!h) return false;
  const r = await pool()!.query(
    "SELECT 1 FROM sessions WHERE token_hash = $1 AND expires_at > now() AND ((method IS NOT NULL AND created_at > now() - interval '15 minutes') OR reauth_at > now() - interval '15 minutes')",
    [h],
  ).catch(() => ({ rows: [] }));
  return r.rows.length > 0;
}

export async function markConfirmed(): Promise<void> {
  const h = await currentSessionHash();
  if (h) await pool()!.query("UPDATE sessions SET reauth_at = now() WHERE token_hash = $1", [h]).catch(() => undefined);
}

// Accounts created with an e-mail code have no password (the column stays NOT NULL): this value never matches a
// password (verifyPassword only accepts "scrypt$…"), and "Forgot password" can still set one later.
export const NO_PASSWORD = "none";
export const hasPassword = (stored: string | null | undefined) => !!stored && stored.startsWith("scrypt$");

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value ?? (await bearer());
  if (token) await pool()?.query("DELETE FROM sessions WHERE token_hash = $1", [sha(token)]).catch(() => undefined);
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const p = pool();
  if (!p) return null;
  const token = (await cookies()).get(COOKIE)?.value ?? (await bearer());
  if (!token) return null;
  try {
    const r = await p.query(
      // a Pro subscription counts while pro_until lies in the future; plan 'premium' without pro_until is a lasting Premium
      "SELECT u.id, u.email, u.name, u.role, CASE WHEN u.plan = 'premium' AND (u.pro_until IS NULL OR u.pro_until > now()) THEN 'premium' ELSE 'free' END AS plan, u.email_verified, u.birth_year FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > now()",
      [sha(token)],
    );
    const u = r.rows[0];
    if (!u) return null;
    const verified = !!u.email_verified;
    // admin rights only for confirmed addresses, so nobody can claim the owner's e-mail before the owner confirms it
    const admin = verified && (u.role === "admin" || isAdminEmail(u.email));
    // the owner (admin) always has Premium
    return { id: Number(u.id), email: u.email, name: u.name, plan: admin ? "premium" : u.plan, emailVerified: verified, role: admin ? "admin" : "user", birthYear: u.birth_year ?? null };
  } catch {
    return null;
  }
}

export async function issueVerification(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url");
  const p = pool()!;
  await p.query("DELETE FROM email_verifications WHERE user_id = $1", [userId]);
  await p.query("INSERT INTO email_verifications (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '2 days')", [sha(token), userId]);
  return token;
}

export async function confirmVerification(token: string): Promise<boolean> {
  const r = await pool()!.query("DELETE FROM email_verifications WHERE token_hash = $1 AND expires_at > now() RETURNING user_id", [sha(token)]);
  if (!r.rows[0]) return false;
  await pool()!.query("UPDATE users SET email_verified = true WHERE id = $1", [r.rows[0].user_id]);
  return true;
}

export async function requireAdmin(): Promise<User | null> {
  const u = await currentUser();
  return u?.role === "admin" ? u : null;
}

export { COOKIE as SESSION_COOKIE };
