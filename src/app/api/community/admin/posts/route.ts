import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, adminGate, line, logAdmin } from "@/lib/talents";
import { cleanupMedia, dropPostMedia, notify, postingRules } from "@/lib/talentPosting";
import { displayBadge } from "@/lib/talentBadges";

export const dynamic = "force-dynamic";

// Approval queue for recitation clips (posts and stories; admins only). GET: pending, oldest first, with the file
// (streamed through /api/community/media/<id>). POST { id, action: approve | reject | remove, reason? }.
// Rejected and removed clips lose their file at once.
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.res) return g.res;
  void cleanupMedia();
  const r = await pool()!.query(
    `SELECT p.id, p.type, p.media_path, p.media_kind, p.has_video, p.duration_ms, p.caption, p.verse_key, p.word_check, p.created_at, p.expires_at,
            c.username, c.verified, c.badge, c.official, c.founder, c.level
       FROM community_posts p LEFT JOIN community_profiles c ON c.user_id = p.author_id
      WHERE p.status = 'pending' AND p.deleted_at IS NULL ORDER BY p.created_at ASC LIMIT 100`,
  );
  return json({
    posts: r.rows.map((x) => ({
      id: String(x.id), type: x.type, mediaUrl: x.media_path ? `/api/community/media/${x.id}` : null, mediaKind: x.media_kind, hasVideo: !!x.has_video,
      durationMs: x.duration_ms, caption: x.caption, verseKey: x.verse_key, wordCheck: x.word_check, at: x.created_at, expiresAt: x.expires_at,
      author: x.username ?? null, authorVerified: !!displayBadge(x), authorBadge: displayBadge(x), authorLevel: x.level ?? null,
    })),
  }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await adminGate(req, true);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { id?: unknown; action?: unknown; reason?: unknown };
  const status = b.action === "approve" ? "approved" : b.action === "reject" ? "rejected" : b.action === "remove" ? "removed" : null;
  if (!status || typeof b.id !== "string" || !/^\d{1,18}$/.test(b.id)) return json({ error: "bad_request" }, 400);
  const hours = postingRules().storyHours;
  const r = await pool()!.query(
    `UPDATE community_posts SET status = $2, reviewed_by = $3, reviewed_at = now(), reject_reason = $4,
            expires_at = CASE WHEN type = 'story' AND $2 = 'approved' THEN now() + $5::int * interval '1 hour' ELSE expires_at END
      WHERE id = $1 RETURNING author_id`,
    [b.id, status, g.me.id, status === "approved" ? "" : line(b.reason, 200), hours],
  );
  if (!r.rows[0]) return json({ error: "not_found" }, 404);
  if (status !== "approved") await dropPostMedia(b.id);
  if (status !== "removed") void notify(r.rows[0].author_id, status === "approved" ? "post_approved" : "post_rejected", null, b.id);
  await logAdmin(g.me.id, `post_${status}`, Number(r.rows[0].author_id), { post: Number(b.id) });
  return json({ ok: true }, 200, NO_STORE);
}
