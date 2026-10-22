import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { para } from "@/lib/talents";
import { bad, teacherGate } from "@/lib/teacherShare";
import { checkText } from "@/app/api/mentoring/_lib/mentoring";
import { RUBRIC, cleanMarks, loadFor } from "@/lib/teacherRecitations";

export const dynamic = "force-dynamic";

// The teacher's feedback: { makharij?, tajweed?, waqf?, pace?: 1..5, marks: ["s:v:p", …], text <= 600 }. At least one
// rating, a mark or a text; sending again replaces the earlier feedback. Ratings are the teacher's judgement – the app
// stores them as such (rubric side "teacher"), never as a measurement.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await teacherGate(req, "rec-review", 60, true);
  if (g.res) return g.res;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const hit = await loadFor((await params).id, g.me.id);
  if (!hit || hit.role !== "teacher") return bad("not_found", 404);
  const scores: Record<string, number | null> = {};
  for (const k of RUBRIC) {
    const v = body[k];
    if (v === undefined || v === null || v === "") { scores[k] = null; continue; }
    const n = Math.round(Number(v));
    if (!(n >= 1 && n <= 5)) return bad("bad_rubric");
    scores[k] = n;
  }
  const marks = cleanMarks(body.marks, hit.r);
  if (!marks) return bad("bad_marks");
  const text = para(body.text, 600);
  if (!text && !marks.length && Object.values(scores).every((x) => x === null)) return bad("empty");
  const t = await checkText(text);
  if (!t.ok) return bad("text_not_allowed");
  const p = pool()!;
  await p.query(
    `INSERT INTO teacher_recitation_reviews (recitation_id, teacher_id, makharij, tajweed, waqf, pace, marks, body, flagged)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (recitation_id) DO UPDATE SET makharij = $3, tajweed = $4, waqf = $5, pace = $6, marks = $7, body = $8, flagged = $9, updated_at = now()`,
    [hit.r.id, g.me.id, scores.makharij, scores.tajweed, scores.waqf, scores.pace, JSON.stringify(marks), text, t.flagged],
  );
  await p.query("UPDATE teacher_recitations SET status = 'reviewed' WHERE id = $1 AND status = 'open'", [hit.r.id]);
  return json({ ok: true });
}
