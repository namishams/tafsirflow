import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { cached, decodeCursor, feedPage, limit, parseParams } from "@/lib/feed";
import { parseKinds, parseTopic } from "@/lib/feed/corpus";
import { resolveFeed } from "@/lib/feed/resolve";
import { fetchWebPage } from "@/lib/feedWeb/page";

export const dynamic = "force-dynamic";

// GET /api/feed/web?v=2&locale&tradition&cursor&seed&limit&kinds&topic → WebFeedPage { items: WebCard[], nextCursor }
//   The website feed (src/lib/feedWeb/types.ts): the same server corpus as /api/feed/page?v=2 (same seed / cursor / kinds /
//   topic rules; kinds=verse,hadith topic=quran restrict the stream), every item resolved on the server to a plain card with
//   its Quran / hadith / tafsir / article text, source and licence. The browser only passes `nextCursor` back. Without a
//   corpus (no database, empty table) the day-by-day posts answer, with their own cursor format. A page can hold fewer
//   cards than `limit` (items that cannot be resolved are dropped). Errors answer { items: [], nextCursor: null } with 200.
// GET /api/feed/web?locale&tradition&cursor (no v=2) → like /api/feed/page, with verse / hadith text resolved (the earlier website feed)
export async function GET(req: NextRequest) {
  const l = limit(req, "web");
  if (l) return l;
  const q = req.nextUrl.searchParams;
  if (q.get("v") === "2") return v2(req);

  const cursor = decodeCursor(q.get("cursor"));
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

async function v2(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const p = parseParams(req);
  const raw = q.get("cursor");
  const seed = /^[A-Za-z0-9_-]{4,32}$/.test(q.get("seed") ?? "") ? q.get("seed") : null;
  const n = Number(q.get("limit") ?? "");
  const size = Number.isInteger(n) && n >= 4 && n <= 30 ? n : 12;
  const kinds = parseKinds(q.get("kinds")), topic = parseTopic(q.get("topic"));
  if (kinds === "invalid") return json({ error: "invalid_kinds" }, 400);
  if (topic === "invalid") return json({ error: "invalid_topic" }, 400);
  try {
    const r = await fetchWebPage({ locale: p.locale, tradition: p.tradition, seed, limit: size, kinds, topic }, raw);
    if (r === "invalid_cursor") return json({ error: "invalid_cursor" }, 400);
    // a page with unresolved items (or none at all) is cached briefly only, so a source that was down recovers quickly
    return cached(req, r.page, !r.page.items.length ? 30 : r.partial ? 60 : raw ? 1800 : 300);
  } catch (e) {
    console.error("feed/web v2", e);
    return json({ items: [], nextCursor: null }, 200, { "Cache-Control": "public, s-maxage=30" });
  }
}
