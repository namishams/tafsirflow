// Career tiers of the progress profile (owner request 22.10.2026, "Statistik" tab): a derived, additive layer on top of
// the frozen scores (BLUEPRINT §8). Nothing here changes XP, levels, streaks, Darajat al-Hifz, exam pass marks or
// certificate rules; it only reads them and adds a coarse tier (Bronze → Grandmaster) for the career card.
//
// The same file lives in the app as mobile/src/features/stats/career.ts; keep both identical (pure TypeScript, no imports).
// The formula is versioned (CAREER_VERSION). A new version must never put a member into a lower tier than before.
//
// Spirit (owner): encouragement to compete in good deeds, never arrogance. Tiers are earned only by learning (XP,
// memorised verses, passed exams, certificates, courses, consistency); nothing can be bought, there are no random rewards.

export const CAREER_VERSION = "career-v1";

export const TIERS = ["bronze", "silver", "gold", "platinum", "diamond", "master", "grandmaster"] as const;
export type TierId = (typeof TIERS)[number];
/** the career score a tier starts at */
export const TIER_AT: Record<TierId, number> = {
  bronze: 0, silver: 3_000, gold: 12_000, platinum: 40_000, diamond: 100_000, master: 250_000, grandmaster: 600_000,
};
/** emblem colours per tier (metal, light edge, deep shade); emerald and gold stay the ground of every card */
export const TIER_COLORS: Record<TierId, { metal: string; light: string; deep: string }> = {
  bronze: { metal: "#B07A4A", light: "#E2B48A", deep: "#5E3A1E" },
  silver: { metal: "#A9B4BC", light: "#EEF2F4", deep: "#56626B" },
  gold: { metal: "#D6B46C", light: "#F4E3B4", deep: "#7A5A1E" },
  platinum: { metal: "#8FC9BE", light: "#E2F5F1", deep: "#2F6B61" },
  diamond: { metal: "#7FB7E8", light: "#E4F2FF", deep: "#24527E" },
  master: { metal: "#1FA37A", light: "#A8F0D4", deep: "#06402F" },
  grandmaster: { metal: "#E2C77F", light: "#FFF6DA", deep: "#0B5A43" },
};
/** points of the star in the emblem: more points, the higher the tier (a geometric rosette, no figures) */
export const TIER_POINTS: Record<TierId, number> = { bronze: 6, silver: 8, gold: 8, platinum: 10, diamond: 12, master: 12, grandmaster: 16 };

export type CareerInput = {
  xp: number; verses: number; exams: number; certificates: number; courses: number;
  qaida: number; arabic: number; reciterPath: number; hifzGrade: number; bestStreak: number; minutes: number;
};
export type Career = {
  v: typeof CAREER_VERSION;
  score: number;
  tier: TierId;
  /** 3, 2, 1 inside a tier (III → I); 0 for Grandmaster */
  division: 0 | 1 | 2 | 3;
  /** 0..1 on the way to the next tier (1 for Grandmaster) */
  into: number;
  next: TierId | null;
  nextAt: number | null;
  level: { level: number; xp: number; into: number; need: number };
};

const n = (v: unknown, max = 1e9) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0);

/** XP needed to go from level L to L+1: 100, 150, 200 … (mirror of the app's frozen gamify levelOf) */
const step = (l: number) => 100 + 50 * (l - 1);
export function levelOfXp(xp: number): { level: number; into: number; need: number } {
  let l = 1, left = n(xp);
  while (left >= step(l) && l < 999) { left -= step(l); l++; }
  return { level: l, into: left, need: step(l) };
}

/** the career score: XP plus knowledge points (memorised verses, exams, certificates, courses, Darajat, consistency) */
export function careerScore(x: Partial<CareerInput>): number {
  return n(x.xp)
    + n(x.verses, 6236) * 25
    + n(x.exams, 10_000) * 400
    + n(x.certificates, 10_000) * 800
    + n(x.courses, 10_000) * 300
    + n(x.qaida, 10_000) * 20
    + n(x.arabic, 10_000) * 30
    + n(x.reciterPath, 10_000) * 60
    + Math.max(0, n(x.hifzGrade, 7) - 1) * 1_500
    + n(x.bestStreak, 100_000) * 10
    + n(x.minutes, 50_000_000) * 2;
}

export function careerOf(x: Partial<CareerInput>): Career {
  const score = careerScore(x);
  let i = 0;
  while (i < TIERS.length - 1 && score >= TIER_AT[TIERS[i + 1]]) i++;
  const tier = TIERS[i];
  const next = i < TIERS.length - 1 ? TIERS[i + 1] : null;
  const from = TIER_AT[tier], to = next ? TIER_AT[next] : null;
  const into = to === null ? 1 : Math.max(0, Math.min(1, (score - from) / (to - from)));
  const division = (to === null ? 0 : into < 1 / 3 ? 3 : into < 2 / 3 ? 2 : 1) as Career["division"];
  const lv = levelOfXp(n(x.xp));
  return { v: CAREER_VERSION, score, tier, division, into, next, nextAt: to, level: { level: lv.level, xp: n(x.xp), into: lv.into, need: lv.need } };
}

/** "Top 3 %" style percentile from a rank among `total` (null when unranked) */
export function topPercent(rank: number | null | undefined, total: number): number | null {
  if (!rank || !total) return null;
  return Math.max(0.1, Math.min(100, Math.ceil((rank / total) * 1000) / 10));
}

/** Roman division numerals are the same in every language on the card */
export const DIVISION_MARK = ["", "I", "II", "III"] as const;

/** the leaderboard categories and periods (rankings board) */
export const BOARD_CATS = ["xp", "verses", "streak", "exams"] as const;
export type BoardCat = (typeof BOARD_CATS)[number];
export const BOARD_PERIODS = ["week", "month", "all"] as const;
export type BoardPeriod = (typeof BOARD_PERIODS)[number];
export const BOARD_SCOPES = ["world", "country", "following"] as const;
export type BoardScope = (typeof BOARD_SCOPES)[number];

/** SVG path of a star polygon (the tier emblem's girih star): `points` tips between radius R (tips) and r (inner) */
export function starPath(cx: number, cy: number, points: number, R: number, r: number, turn = -Math.PI / 2): string {
  const out: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = turn + (Math.PI * i) / points;
    const rad = i % 2 === 0 ? R : r;
    out.push(`${i === 0 ? "M" : "L"}${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `${out.join(" ")} Z`;
}
/** SVG arc path of a ring progress (0..1) around (cx, cy), starting at the top, clockwise */
export function ringPath(cx: number, cy: number, rad: number, frac: number): string {
  const f = Math.max(0, Math.min(0.9999, frac));
  const a = -Math.PI / 2 + f * 2 * Math.PI;
  const x = cx + rad * Math.cos(a), y = cy + rad * Math.sin(a);
  return `M${cx} ${cy - rad} A${rad} ${rad} 0 ${f > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
}
