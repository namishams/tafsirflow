import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { findByName, gate, shape } from "@/lib/communityProfiles";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const g = await gate(req, "view", 90);
  if (g.res) return g.res;
  const { username } = await params;
  const c = await findByName(username);
  const mine = c && Number(c.user_id) === g.me.id;
  if (!c || (!c.public && !mine)) return json({ error: "not_found" }, 404);
  const p = pool()!;
  const b = await p.query("SELECT blocker_id FROM community_blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)", [g.me.id, c.user_id]);
  const iBlocked = b.rows.some((x) => Number(x.blocker_id) === g.me.id);
  if (b.rows.length && !iBlocked) return json({ error: "not_found" }, 404); // they blocked you: looks like it does not exist
  const n = await p.query(
    `SELECT (SELECT count(*)::int FROM community_follows WHERE followee_id = $1) AS followers,
            (SELECT count(*)::int FROM community_follows WHERE follower_id = $1) AS following,
            EXISTS (SELECT 1 FROM community_follows WHERE follower_id = $2 AND followee_id = $1) AS followed`,
    [c.user_id, g.me.id],
  );
  return json({ profile: { ...shape({ ...c, ...n.rows[0] }), followed: !!n.rows[0].followed, mine: !!mine, blocked: iBlocked } }, 200, { "Cache-Control": "private, no-store" });
}
