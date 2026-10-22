// mirrors mobile/src/features/shams2/store2.ts (copied for the website; keep in step with the app)
import { useMemo } from "react";
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";
import { today } from "@/lib/learning";

// Shams Method 3.0 – the new local keys next to store.ts (which stays as it is). Every key is versioned and bounded;
// new fields are added, never renamed. Synced with the account (merge rules in syncExtra.ts): links, understand,
// rubric, makhraj, pace, today, flex. Only on this device: takes (recordings stay on the device) and the cache of the
// teacher recitations (the server holds the real list).
// Field names stay short and every map is bounded: the website sends all learning keys in one request (400 KB limit).
export const K2 = {
  links: "qmc.shams2.links.v1", // "<s>:<v>" -> the transition from verse v-1 into verse v { ok, miss, last, box }
  understand: "qmc.shams2.understand.v1", // verse key -> comprehension answers { ok, miss, last }
  rubric: "qmc.shams2.rubric.v1", // verse key -> pronunciation rating { self?, teacher? } (1–5 per criterion)
  makhraj: "qmc.shams2.makhraj.v1", // letter -> listening quiz answers and own rating { ok, miss, self?, last }
  pace: "qmc.shams2.pace.v1", // own learning pace for new verses { newMsPerWord: last 30 samples, at }
  today: "qmc.shams2.today.v1", // today's minutes chosen in the wird { day, minutes, at }
  flex: "qmc.shams.flex.v1", // settings of the flexible classic path { tafsir, wordLoop }
  takes: "qmc.shams2.takes.v1", // index of own recordings on this device (not synced)
  recitations: "qmc.teacher.recitations.v1", // cache of recitations sent to / received from a teacher (not synced)
} as const;

/** limits (the sync merge in lib/syncExtra.ts uses the same numbers) */
export const LIMITS = { links: 1500, understand: 1500, rubric: 500, makhraj: 64, pace: 30, takes: 100, recitations: 100 } as const;

type Stamped = { last: number };
/** keeps the `max` entries with the newest time */
function newest<T>(all: Record<string, T>, max: number, at: (v: T) => number): Record<string, T> {
  const ks = Object.keys(all);
  if (ks.length <= max) return all;
  return Object.fromEntries(ks.sort((a, b) => at(all[b]) - at(all[a])).slice(0, max).map((k) => [k, all[k]]));
}
const lastOf = (v: Stamped) => v.last;
const isVerseKey = (k: string) => /^\d{1,3}:\d{1,3}$/.test(k);

// ---------- transitions (rabṭ): verse v-1 -> verse v ----------
export type LinkStat = { ok: number; miss: number; last: number; box: number }; // box: Leitner box 0–5 (miss -> 0)
export type Links = Record<string, LinkStat>;
/** the key of the transition into verse v of surah s (from verse v-1); verse 1 has none */
export const linkKey = (s: number, v: number) => `${s}:${v}`;
/** the verse a transition starts from ("2:5" -> "2:4"); null for the first verse */
export function linkFrom(key: string): string | null {
  const [s, v] = key.split(":").map(Number);
  return s && v > 1 ? `${s}:${v - 1}` : null;
}
export const readLinks = () => readJSON<Links>(K2.links, {});
export const useLinks = () => useStored<Links>(K2.links, {});
/** several transitions at once (one write): key = the verse the transition leads into, ok = it held */
export function noteLinks(results: { key: string; ok: boolean }[]) {
  const list = results.filter((r) => isVerseKey(r.key) && linkFrom(r.key));
  if (!list.length) return;
  const all = { ...readLinks() };
  const now = Date.now();
  for (const r of list) {
    const cur = all[r.key] ?? { ok: 0, miss: 0, last: 0, box: 0 };
    all[r.key] = r.ok ? { ...cur, ok: cur.ok + 1, last: now, box: Math.min(5, cur.box + 1) } : { ...cur, miss: cur.miss + 1, last: now, box: 0 };
  }
  writeJSON(K2.links, newest(all, LIMITS.links, lastOf));
}
export const noteLink = (key: string, ok: boolean) => noteLinks([{ key, ok }]);

// ---------- comprehension (multiple choice: which translation belongs to this verse) ----------
export type UnderstandStat = { ok: number; miss: number; last: number };
export type Understand = Record<string, UnderstandStat>;
export const readUnderstand = () => readJSON<Understand>(K2.understand, {});
export const useUnderstand = () => useStored<Understand>(K2.understand, {});
export function noteUnderstand(verseKey: string, right: boolean) {
  if (!isVerseKey(verseKey)) return;
  const all = readUnderstand();
  const cur = all[verseKey] ?? { ok: 0, miss: 0, last: 0 };
  writeJSON(K2.understand, newest({ ...all, [verseKey]: { ok: cur.ok + (right ? 1 : 0), miss: cur.miss + (right ? 0 : 1), last: Date.now() } }, LIMITS.understand, lastOf));
}

// ---------- pronunciation rubric (self rating or a teacher's rating, never from speech recognition) ----------
export const RUBRIC_FIELDS = ["makharij", "tajweed", "waqf", "pace"] as const;
export type RubricField = (typeof RUBRIC_FIELDS)[number];
/** 1–5 per criterion (as in the Mishary mentoring rubric); a criterion that was not rated is left out */
export type RubricScores = Partial<Record<RubricField, number>>;
export type RubricSide = RubricScores & { at: number; by?: string }; // by: the teacher's name (teacher side only)
export type RubricEntry = { self?: RubricSide; teacher?: RubricSide };
export type Rubric = Record<string, RubricEntry>;
export const readRubric = () => readJSON<Rubric>(K2.rubric, {});
export const useRubric = () => useStored<Rubric>(K2.rubric, {});
const rubricAt = (e: RubricEntry) => Math.max(e.self?.at ?? 0, e.teacher?.at ?? 0);
/** a rating replaces the earlier one of the same side; false when no criterion was rated */
export function noteRubric(verseKey: string, scores: RubricScores, side: "self" | "teacher" = "self", by?: string): boolean {
  if (!isVerseKey(verseKey)) return false;
  const clean: RubricScores = {};
  for (const f of RUBRIC_FIELDS) { const v = scores[f]; if (typeof v === "number" && Number.isFinite(v)) clean[f] = Math.min(5, Math.max(1, Math.round(v))); }
  if (!Object.keys(clean).length) return false;
  const all = readRubric();
  const entry: RubricSide = { ...clean, at: Date.now(), ...(side === "teacher" && by ? { by: by.slice(0, 60) } : {}) };
  writeJSON(K2.rubric, newest({ ...all, [verseKey]: { ...(all[verseKey] ?? {}), [side]: entry } }, LIMITS.rubric, rubricAt));
  return true;
}

// ---------- makhraj coach (per letter) ----------
export type MakhrajStat = { ok: number; miss: number; self?: number; last: number }; // self: own rating 1–5, the latest
export type Makhraj = Record<string, MakhrajStat>;
export const readMakhraj = () => readJSON<Makhraj>(K2.makhraj, {});
export const useMakhraj = () => useStored<Makhraj>(K2.makhraj, {});
/** a listening-quiz answer (right) and/or an own rating (self, 1–5) for one letter */
export function noteMakhraj(letter: string, p: { right?: boolean; self?: number }) {
  const l = letter.trim().slice(0, 4);
  if (!l || (p.right === undefined && p.self === undefined)) return;
  const all = readMakhraj();
  const cur = all[l] ?? { ok: 0, miss: 0, last: 0 };
  const next: MakhrajStat = { ...cur, ok: cur.ok + (p.right === true ? 1 : 0), miss: cur.miss + (p.right === false ? 1 : 0), last: Date.now() };
  if (typeof p.self === "number" && Number.isFinite(p.self)) next.self = Math.min(5, Math.max(1, Math.round(p.self)));
  writeJSON(K2.makhraj, newest({ ...all, [l]: next }, LIMITS.makhraj, lastOf));
}

// ---------- own pace for new verses ----------
export type Pace = { newMsPerWord: number[]; at: number };
const EMPTY_PACE: Pace = { newMsPerWord: [], at: 0 };
export const readPace = () => readJSON<Pace>(K2.pace, EMPTY_PACE);
export const usePace = () => useStored<Pace>(K2.pace, EMPTY_PACE);
/** a new verse took `ms` for `words` words (implausible samples are ignored: under 0.5 s or over 3 min per word) */
export function notePace(ms: number, words: number) {
  if (!(ms > 0) || !(words > 0)) return;
  const per = Math.round(ms / words);
  if (per < 500 || per > 180_000) return;
  const cur = readPace();
  writeJSON(K2.pace, { newMsPerWord: [...(Array.isArray(cur.newMsPerWord) ? cur.newMsPerWord : []), per].slice(-LIMITS.pace), at: Date.now() });
}
/** median ms per word of the samples, or null below `min` samples */
export function paceMedian(p: Pace, min = 5): number | null {
  const xs = (Array.isArray(p?.newMsPerWord) ? p.newMsPerWord : []).filter((x) => typeof x === "number" && x > 0).sort((a, b) => a - b);
  if (xs.length < Math.max(1, min)) return null;
  const m = xs.length >> 1;
  return xs.length % 2 ? xs[m] : Math.round((xs[m - 1] + xs[m]) / 2);
}

// ---------- today's minutes (the wird's "Heute habe ich … Min.") ----------
export type TodayMinutes = { day: number; minutes: number; at: number };
export const readTodayRaw = () => readJSON<TodayMinutes | null>(K2.today, null);
/** the minutes chosen for `day`, or null (then the settings' daily minutes apply) */
export function todayMinutesOf(t: TodayMinutes | null, day = today()): number | null {
  return t && t.day === day && t.minutes > 0 ? t.minutes : null;
}
export const readTodayMinutes = (day = today()) => todayMinutesOf(readTodayRaw(), day);
export function useTodayMinutes(): number | null {
  const raw = useStored<TodayMinutes | null>(K2.today, null);
  return todayMinutesOf(raw);
}
/** sets today's minutes (1–240); null or 0 goes back to the settings */
export function setTodayMinutes(minutes: number | null) {
  const m = minutes && Number.isFinite(minutes) ? Math.min(240, Math.max(1, Math.round(minutes))) : 0;
  writeJSON(K2.today, { day: today(), minutes: m, at: Date.now() });
}

// ---------- flexible classic path ----------
export type Flex = {
  tafsir: "short" | "full"; // "full" = the detailed tafsir right away (the behaviour before Shams 3.0)
  wordLoop: number; // repetitions per word in the word loop (1–5)
};
export const defaultFlex = (): Flex => ({ tafsir: "short", wordLoop: 3 });
export const readFlex = (): Flex => ({ ...defaultFlex(), ...readJSON<Partial<Flex>>(K2.flex, {}) });
export function useFlex(): Flex {
  const raw = useStored<Partial<Flex>>(K2.flex, {});
  return useMemo(() => ({ ...defaultFlex(), ...raw }), [raw]);
}
export function saveFlex(p: Partial<Flex>) {
  const next: Partial<Flex> = { ...readJSON<Partial<Flex>>(K2.flex, {}), ...p };
  if (next.wordLoop !== undefined) next.wordLoop = Math.min(5, Math.max(1, Math.round(next.wordLoop) || 3));
  if (next.tafsir !== undefined && next.tafsir !== "full") next.tafsir = "short";
  writeJSON(K2.flex, next);
}

// ---------- own recordings on this device (index only; the files are written and deleted by the recorder) ----------
export type TakeKind = "blind" | "talaqqi" | "drill" | "makhraj";
export type Take = {
  id: string;
  uri: string; // local file
  kind: TakeKind;
  ms: number; // duration
  at: number;
  s?: number; from?: number; to?: number; // verse range
  letter?: string; // makhraj coach
  sent?: number; // when it was sent to a teacher
};
export const readTakes = () => readJSON<Take[]>(K2.takes, []);
export const useTakes = () => useStored<Take[]>(K2.takes, []);
/** adds a take (newest first); returns it and the takes that fell out of the index, whose files the caller deletes */
export function addTake(t: Omit<Take, "id" | "at"> & { id?: string; at?: number }): { take: Take; dropped: Take[] } {
  const take: Take = { ...t, id: t.id ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`, at: t.at ?? Date.now() };
  const all = [take, ...readTakes().filter((x) => x.id !== take.id)];
  writeJSON(K2.takes, all.slice(0, LIMITS.takes));
  return { take, dropped: all.slice(LIMITS.takes) };
}
/** removes a take from the index (the caller deletes the file); returns it */
export function removeTake(id: string): Take | null {
  const all = readTakes();
  const hit = all.find((x) => x.id === id) ?? null;
  if (hit) writeJSON(K2.takes, all.filter((x) => x.id !== id));
  return hit;
}
export function markTakeSent(id: string, at = Date.now()) {
  const all = readTakes();
  if (all.some((x) => x.id === id)) writeJSON(K2.takes, all.map((x) => (x.id === id ? { ...x, sent: at } : x)));
}

// ---------- cache of the teacher recitations (the server's list; shown offline, refreshed on open) ----------
export type RecitationItem = { id: string; [field: string]: unknown };
export type RecitationsCache = { at: number; mine: RecitationItem[]; inbox: RecitationItem[] };
const EMPTY_RECITATIONS: RecitationsCache = { at: 0, mine: [], inbox: [] };
export const readRecitations = () => ({ ...EMPTY_RECITATIONS, ...readJSON<Partial<RecitationsCache>>(K2.recitations, {}) });
export function useRecitations(): RecitationsCache {
  const raw = useStored<Partial<RecitationsCache>>(K2.recitations, {});
  return useMemo(() => ({ ...EMPTY_RECITATIONS, ...raw }), [raw]);
}
export function saveRecitations(box: "mine" | "inbox", items: RecitationItem[]) {
  writeJSON(K2.recitations, { ...readRecitations(), [box]: items.slice(0, LIMITS.recitations), at: Date.now() });
}
export const clearRecitations = () => writeJSON(K2.recitations, EMPTY_RECITATIONS);
