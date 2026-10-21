import { reloadGamify, GAMIFY_KEY, type Gamify } from "./gamify";
import { reloadStats, STATS2_KEY, type DayStats, type Stats } from "./statsStore";

// Feed data in the account sync (lib/sync.ts): saved posts of every kind, likes, the feed statistics, gamification
// (XP, quests, stickers) and the seen stickers. Merge rules: union for saves/likes/stickers, max for counters, the
// newer record for settings-like fields. Payload is bounded (days, list lengths, no offer/promo funnel counters).
export const FEED_SYNC_KEYS = ["tf:story-saves", "qmc.hadithSaved", "tf:feed-likes", "tf:stickers", GAMIFY_KEY, STATS2_KEY] as const;

const SYNC_DAYS = 60;
const strList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const union = (a: unknown, b: unknown, cap: number) => Array.from(new Set([...strList(a), ...strList(b)])).slice(-cap);
const numList = (a: unknown, b: unknown, cap: number) =>
  Array.from(new Set([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])].filter((x): x is number => typeof x === "number"))).sort((x, y) => x - y).slice(-cap);
const maxMap = (a: Record<string, number> | undefined, b: Record<string, number> | undefined) => {
  const out: Record<string, number> = { ...(b ?? {}) };
  for (const [k, v] of Object.entries(a ?? {})) if (typeof v === "number") out[k] = Math.max(out[k] ?? 0, v);
  return out;
};

type Hadith = { id: string };
function mergeHadith(a: unknown, b: unknown): Hadith[] {
  const out: Hadith[] = [];
  const ids = new Set<string>();
  for (const h of [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])] as Hadith[]) if (h && typeof h.id === "string" && !ids.has(h.id)) { ids.add(h.id); out.push(h); }
  return out.slice(0, 200);
}

const isCounting = (k: string) => !k.startsWith("offer:") && !k.startsWith("promo:");
function mergeDay(a: DayStats | undefined, b: DayStats | undefined): DayStats | undefined {
  if (!a || !b) return a ?? b;
  const out = { ...b } as Record<string, unknown>;
  for (const [k, v] of Object.entries(a)) if (typeof v === "number") out[k] = Math.max(Number(out[k]) || 0, v);
  out.kinds = maxMap(a.kinds, b.kinds);
  return out as DayStats;
}
/** the synced copy of the statistics: recent days only, without the local offer/promo funnel */
function trimStats(s: Stats | undefined): Stats | undefined {
  if (!s || typeof s !== "object") return undefined;
  const keep = (d: DayStats) => ({ ...d, kinds: Object.fromEntries(Object.entries(d.kinds ?? {}).filter(([k]) => isCounting(k))) });
  const days = Object.entries(s.days ?? {}).sort((x, y) => Number(y[0]) - Number(x[0])).slice(0, SYNC_DAYS);
  return { ...s, days: Object.fromEntries(days.map(([k, d]) => [k, keep(d)])), total: keep(s.total) };
}
function mergeStats(a: Stats | undefined, b: Stats | undefined): Stats | undefined {
  if (!a || !b) return a ?? b;
  const days: Record<string, DayStats> = { ...b.days };
  for (const [k, d] of Object.entries(a.days ?? {})) days[k] = mergeDay(d, days[k])!;
  return { days, total: mergeDay(a.total, b.total)!, longestMs: Math.max(a.longestMs ?? 0, b.longestMs ?? 0), firstDay: Math.min(a.firstDay ?? Infinity, b.firstDay ?? Infinity) };
}

function mergeGamify(a: Gamify | undefined, b: Gamify | undefined): Gamify | undefined {
  if (!a || !b) return a ?? b;
  // the record that is further along (newer day, then more XP) supplies today's quests and settings-like fields
  const [n, o] = (a.day ?? 0) > (b.day ?? 0) || ((a.day ?? 0) === (b.day ?? 0) && (a.xp ?? 0) >= (b.xp ?? 0)) ? [a, b] : [b, a];
  const max = (k: "xp" | "quiz" | "quests" | "ramadan" | "tahajjud" | "fajr" | "friday") => Math.max(n[k] ?? 0, o[k] ?? 0);
  return {
    ...o, ...n,
    recv: Math.max(n.recv ?? 0, o.recv ?? 0), gave: Math.max(n.gave ?? 0, o.gave ?? 0),
    xp: max("xp"), quiz: max("quiz"), quests: max("quests"), ramadan: max("ramadan"), tahajjud: max("tahajjud"), fajr: max("fajr"), friday: max("friday"),
    names: numList(n.names, o.names, 99), holy: union(n.holy, o.holy, 80), frozen: numList(n.frozen, o.frozen, 30),
    stickers: maxMap(n.stickers, o.stickers),
    last: maxMap(n.last, o.last) as Gamify["last"],
    rec: maxMap(n.rec, o.rec) as Gamify["rec"],
  };
}

/** merged feed keys (local wins ties); undefined values are left out */
export function mergeFeed(local: Record<string, unknown>, remote: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {
    "tf:story-saves": union(local["tf:story-saves"], remote["tf:story-saves"], 500),
    "qmc.hadithSaved": mergeHadith(local["qmc.hadithSaved"], remote["qmc.hadithSaved"]),
    "tf:feed-likes": union(local["tf:feed-likes"], remote["tf:feed-likes"], 1000),
    "tf:stickers": union(local["tf:stickers"], remote["tf:stickers"], 300),
    [GAMIFY_KEY]: mergeGamify(local[GAMIFY_KEY] as Gamify | undefined, remote[GAMIFY_KEY] as Gamify | undefined),
    [STATS2_KEY]: mergeStats(local[STATS2_KEY] as Stats | undefined, trimStats(remote[STATS2_KEY] as Stats | undefined)),
  };
  for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k];
  return out;
}

/** the bounded copy sent to the server */
export function feedSnapshot(read: <T>(k: string, f: T) => T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  out["tf:story-saves"] = strList(read("tf:story-saves", [])).slice(-500);
  out["qmc.hadithSaved"] = mergeHadith(read("qmc.hadithSaved", []), []);
  out["tf:feed-likes"] = strList(read("tf:feed-likes", [])).slice(-1000);
  out["tf:stickers"] = strList(read("tf:stickers", [])).slice(-300);
  const g = read<Gamify | null>(GAMIFY_KEY, null);
  if (g) out[GAMIFY_KEY] = g;
  const s = trimStats(read<Stats | null>(STATS2_KEY, null) ?? undefined);
  if (s) out[STATS2_KEY] = s;
  return out;
}

/** after merged values were written: drop the in-memory caches so the feed reads the merged records */
export function reloadFeedCaches() { reloadGamify(); reloadStats(); }
