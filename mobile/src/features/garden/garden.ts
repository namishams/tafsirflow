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
export type Tree = { id: string; type: TreeType; name: string; planted: number; gp: number; fruits: number; fruitDay: number; harvested: number; hist: Hist[] };
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
};
const empty = (): Garden => ({ trees: [], active: null, traits: [], given: [], learn: -1, harvestXp: 0, learnDay: 0, learnToday: 0, watered: 0, lastActive: 0, at: 0 });

// 13 stages (0 = seed … 12 = ancient tree); at the daily maximum stage 12 takes about three months, usually much longer
export const STAGES = [0, 30, 80, 160, 280, 450, 700, 1000, 1400, 1900, 2600, 3500, 4600];
export const MAX_STAGE = STAGES.length - 1;
/** without Pro the tree grows to a young tree (stage 6) and stays healthy there; growth keeps counting for later */
export const FREE_STAGE = 6;
let proNow = false;
const rawStage = (gp: number) => { let s = 0; while (s < MAX_STAGE && gp >= STAGES[s + 1]) s++; return s; };
export const stageOf = (gp: number, pro = proNow) => (pro ? rawStage(gp) : Math.min(FREE_STAGE, rawStage(gp)));
export function progressOf(gp: number, pro = proNow): { stage: number; frac: number; left: number; held: boolean } {
  const s = stageOf(gp, pro);
  if (!pro && s >= FREE_STAGE) return { stage: s, frac: 1, left: 0, held: true };
  if (s >= MAX_STAGE) return { stage: s, frac: 1, left: 0, held: false };
  return { stage: s, frac: (gp - STAGES[s]) / (STAGES[s + 1] - STAGES[s]), left: STAGES[s + 1] - gp, held: false };
}
/** 4 feed XP make 1 growth point, at most 40 a day from learning; watering adds 15 */
const WATER_GP = 15, FRUIT_XP = 10;
const CAPS: Record<Src, number> = { shams: 160, learn: 40, listen: 15, quests: 30, stickers: 9999, feed: 6 };
export const FRUIT_STAGE = 5;
export const PLOT_STAGES = [6, 9, 12];
export const STICKER_GP_HINT = (d: StickerDef, unique: boolean) => stickerGp(d, unique);
export const stickerGp = (d: StickerDef, unique: boolean) => (d.rare ? 50 : d.tone === "gold" ? 20 : d.tone === "night" ? 12 : 8) * (unique ? 2 : 1);

let cache: Garden | null = null;
function g(): Garden {
  if (!cache) { const r = readJSON<Partial<Garden>>(GARDEN_KEY, {}); cache = { ...empty(), ...r, trees: Array.isArray(r.trees) ? r.trees : [], traits: r.traits ?? [], given: r.given ?? [] }; }
  return cache;
}
function save() { const s = g(); s.at = Date.now(); for (const t of s.trees) t.hist = t.hist.slice(-60); writeJSON(GARDEN_KEY, s); }
export const reloadGarden = () => { cache = null; };
export const readGarden = (): Garden => g();
export const markFlourishSeen = () => { const s = g(); if (!s.flourishSeen) { s.flourishSeen = true; save(); } };
export function useGarden(): Garden { useStored(GARDEN_KEY, {}); return g(); }

export const plotsOf = (s: Garden) => 1 + PLOT_STAGES.filter((n) => s.trees[0] && rawStage(s.trees[0].gp) >= n).length;
export const activeTree = (s: Garden, pro: boolean): Tree | null => ((proNow = pro) ? s.trees.find((t) => t.id === s.active) : null) ?? s.trees[0] ?? null;
export const canPlant = (s: Garden, pro: boolean) => s.trees.length === 0 || (pro && s.trees.length < plotsOf(s));
export const resting = (s: Garden) => s.trees.length > 0 && s.lastActive > 0 && dayNum() - s.lastActive >= 3;
export const fruitCap = (s: Garden) => (s.traits.includes("fruits") ? 5 : 3);

// stage-up celebrations (full screen, GardenCelebrate in the root layout)
export type StageUp = { tree: Tree; stage: number };
const subs = new Set<(e: StageUp) => void>();
export const onStageUp = (f: (e: StageUp) => void) => { subs.add(f); return () => { subs.delete(f); }; };
/** Ramadan doubles all growth; Fridays and the first ten days of Dhul-Hijjah add a quarter */
export function growthBoost(): number {
  try { const h = toHijri(todayUtc()); if (h.m === 9) return 2; if (h.m === 12 && h.d <= 10) return 1.25; } catch { /* no calendar */ }
  return new Date().getDay() === 5 ? 1.25 : 1;
}
function grow(t: Tree, gp0: number, src: Src) {
  const gp = Math.round(gp0 * growthBoost());
  const before = stageOf(t.gp);
  t.gp = Math.round(t.gp + gp);
  const s = g(), d = String(dayNum());
  const log = { ...(s.log ?? {}) }; const day = { ...(typeof log[d] === "object" ? log[d] : {}) }; day[src] = (day[src] ?? 0) + Math.round(gp); log[d] = day;
  s.log = Object.fromEntries(Object.entries(log).sort((a, b) => Number(a[0]) - Number(b[0])).slice(-60));
  burst += Math.round(gp);
  const after = stageOf(t.gp);
  for (let k = before + 1; k <= after; k++) t.hist.push({ d: dayNum(), k: "stage", n: k });
  if (after > before) { s.notifyStage = after; const e = { tree: t, stage: after }; setTimeout(() => subs.forEach((f) => f(e)), 0); }
  return after > before;
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
 *  Its own daily cap (80) on top of the learning cap, so the method is the fastest way to grow. */
const SHAMS_GP = { verse: 3, session: 15, surah: 20 } as const, SHAMS_CAP = 80;
export function shamsGrow(kind: keyof typeof SHAMS_GP, pro: boolean): number {
  const s = g();
  const t = activeTree(s, pro);
  if (!t) return 0;
  const d = dayNum();
  if (s.shamsDay !== d) { s.shamsRun = s.shamsDay === d - 1 ? (s.shamsRun ?? 0) + 1 : 1; s.shamsDay = d; s.shamsToday = 0; }
  let gp: number = SHAMS_GP[kind];
  if (kind !== "verse" && (s.shamsRun ?? 0) >= 3) gp += Math.min(20, (s.shamsRun ?? 0) * 2);
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
  const t: Tree = { id: `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`, type, name: name.trim().slice(0, 30), planted: d, gp: 0, fruits: 0, fruitDay: d, harvested: 0, hist: [{ d, k: "plant" }] };
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
    learn: dl.lesson * 12 + dl.quiz * 6 + dl.vocab * 0.5 + dl.wudu * 6,
    listen: dl.listen * 0.6 + dl.verse * 0.3,
    feed: dl.xp / 20,
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
  if (!s.traits.includes("garland") && ramadanComplete()) { s.traits.push("garland"); grow(t, 300, "stickers"); changed = true; }
  // fruits: one a day per tree from stage 6 (two with the "fruits" decoration), none while resting
  for (const tr of s.trees) {
    if (tr.fruitDay >= d) continue;
    if (stageOf(tr.gp) >= FRUIT_STAGE && !resting(s)) tr.fruits = Math.min(fruitCap(s), tr.fruits + Math.min(3, d - tr.fruitDay) * (s.traits.includes("fruits") ? 2 : 1));
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

export type GiftResult = { gp: number; trait: Trait | null; up: boolean } | null;
const TRAIT_ORDER: Trait[] = ["blossoms", "lanterns", "bench", "fountain", "plaque", "crescent", "star", "fruits"];
const nextTrait = (s: Garden) => TRAIT_ORDER.find((x) => !s.traits.includes(x)) ?? null;
/** gives a sticker to the active tree: a duplicate, or (unique, after confirmation) a collected sticker once.
 *  Works for the feed stickers (gamify) and the large collection (catalog ids like "a:2:255"). */
export function giveSticker(id: string, unique: boolean, pro: boolean): GiftResult {
  const s = g();
  const t = activeTree(s, pro);
  if (!t) return null;
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
    setTimeout(() => seriesSubs.forEach((f) => f(r)), 0);
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
  const p = progressOf(t.gp, pro);
  return { planted: true, stage: p.stage, frac: p.frac, fruits: t.fruits, type: t.type, id: t.id };
}

// ---------- account sync ----------
export function mergeGarden(a: Garden | undefined, b: Garden | undefined): Garden | undefined {
  if (!a || !b) return a ?? b;
  const newer = (a.at ?? 0) >= (b.at ?? 0) ? a : b;
  const byId = new Map<string, Tree>();
  for (const t of [...(b.trees ?? []), ...(a.trees ?? [])]) {
    const o = byId.get(t.id);
    if (!o) { byId.set(t.id, t); continue; }
    const n = newer.trees?.find((x) => x.id === t.id) ?? t;
    const hist = [...o.hist, ...t.hist].filter((h, i, arr) => arr.findIndex((x) => x.d === h.d && x.k === h.k && x.n === h.n) === i).sort((x, y) => x.d - y.d).slice(-60);
    byId.set(t.id, { ...n, gp: Math.max(o.gp, t.gp), harvested: Math.max(o.harvested, t.harvested), planted: Math.min(o.planted, t.planted), fruitDay: Math.max(o.fruitDay, t.fruitDay), fruits: Math.min(n.fruits, Math.max(o.fruits, t.fruits)), hist });
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
