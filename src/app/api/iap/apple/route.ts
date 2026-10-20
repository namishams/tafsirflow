import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { pool } from "@/lib/db";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { IOS_BUNDLE_ID, PREMIUM_PRODUCT, verifyAppleTransaction } from "@/lib/appleIap";

export const dynamic = "force-dynamic";

// Links a Premium purchase from the iOS app to the signed-in account, so Premium also works on the web and other devices.
// Test purchases (Sandbox, TestFlight, App Review) only count for the admin or with IAP_ALLOW_SANDBOX=1.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  if (rateLimited(`iap:${clientIp(req)}`, 20, 60 * 60_000)) return json({ error: "rate" }, 429);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  const p = pool();
  if (!p) return json({ error: "nodb" }, 503);
  const b = (await req.json().catch(() => ({}))) as { jws?: unknown };
  if (typeof b.jws !== "string" || b.jws.length > 20000) return json({ error: "input" }, 400);
  const tx = verifyAppleTransaction(b.jws);
  if (!tx || tx.bundleId !== IOS_BUNDLE_ID || tx.productId !== PREMIUM_PRODUCT) return json({ error: "invalid" }, 400);
  if (tx.revocationDate) return json({ error: "revoked" }, 400);
  if (tx.environment !== "Production" && me.role !== "admin" && process.env.IAP_ALLOW_SANDBOX !== "1") return json({ premium: false, sandbox: true });
  await p.query(
    `INSERT INTO iap_purchases (original_transaction_id, user_id, product_id, environment, purchased_at)
     VALUES ($1, $2, $3, $4, to_timestamp($5 / 1000.0)) ON CONFLICT DO NOTHING`,
    [tx.originalTransactionId, me.id, tx.productId, tx.environment, tx.purchaseDate],
  );
  await p.query("UPDATE users SET plan = 'premium' WHERE id = $1", [me.id]);
  return json({ premium: true });
}
