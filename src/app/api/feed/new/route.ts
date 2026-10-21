import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { cached, feedNew, limit, parseParams } from "@/lib/feed";

export const dynamic = "force-dynamic";

// GET /api/feed/new?locale&tradition&since=<iso> → FeedNewResponse
export async function GET(req: NextRequest) {
  const l = limit(req, "new");
  if (l) return l;
  const s = req.nextUrl.searchParams.get("since");
  const since = s ? new Date(s) : undefined;
  if (since && Number.isNaN(since.getTime())) return json({ error: "invalid_since" }, 400);
  try {
    // round "since" down to the minute so CDN keys stay shared
    const items = await feedNew(parseParams(req), since && new Date(Math.floor(since.getTime() / 60_000) * 60_000));
    return cached(req, { items, generatedAt: new Date().toISOString() }, 120);
  } catch (e) {
    console.error("feed/new", e);
    return json({ items: [], generatedAt: new Date().toISOString() }, 200, { "Cache-Control": "public, s-maxage=30" });
  }
}
