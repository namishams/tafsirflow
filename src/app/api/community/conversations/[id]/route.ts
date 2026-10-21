import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { badText } from "@/lib/communityProfiles";
import { displayBadge } from "@/lib/talentBadges";
import { MIN_POST_AGE, NO_STORE, ageOf, birthYearOf, connected, para, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

const PAGE = 30;
const MAX_LEN = 500;

/** the conversation if the member takes part in it; `other` = the other member's user id (never sent out) */
async function load(meId: number, rawId: string) {
  const id = /^\d{1,18}$/.test(rawId) ? rawId : null;
  if (!id) return null;
  const r = await pool()!.query(
    `SELECT v.id, v.user_a, v.user_b, c.username, c.display_name, c.level, c.verified, c.badge, c.official, c.suspended, c.message_policy,
            EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = v.user_a AND b.blocked_id = v.user_b) OR (b.blocker_id = v.user_b AND b.blocked_id = v.user_a)) AS blocked
       FROM community_conversations v
       JOIN community_profiles c ON c.user_id = CASE WHEN v.user_a = $1 THEN v.user_b ELSE v.user_a END
      WHERE v.id = $2 AND (v.user_a = $1 OR v.user_b = $1)`,
    [meId, id],
  );
  const v = r.rows[0];
  if (!v || v.blocked || v.suspended) return null;
  return { ...v, other: Number(v.user_a) === meId ? Number(v.user_b) : Number(v.user_a) };
}

// GET ?before=<message id>: one page of messages (newest last) and marks them as read. POST { text }: send.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "msgs", 120, { minAge: MIN_POST_AGE });
  if (g.res) return g.res;
  const v = await load(g.me.id, (await params).id);
  if (!v) return json({ error: "not_found" }, 404);
  const before = /^\d{1,18}$/.test(req.nextUrl.searchParams.get("before") ?? "") ? req.nextUrl.searchParams.get("before") : null;
  const p = pool()!;
  const r = await p.query(
    `SELECT id, sender_id, body, created_at, removed_at FROM community_messages
      WHERE conversation_id = $1 AND ($2::bigint IS NULL OR id < $2) ORDER BY id DESC LIMIT ${PAGE + 1}`,
    [v.id, before],
  );
  const rows = r.rows.slice(0, PAGE).reverse();
  if (!before && rows.length) {
    const last = rows[rows.length - 1].id;
    await p.query(`UPDATE community_conversations SET ${Number(v.user_a) === g.me.id ? "a_read_id" : "b_read_id"} = GREATEST(${Number(v.user_a) === g.me.id ? "a_read_id" : "b_read_id"}, $2) WHERE id = $1`, [v.id, last]);
  }
  const open = v.message_policy !== "nobody" && (await connected(g.me.id, v.other)) && (ageOf(await birthYearOf(v.other)) ?? 0) >= MIN_POST_AGE;
  return json({
    with: { username: v.username, name: v.display_name, level: v.level, verified: !!displayBadge(v), badge: displayBadge(v) },
    canSend: open,
    messages: rows.map((m) => ({ id: String(m.id), mine: Number(m.sender_id) === g.me.id, text: m.removed_at ? null : m.body, removed: !!m.removed_at, at: m.created_at })),
    more: r.rows.length > PAGE ? String(rows[0].id) : null,
  }, 200, NO_STORE);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "send", 30, { write: true, minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  const v = await load(g.me.id, (await params).id);
  if (!v) return json({ error: "not_found" }, 404);
  if (v.message_policy === "nobody") return json({ error: "not_available" }, 403);
  if (!(await connected(g.me.id, v.other)) || (ageOf(await birthYearOf(v.other)) ?? 0) < MIN_POST_AGE) return json({ error: "connect_first" }, 403);
  const b = (await req.json().catch(() => ({}))) as { text?: unknown };
  const text = para(b.text, MAX_LEN + 1);
  if (!text) return json({ error: "empty" }, 400);
  if (text.length > MAX_LEN) return json({ error: "too_long" }, 400);
  const bad = await badText(text);
  if (bad) return json({ error: bad }, 400);
  const p = pool()!;
  const r = await p.query("INSERT INTO community_messages (conversation_id, sender_id, body) VALUES ($1,$2,$3) RETURNING id, created_at", [v.id, g.me.id, text]);
  const col = Number(v.user_a) === g.me.id ? "a_read_id" : "b_read_id";
  await p.query(`UPDATE community_conversations SET last_message_at = now(), ${col} = $2 WHERE id = $1`, [v.id, r.rows[0].id]);
  return json({ message: { id: String(r.rows[0].id), mine: true, text, removed: false, at: r.rows[0].created_at } }, 200, NO_STORE);
}
