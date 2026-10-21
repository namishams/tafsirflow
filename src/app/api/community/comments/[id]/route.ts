import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

// DELETE: the comment's author or the clip's author removes a comment
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "comment-del", 60, { write: true });
  if (g.res) return g.res;
  const id = (await params).id;
  if (!/^\d{1,18}$/.test(id)) return json({ error: "not_found" }, 404);
  const p = pool()!;
  const r = await p.query(
    `UPDATE community_post_comments k SET removed_at = now() FROM community_posts p
      WHERE k.id = $1 AND k.post_id = p.id AND k.removed_at IS NULL AND (k.author_id = $2 OR p.author_id = $2) RETURNING k.post_id`,
    [id, g.me.id],
  );
  if (!r.rows[0]) return json({ error: "not_found" }, 404);
  await p.query("UPDATE community_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = $1", [r.rows[0].post_id]);
  return json({ ok: true }, 200, NO_STORE);
}
