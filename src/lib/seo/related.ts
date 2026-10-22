import type { HubId } from "./types";

// Arabic word drawn in the hero of each page
export const HUB_AR: Record<HubId, string> = {
  "learn-quran": "اقرأ", "quran-tafsir": "تفسير", "tajweed-online": "تجويد", "memorize-quran": "حفظ", "quran-radio": "تلاوة",
  "listen-quran": "استماع", tawbah: "توبة", "learn-salah": "صلاة", "learn-wudu": "وضوء", "learn-islam": "إسلام",
};
export const ARTICLE_AR: Record<string, string> = {
  "why/inner-peace": "سكينة", "why/guidance": "هدى", "why/character": "أخلاق", "why/family": "أسرة", "why/discipline": "مداومة", "why/barakah": "بركة",
  "new-beginning/fresh-start-with-the-quran": "بداية", "new-beginning/back-to-allah": "أوبة", "new-beginning/start-praying-again": "صلاة",
};

// long-form articles shown under each hub (internal links between the hubs and the articles)
export const HUB_ARTICLES: Record<HubId, string[]> = {
  "learn-quran": ["why/guidance", "why/discipline", "why/inner-peace"],
  "quran-tafsir": ["why/guidance", "why/character", "why/family"],
  "tajweed-online": ["why/discipline", "why/inner-peace"],
  "memorize-quran": ["why/discipline", "why/barakah", "why/inner-peace"],
  "quran-radio": ["why/inner-peace", "why/family"],
  "listen-quran": ["why/inner-peace", "why/family", "why/guidance"],
  tawbah: ["new-beginning/fresh-start-with-the-quran", "new-beginning/back-to-allah", "new-beginning/start-praying-again"],
  "learn-salah": ["new-beginning/start-praying-again", "why/discipline"],
  "learn-wudu": ["new-beginning/start-praying-again", "why/inner-peace"],
  "learn-islam": ["why/guidance", "why/character", "new-beginning/fresh-start-with-the-quran"],
};

// the hub an article belongs to (link back) and its siblings
export const articleHub = (key: string): HubId => (key.startsWith("new-beginning/") ? "tawbah" : key === "why/discipline" ? "memorize-quran" : "learn-quran");
