import { promises as fs } from "fs";
import path from "path";
import type { FeedItem, FeedLocale, FeedTradition, Localized } from "./types";

type RawPost = {
  id: string; kind: string; title: Localized; body: Localized; arabic?: string; image?: string;
  source: string; sourceUrl: string; tradition?: FeedTradition; publishAt: string; expiresAt?: string;
  verseKey?: string; hadithId?: string; surah?: number; deeplink?: string;
};

const DIR = path.join(process.cwd(), "src/lib/feed/posts");
let cache: { at: number; posts: RawPost[] } | null = null;

const pick = (l: Localized, loc: FeedLocale) => l[loc] ?? l.en ?? Object.values(l)[0] ?? "";
const valid = (p: RawPost) =>
  typeof p?.id === "string" && p.title && p.body && typeof p.source === "string" && typeof p.sourceUrl === "string" && !Number.isNaN(Date.parse(p.publishAt));

// reads every posts/*.json; broken files are skipped (logged), never break the feed
export async function loadPosts(): Promise<RawPost[]> {
  if (cache && Date.now() - cache.at < 60_000) return cache.posts;
  const posts: RawPost[] = [];
  try {
    for (const f of (await fs.readdir(DIR)).filter((f) => f.endsWith(".json")).sort()) {
      try {
        const p = JSON.parse(await fs.readFile(path.join(DIR, f), "utf8")) as RawPost;
        if (valid(p)) posts.push(p); else console.warn("feed: invalid post", f);
      } catch { console.warn("feed: unreadable post", f); }
    }
  } catch { /* no directory in this deployment */ }
  cache = { at: Date.now(), posts };
  return posts;
}

export const traditionOk = (t: FeedTradition | undefined, want: FeedTradition) => want === "all" || !t || t === "all" || t === want;

export async function editorialItems(locale: FeedLocale, tradition: FeedTradition, now: Date, since?: Date): Promise<FeedItem[]> {
  const t = now.getTime();
  return (await loadPosts())
    .filter((p) => traditionOk(p.tradition, tradition))
    .filter((p) => Date.parse(p.publishAt) <= t && (!p.expiresAt || Date.parse(p.expiresAt) > t))
    .filter((p) => !since || Date.parse(p.publishAt) > since.getTime())
    .sort((a, b) => Date.parse(b.publishAt) - Date.parse(a.publishAt))
    .map((p) => ({
      id: `post:${p.id}`, kind: p.kind === "announcement" ? "announcement" : "editorial", postKind: p.kind,
      title: pick(p.title, locale), body: pick(p.body, locale), arabic: p.arabic, image: p.image,
      source: p.source, sourceUrl: p.sourceUrl, tradition: p.tradition ?? "all", lang: locale,
      publishedAt: new Date(p.publishAt).toISOString(), verseKey: p.verseKey, hadithId: p.hadithId, surah: p.surah, deeplink: p.deeplink,
    }));
}
