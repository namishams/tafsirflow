// The "Hadith" stream of the feed: vetted text and source only, from features/hadith/data.ts (Sunni collections via
// hadith-api, Shia books via Thaqalayn, Nahj al-Balagha only in Shia mode). Nothing is written here by hand.
export { hadithFeedItems, toFeedItem, type HadithFeedItem, type HadithFeedPage } from "@/features/hadith/data";
export const HADITH_AVAILABLE = true;
