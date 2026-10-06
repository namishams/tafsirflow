import crypto from "node:crypto";
import { cookies } from "next/headers";
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

export async function startSession(userId: number, req: NextRequest) {
  const p = pool()!;
  const token = crypto.randomBytes(32).toString("base64url");
  await p.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + $3::int * interval '1 day')", [sha(token), userId, TTL_DAYS]);
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: isHttps(req), path: "/", maxAge: TTL_DAYS * 86400 });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await pool()?.query("DELETE FROM sessions WHERE token_hash = $1", [sha(token)]).catch(() => undefined);
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const p = pool();
  if (!p) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const r = await p.query(
      "SELECT u.id, u.email, u.name, u.role, u.plan, u.email_verified, u.birth_year FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > now()",
      [sha(token)],
    );
    const u = r.rows[0];
    if (!u) return null;
    const verified = !!u.email_verified;
    // admin rights only for confirmed addresses, so nobody can claim the owner's e-mail before the owner confirms it
    const admin = verified && (u.role === "admin" || isAdminEmail(u.email));
    return { id: Number(u.id), email: u.email, name: u.name, plan: u.plan, emailVerified: verified, role: admin ? "admin" : "user", birthYear: u.birth_year ?? null };
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
