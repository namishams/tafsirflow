import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import QRCode from "qrcode";
import { pool } from "@/lib/db";
import { PUBLIC_SITE } from "@/lib/site";
import type { User } from "@/lib/auth";

// Exams, results and verifiable certificates ("keine Schummler"). The app runs the exam on the device; the server
// opens the attempt (start time, nonce, cooldown and weekly limit), receives the result, checks the timing, signs the
// result with an HMAC and issues certificates only from results it has recorded itself. The highest certificates
// (Reciter Path level 10, juz exams, Arabic C1) stay "pending" until an admin or a verified master has listened to
// the recording. Recordings live in a private folder outside the web root and are deleted after 90 days.
// Tables: exam_attempts, certificates, review_queue (db/schema.sql).

export type ExamKind = "rp-level" | "juz" | "surah" | "vocab" | "weekly" | "ar-unit" | "qbank";
export type Rule = {
  /** seconds per question and for the whole exam (the server adds a grace period for the network) */
  questionSec: number; examSec: number;
  /** hours between two attempts at the same exam, attempts per 7 days */
  cooldownH: number; maxPerWeek: number;
  /** a recitation part: on-device word check at least `threshold`, plus a recording */
  recitation?: { threshold: number };
  /** certificate only after a person has reviewed recording and result */
  review?: boolean;
  pass: number;
};

/** Arabic course: CEFR levels and the last unit test of each (mobile src/features/arabic-lang/curriculum.ts) */
export const AR_LEVELS: { level: string; lastUnit: number }[] = [
  { level: "A1", lastUnit: 3 }, { level: "A2", lastUnit: 5 }, { level: "B1", lastUnit: 8 }, { level: "B2", lastUnit: 10 }, { level: "C1", lastUnit: 16 },
];
const arLevelOf = (unit: number) => AR_LEVELS.find((l) => l.lastUnit === unit)?.level ?? null;

/** same table as the app's src/features/exam/integrity.ts (the server's copy decides) */
export function ruleFor(exam: ExamKind, ref: string): Rule | null {
  const n = Number(ref);
  switch (exam) {
    case "rp-level":
      if (!(n >= 1 && n <= 10)) return null;
      return { questionSec: 60, examSec: 30 * 60, cooldownH: 24, maxPerWeek: 3, pass: 0.8, recitation: n >= 6 ? { threshold: 0.85 } : undefined, review: n === 10 };
    case "juz":
      if (!(n >= 1 && n <= 30)) return null;
      return { questionSec: 45, examSec: 15 * 60, cooldownH: 24, maxPerWeek: 3, pass: 0.8, recitation: { threshold: 0.8 }, review: true };
    case "surah":
      if (!(n >= 1 && n <= 114)) return null;
      return { questionSec: 45, examSec: 15 * 60, cooldownH: 6, maxPerWeek: 5, pass: 0.8 };
    case "vocab":
      return ["juzamma", "vocab", "names"].includes(ref) ? { questionSec: 30, examSec: 15 * 60, cooldownH: 1, maxPerWeek: 7, pass: 0.8 } : null;
    case "weekly":
      return { questionSec: 45, examSec: 15 * 60, cooldownH: 24, maxPerWeek: 2, pass: 0.8 };
    case "qbank": {
      // examination centre (app src/features/qbank): mock exam per stage, no certificate
      const m = ({ 1: { q: 50, pass: 0.7 }, 2: { q: 60, pass: 0.75 }, 3: { q: 80, pass: 0.75 }, 4: { q: 100, pass: 0.8 } } as Record<number, { q: number; pass: number }>)[n];
      return m ? { questionSec: 90, examSec: m.q * 60, cooldownH: 12, maxPerWeek: 3, pass: m.pass } : null;
    }
    case "ar-unit": {
      if (!(n >= 1 && n <= 16)) return null;
      const final = arLevelOf(n);
      return { questionSec: 120, examSec: 40 * 60, cooldownH: final ? 24 : 0.5, maxPerWeek: final ? 3 : 6, pass: 0.8, recitation: final === "C1" ? { threshold: 0.85 } : undefined, review: final === "C1" };
    }
  }
  return null;
}
export const EXAMS: ExamKind[] = ["rp-level", "juz", "surah", "vocab", "weekly", "ar-unit", "qbank"];
export const isExam = (x: unknown): x is ExamKind => typeof x === "string" && (EXAMS as string[]).includes(x);

// ---------- signing ----------
// CERT_SECRET in the server's .env; without it a key derived from the database URL (server-only) is used.
function secret(): string {
  const s = process.env.CERT_SECRET || process.env.DATABASE_URL;
  if (!s) throw new Error("no certificate secret");
  return process.env.CERT_SECRET ? s : crypto.createHash("sha256").update(`qmc-cert:${s}`).digest("hex");
}
export const hmac = (msg: string) => crypto.createHmac("sha256", secret()).update(msg).digest("base64url");
export function hmacOk(msg: string, sig: string | null | undefined) {
  if (!sig) return false;
  const a = Buffer.from(hmac(msg)), b = Buffer.from(sig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
export const resultMsg = (r: { id: number; userId: number; exam: string; ref: string; score: number; total: number; wordScore: number | null; passed: boolean; submittedAt: string }) =>
  `result|${r.id}|${r.userId}|${r.exam}|${r.ref}|${r.score}|${r.total}|${r.wordScore ?? ""}|${r.passed ? 1 : 0}|${r.submittedAt}`;
export const certMsg = (c: { code: string; userId: number; course: string; holder: string; pct: number; issuedAt: string }) =>
  `cert|${c.code}|${c.userId}|${c.course}|${c.holder}|${c.pct}|${c.issuedAt}`;

// short codes without look-alike characters: QMC-XXXX-XXXX
const ALPHA = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export function newCode() {
  const b = crypto.randomBytes(8);
  const s = Array.from(b, (x) => ALPHA[x % 32]).join("");
  return `QMC-${s.slice(0, 4)}-${s.slice(4)}`;
}
export const normCode = (raw: string) => {
  const s = raw.toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/^QMC/, "");
  return s.length === 8 && [...s].every((c) => ALPHA.includes(c)) ? `QMC-${s.slice(0, 4)}-${s.slice(4)}` : null;
};
export const verifyUrl = (code: string) => `${PUBLIC_SITE}/verify/${code}`;

/** the QR of the verify link as rows of 0/1, so the app can draw it without a QR library */
export function qrRows(code: string): string[] {
  const q = QRCode.create(verifyUrl(code), { errorCorrectionLevel: "M" });
  const n = q.modules.size, d = q.modules.data;
  return Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => (d[y * n + x] ? "1" : "0")).join(""));
}

// ---------- courses on certificates ----------
export function courseOf(exam: ExamKind, ref: string): string | null {
  if (exam === "rp-level") return `rp-level:${Number(ref)}`;
  if (exam === "juz") return `juz:${Number(ref)}`;
  if (exam === "ar-unit") { const l = arLevelOf(Number(ref)); return l ? `ar-level:${l}` : null; }
  return null;
}
const COURSE_NAMES: Record<string, (n: string) => { en: string; de: string; ar: string }> = {
  "rp-level": (n) => ({ en: `Reciter Path · Level ${n}`, de: `Rezitationspfad · Stufe ${n}`, ar: `مسار القارئ · المستوى ${n}` }),
  juz: (n) => ({ en: `Juz ${n} · memorisation exam`, de: `Dschuz ${n} · Hifz-Prüfung`, ar: `الجزء ${n} · اختبار الحفظ` }),
  "ar-level": (n) => ({ en: `Arabic language · ${n}`, de: `Arabische Sprache · ${n}`, ar: `اللغة العربية · ${n}` }),
};
export function courseName(course: string, locale: string) {
  const [k, n] = course.split(":");
  const t = COURSE_NAMES[k]?.(n ?? "");
  if (!t) return course;
  return locale === "de" ? t.de : locale === "ar" ? t.ar : t.en;
}

// ---------- people ----------
export function holderName(u: User & { first?: string | null; last?: string | null }) {
  const full = [u.first, u.last].filter(Boolean).join(" ").trim();
  return (full || u.name || "").trim().slice(0, 80);
}
export async function namesOf(userId: number) {
  const r = await pool()!.query("SELECT name, first_name, last_name FROM users WHERE id = $1", [userId]);
  const u = r.rows[0] ?? {};
  return { name: (u.name as string | null) ?? null, first: (u.first_name as string | null) ?? null, last: (u.last_name as string | null) ?? null };
}

/** admins and verified masters/sheikhs of the talent network review recordings */
export async function isReviewer(u: User | null): Promise<boolean> {
  if (!u) return false;
  if (u.role === "admin") return true;
  try {
    const r = await pool()!.query("SELECT 1 FROM community_profiles WHERE user_id = $1 AND verified AND level IN ('master','sheikh') AND NOT suspended", [u.id]);
    return !!r.rowCount;
  } catch { return false; }
}

// ---------- recordings ----------
export const RECORDINGS_DIR = process.env.EXAM_RECORDINGS_DIR ?? "/srv/tafsirflow/private/exam-recordings";
export const MAX_RECORDING = 20 * 1024 * 1024;
export const RETENTION_DAYS = 90;

let lastPurge = 0;
/** deletes recordings older than 90 days (at most once an hour, from the busy endpoints) */
export async function purgeOldRecordings() {
  if (Date.now() - lastPurge < 3600_000 || !pool()) return;
  lastPurge = Date.now();
  try {
    const r = await pool()!.query(
      `WITH old AS (SELECT id, recording_path FROM review_queue WHERE recording_path IS NOT NULL AND created_at < now() - $1::int * interval '1 day')
       UPDATE review_queue q SET recording_path = NULL, recording_deleted_at = now() FROM old WHERE q.id = old.id RETURNING old.recording_path AS p`,
      [RETENTION_DAYS],
    );
    for (const row of r.rows) if (typeof row.p === "string" && row.p.startsWith(RECORDINGS_DIR)) await fs.unlink(row.p).catch(() => undefined);
    // and anything left in the folder (an upload without a queue row) by its age
    const files = await fs.readdir(RECORDINGS_DIR).catch(() => [] as string[]);
    const limit = Date.now() - RETENTION_DAYS * 86400_000;
    for (const f of files) {
      const p = path.join(RECORDINGS_DIR, f);
      const st = await fs.stat(p).catch(() => null);
      if (st && st.mtimeMs < limit) await fs.unlink(p).catch(() => undefined);
    }
  } catch { /* table not created yet */ }
}

/** a safe file name inside the private folder (never a path from the request) */
export const recordingFile = (attemptId: number, ext: string) => path.join(RECORDINGS_DIR, `${attemptId}-${crypto.randomBytes(6).toString("hex")}.${ext}`);
