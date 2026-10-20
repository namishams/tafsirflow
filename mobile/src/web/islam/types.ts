// Content model of the "Islam" section (/islam): one file per chapter, German + English (other languages fall back to English)
export type IslamChapter = {
  title: string;          // e.g. "Der Prophet Muhammad ﷺ"
  kicker: string;         // small label above the title
  lead: string;           // 2–4 sentence intro
  facts: { n: string; l: string }[]; // 3–4 short, verifiable key facts (n = number/word, l = label)
  body: string;           // long article in our Markdown subset (## / ### headings, - lists, 1. lists, **bold**, *italic*, [links](/path))
  faq: { q: string; a: string }[];   // 4–6 questions
  sources: string[];      // Quran references, hadith collections, books – plain text
};
export type IslamDoc = { slug: string; arabic: string; de: IslamChapter; en: IslamChapter };
