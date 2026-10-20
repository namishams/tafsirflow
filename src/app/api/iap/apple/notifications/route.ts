import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { DUA_PRODUCTS, IOS_BUNDLE_ID, PRO_SUBSCRIPTION, verifyAppleJws } from "@/lib/appleIap";

export const dynamic = "force-dynamic";

// App Store Server Notifications V2 (URL entered in App Store Connect for Production and Sandbox): renewals extend Pro,
// expiry/refund/revocation end it, refunded duas are taken back. Every payload is checked against Apple's root
// certificate like the purchases themselves; unknown or unsigned requests are ignored.
type Payload = { notificationType?: string; subtype?: string; data?: { bundleId?: string; environment?: string; signedTransactionInfo?: string } };
type Tx = { productId?: string; transactionId?: string; originalTransactionId?: string; expiresDate?: number; revocationDate?: number; environment?: string };

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as { signedPayload?: unknown };
  if (typeof b.signedPayload !== "string" || b.signedPayload.length > 60000) return json({ ok: false }, 400);
  const n = verifyAppleJws<Payload>(b.signedPayload);
  if (!n || n.data?.bundleId !== IOS_BUNDLE_ID || !n.data.signedTransactionInfo) return json({ ok: false }, 400);
  const tx = verifyAppleJws<Tx>(n.data.signedTransactionInfo);
  const p = pool();
  if (!tx || !p) return json({ ok: false }, 400);
  if (tx.environment !== "Production" && process.env.IAP_ALLOW_SANDBOX !== "1") return json({ ok: true, ignored: "sandbox" });
  const type = n.notificationType ?? "";

  // refunded personal duas: mark the transaction and take the credits back (never below zero)
  if (tx.productId && tx.productId in DUA_PRODUCTS) {
    if (type === "REFUND" && tx.transactionId) {
      const r = await p.query("UPDATE iap_consumables SET refunded_at = now() WHERE transaction_id = $1 AND refunded_at IS NULL RETURNING user_id, credits", [tx.transactionId]);
      if (r.rows[0]) await p.query("UPDATE ai_credits SET dua = GREATEST(0, dua - $2), updated_at = now() WHERE user_id = $1", [r.rows[0].user_id, r.rows[0].credits]);
    }
    return json({ ok: true });
  }
  if (tx.productId !== PRO_SUBSCRIPTION || !tx.originalTransactionId) return json({ ok: true });

  const owner = await p.query("SELECT user_id FROM iap_purchases WHERE original_transaction_id = $1 ORDER BY created_at LIMIT 1", [tx.originalTransactionId]);
  const userId = owner.rows[0] ? Number(owner.rows[0].user_id) : null;
  if (!userId) return json({ ok: true, ignored: "unknown" }); // the app links it on the next purchase or restore

  if (type === "REFUND" || type === "REVOKE" || tx.revocationDate) {
    await p.query("UPDATE iap_purchases SET revoked_at = now(), updated_at = now() WHERE original_transaction_id = $1", [tx.originalTransactionId]);
    await p.query("UPDATE users SET pro_until = now() WHERE id = $1 AND plan = 'premium' AND pro_until IS NOT NULL", [userId]);
    return json({ ok: true });
  }
  if (tx.expiresDate) {
    await p.query("UPDATE iap_purchases SET transaction_id = $2, expires_at = to_timestamp($3 / 1000.0), updated_at = now() WHERE original_transaction_id = $1", [tx.originalTransactionId, tx.transactionId ?? null, tx.expiresDate]);
    // renewals and expiry both just move the end date; a lasting Premium (pro_until NULL) is never shortened
    await p.query(
      `UPDATE users SET plan = 'premium', pro_until = to_timestamp($2 / 1000.0) WHERE id = $1 AND NOT (plan = 'premium' AND pro_until IS NULL)`,
      [userId, tx.expiresDate],
    );
  }
  return json({ ok: true });
}
