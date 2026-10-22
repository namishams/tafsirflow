import { readJSON } from "@/lib/store";
import { TOTAL_VERSES } from "@/web/quranIndex";
import { buildSummary } from "@/features/sijill/summary";
import type { Sijill } from "@/features/sijill/api";
import { COURSES, tx } from "@/features/courses";
import { doneCount, readCP } from "@/features/courses/progress";
import { careerOf } from "./career";
import type { CareerStats } from "./api";

// The own statistics from this device (read only; no stored key is written): the Sijill summary the app already builds
// (features/sijill/summary.ts) shaped like the server's record, for the own profile without a community profile or
// offline, and the extras only this device knows: the Quran read in the khatm plan and the courses begun with their
// lesson progress.

const safe = <T,>(f: () => T, d: T): T => { try { return f(); } catch { return d; } };

/** the device's summary as a full Sijill (every section) and its career tier */
export function localStats(name: string, username: string, pro: boolean): CareerStats {
  const s = buildSummary(pro);
  const sijill: Sijill = {
    updatedAt: null, reactions: 0, moments: 0,
    level: { xp: s.level.xp, level: s.level.level, talentLevel: "talent", stage: s.rank.stage, rank: s.rank.rank, overall: s.rank.overall },
    hifz: s.hifz, tree: s.tree.type ? s.tree : undefined, stickers: s.stickers, memorised: s.memorised, time: s.time,
    activity: { xp: s.level.xp, level: s.level.level, week: s.week.xp, active: s.week.active }, courses: s.courses,
  };
  const career = careerOf({
    xp: s.level.xp, verses: s.memorised.verses, courses: s.courses.done, qaida: s.courses.qaida, arabic: s.courses.arabic, reciterPath: s.courses.rp,
    hifzGrade: s.hifz.grade, bestStreak: s.time.best, minutes: s.time.totalMin,
  });
  return { v: 1, username, name, avatar: null, badge: null, country: null, level: "talent", mine: true, memberSince: null, sijill, career, ranks: null, milestones: [], compare: null };
}

export type StartedCourse = { id: string; title: string; done: number; total: number };
export type OwnExtras = { readPct: number | null; khatms: number; started: StartedCourse[] };
/** what only this device knows: khatm progress and the academy courses begun (with passed lessons) */
export function ownExtras(lang: string): OwnExtras {
  const k = readJSON<{ pos?: number; round?: number; deleted?: boolean } | null>("tf:khatm", null);
  const readPct = k && !k.deleted && typeof k.pos === "number" ? Math.min(100, Math.round((1000 * k.pos) / TOTAL_VERSES) / 10) : null;
  const cp = safe(readCP, { done: {}, complete: {} });
  const started = safe(() => COURSES.map((c) => {
    const ids = c.lessons.map((l) => l.id);
    return { id: c.id, title: tx(c.title, lang), done: doneCount(cp, c.id, ids), total: ids.length };
  }).filter((c) => c.done > 0).sort((a, b) => b.done / b.total - a.done / a.total), [] as StartedCourse[]);
  return { readPct, khatms: Math.max(0, (k?.round ?? 1) - 1), started };
}
