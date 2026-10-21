import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { cached, decodeCursor, feedPage, limit, parseParams } from "@/lib/feed";
import { resolveFeed } from "@/lib/feed/resolve";

export const dynamic = "force-dynamic";

// GET /api/feed/web?locale&tradition&cursor → like /api/feed/page, with verse / hadith text resolved from the sources (website feed)
export async function GET(req: NextRequest) {
  const l = limit(req, "web");
  if (l) return l;
  const cursor = decodeCursor(req.nextUrl.searchParams.get("cursor"));
  if (cursor === "invalid") return json({ error: "invalid_cursor" }, 400);
  const p = parseParams(req);
  try {
    const page = await feedPage(p, cursor);
    return cached(req, { ...page, items: await resolveFeed(page.items, p.locale) }, cursor ? 3600 : 300);
  } catch (e) {
    console.error("feed/web", e);
    return json({ items: [], nextCursor: null, day: new Date().toISOString().slice(0, 10) }, 200, { "Cache-Control": "public, s-maxage=30" });
  }
}
