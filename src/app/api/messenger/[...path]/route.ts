import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json, rateLimited } from "@/lib/http";
import { badText } from "@/lib/communityProfiles";
import { MIN_POST_AGE, NO_STORE, REPORT_CATEGORIES, line, para, talentGate } from "@/lib/talents";
import { messengerReady, open, seal } from "@/lib/messenger/crypto";
import { cleanImage, cleanVoice } from "@/lib/messenger/media";
import {
  MAX_TEXT, REACTIONS, addMember, createGroup, inviteHash, isId, joinByCode, leave, listThreads, mediaOf, memberCount, messagesOf, newInvite,
  openDirect, otherOf, pairProblem, person, readReceiptsOn, report, reportedMedia, search, sendProblem, systemNote, threadFor, unreadTotals, insertMessage,
  type Thread,
} from "@/lib/messenger/core";

export const dynamic = "force-dynamic";

// Messenger API (app and website). Encryption at rest, not end-to-end: see src/lib/messenger/crypto.ts.
//   GET  threads?box=inbox|requests            conversations, newest first, with unread counts
//   POST threads { username }                  open a one-to-one chat (friends) or a message request (everyone else)
//   POST groups { name, audience }             new group (16+, audience all|brothers|sisters)
//   GET  threads/:id?before=&after=            messages, members, typing, read state; marks as read
//   PATCH threads/:id { name?, quiet? }        rename (admins) or silence for oneself
//   POST threads/:id/messages                  JSON { text, replyTo } or multipart (file, kind image|voice, durationMs, replyTo, text)
//   POST threads/:id/typing | read | leave
//   POST threads/:id/request { action: accept|decline }
//   POST threads/:id/members { username }      add (admins); PATCH { username, action: remove|mute|unmute|admin|member }
//   POST threads/:id/invite { action: reset|off }   invite link (only the hash is stored)
//   GET/POST threads/:id/photo                 group picture (re-encoded, sealed)
//   POST threads/:id/report { messageId?, category, reason }
//   GET  messages/:id/media                    image or voice note (decrypted for members, Range supported)
//   POST messages/:id/react { kind|null }      DELETE messages/:id (own message)
//   POST join { code }   GET search?q=   GET unread   GET/POST prefs { readReceipts }

type Ctx = { params: Promise<{ path: string[] }> };
const NOT_FOUND = () => json({ error: "not_found" }, 404);
const unavailable = () => json({ error: "unavailable" }, 503);

async function gate(req: NextRequest, key: string, max: number, write = false) {
  if (!messengerReady()) return { res: unavailable() };
  const g = await talentGate(req, `m-${key}`, max, { write, minAge: MIN_POST_AGE, needProfile: write });
  return g;
}

async function threadInfo(meId: number, t: Thread) {
  const p = pool()!;
  const members = (await p.query(
    `SELECT m.user_id, m.role, m.muted_until, m.read_id, m.typing_at, c.username, c.display_name, c.level, c.verified, c.badge, c.official, c.founder, c.avatar_path, c.avatar_version,
            COALESCE(pr.read_receipts, true) AS receipts
       FROM msg_members m JOIN community_profiles c ON c.user_id = m.user_id LEFT JOIN msg_prefs pr ON pr.user_id = m.user_id
      WHERE m.thread_id = $1 ORDER BY m.role, m.joined_at LIMIT 300`, [t.id])).rows;
  const myReceipts = await readReceiptsOn(meId);
  const others = members.filter((m) => Number(m.user_id) !== meId);
  const typing = others.filter((m) => m.typing_at && Date.now() - new Date(m.typing_at).getTime() < 7000).map((m) => m.display_name ?? m.username);
  // read receipts: shown only when both sides have them switched on (like the common messengers)
  const readers = myReceipts ? others.filter((m) => m.receipts).map((m) => Number(m.read_id)) : [];
  const other = t.kind === "direct" ? others.find((m) => Number(m.user_id) === otherOf(t, meId)) : null;
  return {
    id: t.id, kind: t.kind, title: t.kind === "direct" ? other?.display_name ?? "" : t.name, audience: t.audience,
    with: t.kind === "direct" ? person(other) : null,
    photo: t.kind !== "direct" && t.has_photo ? `/api/messenger/threads/${t.id}/photo?v=${t.photo_version}` : null,
    me: { role: t.role, mutedUntil: t.muted_until, quiet: t.quiet },
    members: t.kind === "direct" ? [] : members.map((m) => ({ ...person(m)!, role: m.role, muted: !!(m.muted_until && new Date(m.muted_until).getTime() > Date.now()), me: Number(m.user_id) === meId })),
    memberCount: members.length,
    request: t.kind === "direct" && t.request_status !== "accepted" ? { status: t.request_status, incoming: Number(t.requested_by) !== meId } : null,
    typing,
    /** direct: highest message id the other has read; group: read ids of the members who share receipts */
    readUpTo: t.kind === "direct" ? (readers[0] ?? null) : null,
    readers: t.kind === "direct" ? null : readers,
    invite: t.kind === "group" && t.role === "admin" ? t.invite : undefined,
    canManage: t.kind === "group" && t.role === "admin",
  };
}

function rangeResponse(req: NextRequest, data: Buffer, mime: string) {
  const base = { "Content-Type": mime, "Accept-Ranges": "bytes", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  const size = data.length;
  if (m && (m[1] || m[2])) {
    let start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
    const end = Math.min(m[1] && m[2] ? Number(m[2]) : size - 1, size - 1);
    if (start > end || start >= size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    start = Math.max(0, start);
    return new Response(new Uint8Array(data.subarray(start, end + 1)), { status: 206, headers: { ...base, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) } });
  }
  return new Response(new Uint8Array(data), { status: 200, headers: { ...base, "Content-Length": String(size) } });
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const [a, b, c] = (await ctx.params).path ?? [];
  const sp = req.nextUrl.searchParams;
  if (a === "threads" && !b) {
    const g = await gate(req, "list", 120);
    if (g.res) return g.res;
    const box = sp.get("box") === "requests" ? "requests" : "inbox";
    const [threads, unread] = await Promise.all([listThreads(g.me.id, box), unreadTotals(g.me.id)]);
    return json({ threads, unread }, 200, NO_STORE);
  }
  if (a === "unread") {
    const g = await gate(req, "unread", 120);
    if (g.res) return g.res;
    return json(await unreadTotals(g.me.id), 200, NO_STORE);
  }
  if (a === "search") {
    const g = await gate(req, "search", 30);
    if (g.res) return g.res;
    return json({ results: await search(g.me.id, sp.get("q") ?? "") }, 200, NO_STORE);
  }
  if (a === "prefs") {
    const g = await gate(req, "prefs", 60);
    if (g.res) return g.res;
    return json({ readReceipts: await readReceiptsOn(g.me.id) }, 200, NO_STORE);
  }
  if (a === "messages" && isId(b) && c === "media") {
    const g = await gate(req, "media", 600);
    if (g.res) return g.res;
    // members of the chat; moderators only for messages that were reported
    const m = (await mediaOf(g.me.id, b)) ?? (g.me.role === "admin" ? await reportedMedia(b) : null);
    return m ? rangeResponse(req, m.data, m.mime) : NOT_FOUND();
  }
  if (a === "threads" && isId(b) && c === "photo") {
    const g = await gate(req, "photo", 300);
    if (g.res) return g.res;
    const t = await threadFor(g.me.id, b);
    if (!t) return NOT_FOUND();
    const r = (await pool()!.query("SELECT photo_enc FROM msg_threads WHERE id = $1", [t.id])).rows[0];
    const data = open(t.id, t.salt, r?.photo_enc);
    return data ? rangeResponse(req, data, "image/jpeg") : NOT_FOUND();
  }
  if (a === "threads" && isId(b) && !c) {
    const g = await gate(req, "read", 240);
    if (g.res) return g.res;
    const t = await threadFor(g.me.id, b);
    if (!t) return NOT_FOUND();
    const before = isId(sp.get("before")) ? sp.get("before") : null;
    const after = isId(sp.get("after")) ? sp.get("after") : null;
    const page = await messagesOf(g.me.id, t, { before, after });
    // reading marks as read (an incoming request only once it is opened; accepting is separate)
    const newest = page.messages.length ? page.messages[page.messages.length - 1].id : null;
    if (!before && newest) await pool()!.query("UPDATE msg_members SET read_id = GREATEST(read_id, $3) WHERE thread_id = $1 AND user_id = $2", [t.id, g.me.id, newest]);
    const problem = await sendProblem(g.me.id, t, "text");
    return json({ thread: await threadInfo(g.me.id, t), ...page, canSend: !problem || problem === "request_text_only", sendProblem: problem }, 200, NO_STORE);
  }
  return NOT_FOUND();
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const [a, b, c] = (await ctx.params).path ?? [];
  const p = pool();
  if (a === "threads" && !b) {
    const g = await gate(req, "open", 30, true);
    if (g.res) return g.res;
    const body = (await req.json().catch(() => ({}))) as { username?: unknown };
    if (typeof body.username !== "string") return json({ error: "bad_request" }, 400);
    // message requests to strangers: at most 20 a day
    const r = await openDirect(g.me.id, body.username);
    if ("error" in r) return json({ error: r.error }, r.status);
    if (r.request && rateLimited(`m-req:${g.me.id}`, 20, 24 * 3600_000)) return json({ error: "slow_down" }, 429);
    return json(r, 200, NO_STORE);
  }
  if (a === "groups") {
    const g = await gate(req, "group", 10, true);
    if (g.res) return g.res;
    const body = (await req.json().catch(() => ({}))) as { name?: unknown; audience?: unknown };
    const r = await createGroup(g.me.id, body.name, body.audience);
    return "error" in r ? json({ error: r.error }, r.status) : json(r, 200, NO_STORE);
  }
  if (a === "join") {
    const g = await gate(req, "join", 20, true);
    if (g.res) return g.res;
    const body = (await req.json().catch(() => ({}))) as { code?: unknown };
    const code = typeof body.code === "string" ? body.code.trim().split(/[/=]/).pop() ?? "" : "";
    if (!/^[A-Za-z0-9]{8,32}$/.test(code)) return json({ error: "invite_invalid" }, 400);
    const r = await joinByCode(g.me.id, code);
    return "error" in r ? json({ error: r.error }, r.status) : json(r, 200, NO_STORE);
  }
  if (a === "prefs") {
    const g = await gate(req, "prefs-set", 30, true);
    if (g.res) return g.res;
    const body = (await req.json().catch(() => ({}))) as { readReceipts?: unknown };
    if (typeof body.readReceipts !== "boolean") return json({ error: "bad_request" }, 400);
    await p!.query("INSERT INTO msg_prefs (user_id, read_receipts) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET read_receipts = $2", [g.me.id, body.readReceipts]);
    return json({ readReceipts: body.readReceipts }, 200, NO_STORE);
  }
  if (a === "messages" && isId(b) && c === "react") {
    const g = await gate(req, "react", 120, true);
    if (g.res) return g.res;
    const m = (await p!.query("SELECT thread_id FROM msg_messages WHERE id = $1 AND kind <> 'system' AND deleted_at IS NULL AND removed_at IS NULL", [b])).rows[0];
    const t = m ? await threadFor(g.me.id, String(m.thread_id)) : null;
    if (!t) return NOT_FOUND();
    if (t.kind === "direct" && t.request_status !== "accepted") return json({ error: "request_open" }, 403);
    const body = (await req.json().catch(() => ({}))) as { kind?: unknown };
    const kind = REACTIONS.find((k) => k === body.kind);
    if (kind) await p!.query("INSERT INTO msg_reactions (message_id, user_id, kind) VALUES ($1,$2,$3) ON CONFLICT (message_id, user_id) DO UPDATE SET kind = $3, created_at = now()", [b, g.me.id, kind]);
    else await p!.query("DELETE FROM msg_reactions WHERE message_id = $1 AND user_id = $2", [b, g.me.id]);
    return json({ ok: true, kind: kind ?? null }, 200, NO_STORE);
  }
  if (a !== "threads" || !isId(b)) return NOT_FOUND();

  // ----- thread actions -----
  const writeKey = c === "messages" ? "send" : c === "typing" ? "typing" : c === "read" ? "mark" : `t-${c}`;
  const g = await gate(req, writeKey, c === "typing" ? 60 : c === "messages" ? 40 : c === "read" ? 120 : 30, true);
  if (g.res) return g.res;
  const me = g.me.id;
  const t = await threadFor(me, b);
  if (!t) return NOT_FOUND();

  if (c === "typing") {
    if (await sendProblem(me, t, "text")) return json({ ok: false }, 200, NO_STORE);
    await p!.query("UPDATE msg_members SET typing_at = now() WHERE thread_id = $1 AND user_id = $2", [t.id, me]);
    return json({ ok: true }, 200, NO_STORE);
  }
  if (c === "read") {
    const body = (await req.json().catch(() => ({}))) as { upTo?: unknown };
    if (!isId(body.upTo)) return json({ error: "bad_request" }, 400);
    await p!.query("UPDATE msg_members SET read_id = GREATEST(read_id, LEAST($3::bigint, (SELECT coalesce(max(id),0) FROM msg_messages WHERE thread_id = $1))) WHERE thread_id = $1 AND user_id = $2", [t.id, me, body.upTo]);
    return json({ ok: true }, 200, NO_STORE);
  }
  if (c === "messages") {
    // two windows: 40 a minute (gate) and 600 an hour
    if (rateLimited(`m-send-h:${me}`, 600, 3600_000)) return json({ error: "slow_down" }, 429);
    const isForm = (req.headers.get("content-type") ?? "").includes("multipart/form-data");
    let kind: "text" | "image" | "voice" = "text";
    let text = "";
    let replyTo: string | null = null;
    let durationMs: number | null = null;
    let media: { data: Buffer; mime: string } | undefined;
    if (isForm) {
      const f = await req.formData().catch(() => null);
      if (!f) return json({ error: "bad_request" }, 400);
      kind = f.get("kind") === "voice" ? "voice" : "image";
      text = kind === "image" ? para(f.get("text"), MAX_TEXT + 1) : "";
      replyTo = typeof f.get("replyTo") === "string" ? String(f.get("replyTo")) : null;
      durationMs = Number(f.get("durationMs")) || null;
      const problem = await sendProblem(me, t, kind);
      if (problem) return json({ error: problem }, 403);
      if (rateLimited(`m-media:${me}`, 30, 3600_000)) return json({ error: "slow_down" }, 429);
      const file = f.get("file");
      if (!file || typeof file === "string") return json({ error: "bad_request" }, 400);
      const buf = Buffer.from(await file.arrayBuffer());
      const clean = kind === "image" ? await cleanImage(buf) : await cleanVoice(buf);
      if ("error" in clean) return json({ error: clean.error }, 400);
      media = clean;
    } else {
      const body = (await req.json().catch(() => ({}))) as { text?: unknown; replyTo?: unknown };
      text = para(body.text, MAX_TEXT + 1);
      replyTo = typeof body.replyTo === "string" ? body.replyTo : null;
      if (!text) return json({ error: "empty" }, 400);
      const problem = await sendProblem(me, t, "text");
      if (problem) return json({ error: problem }, 403);
    }
    if (text.length > MAX_TEXT) return json({ error: "too_long" }, 400);
    if (text) { const bad = await badText(text); if (bad) return json({ error: bad }, 400); }
    const r = await insertMessage(me, t, { kind, text: text || undefined, media, durationMs, replyTo });
    const page = await messagesOf(me, t, { after: String(Number(r.id) - 1), limit: 1 });
    return json({ message: page.messages[0] ?? null }, 200, NO_STORE);
  }
  if (c === "request") {
    if (t.kind !== "direct" || t.request_status !== "pending" || Number(t.requested_by) === me) return json({ error: "bad_request" }, 400);
    const body = (await req.json().catch(() => ({}))) as { action?: unknown };
    if (body.action === "accept") {
      const problem = await pairProblem(me, otherOf(t, me));
      if (problem) return json({ error: problem }, 403);
      await p!.query("UPDATE msg_threads SET request_status = 'accepted' WHERE id = $1", [t.id]);
    } else if (body.action === "decline") {
      await p!.query("UPDATE msg_threads SET request_status = 'declined' WHERE id = $1", [t.id]);
    } else return json({ error: "bad_request" }, 400);
    return json({ ok: true }, 200, NO_STORE);
  }
  if (c === "leave") {
    const r = await leave(me, t);
    return "error" in r ? json({ error: r.error }, r.status) : json(r, 200, NO_STORE);
  }
  if (c === "members") {
    const body = (await req.json().catch(() => ({}))) as { username?: unknown };
    if (typeof body.username !== "string") return json({ error: "bad_request" }, 400);
    const r = await addMember(me, t, body.username);
    return "error" in r ? json({ error: r.error }, r.status) : json(r, 200, NO_STORE);
  }
  if (c === "invite") {
    if (t.kind !== "group" || t.role !== "admin") return json({ error: "forbidden" }, 403);
    const body = (await req.json().catch(() => ({}))) as { action?: unknown };
    if (body.action === "off") { await p!.query("UPDATE msg_threads SET invite_hash = NULL WHERE id = $1", [t.id]); return json({ code: null }, 200, NO_STORE); }
    const code = newInvite();
    await p!.query("UPDATE msg_threads SET invite_hash = $2 WHERE id = $1", [t.id, inviteHash(code)]);
    return json({ code }, 200, NO_STORE);
  }
  if (c === "photo") {
    if (t.kind !== "group" || t.role !== "admin") return json({ error: "forbidden" }, 403);
    const f = await req.formData().catch(() => null);
    const file = f?.get("file");
    if (!file || typeof file === "string") return json({ error: "bad_request" }, 400);
    const clean = await cleanImage(Buffer.from(await file.arrayBuffer()));
    if ("error" in clean) return json({ error: clean.error }, 400);
    await p!.query("UPDATE msg_threads SET photo_enc = $2, photo_version = photo_version + 1 WHERE id = $1", [t.id, seal(t.id, t.salt, clean.data)]);
    return json({ ok: true }, 200, NO_STORE);
  }
  if (c === "report") {
    const body = (await req.json().catch(() => ({}))) as { messageId?: unknown; category?: unknown; reason?: unknown };
    if (rateLimited(`m-report:${me}`, 10, 3600_000)) return json({ error: "slow_down" }, 429);
    const category = typeof body.category === "string" && REPORT_CATEGORIES.includes(body.category) ? body.category : "other";
    const r = await report(me, t, { messageId: isId(body.messageId) ? body.messageId : null }, category, line(body.reason, 300));
    return "error" in r ? json({ error: r.error }, r.status) : json({ reported: true }, 200, NO_STORE);
  }
  return NOT_FOUND();
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const [a, b, c] = (await ctx.params).path ?? [];
  if (a !== "threads" || !isId(b)) return NOT_FOUND();
  const g = await gate(req, "manage", 60, true);
  if (g.res) return g.res;
  const me = g.me.id;
  const t = await threadFor(me, b);
  if (!t) return NOT_FOUND();
  const p = pool()!;
  const body = (await req.json().catch(() => ({}))) as { name?: unknown; quiet?: unknown; username?: unknown; action?: unknown };
  if (!c) {
    if (typeof body.quiet === "boolean") await p.query("UPDATE msg_members SET quiet = $3 WHERE thread_id = $1 AND user_id = $2", [t.id, me, body.quiet]);
    if (typeof body.name === "string") {
      if (t.kind !== "group" || t.role !== "admin") return json({ error: "forbidden" }, 403);
      const name = body.name.replace(/\s+/g, " ").trim();
      if (name.length < 2) return json({ error: "name_required" }, 400);
      if (name.length > 60) return json({ error: "too_long" }, 400);
      const bad = await badText(name);
      if (bad) return json({ error: bad }, 400);
      await p.query("UPDATE msg_threads SET name = $2 WHERE id = $1", [t.id, name]);
      const mine = (await p.query("SELECT username FROM community_profiles WHERE user_id = $1", [me])).rows[0];
      if (mine) await systemNote(t, "renamed", mine.username);
    }
    return json({ ok: true }, 200, NO_STORE);
  }
  if (c === "members") {
    if (t.kind !== "group" || t.role !== "admin") return json({ error: "forbidden" }, 403);
    if (typeof body.username !== "string") return json({ error: "bad_request" }, 400);
    const target = (await p.query("SELECT m.user_id, c.username FROM msg_members m JOIN community_profiles c ON c.user_id = m.user_id WHERE m.thread_id = $1 AND c.username = $2",
      [t.id, body.username.toLowerCase().slice(0, 40)])).rows[0];
    if (!target || Number(target.user_id) === me) return NOT_FOUND();
    switch (body.action) {
      case "remove":
        await p.query("DELETE FROM msg_members WHERE thread_id = $1 AND user_id = $2", [t.id, target.user_id]);
        await systemNote(t, "removed", target.username);
        break;
      case "mute": await p.query("UPDATE msg_members SET muted_until = now() + interval '7 days' WHERE thread_id = $1 AND user_id = $2", [t.id, target.user_id]); break;
      case "unmute": await p.query("UPDATE msg_members SET muted_until = NULL WHERE thread_id = $1 AND user_id = $2", [t.id, target.user_id]); break;
      case "admin": await p.query("UPDATE msg_members SET role = 'admin' WHERE thread_id = $1 AND user_id = $2", [t.id, target.user_id]); break;
      case "member": await p.query("UPDATE msg_members SET role = 'member' WHERE thread_id = $1 AND user_id = $2", [t.id, target.user_id]); break;
      default: return json({ error: "bad_request" }, 400);
    }
    return json({ ok: true, members: await memberCount(t.id) }, 200, NO_STORE);
  }
  return NOT_FOUND();
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const [a, b] = (await ctx.params).path ?? [];
  if (a !== "messages" || !isId(b)) return NOT_FOUND();
  const g = await gate(req, "delete", 60, true);
  if (g.res) return g.res;
  // the sender deletes their own message for everyone: text and media are wiped, a placeholder stays
  const r = await pool()!.query(
    "UPDATE msg_messages SET deleted_at = now(), body_enc = NULL, body_legacy = NULL, media_enc = NULL WHERE id = $1 AND sender_id = $2 AND deleted_at IS NULL RETURNING id",
    [b, g.me.id]);
  if (!r.rows[0]) return NOT_FOUND();
  await pool()!.query("DELETE FROM msg_reactions WHERE message_id = $1", [b]);
  return json({ ok: true }, 200, NO_STORE);
}

