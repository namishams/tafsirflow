import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import type { User } from "@/lib/auth";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { mediaDir, removeMedia } from "@/lib/media";
import { moderate } from "@/lib/moderation";
import { shape, type Row } from "@/lib/communityProfiles";
import { MIN_POST_AGE, PROFILE_COLS, talentGate } from "@/lib/talents";

// Mishary track on the server: mentoring (a verified master reviews short audio recitations of connected students,
// text + rubric, no video) and talent seasons (monthly / Ramadan challenges judged by masters and admins).
// Tables: mentoring_links, mentoring_submissions, mentoring_reviews, talent_seasons, season_results (db/schema.sql).
// Members 16+ with an own profile only (the same age line as connecting and messaging). Never ids of people in
// responses: usernames for mentors and students, anonymous entry numbers for season juries.

export const RUBRIC = ["makharij", "tajweed", "waqf", "pace", "maqam"] as const;
export type RubricKey = (typeof RUBRIC)[number];
export const KEEP_DAYS = 60;
export const MENTOR_SECONDS = { min: 30, max: 60 };
export const MAX_MENTORS = 5;
export const MAX_OPEN_PER_LINK = 3;

/** reads: 16+, signed in, confirmed; writes also need the own (not suspended) profile and the same origin */
export function mentorGate(req: NextRequest, key: string, max: number, write = false, windowMs = 60_000) {
  return talentGate(req, `mentor-${key}`, max, { minAge: MIN_POST_AGE, write, needProfile: write, windowMs });
}

/** a verified master: level master/sheikh, or the gold or official badge (an admin verification counts as gold) */
export const MASTER_SQL = "(NOT c.suspended AND (c.level IN ('master','sheikh') OR c.official OR c.verified OR c.badge = 'gold'))";
export async function isMaster(userId: number): Promise<boolean> {
  const r = await pool()!.query(`SELECT 1 FROM community_profiles c WHERE c.user_id = $1 AND ${MASTER_SQL}`, [userId]);
  return !!r.rows[0];
}
/** may judge season entries: masters and admins */
export const canJudge = async (me: User) => me.role === "admin" || (await isMaster(me.id));

/** small public card of a member (username, name, badge, level, avatar) */
export function memberCard(r: Row & { followers?: number; following?: number }) {
  const s = shape(r);
  return { username: s.username, name: s.name, level: s.level, badge: s.badge, verified: s.verified, avatar: s.avatar, country: s.country };
}
export async function cardsFor(ids: number[]): Promise<Map<number, ReturnType<typeof memberCard>>> {
  const out = new Map<number, ReturnType<typeof memberCard>>();
  if (!ids.length) return out;
  const r = await pool()!.query(`SELECT ${PROFILE_COLS} FROM community_profiles c WHERE c.user_id = ANY($1::bigint[])`, [[...new Set(ids)]]);
  for (const x of r.rows) out.set(Number(x.user_id), memberCard(x));
  return out;
}

/** "67:1-5" or "1:2": one surah, a verse or a verse range (no checking of the surah length here, the app sends real keys) */
export function verseKeyOf(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  const m = /^(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/.exec(s);
  if (!m) return null;
  const surah = Number(m[1]), a = Number(m[2]), b = m[3] ? Number(m[3]) : a;
  if (surah < 1 || surah > 114 || a < 1 || b < a || b > 286) return null;
  return b === a ? `${surah}:${a}` : `${surah}:${a}-${b}`;
}

/** text from the rubric form or a note: empty is fine, otherwise moderate() decides */
export async function checkText(text: string): Promise<{ ok: true; flagged: string | null } | { ok: false }> {
  if (!text.trim()) return { ok: true, flagged: null };
  const v = await moderate(text.length < 2 ? `${text}  ` : text);
  return v.ok ? { ok: true, flagged: v.flagged } : { ok: false };
}

export function rubricOf(body: Record<string, unknown>): Record<RubricKey, number> | null {
  const out = {} as Record<RubricKey, number>;
  for (const k of RUBRIC) {
    const n = Math.round(Number(body[k]));
    if (!(n >= 1 && n <= 5)) return null;
    out[k] = n;
  }
  return out;
}

export async function mentoringDir(): Promise<string | null> {
  const dir = await mediaDir();
  if (!dir) return null;
  try { await fs.mkdir(path.join(dir, "mentoring"), { recursive: true }); return dir; } catch { return null; }
}

// ——— retention: recordings are deleted 60 days after upload; files of deleted accounts (rows gone by cascade) too ———
let lastPurge = 0;
export async function purgeExpired(force = false) {
  if (!force && Date.now() - lastPurge < 60 * 60_000) return;
  lastPurge = Date.now();
  const p = pool();
  if (!p) return;
  try {
    const r = await p.query("SELECT id, media_path FROM mentoring_submissions WHERE media_path IS NOT NULL AND expires_at < now() LIMIT 500");
    for (const x of r.rows) {
      await removeMedia(x.media_path);
      await p.query("UPDATE mentoring_submissions SET media_path = NULL, deleted_at = now() WHERE id = $1", [x.id]);
    }
    // orphans: files whose row no longer exists (account deleted, upload aborted)
    const dir = await mediaDir();
    if (!dir) return;
    const files = await fs.readdir(path.join(dir, "mentoring")).catch(() => [] as string[]);
    if (!files.length) return;
    const known = await p.query("SELECT media_path FROM mentoring_submissions WHERE media_path IS NOT NULL");
    const keep = new Set(known.rows.map((x) => String(x.media_path)));
    for (const f of files) {
      const rel = `mentoring/${f}`;
      if (keep.has(rel)) continue;
      const st = await fs.stat(path.join(dir, rel)).catch(() => null);
      if (st && Date.now() - st.mtimeMs > 60 * 60_000) await removeMedia(rel); // never touch an upload in progress
    }
  } catch { /* tables not created yet: nothing to purge */ }
}

// ——— seasons ———
/** the monthly challenge rotates through these ranges (the admin can add Ramadan and special seasons) */
export const MONTHLY_VERSES = ["67:1-5", "1:1-7", "55:1-13", "36:1-12", "18:1-10", "97:1-5", "112:1-4", "93:1-11", "19:1-11", "56:1-12", "2:255-257", "59:21-24"];
export const seasonRewardIds = (slug: string) => ({ mythic: `mishary-${slug}-mythic`, legendary: `mishary-${slug}-legendary` });

const monthBounds = (d = new Date()) => {
  const y = d.getUTCFullYear(), m = d.getUTCMonth();
  const start = new Date(Date.UTC(y, m, 1)), end = new Date(Date.UTC(y, m + 1, 0));
  return { slug: `month-${y}-${String(m + 1).padStart(2, "0")}`, start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10), idx: (y * 12 + m) % MONTHLY_VERSES.length };
};
/** makes sure the current month's challenge exists; earlier open months move to judging */
export async function ensureMonthlySeason() {
  const p = pool();
  if (!p) return;
  const b = monthBounds();
  const rw = seasonRewardIds(b.slug);
  try {
    await p.query(
      `INSERT INTO talent_seasons (slug, kind, verses, starts_on, ends_on, reward_mythic, reward_legendary)
       VALUES ($1,'month',$2,$3,$4,$5,$6) ON CONFLICT (slug) DO NOTHING`,
      [b.slug, MONTHLY_VERSES[b.idx], b.start, b.end, rw.mythic, rw.legendary],
    );
    await p.query("UPDATE talent_seasons SET status = 'judging' WHERE status = 'open' AND ends_on < (now() AT TIME ZONE 'UTC')::date");
  } catch { /* tables not created yet */ }
}

export type SeasonRow = { id: string; slug: string; kind: string; title: string; verses: string; starts_on: Date | string; ends_on: Date | string; max_seconds: number; reward_mythic: string; reward_legendary: string; status: string; published_at: Date | null };
const day = (d: Date | string) => (typeof d === "string" ? d.slice(0, 10) : new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10));
export const seasonJson = (s: SeasonRow) => ({
  slug: s.slug, kind: s.kind, title: s.title, verses: s.verses, startsOn: day(s.starts_on), endsOn: day(s.ends_on), maxSeconds: Number(s.max_seconds),
  status: s.status, published: !!s.published_at, rewards: { mythic: s.reward_mythic, legendary: s.reward_legendary },
});
export const seasonOpen = (s: SeasonRow) => {
  const today = new Date().toISOString().slice(0, 10);
  return s.status === "open" && day(s.starts_on) <= today && today <= day(s.ends_on);
};

export const reviewJson = (r: Record<string, unknown>, reviewer: ReturnType<typeof memberCard> | null) => ({
  id: String(r.id), at: r.created_at, text: String(r.body ?? ""),
  rubric: Object.fromEntries(RUBRIC.map((k) => [k, Number(r[k])])) as Record<RubricKey, number>,
  total: RUBRIC.reduce((a, k) => a + Number(r[k]), 0),
  reviewer, // null for season juries (anonymous)
});

export const bad = (error: string, status = 400) => json({ error }, status);
