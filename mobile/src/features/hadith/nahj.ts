import { readJSON, writeJSON } from "@/lib/store";
import { nahjContentVersion, nahjFile } from "./nahjContent";

// Nahj al-Balagha as an endless feed of short passages, a study course and a library entry. The passages come from the
// owner's two editions – the German translation by Nami Shams and the English "Peak of Eloquence" edition. They are
// never committed or bundled (the repo is public, the editions are licensed): the server serves them and the app keeps
// a copy on the device (nahjContent.ts). Only passages exist (sayings and at most three excerpts per sermon or letter),
// never the whole book. Until an edition has arrived every reader here sees an empty edition.
export type NahjEdition = "de" | "en";
export type NahjKind = "sermon" | "letter" | "saying";
type RawItem = { id: string; kind: NahjKind; n: number; part?: number; text: string; /** machine-translated, not yet reviewed */ machine?: boolean };
type RawBook = { title: string; credit: string; lang: NahjEdition; items: RawItem[] };
/** arabic: the Arabic original of the same passage (from nahj-ar.json), when it is here */
export type NahjPassage = RawItem & { edition: NahjEdition; ref: string; title: string; credit: string; link: string; arabic?: string };
type ArabicBook = { items: { id: string; text: string }[] };
let arabicIndex: { src: ArabicBook; map: Map<string, string> } | null = null;
function arabicOf(id: string): string | undefined {
  const src = nahjFile<ArabicBook>("ar");
  if (!src) return undefined;
  if (arabicIndex?.src !== src) arabicIndex = { src, map: new Map(src.items.map((x) => [x.id, x.text])) };
  return arabicIndex.map.get(id);
}

const EMPTY_BOOK = (ed: NahjEdition): RawBook => ({ title: NAHJ_TITLE[ed], credit: NAHJ_CREDIT[ed], lang: ed, items: [] });
function book(ed: NahjEdition): RawBook {
  return nahjFile<RawBook>(ed) ?? EMPTY_BOOK(ed);
}
/** true once the edition has arrived from the server (or the device cache) */
export const nahjReady = (ed: NahjEdition) => book(ed).items.length > 0;
// caches built from an edition are dropped when new content arrives
let seen = -1;
function fresh() { const v = nahjContentVersion(); if (v !== seen) { seen = v; orders.clear(); byId.clear(); } }

const REF: Record<NahjEdition, Record<NahjKind | "excerpt", string>> = {
  de: { sermon: "Predigt", letter: "Brief", saying: "Ausspruch", excerpt: "Auszug" },
  en: { sermon: "Sermon", letter: "Letter", saying: "Saying", excerpt: "excerpt" },
};
const LINK: Record<NahjEdition, string> = { de: "https://nahjulbalagha.de", en: "" };
export const NAHJ_TITLE: Record<NahjEdition, string> = { de: "Nahjul-Balagha – Gipfel der Beredsamkeit", en: "Peak of Eloquence – Nahjul-Balagha" };
/** the fallback credit (the edition's own "credit" field from the server is used when it is here) */
export const NAHJ_CREDIT: Record<NahjEdition, string> = { de: "Übersetzung: Nami Shams · nahjulbalagha.de", en: "Peak of Eloquence – Nahjul-Balagha" };
/** the note on a passage whose translation was made by machine and is not reviewed yet */
export const NAHJ_MACHINE: Record<NahjEdition, string> = { de: "Maschinell übersetzt, noch nicht geprüft", en: "Machine-translated, not yet reviewed" };
/** the compiler of the collection, named with every passage */
export const NAHJ_COMPILER: Record<NahjEdition, string> = { de: "Gesammelt von asch-Scharif ar-Radi", en: "Compiled by ash-Sharif ar-Radi" };
/** the full attribution under every passage and on every shared image: compiler and the edition's translator credit */
export const nahjCredit = (ed: NahjEdition) => `${NAHJ_COMPILER[ed]} · ${book(ed).credit || NAHJ_CREDIT[ed]}`;

/** "Predigt 3 · Auszug", "Saying 31", "Saying 31 · excerpt" */
export function nahjRef(ed: NahjEdition, it: Pick<RawItem, "kind" | "n" | "part">) {
  const r = REF[ed];
  const excerpt = it.kind !== "saying" || !!it.part;
  return `${r[it.kind]} ${it.n}${excerpt ? ` · ${r.excerpt}` : ""}`;
}

const passage = (ed: NahjEdition, it: RawItem): NahjPassage => ({ ...it, arabic: arabicOf(it.id), edition: ed, ref: nahjRef(ed, it), title: book(ed).title || NAHJ_TITLE[ed], credit: nahjCredit(ed), link: LINK[ed] });

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
  fresh();
  const key = `${ed}:${seed}`;
  let o = orders.get(key);
  if (!o) {
    const n = book(ed).items.length;
    o = Array.from({ length: n }, (_, i) => i);
    const r = rng(seed);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
    if (n) orders.set(key, o);
  }
  return o;
}
/** passage number k of the endless stream that starts with this seed (pass p uses seed + p) */
export function nahjAt(ed: NahjEdition, seed: number, k: number): NahjPassage | null {
  const items = book(ed).items;
  if (!items.length) return null;
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
export function randomNahjSaying(lang: string): NahjPassage | null {
  const ed = nahjEdition(lang);
  const sayings = book(ed).items.filter((x) => x.kind === "saying" && !x.part && x.text.split(" ").length <= 90);
  if (!sayings.length) return null;
  return passage(ed, sayings[Math.floor(Math.random() * sayings.length)]);
}

/** a page of the endless stream for a feed: cursor "seed:k" (null = start where the reader stopped) */
export function nahjFeed(lang: string, cursor: string | null, size = 8): { items: NahjPassage[]; cursor: string } {
  const ed = nahjEdition(lang);
  const [s, k] = cursor ? cursor.split(":").map(Number) : (() => { const p = nahjPosition(ed); return [p.seed, p.k]; })();
  const items = Array.from({ length: size }, (_, i) => nahjAt(ed, s, k + i)).filter((p): p is NahjPassage => !!p);
  return { items, cursor: `${s}:${k + size}` };
}

/** every passage of an edition (the course reads from these; the whole list is never shown as a table of contents) */
export const nahjAllPassages = (ed: NahjEdition): NahjPassage[] => book(ed).items.map((it) => passage(ed, it));
const byId = new Map<string, NahjPassage | null>();
/** one passage by its id ("k3.2", "h31"), or null when this edition does not carry it */
export function nahjPassageById(ed: NahjEdition, id: string): NahjPassage | null {
  fresh();
  const key = `${ed}:${id}`;
  if (!nahjReady(ed)) return null;
  if (!byId.has(key)) { const it = book(ed).items.find((x) => x.id === id); byId.set(key, it ? passage(ed, it) : null); }
  return byId.get(key) ?? null;
}
