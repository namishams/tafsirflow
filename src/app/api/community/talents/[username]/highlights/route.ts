import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NOT_BLOCKED, NO_STORE, canSeeContent, talentGate } from "@/lib/talents";
import { postingEnabled, LIVE, POST_COLS, VIEWER_COLS, postJson, type PostRow } from "@/lib/talentPosting";

export const dynamic = "force-dynamic";

// a member's story highlights with their clips (live ones only)
export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  if (!postingEnabled()) return json({ highlights: [], disabled: true }, 200, NO_STORE); // posting is switched off (config.json)
  const g = await talentGate(req, "highlights", 90);
  if (g.res) return g.res;
  const p = pool()!;
  const prof = (await p.query(
    `SELECT c.user_id, c.private FROM community_profiles c WHERE c.username = $2 AND (c.user_id = $1 OR (c.public AND NOT c.suspended AND ${NOT_BLOCKED("c.user_id")}))`,
    [g.me.id, String((await params).username).toLowerCase().slice(0, 40)],
  )).rows[0];
  if (!prof) return json({ error: "not_found" }, 404);
  if (!(await canSeeContent(g.me.id, Number(prof.user_id), !!prof.private))) return json({ highlights: [], restricted: true }, 200, NO_STORE);
  const hs = (await p.query("SELECT id, title FROM community_highlights WHERE owner_id = $1 ORDER BY created_at ASC LIMIT 30", [prof.user_id])).rows;
  if (!hs.length) return json({ highlights: [] }, 200, NO_STORE);
  const items = (await p.query(
    `SELECT h.highlight_id, ${POST_COLS}, ${VIEWER_COLS}
       FROM community_highlight_items h JOIN community_posts p ON p.id = h.post_id JOIN community_profiles c ON c.user_id = p.author_id
      WHERE h.highlight_id = ANY($2::bigint[]) AND ${LIVE} ORDER BY h.position, p.created_at`,
    [g.me.id, hs.map((h) => h.id)],
  )).rows;
  return json({
    highlights: hs.map((h) => ({ id: String(h.id), title: h.title, posts: items.filter((x) => String(x.highlight_id) === String(h.id)).map((x) => postJson(x as PostRow)) })).filter((h) => h.posts.length),
  }, 200, NO_STORE);
}
