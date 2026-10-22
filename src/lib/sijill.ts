import { pool } from "./db";
import raw from "./feed/config.json";
import { mondayDay, sharerTier } from "./communityProfiles";
import { displayBadge, proOf, type Badge } from "./talentBadges";
import { courseName, verifyUrl } from "@/app/api/certificates/lib";

// Sijill (السجل, the academic record) of the Quran Talents network (owner decision 21.10.2026): the social side shows
// learning achievements only. The app computes a compact summary of aggregates from its own stores (no raw data, no
// answers, no verse lists) and sends it to POST /api/community/achievements; it is validated, capped and stored in
// community_profiles.achievements. Certificates and exam results come from the server tables, never from the client.
// Every section is public until the member switches it off (sijill_privacy); certificates stay off until switched on. Achievement moments are generated here,
// by the system, from what changed between two syncs and from new certificates and passed exams.

export const SECTIONS = ["level", "badges", "hifz", "tree", "stickers", "certificates", "exams", "memorised", "time", "activity", "courses", "sharer"] as const;
export type Section = (typeof SECTIONS)[number];
export type Privacy = Record<Section, boolean>;
export const isSection = (v: unknown): v is Section => typeof v === "string" && (SECTIONS as readonly string[]).includes(v);

export function privacyOf(v: unknown): Privacy {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  // public by default (owner decision): every section shows unless switched off; certificates (real name on the verify page) stay off until switched on
  return Object.fromEntries(SECTIONS.map((s) => [s, o[s] === undefined ? s !== "certificates" : o[s] === true])) as Privacy;
}

export type SijillConfig = { momentsInFeed: boolean; leaderboards: boolean; compare: boolean };
export function sijillConfig(): SijillConfig {
  const c = ((raw as { sijill?: Partial<SijillConfig> }).sijill ?? {}) as Partial<SijillConfig>;
  return { momentsInFeed: c.momentsInFeed === true, leaderboards: c.leaderboards !== false, compare: c.compare !== false };
}

// ---------- the summary sent by the app ----------
export const STUDY_STAGES = ["ibtidai", "idadi", "thanawi", "ali"] as const;
export const FOCUSES = ["hifz", "reading", "arabic", "knowledge"] as const;
const TREES = ["palm", "olive", "fig", "pomegranate", "sidr"];
const SERIES = ["ayah", "surah", "juz", "names", "prophets", "months", "letters", "roots", "tajweed", "places", "scholars", "seasonal"];
const AR_LEVELS = ["A1", "A2", "B1", "B2", "C1"];

export type Summary = {
  v: 1;
  level: { xp: number; level: number };
  rank: { stage: (typeof STUDY_STAGES)[number]; rank: "talib" | "mutaqaddim"; overall: number | null };
  hifz: { grade: number; verses: number; tests: number; quality: number | null };
  tree: { type: string; stage: number; trees: number; fruits: number; name: string; days: number };
  stickers: { total: number; catalog: number; feed: number; rare: number; epic: number; legendaryN: number; legendary: string[]; series: string[] };
  memorised: { verses: number; juz: number[]; surahs: number[]; current: number | null };
  time: { totalMin: number; weekMin: number; streak: number; best: number; wird: number };
  week: { monday: number; xp: number[]; active: number };
  courses: { done: number; ids: string[]; qaida: number; arabic: number; rp: number; arLevels: string[] };
  goal: { minutes: number; focus: (typeof FOCUSES)[number] };
  /** the Shams method in use (owner 22.10.2026, shown as a badge with the level section): classic, 2.0, 3.0 */
  method?: (typeof METHODS)[number] | null;
};
export const METHODS = ["classic", "v2", "v3"] as const;

const obj = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const int = (v: unknown, min: number, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.floor(v))) : min);
const intOrNull = (v: unknown, min: number, max: number) => (v === null || v === undefined || typeof v !== "number" || !Number.isFinite(v) ? null : Math.max(min, Math.min(max, Math.floor(v))));
const pick = <T extends string>(v: unknown, list: readonly T[], d: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : d);
const nums = (v: unknown, len: number, max: number) => {
  const a = Array.isArray(v) ? v : [];
  return Array.from({ length: len }, (_, i) => int(a[i], 0, max));
};
const strs = (v: unknown, re: RegExp, cap: number) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && re.test(x)))].slice(0, cap) : []);

/** validates and caps the app's summary; null when it is not a summary at all or too large */
export function cleanSummary(b: unknown): Summary | null {
  if (!b || typeof b !== "object") return null;
  if (JSON.stringify(b).length > 12_000) return null;
  const s = obj(b);
  const level = obj(s.level), rank = obj(s.rank), hifz = obj(s.hifz), tree = obj(s.tree), st = obj(s.stickers), mem = obj(s.memorised);
  const time = obj(s.time), week = obj(s.week), courses = obj(s.courses), goal = obj(s.goal);
  const verses = int(mem.verses, 0, 6236);
  return {
    v: 1,
    // endless levels (owner 22.10.2026): only a sanity bound, no cap a learner can reach
    level: { xp: int(level.xp, 0, 1_000_000_000_000), level: int(level.level, 1, 10_000_000) },
    rank: { stage: pick(rank.stage, STUDY_STAGES, "ibtidai"), rank: rank.rank === "mutaqaddim" ? "mutaqaddim" : "talib", overall: intOrNull(rank.overall, 0, 100) },
    hifz: { grade: int(hifz.grade, 1, 7), verses: int(hifz.verses, 0, 6236), tests: int(hifz.tests, 0, 100_000), quality: intOrNull(hifz.quality, 0, 100) },
    tree: { type: typeof tree.type === "string" && TREES.includes(tree.type) ? tree.type : "", stage: int(tree.stage, 0, 12), trees: int(tree.trees, 0, 10), fruits: int(tree.fruits, 0, 1_000_000),
      // the tree's own name (typed by the member: one line, checked with moderate() before it is stored) and its age
      name: typeof tree.name === "string" ? tree.name.replace(/[\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim().slice(0, 30) : "", days: int(tree.days, 0, 30_000) },
    stickers: {
      total: int(st.total, 0, 1_000_000), catalog: int(st.catalog, 0, 1_000_000), feed: int(st.feed, 0, 10_000),
      rare: int(st.rare, 0, 1_000_000), epic: int(st.epic, 0, 1_000_000), legendaryN: int(st.legendaryN, 0, 1_000_000),
      legendary: strs(st.legendary, /^[a-z]:[A-Za-z0-9:_-]{1,30}$/, 6), series: strs(st.series, new RegExp(`^(${SERIES.join("|")})$`), SERIES.length),
    },
    memorised: { verses, juz: nums(mem.juz, 30, 100), surahs: nums(mem.surahs, 114, 100), current: intOrNull(mem.current, 1, 114) },
    time: { totalMin: int(time.totalMin, 0, 50_000_000), weekMin: int(time.weekMin, 0, 10_080), streak: int(time.streak, 0, 100_000), best: int(time.best, 0, 100_000), wird: int(time.wird, 0, 100_000) },
    week: { monday: int(week.monday, 0, 1_000_000), xp: nums(week.xp, 7, 1_000_000), active: int(week.active, 0, 7) },
    courses: {
      done: int(courses.done, 0, 10_000), ids: strs(courses.ids, /^[a-z0-9_.-]{1,40}$/, 40), qaida: int(courses.qaida, 0, 10_000),
      arabic: int(courses.arabic, 0, 10_000), rp: int(courses.rp, 0, 10_000), arLevels: strs(courses.arLevels, /^(A1|A2|B1|B2|C1)$/, AR_LEVELS.length),
    },
    goal: { minutes: int(goal.minutes, 0, 600), focus: pick(goal.focus, FOCUSES, "reading") },
    method: typeof s.method === "string" && (METHODS as readonly string[]).includes(s.method) ? (s.method as (typeof METHODS)[number]) : null,
  };
}

/** the week values count only for the current week (client and server days may differ by one) */
const weekCurrent = (s: Partial<Summary>) => !!s.week && s.week.monday >= mondayDay() - 1;

/** stores a summary with its copies for discovery and leaderboards; returns the previous summary */
export async function storeSummary(userId: number, s: Summary): Promise<Partial<Summary>> {
  const p = pool()!;
  const prev = (await p.query("SELECT achievements FROM community_profiles WHERE user_id = $1", [userId])).rows[0]?.achievements ?? {};
  await p.query(
    `UPDATE community_profiles SET achievements = $2, achievements_updated_at = now(), study_stage = $3, study_focus = $4, study_level = $5,
            study_minutes = $6, current_surah = $7, memorised_verses = $8, week_monday = $9, week_xp = $10, week_active = $11, streak_days = $12
      WHERE user_id = $1`,
    [userId, JSON.stringify(s), s.rank.stage, s.goal.focus, Math.min(32_000, s.level.level), s.goal.minutes, s.memorised.current, s.memorised.verses,
      s.week.monday, s.week.xp.reduce((a, x) => a + x, 0), s.week.active, s.time.streak],
  );
  return prev as Partial<Summary>;
}

// ---------- achievement moments ----------
export const MOMENT_KINDS = ["certificate", "exam", "level", "juz", "tree", "sticker", "streak", "course", "hifz"] as const;
export type MomentKind = (typeof MOMENT_KINDS)[number];
export const MOMENT_SECTION: Record<MomentKind, Section> = {
  certificate: "certificates", exam: "exams", level: "level", juz: "memorised", tree: "tree", sticker: "stickers", streak: "time", course: "courses", hifz: "hifz",
};
/** SQL: the privacy section of moment alias m switched on by its owner (profile alias c) */
export const MOMENT_SHOWN = `COALESCE((c.sijill_privacy ->> (CASE m.kind ${MOMENT_KINDS.map((k) => `WHEN '${k}' THEN '${MOMENT_SECTION[k]}'`).join(" ")} END))::boolean, true)`;
export const REACTIONS = ["like", "mashallah", "barakallah", "barik"] as const;
export type Reaction = (typeof REACTIONS)[number];
export const isReaction = (v: unknown): v is Reaction => typeof v === "string" && (REACTIONS as readonly string[]).includes(v);
const STREAKS = [7, 30, 100, 365, 1000];

type NewMoment = { kind: MomentKind; ref: string; data: Record<string, unknown> };
/** what changed between two summaries; the first summary of a member is only the baseline (no flood of old moments) */
export function momentsFromChange(prev: Partial<Summary>, next: Summary): NewMoment[] {
  if (!prev || !prev.v) return [];
  const out: NewMoment[] = [];
  const pl = prev.level?.level ?? 1;
  if (next.level.level > pl) out.push({ kind: "level", ref: `L${next.level.level}`, data: { n: next.level.level } });
  if (next.hifz.grade > (prev.hifz?.grade ?? 1)) out.push({ kind: "hifz", ref: `G${next.hifz.grade}`, data: { n: next.hifz.grade } });
  next.memorised.juz.forEach((pct, i) => { if (pct >= 100 && (prev.memorised?.juz?.[i] ?? 0) < 100) out.push({ kind: "juz", ref: `J${i + 1}`, data: { n: i + 1 } }); });
  if (next.tree.type && next.tree.stage > (prev.tree?.stage ?? 0) && next.tree.stage >= 2) out.push({ kind: "tree", ref: `${next.tree.type}:${next.tree.stage}`, data: { type: next.tree.type, n: next.tree.stage } });
  const oldLeg = new Set(prev.stickers?.legendary ?? []);
  for (const id of next.stickers.legendary) if (!oldLeg.has(id)) out.push({ kind: "sticker", ref: id.slice(0, 40), data: { id } });
  const oldSeries = new Set(prev.stickers?.series ?? []);
  for (const se of next.stickers.series) if (!oldSeries.has(se)) out.push({ kind: "sticker", ref: `S:${se}`, data: { series: se } });
  const ps = prev.time?.streak ?? 0;
  const hit = STREAKS.filter((m) => next.time.streak >= m && ps < m).pop();
  if (hit) out.push({ kind: "streak", ref: `D${hit}`, data: { n: hit } });
  const oldC = new Set(prev.courses?.ids ?? []);
  for (const id of next.courses.ids) if (!oldC.has(id)) out.push({ kind: "course", ref: `C:${id}`.slice(0, 40), data: { id } });
  const oldAr = new Set(prev.courses?.arLevels ?? []);
  for (const l of next.courses.arLevels) if (!oldAr.has(l)) out.push({ kind: "course", ref: `A:${l}`, data: { arabic: l } });
  return out.slice(0, 10);
}

const EXAM_KINDS = ["qbank", "rp-level", "juz", "ar-unit", "surah"];
/** inserts system moments: the changes above plus certificates and passed exams of the last 14 days (idempotent) */
export async function addMoments(userId: number, fresh: NewMoment[]) {
  const p = pool()!;
  const server: NewMoment[] = [];
  try {
    const c = await p.query(
      `SELECT course, pct FROM certificates WHERE user_id = $1 AND status = 'valid' AND COALESCE(decided_at, issued_at) > now() - interval '14 days' ORDER BY issued_at DESC LIMIT 10`,
      [userId],
    );
    for (const x of c.rows) server.push({ kind: "certificate", ref: String(x.course).slice(0, 40), data: { course: x.course, pct: Number(x.pct) } });
    const e = await p.query(
      `SELECT exam, ref, max(CASE WHEN total > 0 THEN round(100.0 * score / total) ELSE 0 END)::int AS pct FROM exam_attempts
        WHERE user_id = $1 AND passed AND status = 'submitted' AND sig IS NOT NULL AND submitted_at > now() - interval '14 days' AND exam = ANY($2::text[])
        GROUP BY exam, ref LIMIT 10`,
      [userId, EXAM_KINDS],
    );
    for (const x of e.rows) server.push({ kind: "exam", ref: `${x.exam}:${x.ref}`.slice(0, 40), data: { exam: x.exam, ref: x.ref, pct: Number(x.pct) } });
  } catch { /* exam module tables missing: only client moments */ }
  for (const m of [...server, ...fresh].slice(0, 20)) {
    await p.query("INSERT INTO community_moments (user_id, kind, ref, data) VALUES ($1,$2,$3,$4) ON CONFLICT (user_id, kind, ref) DO NOTHING", [userId, m.kind, m.ref, JSON.stringify(m.data)]);
  }
}

// ---------- reading a Sijill ----------
export type Certificate = { title: string; course: string; pct: number; url: string; at: string };
export type ExamPassed = { exam: string; ref: string; pct: number; at: string; attempts: number };
export type Sijill = {
  updatedAt: string | null;
  privacy?: Privacy;
  leaderboard?: boolean;
  level?: { xp: number; level: number; talentLevel: string; stage: string; rank: string; overall: number | null; method?: string | null };
  badges?: { badge: Badge | null; official: boolean };
  hifz?: Summary["hifz"];
  tree?: Summary["tree"];
  stickers?: Summary["stickers"];
  certificates?: Certificate[];
  exams?: ExamPassed[];
  memorised?: Summary["memorised"];
  time?: Summary["time"];
  activity?: { xp: number; level: number; week: number[]; active: number };
  courses?: Summary["courses"];
  sharer?: { tier: number; shares: number };
  reactions: number;
  moments: number;
  /** counted encouragements received (rewarded in the app); `given` and `receivedToday` only for the owner */
  received: number;
  given?: number;
  receivedToday?: number;
};

type ProfileRow = {
  user_id: string; achievements: Partial<Summary> | null; achievements_updated_at: string | null; sijill_privacy: unknown; leaderboard_opt_in: boolean;
  level: string; badge: string | null; official: boolean; verified: boolean; shares_total: number;
};
export const SIJILL_COLS = "c.user_id, c.achievements, c.achievements_updated_at, c.sijill_privacy, c.leaderboard_opt_in, c.level, c.badge, c.official, c.founder, c.verified, c.shares_total, c.pro_until";

/** the Sijill of a profile row; `full` = the owner (every section and the privacy settings), otherwise only the sections switched on */
export async function sijillOf(r: ProfileRow, full: boolean, locale: string): Promise<Sijill> {
  const p = pool()!;
  const pv = privacyOf(r.sijill_privacy);
  const on = (s: Section) => full || pv[s];
  const a = (r.achievements ?? {}) as Partial<Summary>;
  const has = !!a.v;
  const out: Sijill = { updatedAt: r.achievements_updated_at, reactions: 0, moments: 0, received: 0 };
  if (full) { out.privacy = pv; out.leaderboard = !!r.leaderboard_opt_in; }
  if (on("level") && has) out.level = { xp: a.level!.xp, level: a.level!.level, talentLevel: r.level ?? "talent", stage: a.rank!.stage, rank: a.rank!.rank, overall: a.rank!.overall, method: a.method ?? null };
  if (on("badges")) out.badges = { badge: displayBadge(r), official: !!r.official };
  if (on("hifz") && has) out.hifz = a.hifz;
  if (on("tree") && has && a.tree?.type) out.tree = a.tree;
  if (on("stickers") && has) out.stickers = a.stickers;
  if (on("memorised") && has) out.memorised = a.memorised;
  if (on("time") && has) out.time = weekCurrent(a) ? a.time : { ...a.time!, weekMin: 0 };
  if (on("activity") && has) out.activity = { xp: a.level!.xp, level: a.level!.level, week: weekCurrent(a) ? a.week!.xp : [0, 0, 0, 0, 0, 0, 0], active: weekCurrent(a) ? a.week!.active : 0 };
  if (on("courses") && has) out.courses = a.courses;
  if (on("sharer")) out.sharer = { tier: sharerTier(Number(r.shares_total ?? 0)), shares: Number(r.shares_total ?? 0) };
  try {
    if (on("certificates")) {
      // server-verified only; the holder's name on the certificate is never sent (it shows on the verify page)
      const c = await p.query("SELECT code, course, pct, issued_at FROM certificates WHERE user_id = $1 AND status = 'valid' ORDER BY issued_at DESC LIMIT 40", [r.user_id]);
      out.certificates = c.rows.map((x) => ({ title: courseName(x.course, locale), course: x.course, pct: Number(x.pct), url: verifyUrl(x.code), at: x.issued_at }));
    }
    if (on("exams")) {
      const e = await p.query(
        `SELECT exam, ref, max(CASE WHEN total > 0 THEN round(100.0 * score / total) ELSE 0 END)::int AS pct, max(submitted_at) AS at, count(*)::int AS n
           FROM exam_attempts WHERE user_id = $1 AND passed AND status = 'submitted' AND sig IS NOT NULL AND exam = ANY($2::text[])
          GROUP BY exam, ref ORDER BY max(submitted_at) DESC LIMIT 60`,
        [r.user_id, EXAM_KINDS],
      );
      out.exams = e.rows.map((x) => ({ exam: x.exam, ref: x.ref, pct: Number(x.pct), at: x.at, attempts: Number(x.n) }));
    }
  } catch { /* exam module tables missing */ }
  const m = await p.query(
    `SELECT count(*)::int AS n, COALESCE(sum(m.reaction_count), 0)::int AS r FROM community_moments m JOIN community_profiles c ON c.user_id = m.user_id
      WHERE m.user_id = $1 AND ($2 OR ${MOMENT_SHOWN})`,
    [r.user_id, full],
  );
  out.moments = Number(m.rows[0]?.n ?? 0);
  out.reactions = Number(m.rows[0]?.r ?? 0);
  try {
    const t = await creditTotals(Number(r.user_id));
    out.received = t.received;
    if (full) { out.given = t.given; out.receivedToday = t.receivedToday; }
  } catch { /* table not created yet */ }
  return out;
}

/** compare is allowed between mutual follows or accepted connections */
export async function canCompare(a: number, b: number): Promise<boolean> {
  const r = await pool()!.query(
    `SELECT (EXISTS (SELECT 1 FROM community_follows WHERE follower_id = $1 AND followee_id = $2) AND EXISTS (SELECT 1 FROM community_follows WHERE follower_id = $2 AND followee_id = $1))
         OR EXISTS (SELECT 1 FROM community_connections WHERE status = 'accepted' AND LEAST(requester_id, addressee_id) = LEAST($1::bigint, $2::bigint) AND GREATEST(requester_id, addressee_id) = GREATEST($1::bigint, $2::bigint)) AS ok`,
    [a, b],
  );
  return !!r.rows[0]?.ok;
}

/** a moment as the app and the website see it (never the user id) */
export type MomentRow = {
  id: string; kind: string; ref: string; data: Record<string, unknown>; created_at: string; reaction_count: number; mine: string | null;
  r_like: number; r_mashallah: number; r_barakallah: number; r_barik: number;
  username: string; display_name: string; verified: boolean; badge: string | null; official: boolean; avatar_path: string | null; avatar_version: number; own: boolean;
};
export const MOMENT_COLS = `m.id, m.kind, m.ref, m.data, m.created_at, m.reaction_count,
  (SELECT x.reaction FROM community_moment_reactions x WHERE x.moment_id = m.id AND x.user_id = $1) AS mine,
  (SELECT count(*)::int FROM community_moment_reactions x WHERE x.moment_id = m.id AND x.reaction = 'like') AS r_like,
  (SELECT count(*)::int FROM community_moment_reactions x WHERE x.moment_id = m.id AND x.reaction = 'mashallah') AS r_mashallah,
  (SELECT count(*)::int FROM community_moment_reactions x WHERE x.moment_id = m.id AND x.reaction = 'barakallah') AS r_barakallah,
  (SELECT count(*)::int FROM community_moment_reactions x WHERE x.moment_id = m.id AND x.reaction = 'barik') AS r_barik,
  c.username, c.display_name, c.verified, c.badge, c.official, c.founder, c.pro_until, c.avatar_path, c.avatar_version, (m.user_id = $1) AS own`;
export function momentJson(x: MomentRow, locale: string) {
  const data = (x.data ?? {}) as Record<string, unknown>;
  return {
    id: String(x.id), kind: x.kind, ref: x.ref, data, at: x.created_at,
    // certificates carry their localized name (the app has no course table for them)
    title: x.kind === "certificate" && typeof data.course === "string" ? courseName(data.course, locale) : null,
    total: Number(x.reaction_count ?? 0), mine: x.mine ?? null, own: !!x.own,
    counts: { like: Number(x.r_like ?? 0), mashallah: Number(x.r_mashallah ?? 0), barakallah: Number(x.r_barakallah ?? 0), barik: Number(x.r_barik ?? 0) },
    author: { username: x.username, name: x.display_name, badge: displayBadge(x), pro: proOf(x), avatar: x.avatar_path ? `/api/community/avatar/${x.username}?v=${Number(x.avatar_version ?? 0)}` : null },
  };
}

/** a reaction notification for the achiever (one per actor and moment; a changed reaction updates it) */
export async function notifyReaction(ownerId: number, actorId: number, momentId: string, reaction: Reaction) {
  if (ownerId === actorId) return;
  try {
    const p = pool()!;
    const u = await p.query("UPDATE community_notifications SET reaction = $4 WHERE user_id = $1 AND kind = 'moment_reaction' AND actor_id = $2 AND moment_id = $3 RETURNING 1", [ownerId, actorId, momentId, reaction]);
    if (!u.rows[0]) await p.query("INSERT INTO community_notifications (user_id, kind, actor_id, moment_id, reaction) VALUES ($1,'moment_reaction',$2,$3,$4)", [ownerId, actorId, momentId, reaction]);
  } catch { /* not essential */ }
}

// ---------- rewards for encouragement ----------
// A reaction is "counted" (rewarded for the receiver, counted for the giver) once per giver and moment, never for oneself
// (the react route rejects own moments), never across blocks (visibleMoment), and within daily caps so it cannot be farmed:
// at most 5 from one person to the same person, 50 per receiver and 20 per giver per UTC day. Removing and giving again
// does not count twice. The app turns the received total into XP and garden growth (mobile/src/features/sijill/received.ts).
export const CREDIT_CAPS = { perPair: 5, receiverDay: 50, giverDay: 20 } as const;
export async function creditReaction(momentId: string, giverId: number, receiverId: number): Promise<boolean> {
  if (giverId === receiverId) return false;
  try {
    const r = await pool()!.query(
      `INSERT INTO community_reaction_credits (moment_id, giver_id, receiver_id)
       SELECT $1::bigint, $2::bigint, $3::bigint
        WHERE (SELECT count(*) FROM community_reaction_credits WHERE giver_id = $2 AND receiver_id = $3 AND day = (now() AT TIME ZONE 'UTC')::date) < $4
          AND (SELECT count(*) FROM community_reaction_credits WHERE receiver_id = $3 AND day = (now() AT TIME ZONE 'UTC')::date) < $5
          AND (SELECT count(*) FROM community_reaction_credits WHERE giver_id = $2 AND day = (now() AT TIME ZONE 'UTC')::date) < $6
       ON CONFLICT (moment_id, giver_id) DO NOTHING RETURNING 1`,
      [momentId, giverId, receiverId, CREDIT_CAPS.perPair, CREDIT_CAPS.receiverDay, CREDIT_CAPS.giverDay],
    );
    return !!r.rows[0];
  } catch { return false; }
}
export async function creditTotals(userId: number): Promise<{ received: number; given: number; receivedToday: number }> {
  const r = await pool()!.query(
    `SELECT (SELECT count(*)::int FROM community_reaction_credits WHERE receiver_id = $1) AS rec,
            (SELECT count(*)::int FROM community_reaction_credits WHERE giver_id = $1) AS gave,
            (SELECT count(*)::int FROM community_reaction_credits WHERE receiver_id = $1 AND day = (now() AT TIME ZONE 'UTC')::date) AS today`,
    [userId],
  );
  const x = r.rows[0] ?? {};
  return { received: Number(x.rec ?? 0), given: Number(x.gave ?? 0), receivedToday: Number(x.today ?? 0) };
}
