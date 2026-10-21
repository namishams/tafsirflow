// mirrors mobile/src/features/shams2/weakSpots.ts (copied for the website; keep in step with the app)
import type { Known } from "./qualityModel";
import type { MutStat, Words } from "./store";

// Weak spots: words and verses with repeated errors, collected automatically from
//   – verse reviews that slipped at least twice (lapses) or whose recall has fallen below 50 %,
//   – words missed at least twice in recitation checks and drills (more misses than later successes),
//   – mutashabihat that were confused at least twice.
export type WeakSpot = { key: string; words: number[]; reason: ("lapses" | "fading" | "words" | "mutashabih")[]; weight: number };

export function weakSpots(known: Map<string, Known>, words: Words, mut: Record<string, MutStat>, limit = 40): WeakSpot[] {
  const out = new Map<string, WeakSpot>();
  const add = (key: string, r: WeakSpot["reason"][number], w: number, pos: number[] = []) => {
    const cur = out.get(key) ?? { key, words: [], reason: [], weight: 0 };
    if (!cur.reason.includes(r)) cur.reason.push(r);
    cur.weight += w;
    cur.words = [...new Set([...cur.words, ...pos])].sort((a, b) => a - b);
    out.set(key, cur);
  };
  for (const k of known.values()) {
    if (k.lapses >= 2) add(k.key, "lapses", k.lapses);
    if (k.recall < 0.5) add(k.key, "fading", (0.5 - k.recall) * 6);
  }
  for (const [key, ws] of Object.entries(words)) {
    const bad = Object.entries(ws).filter(([, w]) => w.miss >= 2 && w.miss > w.ok).map(([p]) => Number(p));
    if (bad.length) add(key, "words", bad.length * 1.5, bad);
  }
  for (const [key, m] of Object.entries(mut)) if (m.miss >= 2 && m.miss > m.ok) add(key, "mutashabih", m.miss - m.ok);
  return [...out.values()].sort((a, b) => b.weight - a.weight).slice(0, limit);
}
