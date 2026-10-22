import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { setFrame, setShowcase } from "@/lib/store/entitlements";

export const dynamic = "force-dynamic";

// POST /api/app/store/profile { frame?: slug | null, showcase?: rare slugs (max 3) } – owned items only.
// The verified tick and the PRO capsule are never part of this: they cannot be bought here.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  if (rateLimited(`cosm:${clientIp(req)}`, 60, 60 * 60_000)) return json({ error: "rate" }, 429);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  const b = (await req.json().catch(() => ({}))) as { frame?: unknown; showcase?: unknown };
  const out: Record<string, unknown> = {};
  if ("frame" in b) { const r = await setFrame(me.id, b.frame); if (r && typeof r === "object") return json(r, 400); out.frame = r; }
  if ("showcase" in b) { const r = await setShowcase(me.id, b.showcase); if (!Array.isArray(r)) return json(r, 400); out.showcase = r; }
  return json(out);
}
