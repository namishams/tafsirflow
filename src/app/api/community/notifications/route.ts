import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { sharerTier } from "@/lib/communityProfiles";
import { NOT_BLOCKED, NO_STORE, talentGate } from "@/lib/talents";
import { displayBadge } from "@/lib/talentBadges";

export const dynamic = "force-dynamic";

// The member's notifications (new follower, like, comment, clip approved/rejected, connection, verification).
// GET: newest 60 with the unread count. POST {}: marks all as read. Actors that are blocked are left out.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "notifs", 60);
  if (g.res) return g.res;
  const p = pool()!;
  const r = await p.query(
    `SELECT n.id, n.kind, n.post_id, n.created_at, n.read_at, c.username, c.display_name, c.verified, c.badge, c.official, c.shares_total, po.verse_key
       FROM community_notifications n
       LEFT JOIN community_profiles c ON c.user_id = n.actor_id
       LEFT JOIN community_posts po ON po.id = n.post_id
      WHERE n.user_id = $1 AND (n.actor_id IS NULL OR (${NOT_BLOCKED("n.actor_id")} AND c.user_id IS NOT NULL AND NOT c.suspended))
      ORDER BY n.id DESC LIMIT 60`,
    [g.me.id],
  );
  const unread = await p.query("SELECT count(*)::int AS n FROM community_notifications WHERE user_id = $1 AND read_at IS NULL", [g.me.id]);
  return json({
    notifications: r.rows.map((x) => ({
      id: String(x.id), kind: x.kind, at: x.created_at, read: !!x.read_at, postId: x.post_id ? String(x.post_id) : null, verseKey: x.verse_key ?? null,
      actor: x.username ? { username: x.username, name: x.display_name, verified: !!displayBadge(x), badge: displayBadge(x), sharerTier: sharerTier(Number(x.shares_total ?? 0)) } : null,
    })),
    unread: Number(unread.rows[0].n),
  }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await talentGate(req, "notifs-read", 60, { write: true });
  if (g.res) return g.res;
  await pool()!.query("UPDATE community_notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL", [g.me.id]);
  // keep the table small: read notifications older than 90 days go
  await pool()!.query("DELETE FROM community_notifications WHERE user_id = $1 AND read_at < now() - interval '90 days'", [g.me.id]);
  return json({ ok: true }, 200, NO_STORE);
}
