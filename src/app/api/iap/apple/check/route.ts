import { NextRequest } from "next/server";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { IOS_BUNDLE_ID, isProSubscription, verifyAppleTransaction } from "@/lib/appleIap";

export const dynamic = "force-dynamic";

// Pro without an account (App Review 5.1.1 / 3.1.2: a subscription must be purchasable without registering when its
// content is not tied to an account). The app sends the signed StoreKit transaction; the server only checks Apple's
// signature, bundle, product and expiry and answers whether Pro is active on this device. Nothing is stored and no
// account is touched; once the person signs in, the app binds the same transaction through /api/iap/apple.
// Sandbox transactions (TestFlight, App Review) are accepted here: they unlock the device only, never an account.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  if (rateLimited(`iap-check:${clientIp(req)}`, 30, 60 * 60_000)) return json({ error: "rate" }, 429);
  const b = (await req.json().catch(() => ({}))) as { jws?: unknown };
  if (typeof b.jws !== "string" || b.jws.length > 20000) return json({ error: "input" }, 400);
  const tx = verifyAppleTransaction(b.jws);
  if (!tx || tx.bundleId !== IOS_BUNDLE_ID || !isProSubscription(tx.productId)) return json({ error: "invalid" }, 400);
  if (tx.revocationDate) return json({ premium: false, revoked: true });
  const until = tx.expiresDate ?? null;
  if (!until || until <= Date.now()) return json({ premium: false, expired: true });
  return json({ premium: true, until, environment: tx.environment });
}
