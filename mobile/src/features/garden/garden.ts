import { readJSON, useStored, writeJSON } from "@/lib/store";
import { toHijri, todayUtc } from "@/web/hijri";
import { STICKER, bonusXp, topicCounts, takeDupe, useGamify, type StickerDef } from "@/features/feed/gamify";
import { dayNum, statsNow } from "@/features/feed/statsStore";
import { readPoints } from "@/web/points";
import { activityDrops, ramadanComplete, type Act, RARITY_GP, completionGp, newlyCompleted, openPack, rarityOf, seasonalDrops, spendSticker, syncNames, itemById, type Series } from "./catalog";

// "Your garden": a tree that grows slowly with learning (feed XP, quests), with stickers given to it and with daily
// watering (all of today's quests). Nothing is ever lost: an inactive tree only rests (dimmed leaves) and recovers.
// One bounded record (qmc.garden) on the device, synced with the account (merge: max growth, union of decorations).
export const GARDEN_KEY = "qmc.garden";

/** where growth comes from; the Shams Method weighs most, pure feed scrolling very little */
export type Src = "shams" | "learn" | "listen" | "quests" | "stickers" | "feed";
export const SRCS: Src[] = ["shams", "learn", "listen", "quests", "stickers", "feed"];
export type TreeType = "palm" | "olive" | "fig" | "pomegranate" | "sidr";
export const TREE_TYPES: { id: TreeType; pro?: boolean }[] = [{ id: "palm" }, { id: "olive" }, { id: "fig" }, { id: "pomegranate" }, { id: "sidr", pro: true }];
export type Trait = "blossoms" | "fruits" | "lanterns" | "fountain" | "bench" | "plaque" | "crescent" | "star" | "garland";
/** which rare sticker unlocks which decoration */
export const RARE_TRAIT: Record<string, Trait> = {
  "rare-rose": "blossoms", "rare-palm": "fruits", "rare-lantern": "lanterns", "rare-dove": "fountain",
  "rare-arch": "bench", "rare-ink": "plaque", "rare-moon": "crescent", "rare-star": "star", "e:ramadan-garland": "garland", "e:ramadan-lantern": "lanterns",
};
export type HistKind = "plant" | "stage" | "gift" | "harvest" | "water";
export type Hist = { d: number; k: HistKind; n?: number };
export type Tree = { id: string; type: TreeType; name: string; planted: number; gp: number; fruits: number; fruitDay: number; harvested: number; hist: Hist[];
  /** the highest stage this tree has reached (points and age); a stage once reached is never taken away */
  floor?: number };
export type Garden = {
  trees: Tree[]; active: string | null; traits: Trait[];
  /** unique stickers already given (each only once) */
  given: string[];
  /** feed XP already turned into growth; harvest XP is not counted */
  learn: number; harvestXp: number; learnDay: number; learnToday: number;
  watered: number; lastActive: number; at: number;
  /** growth per day and source (day number → source → points), last 60 days, for the weekly recap */
  log?: Record<string, Partial<Record<Src, number>>>;
  /** lifetime counters already turned into growth, carry of fractions, today's points per source (for the caps) */
  base?: Record<string, number>; carry?: Partial<Record<Src, number>>; capDay?: number; capped?: Partial<Record<Src, number>>;
  /** the free stage limit was shown once */
  flourishSeen?: boolean;
  /** Shams Method: last day with a session and the run of days in a row */
  shamsDay?: number; shamsRun?: number; shamsToday?: number;
  /** last stage-up not yet announced by a notification */
  notifyStage?: number;
  /** growth scale of the saved points (2 = since build 14) */
  scale?: number;
  /** stickers given today (diminishing growth) */
  giftDay?: number; giftsToday?: number;
};
const empty = (): Garden => ({ scale: SCALE, trees: [], active: null, traits: [], given: [], learn: -1, harvestXp: 0, learnDay: 0, learnToday: 0, watered: 0, lastActive: 0, at: 0 });

// 13 stages (0 = seed … 12 = ancient tree). Thresholds grow by about 1.5x per stage: an active free learner
// (about 35 a day) reaches stage 6 after five to six weeks, an active Pro learner (60 to 90 a day) stage 12 after
// six to twelve months.
export const STAGES = [0, 60, 140, 270, 460, 750, 1200, 1850, 2850, 4300, 6500, 9900, 15000];
/** the thresholds before build 14 (growth was far too fast); saved trees are moved to the new scale once */
const OLD_STAGES = [0, 30, 80, 160, 280, 450, 700, 1000, 1400, 1900, 2600, 3500, 4600];
const SCALE = 2;
function rescale(gp: number): number {
  let k = 0; while (k < OLD_STAGES.length - 1 && gp >= OLD_STAGES[k + 1]) k++;
  if (k >= OLD_STAGES.length - 1) return STAGES[STAGES.length - 1] + Math.round((gp - OLD_STAGES[k]) * (STAGES[k] / OLD_STAGES[k]));
  const f = (gp - OLD_STAGES[k]) / (OLD_STAGES[k + 1] - OLD_STAGES[k]);
  return Math.round(STAGES[k] + f * (STAGES[k + 1] - STAGES[k])); // same stage, same progress within it
}
function migrate<T extends Partial<Garden>>(x: T): T {
  if (x.scale === SCALE) return x;
  return { ...x, scale: SCALE, trees: Array.isArray(x.trees) ? x.trees.map((t) => ({ ...t, gp: rescale(t.gp ?? 0) })) : x.trees };
}
export const MAX_STAGE = STAGES.length - 1;
/** without Pro the tree grows to a young tree (stage 6) and stays healthy there; growth keeps counting for later */
export const FREE_STAGE = 6;
let proNow = false;
const rawStage = (gp: number) => { let s = 0; while (s < MAX_STAGE && gp >= STAGES[s + 1]) s++; return s; };
/** the calendar gate: a stage also needs the tree to be at least this many days old, so that even the most diligent
 *  learner sees the majestic tree only after a year. A stage is reached when both the points and the age are there;
 *  points beyond a stage carry over. Boosts (Ramadan, Fridays) speed up the points, never the calendar. */
export const MIN_DAYS = [0, 3, 7, 14, 24, 38, 56, 80, 110, 150, 200, 270, 365];
/** age of a tree in days since planting */
export const ageOf = (t: Pick<Tree, "planted">) => Math.max(0, dayNum() - (t.planted || dayNum()));
/** the stage for given points and age (without the free limit) */
export const gatedStage = (gp: number, age: number) => { let s = rawStage(gp); while (s > 0 && age < MIN_DAYS[s]) s--; return s; };
/** the stage a tree has reached (never below what it already had), without the free limit */
const reachedOf = (t: Tree) => Math.max(t.floor ?? 0, gatedStage(t.gp, ageOf(t)));
const capFree = (st: number, pro: boolean) => (pro ? st : Math.min(FREE_STAGE, st));
/** a tree's stage (points, age and the free limit) */
export const treeStage = (t: Tree, pro = proNow) => capFree(reachedOf(t), pro);
/** records a newly reached stage (history, celebration); returns true on a stage-up */
function settle(t: Tree): boolean {
  const reached = reachedOf(t), before = capFree(t.floor ?? 0, proNow), after = capFree(reached, proNow);
  if (reached === (t.floor ?? 0)) return false;
  t.floor = reached;
  if (after <= before) return false;
  for (let k = before + 1; k <= after; k++) t.hist.push({ d: dayNum(), k: "stage", n: k });
  const s = g(); s.notifyStage = after; emitStageUp({ tree: t, stage: after });
  return true;
}
export const stageOf = (gp: number, pro = proNow) => (pro ? rawStage(gp) : Math.min(FREE_STAGE, rawStage(gp)));
export type Progress = { stage: number; frac: number; left: number; held: boolean; age: number; wait: number };
/** progress to the next stage: points (frac, left) and, for a tree, its age and the days the calendar still asks (wait) */
export function progressOf(x: number | Tree, pro = proNow): Progress {
  const tree = typeof x === "number" ? null : x, gp = tree ? tree.gp : (x as number);
  const age = tree ? ageOf(tree) : 0;
  const s = tree ? treeStage(tree, pro) : stageOf(gp, pro);
  if (!pro && s >= FREE_STAGE) return { stage: s, frac: 1, left: 0, held: true, age, wait: 0 };
  if (s >= MAX_STAGE) return { stage: s, frac: 1, left: 0, held: false, age, wait: 0 };
  const wait = tree ? Math.max(0, MIN_DAYS[s + 1] - age) : 0;
  return { stage: s, frac: Math.min(1, Math.max(0, (gp - STAGES[s]) / (STAGES[s + 1] - STAGES[s]))), left: Math.max(0, STAGES[s + 1] - gp), held: false, age, wait };
}
/** 4 feed XP make 1 growth point, at most 40 a day from learning; watering adds 15 */
const WATER_GP = 5, FRUIT_XP = 10;
const CAPS: Record<Src, number> = { shams: 60, learn: 15, listen: 6, quests: 10, stickers: 12, feed: 2 };
export const FRUIT_STAGE = 5;
export const PLOT_STAGES = [6, 9, 12];
export const STICKER_GP_HINT = (d: StickerDef, unique: boolean) => stickerGp(d, unique);
export const stickerGp = (d: StickerDef, unique: boolean) => (d.rare ? 8 : d.tone === "gold" ? 4 : d.tone === "night" ? 3 : 2) * (unique ? 2 : 1);

let cache: Garden | null = null;
function g(): Garden {
  if (!cache) {
    const r = migrate(readJSON<Partial<Garden>>(GARDEN_KEY, {}));
    cache = { ...empty(), ...r, trees: Array.isArray(r.trees) ? r.trees : [], traits: r.traits ?? [], given: r.given ?? [] };
    // trees from before the calendar gate keep the stage they had (by points), nothing is taken away
    for (const t of cache.trees) if (t.floor === undefined) t.floor = rawStage(t.gp ?? 0);
  }
  return cache;
}
function save() { const s = g(); s.at = Date.now(); for (const t of s.trees) t.hist = t.hist.slice(-60); writeJSON(GARDEN_KEY, s); }
export const reloadGarden = () => { cache = null; };
export const readGarden = (): Garden => g();
export const markFlourishSeen = () => { const s = g(); if (!s.flourishSeen) { s.flourishSeen = true; save(); } };
export function useGarden(): Garden { useStored(GARDEN_KEY, {}); return g(); }

export const plotsOf = (s: Garden) => 1 + PLOT_STAGES.filter((n) => s.trees[0] && reachedOf(s.trees[0]) >= n).length;
export const activeTree = (s: Garden, pro: boolean): Tree | null => ((proNow = pro) ? s.trees.find((t) => t.id === s.active) : null) ?? s.trees[0] ?? null;
export const canPlant = (s: Garden, pro: boolean) => s.trees.length === 0 || (pro && s.trees.length < plotsOf(s));
export const resting = (s: Garden) => s.trees.length > 0 && s.lastActive > 0 && dayNum() - s.lastActive >= 3;
export const fruitCap = (s: Garden) => (s.traits.includes("fruits") ? 5 : 3);

// stage-up celebrations (full screen, GardenCelebrate in the root layout)
export type StageUp = { tree: Tree; stage: number };
const subs = new Set<(e: StageUp) => void>();
export const onStageUp = (f: (e: StageUp) => void) => { subs.add(f); return () => { subs.delete(f); }; };
// iOS cannot present the full-screen celebration while another modal (the gift sheet, its confirmation alert) is
// up: the celebration modal then never appears but still blocks every touch, so the app seems frozen. Screens
// with a modal hold the celebrations; the latest one is shown once the modal has closed.
let held = 0;
let pendingUp: StageUp | null = null, pendingSeries: SeriesReward | null = null;
function emitStageUp(e: StageUp) { if (held) pendingUp = e; else setTimeout(() => subs.forEach((f) => f(e)), 0); }
function emitSeries(r: SeriesReward) { if (held) pendingSeries = r; else setTimeout(() => seriesSubs.forEach((f) => f(r)), 0); }
export function holdCelebrations(): () => void {
  held++;
  return () => {
    held = Math.max(0, held - 1);
    if (held) return;
    const e = pendingUp, r = pendingSeries; pendingUp = null; pendingSeries = null;
    if (e || r) setTimeout(() => { if (e) subs.forEach((f) => f(e)); if (r) seriesSubs.forEach((f) => f(r)); }, 600); // after the sheet's slide-out
  };
}
/** Ramadan doubles all growth; Fridays and the first ten days of Dhul-Hijjah add a quarter */
export function growthBoost(): number {
  try { const h = toHijri(todayUtc()); if (h.m === 9) return 2; if (h.m === 12 && h.d <= 10) return 1.25; } catch { /* no calendar */ }
  return new Date().getDay() === 5 ? 1.25 : 1;
}
function grow(t: Tree, gp0: number, src: Src) {
  const gp = Math.round(gp0 * growthBoost());
  t.gp = Math.round(t.gp + gp);
  const s = g(), d = String(dayNum());
  const log = { ...(s.log ?? {}) }; const day = { ...(typeof log[d] === "object" ? log[d] : {}) }; day[src] = (day[src] ?? 0) + Math.round(gp); log[d] = day;
  s.log = Object.fromEntries(Object.entries(log).sort((a, b) => Number(a[0]) - Number(b[0])).slice(-60));
  burst += Math.round(gp);
  return settle(t);
}
/** growth gained since the last call (the "+N" burst on completion screens) */
let burst = 0;
export const takeBurst = () => { const n = burst; burst = 0; return n; };
/** growth this week and the week before (day numbers, Monday-based like the feed recap) */
export function weekGrowth(s: Garden): { now: number; before: number; by: Record<Src, number> } {
  const d = dayNum(), mon = d - ((d + 3) % 7);
  let now = 0, before = 0;
  const by = Object.fromEntries(SRCS.map((x) => [x, 0])) as Record<Src, number>;
  for (const [k, v] of Object.entries(s.log ?? {})) {
    if (!v || typeof v !== "object") continue;
    const n = Number(k), sum = Object.values(v).reduce((a, b) => a + (b ?? 0), 0);
    if (n >= mon) { now += sum; for (const x of SRCS) by[x] += v[x] ?? 0; } else if (n >= mon - 7) before += sum;
  }
  return { now, before, by };
}

/** Shams Method: every verse grows the tree, a finished session or surah more, a run of Shams days adds a bonus.
 *  Its own daily cap (30, Pro 60) on top of the learning cap, so the method is the fastest way to grow. */
const SHAMS_GP = { verse: 1, session: 6, surah: 10 } as const, SHAMS_CAP = 30;
export function shamsGrow(kind: keyof typeof SHAMS_GP, pro: boolean): number {
  const s = g();
  const t = activeTree(s, pro);
  if (!t) return 0;
  const d = dayNum();
  if (s.shamsDay !== d) { s.shamsRun = s.shamsDay === d - 1 ? (s.shamsRun ?? 0) + 1 : 1; s.shamsDay = d; s.shamsToday = 0; }
  let gp: number = SHAMS_GP[kind];
  if (kind !== "verse" && (s.shamsRun ?? 0) >= 3) gp += Math.min(6, s.shamsRun ?? 0);
  if (pro) gp *= 2; // Pro: twice the growth from the Shams Method
  gp = Math.min(gp, (pro ? 2 : 1) * SHAMS_CAP - (s.shamsToday ?? 0));
  if (gp <= 0) return 0;
  s.shamsToday = (s.shamsToday ?? 0) + gp;
  s.lastActive = d;
  grow(t, gp, "shams");
  save();
  return gp;
}
export const shamsRun = (s: Garden) => (s.shamsDay !== undefined && s.shamsDay >= dayNum() - 1 ? s.shamsRun ?? 0 : 0);
/** first watering of the planting ceremony */
export function firstWater(id: string) { const s = g(); const t = s.trees.find((x) => x.id === id); if (!t || s.watered === dayNum()) return; s.watered = dayNum(); t.hist.push({ d: dayNum(), k: "water" }); grow(t, 5, "quests"); save(); }
export const clearNotifyStage = () => { const s = g(); if (s.notifyStage) { s.notifyStage = undefined; save(); } };

export function plantTree(type: TreeType, name: string, pro: boolean): Tree | null {
  const s = g();
  if (!canPlant(s, pro) || (TREE_TYPES.find((x) => x.id === type)?.pro && !pro)) return null;
  const d = dayNum();
  const t: Tree = { id: `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`, type, name: name.trim().slice(0, 30), planted: d, gp: 0, fruits: 0, fruitDay: d, harvested: 0, hist: [{ d, k: "plant" }], floor: 0 };
  s.trees.push(t);
  s.active = t.id;
  if (s.lastActive === 0) s.lastActive = d;
  save();
  return t;
}
export function setActive(id: string) { const s = g(); if (s.trees.some((t) => t.id === id)) { s.active = id; save(); } }

/** turns new learning into growth, waters once a day after all quests, ripens fruits. Returns stage-ups. */
let seasonDone = false;
export function tickGarden(xp: number, questsDone: boolean, pro: boolean, names: number[] = [], extra?: Partial<Record<Act, number>>): boolean {
  if (names.length) syncNames(names);
  const s = g();
  const t = activeTree(s, pro);
  if (!t) return false;
  const d = dayNum();
  let changed = false, up = false;
  if (s.capDay !== d) { s.capDay = d; s.capped = {}; changed = true; }
  // learning, listening and the feed, from lifetime counters: lessons, quizzes, words, wudu (learn); minutes of
  // recitation and verses heard (listen); feed XP (feed, very little). Each with its own daily cap.
  const c = readPoints().c ?? {};
  const now: Record<string, number> = {
    // lifetime counters (points by kind, feed XP, feed topics)
    lesson: c.lesson ?? 0, quiz: c.quiz ?? 0, vocab: c.vocab ?? 0, wudu: c.wudu ?? 0, listen: c.listen ?? 0, verse: c.verse ?? 0, xp: Math.max(0, xp - s.harvestXp) };
  const st = statsNow().total, tc = topicCounts(st.kinds);
  for (const [k, v] of Object.entries({ hadith: tc.hadith, dua: tc.duas, holy: tc.holy, seerah: tc.seerah, names: st.kinds["name"] ?? 0, share: st.shares })) now[`k:${k}`] = v ?? 0;
  if (!s.base) { s.base = { ...now }; changed = true; }
  const dx = (k: string) => { const v = Math.max(0, now[k] - (s.base![k] ?? now[k])); s.base![k] = now[k]; return v; };
  const dk = (k: string) => dx(`k:${k}`);
  const feedActs: Partial<Record<Act, number>> = { hadith: dk("hadith"), dua: dk("dua"), holy: dk("holy"), seerah: dk("seerah"), names: dk("names"), share: dk("share") };
  const dl = { lesson: dx("lesson"), quiz: dx("quiz"), vocab: dx("vocab"), wudu: dx("wudu"), listen: dx("listen"), verse: dx("verse"), xp: dx("xp") };
  const raw: Partial<Record<Src, number>> = {
    learn: dl.lesson * 4 + dl.quiz * 2 + dl.vocab * 0.2 + dl.wudu * 2,
    listen: dl.listen * 0.3 + dl.verse * 0.1,
    feed: dl.xp / 40,
  };
  const acts: Partial<Record<Act, number>> = { lesson: dl.lesson, quiz: dl.quiz, cards: Math.floor(dl.vocab / 5), wudu: dl.wudu, listen: Math.floor(dl.listen / 3), verse: Math.floor(dl.verse / 3), feed: Math.floor(dl.xp / 20), ...feedActs, ...(extra ?? {}) };
  if (Object.values(acts).some((v) => (v ?? 0) > 0)) activityDrops(acts, seasonNow() === "ramadan");
  for (const src of ["learn", "listen", "feed"] as Src[]) {
    const v = (raw[src] ?? 0) + (s.carry?.[src] ?? 0);
    const whole = Math.floor(v);
    s.carry = { ...(s.carry ?? {}), [src]: v - whole };
    const room = CAPS[src] - (s.capped?.[src] ?? 0);
    const gp = Math.max(0, Math.min(whole, room));
    if (whole > 0) changed = true;
    if (gp > 0) { s.capped = { ...(s.capped ?? {}), [src]: (s.capped?.[src] ?? 0) + gp }; up = grow(t, gp, src) || up; if (src !== "feed") s.lastActive = d; }
  }
  if (questsDone && s.watered !== d) { s.watered = d; s.lastActive = d; t.hist.push({ d, k: "water" }); up = grow(t, WATER_GP, "quests") || up; changed = true; openPack(2, "quest"); }
  if (!seasonDone) { seasonDone = true; seasonalDrops(); }
  claimSeries(t);
  if (!s.traits.includes("garland") && ramadanComplete()) { s.traits.push("garland"); grow(t, 100, "stickers"); changed = true; }
  // fruits: one a day per tree from stage 6 (two with the "fruits" decoration), none while resting
  // the calendar alone can open the next stage (the points were already there)
  for (const tr of s.trees) if (reachedOf(tr) !== (tr.floor ?? 0)) { up = settle(tr) || up; changed = true; }
  for (const tr of s.trees) {
    if (tr.fruitDay >= d) continue;
    if (treeStage(tr) >= FRUIT_STAGE && !resting(s)) tr.fruits = Math.min(fruitCap(s), tr.fruits + Math.min(3, d - tr.fruitDay) * (s.traits.includes("fruits") ? 2 : 1));
    tr.fruitDay = d; changed = true;
  }
  if (changed) save();
  return up;
}

export function harvest(id: string): number {
  const s = g();
  const t = s.trees.find((x) => x.id === id);
  if (!t || t.fruits <= 0) return 0;
  const n = t.fruits, xp = n * FRUIT_XP;
  t.fruits = 0; t.harvested += n; t.hist.push({ d: dayNum(), k: "harvest", n });
  s.harvestXp += xp;
  save();
  bonusXp(xp);
  openPack(1, "harvest");
  return xp;
}

export type GiftResult = { gp: number; trait: Trait | null; up: boolean; full?: boolean } | null;
/** today's sticker growth: each further sticker counts less (1, 1/2, 1/3 …), at most CAPS.stickers a day */
function stickerRoom(s: Garden): number { const d = dayNum(); if (s.capDay !== d) { s.capDay = d; s.capped = {}; } return CAPS.stickers - (s.capped?.stickers ?? 0); }
const TRAIT_ORDER: Trait[] = ["blossoms", "lanterns", "bench", "fountain", "plaque", "crescent", "star", "fruits"];
const nextTrait = (s: Garden) => TRAIT_ORDER.find((x) => !s.traits.includes(x)) ?? null;
/** gives a sticker to the active tree: a duplicate, or (unique, after confirmation) a collected sticker once.
 *  Works for the feed stickers (gamify) and the large collection (catalog ids like "a:2:255"). */
export function giveSticker(id: string, unique: boolean, pro: boolean): GiftResult {
  const s = g();
  const t = activeTree(s, pro);
  if (!t) return null;
  if (stickerRoom(s) <= 0) return { gp: 0, trait: null, up: false, full: true }; // nothing spent: the tree is full for today
  const def = STICKER.get(id);
  let gp: number, trait: Trait | null = null;
  if (def) {
    if (unique) { if (s.given.includes(id)) return null; s.given.push(id); }
    else if (!takeDupe(id)) return null;
    gp = stickerGp(def, unique);
    const tr = RARE_TRAIT[id];
    if (tr && !s.traits.includes(tr)) trait = tr;
  } else {
    if (!itemById(id) || !spendSticker(id, unique)) return null;
    const r = rarityOf(id);
    gp = RARITY_GP[r] * (unique ? 2 : 1);
    if (RARE_TRAIT[id] && !s.traits.includes(RARE_TRAIT[id])) trait = RARE_TRAIT[id];
    else if (r === "legendary") trait = nextTrait(s);
  }
  const n = s.giftDay === dayNum() ? (s.giftsToday ?? 0) : 0;
  s.giftDay = dayNum(); s.giftsToday = n + 1;
  gp = Math.max(1, Math.min(stickerRoom(s), Math.round(gp / (1 + n))));
  s.capped = { ...(s.capped ?? {}), stickers: (s.capped?.stickers ?? 0) + gp };
  const up = grow(t, gp, "stickers");
  t.hist.push({ d: dayNum(), k: "gift" });
  if (trait) s.traits.push(trait);
  s.lastActive = dayNum();
  save();
  return { gp, trait, up };
}

/** finished sticker series: a big growth burst and a decoration, once per series */
export type SeriesReward = { series: Series; gp: number; trait: Trait | null };
const seriesSubs = new Set<(r: SeriesReward) => void>();
export const onSeriesReward = (f: (r: SeriesReward) => void) => { seriesSubs.add(f); return () => { seriesSubs.delete(f); }; };
function claimSeries(t: Tree) {
  const s = g();
  for (const se of newlyCompleted()) {
    const gp = completionGp(se), trait = nextTrait(s);
    grow(t, gp, "stickers");
    if (trait) s.traits.push(trait);
    const r = { series: se, gp, trait };
    emitSeries(r);
  }
}

export type Season = "ramadan" | "eid" | null;
export function seasonNow(): Season {
  try {
    const h = toHijri(todayUtc());
    if (h.m === 9) return "ramadan";
    if ((h.m === 10 && h.d <= 3) || (h.m === 12 && h.d >= 10 && h.d <= 13)) return "eid";
  } catch { /* calendar unavailable */ }
  return null;
}

/** for the stories rail of the feed: the active tree's stage and progress, or a seed when nothing is planted */
export function useGardenRing(pro: boolean): { planted: boolean; stage: number; frac: number; fruits: number; type: TreeType; id: string } {
  const s = useGarden();
  useGamify();
  const t = activeTree(s, pro);
  if (!t) return { planted: false, stage: 0, frac: 0, fruits: 0, type: "olive", id: "seed" };
  const p = progressOf(t, pro);
  return { planted: true, stage: p.stage, frac: p.frac, fruits: t.fruits, type: t.type, id: t.id };
}

// ---------- account sync ----------
export function mergeGarden(a0: Garden | undefined, b0: Garden | undefined): Garden | undefined {
  const a = a0 && migrate(a0), b = b0 && migrate(b0);
  if (!a || !b) return a ?? b;
  const newer = (a.at ?? 0) >= (b.at ?? 0) ? a : b;
  const byId = new Map<string, Tree>();
  for (const t of [...(b.trees ?? []), ...(a.trees ?? [])]) {
    const o = byId.get(t.id);
    if (!o) { byId.set(t.id, t); continue; }
    const n = newer.trees?.find((x) => x.id === t.id) ?? t;
    const hist = [...o.hist, ...t.hist].filter((h, i, arr) => arr.findIndex((x) => x.d === h.d && x.k === h.k && x.n === h.n) === i).sort((x, y) => x.d - y.d).slice(-60);
    byId.set(t.id, { ...n, gp: Math.max(o.gp, t.gp), harvested: Math.max(o.harvested, t.harvested), planted: Math.min(o.planted, t.planted), floor: Math.max(o.floor ?? rawStage(o.gp), t.floor ?? rawStage(t.gp)), fruitDay: Math.max(o.fruitDay, t.fruitDay), fruits: Math.min(n.fruits, Math.max(o.fruits, t.fruits)), hist });
  }
  const trees = [...byId.values()].sort((x, y) => x.planted - y.planted).slice(0, 8);
  return {
    ...empty(), ...newer, trees,
    traits: Array.from(new Set([...(a.traits ?? []), ...(b.traits ?? [])])),
    given: Array.from(new Set([...(a.given ?? []), ...(b.given ?? [])])),
    harvestXp: Math.max(a.harvestXp ?? 0, b.harvestXp ?? 0),
    log: Object.fromEntries([...new Set([...Object.keys(a.log ?? {}), ...Object.keys(b.log ?? {})])].map((k) => { const x = a.log?.[k] ?? {}, y = b.log?.[k] ?? {}; return [k, Object.fromEntries(SRCS.map((sr) => [sr, Math.max(x[sr] ?? 0, y[sr] ?? 0)]))]; }).sort((x, y) => Number(x[0]) - Number(y[0])).slice(-60)),
    watered: Math.max(a.watered ?? 0, b.watered ?? 0), lastActive: Math.max(a.lastActive ?? 0, b.lastActive ?? 0),
  };
}
