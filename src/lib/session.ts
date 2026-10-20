import { readJSON, writeJSON } from "./storage";
import { dayPlan, NOT_COUNTED } from "./coach";
import { readSrs, today } from "./learning";
import { award } from "./points";
import { VERSE_COUNTS } from "./counts";

// Today's guided session: one button runs the whole day – repairs, reviews (weakest first), then new verses with the
// Shams method – verse after verse, across surahs, with a progress bar and a summary at the end. Kept on this device.
export type SessionItem = { key: string; kind: "repair" | "review" | "new" };
export type Session = { day: number; items: SessionItem[]; i: number; startedAt: number; ok: number; again: number; requeued: string[]; skipped?: string[] };
export type SessionSummary = { day: number; done: number; fresh: number; again: number; minutes: number };
const KEY = "tf:session";
const DONE = "tf:sessionDone";
const MAX_REVIEWS = 30;

export function buildSession(): Session {
  const plan = dayPlan();
  const srs = readSrs();
  const items: SessionItem[] = [
    ...plan.repair.map((key) => ({ key, kind: "repair" as const })),
    ...plan.reviews.slice(0, MAX_REVIEWS).map((key) => ({ key, kind: "review" as const })),
  ];
  // new verses: continue where the coach says, in order, skipping what is already learned
  let { surah: s, verse: v } = plan.next;
  for (let n = 0; n < plan.newVerses && s <= 114; ) {
    const key = `${s}:${v}`;
    if (!srs[key] && !NOT_COUNTED.has(key)) { items.push({ key, kind: "new" }); n++; }
    if (++v > VERSE_COUNTS[s - 1]) break; // a new surah is a new day's decision
  }
  return { day: today(), items, i: 0, startedAt: Date.now(), ok: 0, again: 0, requeued: [] };
}

export const readSession = (): Session | null => {
  const s = readJSON<Session | null>(KEY, null);
  return s && s.day === today() && s.i < s.items.length ? s : null;
};
export const startSession = (): Session => { const s = buildSession(); writeJSON(KEY, s); return s; };
export const currentItem = (s: Session | null) => (s ? s.items[s.i] ?? null : null);
export const itemUrl = (it: SessionItem) => { const [s, v] = it.key.split(":"); return `/surah/${s}?v=${v}&session=1${it.kind === "new" ? "&shams=1" : "&m=2"}`; };
export const readSummary = () => { const d = readJSON<SessionSummary | null>(DONE, null); return d && d.day === today() ? d : null; };

// The learner finished the current verse. "again" brings a review back once at the end of the session.
// skip = the item cannot be practised here (e.g. locked for free users): it moves on without counting as done.
export function completeItem(key: string, ok: boolean, skip = false): SessionItem | null {
  const s = readJSON<Session | null>(KEY, null);
  if (!s || s.day !== today()) return null;
  const cur = s.items[s.i];
  if (cur && cur.key === key) {
    if (skip) s.skipped = [...(s.skipped ?? []), key];
    else if (ok) s.ok++; else s.again++;
    if (!skip && !ok && cur.kind !== "new" && !s.requeued.includes(key)) { s.items.push({ ...cur, kind: "repair" }); s.requeued.push(key); }
    s.i++;
  }
  if (s.i >= s.items.length) { finish(s); return null; }
  writeJSON(KEY, s);
  return s.items[s.i];
}

function finish(s: Session) {
  writeJSON(DONE, { day: s.day, done: new Set(s.items.slice(0, s.i).map((x) => x.key).filter((k) => !s.skipped?.includes(k))).size, fresh: s.items.slice(0, s.i).filter((x) => x.kind === "new" && !s.skipped?.includes(x.key)).length, again: s.again, minutes: Math.max(1, Math.round((Date.now() - s.startedAt) / 60000)) } satisfies SessionSummary);
  writeJSON(KEY, null);
  if (s.i >= s.items.length) award("session");
}
export const endSession = () => { const s = readJSON<Session | null>(KEY, null); if (s) finish(s); };
