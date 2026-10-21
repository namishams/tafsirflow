import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import type { User } from "@/lib/auth";
import { pool } from "@/lib/db";
import { removeMedia } from "@/lib/media";
import { NOT_BLOCKED } from "@/lib/talents";
import { canJudge, cardsFor, isMaster, mentoringDir, memberCard } from "./mentoring";

// Shared parts of the submission endpoints: row select, JSON shape, access role, private audio storage.

export const MAX_AUDIO_BYTES = 6 * 1024 * 1024;
export const SEASON_MIN_MS = 10_000;

export const SUB_FROM = `FROM mentoring_submissions s LEFT JOIN talent_seasons ts ON ts.id = s.season_id`;
export const SUB_COLS = `s.id, s.student_id, s.master_id, s.season_id, s.verse_key, s.duration_ms, s.note, s.media_path, s.media_mime, s.status, s.created_at, s.expires_at,
  ts.slug AS season_slug, ts.status AS season_status, ts.published_at AS season_published,
  (SELECT count(*)::int FROM mentoring_reviews r WHERE r.submission_id = s.id) AS reviews,
  (SELECT avg(r.makharij + r.tajweed + r.waqf + r.pace + r.maqam) FROM mentoring_reviews r WHERE r.submission_id = s.id) AS avg_total`;

export type SubRow = Record<string, unknown> & { id: string; student_id: string; master_id: string | null; season_id: string | null; media_path: string | null; media_mime: string | null; status: string; season_slug: string | null; season_status: string | null };
type Card = ReturnType<typeof memberCard>;

export function submissionJson(r: SubRow, student: Card | null, mentor: Card | null, opts: { hideStats?: boolean; hideNote?: boolean } = {}) {
  const avg = r.avg_total === null || r.avg_total === undefined ? null : Math.round(Number(r.avg_total) * 10) / 10;
  return {
    id: String(r.id), verseKey: String(r.verse_key), durationMs: Number(r.duration_ms), note: opts.hideNote ? "" : String(r.note ?? ""),
    status: r.status === "reviewed" ? "reviewed" : "pending", at: r.created_at, expiresAt: r.expires_at, hasAudio: !!r.media_path,
    season: r.season_slug ?? null, reviews: Number(r.reviews ?? 0), avgTotal: opts.hideStats ? null : avg, student, mentor,
  };
}

/** is the (accepted, unblocked) mentoring link between master and student alive */
export async function linkAlive(masterId: number, studentId: number): Promise<boolean> {
  const r = await pool()!.query(
    `SELECT 1 FROM mentoring_links l WHERE l.master_id = $1 AND l.student_id = $2 AND l.status = 'accepted'
        AND NOT EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = l.master_id AND b.blocked_id = l.student_id) OR (b.blocker_id = l.student_id AND b.blocked_id = l.master_id))`,
    [masterId, studentId],
  );
  return !!r.rows[0];
}

export async function loadSubmission(id: string): Promise<SubRow | null> {
  if (!/^\d{1,18}$/.test(id)) return null;
  const r = await pool()!.query(`SELECT ${SUB_COLS} ${SUB_FROM} WHERE s.id = $1 AND s.status <> 'withdrawn'`, [id]);
  return (r.rows[0] as SubRow) ?? null;
}

/** the caller's role on a submission: owner, the linked master, or jury (masters and admins, season entries; admins any) */
export async function roleOf(me: User, r: SubRow): Promise<"student" | "master" | "jury" | null> {
  const meId = me.id;
  if (Number(r.student_id) === meId) return "student";
  if (r.master_id && Number(r.master_id) === meId && (await linkAlive(meId, Number(r.student_id)))) return "master";
  const blocked = await pool()!.query(`SELECT 1 FROM community_profiles c WHERE c.user_id = $2 AND NOT ${NOT_BLOCKED("c.user_id")}`, [meId, Number(r.student_id)]);
  if (blocked.rows[0]) return null;
  if (me.role === "admin") return "jury";
  if (r.season_id && (await canJudge(me))) return "jury";
  return null;
}

export const isAnonymous = (r: SubRow, role: string) => !!r.season_id && role === "jury";

// ——— storage ———
const ALLOWED = new Set(["audio/mp4", "audio/m4a", "audio/x-m4a", "audio/webm", "audio/ogg", "video/webm", "video/mp4"]);
export const allowedType = (t: string) => ALLOWED.has(t.split(";")[0].trim().toLowerCase());

function sniffAudio(buf: Buffer): { ext: string; mime: string } | null {
  if (buf.length >= 12 && buf.toString("latin1", 4, 8) === "ftyp") return { ext: "m4a", mime: "audio/mp4" };
  if (buf.length >= 4 && buf.toString("latin1", 0, 4) === "OggS") return { ext: "ogg", mime: "audio/ogg" };
  if (buf.length >= 4 && buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return { ext: "webm", mime: "audio/webm" };
  return null;
}

function run(cmd: string, args: string[], ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const p = spawn(cmd, args, { stdio: "ignore" });
    const timer = setTimeout(() => { if (!done) { done = true; p.kill("SIGKILL"); resolve(false); } }, ms);
    p.on("error", () => { if (!done) { done = true; clearTimeout(timer); resolve(false); } });
    p.on("exit", (code) => { if (!done) { done = true; clearTimeout(timer); resolve(code === 0); } });
  });
}

/** stores a recording as mentoring/<random>.m4a (ffmpeg via FFMPEG_PATH, metadata stripped, cut at maxSeconds); without ffmpeg the checked original */
export async function storeRecording(buf: Buffer, maxSeconds: number): Promise<{ rel: string; mime: string } | { error: string }> {
  const dir = await mentoringDir();
  if (!dir) return { error: "media_unavailable" };
  if (buf.length > MAX_AUDIO_BYTES) return { error: "media_too_large" };
  const s = sniffAudio(buf);
  if (!s) return { error: "media_format" };
  const name = crypto.randomBytes(18).toString("hex");
  const tmp = path.join(dir, "mentoring", `.${name}.${s.ext}`);
  await fs.writeFile(tmp, buf, { mode: 0o600 });
  const out = path.join(dir, "mentoring", `${name}.m4a`);
  const ff = process.env.FFMPEG_PATH || "ffmpeg";
  if (await run(ff, ["-y", "-i", tmp, "-t", String(maxSeconds + 1), "-map_metadata", "-1", "-vn", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", out], 90_000)) {
    await fs.rm(tmp, { force: true });
    return { rel: `mentoring/${name}.m4a`, mime: "audio/mp4" };
  }
  await fs.rm(out, { force: true });
  const keep = path.join(dir, "mentoring", `${name}.${s.ext}`);
  await fs.rename(tmp, keep);
  return { rel: `mentoring/${name}.${s.ext}`, mime: s.mime };
}

export { removeMedia, cardsFor, isMaster, canJudge };
