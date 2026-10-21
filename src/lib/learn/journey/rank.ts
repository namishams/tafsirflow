// mirrors mobile/src/features/journey/rank.ts (copied for the website; keep in step with the app)
import { LEVELS, levelOf, type Points } from "@/lib/points";

// The app rank beyond the eight learning levels of web/points.ts (frozen framework, BLUEPRINT §8: additions only).
// Levels 1–8 and their thresholds, titles and the star above level 8 stay exactly as they are (levelOf is not touched).
// From level 9 on, levels are APPENDED with a formula that never ends and slows down gently:
//
//   counted points C = Σ over days of min(daily points, RANK_DAY_CAP)      (the ranking's daily cap, 1,500 by default
//                                                                            on the server: settings.limits.rankingDailyCap)
//   level 8 + k is reached at  T(k) = 10,000 + A · k^1.5   (A = 11,200, rounded to 100)
//   step from level 8+k to 8+k+1 ≈ 1.5 · A · √k  (k = 1: 20,500; k = 49: 118,200; k = 100: 168,400)
//
// At the cap (1,500 per day, which a learner reaches with several hours a day) level 57 (k = 49) needs 3.85 million
// counted points, about 2,570 such days; every level after that takes a little longer, without a last one.
// Nothing here is shown as a duration in the app. Titles are humble app ranks (no honorifics): a band of seven levels
// shares a word for a learner, the band number continues for ever, and the top always shows the next horizon.
// Version 1 of the formula. A later version must never lower a level a learner has already reached (see rankOf: max).
export const RANK_VERSION = 1;
export const RANK_DAY_CAP = 1500;
export const RANK_A = 11200;
export const RANK_P = 1.5;
export const BAND = 7;
const BASE = LEVELS[LEVELS.length - 1].min; // 10,000: level 8, "companion of the Quran"
const OLD_TOP = LEVELS.length; // 8

/** counted points needed for the appended level k (k ≥ 1 → level 8 + k) */
export const extMin = (k: number) => (k <= 0 ? BASE : BASE + Math.round((RANK_A * Math.pow(k, RANK_P)) / 100) * 100);

/** the words of the bands (Arabic, transliteration); the band after the last keeps the last word and its number */
export const BANDS: { ar: string; tr: string; key: string }[] = [
  { ar: "طالب علم", tr: "Ṭālib ʿilm", key: "talib" },
  { ar: "دارِس", tr: "Dāris", key: "daris" },
  { ar: "مُراجِع", tr: "Murājiʿ", key: "muraji" },
  { ar: "مُلازِم", tr: "Mulāzim", key: "mulazim" },
  { ar: "مُثابِر", tr: "Muthābir", key: "muthabir" },
  { ar: "مُتأمِّل", tr: "Mutaʾammil", key: "mutaammil" },
  { ar: "مُداوِم", tr: "Mudāwim", key: "mudawim" },
];
export const bandWord = (band: number) => BANDS[Math.min(BANDS.length, Math.max(1, band)) - 1];

/** points per day counted for the rank (the same cap as the ranking) */
export function cappedTotal(p: Pick<Points, "d">, cap = RANK_DAY_CAP): number {
  let s = 0;
  for (const v of Object.values(p.d ?? {})) s += Math.max(0, Math.min(cap, Number(v) || 0));
  return s;
}

export type Rank = {
  /** level number (1 … ∞) */
  level: number;
  /** 0 while in the eight learning levels, else the appended level index k */
  k: number;
  /** band 1 … ∞ (0 in the learning levels) and the step 1–7 inside it */
  band: number; step: number;
  /** Arabic title and transliteration */
  ar: string; tr: string;
  /** progress to the next level (always a next level) */
  from: number; to: number; pct: number; counted: number;
  /** the stars above level 8 of web/points.ts, unchanged (every 5,000 points) */
  stars: number;
};

export function rankOf(p: Pick<Points, "d">): Rank {
  const raw = Object.values(p.d ?? {}).reduce((a, b) => a + (Number(b) || 0), 0);
  const old = levelOf(raw);
  const c = cappedTotal(p);
  if (old.n < OLD_TOP || c < BASE) {
    // the eight learning levels exactly as before; the next horizon after level 8 is the first appended level
    const to = old.n < OLD_TOP ? old.to : extMin(1);
    const from = old.n < OLD_TOP ? old.from : BASE;
    const v = old.n < OLD_TOP ? raw : c;
    return { level: old.n, k: 0, band: 0, step: 0, ar: old.ar, tr: "", from, to, pct: Math.max(0, Math.min(1, (v - from) / (to - from))), counted: c, stars: old.stars };
  }
  let k = Math.max(0, Math.floor(Math.pow((c - BASE) / RANK_A, 1 / RANK_P)) - 1);
  while (extMin(k + 1) <= c) k++;
  while (k > 0 && extMin(k) > c) k--;
  const band = k === 0 ? 0 : Math.ceil(k / BAND);
  const step = k === 0 ? 0 : ((k - 1) % BAND) + 1;
  const w = k === 0 ? { ar: LEVELS[OLD_TOP - 1].ar, tr: "" } : bandWord(band);
  const from = extMin(k), to = extMin(k + 1);
  return { level: OLD_TOP + k, k, band, step, ar: w.ar, tr: w.tr, from, to, pct: Math.max(0, Math.min(1, (c - from) / (to - from))), counted: c, stars: old.stars };
}
