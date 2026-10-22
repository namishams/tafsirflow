// Recitation check: compares what the browser's speech recognition heard with the words of the verse.
// Recognition returns plain Arabic without vowel signs and in today's spelling, the mushaf uses Uthmani spelling –
// so both sides are reduced to a common form, and a word also counts if its consonant skeleton matches.
// It is a word check ("words heard"), never a judgement of pronunciation or tajweed.
const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
export function norm(w: string): string {
  return w.replace(MARKS, "").replace(/[ٱأإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/ء/g, "").replace(/[^ء-ي]/g, "");
}
const skeletonOfNorm = (n: string) => n.replace(/[اوي]/g, "");
function lev(a: string, b: string): number {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0]; d[0] = i;
    for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t; }
  }
  return d[b.length];
}

/** strict: only the same word after normalisation counts (no skeleton or near match) */
export type SameOptions = { strict?: boolean };
/** a word reduced once (normal form and consonant skeleton), for comparing many words quickly */
export type Prepared = { n: string; k: string };
export const prepare = (w: string): Prepared => { const n = norm(w); return { n, k: skeletonOfNorm(n) }; };
export function samePrepared(a: Prepared, b: Prepared, opts?: SameOptions): boolean {
  if (!a.n || !b.n) return false;
  if (a.n === b.n) return true;
  if (opts?.strict) return false;
  if (a.k.length >= 2 && a.k === b.k) return true;
  const max = Math.max(a.n.length, b.n.length);
  if (Math.abs(a.n.length - b.n.length) > max * 0.25) return false; // cannot reach 0.75 similarity
  return 1 - lev(a.n, b.n) / max >= 0.75;
}
export function same(verseWord: string, heard: string, opts?: SameOptions): boolean {
  return samePrepared(prepare(verseWord), prepare(heard), opts);
}
// In order, with a little slack: the reciter may repeat a word or the recogniser may add one
export function align(verseWords: string[], heard: string, opts?: SameOptions): { ok: boolean[]; score: number } {
  const t = heard.split(/\s+/).filter(Boolean).map(prepare);
  const ok: boolean[] = [];
  let j = 0;
  for (const w of verseWords) {
    const p = prepare(w);
    let hit = -1;
    for (let k = j; k < Math.min(t.length, j + 4); k++) if (samePrepared(p, t[k], opts)) { hit = k; break; }
    ok.push(hit >= 0);
    if (hit >= 0) j = hit + 1;
  }
  return { ok, score: verseWords.length ? ok.filter(Boolean).length / verseWords.length : 0 };
}
