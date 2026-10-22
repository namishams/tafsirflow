import type { PoolClient } from "pg";
import { pool } from "./db";
import { mondayDay } from "./communityProfiles";
import { displayBadge, type Badge } from "./talentBadges";
import { fromHijri, toHijri, DAY } from "./hijri";

// Worldwide rankings (owner request 21.10.2026): opt-in and privacy-safe. Additions only; nothing of the frozen scores,
// Sijill sections or leaderboards among follows is changed.
//
//  - Names (username, display name, avatar, country, badge) appear only for members who switched leaderboards on
//    (leaderboard_opt_in), accepted the worldwide listing (rankings_world), have a public, non-private profile and are 16+.
//  - Everyone else counts into the country totals only anonymously, and only with count_country (default on when a member
//    opts in). A country is listed only with at least MIN_COUNTRY_MEMBERS counted members.
//  - ranking_snapshot is rebuilt at most every REFRESH_MS (lazily by the first request after that; no cron needed), so the
//    lists never touch the live tables. Weeks, months, Ramadan and years are closed into ranking_seasons / ranking_results
//    (top 100 per metric, top 50 countries) and stay as the hall of fame; account deletion removes a member's rows and a
//    member who opts out disappears from the history too (it is joined with the live opt-in).
//  - Scores are the values the app reports (already clamped in src/lib/sijill.ts), so a ranking is a friendly comparison,
//    not an exam result.

export const METRICS = ["xp_week", "xp_total", "streak", "verses", "stickers", "mashaallah"] as const;
export type Metric = (typeof METRICS)[number];
export const isMetric = (v: unknown): v is Metric => typeof v === "string" && (METRICS as readonly string[]).includes(v);
export const COUNTRY_METRICS = ["xp", "stickers", "verses"] as const;
export type CountryMetric = (typeof COUNTRY_METRICS)[number];
export const SEASON_KINDS = ["week", "month", "ramadan", "year"] as const;
export type SeasonKind = (typeof SEASON_KINDS)[number];
/** metrics stored per season (xp_season = XP gained in that period) */
export const SEASON_METRICS = ["xp_season", "xp_total", "streak", "verses", "stickers", "mashaallah"] as const;
export type SeasonMetric = (typeof SEASON_METRICS)[number];

export const MIN_COUNTRY_MEMBERS = 5;
export const MIN_NAMED_AGE = 16;
export const LIST_SIZE = 100;
const REFRESH_MS = 10 * 60_000;
const LOCK_ID = 7_210_026;

const COL: Record<Metric, string> = { xp_week: "xp_week", xp_total: "xp_total", streak: "streak", verses: "verses", stickers: "stickers", mashaallah: "mashaallah" };
/** passed exams count on the boards only for members who show exams in their Sijill (alias c); same exam kinds as sijill.ts */
const EXAMS_SHOWN = "COALESCE((c.sijill_privacy ->> 'exams')::boolean, true)";
const EXAM_LIST = ["qbank", "rp-level", "juz", "ar-unit", "surah"].map((x) => `'${x}'`).join(",");
const AGE = (n: number) => `(u.birth_year IS NOT NULL AND extract(year from now())::int - u.birth_year >= ${n})`;
/** SQL: the profile (alias c, user alias u) may be shown by name in worldwide lists right now */
export const NAMED_LIVE = `(c.leaderboard_opt_in AND c.rankings_world AND c.public AND NOT c.private AND NOT c.suspended AND ${AGE(MIN_NAMED_AGE)})`;

const DAY_MS = 86_400_000;
export const nextReset = () => (mondayDay() + 7) * DAY_MS;
const mondayOf = (d: number) => d - ((d + 3) % 7);
const dateOf = (d: number) => new Date(d * DAY_MS).toISOString().slice(0, 10);

// ---------------------------------------------------------------- refresh (snapshot, week close, seasons)
type St = { checked: number; running: Promise<void> | null; first: boolean };
const g = globalThis as unknown as { __rk?: St };
const st = (): St => (g.__rk ??= { checked: 0, running: null, first: false });

/** rebuilds the snapshot when it is older than 10 minutes; waits only when there is no snapshot at all yet */
export async function ensureFresh(): Promise<void> {
  const p = pool();
  if (!p) return;
  const s = st();
  const now = Date.now();
  if (s.running) return s.first ? s.running : undefined;
  if (now - s.checked < 30_000) return;
  s.checked = now;
  const r = await p.query("SELECT updated_at FROM ranking_meta WHERE key = 'refreshed'").catch(() => null);
  if (!r) return; // tables not created yet
  const at = r.rows[0]?.updated_at ? new Date(r.rows[0].updated_at).getTime() : 0;
  if (now - at < REFRESH_MS) return;
  s.first = !at;
  s.running = rebuild().catch((e) => console.error("rankings refresh", e)).finally(() => { s.running = null; });
  if (!at) await s.running;
}

async function rebuild(): Promise<void> {
  const c = await pool()!.connect();
  try {
    if (!(await c.query("SELECT pg_try_advisory_lock($1) AS ok", [LOCK_ID])).rows[0].ok) return;
    try {
      const cur = mondayDay();
      const prev = Number((await c.query("SELECT value FROM ranking_meta WHERE key = 'snapshot_monday'")).rows[0]?.value ?? 0);
      if (prev && prev < cur) {
        // a new week began: the snapshot still holds the last values of the week that just ended
        await c.query("BEGIN");
        try {
          await closeWeek(c, prev);
          await c.query("COMMIT");
        } catch (e) { await c.query("ROLLBACK"); throw e; }
        await c.query("BEGIN");
        try { await closePeriods(c, cur); await c.query("COMMIT"); } catch (e) { await c.query("ROLLBACK"); console.error("rankings seasons", e); }
      }
      await c.query("BEGIN");
      try { await build(c, cur); await c.query("COMMIT"); } catch (e) { await c.query("ROLLBACK"); throw e; }
    } finally {
      await c.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]);
    }
  } finally {
    c.release();
  }
}

async function build(c: PoolClient, cur: number) {
  const named = `(c.leaderboard_opt_in AND c.rankings_world AND c.public AND NOT c.private AND ${AGE(MIN_NAMED_AGE)})`;
  const counted = `(c.count_country AND c.country IS NOT NULL AND c.country <> '' AND ${AGE(13)})`;
  const circle = `(c.leaderboard_opt_in AND ${AGE(13)})`;
  const cur0 = Math.floor(cur); // a number from mondayDay(), safe to inline (CREATE TABLE AS takes no parameters)
  const now0 = new Date();
  const monthFirst = Math.floor(Date.UTC(now0.getUTCFullYear(), now0.getUTCMonth(), 1) / DAY_MS); // integer day, safe to inline
  const monthKey = now0.getUTCFullYear() * 100 + now0.getUTCMonth() + 1;
  // month XP counts whole weeks by their Thursday, the same rule closePeriods uses for the month seasons: closed weeks
  // whose Thursday falls in this month plus the running week when its Thursday does (no boundary week is dropped or
  // counted twice; the running week of a month's last days belongs to the next month, as in the season)
  const mx = monthFirst - 3;
  const firstWeek = mx + ((7 - ((mx + 3) % 7)) % 7);
  const nextMonthFirst = Math.floor(Date.UTC(now0.getUTCFullYear(), now0.getUTCMonth() + 1, 1) / DAY_MS);
  const runningInMonth = cur0 >= firstWeek && cur0 + 3 < nextMonthFirst;
  await c.query(
    `CREATE TEMP TABLE rk_src ON COMMIT DROP AS
     SELECT c.user_id, c.username, c.display_name, c.avatar_path, c.avatar_version, upper(NULLIF(c.country, '')) AS country,
            CASE WHEN c.founder THEN 'founder' WHEN c.badge IN ('star','personality') THEN c.badge WHEN c.official THEN 'official' WHEN c.badge = 'gold' OR c.verified THEN 'gold' WHEN c.badge = 'emerald' THEN 'emerald' END AS badge,
            c.level, ${named} AS named, ${circle} AS circle, c.public AS is_public, ${counted} AS counted,
            (CASE WHEN c.week_monday >= ${cur0} - 1 THEN c.week_xp ELSE 0 END)::int AS xp_week,
            COALESCE(NULLIF(c.achievements #>> '{level,xp}', '')::bigint, 0) AS xp_total,
            (CASE WHEN c.achievements_updated_at >= now() - interval '2 days' THEN c.streak_days ELSE 0 END)::int AS streak,
            c.memorised_verses AS verses,
            COALESCE(NULLIF(c.achievements #>> '{stickers,total}', '')::int, 0) AS stickers,
            COALESCE(m.n, 0)::int AS mashaallah,
            -- progress profile boards (22.10.2026): month XP (weeks counted by their Thursday, see firstWeek above),
            -- best streak, and distinct passed exams per period (only when the member shows exams in the Sijill)
            (COALESCE(wm.xp, 0) + (CASE WHEN ${runningInMonth ? "true" : "false"} AND c.week_monday >= ${cur0} - 1 THEN c.week_xp ELSE 0 END))::bigint AS xp_month,
            GREATEST(COALESCE(NULLIF(c.achievements #>> '{time,best}', '')::int, 0), (CASE WHEN c.achievements_updated_at >= now() - interval '2 days' THEN c.streak_days ELSE 0 END))::int AS best_streak,
            (CASE WHEN ${EXAMS_SHOWN} THEN COALESCE(ex.wk, 0) ELSE 0 END)::int AS exams_week,
            (CASE WHEN ${EXAMS_SHOWN} THEN COALESCE(ex.mo, 0) ELSE 0 END)::int AS exams_month,
            (CASE WHEN ${EXAMS_SHOWN} THEN COALESCE(ex.n, 0) ELSE 0 END)::int AS exams_total,
            (c.week_monday >= ${cur0} - 1 AND (c.week_active > 0 OR c.week_xp > 0)) AS active7,
            COALESCE(c.achievements_updated_at >= now() - interval '30 days', false) AS active30
       FROM community_profiles c JOIN users u ON u.id = c.user_id
       LEFT JOIN (SELECT cr.receiver_id AS user_id, count(*) AS n FROM community_reaction_credits cr
                    JOIN community_moment_reactions r ON r.moment_id = cr.moment_id AND r.user_id = cr.giver_id AND r.reaction = 'mashallah'
                   GROUP BY cr.receiver_id) m ON m.user_id = c.user_id
       LEFT JOIN (SELECT user_id, sum(xp)::bigint AS xp FROM ranking_week_xp WHERE week_monday >= ${firstWeek} AND week_monday < ${cur0} GROUP BY user_id) wm ON wm.user_id = c.user_id
       LEFT JOIN (SELECT user_id, count(*)::int AS n, (count(*) FILTER (WHERE first_at >= date '1970-01-01' + ${cur0}))::int AS wk,
                         (count(*) FILTER (WHERE first_at >= date '1970-01-01' + ${monthFirst}))::int AS mo
                    FROM (SELECT user_id, exam, ref, min(submitted_at) AS first_at FROM exam_attempts
                           WHERE passed AND status = 'submitted' AND sig IS NOT NULL AND exam IN (${EXAM_LIST}) GROUP BY user_id, exam, ref) e
                   GROUP BY user_id) ex ON ex.user_id = c.user_id
      WHERE NOT c.suspended AND (${named} OR ${counted} OR ${circle})`,
  );
  // the sticker/verse counts the first time a member is seen this week: the base for the weekly gains
  await c.query("INSERT INTO ranking_week_base (week_monday, user_id, stickers, verses) SELECT $1::int, user_id, stickers, verses FROM rk_src ON CONFLICT DO NOTHING", [cur]);
  await c.query("INSERT INTO ranking_month_base (month_key, user_id, verses) SELECT $1::int, user_id, verses FROM rk_src ON CONFLICT DO NOTHING", [monthKey]);
  await c.query("DELETE FROM ranking_snapshot");
  await c.query(
    `INSERT INTO ranking_snapshot (user_id, username, display_name, avatar_path, avatar_version, country, badge, level, named, circle, is_public, counted,
                                   xp_week, xp_total, streak, verses, verses_week, stickers, stickers_week, mashaallah, active7, active30,
                                   xp_month, verses_month, best_streak, exams_week, exams_month, exams_total)
     SELECT s.user_id, s.username, s.display_name, s.avatar_path, s.avatar_version, s.country, s.badge, s.level, s.named, s.circle, s.is_public, s.counted,
            s.xp_week, s.xp_total, s.streak, s.verses, GREATEST(0, s.verses - b.verses), s.stickers, GREATEST(0, s.stickers - b.stickers), s.mashaallah, s.active7, s.active30,
            s.xp_month, GREATEST(0, s.verses - COALESCE(mb.verses, s.verses)), s.best_streak, s.exams_week, s.exams_month, s.exams_total
       FROM rk_src s JOIN ranking_week_base b ON b.week_monday = $1 AND b.user_id = s.user_id
       LEFT JOIN ranking_month_base mb ON mb.month_key = $2 AND mb.user_id = s.user_id`,
    [cur, monthKey],
  );
  await c.query("DELETE FROM ranking_countries");
  await c.query(
    `INSERT INTO ranking_countries (period, country, members, active, xp, stickers, verses)
     SELECT 'week', country, count(*), count(*) FILTER (WHERE active7), sum(xp_week), sum(stickers_week), sum(verses_week)
       FROM ranking_snapshot WHERE counted AND country IS NOT NULL GROUP BY country HAVING count(*) >= $1
     UNION ALL
     SELECT 'all', country, count(*), count(*) FILTER (WHERE active30), sum(xp_total), sum(stickers), sum(verses)
       FROM ranking_snapshot WHERE counted AND country IS NOT NULL GROUP BY country HAVING count(*) >= $1`,
    [MIN_COUNTRY_MEMBERS],
  );
  await c.query("DELETE FROM ranking_week_base WHERE week_monday < $1", [cur - 14]);
  await c.query("DELETE FROM ranking_month_base WHERE month_key < $1", [monthKey - 100]);
  await c.query("DELETE FROM ranking_week_xp WHERE week_monday < $1", [cur - 800]);
  await c.query("INSERT INTO ranking_meta (key, value) VALUES ('snapshot_monday', $1) ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()", [String(cur)]);
  await c.query("INSERT INTO ranking_meta (key, value) VALUES ('refreshed', 'ok') ON CONFLICT (key) DO UPDATE SET value = 'ok', updated_at = now()");
}

/** keeps the XP of the week that just ended and stores its season (from the last snapshot of that week) */
async function closeWeek(c: PoolClient, monday: number) {
  await c.query("INSERT INTO ranking_week_xp (week_monday, user_id, xp) SELECT $1::int, user_id, xp_week FROM ranking_snapshot WHERE xp_week > 0 ON CONFLICT DO NOTHING", [monday]);
  await writeSeason(c, "week", dateOf(monday), monday, monday + 6, "SELECT user_id, xp FROM ranking_week_xp WHERE week_monday = $2", [monday]);
}

async function writeSeason(c: PoolClient, kind: SeasonKind, key: string, startDay: number, endDay: number, xpSql: string, xpParams: number[]) {
  // $1 = season id, $2.. = xpParams
  const parts = (await c.query(`SELECT count(*)::int AS n FROM (${xpSql.replace(/\$2/g, "$1").replace(/\$3/g, "$2")}) x JOIN ranking_snapshot s ON s.user_id = x.user_id WHERE x.xp > 0 AND (s.named OR s.counted)`, xpParams)).rows[0].n as number;
  const ins = await c.query(
    "INSERT INTO ranking_seasons (kind, key, starts_on, ends_on, participants) VALUES ($1, $2, date '1970-01-01' + $3::int, date '1970-01-01' + $4::int, $5) ON CONFLICT (kind, key) DO NOTHING RETURNING id",
    [kind, key, startDay, endDay, parts],
  );
  const id = ins.rows[0]?.id as string | undefined;
  if (!id || !parts) return;
  const sid = Number(id);
  const lim = LIST_SIZE;
  // members by name
  for (const m of SEASON_METRICS) {
    const q = m === "xp_season"
      ? `SELECT s.user_id, s.country, x.xp::bigint AS score, s.streak, s.username FROM ranking_snapshot s JOIN (${xpSql}) x ON x.user_id = s.user_id WHERE s.named AND x.xp > 0`
      : `SELECT s.user_id, s.country, s.${COL[m as Metric]}::bigint AS score, s.streak, s.username FROM ranking_snapshot s WHERE s.named AND s.${COL[m as Metric]} > 0`;
    await c.query(
      `INSERT INTO ranking_results (season_id, metric, pos, rank, user_id, score, country)
       SELECT $1::bigint, '${m}', pos, rk, user_id, score, country FROM (
         SELECT user_id, country, score, rank() OVER (ORDER BY score DESC) AS rk, row_number() OVER (ORDER BY score DESC, streak DESC, username) AS pos FROM (${q}) z
       ) y WHERE pos <= ${lim}`,
      m === "xp_season" ? [sid, ...xpParams] : [sid],
    );
  }
  // countries: collected XP of the period, sticker and verse totals at the close of the season
  for (const cm of COUNTRY_METRICS) {
    const val = cm === "xp" ? "COALESCE(x.xp, 0)" : cm === "stickers" ? "s.stickers" : "s.verses";
    const join = cm === "xp" ? `LEFT JOIN (${xpSql}) x ON x.user_id = s.user_id` : "";
    const params = cm === "xp" ? [sid, ...xpParams] : [sid];
    for (const mode of ["total", "per_capita"] as const) {
      const score = mode === "total" ? "total" : "round(total::numeric / active, 2)";
      await c.query(
        `INSERT INTO ranking_country_results (season_id, metric, mode, pos, rank, country, members, active, score)
         SELECT $1::bigint, '${cm}', '${mode}', pos, rk, country, members, active, sc FROM (
           SELECT country, members, active, sc, rank() OVER (ORDER BY sc DESC) AS rk, row_number() OVER (ORDER BY sc DESC, country) AS pos FROM (
             SELECT country, members, active, ${score} AS sc, total FROM (
               SELECT s.country, count(*)::int AS members, (count(*) FILTER (WHERE s.active30))::int AS active, sum(${val})::numeric AS total
                 FROM ranking_snapshot s ${join} WHERE s.counted AND s.country IS NOT NULL GROUP BY s.country HAVING count(*) >= ${MIN_COUNTRY_MEMBERS}
             ) a WHERE total > 0 ${mode === "per_capita" ? "AND active > 0" : ""}
           ) b
         ) y WHERE pos <= 50`,
        params,
      );
    }
  }
}

/** months, Ramadan and years close when the last week that belongs to them (counted by its Thursday) has closed */
async function closePeriods(c: PoolClient, cur: number) {
  const today = Math.floor(Date.now() / DAY_MS);
  type P = { kind: SeasonKind; key: string; start: number; end: number };
  const list: P[] = [];
  const now = new Date();
  const y = now.getUTCFullYear(), mo = now.getUTCMonth();
  const mStart = Date.UTC(y, mo - 1, 1) / DAY_MS, mEnd = Date.UTC(y, mo, 1) / DAY_MS - 1;
  const pm = new Date(mStart * DAY_MS);
  list.push({ kind: "month", key: `${pm.getUTCFullYear()}-${String(pm.getUTCMonth() + 1).padStart(2, "0")}`, start: mStart, end: mEnd });
  list.push({ kind: "year", key: String(y - 1), start: Date.UTC(y - 1, 0, 1) / DAY_MS, end: Date.UTC(y, 0, 1) / DAY_MS - 1 });
  const hy = toHijri(Date.UTC(y, mo, now.getUTCDate())).y;
  for (const h of [hy, hy - 1]) {
    const a = fromHijri(h, 9, 1), b = fromHijri(h, 10, 1);
    if (a !== null && b !== null) list.push({ kind: "ramadan", key: String(h), start: Math.round(a / DAY), end: Math.round(b / DAY) - 1 });
  }
  for (const pd of list) {
    if (pd.end >= today) continue;
    const lastWeek = mondayOf(pd.end - 3);
    if (cur - 7 < lastWeek) continue; // its last week is not closed yet
    const x = pd.start - 3;
    const firstWeek = x + ((7 - ((x + 3) % 7)) % 7);
    await writeSeason(c, pd.kind, pd.key, pd.start, pd.end,
      "SELECT user_id, sum(xp)::bigint AS xp FROM ranking_week_xp WHERE week_monday BETWEEN $2 AND $3 GROUP BY user_id", [firstWeek, lastWeek]);
  }
}

// ---------------------------------------------------------------- reading (lists, standings, countries)
export type RankRow = { rank: number; username: string; name: string; country: string | null; badge: Badge | null; level: string; avatar: string | null; score: number; streak: number; me: boolean };
export type Internal = RankRow & { userId: number };
const cache = new Map<string, { at: number; v: unknown }>();
export async function cached<T>(key: string, ttl: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.v as T;
  const v = await load();
  if (cache.size > 300) cache.clear();
  cache.set(key, { at: Date.now(), v });
  return v;
}

export const rowOf = (x: Record<string, unknown>, meId?: number): Internal => ({
  userId: Number(x.user_id), rank: Number(x.rk), username: String(x.username), name: String(x.display_name || x.username), country: (x.country as string) ?? null,
  badge: displayBadge({ badge: x.badge as string | null, official: x.badge === "official", verified: x.badge === "gold", founder: x.badge === "founder" }), level: String(x.level ?? "talent"),
  avatar: x.avatar_path ? `/api/community/avatar/${x.username}?v=${Number(x.avatar_version ?? 0)}` : null, score: Number(x.score), streak: Number(x.streak), me: meId !== undefined && Number(x.user_id) === meId,
});
export const COLS = "s.user_id, s.username, s.display_name, s.avatar_path, s.avatar_version, s.country, s.badge, s.level, s.streak";

/** top 100 by name (worldwide, or inside one country) */
async function topList(metric: Metric, country: string | null): Promise<Internal[]> {
  return cached(`top:${metric}:${country ?? ""}`, 60_000, async () => {
    const col = COL[metric];
    const r = await pool()!.query(
      `SELECT * FROM (SELECT ${COLS}, s.${col}::bigint AS score, rank() OVER (ORDER BY s.${col} DESC) AS rk
                        FROM ranking_snapshot s WHERE s.named AND s.${col} > 0 ${country ? "AND s.country = $1" : ""}) x
        ORDER BY rk, streak DESC, username LIMIT ${LIST_SIZE}`,
      country ? [country] : [],
    );
    return r.rows.map((x) => rowOf(x));
  });
}

export const blockedOf = async (meId: number) => new Set((await pool()!.query("SELECT blocked_id AS o FROM community_blocks WHERE blocker_id = $1 UNION SELECT blocker_id FROM community_blocks WHERE blocked_id = $1", [meId])).rows.map((x) => Number(x.o)));

export async function listFor(scope: "world" | "country", metric: Metric, country: string | null, meId?: number): Promise<RankRow[]> {
  const rows = await topList(metric, scope === "country" ? country : null);
  const blocked = meId ? await blockedOf(meId) : new Set<number>();
  return rows.filter((r) => !blocked.has(r.userId)).map(({ userId, ...r }) => ({ ...r, me: meId !== undefined && userId === meId }));
}

/** the member's circle (people they follow who opted in, plus themselves), ranked inside it */
export async function friendsList(meId: number, metric: Metric): Promise<RankRow[]> {
  const col = COL[metric];
  const r = await pool()!.query(
    `SELECT * FROM (SELECT ${COLS}, s.${col}::bigint AS score, rank() OVER (ORDER BY s.${col} DESC) AS rk
                      FROM ranking_snapshot s
                     WHERE s.circle AND (s.user_id = $1 OR (s.is_public AND EXISTS (SELECT 1 FROM community_follows f WHERE f.follower_id = $1 AND f.followee_id = s.user_id)
                       AND NOT EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = $1 AND b.blocked_id = s.user_id) OR (b.blocker_id = s.user_id AND b.blocked_id = $1))))) x
      ORDER BY rk, streak DESC, username LIMIT ${LIST_SIZE}`,
    [meId],
  );
  return r.rows.map((x) => { const { userId, ...o } = rowOf(x, meId); return { ...o, me: userId === meId }; });
}

export type Standing = { optedIn: boolean; world: boolean; counted: boolean; country: string | null; score: number; rank: number | null; countryRank: number | null; participants: number; pending: boolean };
/** where a signed-in member stands (needs the worldwide listing to have a rank) */
export async function standing(meId: number, metric: Metric): Promise<Standing> {
  const p = pool()!;
  const prof = (await p.query("SELECT leaderboard_opt_in, rankings_world, count_country, upper(NULLIF(country, '')) AS country FROM community_profiles WHERE user_id = $1", [meId])).rows[0];
  const base: Standing = { optedIn: !!prof?.leaderboard_opt_in, world: !!(prof?.leaderboard_opt_in && prof?.rankings_world), counted: !!prof?.count_country, country: prof?.country ?? null, score: 0, rank: null, countryRank: null, participants: 0, pending: false };
  if (!base.world) return base;
  const col = COL[metric];
  const me = (await p.query(`SELECT s.${col}::bigint AS score, s.country FROM ranking_snapshot s WHERE s.user_id = $1 AND s.named`, [meId])).rows[0];
  if (!me) return { ...base, pending: true }; // opted in a moment ago: appears with the next refresh, or not eligible (16+, public profile)
  const score = Number(me.score);
  const q = await p.query(
    `SELECT (SELECT count(*)::int FROM ranking_snapshot WHERE named AND ${col} > $1) AS above,
            (SELECT count(*)::int FROM ranking_snapshot WHERE named AND ${col} > 0) AS total,
            (SELECT count(*)::int FROM ranking_snapshot WHERE named AND ${col} > $1 AND country IS NOT DISTINCT FROM $2 AND $2::text IS NOT NULL) AS c_above`,
    [score, me.country ?? null],
  );
  const row = q.rows[0];
  return { ...base, score, rank: score > 0 ? row.above + 1 : null, countryRank: score > 0 && me.country ? row.c_above + 1 : null, participants: row.total };
}

export async function participants(): Promise<{ named: number; counted: number; countriesN: number }> {
  return cached("participants", 60_000, async () => {
    const r = (await pool()!.query("SELECT count(*) FILTER (WHERE named)::int AS named, count(*) FILTER (WHERE counted)::int AS counted, (SELECT count(DISTINCT country)::int FROM ranking_countries) AS countries_n FROM ranking_snapshot")).rows[0];
    return { named: r.named, counted: r.counted, countriesN: r.countries_n };
  });
}

export type CountryRow = { rank: number; country: string; members: number; active: number; total: number; perCapita: number; me: boolean };
export type CountryPeriod = "week" | "all";
export type CountryMode = "total" | "per_capita";
export async function countryList(period: CountryPeriod, metric: CountryMetric, mode: CountryMode, myCountry: string | null): Promise<{ rows: CountryRow[]; mine: CountryRow | null }> {
  const all = await cached(`countries:${period}:${metric}:${mode}`, 60_000, async () => {
    const r = await pool()!.query(
      `SELECT country, members, active, ${metric}::bigint AS total, (CASE WHEN active > 0 THEN round(${metric}::numeric / active, 2) ELSE 0 END) AS per
         FROM ranking_countries WHERE period = $1 AND ${metric} > 0 ${mode === "per_capita" ? "AND active > 0" : ""}`,
      [period],
    );
    const key = mode === "total" ? "total" : "per";
    const sorted = r.rows.map((x) => ({ country: String(x.country), members: Number(x.members), active: Number(x.active), total: Number(x.total), perCapita: Number(x.per) }))
      .sort((a, b) => (mode === "total" ? b.total - a.total : b.perCapita - a.perCapita) || a.country.localeCompare(b.country));
    void key;
    let rank = 0, last = -1;
    return sorted.map((x, i) => { const v = mode === "total" ? x.total : x.perCapita; if (v !== last) { rank = i + 1; last = v; } return { rank, ...x, me: false }; });
  });
  const rows = all.slice(0, LIST_SIZE).map((x) => ({ ...x, me: x.country === myCountry }));
  const mine = myCountry ? all.find((x) => x.country === myCountry) ?? null : null;
  return { rows, mine: mine ? { ...mine, me: true } : null };
}

/** world and country rank by total XP of a public member, for profile pages ("#123 worldwide, #4 in Germany") */
export async function rankOf(username: string): Promise<{ world: number | null; country: number | null; countryCode: string | null } | null> {
  const p = pool();
  if (!p || !/^[a-z0-9_.]{3,20}$/.test(username)) return null;
  await ensureFresh();
  return cached(`of:${username}`, 60_000, async () => {
    const me = (await p.query("SELECT xp_total::bigint AS score, country FROM ranking_snapshot WHERE username = $1 AND named", [username]).catch(() => ({ rows: [] }))).rows[0];
    if (!me || Number(me.score) <= 0) return null;
    const q = (await p.query(
      `SELECT (SELECT count(*)::int FROM ranking_snapshot WHERE named AND xp_total > $1) AS above,
              (SELECT count(*)::int FROM ranking_snapshot WHERE named AND xp_total > $1 AND country = $2) AS c_above`, [me.score, me.country ?? ""])).rows[0];
    return { world: q.above + 1, country: me.country ? q.c_above + 1 : null, countryCode: me.country ?? null };
  });
}

// ---------------------------------------------------------------- settings of the member
export type RankSettings = { hasProfile: boolean; ageKnown: boolean; age16: boolean; optIn: boolean; world: boolean; countCountry: boolean; country: string | null };
export async function settingsOf(userId: number, birthYear: number | null): Promise<RankSettings> {
  const r = (await pool()!.query("SELECT leaderboard_opt_in, rankings_world, count_country, upper(NULLIF(country, '')) AS country FROM community_profiles WHERE user_id = $1", [userId])).rows[0];
  const age = birthYear ? new Date().getFullYear() - birthYear : null;
  return { hasProfile: !!r, ageKnown: age !== null, age16: age !== null && age >= MIN_NAMED_AGE, optIn: !!r?.leaderboard_opt_in, world: !!(r?.leaderboard_opt_in && r?.rankings_world), countCountry: !!r?.count_country, country: r?.country ?? null };
}

// ---------------------------------------------------------------- history (seasons, hall of fame)
export type SeasonInfo = { kind: SeasonKind; key: string; from: string; to: string; participants: number };
const seasonRow = (x: Record<string, unknown>): SeasonInfo => ({ kind: x.kind as SeasonKind, key: String(x.key), from: String(x.starts_on).slice(0, 10), to: String(x.ends_on).slice(0, 10), participants: Number(x.participants) });

export async function seasons(kind: SeasonKind, limit = 60): Promise<SeasonInfo[]> {
  return cached(`seasons:${kind}:${limit}`, 120_000, async () => {
    const r = await pool()!.query("SELECT kind, key, to_char(starts_on, 'YYYY-MM-DD') AS starts_on, to_char(ends_on, 'YYYY-MM-DD') AS ends_on, participants FROM ranking_seasons WHERE kind = $1 AND participants > 0 ORDER BY ends_on DESC LIMIT $2", [kind, limit]);
    return r.rows.map(seasonRow);
  });
}

export async function seasonRows(kind: SeasonKind, key: string, metric: SeasonMetric, limit = LIST_SIZE, meId?: number): Promise<RankRow[]> {
  const r = await pool()!.query(
    `SELECT r.rank AS rk, r.user_id, r.score, r.country, c.username, c.display_name, c.avatar_path, c.avatar_version, c.level, s.streak,
            CASE WHEN c.founder THEN 'founder' WHEN c.badge IN ('star','personality') THEN c.badge WHEN c.official THEN 'official' WHEN c.badge = 'gold' OR c.verified THEN 'gold' WHEN c.badge = 'emerald' THEN 'emerald' END AS badge
       FROM ranking_results r JOIN ranking_seasons z ON z.id = r.season_id
       JOIN community_profiles c ON c.user_id = r.user_id JOIN users u ON u.id = r.user_id
       LEFT JOIN ranking_snapshot s ON s.user_id = r.user_id
      WHERE z.kind = $1 AND z.key = $2 AND r.metric = $3 AND ${NAMED_LIVE}
      ORDER BY r.pos LIMIT $4`,
    [kind, key, metric, limit],
  );
  return r.rows.map((x) => { const { userId, ...o } = rowOf({ ...x, streak: x.streak ?? 0 }, meId); return { ...o, me: userId === meId }; });
}

export type SeasonCountry = { rank: number; country: string; members: number; active: number; score: number };
export async function seasonCountries(kind: SeasonKind, key: string, metric: CountryMetric, mode: CountryMode, limit = 50): Promise<SeasonCountry[]> {
  const r = await pool()!.query(
    `SELECT r.rank, r.country, r.members, r.active, r.score FROM ranking_country_results r JOIN ranking_seasons z ON z.id = r.season_id
      WHERE z.kind = $1 AND z.key = $2 AND r.metric = $3 AND r.mode = $4 ORDER BY r.pos LIMIT $5`,
    [kind, key, metric, mode, limit],
  );
  return r.rows.map((x) => ({ rank: Number(x.rank), country: String(x.country), members: Number(x.members), active: Number(x.active), score: Number(x.score) }));
}

export type Hall = { season: SeasonInfo; members: Record<string, RankRow[]>; countries: { total: SeasonCountry[]; perCapita: SeasonCountry[] } };
/** the hall of fame: for each closed year (newest first) the top three members per metric and the top countries */
export async function hallOfFame(kind: SeasonKind = "year", limit = 10): Promise<Hall[]> {
  return cached(`hall:${kind}:${limit}`, 300_000, async () => {
    const out: Hall[] = [];
    for (const season of await seasons(kind, limit)) {
      const members: Record<string, RankRow[]> = {};
      for (const m of SEASON_METRICS) members[m] = await seasonRows(kind, season.key, m, 3);
      out.push({ season, members, countries: { total: await seasonCountries(kind, season.key, "xp", "total", 3), perCapita: await seasonCountries(kind, season.key, "xp", "per_capita", 3) } });
    }
    return out;
  });
}

export type MyPlace = { kind: SeasonKind; key: string; to: string; metric: SeasonMetric; rank: number; score: number };
/** a member's own best places in closed seasons (top 100 only) */
export async function myHistory(meId: number): Promise<MyPlace[]> {
  const r = await pool()!.query(
    `SELECT z.kind, z.key, to_char(z.ends_on, 'YYYY-MM-DD') AS ends_on, r.metric, r.rank, r.score FROM ranking_results r JOIN ranking_seasons z ON z.id = r.season_id
      WHERE r.user_id = $1 ORDER BY z.ends_on DESC, r.metric LIMIT 200`, [meId]);
  return r.rows.map((x) => ({ kind: x.kind, key: x.key, to: String(x.ends_on), metric: x.metric, rank: Number(x.rank), score: Number(x.score) }));
}
