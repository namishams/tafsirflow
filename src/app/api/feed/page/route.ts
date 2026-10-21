import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { cached, decodeCursor, feedPage, limit, parseParams } from "@/lib/feed";
import { corpusPage, decodeCorpusCursor, isCorpusCursor, parseKinds, parseTopic } from "@/lib/feed/corpus";

export const dynamic = "force-dynamic";

// GET /api/feed/page?locale&tradition&cursor[&v=2&seed=<install seed>&limit=4..30&kinds=verse,hadith&topic=quran] → FeedPageResponse
// (kinds / topic restrict the corpus stream to those kinds / that topic; the app sends neither)
// carousels=1: the client renders carousel and wisdom posts (src/lib/feed/carousels); without it none are sent
// Served from the server corpus (feed_items, src/lib/feed/corpus.ts): a per-install shuffled, endless order (the cursor
// from the previous response continues it; nextCursor is never null). Without v=2 (older app builds) only verse and
// hadith posts come, as "editorial" items they already render. Without the corpus (no database, table still empty) the
// previous day-by-day page answers, with its own cursors.
export async function GET(req: NextRequest) {
  const l = limit(req, "page");
  if (l) return l;
  const q = req.nextUrl.searchParams;
  const raw = q.get("cursor");
  const p = parseParams(req);
  const v2 = q.get("v") === "2";
  const seed = /^[A-Za-z0-9_-]{4,32}$/.test(q.get("seed") ?? "") ? q.get("seed") : null;
  const n = Number(q.get("limit") ?? "");
  const size = Number.isInteger(n) && n >= 4 && n <= 30 ? n : 12;
  const kinds = parseKinds(q.get("kinds")), topic = parseTopic(q.get("topic"));
  if (kinds === "invalid") return json({ error: "invalid_kinds" }, 400);
  if (topic === "invalid") return json({ error: "invalid_topic" }, 400);
  try {
    const cc = isCorpusCursor(raw) ? decodeCorpusCursor(raw!) : null;
    if (isCorpusCursor(raw) && !cc) return json({ error: "invalid_cursor" }, 400);
    // a cursor of the day-by-day page (an app session from before the corpus) continues in the corpus
    const legacy = raw && !cc ? decodeCursor(raw) : null;
    if (legacy === "invalid") return json({ error: "invalid_cursor" }, 400);
    const page = await corpusPage({ ...p, v2, seed, limit: size, kinds, topic, carousels: q.get("carousels") === "1" }, cc).catch((e) => { console.error("feed/page corpus", e); return null; });
    if (page) {
      if (legacy && !cc) page.items = page.items.filter((i) => i.id.startsWith("c:"));
      return cached(req, page, raw ? 3600 : 300);
    }
    return cached(req, await feedPage(p, cc ? null : legacy), raw ? 3600 : 300);
  } catch (e) {
    console.error("feed/page", e);
    return json({ items: [], nextCursor: null, day: new Date().toISOString().slice(0, 10) }, 200, { "Cache-Control": "public, s-maxage=30" });
  }
}
