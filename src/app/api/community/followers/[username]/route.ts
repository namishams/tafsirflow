import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

// DELETE: remove a member from the own followers (Instagram / TikTok "Remove"). The member is not notified; a public
// account can be followed again, a private one only after a new follow request.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const g = await talentGate(req, "follower-remove", 60, { write: true });
  if (g.res) return g.res;
  const p = pool()!;
  const r = await p.query(
    `DELETE FROM community_follows f USING community_profiles c
      WHERE f.follower_id = c.user_id AND c.username = $2 AND f.followee_id = $1 RETURNING 1`,
    [g.me.id, String((await params).username).toLowerCase().slice(0, 40)],
  );
  if (!r.rows[0]) return json({ error: "not_found" }, 404);
  const n = await p.query("SELECT count(*)::int AS n FROM community_follows WHERE followee_id = $1", [g.me.id]);
  return json({ ok: true, followers: Number(n.rows[0]?.n ?? 0) }, 200, NO_STORE);
}
