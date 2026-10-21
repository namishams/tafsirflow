// Texts of the website feed, copied from the app (scripts/extract-app-texts.mjs → texts/<lang>.json): the same words in
// all 14 languages. Server side: loadFeedTexts(locale) (loadTexts.ts) in the page, passed to <FeedTextsProvider> (useTexts.tsx).
import en from "./texts/en.json";

export type FeedTexts = typeof en;
export const FEED_TEXTS_EN: FeedTexts = en;

type Dict = Record<string, Record<string, string>>;
/** the language's tables over English: a key that is missing in a language reads English */
export function mergeTexts(over: Partial<Dict> | null | undefined): FeedTexts {
  const out: Dict = {};
  for (const m of Object.keys(en) as (keyof FeedTexts)[]) out[m] = { ...(en[m] as Record<string, string>), ...((over?.[m as string] as Record<string, string> | undefined) ?? {}) };
  return out as unknown as FeedTexts;
}

/** "{n} likes" + { n: 3 } */
export const fill = (s: string, p: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(p[k] ?? ""));
