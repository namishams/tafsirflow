import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { CONTENT_VISIBLE, NOT_BLOCKED, NO_STORE, talentGate } from "@/lib/talents";
import { POSTING_OFF, postingEnabled, LIVE } from "@/lib/talentPosting";

export const dynamic = "force-dynamic";

// POST saves, DELETE unsaves a clip (private list of the member)
async function run(req: NextRequest, params: Promise<{ id: string }>, on: boolean) {
  if (!postingEnabled()) return json(POSTING_OFF, 403, NO_STORE); // posting is switched off (config.json)
  const g = await talentGate(req, "save", 120, { write: true });
  if (g.res) return g.res;
  const id = (await params).id;
  if (!/^\d{1,18}$/.test(id)) return json({ error: "not_found" }, 404);
  const p = pool()!;
  if (on) {
    const ok = await p.query(`SELECT 1 FROM community_posts p WHERE p.id = $2 AND ${LIVE} AND ${NOT_BLOCKED("p.author_id")} AND ${CONTENT_VISIBLE("p.author_id")}`, [g.me.id, id]);
    if (!ok.rows[0]) return json({ error: "not_found" }, 404);
    await p.query("INSERT INTO community_post_saves (post_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [id, g.me.id]);
  } else await p.query("DELETE FROM community_post_saves WHERE post_id = $1 AND user_id = $2", [id, g.me.id]);
  return json({ saved: on }, 200, NO_STORE);
}
export const POST = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => run(req, params, true);
export const DELETE = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => run(req, params, false);
