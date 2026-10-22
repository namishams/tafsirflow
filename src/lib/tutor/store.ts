import { createHash } from "crypto";
import { pool } from "../db";

// What the tutor keeps on the server – nothing that identifies a person:
// - tutor_log: one row per question with day, category, outcome, tokens, latency, language (no text, no user, no IP);
// - tutor_reports: answers learners reported, with the scrubbed question and the answer (no user, no IP), deleted after 90 days;
// - ai_usage (existing table): the number of questions per account and day (kind "tutor", "month" holds the day).
// The tables are created on first use as well (db/schema.sql has the same statements).

export const TUTOR_SCHEMA = `
CREATE TABLE IF NOT EXISTS tutor_log (
  id         bigserial PRIMARY KEY,
  day        date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  source     text NOT NULL,
  locale     text NOT NULL,
  context    text,
  category   text,
  outcome    text NOT NULL,
  cached     boolean NOT NULL DEFAULT false,
  passages   integer NOT NULL DEFAULT 0,
  tokens_in  integer NOT NULL DEFAULT 0,
  tokens_out integer NOT NULL DEFAULT 0,
  ms         integer NOT NULL DEFAULT 0,
  model      text
);
CREATE INDEX IF NOT EXISTS tutor_log_day ON tutor_log (day);
CREATE TABLE IF NOT EXISTS tutor_reports (
  id         bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  answer_id  text NOT NULL,
  reason     text NOT NULL,
  note       text,
  locale     text NOT NULL,
  question   text,
  answer     text,
  sources    text,
  status     text NOT NULL DEFAULT 'open'
);`;

let ensured: Promise<void> | null = null;
function ensure(): Promise<void> {
  const p = pool();
  if (!p) return Promise.resolve();
  ensured ??= p.query(TUTOR_SCHEMA).then(() => undefined).catch((e) => { ensured = null; console.error("tutor schema", e); });
  return ensured;
}

const today = () => new Date().toISOString().slice(0, 10);

/** counts one question for an account; false when the day's limit is reached */
export async function takeUserQuestion(userId: number, limit: number): Promise<boolean> {
  const p = pool();
  if (!p) return true;
  const r = await p.query(
    `INSERT INTO ai_usage (user_id, kind, month, n) VALUES ($1, 'tutor', $2, 1)
     ON CONFLICT (user_id, kind, month) DO UPDATE SET n = ai_usage.n + 1 WHERE ai_usage.n < $3 RETURNING n`,
    [userId, today(), limit],
  ).catch(() => null);
  return r ? !!r.rowCount : true;
}
/** gives a question back when no model answer was produced (error, quota of the provider) */
export async function refundUserQuestion(userId: number) {
  await pool()?.query("UPDATE ai_usage SET n = GREATEST(0, n - 1) WHERE user_id = $1 AND kind = 'tutor' AND month = $2", [userId, today()]).catch(() => undefined);
}
export async function usedToday(userId: number): Promise<number> {
  const r = await pool()?.query("SELECT n FROM ai_usage WHERE user_id = $1 AND kind = 'tutor' AND month = $2", [userId, today()]).catch(() => null);
  return Number(r?.rows[0]?.n ?? 0);
}

export type LogRow = { source: "web" | "app"; locale: string; context?: string; category?: string; outcome: string; cached?: boolean; passages?: number; tokensIn?: number; tokensOut?: number; ms?: number; model?: string };
export async function logQuestion(l: LogRow) {
  const p = pool();
  if (!p) { if (process.env.NODE_ENV !== "production") console.info("tutor", l.outcome, l.category, l.passages); return; }
  await ensure();
  await p.query(
    "INSERT INTO tutor_log (source, locale, context, category, outcome, cached, passages, tokens_in, tokens_out, ms, model) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
    [l.source, l.locale, l.context ?? null, l.category ?? null, l.outcome, !!l.cached, l.passages ?? 0, l.tokensIn ?? 0, l.tokensOut ?? 0, l.ms ?? 0, l.model ?? null],
  ).catch(() => undefined);
  // keep the log small: rows older than 180 days go (once in a while)
  if (Math.random() < 0.01) await p.query("DELETE FROM tutor_log WHERE day < CURRENT_DATE - 180; DELETE FROM tutor_reports WHERE created_at < now() - interval '90 days'").catch(() => undefined);
}

export async function saveReport(r: { answerId: string; reason: string; note?: string; locale: string; question?: string; answer?: string; sources?: string }) {
  const p = pool();
  if (!p) return;
  await ensure();
  await p.query(
    "INSERT INTO tutor_reports (answer_id, reason, note, locale, question, answer, sources) VALUES ($1,$2,$3,$4,$5,$6,$7)",
    [r.answerId, r.reason, r.note ?? null, r.locale, r.question ?? null, r.answer ?? null, r.sources ?? null],
  );
}

/** a stable id of an answer (to report it), without anything about the person */
export const answerId = (parts: string[]) => createHash("sha256").update(parts.join("\u0000")).digest("base64url").slice(0, 16);
