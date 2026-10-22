import { pool } from "./db";
import { displayBadge, type Badge } from "./talentBadges";
import { MOMENT_SHOWN, SIJILL_COLS, canCompare, privacyOf, sijillOf, type Sijill, type Summary } from "./sijill";
import { COLS, blockedOf, cached, ensureFresh, rowOf, type RankRow } from "./rankings";
import { careerOf, topPercent, type BoardCat, type BoardPeriod, type BoardScope, type Career } from "./career";

// The progress profile ("Statistik" tab, owner 22.10.2026) and the global boards. Additions only: the Sijill sections,
// their privacy, the frozen scores and the existing rankings stay as they are; this file reads them.
//
//  - Statistics of a member = the Sijill sections that member shows (sijillOf), member since (month), country, badge,
//    the career tier (only when the "level" section is shown; computed from the full record so it cannot be gamed by
//    hiding sections), places on the boards (only for members listed by name: opted in, worldwide, public, 16+),
//    and achievement moments as a timeline (only the sections shown).
//  - "You vs. them" only between mutual follows or accepted connections (canCompare, BLUEPRINT §7).
//  - Boards: world, one country, or the people one follows (the existing circle), by period and category, from the
//    ranking snapshot (rebuilt every 10 minutes); rank counts use the partial indexes in db/schema.sql; lists are
//    cached for a minute. Blocked members never appear for the viewer.

/** board category × period → snapshot column (fixed list, safe to inline) */
export const BOARD_COL: Record<BoardCat, Record<BoardPeriod, string>> = {
  xp: { week: "xp_week", month: "xp_month", all: "xp_total" },
  verses: { week: "verses_week", month: "verses_month", all: "verses" },
  streak: { week: "streak", month: "streak", all: "best_streak" },
  exams: { week: "exams_week", month: "exams_month", all: "exams_total" },
};
const LIST = 100;

export type RankPos = { rank: number | null; total: number; pct: number | null; country: number | null; countryTotal: number; score: number };
export type Milestone = { kind: string; ref: string; data: Record<string, unknown>; at: string };
export type Side = { username: string; name: string; avatar: string | null; badge: Badge | null; country: string | null; sijill: Sijill; career: Career | null; ranks: Record<string, RankPos> | null };
export type CareerStats = Side & {
  v: 1;
  level: string;
  mine: boolean;
  memberSince: string | null;
  /** own record only: joined the worldwide lists, or why there is no place yet */
  optedIn?: boolean;
  milestones: Milestone[];
  compare: { allowed: boolean; me?: Side } | null;
};

type Row = Record<string, unknown> & { user_id: string; username: string; display_name: string; country: string | null; avatar_path: string | null; avatar_version: number; member_since: string | null; private: boolean };
const SELECT = `${SIJILL_COLS}, c.username, c.display_name, upper(NULLIF(c.country, '')) AS country, c.avatar_path, c.avatar_version, c.private,
  to_char(LEAST(c.created_at, u.created_at), 'YYYY-MM') AS member_since`;
const avatarOf = (r: Row) => (r.avatar_path ? `/api/community/avatar/${r.username}?v=${Number(r.avatar_version ?? 0)}` : null);

/** the career tier from the full record (shown only with the "level" section) */
async function careerFor(r: Row, s: Sijill, full: boolean): Promise<Career | null> {
  const pv = privacyOf(r.sijill_privacy);
  if (!full && !pv.level) return null;
  const a = (r.achievements ?? {}) as Partial<Summary>;
  if (!a.v) return null;
  let exams = s.exams?.length ?? 0, certs = s.certificates?.length ?? 0;
  if (!full && (!pv.exams || !pv.certificates)) {
    // counted from the server tables, not shown in detail
    const q = await pool()!.query(
      `SELECT (SELECT count(DISTINCT (exam, ref))::int FROM exam_attempts WHERE user_id = $1 AND passed AND status = 'submitted' AND sig IS NOT NULL) AS e,
              (SELECT count(*)::int FROM certificates WHERE user_id = $1 AND status = 'valid') AS c`, [r.user_id]).catch(() => null);
    if (q) { exams = Number(q.rows[0].e); certs = Number(q.rows[0].c); }
  }
  return careerOf({
    xp: a.level?.xp, verses: a.memorised?.verses, exams, certificates: certs, courses: a.courses?.done, qaida: a.courses?.qaida, arabic: a.courses?.arabic,
    reciterPath: a.courses?.rp, hifzGrade: a.hifz?.grade, bestStreak: a.time?.best, minutes: a.time?.totalMin,
  });
}

/** places of a member listed by name: XP of the week and all time, verses, current streak, passed exams */
export async function placesOf(userId: number): Promise<Record<string, RankPos> | null> {
  const p = pool()!;
  await ensureFresh();
  const me = (await p.query("SELECT country, xp_week, xp_total, verses, streak, exams_total FROM ranking_snapshot WHERE user_id = $1 AND named", [userId]).catch(() => ({ rows: [] }))).rows[0];
  if (!me) return null;
  const cols: [string, string][] = [["xp", "xp_total"], ["xp_week", "xp_week"], ["verses", "verses"], ["streak", "streak"], ["exams", "exams_total"]];
  const out: Record<string, RankPos> = {};
  const totals = await cached("board-totals", 60_000, async () => {
    const r = (await p.query(`SELECT ${cols.map(([, c]) => `count(*) FILTER (WHERE ${c} > 0)::int AS ${c}`).join(", ")} FROM ranking_snapshot WHERE named`)).rows[0];
    return r as Record<string, number>;
  });
  for (const [key, col] of cols) {
    const score = Number(me[col] ?? 0);
    if (score <= 0) { out[key] = { rank: null, total: Number(totals[col] ?? 0), pct: null, country: null, countryTotal: 0, score: 0 }; continue; }
    const q = (await p.query(
      `SELECT (SELECT count(*)::int FROM ranking_snapshot WHERE named AND ${col} > $1) AS above,
              (SELECT count(*)::int FROM ranking_snapshot WHERE named AND ${col} > $1 AND country = $2) AS c_above,
              (SELECT count(*)::int FROM ranking_snapshot WHERE named AND ${col} > 0 AND country = $2) AS c_total`,
      [score, me.country ?? ""],
    )).rows[0];
    const total = Number(totals[col] ?? 0);
    out[key] = { rank: q.above + 1, total, pct: topPercent(q.above + 1, total), country: me.country ? q.c_above + 1 : null, countryTotal: me.country ? q.c_total : 0, score };
  }
  return out;
}

async function milestonesOf(userId: string, full: boolean): Promise<Milestone[]> {
  const r = await pool()!.query(
    `SELECT m.kind, m.ref, m.data, m.created_at FROM community_moments m JOIN community_profiles c ON c.user_id = m.user_id
      WHERE m.user_id = $1 AND ($2 OR ${MOMENT_SHOWN}) ORDER BY m.id DESC LIMIT 40`,
    [userId, full],
  ).catch(() => ({ rows: [] as Record<string, unknown>[] }));
  return r.rows.map((x) => ({ kind: String(x.kind), ref: String(x.ref), data: (x.data ?? {}) as Record<string, unknown>, at: new Date(x.created_at as string).toISOString() }));
}

async function sideOf(r: Row, full: boolean, locale: string, withRanks: boolean): Promise<Side> {
  const sijill = await sijillOf(r as never, full, locale);
  return {
    username: r.username, name: r.display_name || r.username, avatar: avatarOf(r), badge: displayBadge(r as never), country: r.country ?? null,
    sijill, career: await careerFor(r, sijill, full), ranks: withRanks ? await placesOf(Number(r.user_id)).catch(() => null) : null,
  };
}

/**
 * the statistics of `username` for a viewer: `viewerId` null = the open web (public, not private, 16+, not suspended);
 * otherwise the sijill route's rules (own, or public, not suspended, not blocked either way; private only for approved
 * followers). null = not found; "restricted" = private account the viewer may not see.
 */
export async function statsFor(username: string, viewerId: number | null, locale: string): Promise<CareerStats | "restricted" | null> {
  const p = pool();
  if (!p || !/^[a-z0-9_.]{3,20}$/.test(username)) return null;
  const where = viewerId === null
    ? `c.username = $2 AND c.public AND NOT c.suspended AND NOT c.private AND u.birth_year IS NOT NULL AND extract(year from now())::int - u.birth_year >= 16`
    : `c.username = $2 AND (c.user_id = $1 OR (c.public AND NOT c.suspended AND NOT EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = $1 AND b.blocked_id = c.user_id) OR (b.blocker_id = c.user_id AND b.blocked_id = $1))))`;
  const r = (await p.query(`SELECT ${SELECT}, c.leaderboard_opt_in, c.rankings_world FROM community_profiles c JOIN users u ON u.id = c.user_id WHERE ${where}`, [viewerId ?? 0, username])).rows[0] as Row | undefined;
  if (!r) return null;
  const own = viewerId !== null && Number(r.user_id) === viewerId;
  if (!own && r.private) {
    if (viewerId === null) return "restricted";
    const f = await p.query("SELECT 1 FROM community_follows WHERE follower_id = $1 AND followee_id = $2", [viewerId, r.user_id]);
    if (!f.rows[0]) return "restricted";
  }
  const side = await sideOf(r, own, locale, true);
  const out: CareerStats = {
    v: 1, ...side, level: String(r.level ?? "talent"), mine: own, memberSince: r.member_since ?? null,
    milestones: await milestonesOf(r.user_id, own), compare: null,
  };
  if (own) out.optedIn = !!(r.leaderboard_opt_in && r.rankings_world);
  if (!own && viewerId !== null) {
    const allowed = await canCompare(viewerId, Number(r.user_id)).catch(() => false);
    out.compare = { allowed };
    if (allowed) {
      const m = (await p.query(`SELECT ${SELECT} FROM community_profiles c JOIN users u ON u.id = c.user_id WHERE c.user_id = $1`, [viewerId])).rows[0] as Row | undefined;
      if (m) out.compare.me = await sideOf(m, true, locale, true);
    }
  }
  return out;
}

// ---------------------------------------------------------------- boards
export type BoardRow = RankRow;
export type Board = {
  scope: BoardScope; cat: BoardCat; period: BoardPeriod; country: string | null;
  rows: BoardRow[]; named: number;
  me: { rank: number | null; total: number; pct: number | null; score: number; listed: boolean } | null;
};

/** top 100 of a board; following = the viewer's circle (people they follow who joined the leaderboards, and themselves) */
export async function board(scope: BoardScope, cat: BoardCat, period: BoardPeriod, country: string | null, meId?: number): Promise<Board> {
  const p = pool()!;
  await ensureFresh();
  const col = BOARD_COL[cat][period];
  let rows: BoardRow[];
  if (scope === "following") {
    const r = await p.query(
      `SELECT * FROM (SELECT ${COLS}, s.${col}::bigint AS score, rank() OVER (ORDER BY s.${col} DESC) AS rk
                        FROM ranking_snapshot s
                       WHERE s.circle AND s.${col} > 0 AND (s.user_id = $1 OR (s.is_public AND EXISTS (SELECT 1 FROM community_follows f WHERE f.follower_id = $1 AND f.followee_id = s.user_id)
                         AND NOT EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = $1 AND b.blocked_id = s.user_id) OR (b.blocker_id = s.user_id AND b.blocked_id = $1))))) x
        ORDER BY rk, streak DESC, username LIMIT ${LIST}`,
      [meId],
    );
    rows = r.rows.map((x) => { const { userId, ...o } = rowOf(x, meId); return { ...o, me: userId === meId }; });
  } else {
    const c = scope === "country" ? country : null;
    const top = await cached(`board:${col}:${c ?? ""}`, 60_000, async () => {
      const r = await p.query(
        `SELECT * FROM (SELECT ${COLS}, s.${col}::bigint AS score, rank() OVER (ORDER BY s.${col} DESC) AS rk
                          FROM ranking_snapshot s WHERE s.named AND s.${col} > 0 ${c ? "AND s.country = $1" : ""}) x
          ORDER BY rk, streak DESC, username LIMIT ${LIST}`,
        c ? [c] : [],
      );
      return r.rows.map((x) => rowOf(x));
    });
    const blocked = meId ? await blockedOf(meId) : new Set<number>();
    rows = top.filter((x) => !blocked.has(x.userId)).map(({ userId, ...x }) => ({ ...x, me: meId !== undefined && userId === meId }));
  }
  const named = await cached(`board-n:${col}:${scope === "country" ? country ?? "" : ""}`, 60_000, async () =>
    Number((await p.query(`SELECT count(*)::int AS n FROM ranking_snapshot WHERE named AND ${col} > 0 ${scope === "country" && country ? "AND country = $1" : ""}`, scope === "country" && country ? [country] : [])).rows[0].n));
  let me: Board["me"] = null;
  if (meId) {
    if (scope === "following") {
      const own = rows.find((x) => x.me);
      me = { rank: own?.rank ?? null, total: rows.length, pct: null, score: own?.score ?? 0, listed: !!own };
    } else {
      const s = (await p.query(`SELECT ${col}::bigint AS score, country FROM ranking_snapshot WHERE user_id = $1 AND named`, [meId])).rows[0];
      if (s && (scope === "world" || s.country === country)) {
        const score = Number(s.score);
        const total = named;
        const above = score > 0 ? Number((await p.query(`SELECT count(*)::int AS n FROM ranking_snapshot WHERE named AND ${col} > $1 ${scope === "country" ? "AND country = $2" : ""}`, scope === "country" ? [score, country] : [score])).rows[0].n) : 0;
        me = { rank: score > 0 ? above + 1 : null, total, pct: score > 0 ? topPercent(above + 1, total) : null, score, listed: true };
      } else me = { rank: null, total: named, pct: null, score: 0, listed: !!s };
    }
  }
  return { scope, cat, period, country: scope === "country" ? country : null, rows, named, me };
}

/** the best learners right now (world, all time): top three per category, for the hall of fame strip on the profile */
export async function topLearners(): Promise<Record<BoardCat, BoardRow[]>> {
  await ensureFresh();
  return cached("top-learners", 120_000, async () => {
    const out = {} as Record<BoardCat, BoardRow[]>;
    for (const cat of ["xp", "verses", "streak", "exams"] as BoardCat[]) out[cat] = (await board("world", cat, "all", null)).rows.slice(0, 3);
    return out;
  });
}
