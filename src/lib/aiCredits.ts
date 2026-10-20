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

export type Spent = { from: "pro" | "paid" } | null;

/** takes one dua credit (Pro allowance first); null when nothing is left */
export async function spendDua(userId: number, pro: boolean): Promise<Spent> {
  const p = pool();
  if (!p) return null;
  const c: PoolClient = await p.connect();
  try {
    await c.query("BEGIN");
    if (pro) {
      const r = await c.query(
        `INSERT INTO ai_usage (user_id, kind, month, n) VALUES ($1, 'dua', $2, 1)
         ON CONFLICT (user_id, kind, month) DO UPDATE SET n = ai_usage.n + 1 WHERE ai_usage.n < $3 RETURNING n`,
        [userId, month(), PRO_DUAS_PER_MONTH],
      );
      if (r.rowCount) { await c.query("COMMIT"); return { from: "pro" }; }
    }
    const r = await c.query("UPDATE ai_credits SET dua = dua - 1, updated_at = now() WHERE user_id = $1 AND dua > 0 RETURNING dua", [userId]);
    await c.query(r.rowCount ? "COMMIT" : "ROLLBACK");
    return r.rowCount ? { from: "paid" } : null;
  } catch {
    await c.query("ROLLBACK").catch(() => undefined);
    return null;
  } finally {
    c.release();
  }
}

/** gives a credit back when the AI call failed */
export async function refundDua(userId: number, spent: Spent) {
  const p = pool();
  if (!p || !spent) return;
  if (spent.from === "pro") await p.query("UPDATE ai_usage SET n = GREATEST(0, n - 1) WHERE user_id = $1 AND kind = 'dua' AND month = $2", [userId, month()]).catch(() => undefined);
  else await p.query("INSERT INTO ai_credits (user_id, dua) VALUES ($1, 1) ON CONFLICT (user_id) DO UPDATE SET dua = ai_credits.dua + 1, updated_at = now()", [userId]).catch(() => undefined);
}

export async function addDuaCredits(c: PoolClient, userId: number, n: number) {
  await c.query("INSERT INTO ai_credits (user_id, dua) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET dua = ai_credits.dua + $2, updated_at = now()", [userId, n]);
}
