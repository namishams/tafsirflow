// Extra feed content beyond Quran and hadith: reciters, mosques, art, scholars, seerah, history, Arabic words.
// Every item carries source + license (+ image credit); show them with the item. See types.ts for the shape.
import { readTradition, type TraditionChoice } from "@/lib/tradition";
import { loadKind, PAGE_SIZE, wikiItems } from "./sources";
import { cached } from "./wiki";
import { EXTRA_KINDS, type ExtraItem, type ExtraKind } from "./types";

export { EXTRA_KINDS, PAGE_SIZE };
export type { ExtraItem, ExtraKind, Tradition } from "./types";

/**
 * One page (up to PAGE_SIZE items) of a kind in `lang` ("de", "en", … – other Wikipedia editions are used when they
 * have the article, otherwise English; item.lang tells which). Pages are endless: they wrap around the catalog, and
 * item ids stay stable, so de-duplicate by id. Items of the other tradition are left out: "sunni" hides
 * Shia-specific items, "shia" hides Sunni-specific ones, "both"/unset shows all. Never throws; [] when offline
 * with no cache.
 */
export async function extraFeedItems(kind: ExtraKind, lang: string, page = 0, tradition: TraditionChoice | null = safeTradition()): Promise<ExtraItem[]> {
  try {
    const items = await loadKind(kind, (lang || "en").toLowerCase().split(/[-_]/)[0], Math.max(0, Math.floor(page)));
    return items.filter((i) => i.tradition === "all" || !tradition || tradition === "both" || i.tradition === tradition);
  } catch {
    return [];
  }
}

function safeTradition(): TraditionChoice | null {
  try { return readTradition(); } catch { return null; }
}

export const isExtraKind = (k: string): k is ExtraKind => (EXTRA_KINDS as readonly string[]).includes(k);

/** Wikipedia items (with attribution and free Commons image) for given English titles, e.g. the encyclopedia items of a course unit */
export async function extraItemsFor(kind: ExtraKind, titles: string[], lang: string): Promise<ExtraItem[]> {
  try {
    return await cachedTitles(kind, titles, (lang || "en").toLowerCase().split(/[-_]/)[0]);
  } catch {
    return [];
  }
}

const cachedTitles = (kind: ExtraKind, titles: string[], lang: string) =>
  cached(`v1.titles.${kind}.${lang}.${titles.join("|")}`, () => wikiItems(kind, titles.map((title) => ({ title, tradition: "all" as const })), lang));
