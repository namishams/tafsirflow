import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "@/lib/db";
import { mediaDir, removeMedia } from "@/lib/media";
import { cardsFor } from "@/lib/teacherShare";

// Recordings for a teacher (Shams 3.0): a student sends one recording over an active teacher link; only the student
// and that teacher can open it; the teacher answers once with a rubric (1–5 per area, each optional), marked words
// and a short checked text. Files in MEDIA_DIR/teacher-rec, deleted after 60 days, on withdrawal and as orphans.
// Tables teacher_recitations, teacher_recitation_reviews (db/schema.sql). Never ids of people in responses.

export const REC_DIR = "teacher-rec";
export const KINDS = ["blind", "talaqqi", "drill", "makhraj"] as const;
export type Kind = (typeof KINDS)[number];
export const MIN_MS: Record<Kind, number> = { makhraj: 5_000, drill: 30_000, talaqqi: 30_000, blind: 30_000 };
export const MAX_MS = 5 * 60_000;
export const MAX_OPEN_PER_SHARE = 10;
export const RUBRIC = ["makharij", "tajweed", "waqf", "pace"] as const;
export const MAX_MARKS = 120;

export type RecRow = Record<string, unknown> & {
  id: string; share_id: string; student_id: string; teacher_id: string; kind: Kind; surah: number | null; from_verse: number | null; to_verse: number | null;
  letter: string | null; duration_ms: number; summary: unknown; media_path: string | null; media_mime: string | null; status: string;
  created_at: Date; expires_at: Date; share_status: string | null;
  rv_id: string | null; rv_makharij: number | null; rv_tajweed: number | null; rv_waqf: number | null; rv_pace: number | null; rv_marks: unknown; rv_body: string | null; rv_at: Date | null;
};
export const REC_SELECT = `SELECT r.*, h.status AS share_status,
    v.id AS rv_id, v.makharij AS rv_makharij, v.tajweed AS rv_tajweed, v.waqf AS rv_waqf, v.pace AS rv_pace, v.marks AS rv_marks, v.body AS rv_body, v.updated_at AS rv_at
  FROM teacher_recitations r LEFT JOIN teacher_shares h ON h.id = r.share_id LEFT JOIN teacher_recitation_reviews v ON v.recitation_id = r.id`;

/** the structured summary (no free text): own rating 1–5, ear-training answers, words heard */
export function cleanSummary(raw: unknown): Record<string, number> {
  let o: unknown = raw;
  if (typeof raw === "string") { try { o = JSON.parse(raw.slice(0, 400)); } catch { o = {}; } }
  const r = (o && typeof o === "object" ? o : {}) as Record<string, unknown>;
  const out: Record<string, number> = {};
  const int = (k: string, lo: number, hi: number) => { const n = Math.round(Number(r[k])); if (Number.isFinite(n) && n >= lo && n <= hi && r[k] !== null && r[k] !== undefined && r[k] !== "") out[k] = n; };
  int("self", 1, 5); int("quizOk", 0, 999); int("quizMiss", 0, 999); int("heardOk", 0, 9999); int("heardTotal", 0, 9999);
  return out;
}

/** word refs "s:v:p" inside the recitation's range (unique, bounded) */
export function cleanMarks(raw: unknown, r: { surah: number | null; from_verse: number | null; to_verse: number | null }): string[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.length > MAX_MARKS) return null;
  const out = new Set<string>();
  for (const x of raw) {
    const m = typeof x === "string" ? /^(\d{1,3}):(\d{1,3}):(\d{1,3})$/.exec(x) : null;
    if (!m || !r.surah) return null;
    const s = Number(m[1]), v = Number(m[2]), p = Number(m[3]);
    if (s !== r.surah || v < Number(r.from_verse) || v > Number(r.to_verse) || p < 1) return null;
    out.add(`${s}:${v}:${p}`);
  }
  return [...out];
}

export function recJson(r: RecRow, cards: Map<number, unknown>, opts: { hideReviewText?: boolean } = {}) {
  const review = r.rv_id ? {
    id: String(r.rv_id), marks: Array.isArray(r.rv_marks) ? (r.rv_marks as string[]) : [], text: opts.hideReviewText ? "" : String(r.rv_body ?? ""), at: r.rv_at,
    ...Object.fromEntries(RUBRIC.flatMap((k) => (r[`rv_${k}`] === null || r[`rv_${k}`] === undefined ? [] : [[k, Number(r[`rv_${k}`])]]))),
  } : null;
  return {
    id: String(r.id), kind: r.kind, surah: r.surah === null ? null : Number(r.surah), from: r.from_verse === null ? null : Number(r.from_verse), to: r.to_verse === null ? null : Number(r.to_verse),
    letter: r.letter ?? null, durationMs: Number(r.duration_ms), summary: cleanSummary(r.summary), status: r.status === "reviewed" ? "reviewed" : "open",
    at: r.created_at, expiresAt: r.expires_at, hasAudio: !!r.media_path,
    student: cards.get(Number(r.student_id)) ?? null, teacher: cards.get(Number(r.teacher_id)) ?? null, review,
  };
}

/** a recitation with the caller's role: the student, or the teacher while the link is active; blocked pairs see nothing */
export async function loadFor(id: string, meId: number): Promise<{ r: RecRow; role: "student" | "teacher" } | null> {
  if (!/^\d{1,18}$/.test(id)) return null;
  const q = await pool()!.query(
    `${REC_SELECT} WHERE r.id = $2 AND r.status <> 'withdrawn' AND (r.student_id = $1 OR r.teacher_id = $1)
       AND NOT EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = r.student_id AND b.blocked_id = r.teacher_id) OR (b.blocker_id = r.teacher_id AND b.blocked_id = r.student_id))`,
    [meId, id],
  );
  const r = q.rows[0] as RecRow | undefined;
  if (!r) return null;
  if (Number(r.student_id) === meId) return { r, role: "student" };
  if (r.share_status !== "active") return null;
  return { r, role: "teacher" };
}

export async function cardsOf(rows: RecRow[]) {
  return cardsFor(rows.flatMap((x) => [Number(x.student_id), Number(x.teacher_id)])) as Promise<Map<number, unknown>>;
}

// ——— retention: files are deleted 60 days after upload; rows of ended links go by cascade, their files as orphans ———
let lastPurge = 0;
export async function purgeRecitations(force = false) {
  if (!force && Date.now() - lastPurge < 60 * 60_000) return;
  lastPurge = Date.now();
  const p = pool();
  if (!p) return;
  try {
    const r = await p.query("SELECT id, media_path FROM teacher_recitations WHERE media_path IS NOT NULL AND expires_at < now() LIMIT 500");
    for (const x of r.rows) {
      await removeMedia(x.media_path);
      await p.query("UPDATE teacher_recitations SET media_path = NULL, deleted_at = now() WHERE id = $1", [x.id]);
    }
    const dir = await mediaDir();
    if (!dir) return;
    const files = await fs.readdir(path.join(dir, REC_DIR)).catch(() => [] as string[]);
    if (!files.length) return;
    const known = await p.query("SELECT media_path FROM teacher_recitations WHERE media_path IS NOT NULL");
    const keep = new Set(known.rows.map((x) => String(x.media_path)));
    for (const f of files) {
      const rel = `${REC_DIR}/${f}`;
      if (keep.has(rel)) continue;
      const st = await fs.stat(path.join(dir, rel)).catch(() => null);
      if (st && Date.now() - st.mtimeMs > 60 * 60_000) await removeMedia(rel); // never an upload in progress
    }
  } catch { /* tables not created yet */ }
}
