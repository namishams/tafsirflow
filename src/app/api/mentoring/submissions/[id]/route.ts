import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE } from "@/lib/talents";
import { bad, mentorGate, reviewJson } from "../../_lib/mentoring";
import { cardsFor, isAnonymous, loadSubmission, removeMedia, roleOf, submissionJson } from "../../_lib/submissions";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const g = await mentorGate(req, "sub", 240);
  if (g.res) return g.res;
  const me = g.me, p = pool()!;
  const r = await loadSubmission((await params).id);
  const role = r ? await roleOf(me, r) : null;
  if (!r || !role) return bad("not_found", 404);
  const anon = isAnonymous(r, role);
  const rv = await p.query("SELECT * FROM mentoring_reviews WHERE submission_id = $1 ORDER BY created_at", [r.id]);
  const mine = rv.rows.some((x) => Number(x.reviewer_id) === me.id);
  // members the caller blocked or who blocked the caller disappear: their reviews and their member card (guideline 1.2)
  const blocked = new Set((await p.query(
    "SELECT CASE WHEN blocker_id = $1 THEN blocked_id ELSE blocker_id END AS other FROM community_blocks WHERE blocker_id = $1 OR blocked_id = $1", [me.id],
  )).rows.map((x) => Number(x.other)));
  // a juror sees only the own review (no anchoring); season reviewers stay anonymous towards the student
  const shown = role === "jury" ? rv.rows.filter((x) => Number(x.reviewer_id) === me.id) : rv.rows.filter((x) => !blocked.has(Number(x.reviewer_id)));
  const ids = [Number(r.student_id), ...(r.master_id ? [Number(r.master_id)] : []), ...(r.season_id ? [] : shown.map((x) => Number(x.reviewer_id)))];
  const cards = await cardsFor(ids);
  const seasonLive = !r.season_id || ["open", "judging"].includes(String(r.season_status));
  const canReview = !mine && Number(r.student_id) !== me.id && role !== "student" && seasonLive && !!r.media_path;
  return json({
    submission: submissionJson(r, anon ? null : cards.get(Number(r.student_id)) ?? null, anon || !r.master_id || blocked.has(Number(r.master_id)) ? null : cards.get(Number(r.master_id)) ?? null, { hideStats: role === "jury" && !!r.season_id, hideNote: anon }),
    role,
    reviews: shown.map((x) => reviewJson(x, r.season_id ? null : cards.get(Number(x.reviewer_id)) ?? null)),
    canReview,
  }, 200, NO_STORE);
}

// withdraw (owner): the file is deleted at once, the row stays as "withdrawn"
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const g = await mentorGate(req, "sub-del", 30, true);
  if (g.res) return g.res;
  const r = await loadSubmission((await params).id);
  if (!r || Number(r.student_id) !== g.me.id) return bad("not_found", 404);
  if (r.season_id && r.season_status !== "open") return bad("season_closed", 409);
  await pool()!.query("UPDATE mentoring_submissions SET status = 'withdrawn', media_path = NULL, deleted_at = now() WHERE id = $1", [r.id]);
  await removeMedia(r.media_path);
  return json({ ok: true });
}
