import { prepare, samePrepared, type Prepared } from "@/web/recite";

// Blind recitation (Shams 3.0): what the on-device speech recognition heard over a whole range, aligned with the words
// of the verses. A pure function, mirrored for the website (src/lib/learn/shams2/blindAlign.ts).
//   1. anchors: three words in a row that match three heard words in a row;
//   2. the anchors are chained in order (longest increasing chain), so a repeated passage or a jump back does not
//      tangle the alignment;
//   3. between two anchors a small table (longest common subsequence) places the remaining words.
// Per verse: heard / partly heard / not heard / heard out of order, and whether it was recited twice; per transition
// (verse v-1 -> v): held, or why it may have stalled; pauses longer than 2.5 s are timing only.
// It is a word check: "words heard" and "possibly missed", never a judgement of pronunciation or tajweed.

export type RefWord = { position: number; text: string };
export type RefVerse = { key: string; words: RefWord[] };
/** a heard word; t = ms from the start of the take (null when the recogniser gave no time) */
export type HeardWord = { w: string; t: number | null };
/** h = index into the heard words, -1 when not heard */
export type WordMark = { position: number; ok: boolean; h: number; t: number | null };
export type VerseStatus = "ok" | "partial" | "missing" | "outOfOrder";
export type VerseResult = { key: string; status: VerseStatus; share: number; heard: number; total: number; repeated: boolean; words: WordMark[]; t: number | null };
export type LinkReason = "missing" | "order" | "restart" | "pause";
/** key = the verse the transition leads into (as in store2 linkKey), from = the verse before */
export type LinkResult = { key: string; from: string; ok: boolean; reason: LinkReason | null; pauseMs: number | null };
/** a pause before this word inside a verse (timing only) */
export type Hesitation = { key: string; position: number; ms: number };
export type BlindResult = { verses: VerseResult[]; links: LinkResult[]; hesitations: Hesitation[]; heard: number; total: number; extra: number };
export type BlindOptions = { strict?: boolean; okShare?: number; pauseMs?: number };

/** one take holds at most this many words of the range; longer ranges are recited by page or section */
export const BLIND_MAX_WORDS = 1000;
export const HESITATION_MS = 2500;
const OK_SHARE = 0.85;
const MISSING_SHARE = 0.2;
const MAX_ANCHORS = 200_000;
const MAX_TABLE = 250_000;

/** how many verses from the start fit into one take (at least one) */
export function fitVerses(wordCounts: number[], max = BLIND_MAX_WORDS): number {
  let sum = 0;
  for (let i = 0; i < wordCounts.length; i++) { sum += wordCounts[i]; if (sum > max) return Math.max(1, i); }
  return wordCounts.length;
}

/** longest common subsequence of a[ia..ib) and b[ja..jb) under eq; returns the matched pairs in order */
function lcsPairs(ia: number, ib: number, ja: number, jb: number, eq: (i: number, j: number) => boolean): [number, number][] {
  const n = ib - ia, m = jb - ja;
  if (n <= 0 || m <= 0) return [];
  if (n * m > MAX_TABLE) {
    // too large for a table: in order with a little slack (like align in recite.ts)
    const out: [number, number][] = [];
    let j = ja;
    for (let i = ia; i < ib; i++) {
      for (let k = j; k < Math.min(jb, j + 4); k++) if (eq(i, k)) { out.push([i, k]); j = k + 1; break; }
    }
    return out;
  }
  const w = m + 1;
  const d = new Uint16Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      d[i * w + j] = eq(ia + i, ja + j) ? d[(i + 1) * w + j + 1] + 1 : Math.max(d[(i + 1) * w + j], d[i * w + j + 1]);
    }
  }
  const out: [number, number][] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (eq(ia + i, ja + j) && d[i * w + j] === d[(i + 1) * w + j + 1] + 1) { out.push([ia + i, ja + j]); i++; j++; }
    else if (d[(i + 1) * w + j] >= d[i * w + j + 1]) i++;
    else j++;
  }
  return out;
}

export function blindAlign(verses: RefVerse[], heardIn: HeardWord[], opts: BlindOptions = {}): BlindResult {
  const okShare = opts.okShare ?? OK_SHARE;
  const pauseMs = opts.pauseMs ?? HESITATION_MS;
  const strict = { strict: !!opts.strict };
  // reference words in order, with their verse
  const R: { vi: number; position: number; p: Prepared }[] = [];
  verses.forEach((v, vi) => v.words.forEach((w) => { if (R.length < BLIND_MAX_WORDS) R.push({ vi, position: w.position, p: prepare(w.text) }); }));
  // heard words that still hold letters after normalisation
  const heard = heardIn.map((h) => ({ ...h, p: prepare(h.w) })).filter((h) => h.p.n);
  const H = heard.map((h) => h.p);
  const n = R.length, m = H.length;

  const memo = new Uint8Array(n * m); // 0 unknown, 1 same, 2 different
  const eq = (i: number, j: number) => {
    const k = i * m + j;
    if (!memo[k]) memo[k] = samePrepared(R[i].p, H[j], strict) ? 1 : 2;
    return memo[k] === 1;
  };

  // 1. anchors (i, j): R[i..i+2] = H[j..j+2], with confident matches only (same normal form, or the same consonant
  // skeleton of at least three letters); near matches are left to the gaps
  const sure = (i: number, j: number) => {
    const a = R[i].p, b = H[j];
    return a.n === b.n || (!opts.strict && a.k.length >= 3 && a.k === b.k);
  };
  const anchors: [number, number][] = [];
  outer: for (let i = 0; i + 2 < n; i++) {
    for (let j = 0; j + 2 < m; j++) {
      if (sure(i, j) && sure(i + 1, j + 1) && sure(i + 2, j + 2)) { anchors.push([i, j]); if (anchors.length >= MAX_ANCHORS) break outer; }
    }
  }
  // 2. longest chain increasing in i and j (patience sorting on j; for equal i the larger j first, so one per i)
  anchors.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const tails: number[] = []; // index into anchors of the smallest tail j for each length
  const prev = new Int32Array(anchors.length).fill(-1);
  for (let a = 0; a < anchors.length; a++) {
    const j = anchors[a][1];
    let lo = 0, hi = tails.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (anchors[tails[mid]][1] < j) lo = mid + 1; else hi = mid; }
    if (lo > 0) prev[a] = tails[lo - 1];
    tails[lo] = a;
  }
  const chain: [number, number][] = [];
  for (let a = tails.length ? tails[tails.length - 1] : -1; a >= 0; a = prev[a]) chain.push(anchors[a]);
  chain.reverse();

  // fixed pairs from the chain (each anchor covers three words; overlapping anchors agree or are skipped)
  const matchR = new Int32Array(n).fill(-1);
  const usedH = new Uint8Array(m);
  let lastI = -1, lastJ = -1;
  const fixed: [number, number][] = [];
  for (const [i0, j0] of chain) {
    for (let d = 0; d < 3; d++) {
      const i = i0 + d, j = j0 + d;
      if (i <= lastI || j <= lastJ) continue;
      fixed.push([i, j]); lastI = i; lastJ = j;
    }
  }
  // 3. the gaps before, between and after the fixed pairs
  const place = (pairs: [number, number][]) => { for (const [i, j] of pairs) { matchR[i] = j; usedH[j] = 1; } };
  let pi = -1, pj = -1;
  for (const [i, j] of fixed) {
    place(lcsPairs(pi + 1, i, pj + 1, j, eq));
    place([[i, j]]);
    pi = i; pj = j;
  }
  place(lcsPairs(pi + 1, n, pj + 1, m, eq));

  // per verse
  const timeOf = (j: number) => (j >= 0 && j < m ? heard[j].t : null);
  const out: VerseResult[] = verses.map((v) => ({ key: v.key, status: "missing", share: 0, heard: 0, total: 0, repeated: false, words: [], t: null }));
  for (let i = 0; i < n; i++) {
    const r = R[i], vr = out[r.vi], j = matchR[i];
    vr.total++;
    if (j >= 0) vr.heard++;
    vr.words.push({ position: r.position, ok: j >= 0, h: j, t: timeOf(j) });
  }
  // the heard words nobody used, in order: where a verse said out of place or a second time is found
  const unused: number[] = [];
  for (let j = 0; j < m; j++) if (!usedH[j]) unused.push(j);
  const elsewhere = (vi: number): [number, number][] => {
    if (!unused.length) return [];
    const from = R.findIndex((r) => r.vi === vi);
    if (from < 0) return [];
    let to = from;
    while (to < n && R[to].vi === vi) to++;
    const len = to - from;
    const pairs = lcsPairs(from, to, 0, unused.length, (i, u) => eq(i, unused[u]));
    if (!pairs.length) return [];
    // only a compact passage counts (not common words scattered over the take)
    const span = pairs[pairs.length - 1][1] - pairs[0][1] + 1;
    return span <= 2 * len + 4 ? pairs.map(([i, u]) => [i, unused[u]]) : [];
  };
  const claimed = new Uint8Array(m);
  out.forEach((vr, vi) => {
    vr.share = vr.total ? vr.heard / vr.total : 0;
    vr.status = vr.share >= okShare ? "ok" : vr.share < MISSING_SHARE ? "missing" : "partial";
    const firstHeard = vr.words.find((w) => w.h >= 0);
    vr.t = firstHeard ? firstHeard.t : null;
    if (vr.total < 2 || (vr.status === "ok" && vr.total < 3)) return; // too short to tell from chance
    const pairs = elsewhere(vi);
    const cover = vr.total ? pairs.length / vr.total : 0;
    if (cover < 0.6 || (vr.status !== "ok" && pairs.length < 2)) return;
    for (const [, j] of pairs) claimed[j] = 1;
    if (vr.status === "ok") { vr.repeated = true; return; }
    // heard, but not in its place: the words count as heard, the verse and its transitions as out of order
    vr.status = "outOfOrder";
    const at = new Map(pairs.map(([i, j]) => [R[i].position, j] as const));
    vr.words = vr.words.map((w) => (w.ok || !at.has(w.position) ? w : { ...w, ok: true, h: at.get(w.position)!, t: timeOf(at.get(w.position)!) }));
    vr.heard = vr.words.filter((w) => w.ok).length;
    vr.share = vr.heard / vr.total;
    vr.t = vr.words.find((w) => w.h >= 0)?.t ?? null;
  });

  // transitions between neighbouring verses of the same surah
  const links: LinkResult[] = [];
  const lastH = (vr: VerseResult) => { for (let k = vr.words.length - 1; k >= 0; k--) if (vr.words[k].h >= 0) return vr.words[k].h; return -1; };
  const firstH = (vr: VerseResult) => vr.words.find((w) => w.h >= 0)?.h ?? -1;
  for (let k = 1; k < out.length; k++) {
    const a = out[k - 1], b = out[k];
    const [sa, va] = a.key.split(":").map(Number), [sb, vb] = b.key.split(":").map(Number);
    if (sa !== sb || vb !== va + 1) continue;
    const base = { key: b.key, from: a.key };
    if (a.status === "missing" || b.status === "missing") { links.push({ ...base, ok: false, reason: "missing", pauseMs: null }); continue; }
    if (a.status === "outOfOrder" || b.status === "outOfOrder") { links.push({ ...base, ok: false, reason: "order", pauseMs: null }); continue; }
    const ha = lastH(a), hb = firstH(b);
    if (ha < 0 || hb < 0) { links.push({ ...base, ok: false, reason: "missing", pauseMs: null }); continue; }
    if (hb < ha) { links.push({ ...base, ok: false, reason: "order", pauseMs: null }); continue; }
    let between = 0;
    for (let j = ha + 1; j < hb; j++) if (!usedH[j]) between++;
    const ta = timeOf(ha), tb = timeOf(hb);
    const gap = ta !== null && tb !== null ? tb - ta : null;
    if (between >= 3) links.push({ ...base, ok: false, reason: "restart", pauseMs: gap });
    else if (gap !== null && gap > pauseMs) links.push({ ...base, ok: false, reason: "pause", pauseMs: gap });
    else links.push({ ...base, ok: true, reason: null, pauseMs: gap });
  }

  // pauses inside a verse (timing only): between two heard words that follow each other in the verse
  const hesitations: Hesitation[] = [];
  for (const vr of out) {
    let prevT: number | null = null;
    for (const w of vr.words) {
      if (w.h < 0 || w.t === null) continue;
      if (prevT !== null && w.t - prevT > pauseMs) hesitations.push({ key: vr.key, position: w.position, ms: w.t - prevT });
      prevT = w.t;
    }
  }

  let extra = 0;
  for (let j = 0; j < m; j++) if (!usedH[j] && !claimed[j]) extra++;
  const heardN = out.reduce((x, v) => x + v.heard, 0);
  return { verses: out, links, hesitations, heard: heardN, total: n, extra };
}

/** the learner's suggested rating per verse (they confirm or change it): 3 good, 2 hesitant, 1 again */
export function suggestedGrade(v: VerseResult, hesitations: Hesitation[]): 1 | 2 | 3 {
  if (v.status === "missing" || v.status === "outOfOrder" || v.share < 0.6) return 1;
  if (v.status === "partial" || hesitations.some((h) => h.key === v.key)) return 2;
  return 3;
}
