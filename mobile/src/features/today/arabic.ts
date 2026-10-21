import { NAME_VERSES } from "@/web/names/verses";

// Arabic lines shown on the Today screen (website: TodayDashboard.tsx, SessionStart.tsx).
// The verse is never typed by hand (BLUEPRINT §4): Quran 13:28 from its seventh word ("alā bi-dhikri llāhi …") in the
// King Fahd Complex spelling the header is set in, taken from the Quran data snapshot synced from the website
// (web/names/verses.ts, generated from quran-json, about 46 KB, now bundled with the Today screen; the website quotes
// the same words through lib/verseQuotes.ts).
// Canonical mark order (NFC) gives exactly the letters the header was designed with.
export const TODAY_VERSE = { text: NAME_VERSES["13:28"].normalize("NFC").split(" ").slice(6).join(" "), cite: "13:28" };
// plain words, not quotations
export const TODAY_WORD = "اليوم";
export const SESSION_DONE_WORD = "ما شاء الله";
