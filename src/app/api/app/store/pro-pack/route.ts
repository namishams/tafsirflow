import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { takeProPack } from "@/lib/store/entitlements";

export const dynamic = "force-dynamic";

// POST /api/app/store/pro-pack – a Pro member takes the pack of the month (one per month; it stays theirs)
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  if (rateLimited(`propack:${clientIp(req)}`, 20, 60 * 60_000)) return json({ error: "rate" }, 429);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  if (me.plan !== "premium") return json({ error: "pro" }, 403);
  const r = await takeProPack(me.id);
  return json(r, r.ok ? 200 : 409);
}
