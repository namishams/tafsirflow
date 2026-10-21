import { STICKER, STICKERS, stickerDupes, type StickerDef } from "@/features/feed/gamify";
import { RARITY_GP, SERIES, SERIES_SIZE, countOf, duplicates, isGiven, itemAt, rarityOf, seriesOwned, type Rarity, type Series } from "./catalog";
import { giftOutlook, stickerGp, type Garden, type GiftOutlook } from "./garden";

// The gift flow's model (GiftFlow.tsx, website: src/components/learn/garden/GiftFlow.tsx): what the learner can give
// to the tree today, grouped (duplicates first, then the only copies by rarity), the picks in the best order and the
// preview of the growth. Read only; the gifts themselves go through giveSticker (garden.ts), whose rules stay as they
// are (daily cap, declining value of each further sticker).

/** the feed stickers form their own group in the filter */
export type GiftSeries = Series | "feed";
export type GiftItem = {
  id: string;
  /** a feed sticker (gamify) or one of the large collection (catalog) */
  feed: boolean;
  /** duplicates that can be given; 0 for an only copy */
  dupes: number;
  /** the only copy: given once (after a confirmation), it stays in the album marked as given */
  unique: boolean;
  rarity: Rarity;
  series: GiftSeries;
  /** growth before the daily decline */
  base: number;
};
export type Pick = { id: string; unique: boolean; base: number };

export const RARITY_ORDER: Rarity[] = ["legendary", "epic", "rare", "common"];
const RANK: Record<Rarity, number> = { legendary: 0, epic: 1, rare: 2, common: 3 };
/** the feed stickers' look mapped to the collection's rarities (only for the glow and the filter; growth is stickerGp) */
const feedRarity = (d: StickerDef): Rarity => (d.rare ? "epic" : d.tone === "gold" ? "rare" : "common");

/** everything that can be given now: duplicates first (most valuable first), then the only copies by rarity */
export function giftInventory(s: Garden, owned: Record<string, unknown>, limit = 800): { dupes: GiftItem[]; unique: GiftItem[] } {
  const dupes: GiftItem[] = [], unique: GiftItem[] = [];
  const fd = stickerDupes();
  for (const def of STICKERS) {
    const n = fd[def.id] ?? 0;
    if (n > 0) dupes.push({ id: def.id, feed: true, dupes: n, unique: false, rarity: feedRarity(def), series: "feed", base: stickerGp(def, false) });
    else if (owned[def.id] && !s.given.includes(def.id)) unique.push({ id: def.id, feed: true, dupes: 0, unique: true, rarity: feedRarity(def), series: "feed", base: stickerGp(def, true) });
  }
  for (const id of duplicates(limit)) {
    const n = countOf(id) - 1, r = rarityOf(id), it = seriesOf(id);
    if (n > 0 && it) dupes.push({ id, feed: false, dupes: n, unique: false, rarity: r, series: it, base: RARITY_GP[r] });
  }
  for (const se of SERIES) {
    if (unique.length >= limit || seriesOwned(se) === 0) continue;
    for (let i = 0; i < SERIES_SIZE[se] && unique.length < limit; i++) {
      const id = itemAt(se, i).id;
      if (countOf(id) === 1 && !isGiven(id)) { const r = rarityOf(id); unique.push({ id, feed: false, dupes: 0, unique: true, rarity: r, series: se, base: RARITY_GP[r] * 2 }); }
    }
  }
  const order = (a: GiftItem, b: GiftItem) => RANK[a.rarity] - RANK[b.rarity] || b.base - a.base;
  return { dupes: dupes.sort((a, b) => b.base - a.base || order(a, b) || b.dupes - a.dupes), unique: unique.sort(order) };
}
const PREFIX: Record<string, Series> = { a: "ayah", s: "surah", j: "juz", n: "names", p: "prophets", m: "months", l: "letters", r: "roots", t: "tajweed", h: "places", c: "scholars", e: "seasonal" };
const seriesOf = (id: string): Series | null => PREFIX[id.split(":")[0]] ?? null;

/** the picks in the order that gives the most growth (the most valuable sticker first, while it counts fully) */
export const ordered = (picks: Pick[]) => picks.map((p, i) => ({ p, i })).sort((a, b) => b.p.base - a.p.base || a.i - b.i).map((x) => x.p);
/** the preview of a selection (ordered as it will be given) */
export const previewOf = (s: Garden, picks: Pick[]): GiftOutlook => giftOutlook(s, ordered(picks).map((p) => p.base));
/** how often an item is picked */
export const pickedOf = (picks: Pick[], id: string) => picks.reduce((a, p) => a + (p.id === id ? 1 : 0), 0);

/** "Give all duplicates": every duplicate, most valuable first, as many as still count today; and how many wait */
export function allDuplicates(s: Garden, dupes: GiftItem[]): { picks: Pick[]; later: number } {
  const all: Pick[] = [];
  for (const it of dupes) for (let k = 0; k < it.dupes; k++) all.push({ id: it.id, unique: false, base: it.base });
  const room = giftOutlook(s, []).room;
  const first = ordered(all).slice(0, Math.max(0, room));
  const fits = giftOutlook(s, first.map((p) => p.base)).fits;
  return { picks: first.slice(0, fits), later: all.length - fits };
}

/** the feed sticker's definition (for its art), or null for a collection sticker */
export const feedDef = (id: string): StickerDef | null => STICKER.get(id) ?? null;

/** time until today's sticker room opens again (the next local midnight) */
export function untilReset(now = Date.now()): { h: number; m: number } {
  const d = new Date(now); const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
  const mins = Math.max(1, Math.ceil((next.getTime() - now) / 60000));
  return { h: Math.floor(mins / 60), m: mins % 60 };
}
