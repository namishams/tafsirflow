import crypto from "node:crypto";
import { pool } from "./db";
import { mondayDay } from "./communityProfiles";
import { MIN_POST_AGE, NOT_BLOCKED, PROFILE_COLS, card } from "./talents";

// Together (gemeinsam lernen, owner 22.10.2026): positive peer motivation around learning, in a noble and modest tone.
// Competition is framed as competing in good deeds; nothing is staked, nothing is random, there is no free text
// between members (only preset nudges and encouragements), and every feature is opt-in (together_settings).
// All member-to-member features are 16+ on both sides; blocked members disappear; circles can be reported.
// Data comes from what the app already sends for the Sijill (community_profiles: week_xp, week_active, streak_days,
// memorised_verses, achievements.week.xp). No raw learning data is stored here.

export const FEATURES = ["activity", "league", "circles", "challenges", "nudges", "community", "bestList"] as const;
export type Feature = (typeof FEATURES)[number];
export type Gender = "brother" | "sister";
export type Settings = Record<Feature, boolean> & { gender: Gender | null };
const COL: Record<Feature, string> = {
  activity: "share_activity", league: "league", circles: "circles", challenges: "challenges", nudges: "nudges", community: "community", bestList: "best_list",
};
export const OFF: Settings = { activity: false, league: false, circles: false, challenges: false, nudges: false, community: false, bestList: false, gender: null };

export async function settingsOf(userId: number): Promise<Settings> {
  const r = (await pool()!.query("SELECT * FROM together_settings WHERE user_id = $1", [userId])).rows[0];
  if (!r) return { ...OFF };
  const s = { ...OFF };
  for (const f of FEATURES) s[f] = !!r[COL[f]];
  s.gender = r.circle_gender === "brother" || r.circle_gender === "sister" ? r.circle_gender : null;
  return s;
}

/** saves switches; the gender is set once (later changes only through support/admin) */
export async function saveSettings(userId: number, patch: Partial<Record<Feature, unknown>> & { gender?: unknown }, internal = false): Promise<Settings> {
  const cur = await settingsOf(userId);
  // "circles" is not a switch of its own: consent is given per circle when creating or joining it (and ends by leaving
  // it), so only the server sets it (internal), as "takes part in circles"
  for (const f of FEATURES) if (typeof patch[f] === "boolean" && (f !== "circles" || internal)) cur[f] = patch[f] as boolean;
  if (!cur.bestList || !cur.community) cur.bestList = cur.bestList && cur.community; // the best list needs the community count
  if (!cur.gender && (patch.gender === "brother" || patch.gender === "sister")) cur.gender = patch.gender;
  await pool()!.query(
    `INSERT INTO together_settings (user_id, share_activity, league, circles, challenges, nudges, community, best_list, circle_gender, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
     ON CONFLICT (user_id) DO UPDATE SET share_activity = $2, league = $3, circles = $4, challenges = $5, nudges = $6, community = $7, best_list = $8,
       circle_gender = COALESCE(together_settings.circle_gender, $9), updated_at = now()`,
    [userId, cur.activity, cur.league, cur.circles, cur.challenges, cur.nudges, cur.community, cur.bestList, cur.gender],
  );
  return cur;
}

// ---------- SQL building blocks (viewer = $1) ----------
/** 16+ by the confirmed birth year */
export const AGE16 = (col: string) =>
  `EXISTS (SELECT 1 FROM users ua WHERE ua.id = ${col} AND ua.birth_year IS NOT NULL AND extract(year from now())::int - ua.birth_year >= ${MIN_POST_AGE})`;
/** friends: mutual follows or an accepted connection */
export const FRIEND = (col: string) =>
  `((EXISTS (SELECT 1 FROM community_follows fa WHERE fa.follower_id = $1 AND fa.followee_id = ${col})
     AND EXISTS (SELECT 1 FROM community_follows fb WHERE fb.follower_id = ${col} AND fb.followee_id = $1))
    OR EXISTS (SELECT 1 FROM community_connections k WHERE k.status = 'accepted'
      AND ((k.requester_id = $1 AND k.addressee_id = ${col}) OR (k.addressee_id = $1 AND k.requester_id = ${col}))))`;
/** a visible other member: profile not suspended, 16+, not blocked either way */
export const OTHER_OK = (col: string) => `(${col} <> $1 AND ${AGE16(col)} AND ${NOT_BLOCKED(col)})`;
/** feature switch of member `col` */
export const HAS = (f: Feature, col: string) => `EXISTS (SELECT 1 FROM together_settings ts WHERE ts.user_id = ${col} AND ts.${COL[f]})`;

const DAY = 86_400_000;
export const today = () => Math.floor(Date.now() / DAY);
/** "learned today": XP on the server's day in the member's current week (or the next day for members east of UTC),
 *  synced in the last 36 hours. SQL on alias c. */
export const LEARNED_TODAY = () => {
  const d = today();
  return `(c.achievements_updated_at > now() - interval '36 hours' AND c.week_monday BETWEEN ${d - 7} AND ${d}
    AND (COALESCE((c.achievements->'week'->'xp'->>(${d} - c.week_monday))::int, 0) > 0
      OR (${d} - c.week_monday < 6 AND COALESCE((c.achievements->'week'->'xp'->>(${d} - c.week_monday + 1))::int, 0) > 0)))`;
};
/** the week XP of alias c when its week is the current one */
export const WEEK_XP = () => `(CASE WHEN c.week_monday >= ${mondayDay() - 1} THEN c.week_xp ELSE 0 END)`;
export const WEEK_ACTIVE = () => `(CASE WHEN c.week_monday >= ${mondayDay() - 1} THEN c.week_active ELSE 0 END)`;

/** copies the current week's numbers of these members into together_week_xp (highest XP seen, latest verses) */
export async function snapshot(userIds: (number | string)[]) {
  if (!userIds.length) return;
  const mon = mondayDay();
  await pool()!.query(
    `INSERT INTO together_week_xp (week_monday, user_id, xp, active, verses_start, verses)
     SELECT $2::int, c.user_id, c.week_xp, c.week_active,
            COALESCE((SELECT p.verses FROM together_week_xp p WHERE p.user_id = c.user_id AND p.week_monday < $2::int ORDER BY p.week_monday DESC LIMIT 1), c.memorised_verses),
            c.memorised_verses
       FROM community_profiles c WHERE c.user_id = ANY($1::bigint[]) AND c.week_monday >= $2::int - 1
     ON CONFLICT (week_monday, user_id) DO UPDATE SET xp = GREATEST(together_week_xp.xp, EXCLUDED.xp),
       active = GREATEST(together_week_xp.active, EXCLUDED.active), verses = EXCLUDED.verses
       WHERE together_week_xp.xp < EXCLUDED.xp OR together_week_xp.active < EXCLUDED.active OR together_week_xp.verses <> EXCLUDED.verses`,
    [userIds.map(String), mon],
  );
}

// ---------- friends today ----------
type Row = Record<string, unknown> & { user_id: string };
export type FriendToday = ReturnType<typeof card> & { today: boolean; streak: number; weekActive: number };

export async function friendsToday(meId: number, limit = 60) {
  const r = await pool()!.query(
    `SELECT ${PROFILE_COLS}, ${LEARNED_TODAY()} AS today, c.streak_days, ${WEEK_ACTIVE()} AS week_active
       FROM community_profiles c
      WHERE NOT c.suspended AND ${OTHER_OK("c.user_id")} AND ${FRIEND("c.user_id")} AND ${HAS("activity", "c.user_id")}
      ORDER BY today DESC, c.streak_days DESC, c.username LIMIT ${limit}`,
    [meId],
  );
  const list: FriendToday[] = r.rows.map((x: Row) => ({ ...card(x as never), today: !!x.today, streak: Number(x.streak_days ?? 0), weekActive: Number(x.week_active ?? 0) }));
  const all = await pool()!.query(`SELECT count(*)::int AS n FROM community_profiles c WHERE NOT c.suspended AND ${OTHER_OK("c.user_id")} AND ${FRIEND("c.user_id")}`, [meId]);
  return { list, sharing: list.length, friends: Number(all.rows[0].n), learnedToday: list.filter((x) => x.today).length, keptStreak: list.filter((x) => x.today && x.streak >= 2).length };
}

/** friends who allow a feature (pickers for challenges, invitations, nudges) */
export async function friendsFor(meId: number, f: Feature) {
  const r = await pool()!.query(
    `SELECT ${PROFILE_COLS} FROM community_profiles c
      WHERE NOT c.suspended AND ${OTHER_OK("c.user_id")} AND ${FRIEND("c.user_id")} AND ${HAS(f, "c.user_id")}
      ORDER BY c.display_name LIMIT 200`,
    [meId],
  );
  return r.rows.map((x) => card(x));
}

/** a friend by username (16+, not blocked) or null */
export async function friendByName(meId: number, username: string) {
  const r = await pool()!.query(
    `SELECT ${PROFILE_COLS} FROM community_profiles c WHERE c.username = $2 AND NOT c.suspended AND ${OTHER_OK("c.user_id")} AND ${FRIEND("c.user_id")}`,
    [meId, String(username).toLowerCase().slice(0, 40)],
  );
  return (r.rows[0] as (Row & { username: string }) | undefined) ?? null;
}

// ---------- weekly friend league ----------
/** six tiers named after places of learning (texts tier_1 … tier_6) */
export const TIERS = 6;
export type LeagueRow = ReturnType<typeof card> & { xp: number; tier: number; me: boolean; active: number };

async function leagueMembers(meId: number) {
  const r = await pool()!.query(
    `SELECT c.user_id FROM community_profiles c
      WHERE NOT c.suspended AND ${OTHER_OK("c.user_id")} AND ${FRIEND("c.user_id")} AND ${HAS("league", "c.user_id")} LIMIT 100`,
    [meId],
  );
  return [String(meId), ...r.rows.map((x) => String(x.user_id))];
}

/** settles last week once (promotion for the top third of at least three, a step down only after a week without any learning) */
async function settle(meId: number, ids: string[]) {
  const p = pool()!;
  const mon = mondayDay();
  let row = (await p.query("SELECT * FROM together_league WHERE user_id = $1", [meId])).rows[0];
  if (!row) {
    await p.query("INSERT INTO together_league (user_id, tier, week_monday) VALUES ($1, 1, $2) ON CONFLICT (user_id) DO NOTHING", [meId, mon]);
    row = { tier: 1, week_monday: mon, last_result: "", last_rank: null, last_size: null, best_tier: 1 };
    return row;
  }
  if (Number(row.week_monday) >= mon) return row;
  const last = mon - 7;
  const xs = (await p.query("SELECT user_id, xp FROM together_week_xp WHERE week_monday = $1 AND user_id = ANY($2::bigint[]) AND xp > 0 ORDER BY xp DESC", [last, ids])).rows;
  const mine = xs.findIndex((x) => String(x.user_id) === String(meId));
  let tier = Number(row.tier), result: "up" | "stay" | "down" = "stay";
  const n = xs.length;
  if (Number(row.week_monday) === last) {
    if (mine >= 0 && n >= 3 && mine < Math.max(1, Math.floor(n / 3)) && tier < TIERS) { tier += 1; result = "up"; }
    else if (mine < 0 && tier > 1) { tier -= 1; result = "down"; }
  }
  const upd = await p.query(
    "UPDATE together_league SET tier = $2, week_monday = $3, last_result = $4, last_rank = $5, last_size = $6, best_tier = GREATEST(best_tier, $2) WHERE user_id = $1 RETURNING *",
    [meId, tier, mon, Number(row.week_monday) === last ? result : "", mine >= 0 ? mine + 1 : null, Number(row.week_monday) === last ? n : null],
  );
  return upd.rows[0];
}

export async function league(meId: number) {
  const ids = await leagueMembers(meId);
  await snapshot(ids);
  const mine = await settle(meId, ids);
  const r = await pool()!.query(
    `SELECT ${PROFILE_COLS}, ${WEEK_XP()} AS xp, ${WEEK_ACTIVE()} AS active, COALESCE(l.tier, 1) AS tier, (c.user_id = $1) AS me
       FROM community_profiles c LEFT JOIN together_league l ON l.user_id = c.user_id
      WHERE c.user_id = ANY($2::bigint[]) AND NOT c.suspended
      ORDER BY xp DESC, c.streak_days DESC, c.username`,
    [meId, ids],
  );
  const rows: LeagueRow[] = r.rows.map((x) => ({ ...card(x), xp: Number(x.xp), tier: Number(x.tier), me: !!x.me, active: Number(x.active) }));
  const n = rows.length;
  const upZone = n >= 3 ? Math.max(1, Math.floor(n / 3)) : 0;
  const daysLeft = 7 - (today() - mondayDay());
  return {
    tier: Number(mine.tier), bestTier: Number(mine.best_tier ?? mine.tier),
    last: mine.last_result ? { result: mine.last_result as string, rank: mine.last_rank ? Number(mine.last_rank) : null, size: mine.last_size ? Number(mine.last_size) : null } : null,
    rows: rows.map((x, i) => ({ ...x, rank: i + 1 })), upZone, daysLeft: Math.max(1, daysLeft),
  };
}

// ---------- study circles ----------
export const CIRCLE_KINDS = ["brothers", "sisters", "family", "teacher"] as const;
export type CircleKind = (typeof CIRCLE_KINDS)[number];
export const GOAL_KINDS = ["days", "xp", "verses"] as const;
export type GoalKind = (typeof GOAL_KINDS)[number];
export const GOAL_LIMITS: Record<GoalKind, [number, number]> = { days: [1, 300], xp: [50, 200_000], verses: [1, 3000] };
export const MAX_MEMBERS: Record<CircleKind, number> = { brothers: 30, sisters: 30, family: 12, teacher: 40 };
export const MAX_OWNED = 5;
export const MAX_JOINED = 10;
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function circleCode(): string {
  const raw = Array.from(crypto.randomBytes(8), (b) => ALPHA[b % ALPHA.length]).join("");
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}
export const normCode = (c: unknown) => (typeof c === "string" ? c.toUpperCase().replace(/[^A-Z0-9]/g, "") : "");
export const fmtCode = (c: string) => (c.length === 8 ? `${c.slice(0, 4)}-${c.slice(4)}` : c);
/** may this member join a circle of this kind (self-declared gender for brothers and sisters) */
export const kindAllows = (kind: CircleKind, g: Gender | null) => (kind === "brothers" ? g === "brother" : kind === "sisters" ? g === "sister" : true);

type WeekState = { progress: number; reached: boolean; streak: number };
/** this week's progress, "reached" and the group streak of many circles at once (one snapshot, one sum, one history
 *  query). The week row is written only when it is new, when the goal was just reached, or at most every 6 hours. */
async function circleWeeks(circles: { id: string | number; goal_kind: GoalKind; goal: number }[]): Promise<Map<string, WeekState>> {
  const out = new Map<string, WeekState>();
  if (!circles.length) return out;
  const p = pool()!;
  const ids = circles.map((c) => String(c.id));
  const mon = mondayDay();
  const members = (await p.query("SELECT DISTINCT user_id FROM together_circle_members WHERE circle_id = ANY($1::bigint[]) AND status = 'member'", [ids])).rows.map((x) => String(x.user_id));
  await snapshot(members);
  const sums = (await p.query(
    `SELECT m.circle_id, count(*)::int AS members, COALESCE(sum(w.xp),0)::int AS xp, COALESCE(sum(w.active),0)::int AS days,
            COALESCE(sum(GREATEST(0, w.verses - w.verses_start)),0)::int AS verses
       FROM together_circle_members m LEFT JOIN together_week_xp w ON w.user_id = m.user_id AND w.week_monday = $2
      WHERE m.circle_id = ANY($1::bigint[]) AND m.status = 'member' GROUP BY m.circle_id`,
    [ids, mon],
  )).rows;
  const by = new Map(sums.map((x) => [String(x.circle_id), x]));
  const rows = circles.map((c) => {
    const x = by.get(String(c.id));
    const progress = Number(x?.[c.goal_kind] ?? 0);
    return { id: String(c.id), progress, goal: Number(c.goal), members: Number(x?.members ?? 0), reached: progress >= Number(c.goal) };
  });
  await p.query(
    `INSERT INTO together_circle_weeks (circle_id, week_monday, progress, goal, members, reached, updated_at)
     SELECT r.id, $1::int, r.progress, r.goal, r.members, r.reached, now()
       FROM unnest($2::bigint[], $3::int[], $4::int[], $5::int[], $6::boolean[]) AS r(id, progress, goal, members, reached)
     ON CONFLICT (circle_id, week_monday) DO UPDATE SET progress = EXCLUDED.progress, goal = EXCLUDED.goal, members = EXCLUDED.members,
       reached = together_circle_weeks.reached OR EXCLUDED.reached, updated_at = now()
       WHERE together_circle_weeks.updated_at < now() - interval '6 hours' OR (EXCLUDED.reached AND NOT together_circle_weeks.reached)`,
    [mon, rows.map((r) => r.id), rows.map((r) => r.progress), rows.map((r) => r.goal), rows.map((r) => r.members), rows.map((r) => r.reached)],
  );
  const hist = (await p.query(
    "SELECT circle_id, week_monday, reached FROM together_circle_weeks WHERE circle_id = ANY($1::bigint[]) AND week_monday < $2 AND week_monday >= $2 - 7 * 60 ORDER BY circle_id, week_monday DESC",
    [ids, mon],
  )).rows;
  const weeksOf = new Map<string, { week_monday: number; reached: boolean }[]>();
  for (const h of hist) { const k = String(h.circle_id); if (!weeksOf.has(k)) weeksOf.set(k, []); weeksOf.get(k)!.push({ week_monday: Number(h.week_monday), reached: !!h.reached }); }
  for (const r of rows) {
    let streak = 0, expect = mon - 7;
    for (const w of weeksOf.get(r.id) ?? []) { if (w.week_monday !== expect || !w.reached) break; streak++; expect -= 7; }
    if (r.reached) streak++;
    out.set(r.id, { progress: r.progress, reached: r.reached, streak });
  }
  return out;
}

export async function myCircles(meId: number) {
  const r = await pool()!.query(
    `SELECT ci.id, ci.name, ci.kind, ci.goal_kind, ci.goal, ci.suspended_at, m.role, m.status,
            (SELECT count(*)::int FROM together_circle_members x WHERE x.circle_id = ci.id AND x.status = 'member') AS members,
            (SELECT count(*)::int FROM together_circle_members x JOIN community_profiles cx ON cx.user_id = x.user_id
              WHERE x.circle_id = ci.id AND x.status = 'pending' AND NOT cx.suspended AND ${NOT_BLOCKED("x.user_id")}) AS pending
       FROM together_circle_members m JOIN together_circles ci ON ci.id = m.circle_id
      WHERE m.user_id = $1 ORDER BY m.role = 'leader' DESC, ci.created_at`,
    [meId],
  );
  const weeks = await circleWeeks(r.rows.filter((x) => x.status === "member" && !x.suspended_at));
  return r.rows.map((x) => {
    const week = weeks.get(String(x.id));
    return {
      id: String(x.id), name: x.name as string, kind: x.kind as CircleKind, role: x.role as string, status: x.status as string, members: Number(x.members),
      pending: x.role === "leader" && !x.suspended_at ? Number(x.pending) : 0, suspended: !!x.suspended_at, goalKind: x.goal_kind as GoalKind, goal: Number(x.goal),
      progress: week?.progress ?? 0, reached: week?.reached ?? false, streak: week?.streak ?? 0,
    };
  });
}

export async function circleRow(circleId: number) {
  return (await pool()!.query("SELECT * FROM together_circles WHERE id = $1", [circleId])).rows[0] as
    | { id: string; name: string; kind: CircleKind; owner_id: string; code: string; approval: boolean; goal_kind: GoalKind; goal: number; max_members: number; suspended_at: string | null; created_at: string }
    | undefined;
}
export async function membership(circleId: number, userId: number) {
  return (await pool()!.query("SELECT role, status FROM together_circle_members WHERE circle_id = $1 AND user_id = $2", [circleId, userId])).rows[0] as { role: "leader" | "member"; status: "pending" | "member" } | undefined;
}
/** a suspended circle or one with open reports keeps its state for moderation (no renaming, no deleting) */
export async function underReview(circleId: number) {
  const r = (await pool()!.query(
    `SELECT (ci.suspended_at IS NOT NULL OR EXISTS (SELECT 1 FROM community_reports r WHERE r.target_type = 'circle' AND r.target_id = ci.id AND r.status = 'open')) AS v
       FROM together_circles ci WHERE ci.id = $1`, [circleId])).rows[0];
  return !!r?.v;
}

/** a member leaves: the leader's role goes to the longest-standing member; a circle without members is removed
 *  unless it is under review (then it stays for moderation). Used by "leave" and by account deletion. */
export async function leaveCircle(circleId: number, userId: number) {
  const p = pool()!;
  const m = await membership(circleId, userId);
  await p.query("DELETE FROM together_circle_members WHERE circle_id = $1 AND user_id = $2", [circleId, userId]);
  const ci = await circleRow(circleId);
  if (!ci || String(ci.owner_id) !== String(userId) && m?.role !== "leader") return;
  const next = (await p.query("SELECT user_id FROM together_circle_members WHERE circle_id = $1 AND status = 'member' ORDER BY joined_at LIMIT 1", [circleId])).rows[0];
  if (next) {
    await p.query("UPDATE together_circle_members SET role = 'leader' WHERE circle_id = $1 AND user_id = $2", [circleId, next.user_id]);
    await p.query("UPDATE together_circles SET owner_id = $2 WHERE id = $1", [circleId, next.user_id]);
  } else if (!(await underReview(circleId))) {
    await p.query("DELETE FROM together_circles WHERE id = $1", [circleId]);
  }
}

/** before an account is deleted: every circle it leads is handed over (or removed when nobody is left) */
export async function handOverCircles(userId: number) {
  const r = await pool()!.query("SELECT id FROM together_circles WHERE owner_id = $1", [userId]);
  for (const x of r.rows) await leaveCircle(Number(x.id), userId);
}

export async function circleDetail(meId: number, circleId: number) {
  const ci = await circleRow(circleId);
  if (!ci) return null;
  const m = await membership(circleId, meId);
  if (!m) return null;
  const base = { id: String(ci.id), name: ci.name, kind: ci.kind, role: m.role, status: m.status, suspended: !!ci.suspended_at, goalKind: ci.goal_kind, goal: Number(ci.goal), approval: ci.approval, maxMembers: Number(ci.max_members) };
  if (m.status !== "member" || ci.suspended_at) return { ...base, code: null, members: [], pending: [], progress: 0, reached: false, streak: 0, history: [] };
  const week = (await circleWeeks([ci])).get(String(ci.id)) ?? { progress: 0, reached: false, streak: 0 };
  const mon = mondayDay();
  const r = await pool()!.query(
    `SELECT ${PROFILE_COLS}, m.role, ${LEARNED_TODAY()} AS today, c.streak_days, (c.user_id = $1) AS me,
            COALESCE(w.xp, 0) AS wxp, COALESCE(w.active, 0) AS wactive, GREATEST(0, COALESCE(w.verses - w.verses_start, 0)) AS wverses,
            ${HAS("nudges", "c.user_id")} AS nudgeable,
            EXISTS (SELECT 1 FROM together_nudges n WHERE n.from_id = $1 AND n.to_id = c.user_id AND n.created_at > now() - interval '20 hours') AS nudged
       FROM together_circle_members m JOIN community_profiles c ON c.user_id = m.user_id
       LEFT JOIN together_week_xp w ON w.user_id = c.user_id AND w.week_monday = $3
      WHERE m.circle_id = $2 AND m.status = 'member' AND NOT c.suspended AND (c.user_id = $1 OR ${NOT_BLOCKED("c.user_id")})
      ORDER BY m.role = 'leader' DESC, wxp DESC, c.username`,
    [meId, circleId, mon],
  );
  const members = r.rows.map((x) => ({
    ...card(x), role: x.role as string, me: !!x.me, today: !!x.today, streak: Number(x.streak_days ?? 0),
    week: { xp: Number(x.wxp), days: Number(x.wactive), verses: Number(x.wverses) }, canNudge: !x.me && !!x.nudgeable && !x.nudged,
  }));
  const pending = m.role === "leader"
    ? (await pool()!.query(
      `SELECT ${PROFILE_COLS} FROM together_circle_members m JOIN community_profiles c ON c.user_id = m.user_id
        WHERE m.circle_id = $2 AND m.status = 'pending' AND NOT c.suspended AND ${NOT_BLOCKED("c.user_id")} ORDER BY m.joined_at`,
      [meId, circleId],
    )).rows.map((x) => card(x))
    : [];
  const history = (await pool()!.query("SELECT week_monday, progress, goal, reached FROM together_circle_weeks WHERE circle_id = $1 ORDER BY week_monday DESC LIMIT 8", [circleId])).rows
    .map((x) => ({ week: Number(x.week_monday), progress: Number(x.progress), goal: Number(x.goal), reached: !!x.reached }));
  return { ...base, code: fmtCode(ci.code), members, pending, progress: week.progress, reached: week.reached, streak: week.streak, history };
}

// ---------- challenges ----------
export const CHALLENGE_KINDS = ["surah", "verses", "streak"] as const;
export type ChallengeKind = (typeof CHALLENGE_KINDS)[number];
export const MAX_OPEN_CHALLENGES = 5;

type ProgressRow = { memorised_verses: number; streak_days: number; achievements: { memorised?: { surahs?: number[] } } | null };
/** progress (0..target) of one side */
export function sideProgress(kind: ChallengeKind, target: number, base: number, p: ProgressRow | undefined, startsAt: string | null): number {
  if (!p) return 0;
  if (kind === "surah") { const pct = Number(p.achievements?.memorised?.surahs?.[target - 1] ?? 0); return Math.max(0, Math.min(100, pct)); }
  if (kind === "verses") return Math.max(0, Math.min(target, Number(p.memorised_verses) - base));
  const since = startsAt ? Math.floor((Date.now() - new Date(startsAt).getTime()) / DAY) + 1 : 0;
  return Math.max(0, Math.min(target, Math.min(Number(p.streak_days), since)));
}
export const goalOf = (kind: ChallengeKind, target: number) => (kind === "surah" ? 100 : target);

export async function challenges(meId: number) {
  const p = pool()!;
  // end the ones that ran out
  await p.query("UPDATE together_challenges SET status = 'ended' WHERE status = 'active' AND ends_at < now() AND (from_id = $1 OR to_id = $1)", [meId]);
  await p.query("UPDATE together_challenges SET status = 'cancelled' WHERE status = 'pending' AND created_at < now() - interval '14 days' AND (from_id = $1 OR to_id = $1)", [meId]);
  const r = await p.query(
    `SELECT t.*, (t.from_id = $1) AS mine_from FROM together_challenges t
      WHERE (t.from_id = $1 OR t.to_id = $1) AND (t.status IN ('pending','active') OR t.created_at > now() - interval '30 days')
        AND NOT EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = t.from_id AND b.blocked_id = t.to_id) OR (b.blocker_id = t.to_id AND b.blocked_id = t.from_id))
      ORDER BY (t.status = 'active') DESC, (t.status = 'pending') DESC, t.created_at DESC LIMIT 30`,
    [meId],
  );
  const ids = [...new Set(r.rows.flatMap((x) => [String(x.from_id), String(x.to_id)]))];
  const prof = ids.length ? (await p.query(`SELECT ${PROFILE_COLS}, c.memorised_verses, c.streak_days, c.achievements FROM community_profiles c WHERE c.user_id = ANY($1::bigint[])`, [ids])).rows : [];
  const by = new Map(prof.map((x) => [String(x.user_id), x]));
  const out = [];
  for (const x of r.rows) {
    const other = by.get(String(x.mine_from ? x.to_id : x.from_id));
    if (!other) continue;
    const meP = by.get(String(meId)), kind = x.kind as ChallengeKind, target = Number(x.target);
    const myBase = Number(x.mine_from ? x.from_base : x.to_base), theirBase = Number(x.mine_from ? x.to_base : x.from_base);
    const active = x.status === "active" || x.status === "ended";
    const mine = active ? sideProgress(kind, target, myBase, meP, x.starts_at) : 0;
    const theirs = active ? sideProgress(kind, target, theirBase, other, x.starts_at) : 0;
    const goal = goalOf(kind, target);
    // record completion once
    if (x.status === "active") {
      const col = (from: boolean) => (from ? "from_done_at" : "to_done_at");
      if (mine >= goal && !(x.mine_from ? x.from_done_at : x.to_done_at)) await p.query(`UPDATE together_challenges SET ${col(!!x.mine_from)} = now() WHERE id = $1`, [x.id]);
      if (theirs >= goal && !(x.mine_from ? x.to_done_at : x.from_done_at)) await p.query(`UPDATE together_challenges SET ${col(!x.mine_from)} = now() WHERE id = $1`, [x.id]);
    }
    out.push({
      id: String(x.id), kind, target, days: Number(x.days), status: x.status as string, fromMe: !!x.mine_from, other: card(other),
      createdAt: x.created_at, endsAt: x.ends_at, goal, mine, theirs, mineDone: mine >= goal, theirsDone: theirs >= goal,
    });
  }
  return out;
}

// ---------- learn-together invitations ----------
export const TOPICS = ["surah", "review", "tafsir", "arabic", "tajweed"] as const;
export type Topic = (typeof TOPICS)[number];

export async function invites(meId: number) {
  const r = await pool()!.query(
    `SELECT i.*, ci.name AS circle_name, cf.username AS f_username, (i.from_id = $1) AS mine,
            (SELECT a.answer FROM together_invite_answers a WHERE a.invite_id = i.id AND a.user_id = $1) AS my_answer,
            (SELECT count(*)::int FROM together_invite_answers a WHERE a.invite_id = i.id AND a.answer = 'yes') AS yes
       FROM together_invites i
       LEFT JOIN together_circles ci ON ci.id = i.circle_id
       JOIN community_profiles cf ON cf.user_id = i.from_id
      WHERE NOT i.cancelled AND i.at > now() - interval '3 hours' AND NOT cf.suspended AND ci.suspended_at IS NULL
        AND (i.from_id = $1 OR i.to_id = $1 OR EXISTS (SELECT 1 FROM together_circle_members m WHERE m.circle_id = i.circle_id AND m.user_id = $1 AND m.status = 'member'))
        AND (i.from_id = $1 OR ${NOT_BLOCKED("i.from_id")})
      ORDER BY i.at LIMIT 30`,
    [meId],
  );
  const toIds = [...new Set(r.rows.flatMap((x) => [String(x.from_id), x.to_id ? String(x.to_id) : ""]).filter(Boolean))];
  const prof = toIds.length ? (await pool()!.query(`SELECT ${PROFILE_COLS} FROM community_profiles c WHERE c.user_id = ANY($1::bigint[])`, [toIds])).rows : [];
  const by = new Map(prof.map((x) => [String(x.user_id), card(x)]));
  return r.rows.map((x) => ({
    id: String(x.id), topic: x.topic as Topic, surah: x.surah ? Number(x.surah) : null, at: x.at, mine: !!x.mine,
    from: by.get(String(x.from_id)) ?? null, to: x.to_id ? by.get(String(x.to_id)) ?? null : null,
    circle: x.circle_id ? { id: String(x.circle_id), name: x.circle_name as string } : null,
    myAnswer: (x.my_answer as "yes" | "no" | null) ?? null, yes: Number(x.yes),
  }));
}

// ---------- nudges ----------
export const NUDGE_KINDS = ["miss_you", "together_today", "dua_ease", "well_done", "keep_streak"] as const;
export type NudgeKind = (typeof NUDGE_KINDS)[number];
export const NUDGE_RECEIVE_PER_DAY = 3;
export const NUDGE_SEND_PER_DAY = 10;

/** shares a (non-suspended, member) circle with the other member */
export async function shareCircle(a: number, b: number, circleId?: number | null) {
  const r = await pool()!.query(
    `SELECT m1.circle_id FROM together_circle_members m1 JOIN together_circle_members m2 ON m2.circle_id = m1.circle_id AND m2.user_id = $2 AND m2.status = 'member'
       JOIN together_circles ci ON ci.id = m1.circle_id AND ci.suspended_at IS NULL
      WHERE m1.user_id = $1 AND m1.status = 'member' ${circleId ? "AND m1.circle_id = $3" : ""} LIMIT 1`,
    circleId ? [a, b, circleId] : [a, b],
  );
  return r.rows[0] ? Number(r.rows[0].circle_id) : null;
}

export async function inbox(meId: number) {
  const p = pool()!;
  const n = await p.query(
    `SELECT n.id, n.kind, n.created_at, n.read_at, n.circle_id, ci.name AS circle_name, ${PROFILE_COLS}
       FROM together_nudges n JOIN community_profiles c ON c.user_id = n.from_id
       LEFT JOIN together_circles ci ON ci.id = n.circle_id
      WHERE n.to_id = $1 AND n.created_at > now() - interval '14 days' AND NOT c.suspended AND ${NOT_BLOCKED("n.from_id")} AND ci.suspended_at IS NULL
      ORDER BY n.id DESC LIMIT 30`,
    [meId],
  );
  const nudges = n.rows.map((x) => ({ id: String(x.id), kind: x.kind as NudgeKind, at: x.created_at, read: !!x.read_at, circle: x.circle_id ? { id: String(x.circle_id), name: x.circle_name as string } : null, from: card(x) }));
  const all = await challenges(meId);
  const chal = all.filter((c) => c.status === "pending" && !c.fromMe);
  const inv = (await invites(meId)).filter((i) => !i.mine && !i.myAnswer && new Date(i.at).getTime() > Date.now());
  const joins = (await p.query(
    `SELECT count(*)::int AS n FROM together_circle_members m
       JOIN together_circle_members l ON l.circle_id = m.circle_id AND l.user_id = $1 AND l.role = 'leader'
       JOIN together_circles ci ON ci.id = m.circle_id AND ci.suspended_at IS NULL
       JOIN community_profiles c ON c.user_id = m.user_id AND NOT c.suspended
      WHERE m.status = 'pending' AND ${NOT_BLOCKED("m.user_id")}`,
    [meId],
  )).rows[0].n as number;
  const unread = nudges.filter((x) => !x.read).length + chal.length + inv.length + Number(joins);
  return { nudges, challenges: chal, invites: inv, joinRequests: Number(joins), unread };
}

// ---------- community goals ----------
export const monthKey = (d = new Date()) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
/** round milestones the community aims for (a target, never a claim) */
export const MILESTONES = [100, 250, 500, 1000, 2500, 5000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];
export const nextMilestone = (n: number) => MILESTONES.find((m) => m > n) ?? Math.ceil((n + 1) / 1_000_000) * 1_000_000;
const g = globalThis as unknown as { __togetherBase?: Map<string, number>; __togetherCache?: Map<string, { at: number; data: unknown }>; __togetherPrune?: number };

/** the month's base (verses when first seen this month) of members who count; at most every 5 minutes per month */
async function fillMonthBase(month: string) {
  const seen = (g.__togetherBase ??= new Map());
  if (Date.now() - (seen.get(month) ?? 0) < 5 * 60_000) return;
  seen.set(month, Date.now());
  for (const k of seen.keys()) if (k !== month) seen.delete(k);
  await pool()!.query(
    `INSERT INTO together_month_base (month, user_id, verses)
     SELECT $1, c.user_id, c.memorised_verses FROM community_profiles c JOIN together_settings s ON s.user_id = c.user_id AND s.community
     ON CONFLICT (month, user_id) DO NOTHING`,
    [month],
  );
}

type BestInternal = ReturnType<typeof card> & { rank: number; verses: number; uid: string };
/** sums of verses memorised this month by members who count for their country, and the best learners (best_list).
 *  The figures are cached per month and country for a minute (the same for every viewer); members the viewer blocked,
 *  or who blocked the viewer, are then left out of the lists. */
export async function community(meId: number, country: string | null) {
  const month = monthKey();
  const key = `${month}:${country ?? ""}`;
  const cache = (g.__togetherCache ??= new Map());
  const hit = cache.get(key);
  let data: Awaited<ReturnType<typeof compute>>;
  if (hit && Date.now() - hit.at < 60_000) data = hit.data as typeof data;
  else {
    await fillMonthBase(month);
    void pruneTogether();
    data = await compute(country, month);
    if (cache.size > 300) cache.clear();
    cache.set(key, { at: Date.now(), data });
  }
  const blocked = new Set((await pool()!.query(
    "SELECT blocked_id AS id FROM community_blocks WHERE blocker_id = $1 UNION SELECT blocker_id FROM community_blocks WHERE blocked_id = $1", [meId],
  )).rows.map((x) => String(x.id)));
  const clean = (rows: BestInternal[]) => rows.filter((r) => !blocked.has(r.uid)).slice(0, 5).map(({ uid: _u, ...r }, i) => ({ ...r, rank: i + 1 }));
  return { ...data, best: { world: clean(data.best.world), country: clean(data.best.country) } };
}

async function compute(country: string | null, month: string) {
  const p = pool()!;
  const GAIN = "GREATEST(0, c.memorised_verses - b.verses)";
  const FROM = `FROM community_profiles c JOIN together_settings s ON s.user_id = c.user_id AND s.community
                JOIN together_month_base b ON b.user_id = c.user_id AND b.month = $1
               WHERE NOT c.suspended AND ${AGE16("c.user_id")}`;
  const world = (await p.query(`SELECT COALESCE(sum(${GAIN}),0)::int AS verses, count(*) FILTER (WHERE ${GAIN} > 0)::int AS learners ${FROM}`, [month])).rows[0];
  const countries = (await p.query(
    `SELECT c.country, COALESCE(sum(${GAIN}),0)::int AS verses, count(*) FILTER (WHERE ${GAIN} > 0)::int AS learners ${FROM} AND c.country IS NOT NULL AND c.country <> ''
      GROUP BY c.country HAVING sum(${GAIN}) > 0 ORDER BY verses DESC LIMIT 10`,
    [month],
  )).rows.map((x) => ({ country: x.country as string, verses: Number(x.verses), learners: Number(x.learners) }));
  // 15 candidates, so five remain after the viewer's blocks are taken out
  const best = async (cc: string | null): Promise<BestInternal[]> => (await p.query(
    `SELECT ${PROFILE_COLS}, ${GAIN} AS gain ${FROM} AND s.best_list AND c.public AND ${GAIN} > 0 ${cc ? "AND c.country = $2" : ""}
      ORDER BY gain DESC, c.username LIMIT 15`,
    cc ? [month, cc] : [month],
  )).rows.map((x, i) => ({ rank: i + 1, ...card(x), verses: Number(x.gain), uid: String(x.user_id) }));
  let mine = null as null | { verses: number; learners: number };
  if (country) {
    const r = (await p.query(`SELECT COALESCE(sum(${GAIN}),0)::int AS verses, count(*) FILTER (WHERE ${GAIN} > 0)::int AS learners ${FROM} AND c.country = $2`, [month, country])).rows[0];
    mine = { verses: Number(r.verses), learners: Number(r.learners) };
  }
  const wv = Number(world.verses);
  return {
    month,
    world: { verses: wv, learners: Number(world.learners), goal: nextMilestone(wv) },
    country: country && mine ? { code: country, ...mine, goal: nextMilestone(mine.verses) } : null,
    countries,
    best: { world: await best(null), country: country ? await best(country) : [] },
  };
}

/** retention (no cron on this server; run lazily at most once a day per process): week numbers and circle weeks older
 *  than a year, month bases older than 13 months, nudges older than 60 days, ended challenges and past sessions older
 *  than a year */
export async function pruneTogether() {
  if (g.__togetherPrune && Date.now() - g.__togetherPrune < 86_400_000) return;
  g.__togetherPrune = Date.now();
  const p = pool()!;
  const yearAgo = mondayDay() - 371;
  const d = new Date(); d.setUTCMonth(d.getUTCMonth() - 13);
  try {
    await p.query("DELETE FROM together_week_xp WHERE week_monday < $1", [yearAgo]);
    await p.query("DELETE FROM together_circle_weeks WHERE week_monday < $1", [yearAgo]);
    await p.query("DELETE FROM together_month_base WHERE month < $1", [monthKey(d)]);
    await p.query("DELETE FROM together_nudges WHERE created_at < now() - interval '60 days'");
    await p.query("DELETE FROM together_challenges WHERE status IN ('declined','cancelled','ended') AND created_at < now() - interval '1 year'");
    await p.query("DELETE FROM together_invites WHERE at < now() - interval '1 year'");
  } catch { g.__togetherPrune = 0; }
}

// ---------- read-only summary (AI tutor, profile statistics) ----------
/** where the member stands today in "Together", for encouraging and honest nudges by the AI tutor (own data only;
 *  other members appear only as counts or first names of friends who share their activity). Never stored by the tutor. */
export async function togetherSummary(meId: number) {
  const p = pool()!;
  const s = await settingsOf(meId);
  const own = (await p.query(`SELECT c.streak_days, ${LEARNED_TODAY()} AS today, ${WEEK_XP()} AS week_xp, ${WEEK_ACTIVE()} AS week_active FROM community_profiles c WHERE c.user_id = $1`, [meId])).rows[0];
  const friends = await friendsToday(meId, 30);
  const circles = (await myCircles(meId)).filter((c) => c.status === "member" && !c.suspended)
    .map((c) => ({ id: c.id, name: c.name, goalKind: c.goalKind, goal: c.goal, progress: c.progress, reached: c.reached, groupStreak: c.streak, members: c.members }));
  let lg: null | { tier: number; rank: number | null; size: number; daysLeft: number; last: string | null; aheadXp: number | null } = null;
  if (s.league) {
    const l = await league(meId);
    const i = l.rows.findIndex((r) => r.me);
    lg = { tier: l.tier, rank: i >= 0 ? i + 1 : null, size: l.rows.length, daysLeft: l.daysLeft, last: l.last?.result ?? null, aheadXp: i > 0 ? l.rows[i - 1].xp - l.rows[i].xp : null };
  }
  const ch = (await challenges(meId)).filter((c) => c.status === "active")
    .map((c) => ({ kind: c.kind, target: c.target, mine: c.mine, theirs: c.theirs, goal: c.goal, with: c.other.name, endsAt: c.endsAt }));
  const inv = (await invites(meId)).filter((i) => new Date(i.at).getTime() > Date.now() && new Date(i.at).getTime() < Date.now() + 86_400_000 && (i.mine || i.myAnswer === "yes"))
    .map((i) => ({ topic: i.topic, surah: i.surah, at: i.at }));
  return {
    streak: Number(own?.streak_days ?? 0), learnedToday: !!own?.today, weekXp: Number(own?.week_xp ?? 0), weekActiveDays: Number(own?.week_active ?? 0),
    friends: { sharing: friends.sharing, learnedToday: friends.learnedToday, keptStreak: friends.keptStreak, names: friends.list.filter((f) => f.today).slice(0, 5).map((f) => f.name.split(" ")[0]) },
    circles, league: lg, challenges: ch, sessionsToday: inv, rankChange: await rankChange(meId), settings: s,
  };
}

/** the change of the own place on the weekly world XP board since the last day it was seen (career boards) */
async function rankChange(meId: number): Promise<{ rank: number | null; prev: number | null; change: number | null } | null> {
  try {
    const { placesOf } = await import("./careerStats");
    const places = await placesOf(meId);
    const rank = places?.xp_week?.rank ?? null;
    const p = pool()!;
    const d = today();
    const row = (await p.query("SELECT * FROM together_rank_seen WHERE user_id = $1", [meId])).rows[0];
    if (!row) await p.query("INSERT INTO together_rank_seen (user_id, day, rank) VALUES ($1,$2,$3) ON CONFLICT (user_id) DO NOTHING", [meId, d, rank]);
    else if (Number(row.day) < d) await p.query("UPDATE together_rank_seen SET prev_day = day, prev_rank = rank, day = $2, rank = $3 WHERE user_id = $1", [meId, d, rank]);
    else await p.query("UPDATE together_rank_seen SET rank = $2 WHERE user_id = $1", [meId, rank]);
    const prev = row ? (Number(row.day) < d ? (row.rank === null ? null : Number(row.rank)) : row.prev_rank === null ? null : Number(row.prev_rank)) : null;
    return { rank, prev, change: rank !== null && prev !== null ? prev - rank : null };
  } catch { return null; }
}

/** Together figures for the profile statistics ("Statistik"): the own record, or a friend's when that friend takes part
 *  (league tier only with the league on, circles only as counts). null when there is nothing to show. */
export async function togetherStatsOf(viewerId: number, username: string) {
  const p = pool()!;
  const u = (await p.query(`SELECT c.user_id FROM community_profiles c WHERE c.username = $2 AND NOT c.suspended AND (c.user_id = $1 OR (${OTHER_OK("c.user_id")} AND ${FRIEND("c.user_id")}))`, [viewerId, username.toLowerCase().slice(0, 40)])).rows[0];
  if (!u) return null;
  const id = Number(u.user_id);
  const s = await settingsOf(id);
  const lg = s.league ? (await p.query("SELECT tier, best_tier FROM together_league WHERE user_id = $1", [id])).rows[0] : null;
  // circle figures only for the owner, or when the friend takes part in circles
  const showCircles = id === viewerId || s.circles;
  const circles = showCircles ? (await p.query("SELECT count(*)::int AS n FROM together_circle_members m JOIN together_circles ci ON ci.id = m.circle_id AND ci.suspended_at IS NULL WHERE m.user_id = $1 AND m.status = 'member'", [id])).rows[0].n : null;
  const weeks = showCircles ? (await p.query(
    `SELECT count(*)::int AS n FROM together_circle_weeks w JOIN together_circle_members m ON m.circle_id = w.circle_id AND m.user_id = $1 AND m.status = 'member'
       JOIN together_circles ci ON ci.id = w.circle_id AND ci.suspended_at IS NULL WHERE w.reached`, [id],
  )).rows[0].n : null;
  const done = (await p.query(
    "SELECT count(*)::int AS n FROM together_challenges WHERE (from_id = $1 AND from_done_at IS NOT NULL) OR (to_id = $1 AND to_done_at IS NOT NULL)", [id],
  )).rows[0].n;
  return {
    own: id === viewerId,
    league: lg ? { tier: Number(lg.tier), bestTier: Number(lg.best_tier) } : null,
    circles: circles === null ? null : Number(circles), circleWeeksReached: weeks === null ? null : Number(weeks), challengesDone: s.challenges || id === viewerId ? Number(done) : null,
  };
}
