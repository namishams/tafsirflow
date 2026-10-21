// Account sync of the learning courses ported from the app (courses, reading course, language course, Reciter Path,
// cards and tests, Abrahamic and Haramain courses, Hajj guide, Madrasa reports). The keys are the app's own keys, so a
// signed-in learner continues on the other device once the app syncs them too (mobile/src/lib/sync.ts SYNC_KEYS).
// Merge rules never lose progress: best scores win, finished stays finished, unions for sets, the newer entry for
// cards. Sent in its own PUT next to the older keys (src/lib/sync.ts), so the 400 KB limit applies to each part.
import { readJSON } from "../storage";

export const LEARN_SYNC_KEYS = [
  "qmc.courses.v1", "qmc.qaida", "qmc.arabicLang.v1", "qmc.reciterPath", "qmc.srs.v1", "qmc.srs.tests",
  "qmc.abrahamic.course.v1", "qmc.haramain.course.v1", "qmc.haramain.guide.v1", "qmc.school.v1",
] as const;

type Obj = Record<string, unknown>;
const o = (x: unknown): Obj => (x && typeof x === "object" && !Array.isArray(x) ? (x as Obj) : {});
const n = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : 0);
/** per key the larger number */
const maxMap = (a: unknown, b: unknown) => { const out: Record<string, number> = { ...(o(b) as Record<string, number>) }; for (const [k, v] of Object.entries(o(a))) out[k] = Math.max(n(out[k]), n(v)); return out; };
/** per key the smaller positive number (fastest time) */
const minMap = (a: unknown, b: unknown) => { const out: Record<string, number> = { ...(o(b) as Record<string, number>) }; for (const [k, v] of Object.entries(o(a))) out[k] = out[k] ? Math.min(n(out[k]), n(v)) : n(v); return out; };
/** per key: the entry with the higher field, other fields maxed */
function bestOf(a: unknown, b: unknown, fields: string[]) {
  const out: Record<string, Obj> = { ...(o(b) as Record<string, Obj>) };
  for (const [k, v] of Object.entries(o(a))) {
    const x = o(v), y = out[k];
    out[k] = y ? Object.fromEntries([...new Set([...Object.keys(x), ...Object.keys(y)])].map((f) => [f, fields.includes(f) || typeof x[f] === "number" ? Math.max(n(x[f]), n(y[f])) : x[f] ?? y[f]])) : x;
  }
  return out;
}
/** first one wins (keeps the earliest certificate or completion date) */
const keepFirst = (a: unknown, b: unknown) => ({ ...o(a), ...o(b) });

const MERGE: Record<(typeof LEARN_SYNC_KEYS)[number], (a: unknown, b: unknown) => unknown> = {
  "qmc.courses.v1": (a, b) => ({ done: bestOf(o(a).done, o(b).done, ["score", "at"]), complete: keepFirst(o(a).complete, o(b).complete) }),
  "qmc.qaida": (a, b) => ({ ...o(b), ...o(a), done: bestOf(o(a).done, o(b).done, ["best", "stars", "at"]), mistakes: o(a).mistakes ?? o(b).mistakes ?? {}, days: maxMap(o(a).days, o(b).days), speed: minMap(o(a).speed, o(b).speed) }),
  "qmc.arabicLang.v1": (a, b) => ({ ...o(b), ...o(a), done: bestOf(o(a).done, o(b).done, ["score", "at"]), days: maxMap(o(a).days, o(b).days), certs: keepFirst(o(a).certs, o(b).certs) }),
  "qmc.reciterPath": (a, b) => ({ units: maxMap(o(a).units, o(b).units), checks: { ...o(b).checks as Obj, ...o(a).checks as Obj }, exams: maxMap(o(a).exams, o(b).exams), certs: keepFirst(o(a).certs, o(b).certs) }),
  "qmc.srs.v1": (a, b) => {
    const A = o(a), B = o(b);
    const cards: Record<string, Obj> = { ...(o(B.cards) as Record<string, Obj>) };
    for (const [k, v] of Object.entries(o(A.cards))) {
      const x = o(v), y = cards[k];
      const lx = n(o(x.m).last) + n(o(x.m).reps) / 1e6, ly = y ? n(o(y.m).last) + n(o(y.m).reps) / 1e6 : -1;
      cards[k] = !y || lx >= ly ? x : y;
    }
    const log: Record<string, Obj> = { ...(o(B.log) as Record<string, Obj>) };
    for (const [d, v] of Object.entries(o(A.log))) { const x = o(v), y = o(log[d]); log[d] = { n: Math.max(n(x.n), n(y.n)), nw: Math.max(n(x.nw), n(y.nw)), again: Math.max(n(x.again), n(y.again)) }; }
    const decks = [...new Set([...((A.decks as string[]) ?? []), ...((B.decks as string[]) ?? [])])];
    return { ...B, ...A, cards, log, decks: decks.length ? decks : ["juzamma"] };
  },
  "qmc.srs.tests": (a, b) => {
    const results = [...((o(a).results as Obj[]) ?? []), ...((o(b).results as Obj[]) ?? [])];
    const seen = new Set<string>();
    const res = results.filter((r) => { const k = `${r.id}:${r.at}`; if (seen.has(k)) return false; seen.add(k); return true; }).sort((x, y) => n(y.at) - n(x.at)).slice(0, 300);
    const certs = new Map<number, Obj>();
    for (const c of [...((o(b).certs as Obj[]) ?? []), ...((o(a).certs as Obj[]) ?? [])]) { const p = certs.get(n(c.juz)); if (!p || n(c.pct) > n(p.pct)) certs.set(n(c.juz), c); }
    return { results: res, certs: [...certs.values()] };
  },
  "qmc.abrahamic.course.v1": (a, b) => ({ done: bestOf(o(a).done, o(b).done, ["score", "of"]), cert: o(b).cert ?? o(a).cert }),
  "qmc.haramain.course.v1": (a, b) => ({ done: bestOf(o(a).done, o(b).done, ["score", "of"]), cert: o(b).cert ?? o(a).cert }),
  "qmc.haramain.guide.v1": (a, b) => ({ ...o(b), ...o(a) }),
  "qmc.school.v1": (a, b) => ({ ...o(b), ...o(a), terms: { ...o(o(b).terms), ...o(o(a).terms) }, baseline: { ...o(o(a).baseline), ...o(o(b).baseline) } }),
};

/** this browser's learning data */
export function learnSnapshot(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of LEARN_SYNC_KEYS) { const v = readJSON<unknown>(k, null); if (v !== null && v !== undefined) out[k] = v; }
  // the card store can grow large (5,000 cards): above 300 KB it stays on this device rather than block the sync
  if (out["qmc.srs.v1"] && JSON.stringify(out["qmc.srs.v1"]).length > 300_000) delete out["qmc.srs.v1"];
  return out;
}

/** local and account copy merged, per key */
export function learnMerge(local: Record<string, unknown>, remote: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of LEARN_SYNC_KEYS) {
    const a = local[k], b = remote[k];
    if (a === undefined && b === undefined) continue;
    try { out[k] = a === undefined ? b : b === undefined ? a : MERGE[k](a, b); } catch { out[k] = a ?? b; }
  }
  return out;
}

export const isLearnKey = (k: string) => (LEARN_SYNC_KEYS as readonly string[]).includes(k);
