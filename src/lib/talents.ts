import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { currentUser, type User } from "./auth";
import { pool } from "./db";
import { json, rateLimited, sameOrigin } from "./http";
import { gate, shape, type Row } from "./communityProfiles";

// Quran Talents network: shared helpers on top of the reciters community (src/lib/communityProfiles.ts).
// Ages: under 13 no community (see gate), 13+ view/follow/like, 16+ post/connect/message.

export const LEVELS = ["talent", "rising", "master", "sheikh"] as const;
export type Level = (typeof LEVELS)[number];
export const isLevel = (v: unknown): v is Level => typeof v === "string" && (LEVELS as readonly string[]).includes(v);

export const MIN_VIEW_AGE = 13;
export const MIN_POST_AGE = 16;
export const ageOf = (birthYear: number | null | undefined) => (birthYear ? new Date().getFullYear() - birthYear : null);

export const REPORT_CATEGORIES = ["spam", "harassment", "inappropriate", "impersonation", "minor_safety", "other"];

export const NO_STORE = { "Cache-Control": "private, no-store" };

/** the full select of a profile row plus follower counts (alias c) */
export const PROFILE_COLS = `c.user_id, c.username, c.display_name, c.bio, c.country, c.role, c.style, c.has_ijaza, c.public, c.shares_total,
  c.rewaya, c.maqam, c.ijazah_chain, c.level, c.verified, c.show_progress, c.tree_stage, c.tree_type, c.cert_juz, c.suspended,
  c.avatar_path, c.avatar_version, c.private, c.message_policy, c.badge, c.official, c.official_channel, c.founder, c.pro_until, c.frame, c.showcase,
  (SELECT count(*)::int FROM community_follows f WHERE f.followee_id = c.user_id) AS followers,
  (SELECT count(*)::int FROM community_follows f WHERE f.follower_id = c.user_id) AS following`;

/** card for lists: never the user id, e-mail or birth year */
export const card = (r: Row & { followers?: number; following?: number }) => {
  const s = shape(r);
  return { username: s.username, name: s.name, country: s.country, role: s.role, rewaya: s.rewaya, level: s.level, verified: s.verified, badge: s.badge, sharerTier: s.sharerTier, followers: s.followers, avatar: s.avatar };
};

/** "neither blocked the other" as SQL for a row alias with user_id, `me` is $1 */
export const NOT_BLOCKED = (col: string) =>
  `NOT EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = $1 AND b.blocked_id = ${col}) OR (b.blocker_id = ${col} AND b.blocked_id = $1))`;

/**
 * gate for the talent endpoints: the community gate (sign-in, confirmed e-mail, under 13 out, rate limit) plus
 * a confirmed age of at least `minAge`. Writing endpoints also need an own, not suspended profile when `needProfile`.
 */
export async function talentGate(req: NextRequest, key: string, max: number, opts: { windowMs?: number; write?: boolean; minAge?: number; needProfile?: boolean } = {}) {
  const g = await gate(req, `t-${key}`, max, opts.windowMs ?? 60_000, !!opts.write);
  if (g.res) return { res: g.res };
  const me = g.me;
  const age = ageOf(me.birthYear);
  const minAge = opts.minAge ?? MIN_VIEW_AGE;
  if (age === null) return { res: json({ error: "age_required" }, 403) };
  if (age < minAge) return { res: json({ error: minAge >= MIN_POST_AGE ? "age16" : "age" }, 403) };
  if (opts.needProfile) {
    const r = await pool()!.query("SELECT suspended FROM community_profiles WHERE user_id = $1", [me.id]);
    if (!r.rows[0]) return { res: json({ error: "profile_required" }, 403) };
    if (r.rows[0].suspended) return { res: json({ error: "suspended" }, 403) };
  }
  return { me } as { me: User; res?: undefined };
}

/** a visible member by username for `meId`: public, not suspended, not blocked either way, not oneself */
export async function visibleMember(meId: number, username: string) {
  const r = await pool()!.query(
    `SELECT ${PROFILE_COLS} FROM community_profiles c
      WHERE c.username = $2 AND c.public AND NOT c.suspended AND c.user_id <> $1 AND ${NOT_BLOCKED("c.user_id")}`,
    [meId, String(username).toLowerCase().slice(0, 40)],
  );
  return r.rows[0] as (Row & { user_id: string; followers: number; following: number }) | undefined;
}

export async function birthYearOf(userId: number): Promise<number | null> {
  const r = await pool()!.query("SELECT birth_year FROM users WHERE id = $1", [userId]);
  return r.rows[0]?.birth_year ?? null;
}

/** accepted connection between two members */
export async function connected(a: number, b: number): Promise<boolean> {
  const r = await pool()!.query(
    "SELECT 1 FROM community_connections WHERE status = 'accepted' AND LEAST(requester_id, addressee_id) = LEAST($1::bigint, $2::bigint) AND GREATEST(requester_id, addressee_id) = GREATEST($1::bigint, $2::bigint)",
    [a, b],
  );
  return !!r.rows[0];
}

export async function logAdmin(adminId: number, action: string, target: number | null, detail: Record<string, unknown> = {}, reportId: number | null = null) {
  await pool()!.query("INSERT INTO community_admin_actions (admin_id, action, target_user_id, report_id, detail) VALUES ($1,$2,$3,$4,$5)", [adminId, action, target, reportId, JSON.stringify(detail)]);
}

// master invite codes: 12 characters without look-alikes, grouped XXXX-XXXX-XXXX; only the hash is stored
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newInviteCode(): string {
  const bytes = crypto.randomBytes(12);
  const raw = Array.from(bytes, (b) => ALPHA[b % ALPHA.length]).join("");
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
}
export const normalizeCode = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, "");
export const hashCode = (c: string) => crypto.createHash("sha256").update(`qmc-invite:${normalizeCode(c)}`).digest("hex");

/** one-line text input: trimmed, single spaces, max length */
export const line = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
/** multi-line text input: trimmed, at most two empty lines in a row, max length */
export const para = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim().slice(0, max) : "");

/** admin endpoints of the network: users.role = 'admin' or ADMIN_EMAIL with a confirmed address (see auth.ts) */
export async function adminGate(req: NextRequest, write = false) {
  if (!pool()) return { res: json({ error: "unavailable" }, 503) };
  if (write && !sameOrigin(req)) return { res: json({ error: "forbidden" }, 403) };
  const me = await currentUser();
  if (!me) return { res: json({ error: "login" }, 401) };
  if (me.role !== "admin") return { res: json({ error: "forbidden" }, 403) };
  if (rateLimited(`comm-admin:${me.id}`, 240, 60_000)) return { res: json({ error: "slow_down" }, 429) };
  return { me } as { me: User; res?: undefined };
}

/** a private account's clips, highlights and follower lists: only for the owner and approved followers */
export async function canSeeContent(meId: number, ownerId: number, isPrivate: boolean): Promise<boolean> {
  if (!isPrivate || meId === ownerId) return true;
  const r = await pool()!.query("SELECT 1 FROM community_follows WHERE follower_id = $1 AND followee_id = $2", [meId, ownerId]);
  return !!r.rows[0];
}
/** SQL: author `col` is not private, or $1 follows them, or $1 is the author */
export const CONTENT_VISIBLE = (col: string) =>
  `(${col} = $1 OR NOT COALESCE((SELECT x.private FROM community_profiles x WHERE x.user_id = ${col}), false) OR EXISTS (SELECT 1 FROM community_follows fv WHERE fv.follower_id = $1 AND fv.followee_id = ${col}))`;

/** SQL: the member shows a badge (alias c) */
export const HAS_BADGE = "(c.verified OR c.official OR c.founder OR c.badge <> 'none')";
/** SQL rank for ordering: official, gold, emerald, none */
export const BADGE_RANK = "(CASE WHEN c.founder THEN 4 WHEN c.official OR c.badge IN ('star','personality') THEN 3 WHEN c.verified OR c.badge = 'gold' THEN 2 WHEN c.badge = 'emerald' THEN 1 ELSE 0 END)";
