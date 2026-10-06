import { localeMeta } from "@/i18n/locales";

// The browser only talks to our own server (/api/q → database → Quran.com on first use).
const CLIENT_API = process.env.NEXT_PUBLIC_API_BASE ?? "/api/q";
// Quran.com audio is only a fallback if a self-hosted file is missing. Set NEXT_PUBLIC_REMOTE_AUDIO_FALLBACK=0 to disable.
const REMOTE_AUDIO = process.env.NEXT_PUBLIC_REMOTE_AUDIO_FALLBACK !== "0";

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

async function get<T>(path: string): Promise<T> {
  if (typeof window === "undefined") {
    // server-side rendering: read the store directly
    const { getContent } = await import("./upstream");
    const data = (await getContent(path)) as T & { __missing?: boolean };
    if (data.__missing) throw new Error("not found");
    return data;
  }
  const res = await fetch(`${CLIENT_API}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function getChapters(locale: string): Promise<Chapter[]> {
  const data = await get<{ chapters: Chapter[] }>(`/chapters?language=${locale}`);
  return data.chapters;
}

export async function getChapter(id: number, locale: string): Promise<Chapter> {
  const data = await get<{ chapter: Chapter }>(`/chapters/${id}?language=${locale}`);
  return data.chapter;
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

export async function getVerses(chapter: number, locale: string, reciterId: number, translationId: number): Promise<Verse[]> {
  const reciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0];
  const q = `words=true&word_fields=text_uthmani&language=${locale}&fields=text_uthmani&translations=${translationId}&audio=${reciterId}&per_page=300`;
  const data = await get<{ verses: any[] }>(`/verses/by_chapter/${chapter}?${q}`);
  return data.verses.map((v) => ({
    verse_key: v.verse_key,
    verse_number: v.verse_number,
    text_uthmani: v.text_uthmani,
    words: v.words,
    transliteration: (v.words ?? [])
      .filter((w: Word) => w.char_type_name === "word")
      .map((w: Word) => w.transliteration?.text ?? "")
      .join(" "),
    translation: (v.translations?.[0]?.text ?? "").replace(/<sup[^>]*>.*?<\/sup>/g, ""),
    audioUrl: localAudioUrl(reciter, chapter, v.verse_number),
    remoteAudioUrl: REMOTE_AUDIO && v.audio?.url ? absoluteAudioUrl(v.audio.url) : "",
    segments: parseSegments(v.audio?.segments),
  }));
}

export type TafsirResult = { text: string; verseKeys: string[] };

export async function getTafsir(tafsirId: number, verseKey: string): Promise<TafsirResult | null> {
  const data = await get<{ tafsir?: { text: string; verses?: Record<string, unknown> } }>(`/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
  if (!data.tafsir?.text) return null;
  return { text: data.tafsir.text, verseKeys: Object.keys(data.tafsir.verses ?? {}) };
}
