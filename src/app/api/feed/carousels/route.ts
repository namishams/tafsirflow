import { NextRequest } from "next/server";
import { cached, limit, parseParams } from "@/lib/feed";
import { carouselList, seriesList } from "@/lib/feed/carousels/store";
import { resolveCarousel } from "@/lib/feed/carousels/resolve";

export const dynamic = "force-dynamic";

// GET /api/feed/carousels?locale&tradition[&series=<id>&topic=<topic>&offset=0&limit=24&resolved=1]
// → { total, items: CarouselPayload[], series: { id, label, topic, count }[] }. The carousels of the feed in one
// language (src/lib/feed/carousels): slide texts in the editors' words, scripture as references. resolved=1 (website)
// adds the scripture text of every slide from its source; carousels whose text cannot be loaded are left out.
export async function GET(req: NextRequest) {
  const l = limit(req, "carousels");
  if (l) return l;
  const q = req.nextUrl.searchParams;
  const p = parseParams(req);
  const series = /^[a-z0-9-]{2,60}$/.test(q.get("series") ?? "") ? q.get("series")! : undefined;
  const topic = /^[a-z]{2,16}$/.test(q.get("topic") ?? "") ? q.get("topic")! : undefined;
  const offset = Math.max(0, Math.min(100_000, Number(q.get("offset")) || 0));
  const size = Math.max(1, Math.min(q.get("resolved") === "1" ? 24 : 60, Number(q.get("limit")) || 24));
  const page = await carouselList({ locale: p.locale, tradition: p.tradition, series, topic, offset, limit: size });
  const items = q.get("resolved") === "1"
    ? (await Promise.all(page.items.map((c) => resolveCarousel(c, p.locale).catch(() => null)))).filter((x) => !!x)
    : page.items;
  return cached(req, { total: page.total, offset, items, series: await seriesList(p.locale, p.tradition) }, 600);
}
