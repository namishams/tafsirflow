import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, line } from "@/lib/talents";
import { bad, needsParental, teacherGate } from "@/lib/teacherShare";
import { MAX_AUDIO_BYTES, allowedType, removeMedia, storeRecording } from "@/app/api/mentoring/_lib/submissions";
import { KINDS, MAX_MS, MAX_OPEN_PER_SHARE, MIN_MS, REC_DIR, REC_SELECT, cardsOf, cleanSummary, purgeRecitations, recJson, type Kind, type RecRow } from "@/lib/teacherRecitations";
import { countOf } from "@/lib/counts";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Recordings for a teacher (Shams 3.0). GET ?box=mine|inbox: own recordings (student) or the recordings students sent
// (teacher, active links only); blocked pairs are left out either way.
export async function GET(req: NextRequest) {
  const g = await teacherGate(req, "recs", 120);
  if (g.res) return g.res;
  void purgeRecitations();
  const box = req.nextUrl.searchParams.get("box") === "inbox" ? "inbox" : "mine";
  const notBlocked = `NOT EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = r.student_id AND b.blocked_id = r.teacher_id) OR (b.blocker_id = r.teacher_id AND b.blocked_id = r.student_id))`;
  const q = box === "mine"
    ? await pool()!.query(`${REC_SELECT} WHERE r.student_id = $1 AND r.status <> 'withdrawn' AND ${notBlocked} ORDER BY r.created_at DESC LIMIT 100`, [g.me.id])
    : await pool()!.query(`${REC_SELECT} WHERE r.teacher_id = $1 AND r.status <> 'withdrawn' AND h.status = 'active' AND ${notBlocked}
        ORDER BY (r.status = 'open') DESC, r.created_at DESC LIMIT 100`, [g.me.id]);
  const rows = q.rows as RecRow[];
  const cards = await cardsOf(rows);
  return json({ recitations: rows.map((x) => recJson(x, cards)), parentalNeeded: needsParental(g.me.birthYear) }, 200, NO_STORE);
}

// POST multipart: file, shareId, kind, durationMs, surah/from/to (a verse range) or letter, summary (JSON), parental.
// Only over the student's own ACTIVE link, the teacher not blocked; at most 10 waiting per link; 13–15 year olds
// confirm the parent's consent again for every recording.
export async function POST(req: NextRequest) {
  const g = await teacherGate(req, "rec-send", 12, true, 10 * 60_000);
  if (g.res) return g.res;
  const me = g.me, p = pool()!;
  const form = await req.formData().catch(() => null);
  if (!form) return bad("bad_request");
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) return bad("media_missing");
  if (file.size > MAX_AUDIO_BYTES) return bad("media_too_large", 413);
  if (file.type && !allowedType(file.type)) return bad("media_format", 415);
  const kind = KINDS.find((k) => k === form.get("kind")) as Kind | undefined;
  if (!kind) return bad("bad_request");
  const durationMs = Math.round(Number(form.get("durationMs")));
  if (!Number.isFinite(durationMs) || durationMs < MIN_MS[kind] || durationMs > MAX_MS) return bad("bad_duration");
  const shareId = line(form.get("shareId"), 20);
  if (!/^\d{1,18}$/.test(shareId)) return bad("bad_request");
  if (needsParental(me.birthYear) && form.get("parental") !== "1") return bad("parental_required", 403);
  // the verse range (optional for the makhraj coach) and the letter
  let surah: number | null = null, from: number | null = null, to: number | null = null;
  if (form.get("surah")) {
    surah = Number(form.get("surah")); from = Number(form.get("from")); to = Number(form.get("to"));
    if (!Number.isInteger(surah) || surah < 1 || surah > 114 || !Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from || to > countOf(surah) || to - from > 60) return bad("bad_range");
  }
  const letter = kind === "makhraj" ? line(form.get("letter"), 4) || null : null;
  if (kind === "makhraj" && !letter) return bad("bad_request");
  if (kind !== "makhraj" && !surah) return bad("bad_range");
  const share = (await p.query(
    `SELECT h.id, h.teacher_id, h.parental FROM teacher_shares h
      WHERE h.id = $2 AND h.student_id = $1 AND h.status = 'active'
        AND NOT EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = $1 AND b.blocked_id = h.teacher_id) OR (b.blocker_id = h.teacher_id AND b.blocked_id = $1))
        AND NOT EXISTS (SELECT 1 FROM community_profiles c WHERE c.user_id = h.teacher_id AND c.suspended)`,
    [me.id, shareId],
  )).rows[0];
  if (!share) return bad("not_linked", 403);
  if (needsParental(me.birthYear) && !share.parental) return bad("parental_required", 403);
  const open = await p.query("SELECT count(*)::int AS n FROM teacher_recitations WHERE share_id = $1 AND status = 'open'", [share.id]);
  if (Number(open.rows[0].n) >= MAX_OPEN_PER_SHARE) return bad("too_many_open", 409);
  const stored = await storeRecording(Buffer.from(await file.arrayBuffer()), Math.ceil(MAX_MS / 1000), REC_DIR);
  if ("error" in stored) return bad(stored.error, stored.error === "media_unavailable" ? 503 : stored.error === "media_too_large" ? 413 : 415);
  try {
    const r = await p.query(
      `INSERT INTO teacher_recitations (share_id, student_id, teacher_id, kind, surah, from_verse, to_verse, letter, duration_ms, summary, media_path, media_mime)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [share.id, me.id, share.teacher_id, kind, surah, from, to, letter, durationMs, JSON.stringify(cleanSummary(form.get("summary"))), stored.rel, stored.mime],
    );
    return json({ ok: true, id: String(r.rows[0].id) });
  } catch (e) {
    await removeMedia(stored.rel);
    throw e;
  }
}
