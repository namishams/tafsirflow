import { readJSON, useStored, writeJSON } from "@/lib/store";
import { readLog, wirdStreak } from "@/features/shams2/store";
import { weakSpots } from "@/features/shams2/weakSpots";
import { readGrade } from "@/features/shams2/grades";
import { makeSnapshot } from "@/features/shams2/teacherModel";
import { DIMS, masteryModel } from "@/features/shams2/mastery";
import { readLinks, readRubric, readUnderstand } from "@/features/shams2/store2";
import type { useShams2 } from "@/features/shams2/model";
import { TL, type Inbox } from "./api";

// Sync of the aggregate snapshot to the teacher link (only while at least one link is active) and the wird items a
// teacher suggested and the student accepted. Own keys, new and versioned; the old share-code keys are untouched.
const K_LIVE = "qmc.teacher.live.v1"; // { active: has an active link, at: last sync (ms) }
const K_ASSIGNED = "qmc.teacher.assigned.v1";
type Live = { active: boolean; at: number };
export type Assigned = { id: string; s: number; from: number; to: number; teacher: string; at: number; doneAt?: number };

export const readLive = () => readJSON<Live>(K_LIVE, { active: false, at: 0 });
export const setActive = (active: boolean) => { const l = readLive(); if (l.active !== active) writeJSON(K_LIVE, { ...l, active }, true); };
export const useAssigned = () => useStored<Assigned[]>(K_ASSIGNED, []);
const readAssigned = () => readJSON<Assigned[]>(K_ASSIGNED, []);

export function buildSnapshot(m: ReturnType<typeof useShams2>) {
  const base = makeSnapshot({ name: "", streak: 0, wirdStreak: wirdStreak(readLog(), m.day), wird: m.wird, surahs: m.q.surahs, juz: m.q.juz, overall: m.q.overall, log: readLog(), day: m.day });
  const weak = weakSpots(m.known, m.words, m.mut, 1000);
  const has = (r: string) => weak.filter((w) => w.reason.includes(r as never)).length;
  const itq = (cs: { score: number | null }[]) => cs.filter((c) => (c.score ?? 0) >= 90).length;
  const { name: _name, ...rest } = base; // the name is the member's profile name on the server
  void _name;
  // Shams 3.0: the six mastery dimensions over everything memorised (0–100, null without data); older servers drop it
  let mastery: Record<string, number | null> | undefined;
  try {
    const all = masteryModel({ known: m.known, words: m.words, checks: m.checks, mut: m.mut, links: readLinks(), understand: readUnderstand(), rubric: readRubric() }).overall;
    mastery = Object.fromEntries(DIMS.map((d) => [d, all.dims[d].pct]));
  } catch { mastery = undefined; }
  return { ...rest, ...(mastery ? { mastery } : {}), grade: readGrade().grade, weak: { total: weak.length, lapses: has("lapses"), fading: has("fading"), words: has("words"), mut: has("mutashabih") }, itqan: { surahs: itq(m.q.surahs), juz: itq(m.q.juz) } };
}

/** takes the open suggestions the server answered with: accepted portions are already local, nothing else to do */
export function acceptLocal(s: Inbox) {
  if (s.surah === null || s.from === null || s.to === null) return;
  const cur = readAssigned();
  if (cur.some((x) => x.id === s.id)) return;
  writeJSON(K_ASSIGNED, [{ id: s.id, s: s.surah, from: s.from, to: s.to, teacher: s.teacher?.name ?? "", at: Date.now() }, ...cur].slice(0, 30), true);
}
export async function acceptSuggestion(s: Inbox) {
  await TL.respond(s.id, "accept");
  acceptLocal(s);
}
export async function finishAssigned(id: string) {
  writeJSON(K_ASSIGNED, readAssigned().map((x) => (x.id === id ? { ...x, doneAt: Date.now() } : x)), true);
  try { await TL.respond(id, "done"); } catch { /* the teacher sees it as accepted until the next try */ }
}
export function dropAssigned(id: string) { writeJSON(K_ASSIGNED, readAssigned().filter((x) => x.id !== id), true); }

const GAP = 3 * 3600_000;
/** sends the snapshot when a link is active (at most every 3 hours unless forced); returns the open suggestions */
export async function syncTeacher(m: ReturnType<typeof useShams2>, force = false): Promise<Inbox[] | null> {
  const l = readLive();
  if (!l.active) return null;
  if (!force && Date.now() - l.at < GAP) return null;
  try {
    const r = await TL.sync(buildSnapshot(m));
    writeJSON(K_LIVE, { active: r.shares > 0, at: Date.now() }, true);
    return r.suggestions;
  } catch { return null; }
}
