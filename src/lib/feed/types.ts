// Contracts of /api/feed/*. Quran and hadith text is never in the feed: items reference verseKey / hadithId and the app resolves the text.
export type FeedTradition = "all" | "sunni" | "shia";
export const FEED_LOCALES = ["de", "en", "ar", "tr", "ur", "fa", "ps", "fr", "es", "id", "ms", "bn", "ru", "zh"] as const;
export type FeedLocale = (typeof FEED_LOCALES)[number];
export type Localized = Partial<Record<FeedLocale, string>> & { en?: string };

export type FeedConfig = {
  version: number;
  updatedAt: string;
  minAppBuild: number;
  kindWeights: Record<string, number>;
  enabledKinds: string[];
  promo: {
    frequencyCap: { everyNItems: number; maxPerSession: number; maxPerDay: number };
    items: { id: string; title: string; image?: string; deeplink: string }[];
  };
  topicChipGroups: { id: string; label: string; kinds: string[] }[];
  flags: Record<string, boolean>;
  /** only those active now and matching the tradition */
  announcements: { id: string; title: string; image?: string; deeplink?: string; startsAt: string; endsAt: string }[];
  /** monetisation of the feed (optional; the app falls back to its local defaults for every missing field) */
  monetize?: FeedMonetize;
  /** placeholder slots for future ad posts in the app's Home stream (no ad SDK yet); off by default */
  adSlots?: FeedAdSlots;
};

/** Ad slots: the app reserves a position in the stream when `enabled`; until an ad provider is wired in the slot stays
 * empty. Never for Pro users; the app enforces at least 6 posts between slots and none in the first 5 posts. */
export type FeedAdSlots = {
  enabled: boolean;
  /** one slot per N posts (min 6) */
  everyNItems?: number;
  /** no slot before this post index of a session (min 5) */
  firstAfter?: number;
  maxPerSession?: number;
  /** the ad provider once one is chosen; "none" until then */
  provider?: string;
};

/** Offers in the feed. Only real store prices are shown (the app reads them from the store); no countdowns, no discounts. */
export type FeedOfferId =
  | "context-dua" | "context-name" | "context-lesson" | "context-reciters"
  | "premium" | "paywall" | "moment-streak" | "moment-words" | "moment-saves" | "moment-share";
export type FeedMonetize = {
  /** A/B variant ids; each install picks one at random and keeps it while it stays in this list */
  variants?: string[];
  /** switch single offers off (missing = on) */
  offers?: Partial<Record<FeedOfferId, boolean>>;
  /** contextual offers below a post: at most one per N posts and this many per session */
  context?: { everyNItems?: number; maxPerSession?: number };
  /** Pro-only posts: one per N posts, at most this many per session; free users may open `freePerDay` of them per day */
  premium?: { everyNItems?: number; maxPerSession?: number; freePerDay?: number; kinds?: string[] };
  /** the paywall card after the free premium posts of the day are used up; trialDays only if the store offers that trial.
   *  `day1`: the app's paywall right after the onboarding plan (every field optional; missing = app defaults).
   *  Prices and trials always come from the store; this only chooses layout and order. */
  paywall?: { maxPerSession?: number; trialDays?: number; day1?: FeedDay1Paywall };
  /** free limits in the app (missing = the app's local defaults in mobile/src/lib/entitlements.ts) */
  limits?: FeedFreeLimits;
  /** thresholds of the celebration cards (each shown once per install) */
  moments?: { streakDays?: number; words?: number; saves?: number };
};

/** Day-1 paywall after the onboarding plan. */
export type FeedDay1Paywall = {
  /** false = skip the paywall after the plan (default true) */
  enabled?: boolean;
  /** layout variant: "plan" (benefits from the personal plan first) or "compact" (prices first) */
  variant?: "plan" | "compact";
  /** the plan preselected when a yearly product exists (default "yearly") */
  defaultPlan?: "yearly" | "monthly";
  /** show the Free / Pro comparison rows (default true) */
  showCompare?: boolean;
};
/** Daily limits for free users in the app; Pro has none. */
export type FeedFreeLimits = {
  /** new review / flash cards per day (vocabulary, SRS) */
  cardsPerDay?: number;
  /** unit tests / quizzes per day */
  testsPerDay?: number;
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
