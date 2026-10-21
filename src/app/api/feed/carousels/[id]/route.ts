import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { cached, limit, parseParams } from "@/lib/feed";
import { carouselById } from "@/lib/feed/carousels/store";
import { resolveCarousel } from "@/lib/feed/carousels/resolve";

export const dynamic = "force-dynamic";

// GET /api/feed/carousels/<id>?locale[&resolved=1] → one CarouselPayload (deep links, shared links, the app's gallery)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const l = limit(req, "carousel");
  if (l) return l;
  const { id } = await params;
  if (!/^[a-z0-9-]{3,80}$/.test(id)) return json({ error: "not_found" }, 404);
  const p = parseParams(req);
  const c = await carouselById(id, p.locale);
  if (!c) return json({ error: "not_found" }, 404);
  if (req.nextUrl.searchParams.get("resolved") !== "1") return cached(req, c, 600);
  const r = await resolveCarousel(c, p.locale).catch(() => null);
  return r ? cached(req, r, 600) : json({ error: "unavailable" }, 503);
}
