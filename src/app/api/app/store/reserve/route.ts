import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { reserve } from "@/lib/store/entitlements";

export const dynamic = "force-dynamic";

// POST /api/app/store/reserve { product } – hold a one-of-one for 10 minutes before the App Store sheet opens.
// 409 "taken" (owned by someone) or "reserved" (someone else is buying right now): the app hides the buy button.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  if (rateLimited(`reserve:${clientIp(req)}`, 30, 60 * 60_000)) return json({ error: "rate" }, 429);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  const b = (await req.json().catch(() => ({}))) as { product?: unknown };
  if (typeof b.product !== "string") return json({ error: "input" }, 400);
  const r = await reserve(me.id, b.product);
  return r === "ok" ? json({ ok: true }) : json({ error: r }, r === "input" ? 400 : 409);
}
