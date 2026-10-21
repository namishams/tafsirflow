// mirrors mobile/src/features/journey/stats.ts (copied for the website; keep in step with the app)
import { readJSON } from "@/lib/learn/store";
import { readPoints } from "@/lib/points";
import { GAMIFY_KEY, type Gamify } from "@/lib/learn/feed/gamify";
import { statsNow } from "@/lib/learn/feed/statsStore";
import { SERIES as CAT_SERIES, SERIES_SIZE, seriesOwned, totalOwned, visibleSeasonal } from "@/lib/learn/garden/catalog";
import { COURSES, tx } from "@/lib/learn/courses";
import { readCP } from "@/lib/learn/courses/progress";
import { LEVELS as RP_LEVELS } from "@/lib/learn/reciter-path/curriculum";
import { LEVELS as AR_LEVELS } from "@/lib/learn/arabic-lang/curriculum";
import { readProgress as readLang } from "@/lib/learn/arabic-lang/progress";
import { TOTAL_VERSES } from "@/lib/quranIndex";
import type { Metrics } from "./metrics";
import { activeDaysByHijri, MYTHIC } from "./stickers";
import { readJourney } from "./store";
import type { JKey } from "./texts";

// The statistics framework of the long path. Every statistic is a small provider in one registry:
//  - "total":   a lifetime counter that only rises (it never shows a last value),
//  - "best":    a personal record that can always be beaten (best day, best week, best Hijri year, longest streak),
//  - "bounded": a bounded sub-goal (one course, one series, one level) shown in percent; when it is reached the row
//               shows its next horizon instead of a final 100 %.
// Providers for courses, sticker series and levels are generated from the existing registries (COURSES, the
// catalogue SERIES, the Reciter Path and Arabic LEVELS), so new content appears here without any change elsewhere.
// Other modules can add their own with registerStat() (ids are unique; a later registration replaces the earlier one).
// Day-keyed providers also answer for a range of days (perDays), which the year in review uses.

export type StatKind = "total" | "best" | "bounded";
export type StatGroup = "time" | "quran" | "knowledge" | "hadith" | "arabic" | "collection" | "records";
type Jt = (k: JKey, v?: Record<string, string | number>) => string;
export type StatCtx = { M: Metrics; lang: string; jt: Jt };
export type StatDef = {
  id: string; group: StatGroup; kind: StatKind;
  /** the row's name (a text key of the journey, or the provider's own name in the reader's language) */
  label: (c: StatCtx) => string;
  value: (c: StatCtx) => number;
  /** bounded: the size of the sub-goal */
  of?: (c: StatCtx) => number;
  /** bounded: what comes after the sub-goal is reached */
  next?: (c: StatCtx) => string;
  /** the value inside a range of day numbers (UTC days, as in tf:points), for the year in review */
  perDays?: (from: number, to: number) => number;
  unit?: "min" | "days" | "pts";
  order?: number;
};
const REG = new Map<string, StatDef>();
export function registerStat(d: StatDef) { REG.set(d.id, d); }
export function registerStats(list: StatDef[]) { for (const d of list) registerStat(d); }
/** all providers, the generated ones (from the current registries) first in their group */
export function allStats(): StatDef[] { return [...generated(), ...REG.values()].sort((a, b) => (a.order ?? 50) - (b.order ?? 50)); }

const sumDays = (rec: Record<string, number>, from: number, to: number) => { let s = 0; for (const [k, v] of Object.entries(rec)) { const d = Number(k); if (d >= from && d <= to) s += Number(v) || 0; } return s; };
const bestRun = (days: number[]) => { let best = 0, run = 0, prev = -2; for (const d of days.sort((a, b) => a - b)) { run = d === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; } return best; };
const activeIn = (from: number, to: number) => Object.entries(readPoints().d).filter(([k, v]) => v > 0 && Number(k) >= from && Number(k) <= to).map(([k]) => Number(k));
const label = (k: JKey, v?: Record<string, string | number>) => (c: StatCtx) => c.jt(k, v);

// ---------- built-in providers ----------
registerStats([
  // time
  { id: "points", group: "time", kind: "total", order: 1, unit: "pts", label: label("st_points"), value: ({ M }) => M.points, perDays: (a, b) => sumDays(readPoints().d, a, b) },
  { id: "activeDays", group: "time", kind: "total", order: 2, unit: "days", label: label("st_activeDays"), value: ({ M }) => M.activeDays, perDays: (a, b) => activeIn(a, b).length },
  { id: "minutes", group: "time", kind: "total", order: 3, unit: "min", label: label("st_minutes"), value: () => Object.values(readPoints().m).reduce((a, b) => a + b, 0), perDays: (a, b) => sumDays(readPoints().m, a, b) },
  { id: "feedVerses", group: "time", kind: "total", order: 4, label: label("st_feedVerses"), value: () => statsNow().total.verses },
  // records that can always be beaten
  { id: "bestStreak", group: "records", kind: "best", order: 1, unit: "days", label: label("st_bestStreak"), value: ({ M }) => M.streakBest, perDays: (a, b) => bestRun(activeIn(a, b)) },
  { id: "bestDay", group: "records", kind: "best", order: 2, unit: "pts", label: label("st_bestDay"), value: () => Math.max(0, ...Object.values(readPoints().d)), perDays: (a, b) => Math.max(0, ...Object.entries(readPoints().d).filter(([k]) => Number(k) >= a && Number(k) <= b).map(([, v]) => v)) },
  { id: "bestWeek", group: "records", kind: "best", order: 3, unit: "pts", label: label("st_bestWeek"), value: () => { const d = readPoints().d; let best = 0; for (const k of Object.keys(d)) { const x = Number(k); best = Math.max(best, sumDays(d, x - 6, x)); } return best; } },
  { id: "bestYear", group: "records", kind: "best", order: 4, unit: "days", label: label("st_bestYear"), value: () => Math.max(0, ...activeDaysByHijri().values()) },
  // Quran
  { id: "verses", group: "quran", kind: "total", order: 1, label: label("st_verses"), value: ({ M }) => M.verses },
  { id: "juzFull", group: "quran", kind: "bounded", order: 2, label: label("st_juzFull"), value: ({ M }) => M.juzFull, of: () => 30, next: label("nx_juz") },
  { id: "itqan", group: "quran", kind: "bounded", order: 3, label: label("st_itqan"), value: ({ M }) => M.itqan95, of: () => 30, next: label("nx_itqan") },
  { id: "khatms", group: "quran", kind: "total", order: 4, label: label("st_khatms"), value: ({ M }) => M.khatms },
  { id: "khatmVerses", group: "quran", kind: "total", order: 5, label: label("st_khatmVerses"), value: () => readJourney().e.khatm.units },
  { id: "reviewCycles", group: "quran", kind: "total", order: 6, label: label("st_reviewCycles"), value: () => readJourney().e.review.cycles },
  { id: "reviewVerses", group: "quran", kind: "total", order: 7, label: label("st_reviewVerses"), value: () => readJourney().e.review.units },
  { id: "mutRounds", group: "quran", kind: "total", order: 8, label: label("st_mutRounds"), value: () => readJourney().e.mut.cycles },
  // knowledge
  { id: "tafsirVerses", group: "knowledge", kind: "total", order: 1, label: label("st_tafsirVerses"), value: () => readJourney().e.tafsir.units },
  { id: "tafsirPass", group: "knowledge", kind: "bounded", order: 2, label: ({ jt }) => jt("st_tafsirPass", { n: readJourney().e.tafsir.cycles + 1 }), value: () => readJourney().e.tafsir.pos, of: () => TOTAL_VERSES, next: label("nx_tafsir") },
  // hadith
  { id: "hadithRead", group: "hadith", kind: "total", order: 1, label: label("st_hadithRead"), value: () => readJourney().e.hadith.units },
  // Arabic
  { id: "lemmas", group: "arabic", kind: "total", order: 1, label: label("st_lemmas"), value: () => readJourney().e.lemma.units },
  { id: "lemmaCycles", group: "arabic", kind: "total", order: 2, label: label("st_lemmaCycles"), value: () => readJourney().e.lemma.cycles },
  // collection
  { id: "pathStickers", group: "collection", kind: "total", order: 1, label: label("st_pathStickers"), value: () => Object.keys(readJourney().stickers).length },
  { id: "feedStickers", group: "collection", kind: "total", order: 2, label: label("st_feedStickers"), value: () => Object.keys(readJSON<Partial<Gamify>>(GAMIFY_KEY, {}).stickers ?? {}).length },
  { id: "catalogStickers", group: "collection", kind: "total", order: 3, label: label("st_catalogStickers"), value: () => { try { return totalOwned(); } catch { return 0; } } },
  { id: "mythic", group: "collection", kind: "bounded", order: 4, label: label("st_mythic"), value: () => MYTHIC.filter((x) => readJourney().stickers[x.id]).length, of: () => MYTHIC.length, next: label("nx_mythic") },
  { id: "masha", group: "collection", kind: "total", order: 5, label: label("st_masha"), value: ({ M }) => M.masha },
]);

/** providers generated from the content registries: every course, sticker series, Reciter Path and Arabic level */
function generated(): StatDef[] {
  const out: StatDef[] = [];
  for (const c of COURSES) out.push({
    id: `course:${c.id}`, group: "knowledge", kind: "bounded", order: 20, label: ({ lang }) => tx(c.title, lang),
    value: () => { const p = readCP(); return c.lessons.filter((l) => (p.done[`${c.id}/${l.id}`]?.score ?? 0) >= 0.7).length; }, of: () => c.lessons.length, next: label("nx_course"),
  });
  out.push({ id: "rp", group: "quran", kind: "bounded", order: 20, label: label("st_rp"), value: () => { const r = readJSON<{ certs?: Record<string, string> }>("qmc.reciterPath", {}); return RP_LEVELS.filter((l) => r.certs?.[l.n]).length; }, of: () => RP_LEVELS.length, next: label("nx_rp") });
  out.push({ id: "arLevels", group: "arabic", kind: "bounded", order: 20, label: label("st_arLevels"), value: () => { const p = readLang(); return AR_LEVELS.filter((l) => p.certs?.[l.level]).length; }, of: () => AR_LEVELS.length, next: label("nx_arabic") });
  for (const se of CAT_SERIES) out.push({
    id: `series:${se}`, group: "collection", kind: "bounded", order: 20, label: ({ jt }) => jt("st_series", { s: jt(`ser_${se}` as JKey) }),
    value: () => { try { return seriesOwned(se); } catch { return 0; } }, of: ({ M }) => (se === "seasonal" ? visibleSeasonal(M.shia).length : SERIES_SIZE[se]), next: label("nx_series"),
  });
  return out;
}

export const GROUPS: StatGroup[] = ["time", "records", "quran", "knowledge", "hadith", "arabic", "collection"];
