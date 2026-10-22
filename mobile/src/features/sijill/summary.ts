import { readShamsMode } from "@/features/shams2/mode";
import { readFlex } from "@/features/shams2/store2";
import { readJSON, writeJSON } from "@/lib/store";
import { readSrs, today } from "@/web/learning";
import { VERSE_COUNTS } from "@/web/counts";
import { JUZ_START, TOTAL_VERSES, indexOf } from "@/web/quranIndex";
import { GAMIFY_KEY, levelOf, mondayOf, type Gamify } from "@/features/feed/gamify";
import { dayNum, longestStreak, statsNow, streakOf } from "@/features/feed/statsStore";
import { activeTree, readGarden, treeStage } from "@/features/garden/garden";
import { CATALOG_KEY, CATALOG_SIZE, SERIES, SERIES_SIZE, rarityOf, seriesOwned, totalOwned } from "@/features/garden/catalog";
import { readSrsState } from "@/features/srs/store";
import { knownVerses } from "@/features/shams2/qualityModel";
import { readGrade } from "@/features/shams2/grades";
import { readLog, readSettings, wirdStreak } from "@/features/shams2/store";
import { readCP } from "@/features/courses/progress";
import { readQaida } from "@/features/qaida/progress";
import { PASS as QAIDA_PASS } from "@/features/qaida/curriculum";
import { readProgress as readLang } from "@/features/arabic-lang/progress";
import { PASS as LANG_PASS } from "@/features/arabic-lang/curriculum";
import { currentStage, overallGrade, stageState, subjectGrades } from "@/features/school/model";
import { getToken } from "@/lib/storage";
import { sijillApi, type Summary } from "./api";
import { collectReceived } from "./received";

// The Sijill summary: a compact record of aggregates computed on this device from the existing learning stores
// (feed gamification and stats, garden and sticker catalogue, memorised verses, Darajat al-Hifz, courses, reading and
// Arabic courses, madrasa stage). Only numbers and ids leave the device, never answers, notes or verse lists; the
// server validates and caps them (src/lib/sijill.ts). Certificates and exams are taken from the server, not from here.

const pct = (n: number, of: number) => (of > 0 ? (n >= of ? 100 : Math.floor((100 * n) / of)) : 0);
const safe = <T,>(f: () => T, d: T): T => { try { return f(); } catch { return d; } };

export function buildSummary(pro: boolean): Summary {
  // levels, XP and the week (feed gamification + stats, both local)
  const gm = readJSON<Partial<Gamify>>(GAMIFY_KEY, {});
  const xp = Math.max(0, Math.floor(gm.xp ?? 0));
  const st = statsNow();
  const now = dayNum();
  const mon = mondayOf(now);
  const learnDays = readJSON<Record<string, number>>("tf:days", {});
  const weekXp: number[] = [];
  let active = 0, weekMs = 0;
  for (let d = mon; d < mon + 7; d++) {
    const x = st.days[String(d)];
    weekXp.push(Math.max(0, Math.floor(x?.xp ?? 0)));
    weekMs += (x?.ms ?? 0) + (x?.listen ?? 0);
    if (d <= now && ((x && (x.ms > 0 || x.verses > 0 || (x.xp ?? 0) > 0)) || Number(learnDays[String(d)] ?? 0) > 0)) active++;
  }

  // memorised verses (union of the reader's reviews and the verse cards), per juz and surah
  const known = safe(() => knownVerses(readSrs(), readSrsState(), today()), new Map());
  const perSurah = new Array(114).fill(0) as number[];
  const juzStart = JUZ_START.map((k) => { const [s, v] = k.split(":").map(Number); return indexOf(s, v); });
  const perJuz = new Array(30).fill(0) as number[];
  let current: number | null = null, currentFirst = -1;
  for (const k of known.values()) {
    const s = Number(k.key.split(":")[0]);
    perSurah[s - 1]++;
    let j = 29; while (j > 0 && juzStart[j] > k.i) j--;
    perJuz[j]++;
    const first = k.first ?? 0;
    if (first > currentFirst) { currentFirst = first; current = s; }
  }
  const juzSize = juzStart.map((x, i) => (i < 29 ? juzStart[i + 1] : TOTAL_VERSES) - x);
  // al-Fātiḥa 1:1 is not counted as memorised (coach NOT_COUNTED)
  const surahSize = VERSE_COUNTS.map((n, i) => (i === 0 ? n - 1 : n));
  juzSize[0] -= 1;

  // garden tree and sticker catalogue
  const g = readGarden();
  const tree = activeTree(g, pro);
  const cat = readJSON<{ c?: Record<string, number> }>(CATALOG_KEY, {});
  const owned = Object.entries(cat.c ?? {}).filter(([, n]) => n > 0).map(([id]) => id);
  const rar = { rare: 0, epic: 0, legendary: 0 };
  const legendary: string[] = [];
  for (const id of owned) {
    const r = rarityOf(id);
    if (r === "rare") rar.rare++; else if (r === "epic") rar.epic++; else if (r === "legendary") { rar.legendary++; legendary.push(id); }
  }
  const series = safe(() => SERIES.filter((se) => seriesOwned(se) >= SERIES_SIZE[se]), []);

  // Darajat al-Hifz (Shams 2.0), madrasa stage, courses
  const gr = readGrade();
  const cp = readCP();
  const qaida = Object.values(readQaida().done).filter((x) => (x?.best ?? 0) >= QAIDA_PASS).length;
  const lang = readLang();
  const arabic = Object.values(lang.done).filter((x) => (x?.score ?? 0) >= LANG_PASS).length;
  const rp = readJSON<{ units?: Record<string, number> }>("qmc.reciterPath", {});
  const rpUnits = Object.values(rp.units ?? {}).filter((x) => x >= 0.8).length;
  const stage = safe(() => currentStage(), "ibtidai" as const);
  const overall = safe(() => overallGrade(subjectGrades(stage)), null);
  const adv = safe(() => stageState("ibtidai").complete, false);
  const courseIds = Object.keys(cp.complete ?? {});
  const minutes = safe(() => readSettings().minutes, 0);
  const focus = known.size > 0 ? "hifz" : arabic > qaida && arabic > 0 ? "arabic" : courseIds.length > 0 ? "knowledge" : "reading";

  return {
    v: 1,
    level: { xp, level: levelOf(xp).level },
    rank: { stage, rank: adv ? "mutaqaddim" : "talib", overall: overall === null ? null : Math.round(overall * 100) },
    hifz: { grade: gr.grade || 1, verses: known.size, tests: (gr.tests ?? []).filter((x) => x.pass).length, quality: null },
    tree: tree ? { type: tree.type, stage: treeStage(tree, pro), trees: g.trees.length, fruits: g.trees.reduce((a, x) => a + (x.harvested ?? 0), 0), name: (tree.name ?? "").slice(0, 30), days: Math.max(0, now - (tree.planted ?? now)) }
      : { type: "", stage: 0, trees: 0, fruits: 0, name: "", days: 0 },
    stickers: {
      total: safe(() => totalOwned(), owned.length), catalog: CATALOG_SIZE, feed: Object.keys(gm.stickers ?? {}).length,
      rare: rar.rare, epic: rar.epic, legendaryN: rar.legendary, legendary: legendary.slice(-6), series,
    },
    memorised: { verses: known.size, juz: perJuz.map((n, i) => pct(n, juzSize[i])), surahs: perSurah.map((n, i) => pct(n, surahSize[i])), current },
    time: {
      totalMin: Math.floor(((st.total.ms ?? 0) + (st.total.listen ?? 0)) / 60000), weekMin: Math.floor(weekMs / 60000),
      streak: streakOf(st), best: longestStreak(st), wird: safe(() => wirdStreak(readLog()), 0),
    },
    week: { monday: mon, xp: weekXp, active },
    courses: { done: courseIds.length, ids: courseIds.slice(0, 40), qaida, arabic, rp: rpUnits, arLevels: Object.keys(lang.certs ?? {}) },
    goal: { minutes: Math.max(0, Math.min(600, Math.floor(minutes || 0))), focus },
    method: shamsMethod(),
  };
}

/** the Shams method in use for the profile badge: 2.0 (madrasa system), else the classic path, which is Shams 3.0 for
 *  learners on the short tafsir (the 3.0 default) and "classic" for those who kept the detailed tafsir from before 3.0 */
function shamsMethod(): "classic" | "v2" | "v3" {
  try {
    if (readShamsMode() === "v2") return "v2";
    return readFlex().tafsir === "full" ? "classic" : "v3";
  } catch { return "classic"; }
}

// ---------- sending ----------
const LAST_KEY = "qmc.sijill.sent";
let inflight: Promise<boolean> | null = null;
/** sends the summary when it changed (at most every 15 minutes unless forced); false when nothing was sent */
export function syncSijill(pro: boolean, force = false): Promise<boolean> {
  if (inflight) return inflight;
  void collectReceived(); // encouragements received since last time (throttled inside)
  inflight = (async () => {
    try {
      if (!(await getToken())) return false; // signed out: nothing to send (the server would answer 401)
      const s = buildSummary(pro);
      const body = JSON.stringify(s);
      const last = readJSON<{ at: number; body: string }>(LAST_KEY, { at: 0, body: "" });
      if (!force && (last.body === body || Date.now() - last.at < 15 * 60_000)) return false;
      await sijillApi.sync({ summary: s });
      writeJSON(LAST_KEY, { at: Date.now(), body });
      return true;
    } catch { return false; } finally { setTimeout(() => { inflight = null; }, 0); }
  })();
  return inflight;
}
