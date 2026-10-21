import { readJSON, writeJSON } from "@/lib/store";

// On-device interest per post kind (never uploaded): dwell over 3 s, likes, saves, shares and "Learn this" raise it,
// fast skips lower it. Scores stay between 0.3 and 3 and drift back to 1 over time; the scheduler multiplies its base
// weights with them and still keeps exploring. Several fast skips in a row = boredom: the next post switches format.
export const INTEREST_KEY = "qmc.feed-interest";
type Store = { s: Record<string, number>; at: number };
let st: Store | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
function load(): Store {
  if (st) return st;
  st = readJSON<Store>(INTEREST_KEY, { s: {}, at: Date.now() });
  // decay toward 1: half of the distance per week
  const weeks = (Date.now() - st.at) / (7 * 86400000);
  if (weeks > 0.05) { const f = Math.pow(0.5, weeks); for (const k of Object.keys(st.s)) st.s[k] = 1 + (st.s[k] - 1) * f; st.at = Date.now(); }
  return st;
}
function save() { timer ??= setTimeout(() => { timer = null; const s = load(); const e = Object.entries(s.s); if (e.length > 80) s.s = Object.fromEntries(e.slice(-80)); writeJSON(INTEREST_KEY, s, true); }, 3000); }
function nudge(kind: string, by: number) {
  if (!kind) return;
  const s = load();
  s.s[kind] = Math.min(3, Math.max(0.3, (s.s[kind] ?? 1) * by));
  save();
}
export const interestOf = (kind: string) => load().s[kind] ?? 1;
export const resetInterest = () => { st = { s: {}, at: Date.now() }; writeJSON(INTEREST_KEY, st, true); skips = 0; };

let skips = 0;
let bored = false;
/** a post left the screen after `ms` */
export function dwell(kind: string, ms: number) {
  if (ms < 1200) { nudge(kind, 0.93); skips++; if (skips >= 3) { bored = true; skips = 0; } }
  else { skips = 0; if (ms > 3000) nudge(kind, ms > 10000 ? 1.12 : 1.05); }
}
export const engaged = (kind: string, strength: "like" | "save" | "share" | "learn") => nudge(kind, { like: 1.15, save: 1.25, share: 1.3, learn: 1.2 }[strength]);
/** true once after a run of fast skips */
export function takeBoredom(): boolean { const b = bored; bored = false; return b; }
export const isBored = () => bored;

/** initial boosts from the onboarding interests: raises these kinds to at least `to` (never lowers a learned score) */
export function seedInterests(kinds: string[], to = 1.8) {
  const s = load();
  for (const k of kinds) if (k) s.s[k] = Math.min(3, Math.max(s.s[k] ?? 1, to));
  save();
}
