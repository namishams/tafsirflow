// mirrors the topic part of mobile/src/features/feed/library.ts (LibTopic, LIB_TOPICS, topicOfKind) – the website has
// no feed scheduler; gamify.ts and the garden only need to place a feed kind in its topic. Remote topic groups of the
// app's feed config are not read here (they only regroup kinds the website never counts).
export type LibTopic = "tafsir" | "hadith" | "duas" | "prayer" | "holy" | "seerah" | "scholars" | "history" | "art" | "quran";
export const LIB_TOPICS: LibTopic[] = ["tafsir", "hadith", "duas", "prayer", "holy", "seerah", "quran", "scholars", "history", "art"];

const TOPIC_KINDS: Record<LibTopic, string[]> = {
  tafsir: ["tafsir", "surah-info", "word-root", "word-of-day", "kn-tadabbur", "kn-grammar"],
  hadith: ["hadith", "hadith-of-day", "shia-hadith", "kn-nahj"],
  duas: ["dua", "asma", "phrases", "akhlaq", "kn-names"],
  prayer: ["salah", "pillars", "pillars-hajj", "islamic-months"],
  holy: ["mosque", "holy-places", "saudi-heritage", "kn-haramain"],
  seerah: ["seerah", "prophets", "prophet-family", "battles", "kn-course"],
  quran: ["quran-facts", "angels-unseen", "arabic-word", "kn-exam", "kn-tajweed", "kn-maqam", "kn-arabic-word"],
  scholars: ["scholar-bio", "scholar-work", "scholar-timeline", "reciter-bio", "reciter-fact", "women", "kn-faculty", "kn-adab", "kn-next", "kn-moment"],
  history: ["kn-abrahamic", "history", "islamic-date", "islam-country", "spread", "golden-age", "traditions", "islamic-finance", "halal-culture"],
  art: ["art", "met-art", "calligraphy-style", "architecture-style"],
};

/** the topic of any kind; unknown kinds are placed by their name */
export function topicOfKind(kind: string): LibTopic {
  for (const t of LIB_TOPICS) if (TOPIC_KINDS[t].includes(kind)) return t;
  if (/callig|architect|art/.test(kind)) return "art";
  if (/mosque|holy|heritage|makkah|madinah/.test(kind)) return "holy";
  if (/salah|prayer|pillar|hajj|fast|zakat/.test(kind)) return "prayer";
  if (/seerah|prophet|battle|sahab|companion/.test(kind)) return "seerah";
  if (/scholar|reciter|women|imam/.test(kind)) return "scholars";
  if (/quran|surah|angel|unseen|arabic/.test(kind)) return "quran";
  if (/dua|dhikr|phrase|akhlaq/.test(kind)) return "duas";
  if (/hadith/.test(kind)) return "hadith";
  return "history";
}
