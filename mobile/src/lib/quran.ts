import { api, SITE } from "./api";

// The same data layer as the website (src/lib/quran.ts): Quran text, translations, word timings and tafsir come from
// the website's own store (/api/q: database first, Quran.com on first use). Audio is self-hosted on
// quranmasterclass.com/audio, Quran.com audio only as a fallback.

export type Reciter = { id: number; slug: string; name: string; folder: string };
// id = Quran.com recitation id with word timings (0 = audio only, no word highlighting)
export const RECITERS: Reciter[] = [
  { id: 7, slug: "Alafasy", name: "Mishary Alafasy", folder: "Alafasy_128kbps" },
  { id: 2, slug: "AbdulBaset", name: "AbdulBaset AbdulSamad", folder: "Abdul_Basit_Murattal_192kbps" },
  { id: 6, slug: "Husary", name: "Mahmoud Khalil Al-Husary", folder: "Husary_128kbps" },
  { id: 9, slug: "Minshawi", name: "Mohamed Siddiq Al-Minshawi", folder: "Minshawy_Murattal_128kbps" },
];

export type Resource = { id: number; name: string; author_name: string; language_name: string };
export type Chapter = { id: number; name_simple: string; name_arabic: string; verses_count: number; revelation_place?: string; translated_name: { name: string } };
export type Word = { position: number; text_uthmani: string; char_type_name: string; translation?: { text: string }; transliteration?: { text: string } };
export type Segment = { word: number; start: number; end: number };
export type Verse = {
  verse_key: string; verse_number: number; text_uthmani: string; words: Word[];
  translation: string; transliteration: string; audioUrl: string; remoteAudioUrl: string; segments: Segment[]; page: number; juz: number; hizb: number;
};

// Preferred translation per language (project brief): Bubenheim & Elyas (de), Saheeh International (en)
const PREFERRED_TRANSLATION: Record<string, number> = { de: 27, en: 20 };
export const TRANSLATION = PREFERRED_TRANSLATION;
// English tafsirs shown as fallback for languages without their own tafsir (Ibn Kathir abridged, Ma'arif al-Qur'an, Tazkirul Quran)
const ENGLISH_FALLBACK_TAFSIRS = [169, 168, 817];
const RESOURCE_LANG: Record<string, string> = { de: "german", en: "english" };

export class LimitError extends Error {
  constructor(message: string, public needsVerify = false) { super(message); }
}

async function get<T>(path: string, headers?: Record<string, string>): Promise<T> {
  try {
    return await api<T>(`/api/q${path}`, { headers });
  } catch (e) {
    const err = e as { status?: number; code?: string };
    if (err.status === 402) throw new LimitError("daily tafsir limit", err.code === "verify");
    throw e;
  }
}

export function absoluteAudioUrl(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http")) return url;
  return `https://verses.quran.com/${url}`;
}

/** Segments are [index, wordPosition, startMs, endMs] (sometimes strings, sometimes 3-tuples without index) */
export function parseSegments(raw: unknown[] | undefined): Segment[] {
  if (!raw) return [];
  return raw
    .map((s) => (Array.isArray(s) ? s.map(Number) : []))
    .filter((s) => s.length >= 3)
    .map((s) => (s.length >= 4 ? { word: s[1], start: s[2], end: s[3] } : { word: s[0], start: s[1], end: s[2] }));
}

export const audioUrl = (reciter: Reciter, chapter: number, verse: number) =>
  `${SITE}/audio/${reciter.folder}/${String(chapter).padStart(3, "0")}${String(verse).padStart(3, "0")}.mp3`;

const chapterCache = new Map<string, Promise<Chapter[]>>();
export function getChapters(lang: string): Promise<Chapter[]> {
  let p = chapterCache.get(lang);
  if (!p) {
    p = get<{ chapters: Chapter[] }>(`/chapters?language=${lang}`).then((d) => d.chapters);
    p.catch(() => chapterCache.delete(lang));
    chapterCache.set(lang, p);
  }
  return p;
}

export async function getChapter(id: number, lang: string): Promise<Chapter> {
  const all = await getChapters(lang).catch(() => null);
  const hit = all?.find((c) => c.id === id);
  if (hit) return hit;
  return (await get<{ chapter: Chapter }>(`/chapters/${id}?language=${lang}`)).chapter;
}

let resourceCache: Promise<{ translations: Resource[]; tafsirs: Resource[] }> | null = null;
/** translations and tafsirs Quran.com offers (ids discovered, not hard-coded) */
export function getResources() {
  resourceCache ??= Promise.all([
    get<{ translations: Resource[] }>("/resources/translations"),
    get<{ tafsirs: Resource[] }>("/resources/tafsirs"),
  ])
    .then(([a, b]) => ({ translations: a.translations, tafsirs: b.tafsirs }))
    .catch((e) => { resourceCache = null; throw e; });
  return resourceCache;
}

export function pickTranslation(lang: string, translations: Resource[]): number {
  const preferred = PREFERRED_TRANSLATION[lang];
  if (preferred && translations.some((t) => t.id === preferred)) return preferred;
  return translations.find((t) => t.language_name?.toLowerCase() === RESOURCE_LANG[lang])?.id ?? PREFERRED_TRANSLATION.en;
}

/** tafsir choices like the website: the reader's language first, English classics as fallback */
export function tafsirOptionsFor(lang: string, tafsirs: Resource[]): { options: Resource[]; hasLocal: boolean } {
  const rl = RESOURCE_LANG[lang] ?? "english";
  const local = tafsirs.filter((t) => t.language_name?.toLowerCase() === rl);
  if (rl === "english") return { options: local, hasLocal: local.length > 0 };
  const fallback = ENGLISH_FALLBACK_TAFSIRS.map((id) => tafsirs.find((t) => t.id === id)).filter((t): t is Resource => !!t);
  return { options: [...local, ...fallback], hasLocal: local.length > 0 };
}

const verseCache = new Map<string, Promise<Verse[]>>();
export function getVerses(chapter: number, lang: string, reciter: Reciter, translationId?: number): Promise<Verse[]> {
  const tid = translationId ?? PREFERRED_TRANSLATION[lang] ?? 20;
  const key = `${chapter}:${lang}:${reciter.id}:${reciter.folder}:${tid}`;
  let p = verseCache.get(key);
  if (!p) {
    p = loadVerses(chapter, lang, reciter, tid);
    p.catch(() => verseCache.delete(key));
    verseCache.set(key, p);
  }
  return p;
}

async function loadVerses(chapter: number, lang: string, reciter: Reciter, translationId: number): Promise<Verse[]> {
  const timed = reciter.id > 0; // word timings only exist for reciters known to Quran.com
  const q = `words=true&word_fields=text_uthmani&language=${lang}&fields=text_uthmani,page_number,juz_number,hizb_number&translations=${translationId}&audio=${timed ? reciter.id : RECITERS[0].id}&per_page=300`;
  const d = await get<{ verses: any[] }>(`/verses/by_chapter/${chapter}?${q}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  return d.verses.map((v) => ({
    verse_key: v.verse_key,
    verse_number: v.verse_number,
    text_uthmani: v.text_uthmani,
    words: (v.words ?? []) as Word[],
    transliteration: ((v.words ?? []) as Word[]).filter((w) => w.char_type_name === "word").map((w) => w.transliteration?.text ?? "").join(" "),
    translation: stripFootnotes(String(v.translations?.[0]?.text ?? "")),
    audioUrl: audioUrl(reciter, chapter, v.verse_number),
    remoteAudioUrl: timed && v.audio?.url ? absoluteAudioUrl(v.audio.url) : "",
    segments: timed ? parseSegments(v.audio?.segments) : [],
    page: Number(v.page_number) || 0,
    juz: Number(v.juz_number) || 0,
    hizb: Number(v.hizb_number) || 0,
  }));
}

/** translation text without footnote markers and markup */
export const stripFootnotes = (s: string) => s.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();

export type Tafsir = { text: string; html: string; verseKeys: string[] };

/** tafsir for one verse (primary = the verse the reader opened; counts against the anonymous daily limit) */
export async function getTafsir(tafsirId: number, verseKey: string, primary = true): Promise<Tafsir | null> {
  const d = await get<{ tafsir?: { text: string; verses?: Record<string, unknown> } }>(`/tafsirs/${tafsirId}/by_ayah/${verseKey}`, primary ? { "x-tf-primary": "1" } : undefined);
  if (!d.tafsir?.text) return null;
  return { html: d.tafsir.text, text: htmlToText(d.tafsir.text), verseKeys: Object.keys(d.tafsir.verses ?? {}) };
}

/** the website's own tafsir written in the admin area (approved entries only) */
export const OWN_TAFSIR_ID = -1;
export async function getOwnTafsir(lang: string, surah: number, verse: number): Promise<Tafsir | null> {
  try {
    const d = await api<{ entry: { html: string; verse_from: number; verse_to: number } | null }>(`/api/entries?lang=${lang}&surah=${surah}&verse=${verse}`, { headers: { "x-tf-primary": "1" } });
    if (!d.entry) return null;
    const keys = [`${surah}:${d.entry.verse_from}`];
    if (d.entry.verse_to !== d.entry.verse_from) keys.push(`${surah}:${d.entry.verse_to}`);
    return { html: d.entry.html, text: htmlToText(d.entry.html), verseKeys: keys };
  } catch (e) {
    if ((e as { status?: number }).status === 402) throw new LimitError("daily tafsir limit");
    return null;
  }
}
export async function hasOwnTafsir(lang: string): Promise<boolean> {
  try { return (await api<{ count: number }>(`/api/entries/summary?lang=${lang}`)).count > 0; } catch { return false; }
}

export type SearchHit = { verse_key: string; text: string; translation: string };
export async function searchVerses(q: string, lang: string): Promise<SearchHit[]> {
  const d = await get<{ search?: { results?: any[] } }>(`/search?q=${encodeURIComponent(q)}&size=20&language=${lang}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  return (d.search?.results ?? []).map((r) => ({ verse_key: r.verse_key, text: String(r.text ?? ""), translation: stripFootnotes(String(r.translations?.[0]?.text ?? "")) }));
}

export type SingleVerse = { verse_key: string; text_uthmani: string; translation: string };
export async function getVerseByKey(key: string, lang: string, translationId?: number): Promise<SingleVerse> {
  const tid = translationId ?? PREFERRED_TRANSLATION[lang] ?? 20;
  const d = await get<{ verse: any }>(`/verses/by_key/${key}?language=${lang}&words=false&translations=${tid}&fields=text_uthmani`); // eslint-disable-line @typescript-eslint/no-explicit-any
  return { verse_key: d.verse.verse_key, text_uthmani: d.verse.text_uthmani, translation: stripFootnotes(String(d.verse.translations?.[0]?.text ?? "")) };
}

/** reciters offered by the server (falls back to the built-in four) */
export async function getReciters(): Promise<Reciter[]> {
  try {
    const d = await api<{ reciters?: Reciter[] }>("/api/reciters");
    return d.reciters?.length ? d.reciters : RECITERS;
  } catch { return RECITERS; }
}

export function htmlToText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h\d|li)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** tafsir as blocks for native rendering: headings, paragraphs, Arabic paragraphs (right to left) */
export type TafsirBlock = { kind: "h" | "p" | "ar"; text: string };
const ARABIC_RE = /[؀-ۿ]/g;
export function tafsirBlocks(html: string): TafsirBlock[] {
  const out: TafsirBlock[] = [];
  const parts = html.replace(/\r/g, "").split(/(<h\d[^>]*>[\s\S]*?<\/h\d>)/i);
  for (const part of parts) {
    if (/^<h\d/i.test(part)) { const t = htmlToText(part); if (t) out.push({ kind: "h", text: t }); continue; }
    for (const para of htmlToText(part).split(/\n\s*\n/)) {
      const t = para.trim();
      if (!t) continue;
      const ar = (t.match(ARABIC_RE) ?? []).length;
      out.push({ kind: ar > t.replace(/\s/g, "").length * 0.5 ? "ar" : "p", text: t });
    }
  }
  return out;
}

/** surah names shown in lists (the server also returns translated names) */
export const surahLabel = (c: Chapter) => `${c.id}. ${c.name_simple}`;
