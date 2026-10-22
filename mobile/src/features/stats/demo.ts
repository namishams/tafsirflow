import type { BoardRow, CareerStats } from "./api";
import { careerOf } from "./career";

// Development-only sample data for screenshot audits of the "Statistik" tab and the global boards when the local
// database has no real profiles. Callers use it only when NODE_ENV is not "production" (web) or under __DEV__ (app; copy of src/lib/careerDemo.ts) and
// an explicit `?demo=` parameter is set; it is never shown to members. Names are clearly fictional.
export function demoStats(mine: boolean): CareerStats {
  const career = careerOf({ xp: 18_450, verses: 742, exams: 9, certificates: 2, courses: 4, qaida: 18, arabic: 12, reciterPath: 6, hifzGrade: 4, bestStreak: 63, minutes: 5_820 });
  const juz = Array.from({ length: 30 }, (_, i) => (i === 29 ? 100 : i === 28 ? 100 : i === 0 ? 100 : i === 27 ? 64 : i === 1 ? 22 : 0));
  return {
    v: 1, username: mine ? "demo.learner" : "demo.reciter", name: mine ? "Demo Learner" : "Demo Reciter", avatar: null, badge: "gold", country: "DE",
    level: "rising", mine, memberSince: "2026-03", optedIn: true,
    sijill: {
      updatedAt: new Date().toISOString(), reactions: 41, moments: 12, received: 37,
      level: { xp: 18_450, level: 24, talentLevel: "rising", stage: "idadi", rank: "talib", overall: 86 },
      badges: { badge: "gold", official: false },
      hifz: { grade: 4, verses: 742, tests: 23, quality: 88 },
      tree: { type: "olive", stage: 7, trees: 2, fruits: 34, name: "", days: 96 },
      stickers: { total: 168, catalog: 420, feed: 31, rare: 22, epic: 9, legendaryN: 3, legendary: [], series: ["ayah", "names"] },
      memorised: { verses: 742, juz, surahs: new Array(114).fill(0), current: 67 },
      time: { totalMin: 5_820, weekMin: 214, streak: 41, best: 63, wird: 38 },
      activity: { xp: 18_450, level: 24, week: [120, 95, 180, 60, 0, 140, 75], active: 6 },
      courses: { done: 4, ids: ["seerah", "aqidah", "akhlaq", "adhkar"], qaida: 18, arabic: 12, rp: 6, arLevels: ["A1", "A2"] },
      exams: [
        { exam: "juz", ref: "30", pct: 96, at: "2026-09-12T10:00:00Z", attempts: 1 },
        { exam: "rp-level", ref: "3", pct: 91, at: "2026-08-02T10:00:00Z", attempts: 2 },
        { exam: "surah", ref: "67", pct: 88, at: "2026-07-20T10:00:00Z", attempts: 1 },
      ],
      certificates: [{ title: "Juz 30", course: "juz-30", pct: 96, url: "#", at: "2026-09-12T10:00:00Z" }],
    },
    career,
    ranks: {
      xp: { rank: 128, total: 4_210, pct: 3.1, country: 9, countryTotal: 380, score: 18_450 },
      xp_week: { rank: 57, total: 2_940, pct: 2, country: 4, countryTotal: 260, score: 670 },
      verses: { rank: 211, total: 3_870, pct: 5.5, country: 14, countryTotal: 341, score: 742 },
      streak: { rank: 96, total: 3_120, pct: 3.1, country: 7, countryTotal: 290, score: 41 },
      exams: { rank: 77, total: 1_480, pct: 5.3, country: 6, countryTotal: 122, score: 9 },
    },
    milestones: [
      { kind: "exam", ref: "juz:30", data: { pct: 96 }, at: "2026-09-12T10:00:00Z" },
      { kind: "juz", ref: "J30", data: { n: 30 }, at: "2026-09-01T10:00:00Z" },
      { kind: "streak", ref: "D30", data: { n: 30 }, at: "2026-08-18T10:00:00Z" },
      { kind: "level", ref: "L20", data: { n: 20 }, at: "2026-07-30T10:00:00Z" },
      { kind: "tree", ref: "olive:5", data: { n: 5 }, at: "2026-06-10T10:00:00Z" },
    ],
    compare: mine ? null : { allowed: true, me: { username: "demo.learner", name: "Demo Learner", avatar: null, badge: "emerald", country: "DE", sijill: { updatedAt: null, reactions: 0, moments: 0, received: 0, memorised: { verses: 310, juz: [], surahs: [], current: null }, time: { totalMin: 2_100, weekMin: 90, streak: 12, best: 30, wird: 9 }, level: { xp: 7_900, level: 15, talentLevel: "talent", stage: "ibtidai", rank: "talib", overall: null }, exams: [{ exam: "juz", ref: "30", pct: 84, at: "", attempts: 1 }] }, career: careerOf({ xp: 7_900, verses: 310, exams: 1, bestStreak: 30, minutes: 2_100 }), ranks: null } },
  };
}

const NAMES: [string, string, string, "gold" | "emerald" | "official" | null][] = [
  ["demo.hafiza", "Demo Hafiza", "EG", "official"], ["demo.qari", "Demo Qari", "TR", "gold"], ["demo.talib", "Demo Talib", "ID", "gold"],
  ["demo.amina", "Demo Amina", "DE", "emerald"], ["demo.yusuf", "Demo Yusuf", "PK", "emerald"], ["demo.maryam", "Demo Maryam", "MY", null],
  ["demo.bilal", "Demo Bilal", "NG", "emerald"], ["demo.huda", "Demo Huda", "SA", null], ["demo.idris", "Demo Idris", "FR", null], ["demo.safiya", "Demo Safiya", "BD", null],
];
export function demoBoard(base = 20_000): BoardRow[] {
  return NAMES.map(([username, name, country, badge], i) => ({ rank: i + 1, username, name, country, badge, level: i < 2 ? "master" : "talent", avatar: null, score: Math.round(base * Math.pow(0.82, i)), streak: 90 - i * 7, me: false }));
}
