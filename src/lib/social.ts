import crypto from "node:crypto";
import { pool } from "./db";
import { mondayDay } from "./communityProfiles";
import { moderate } from "./moderation";
import { NOT_BLOCKED, PROFILE_COLS, REPORT_CATEGORIES, card } from "./talents";
import { AGE16, FRIEND, membership, circleRow, snapshot } from "./together";
import { MUT_GROUPS } from "./learn/shams2/mutData";

// Together social 2 (owner 22.10.2026): khatm groups, a live halaqa (text and presence only, no voice), the weekly
// recap card, mutashabihat duels between two friends, teacher classes with moderated announcements and the friends'
// milestone feed. Rules: 16+ on both sides (route gate plus AGE16 in SQL), opt-in (social_settings, per-group consent),
// no free text between members (the only text is a teacher's announcement, run through moderate()), nothing staked,
// no randomness that rewards, blocked members are hidden everywhere, groups and posts can be reported.
// Endpoints: src/app/api/together/social/[...path]/route.ts. Clients: mobile/src/features/social, src/components/together/SocialWeb.tsx.

const p = () => pool()!;
export class SocialError extends Error { constructor(public code: string, public status = 400) { super(code); } }
function fail(code: string, status = 400): never { throw new SocialError(code, status); }
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newCode = () => Array.from(crypto.randomBytes(8), (b) => ALPHA[b % ALPHA.length]).join("");
const normCode = (c: unknown) => (typeof c === "string" ? c.toUpperCase().replace(/[^A-Z0-9]/g, "") : "");
const fmt = (c: string) => `${c.slice(0, 4)}-${c.slice(4)}`;
const cleanName = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, 40) : "");
const intOf = (v: unknown) => { const n = Number(v); return Number.isSafeInteger(n) ? n : NaN; };
type Row = Record<string, unknown>;

/** cards of these members as seen by `meId` (suspended and blocked ones left out) */
async function cards(meId: number, ids: (number | string)[]) {
  const out = new Map<string, ReturnType<typeof card>>();
  if (!ids.length) return out;
  const r = await p().query(
    `SELECT ${PROFILE_COLS} FROM community_profiles c WHERE c.user_id = ANY($2::bigint[]) AND NOT c.suspended AND (c.user_id = $1 OR ${NOT_BLOCKED("c.user_id")})`,
    [meId, [...new Set(ids.map(String))]],
  );
  for (const x of r.rows) out.set(String(x.user_id), card(x));
  return out;
}
async function userByName(meId: number, username: unknown) {
  if (typeof username !== "string") return null;
  const r = await p().query(
    `SELECT c.user_id FROM community_profiles c WHERE c.username = $2 AND NOT c.suspended AND c.user_id <> $1 AND ${AGE16("c.user_id")} AND ${NOT_BLOCKED("c.user_id")}`,
    [meId, username.toLowerCase().slice(0, 40)],
  );
  return r.rows[0] ? Number(r.rows[0].user_id) : null;
}
async function isFriend(meId: number, other: number) {
  return !!(await p().query(`SELECT ${FRIEND("$2::bigint")} AS f`, [meId, other])).rows[0]?.f;
}
async function report(meId: number, reportedId: number, type: string, targetId: number, label: string, b: Row) {
  const category = typeof b.category === "string" && REPORT_CATEGORIES.includes(b.category) ? b.category : "other";
  const reason = `[${label}] ${typeof b.reason === "string" ? b.reason.trim().slice(0, 300) : ""}`.trim();
  const dup = await p().query("SELECT 1 FROM community_reports WHERE reporter_id = $1 AND target_type = $2 AND target_id = $3 AND status = 'open'", [meId, type, targetId]);
  if (!dup.rows[0]) await p().query("INSERT INTO community_reports (reporter_id, reported_id, reason, category, target_type, target_id) VALUES ($1,$2,$3,$4,$5,$6)", [meId, reportedId, reason, category, type, targetId]);
  return { reported: true };
}

// ---------- settings ----------
export type SocialSettings = { feed: boolean; duels: boolean; suggest: boolean; views: boolean };
export async function settings(meId: number): Promise<SocialSettings> {
  const r = (await p().query("SELECT feed, duels, suggest, views FROM social_settings WHERE user_id = $1", [meId])).rows[0];
  return { feed: !!r?.feed, duels: !!r?.duels, suggest: !!r?.suggest, views: !!r?.views };
}
export async function saveSettings(meId: number, b: Row) {
  const cur = await settings(meId);
  for (const k of ["feed", "duels", "suggest", "views"] as const) if (typeof b[k] === "boolean") cur[k] = b[k] as boolean;
  await p().query(
    `INSERT INTO social_settings (user_id, feed, duels, suggest, views) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (user_id) DO UPDATE SET feed = $2, duels = $3, suggest = $4, views = $5, updated_at = now()`,
    [meId, cur.feed, cur.duels, cur.suggest, cur.views],
  );
  return cur;
}
const SOCIAL = (f: "feed" | "duels" | "suggest" | "views", col: string) => `EXISTS (SELECT 1 FROM social_settings ss WHERE ss.user_id = ${col} AND ss.${f})`;

// ---------- feed of milestones ----------
export const EVENT_KINDS = ["surah", "khatm", "juz", "class_week"] as const;
async function addEvent(userId: number, kind: (typeof EVENT_KINDS)[number], ref: string) {
  await p().query("INSERT INTO social_events (user_id, kind, ref) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING", [userId, kind, ref.slice(0, 40)]);
}
/** the member reports a finished surah (only stored when the member shares milestones) */
export async function reportSurah(meId: number, surah: unknown) {
  const n = intOf(surah);
  if (!(n >= 1 && n <= 114)) fail("bad_request");
  if (!(await settings(meId)).feed) return { stored: false };
  await addEvent(meId, "surah", String(n));
  return { stored: true };
}
export async function feed(meId: number) {
  const r = await p().query(
    `SELECT e.id, e.user_id, e.kind, e.ref, e.created_at, (e.user_id = $1) AS own,
            (SELECT count(*)::int FROM social_event_reactions x WHERE x.event_id = e.id) AS mashallah,
            EXISTS (SELECT 1 FROM social_event_reactions x WHERE x.event_id = e.id AND x.user_id = $1) AS mine
       FROM social_events e JOIN community_profiles c ON c.user_id = e.user_id
      WHERE e.created_at > now() - interval '30 days' AND NOT c.suspended AND ${SOCIAL("feed", "e.user_id")}
        AND (e.user_id = $1 OR (${AGE16("e.user_id")} AND ${NOT_BLOCKED("e.user_id")} AND ${FRIEND("e.user_id")}))
      ORDER BY e.created_at DESC LIMIT 60`,
    [meId],
  );
  const cs = await cards(meId, r.rows.map((x) => x.user_id as string));
  return {
    settings: await settings(meId),
    events: r.rows.filter((x) => cs.has(String(x.user_id))).map((x) => ({
      id: String(x.id), kind: x.kind as string, ref: x.ref as string, at: (x.created_at as Date).toISOString(), own: !!x.own,
      mashallah: Number(x.mashallah), mine: !!x.mine, author: cs.get(String(x.user_id))!,
    })),
  };
}
export async function react(meId: number, eventId: number, on: boolean) {
  const ok = (await p().query(
    `SELECT 1 FROM social_events e WHERE e.id = $2 AND e.user_id <> $1 AND ${SOCIAL("feed", "e.user_id")} AND ${NOT_BLOCKED("e.user_id")} AND ${FRIEND("e.user_id")}`,
    [meId, eventId],
  )).rows[0];
  if (!ok) fail("not_found", 404);
  if (on) await p().query("INSERT INTO social_event_reactions (event_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [eventId, meId]);
  else await p().query("DELETE FROM social_event_reactions WHERE event_id = $1 AND user_id = $2", [eventId, meId]);
  return { ok: true };
}

// ---------- khatm groups ----------
export const INTENTIONS = ["general", "ramadan", "deceased", "sick", "family", "ummah"] as const;
const KHATM_MAX_MEMBERS = 30;
const KHATM_MAX_OPEN = 5;
const KHATM_MAX_CLAIMS = 5;

export async function khatms(meId: number) {
  const r = await p().query(
    `SELECT k.id, k.name, k.intention, k.completed_at, k.suspended_at, (k.owner_id = $1) AS owner,
            (SELECT count(*)::int FROM social_khatm_parts x WHERE x.khatm_id = k.id AND x.done_at IS NOT NULL) AS done,
            (SELECT count(*)::int FROM social_khatm_parts x WHERE x.khatm_id = k.id AND x.user_id IS NOT NULL AND x.done_at IS NULL) AS claimed,
            (SELECT count(*)::int FROM social_khatm_members x WHERE x.khatm_id = k.id) AS members,
            (SELECT array_agg(x.juz ORDER BY x.juz) FROM social_khatm_parts x WHERE x.khatm_id = k.id AND x.user_id = $1 AND x.done_at IS NULL) AS mine
       FROM social_khatms k JOIN social_khatm_members m ON m.khatm_id = k.id AND m.user_id = $1
      ORDER BY k.completed_at IS NOT NULL, k.created_at DESC LIMIT 30`,
    [meId],
  );
  return r.rows.map((x) => ({
    id: String(x.id), name: x.name as string, intention: x.intention as string, owner: !!x.owner, completed: !!x.completed_at, suspended: !!x.suspended_at,
    done: Number(x.done), claimed: Number(x.claimed), members: Number(x.members), mine: ((x.mine as number[] | null) ?? []).map(Number),
  }));
}
export async function createKhatm(meId: number, b: Row) {
  const name = cleanName(b.name);
  if (name.length < 2) fail("name");
  const mod = await moderate(name);
  if (!mod.ok) fail("moderation");
  const intention = INTENTIONS.includes(b.intention as (typeof INTENTIONS)[number]) ? (b.intention as string) : "general";
  let circleId: number | null = null;
  if (b.circleId !== undefined && b.circleId !== null) {
    const cid = intOf(b.circleId);
    const m = Number.isSafeInteger(cid) ? await membership(cid, meId) : null;
    if (!m || m.status !== "member") fail("not_found", 404);
    circleId = cid;
  }
  const open = (await p().query("SELECT count(*)::int AS n FROM social_khatms WHERE owner_id = $1 AND completed_at IS NULL", [meId])).rows[0].n;
  if (open >= KHATM_MAX_OPEN) fail("limit_khatm");
  const c = await p().connect();
  try {
    await c.query("BEGIN");
    const k = (await c.query("INSERT INTO social_khatms (name, owner_id, code, circle_id, intention) VALUES ($1,$2,$3,$4,$5) RETURNING id", [name, meId, newCode(), circleId, intention])).rows[0];
    await c.query("INSERT INTO social_khatm_members (khatm_id, user_id) VALUES ($1,$2)", [k.id, meId]);
    await c.query("INSERT INTO social_khatm_parts (khatm_id, juz) SELECT $1, g FROM generate_series(1,30) g", [k.id]);
    if (circleId) {
      // members of the circle are added (they agreed to the circle; they can leave the khatm at any time)
      await c.query(
        `INSERT INTO social_khatm_members (khatm_id, user_id)
         SELECT $1, m.user_id FROM together_circle_members m WHERE m.circle_id = $2 AND m.status = 'member' LIMIT $3
         ON CONFLICT DO NOTHING`,
        [k.id, circleId, KHATM_MAX_MEMBERS],
      );
    }
    await c.query("COMMIT");
    return { id: String(k.id) };
  } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; } finally { c.release(); }
}
export async function joinKhatm(meId: number, b: Row) {
  if (b.consent !== true) fail("consent_required");
  const code = normCode(b.code);
  const k = (await p().query(`SELECT k.id, k.owner_id FROM social_khatms k WHERE k.code = $2 AND k.suspended_at IS NULL AND k.completed_at IS NULL AND ${NOT_BLOCKED("k.owner_id")}`, [meId, code])).rows[0];
  if (!k) fail("not_found", 404);
  const n = (await p().query("SELECT count(*)::int AS n FROM social_khatm_members WHERE khatm_id = $1", [k.id])).rows[0].n;
  if (n >= KHATM_MAX_MEMBERS) fail("full");
  await p().query("INSERT INTO social_khatm_members (khatm_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [k.id, meId]);
  return { id: String(k.id) };
}
async function khatmFor(meId: number, id: number) {
  const k = (await p().query(
    "SELECT k.* FROM social_khatms k JOIN social_khatm_members m ON m.khatm_id = k.id AND m.user_id = $2 WHERE k.id = $1",
    [id, meId],
  )).rows[0];
  if (!k) fail("not_found", 404);
  return k as Row & { id: string; owner_id: string; completed_at: Date | null; suspended_at: Date | null; code: string; name: string };
}
export async function khatmDetail(meId: number, id: number) {
  const k = await khatmFor(meId, id);
  const parts = (await p().query("SELECT juz, user_id, done_at FROM social_khatm_parts WHERE khatm_id = $1 ORDER BY juz", [id])).rows;
  const mem = (await p().query("SELECT user_id FROM social_khatm_members WHERE khatm_id = $1 ORDER BY joined_at", [id])).rows;
  const cs = await cards(meId, [...mem.map((x) => x.user_id), ...parts.filter((x) => x.user_id).map((x) => x.user_id)]);
  return {
    id: String(k.id), name: k.name, intention: k.intention as string, owner: String(k.owner_id) === String(meId),
    code: k.suspended_at ? null : fmt(k.code), completed: !!k.completed_at, completedAt: k.completed_at ? k.completed_at.toISOString() : null, suspended: !!k.suspended_at,
    parts: parts.map((x) => ({
      juz: Number(x.juz), state: x.done_at ? "done" : x.user_id ? "claimed" : "open", mine: String(x.user_id) === String(meId),
      by: x.user_id ? cs.get(String(x.user_id)) ?? null : null, // blocked members show as anonymous
    })),
    members: mem.map((x) => cs.get(String(x.user_id))).filter(Boolean),
  };
}
export async function khatmAction(meId: number, id: number, b: Row) {
  const k = await khatmFor(meId, id);
  const action = String(b.action ?? "");
  if (action === "report") return report(meId, Number(k.owner_id), "khatm", id, `Khatm "${k.name}"`, b);
  if (action === "leave") {
    await p().query("UPDATE social_khatm_parts SET user_id = NULL, claimed_at = NULL WHERE khatm_id = $1 AND user_id = $2 AND done_at IS NULL", [id, meId]);
    await p().query("DELETE FROM social_khatm_members WHERE khatm_id = $1 AND user_id = $2", [id, meId]);
    if (String(k.owner_id) === String(meId)) {
      const next = (await p().query("SELECT user_id FROM social_khatm_members WHERE khatm_id = $1 ORDER BY joined_at LIMIT 1", [id])).rows[0];
      if (next) await p().query("UPDATE social_khatms SET owner_id = $2 WHERE id = $1", [id, next.user_id]);
      else await p().query("DELETE FROM social_khatms WHERE id = $1", [id]);
    }
    return { ok: true };
  }
  if (k.suspended_at) fail("under_review");
  if (k.completed_at) fail("completed");
  if (action === "remove") {
    if (String(k.owner_id) !== String(meId)) fail("not_found", 404);
    const other = await userByName(meId, b.username);
    if (!other) fail("not_found", 404);
    await p().query("UPDATE social_khatm_parts SET user_id = NULL, claimed_at = NULL WHERE khatm_id = $1 AND user_id = $2 AND done_at IS NULL", [id, other]);
    await p().query("DELETE FROM social_khatm_members WHERE khatm_id = $1 AND user_id = $2", [id, other]);
    return { ok: true };
  }
  const juz = intOf(b.juz);
  if (!(juz >= 1 && juz <= 30)) fail("bad_request");
  if (action === "claim") {
    const n = (await p().query("SELECT count(*)::int AS n FROM social_khatm_parts WHERE khatm_id = $1 AND user_id = $2 AND done_at IS NULL", [id, meId])).rows[0].n;
    if (n >= KHATM_MAX_CLAIMS) fail("limit_claims");
    const r = await p().query("UPDATE social_khatm_parts SET user_id = $3, claimed_at = now() WHERE khatm_id = $1 AND juz = $2 AND user_id IS NULL RETURNING juz", [id, juz, meId]);
    if (!r.rows[0]) fail("taken", 409);
  } else if (action === "release") {
    await p().query("UPDATE social_khatm_parts SET user_id = NULL, claimed_at = NULL WHERE khatm_id = $1 AND juz = $2 AND user_id = $3 AND done_at IS NULL", [id, juz, meId]);
  } else if (action === "done") {
    const r = await p().query("UPDATE social_khatm_parts SET done_at = now() WHERE khatm_id = $1 AND juz = $2 AND user_id = $3 AND done_at IS NULL RETURNING juz", [id, juz, meId]);
    if (!r.rows[0]) fail("not_found", 404);
    await addEvent(meId, "juz", `${id}:${juz}`);
    const fin = await p().query(
      `UPDATE social_khatms SET completed_at = now() WHERE id = $1 AND completed_at IS NULL
         AND NOT EXISTS (SELECT 1 FROM social_khatm_parts x WHERE x.khatm_id = $1 AND x.done_at IS NULL) RETURNING id`,
      [id],
    );
    if (fin.rows[0]) {
      const ms = (await p().query("SELECT user_id FROM social_khatm_members WHERE khatm_id = $1", [id])).rows;
      for (const m of ms) await addEvent(Number(m.user_id), "khatm", String(id));
    }
  } else fail("bad_request");
  return khatmDetail(meId, id);
}

// ---------- live halaqa (text and presence only) ----------
const PRESENT_SECONDS = 25;
async function halaqaMember(meId: number, circleId: number) {
  const ci = await circleRow(circleId);
  const m = ci && !ci.suspended_at ? await membership(circleId, meId) : null;
  if (!ci || !m || m.status !== "member") fail("not_found", 404);
  return { ci: ci!, leader: m!.role === "leader" };
}
export async function halaqa(meId: number, circleId: number) {
  const { ci, leader } = await halaqaMember(meId, circleId);
  const h = (await p().query("SELECT * FROM social_halaqa WHERE circle_id = $1 AND ended_at IS NULL AND updated_at > now() - interval '3 hours'", [circleId])).rows[0];
  if (!h) return { live: false, canStart: leader, circle: { id: String(ci.id), name: ci.name as string } };
  await p().query(
    `INSERT INTO social_halaqa_presence (circle_id, user_id, seen_at) VALUES ($1,$2, now())
     ON CONFLICT (circle_id, user_id) DO UPDATE SET seen_at = now()`,
    [circleId, meId],
  );
  const pr = (await p().query(
    `SELECT user_id, hand_at FROM social_halaqa_presence WHERE circle_id = $1 AND seen_at > now() - make_interval(secs => $2) ORDER BY hand_at NULLS LAST, user_id`,
    [circleId, PRESENT_SECONDS],
  )).rows;
  const cs = await cards(meId, [...pr.map((x) => x.user_id), h.leader_id]);
  return {
    live: true, canStart: leader, leading: String(h.leader_id) === String(meId), circle: { id: String(ci.id), name: ci.name as string },
    leader: cs.get(String(h.leader_id)) ?? null, surah: Number(h.surah), ayah: Number(h.ayah), updatedAt: (h.updated_at as Date).toISOString(),
    present: pr.filter((x) => cs.has(String(x.user_id))).map((x) => ({ ...cs.get(String(x.user_id))!, me: String(x.user_id) === String(meId), hand: !!x.hand_at })),
    myHand: !!pr.find((x) => String(x.user_id) === String(meId))?.hand_at,
  };
}
export async function halaqaAction(meId: number, circleId: number, b: Row) {
  const { leader } = await halaqaMember(meId, circleId);
  const action = String(b.action ?? "");
  const live = (await p().query("SELECT leader_id FROM social_halaqa WHERE circle_id = $1 AND ended_at IS NULL", [circleId])).rows[0];
  const leading = live && String(live.leader_id) === String(meId);
  if (action === "start") {
    if (!leader) fail("not_found", 404);
    const s = intOf(b.surah), a = intOf(b.ayah);
    await p().query("DELETE FROM social_halaqa_presence WHERE circle_id = $1", [circleId]);
    await p().query(
      `INSERT INTO social_halaqa (circle_id, leader_id, surah, ayah) VALUES ($1,$2,$3,$4)
       ON CONFLICT (circle_id) DO UPDATE SET leader_id = $2, surah = $3, ayah = $4, started_at = now(), updated_at = now(), ended_at = NULL`,
      [circleId, meId, s >= 1 && s <= 114 ? s : 1, a >= 1 && a <= 286 ? a : 1],
    );
  } else if (action === "cursor") {
    if (!leading) fail("not_found", 404);
    const s = intOf(b.surah), a = intOf(b.ayah);
    if (!(s >= 1 && s <= 114 && a >= 1 && a <= 286)) fail("bad_request");
    await p().query("UPDATE social_halaqa SET surah = $2, ayah = $3, updated_at = now() WHERE circle_id = $1", [circleId, s, a]);
  } else if (action === "hand") {
    if (!live) fail("not_found", 404);
    await p().query("UPDATE social_halaqa_presence SET hand_at = CASE WHEN $3 THEN now() ELSE NULL END WHERE circle_id = $1 AND user_id = $2", [circleId, meId, b.up === true]);
  } else if (action === "lower") {
    if (!leading) fail("not_found", 404);
    const other = await userByName(meId, b.username);
    if (other) await p().query("UPDATE social_halaqa_presence SET hand_at = NULL WHERE circle_id = $1 AND user_id = $2", [circleId, other]);
  } else if (action === "end") {
    if (!leading && !leader) fail("not_found", 404);
    await p().query("UPDATE social_halaqa SET ended_at = now() WHERE circle_id = $1", [circleId]);
  } else fail("bad_request");
  return halaqa(meId, circleId);
}
/** circles of the member with a live halaqa right now (for the hub) */
export async function liveHalaqas(meId: number) {
  const r = await p().query(
    `SELECT c.id, c.name FROM social_halaqa h JOIN together_circles c ON c.id = h.circle_id
       JOIN together_circle_members m ON m.circle_id = c.id AND m.user_id = $1 AND m.status = 'member'
      WHERE h.ended_at IS NULL AND h.updated_at > now() - interval '3 hours' AND c.suspended_at IS NULL`,
    [meId],
  );
  return r.rows.map((x) => ({ id: String(x.id), name: x.name as string }));
}

// ---------- weekly recap ----------
export async function recap(meId: number) {
  await snapshot([meId]);
  const mon = mondayDay();
  const r = (await p().query(
    `SELECT c.streak_days, c.current_surah, c.display_name,
            w.xp, w.active, GREATEST(0, w.verses - w.verses_start) AS verses, w.week_monday
       FROM community_profiles c
       LEFT JOIN LATERAL (SELECT * FROM together_week_xp t WHERE t.user_id = c.user_id AND t.week_monday <= $2 ORDER BY t.week_monday DESC LIMIT 1) w ON true
      WHERE c.user_id = $1`,
    [meId, mon],
  )).rows[0];
  if (!r) fail("profile_required", 403);
  // rank in the member's circles by this week's XP (best place over all circles, only members who agreed to circles)
  const rk = (await p().query(
    `WITH mine AS (SELECT circle_id FROM together_circle_members WHERE user_id = $1 AND status = 'member'),
          ranks AS (
            SELECT m.circle_id, m.user_id, rank() OVER (PARTITION BY m.circle_id ORDER BY COALESCE(w.xp, 0) DESC) AS rk, count(*) OVER (PARTITION BY m.circle_id) AS n
              FROM together_circle_members m LEFT JOIN together_week_xp w ON w.user_id = m.user_id AND w.week_monday = $2
             WHERE m.circle_id IN (SELECT circle_id FROM mine) AND m.status = 'member')
     SELECT r.rk, r.n, c.name FROM ranks r JOIN together_circles c ON c.id = r.circle_id WHERE r.user_id = $1 AND r.n > 1 ORDER BY r.rk, r.n DESC LIMIT 1`,
    [meId, mon],
  )).rows[0];
  const khatm = (await p().query("SELECT count(*)::int AS n FROM social_khatm_parts WHERE user_id = $1 AND done_at > now() - interval '7 days'", [meId])).rows[0].n;
  return {
    week: Number(r.week_monday ?? mon), name: r.display_name as string,
    verses: Number(r.verses ?? 0), days: Number(r.active ?? 0), xp: Number(r.xp ?? 0), streak: Number(r.streak_days ?? 0),
    surah: r.current_surah ? Number(r.current_surah) : null, juz: Number(khatm),
    circle: rk ? { name: rk.name as string, rank: Number(rk.rk), of: Number(rk.n) } : null,
  };
}

// ---------- mutashabihat duels ----------
const DUEL_QUESTIONS = 6;
const DUEL_OPEN_MAX = 5;
function shuffle<T>(xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function pickQuestions() {
  const groups = shuffle(MUT_GROUPS).slice(0, DUEL_QUESTIONS);
  return groups.map((g) => {
    const key = g.keys[crypto.randomInt(g.keys.length)];
    const options = shuffle(g.keys);
    return { group: g.id, key, options };
  });
}
type DuelQ = { group: string; key: string; options: string[] };
export async function duels(meId: number) {
  await p().query("UPDATE social_duels SET status = 'expired' WHERE status = 'open' AND created_at < now() - interval '7 days' AND (from_id = $1 OR to_id = $1)", [meId]);
  const r = await p().query(
    `SELECT d.* FROM social_duels d WHERE (d.from_id = $1 OR d.to_id = $1) AND d.created_at > now() - interval '30 days'
       AND ${NOT_BLOCKED("CASE WHEN d.from_id = $1 THEN d.to_id ELSE d.from_id END")}
      ORDER BY d.status = 'open' DESC, d.created_at DESC LIMIT 30`,
    [meId],
  );
  const cs = await cards(meId, r.rows.map((x) => (String(x.from_id) === String(meId) ? x.to_id : x.from_id)));
  return {
    settings: await settings(meId),
    duels: r.rows.map((x) => {
      const fromMe = String(x.from_id) === String(meId);
      const mine = fromMe ? x.from_score : x.to_score;
      const theirs = fromMe ? x.to_score : x.from_score;
      const both = x.from_score !== null && x.to_score !== null;
      const qs = x.questions as DuelQ[];
      const myAns = (fromMe ? x.from_answers : x.to_answers) as string[] | null;
      return {
        id: String(x.id), fromMe, status: x.status as string, other: cs.get(String(fromMe ? x.to_id : x.from_id)) ?? null, total: qs.length,
        played: mine !== null, mine: mine === null ? null : Number(mine), theirs: both ? Number(theirs) : null, theyPlayed: theirs !== null,
        at: (x.created_at as Date).toISOString(),
        // the solution is only shown after one's own round
        review: myAns ? qs.map((q, i) => ({ key: q.key, answer: myAns[i] ?? null })) : null,
      };
    }).filter((d) => d.other),
  };
}
export async function createDuel(meId: number, b: Row) {
  if (!(await settings(meId)).duels) fail("feature_off");
  const other = await userByName(meId, b.username);
  if (!other || !(await isFriend(meId, other))) fail("not_found", 404);
  if (!(await settings(other!)).duels) fail("feature_off_other");
  const open = (await p().query("SELECT count(*)::int AS n FROM social_duels WHERE from_id = $1 AND status = 'open'", [meId])).rows[0].n;
  if (open >= DUEL_OPEN_MAX) fail("slow_down", 429);
  const pair = (await p().query("SELECT 1 FROM social_duels WHERE status = 'open' AND ((from_id = $1 AND to_id = $2) OR (from_id = $2 AND to_id = $1))", [meId, other])).rows[0];
  if (pair) fail("duel_open", 409);
  const d = (await p().query("INSERT INTO social_duels (from_id, to_id, questions) VALUES ($1,$2,$3) RETURNING id", [meId, other, JSON.stringify(pickQuestions())])).rows[0];
  return { id: String(d.id) };
}
async function duelFor(meId: number, id: number) {
  const d = (await p().query(
    `SELECT d.* FROM social_duels d WHERE d.id = $2 AND (d.from_id = $1 OR d.to_id = $1) AND ${NOT_BLOCKED("CASE WHEN d.from_id = $1 THEN d.to_id ELSE d.from_id END")}`,
    [meId, id],
  )).rows[0];
  if (!d) fail("not_found", 404);
  return d as Row;
}
/** the questions to play: verse key to show and the options as places (the same set for both sides) */
export async function duelQuestions(meId: number, id: number) {
  const d = await duelFor(meId, id);
  const fromMe = String(d.from_id) === String(meId);
  if (d.status !== "open" || (fromMe ? d.from_score : d.to_score) !== null) fail("played", 409);
  return { questions: (d.questions as DuelQ[]).map((q) => ({ show: q.key, options: q.options })) };
}
export async function duelAction(meId: number, id: number, b: Row) {
  const d = await duelFor(meId, id);
  const fromMe = String(d.from_id) === String(meId);
  const action = String(b.action ?? "");
  if (action === "decline") {
    if (fromMe || d.status !== "open") fail("bad_request");
    await p().query("UPDATE social_duels SET status = 'declined' WHERE id = $1", [id]);
    return { ok: true };
  }
  if (action === "cancel") {
    if (!fromMe || d.status !== "open" || d.to_score !== null) fail("bad_request");
    await p().query("DELETE FROM social_duels WHERE id = $1", [id]);
    return { ok: true };
  }
  if (action !== "answer") fail("bad_request");
  if (d.status !== "open") fail("played", 409);
  const qs = d.questions as DuelQ[];
  const ans = Array.isArray(b.answers) ? (b.answers as unknown[]).slice(0, qs.length).map((x) => (typeof x === "string" ? x.slice(0, 10) : "")) : null;
  if (!ans || ans.length !== qs.length) fail("bad_request");
  const score = qs.reduce((s, q, i) => s + (ans![i] === q.key ? 1 : 0), 0);
  const col = fromMe ? "from" : "to";
  const r = await p().query(
    `UPDATE social_duels SET ${col}_answers = $2, ${col}_score = $3,
       status = CASE WHEN ${fromMe ? "to_score" : "from_score"} IS NOT NULL THEN 'done' ELSE status END,
       done_at = CASE WHEN ${fromMe ? "to_score" : "from_score"} IS NOT NULL THEN now() ELSE done_at END
     WHERE id = $1 AND ${col}_score IS NULL RETURNING id`,
    [id, JSON.stringify(ans), score],
  );
  if (!r.rows[0]) fail("played", 409);
  return { score, total: qs.length };
}

// ---------- teacher classes ----------
const CLASS_KINDS = ["verses", "days", "xp"] as const;
const CLASS_MAX_MEMBERS = 40;
const CLASS_LIMITS: Record<(typeof CLASS_KINDS)[number], [number, number]> = { verses: [1, 300], days: [1, 7], xp: [50, 20_000] };
const POSTS_PER_DAY = 5;
export async function classes(meId: number) {
  const r = await p().query(
    `SELECT s.id, s.name, s.target_kind, s.target, s.suspended_at, (s.teacher_id = $1) AS teaching,
            (SELECT count(*)::int FROM social_class_members x WHERE x.class_id = s.id) AS members
       FROM social_classes s
      WHERE (s.teacher_id = $1 OR EXISTS (SELECT 1 FROM social_class_members m WHERE m.class_id = s.id AND m.user_id = $1))
        AND (s.teacher_id = $1 OR ${NOT_BLOCKED("s.teacher_id")})
      ORDER BY s.created_at DESC LIMIT 30`,
    [meId],
  );
  const role = (await p().query("SELECT role FROM community_profiles WHERE user_id = $1", [meId])).rows[0]?.role;
  return {
    canTeach: role === "teacher",
    classes: r.rows.map((x) => ({ id: String(x.id), name: x.name as string, teaching: !!x.teaching, targetKind: x.target_kind as string, target: Number(x.target), members: Number(x.members), suspended: !!x.suspended_at })),
  };
}
function target(b: Row) {
  const kind = CLASS_KINDS.includes(b.targetKind as (typeof CLASS_KINDS)[number]) ? (b.targetKind as (typeof CLASS_KINDS)[number]) : "verses";
  const n = intOf(b.target);
  const [lo, hi] = CLASS_LIMITS[kind];
  if (!(n >= lo && n <= hi)) fail("bad_target");
  return { kind, n };
}
export async function createClass(meId: number, b: Row) {
  const role = (await p().query("SELECT role FROM community_profiles WHERE user_id = $1", [meId])).rows[0]?.role;
  if (role !== "teacher") fail("teacher_only", 403);
  const name = cleanName(b.name);
  if (name.length < 2) fail("name");
  if (!(await moderate(name)).ok) fail("moderation");
  const t = target(b);
  const n = (await p().query("SELECT count(*)::int AS n FROM social_classes WHERE teacher_id = $1", [meId])).rows[0].n;
  if (n >= 10) fail("limit_class");
  const r = (await p().query("INSERT INTO social_classes (name, teacher_id, code, target_kind, target) VALUES ($1,$2,$3,$4,$5) RETURNING id", [name, meId, newCode(), t.kind, t.n])).rows[0];
  return { id: String(r.id) };
}
export async function joinClass(meId: number, b: Row) {
  if (b.consent !== true) fail("consent_required");
  const s = (await p().query(
    `SELECT s.id FROM social_classes s WHERE s.code = $2 AND s.suspended_at IS NULL AND s.teacher_id <> $1 AND ${NOT_BLOCKED("s.teacher_id")}`,
    [meId, normCode(b.code)],
  )).rows[0];
  if (!s) fail("not_found", 404);
  const n = (await p().query("SELECT count(*)::int AS n FROM social_class_members WHERE class_id = $1", [s.id])).rows[0].n;
  if (n >= CLASS_MAX_MEMBERS) fail("full");
  await p().query("INSERT INTO social_class_members (class_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [s.id, meId]);
  return { id: String(s.id) };
}
async function classFor(meId: number, id: number) {
  const s = (await p().query(
    `SELECT s.*, (s.teacher_id = $1) AS teaching FROM social_classes s WHERE s.id = $2
        AND (s.teacher_id = $1 OR (EXISTS (SELECT 1 FROM social_class_members m WHERE m.class_id = s.id AND m.user_id = $1) AND ${NOT_BLOCKED("s.teacher_id")}))`,
    [meId, id],
  )).rows[0];
  if (!s) fail("not_found", 404);
  return s as Row & { teaching: boolean; teacher_id: string; name: string; code: string; target_kind: string; target: number; suspended_at: Date | null };
}
const progressOf = (kind: string, w: Row | undefined) => (!w ? 0 : kind === "days" ? Number(w.active ?? 0) : kind === "xp" ? Number(w.xp ?? 0) : Math.max(0, Number(w.verses ?? 0) - Number(w.verses_start ?? 0)));
export async function classDetail(meId: number, id: number) {
  const s = await classFor(meId, id);
  const mon = mondayDay();
  const ids = (await p().query("SELECT user_id FROM social_class_members WHERE class_id = $1", [id])).rows.map((x) => x.user_id as string);
  const visible = s.teaching ? ids : [String(meId)];
  await snapshot(visible);
  const ws = new Map((await p().query("SELECT * FROM together_week_xp WHERE week_monday = $1 AND user_id = ANY($2::bigint[])", [mon, visible])).rows.map((w) => [String(w.user_id), w]));
  const cs = await cards(meId, [...visible, s.teacher_id]);
  const posts = (await p().query(
    `SELECT id, body, created_at, status FROM social_class_posts WHERE class_id = $1 AND (status = 'live' OR ($2 AND status = 'review')) ORDER BY created_at DESC LIMIT 20`,
    [id, s.teaching],
  )).rows;
  const target = Number(s.target);
  const members = visible.filter((u) => cs.has(String(u))).map((u) => {
    const v = progressOf(s.target_kind, ws.get(String(u)));
    return { ...cs.get(String(u))!, me: String(u) === String(meId), progress: v, reached: v >= target };
  }).sort((a, b) => Number(b.reached) - Number(a.reached) || a.name.localeCompare(b.name));
  // a member who reached the class target this week gets one milestone (only shown when they share milestones)
  for (const m of members) if (m.me && m.reached && !s.teaching) await addEvent(meId, "class_week", `${id}:${mon}`);
  return {
    id: String(s.id), name: s.name, teaching: !!s.teaching, suspended: !!s.suspended_at, code: s.teaching && !s.suspended_at ? fmt(s.code) : null,
    targetKind: s.target_kind, target, teacher: cs.get(String(s.teacher_id)) ?? null, memberCount: ids.length,
    members, posts: posts.map((x) => ({ id: String(x.id), body: x.body as string, at: (x.created_at as Date).toISOString(), review: x.status === "review" })),
  };
}
export async function classAction(meId: number, id: number, b: Row) {
  const s = await classFor(meId, id);
  const action = String(b.action ?? "");
  if (action === "report") {
    const pid = b.postId !== undefined ? intOf(b.postId) : null;
    if (pid !== null) {
      const ok = (await p().query("SELECT 1 FROM social_class_posts WHERE id = $1 AND class_id = $2", [pid, id])).rows[0];
      if (!ok) fail("not_found", 404);
      return report(meId, Number(s.teacher_id), "class_post", pid, `Class "${s.name}" announcement`, b);
    }
    return report(meId, Number(s.teacher_id), "class", id, `Class "${s.name}"`, b);
  }
  if (action === "leave") {
    if (s.teaching) fail("bad_request");
    await p().query("DELETE FROM social_class_members WHERE class_id = $1 AND user_id = $2", [id, meId]);
    return { ok: true };
  }
  if (!s.teaching) fail("not_found", 404);
  if (action === "delete") { await p().query("DELETE FROM social_classes WHERE id = $1", [id]); return { ok: true }; }
  if (s.suspended_at) fail("under_review");
  if (action === "remove") {
    const other = await userByName(meId, b.username);
    if (other) await p().query("DELETE FROM social_class_members WHERE class_id = $1 AND user_id = $2", [id, other]);
  } else if (action === "target") {
    const t = target(b);
    await p().query("UPDATE social_classes SET target_kind = $2, target = $3 WHERE id = $1", [id, t.kind, t.n]);
  } else if (action === "newCode") {
    await p().query("UPDATE social_classes SET code = $2 WHERE id = $1", [id, newCode()]);
  } else if (action === "post") {
    const body = typeof b.body === "string" ? b.body.trim() : "";
    const v = await moderate(body);
    if (!v.ok) fail(`mod_${v.reason}`);
    const n = (await p().query("SELECT count(*)::int AS n FROM social_class_posts WHERE class_id = $1 AND created_at > now() - interval '24 hours'", [id])).rows[0].n;
    if (n >= POSTS_PER_DAY) fail("slow_down", 429);
    const r = (await p().query("INSERT INTO social_class_posts (class_id, body, status) VALUES ($1,$2,$3) RETURNING id", [id, body, v.flagged ? "review" : "live"])).rows[0];
    // flagged words: into the moderation queue, hidden from members until a moderator decides
    if (v.flagged) await p().query("INSERT INTO community_reports (reporter_id, reported_id, reason, category, target_type, target_id) VALUES ($1,$1,$2,'other','class_post',$3)", [meId, `[auto] ${v.flagged}`, r.id]);
  } else if (action === "unpost") {
    await p().query("UPDATE social_class_posts SET status = 'removed' WHERE id = $1 AND class_id = $2", [intOf(b.postId), id]);
  } else fail("bad_request");
  return classDetail(meId, id);
}

// ---------- hub ----------
export async function hub(meId: number) {
  const [k, l, d, c, f] = await Promise.all([khatms(meId), liveHalaqas(meId), duels(meId), classes(meId), feed(meId)]);
  return { settings: d.settings, khatms: k, live: l, duels: d.duels.filter((x) => x.status === "open" || x.status === "done").slice(0, 6), classes: c, feed: f.events.slice(0, 20) };
}

// ---------- network: people you may know, endorsements, profile activity, anonymous view count ----------
// Connections themselves (connect, accept, ignore) stay on /api/community/connections. Suggestions only list members
// who opted in (suggest) to members who opted in; reasons are shared circles, country, level or study focus. Views are
// counted only for members who opted in (views) and only as a number, never with names.
export const SKILLS = ["tajweed", "hifz", "makharij", "surah"] as const;
const CONNECTED = (col: string) => `EXISTS (SELECT 1 FROM community_connections k WHERE k.status = 'accepted'
  AND ((k.requester_id = $1 AND k.addressee_id = ${col}) OR (k.addressee_id = $1 AND k.requester_id = ${col})))`;
const VIEWS_30 = "SELECT count(DISTINCT viewer_id)::int AS n FROM social_profile_views WHERE viewed_id = $1 AND day > (now() AT TIME ZONE 'UTC')::date - 30";

export async function network(meId: number) {
  const s = await settings(meId);
  const me = (await p().query("SELECT username FROM community_profiles WHERE user_id = $1", [meId])).rows[0];
  let suggestions: (ReturnType<typeof card> & { reason: string })[] = [];
  if (s.suggest) {
    const r = await p().query(
      `WITH mine AS (SELECT country, level, study_focus FROM community_profiles WHERE user_id = $1),
            circ AS (SELECT circle_id FROM together_circle_members WHERE user_id = $1 AND status = 'member')
       SELECT ${PROFILE_COLS},
              CASE WHEN EXISTS (SELECT 1 FROM together_circle_members m WHERE m.user_id = c.user_id AND m.status = 'member' AND m.circle_id IN (SELECT circle_id FROM circ)) THEN 'circle'
                   WHEN c.country IS NOT NULL AND c.country = (SELECT country FROM mine) THEN 'country'
                   WHEN c.study_focus <> '' AND c.study_focus = (SELECT study_focus FROM mine) THEN 'method'
                   ELSE 'level' END AS reason
         FROM community_profiles c
        WHERE c.user_id <> $1 AND c.public AND NOT c.suspended AND ${SOCIAL("suggest", "c.user_id")} AND ${AGE16("c.user_id")} AND ${NOT_BLOCKED("c.user_id")}
          AND NOT EXISTS (SELECT 1 FROM community_connections k WHERE (k.requester_id = $1 AND k.addressee_id = c.user_id) OR (k.addressee_id = $1 AND k.requester_id = c.user_id))
          AND (EXISTS (SELECT 1 FROM together_circle_members m WHERE m.user_id = c.user_id AND m.status = 'member' AND m.circle_id IN (SELECT circle_id FROM circ))
               OR c.country = (SELECT country FROM mine) OR c.level = (SELECT level FROM mine)
               OR (c.study_focus <> '' AND c.study_focus = (SELECT study_focus FROM mine)))
        ORDER BY reason = 'circle' DESC, reason = 'country' DESC, c.username LIMIT 12`,
      [meId],
    );
    suggestions = r.rows.map((x) => ({ ...card(x), reason: x.reason as string }));
  }
  const incoming = (await p().query(
    `SELECT count(*)::int AS n FROM community_connections k WHERE k.addressee_id = $1 AND k.status = 'pending' AND ${NOT_BLOCKED("k.requester_id")}`, [meId],
  )).rows[0].n;
  const views = s.views ? Number((await p().query(VIEWS_30, [meId])).rows[0].n) : null;
  return { settings: s, username: (me?.username as string) ?? null, suggestions, incoming: Number(incoming), views };
}
async function profileUser(meId: number, username: unknown): Promise<number> {
  if (typeof username !== "string") fail("not_found", 404);
  const r = (await p().query(
    `SELECT c.user_id FROM community_profiles c WHERE c.username = $2 AND NOT c.suspended AND (c.user_id = $1 OR (${AGE16("c.user_id")} AND ${NOT_BLOCKED("c.user_id")}))`,
    [meId, (username as string).toLowerCase().slice(0, 40)],
  )).rows[0];
  if (!r) fail("not_found", 404);
  return Number(r.user_id);
}
export async function profile(meId: number, username: unknown) {
  const uid = await profileUser(meId, username);
  const own = uid === meId;
  const connected = !own && !!(await p().query(`SELECT ${CONNECTED("$2::bigint")} AS c`, [meId, uid])).rows[0]?.c;
  const end = (await p().query(
    `SELECT e.skill, e.ref, count(*)::int AS n, bool_or(e.from_id = $1) AS mine FROM social_endorsements e
      WHERE e.to_id = $2 AND ${NOT_BLOCKED("e.from_id")} GROUP BY e.skill, e.ref ORDER BY n DESC, e.skill`,
    [meId, uid],
  )).rows.map((x) => ({ skill: x.skill as string, ref: Number(x.ref), count: Number(x.n), mine: !!x.mine }));
  // activity: milestones the member shares (feed on), visible to the member, friends and connections
  const act = await p().query(
    `SELECT e.kind, e.ref, e.created_at FROM social_events e
      WHERE e.user_id = $2 AND ($3 OR (${SOCIAL("feed", "e.user_id")} AND (${FRIEND("e.user_id")} OR ${CONNECTED("e.user_id")})))
      ORDER BY e.created_at DESC LIMIT 20`,
    [meId, uid, own],
  );
  const khatms = (await p().query("SELECT count(*)::int AS n FROM social_khatm_members m JOIN social_khatms k ON k.id = m.khatm_id WHERE m.user_id = $1 AND k.completed_at IS NOT NULL", [uid])).rows[0].n;
  const views = own && (await settings(meId)).views ? Number((await p().query(VIEWS_30, [uid])).rows[0].n) : null;
  return {
    own, connected, canEndorse: connected, endorsements: end, khatms: Number(khatms), views,
    activity: act.rows.map((x) => ({ kind: x.kind as string, ref: x.ref as string, at: (x.created_at as Date).toISOString() })),
  };
}
export async function recordView(meId: number, username: unknown) {
  const uid = await profileUser(meId, username);
  if (uid !== meId) {
    await p().query(
      `INSERT INTO social_profile_views (viewed_id, viewer_id) SELECT $1, $2 WHERE EXISTS (SELECT 1 FROM social_settings s WHERE s.user_id = $1 AND s.views) ON CONFLICT DO NOTHING`,
      [uid, meId],
    );
  }
  return { ok: true };
}
export async function endorse(meId: number, username: unknown, b: Row) {
  const uid = await profileUser(meId, username);
  if (uid === meId) fail("bad_request");
  if (!(await p().query(`SELECT ${CONNECTED("$2::bigint")} AS c`, [meId, uid])).rows[0]?.c) fail("connection_required", 403);
  if (!SKILLS.includes(b.skill as (typeof SKILLS)[number])) fail("bad_request");
  const skill = b.skill as string;
  const ref = skill === "surah" ? intOf(b.ref) : 0;
  if (skill === "surah" && !(ref >= 1 && ref <= 114)) fail("bad_request");
  if (b.on === false) await p().query("DELETE FROM social_endorsements WHERE from_id = $1 AND to_id = $2 AND skill = $3 AND ref = $4", [meId, uid, skill, ref]);
  else {
    const n = (await p().query("SELECT count(*)::int AS n FROM social_endorsements WHERE from_id = $1 AND to_id = $2", [meId, uid])).rows[0].n;
    if (n >= 10) fail("slow_down", 429);
    await p().query("INSERT INTO social_endorsements (from_id, to_id, skill, ref) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING", [meId, uid, skill, ref]);
  }
  return profile(meId, username);
}
