// mirrors mobile/src/features/feed/gamify.ts (copied for the website; keep in step with the app)
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";
import { toHijri, todayUtc } from "@/lib/hijri";
import { topicOfKind, LIB_TOPICS, type LibTopic } from "./library";
import { dayNum, dayOf, longestStreak, statBump, statsNow, type DayStats, type Stats } from "./statsStore";

// Levels, XP, daily quests, streak freezes, personal records and the sticker collection of the feed. Everything stays
// on this device in one bounded record (qmc.feed-gamify). Healthy by design: XP for posts is capped per day, quests are
// small (3 per day), there are no fake social numbers and nothing is lost when a day is missed (freezes keep streaks).
export const GAMIFY_KEY = "qmc.feed-gamify";

export type QuestKind = "verses" | "words" | "hadith" | "posts" | "quiz" | "dua" | "share" | "name";
export type Quest = { kind: QuestKind; n: number; p: number };
export type Records = { posts: number; verses: number; words: number; ms: number; xp: number };
export type Gamify = {
  xp: number;
  quiz: number;
  quests: number;
  names: number[];
  holy: string[];
  ramadan: number; tahajjud: number; fajr: number; friday: number;
  last: { ramadan: number; tahajjud: number; fajr: number; friday: number; surprise: number };
  stickers: Record<string, number>;
  fresh: string[];
  day: number; today: Quest[]; rewarded: boolean;
  freezes: number; frozen: number[];
  rec: Records;
  recapSeen: { week: number; month: number };
  /** longest run of days with at least one share */
  shareBest: number;
  /** duplicates of collected stickers (a gift after all daily quests); they can be given to the garden */
  dupes?: Record<string, number>;
  /** encouragements received / given, counted by the server (community_reaction_credits); only ever rises */
  recv?: number; gave?: number;
};
const empty = (): Gamify => ({
  xp: 0, quiz: 0, quests: 0, names: [], holy: [], ramadan: 0, tahajjud: 0, fajr: 0, friday: 0,
  last: { ramadan: 0, tahajjud: 0, fajr: 0, friday: 0, surprise: 0 },
  stickers: {}, fresh: [], day: 0, today: [], rewarded: false, freezes: 0, frozen: [],
  rec: { posts: 0, verses: 0, words: 0, ms: 0, xp: 0 }, recapSeen: { week: 0, month: 0 }, shareBest: 0,
});
let cache: Gamify | null = null;
function g(): Gamify {
  if (!cache) { const r = readJSON<Partial<Gamify>>(GAMIFY_KEY, {}); cache = { ...empty(), ...r, last: { ...empty().last, ...r.last }, rec: { ...empty().rec, ...r.rec }, recapSeen: { ...empty().recapSeen, ...r.recapSeen } }; }
  return cache;
}
let timer: ReturnType<typeof setTimeout> | null = null;
function save(now = false) {
  const write = () => { timer = null; const s = g(); s.frozen = s.frozen.slice(-30); s.fresh = s.fresh.slice(-20); s.holy = s.holy.slice(-80); writeJSON(GAMIFY_KEY, s, true); };
  if (now) { if (timer) clearTimeout(timer); write(); return; }
  timer ??= setTimeout(write, 2500);
}
/** forget the in-memory record (after the account sync wrote a merged one) */
export const reloadGamify = () => { cache = null; };
export function useGamify(): Gamify { useStored(GAMIFY_KEY, {}); return g(); }

// ---------- levels ----------
export const XP = { post: 2, verse: 5, word: 4, quiz: 6, share: 10, quest: 25, allQuests: 50 } as const;
const POST_XP_PER_DAY = 200;
/** XP needed to go from level L to L+1: 100, 150, 200 … */
const step = (l: number) => 100 + 50 * (l - 1);
export function levelOf(xp: number): { level: number; into: number; need: number } {
  let l = 1, left = xp;
  while (left >= step(l) && l < 999) { left -= step(l); l++; }
  return { level: l, into: left, need: step(l) };
}

// ---------- celebrations (level up, new sticker, freeze) ----------
export type Celebration = { type: "level"; level: number } | { type: "sticker"; id: string } | { type: "freeze"; used: boolean };
const subs = new Set<(c: Celebration) => void>();
export const onCelebrate = (f: (c: Celebration) => void) => { subs.add(f); return () => { subs.delete(f); }; };
// deferred: events may happen while a screen renders (quests are created lazily)
const emit = (c: Celebration) => { setTimeout(() => subs.forEach((f) => f(c)), 0); };

function addXp(n: number) {
  const s = g();
  const before = levelOf(s.xp).level;
  s.xp += n;
  statBump((d) => { d.xp = (d.xp ?? 0) + n; });
  const after = levelOf(s.xp).level;
  if (after > before) emit({ type: "level", level: after });
}

// ---------- quests ----------
const POOL: [QuestKind, number][] = [["verses", 5], ["words", 3], ["hadith", 1], ["posts", 10], ["quiz", 2], ["dua", 1], ["share", 1], ["name", 2], ["verses", 3], ["posts", 15], ["words", 5]];
const hash = (n: number) => { let x = (n * 2654435761) >>> 0; x ^= x >>> 15; return x >>> 0; }; // unsigned: a negative index made POOL[i] undefined and threw
function ensureDay() {
  const s = g();
  const d = dayNum();
  // an empty list on the same day is a record left behind by the old negative-index crash: pick again
  if (s.day === d && s.today.length) return;
  s.day = d; s.rewarded = false;
  const picked: Quest[] = [];
  for (let i = 0; picked.length < 3 && i < 40; i++) {
    const [kind, n] = POOL[hash(d * 7 + i) % POOL.length];
    if (!picked.some((q) => q.kind === kind)) picked.push({ kind, n, p: 0 });
  }
  s.today = picked;
  checkFreeze();
  save();
}
export function todaysQuests(): Quest[] { ensureDay(); return g().today; }
function progress(kind: QuestKind, by = 1) {
  ensureDay();
  const s = g();
  for (const q of s.today) {
    if (q.kind !== kind || q.p >= q.n) continue;
    q.p = Math.min(q.n, q.p + by);
    if (q.p >= q.n) { s.quests++; addXp(XP.quest); }
  }
  if (!s.rewarded && s.today.length && s.today.every((q) => q.p >= q.n)) {
    s.rewarded = true;
    addXp(XP.allQuests);
    if (s.freezes < MAX_FREEZES) { s.freezes++; emit({ type: "freeze", used: false }); }
    surprise(true);
    // a duplicate of one collected sticker (for the garden)
    const own = STICKERS.filter((x) => s.stickers[x.id]);
    if (own.length) { const id = own[hash(d0() * 13) % own.length].id; s.dupes = { ...(s.dupes ?? {}), [id]: Math.min(99, (s.dupes?.[id] ?? 0) + 1) }; }
  }
}

// ---------- streak freezes ----------
export const MAX_FREEZES = 2;
export const isFrozen = (d: number) => g().frozen.includes(d);
/** a missed yesterday after an active day before: one freeze keeps the streak */
function checkFreeze() {
  const s = g();
  const st = statsNow();
  const y = dayNum() - 1;
  const active = (d: number) => dayOf(st, d).posts > 0 || s.frozen.includes(d);
  if (s.freezes > 0 && !active(y) && active(y - 1)) { s.freezes--; s.frozen.push(y); emit({ type: "freeze", used: true }); }
}

// ---------- events from the feed (statsStore) ----------
export type GEvent = { t: "post"; kind: string; item?: string } | { t: "verse" } | { t: "words"; n: number } | { t: "quiz"; right: boolean } | { t: "share" };
export function gEvent(e: GEvent) {
  ensureDay();
  const s = g();
  const today = dayOf(statsNow(), dayNum());
  switch (e.t) {
    case "post": {
      if (today.posts * XP.post <= POST_XP_PER_DAY) addXp(XP.post);
      progress("posts");
      if (/hadith/.test(e.kind)) progress("hadith");
      if (e.kind === "dua") progress("dua");
      const it = e.item ?? "";
      if (it.startsWith("n:")) { const i = Number(it.slice(2)); if (Number.isInteger(i) && i >= 0 && i < 99 && !s.names.includes(i)) s.names.push(i); progress("name"); }
      if (topicOf(e.kind) === "holy" && it && !s.holy.includes(it)) s.holy.push(it);
      timeOfDay();
      surprise(false);
      break;
    }
    case "verse": addXp(XP.verse); progress("verses"); break;
    case "words": addXp(XP.word * e.n); progress("words", e.n); break;
    case "quiz": if (e.right) { s.quiz++; addXp(XP.quiz); progress("quiz"); } break;
    case "share": addXp(XP.share); progress("share"); s.shareBest = Math.max(s.shareBest, shareStreakOf(statsNow()).best); save(); break;
  }
  records(dayOf(statsNow(), dayNum()));
  evaluate();
  save();
}
function timeOfDay() {
  const s = g();
  const d = dayNum();
  const now = new Date();
  const h = now.getHours();
  if (h >= 2 && h < 5 && s.last.tahajjud !== d) { s.last.tahajjud = d; s.tahajjud++; }
  if (h >= 4 && h < 7 && s.last.fajr !== d) { s.last.fajr = d; s.fajr++; }
  if (now.getDay() === 5 && s.last.friday !== d) { s.last.friday = d; s.friday++; }
  if (s.last.ramadan !== d) { try { if (toHijri(todayUtc(now)).m === 9) { s.last.ramadan = d; s.ramadan++; } } catch { /* no calendar */ } }
}
function records(d: DayStats) {
  const r = g().rec;
  r.posts = Math.max(r.posts, d.posts); r.verses = Math.max(r.verses, d.verses); r.words = Math.max(r.words, d.words);
  r.ms = Math.max(r.ms, d.ms); r.xp = Math.max(r.xp, d.xp ?? 0);
}
export const recordsNow = (): Records => { const r = { ...g().rec }; const d = dayOf(statsNow(), dayNum()); r.ms = Math.max(r.ms, d.ms); return r; };

// ---------- topics ----------
const OWN: Record<string, LibTopic> = { verse: "tafsir", word: "tafsir", carousel: "tafsir", memorise: "tafsir", transliteration: "tafsir", quiz: "tafsir", reciters: "scholars", name: "duas", story: "seerah", prayer: "prayer", calendar: "history", chapters: "seerah" };
export const topicOf = (kind: string): LibTopic => OWN[kind] ?? topicOfKind(kind);
export function topicCounts(kinds: Record<string, number>): Record<LibTopic, number> {
  const o = Object.fromEntries(LIB_TOPICS.map((t) => [t, 0])) as Record<LibTopic, number>;
  for (const [k, n] of Object.entries(kinds)) if (!k.includes(":")) o[topicOf(k)] += n;
  return o;
}
/** mastery of a topic: level 1–10 by posts read (5, 15, 30 … 500) */
const MASTERY = [5, 15, 30, 50, 80, 120, 180, 260, 360, 500];
export function mastery(n: number): { level: number; frac: number } {
  let l = 0;
  while (l < MASTERY.length && n >= MASTERY[l]) l++;
  if (l >= MASTERY.length) return { level: 10, frac: 1 };
  const lo = l ? MASTERY[l - 1] : 0;
  return { level: l, frac: (n - lo) / (MASTERY[l] - lo) };
}

// ---------- stickers ----------
export type Shape = "circle" | "star" | "arch" | "hex" | "rosette";
export type Motif = "book" | "wave" | "word" | "check" | "plane" | "flame" | "chevrons" | "target" | "crescent" | "star8" | "lantern" | "palm" | "dome" | "arch" | "dove" | "rose" | "pen" | "scroll" | "sunrise" | "night" | "hourglass" | "drop" | "mat" | "calendar" | "heart";
export type Tone = "emerald" | "gold" | "night" | "rare";
type Ctx = { t: DayStats; best: number; level: number; quiz: number; quests: number; topic: Record<LibTopic, number>; names: number; holy: number; ramadan: number; tahajjud: number; fajr: number; friday: number; hours: number; shareBest: number; recv: number; gave: number };
export type StickerDef = { id: string; fam: string; n?: number; topic?: LibTopic; shape: Shape; motif: Motif; tone: Tone; rare?: boolean; test?: (c: Ctx) => boolean };
const TOPIC_MOTIF: Record<LibTopic, Motif> = { tafsir: "book", hadith: "scroll", duas: "drop", prayer: "mat", holy: "dome", seerah: "palm", quran: "star8", scholars: "pen", history: "hourglass", art: "rose" };
const tiers = (fam: string, ns: number[], shape: Shape, motif: Motif, get: (c: Ctx) => number): StickerDef[] =>
  ns.map((n, i) => ({ id: `${fam}-${n}`, fam, n, shape, motif, tone: (i === ns.length - 1 ? "gold" : i % 2 ? "night" : "emerald") as Tone, test: (c: Ctx) => get(c) >= n }));
export const STICKERS: StickerDef[] = [
  ...tiers("verses", [10, 100, 500, 1000, 5000], "circle", "wave", (c) => c.t.verses),
  ...tiers("posts", [50, 100, 500, 1000, 5000], "hex", "book", (c) => c.t.posts),
  ...tiers("words", [10, 100, 500, 1000], "rosette", "word", (c) => c.t.words),
  ...tiers("quiz", [10, 50, 200], "circle", "check", (c) => c.quiz),
  { id: "share-1", fam: "share1", shape: "arch", motif: "plane", tone: "emerald", test: (c) => c.t.shares >= 1 },
  // "Diligent sharer" series (share-1 above is the first tier; ids shares-10 / shares-50 kept from the old series)
  ...tiers("shares", [5, 10, 25, 50, 100, 250, 500, 1000], "arch", "plane", (c) => c.t.shares),
  ...tiers("shareStreak", [3, 7, 30, 100], "star", "plane", (c) => c.shareBest),
  // new series (owner rule: additions only, new ids): encouragements received ("MashaAllah received") and given ("Encourager")
  ...tiers("mashaRecv", [1, 10, 50, 100, 250, 500, 1000], "rosette", "heart", (c) => c.recv),
  ...tiers("encourager", [10, 50, 200, 1000], "arch", "heart", (c) => c.gave),
  ...tiers("streak", [3, 7, 30, 100, 365], "star", "flame", (c) => c.best),
  ...tiers("level", [5, 10, 25, 50], "rosette", "chevrons", (c) => c.level),
  { id: "quest-1", fam: "quest1", shape: "circle", motif: "target", tone: "emerald", test: (c) => c.quests >= 1 },
  ...tiers("quests", [10, 50, 100], "circle", "target", (c) => c.quests),
  ...LIB_TOPICS.flatMap((tp): StickerDef[] => [
    { id: `topic-${tp}-1`, fam: "topic1", topic: tp, shape: "hex", motif: TOPIC_MOTIF[tp], tone: "emerald", test: (c) => c.topic[tp] >= 25 },
    { id: `topic-${tp}-2`, fam: "topic2", topic: tp, shape: "star", motif: TOPIC_MOTIF[tp], tone: "gold", test: (c) => c.topic[tp] >= 150 },
  ]),
  { id: "names-33", fam: "names33", shape: "star", motif: "star8", tone: "night", test: (c) => c.names >= 33 },
  { id: "names-99", fam: "names99", shape: "star", motif: "star8", tone: "gold", test: (c) => c.names >= 99 },
  { id: "holy-10", fam: "holy10", shape: "arch", motif: "dome", tone: "emerald", test: (c) => c.holy >= 10 },
  { id: "holy-all", fam: "holyAll", shape: "arch", motif: "dome", tone: "gold", test: (c) => c.holy >= 30 },
  { id: "ramadan-7", fam: "ramadan7", shape: "circle", motif: "lantern", tone: "night", test: (c) => c.ramadan >= 7 },
  { id: "ramadan-29", fam: "ramadan29", shape: "rosette", motif: "lantern", tone: "gold", test: (c) => c.ramadan >= 29 },
  { id: "tahajjud-1", fam: "tahajjud1", shape: "circle", motif: "night", tone: "night", test: (c) => c.tahajjud >= 1 },
  { id: "tahajjud-10", fam: "tahajjud10", shape: "star", motif: "night", tone: "gold", test: (c) => c.tahajjud >= 10 },
  { id: "fajr-7", fam: "fajr7", shape: "arch", motif: "sunrise", tone: "night", test: (c) => c.fajr >= 7 },
  { id: "friday-4", fam: "friday4", shape: "hex", motif: "calendar", tone: "emerald", test: (c) => c.friday >= 4 },
  { id: "hours-10", fam: "hours10", shape: "rosette", motif: "hourglass", tone: "night", test: (c) => c.hours >= 10 },
  ...(["moon", "lantern", "palm", "star", "rose", "ink", "arch", "dove"] as const).map((r): StickerDef => ({
    id: `rare-${r}`, fam: `rare-${r}`, rare: true, tone: "rare",
    shape: (["circle", "rosette", "arch", "star", "rosette", "hex", "arch", "circle"] as Shape[])[["moon", "lantern", "palm", "star", "rose", "ink", "arch", "dove"].indexOf(r)],
    motif: ({ moon: "crescent", lantern: "lantern", palm: "palm", star: "star8", rose: "rose", ink: "pen", arch: "arch", dove: "dove" } as Record<string, Motif>)[r],
  })),
];
export const STICKER = new Map(STICKERS.map((s) => [s.id, s]));

function ctx(st: Stats): Ctx {
  const s = g();
  return {
    t: st.total, best: longestStreak(st), level: levelOf(s.xp).level, quiz: s.quiz, quests: s.quests, topic: topicCounts(st.total.kinds),
    names: s.names.length, holy: s.holy.length, ramadan: s.ramadan, tahajjud: s.tahajjud, fajr: s.fajr, friday: s.friday, hours: st.total.ms / 3600000, shareBest: Math.max(s.shareBest, shareStreakOf(st).best), recv: s.recv ?? 0, gave: s.gave ?? 0,
  };
}
/** the current and the longest run of days with a share (current counts today or, until a share today, yesterday) */
export function shareStreakOf(st: Stats): { now: number; best: number } {
  const days = Object.keys(st.days).map(Number).filter((d) => (st.days[String(d)]?.shares ?? 0) > 0).sort((a, b) => a - b);
  let best = 0, run = 0, prev = -2;
  for (const d of days) { run = d === prev + 1 ? run + 1 : 1; prev = d; best = Math.max(best, run); }
  const today = dayNum();
  const now = prev === today || prev === today - 1 ? run : 0;
  return { now, best };
}
/** shares of the current week (Monday to today) */
export function weekShares(st: Stats = statsNow()): number {
  const to = dayNum();
  let n = 0;
  for (let d = mondayOf(to); d <= to; d++) n += st.days[String(d)]?.shares ?? 0;
  return n;
}
function unlock(id: string) {
  const s = g();
  if (s.stickers[id]) return;
  s.stickers[id] = dayNum();
  s.fresh.push(id);
  emit({ type: "sticker", id });
}
let lastEval = 0;
function evaluate(force = false) {
  const now = Date.now();
  if (!force && now - lastEval < 1500) return;
  lastEval = now;
  const c = ctx(statsNow());
  for (const d of STICKERS) if (d.test && !g().stickers[d.id] && d.test(c)) unlock(d.id);
}
/** a rare sticker as a surprise: at most one chance per day (1 in 10 when reading, 1 in 3 after all quests) */
function surprise(quests: boolean) {
  const s = g();
  const d = dayNum();
  if (s.last.surprise === d) return;
  const left = STICKERS.filter((x) => x.rare && !s.stickers[x.id]);
  if (!left.length) return;
  if (!quests && dayOf(statsNow(), d).posts < 5) return;
  s.last.surprise = d;
  if (Math.random() < (quests ? 1 / 3 : 1 / 10)) unlock(left[Math.floor(Math.random() * left.length)].id);
}
export function markStickersSeen() { const s = g(); if (s.fresh.length) { s.fresh = []; save(true); } }
export function markRecapSeen(kind: "week" | "month", n: number) { const s = g(); if (s.recapSeen[kind] !== n) { s.recapSeen[kind] = n; save(true); } }
/** on start: today's quests, a due freeze, stickers for data from before this feature */
export function initGamify() { ensureDay(); evaluate(true); save(); }

// ---------- weeks and months ----------
/** the Monday (day number) of the week of day d */
export const mondayOf = (d: number) => d - ((d + 3) % 7);
export type Period = { from: number; to: number; posts: number; verses: number; words: number; ms: number; listen: number; xp: number; active: number; top: LibTopic | null };
export function period(st: Stats, from: number, to: number): Period {
  const o: Period = { from, to, posts: 0, verses: 0, words: 0, ms: 0, listen: 0, xp: 0, active: 0, top: null };
  const kinds: Record<string, number> = {};
  for (let d = from; d <= to; d++) {
    const x = dayOf(st, d);
    o.posts += x.posts; o.verses += x.verses; o.words += x.words; o.ms += x.ms; o.listen += x.listen ?? 0; o.xp += x.xp ?? 0;
    if (x.posts) o.active++;
    for (const [k, n] of Object.entries(x.kinds)) kinds[k] = (kinds[k] ?? 0) + n;
  }
  const tc = Object.entries(topicCounts(kinds)).sort((a, b) => b[1] - a[1])[0];
  o.top = tc && tc[1] > 0 ? (tc[0] as LibTopic) : null;
  return o;
}
/** the previous calendar month as day numbers */
export function lastMonth(now = new Date()): { from: number; to: number; date: Date } {
  const first = new Date(now.getFullYear(), now.getMonth() - 1, 1, 12);
  const last = new Date(now.getFullYear(), now.getMonth(), 0, 12);
  return { from: dayNum(first.getTime()), to: dayNum(last.getTime()), date: first };
}

// ---------- garden (src/features/garden) ----------
const d0 = () => dayNum();
/** duplicates per sticker id */
export const stickerDupes = (): Record<string, number> => ({ ...(g().dupes ?? {}) });
/** uses one duplicate of a sticker; false when there is none */
export function takeDupe(id: string): boolean {
  const s = g();
  const n = s.dupes?.[id] ?? 0;
  if (n <= 0) return false;
  const next = { ...(s.dupes ?? {}) };
  if (n > 1) next[id] = n - 1; else delete next[id];
  s.dupes = next; save(true);
  return true;
}
/** XP from outside the feed (garden harvest); goes through levels like every other XP */
/** the server's counted totals of encouragements received and given: only rises, and opens the matching stickers */
export function setSocialTotals(recv: number, gave: number) {
  const s = g();
  const r = Math.max(s.recv ?? 0, Math.floor(recv) || 0), v = Math.max(s.gave ?? 0, Math.floor(gave) || 0);
  if (r === (s.recv ?? 0) && v === (s.gave ?? 0)) return;
  s.recv = r; s.gave = v; evaluate(true); save(true);
}
export function bonusXp(n: number) { if (n > 0 && n <= 500) { addXp(Math.round(n)); save(true); } }

// website: forget the in-memory record after the account sync or another tab wrote a new one
if (typeof window !== "undefined") {
  window.addEventListener("tf-synced", () => reloadGamify());
  window.addEventListener("storage", (e) => { if (e.key === GAMIFY_KEY || e.key === null) reloadGamify(); });
}
