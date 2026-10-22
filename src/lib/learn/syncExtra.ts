// Merge rules for the keys the app adds to the account sync (Shams Method 2.0, question bank, Nahj course).
// Dependency-free; the app keeps an identical copy in mobile/src/lib/syncExtra.ts. Progress is never lost:
// counters take the larger value, sets are united, the newer entry wins where an entry has a timestamp.
type Obj = Record<string, unknown>;
const o = (x: unknown): Obj => (x && typeof x === "object" && !Array.isArray(x) ? (x as Obj) : {});
const arr = (x: unknown): Obj[] => (Array.isArray(x) ? (x as Obj[]) : []);
const n = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : 0);

/** per key the larger number */
const maxMap = (a: unknown, b: unknown) => { const out: Record<string, number> = { ...(o(b) as Record<string, number>) }; for (const [k, v] of Object.entries(o(a))) out[k] = Math.max(n(out[k]), n(v)); return out; };
/** per key: every number field takes the larger value, other fields come from the entry with the newer `last`;
 *  fields in `fromNewer` (a Leitner box, the latest own rating) come from the newer entry too, or the other one if it lacks them */
function statMap(a: unknown, b: unknown, ts = "last", fromNewer: string[] = []): Record<string, Obj> {
  const out: Record<string, Obj> = { ...(o(b) as Record<string, Obj>) };
  for (const [k, v] of Object.entries(o(a))) {
    const x = o(v), y = out[k];
    if (!y) { out[k] = x; continue; }
    const [base, other] = n(x[ts]) >= n(y[ts]) ? [x, y] : [y, x];
    out[k] = { ...base, ...Object.fromEntries([...new Set([...Object.keys(x), ...Object.keys(y)])].filter((f) => typeof x[f] === "number" || typeof y[f] === "number").map((f) => [f, fromNewer.includes(f) ? (typeof base[f] === "number" ? base[f] : other[f]) : Math.max(n(x[f]), n(y[f]))])) };
  }
  return out;
}
/** keeps the `max` entries with the newest time */
const newestN = (m: Record<string, Obj>, max: number, at: (x: Obj) => number = (x) => n(x.last)) => {
  const ks = Object.keys(m);
  return ks.length <= max ? m : Object.fromEntries(ks.sort((p, q) => at(m[q]) - at(m[p])).slice(0, max).map((k) => [k, m[k]]));
};
/** the entry with the larger value of `field` (ties: first) */
const higher = (a: unknown, b: unknown, field: string) => (n(o(a)[field]) >= n(o(b)[field]) ? o(a) : o(b));
const newest = <T extends Obj>(list: T[], at: string) => list.reduce((m, x) => Math.max(m, n(x[at])), 0);

export const EXTRA_KEYS = [
  "qmc.shams2.settings.v1", "qmc.shams2.log.v1", "qmc.shams2.words.v1", "qmc.shams2.checks.v1", "qmc.shams2.mut.v1", "qmc.shams2.grade.v1", "qmc.shams2.weeks.v1",
  "qmc.qbank.v1", "qmc.nahjCourse.v1",
  "qmc.shamsMode.v1",
  // Shams 3.0 (features/shams2/store2.ts): transitions, comprehension, pronunciation rubric, makhraj coach, own pace,
  // today's minutes, settings of the flexible classic path
  "qmc.shams2.links.v1", "qmc.shams2.understand.v1", "qmc.shams2.rubric.v1", "qmc.shams2.makhraj.v1", "qmc.shams2.pace.v1", "qmc.shams2.today.v1",
  "qmc.shams.flex.v1",
] as const;
// Not synced on purpose: qmc.shams2.teacher.v1 (links and other people's student snapshots stay on the device),
// qmc.shams2.pages.v1 (cache from the Quran API), qmc.shams2.onboarded.v1 (per device), qmc.shams2.takes.v1 (index of
// recordings that stay on the device), qmc.teacher.recitations.v1 (cache of the server's list).

export const EXTRA_MERGE: Record<(typeof EXTRA_KEYS)[number], (a: unknown, b: unknown) => unknown> = {
  // settings carry no timestamp: this device's choice wins, missing fields come from the account
  "qmc.shams2.settings.v1": (a, b) => ({ ...o(b), ...o(a) }),
  // the chosen Shams method ("classic" | "v2"), stored as { mode, at } (a plain string counts as at = 0): the newer choice wins, a tie keeps this device's
  "qmc.shamsMode.v1": (a, b) => {
    const pick = (x: unknown) => { const m = typeof x === "string" ? x : o(x).mode; return m === "classic" || m === "v2" ? { mode: m, at: n(o(x).at) } : null; };
    const x = pick(a), y = pick(b);
    return x && y ? (x.at >= y.at ? x : y) : x ?? y ?? a ?? b;
  },
  // day -> blocks done (first completion time kept) and ratings per range (union)
  "qmc.shams2.log.v1": (a, b) => {
    const out: Record<string, Obj> = { ...(o(b) as Record<string, Obj>) };
    for (const [d, v] of Object.entries(o(a))) {
      const x = o(v), y = o(out[d]), r = { ...o(y.r), ...o(x.r) };
      const m: Obj = { ...y, ...x };
      for (const blk of ["sabaq", "sabqi", "manzil"]) { const t = [n(x[blk]), n(y[blk])].filter(Boolean); if (t.length) m[blk] = Math.min(...t); }
      if (Object.keys(r).length) m.r = r;
      out[d] = m;
    }
    return out;
  },
  "qmc.shams2.words.v1": (a, b) => { const out: Record<string, Record<string, Obj>> = {}; const A = o(a), B = o(b); for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) out[k] = statMap(A[k], B[k]); return out; },
  "qmc.shams2.checks.v1": (a, b) => statMap(a, b),
  "qmc.shams2.mut.v1": (a, b) => statMap(a, b),
  // Shams 3.0, same limits as store2.ts LIMITS: counters max, the Leitner box and the latest own rating from the newer entry
  "qmc.shams2.links.v1": (a, b) => newestN(statMap(a, b, "last", ["box"]), 1500),
  "qmc.shams2.understand.v1": (a, b) => newestN(statMap(a, b), 1500),
  "qmc.shams2.makhraj.v1": (a, b) => newestN(statMap(a, b, "last", ["self"]), 64),
  // per verse and side (self, teacher) the newer rating
  "qmc.shams2.rubric.v1": (a, b) => {
    const out: Record<string, Obj> = { ...(o(b) as Record<string, Obj>) };
    for (const [k, v] of Object.entries(o(a))) {
      const x = o(v), y = o(out[k]), m: Obj = {};
      for (const side of ["self", "teacher"]) { const p = x[side], q = y[side]; const w = p === undefined ? q : q === undefined ? p : n(o(p).at) >= n(o(q).at) ? p : q; if (w !== undefined) m[side] = w; }
      out[k] = m;
    }
    return newestN(out, 500, (e) => Math.max(n(o(e.self).at), n(o(e.teacher).at)));
  },
  // the newer list of samples (at most 30)
  "qmc.shams2.pace.v1": (a, b) => { const x = n(o(a).at) >= n(o(b).at) ? o(a) : o(b); return { ...x, newMsPerWord: (Array.isArray(x.newMsPerWord) ? (x.newMsPerWord as unknown[]) : []).filter((v) => typeof v === "number").slice(-30), at: n(x.at) }; },
  // the later day, on the same day the newer choice
  "qmc.shams2.today.v1": (a, b) => { const x = o(a), y = o(b); return n(x.day) > n(y.day) || (n(x.day) === n(y.day) && n(x.at) >= n(y.at)) ? x : y; },
  // settings carry no timestamp: this device's choice wins, missing fields come from the account
  "qmc.shams.flex.v1": (a, b) => ({ ...o(b), ...o(a) }),
  "qmc.shams2.weeks.v1": (a, b) => { const out: Record<string, Obj> = { ...(o(b) as Record<string, Obj>) }; for (const [k, v] of Object.entries(o(a))) out[k] = out[k] ? higher(v, out[k], "count") : o(v); return out; },
  "qmc.shams2.grade.v1": (a, b) => {
    const top = higher(a, b, "grade");
    const seen = new Set<string>();
    const tests = [...arr(o(a).tests), ...arr(o(b).tests)].filter((t) => { const k = `${t.kind}:${t.day}:${t.score}:${t.items}`; if (seen.has(k)) return false; seen.add(k); return true; }).sort((x, y) => n(x.day) - n(y.day)).slice(-200);
    return { ...top, grade: Math.max(n(o(a).grade), n(o(b).grade), 1), tests, ard: maxMap(o(a).ard, o(b).ard) };
  },
  "qmc.qbank.v1": (a, b) => {
    const A = o(a), B = o(b);
    // answers: counters max, the newer attempt decides the rest (last result, Leitner box, due date)
    const ans: Record<string, Obj> = { ...(o(B.a) as Record<string, Obj>) };
    for (const [id, v] of Object.entries(o(A.a))) { const x = o(v), y = ans[id]; ans[id] = !y ? x : { ...(n(x.last) >= n(y.last) ? x : y), n: Math.max(n(x.n), n(y.n)), c: Math.max(n(x.c), n(y.c)) }; }
    // the rating comes from the side with the newer history
    const fresher = newest(arr(A.h), "at") >= newest(arr(B.h), "at") ? A : B;
    const seen = new Set<string>();
    const h = [...arr(A.h), ...arr(B.h)].filter((x) => { const k = `${x.at}:${x.mode}`; if (seen.has(k)) return false; seen.add(k); return true; }).sort((x, y) => n(y.at) - n(x.at)).slice(0, 300);
    const days = new Map<string, Obj>();
    for (const d of [...arr(B.days), ...arr(A.days)]) { const p = days.get(String(d.d)); days.set(String(d.d), !p ? d : { ...d, n: Math.max(n(p.n), n(d.n)), c: Math.max(n(p.c), n(d.c)), ms: Math.max(n(p.ms), n(d.ms)) }); }
    const mock: Record<string, Obj> = { ...(o(B.mock) as Record<string, Obj>) };
    for (const [g, v] of Object.entries(o(A.mock))) { const x = o(v), y = mock[g]; mock[g] = !y ? x : { best: Math.max(n(x.best), n(y.best)), passed: !!(x.passed || y.passed), at: Math.max(n(x.at), n(y.at)), tries: Math.max(n(x.tries), n(y.tries)) }; }
    const rep = new Map<string, Obj>();
    for (const r of [...arr(B.rep), ...arr(A.rep)]) rep.set(String(r.id), r);
    const latestDay = (x: unknown, y: unknown) => (String(o(x).d ?? "") >= String(o(y).d ?? "") ? o(x) : o(y));
    return {
      ...B, ...A, a: ans, r: { ...o(B.r), ...o(A.r), ...o(fresher.r) }, h,
      bm: [...new Set([...(Array.isArray(A.bm) ? A.bm as string[] : []), ...(Array.isArray(B.bm) ? B.bm as string[] : [])])].slice(0, 500),
      days: [...days.values()].sort((x, y) => String(x.d).localeCompare(String(y.d))).slice(-90), mock,
      ...(A.free || B.free ? { free: latestDay(A.free, B.free) } : {}),
      ...(A.daily || B.daily ? { daily: latestDay(A.daily, B.daily) } : {}),
      rep: [...rep.values()].sort((x, y) => n(y.at) - n(x.at)).slice(0, 200),
    };
  },
  "qmc.nahjCourse.v1": (a, b) => {
    const A = o(a), B = o(b);
    const best = (x: unknown, y: unknown, f: string) => { const out: Record<string, Obj> = { ...(o(y) as Record<string, Obj>) }; for (const [k, v] of Object.entries(o(x))) { const p = out[k], q = o(v); out[k] = !p ? q : { ...q, [f]: Math.max(n(q[f]), n(p[f])), ...("of" in q || "of" in p ? { of: Math.max(n(q.of), n(p.of)) } : {}), at: Math.min(n(q.at) || n(p.at), n(p.at) || n(q.at)) }; } return out; };
    const cert = A.cert && B.cert ? (n(o(A.cert).at) <= n(o(B.cert).at) ? A.cert : B.cert) : A.cert ?? B.cert;
    return { ...B, ...A, lessons: best(A.lessons, B.lessons, "score"), units: best(A.units, B.units, "pct"), ...(cert ? { cert } : {}) };
  },
};

/** the academy courses ("qmc.courses.v1"): best score per lesson, the earliest completion date; same rule as src/lib/learn/sync.ts */
export const mergeCourses = (a: unknown, b: unknown) => {
  const done: Record<string, Obj> = { ...(o(o(b).done) as Record<string, Obj>) };
  for (const [k, v] of Object.entries(o(o(a).done))) { const x = o(v), y = done[k]; done[k] = y ? { ...x, ...y, score: Math.max(n(x.score), n(y.score)), at: Math.max(n(x.at), n(y.at)) } : x; }
  return { done, complete: { ...o(o(a).complete), ...o(o(b).complete) } };
};
