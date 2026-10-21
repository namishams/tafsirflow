// mirrors mobile/src/features/courses/types.ts (copied for the website; keep both in step)
// Courses of the academy (app-side extension, see README in this folder's index.ts): pure data.
// Content is written in English, German and Arabic (other UI languages fall back to English for content; the
// interface strings are in all 14 languages, texts.ts). No Quran or hadith text is typed here: verses are referenced
// by key ("2:255") and loaded from the Quran API, hadith by collection and number ("bukhari:1").

/** a text in the content languages; `en` is the fallback */
export type L = { en: string; de: string; ar: string };

export type CQuestion = {
  q: L;
  /** answer options; options[answer] is correct */
  options: L[];
  answer: number;
  explain?: L;
};

/** a perspective or school tag for tradition-aware content (Aqidah, Fiqh) */
export type Tag = "consensus" | "majority" | "hanafi" | "maliki" | "shafii" | "hanbali" | "jafari" | "ashari" | "maturidi" | "athari" | "varies";

export type CLesson = {
  id: string;
  title: L;
  /** Markdown-light body: paragraphs, "## " headings, "- " bullets, **bold** */
  body: L;
  /** Quran verses that the lesson refers to (shown as verse cards, loaded from the API) */
  verses?: string[];
  /** hadith references, "bukhari:1", "muslim:2677", "tirmidhi:3507", "abudawud:…", "nasai:…", "ibnmajah:…", "ahmad:…", "malik:…" */
  hadith?: string[];
  tags?: Tag[];
  quiz: CQuestion[];
};

export type CourseId =
  | "seerah" | "prophets" | "ulum" | "hadith-sci" | "aqidah" | "fiqh-salah-sawm" | "akhlaq" | "adhkar" | "names" | "ramadan" | "hajj" | "tajweed-deep";

export type Course = {
  id: CourseId;
  title: L;
  lead: L;
  /** calligraphic word on the card (a heading, not Quran text) */
  word: string;
  /** how many lessons are free (from the start) */
  free: number;
  /** a short note shown at the top of the course (e.g. "rulings vary by madhhab") */
  note?: L;
  lessons: CLesson[];
};
