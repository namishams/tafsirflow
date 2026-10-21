// Shared shape of every item built from public Islamic data APIs. Quran and hadith text always comes from the
// source data, never typed by hand.
export type Tradition = "all" | "sunni" | "shia";

export const SOURCE_KINDS = [
  "tafsir", // excerpt from a Quran.com tafsir, link to the full commentary
  "hadith", // Sunni collections via fawazahmed0/hadith-api
  "hadith-of-day", // one hadith seeded by today's date (Sunni or Shia depending on tradition)
  "shia-hadith", // Thaqalayn API (al-Kafi, al-Amali, ...)
  "dua", // Hisnul Muslim (hisnmuslim.com) + fitrahive/dua-dhikr, tagged with time of day
  "word-root", // Quranic Arabic Corpus roots: "this root appears N times"
  "word-of-day", // Arabic word from a seeded verse with word-by-word translation (Quran.com)
  "asma", // 99 names of Allah (Aladhan API)
  "surah-info", // surah introductions (Quran.com chapter info)
  "islamic-date", // today's Hijri date and upcoming Islamic holidays (Aladhan)
] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

export type TimeOfDay = "morning" | "evening" | "sleep" | "prayer" | "travel" | "any";

export type SourceItem = {
  /** stable id, use for de-duplication */
  id: string;
  kind: SourceKind;
  title: string;
  body: string;
  /** Arabic original from the source data, when available */
  arabic?: string;
  /** language of title/body (may fall back to "en" or "ar") */
  lang: string;
  /** human-readable source name, e.g. "Quran.com – Tafsir Ibn Kathir" */
  source: string;
  sourceUrl: string;
  tradition: Tradition;
  /** duas: when to read */
  timeOfDay?: TimeOfDay;
  /** ISO date (Gregorian) for dated items */
  date?: string;
  /** extra tags, e.g. collection slug, root, verse key */
  tags?: string[];
};

export type FeedOptions = {
  /** user's tradition setting; "all" (default) shows everything */
  tradition?: Tradition;
  /** items per page (default 5, max 10) */
  pageSize?: number;
  /** override "today" (testing) */
  now?: Date;
};
