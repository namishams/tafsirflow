import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { pool } from "@/lib/db";
import { json, rateLimited } from "@/lib/http";
import { ageOf, MIN_VIEW_AGE } from "@/lib/talents";
import { streamMedia } from "@/lib/media";
import { postingEnabled } from "@/lib/talentPosting";

export const dynamic = "force-dynamic";

// Streams a clip's file: approved and live clips for signed-in members (13+, not blocked); the author and admins
// always. Range requests work (iOS players need them).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!pool()) return json({ error: "unavailable" }, 503);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  if (rateLimited(`comm-media:${me.id}`, 600, 60_000)) return json({ error: "slow_down" }, 429);
  const id = (await params).id;
  if (!/^\d{1,18}$/.test(id)) return json({ error: "not_found" }, 404);
  const r = await pool()!.query(
    `SELECT p.author_id, p.media_path, p.media_mime, p.status, p.deleted_at, p.expires_at,
            EXISTS (SELECT 1 FROM community_highlight_items h WHERE h.post_id = p.id) AS highlighted,
            (NOT COALESCE((SELECT x.private FROM community_profiles x WHERE x.user_id = p.author_id), false)
              OR EXISTS (SELECT 1 FROM community_follows f WHERE f.follower_id = $1 AND f.followee_id = p.author_id)) AS visible,
            EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = $1 AND b.blocked_id = p.author_id) OR (b.blocker_id = p.author_id AND b.blocked_id = $1)) AS blocked
       FROM community_posts p WHERE p.id = $2`,
    [me.id, id],
  );
  const x = r.rows[0];
  if (!x?.media_path) return json({ error: "not_found" }, 404);
  const own = Number(x.author_id) === me.id;
  const live = x.status === "approved" && !x.deleted_at && (!x.expires_at || new Date(x.expires_at).getTime() > Date.now() || x.highlighted);
  const viewer = me.emailVerified && (ageOf(me.birthYear) ?? 0) >= MIN_VIEW_AGE && !x.blocked && x.visible;
  // posting switched off (config.json): only the author and admins still reach a file
  if (!own && me.role !== "admin" && !postingEnabled()) return json({ error: "not_found" }, 404);
  if (!own && me.role !== "admin" && !(live && viewer)) return json({ error: "not_found" }, 404);
  return streamMedia(req, x.media_path, x.media_mime || "application/octet-stream");
}
