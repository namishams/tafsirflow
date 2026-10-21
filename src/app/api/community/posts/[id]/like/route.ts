import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { CONTENT_VISIBLE, NOT_BLOCKED, NO_STORE, talentGate } from "@/lib/talents";
import { POSTING_OFF, postingEnabled, LIVE, notify } from "@/lib/talentPosting";

export const dynamic = "force-dynamic";

// POST likes, DELETE unlikes an approved, live clip (13+, like following)
async function run(req: NextRequest, params: Promise<{ id: string }>, on: boolean) {
  if (!postingEnabled()) return json(POSTING_OFF, 403, NO_STORE); // posting is switched off (config.json)
  const g = await talentGate(req, "like", 120, { write: true });
  if (g.res) return g.res;
  const id = (await params).id;
  if (!/^\d{1,18}$/.test(id)) return json({ error: "not_found" }, 404);
  const p = pool()!;
  const ok = await p.query(
    `SELECT p.author_id FROM community_posts p WHERE p.id = $2 AND ${LIVE} AND ${NOT_BLOCKED("p.author_id")} AND ${CONTENT_VISIBLE("p.author_id")}`,
    [g.me.id, id],
  );
  if (!ok.rows[0]) return json({ error: "not_found" }, 404);
  const ch = on
    ? await p.query("INSERT INTO community_post_likes (post_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING 1", [id, g.me.id])
    : await p.query("DELETE FROM community_post_likes WHERE post_id = $1 AND user_id = $2 RETURNING 1", [id, g.me.id]);
  if (on && ch.rows[0]) void notify(ok.rows[0].author_id, "like", g.me.id, id);
  const r = ch.rows[0]
    ? await p.query(`UPDATE community_posts SET like_count = GREATEST(0, like_count ${on ? "+" : "-"} 1) WHERE id = $1 RETURNING like_count`, [id])
    : await p.query("SELECT like_count FROM community_posts WHERE id = $1", [id]);
  return json({ liked: on, likes: Number(r.rows[0].like_count) }, 200, NO_STORE);
}
export const POST = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => run(req, params, true);
export const DELETE = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => run(req, params, false);
