import type { TalentCard } from "@/features/talents/api";

// Development-only sample data for screenshots of the Together screens (open /together?demo=1 in a development build).
// Release builds never use it: demoOn() is false whenever __DEV__ is false. Nothing is sent to the server in demo mode.
let on = false;
export const demoOn = () => __DEV__ && on;
export function setDemo(v: boolean) { if (__DEV__) on = v; }

const card = (username: string, name: string, country = "DE", level: TalentCard["level"] = "talent"): TalentCard =>
  ({ username, name, country, role: "learner", rewaya: "", level, verified: false, badge: null, sharerTier: 0, followers: 0, avatar: null });
const P = {
  yusuf: card("yusuf.demo", "Yusuf A."), bilal: card("bilal.demo", "Bilal R.", "AT"), idris: card("idris.demo", "Idris K."),
  harun: card("harun.demo", "Harun S.", "CH", "rising"), zayd: card("zayd.demo", "Zayd M."), umar: card("umar.demo", "Umar T.", "DE", "master"),
  ilyas: card("ilyas.demo", "Ilyas B."), musa: card("musa.demo", "Musa H.", "GB"), me: card("sie.demo", "Sie"),
};
const iso = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();
const settings = { activity: true, league: true, circles: true, challenges: true, nudges: true, community: true, bestList: false, gender: "brother" as const };
const friends = [
  { ...P.yusuf, today: true, streak: 41, weekActive: 5 }, { ...P.bilal, today: true, streak: 12, weekActive: 4 }, { ...P.idris, today: true, streak: 7, weekActive: 4 },
  { ...P.harun, today: true, streak: 3, weekActive: 3 }, { ...P.zayd, today: true, streak: 1, weekActive: 2 }, { ...P.umar, today: false, streak: 0, weekActive: 3 },
  { ...P.ilyas, today: false, streak: 0, weekActive: 1 }, { ...P.musa, today: false, streak: 0, weekActive: 2 },
];
const circles = [
  { id: "d1", name: "Fajr-Halaqa", kind: "brothers", role: "leader", status: "member", members: 6, pending: 1, suspended: false, goalKind: "days", goal: 30, progress: 23, reached: false, streak: 4 },
  { id: "d2", name: "Familien-Hifz", kind: "family", role: "member", status: "member", members: 4, pending: 0, suspended: false, goalKind: "verses", goal: 40, progress: 44, reached: true, streak: 9 },
];
const week = (xp: number, days: number, verses: number) => ({ xp, days, verses });
const circle = {
  ...circles[0], approval: true, maxMembers: 30, code: "FJR7-HQ2A",
  members: [
    { ...P.me, role: "leader", me: true, today: true, streak: 18, week: week(420, 5, 6), canNudge: false },
    { ...P.yusuf, role: "member", me: false, today: true, streak: 41, week: week(510, 5, 9), canNudge: false },
    { ...P.bilal, role: "member", me: false, today: true, streak: 12, week: week(330, 4, 4), canNudge: true },
    { ...P.idris, role: "member", me: false, today: true, streak: 7, week: week(260, 4, 3), canNudge: true },
    { ...P.umar, role: "member", me: false, today: false, streak: 0, week: week(150, 3, 2), canNudge: true },
    { ...P.ilyas, role: "member", me: false, today: false, streak: 0, week: week(40, 2, 0), canNudge: true },
  ],
  pending: [P.musa],
  history: [{ week: 2, progress: 23, goal: 30, reached: false }, { week: 1, progress: 31, goal: 30, reached: true }, { week: 0, progress: 34, goal: 30, reached: true }],
};
const league = {
  enabled: true, tier: 3, bestTier: 3, last: { result: "up", rank: 2, size: 7 }, upZone: 2, daysLeft: 3,
  rows: [
    { ...P.yusuf, xp: 510, tier: 4, me: false, active: 5 }, { ...P.me, xp: 420, tier: 3, me: true, active: 5 }, { ...P.bilal, xp: 330, tier: 3, me: false, active: 4 },
    { ...P.idris, xp: 260, tier: 2, me: false, active: 4 }, { ...P.harun, xp: 180, tier: 2, me: false, active: 3 }, { ...P.umar, xp: 150, tier: 1, me: false, active: 3 },
    { ...P.zayd, xp: 60, tier: 1, me: false, active: 2 },
  ].map((r, i) => ({ ...r, rank: i + 1 })),
};
const challenges = [
  { id: "c1", kind: "surah", target: 67, days: 30, status: "active", fromMe: true, other: P.yusuf, createdAt: iso(-24 * 9), endsAt: iso(24 * 21), goal: 100, mine: 62, theirs: 80, mineDone: false, theirsDone: false },
  { id: "c2", kind: "streak", target: 14, days: 14, status: "pending", fromMe: false, other: P.bilal, createdAt: iso(-3), endsAt: null, goal: 14, mine: 0, theirs: 0, mineDone: false, theirsDone: false },
  { id: "c3", kind: "verses", target: 50, days: 21, status: "ended", fromMe: false, other: P.idris, createdAt: iso(-24 * 25), endsAt: iso(-24 * 4), goal: 50, mine: 50, theirs: 50, mineDone: true, theirsDone: true },
];
const invites = [
  { id: "i1", topic: "surah", surah: 18, at: iso(26), mine: false, from: P.yusuf, to: P.me, circle: null, myAnswer: null, yes: 1 },
  { id: "i2", topic: "review", surah: null, at: iso(50), mine: true, from: P.me, to: null, circle: { id: "d1", name: "Fajr-Halaqa" }, myAnswer: "yes", yes: 4 },
];
const inbox = {
  nudges: [{ id: "n1", kind: "together_today", at: iso(-2), read: false, circle: { id: "d1", name: "Fajr-Halaqa" }, from: P.idris }],
  challenges: [challenges[1]], invites: [invites[0]], joinRequests: 1, unread: 4,
};
const best = (rows: [TalentCard, number][]) => rows.map(([c, verses], i) => ({ ...c, rank: i + 1, verses }));
const community = {
  month: new Date().toISOString().slice(0, 7),
  world: { verses: 8240, learners: 312, goal: 10000 },
  country: { code: "DE", verses: 2130, learners: 74, goal: 2500 },
  countries: [{ country: "DE", verses: 2130, learners: 74 }, { country: "GB", verses: 1655, learners: 61 }, { country: "TR", verses: 1210, learners: 40 }, { country: "AT", verses: 640, learners: 22 }, { country: "CH", verses: 415, learners: 15 }],
  best: { world: best([[P.musa, 212], [P.yusuf, 188], [P.umar, 150], [P.harun, 131], [P.bilal, 120]]), country: best([[P.yusuf, 188], [P.umar, 150], [P.idris, 96], [P.zayd, 80], [P.ilyas, 64]]) },
  mine: { community: true, bestList: false },
};

/** the sample answer for a Together endpoint (writes succeed without doing anything) */
export function demoReply(path: string, method: string, body?: unknown): unknown {
  const p = path.split("?")[0];
  if (method !== "GET") {
    if (p.endsWith("/settings")) return { settings: { ...settings, ...(body as object) } };
    if (p.endsWith("/circles")) return { id: "d1" };
    if (p.endsWith("/join")) return { id: "d1", status: "member" };
    if (/\/circles\/[^/]+$/.test(p)) return { circle, ok: true };
    if (p.includes("/challenges/")) return { challenges };
    if (p.includes("/invites/")) return { invites };
    return { ok: true, id: "x", reported: true };
  }
  if (p.endsWith("/pulse")) return { settings, friends: { list: friends, sharing: 8, friends: 8, learnedToday: 5, keptStreak: 4 }, league: { tier: 3 }, circles, inbox: { unread: 4 } };
  if (p.endsWith("/settings")) return { settings };
  if (p.endsWith("/league")) return league;
  if (p.endsWith("/circles")) return { circles };
  if (/\/circles\/[^/]+$/.test(p)) return { circle: p.endsWith("d2") ? { ...circle, ...circles[1], role: "member", code: "FAM4-HFZ9", pending: [] } : circle };
  if (p.endsWith("/challenges")) return { challenges };
  if (p.endsWith("/invites")) return { invites };
  if (p.endsWith("/inbox")) return inbox;
  if (p.endsWith("/friends")) return { friends: friends.slice(0, 6) };
  if (p.endsWith("/community")) return community;
  return {};
}

/** sample achievement moments of friends (development only) */
export const demoMoments = [
  { id: "m1", kind: "juz", ref: "J30", data: { n: 30 }, author: P.yusuf, total: 14 },
  { id: "m2", kind: "streak", ref: "D30", data: { n: 30 }, author: P.bilal, total: 9 },
  { id: "m3", kind: "level", ref: "L12", data: { n: 12 }, author: P.idris, total: 6 },
];
