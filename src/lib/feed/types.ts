// Contracts of /api/feed/*. Quran and hadith text is never in the feed: items reference verseKey / hadithId and the app resolves the text.
export type FeedTradition = "all" | "sunni" | "shia";
export type FeedLocale = "de" | "en";
export type Localized = Partial<Record<FeedLocale, string>> & { en?: string };

export type FeedConfig = {
  version: number;
  updatedAt: string;
  minAppBuild: number;
  kindWeights: Record<string, number>;
  enabledKinds: string[];
  promo: {
    frequencyCap: { everyNItems: number; maxPerSession: number; maxPerDay: number };
    items: { id: string; title: string; image: string; deeplink: string }[];
  };
  topicChipGroups: { id: string; label: string; kinds: string[] }[];
  flags: Record<string, boolean>;
  /** only those active now and matching the tradition */
  announcements: { id: string; title: string; image?: string; deeplink?: string; startsAt: string; endsAt: string }[];
};

export type FeedItemKind = "editorial" | "announcement" | "verse-of-day" | "hadith-of-day" | "islamic-date" | "featured-surah";
export type FeedItem = {
  /** stable id, de-duplicate by it */
  id: string;
  kind: FeedItemKind;
  /** editorial posts: the editor's sub-kind (e.g. "verse", "hadith", "announcement", "article") */
  postKind?: string;
  title: string;
  body: string;
  /** only for non-scripture Arabic (titles, phrases); never Quran/hadith text */
  arabic?: string;
  image?: string;
  source: string;
  sourceUrl: string;
  tradition: FeedTradition;
  lang: FeedLocale;
  /** ISO timestamp the item counts as published */
  publishedAt: string;
  verseKey?: string; // "2:255" – app resolves text
  hadithId?: string; // "bukhari:1" – app resolves text
  surah?: number;
  hijri?: { y: number; m: number; d: number; monthName: string; event?: string; daysToEvent?: number };
  deeplink?: string;
};

export type FeedNewResponse = { items: FeedItem[]; generatedAt: string };
export type FeedPageResponse = { items: FeedItem[]; nextCursor: string | null; day: string };
