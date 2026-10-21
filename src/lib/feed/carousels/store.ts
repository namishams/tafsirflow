// Reads the carousel and wisdom files (data/, wisdom/, i18n/<lang>/) and turns them into the payload of one language.
// The files are read at runtime from the checkout (like the editorial posts in ../posts), cached and re-read when a
// file changed (checked at most once a minute). Broken files are skipped and logged; they never break the feed.
import { promises as fs } from "fs";
import path from "path";
import { FEED_LOCALES, type FeedLocale, type FeedTradition } from "../types";
import { carouselText } from "./uiText";
import {
  CAROUSEL_TOPICS, HADITH_COLLECTIONS, PALETTE_IDS,
  type CarouselPayload, type CarouselSlide, type CarouselSourceOut, type CarouselTopic, type CList, type CText, type HadithCollection,
  type PaletteId, type RawCarousel, type RawSeries, type RawSlide, type RawWisdom, type RawWisdomSet, type WisdomKind, type WisdomPayload,
} from "./types";

const BASE = path.join(process.cwd(), "src/lib/feed/carousels");
/** the order of the series in the gallery and its filter chips (series not listed follow in file order) */
const SERIES_ORDER = ["names-of-allah", "surah-lessons", "prophets", "duas-daily", "verses-for-the-heart", "duas-quran", "sunnahs", "prayer-guide", "nawawi-40",
  "seerah", "companions", "women-in-quran", "tajweed", "arabic-roots", "ramadan", "hajj-umrah", "islamic-months", "akhlaq", "etiquette", "dhikr", "quran-phrases",
  "mutashabihat", "qiraat", "ulum-al-quran", "aqidah-basics", "signs-of-the-hour", "mosques", "golden-age", "scholars", "adab-student", "ahl-al-bayt"];
/** "names-of-allah-2" and "surah-lessons-3" belong to "names-of-allah" and "surah-lessons" */
export const seriesKey = (series: string) => series.replace(/-\d$/, "");
const rank = (series: string) => { const i = SERIES_ORDER.indexOf(seriesKey(series)); return i < 0 ? SERIES_ORDER.length : i; };
type Flat = Record<string, Record<string, string | string[]>>;
export type CarouselEntry = { c: RawCarousel; series: RawSeries; file: string };
export type WisdomEntry = { w: RawWisdom; set: RawWisdomSet; file: string };
type Store = {
  carousels: Map<string, CarouselEntry>;
  wisdom: Map<string, WisdomEntry>;
  /** i18n[lang][id] = flat keys (see scripts/carousels-load.mjs) */
  i18n: Map<string, Map<string, Record<string, string | string[]>>>;
  themes: Record<string, Partial<Record<FeedLocale, string>> & { en: string }>;
  /** ids in a stable order (series files sorted, items as written) */
  order: string[];
  /** the gallery's order without a filter: the series in SERIES_ORDER taken in turns, so every page is varied */
  mixed: string[];
  wisdomOrder: string[];
  sig: string;
};
let store: Store | null = null;
let checkedAt = 0;
let loading: Promise<Store> | null = null;

async function jsonFiles(dir: string): Promise<string[]> {
  try { return (await fs.readdir(dir)).filter((f) => f.endsWith(".json")).sort(); } catch { return []; }
}
async function signature(): Promise<string> {
  const parts: string[] = [];
  const add = async (dir: string) => {
    for (const f of await jsonFiles(dir)) { try { const s = await fs.stat(path.join(dir, f)); parts.push(`${dir}/${f}:${s.mtimeMs}:${s.size}`); } catch { /* gone */ } }
  };
  await add(path.join(BASE, "data"));
  await add(path.join(BASE, "wisdom"));
  for (const l of FEED_LOCALES) await add(path.join(BASE, "i18n", l));
  return parts.join("|");
}
async function readJson<T>(file: string): Promise<T | null> {
  try { return JSON.parse(await fs.readFile(file, "utf8")) as T; } catch (e) { console.warn("carousels: unreadable", path.relative(BASE, file), (e as Error).message); return null; }
}

async function build(sig: string): Promise<Store> {
  const carousels = new Map<string, CarouselEntry>(), wisdom = new Map<string, WisdomEntry>();
  const order: string[] = [], wisdomOrder: string[] = [];
  // a series and its continuations in order ("names-of-allah.json" before "names-of-allah-2.json")
  const part = (f: string) => { const m = /-(\d)\.json$/.exec(f); return m ? Number(m[1]) : 1; };
  const files = (await jsonFiles(path.join(BASE, "data"))).sort((x, y) => seriesKey(x.replace(/\.json$/, "")).localeCompare(seriesKey(y.replace(/\.json$/, ""))) || part(x) - part(y));
  for (const f of files) {
    const s = await readJson<RawSeries>(path.join(BASE, "data", f));
    if (!s || !Array.isArray(s.items) || !s.label?.en) continue;
    for (const c of s.items) {
      if (!c?.id || carousels.has(c.id) || !c.cover?.title?.en || !Array.isArray(c.slides) || c.slides.length < 1) continue;
      carousels.set(c.id, { c, series: s, file: f });
      order.push(c.id);
    }
  }
  for (const f of await jsonFiles(path.join(BASE, "wisdom"))) {
    if (f === "themes.json") continue;
    const s = await readJson<RawWisdomSet>(path.join(BASE, "wisdom", f));
    if (!s || !Array.isArray(s.items)) continue;
    for (const w of s.items) {
      if (!w?.id || wisdom.has(w.id)) continue;
      wisdom.set(w.id, { w, set: s, file: f });
      wisdomOrder.push(w.id);
    }
  }
  const i18n: Store["i18n"] = new Map();
  for (const l of FEED_LOCALES) {
    const m = new Map<string, Record<string, string | string[]>>();
    for (const f of await jsonFiles(path.join(BASE, "i18n", l))) {
      const d = await readJson<Flat>(path.join(BASE, "i18n", l, f));
      if (d && typeof d === "object") for (const [id, v] of Object.entries(d)) if (v && typeof v === "object") m.set(f === "labels.json" ? `label:${id}` : id, f === "labels.json" ? { t: v as unknown as string } : v);
    }
    if (m.size) i18n.set(l, m);
  }
  const themes = (await readJson<Store["themes"]>(path.join(BASE, "wisdom", "themes.json"))) ?? {};
  // series in their order (continued files after their first part), then the mixed gallery order
  const groups = new Map<string, string[]>();
  for (const id of order) { const k = seriesKey(carousels.get(id)!.series.series); groups.set(k, [...(groups.get(k) ?? []), id]); }
  const keys = [...groups.keys()].sort((a, b) => rank(a) - rank(b));
  const sorted = keys.flatMap((k) => groups.get(k)!);
  const mixed: string[] = [];
  for (let i = 0, left = true; left; i++) { left = false; for (const k of keys) { const g = groups.get(k)!; if (i < g.length) { mixed.push(g[i]); left = true; } } }
  return { carousels, wisdom, i18n, themes, order: sorted, mixed, wisdomOrder, sig };
}

/** the files, re-read when one changed (checked at most once a minute) */
export async function carouselStore(): Promise<Store> {
  if (store && Date.now() - checkedAt < 60_000) return store;
  loading ??= (async () => {
    try {
      const sig = await signature();
      checkedAt = Date.now();
      if (!store || store.sig !== sig) store = await build(sig);
      return store;
    } finally { loading = null; }
  })();
  return loading;
}

// ---------------------------------------------------------------- one language ---------------------------------------
const isLocale = (l: string): l is FeedLocale => (FEED_LOCALES as readonly string[]).includes(l);
const hash = (s: string) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
export const paletteOf = (seed: string): PaletteId => PALETTE_IDS[hash(seed) % PALETTE_IDS.length];

function textIn(st: Store, locale: FeedLocale, id: string, key: string, v: CText | undefined): string | undefined {
  if (!v) return undefined;
  const own = v[locale];
  if (own) return own;
  const t = st.i18n.get(locale)?.get(id)?.[key];
  return typeof t === "string" && t ? t : v.en;
}
function listIn(st: Store, locale: FeedLocale, id: string, key: string, v: CList | undefined): string[] | undefined {
  if (!v) return undefined;
  const own = v[locale];
  if (own?.length === v.en.length) return own;
  const t = st.i18n.get(locale)?.get(id)?.[key];
  return Array.isArray(t) && t.length === v.en.length ? t : v.en;
}
/** the language the texts are in: the locale when the cover title exists in it, else English */
const langOf = (st: Store, locale: FeedLocale, id: string, title: CText) => (title[locale] || st.i18n.get(locale)?.get(id)?.["c.t"] || st.i18n.get(locale)?.get(id)?.t ? locale : "en");

const VERSE = /^(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/;
const HADITH = /^(bukhari|muslim|nawawi):(\d{1,4})$/;
const DUA = /^hisn:(\d{1,3}):(\d{1,2})$/;
const COLLECTION_NAME: Record<HadithCollection, string> = { bukhari: "Sahih al-Bukhari", muslim: "Sahih Muslim", nawawi: "an-Nawawi, al-Arba'un" };
export const hadithUrl = (c: HadithCollection, n: number) =>
  c === "bukhari" ? `https://sunnah.com/bukhari:${n}` : c === "nawawi" ? `https://sunnah.com/nawawi40:${n}` : `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-muslim/${n}.json`;
const verseLabel = (key: string, to?: number, locale = "en") => `${carouselText(locale).quran} ${key}${to && to !== Number(key.split(":")[1]) ? `–${to}` : ""}`;
const verseUrl = (key: string) => `https://quran.com/${key.replace(":", "/")}`;

function slideOf(st: Store, locale: FeedLocale, id: string, s: RawSlide, i: number): CarouselSlide | null {
  const base = {
    n: i + 1,
    title: textIn(st, locale, id, `${i}.t`, s.title),
    body: textIn(st, locale, id, `${i}.b`, s.body),
    ...(s.arabic ? { arabic: s.arabic } : {}),
  };
  if (s.verse) {
    const m = VERSE.exec(s.verse);
    if (!m) return null;
    const key = `${Number(m[1])}:${Number(m[2])}`;
    return { ...base, t: "verse", key, ...(m[3] ? { to: Number(m[3]) } : {}) };
  }
  if (s.pair) {
    if (!Array.isArray(s.pair) || s.pair.length !== 2 || !s.pair.every((k) => /^\d{1,3}:\d{1,3}$/.test(k))) return null;
    return { ...base, t: "pair", keys: [s.pair[0], s.pair[1]] };
  }
  if (s.hadith) {
    const m = HADITH.exec(s.hadith);
    if (!m || !(HADITH_COLLECTIONS as readonly string[]).includes(m[1])) return null;
    return { ...base, t: "hadith", c: m[1] as HadithCollection, num: Number(m[2]) };
  }
  if (s.dua) {
    const m = DUA.exec(s.dua);
    if (!m) return null;
    return { ...base, t: "dua", h: Number(m[1]), i: Number(m[2]) };
  }
  const list = listIn(st, locale, id, `${i}.l`, s.list);
  return { ...base, t: "text", ...(list ? { list } : {}) };
}

/** the sources of a carousel: every reference of its slides (in order, once) and the editors' further sources */
function sourcesOf(st: Store, locale: FeedLocale, c: RawCarousel, slides: CarouselSlide[]): CarouselSourceOut[] {
  const out: CarouselSourceOut[] = [];
  const seen = new Set<string>();
  const add = (label: string, url?: string) => { if (!seen.has(label)) { seen.add(label); out.push(url ? { label, url } : { label }); } };
  for (const s of slides) {
    if (s.t === "verse" && s.key) add(verseLabel(s.key, s.to, locale), verseUrl(s.key));
    if (s.t === "pair" && s.keys) for (const k of s.keys) add(verseLabel(k, undefined, locale), verseUrl(k));
    if (s.t === "hadith" && s.c && s.num) add(`${COLLECTION_NAME[s.c]} ${s.num}`, hadithUrl(s.c, s.num));
    if (s.t === "dua" && s.h !== undefined) add(`Hisnul Muslim (Sa'id al-Qahtani) · ${s.h}`, "https://www.hisnmuslim.com");
  }
  for (const src of c.sources ?? []) {
    const label = typeof src.label === "string" ? src.label : textIn(st, locale, c.id, "", src.label) ?? "";
    if (label) add(label, src.url);
  }
  return out;
}

const RTL_SCRIPT = new Set(["ar", "ur", "fa", "ps"]);
const tradOf = (v: unknown, d: FeedTradition = "all"): FeedTradition => (v === "sunni" || v === "shia" || v === "all" ? v : d);

export function carouselPayload(st: Store, e: CarouselEntry, locale: string): CarouselPayload {
  const loc = isLocale(locale) ? locale : "en";
  const { c, series } = e;
  const slides = c.slides.map((s, i) => slideOf(st, loc, c.id, s, i)).filter((x): x is CarouselSlide => !!x);
  const seriesLabel = series.label[loc] || (st.i18n.get(loc)?.get(`label:${series.series}`)?.t as string | undefined) || series.label.en;
  // in Arabic script the middle dot reads like the Arabic zero ("· ١" looks like "١٠"): a dash separates instead
  const sep = (x: string) => (RTL_SCRIPT.has(loc) ? x.replace(/\s·\s/g, " – ") : x);
  const kicker = sep(textIn(st, loc, c.id, "c.k", c.cover.kicker) ?? seriesLabel);
  return {
    id: c.id,
    series: series.series,
    seriesLabel,
    topic: (CAROUSEL_TOPICS as string[]).includes(c.topic ?? "") ? (c.topic as CarouselTopic) : series.topic,
    tradition: tradOf(c.tradition, tradOf(series.tradition)),
    lang: langOf(st, loc, c.id, c.cover.title),
    palette: c.palette && (PALETTE_IDS as string[]).includes(c.palette) ? c.palette : paletteOf(c.id),
    cover: { kicker, title: textIn(st, loc, c.id, "c.t", c.cover.title) ?? c.cover.title.en, sub: textIn(st, loc, c.id, "c.s", c.cover.sub), ...(c.cover.arabic ? { arabic: c.cover.arabic } : {}) },
    slides,
    sources: sourcesOf(st, loc, c, slides),
    review: c.needs_review !== false,
  };
}

const WISDOM_SOURCE: Record<WisdomKind, string> = { verse: "Quran.com", hadith: "hadith-api", saying: "", reflection: "Quran Masterclass" };
export function wisdomPayload(st: Store, e: WisdomEntry, locale: string): WisdomPayload | null {
  const loc = isLocale(locale) ? locale : "en";
  const { w, set } = e;
  const theme = w.theme ?? set.theme ?? "reflection";
  const themeLabel = st.themes[theme]?.[loc] ?? st.themes[theme]?.en ?? theme;
  const base = {
    id: w.id, kind: set.kind, theme, themeLabel, tradition: tradOf(w.tradition, tradOf(set.tradition, set.kind === "hadith" ? "sunni" : "all")),
    lang: loc, palette: paletteOf(`w:${w.id}`), review: w.needs_review ?? set.kind !== "verse",
  };
  if (set.kind === "verse") {
    const m = VERSE.exec(w.verse ?? "");
    if (!m) return null;
    const key = `${Number(m[1])}:${Number(m[2])}`;
    return { ...base, key, ...(m[3] ? { to: Number(m[3]) } : {}), source: { label: verseLabel(key, m[3] ? Number(m[3]) : undefined, loc), url: verseUrl(key) } };
  }
  if (set.kind === "hadith") {
    const m = HADITH.exec(w.hadith ?? "");
    if (!m) return null;
    const c = m[1] as HadithCollection, num = Number(m[2]);
    return { ...base, c, num, source: { label: `${COLLECTION_NAME[c]} ${num}`, url: hadithUrl(c, num) } };
  }
  if (!w.text?.en) return null;
  // in Arabic the original wording of a saying is the text itself (never shown twice)
  const original = loc === "ar" && w.arabic ? w.arabic : null;
  const text = original ?? textIn(st, loc, w.id, "t", w.text)!;
  const by = textIn(st, loc, w.id, "b", w.by);
  const work = textIn(st, loc, w.id, "w", w.work);
  return {
    ...base, lang: original ? "ar" : langOf(st, loc, w.id, w.text), text, ...(w.arabic && !original ? { arabic: w.arabic } : {}), ...(by ? { by } : {}), ...(work ? { work } : {}),
    source: { label: set.kind === "saying" ? [by, work].filter(Boolean).join(", ") : WISDOM_SOURCE[set.kind] || "Quran Masterclass" },
  };
}

/** one carousel by id in a language, or null */
export async function carouselById(id: string, locale: string): Promise<CarouselPayload | null> {
  const st = await carouselStore();
  const e = st.carousels.get(id);
  return e ? carouselPayload(st, e, locale) : null;
}
export async function wisdomById(id: string, locale: string): Promise<WisdomPayload | null> {
  const st = await carouselStore();
  const e = st.wisdom.get(id);
  return e ? wisdomPayload(st, e, locale) : null;
}

export const traditionFits = (t: FeedTradition, want: FeedTradition) => want === "all" || t === "all" || t === want;

/** the series with their labels and counts (gallery filters), in file order */
export async function seriesList(locale: string, tradition: FeedTradition = "all") {
  const st = await carouselStore();
  const loc = isLocale(locale) ? locale : "en";
  const out = new Map<string, { id: string; label: string; topic: CarouselTopic; count: number }>();
  for (const id of st.order) {
    const e = st.carousels.get(id)!;
    if (!traditionFits(tradOf(e.c.tradition, tradOf(e.series.tradition)), tradition)) continue;
    const s = e.series;
    // series that continue each other ("names-of-allah", "names-of-allah-2") are shown as one
    const key = seriesKey(s.series);
    const cur = out.get(key);
    if (cur) cur.count++;
    else out.set(key, { id: key, label: s.label[loc] || (st.i18n.get(loc)?.get(`label:${s.series}`)?.t as string | undefined) || s.label.en, topic: s.topic, count: 1 });
  }
  return [...out.values()];
}

/** a page of carousels (gallery / API): newest series order, optional series or topic filter */
export async function carouselList(opts: { locale: string; tradition?: FeedTradition; series?: string; topic?: string; offset?: number; limit?: number }) {
  const st = await carouselStore();
  const want = opts.tradition ?? "all";
  const ids = (opts.series || opts.topic ? st.order : st.mixed).filter((id) => {
    const e = st.carousels.get(id)!;
    if (opts.series && seriesKey(e.series.series) !== opts.series) return false;
    if (opts.topic && (e.c.topic ?? e.series.topic) !== opts.topic) return false;
    return traditionFits(tradOf(e.c.tradition, tradOf(e.series.tradition)), want);
  });
  const offset = Math.max(0, opts.offset ?? 0), limit = Math.max(1, Math.min(1000, opts.limit ?? 24));
  return { total: ids.length, items: ids.slice(offset, offset + limit).map((id) => carouselPayload(st, st.carousels.get(id)!, opts.locale)) };
}

/** all carousel ids (sitemap) */
export async function carouselIds(): Promise<string[]> {
  return [...(await carouselStore()).order];
}
