// Carousels (Instagram-style posts of 5–10 slides) and wisdom posts (one image) of the feed. The texts are the
// editors' own words in data/*.json and wisdom/*.json (en, de, ar inline; the other app languages in i18n/<lang>/*.json,
// missing ones fall back to English). Scripture is never typed: a slide carries a verse key, a hadith reference
// (collection + number) or a Hisnul Muslim dua id, and the app / the website load the text from their sources.
// feed_items (scripts/carousels-load.mjs) holds only the ids; /api/feed/page attaches the localized payload.
import type { FeedLocale, FeedTradition } from "../types";

export type CText = Partial<Record<FeedLocale, string>> & { en: string };
export type CList = Partial<Record<FeedLocale, string[]>> & { en: string[] };
/** the app's library topics (chips in Home and Explore) */
export type CarouselTopic = "quran" | "tafsir" | "hadith" | "duas" | "prayer" | "seerah" | "holy" | "scholars" | "history" | "art";
export const CAROUSEL_TOPICS: CarouselTopic[] = ["quran", "tafsir", "hadith", "duas", "prayer", "seerah", "holy", "scholars", "history", "art"];
export type PaletteId = "night" | "emerald" | "dawn" | "parchment" | "marble";
export const PALETTE_IDS: PaletteId[] = ["night", "emerald", "dawn", "parchment", "marble"];
/** collections the app and the website can load by number (fawazahmed0/hadith-api numbering) */
export const HADITH_COLLECTIONS = ["bukhari", "muslim", "nawawi"] as const;
export type HadithCollection = (typeof HADITH_COLLECTIONS)[number];

// ---------- the files as the editors write them ----------
/** one content slide: text only, or text with ONE reference (verse / verse pair / hadith / dua) */
export type RawSlide = {
  title?: CText;
  body?: CText;
  /** short own Arabic that is not scripture: a root ("ر ح م"), a term, a name of Allah, a phrase like "سبحان الله" */
  arabic?: string;
  /** a numbered list (3–6 items) instead of / under the body */
  list?: CList;
  /** "2:255" or a range of up to three verses "2:255-257" */
  verse?: string;
  /** two similar verses side by side (mutashabihat) */
  pair?: [string, string];
  /** "bukhari:6018", "muslim:6517", "nawawi:13" */
  hadith?: string;
  /** Hisnul Muslim "hisn:<chapter>:<index>" (hisnmuslim.com, index from 0) */
  dua?: string;
  /** editors' check (not shown): word(s) that occur in the English source text of the reference */
  check?: string | string[];
};
export type RawSource = { label: CText | string; url?: string };
export type RawCarousel = {
  id: string;
  tradition?: FeedTradition;
  topic?: CarouselTopic;
  palette?: PaletteId;
  /** new religious content waits for a scholar's review (shown as a small note in the app and on the website) */
  needs_review?: boolean;
  cover: { kicker?: CText; title: CText; sub?: CText; arabic?: string };
  slides: RawSlide[];
  /** further sources besides the references of the slides (books, websites) */
  sources?: RawSource[];
};
export type RawSeries = { series: string; label: CText; topic: CarouselTopic; tradition?: FeedTradition; items: RawCarousel[] };

export type WisdomKind = "verse" | "hadith" | "saying" | "reflection";
export type RawWisdom = {
  id: string;
  verse?: string;
  hadith?: string;
  /** saying / reflection: the text in the editors' words (a saying: the translation of the cited original) */
  text?: CText;
  /** the original Arabic of a classical saying, only when it is certain */
  arabic?: string;
  /** a saying: who said it and the exact work it is found in */
  by?: CText;
  work?: CText;
  theme?: string;
  tradition?: FeedTradition;
  check?: string | string[];
  needs_review?: boolean;
};
export type RawWisdomSet = { set: string; kind: WisdomKind; theme?: string; tradition?: FeedTradition; items: RawWisdom[] };

// ---------- what the clients get (one language) ----------
export type CarouselSlide = {
  /** slide number among the content slides (1-based) */
  n: number;
  t: "text" | "verse" | "pair" | "hadith" | "dua";
  title?: string;
  body?: string;
  arabic?: string;
  list?: string[];
  /** verse: first key; pair: both keys */
  key?: string;
  /** verse range: the last verse number */
  to?: number;
  keys?: [string, string];
  /** hadith collection and number */
  c?: HadithCollection;
  num?: number;
  /** dua: Hisnul Muslim chapter and index */
  h?: number;
  i?: number;
};
export type CarouselSourceOut = { label: string; url?: string };
export type CarouselPayload = {
  id: string;
  series: string;
  seriesLabel: string;
  topic: CarouselTopic;
  tradition: FeedTradition;
  /** the language of the texts (the requested one, or English where a text is missing) */
  lang: FeedLocale;
  palette: PaletteId;
  cover: { kicker: string; title: string; sub?: string; arabic?: string };
  slides: CarouselSlide[];
  sources: CarouselSourceOut[];
  review: boolean;
};
export type WisdomPayload = {
  id: string;
  kind: WisdomKind;
  theme: string;
  themeLabel: string;
  tradition: FeedTradition;
  lang: FeedLocale;
  palette: PaletteId;
  key?: string;
  to?: number;
  c?: HadithCollection;
  num?: number;
  text?: string;
  arabic?: string;
  by?: string;
  work?: string;
  source: CarouselSourceOut;
  review: boolean;
};
