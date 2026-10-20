// Recitation check: compares what the browser's speech recognition heard with the words of the verse.
// Recognition returns plain Arabic without vowel signs and in today's spelling, the mushaf uses Uthmani spelling –
// so both sides are reduced to a common form, and a word also counts if its consonant skeleton matches.
const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
export function norm(w: string): string {
  return w.replace(MARKS, "").replace(/[ٱأإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/ء/g, "").replace(/[^ء-ي]/g, "");
}
const skeleton = (w: string) => norm(w).replace(/[اوي]/g, "");
function lev(a: string, b: string): number {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0]; d[0] = i;
    for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t; }
  }
  return d[b.length];
}
export function same(verseWord: string, heard: string): boolean {
  const a = norm(verseWord), b = norm(heard);
  if (!a || !b) return false;
  if (a === b) return true;
  const sa = skeleton(verseWord), sb = skeleton(heard);
  if (sa.length >= 2 && sa === sb) return true;
  return 1 - lev(a, b) / Math.max(a.length, b.length) >= 0.75;
}
// In order, with a little slack: the reciter may repeat a word or the recogniser may add one
export function align(verseWords: string[], heard: string): { ok: boolean[]; score: number } {
  const t = heard.split(/\s+/).filter(Boolean);
  const ok: boolean[] = [];
  let j = 0;
  for (const w of verseWords) {
    let hit = -1;
    for (let k = j; k < Math.min(t.length, j + 4); k++) if (same(w, t[k])) { hit = k; break; }
    ok.push(hit >= 0);
    if (hit >= 0) j = hit + 1;
  }
  return { ok, score: verseWords.length ? ok.filter(Boolean).length / verseWords.length : 0 };
}
