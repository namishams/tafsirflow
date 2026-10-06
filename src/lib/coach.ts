import { readJSON } from "./storage";
import { readSrs, strength, today, type Srs } from "./learning";
import { VERSE_COUNTS } from "./counts";
import { TOTAL_VERSES } from "./quranIndex";
import { ageProfile } from "./age";

// The Shams coach: a small learner model built only from the learner's own history (no server, no AI). It decides
// how each verse is practised, what today's session holds and what comes next – different for every learner.

// The basmala of al-Fatiha is verse 1:1 in the Hafs count, but everyone knows it: it does not count as progress.
export const NOT_COUNTED = new Set(["1:1"]);
export const COUNTABLE_TOTAL = TOTAL_VERSES - NOT_COUNTED.size;
const counted = (srs: Srs) => Object.entries(srs).filter(([k]) => !NOT_COUNTED.has(k));

// Strength minus a penalty for verses that slipped often (same scale as the Quran map)
export function verseStrength(srs: Srs, key: string): number | null {
  const e = srs[key];
  if (!e) return null;
  return Math.max(0, strength(e) - Math.min(0.3, (e.lapses ?? 0) * 0.05));
}

export type Kind = "new" | "repair" | "refresh" | "check";
// Step ids of the Shams method: 0 listen, 1 build up backwards, 2 word by word, 3 meaning & memory hooks,
// 4 tafsir, 5 fading cues + self-rating, 6 reflection, 7 connect with the previous verse
export type VersePlan = { kind: Kind; steps: number[]; listen: number; words: number; strength: number | null; lapses: number };

// Personal memory factor: the average ease of all verses (1 = average, lower = verses slip more easily)
export function memoryFactor(srs: Srs = readSrs()): number {
  const e = counted(srs).map(([, v]) => v.ease ?? 1);
  return e.length >= 5 ? e.reduce((a, b) => a + b, 0) / e.length : 1;
}

// How a verse is practised right now. Long verses and learners whose verses slip get more listening rounds;
// known verses skip what is already understood; a verse that was learned is linked to the one before it.
export function versePlan(key: string, words: number, prevKey: string | null, srs: Srs = readSrs()): VersePlan {
  const e = srs[key];
  const s = verseStrength(srs, key);
  const lapses = e?.lapses ?? 0;
  const mf = memoryFactor(srs);
  const ap = ageProfile();
  const byLength = words <= 5 ? 2 : words <= 12 ? 3 : words <= 24 ? 4 : 5;
  const listen = Math.max(2, Math.min(7, byLength + (mf < 0.85 ? 1 : mf > 1.3 ? -1 : 0) + Math.max(0, ap.listen - 3)));
  const link = !!prevKey && !NOT_COUNTED.has(prevKey) && !!srs[prevKey];
  let kind: Kind, steps: number[];
  if (!e) { kind = "new"; steps = [0, 1, 2, 3, 4, 5, ...(link ? [7] : []), 6]; }
  else if ((s ?? 0) < 0.5 || lapses >= 3) { kind = "repair"; steps = [0, 1, 3, 5, ...(link ? [7] : [])]; }
  else if ((s ?? 0) < 0.8 || e.stage < 2) { kind = "refresh"; steps = [0, 5]; }
  else { kind = "check"; steps = [5]; }
  return { kind, steps, listen: kind === "refresh" ? Math.max(2, listen - 1) : listen, words, strength: s, lapses };
}

export type SurahProgress = { id: number; learned: number; total: number; avg: number | null; next: number | null };

export function surahProgress(srs: Srs = readSrs()): SurahProgress[] {
  return VERSE_COUNTS.map((n, i) => {
    const id = i + 1;
    let learned = 0, sum = 0, next: number | null = null;
    for (let v = 1; v <= n; v++) {
      const key = `${id}:${v}`;
      if (NOT_COUNTED.has(key)) continue;
      const st = verseStrength(srs, key);
      if (st === null) { next ??= v; continue; }
      learned++; sum += st;
    }
    const total = n - (id === 1 ? 1 : 0);
    return { id, learned, total, avg: learned ? sum / learned : null, next };
  });
}

// Order in which surahs are usually memorised when nothing else is going on: al-Fatiha, then Juz 'Amma from the end,
// then the surahs people love to know by heart
const PATH = [1, ...Array.from({ length: 37 }, (_, i) => 114 - i), 67, 36, 18, 55, 56, 32, 2];

// Where new learning continues: the surah you are working on, otherwise the next one on the classic path
export function nextNew(srs: Srs = readSrs(), sp = surahProgress(srs)): { surah: number; verse: number } {
  const recent = counted(srs).sort((a, b) => (b[1].at ?? 0) - (a[1].at ?? 0))[0];
  if (recent) {
    const s = Number(recent[0].split(":")[0]);
    const p = sp[s - 1];
    if (p.next !== null) return { surah: s, verse: p.next };
  }
  const last = readJSON<{ chapter: number; verse: number } | null>("tf:last", null);
  if (last && sp[last.chapter - 1]?.next !== null && sp[last.chapter - 1]?.learned > 0) return { surah: last.chapter, verse: sp[last.chapter - 1].next! };
  for (const s of [...PATH, ...Array.from({ length: 114 }, (_, i) => i + 1)]) {
    const p = sp[s - 1];
    if (p.next !== null) return { surah: s, verse: s === 1 && p.next === 1 ? 1 : p.next };
  }
  return { surah: 1, verse: 1 };
}

export type Learner = {
  learned: number; // verses in the review system (basmala of al-Fatiha excluded)
  solid: number; // verses that sit firmly right now
  percent: number; // share of the whole Quran learned
  retention: number | null; // share of ratings without slipping
  memory: number; // personal memory factor
  pace: number; // verses practised per active day, last 14 days
  activeDays: number; // active days in the last 14
  forecast: number[]; // reviews due today and the next 6 days
  complete: SurahProgress[]; // surahs fully learned
  working: SurahProgress[]; // surahs in progress
  fading: SurahProgress[]; // learned surahs that are weakening first
  next: { surah: number; verse: number };
};

export function learner(srs: Srs = readSrs()): Learner {
  const t = today();
  const list = counted(srs);
  const sp = surahProgress(srs);
  let reviews = 0, lapses = 0;
  for (const [, e] of list) { reviews += e.n ?? e.stage + (e.lapses ?? 0) + 1; lapses += e.lapses ?? 0; }
  const days = readJSON<Record<string, number>>("tf:days", {});
  let sum = 0, active = 0;
  for (let d = t - 13; d <= t; d++) { const n = days[String(d)] ?? 0; if (n) { active++; sum += n; } }
  const forecast = Array.from({ length: 7 }, (_, i) => list.filter(([, e]) => (i === 0 ? e.due <= t : e.due === t + i)).length);
  const solid = list.filter(([k]) => (verseStrength(srs, k) ?? 0) >= 0.8).length;
  return {
    learned: list.length,
    solid,
    percent: list.length / COUNTABLE_TOTAL,
    retention: reviews >= 10 ? Math.max(0, 1 - lapses / reviews) : null,
    memory: memoryFactor(srs),
    pace: active ? Math.round(sum / active) : 0,
    activeDays: active,
    forecast,
    complete: sp.filter((p) => p.total > 0 && p.learned === p.total),
    working: sp.filter((p) => p.learned > 0 && p.learned < p.total).sort((a, b) => b.learned / b.total - a.learned / a.total),
    fading: sp.filter((p) => p.avg !== null && p.avg < 0.7).sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0)).slice(0, 3),
    next: nextNew(srs, sp),
  };
}

export type DayPlan = { reviews: string[]; repair: string[]; newVerses: number; next: { surah: number; verse: number }; minutes: number; reason: "start" | "light" | "steady" | "consolidate" | "reviewOnly" };

// Today's session: reviews first (weakest first), then repairs, then as many new verses as the learner can carry.
// When too much is due or verses slip often, the coach holds new verses back – consolidating comes first.
export function dayPlan(srs: Srs = readSrs()): DayPlan {
  const L = learner(srs);
  const t = today();
  const due = counted(srs).filter(([, e]) => e.due <= t).map(([k]) => k);
  const repair = due.filter((k) => (verseStrength(srs, k) ?? 0) < 0.4 || (srs[k].lapses ?? 0) >= 3);
  const reviews = due.filter((k) => !repair.includes(k)).sort((a, b) => (verseStrength(srs, a) ?? 0) - (verseStrength(srs, b) ?? 0));
  const capacity = Math.max(6, Math.min(40, L.pace || 8));
  let newVerses: number, reason: DayPlan["reason"];
  if (L.learned === 0) { newVerses = 3; reason = "start"; }
  else if (due.length > capacity * 1.5) { newVerses = 0; reason = "reviewOnly"; }
  else if (L.retention !== null && L.retention < 0.7) { newVerses = Math.max(1, Math.round((capacity - due.length) / 4)); reason = "consolidate"; }
  else if (due.length > capacity * 0.7) { newVerses = Math.max(1, Math.round((capacity - due.length) / 2)); reason = "light"; }
  else { newVerses = Math.max(2, Math.min(10, Math.round((capacity - due.length) / 2))); reason = "steady"; }
  const minutes = Math.max(5, Math.round(reviews.length * 0.7 + repair.length * 2 + newVerses * 4));
  return { reviews, repair, newVerses, next: L.next, minutes, reason };
}
