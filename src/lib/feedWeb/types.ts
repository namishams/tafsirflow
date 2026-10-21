// Contract between the website feed (src/components/feed/*), the resolver (src/lib/feedWeb/resolve.ts) and the API
// (/api/feed/web). Mirrors the app's feed posts (mobile/src/features/feed): every card is built on the server from a
// reference of the corpus (/api/feed/page?v=2) – Quran, hadith, tafsir, dua and article text always from its source,
// bundled course / quiz / maqasid text from the app's own content. Plain JSON, safe to send to the browser.

import type { ResolvedCarousel, ResolvedWisdom } from "@/lib/feed/carousels/resolve";

/** the kind of a card; the corpus kinds plus the day-by-day posts (verse of the day, date, surah, article) */
export type WebKind =
  | "verse" | "word" | "tafsir" | "hadith" | "dua" | "lemma" | "wiki" | "name" | "quiz" | "course" | "maqasid" | "mutashabihat"
  | "article" | "date" | "surah"
  /** carousels (slides) and wisdom posts: the editors' own words, src/lib/feed/carousels (rendered by components/carousel) */
  | "carousel" | "wisdom";

/** topic chips of Home / Explore (the app's TOPICS, features/feed/HomeFeed.tsx); "all" is the unfiltered stream */
export type WebTopic = "verses" | "tafsir" | "hadith" | "duas" | "prayer" | "holy" | "seerah" | "quran" | "names" | "scholars" | "history" | "art";
export const WEB_TOPICS: WebTopic[] = ["verses", "tafsir", "hadith", "duas", "prayer", "seerah", "quran", "holy", "names", "scholars", "history", "art"];

/** a verse with its text (Quran.com, translation of the page language) */
export type WebVerse = { key: string; s: number; v: number; arabic: string; translation: string; chapter: string; chapterArabic: string };

/** what the CTA button of a card says (texts: feedWeb texts `cta*`) and where it goes (`href`, path without locale) */
export type WebCta = "course" | "shams" | "exam" | "lesson" | "reader" | "names" | "read";

export type WebCard = {
  /** stable id (the corpus id, e.g. "c:verse:2:255"; day posts "d:…"); unique in a stream */
  id: string;
  kind: WebKind;
  topic: WebTopic;
  title: string;
  /** small line above the title (course name, surah, collection …) */
  eyebrow?: string;
  /** plain text (no HTML / Markdown) */
  body: string;
  /** Arabic that is not Quran text: a name of Allah, a dua, the original of a hadith, a lemma, a word */
  arabic?: string;
  bullets?: string[];
  /** a short note (course note, madhhab remark) */
  note?: string;
  /** the schools of law can differ on details: the card says so (T.know.madhhab) */
  madhhab?: boolean;
  /** marked for scholar review (new religious content, as in the app) */
  review?: boolean;
  /** the verse of the post (verse / word cards, and cards that point at a verse: quiz, course, maqasid, tadabbur, tajweed …) */
  verse?: WebVerse;
  /** word positions of `verse` to highlight (quiz / grammar) */
  words?: number[];
  /** word cards: the word of the verse */
  word?: { pos: number; ar: string; tr: string; tl: string };
  /** quiz cards: tap to answer (options already shuffled, `answer` = index of the correct one) */
  quiz?: { options: string[]; answer: number; explain: string; level: number };
  /** mutashabihat: the verse keys of the group (the verse texts are in `group`) */
  group?: WebVerse[];
  /** wiki cards: a free Commons image with its credit (always shown with it) */
  image?: { url: string; credit?: string; licenseUrl?: string };
  source: string;
  sourceUrl: string;
  license?: string;
  /** link to the licence text of `license` (wiki cards: CC BY-SA 4.0) */
  licenseUrl?: string;
  /** where "learn more" goes: a website path without the locale, e.g. "/courses/seerah/xyz" */
  href?: string;
  cta?: WebCta;
  /** language of the text (title/body) */
  lang: string;
  publishedAt?: string;
  /** date cards */
  hijri?: { d: number; y: number; monthName: string; event?: string; daysToEvent?: number };
  /** "Verse of the day" cards */
  votd?: boolean;
  /** surah cards: the surah number */
  surah?: number;
  /** carousel / wisdom cards: the payload in the page language with its scripture */
  carousel?: ResolvedCarousel;
  wisdom?: ResolvedWisdom;
};

export type WebFeedPage = { items: WebCard[]; nextCursor: string | null };
