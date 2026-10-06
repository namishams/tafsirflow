import { readJSON, writeJSON } from "./storage";

// Points for steady learning: time on the site, listening, practising, lessons. Synced as "tf:points".
// Daily caps keep it about steadiness, not about leaving a tab open.
export type PointKind = "time" | "listen" | "verse" | "review" | "new" | "session" | "lesson" | "quiz" | "vocab" | "streak" | "wudu";
export const RULES: Record<PointKind, { pts: number; cap?: number }> = {
  time: { pts: 1, cap: 120 }, // per active minute on the site
  listen: { pts: 2, cap: 400 }, // per minute of recitation heard in the player
  verse: { pts: 1, cap: 300 }, // per verse heard to the end
  review: { pts: 5 }, // per verse practised (Shams method, test, session)
  new: { pts: 10 }, // a verse learned for the first time
  session: { pts: 30 }, // daily session completed
  lesson: { pts: 20 }, // Arabic or academy lesson passed
  quiz: { pts: 10 }, // tajweed quiz finished
  vocab: { pts: 2, cap: 200 }, // per word reviewed
  streak: { pts: 1 }, // first activity of the day: 5 points per day of the current streak (max 50)
  wudu: { pts: 25, cap: 25 }, // wudu trainer completed
};
// kinds that show a small "+n" when earned; time and listening are counted quietly
export const LOUD: PointKind[] = ["review", "new", "session", "lesson", "quiz", "streak", "wudu"];

export type Points = {
  d: Record<string, number>; // day -> points
  m: Record<string, number>; // day -> active minutes on the site
  k: { day: number; v: Partial<Record<PointKind, number>> }; // today's points per kind (for the caps)
  c: Partial<Record<PointKind, number>>; // lifetime counts per kind
};
const KEY = "tf:points";
const EMPTY: Points = { d: {}, m: {}, k: { day: 0, v: {} }, c: {} };
export const dayNow = () => { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); };
export const readPoints = (): Points => ({ ...EMPTY, ...readJSON<Partial<Points>>(KEY, {}) });
export const totalPoints = (p: Points = readPoints()) => Object.values(p.d).reduce((a, b) => a + b, 0);

export function streakOf(days: Record<string, number>, t = dayNow()): { current: number; best: number } {
  let current = 0;
  for (let d = days[String(t)] ? t : t - 1; days[String(d)]; d--) current++;
  const keys = Object.keys(days).map(Number).filter((d) => days[String(d)] > 0).sort((a, b) => a - b);
  let best = 0, run = 0, prev = -2;
  for (const d of keys) { run = d === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  return { current, best: Math.max(best, current) };
}

let lastLoud = 0;
function save(p: Points, important: boolean) {
  // frequent ticks are written quietly; the account sync is triggered at most every few minutes or for real milestones
  const loud = important || Date.now() - lastLoud > 5 * 60_000;
  if (loud) lastLoud = Date.now();
  writeJSON(KEY, p, !loud);
}

export function award(kind: PointKind, units = 1): number {
  if (typeof window === "undefined" || units <= 0) return 0;
  const p = readPoints();
  const t = dayNow();
  let bonus = 0;
  if (p.k.day !== t) {
    p.k = { day: t, v: {} };
    let s = 0; // days in a row up to yesterday
    for (let d = t - 1; p.d[String(d)]; d--) s++;
    if (s > 0) { bonus = Math.min(50, 5 * (s + 1)); p.k.v.streak = bonus; p.d[t] = (p.d[t] ?? 0) + bonus; }
  }
  const r = RULES[kind];
  let pts = r.pts * units;
  if (r.cap !== undefined) pts = Math.max(0, Math.min(pts, r.cap - (p.k.v[kind] ?? 0)));
  p.c[kind] = (p.c[kind] ?? 0) + units;
  if (pts > 0) { p.k.v[kind] = (p.k.v[kind] ?? 0) + pts; p.d[t] = (p.d[t] ?? 0) + pts; }
  save(p, LOUD.includes(kind) || bonus > 0);
  if (bonus) window.dispatchEvent(new CustomEvent("tf-points", { detail: { pts: bonus, kind: "streak" } }));
  if (pts > 0) window.dispatchEvent(new CustomEvent("tf-points", { detail: { pts, kind } }));
  return pts;
}

export function addActiveMinute() {
  const p = readPoints();
  const t = String(dayNow());
  p.m[t] = (p.m[t] ?? 0) + 1;
  writeJSON(KEY, p, true);
  award("time");
}

// merge for the account sync: per day the higher value wins (two devices on the same day are not added up)
export function mergePoints(a?: Points, b?: Points): Points {
  const x = { ...EMPTY, ...(a ?? {}) }, y = { ...EMPTY, ...(b ?? {}) };
  const max = (p: Record<string, number>, q: Record<string, number>) => { const o = { ...q }; for (const [k, v] of Object.entries(p)) o[k] = Math.max(o[k] ?? 0, v); return o; };
  const k = x.k.day > y.k.day ? x.k : y.k.day > x.k.day ? y.k : { day: x.k.day, v: max(x.k.v as Record<string, number>, y.k.v as Record<string, number>) };
  return { d: max(x.d, y.d), m: max(x.m, y.m), k, c: max(x.c as Record<string, number>, y.c as Record<string, number>) };
}

// ---------- levels ----------
// names come from the learning path: beginner, student, steadfast, devoted, reader, reflective, proficient, companion of the Quran
export const LEVELS = [
  { min: 0, ar: "مبتدئ" }, { min: 150, ar: "طالب" }, { min: 400, ar: "مواظب" }, { min: 900, ar: "حريص" },
  { min: 1800, ar: "قارئ" }, { min: 3500, ar: "متدبّر" }, { min: 6000, ar: "متقن" }, { min: 10000, ar: "رفيق القرآن" },
] as const;
export function levelOf(total: number) {
  let i = 0;
  while (i + 1 < LEVELS.length && total >= LEVELS[i + 1].min) i++;
  const top = i === LEVELS.length - 1;
  // above the last level: a star for every further 5,000 points
  const stars = top ? Math.floor((total - LEVELS[i].min) / 5000) : 0;
  const from = top ? LEVELS[i].min + stars * 5000 : LEVELS[i].min;
  const to = top ? from + 5000 : LEVELS[i + 1].min;
  return { i, n: i + 1, ar: LEVELS[i].ar, stars, from, to, pct: Math.min(1, (total - from) / (to - from)) };
}
