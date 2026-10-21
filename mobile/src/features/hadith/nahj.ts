import { readJSON, writeJSON } from "@/lib/store";

// Nahj al-Balagha as an endless feed of short passages (Shia mode only). The passages come from the owner's two
// editions – the German translation by Nami Shams and the English "Peak of Eloquence" edition – extracted once into
// assets/content/nahj-de.json / nahj-en.json. Those files are bundled with the app but never committed (the repo is
// public, the editions are not): see .gitignore. Only passages are bundled (sayings and at most three excerpts per
// sermon or letter), never the whole book. The JSON is required lazily, the first time the feed needs it.
export type NahjEdition = "de" | "en";
export type NahjKind = "sermon" | "letter" | "saying";
type RawItem = { id: string; kind: NahjKind; n: number; part?: number; text: string };
type RawBook = { title: string; credit: string; lang: NahjEdition; items: RawItem[] };
export type NahjPassage = RawItem & { edition: NahjEdition; ref: string; title: string; credit: string; link: string };

const books: Partial<Record<NahjEdition, RawBook>> = {};
function book(ed: NahjEdition): RawBook {
  /* eslint-disable @typescript-eslint/no-require-imports */
  books[ed] ??= (ed === "de" ? require("../../../assets/content/nahj-de.json") : require("../../../assets/content/nahj-en.json")) as RawBook;
  /* eslint-enable @typescript-eslint/no-require-imports */
  return books[ed]!;
}

const REF: Record<NahjEdition, Record<NahjKind | "excerpt", string>> = {
  de: { sermon: "Predigt", letter: "Brief", saying: "Ausspruch", excerpt: "Auszug" },
  en: { sermon: "Sermon", letter: "Letter", saying: "Saying", excerpt: "excerpt" },
};
const LINK: Record<NahjEdition, string> = { de: "https://nahjulbalagha.de", en: "" };
export const NAHJ_TITLE: Record<NahjEdition, string> = { de: "Nahjul-Balagha – Gipfel der Beredsamkeit", en: "Peak of Eloquence – Nahjul-Balagha" };
/** the small credit under every passage and on every shared image */
export const NAHJ_CREDIT: Record<NahjEdition, string> = { de: "Übersetzung: Nami Shams · nahjulbalagha.de", en: "Peak of Eloquence – Nahjul-Balagha" };

/** "Predigt 3 · Auszug", "Saying 31", "Saying 31 · excerpt" */
export function nahjRef(ed: NahjEdition, it: Pick<RawItem, "kind" | "n" | "part">) {
  const r = REF[ed];
  const excerpt = it.kind !== "saying" || !!it.part;
  return `${r[it.kind]} ${it.n}${excerpt ? ` · ${r.excerpt}` : ""}`;
}

const passage = (ed: NahjEdition, it: RawItem): NahjPassage => ({ ...it, edition: ed, ref: nahjRef(ed, it), title: NAHJ_TITLE[ed], credit: NAHJ_CREDIT[ed], link: LINK[ed] });

/** the edition for an app language: German for German, the English edition for every other language,
 *  unless the reader switched it (Deutsch / English) */
export const NAHJ_EDITION_KEY = "qmc.nahjEdition";
export function nahjEdition(lang: string): NahjEdition {
  const chosen = readJSON<NahjEdition | null>(NAHJ_EDITION_KEY, null);
  return chosen === "de" || chosen === "en" ? chosen : lang === "de" ? "de" : "en";
}
export const setNahjEdition = (ed: NahjEdition) => writeJSON(NAHJ_EDITION_KEY, ed, true);

// --- the endless order: a shuffled pass through every passage, then a new shuffle, and so on -------------------
function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const orders = new Map<string, number[]>();
function orderOf(ed: NahjEdition, seed: number): number[] {
  const key = `${ed}:${seed}`;
  let o = orders.get(key);
  if (!o) {
    const n = book(ed).items.length;
    o = Array.from({ length: n }, (_, i) => i);
    const r = rng(seed);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
    orders.set(key, o);
  }
  return o;
}
/** passage number k of the endless stream that starts with this seed (pass p uses seed + p) */
export function nahjAt(ed: NahjEdition, seed: number, k: number): NahjPassage {
  const items = book(ed).items;
  const pass = Math.floor(k / items.length);
  return passage(ed, items[orderOf(ed, seed + pass)[k % items.length]]);
}
export const nahjCount = (ed: NahjEdition) => book(ed).items.length;

/** where the reader stopped, per edition (local only) */
export const NAHJ_POS_KEY = "qmc.nahjPos";
export type NahjPos = { seed: number; k: number };
export function nahjPosition(ed: NahjEdition): NahjPos {
  const all = readJSON<Partial<Record<NahjEdition, NahjPos>>>(NAHJ_POS_KEY, {});
  const p = all[ed];
  if (p && Number.isFinite(p.seed) && Number.isFinite(p.k)) return p;
  const fresh = { seed: Math.floor(Math.random() * 1e9), k: 0 };
  // stored after the current render (this is read while rendering; a write now would re-render other screens mid-render)
  setTimeout(() => { if (!readJSON<Partial<Record<NahjEdition, NahjPos>>>(NAHJ_POS_KEY, {})[ed]) saveNahjPosition(ed, fresh); }, 0);
  return fresh;
}
export function saveNahjPosition(ed: NahjEdition, pos: NahjPos) {
  writeJSON(NAHJ_POS_KEY, { ...readJSON<Partial<Record<NahjEdition, NahjPos>>>(NAHJ_POS_KEY, {}), [ed]: pos }, true);
}

/** a random saying (short card) for the feed or a widget */
export function randomNahjSaying(lang: string): NahjPassage {
  const ed = nahjEdition(lang);
  const sayings = book(ed).items.filter((x) => x.kind === "saying" && !x.part && x.text.split(" ").length <= 90);
  return passage(ed, sayings[Math.floor(Math.random() * sayings.length)]);
}

/** a page of the endless stream for a feed: cursor "seed:k" (null = start where the reader stopped) */
export function nahjFeed(lang: string, cursor: string | null, size = 8): { items: NahjPassage[]; cursor: string } {
  const ed = nahjEdition(lang);
  const [s, k] = cursor ? cursor.split(":").map(Number) : (() => { const p = nahjPosition(ed); return [p.seed, p.k]; })();
  const items = Array.from({ length: size }, (_, i) => nahjAt(ed, s, k + i));
  return { items, cursor: `${s}:${k + size}` };
}

/** every bundled passage of an edition (the course reads from these; the whole list is never shown as a table of contents) */
export const nahjAllPassages = (ed: NahjEdition): NahjPassage[] => book(ed).items.map((it) => passage(ed, it));
const byId = new Map<string, NahjPassage | null>();
/** one passage by its id ("k3.2", "h31"), or null when this edition does not carry it */
export function nahjPassageById(ed: NahjEdition, id: string): NahjPassage | null {
  const key = `${ed}:${id}`;
  if (!byId.has(key)) { const it = book(ed).items.find((x) => x.id === id); byId.set(key, it ? passage(ed, it) : null); }
  return byId.get(key) ?? null;
}
