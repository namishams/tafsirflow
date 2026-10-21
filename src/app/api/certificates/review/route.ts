import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { json, rateLimited, sameOrigin } from "@/lib/http";
import { courseName, isReviewer, purgeOldRecordings } from "../lib";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "private, no-store" };

// Review queue for the highest certificates: admins and verified masters/sheikhs listen to the recording, look at the
// result and approve (certificate becomes valid) or decline with a short note. Nobody reviews their own certificate.
export async function GET(req: NextRequest) {
  if (!pool()) return json({ items: [] });
  const me = await currentUser();
  if (!(await isReviewer(me))) return json({ error: "forbidden" }, 403);
  void purgeOldRecordings();
  const status = req.nextUrl.searchParams.get("status") === "done" ? "done" : "open";
  const locale = req.nextUrl.searchParams.get("locale") ?? "en";
  const r = await pool()!.query(
    `SELECT q.id, q.status, q.note, q.created_at, q.reviewed_at, q.recording_path IS NOT NULL AS has_recording, q.recording_deleted_at,
            c.code, c.course, c.holder_name, c.pct, c.user_id,
            a.score, a.total, a.word_score, a.duration_ms, a.flags, a.started_at, a.submitted_at, a.platform
       FROM review_queue q JOIN certificates c ON c.id = q.certificate_id LEFT JOIN exam_attempts a ON a.id = q.attempt_id
      WHERE ${status === "open" ? "q.status = 'open'" : "q.status <> 'open'"}
      ORDER BY ${status === "open" ? "q.created_at ASC" : "q.reviewed_at DESC"} LIMIT 200`);
  return json({
    items: r.rows.map((x) => ({
      id: Number(x.id), status: x.status, note: x.note, createdAt: x.created_at, reviewedAt: x.reviewed_at, hasRecording: x.has_recording, recordingDeleted: !!x.recording_deleted_at,
      code: x.code, course: x.course, title: courseName(x.course, locale), holder: x.holder_name, pct: x.pct, own: Number(x.user_id) === me!.id,
      score: x.score, total: x.total, wordScore: x.word_score, durationMs: x.duration_ms, flags: x.flags ?? [], startedAt: x.started_at, submittedAt: x.submitted_at, platform: x.platform,
    })),
  }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const p = pool();
  if (!p) return json({ error: "unavailable" }, 503);
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const me = await currentUser();
  if (!me || !(await isReviewer(me))) return json({ error: "forbidden" }, 403);
  if (rateLimited(`cert-review:${me.id}`, 120, 3600_000)) return json({ error: "rate" }, 429);
  const b = (await req.json().catch(() => ({}))) as { id?: number; decision?: string; note?: string };
  const id = Number(b.id);
  if (!Number.isSafeInteger(id) || !["approve", "reject"].includes(String(b.decision))) return json({ error: "invalid" }, 400);
  const note = String(b.note ?? "").trim().slice(0, 500);
  if (b.decision === "reject" && note.length < 3) return json({ error: "note" }, 400);
  const q = (await p.query("SELECT q.id, q.certificate_id, q.recording_path, c.user_id FROM review_queue q JOIN certificates c ON c.id = q.certificate_id WHERE q.id = $1 AND q.status = 'open'", [id])).rows[0];
  if (!q) return json({ error: "not_found" }, 404);
  if (Number(q.user_id) === me.id) return json({ error: "own" }, 403);
  if (b.decision === "approve" && !q.recording_path) return json({ error: "no_recording" }, 409);
  const approve = b.decision === "approve";
  await p.query("UPDATE review_queue SET status = $2, reviewer_id = $3, reviewed_at = now(), note = $4 WHERE id = $1", [id, approve ? "approved" : "rejected", me.id, note]);
  await p.query("UPDATE certificates SET status = $2, decided_at = now() WHERE id = $1 AND status = 'pending'", [q.certificate_id, approve ? "valid" : "rejected"]);
  return json({ ok: true });
}
