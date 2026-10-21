// The server corpus behind /api/feed/page: 100,000+ posts in feed_items (scripts/feed-corpus.mjs), references only.
// Every install walks its own shuffled order: each stream ("verse", "hadith:bukhari", "tafsir:en", …) is permuted with a
// keyed Feistel permutation over its dense kseq, so a page is a handful of index lookups (no ORDER BY random()). The
// cursor carries the seed, the offset per stream and the last kinds (variety across pages). A stream that is walked to
// its end starts again in a new order (epoch), so the feed never runs out.
import { pool } from "@/lib/db";
import raw from "./config.json";
import { editorialItems, traditionOk } from "./posts";
import { generatedForDay, dayKey } from "./generated";
import type { FeedCorpusKind, FeedItem, FeedLocale, FeedPageResponse, FeedRef, FeedTradition } from "./types";

export const CORPUS_KINDS: FeedCorpusKind[] = ["verse", "word", "tafsir", "hadith", "shia-hadith", "name", "quiz", "course", "wiki", "lemma", "mutashabihat", "maqasid", "dua"];
const DEFAULT_WEIGHT: Record<FeedCorpusKind, number> = {
  verse: 1.2, word: 0.9, tafsir: 1.2, hadith: 1.4, "shia-hadith": 1.4, name: 0.6, quiz: 1, course: 0.8, wiki: 1, lemma: 0.6, mutashabihat: 0.4, maqasid: 0.8, dua: 1,
};
/** what app builds without v=2 can render: verse keys and hadith of al-Bukhari, Muslim, an-Nawawi and Thaqalayn */
const LEGACY_STREAMS = new Set(["verse", "hadith:bukhari", "hadith:muslim", "hadith:nawawi", "shia-hadith"]);
const MAX_STREAMS_IN_CURSOR = 64;

export type CorpusParams = { locale: FeedLocale; tradition: FeedTradition; v2: boolean; seed: string | null; limit: number };
export type CorpusCursor = { s: number; o: Record<string, number>; r: string[]; n: number };
type Stream = { stream: string; kind: FeedCorpusKind; n: number; dom: number; trad: string; langs: string[] | null };
type Row = { id: string; kind: FeedCorpusKind; stream: string; kseq: number; ref: FeedRef; tradition: FeedTradition; topic: string; weight: number; lang_tags: string[]; created_at: Date };

// ---------- hashing and the permutation ----------
function fmix(h: number) {
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return h >>> 0;
}
export function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return fmix(h >>> 0);
}
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** a keyed bijection of [0, n): balanced Feistel network on the next even bit width, cycle-walking back into range */
export function permute(i: number, n: number, key: number): number {
  if (n <= 1) return 0;
  let bits = 2;
  while (2 ** bits < n) bits++;
  if (bits % 2) bits++;
  const half = bits / 2, mask = 2 ** half - 1;
  let x = i;
  do {
    let l = Math.floor(x / 2 ** half), r = x & mask;
    for (let round = 0; round < 4; round++) {
      const f = fmix((r ^ Math.imul(key + round * 0x9e3779b9, 0x27d4eb2d)) >>> 0) & mask;
      const nl = r; r = (l ^ f) & mask; l = nl;
    }
    x = l * 2 ** half + r;
  } while (x >= n);
  return x;
}

// ---------- the cursor ----------
export const isCorpusCursor = (c: string | null) => !!c && c.startsWith("c2.");
export const encodeCorpusCursor = (c: CorpusCursor) => `c2.${Buffer.from(JSON.stringify(c)).toString("base64url")}`;
export function decodeCorpusCursor(c: string): CorpusCursor | null {
  if (!c.startsWith("c2.") || c.length > 4096) return null;
  try {
    const v = JSON.parse(Buffer.from(c.slice(3), "base64url").toString()) as Partial<CorpusCursor>;
    if (!Number.isInteger(v.s) || (v.s as number) < 0 || (v.s as number) > 0xffffffff) return null;
    if (!Number.isInteger(v.n) || (v.n as number) < 0 || (v.n as number) > 1e9) return null;
    const o: Record<string, number> = {};
    const entries = Object.entries(v.o && typeof v.o === "object" ? v.o : {});
    if (entries.length > MAX_STREAMS_IN_CURSOR) return null;
    for (const [k, x] of entries) {
      if (!/^[a-z0-9:_-]{1,48}$/i.test(k) || !Number.isInteger(x) || x < 0 || x > 1e9) return null;
      o[k] = x;
    }
    const r = Array.isArray(v.r) ? v.r.filter((x): x is string => typeof x === "string" && x.length <= 24).slice(-6) : [];
    return { s: v.s as number, n: v.n as number, o, r };
  } catch {
    return null;
  }
}

// ---------- stream statistics (cached per process) ----------
let cache: { at: number; list: Stream[] | null } | null = null;
async function streams(): Promise<Stream[] | null> {
  const p = pool();
  if (!p) return null;
  if (cache && Date.now() - cache.at < (cache.list ? 600_000 : 60_000)) return cache.list;
  try {
    const r = await p.query<{ stream: string; kind: string; n: number; dom: number; trad: string; langs: string | null }>(
      `SELECT stream, min(kind) AS kind, count(*)::int AS n, (max(kseq) + 1)::int AS dom,
              CASE WHEN min(tradition) = max(tradition) THEN min(tradition) ELSE 'mixed' END AS trad,
              CASE WHEN min(array_to_string(lang_tags, ',')) = max(array_to_string(lang_tags, ',')) THEN min(array_to_string(lang_tags, ',')) END AS langs
         FROM feed_items WHERE stream IS NOT NULL AND kseq IS NOT NULL GROUP BY stream`,
    );
    const list = r.rows
      .filter((x) => (CORPUS_KINDS as string[]).includes(x.kind) && x.n > 0 && x.dom > 0)
      .map((x) => ({ stream: x.stream, kind: x.kind as FeedCorpusKind, n: x.n, dom: x.dom, trad: x.trad, langs: x.langs === null ? null : x.langs.split(",") }));
    cache = { at: Date.now(), list: list.length ? list : null };
  } catch (e) {
    console.error("feed corpus: streams", e);
    cache = { at: Date.now(), list: null };
  }
  return cache.list;
}

function kindWeight(kind: FeedCorpusKind): number {
  const w = (raw as { corpus?: { kindWeights?: Record<string, number> } }).corpus?.kindWeights?.[kind];
  return typeof w === "number" && w >= 0 ? w : DEFAULT_WEIGHT[kind];
}
const langOk = (tags: string[] | null, locale: string) => !tags || tags.includes("*") || tags.includes(locale);
function streamOk(s: Stream, p: CorpusParams) {
  if (!p.v2 && !LEGACY_STREAMS.has(s.stream)) return false;
  if (s.trad !== "mixed" && !traditionOk(s.trad as FeedTradition, p.tradition)) return false;
  return langOk(s.langs, p.locale);
}

// ---------- labels of the items (the clients show the text from the sources; these are fallbacks) ----------
const LABEL: Record<FeedCorpusKind, [en: string, de: string]> = {
  verse: ["Quran", "Koran"], word: ["A word from the verse", "Ein Wort aus dem Vers"], tafsir: ["Tafsir", "Tafsir"], hadith: ["Hadith", "Hadith"],
  "shia-hadith": ["Hadith", "Hadith"], name: ["The Beautiful Names", "Die schönsten Namen"], quiz: ["Question", "Frage"], course: ["Lesson", "Lektion"],
  wiki: ["Knowledge", "Wissen"], lemma: ["A word in the Quran", "Ein Wort im Koran"], mutashabihat: ["Similar verses", "Ähnliche Verse"],
  maqasid: ["Tadabbur", "Tadabbur"], dua: ["Dua", "Bittgebet"],
};
const COLLECTION: Record<string, string> = {
  bukhari: "Sahih al-Bukhari", muslim: "Sahih Muslim", abudawud: "Sunan Abu Dawud", tirmidhi: "Jami at-Tirmidhi", nasai: "Sunan an-Nasa'i",
  ibnmajah: "Sunan Ibn Majah", malik: "Muwatta Malik", nawawi: "40 Hadith an-Nawawi", qudsi: "40 Hadith Qudsi", dehlawi: "40 Hadith Shah Waliullah Dehlawi",
};
const SUNNAH_SLUG: Record<string, string> = { bukhari: "bukhari", abudawud: "abudawud", tirmidhi: "tirmidhi", nasai: "nasai", ibnmajah: "ibnmajah", malik: "malik", nawawi: "nawawi40", qudsi: "qudsi40" };
const BRAND = { source: "Quran Masterclass", sourceUrl: "https://quranmasterclass.com" };
const quranUrl = (k: string) => `https://quran.com/${k.replace(":", "/")}`;
const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

function toItem(row: Row, p: CorpusParams): FeedItem | null {
  const de = p.locale === "de";
  const label = LABEL[row.kind][de ? 1 : 0];
  const ref = row.ref ?? {};
  const base = { id: `c:${row.id}`, title: label, body: "", tradition: row.tradition, lang: p.locale, publishedAt: new Date(row.created_at).toISOString() };
  let extra: Partial<FeedItem> & { source: string; sourceUrl: string } = { ...BRAND };
  const k = str(ref.k);
  switch (row.kind) {
    case "verse": case "word": case "tafsir": case "lemma":
      if (!/^\d{1,3}:\d{1,3}$/.test(k)) return null;
      extra = { source: "Quran.com", sourceUrl: quranUrl(k), verseKey: row.kind === "lemma" ? undefined : k, surah: Number(k.split(":")[0]) };
      break;
    case "hadith": {
      const c = str(ref.c), n = Number(ref.n);
      if (!COLLECTION[c] || !Number.isInteger(n)) return null;
      extra = {
        title: COLLECTION[c], source: COLLECTION[c], hadithId: `${c}:${n}`,
        sourceUrl: SUNNAH_SLUG[c] ? `https://sunnah.com/${SUNNAH_SLUG[c]}:${n}` : `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${c}/${n}.json`,
      };
      break;
    }
    case "shia-hadith": {
      const b = str(ref.b), n = Number(ref.n);
      if (!b || !Number.isInteger(n)) return null;
      extra = { source: "Thaqalayn", sourceUrl: "https://thaqalayn.net", hadithId: `thaqalayn:${b}:${n}` };
      break;
    }
    case "maqasid": {
      const s = Number(ref.s), f = Number(ref.f ?? 1);
      if (!Number.isInteger(s)) return null;
      extra = { ...BRAND, verseKey: `${s}:${Number.isInteger(f) ? f : 1}`, surah: s };
      break;
    }
    case "mutashabihat": {
      const first = Array.isArray(ref.keys) ? str(ref.keys[0]) : "";
      extra = { ...BRAND, ...(first ? { verseKey: first, surah: Number(first.split(":")[0]) } : {}) };
      break;
    }
    case "wiki":
      extra = { source: "Wikipedia", sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(str(ref.t).replace(/ /g, "_"))}` };
      break;
    case "dua":
      extra = ref.h !== undefined
        ? { source: "Hisnul Muslim – hisnmuslim.com", sourceUrl: "https://www.hisnmuslim.com" }
        : { source: "fitrahive/dua-dhikr", sourceUrl: "https://github.com/fitrahive/dua-dhikr" };
      break;
    default:
      break;
  }
  if (!p.v2) {
    // older app builds: a plain editorial post with a verse key or hadith id (their resolver loads the text)
    if (row.kind !== "verse" && row.kind !== "hadith" && row.kind !== "shia-hadith") return null;
    return { ...base, ...extra, kind: "editorial", postKind: row.kind === "verse" ? "verse" : "hadith" } as FeedItem;
  }
  return { ...base, ...extra, kind: "corpus", postKind: row.kind, ref, topic: row.topic || undefined } as FeedItem;
}

// ---------- one page ----------
const sizeFactor = (n: number) => Math.min(1, Math.sqrt(n / 1000));

/** a page of the corpus, or null when the corpus is not available (no database, empty table): the caller falls back */
export async function corpusPage(p: CorpusParams, cursor: CorpusCursor | null, now = new Date()): Promise<FeedPageResponse | null> {
  const db = pool();
  const all = await streams();
  if (!db || !all) return null;
  const eligible = all.filter((s) => streamOk(s, p));
  const byKind = new Map<FeedCorpusKind, Stream[]>();
  for (const s of eligible) byKind.set(s.kind, [...(byKind.get(s.kind) ?? []), s]);
  const weights = new Map<FeedCorpusKind, number>();
  for (const [kind, list] of byKind) {
    let w = kindWeight(kind) * sizeFactor(list.reduce((a, s) => a + s.n, 0));
    if (kind === "shia-hadith" && p.tradition === "all") w *= 0.5;
    if (w > 0) weights.set(kind, w);
  }
  const kinds = [...weights.keys()];
  if (!kinds.length) return null;

  const today = dayKey(now);
  const cur: CorpusCursor = cursor
    ? { s: cursor.s, n: cursor.n, r: [...cursor.r], o: { ...cursor.o } }
    : { s: p.seed ? hash32(`seed:${p.seed}`) : hash32(`day:${today}`), n: 0, r: [], o: {} };

  // 1. the plan: a kind per slot (weighted; never the same kind twice in a row, at most two of a kind in six), then a
  //    stream of that kind (weighted by size)
  const plan: Stream[] = [];
  const recent = [...cur.r];
  for (let i = 0; i < p.limit; i++) {
    const r = rng(hash32(`${cur.s}:${cur.n + i}`));
    const last = recent[recent.length - 1];
    const six = recent.slice(-5);
    let cand = kinds.filter((k) => k !== last && six.filter((x) => x === k).length < 2);
    if (!cand.length) cand = kinds.filter((k) => k !== last);
    if (!cand.length) cand = kinds;
    let x = r() * cand.reduce((a, k) => a + weights.get(k)!, 0);
    let kind = cand[cand.length - 1];
    for (const k of cand) { x -= weights.get(k)!; if (x <= 0) { kind = k; break; } }
    const list = byKind.get(kind)!;
    let y = r() * list.reduce((a, s) => a + s.n, 0);
    let stream = list[list.length - 1];
    for (const s of list) { y -= s.n; if (y <= 0) { stream = s; break; } }
    plan.push(stream);
    recent.push(kind);
  }

  // 2. the rows: walk each stream's permutation from its offset; filtered rows (tradition, language, weight) are skipped
  const need = new Map<string, number>();
  for (const s of plan) need.set(s.stream, (need.get(s.stream) ?? 0) + 1);
  const meta = new Map(eligible.map((s) => [s.stream, s]));
  const got = new Map<string, Row[]>();
  const kseqAt = (s: Stream, off: number) => permute(off % s.dom, s.dom, hash32(`${cur.s}:${s.stream}:${Math.floor(off / s.dom)}`));
  for (let round = 0; round < 4; round++) {
    const want = [...need].filter(([st, n]) => (got.get(st)?.length ?? 0) < n);
    if (!want.length) break;
    const qs: string[] = [], qk: number[] = [];
    const order = new Map<string, number[]>();
    for (const [st, n] of want) {
      const s = meta.get(st)!;
      const missing = n - (got.get(st)?.length ?? 0);
      const take = Math.min(240, missing * (round + 2) + 2);
      const off0 = cur.o[st] ?? 0;
      const seqs: number[] = [];
      for (let j = 0; j < take; j++) { const q = kseqAt(s, off0 + j); seqs.push(q); qs.push(st); qk.push(q); }
      order.set(st, seqs);
    }
    const res = await db.query<Row>(
      `SELECT f.id, f.kind, f.stream, f.kseq, f.ref, f.tradition, f.topic, f.weight, f.lang_tags, f.created_at
         FROM unnest($1::text[], $2::int[]) AS q(stream, kseq)
         JOIN feed_items f ON f.stream = q.stream AND f.kseq = q.kseq`,
      [qs, qk],
    );
    const at = new Map<string, Row>();
    for (const row of res.rows) { const key = `${row.stream}|${row.kseq}`; if (!at.has(key)) at.set(key, row); }
    for (const [st, seqs] of order) {
      const list = got.get(st) ?? [];
      const n = need.get(st)!;
      for (const q of seqs) {
        if (list.length >= n) break;
        cur.o[st] = (cur.o[st] ?? 0) + 1;
        const row = at.get(`${st}|${q}`);
        if (!row) continue;
        if (!traditionOk(row.tradition, p.tradition) || !langOk(row.lang_tags, p.locale)) continue;
        if (row.weight < 1 && hash32(`${cur.s}:${row.id}`) / 4294967296 >= Math.max(0, row.weight)) continue;
        list.push(row);
      }
      got.set(st, list);
    }
  }

  // 3. the page in plan order; a slot whose stream had nothing left is skipped
  const items: FeedItem[] = [];
  const emitted: string[] = [...cur.r];
  for (const s of plan) {
    const row = got.get(s.stream)?.shift();
    if (!row) continue;
    const it = toItem(row, p);
    if (!it) continue;
    items.push(it);
    emitted.push(row.kind);
  }
  cur.n += p.limit;
  cur.r = emitted.slice(-5);
  // keep the cursor small: offsets of streams that are no longer eligible are dropped
  cur.o = Object.fromEntries(Object.entries(cur.o).filter(([k]) => meta.has(k)).slice(0, MAX_STREAMS_IN_CURSOR));

  // the very first page starts with today's posts (editorial, verse and hadith of the day, …), as before
  if (!cursor) {
    const editorial = (await editorialItems(p.locale, p.tradition, now)).slice(0, 10);
    const gen = generatedForDay(now, p.locale, p.tradition).filter((i) => traditionOk(i.tradition, p.tradition));
    items.unshift(...editorial, ...gen);
  }
  return { items, nextCursor: encodeCorpusCursor(cur), day: today };
}
