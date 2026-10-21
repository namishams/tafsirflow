// mirrors the data part of mobile/src/features/mishary/StyleStudy.tsx – the masters of the style studies, the study
// verses (also used by the journal and the mentoring recorder) and the phrase/pace analysis from the word timings
// (no audio analysis: phrases are words joined while the gap to the next word is shorter than PAUSE_MS).
import type { Segment } from "@/lib/learn/quran";
import type { MtKey } from "./texts";

export type Master = { key: string; id: number; note: MtKey; ar: string; name: string };
export const MASTERS: Master[] = [
  { key: "alafasy", id: 7, note: "n_alafasy", ar: "مشاري راشد العفاسي", name: "Mishary Alafasy" },
  { key: "abdulbasit", id: 2, note: "n_abdulbasit", ar: "عبد الباسط عبد الصمد", name: "AbdulBaset AbdulSamad" },
  { key: "minshawi", id: 9, note: "n_minshawi", ar: "محمد صديق المنشاوي", name: "Mohamed Siddiq Al-Minshawi" },
  { key: "husary", id: 6, note: "n_husary", ar: "محمود خليل الحصري", name: "Mahmoud Khalil Al-Husary" },
  { key: "sudais", id: 3, note: "n_sudais", ar: "عبد الرحمن السديس", name: "Abdur-Rahman As-Sudais" },
];
export const masterByKey = (k: string) => MASTERS.find((m) => m.key === k);
export const STUDY_VERSES = ["1:1", "1:2", "1:3", "1:4", "1:5", "1:6", "1:7", "67:1", "67:2", "67:3", "112:1", "112:2", "112:3", "112:4", "2:255"];
export const PAUSE_MS = 180;

/** phrases: words joined while the gap to the next word is shorter than PAUSE_MS */
export function phrasesOf(segs: Segment[]): { words: number[]; start: number; end: number }[] {
  const s = [...segs].sort((a, b) => a.start - b.start);
  const out: { words: number[]; start: number; end: number }[] = [];
  for (const x of s) {
    const cur = out.at(-1);
    if (cur && x.start - cur.end < PAUSE_MS) { cur.words.push(x.word); cur.end = Math.max(cur.end, x.end); }
    else out.push({ words: [x.word], start: x.start, end: x.end });
  }
  return out;
}
export function paceOf(segs: Segment[]) {
  const s = [...segs].sort((a, b) => a.start - b.start);
  if (s.length < 2) return null;
  const span = s.at(-1)!.end - s[0].start;
  const gaps = s.slice(1).map((x, i) => Math.max(0, x.start - s[i].end));
  const pauses = gaps.filter((g) => g >= PAUSE_MS);
  return { wpm: Math.round((s.length / Math.max(1, span)) * 60_000), pauses: pauses.length, longest: Math.max(0, ...gaps) };
}
