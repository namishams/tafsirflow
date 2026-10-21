// One page of the website feed: feed items (server corpus, or the day-by-day posts when there is no corpus) resolved to
// cards. Used by GET /api/feed/web?v=2 (the browser pages through it with the cursor it gets back) and by the server
// components of /feed and the home section (loadWebFeed, first render). Never throws.
import { decodeCursor, feedPage } from "@/lib/feed";
import { corpusPage, decodeCorpusCursor, isCorpusCursor } from "@/lib/feed/corpus";
import { FEED_LOCALES } from "@/lib/feed/types";
import type { FeedCorpusKind, FeedItem, FeedLocale, FeedTradition } from "@/lib/feed/types";
import { resolveCards } from "./resolve";
import type { WebCard, WebFeedPage } from "./types";

export type WebPageParams = {
  locale: string;
  tradition?: FeedTradition;
  /** the install / browser seed: its own shuffled order (4-32 characters of A-Z a-z 0-9 _ -); none = the corpus' day order */
  seed?: string | null;
  /** cards per page, 4-30 (default 12) */
  limit?: number;
  /** only these corpus kinds / only this topic (see CorpusParams) */
  kinds?: FeedCorpusKind[];
  topic?: string;
};
export type WebPageResult = { page: WebFeedPage; /** some items could not be resolved (a source was slow or down) */ partial: boolean };

const EMPTY: WebFeedPage = { items: [], nextCursor: null };
/** how many more pages are tried when a page resolved to no card at all but the cursor moved on */
const EXTRA_PAGES = 3;

const normalizeLocale = (l: string): FeedLocale => {
  const x = (l || "en").slice(0, 2).toLowerCase();
  return (FEED_LOCALES as readonly string[]).includes(x) ? (x as FeedLocale) : "en";
};

/** the corpus kind(s) of a card, for the day-by-day fallback where a kind filter cannot be applied in the database */
const corpusKindsOf = (c: WebCard): string[] => (c.kind === "verse" ? ["verse"] : c.kind === "hadith" ? ["hadith", "shia-hadith"] : []);

/**
 * `rawCursor`: the cursor of the previous page ("c2.…" of the corpus, or a day-by-day cursor), null for the first page.
 * Returns "invalid_cursor" for a cursor this server cannot read. Falls back to the day-by-day posts when there is no
 * corpus (no database, empty table); the cursor of the answer then has the day-by-day format. A page that resolves to no
 * card while the cursor advances continues with the next page (up to three times), so the browser rarely sees an empty page.
 */
export async function fetchWebPage(params: WebPageParams, rawCursor: string | null): Promise<WebPageResult | "invalid_cursor"> {
  const locale = normalizeLocale(params.locale);
  const tradition = params.tradition ?? "all";
  const size = Number.isInteger(params.limit) && (params.limit as number) >= 4 && (params.limit as number) <= 30 ? (params.limit as number) : 12;
  const seed = params.seed && /^[A-Za-z0-9_-]{4,32}$/.test(params.seed) ? params.seed : null;
  // carousel and wisdom posts (src/lib/feed/carousels) are resolved like the rest (resolve.ts), as in the app
  const kinds = params.kinds;
  const filtered = !!(kinds?.length || params.topic);

  let cc = isCorpusCursor(rawCursor) ? decodeCorpusCursor(rawCursor as string) : null;
  if (isCorpusCursor(rawCursor) && !cc) return "invalid_cursor";
  // a cursor of the day-by-day page (a browser that started without a corpus) continues in the corpus
  let legacy = rawCursor && !cc ? decodeCursor(rawCursor) : null;
  if (legacy === "invalid") return "invalid_cursor";
  const fromLegacy = !!legacy && !cc;

  const cards: WebCard[] = [];
  let nextCursor: string | null = null;
  let partial = false;
  for (let attempt = 0; attempt <= EXTRA_PAGES; attempt++) {
    let items: FeedItem[];
    let corpus: Awaited<ReturnType<typeof corpusPage>> = null;
    try {
      corpus = await corpusPage({ locale, tradition, v2: true, seed, limit: size, kinds, topic: params.topic, carousels: true }, cc);
    } catch (e) {
      console.error("feed/web corpus", e);
    }
    let corpusNext: string | null = null;
    if (corpus) {
      items = fromLegacy ? corpus.items.filter((i) => i.id.startsWith("c:")) : corpus.items;
      corpusNext = corpus.nextCursor;
      nextCursor = corpus.nextCursor;
    } else {
      // no corpus: the day-by-day posts (a corpus cursor cannot be continued there: start again)
      const page = await feedPage({ locale, tradition }, cc ? null : legacy as { day: number; offset: number } | null);
      items = page.items;
      nextCursor = page.nextCursor;
    }
    const got = await resolveCards(items, locale, { tradition });
    // the day-by-day fallback cannot filter in the database: filter the cards instead
    const keep = corpus || !filtered
      ? got
      : got.filter((c) => (!kinds?.length || corpusKindsOf(c).some((k) => (kinds as string[]).includes(k))) && (!params.topic || c.topic === params.topic));
    if (keep.length < items.length) partial = true;
    cards.push(...keep);
    if (cards.length || !nextCursor) break;
    // nothing to show but more to come: the next page
    if (corpus) { cc = decodeCorpusCursor(corpusNext as string); if (!cc) break; legacy = null; }
    else { legacy = decodeCursor(nextCursor); if (legacy === "invalid") break; cc = null; }
  }
  const seen = new Set<string>();
  const items = cards.filter((c) => !seen.has(c.id) && !!seen.add(c.id));
  return { page: { items, nextCursor }, partial };
}

/**
 * The first page for the server components of /feed and the home section. Without a seed the corpus' day order is used,
 * so every visitor sees the same first cards of the day. Swallows every error: an empty page.
 */
export async function loadWebFeed(locale: string, opts: { limit?: number; tradition?: FeedTradition; kinds?: FeedCorpusKind[]; topic?: string; seed?: string | null } = {}): Promise<WebFeedPage> {
  try {
    const r = await fetchWebPage({ locale, tradition: opts.tradition, limit: opts.limit, kinds: opts.kinds, topic: opts.topic, seed: opts.seed ?? null }, null);
    return r === "invalid_cursor" ? EMPTY : r.page;
  } catch (e) {
    console.error("loadWebFeed", e);
    return EMPTY;
  }
}
