// mirrors mobile/src/features/shams2/teacherModel.ts (copied for the website; keep in step with the app)
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";
import { K } from "./store";
import type { Wird } from "./plan";
import type { Cell } from "./qualityModel";

// Teacher view (ustādh / shaykh): a teacher sees a student's wird, quality scores and streak, read-only.
// For now the student creates a share code that contains a snapshot (no e-mail, no account id, no recordings);
// later the same model is filled through an accepted connection in the Quran Talents network (via: "talents").
export type TeacherLink = { id: string; via: "code" | "talents"; teacher?: string; createdAt: number; scopes: ("plan" | "scores" | "streak")[] };
export type Snapshot = {
  v: 1;
  name: string; // what the student chose to show
  at: number; // created (ms)
  streak: number;
  wirdStreak: number;
  memorised: number;
  overall: number | null;
  plan: { sabaq: [number, number, number][]; sabqi: number; manzil: number; minutes: number; cycle: [number, number] };
  surahs: [number, number, number, number][]; // id, known, total, score (only surahs with memorised verses)
  juz: [number, number, number, number][];
  log: [number, number][]; // last 28 days: day, blocks done (bitmask sabaq 1 | sabqi 2 | manzil 4)
};
export type TeacherState = { links: TeacherLink[]; students: { code: string; snap: Snapshot; added: number }[] };
const EMPTY: TeacherState = { links: [], students: [] };
export const readTeacher = () => readJSON<TeacherState>(K.teacher, EMPTY);
export const useTeacher = () => useStored<TeacherState>(K.teacher, EMPTY);

const PREFIX = "QMC2.";
const b64 = (s: string) => globalThis.btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64 = (s: string) => decodeURIComponent(escape(globalThis.atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4))));

export function makeSnapshot(p: { name: string; streak: number; wirdStreak: number; wird: Wird; surahs: Cell[]; juz: Cell[]; overall: number | null; log: Record<string, { sabaq?: number; sabqi?: number; manzil?: number }>; day: number }): Snapshot {
  const cells = (cs: Cell[]) => cs.filter((c) => c.known > 0).map((c) => [c.id, c.known, c.total, c.score ?? 0] as [number, number, number, number]);
  return {
    v: 1, name: p.name.trim().slice(0, 40), at: Date.now(), streak: p.streak, wirdStreak: p.wirdStreak, memorised: p.wird.memorised, overall: p.overall,
    plan: { sabaq: p.wird.sabaq.ranges.map((r) => [r.s, r.from, r.to]), sabqi: p.wird.sabqi.verses, manzil: p.wird.manzil.verses, minutes: p.wird.minutes, cycle: [p.wird.cycleDay, p.wird.cycleOf] },
    surahs: cells(p.surahs), juz: cells(p.juz),
    log: Array.from({ length: 28 }, (_, i) => { const d = p.day - 27 + i; const l = p.log[d] ?? {}; return [d, (l.sabaq ? 1 : 0) | (l.sabqi ? 2 : 0) | (l.manzil ? 4 : 0)] as [number, number]; }),
  };
}
export const encodeSnapshot = (s: Snapshot) => PREFIX + b64(JSON.stringify(s));
export function decodeSnapshot(code: string): Snapshot | null {
  const c = code.trim().replace(/\s+/g, "");
  if (!c.startsWith(PREFIX)) return null;
  try {
    const s = JSON.parse(unb64(c.slice(PREFIX.length))) as Snapshot;
    if (s?.v !== 1 || !Array.isArray(s.surahs) || !Array.isArray(s.log)) return null;
    return s;
  } catch { return null; }
}

/** student side: remember that a code was shared (shown under "linked teachers") */
export function addLink(teacher?: string) {
  const s = readTeacher();
  const link: TeacherLink = { id: Date.now().toString(36), via: "code", teacher: teacher?.trim().slice(0, 40) || undefined, createdAt: Date.now(), scopes: ["plan", "scores", "streak"] };
  writeJSON(K.teacher, { ...s, links: [link, ...s.links].slice(0, 20) });
}
export function removeLink(id: string) { const s = readTeacher(); writeJSON(K.teacher, { ...s, links: s.links.filter((l) => l.id !== id) }); }
/** teacher side: add or refresh a student from a code (same name replaces the older snapshot) */
export function addStudent(code: string): Snapshot | null {
  const snap = decodeSnapshot(code);
  if (!snap) return null;
  const s = readTeacher();
  const rest = s.students.filter((x) => x.snap.name !== snap.name || !snap.name);
  writeJSON(K.teacher, { ...s, students: [{ code: code.trim(), snap, added: Date.now() }, ...rest].slice(0, 100) });
  return snap;
}
export function removeStudent(i: number) { const s = readTeacher(); writeJSON(K.teacher, { ...s, students: s.students.filter((_, j) => j !== i) }); }
