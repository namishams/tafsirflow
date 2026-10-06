import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { pool } from "./db";
import { isHttps } from "./http";

const COOKIE = "tf_session";
const TTL_DAYS = 30;

export type User = { id: number; email: string; name: string | null; role: "user" | "admin"; plan: string };

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
      "SELECT u.id, u.email, u.name, u.role, u.plan FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > now()",
      [sha(token)],
    );
    const u = r.rows[0];
    if (!u) return null;
    return { ...u, id: Number(u.id), role: u.role === "admin" || isAdminEmail(u.email) ? "admin" : "user" };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<User | null> {
  const u = await currentUser();
  return u?.role === "admin" ? u : null;
}

export { COOKIE as SESSION_COOKIE };
