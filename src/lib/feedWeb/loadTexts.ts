import en from "./texts/en.json";
import { mergeTexts, type FeedTexts } from "./texts";

// Server side: the feed texts of a language over English (call in a page / layout and hand them to <FeedTextsProvider>)
export async function loadFeedTexts(locale: string): Promise<FeedTexts> {
  const l = /^[a-z]{2}$/.test(locale) ? locale : "en";
  if (l === "en") return en as FeedTexts;
  try {
    const mod = (await import(`./texts/${l}.json`)) as { default: Record<string, Record<string, string>> };
    return mergeTexts(mod.default);
  } catch {
    return en as FeedTexts;
  }
}
