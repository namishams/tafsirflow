import { cachedFetch, DAY, excerpt, rng, settle, stripHtml } from "./net";
import type { SourceItem } from "./types";

const QC = "https://api.quran.com/api/v4";

// app language -> Quran.com language_name used in the tafsir resource list
const TAFSIR_LANG: Record<string, string> = {
  en: "english", ar: "arabic", bn: "bengali", ru: "russian", ur: "urdu", ku: "kurdish",
  id: "indonesian", tr: "turkish", fr: "french", de: "german", fa: "persian", ms: "malay",
};

type TafsirRes = { id: number; name: string; author: string; slug: string; lang: string };
type Chapter = { id: number; name: string; arabic: string; verses: number };

export async function chapters(): Promise<Chapter[]> {
  return cachedFetch<Chapter[]>(`${QC}/chapters?language=en`, {
    ttlMs: 30 * DAY,
    transform: (r) =>
      (r.chapters as any[]).map((c) => ({ id: c.id, name: c.name_simple, arabic: c.name_arabic, verses: c.verses_count })),
  });
}

async function tafsirList(): Promise<TafsirRes[]> {
  return cachedFetch<TafsirRes[]>(`${QC}/resources/tafsirs`, {
    ttlMs: 7 * DAY,
    transform: (r) =>
      (r.tafsirs as any[]).map((t) => ({
        id: t.id, name: t.translated_name?.name ?? t.name, author: t.author_name, slug: t.slug,
        lang: String(t.language_name).toLowerCase(),
      })),
  });
}

/** Tafsirs in the app language, else English + Arabic. All offered tafsirs are rotated through. */
async function tafsirsFor(lang: string): Promise<TafsirRes[]> {
  const all = await tafsirList();
  const want = TAFSIR_LANG[lang];
  const mine = want ? all.filter((t) => t.lang === want) : [];
  return mine.length ? mine : all.filter((t) => t.lang === "english" || t.lang === "arabic");
}

const LANG_CODE: Record<string, string> = Object.fromEntries(Object.entries(TAFSIR_LANG).map(([k, v]) => [v, k]));

function pickVerse(chs: Chapter[], r: () => number): { s: number; a: number; ch: Chapter } {
  const ch = chs[Math.floor(r() * chs.length)];
  return { s: ch.id, a: 1 + Math.floor(r() * ch.verses), ch };
}

export async function tafsirItems(lang: string, page: number, size: number, seed: string): Promise<SourceItem[]> {
  const [list, chs] = await Promise.all([tafsirsFor(lang), chapters()]);
  if (!list.length) return [];
  const r = rng(`tafsir:${seed}:${lang}:${page}`);
  const tasks = Array.from({ length: size }, (_, i) => async (): Promise<SourceItem | null> => {
    const t = list[(page * size + i) % list.length];
    const { s, a, ch } = pickVerse(chs, r);
    const key = `${s}:${a}`;
    const data = await cachedFetch<{ text: string } | null>(`${QC}/tafsirs/${t.id}/by_ayah/${key}`, {
      ttlMs: 30 * DAY,
      transform: (raw) => {
        const txt = stripHtml(String(raw?.tafsir?.text ?? ""));
        return txt ? { text: excerpt(txt, 700) } : null;
      },
    });
    if (!data) return null;
    const l = LANG_CODE[t.lang] ?? "en";
    return {
      id: `tafsir:${t.id}:${key}`, kind: "tafsir", title: `${t.name} – ${ch.name} ${key}`, body: data.text, lang: l,
      source: `Quran.com – ${t.name} (${t.author})`, sourceUrl: `https://quran.com/${key}/tafsirs/${t.slug}`,
      tradition: "sunni", tags: [t.slug, key],
    };
  });
  return settle(tasks);
}

export async function surahInfoItems(lang: string, page: number, size: number, seed: string): Promise<SourceItem[]> {
  const chs = await chapters();
  const r = rng(`surah:${seed}`);
  const offset = Math.floor(r() * 114);
  const tasks = Array.from({ length: size }, (_, i) => async (): Promise<SourceItem | null> => {
    const ch = chs[(offset + page * size + i) % chs.length];
    const info = await cachedFetch<{ text: string; lang: string; src: string } | null>(
      `${QC}/chapters/${ch.id}/info?language=${encodeURIComponent(lang)}`,
      {
        ttlMs: 30 * DAY,
        transform: (raw) => {
          const ci = raw?.chapter_info;
          if (!ci) return null;
          const txt = stripHtml(String(ci.short_text || ci.text || ""));
          return txt ? { text: excerpt(txt, 700), lang: LANG_CODE[String(ci.language_name)] ?? "en", src: String(ci.source ?? "") } : null;
        },
      },
    );
    if (!info) return null;
    return {
      id: `surah-info:${ch.id}:${info.lang}`, kind: "surah-info", title: `Surah ${ch.name}`, arabic: ch.arabic,
      body: info.text, lang: info.lang, source: `Quran.com${info.src ? " – " + info.src : ""}`,
      sourceUrl: `https://quran.com/surah/${ch.id}/info`, tradition: "all", tags: [String(ch.id)],
    };
  });
  return settle(tasks);
}

// Word-by-word translation languages offered by Quran.com
const WBW = new Set(["en", "ur", "bn", "id", "tr", "fa", "hi", "ta", "ms", "ml"]);

type VWordRow = { ar: string; tr: string; tl: string; pos: number };
/** the words of a verse with word-by-word translation (Quran.com; cached per verse and language) */
const verseWords = (key: string, wl: string) =>
  cachedFetch<VWordRow[]>(`${QC}/verses/by_key/${key}?words=true&language=${wl}&word_fields=text_uthmani`, {
    ttlMs: 30 * DAY,
    transform: (raw) =>
      ((raw?.verse?.words ?? []) as any[])
        .filter((w) => w.char_type_name === "word")
        .map((w) => ({ ar: w.text_uthmani, tr: w.translation?.text ?? "", tl: w.transliteration?.text ?? "", pos: w.position })),
  });

export async function wordOfDayItems(lang: string, page: number, size: number, seed: string): Promise<SourceItem[]> {
  const chs = await chapters();
  const wl = WBW.has(lang) ? lang : "en";
  const r = rng(`wotd:${seed}:${page}`);
  const tasks = Array.from({ length: size }, () => {
    const { s, a, ch } = pickVerse(chs, r);
    const pickF = r();
    return async (): Promise<SourceItem | null> => {
      const key = `${s}:${a}`;
      const words = await verseWords(key, wl);
      const good = words.filter((w) => w.ar && w.tr && [...w.ar].length >= 4);
      if (!good.length) return null;
      const w = good[Math.floor(pickF * good.length)];
      return {
        id: `word:${key}:${w.pos}:${wl}`, kind: "word-of-day", title: w.tl ? `${w.tl} – ${w.tr}` : w.tr, arabic: w.ar,
        body: `${w.tr}\n${ch.name} ${key}, word ${w.pos}`, lang: wl, source: "Quran.com word-by-word",
        sourceUrl: `https://quran.com/${key}`, tradition: "all", tags: [key],
      };
    };
  });
  return settle(tasks);
}

// ---- single items by reference (the server corpus of /api/feed/page names verse keys, tafsir ids and word positions) ----

/** one word of a verse by its 1-based position, as a word-of-the-day card; null when the verse has no such word */
export async function wordByRef(key: string, pos: number, lang: string): Promise<SourceItem | null> {
  if (!/^\d{1,3}:\d{1,3}$/.test(key) || !Number.isInteger(pos)) return null;
  const wl = WBW.has(lang) ? lang : "en";
  const [chs, words] = await Promise.all([chapters(), verseWords(key, wl)]);
  const w = words.find((x) => x.pos === pos);
  if (!w?.ar || !w.tr) return null;
  const ch = chs.find((c) => c.id === Number(key.split(":")[0]));
  return {
    id: `word:${key}:${w.pos}:${wl}`, kind: "word-of-day", title: w.tl ? `${w.tl} – ${w.tr}` : w.tr, arabic: w.ar,
    body: `${w.tr}\n${ch?.name ?? ""} ${key}, word ${w.pos}`.trim(), lang: wl, source: "Quran.com word-by-word",
    sourceUrl: `https://quran.com/${key}`, tradition: "all", tags: [key],
  };
}

/** the passage of a Quran.com tafsir work for a verse (the API answers with the passage of the verse's group); the
 *  item and its link carry the group's first verse, so a group is shown once in the seen window */
export async function tafsirByRef(tafsirId: number, key: string): Promise<SourceItem | null> {
  if (!/^\d{1,3}:\d{1,3}$/.test(key)) return null;
  const [list, chs] = await Promise.all([tafsirList(), chapters()]);
  const t = list.find((x) => x.id === tafsirId);
  if (!t) return null;
  const data = await cachedFetch<{ text: string; keys: string[] } | null>(`${QC}/tafsirs/${t.id}/by_ayah/${key}`, {
    key: `tafsir-ref:${t.id}:${key}`,
    ttlMs: 30 * DAY,
    transform: (raw) => {
      const txt = stripHtml(String(raw?.tafsir?.text ?? ""));
      const keys = Object.keys(raw?.tafsir?.verses ?? {}).filter((k) => /^\d+:\d+$/.test(k)).sort((x, y) => Number(x.split(":")[1]) - Number(y.split(":")[1]));
      return txt ? { text: excerpt(txt, 700), keys } : null;
    },
  });
  if (!data) return null;
  const first = data.keys[0] ?? key, last = data.keys[data.keys.length - 1] ?? key;
  const ch = chs.find((c) => c.id === Number(first.split(":")[0]));
  const range = first === last ? first : `${first}–${last.split(":")[1]}`;
  return {
    id: `tafsir:${t.id}:${first}`, kind: "tafsir", title: `${t.name} – ${ch ? `${ch.name} ` : ""}${range}`, body: data.text, lang: LANG_CODE[t.lang] ?? "en",
    source: `Quran.com – ${t.name} (${t.author})`, sourceUrl: `https://quran.com/${first}/tafsirs/${t.slug}`, tradition: "sunni", tags: [t.slug, first],
  };
}

/** a lemma of the Quranic Arabic Corpus with its root and count (all from the server reference, nothing is loaded) */
export function lemmaItem(ref: { l?: unknown; r?: unknown; n?: unknown; k?: unknown }, lang: string): SourceItem | null {
  const lemma = typeof ref.l === "string" ? ref.l : "", root = typeof ref.r === "string" ? ref.r : "", n = Number(ref.n), key = typeof ref.k === "string" ? ref.k : "";
  if (!lemma || !root || !Number.isInteger(n) || n < 1 || !/^\d{1,3}:\d{1,3}$/.test(key)) return null;
  const spaced = [...root].join(" ");
  const de = lang === "de";
  return {
    id: `lemma:${lemma}`, kind: "word-root", title: `${lemma}: ${n}×`, arabic: lemma,
    body: de
      ? `Das Wort ${lemma} (Wurzel ${spaced}) kommt ${n}-mal im Koran vor. Erstes Vorkommen: ${key}.`
      : `The word ${lemma} (root ${spaced}) appears ${n} times in the Quran. First occurrence: ${key}.`,
    lang: de ? "de" : "en", source: "Quranic Arabic Corpus (GPL), via quran-morphology",
    sourceUrl: `https://corpus.quran.com/qurandictionary.jsp?q=${encodeURIComponent(root)}`, tradition: "all", tags: [root, key],
  };
}

// Quranic Arabic Corpus morphology (GPL), mirrored by mustafa0x/quran-morphology. Downloaded once (~6 MB),
// reduced to a compact root table [root, count, lemma, firstKey] before caching.
const MORPH = "https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt";
type RootRow = [string, number, string, string];

async function rootTable(): Promise<RootRow[]> {
  return cachedFetch<RootRow[]>(MORPH, {
    key: "roots:v1",
    text: true,
    ttlMs: 180 * DAY,
    timeoutMs: 60_000,
    transform: (txt: string) => {
      const m = new Map<string, RootRow>();
      const seen = new Set<string>();
      for (const line of txt.split("\n")) {
        const parts = line.split("\t");
        if (parts.length < 4) continue;
        const root = /ROOT:([^|]+)/.exec(parts[3])?.[1];
        if (!root) continue;
        const [s, a, w] = parts[0].split(":");
        const wordKey = `${s}:${a}:${w}:${root}`;
        if (seen.has(wordKey)) continue; // count words, not segments
        seen.add(wordKey);
        const row = m.get(root);
        if (row) row[1]++;
        else m.set(root, [root, 1, /LEM:([^|]+)/.exec(parts[3])?.[1] ?? "", `${s}:${a}`]);
      }
      return [...m.values()].sort((x, y) => y[1] - x[1]);
    },
  });
}

export async function rootItems(_lang: string, page: number, size: number, seed: string): Promise<SourceItem[]> {
  const rows = await rootTable();
  if (!rows.length) return [];
  const r = rng(`roots:${seed}`);
  const offset = Math.floor(r() * rows.length);
  const out: SourceItem[] = [];
  for (let i = 0; i < size; i++) {
    const [root, count, lemma, key] = rows[(offset + page * size + i) % rows.length];
    const spaced = [...root].join(" ");
    out.push({
      id: `root:${root}`, kind: "word-root", title: `${spaced}: ${count}×`, arabic: lemma || root,
      body: `The root ${spaced} appears ${count} times in the Quran (words derived from it). First occurrence: ${key}.`,
      lang: "en", source: "Quranic Arabic Corpus (GPL), via quran-morphology",
      sourceUrl: `https://corpus.quran.com/qurandictionary.jsp?q=${encodeURIComponent(root)}`, tradition: "all",
      tags: [root, key],
    });
  }
  return out;
}
