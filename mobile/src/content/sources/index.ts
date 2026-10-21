// Lazy feed content from public Islamic data APIs. Usage:
//   import { sourceFeedItems, SOURCE_KINDS } from "@/content/sources";
//   const items = await sourceFeedItems("hadith", "de", 0, { tradition: "sunni" });
// Every call is cached (AsyncStorage, bounded) and rate-limited per host; offline it serves cached data or [].
import { asmaItems, islamicDateItems } from "./calendar";
import { duaItems } from "./duas";
import { hadithItems, hadithOfDay, shiaItems } from "./hadith";
import { isoDay } from "./net";
import { rootItems, surahInfoItems, tafsirItems, wordOfDayItems } from "./quran";
import { SOURCE_KINDS, type FeedOptions, type SourceItem, type SourceKind, type Tradition } from "./types";

export { SOURCE_KINDS };
export type { FeedOptions, SourceItem, SourceKind, Tradition };
export type { TimeOfDay } from "./types";
export { currentSlot, timeOfDayFor } from "./duas";

/** Kinds that only make sense for one tradition – hide them when the user picked the other. */
export function kindsFor(tradition: Tradition): SourceKind[] {
  return SOURCE_KINDS.filter((k) => !(tradition === "sunni" && k === "shia-hadith"));
}

function allowed(item: SourceItem, t: Tradition): boolean {
  return t === "all" || item.tradition === "all" || item.tradition === t;
}

/**
 * Items of one kind for the feed. `page` starts at 0; pages are deterministic for the day (seeded by date), so
 * reloading shows the same cards and paging never repeats within a reasonable range. Never throws.
 */
export async function sourceFeedItems(kind: SourceKind, lang: string, page: number, opts: FeedOptions = {}): Promise<SourceItem[]> {
  const tradition = opts.tradition ?? "all";
  const size = Math.max(1, Math.min(10, opts.pageSize ?? 5));
  const now = opts.now ?? new Date();
  const day = isoDay(now);
  const dayIndex = Math.floor(now.getTime() / 86_400_000);
  const l = (lang || "en").slice(0, 2).toLowerCase();
  const p = Math.max(0, Math.floor(page));
  try {
    let items: SourceItem[];
    switch (kind) {
      case "tafsir": items = await tafsirItems(l, p, size, day); break;
      case "hadith": items = await hadithItems(l, p, size, day); break;
      case "shia-hadith": items = await shiaItems(l, p, size, day); break;
      case "hadith-of-day": items = p === 0 ? await hadithOfDay(l, day, tradition) : []; break;
      case "dua": items = await duaItems(l, p, size, day, now); break;
      case "word-root": items = await rootItems(l, p, size, day); break;
      case "word-of-day": items = await wordOfDayItems(l, p, p === 0 ? 1 : size, day); break;
      case "asma": items = await asmaItems(l, p, size, dayIndex); break;
      case "surah-info": items = await surahInfoItems(l, p, size, day); break;
      case "islamic-date": items = await islamicDateItems(l, p, now); break;
      default: items = [];
    }
    return items.filter((i) => allowed(i, tradition));
  } catch {
    return [];
  }
}
