// The flexible classic path of the Shams Method (Shams 3.0, package 3) – pure helpers, no storage, no network.
// The app has the same file as mobile/src/features/shams/flex.ts; keep both in step.
//   chainUnits      the phrase units for building a verse up backwards (split at the stop marks, at most four words)
//   unitStarts      where each unit starts in the reciter's recording (from the word timings)
//   comprehensionQ  "which meaning belongs to this verse": its own translation among those of 2–3 neighbouring verses
//   placement       when the quick check "I know this already" is offered, and when a verse starts with it right away
//   suggestRating   the rating suggested after the on-device word check (the learner still decides)
// Nothing here is Quran text: words and translations always come from the loaded verse data.

/** the pause marks of the muṣḥaf (ۖ ۗ ۘ ۙ ۚ ۛ ۜ) – the same rule as the talaqqī phrase drill */
export const WAQF = /[ۖ-ۜ]/;
/** at most this many words in one unit */
export const UNIT_MAX = 4;
/** a verse of this many words or fewer is not split: it is heard and repeated as a whole */
export const SHORT_VERSE = 3;

export type FlexWord = { position: number; text: string };
/** a phrase unit: word positions `from`–`to` (inclusive, as in the verse data) */
export type Unit = { from: number; to: number; n: number };

/** The phrase units of a verse for the backward build-up: a unit ends at a pause mark or after four words; a last unit of
 *  one word joins the one before. Verses of three words or fewer get no units (listen-and-repeat instead). */
export function chainUnits(words: readonly FlexWord[], max = UNIT_MAX): Unit[] {
  if (words.length <= SHORT_VERSE) return [];
  const out: FlexWord[][] = [];
  let cur: FlexWord[] = [];
  for (const w of words) {
    cur.push(w);
    if (WAQF.test(w.text) || cur.length >= max) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  if (out.length > 1 && out[out.length - 1].length === 1) { const last = out.pop()!; out[out.length - 1].push(...last); }
  return out.map((u) => ({ from: u[0].position, to: u[u.length - 1].position, n: u.length }));
}

/** the start (ms) of every unit in the recording, or null when a unit has no timing (then the verse is repeated whole) */
export function unitStarts(units: readonly Unit[], segments: readonly { word: number; start: number }[]): number[] | null {
  if (units.length < 2) return null;
  const at = new Map<number, number>();
  for (const s of segments) if (!at.has(s.word)) at.set(s.word, s.start);
  const out: number[] = [];
  for (const u of units) {
    const ms = at.get(u.from);
    if (ms === undefined) return null;
    out.push(ms);
  }
  for (let i = 1; i < out.length; i++) if (out[i] < out[i - 1]) return null;
  return out;
}

export type CompVerse = { verse_key: string; translation?: string | null };
export type CompQ = { key: string; options: { key: string; text: string }[]; answer: number };

/** a translation as plain text (footnote marks and tags removed), shortened for a choice */
export function plainTranslation(s: string | null | undefined, max = 220): string {
  const t = String(s ?? "").replace(/<sup[^>]*>.*?<\/sup>/gi, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** "Which meaning belongs to this verse?" – the verse's own translation among those of the nearest neighbouring verses
 *  (2–3 others, different texts), in a fixed order per verse and `seed`. null when there are not two different texts. */
export function comprehensionQ(verses: readonly CompVerse[], idx: number, seed = 0, others = 3): CompQ | null {
  const me = verses[idx];
  if (!me) return null;
  const mine = plainTranslation(me.translation);
  if (!mine) return null;
  const seen = new Set([mine]);
  const picked: { key: string; text: string }[] = [];
  for (let d = 1; picked.length < others && (idx - d >= 0 || idx + d < verses.length); d++) {
    for (const j of [idx + d, idx - d]) {
      const v = verses[j];
      if (!v || picked.length >= others) continue;
      const text = plainTranslation(v.translation);
      if (!text || seen.has(text)) continue;
      seen.add(text);
      picked.push({ key: v.verse_key, text });
    }
  }
  if (!picked.length) return null;
  const all = [{ key: me.verse_key, text: mine }, ...picked];
  const order = all.map((o, i) => ({ o, r: hash(`${me.verse_key}:${seed}:${o.key}:${i}`) })).sort((a, b) => a.r - b.r).map((x) => x.o);
  return { key: me.verse_key, options: order, answer: order.findIndex((o) => o.key === me.verse_key) };
}

/** after this many passed quick checks in a row, a new verse starts with the quick check right away (placement) */
export const PLACEMENT_STREAK = 2;
export type Placement = "off" | "offer" | "start";
/** Placement rule: the quick check "I know this already" is offered on new verses only (known verses already get a
 *  short plan from the coach); once the learner has passed it PLACEMENT_STREAK times in a row, the next new verse opens
 *  with it straight away. A verse that does not sit ends the run, and the full path follows. Not in kids mode. */
export function placement(kind: string, streak: number, kids = false): Placement {
  if (kids || kind !== "new") return "off";
  return streak >= PLACEMENT_STREAK ? "start" : "offer";
}

/** the rating suggested after the word check (share of words heard, 0–1): only a suggestion, the learner decides */
export function suggestRating(score: number | null): "again" | "good" | "easy" | null {
  if (score === null || !Number.isFinite(score)) return null;
  return score >= 0.95 ? "easy" : score >= 0.75 ? "good" : "again";
}

/** a pause long enough to repeat what was just heard: as long as the recording, 1.5–12 s */
export const repeatPauseMs = (ms: number) => Math.min(12_000, Math.max(1_500, Math.round(ms)));

/** the verses learned in this sitting as one range of the same surah for "recite today's verses in one go", or null */
export function sittingRange(s: number, verses: readonly number[]): { s: number; from: number; to: number } | null {
  const vs = verses.filter((v) => Number.isInteger(v) && v > 0);
  if (!vs.length) return null;
  return { s, from: Math.min(...vs), to: Math.max(...vs) };
}
