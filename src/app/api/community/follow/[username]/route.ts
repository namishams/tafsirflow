import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { findByName, gate } from "@/lib/communityProfiles";

export const dynamic = "force-dynamic";

async function target(req: NextRequest, params: Promise<{ username: string }>, write: boolean) {
  const g = await gate(req, "follow", 40, 60_000, write);
  if (g.res) return { res: g.res };
  const c = await findByName((await params).username);
  if (!c || !c.public) return { res: json({ error: "not_found" }, 404) };
  const id = Number(c.user_id);
  if (id === g.me.id) return { res: json({ error: "self" }, 400) };
  const b = await pool()!.query("SELECT 1 FROM community_blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)", [g.me.id, id]);
  if (b.rows[0]) return { res: json({ error: "not_found" }, 404) };
  // you need a profile of your own to follow
  const mine = await pool()!.query("SELECT 1 FROM community_profiles WHERE user_id = $1", [g.me.id]);
  if (!mine.rows[0]) return { res: json({ error: "profile_required" }, 403) };
  return { me: g.me, id };
}
const count = async (id: number) => Number((await pool()!.query("SELECT count(*)::int AS n FROM community_follows WHERE followee_id = $1", [id])).rows[0].n);

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const t = await target(req, params, true);
  if (t.res) return t.res;
  await pool()!.query("INSERT INTO community_follows (follower_id, followee_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [t.me.id, t.id]);
  return json({ followed: true, followers: await count(t.id) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const t = await target(req, params, true);
  if (t.res) return t.res;
  await pool()!.query("DELETE FROM community_follows WHERE follower_id = $1 AND followee_id = $2", [t.me.id, t.id]);
  return json({ followed: false, followers: await count(t.id) });
}
