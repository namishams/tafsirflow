import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { saveDecor } from "@/lib/store/entitlements";

export const dynamic = "force-dynamic";

// PUT /api/app/store/decor { items } – the stickers placed on the garden tree (owned only; sacred words never on the
// ground). Returns the albums completed so far and whether the collector frame was just earned.
export async function PUT(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  if (rateLimited(`decor:${clientIp(req)}`, 120, 60 * 60_000)) return json({ error: "rate" }, 429);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  const b = (await req.json().catch(() => ({}))) as { items?: unknown };
  const r = await saveDecor(me.id, b.items);
  return json(r, "error" in r ? 400 : 200);
}
