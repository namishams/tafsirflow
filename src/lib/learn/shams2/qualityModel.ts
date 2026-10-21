// mirrors mobile/src/features/shams2/qualityModel.ts (copied for the website; keep in step with the app)
import { strength, today, type Srs } from "@/lib/learning";
import { NOT_COUNTED } from "@/lib/coach";
import { VERSE_COUNTS } from "@/lib/counts";
import { JUZ_START, TOTAL_VERSES, indexOf, keyAt } from "@/lib/quranIndex";
import { strengthOf } from "@/lib/learn/srs/fsrs";
import type { SrsState } from "@/lib/learn/srs/store";
import type { Check, MutStat, Words } from "./store";

// Hifz quality (itqān) per verse, page, surah and juz – computed only from the learner's own history:
//   recall today (FSRS, from the reader's verse reviews "tf:srs" and the verse cards of the card trainer),
//   maturity (stability in days: a verse that holds for months is more firmly memorised than one learned yesterday),
//   slips (lapses per review), recitation checks (share of words heard correctly) and mutashabihat answers.
// No server, no AI, nothing leaves the device unless the learner shares a teacher code.

export type Known = { key: string; i: number; recall: number; s: number; lapses: number; n: number; first: number | null; due: number };

const STAGE_DAYS = [1, 3, 7, 14, 30, 90];
/** every memorised verse with its memory data (union of tf:srs and verse cards) */
export function knownVerses(srs: Srs, cards: SrsState | null, day = today()): Map<string, Known> {
  const out = new Map<string, Known>();
  for (const [key, e] of Object.entries(srs)) {
    if (NOT_COUNTED.has(key)) continue;
    const [a, b] = key.split(":").map(Number);
    if (!a || !b || a > 114 || b > VERSE_COUNTS[a - 1]) continue;
    out.set(key, { key, i: indexOf(a, b), recall: strength(e, day), s: e.s ?? STAGE_DAYS[e.stage] ?? 1, lapses: e.lapses ?? 0, n: e.n ?? (e.stage ?? 0) + 1, first: e.first ?? null, due: e.due });
  }
  for (const [id, c] of Object.entries(cards?.cards ?? {})) {
    if (!c.m || !id.startsWith("verse:")) continue;
    const key = id.slice(6);
    if (NOT_COUNTED.has(key)) continue;
    const [a, b] = key.split(":").map(Number);
    if (!a || !b || a > 114 || b > VERSE_COUNTS[a - 1]) continue;
    const r = strengthOf(c.m, day);
    const cur = out.get(key);
    if (!cur) out.set(key, { key, i: indexOf(a, b), recall: r, s: c.m.s, lapses: c.m.lapses, n: c.m.reps, first: c.added, due: c.m.due });
    else if (r > cur.recall) out.set(key, { ...cur, recall: r, s: Math.max(cur.s, c.m.s) });
  }
  return out;
}

export type Level = "none" | "weak" | "developing" | "strong" | "itqan";
export const levelOf = (score: number | null): Level => (score === null ? "none" : score >= 90 ? "itqan" : score >= 70 ? "strong" : score >= 40 ? "developing" : "weak");

export type Extra = { words: Words; checks: Record<string, Check>; mut: Record<string, MutStat> };

/** 0–100 for one verse, with the parts it is made of (shown to the learner, so the score is never a black box) */
export function verseScore(k: Known, x: Extra): { score: number; recall: number; maturity: number; accuracy: number | null; steadiness: number; mut: number | null } {
  const maturity = Math.min(1, Math.log(1 + k.s) / Math.log(1 + 90));
  const steadiness = 1 - Math.min(1, k.lapses / Math.max(1, k.n + 1));
  const ch = x.checks[k.key];
  const wordMiss = Object.values(x.words[k.key] ?? {}).reduce((a, w) => a + Math.max(0, w.miss - w.ok), 0);
  const accuracy = ch && ch.total ? Math.max(0, ch.ok / ch.total - Math.min(0.3, wordMiss * 0.05)) : wordMiss ? Math.max(0, 1 - wordMiss * 0.1) : null;
  const m = x.mut[k.key];
  const mut = m && m.ok + m.miss ? m.ok / (m.ok + m.miss) : null;
  const acc = accuracy ?? k.recall;
  let score = 100 * (0.45 * k.recall + 0.25 * maturity + 0.15 * acc + 0.15 * steadiness);
  if (mut !== null) score *= 0.85 + 0.15 * mut;
  return { score: Math.round(Math.max(0, Math.min(100, score))), recall: k.recall, maturity, accuracy, steadiness, mut };
}

export type Cell = { id: number; known: number; total: number; score: number | null; weakest: { key: string; score: number }[] };

function cellOf(id: number, keys: string[], total: number, scores: Map<string, number>): Cell {
  const vals = keys.map((k) => ({ key: k, score: scores.get(k) })).filter((v): v is { key: string; score: number } => v.score !== undefined);
  const known = vals.length;
  const avg = known ? vals.reduce((a, v) => a + v.score, 0) / known : null;
  return { id, known, total, score: avg === null ? null : Math.round(avg), weakest: vals.sort((a, b) => a.score - b.score).slice(0, 5) };
}

const juzRange = (j: number): [number, number] => {
  const at = (k: string) => indexOf(...(k.split(":").map(Number) as [number, number]));
  return [at(JUZ_START[j - 1]), j < 30 ? at(JUZ_START[j]) : TOTAL_VERSES];
};

/** score per verse plus aggregates per surah and juz (pages need the page map, see pages.ts) */
export function qualityModel(known: Map<string, Known>, x: Extra) {
  const scores = new Map<string, number>();
  for (const k of known.values()) scores.set(k.key, verseScore(k, x).score);
  const surahs: Cell[] = VERSE_COUNTS.map((n, i) => {
    const s = i + 1;
    const keys = Array.from({ length: n }, (_, v) => `${s}:${v + 1}`).filter((k) => !NOT_COUNTED.has(k));
    return cellOf(s, keys.filter((k) => scores.has(k)), keys.length, scores);
  });
  const juz: Cell[] = Array.from({ length: 30 }, (_, j) => {
    const [a, b] = juzRange(j + 1);
    const keys: string[] = [];
    for (let i = a; i < b; i++) { const { s, v } = keyAt(i); keys.push(`${s}:${v}`); }
    return cellOf(j + 1, keys.filter((k) => scores.has(k)), keys.length, scores);
  });
  const all = [...scores.values()];
  const overall = all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : null;
  return { scores, surahs, juz, overall, count: all.length };
}

/** page cells from a page map (surah -> page per verse); verses of surahs not loaded yet are left out */
export function pageCells(pages: Record<string, number[]>, scores: Map<string, number>): Cell[] {
  const byPage = new Map<number, string[]>();
  for (const [s, list] of Object.entries(pages)) list.forEach((p, i) => { if (!p) return; const k = `${s}:${i + 1}`; if (NOT_COUNTED.has(k)) return; (byPage.get(p) ?? byPage.set(p, []).get(p)!).push(k); });
  return Array.from({ length: 604 }, (_, i) => {
    const keys = byPage.get(i + 1) ?? [];
    return cellOf(i + 1, keys.filter((k) => scores.has(k)), keys.length, scores);
  });
}
