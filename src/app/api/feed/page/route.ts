import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { cached, decodeCursor, feedPage, limit, parseParams } from "@/lib/feed";

export const dynamic = "force-dynamic";

// GET /api/feed/page?locale&tradition&cursor → FeedPageResponse (deterministic per day; cursor from the previous response)
export async function GET(req: NextRequest) {
  const l = limit(req, "page");
  if (l) return l;
  const cursor = decodeCursor(req.nextUrl.searchParams.get("cursor"));
  if (cursor === "invalid") return json({ error: "invalid_cursor" }, 400);
  try {
    return cached(req, await feedPage(parseParams(req), cursor), cursor ? 3600 : 300);
  } catch (e) {
    console.error("feed/page", e);
    return json({ items: [], nextCursor: null, day: new Date().toISOString().slice(0, 10) }, 200, { "Cache-Control": "public, s-maxage=30" });
  }
}
