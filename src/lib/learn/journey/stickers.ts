// mirrors mobile/src/features/journey/stickers.ts (copied for the website; keep in step with the app)
import type { Motif, Shape, StickerDef, Tone } from "@/lib/learn/feed/gamify";
import { readPoints } from "@/lib/points";
import { DAY, fromHijri, toHijri } from "@/lib/hijri";
import { MAX_STAGE } from "@/lib/learn/garden/garden";
import type { Metrics } from "./metrics";
import { complete, currentMarhala, marhala, TEN, SEVEN } from "./marahil";
import { grant, readJourney } from "./store";

// The stickers of the long path: new ids only (BLUEPRINT §8), drawn with the feed's seal art (StickerArt) so they
// belong to the same album style. Series without an end (Marḥala n, rank band n, every 365 days of a streak, tafsir
// pass n …) generate their next id by formula; an id, once earned, keeps its meaning for ever.
// Mythic: nine seals that are nearly out of reach but honest: every one can be earned by real learning, none by chance.

export type JDef = StickerDef & { mythic?: boolean; key: string; vars?: Record<string, number | string> };
type Series = { fam: string; shape: Shape; motif: Motif; key: string; value: (M: Metrics, done: number) => number; tiers: number[]; step?: number; finite?: boolean };

/** tier i of a series: the listed ones, then (when the series is endless) by the step */
export function tierOf(s: Series, i: number): number | null {
  if (i < s.tiers.length) return s.tiers[i];
  if (s.finite) return null;
  const last = s.tiers[s.tiers.length - 1];
  const step = s.step ?? (s.tiers.length > 1 ? last - s.tiers[s.tiers.length - 2] : last);
  return last + step * (i - s.tiers.length + 1);
}
const toneOf = (i: number, n: number): Tone => (n % 10 === 0 || n % 7 === 0 ? "gold" : i % 2 ? "night" : "emerald");

export const SERIES: Series[] = [
  { fam: "marhala", shape: "arch", motif: "arch", key: "s_marhala", value: (_, done) => done, tiers: [1, 2, 3, 4, 5, 6, 7], step: 1 },
  { fam: "rank", shape: "rosette", motif: "chevrons", key: "s_rank", value: (M) => M.rank.band, tiers: [1, 2, 3, 4, 5, 6, 7], step: 1 },
  { fam: "streak", shape: "star", motif: "flame", key: "s_streak", value: (M) => M.streakBest, tiers: [365, 730, 1095], step: 365 },
  { fam: "days", shape: "hex", motif: "calendar", key: "s_days", value: (M) => M.activeDays, tiers: [100, 365, 500, 1000, 2000, 3000, 5000], step: 2500 },
  { fam: "khatm", shape: "circle", motif: "book", key: "s_khatm", value: (M) => M.khatms, tiers: [1, 3, 7, 10, 20, 30, 50, 100], step: 100 },
  { fam: "juz", shape: "star", motif: "star8", key: "s_juz", value: (M) => M.juzFull, tiers: [1, 5, 10, 15, 20, 25, 30], finite: true },
  { fam: "itqan", shape: "rosette", motif: "star8", key: "s_itqan", value: (M) => M.itqan90, tiers: [1, 5, 10, 20, 30], finite: true },
  { fam: "tafsir", shape: "hex", motif: "pen", key: "s_tafsir", value: (M) => M.j.e.tafsir.cycles, tiers: [1, 2, 3], step: 1 },
  { fam: "hadith", shape: "arch", motif: "scroll", key: "s_hadith", value: (M) => M.j.e.hadith.units, tiers: [40, 500, 1000, 2500, 5000, 10000, 20000], step: 10000 },
  { fam: "lemma", shape: "rosette", motif: "word", key: "s_lemma", value: (M) => M.j.e.lemma.cycles, tiers: [1, 2, 3], step: 1 },
  { fam: "mut", shape: "circle", motif: "target", key: "s_mut", value: (M) => M.j.e.mut.cycles, tiers: [1, 5, 10, 25, 50], step: 50 },
  { fam: "review", shape: "circle", motif: "wave", key: "s_review", value: (M) => M.j.e.review.cycles, tiers: [1, 5, 10, 25, 50, 100], step: 100 },
  { fam: "fullreview", shape: "star", motif: "wave", key: "s_fullreview", value: (M) => M.j.full, tiers: [1, 3, 7, 10], step: 10 },
  { fam: "qiraat", shape: "arch", motif: "lantern", key: "s_qiraat", value: (M) => (TEN.every((q) => M.j.q[q]) ? 10 : SEVEN.every((q) => M.j.q[q]) ? 7 : 0), tiers: [7, 10], finite: true },
  { fam: "garden", shape: "arch", motif: "palm", key: "s_garden", value: (M, done) => gardenAreas(M, done), tiers: [1, 2, 3, 4, 5, 6, 7], step: 1 },
];
const SHAPE_OF = new Map(SERIES.map((s) => [s.fam, s]));

/** garden areas: after the tree reached its last stage, every completed Marḥala opens one more area of the garden */
export const gardenAreas = (M: Metrics, done: number) => (M.treeStage >= MAX_STAGE ? done : 0);

export const idOf = (fam: string, n: number) => `rihla-${fam}-${n}`;
export function defOf(fam: string, n: number, i: number): JDef | null {
  const s = SHAPE_OF.get(fam);
  if (!s) return null;
  return { id: idOf(fam, n), fam: `rihla-${fam}`, n, shape: s.shape, motif: s.motif, tone: toneOf(i, n), key: s.key, vars: { n } };
}

// ---------- mythic ----------
type MythicSrc = { id: string; key: string; motif: Motif; reached: (M: Metrics) => boolean; prog: (M: Metrics) => [number, number] };
const MYTHIC_SRC: MythicSrc[] = [
  { id: "mythic-shams-khatm-10", key: "my_shamsKhatm", reached: (M) => M.j.full >= 10, prog: (M) => [M.j.full, 10], motif: "wave" },
  { id: "mythic-itqan-30", key: "my_itqan", reached: (M) => M.itqan95 >= 30, prog: (M) => [M.itqan95, 30], motif: "star8" },
  { id: "mythic-streak-1000", key: "my_streak", reached: (M) => M.streakBest >= 1000, prog: (M) => [M.streakBest, 1000], motif: "flame" },
  { id: "mythic-all-series", key: "my_series", reached: (M) => M.feedAll && M.seriesAll, prog: (M) => [(M.feedAll ? 1 : 0) + (M.seriesAll ? 1 : 0), 2], motif: "rose" },
  { id: "mythic-qiraat-10", key: "my_qiraat", reached: (M) => TEN.every((q) => M.j.q[q]) && M.rpCerts >= 10, prog: (M) => [TEN.filter((q) => M.j.q[q]).length + Math.min(10, M.rpCerts), TEN.length + 10], motif: "lantern" },
  { id: "mythic-masha-10000", key: "my_masha", reached: (M) => M.masha >= 10000, prog: (M) => [M.masha, 10000], motif: "heart" },
  { id: "mythic-all-certs", key: "my_certs", reached: (M) => certParts(M)[0] >= certParts(M)[1], prog: (M) => certParts(M), motif: "scroll" },
  { id: "mythic-hadith-all", key: "my_hadith", reached: (M) => M.j.e.hadith.cycles >= 1, prog: (M) => [Math.min(1, M.j.e.hadith.cycles), 1], motif: "pen" },
  { id: "mythic-tafsir-10", key: "my_tafsir", reached: (M) => M.j.e.tafsir.cycles >= 10, prog: (M) => [M.j.e.tafsir.cycles, 10], motif: "book" },
];
export const MYTHIC: (JDef & Pick<MythicSrc, "reached" | "prog">)[] = MYTHIC_SRC.map((x) => ({ ...x, fam: "mythic", shape: "star" as Shape, tone: "rare" as Tone, rare: true, mythic: true }));
/** every Academy course, the ten Reciter Path certificates, the five Arabic levels (and the Nahj course when shown) */
function certParts(M: Metrics): [number, number] {
  const have = M.coursesDone + Math.min(10, M.rpCerts) + Math.min(5, M.arCerts) + (M.nahj ? (M.course("nahj") >= 1 ? 1 : 0) : 0);
  return [have, M.coursesTotal + 10 + 5 + (M.nahj ? 1 : 0)];
}

// ---------- the Hijri year sticker: 100 learning days in one Hijri year ----------
export const YEAR_DAYS = 100;
export function hijriYearOfDay(day: number): number { try { return toHijri(day * DAY).y; } catch { return 0; } }
export function hijriBounds(y: number): { from: number; to: number } | null {
  const a = fromHijri(y, 1, 1), b = fromHijri(y + 1, 1, 1);
  return a === null || b === null ? null : { from: Math.round(a / DAY), to: Math.round(b / DAY) - 1 };
}
export function activeDaysByHijri(): Map<number, number> {
  const out = new Map<number, number>();
  for (const [d, v] of Object.entries(readPoints().d)) if (v > 0) { const y = hijriYearOfDay(Number(d)); if (y) out.set(y, (out.get(y) ?? 0) + 1); }
  return out;
}
export const yearDef = (y: number): JDef => ({ id: `rihla-hijri-${y}`, fam: "rihla-hijri", n: y, shape: "circle", motif: "crescent", tone: "night", key: "s_hijri", vars: { n: y } });

// ---------- evaluation ----------
/** completed Marāḥil (a Marḥala once earned stays earned) */
export function marahilDone(M: Metrics): number {
  const st = readJourney().stickers;
  return currentMarhala(M, (m) => !!st[idOf("marhala", m)]) - 1;
}
/** opens every sticker the learner has reached; returns the new ids */
export function evaluate(M: Metrics): string[] {
  const done = marahilDone(M);
  const ids: string[] = [];
  for (const s of SERIES) {
    const v = s.value(M, done);
    for (let i = 0; i < 100_000; i++) { const n = tierOf(s, i); if (n === null || v < n) break; ids.push(idOf(s.fam, n)); }
  }
  for (const x of MYTHIC) if (x.reached(M)) ids.push(x.id);
  for (const [y, n] of activeDaysByHijri()) if (n >= YEAR_DAYS) ids.push(yearDef(y).id);
  return grant(ids);
}
/** the album rows: earned stickers of each series plus the next one (locked), so there is always a next horizon */
export function albumOf(M: Metrics, earned: Record<string, number>): { fam: string; key: string; items: { def: JDef; have: boolean; prog?: [number, number] }[] }[] {
  const done = marahilDone(M);
  const rows = SERIES.map((s) => {
    const items: { def: JDef; have: boolean; prog?: [number, number] }[] = [];
    for (let i = 0; i < 100_000; i++) {
      const n = tierOf(s, i);
      if (n === null) break;
      const def = defOf(s.fam, n, i)!;
      const have = !!earned[def.id];
      items.push({ def, have, prog: have ? undefined : [Math.min(n, s.value(M, done)), n] });
      if (!have) break;
    }
    return { fam: s.fam, key: s.key, items };
  });
  const years = Object.keys(earned).filter((k) => k.startsWith("rihla-hijri-")).map((k) => Number(k.slice(12))).sort((a, b) => a - b);
  rows.push({ fam: "hijri", key: "s_hijri", items: years.map((y) => ({ def: yearDef(y), have: true })) });
  return rows;
}
export const isMarhalaComplete = (m: number, M: Metrics) => complete(marhala(m, M));
