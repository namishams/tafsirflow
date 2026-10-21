import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NOT_BLOCKED, NO_STORE, ageOf, birthYearOf, connected, talentGate, visibleMember } from "@/lib/talents";
import { sharerTier } from "@/lib/communityProfiles";
import { displayBadge } from "@/lib/talentBadges";

export const dynamic = "force-dynamic";

// GET: the member's conversations, newest first, with the last message and unread count (blocked members left out).
// POST { username }: open (or find) the conversation with an accepted connection; both 16+.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "convs", 60, { minAge: MIN_POST_AGE });
  if (g.res) return g.res;
  const r = await pool()!.query(
    `SELECT v.id, v.last_message_at, c.username, c.display_name, c.level, c.verified, c.badge, c.official, c.shares_total,
            (SELECT m.body FROM community_messages m WHERE m.conversation_id = v.id AND m.removed_at IS NULL ORDER BY m.id DESC LIMIT 1) AS last_body,
            (SELECT (m.sender_id = $1) FROM community_messages m WHERE m.conversation_id = v.id AND m.removed_at IS NULL ORDER BY m.id DESC LIMIT 1) AS last_mine,
            (SELECT count(*)::int FROM community_messages m WHERE m.conversation_id = v.id AND m.sender_id <> $1 AND m.removed_at IS NULL
               AND m.id > CASE WHEN v.user_a = $1 THEN v.a_read_id ELSE v.b_read_id END) AS unread
       FROM community_conversations v
       JOIN community_profiles c ON c.user_id = CASE WHEN v.user_a = $1 THEN v.user_b ELSE v.user_a END
      WHERE (v.user_a = $1 OR v.user_b = $1) AND v.last_message_at IS NOT NULL AND NOT c.suspended AND ${NOT_BLOCKED("c.user_id")}
      ORDER BY v.last_message_at DESC LIMIT 100`,
    [g.me.id],
  );
  return json({
    conversations: r.rows.map((x) => ({
      id: String(x.id), username: x.username, name: x.display_name, level: x.level, verified: !!displayBadge(x), badge: displayBadge(x), sharerTier: sharerTier(Number(x.shares_total ?? 0)),
      last: x.last_body ? { text: String(x.last_body).slice(0, 140), mine: !!x.last_mine } : null, at: x.last_message_at, unread: Number(x.unread),
    })),
    unread: r.rows.reduce((n, x) => n + Number(x.unread), 0),
  }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await talentGate(req, "conv-open", 30, { write: true, minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { username?: unknown };
  const other = typeof b.username === "string" ? await visibleMember(g.me.id, b.username) : undefined;
  if (!other) return json({ error: "not_found" }, 404);
  const id = Number(other.user_id);
  if ((ageOf(await birthYearOf(id)) ?? 0) < MIN_POST_AGE) return json({ error: "not_available" }, 403);
  if (!(await connected(g.me.id, id))) return json({ error: "connect_first" }, 403);
  if ((other as { message_policy?: string }).message_policy === "nobody") return json({ error: "not_available" }, 403);
  const [a, z] = g.me.id < id ? [g.me.id, id] : [id, g.me.id];
  const r = await pool()!.query(
    `INSERT INTO community_conversations (user_a, user_b) VALUES ($1,$2)
     ON CONFLICT (user_a, user_b) DO UPDATE SET user_a = EXCLUDED.user_a RETURNING id`,
    [a, z],
  );
  return json({ id: String(r.rows[0].id) }, 200, NO_STORE);
}
