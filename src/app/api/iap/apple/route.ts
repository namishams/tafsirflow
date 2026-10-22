import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { pool } from "@/lib/db";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { DUA_PRODUCTS, IOS_BUNDLE_ID, PREMIUM_PRODUCT, PRO_SUBSCRIPTION, verifyAppleTransaction } from "@/lib/appleIap";
import { productKind } from "@/lib/store/catalog";
import { grant, ownedOf } from "@/lib/store/entitlements";
import { NAME_PRODUCTS, addDuaCredits, addNameCredits, duaCredits, nameCredits } from "@/lib/aiCredits";

export const dynamic = "force-dynamic";

// Links a purchase from the iOS app to the signed-in account, so it works on every device:
// - Pro (monthly subscription): users.plan = 'premium' until the transaction's expiry (renewals arrive here again and
//   through the App Store Server Notifications, see ./notifications)
// - personal duas and personal name reports (consumables): each transaction adds its credits exactly once
// - the first one-time Premium: lasting Premium
// Test purchases (Sandbox, TestFlight, App Review) count as well, so App Review can complete and verify every purchase
// (Apple: a production server must accept sandbox transactions). IAP_ALLOW_SANDBOX=0 switches that off again (admin only).
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  if (rateLimited(`iap:${clientIp(req)}`, 30, 60 * 60_000)) return json({ error: "rate" }, 429);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  const p = pool();
  if (!p) return json({ error: "nodb" }, 503);
  const b = (await req.json().catch(() => ({}))) as { jws?: unknown };
  if (typeof b.jws !== "string" || b.jws.length > 20000) return json({ error: "input" }, 400);
  const tx = verifyAppleTransaction(b.jws);
  const store = tx ? await productKind(tx.productId) : null;
  const known = tx && (!!store || tx.productId === PREMIUM_PRODUCT || tx.productId === PRO_SUBSCRIPTION || tx.productId in DUA_PRODUCTS || tx.productId in NAME_PRODUCTS);
  if (!tx || tx.bundleId !== IOS_BUNDLE_ID || !known) return json({ error: "invalid" }, 400);
  if (tx.revocationDate) {
    if (store) await p.query("UPDATE iap_entitlements SET revoked_at = now() WHERE transaction_id = $1", [tx.originalTransactionId]).catch(() => undefined);
    return json({ error: "revoked" }, 400);
  }
  if (tx.environment !== "Production" && me.role !== "admin" && process.env.IAP_ALLOW_SANDBOX === "0") return json({ premium: me.plan === "premium", sandbox: true });

  // courses, sticker packs, the bundle, rare stickers and frames (non-consumable): owned by this account for good;
  // a pack bought as a gift becomes a gift waiting to be sent through the messenger (/api/app/store/gift)
  if (store) {
    if (store.kind === "gift") {
      const r = await p.query("INSERT INTO sticker_gifts (transaction_id, from_user, pack, environment) VALUES ($1,$2,$3,$4) ON CONFLICT (transaction_id) DO NOTHING RETURNING id",
        [tx.transactionId, me.id, store.slug, tx.environment]);
      const id = r.rows[0]?.id ?? (await p.query("SELECT id FROM sticker_gifts WHERE transaction_id = $1 AND from_user = $2", [tx.transactionId, me.id])).rows[0]?.id;
      return json({ premium: me.plan === "premium", gift: id ? String(id) : null });
    }
    // a non-consumable belongs to the account it was first confirmed for
    const other = await p.query("SELECT user_id FROM iap_entitlements WHERE transaction_id = $1", [tx.originalTransactionId]);
    if (other.rows[0] && Number(other.rows[0].user_id) !== me.id) return json({ error: "other_account" }, 409);
    const c = await p.connect();
    let g: boolean | "conflict" = false;
    try { g = await grant(c, me.id, tx.productId, "apple", tx.originalTransactionId, tx.environment); } finally { c.release(); }
    // a one-of-one someone else got first (should not happen thanks to the reservation): kept on record, revoked,
    // for a refund by the owner; the app finishes the transaction and says so
    return json({ premium: me.plan === "premium", owned: (await ownedOf(me.id)).products, ...(g === "conflict" ? { conflict: true } : {}) });
  }

  // personal duas and name reports: a transaction id is credited once, whoever sends it
  if (tx.productId in DUA_PRODUCTS || tx.productId in NAME_PRODUCTS) {
    const names = tx.productId in NAME_PRODUCTS;
    const n = names ? NAME_PRODUCTS[tx.productId] : DUA_PRODUCTS[tx.productId];
    const c = await p.connect();
    try {
      await c.query("BEGIN");
      const r = await c.query(
        `INSERT INTO iap_consumables (transaction_id, user_id, product_id, credits, environment) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING RETURNING transaction_id`,
        [tx.transactionId, me.id, tx.productId, n, tx.environment],
      );
      if (r.rowCount) await (names ? addNameCredits(c, me.id, n) : addDuaCredits(c, me.id, n));
      await c.query("COMMIT");
    } catch {
      await c.query("ROLLBACK").catch(() => undefined);
      return json({ error: "db" }, 500);
    } finally {
      c.release();
    }
    const [cr, nm] = await Promise.all([duaCredits(me.id, me.plan === "premium"), nameCredits(me.id)]);
    return json({ premium: me.plan === "premium", dua: cr.dua, names: nm });
  }

  // a subscription belongs to the account it was first confirmed for (no sharing one Apple ID across accounts)
  const owner = await p.query("SELECT user_id FROM iap_purchases WHERE original_transaction_id = $1 ORDER BY created_at LIMIT 1", [tx.originalTransactionId]);
  if (owner.rows[0] && Number(owner.rows[0].user_id) !== me.id) return json({ error: "other_account" }, 409);

  const expires = tx.productId === PRO_SUBSCRIPTION ? tx.expiresDate ?? null : null;
  await p.query(
    `INSERT INTO iap_purchases (original_transaction_id, user_id, product_id, environment, purchased_at, transaction_id, expires_at)
     VALUES ($1, $2, $3, $4, to_timestamp($5 / 1000.0), $6, CASE WHEN $7::bigint IS NULL THEN NULL ELSE to_timestamp($7::bigint / 1000.0) END)
     ON CONFLICT (original_transaction_id, user_id) DO UPDATE SET transaction_id = EXCLUDED.transaction_id, expires_at = GREATEST(iap_purchases.expires_at, EXCLUDED.expires_at), updated_at = now()`,
    [tx.originalTransactionId, me.id, tx.productId, tx.environment, tx.purchaseDate, tx.transactionId, expires],
  );
  if (tx.productId === PRO_SUBSCRIPTION) {
    if (!expires || expires <= Date.now()) return json({ premium: me.plan === "premium", expired: true });
    // a lasting Premium stays lasting; otherwise Pro runs until the subscription's expiry
    await p.query(
      `UPDATE users SET plan = 'premium', pro_until = CASE WHEN plan = 'premium' AND pro_until IS NULL THEN NULL ELSE GREATEST(COALESCE(pro_until, to_timestamp(0)), to_timestamp($2 / 1000.0)) END WHERE id = $1`,
      [me.id, expires],
    );
    return json({ premium: true, until: expires });
  }
  await p.query("UPDATE users SET plan = 'premium', pro_until = NULL WHERE id = $1", [me.id]);
  return json({ premium: true, until: null });
}
