import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, REPORT_CATEGORIES } from "@/lib/talents";
import { bad, mentorGate } from "../../../_lib/mentoring";
import { loadSubmission, roleOf } from "../../../_lib/submissions";

export const dynamic = "force-dynamic";

// Report a mentoring recording (with its note) or one review of it to the moderators (App Store guideline 1.2).
// { category, reason?, review? }: without "review" the recording is reported (its author), with a review id that
// review (its reviewer). Same queue as profiles and messages (community_reports, target_type 'mentoring_submission'
// or 'mentoring_review'); only someone who can open the submission can report it, and anonymous season entries stay
// anonymous (the member is shown to admins only). One open report per reporter and target.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await mentorGate(req, "report", 10, true, 60 * 60_000);
  if (g.res) return g.res;
  const me = g.me, p = pool()!;
  const b = (await req.json().catch(() => ({}))) as { category?: unknown; reason?: unknown; review?: unknown };
  const category = typeof b.category === "string" && REPORT_CATEGORIES.includes(b.category) ? b.category : "";
  if (!category) return bad("bad_request");
  const reason = typeof b.reason === "string" ? b.reason.trim().slice(0, 300) : "";
  const r = await loadSubmission((await params).id);
  const role = r ? await roleOf(me, r) : null;
  if (!r || !role) return bad("not_found", 404);
  let type = "mentoring_submission", target = Number(r.id), reported = Number(r.student_id);
  if (b.review !== undefined && b.review !== null && b.review !== "") {
    if (typeof b.review !== "string" || !/^\d{1,18}$/.test(b.review)) return bad("bad_request");
    const rv = (await p.query("SELECT id, reviewer_id FROM mentoring_reviews WHERE id = $1 AND submission_id = $2", [b.review, r.id])).rows[0];
    // a juror sees only the own review, so only the student and the linked master can report other reviews
    if (!rv || (role === "jury" && Number(rv.reviewer_id) !== me.id)) return bad("not_found", 404);
    type = "mentoring_review"; target = Number(rv.id); reported = Number(rv.reviewer_id);
  }
  if (reported === me.id) return bad("self");
  const dup = await p.query("SELECT 1 FROM community_reports WHERE reporter_id = $1 AND target_type = $2 AND target_id = $3 AND status = 'open'", [me.id, type, target]);
  if (!dup.rows[0]) {
    await p.query("INSERT INTO community_reports (reporter_id, reported_id, reason, category, target_type, target_id) VALUES ($1,$2,$3,$4,$5,$6)",
      [me.id, reported, reason, category, type, target]);
  }
  return json({ reported: true }, 200, NO_STORE);
}
