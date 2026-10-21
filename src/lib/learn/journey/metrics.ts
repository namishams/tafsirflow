// mirrors mobile/src/features/journey/metrics.ts (copied for the website; keep in step with the app)
import { readJSON } from "@/lib/learn/store";
import { readPoints, streakOf as pointsStreak, totalPoints } from "@/lib/points";
import { readSrs, today } from "@/lib/learning";
import { JUZ_START, TOTAL_VERSES, indexOf } from "@/lib/quranIndex";
import { GAMIFY_KEY, STICKERS, type Gamify } from "@/lib/learn/feed/gamify";
import { longestStreak, statsNow } from "@/lib/learn/feed/statsStore";
import { MAX_STAGE, readGarden, treeStage } from "@/lib/learn/garden/garden";
import { SERIES, SERIES_SIZE, seriesOwned, visibleSeasonal } from "@/lib/learn/garden/catalog";
import { readSrsState } from "@/lib/learn/srs/store";
import { knownVerses, qualityModel } from "@/lib/learn/shams2/qualityModel";
import { readChecks, readMut, readWords } from "@/lib/learn/shams2/store";
import { readCP } from "@/lib/learn/courses/progress";
import { COURSES } from "@/lib/learn/courses";
import { LEVELS as RP_LEVELS } from "@/lib/learn/reciter-path/curriculum";
import { LEVELS as AR_LEVELS } from "@/lib/learn/arabic-lang/curriculum";
import { readProgress as readLang } from "@/lib/learn/arabic-lang/progress";
import { CURRICULUM, STAGES, stageState, stateOf, type StageId } from "@/lib/learn/school/model";
import { readTradition, showsShia, type TraditionChoice } from "@/lib/learn/tradition";
import { rankOf, type Rank } from "./rank";
import { readJourney, type Journey } from "./store";

// Everything the long path looks at, read once from the existing stores (nothing is copied or changed there).
// The same sources as the Sijill summary (features/sijill/summary.ts) plus the journey's own plans.
export type Metrics = {
  rank: Rank; points: number;
  /** memorised verses, juz fully memorised, per-juz percent, juz fully memorised with quality ≥ 90 / ≥ 95 */
  verses: number; juzFull: number; juzPct: number[]; itqan90: number; itqan95: number;
  /** best streak of learning days (points days) and of the feed; active learning days in total */
  streakBest: number; streakNow: number; activeDays: number;
  /** the reciter path: levels with certificate */
  rpCerts: number;
  /** Arabic levels with certificate (A1 … C1) */
  arCerts: number;
  coursesDone: number; coursesTotal: number;
  /** madrasa stage progress 0..1 per stage */
  stage: Record<StageId, number>;
  /** school course progress by id (0..1) */
  course: (id: string) => number;
  nahj: boolean;
  /** the garden: highest stage reached by any tree */
  treeStage: number;
  /** journey plans */
  j: Journey; khatms: number;
  /** encouragements received */
  masha: number;
  /** all feed stickers and all catalogue series complete */
  feedAll: boolean; seriesAll: boolean;
  shia: boolean;
};

/** mirrors showsNahj() of mobile/src/lib/tradition.ts (the website has no Nahj opt-in switch; the app's stored opt-in is read) */
const showsNahj = (t: TraditionChoice | null) => t === "shia" || readJSON<boolean>("qmc.nahjOptIn", false);

const safe = <T,>(f: () => T, d: T): T => { try { return f(); } catch { return d; } };

export function readMetrics(): Metrics {
  const p = readPoints();
  const j = readJourney();
  const trad = readTradition();

  // memorised verses per juz, and their quality (Shams 2.0 model)
  const known = safe(() => knownVerses(readSrs(), readSrsState(), today()), new Map());
  const juzStart = JUZ_START.map((k) => { const [s, v] = k.split(":").map(Number); return indexOf(s, v); });
  const juzSize = juzStart.map((x, i) => (i < 29 ? juzStart[i + 1] : TOTAL_VERSES) - x);
  juzSize[0] -= 1; // al-Fātiḥa 1:1 is not counted (coach NOT_COUNTED)
  const perJuz = new Array(30).fill(0) as number[];
  for (const k of known.values()) { let jz = 29; while (jz > 0 && juzStart[jz] > k.i) jz--; perJuz[jz]++; }
  const juzPct = perJuz.map((n, i) => (juzSize[i] > 0 ? Math.min(1, n / juzSize[i]) : 0));
  const q = safe(() => qualityModel(known, { words: readWords(), checks: readChecks(), mut: readMut() }), null);
  const full = (i: number) => juzPct[i] >= 0.999;
  const itq = (min: number) => (q ? q.juz.filter((c, i) => full(i) && (c.score ?? 0) >= min).length : 0);

  const st = pointsStreak(p.d);
  const feed = safe(() => statsNow(), null);
  const activeDays = new Set(Object.entries(p.d).filter(([, v]) => v > 0).map(([d]) => d)).size;

  const rp = readJSON<{ certs?: Record<string, string> }>("qmc.reciterPath", {});
  const lang = readLang();
  const cp = readCP();
  const gm = readJSON<Partial<Gamify>>(GAMIFY_KEY, {});
  const g = safe(() => readGarden(), null);
  const shia = showsShia(trad);

  const cache = new Map<string, number>();
  const course = (id: string) => {
    if (!cache.has(id)) { const c = CURRICULUM.find((x) => x.id === id); cache.set(id, c ? safe(() => Math.min(1, stateOf(c).done), 0) : 0); }
    return cache.get(id)!;
  };
  const stage = Object.fromEntries(STAGES.map((s) => [s.id, safe(() => { const x = stageState(s.id); return x.complete ? 1 : Math.min(0.999, x.done); }, 0)])) as Record<StageId, number>;

  // the reading khatm: the journey's own cycles, or the khatm planner (tf:khatm), whichever is further
  const kh = readJSON<{ pos?: number; round?: number; deleted?: boolean } | null>("tf:khatm", null);
  const planner = kh && !kh.deleted ? Math.max(0, (kh.round ?? 1) - ((kh.pos ?? 0) >= TOTAL_VERSES ? 0 : 1)) : 0;

  const seriesAll = safe(() => SERIES.every((se) => seriesOwned(se) >= (se === "seasonal" ? visibleSeasonal(shia).length : SERIES_SIZE[se])), false);
  const feedAll = STICKERS.every((x) => (gm.stickers ?? {})[x.id]);

  return {
    rank: rankOf(p), points: totalPoints(p),
    verses: known.size, juzFull: juzPct.filter((_, i) => full(i)).length, juzPct, itqan90: itq(90), itqan95: itq(95),
    streakBest: Math.max(st.best, feed ? longestStreak(feed) : 0), streakNow: st.current, activeDays,
    rpCerts: RP_LEVELS.filter((l) => rp.certs?.[l.n]).length,
    arCerts: AR_LEVELS.filter((l) => lang.certs?.[l.level]).length,
    coursesDone: COURSES.filter((c) => cp.complete?.[c.id]).length, coursesTotal: COURSES.length,
    stage, course, nahj: showsNahj(trad),
    treeStage: g ? Math.max(0, ...g.trees.map((t) => safe(() => treeStage(t, true), 0))) : 0,
    j, khatms: Math.max(j.e.khatm.cycles, planner),
    masha: Math.max(0, gm.recv ?? 0),
    feedAll, seriesAll, shia,
  };
}
export const TREE_TOP = MAX_STAGE;
