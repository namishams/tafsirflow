import { useMemo } from "react";
import { useLang } from "@/i18n";
import { usePro } from "@/lib/pro";
import { buildSummary } from "@/features/sijill/summary";
import { useShams2 } from "@/features/shams2/model";
import { DIMS, type Dim } from "@/features/shams2/mastery";
import { ownExtras } from "@/features/stats/local";
import { careerOf } from "@/features/stats/career";

// The learner's own figures for the tutor, read from this device only (Sijill summary, Shams mastery and today's wird,
// academy and khatm progress). The tutor's greeting card shows them as they are; with a question they go to the
// server as the only figures the tutor may use about the learner (no names, no ids). Nothing is invented: a figure the
// device does not know is left out.

export type Progress = {
  streak?: number; bestStreak?: number; learnedToday?: boolean; minutesToday?: number;
  versesMemorised?: number; currentSurah?: string; weekActiveDays?: number; weekXp?: number; level?: number; tier?: string;
  overallPct?: number; weakestDim?: Dim; weakestPct?: number; todayNew?: number; todayReview?: number; testsDue?: number; nextStep?: string;
  coursesStarted?: number; courseNext?: string; courseDone?: number; courseTotal?: number; khatmPct?: number; milestone?: string;
};

const safe = <T,>(f: () => T, d: T): T => { try { return f(); } catch { return d; } };
const MILESTONES = [1, 7, 10, 25, 50, 100, 200, 300, 500, 1000, 2000, 3000, 4000, 5000, 6000, 6236];

export function useTutorProgress(): Progress | null {
  const { pro } = usePro();
  const { lang } = useLang();
  const m = useShams2();
  return useMemo(() => safe(() => {
    const s = buildSummary(pro);
    const ex = ownExtras(lang);
    const p: Progress = {};
    p.streak = s.time.streak;
    p.bestStreak = s.time.best;
    p.versesMemorised = s.memorised.verses;
    p.weekActiveDays = s.week.active;
    p.weekXp = s.week.xp.reduce((a, b) => a + b, 0);
    p.level = s.level.level;
    p.tier = safe(() => careerOf({ xp: s.level.xp, verses: s.memorised.verses, courses: s.courses.done, qaida: s.courses.qaida, arabic: s.courses.arabic, reciterPath: s.courses.rp, hifzGrade: s.hifz.grade, bestStreak: s.time.best, minutes: s.time.totalMin }).tier, undefined as unknown as string);
    if (s.memorised.current) p.currentSurah = `Surah ${s.memorised.current}`;
    if (typeof m.todayMin === "number") { p.minutesToday = m.todayMin; p.learnedToday = m.todayMin > 0; }
    p.todayNew = m.wird.sabaq.verses;
    p.todayReview = m.wird.sabqi.verses + m.wird.manzil.verses;
    p.testsDue = (m.due.weekly ? 1 : 0) + (m.due.monthly ? 1 : 0);
    if (m.known.size >= 3) {
      const mm = m.mastery();
      if (mm.overall.dims) {
        let worst: { d: Dim; pct: number } | null = null;
        for (const d of DIMS) { const a = mm.overall.dims[d]; if (a?.pct === null || a?.pct === undefined || a.n < 3) continue; if (!worst || a.pct < worst.pct) worst = { d, pct: a.pct }; }
        if (worst) { p.weakestDim = worst.d; p.weakestPct = Math.round(worst.pct); }
      }
    }
    if (m.wird.tathbit.items.length) p.nextStep = "tathbit (consolidate weak spots)";
    else if (m.wird.sabaq.verses) p.nextStep = "sabaq (new verses)";
    p.coursesStarted = ex.started.length;
    const c = ex.started.find((x) => x.done < x.total);
    if (c) { p.courseNext = c.title; p.courseDone = c.done; p.courseTotal = c.total; }
    if (ex.readPct !== null) p.khatmPct = Math.round(ex.readPct);
    const hit = [...MILESTONES].reverse().find((n) => s.memorised.verses >= n);
    if (hit && s.memorised.verses - hit < 3) p.milestone = `${hit} verses memorised`;
    return p;
  }, null), [pro, lang, m]);
}
