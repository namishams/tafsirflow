import type { PoolClient } from "pg";
import { pool } from "./db";

// AI requests from the app are paid: a personal dua uses one credit (bought in the app) or, for Pro, one of the duas
// included each month. Credits live on the account, so they work on every device; a failed AI call gives it back.
export const PRO_DUAS_PER_MONTH = 5;
const month = () => new Date().toISOString().slice(0, 7);

export async function duaCredits(userId: number, pro: boolean): Promise<{ dua: number; proDuaLeft: number }> {
  const p = pool();
  if (!p) return { dua: 0, proDuaLeft: 0 };
  const [c, u] = await Promise.all([
    p.query("SELECT dua FROM ai_credits WHERE user_id = $1", [userId]),
    p.query("SELECT n FROM ai_usage WHERE user_id = $1 AND kind = 'dua' AND month = $2", [userId, month()]),
  ]);
  return { dua: Number(c.rows[0]?.dua ?? 0), proDuaLeft: pro ? Math.max(0, PRO_DUAS_PER_MONTH - Number(u.rows[0]?.n ?? 0)) : 0 };
}

/** where a spent dua came from; a Pro dua remembers its month, so a refund after midnight on the 1st goes to the right month */
export type Spent = { from: "pro"; month: string } | { from: "paid" } | null;

/** takes one dua credit (Pro allowance first); null when nothing is left */
export async function spendDua(userId: number, pro: boolean): Promise<Spent> {
  const p = pool();
  if (!p) return null;
  let c: PoolClient | null = null;
  try {
    c = await p.connect();
    await c.query("BEGIN");
    if (pro) {
      const m = month();
      const r = await c.query(
        `INSERT INTO ai_usage (user_id, kind, month, n) VALUES ($1, 'dua', $2, 1)
         ON CONFLICT (user_id, kind, month) DO UPDATE SET n = ai_usage.n + 1 WHERE ai_usage.n < $3 RETURNING n`,
        [userId, m, PRO_DUAS_PER_MONTH],
      );
      if (r.rowCount) { await c.query("COMMIT"); return { from: "pro", month: m }; }
    }
    const r = await c.query("UPDATE ai_credits SET dua = dua - 1, updated_at = now() WHERE user_id = $1 AND dua > 0 RETURNING dua", [userId]);
    await c.query(r.rowCount ? "COMMIT" : "ROLLBACK");
    return r.rowCount ? { from: "paid" } : null;
  } catch (e) {
    await c?.query("ROLLBACK").catch(() => undefined);
    console.error("[dua] spend failed", userId, e instanceof Error ? e.message : e);
    return null;
  } finally {
    c?.release();
  }
}

/** gives a credit back when the AI call failed; tried three times, a refund that still fails is logged for the admin */
export async function refundDua(userId: number, spent: Spent) {
  const p = pool();
  if (!p || !spent) return;
  const run = () => spent.from === "pro"
    ? p.query("UPDATE ai_usage SET n = GREATEST(0, n - 1) WHERE user_id = $1 AND kind = 'dua' AND month = $2", [userId, spent.month])
    : p.query("INSERT INTO ai_credits (user_id, dua) VALUES ($1, 1) ON CONFLICT (user_id) DO UPDATE SET dua = ai_credits.dua + 1, updated_at = now()", [userId]);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try { await run(); return; } catch (e) {
      if (attempt === 3) { console.error("[dua] REFUND FAILED – credit owed", JSON.stringify({ userId, spent, at: new Date().toISOString() }), e instanceof Error ? e.message : e); return; }
      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }
}

export async function addDuaCredits(c: PoolClient, userId: number, n: number) {
  await c.query("INSERT INTO ai_credits (user_id, dua) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET dua = ai_credits.dua + $2, updated_at = now()", [userId, n]);
}

// ---- personal name reports (baby-name finder in the app) ----
// A separate credit: one bought report = one credit. Pro does not include name reports.
/** consumable → number of name reports */
export const NAME_PRODUCTS: Record<string, number> = { "com.quranmasterclass.app.names": 1 };

export async function nameCredits(userId: number): Promise<number> {
  const p = pool();
  if (!p) return 0;
  const r = await p.query("SELECT names FROM ai_credits WHERE user_id = $1", [userId]).catch(() => null);
  return Number(r?.rows[0]?.names ?? 0);
}

/** takes one name-report credit; false when none is left */
export async function spendName(userId: number): Promise<boolean> {
  const p = pool();
  if (!p) return false;
  const r = await p.query("UPDATE ai_credits SET names = names - 1, updated_at = now() WHERE user_id = $1 AND names > 0 RETURNING names", [userId]).catch(() => null);
  return !!r?.rowCount;
}

/** gives a name-report credit back when the report could not be made */
export async function refundName(userId: number) {
  const p = pool();
  if (!p) return;
  await p.query("INSERT INTO ai_credits (user_id, names) VALUES ($1, 1) ON CONFLICT (user_id) DO UPDATE SET names = ai_credits.names + 1, updated_at = now()", [userId]).catch(() => undefined);
}

export async function addNameCredits(c: PoolClient, userId: number, n: number) {
  await c.query("INSERT INTO ai_credits (user_id, names) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET names = ai_credits.names + $2, updated_at = now()", [userId, n]);
}
