import { localeMeta } from "@/i18n/locales";

// The browser only talks to our own server (/api/q → database → Quran.com on first use).
const CLIENT_API = process.env.NEXT_PUBLIC_API_BASE ?? "/api/q";
// Quran.com audio is only a fallback if a self-hosted file is missing. Set NEXT_PUBLIC_REMOTE_AUDIO_FALLBACK=0 to disable.
const REMOTE_AUDIO = process.env.NEXT_PUBLIC_REMOTE_AUDIO_FALLBACK !== "0";

// id = Quran.com recitation id when word timings exist for this reciter, otherwise 0 (audio only, no word highlighting)
export type Reciter = { id: number; slug: string; name: string; folder: string };
// Recitation ids with word timing segments. Self-hosted audio: /srv/tafsirflow/audio/<folder>/<SSSAAA>.mp3 (Nginx: /audio/)
export const AUDIO_BASE = process.env.NEXT_PUBLIC_AUDIO_BASE ?? "/audio";
export const RECITERS: Reciter[] = [
  { id: 7, slug: "Alafasy", name: "Mishary Alafasy", folder: "Alafasy_128kbps" },
  { id: 2, slug: "AbdulBaset", name: "AbdulBaset AbdulSamad", folder: "Abdul_Basit_Murattal_192kbps" },
  { id: 6, slug: "Husary", name: "Mahmoud Khalil Al-Husary", folder: "Husary_128kbps" },
  { id: 9, slug: "Minshawi", name: "Mohamed Siddiq Al-Minshawi", folder: "Minshawy_Murattal_128kbps" },
];

export type Resource = { id: number; name: string; author_name: string; language_name: string };

// Preferred translation per language (see CLAUDE.md); other languages use the first one Quran.com offers.
const PREFERRED_TRANSLATION: Record<string, number> = { de: 27, en: 20, id: 33 };
// English tafsirs shown as fallback for languages without their own tafsir.
const ENGLISH_FALLBACK_TAFSIRS = [169, 168, 817];

export type Chapter = { id: number; name_simple: string; name_arabic: string; verses_count: number; translated_name: { name: string } };
export type Word = { position: number; text_uthmani: string; char_type_name: string; translation?: { text: string }; transliteration?: { text: string } };
export type Segment = { word: number; start: number; end: number };
export type Verse = {
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  words: Word[];
  translation: string;
  transliteration: string; // Latin-letter reading aid, built from word data
  audioUrl: string; // self-hosted file
  remoteAudioUrl: string; // Quran.com fallback
  segments: Segment[];
  page: number;
  juz: number;
  hizb: number;
};

export function absoluteAudioUrl(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http")) return url;
  return `https://verses.quran.com/${url}`;
}

// Segments are [index, wordPosition, startMs, endMs] (sometimes strings, sometimes 3-tuples without index)
export function parseSegments(raw: unknown[] | undefined): Segment[] {
  if (!raw) return [];
  return raw
    .map((s) => (Array.isArray(s) ? s.map(Number) : []))
    .filter((s) => s.length >= 3)
    .map((s) => (s.length >= 4 ? { word: s[1], start: s[2], end: s[3] } : { word: s[0], start: s[1], end: s[2] }));
}

export class LimitError extends Error {
  constructor(message: string, public needsVerify = false) { super(message); }
}

async function get<T>(path: string, headers?: Record<string, string>): Promise<T> {
  if (typeof window === "undefined") {
    // server-side rendering: read the store directly
    const { getContent } = await import("./upstream");
    const data = (await getContent(path)) as T & { __missing?: boolean };
    if (data.__missing) throw new Error("not found");
    return data;
  }
  const res = await fetch(`${CLIENT_API}${path}`, { headers });
  if (res.status === 402) {
    const d = (await res.json().catch(() => ({}))) as { needsVerify?: boolean };
    throw new LimitError("daily tafsir limit", !!d.needsVerify);
  }
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// Arabic-script languages show the surah's Arabic name instead of the Latin transliteration;
// Arabic itself needs no "translated" name (the Arabic name is the name).
const ARABIC_SCRIPT = ["ar", "fa", "ur", "ps"];
function localName(c: Chapter, locale: string): Chapter {
  if (!ARABIC_SCRIPT.includes(locale)) return c;
  return { ...c, name_simple: c.name_arabic, translated_name: { name: locale === "ar" ? "" : c.translated_name?.name ?? "" } };
}

export async function getChapters(locale: string): Promise<Chapter[]> {
  const data = await get<{ chapters: Chapter[] }>(`/chapters?language=${locale}`);
  return data.chapters.map((c) => localName(c, locale));
}

export async function getChapter(id: number, locale: string): Promise<Chapter> {
  const data = await get<{ chapter: Chapter }>(`/chapters/${id}?language=${locale}`);
  return localName(data.chapter, locale);
}

let resourceCache: Promise<{ translations: Resource[]; tafsirs: Resource[] }> | null = null;

// Translations and tafsirs Quran.com offers; ids are discovered, not hard-coded, so new languages just work.
export function getResources() {
  resourceCache ??= Promise.all([
    get<{ translations: Resource[] }>("/resources/translations"),
    get<{ tafsirs: Resource[] }>("/resources/tafsirs"),
  ])
    .then(([a, b]) => ({ translations: a.translations, tafsirs: b.tafsirs }))
    .catch((e) => {
      resourceCache = null;
      throw e;
    });
  return resourceCache;
}

export function pickTranslation(locale: string, translations: Resource[]): number {
  const preferred = PREFERRED_TRANSLATION[locale];
  if (preferred && translations.some((t) => t.id === preferred)) return preferred;
  const lang = localeMeta(locale).resourceLang;
  return translations.find((t) => t.language_name?.toLowerCase() === lang)?.id ?? PREFERRED_TRANSLATION.en;
}

export function tafsirOptionsFor(locale: string, tafsirs: Resource[]): { options: Resource[]; hasLocal: boolean } {
  const lang = localeMeta(locale).resourceLang;
  const local = tafsirs.filter((t) => t.language_name?.toLowerCase() === lang);
  if (lang === "english") return { options: local, hasLocal: local.length > 0 };
  const fallback = ENGLISH_FALLBACK_TAFSIRS.map((id) => tafsirs.find((t) => t.id === id)).filter((t): t is Resource => !!t);
  return { options: [...local, ...fallback], hasLocal: local.length > 0 };
}

export function localAudioUrl(reciter: Reciter, chapter: number, verse: number): string {
  const f = `${String(chapter).padStart(3, "0")}${String(verse).padStart(3, "0")}.mp3`;
  return `${AUDIO_BASE}/${reciter.folder}/${f}`;
}

export async function getReciters(): Promise<Reciter[]> {
  try {
    const r = await fetch("/api/reciters");
    const d = (await r.json()) as { reciters?: Reciter[] };
    return d.reciters?.length ? d.reciters : RECITERS;
  } catch {
    return RECITERS;
  }
}

export async function getVerses(chapter: number, locale: string, reciter: Reciter, translationId: number): Promise<Verse[]> {
  const timed = reciter.id > 0; // word timings only exist for reciters known to Quran.com
  const q = `words=true&word_fields=text_uthmani&language=${locale}&fields=text_uthmani,page_number,juz_number,hizb_number&translations=${translationId}&audio=${timed ? reciter.id : RECITERS[0].id}&per_page=300`;
  const data = await get<{ verses: any[] }>(`/verses/by_chapter/${chapter}?${q}`);
  return data.verses.map((v) => ({
    verse_key: v.verse_key,
    verse_number: v.verse_number,
    text_uthmani: v.text_uthmani,
    words: v.words,
    // Arabic readers read the original: no Latin transcription and no "translation" (Arabic tafsir is offered instead)
    transliteration: locale === "ar" ? "" : (v.words ?? [])
      .filter((w: Word) => w.char_type_name === "word")
      .map((w: Word) => w.transliteration?.text ?? "")
      .join(" "),
    translation: locale === "ar" ? "" : (v.translations?.[0]?.text ?? "").replace(/<sup[^>]*>.*?<\/sup>/g, ""),
    audioUrl: localAudioUrl(reciter, chapter, v.verse_number),
    remoteAudioUrl: timed && REMOTE_AUDIO && v.audio?.url ? absoluteAudioUrl(v.audio.url) : "",
    segments: timed ? parseSegments(v.audio?.segments) : [],
    page: Number(v.page_number) || 0,
    juz: Number(v.juz_number) || 0,
    hizb: Number(v.hizb_number) || 0,
  }));
}

export type TafsirResult = { text: string; verseKeys: string[] };

// primary = the verse the reader actually opened (counts against the anonymous daily limit)
export async function getTafsir(tafsirId: number, verseKey: string, primary = false): Promise<TafsirResult | null> {
  const data = await get<{ tafsir?: { text: string; verses?: Record<string, unknown> } }>(
    `/tafsirs/${tafsirId}/by_ayah/${verseKey}`,
    primary ? { "x-tf-primary": "1" } : undefined,
  );
  if (!data.tafsir?.text) return null;
  return { text: data.tafsir.text, verseKeys: Object.keys(data.tafsir.verses ?? {}) };
}

// Own tafsir written in the admin area (approved entries only)
export const OWN_TAFSIR_ID = -1;

export async function getOwnTafsir(locale: string, surah: number, verse: number): Promise<TafsirResult | null> {
  const r = await fetch(`/api/entries?lang=${locale}&surah=${surah}&verse=${verse}`, { headers: { "x-tf-primary": "1" } });
  if (r.status === 402) {
    const d = (await r.json().catch(() => ({}))) as { needsVerify?: boolean };
    throw new LimitError("daily tafsir limit", !!d.needsVerify);
  }
  if (!r.ok) return null;
  const { entry } = (await r.json()) as { entry: { html: string; verse_from: number; verse_to: number } | null };
  if (!entry) return null;
  const keys = [`${surah}:${entry.verse_from}`];
  if (entry.verse_to !== entry.verse_from) keys.push(`${surah}:${entry.verse_to}`);
  return { text: entry.html, verseKeys: keys };
}

export async function hasOwnTafsir(locale: string): Promise<boolean> {
  try {
    const r = await fetch(`/api/entries/summary?lang=${locale}`);
    return ((await r.json()) as { count: number }).count > 0;
  } catch {
    return false;
  }
}

export type SearchHit = { verse_key: string; text: string; translation: string };

// Full-text search over the Quran (Arabic and the reader's translation language)
export async function searchVerses(q: string, locale: string): Promise<SearchHit[]> {
  const data = await get<{ search?: { results?: any[] } }>(`/search?q=${encodeURIComponent(q)}&size=20&language=${locale}`);
  return (data.search?.results ?? []).map((r) => ({
    verse_key: r.verse_key,
    text: String(r.text ?? ""),
    translation: String(r.translations?.[0]?.text ?? ""),
  }));
}

export type SingleVerse = { verse_key: string; text_uthmani: string; translation: string };

export async function getVerseByKey(key: string, locale: string, translationId: number): Promise<SingleVerse> {
  const d = await get<{ verse: any }>(`/verses/by_key/${key}?language=${locale}&words=false&translations=${translationId}&fields=text_uthmani`);
  return {
    verse_key: d.verse.verse_key,
    text_uthmani: d.verse.text_uthmani,
    translation: locale === "ar" ? "" : String(d.verse.translations?.[0]?.text ?? "").replace(/<sup[^>]*>.*?<\/sup>/g, ""),
  };
}
