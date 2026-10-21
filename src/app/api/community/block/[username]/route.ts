import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { findByName, gate } from "@/lib/communityProfiles";

export const dynamic = "force-dynamic";

// POST blocks, DELETE unblocks. Blocking also removes follows and connections in both directions.
async function run(req: NextRequest, params: Promise<{ username: string }>, block: boolean) {
  const g = await gate(req, "block", 20, 60_000, true);
  if (g.res) return g.res;
  const c = await findByName((await params).username);
  if (!c) return json({ error: "not_found" }, 404);
  const id = Number(c.user_id);
  if (id === g.me.id) return json({ error: "self" }, 400);
  const p = pool()!;
  if (block) {
    await p.query("INSERT INTO community_blocks (blocker_id, blocked_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [g.me.id, id]);
    await p.query("DELETE FROM community_follows WHERE (follower_id = $1 AND followee_id = $2) OR (follower_id = $2 AND followee_id = $1)", [g.me.id, id]);
    // Quran Talents: a block also ends a connection or open request between the two
    await p.query("DELETE FROM community_connections WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)", [g.me.id, id]);
  } else {
    await p.query("DELETE FROM community_blocks WHERE blocker_id = $1 AND blocked_id = $2", [g.me.id, id]);
  }
  return json({ blocked: block });
}
export const POST = (req: NextRequest, { params }: { params: Promise<{ username: string }> }) => run(req, params, true);
export const DELETE = (req: NextRequest, { params }: { params: Promise<{ username: string }> }) => run(req, params, false);
