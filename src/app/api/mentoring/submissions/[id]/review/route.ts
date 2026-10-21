import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { para } from "@/lib/talents";
import { bad, checkText, mentorGate, rubricOf } from "../../../_lib/mentoring";
import { loadSubmission, roleOf } from "../../../_lib/submissions";

export const dynamic = "force-dynamic";

// { makharij, tajweed, waqf, pace, maqam: 1..5, text <= 600 }; the linked master (mentoring) or jury/admin (season); one review each
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await mentorGate(req, "review", 60, true);
  if (g.res) return g.res;
  const me = g.me, p = pool()!;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const rubric = rubricOf(body);
  if (!rubric) return bad("bad_rubric");
  const text = para(body.text, 600);
  const t = await checkText(text);
  if (!t.ok) return bad("text_not_allowed");
  const r = await loadSubmission((await params).id);
  const role = r ? await roleOf(me, r) : null;
  if (!r || !role) return bad("not_found", 404);
  if (role === "student" || Number(r.student_id) === me.id) return bad("not_allowed", 403);
  if (!r.media_path) return bad("gone", 410);
  if (r.season_id && !["open", "judging"].includes(String(r.season_status))) return bad("season_closed", 409);
  const ins = await p.query(
    `INSERT INTO mentoring_reviews (submission_id, reviewer_id, makharij, tajweed, waqf, pace, maqam, body, flagged)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (submission_id, reviewer_id) DO NOTHING RETURNING id`,
    [r.id, me.id, rubric.makharij, rubric.tajweed, rubric.waqf, rubric.pace, rubric.maqam, text, t.flagged],
  );
  if (!ins.rows[0]) return bad("exists", 409);
  await p.query("UPDATE mentoring_submissions SET status = 'reviewed' WHERE id = $1 AND status = 'pending'", [r.id]);
  return json({ ok: true });
}
