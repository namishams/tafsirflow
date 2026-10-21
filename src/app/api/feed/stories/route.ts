import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { cached, limit } from "@/lib/feed";
import { FEED_LOCALES } from "@/lib/feed/types";
import { loadFeedTexts } from "@/lib/feedWeb/loadTexts";
import { buildStories, railOf } from "@/lib/feedWeb/stories";

export const dynamic = "force-dynamic";

// GET /api/feed/stories?locale=xx          → { rail }  the story circles (id, title, Arabic, story ids)
// GET /api/feed/stories?locale=xx&full=1   → { groups, names }  all story cards (opened with the viewer)
// Built from the website's own content (Islam library, reciter biographies, Shams Method, Secrets of the Quran).
export async function GET(req: NextRequest) {
  const l = limit(req, "stories");
  if (l) return l;
  const q = req.nextUrl.searchParams;
  const locale = (FEED_LOCALES as readonly string[]).includes(q.get("locale") ?? "") ? (q.get("locale") as string) : "en";
  try {
    const T = await loadFeedTexts(locale);
    const lib = await buildStories(locale, T.prophet.knownFor);
    if (q.get("full") === "1") return cached(req, { groups: lib.groups, names: lib.names }, 3600);
    return cached(req, { rail: railOf(lib) }, 3600);
  } catch (e) {
    console.error("feed/stories", e);
    return json({ rail: [], groups: { prophet: [], islam: [], reciters: [], tips: [], secrets: [] }, names: [] }, 200, { "Cache-Control": "public, s-maxage=30" });
  }
}
