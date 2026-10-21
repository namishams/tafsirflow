import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, REPORT_CATEGORIES, line, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

// POST { category, reason }: report a comment
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "report-comment", 10, { windowMs: 60 * 60_000, write: true });
  if (g.res) return g.res;
  const id = (await params).id;
  if (!/^\d{1,18}$/.test(id)) return json({ error: "not_found" }, 404);
  const p = pool()!;
  const k = (await p.query("SELECT id, author_id FROM community_post_comments WHERE id = $1 AND removed_at IS NULL AND author_id <> $2", [id, g.me.id])).rows[0];
  if (!k) return json({ error: "not_found" }, 404);
  const b = (await req.json().catch(() => ({}))) as { category?: unknown; reason?: unknown };
  const category = typeof b.category === "string" && REPORT_CATEGORIES.includes(b.category) ? b.category : "other";
  const dup = await p.query("SELECT 1 FROM community_reports WHERE reporter_id = $1 AND target_type = 'comment' AND target_id = $2 AND status = 'open'", [g.me.id, k.id]);
  if (!dup.rows[0]) await p.query("INSERT INTO community_reports (reporter_id, reported_id, reason, category, target_type, target_id) VALUES ($1,$2,$3,$4,'comment',$5)", [g.me.id, k.author_id, line(b.reason, 300), category, k.id]);
  return json({ reported: true }, 200, NO_STORE);
}
