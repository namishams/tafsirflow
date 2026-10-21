import type { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { cardsFor } from "@/app/api/mentoring/_lib/mentoring";
import { MIN_POST_AGE, MIN_VIEW_AGE, NOT_BLOCKED, ageOf, connected, talentGate } from "@/lib/talents";
import { countOf } from "@/lib/counts";

// Live teacher–student link. The student invites an accepted connection (or an accepted mentoring master) and consents
// to share an aggregate snapshot; the teacher sees a dashboard. Aggregates only: plan, grade, itqan scores per
// surah/juz, the last 28 days, counts of weak spots. No recordings, no answers, no verse lists beyond the plan.
// Revoking deletes the row and with it the copy. Tables: teacher_shares, teacher_suggestions (db/schema.sql).

export const CONSENT_VERSION = 1;
export const MAX_TEACHERS = 5;
export const MAX_STUDENTS = 200;
export const MAX_OPEN = 5; // open suggestions per link
export const PRESETS = ["keep_going", "well_done", "gentle_reminder", "take_your_time"] as const;
export type Preset = (typeof PRESETS)[number];
export const bad = (error: string, status = 400) => json({ error }, status);

/** 16+ and signed in, a confirmed profile for writes; the same line as mentoring */
export const teacherGate = (req: NextRequest, key: string, max: number, write = false, windowMs = 60_000) =>
  talentGate(req, `teacher-${key}`, max, { minAge: MIN_VIEW_AGE, write, needProfile: write, windowMs });

/** the student's own age line: 16+, or 13–15 with the parental consent flag */
export const needsParental = (birthYear: number | null | undefined) => {
  const a = ageOf(birthYear);
  return a !== null && a < MIN_POST_AGE;
};

/** teacher candidates: an accepted connection or an accepted mentoring master, not blocked, 16+ */
export async function mayTeach(studentId: number, teacherId: number): Promise<boolean> {
  const p = pool()!;
  const ok = await p.query(`SELECT 1 FROM community_profiles c WHERE c.user_id = $2 AND NOT c.suspended AND ${NOT_BLOCKED("c.user_id")}`, [studentId, teacherId]);
  if (!ok.rows[0]) return false;
  const age = await p.query("SELECT birth_year FROM users WHERE id = $1", [teacherId]);
  const a = ageOf(age.rows[0]?.birth_year);
  if (a === null || a < MIN_POST_AGE) return false;
  if (await connected(studentId, teacherId)) return true;
  const m = await p.query("SELECT 1 FROM mentoring_links WHERE student_id = $1 AND master_id = $2 AND status = 'accepted'", [studentId, teacherId]);
  return !!m.rows[0];
}

// ——— snapshot ———
type Tup = number[];
export type ServerSnapshot = {
  v: 1; at: number; streak: number; wirdStreak: number; memorised: number; overall: number | null; grade: number;
  plan: { sabaq: [number, number, number][]; sabqi: number; manzil: number; minutes: number; cycle: [number, number] };
  surahs: [number, number, number, number][]; juz: [number, number, number, number][];
  log: [number, number][];
  weak: { total: number; lapses: number; fading: number; words: number; mut: number };
  itqan: { surahs: number; juz: number };
};
const int = (v: unknown, lo: number, hi: number): number | null => {
  const n = typeof v === "number" ? Math.round(v) : NaN;
  return Number.isFinite(n) && n >= lo && n <= hi ? n : null;
};
const tuples = (v: unknown, n: number, max: number, ok: (t: number[]) => boolean): number[][] | null => {
  if (!Array.isArray(v) || v.length > max) return null;
  const out: number[][] = [];
  for (const x of v) {
    if (!Array.isArray(x) || x.length !== n) return null;
    const t = x.map((y) => (typeof y === "number" && Number.isFinite(y) ? Math.round(y) : NaN));
    if (t.some(Number.isNaN) || !ok(t)) return null;
    out.push(t);
  }
  return out;
};

/** validates and caps what the app sends; unknown fields are dropped */
export function cleanSnapshot(raw: unknown): ServerSnapshot | null {
  const r = raw as Record<string, unknown> | null;
  if (!r || typeof r !== "object" || r.v !== 1) return null;
  const streak = int(r.streak, 0, 100000), wirdStreak = int(r.wirdStreak, 0, 100000), memorised = int(r.memorised, 0, 6236);
  const grade = int(r.grade, 0, 12);
  const overall = r.overall === null ? null : int(r.overall, 0, 100);
  if (streak === null || wirdStreak === null || memorised === null || grade === null || overall === undefined) return null;
  const p = r.plan as Record<string, unknown> | undefined;
  if (!p) return null;
  const sabaq = tuples(p.sabaq, 3, 12, (t) => t[0] >= 1 && t[0] <= 114 && t[1] >= 1 && t[2] >= t[1] && t[2] <= countOf(t[0]));
  const cyc = tuples([p.cycle], 2, 1, (t) => t[0] >= 0 && t[0] <= 400 && t[1] >= 0 && t[1] <= 400);
  const sabqi = int(p.sabqi, 0, 6236), manzil = int(p.manzil, 0, 6236), minutes = int(p.minutes, 0, 600);
  const cell = (max: number) => (t: number[]) => t[0] >= 1 && t[0] <= max && t[1] >= 0 && t[1] <= 6236 && t[2] >= 0 && t[2] <= 6236 && t[3] >= 0 && t[3] <= 100;
  const surahs = tuples(r.surahs, 4, 114, cell(114)), juz = tuples(r.juz, 4, 30, cell(30));
  const log = tuples(r.log, 2, 28, (t) => t[0] >= 0 && t[0] < 1e6 && t[1] >= 0 && t[1] <= 7);
  const w = (r.weak ?? {}) as Record<string, unknown>;
  const weak = { total: int(w.total, 0, 6236), lapses: int(w.lapses, 0, 6236), fading: int(w.fading, 0, 6236), words: int(w.words, 0, 6236), mut: int(w.mut, 0, 6236) };
  const it = (r.itqan ?? {}) as Record<string, unknown>;
  const itqan = { surahs: int(it.surahs, 0, 114), juz: int(it.juz, 0, 30) };
  if (!sabaq || !cyc || sabqi === null || manzil === null || minutes === null || !surahs || !juz || !log) return null;
  if (Object.values(weak).some((x) => x === null) || itqan.surahs === null || itqan.juz === null) return null;
  return {
    v: 1, at: Date.now(), streak, wirdStreak, memorised, overall, grade,
    plan: { sabaq: sabaq as [number, number, number][], sabqi, manzil, minutes, cycle: cyc[0] as [number, number] },
    surahs: surahs as ServerSnapshot["surahs"], juz: juz as ServerSnapshot["juz"], log: log as [number, number][],
    weak: weak as ServerSnapshot["weak"], itqan: itqan as ServerSnapshot["itqan"],
  };
}

/** what the dashboard row needs from a snapshot (days are app day numbers, the last log entry is "today") */
export function digest(s: ServerSnapshot | null, syncedAt: Date | string | null) {
  if (!s) return null;
  const log = s.log ?? [];
  const activeDays = log.filter(([, b]) => b > 0).length;
  const lastIdx = (() => { for (let i = log.length - 1; i >= 0; i--) if (log[i][1] > 0) return i; return -1; })();
  const idle = lastIdx < 0 ? null : log.length - 1 - lastIdx; // days since the last active day (as of the sync)
  return { memorised: s.memorised, overall: s.overall, grade: s.grade, streak: s.wirdStreak, activeDays, idle, weak: s.weak.total, itqan: s.itqan, minutes: s.plan.minutes, syncedAt };
}

export const suggestionJson = (x: Record<string, unknown>) => ({
  id: String(x.id), kind: String(x.kind), preset: (x.preset as string | null) ?? null,
  surah: x.surah === null ? null : Number(x.surah), from: x.from_verse === null ? null : Number(x.from_verse), to: x.to_verse === null ? null : Number(x.to_verse),
  status: String(x.status), at: x.created_at,
});

export { cardsFor };

/** open and accepted suggestions for a student, newest first, with the teacher's card */
export async function inboxFor(studentId: number) {
  const r = await pool()!.query(
    `SELECT s.*, h.teacher_id, h.id AS share_id FROM teacher_suggestions s JOIN teacher_shares h ON h.id = s.share_id
      WHERE h.student_id = $1 AND h.status = 'active' AND s.status IN ('open','accepted') ORDER BY s.created_at DESC LIMIT 50`,
    [studentId],
  );
  const cards = await cardsFor(r.rows.map((x) => Number(x.teacher_id)));
  return r.rows.map((x) => ({ ...suggestionJson(x), shareId: String(x.share_id), teacher: cards.get(Number(x.teacher_id)) ?? null }));
}
