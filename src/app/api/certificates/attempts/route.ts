import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { json, rateLimited, sameOrigin } from "@/lib/http";
import { AR_LEVELS, certMsg, courseOf, hmac, holderName, isExam, namesOf, newCode, purgeOldRecordings, resultMsg, ruleFor, verifyUrl, type ExamKind } from "../lib";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "private, no-store" };
const GRACE_MS = 120_000;   // network and the result screen
const MIN_MS_PER_Q = 1500;  // nobody reads and answers a question faster

type Gate = { canStart: boolean; nextAt: string | null; left: number };
async function gateOf(userId: number, exam: ExamKind, ref: string): Promise<Gate> {
  const rule = ruleFor(exam, ref)!;
  const r = await pool()!.query(
    `SELECT max(started_at) AS last, count(*) FILTER (WHERE started_at > now() - interval '7 days')::int AS week,
            min(started_at) FILTER (WHERE started_at > now() - interval '7 days') AS first_week
       FROM exam_attempts WHERE user_id = $1 AND exam = $2 AND ref = $3`,
    [userId, exam, ref],
  );
  const row = r.rows[0] ?? {};
  const last = row.last ? new Date(row.last).getTime() : 0;
  const cool = last ? last + rule.cooldownH * 3600_000 : 0;
  const weekFull = (row.week ?? 0) >= rule.maxPerWeek;
  const weekFree = weekFull && row.first_week ? new Date(row.first_week).getTime() + 7 * 86400_000 : 0;
  const next = Math.max(cool, weekFree);
  return { canStart: next <= Date.now(), nextAt: next > Date.now() ? new Date(next).toISOString() : null, left: Math.max(0, rule.maxPerWeek - (row.week ?? 0)) };
}

// GET ?exam=&ref= – may this exam be started now (cooldown, weekly limit); without parameters: my signed results
export async function GET(req: NextRequest) {
  if (!pool()) return json({ error: "unavailable" }, 503);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  const exam = req.nextUrl.searchParams.get("exam"), ref = String(req.nextUrl.searchParams.get("ref") ?? "").slice(0, 20);
  if (exam) {
    if (!isExam(exam) || !ruleFor(exam, ref)) return json({ error: "invalid" }, 400);
    return json(await gateOf(me.id, exam, ref), 200, NO_STORE);
  }
  const r = await pool()!.query(
    `SELECT id, exam, ref, score, total, word_score, passed, submitted_at, flags, sig FROM exam_attempts
      WHERE user_id = $1 AND status = 'submitted' ORDER BY submitted_at DESC LIMIT 300`, [me.id]);
  return json({ results: r.rows.map((x) => ({ id: Number(x.id), exam: x.exam, ref: x.ref, score: x.score, total: x.total, wordScore: x.word_score, passed: x.passed, at: x.submitted_at, flags: x.flags, sig: x.sig })) }, 200, NO_STORE);
}

type Body = { action?: string; exam?: string; ref?: string; id?: number; score?: number; total?: number; wordScore?: number | null; durationMs?: number; flags?: string[]; hasRecording?: boolean; platform?: string; reason?: string };

export async function POST(req: NextRequest) {
  const p = pool();
  if (!p) return json({ error: "unavailable" }, 503);
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  const b = (await req.json().catch(() => ({}))) as Body;
  void purgeOldRecordings();

  if (b.action === "start") {
    const exam = b.exam, ref = String(b.ref ?? "").slice(0, 20);
    if (!isExam(exam) || !ruleFor(exam, ref)) return json({ error: "invalid" }, 400);
    if (rateLimited(`exam-start:${me.id}`, 30, 3600_000)) return json({ error: "rate" }, 429);
    // an attempt left running (app closed, crashed) counts as void
    await p.query("UPDATE exam_attempts SET status = 'void', flags = array_append(flags, 'abandoned') WHERE user_id = $1 AND status = 'running' AND started_at < now() - interval '2 hours'", [me.id]);
    const g = await gateOf(me.id, exam, ref);
    if (!g.canStart) return json({ error: "cooldown", nextAt: g.nextAt, left: g.left }, 429);
    const nonce = crypto.randomBytes(12).toString("base64url");
    const r = await p.query("INSERT INTO exam_attempts (user_id, exam, ref, nonce, platform) VALUES ($1, $2, $3, $4, $5) RETURNING id, started_at", [me.id, exam, ref, nonce, String(b.platform ?? "").slice(0, 20)]);
    return json({ id: Number(r.rows[0].id), nonce, startedAt: r.rows[0].started_at, rule: ruleFor(exam, ref), left: g.left - 1 }, 201, NO_STORE);
  }

  const id = Number(b.id);
  if (!Number.isSafeInteger(id) || id <= 0) return json({ error: "invalid" }, 400);
  if (rateLimited(`exam-submit:${me.id}`, 60, 3600_000)) return json({ error: "rate" }, 429);

  if (b.action === "void") {
    const reason = ["background", "left", "timeout", "closed"].includes(String(b.reason)) ? String(b.reason) : "void";
    await p.query("UPDATE exam_attempts SET status = 'void', submitted_at = now(), flags = array_append(flags, $3) WHERE id = $1 AND user_id = $2 AND status = 'running'", [id, me.id, reason]);
    return json({ ok: true });
  }

  if (b.action !== "submit") return json({ error: "invalid" }, 400);
  const a = (await p.query("SELECT id, exam, ref, status, started_at FROM exam_attempts WHERE id = $1 AND user_id = $2", [id, me.id])).rows[0];
  if (!a) return json({ error: "not_found" }, 404);
  if (a.status !== "running") return json({ error: a.status === "void" ? "void" : "submitted" }, 409);
  const exam = a.exam as ExamKind, ref = String(a.ref);
  const rule = ruleFor(exam, ref)!;
  const total = Math.floor(Number(b.total)), score = Math.floor(Number(b.score));
  if (!(total >= 1 && total <= 500 && score >= 0 && score <= total)) return json({ error: "invalid" }, 400);
  const ws = b.wordScore == null ? null : Math.max(0, Math.min(1, Number(b.wordScore)));
  const elapsed = Date.now() - new Date(a.started_at).getTime();
  const flags = new Set((Array.isArray(b.flags) ? b.flags : []).map((f) => String(f).slice(0, 20)).filter((f) => /^[a-z_]+$/.test(f)).slice(0, 10));
  if (elapsed > rule.examSec * 1000 + GRACE_MS) flags.add("late");
  if (elapsed < total * MIN_MS_PER_Q) flags.add("too_fast");
  if (Number(b.durationMs) > elapsed + 5000) flags.add("clock");
  let passed = score / total >= rule.pass && !flags.has("background") && !flags.has("late") && !flags.has("too_fast") && !flags.has("clock");
  if (rule.recitation) {
    if (ws === null || ws < rule.recitation.threshold) { flags.add("recitation"); passed = false; }
    if (!b.hasRecording) { flags.add("no_recording"); passed = false; }
  }
  const submittedAt = new Date().toISOString();
  const sig = hmac(resultMsg({ id, userId: me.id, exam, ref, score, total, wordScore: ws, passed, submittedAt }));
  await p.query(
    "UPDATE exam_attempts SET status = 'submitted', submitted_at = $3, score = $4, total = $5, word_score = $6, duration_ms = $7, flags = $8, passed = $9, sig = $10 WHERE id = $1 AND user_id = $2",
    [id, me.id, submittedAt, score, total, ws, Math.max(0, Math.min(2 ** 31 - 1, Math.floor(Number(b.durationMs) || 0))), [...flags], passed, sig],
  );
  const result = { id, exam, ref, score, total, wordScore: ws, passed, at: submittedAt, flags: [...flags], sig };

  // certificate: only from this server-recorded, passed attempt
  const course = passed ? courseOf(exam, ref) : null;
  if (!course) return json({ result, certificate: null }, 200, NO_STORE);
  if (exam === "ar-unit") {
    // a language level needs every unit test up to its last unit passed here, not only on the device
    const last = AR_LEVELS.find((l) => `ar-level:${l.level}` === course)!.lastUnit;
    const r = await p.query("SELECT DISTINCT ref FROM exam_attempts WHERE user_id = $1 AND exam = 'ar-unit' AND passed AND status = 'submitted'", [me.id]);
    const have = new Set(r.rows.map((x) => Number(x.ref)));
    const missing = Array.from({ length: last }, (_, i) => i + 1).filter((u) => !have.has(u));
    if (missing.length) return json({ result, certificate: null, missingUnits: missing }, 200, NO_STORE);
  }
  const names = await namesOf(me.id);
  const holder = holderName({ ...me, name: names.name, first: names.first, last: names.last });
  const pct = Math.round((score / total) * 100);
  const status = rule.review ? "pending" : "valid";
  const old = (await p.query("SELECT id, code, status, course, holder_name, pct, issued_at FROM certificates WHERE user_id = $1 AND course = $2", [me.id, course])).rows[0];
  let cert: { id: number; code: string; status: string };
  if (old && (old.status === "valid" || old.status === "pending")) {
    cert = { id: Number(old.id), code: old.code, status: old.status };
  } else {
    const code = newCode();
    const issuedAt = new Date().toISOString();
    const csig = hmac(certMsg({ code, userId: me.id, course, holder, pct, issuedAt }));
    const r = old
      ? await p.query("UPDATE certificates SET code = $2, attempt_id = $3, holder_name = $4, pct = $5, status = $6, issued_at = $7, decided_at = NULL, sig = $8 WHERE id = $1 RETURNING id", [old.id, code, id, holder, pct, status, issuedAt, csig])
      : await p.query("INSERT INTO certificates (code, user_id, attempt_id, course, holder_name, pct, status, issued_at, sig) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id", [code, me.id, id, course, holder, pct, status, issuedAt, csig]);
    cert = { id: Number(r.rows[0].id), code, status };
    if (status === "pending") await p.query("INSERT INTO review_queue (certificate_id, attempt_id) VALUES ($1, $2)", [cert.id, id]);
  }
  return json({ result, certificate: { code: cert.code, status: cert.status, course, url: verifyUrl(cert.code), needsRecording: cert.status === "pending" } }, 200, NO_STORE);
}
