import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, REPORT_CATEGORIES } from "@/lib/talents";
import { bad, teacherGate } from "@/lib/teacherShare";
import { loadFor } from "@/lib/teacherRecitations";

export const dynamic = "force-dynamic";

// Report to the moderators (App Store guideline 1.2): the teacher reports a recording (its student), the student
// reports the feedback (its teacher) with { review: true }. Same queue as profiles and mentoring (community_reports,
// target_type 'teacher_recitation' / 'teacher_review'); one open report per reporter and target.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await teacherGate(req, "rec-report", 10, true, 60 * 60_000);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { category?: unknown; reason?: unknown; review?: unknown };
  const category = typeof b.category === "string" && REPORT_CATEGORIES.includes(b.category) ? b.category : "";
  if (!category) return bad("bad_request");
  const reason = typeof b.reason === "string" ? b.reason.trim().slice(0, 300) : "";
  const hit = await loadFor((await params).id, g.me.id);
  if (!hit) return bad("not_found", 404);
  const p = pool()!;
  let type = "teacher_recitation", target = Number(hit.r.id), reported = Number(hit.r.student_id);
  if (b.review === true) {
    if (hit.role !== "student" || !hit.r.rv_id) return bad("not_found", 404);
    type = "teacher_review"; target = Number(hit.r.rv_id); reported = Number(hit.r.teacher_id);
  } else if (hit.role !== "teacher") return bad("self");
  const dup = await p.query("SELECT 1 FROM community_reports WHERE reporter_id = $1 AND target_type = $2 AND target_id = $3 AND status = 'open'", [g.me.id, type, target]);
  if (!dup.rows[0]) {
    await p.query("INSERT INTO community_reports (reporter_id, reported_id, reason, category, target_type, target_id) VALUES ($1,$2,$3,$4,$5,$6)",
      [g.me.id, reported, reason, category, type, target]);
  }
  return json({ reported: true }, 200, NO_STORE);
}
