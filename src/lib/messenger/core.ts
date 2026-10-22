import crypto from "node:crypto";
import { pool } from "../db";
import { badText } from "../communityProfiles";
import { displayBadge } from "../talentBadges";
import { AGE16, FRIEND, settingsOf, shareCircle, type Gender } from "../together";
import { MIN_POST_AGE, NOT_BLOCKED, ageOf, birthYearOf } from "../talents";
import { newSalt, open, openText, seal } from "./crypto";

// Messenger rules (owner 22.10.2026). Everything here runs on the server; the clients only render.
// - Messaging is 16+ on both sides (confirmed birth year), never with blocked or suspended members.
// - One-to-one: friends (mutual follow or accepted connection) chat right away. Anyone else lands in the other
//   person's message requests: one text message, no media, until the request is accepted. Declined stays silent.
// - Adults (18+) and members aged 16-17 only reach each other when they share a Together circle or an active
//   teacher link (both consented there). Members aged 16-17 cannot join groups by invite link; only someone who
//   meets the same rule, or the circle itself, adds them.
// - Groups: up to 256 members, created by anyone 16+; sisters-only / brothers-only use the self-declared identity
//   gender of Together circles (together_settings.circle_gender), the same rule as circles.
// - Every text is checked by the moderation (badText); every message, user and group can be reported. A report
//   stores an encrypted copy of the reported messages that the server decrypts for the moderator (see crypto.ts).

export const MAX_GROUP = 256;
export const MAX_TEXT = 2000;
export const REACTIONS = ["mashallah", "heart", "dua"] as const;
export type Reaction = (typeof REACTIONS)[number];
export const AUDIENCES = ["all", "brothers", "sisters"] as const;
export type Audience = (typeof AUDIENCES)[number];

const q = <T = Record<string, unknown>>(sql: string, args: unknown[] = []) => pool()!.query(sql, args).then((r) => r.rows as T[]);
export const isId = (v: unknown): v is string => typeof v === "string" && /^\d{1,18}$/.test(v);
export const audienceAllows = (a: Audience, g: Gender | null) => (a === "brothers" ? g === "brother" : a === "sisters" ? g === "sister" : true);

// ---------- people ----------
export async function ageOfUser(id: number) { return ageOf(await birthYearOf(id)); }

/** mutual follow or an accepted connection */
export async function friends(a: number, b: number) {
  return !!(await q(`SELECT 1 AS ok WHERE ${FRIEND("$2::bigint")}`, [a, b]))[0];
}
/** active teacher link (the student consented) */
async function teacherLink(a: number, b: number) {
  return !!(await q("SELECT 1 FROM teacher_shares WHERE status = 'active' AND ((student_id = $1 AND teacher_id = $2) OR (student_id = $2 AND teacher_id = $1))", [a, b]))[0];
}
async function blockedEither(a: number, b: number) {
  return !!(await q("SELECT 1 FROM community_blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)", [a, b]))[0];
}

/** may these two members reach each other at all? (age, minors, blocks); null = yes, else an error code */
export async function pairProblem(a: number, b: number): Promise<string | null> {
  if (a === b) return "not_available";
  const [x, y] = await Promise.all([ageOfUser(a), ageOfUser(b)]);
  if (x === null || y === null || x < MIN_POST_AGE || y < MIN_POST_AGE) return "not_available";
  if (await blockedEither(a, b)) return "not_available";
  if ((x < 18) !== (y < 18)) {
    if (!(await shareCircle(a, b)) && !(await teacherLink(a, b))) return "minor_protection";
  }
  return null;
}

type Profile = { user_id: string; username: string; display_name: string; level: string; verified: boolean; badge: string; official: boolean; founder: boolean; avatar_path: string | null; avatar_version: number; suspended: boolean; message_policy: string };
const PROFILE = "c.user_id, c.username, c.display_name, c.level, c.verified, c.badge, c.official, c.founder, c.avatar_path, c.avatar_version, c.suspended, c.message_policy";
export const person = (c: Partial<Profile> | null | undefined) => c?.username ? {
  username: c.username, name: c.display_name ?? c.username, level: c.level ?? "talent", badge: displayBadge(c as never), verified: !!displayBadge(c as never),
  avatar: c.avatar_path ? `/api/community/avatar/${c.username}?v=${Number(c.avatar_version ?? 0)}` : null,
} : null;

export async function profileByName(meId: number, username: string) {
  return (await q<Profile>(`SELECT ${PROFILE} FROM community_profiles c WHERE c.username = $2 AND NOT c.suspended AND c.user_id <> $1 AND ${NOT_BLOCKED("c.user_id")}`, [meId, String(username).toLowerCase().slice(0, 40)]))[0];
}

// ---------- threads ----------
export type Thread = {
  id: string; kind: "direct" | "group" | "circle"; salt: Buffer; direct_a: string | null; direct_b: string | null; request_status: "accepted" | "pending" | "declined";
  requested_by: string | null; name: string; audience: Audience; photo_version: number; has_photo: boolean; circle_id: string | null; created_by: string | null; invite: boolean;
  role: "admin" | "member"; read_id: string; muted_until: Date | null; quiet: boolean;
};
const THREAD = `t.id, t.kind, t.salt, t.direct_a, t.direct_b, t.request_status, t.requested_by, t.name, t.audience, t.photo_version, (t.photo_enc IS NOT NULL) AS has_photo,
  t.circle_id, t.created_by, (t.invite_hash IS NOT NULL) AS invite, m.role, m.read_id, m.muted_until, m.quiet`;
export const otherOf = (t: Pick<Thread, "direct_a" | "direct_b">, me: number) => Number(t.direct_a) === me ? Number(t.direct_b) : Number(t.direct_a);

/** a thread the member belongs to, or null (direct: not blocked, other not suspended; circle: still a member) */
export async function threadFor(meId: number, id: unknown): Promise<Thread | null> {
  if (!isId(id)) return null;
  const t = (await q<Thread>(`SELECT ${THREAD} FROM msg_threads t JOIN msg_members m ON m.thread_id = t.id AND m.user_id = $1 WHERE t.id = $2`, [meId, id]))[0];
  if (!t) return null;
  if (t.kind === "direct") {
    const o = otherOf(t, meId);
    if (await blockedEither(meId, o)) return null;
    const s = (await q<{ suspended: boolean }>("SELECT suspended FROM community_profiles WHERE user_id = $1", [o]))[0];
    if (!s || s.suspended) return null;
    if (t.request_status === "declined" && Number(t.requested_by) !== meId) return null;
  }
  if (t.kind === "circle") {
    await syncCircleMembers(Number(t.circle_id), Number(t.id));
    if (!(await q("SELECT 1 FROM msg_members WHERE thread_id = $1 AND user_id = $2", [t.id, meId]))[0]) return null;
  }
  return t;
}

/** open (or find) the one-to-one chat; friends: accepted, everyone else: a message request */
export async function openDirect(meId: number, username: string): Promise<{ id: string; request: boolean } | { error: string; status: number }> {
  const other = await profileByName(meId, username);
  if (!other) return { error: "not_found", status: 404 };
  const o = Number(other.user_id);
  const problem = await pairProblem(meId, o);
  if (problem) return { error: problem, status: 403 };
  const [a, z] = meId < o ? [meId, o] : [o, meId];
  const existing = (await q<{ id: string; request_status: string; requested_by: string | null }>("SELECT id, request_status, requested_by FROM msg_threads WHERE kind = 'direct' AND direct_a = $1 AND direct_b = $2", [a, z]))[0];
  const isFriend = await friends(meId, o);
  if (existing) {
    // a request the other declined: the requester keeps seeing it, the other never again
    if (existing.request_status === "declined" && Number(existing.requested_by) !== meId) {
      if (!isFriend) return { error: "not_available", status: 403 };
      await q("UPDATE msg_threads SET request_status = 'accepted' WHERE id = $1", [existing.id]);
    }
    if (existing.request_status === "pending" && isFriend) await q("UPDATE msg_threads SET request_status = 'accepted' WHERE id = $1", [existing.id]);
    await q("INSERT INTO msg_members (thread_id, user_id) VALUES ($1,$2),($1,$3) ON CONFLICT DO NOTHING", [existing.id, meId, o]);
    return { id: String(existing.id), request: existing.request_status === "pending" && !isFriend };
  }
  if (other.message_policy === "nobody" && !isFriend) return { error: "not_available", status: 403 };
  const r = await q<{ id: string }>(
    `INSERT INTO msg_threads (kind, salt, direct_a, direct_b, request_status, requested_by, created_by) VALUES ('direct',$1,$2,$3,$4,$5,$5)
     ON CONFLICT (direct_a, direct_b) WHERE kind = 'direct' DO UPDATE SET direct_a = EXCLUDED.direct_a RETURNING id`,
    [newSalt(), a, z, isFriend ? "accepted" : "pending", meId],
  );
  await q("INSERT INTO msg_members (thread_id, user_id) VALUES ($1,$2),($1,$3) ON CONFLICT DO NOTHING", [r[0].id, meId, o]);
  return { id: String(r[0].id), request: !isFriend };
}

// ---------- learning groups: a linked chat for every Together circle ----------
/** creates the chats of the member's circles and drops chats of circles they left */
export async function syncMyCircles(meId: number) {
  const mine = await q<{ circle_id: string; name: string; kind: string }>(
    `SELECT ci.id AS circle_id, ci.name, ci.kind FROM together_circle_members cm JOIN together_circles ci ON ci.id = cm.circle_id
      WHERE cm.user_id = $1 AND cm.status = 'member' AND ci.suspended_at IS NULL`, [meId]);
  for (const c of mine) {
    const t = await q<{ id: string }>(
      `INSERT INTO msg_threads (kind, salt, name, audience, circle_id, last_message_at) VALUES ('circle',$1,$2,$3,$4, now())
       ON CONFLICT (circle_id) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [newSalt(), String(c.name).slice(0, 60), c.kind === "brothers" ? "brothers" : c.kind === "sisters" ? "sisters" : "all", c.circle_id]);
    await syncCircleMembers(Number(c.circle_id), Number(t[0].id));
  }
  await q(`DELETE FROM msg_members m USING msg_threads t WHERE t.id = m.thread_id AND m.user_id = $1 AND t.kind = 'circle'
            AND NOT EXISTS (SELECT 1 FROM together_circle_members cm JOIN together_circles ci ON ci.id = cm.circle_id
                             WHERE cm.circle_id = t.circle_id AND cm.user_id = $1 AND cm.status = 'member' AND ci.suspended_at IS NULL)`, [meId]);
}
/** circle chat members = circle members aged 16+; circle leaders are the chat's admins */
async function syncCircleMembers(circleId: number, threadId: number) {
  await q(`DELETE FROM msg_members m WHERE m.thread_id = $2 AND NOT EXISTS (
            SELECT 1 FROM together_circle_members cm JOIN together_circles ci ON ci.id = cm.circle_id
             WHERE cm.circle_id = $1 AND cm.user_id = m.user_id AND cm.status = 'member' AND ci.suspended_at IS NULL)`, [circleId, threadId]);
  await q(`INSERT INTO msg_members (thread_id, user_id, role)
           SELECT $2, cm.user_id, CASE WHEN cm.role = 'leader' THEN 'admin' ELSE 'member' END
             FROM together_circle_members cm JOIN together_circles ci ON ci.id = cm.circle_id
            WHERE cm.circle_id = $1 AND cm.status = 'member' AND ci.suspended_at IS NULL AND ${AGE16("cm.user_id")}
           ON CONFLICT (thread_id, user_id) DO UPDATE SET role = EXCLUDED.role`, [circleId, threadId]);
}

// ---------- groups ----------
export async function createGroup(meId: number, nameRaw: unknown, audienceRaw: unknown) {
  const name = typeof nameRaw === "string" ? nameRaw.replace(/\s+/g, " ").trim().slice(0, 61) : "";
  if (name.length < 2) return { error: "name_required", status: 400 } as const;
  if (name.length > 60) return { error: "too_long", status: 400 } as const;
  const bad = await badText(name);
  if (bad) return { error: bad, status: 400 } as const;
  const audience = (AUDIENCES as readonly string[]).includes(String(audienceRaw)) ? (audienceRaw as Audience) : "all";
  if (!audienceAllows(audience, (await settingsOf(meId)).gender)) return { error: "group_gender", status: 403 } as const;
  const owned = await q<{ n: number }>("SELECT count(*)::int AS n FROM msg_threads WHERE kind = 'group' AND created_by = $1 AND created_at > now() - interval '1 day'", [meId]);
  if (owned[0].n >= 10) return { error: "slow_down", status: 429 } as const;
  const t = await q<{ id: string }>("INSERT INTO msg_threads (kind, salt, name, audience, created_by, last_message_at) VALUES ('group',$1,$2,$3,$4, now()) RETURNING id", [newSalt(), name, audience, meId]);
  await q("INSERT INTO msg_members (thread_id, user_id, role) VALUES ($1,$2,'admin')", [t[0].id, meId]);
  return { id: String(t[0].id) } as const;
}

export async function memberCount(threadId: string) {
  return (await q<{ n: number }>("SELECT count(*)::int AS n FROM msg_members WHERE thread_id = $1", [threadId]))[0].n;
}

/** a group admin (or the circle) adds a member: friends of the adder only, same rules as one-to-one */
export async function addMember(meId: number, t: Thread, username: string) {
  if (t.kind !== "group" || t.role !== "admin") return { error: "forbidden", status: 403 } as const;
  const other = await profileByName(meId, username);
  if (!other) return { error: "not_found", status: 404 } as const;
  const o = Number(other.user_id);
  const problem = await pairProblem(meId, o);
  if (problem) return { error: problem, status: 403 } as const;
  if (!(await friends(meId, o))) return { error: "friends_only", status: 403 } as const;
  if (other.message_policy === "nobody") return { error: "not_available", status: 403 } as const;
  if (!audienceAllows(t.audience, (await settingsOf(o)).gender)) return { error: "group_gender", status: 403 } as const;
  if ((await memberCount(t.id)) >= MAX_GROUP) return { error: "group_full", status: 409 } as const;
  await q("INSERT INTO msg_members (thread_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [t.id, o]);
  await systemNote(t, "added", other.username);
  return { ok: true } as const;
}

export const inviteHash = (code: string) => crypto.createHash("sha256").update(`qmc-msg-invite:${code.replace(/[^A-Za-z0-9]/g, "")}`).digest("hex");
export function newInvite() { return crypto.randomBytes(12).toString("base64url").replace(/[^A-Za-z0-9]/g, "").slice(0, 14).padEnd(14, "x"); }

export async function joinByCode(meId: number, code: string) {
  const t = (await q<{ id: string; audience: Audience; kind: string }>("SELECT id, audience, kind FROM msg_threads WHERE invite_hash = $1 AND kind = 'group'", [inviteHash(code)]))[0];
  if (!t) return { error: "invite_invalid", status: 404 } as const;
  const age = await ageOfUser(meId);
  if (age === null || age < MIN_POST_AGE) return { error: "age16", status: 403 } as const;
  if (age < 18) return { error: "minor_protection", status: 403 } as const;
  if (!audienceAllows(t.audience, (await settingsOf(meId)).gender)) return { error: "group_gender", status: 403 } as const;
  // nobody joins a group where an admin blocked them, or that holds someone they blocked as admin
  const blocked = await q(`SELECT 1 FROM msg_members m WHERE m.thread_id = $2 AND m.role = 'admin' AND NOT ${NOT_BLOCKED("m.user_id")}`, [meId, t.id]);
  if (blocked[0]) return { error: "invite_invalid", status: 404 } as const;
  if ((await memberCount(t.id)) >= MAX_GROUP) return { error: "group_full", status: 409 } as const;
  const ins = await q("INSERT INTO msg_members (thread_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING user_id", [t.id, meId]);
  if (ins[0]) {
    const me = (await q<{ username: string }>("SELECT username FROM community_profiles WHERE user_id = $1", [meId]))[0];
    const th = (await q<Thread>(`SELECT ${THREAD} FROM msg_threads t JOIN msg_members m ON m.thread_id = t.id AND m.user_id = $1 WHERE t.id = $2`, [meId, t.id]))[0];
    if (th && me) await systemNote(th, "joined", me.username);
  }
  return { id: String(t.id) } as const;
}

/** leaves a group; the oldest member becomes admin when the last admin leaves; an empty group is deleted */
export async function leave(meId: number, t: Thread) {
  if (t.kind !== "group") return { error: "forbidden", status: 403 } as const;
  const me = (await q<{ username: string }>("SELECT username FROM community_profiles WHERE user_id = $1", [meId]))[0];
  await q("DELETE FROM msg_members WHERE thread_id = $1 AND user_id = $2", [t.id, meId]);
  const left = await memberCount(t.id);
  if (!left) { await q("DELETE FROM msg_threads WHERE id = $1", [t.id]); return { ok: true } as const; }
  await q(`UPDATE msg_members SET role = 'admin' WHERE thread_id = $1 AND user_id = (SELECT user_id FROM msg_members WHERE thread_id = $1 ORDER BY joined_at LIMIT 1)
           AND NOT EXISTS (SELECT 1 FROM msg_members WHERE thread_id = $1 AND role = 'admin')`, [t.id]);
  if (me) await systemNote(t, "left", me.username);
  return { ok: true } as const;
}

/** a line like "@x joined" (stored sealed like any message, shown in the reader's language) */
export async function systemNote(t: Pick<Thread, "id" | "salt">, what: "added" | "removed" | "joined" | "left" | "renamed", who: string) {
  await q("INSERT INTO msg_messages (thread_id, sender_id, kind, body_enc) VALUES ($1, NULL, 'system', $2)", [t.id, seal(t.id, t.salt, JSON.stringify({ what, who }))]);
  await q("UPDATE msg_threads SET last_message_at = now() WHERE id = $1", [t.id]);
}

// ---------- messages ----------
type Row = { id: string; sender_id: string | null; kind: string; body_enc: Buffer | null; body_legacy: string | null; reply_to: string | null; media_mime: string | null; duration_ms: number | null;
  created_at: Date; deleted_at: Date | null; removed_at: Date | null; username: string | null; display_name: string | null; avatar_path: string | null; avatar_version: number | null };

/** plain text of a stored message; old plain messages are sealed on the way */
export async function bodyOf(t: Pick<Thread, "id" | "salt">, m: Pick<Row, "id" | "body_enc" | "body_legacy">): Promise<string | null> {
  if (m.body_legacy != null) {
    const text = m.body_legacy;
    await q("UPDATE msg_messages SET body_enc = $2, body_legacy = NULL WHERE id = $1", [m.id, seal(t.id, t.salt, text)]).catch(() => undefined);
    return text;
  }
  return openText(t.id, t.salt, m.body_enc);
}

export async function messagesOf(meId: number, t: Thread, opts: { before?: string | null; after?: string | null; limit?: number }) {
  const limit = Math.min(Math.max(opts.limit ?? 40, 1), 80);
  const rows = await q<Row>(
    `SELECT x.id, x.sender_id, x.kind, x.body_enc, x.body_legacy, x.reply_to, x.media_mime, x.duration_ms, x.created_at, x.deleted_at, x.removed_at,
            c.username, c.display_name, c.avatar_path, c.avatar_version
       FROM msg_messages x LEFT JOIN community_profiles c ON c.user_id = x.sender_id
      WHERE x.thread_id = $2 AND ($3::bigint IS NULL OR x.id < $3) AND ($4::bigint IS NULL OR x.id > $4)
        AND (x.sender_id IS NULL OR x.sender_id = $1 OR NOT EXISTS (SELECT 1 FROM community_blocks b WHERE b.blocker_id = $1 AND b.blocked_id = x.sender_id))
      ORDER BY x.id ${opts.after ? "ASC" : "DESC"} LIMIT ${limit + 1}`,
    [meId, t.id, opts.before ?? null, opts.after ?? null]);
  const more = rows.length > limit;
  const page = rows.slice(0, limit);
  if (!opts.after) page.reverse();
  const ids = page.map((r) => r.id);
  const replyIds = [...new Set(page.map((r) => r.reply_to).filter(Boolean))] as string[];
  const [reacts, replies] = await Promise.all([
    ids.length ? q<{ message_id: string; kind: Reaction; n: number; mine: boolean }>(
      "SELECT message_id, kind, count(*)::int AS n, bool_or(user_id = $1) AS mine FROM msg_reactions WHERE message_id = ANY($2::bigint[]) GROUP BY message_id, kind", [meId, ids]) : [],
    replyIds.length ? q<Row>(
      `SELECT x.id, x.sender_id, x.kind, x.body_enc, x.body_legacy, x.deleted_at, x.removed_at, c.display_name, c.username FROM msg_messages x
        LEFT JOIN community_profiles c ON c.user_id = x.sender_id WHERE x.id = ANY($1::bigint[]) AND x.thread_id = $2`, [replyIds, t.id]) : [],
  ]);
  const replyMap = new Map<string, { id: string; name: string; kind: string; text: string | null; gone: boolean }>();
  for (const r of replies) {
    const gone = !!(r.deleted_at || r.removed_at);
    replyMap.set(String(r.id), { id: String(r.id), name: Number(r.sender_id) === meId ? "" : r.display_name ?? r.username ?? "", kind: r.kind, text: gone || r.kind !== "text" ? null : (await bodyOf(t, r))?.slice(0, 160) ?? null, gone });
  }
  const out = [];
  for (const m of page) {
    const gone = !!(m.deleted_at || m.removed_at);
    const reactions: Partial<Record<Reaction, number>> = {};
    let mine: Reaction | null = null;
    for (const r of reacts) if (String(r.message_id) === String(m.id)) { reactions[r.kind] = r.n; if (r.mine) mine = r.kind; }
    let text: string | null = null;
    let system: { what: string; who: string } | null = null;
    if (!gone && (m.kind === "text" || m.kind === "image")) text = await bodyOf(t, m);
    if (m.kind === "system") { try { system = JSON.parse((await bodyOf(t, m)) ?? "null"); } catch { system = null; } }
    out.push({
      id: String(m.id), kind: m.kind, mine: Number(m.sender_id) === meId,
      sender: m.sender_id && Number(m.sender_id) !== meId ? person({ username: m.username ?? undefined, display_name: m.display_name ?? undefined, avatar_path: m.avatar_path, avatar_version: m.avatar_version ?? 0 } as Partial<Profile>) : null,
      text, system, deleted: !!m.deleted_at, removed: !!m.removed_at,
      media: !gone && (m.kind === "image" || m.kind === "voice") ? `/api/messenger/messages/${m.id}/media` : null,
      durationMs: m.duration_ms, reply: m.reply_to ? replyMap.get(String(m.reply_to)) ?? { id: String(m.reply_to), name: "", kind: "text", text: null, gone: true } : null,
      reactions, myReaction: mine, at: m.created_at,
    });
  }
  return { messages: out, more: more && !opts.after ? (out[0]?.id ?? null) : null };
}

export async function readReceiptsOn(userId: number) {
  return (await q<{ read_receipts: boolean }>("SELECT read_receipts FROM msg_prefs WHERE user_id = $1", [userId]))[0]?.read_receipts ?? true;
}

/** why the member cannot send right now, or null */
export async function sendProblem(meId: number, t: Thread, kind: string): Promise<string | null> {
  if (t.muted_until && new Date(t.muted_until).getTime() > Date.now()) return "muted";
  if (t.kind !== "direct") return null;
  const o = otherOf(t, meId);
  const p = await pairProblem(meId, o);
  if (p) return p;
  if (t.request_status === "declined") return "not_available";
  if (t.request_status === "pending") {
    if (Number(t.requested_by) !== meId) return "request_open";
    if (kind !== "text") return "request_text_only";
    const sent = await q<{ n: number }>("SELECT count(*)::int AS n FROM msg_messages WHERE thread_id = $1 AND sender_id = $2", [t.id, meId]);
    if (sent[0].n >= 1) return "request_wait";
  }
  return null;
}

export async function insertMessage(meId: number, t: Thread, m: { kind: "text" | "image" | "voice"; text?: string; media?: { data: Buffer; mime: string }; durationMs?: number | null; replyTo?: string | null }) {
  let reply: string | null = null;
  if (m.replyTo && isId(m.replyTo)) reply = (await q<{ id: string }>("SELECT id FROM msg_messages WHERE id = $1 AND thread_id = $2", [m.replyTo, t.id]))[0]?.id ?? null;
  const r = await q<{ id: string; created_at: Date }>(
    `INSERT INTO msg_messages (thread_id, sender_id, kind, body_enc, reply_to, media_enc, media_mime, duration_ms) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, created_at`,
    [t.id, meId, m.kind, m.text ? seal(t.id, t.salt, m.text) : null, reply, m.media ? seal(t.id, t.salt, m.media.data) : null, m.media?.mime ?? null,
      m.kind === "voice" ? Math.min(Math.max(Math.round(Number(m.durationMs) || 0), 0), 120_000) : null]);
  await q("UPDATE msg_threads SET last_message_at = now() WHERE id = $1", [t.id]);
  await q("UPDATE msg_members SET read_id = GREATEST(read_id, $3), typing_at = NULL WHERE thread_id = $1 AND user_id = $2", [t.id, meId, r[0].id]);
  return r[0];
}

/** a moderator opens the image or voice note of a reported message (only messages copied into a report) */
export async function reportedMedia(messageId: string) {
  const m = (await q<{ thread_id: string; salt: Buffer; media_enc: Buffer | null; media_mime: string | null }>(
    `SELECT x.thread_id, t.salt, x.media_enc, x.media_mime FROM msg_messages x JOIN msg_threads t ON t.id = x.thread_id
      WHERE x.id = $1 AND EXISTS (SELECT 1 FROM msg_report_items i WHERE i.message_id = x.id)`, [messageId]))[0];
  const data = m ? open(m.thread_id, m.salt, m.media_enc) : null;
  return data ? { data, mime: m!.media_mime || "application/octet-stream" } : null;
}

export async function mediaOf(meId: number, messageId: string) {
  const m = (await q<{ thread_id: string; media_enc: Buffer | null; media_mime: string | null; deleted_at: Date | null; removed_at: Date | null }>(
    "SELECT thread_id, media_enc, media_mime, deleted_at, removed_at FROM msg_messages WHERE id = $1", [messageId]))[0];
  if (!m || !m.media_enc || m.deleted_at || m.removed_at) return null;
  const t = await threadFor(meId, String(m.thread_id));
  if (!t) return null;
  const data = open(t.id, t.salt, m.media_enc);
  return data ? { data, mime: m.media_mime || "application/octet-stream" } : null;
}

// ---------- list ----------
export async function listThreads(meId: number, box: "inbox" | "requests") {
  await syncMyCircles(meId);
  const rows = await q<Thread & { last_message_at: Date | null; unread: number; other_user: string | null; last_id: string | null }>(
    `SELECT ${THREAD}, t.last_message_at,
            CASE WHEN t.kind = 'direct' THEN (CASE WHEN t.direct_a = $1 THEN t.direct_b ELSE t.direct_a END) END AS other_user,
            (SELECT max(x.id) FROM msg_messages x WHERE x.thread_id = t.id) AS last_id,
            (SELECT count(*)::int FROM msg_messages x WHERE x.thread_id = t.id AND x.id > m.read_id AND x.sender_id IS DISTINCT FROM $1 AND x.sender_id IS NOT NULL
               AND x.deleted_at IS NULL AND x.removed_at IS NULL AND NOT EXISTS (SELECT 1 FROM community_blocks b WHERE b.blocker_id = $1 AND b.blocked_id = x.sender_id)) AS unread
       FROM msg_threads t JOIN msg_members m ON m.thread_id = t.id AND m.user_id = $1
      WHERE t.last_message_at IS NOT NULL
        AND ${box === "requests"
          ? "t.kind = 'direct' AND t.request_status = 'pending' AND t.requested_by <> $1"
          : "(t.kind <> 'direct' OR t.request_status = 'accepted' OR t.requested_by = $1)"}
        AND (t.kind <> 'direct' OR (${NOT_BLOCKED("CASE WHEN t.direct_a = $1 THEN t.direct_b ELSE t.direct_a END")}
             AND EXISTS (SELECT 1 FROM community_profiles c WHERE c.user_id = CASE WHEN t.direct_a = $1 THEN t.direct_b ELSE t.direct_a END AND NOT c.suspended)))
      ORDER BY t.last_message_at DESC LIMIT 200`, [meId]);
  const others = rows.filter((r) => r.other_user).map((r) => String(r.other_user));
  const profiles = others.length ? await q<Profile>(`SELECT ${PROFILE} FROM community_profiles c WHERE c.user_id = ANY($1::bigint[])`, [others]) : [];
  const pmap = new Map(profiles.map((p) => [String(p.user_id), p]));
  const lastIds = rows.map((r) => r.last_id).filter(Boolean) as string[];
  const lasts = lastIds.length ? await q<Row & { thread_id: string }>(
    `SELECT x.id, x.thread_id, x.sender_id, x.kind, x.body_enc, x.body_legacy, x.deleted_at, x.removed_at, x.created_at, c.display_name, c.username
       FROM msg_messages x LEFT JOIN community_profiles c ON c.user_id = x.sender_id WHERE x.id = ANY($1::bigint[])`, [lastIds]) : [];
  const lmap = new Map(lasts.map((l) => [String(l.thread_id), l]));
  const out = [];
  for (const r of rows) {
    const l = lmap.get(String(r.id));
    let last: { kind: string; text: string | null; mine: boolean; name: string; gone: boolean; system?: { what: string; who: string } | null } | null = null;
    if (l) {
      const gone = !!(l.deleted_at || l.removed_at);
      let text: string | null = null;
      let system = null;
      if (!gone && (l.kind === "text" || l.kind === "image")) text = (await bodyOf(r, l))?.slice(0, 140) ?? null;
      if (l.kind === "system") { try { system = JSON.parse((await bodyOf(r, l)) ?? "null"); } catch { system = null; } }
      last = { kind: l.kind, text, mine: Number(l.sender_id) === meId, name: l.display_name ?? l.username ?? "", gone, system };
    }
    const p = r.other_user ? pmap.get(String(r.other_user)) : undefined;
    out.push({
      id: String(r.id), kind: r.kind, title: r.kind === "direct" ? p?.display_name ?? "" : r.name, with: r.kind === "direct" ? person(p) : null,
      photo: r.kind !== "direct" && r.has_photo ? `/api/messenger/threads/${r.id}/photo?v=${r.photo_version}` : null,
      audience: r.audience, request: r.kind === "direct" && r.request_status !== "accepted" ? { status: r.request_status, incoming: Number(r.requested_by) !== meId } : null,
      last, at: r.last_message_at, unread: r.quiet ? 0 : Number(r.unread), quiet: r.quiet,
    });
  }
  return out;
}

export async function unreadTotals(meId: number) {
  const r = await q<{ inbox: number; requests: number }>(
    `SELECT
       coalesce(sum(CASE WHEN NOT (t.kind = 'direct' AND t.request_status = 'pending' AND t.requested_by <> $1) AND NOT m.quiet THEN u.n ELSE 0 END), 0)::int AS inbox,
       count(*) FILTER (WHERE t.kind = 'direct' AND t.request_status = 'pending' AND t.requested_by <> $1 AND u.n > 0)::int AS requests
       FROM msg_members m JOIN msg_threads t ON t.id = m.thread_id
       CROSS JOIN LATERAL (SELECT count(*)::int AS n FROM msg_messages x WHERE x.thread_id = t.id AND x.id > m.read_id AND x.sender_id IS NOT NULL AND x.sender_id <> $1
                             AND x.deleted_at IS NULL AND x.removed_at IS NULL) u
      WHERE m.user_id = $1 AND (t.kind <> 'direct' OR t.request_status <> 'declined')
        AND (t.kind <> 'direct' OR ${NOT_BLOCKED("CASE WHEN t.direct_a = $1 THEN t.direct_b ELSE t.direct_a END")})`, [meId]);
  return r[0] ?? { inbox: 0, requests: 0 };
}

// ---------- search (bodies are sealed, so the server decrypts the member's recent messages and matches them) ----------
export async function search(meId: number, raw: string) {
  const needle = raw.trim().toLocaleLowerCase().slice(0, 80);
  if (needle.length < 2) return [];
  const threads = await listThreads(meId, "inbox");
  const titles = threads.filter((t) => t.title.toLocaleLowerCase().includes(needle) || (t.with?.username ?? "").includes(needle))
    .slice(0, 20).map((t) => ({ threadId: t.id, messageId: null as string | null, title: t.title, snippet: null as string | null, at: t.at }));
  const ids = threads.map((t) => t.id);
  if (!ids.length) return titles;
  const salts = await q<{ id: string; salt: Buffer }>("SELECT id, salt FROM msg_threads WHERE id = ANY($1::bigint[])", [ids]);
  const smap = new Map(salts.map((s) => [String(s.id), s.salt]));
  const rows = await q<Row & { thread_id: string }>(
    `SELECT x.id, x.thread_id, x.body_enc, x.body_legacy, x.created_at FROM msg_messages x
      WHERE x.thread_id = ANY($1::bigint[]) AND x.kind IN ('text','image') AND x.deleted_at IS NULL AND x.removed_at IS NULL
      ORDER BY x.id DESC LIMIT 3000`, [ids]);
  const titleOf = new Map(threads.map((t) => [t.id, t.title]));
  const hits = [];
  for (const m of rows) {
    const text = await bodyOf({ id: String(m.thread_id), salt: smap.get(String(m.thread_id))! }, m);
    if (!text) continue;
    const i = text.toLocaleLowerCase().indexOf(needle);
    if (i < 0) continue;
    hits.push({ threadId: String(m.thread_id), messageId: String(m.id), title: titleOf.get(String(m.thread_id)) ?? "", snippet: text.slice(Math.max(0, i - 40), i + 100), at: m.created_at });
    if (hits.length >= 50) break;
  }
  return [...titles, ...hits];
}

// ---------- reports ----------
/** stores the report and sealed copies of the reported message plus up to 10 before it (thread: the last 20) */
export async function report(meId: number, t: Thread, target: { messageId?: string | null }, category: string, reason: string) {
  let reported: number | null = null;
  let around: Row[] = [];
  let focus: string | null = null;
  if (target.messageId) {
    const m = (await q<Row>("SELECT id, sender_id FROM msg_messages WHERE id = $1 AND thread_id = $2 AND sender_id IS NOT NULL AND sender_id <> $3", [target.messageId, t.id, meId]))[0];
    if (!m) return { error: "not_found", status: 404 } as const;
    reported = Number(m.sender_id); focus = String(m.id);
    around = await q<Row>(`SELECT x.id, x.sender_id, x.kind, x.body_enc, x.body_legacy, x.created_at, c.username FROM msg_messages x LEFT JOIN community_profiles c ON c.user_id = x.sender_id
                            WHERE x.thread_id = $1 AND x.id <= $2 AND x.kind <> 'system' ORDER BY x.id DESC LIMIT 11`, [t.id, m.id]);
  } else {
    reported = t.kind === "direct" ? otherOf(t, meId) : Number(t.created_by ?? 0) || Number((await q<{ user_id: string }>("SELECT user_id FROM msg_members WHERE thread_id = $1 AND role = 'admin' AND user_id <> $2 LIMIT 1", [t.id, meId]))[0]?.user_id ?? 0);
    if (!reported || reported === meId) return { error: "not_found", status: 404 } as const;
    around = await q<Row>(`SELECT x.id, x.sender_id, x.kind, x.body_enc, x.body_legacy, x.created_at, c.username FROM msg_messages x LEFT JOIN community_profiles c ON c.user_id = x.sender_id
                            WHERE x.thread_id = $1 AND x.kind <> 'system' ORDER BY x.id DESC LIMIT 20`, [t.id]);
  }
  const type = target.messageId ? "msg_message" : "msg_thread";
  const targetId = target.messageId ?? t.id;
  const dup = await q("SELECT 1 FROM community_reports WHERE reporter_id = $1 AND target_type = $2 AND target_id = $3 AND status = 'open'", [meId, type, targetId]);
  if (dup[0]) return { ok: true } as const;
  const rep = await q<{ id: string }>("INSERT INTO community_reports (reporter_id, reported_id, reason, category, target_type, target_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
    [meId, reported, reason, category, type, targetId]);
  for (const m of around) {
    const text = m.kind === "text" || m.kind === "image" ? await bodyOf(t, m) : null;
    await q("INSERT INTO msg_report_items (report_id, message_id, thread_id, salt, sender, kind, body_enc, at, reported) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [rep[0].id, m.id, t.id, t.salt, m.username ?? "", m.kind, text ? seal(t.id, t.salt, text) : null, m.created_at, String(m.id) === focus]);
  }
  return { ok: true } as const;
}

/** for the moderation queue: the decrypted copies of a report, oldest first */
export async function reportItems(reportIds: string[]) {
  type Item = { sender: string; kind: string; text: string | null; at: Date; reported: boolean; media: string | null };
  if (!reportIds.length) return new Map<string, Item[]>();
  const rows = await q<{ report_id: string; message_id: string | null; thread_id: string; salt: Buffer; sender: string; kind: string; body_enc: Buffer | null; at: Date; reported: boolean }>(
    "SELECT report_id, message_id, thread_id, salt, sender, kind, body_enc, at, reported FROM msg_report_items WHERE report_id = ANY($1::bigint[]) ORDER BY at ASC", [reportIds]);
  const out = new Map<string, Item[]>();
  for (const r of rows) {
    const list = out.get(String(r.report_id)) ?? [];
    list.push({ sender: r.sender, kind: r.kind, text: openText(r.thread_id, r.salt, r.body_enc), at: r.at, reported: r.reported,
      media: r.message_id && (r.kind === "image" || r.kind === "voice") ? `/api/messenger/messages/${r.message_id}/media` : null });
    out.set(String(r.report_id), list);
  }
  return out;
}
