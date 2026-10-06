import { readJSON, writeJSON } from "./storage";
import { readPoints, streakOf, totalPoints } from "./points";
import { readListen, summarize } from "./listen";
import { readSrs } from "./learning";
import { NOT_COUNTED } from "./coach";
import { VERSE_COUNTS } from "./counts";

// Stickers for learning time, from 1 to 10,000 hours: from a seed to a tree (14:24–25), then the light of 24:35,
// the moon, the dawn and finally the sun – "Shams", the name of our method.
export type Tone = "earth" | "leaf" | "gold" | "night" | "dawn" | "sun" | "sea" | "rose";
export type Icon =
  | "seed" | "drop" | "sprout" | "branch" | "tree" | "fruit" | "lamp" | "star" | "crescent" | "moon" | "dawn" | "sun"
  | "ear" | "book" | "flame" | "letters" | "water" | "compass" | "sunrise" | "path" | "open" | "layers" | "heart";
export type StickerDef = { id: string; icon: Icon; tone: Tone; ar: string; ref?: string; verse?: string };
export const HOUR_STICKERS: (StickerDef & { h: number })[] = [
  { id: "h1", h: 1, icon: "seed", tone: "earth", ar: "بذرة", ref: "6:95", verse: "إِنَّ اللَّهَ فَالِقُ الْحَبِّ وَالنَّوَىٰ" },
  { id: "h5", h: 5, icon: "drop", tone: "sea", ar: "قطرة", ref: "2:22", verse: "وَأَنزَلَ مِنَ السَّمَاءِ مَاءً" },
  { id: "h10", h: 10, icon: "sprout", tone: "leaf", ar: "نبتة", ref: "48:29", verse: "كَزَرْعٍ أَخْرَجَ شَطْأَهُ" },
  { id: "h25", h: 25, icon: "branch", tone: "leaf", ar: "غصن", ref: "14:24", verse: "وَفَرْعُهَا فِي السَّمَاءِ" },
  { id: "h50", h: 50, icon: "tree", tone: "leaf", ar: "شجرة", ref: "14:24", verse: "كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ" },
  { id: "h100", h: 100, icon: "fruit", tone: "rose", ar: "ثمرة", ref: "14:25", verse: "تُؤْتِي أُكُلَهَا كُلَّ حِينٍ بِإِذْنِ رَبِّهَا" },
  { id: "h250", h: 250, icon: "lamp", tone: "gold", ar: "مصباح", ref: "24:35", verse: "الْمِصْبَاحُ فِي زُجَاجَةٍ" },
  { id: "h500", h: 500, icon: "star", tone: "gold", ar: "كوكب", ref: "24:35", verse: "كَأَنَّهَا كَوْكَبٌ دُرِّيٌّ" },
  { id: "h1000", h: 1000, icon: "crescent", tone: "night", ar: "هلال", ref: "2:189", verse: "يَسْأَلُونَكَ عَنِ الْأَهِلَّةِ" },
  { id: "h2500", h: 2500, icon: "moon", tone: "night", ar: "بدر", ref: "36:39", verse: "وَالْقَمَرَ قَدَّرْنَاهُ مَنَازِلَ" },
  { id: "h5000", h: 5000, icon: "dawn", tone: "dawn", ar: "فجر", ref: "89:1", verse: "وَالْفَجْرِ" },
  { id: "h10000", h: 10000, icon: "sun", tone: "sun", ar: "شمس", ref: "91:1", verse: "وَالشَّمْسِ وَضُحَاهَا" },
];

// everything the badges look at, read once from the browser
export type Ctx = {
  minutes: number; points: number; listenSec: number; versesHeard: number; surahsHeard: number; fajrSec: number;
  learned: number; fatiha: boolean; fullSurahs: number; streak: number; streakBest: number; sessions: number;
  lessons: number; arabicDone: number; arabicTotal: number; wudu: boolean; reviews: number;
};
// arabicTotal: number of lessons in the Arabic course (passed by pages that load the course anyway)
export function buildCtx(arabicTotal = 0): Ctx {
  const p = readPoints();
  const all = readListen();
  const sum = summarize(all, Math.min(...Object.keys(all).filter((k) => k !== "a").map(Number), 1e9), undefined, true);
  const srs = readSrs();
  const keys = Object.keys(srs).filter((k) => !NOT_COUNTED.has(k));
  const per: Record<number, number> = {};
  for (const k of keys) { const s = Number(k.split(":")[0]); per[s] = (per[s] ?? 0) + 1; }
  const full = Object.entries(per).filter(([s, n]) => n >= VERSE_COUNTS[Number(s) - 1] - (Number(s) === 1 ? 1 : 0)).length;
  const st = streakOf(p.d);
  const w = readJSON<{ done?: boolean } | null>("tf:wudu", null);
  const ar = readJSON<{ done?: Record<string, { best: number }> }>("tf:arabic", {});
  return {
    minutes: Object.values(p.m).reduce((a, b) => a + b, 0), points: totalPoints(p),
    listenSec: sum.seconds, versesHeard: sum.verses, surahsHeard: sum.bySurah.filter((x) => x.verses > 0 || x.seconds > 20).length,
    fajrSec: (sum.byHour[4] ?? 0) + (sum.byHour[5] ?? 0) + (sum.byHour[6] ?? 0),
    learned: keys.length, fatiha: [2, 3, 4, 5, 6, 7].every((v) => srs[`1:${v}`]), fullSurahs: full,
    streak: st.current, streakBest: st.best, sessions: p.c.session ?? 0, lessons: p.c.lesson ?? 0,
    arabicDone: Object.values(ar.done ?? {}).filter((x) => x.best >= 70).length, arabicTotal, wudu: !!w?.done, reviews: p.c.review ?? 0,
  };
}

// achievements beside the hour stickers: [have, goal]
export const BADGES: (StickerDef & { need: (c: Ctx) => [number, number] })[] = [
  { id: "firstVerse", icon: "ear", tone: "sea", ar: "أوّل آية", need: (c) => [c.versesHeard, 1] },
  { id: "fatiha", icon: "open", tone: "gold", ar: "الفاتحة", need: (c) => [c.fatiha ? 1 : 0, 1] },
  { id: "firstSurah", icon: "book", tone: "leaf", ar: "أوّل سورة", need: (c) => [c.fullSurahs, 1] },
  { id: "tenSurahs", icon: "layers", tone: "leaf", ar: "عشر سور", need: (c) => [c.fullSurahs, 10] },
  { id: "learned100", icon: "path", tone: "earth", ar: "مئة آية", need: (c) => [c.learned, 100] },
  { id: "learned1000", icon: "path", tone: "gold", ar: "ألف آية", need: (c) => [c.learned, 1000] },
  { id: "streak7", icon: "flame", tone: "rose", ar: "أسبوع", need: (c) => [c.streakBest, 7] },
  { id: "streak30", icon: "flame", tone: "dawn", ar: "شهر", need: (c) => [c.streakBest, 30] },
  { id: "streak100", icon: "flame", tone: "sun", ar: "مئة يوم", need: (c) => [c.streakBest, 100] },
  { id: "session1", icon: "compass", tone: "sea", ar: "أوّل جلسة", need: (c) => [c.sessions, 1] },
  { id: "session30", icon: "compass", tone: "night", ar: "ثلاثون جلسة", need: (c) => [c.sessions, 30] },
  { id: "arabic1", icon: "letters", tone: "earth", ar: "أوّل درس", need: (c) => [c.arabicDone, 1] },
  { id: "arabicAll", icon: "letters", tone: "gold", ar: "قارئ العربية", need: (c) => [c.arabicDone, c.arabicTotal || Infinity] },
  { id: "wudu", icon: "water", tone: "sea", ar: "الوضوء", need: (c) => [c.wudu ? 1 : 0, 1] },
  { id: "explorer30", icon: "compass", tone: "leaf", ar: "رحّالة", need: (c) => [c.surahsHeard, 30] },
  { id: "explorer114", icon: "heart", tone: "sun", ar: "كل السور", need: (c) => [c.surahsHeard, 114] },
  { id: "fajr", icon: "sunrise", tone: "dawn", ar: "صوت الفجر", need: (c) => [Math.floor(c.fajrSec / 60), 60] },
];

export const hoursOf = (c: Ctx) => c.minutes / 60;
export function earnedIds(c: Ctx): string[] {
  const h = hoursOf(c);
  return [...HOUR_STICKERS.filter((s) => h >= s.h).map((s) => s.id), ...BADGES.filter((b) => { const [have, goal] = b.need(c); return have >= goal; }).map((b) => b.id)];
}
export const nextHourSticker = (c: Ctx) => HOUR_STICKERS.find((s) => hoursOf(c) < s.h) ?? null;
export const stickerById = (id: string): StickerDef | undefined => HOUR_STICKERS.find((s) => s.id === id) ?? BADGES.find((b) => b.id === id);

// which stickers the learner has already been shown (so a new one is celebrated once)
const SEEN = "tf:stickers";
export const readSeen = () => readJSON<string[]>(SEEN, []);
export const markSeen = (ids: string[]) => writeJSON(SEEN, Array.from(new Set([...readSeen(), ...ids])), true);
