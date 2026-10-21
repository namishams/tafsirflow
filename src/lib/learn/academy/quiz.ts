// mirrors mobile/src/features/academy/quiz.ts (copied for the website; keep both in step)
import type { Verse } from "@/lib/learn/quran";

// The academy test questions, copied verbatim from the website's src/components/LessonRunner.tsx: which word comes
// next, what a word means, put the words in order, which verse do you hear.
export type Q =
  | { kind: "next"; prompt: string[]; options: string[]; answer: number; key: string }
  | { kind: "meaning"; word: string; options: string[]; answer: number; key: string }
  | { kind: "order"; tiles: string[]; solution: string[]; key: string }
  | { kind: "listen"; audio: string; options: string[]; answer: number; key: string };

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const wordsOf = (v: Verse) => v.words.filter((w) => w.char_type_name === "word");

// Builds a varied test from the lesson's verses (and the rest of the surah for distractors)
export function buildQuiz(all: Verse[], from: number, to: number, count: number): Q[] {
  const lesson = all.filter((v) => v.verse_number >= from && v.verse_number <= to);
  if (!lesson.length) return []; // a lesson outside the surah (e.g. a stale link): no questions instead of a crash
  const pool = all.flatMap((v) => wordsOf(v).map((w) => ({ ar: w.text_uthmani, tr: (w.translation?.text ?? "").trim() })));
  const uniqAr = Array.from(new Set(pool.map((p) => p.ar)));
  const uniqTr = Array.from(new Set(pool.map((p) => p.tr).filter(Boolean)));
  const distract = (correct: string, from: string[], n = 3) => shuffle(from.filter((x) => x !== correct)).slice(0, n);
  const makers: (() => Q | null)[] = [
    () => {
      const v = pick(lesson); const ws = wordsOf(v); if (ws.length < 2) return null;
      const i = 1 + Math.floor(Math.random() * (ws.length - 1));
      const correct = ws[i].text_uthmani; const opts = shuffle([correct, ...distract(correct, uniqAr)]);
      if (opts.length < 3) return null;
      return { kind: "next", prompt: ws.slice(Math.max(0, i - 4), i).map((w) => w.text_uthmani), options: opts, answer: opts.indexOf(correct), key: v.verse_key };
    },
    () => {
      const v = pick(lesson); const ws = wordsOf(v).filter((w) => (w.translation?.text ?? "").trim()); if (!ws.length) return null;
      const w = pick(ws); const correct = (w.translation?.text ?? "").trim(); const opts = shuffle([correct, ...distract(correct, uniqTr)]);
      if (opts.length < 3) return null;
      return { kind: "meaning", word: w.text_uthmani, options: opts, answer: opts.indexOf(correct), key: v.verse_key };
    },
    () => {
      const v = pick(lesson); const ws = wordsOf(v).map((w) => w.text_uthmani); if (ws.length < 3) return null;
      const start = ws.length > 6 ? Math.floor(Math.random() * (ws.length - 5)) : 0;
      const sol = ws.slice(start, start + 6);
      return { kind: "order", tiles: shuffle(sol), solution: sol, key: v.verse_key };
    },
    () => {
      if (all.length < 3) return null;
      const v = pick(lesson); const text = (x: Verse) => wordsOf(x).slice(0, 5).map((w) => w.text_uthmani).join(" ");
      const others = shuffle(all.filter((x) => x.verse_key !== v.verse_key)).slice(0, 3).map(text);
      const opts = shuffle([text(v), ...others]);
      return { kind: "listen", audio: v.audioUrl, options: opts, answer: opts.indexOf(text(v)), key: v.verse_key };
    },
  ];
  const out: Q[] = [];
  for (let tries = 0; out.length < count && tries < count * 8; tries++) {
    const q = makers[out.length % makers.length]();
    if (q) out.push(q);
  }
  return out;
}
