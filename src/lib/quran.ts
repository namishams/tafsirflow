const API = "https://api.quran.com/api/v4";

// Quran.com translation ids (see CLAUDE.md)
export const TRANSLATION_BY_LOCALE: Record<string, number> = { de: 27, en: 20 };

export type Reciter = { id: number; slug: string; name: string; folder: string };

// Self-hosted audio: /srv/tafsirflow/audio/<folder>/<SSSAAA>.mp3, served by Nginx at /audio/
export const AUDIO_BASE = process.env.NEXT_PUBLIC_AUDIO_BASE ?? "/audio";
// Recitation ids with word timing segments
export const RECITERS: Reciter[] = [
  { id: 7, slug: "Alafasy", name: "Mishary Alafasy", folder: "Alafasy_128kbps" },
  { id: 2, slug: "AbdulBaset", name: "AbdulBaset AbdulSamad", folder: "Abdul_Basit_Murattal_192kbps" },
  { id: 6, slug: "Husary", name: "Mahmoud Khalil Al-Husary", folder: "Husary_128kbps" },
  { id: 9, slug: "Minshawi", name: "Mohamed Siddiq Al-Minshawi", folder: "Minshawy_Murattal_128kbps" },
];

export type TafsirSource = { id: number; name: string; author: string };
// English tafsirs from Quran.com; German source still open (see CLAUDE.md)
export const TAFSIRS: TafsirSource[] = [
  { id: 169, name: "Ibn Kathir (abridged)", author: "Hafiz Ibn Kathir" },
  { id: 168, name: "Ma'arif al-Qur'an", author: "Mufti Muhammad Shafi" },
  { id: 817, name: "Tazkirul Quran", author: "Maulana Wahiduddin Khan" },
];

export type Chapter = { id: number; name_simple: string; name_arabic: string; verses_count: number; translated_name: { name: string } };
export type Word = { position: number; text_uthmani: string; char_type_name: string };
export type Segment = { word: number; start: number; end: number };
export type Verse = {
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  words: Word[];
  translation: string;
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
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`Quran.com API ${res.status}`);
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

export function localAudioUrl(reciter: Reciter, chapter: number, verse: number): string {
  const f = `${String(chapter).padStart(3, "0")}${String(verse).padStart(3, "0")}.mp3`;
  return `${AUDIO_BASE}/${reciter.folder}/${f}`;
}

export async function getVerses(chapter: number, locale: string, reciterId: number): Promise<Verse[]> {
  const reciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0];
  const tr = TRANSLATION_BY_LOCALE[locale] ?? 20;
  const q = `words=true&word_fields=text_uthmani&fields=text_uthmani&translations=${tr}&audio=${reciterId}&per_page=300`;
  const data = await get<{ verses: any[] }>(`/verses/by_chapter/${chapter}?${q}`);
  return data.verses.map((v) => ({
    verse_key: v.verse_key,
    verse_number: v.verse_number,
    text_uthmani: v.text_uthmani,
    words: v.words,
    translation: (v.translations?.[0]?.text ?? "").replace(/<sup[^>]*>.*?<\/sup>/g, ""),
    audioUrl: localAudioUrl(reciter, chapter, v.verse_number),
    remoteAudioUrl: v.audio?.url ? absoluteAudioUrl(v.audio.url) : "",
    segments: parseSegments(v.audio?.segments),
  }));
}

export type TafsirResult = { text: string; verseKeys: string[] };

export async function getTafsir(tafsirId: number, verseKey: string): Promise<TafsirResult | null> {
  const data = await get<{ tafsir?: { text: string; verses?: Record<string, unknown> } }>(
    `/tafsirs/${tafsirId}/by_ayah/${verseKey}`,
  );
  if (!data.tafsir?.text) return null;
  return { text: data.tafsir.text, verseKeys: Object.keys(data.tafsir.verses ?? {}) };
}
