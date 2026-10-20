import { api, SITE } from "./api";

// Quran data comes from the website's own store (/api/q: database first, Quran.com on first use),
// the same source the website uses. Audio is self-hosted on quranmasterclass.com/audio.

export type Reciter = { id: number; slug: string; name: string; folder: string };
// id = Quran.com recitation id with word timings (0 = audio only, no word highlighting)
export const RECITERS: Reciter[] = [
  { id: 7, slug: "Alafasy", name: "Mishary Alafasy", folder: "Alafasy_128kbps" },
  { id: 2, slug: "AbdulBaset", name: "AbdulBaset AbdulSamad", folder: "Abdul_Basit_Murattal_192kbps" },
  { id: 6, slug: "Husary", name: "Mahmoud Khalil Al-Husary", folder: "Husary_128kbps" },
  { id: 9, slug: "Minshawi", name: "Mohamed Siddiq Al-Minshawi", folder: "Minshawy_Murattal_128kbps" },
];

export type Chapter = { id: number; name_simple: string; name_arabic: string; verses_count: number; revelation_place: string; translated_name: { name: string } };
export type Word = { position: number; text_uthmani: string; char_type_name: string; translation?: { text: string }; transliteration?: { text: string } };
export type Segment = { word: number; start: number; end: number };
export type Verse = {
  verse_key: string; verse_number: number; text_uthmani: string; words: Word[];
  translation: string; transliteration: string; audioUrl: string; segments: Segment[]; page: number; juz: number;
};
export type Resource = { id: number; name: string; author_name: string; language_name: string };

// Bubenheim & Elyas for German, Saheeh International for English (project brief)
export const TRANSLATION: Record<string, number> = { de: 27, en: 20 };
// English tafsirs the website shows (Ibn Kathir abridged, Ma'arif al-Qur'an, Tazkirul Quran) and Arabic al-Muyassar
export const TAFSIRS = [
  { id: 169, name: "Ibn Kathir (abridged)", lang: "en" },
  { id: 168, name: "Ma'arif al-Qur'an", lang: "en" },
  { id: 817, name: "Tazkirul Quran", lang: "en" },
  { id: 16, name: "التفسير الميسر", lang: "ar" },
] as const;

export class LimitError extends Error {}

const q = <T,>(path: string, headers?: Record<string, string>) =>
  api<T>(`/api/q${path}`, { headers }).catch((e: unknown) => {
    if ((e as { status?: number }).status === 402) throw new LimitError("daily tafsir limit");
    throw e;
  });

export function parseSegments(raw: unknown[] | undefined): Segment[] {
  if (!raw) return [];
  return raw
    .map((s) => (Array.isArray(s) ? s.map(Number) : []))
    .filter((s) => s.length >= 3)
    .map((s) => (s.length >= 4 ? { word: s[1], start: s[2], end: s[3] } : { word: s[0], start: s[1], end: s[2] }));
}

export const audioUrl = (reciter: Reciter, chapter: number, verse: number) =>
  `${SITE}/audio/${reciter.folder}/${String(chapter).padStart(3, "0")}${String(verse).padStart(3, "0")}.mp3`;

let chapters: Promise<Chapter[]> | null = null;
let chaptersLang = "";
export function getChapters(lang: string): Promise<Chapter[]> {
  if (!chapters || chaptersLang !== lang) {
    chaptersLang = lang;
    chapters = q<{ chapters: Chapter[] }>(`/chapters?language=${lang}`).then((d) => d.chapters).catch((e) => { chapters = null; throw e; });
  }
  return chapters;
}

export async function getVerses(chapter: number, lang: string, reciter: Reciter): Promise<Verse[]> {
  const timed = reciter.id > 0;
  const params = `words=true&word_fields=text_uthmani&language=${lang}&fields=text_uthmani,page_number,juz_number&translations=${TRANSLATION[lang] ?? 20}&audio=${timed ? reciter.id : 7}&per_page=300`;
  const d = await q<{ verses: any[] }>(`/verses/by_chapter/${chapter}?${params}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  return d.verses.map((v) => ({
    verse_key: v.verse_key,
    verse_number: v.verse_number,
    text_uthmani: v.text_uthmani,
    words: (v.words ?? []) as Word[],
    transliteration: ((v.words ?? []) as Word[]).filter((w) => w.char_type_name === "word").map((w) => w.transliteration?.text ?? "").join(" "),
    translation: String(v.translations?.[0]?.text ?? "").replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, ""),
    audioUrl: audioUrl(reciter, chapter, v.verse_number),
    segments: timed ? parseSegments(v.audio?.segments) : [],
    page: Number(v.page_number) || 0,
    juz: Number(v.juz_number) || 0,
  }));
}

export type Tafsir = { text: string; verseKeys: string[] };
/** tafsir text as plain paragraphs (the source is HTML) */
export async function getTafsir(tafsirId: number, verseKey: string): Promise<Tafsir | null> {
  const d = await q<{ tafsir?: { text: string; verses?: Record<string, unknown> } }>(`/tafsirs/${tafsirId}/by_ayah/${verseKey}`, { "x-tf-primary": "1" });
  if (!d.tafsir?.text) return null;
  return { text: htmlToText(d.tafsir.text), verseKeys: Object.keys(d.tafsir.verses ?? {}) };
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
