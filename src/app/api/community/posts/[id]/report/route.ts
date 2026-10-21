import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, REPORT_CATEGORIES, line, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

// POST { category, reason }: report a clip; it shows up in the admin queue with the clip
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "report-post", 10, { windowMs: 60 * 60_000, write: true });
  if (g.res) return g.res;
  const id = (await params).id;
  if (!/^\d{1,18}$/.test(id)) return json({ error: "not_found" }, 404);
  const p = pool()!;
  const post = (await p.query("SELECT id, author_id FROM community_posts WHERE id = $1 AND status = 'approved' AND author_id <> $2", [id, g.me.id])).rows[0];
  if (!post) return json({ error: "not_found" }, 404);
  const b = (await req.json().catch(() => ({}))) as { category?: unknown; reason?: unknown };
  const category = typeof b.category === "string" && REPORT_CATEGORIES.includes(b.category) ? b.category : "other";
  const dup = await p.query("SELECT 1 FROM community_reports WHERE reporter_id = $1 AND target_type = 'post' AND target_id = $2 AND status = 'open'", [g.me.id, post.id]);
  if (!dup.rows[0]) {
    await p.query("INSERT INTO community_reports (reporter_id, reported_id, reason, category, target_type, target_id) VALUES ($1,$2,$3,$4,'post',$5)",
      [g.me.id, post.author_id, line(b.reason, 300), category, post.id]);
  }
  return json({ reported: true }, 200, NO_STORE);
}
