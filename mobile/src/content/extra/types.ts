// Common shape of every extra feed item (beyond Quran and hadith). Each item carries its source and license so the
// feed can always show attribution next to it.
export type Tradition = "all" | "sunni" | "shia";

export const EXTRA_KINDS = [
  "reciter-bio", // Wikipedia extract about a reciter the app plays
  "reciter-fact", // Wikidata facts (born, place, country, died) about a reciter
  "mosque", // famous mosques and sacred places
  "art", // Islamic art, calligraphy and architecture (Wikipedia + free Commons images)
  "met-art", // single objects from the Met's Islamic Art department, CC0 only
  "scholar-bio", // companions, the twelve imams, madhhab imams, mufassirun, muhaddithun, qurra, later scholars (Wikipedia)
  "scholar-work", // famous books (hadith collections, tafsir, fiqh foundations, grammar), short Wikipedia description
  "scholar-timeline", // scholars in chronological order with born/died years and places (Wikidata)
  "seerah", // the Prophet's life, ordered by "this day" when Wikidata has a date
  "history", // later Islamic history, ordered by "this day"
  "islam-country", // "Islam in <country>" for ~200 countries (Wikipedia)
  "spread", // spread of Islam: conquests, trade routes, Sufi orders, regions
  "golden-age", // scholars, scientists, inventions and institutions of the Islamic Golden Age
  "traditions", // Ramadan, Eid, Mawlid, Ashura/Muharram customs around the world
  "women", // notable women in Islamic history
  "prophets", // prophets mentioned in the Quran (Wikipedia, complements the app's own stories)
  "calligraphy-style", // scripts and master calligraphers
  "architecture-style", // regional styles and architectural elements
  "islamic-months", // the Hijri months and the calendar
  "pillars-hajj", // pillars of Islam and Iman, steps and places of Hajj and Umrah (encyclopedic, no rulings)
  "arabic-word", // Arabic word and root of the day from the app's own vocabulary
] as const;
export type ExtraKind = (typeof EXTRA_KINDS)[number];

export type ExtraItem = {
  /** stable across pages and days, e.g. "wiki:en:Kaaba" – use it to de-duplicate */
  id: string;
  kind: ExtraKind;
  title: string;
  body: string;
  /** language of title/body (may be "en" when the requested edition has no article) */
  lang: string;
  image?: string;
  /** "Author, License, via Wikimedia Commons" or "The Metropolitan Museum of Art, CC0" – show whenever image is shown */
  imageCredit?: string;
  imageLicenseUrl?: string;
  /** e.g. "Wikipedia", "Wikidata", "The Metropolitan Museum of Art", "Quran Masterclass" */
  source: string;
  sourceUrl: string;
  /** e.g. "CC BY-SA 4.0", "CC0 1.0" */
  license: string;
  licenseUrl?: string;
  tradition: Tradition;
  /** ISO date (YYYY-MM-DD, Gregorian) when the item has one; onThisDay = month and day match today */
  date?: string;
  onThisDay?: boolean;
  /** reciter items: the app's reciter folder (key of "tf:reciter") and Quran.com recitation id (0 = none) */
  reciterFolder?: string;
  reciterId?: number;
};
