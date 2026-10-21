import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { sharerTier } from "@/lib/communityProfiles";
import { CONTENT_VISIBLE, NOT_BLOCKED, NO_STORE, talentGate } from "@/lib/talents";
import { postingEnabled, LIVE, POST_COLS, VIEWER_COLS, dropPostMedia, postJson, type PostRow } from "@/lib/talentPosting";

export const dynamic = "force-dynamic";

// GET: one clip (approved and live, or the author's own). DELETE: the author removes the clip and its file.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!postingEnabled()) return json({ error: "not_found" }, 404, NO_STORE); // posting is switched off (config.json)
  const g = await talentGate(req, "post", 120);
  if (g.res) return g.res;
  const id = (await params).id;
  if (!/^\d{1,18}$/.test(id)) return json({ error: "not_found" }, 404);
  const r = await pool()!.query(
    `SELECT ${POST_COLS}, p.author_id, p.deleted_at, ${VIEWER_COLS}
       FROM community_posts p JOIN community_profiles c ON c.user_id = p.author_id
      WHERE p.id = $2 AND (p.author_id = $1 OR (${LIVE}
        AND c.public AND NOT c.suspended AND ${NOT_BLOCKED("p.author_id")} AND ${CONTENT_VISIBLE("p.author_id")}))`,
    [g.me.id, id],
  );
  const x = r.rows[0];
  if (!x || (x.deleted_at && Number(x.author_id) !== g.me.id)) return json({ error: "not_found" }, 404);
  const own = Number(x.author_id) === g.me.id;
  const j = postJson(x as PostRow, own);
  return json({ post: { ...j, author: { ...j.author, sharerTier: sharerTier(Number(x.shares_total ?? 0)), mine: own } } }, 200, NO_STORE);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "post-del", 30, { write: true });
  if (g.res) return g.res;
  const id = (await params).id;
  if (!/^\d{1,18}$/.test(id)) return json({ error: "not_found" }, 404);
  const r = await pool()!.query("UPDATE community_posts SET deleted_at = now(), status = 'removed' WHERE id = $1 AND author_id = $2 AND deleted_at IS NULL RETURNING id", [id, g.me.id]);
  if (!r.rows[0]) return json({ error: "not_found" }, 404);
  await dropPostMedia(id);
  return json({ ok: true }, 200, NO_STORE);
}
