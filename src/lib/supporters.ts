// Supporters list (owner 22.10.2026): people who paid a voluntary support payment via Ziina and chose to be named.
// The checkout form sends an optional display name and company plus an explicit opt-in (default off); a "pending" row
// is stored with the Ziina payment intent id. Only a status asked from Ziina itself (the ?pi= return check or the
// webhook, which also re-asks Ziina) marks it "paid". Public: paid + listed + not hidden, name/company and month only.
// Without ZIINA_API_KEY no intents are created, so nothing is ever listed automatically – and nothing is invented.
import { pool } from "./db";
import { usernameProblem } from "./usernameFilter";
import { getPaymentIntent } from "./ziina";

const URLISH = /\b(?:https?:\/\/|www\.)\S*|\b[\w-]+(?:\.[\w-]+)*\.(?:com|net|org|io|de|ae|co|info|biz|me|app|xyz|ru|cn|uk|shop|site|online)\b\S*/gi;

/** trimmed, without URLs, control characters and repeated spaces; "" when empty */
export function cleanName(raw: unknown, max: number): string {
  return String(raw ?? "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩<>]/g, "")
    .replace(URLISH, "")
    .replace(/[@#]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    .trim();
}

/** true when a public name is offensive or poses as the platform or its founder (reuses the username filter) */
export function nameRejected(name: string): boolean {
  if (!name) return false;
  const p = usernameProblem(name.replace(/\s+/g, "."));
  return p === "inappropriate" || p === "reserved" || p === "star";
}

export type PublicSupporter = { name: string; company: string; month: string; tier: 1 | 2 | 3 | null };

/** amount tier (only shown when the owner switches tiers on): 1 under 100 AED, 2 under 500, 3 from 500 */
const tierOf = (minor: number): 1 | 2 | 3 => (minor >= 50_000 ? 3 : minor >= 10_000 ? 2 : 1);

export async function createPending(input: { paymentIntentId: string; displayName: string; company: string; listed: boolean; amountMinor: number; currency: string }) {
  const p = pool();
  if (!p) return;
  try {
    await p.query(
      `INSERT INTO supporters (payment_intent_id, display_name, company, listed, amount_minor, currency)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (payment_intent_id) DO NOTHING`,
      [input.paymentIntentId, input.displayName || null, input.company || null, input.listed && !!(input.displayName || input.company), input.amountMinor, input.currency],
    );
  } catch (e) { console.error("Supporters: pending row not stored –", (e as Error)?.message); }
}

/** asks Ziina for the real status and updates the row; returns the normalised status */
export async function confirmFromZiina(id: string): Promise<"completed" | "pending" | "failed" | "unknown"> {
  const r = await getPaymentIntent(id);
  if (!r.ok) return "unknown";
  const s = r.value.status;
  const norm = s === "completed" ? "completed" : s === "failed" || s === "canceled" ? "failed" : "pending";
  const p = pool();
  if (p && norm !== "pending") {
    try {
      if (norm === "completed") await p.query("UPDATE supporters SET status = 'paid', paid_at = COALESCE(paid_at, now()), amount_minor = $2, currency = $3 WHERE payment_intent_id = $1", [r.value.id || id, r.value.amount, r.value.currencyCode]);
      else await p.query("UPDATE supporters SET status = 'failed' WHERE payment_intent_id = $1 AND status <> 'paid'", [r.value.id || id]);
    } catch (e) { console.error("Supporters: status not stored –", (e as Error)?.message); }
  }
  return norm;
}

export async function publicSupporters(limit = 200, showTiers = false): Promise<PublicSupporter[]> {
  const p = pool();
  if (!p) return [];
  try {
    const r = await p.query(
      `SELECT display_name, company, amount_minor, to_char(paid_at AT TIME ZONE 'Asia/Dubai', 'YYYY-MM') AS month
         FROM supporters WHERE status = 'paid' AND listed AND NOT hidden ORDER BY paid_at DESC LIMIT $1`, [limit]);
    return r.rows.map((x) => ({ name: x.display_name ?? "", company: x.company ?? "", month: x.month, tier: showTiers ? tierOf(Number(x.amount_minor)) : null }));
  } catch { return []; }
}

export type AdminSupporter = { id: number; display_name: string | null; company: string | null; listed: boolean; hidden: boolean; amount_minor: number; currency: string; status: string; created_at: string; paid_at: string | null };
export async function adminSupporters(): Promise<AdminSupporter[]> {
  const r = await pool()!.query("SELECT id, display_name, company, listed, hidden, amount_minor, currency, status, created_at, paid_at FROM supporters WHERE status = 'paid' ORDER BY paid_at DESC LIMIT 500");
  return r.rows;
}
