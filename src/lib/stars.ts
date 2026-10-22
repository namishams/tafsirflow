import crypto from "node:crypto";
import { pool } from "./db";
import { RECITER_BIOS, type ReciterBio } from "./reciters";
import { STARS, STARS_EXTRA } from "./usernameFilter";

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

/** a reserved reciter name: with a biography in the data (public star profile) or without (name reserved only, no page) */
export type Reserved = { username: string; name: string; reciter?: ReciterBio };
export function reservedByUsername(username: string): Reserved | null {
  const s = starByUsername(username);
  if (s) return { username: s.username, name: s.reciter.name, reciter: s.reciter };
  const p = STARS_EXTRA.find((x) => x[0] === username);
  return p ? { username: p[0], name: p[1] } : null;
}

/** claimed state from the database (null without a database: shown as unclaimed) */
export async function starClaimed(username: string): Promise<boolean> {
  const p = pool();
  if (!p) return false;
  try {
    const r = await p.query("SELECT claimed_by FROM star_profiles WHERE slug = $1", [username]);
    return !!r.rows[0]?.claimed_by;
  } catch { return false; }
}

// ---------- personal invite link (pre-approved, single use, 30 days) ----------
// The owner sends it privately to the right person; opening it, signing in and tapping "Profil übernehmen" assigns the
// name at once. Only the SHA-256 of the random token is stored.
export const INVITE_DAYS = 30;
const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
export async function createStarInvite(username: string, adminId: number): Promise<string> {
  const token = crypto.randomBytes(24).toString("base64url");
  await pool()!.query("INSERT INTO star_invites (star_slug, token_hash, created_by, expires_at) VALUES ($1,$2,$3, now() + make_interval(days => $4))", [username, sha(token), adminId, INVITE_DAYS]);
  return token;
}
/** the open invite row id when the token belongs to this name, is unused and not expired */
export async function starInviteId(username: string, token: unknown, q: Q = pool()!): Promise<number | null> {
  if (typeof token !== "string" || token.length < 20 || token.length > 100) return null;
  try {
    const r = await q.query("SELECT id FROM star_invites WHERE token_hash = $1 AND star_slug = $2 AND used_at IS NULL AND expires_at > now()", [sha(token), username]);
    return r.rows[0] ? Number(r.rows[0].id) : null;
  } catch { return null; }
}

type Q = { query: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> };
/**
 * Assigns a reserved name inside a transaction: creates a minimal Quran Talents profile when the account has none,
 * moves the username, sets the "star" badge (official reciter), marks the star profile claimed and
 * logs it. Returns an error code or null.
 */
export type StarBadge = "star" | "personality";
export async function assignStar(c: Q, slug: string, userId: number, via: "invite" | "admin" | "claim", adminId: number | null, badge: StarBadge = "star"): Promise<string | null> {
  const sp = (await c.query("SELECT claimed_by, display_name FROM star_profiles WHERE slug = $1 FOR UPDATE", [slug])).rows[0];
  if (!sp) return "not_found";
  if (sp.claimed_by) return Number(sp.claimed_by) === userId ? null : "claimed";
  if ((await c.query("SELECT 1 FROM star_profiles WHERE claimed_by = $1", [userId])).rows[0]) return "already_star";
  const holder = (await c.query("SELECT user_id FROM community_profiles WHERE username = $1", [slug])).rows[0];
  if (holder && Number(holder.user_id) !== userId) return "username_taken";
  const prev = (await c.query("SELECT username FROM community_profiles WHERE user_id = $1", [userId])).rows[0];
  if (!prev) {
    await c.query("INSERT INTO community_profiles (user_id, username, display_name, role) VALUES ($1,$2,$3,$4)", [userId, slug, String(sp.display_name).slice(0, 40), "reciter"]);
  }
  await c.query("UPDATE community_profiles SET username = $2, badge = $3 WHERE user_id = $1", [userId, slug, badge]);
  await c.query("UPDATE star_profiles SET claimed_by = $2, verified_at = now() WHERE slug = $1", [slug, userId]);
  await c.query("UPDATE star_claims SET status = 'rejected', reject_reason = 'assigned', reviewed_at = now() WHERE star_slug = $1 AND status = 'pending' AND user_id <> $2", [slug, userId]);
  await c.query("UPDATE star_claims SET status = 'approved', reviewed_by = $3, reviewed_at = now() WHERE star_slug = $1 AND status = 'pending' AND user_id = $2", [slug, userId, adminId]);
  await c.query("INSERT INTO star_assignments (star_slug, user_id, via, admin_id, previous_username, badge) VALUES ($1,$2,$3,$4,$5,$6)", [slug, userId, via, adminId, prev ? String(prev.username) : null, badge]);
  return null;
}

/** "Persönlichkeit (Gold)" or the reciter badge without a reserved name: admin only, by e-mail, logged and undoable */
export async function grantBadge(c: Q, userId: number, badge: StarBadge, adminId: number): Promise<string | null> {
  if (!(await c.query("SELECT 1 FROM community_profiles WHERE user_id = $1", [userId])).rows[0]) return "profile_needed";
  await c.query("UPDATE community_profiles SET badge = $2 WHERE user_id = $1", [userId, badge]);
  await c.query("INSERT INTO star_assignments (star_slug, user_id, via, admin_id, badge) VALUES (NULL,$1,'admin',$2,$3)", [userId, adminId, badge]);
  return null;
}

/** undoes an assignment: previous username back (or a free fallback), badge removed, star profile unclaimed */
export async function undoStarAssignment(c: Q, id: number, adminId: number): Promise<{ error: string | null; userId: number | null }> {
  const a = (await c.query("SELECT star_slug, user_id, previous_username FROM star_assignments WHERE id = $1 AND undone_at IS NULL FOR UPDATE", [id])).rows[0];
  if (!a) return { error: "not_found", userId: null };
  const userId = a.user_id ? Number(a.user_id) : null;
  if (!a.star_slug) {
    if (userId) await c.query("UPDATE community_profiles SET badge = 'none' WHERE user_id = $1", [userId]);
    await c.query("UPDATE star_assignments SET undone_at = now(), undone_by = $2 WHERE id = $1", [id, adminId]);
    return { error: null, userId };
  }
  const sp = (await c.query("SELECT claimed_by FROM star_profiles WHERE slug = $1 FOR UPDATE", [a.star_slug])).rows[0];
  if (userId && sp && Number(sp.claimed_by) === userId) {
    let name = a.previous_username ? String(a.previous_username) : "";
    if (!name || (await c.query("SELECT 1 FROM community_profiles WHERE username = $1 AND user_id <> $2", [name, userId])).rows[0]) name = `user${userId}`.slice(0, 20);
    await c.query("UPDATE community_profiles SET username = $2, badge = 'none' WHERE user_id = $1", [userId, name]);
    await c.query("UPDATE star_profiles SET claimed_by = NULL, verified_at = NULL WHERE slug = $1", [a.star_slug]);
  }
  await c.query("UPDATE star_assignments SET undone_at = now(), undone_by = $2 WHERE id = $1", [id, adminId]);
  return { error: null, userId };
}

/** runs fn in a transaction on one pooled client */
export async function inTx<T>(fn: (c: Q) => Promise<T>): Promise<T> {
  const c = await pool()!.connect();
  try {
    await c.query("BEGIN");
    const r = await fn(c as unknown as Q);
    await c.query("COMMIT");
    return r;
  } catch (e) {
    await c.query("ROLLBACK").catch(() => undefined);
    throw e;
  } finally { c.release(); }
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
