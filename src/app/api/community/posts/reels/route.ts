import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { sharerTier } from "@/lib/communityProfiles";
import { CONTENT_VISIBLE, NOT_BLOCKED, NO_STORE, talentGate } from "@/lib/talents";
import { POST_COLS, VIEWER_COLS, cleanupMedia, postJson, type PostRow } from "@/lib/talentPosting";

export const dynamic = "force-dynamic";

// The "Talents" reels in the feed: approved, live clips of public, not suspended, not blocked members, newest first;
// stories (24 h) first. Paged with offset `cursor`.
const PAGE = 15;
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "reels", 90);
  if (g.res) return g.res;
  void cleanupMedia();
  const offset = Math.max(0, Math.min(5000, Math.floor(Number(req.nextUrl.searchParams.get("cursor")) || 0)));
  const r = await pool()!.query(
    `SELECT ${POST_COLS}, ${VIEWER_COLS},
            EXISTS (SELECT 1 FROM community_follows f WHERE f.follower_id = $1 AND f.followee_id = p.author_id) AS followed
       FROM community_posts p JOIN community_profiles c ON c.user_id = p.author_id
      WHERE p.status = 'approved' AND p.deleted_at IS NULL AND p.media_path IS NOT NULL AND (p.expires_at IS NULL OR p.expires_at > now())
        AND c.public AND NOT c.suspended AND ${NOT_BLOCKED("p.author_id")} AND ${CONTENT_VISIBLE("p.author_id")}
      ORDER BY (p.type = 'story') DESC, p.created_at DESC LIMIT ${PAGE + 1} OFFSET $2`,
    [g.me.id, offset],
  );
  return json({
    posts: r.rows.slice(0, PAGE).map((x) => {
      const j = postJson(x as PostRow);
      return { ...j, author: { ...j.author, sharerTier: sharerTier(Number(x.shares_total ?? 0)), followed: !!x.followed, mine: false } };
    }),
    next: r.rows.length > PAGE ? String(offset + PAGE) : null,
  }, 200, NO_STORE);
}
