import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, adminGate, logAdmin } from "@/lib/talents";
import { dropPostMedia } from "@/lib/talentPosting";

export const dynamic = "force-dynamic";

// Moderation queue (admins only). GET: open reports, oldest first, with the reported profile and, for messages,
// the reported message, comment or clip. POST { id, action }: dismiss | resolve | remove_message (message or
// comment) | remove_post | suspend (also resolves).
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.res) return g.res;
  const status = req.nextUrl.searchParams.get("status") === "closed" ? "closed" : "open";
  const r = await pool()!.query(
    `SELECT r.id, r.reason, r.category, r.target_type, r.target_id, r.status, r.created_at,
            rp.username AS reported, rp.display_name AS reported_name, rp.suspended, rr.username AS reporter,
            (SELECT count(*)::int FROM community_reports x WHERE x.reported_id = r.reported_id) AS reports_total,
            m.body AS message, m.removed_at AS message_removed,
            cm.body AS comment, cm.removed_at AS comment_removed, po.verse_key AS post_verse, po.status AS post_status, (po.media_path IS NOT NULL) AS post_media
       FROM community_reports r
       LEFT JOIN community_profiles rp ON rp.user_id = r.reported_id
       LEFT JOIN community_profiles rr ON rr.user_id = r.reporter_id
       LEFT JOIN community_messages m ON r.target_type = 'message' AND m.id = r.target_id
       LEFT JOIN community_post_comments cm ON r.target_type = 'comment' AND cm.id = r.target_id
       LEFT JOIN community_posts po ON r.target_type = 'post' AND po.id = r.target_id
      WHERE ${status === "open" ? "r.status = 'open'" : "r.status <> 'open'"}
      ORDER BY r.created_at ${status === "open" ? "ASC" : "DESC"} LIMIT 100`,
  );
  return json({
    reports: r.rows.map((x) => ({
      id: String(x.id), reason: x.reason, category: x.category, type: x.target_type, status: x.status, at: x.created_at,
      reported: x.reported ?? null, reportedName: x.reported_name ?? null, suspended: !!x.suspended, reporter: x.reporter ?? null, total: Number(x.reports_total),
      message: x.target_type === "message" ? { text: x.message ?? null, removed: !!x.message_removed }
        : x.target_type === "comment" ? { text: x.comment ?? null, removed: !!x.comment_removed } : null,
      post: x.target_type === "post" ? { id: String(x.target_id), verseKey: x.post_verse, status: x.post_status, media: x.post_media ? `/api/community/media/${x.target_id}` : null } : null,
    })),
  }, 200, NO_STORE);
}

const ACTIONS = ["dismiss", "resolve", "remove_message", "remove_post", "suspend"] as const;
export async function POST(req: NextRequest) {
  const g = await adminGate(req, true);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { id?: unknown; action?: unknown };
  const action = ACTIONS.find((a) => a === b.action);
  if (!action || typeof b.id !== "string" || !/^\d{1,18}$/.test(b.id)) return json({ error: "bad_request" }, 400);
  const p = pool()!;
  const rep = (await p.query("SELECT id, reported_id, target_type, target_id FROM community_reports WHERE id = $1", [b.id])).rows[0];
  if (!rep) return json({ error: "not_found" }, 404);
  if (action === "remove_message") {
    // the reported message or comment
    if (rep.target_type === "message") await p.query("UPDATE community_messages SET removed_at = now() WHERE id = $1 AND removed_at IS NULL", [rep.target_id]);
    else if (rep.target_type === "comment") {
      const c = await p.query("UPDATE community_post_comments SET removed_at = now() WHERE id = $1 AND removed_at IS NULL RETURNING post_id", [rep.target_id]);
      if (c.rows[0]) await p.query("UPDATE community_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = $1", [c.rows[0].post_id]);
    } else return json({ error: "bad_request" }, 400);
  }
  if (action === "remove_post") {
    if (rep.target_type !== "post") return json({ error: "bad_request" }, 400);
    await p.query("UPDATE community_posts SET status = 'removed', reviewed_by = $2, reviewed_at = now() WHERE id = $1", [rep.target_id, g.me.id]);
    await dropPostMedia(rep.target_id);
  }
  if (action === "suspend") await p.query("UPDATE community_profiles SET suspended = true WHERE user_id = $1", [rep.reported_id]);
  await p.query("UPDATE community_reports SET status = $2, handled_by = $3, handled_at = now() WHERE id = $1", [rep.id, action === "dismiss" ? "dismissed" : "resolved", g.me.id]);
  await logAdmin(g.me.id, `report_${action}`, Number(rep.reported_id), { type: rep.target_type }, Number(rep.id));
  return json({ ok: true }, 200, NO_STORE);
}
