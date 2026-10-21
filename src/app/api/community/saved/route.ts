import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { sharerTier } from "@/lib/communityProfiles";
import { CONTENT_VISIBLE, NOT_BLOCKED, NO_STORE, talentGate } from "@/lib/talents";
import { postingEnabled, LIVE, POST_COLS, VIEWER_COLS, postJson, type PostRow } from "@/lib/talentPosting";

export const dynamic = "force-dynamic";

// the member's saved clips (only live ones, blocked authors left out), newest saved first
export async function GET(req: NextRequest) {
  if (!postingEnabled()) return json({ posts: [], disabled: true }, 200, NO_STORE); // posting is switched off (config.json)
  const g = await talentGate(req, "saved", 60);
  if (g.res) return g.res;
  const r = await pool()!.query(
    `SELECT ${POST_COLS}, ${VIEWER_COLS}
       FROM community_post_saves s JOIN community_posts p ON p.id = s.post_id JOIN community_profiles c ON c.user_id = p.author_id
      WHERE s.user_id = $1 AND ${LIVE} AND NOT c.suspended AND ${NOT_BLOCKED("p.author_id")} AND ${CONTENT_VISIBLE("p.author_id")}
      ORDER BY s.created_at DESC LIMIT 120`,
    [g.me.id],
  );
  return json({ posts: r.rows.map((x) => { const j = postJson(x as PostRow); return { ...j, author: { ...j.author, sharerTier: sharerTier(Number(x.shares_total ?? 0)) } }; }) }, 200, NO_STORE);
}
