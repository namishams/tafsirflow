import { promises as fs } from "node:fs";
import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { json, rateLimited, sameOrigin } from "@/lib/http";
import { MAX_RECORDING, RECORDINGS_DIR, courseOf, purgeOldRecordings, recordingFile, type ExamKind } from "../lib";

export const dynamic = "force-dynamic";

// POST multipart: attempt (id), file (audio). The recording of a passed exam whose certificate waits for review.
// Stored in a private folder (not served by nginx), only reviewers can play it, deleted after 90 days.
const TYPES: Record<string, string> = { "audio/wav": "wav", "audio/x-wav": "wav", "audio/wave": "wav", "audio/x-caf": "caf", "audio/mp4": "m4a", "audio/m4a": "m4a", "audio/x-m4a": "m4a", "audio/aac": "aac", "audio/webm": "webm", "audio/mpeg": "mp3", "audio/ogg": "ogg" };

export async function POST(req: NextRequest) {
  const p = pool();
  if (!p) return json({ error: "unavailable" }, 503);
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  if (rateLimited(`exam-rec:${me.id}`, 10, 3600_000)) return json({ error: "rate" }, 429);
  if (Number(req.headers.get("content-length") ?? 0) > MAX_RECORDING + 64 * 1024) return json({ error: "too_large" }, 413);
  const form = await req.formData().catch(() => null);
  const id = Number(form?.get("attempt"));
  const file = form?.get("file");
  if (!Number.isSafeInteger(id) || id <= 0 || !(file instanceof Blob)) return json({ error: "invalid" }, 400);
  if (file.size < 1000 || file.size > MAX_RECORDING) return json({ error: file.size > MAX_RECORDING ? "too_large" : "invalid" }, 400);
  const mime = (file.type || "").split(";")[0].toLowerCase();
  const ext = TYPES[mime];
  if (!ext) return json({ error: "type" }, 415);

  const a = (await p.query("SELECT id, exam, ref, passed, status FROM exam_attempts WHERE id = $1 AND user_id = $2", [id, me.id])).rows[0];
  if (!a || a.status !== "submitted" || !a.passed) return json({ error: "not_found" }, 404);
  const course = courseOf(a.exam as ExamKind, String(a.ref));
  const q = course ? (await p.query(
    `SELECT q.id, q.recording_path FROM review_queue q JOIN certificates c ON c.id = q.certificate_id
      WHERE c.user_id = $1 AND c.course = $2 AND c.status = 'pending' AND q.status = 'open' ORDER BY q.id DESC LIMIT 1`, [me.id, course])).rows[0] : null;
  if (!q) return json({ error: "no_review" }, 409);

  await fs.mkdir(RECORDINGS_DIR, { recursive: true, mode: 0o700 });
  const dest = recordingFile(id, ext);
  await fs.writeFile(dest, Buffer.from(await file.arrayBuffer()), { mode: 0o600 });
  if (q.recording_path) await fs.unlink(q.recording_path).catch(() => undefined);
  await p.query("UPDATE review_queue SET recording_path = $2, recording_mime = $3, recording_bytes = $4, attempt_id = $5, created_at = now() WHERE id = $1", [q.id, dest, mime, file.size, id]);
  void purgeOldRecordings();
  return json({ ok: true });
}
