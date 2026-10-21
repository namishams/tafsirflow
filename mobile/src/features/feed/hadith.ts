// Hook for the "Hadith" stream of the feed.
//
// TODO(hadith): another agent is adding mobile/src/features/hadith/data.ts with
//   hadithFeedItems(lang, tradition, cursor)
// When that file exists, replace the stub below with a re-export, e.g.
//   export { hadithFeedItems } from "@/features/hadith/data";
//   export const HADITH_AVAILABLE = true;
// and map its item type onto HadithFeedItem (vetted text and source only, never written here). Until then the
// "Hadith" stream chip stays hidden in FeedScreen (HADITH_AVAILABLE = false).

export type HadithFeedItem = { id: string; arabic?: string; text: string; source: string; narrator?: string; grade?: string };
export type HadithPage = { items: HadithFeedItem[]; cursor: string | null };

export const HADITH_AVAILABLE = false;

export function hadithFeedItems(_lang: string, _tradition: string, _cursor: string | null): HadithPage {
  return { items: [], cursor: null };
}
