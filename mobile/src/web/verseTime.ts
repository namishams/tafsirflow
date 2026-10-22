import WORDS from "./data/verse-words.json";

// How long a verse takes in the Shams Method – an estimate from the number of words in the verse, not a measurement.
// The word counts (src/lib/data/verse-words.json, one row per surah) are counted from Quran.com's word-by-word data by
// scripts/gen-verse-words.mjs; no Quran text is stored here. The app gets this file through mobile/scripts/sync-web.mjs.
//   new     ≈ 1.5 min + 0.1 min per word   (the seven steps; 1.5–14 min), × the learner's own pace once known
//   sabqi   ≈ 0.3 min + 0.03 min per word  (recite a recent verse from memory and rate it; 0.3–4 min)
//   manzil  ≈ 0.15 min + 0.02 min per word (recite an older verse in the day's portion; 0.15–3 min)
// For a verse of average length (12.4 words) that is about 2.7, 0.7 and 0.4 minutes; most verses take 2–8 minutes
// when new (short verses, as in Juzʾ ʿAmma, less than 2).

export type VerseKind = "new" | "sabqi" | "manzil";
/** verses `from`–`to` of surah `s` (the same shape as Shams 2.0's Range) */
export type VerseRange = { s: number; from: number; to: number };

const COUNTS = WORDS as number[][];
/** base minutes, minutes per word, lowest and highest estimate */
const MODEL: Record<VerseKind, [number, number, number, number]> = {
  new: [1.5, 0.1, 1.5, 14],
  sabqi: [0.3, 0.03, 0.3, 4],
  manzil: [0.15, 0.02, 0.15, 3],
};
/** words of an average verse (77,429 words in 6,236 verses), used for a verse outside the data */
export const AVERAGE_WORDS = 12.4;
/** fewer timed new verses than this: the model alone decides */
export const PACE_MIN_SAMPLES = 5;

/** the number of words of a verse (surah and verse number, as counted by Quran.com) */
export function verseWords(surah: number, verse: number): number {
  return COUNTS[surah - 1]?.[verse - 1] ?? AVERAGE_WORDS;
}
/** the number of words of a verse by its key ("2:255") */
export function verseWordsOf(key: string): number {
  const [s, v] = key.split(":").map(Number);
  return verseWords(s, v);
}

const model = (kind: VerseKind, words: number) => {
  const [base, perWord, lo, hi] = MODEL[kind];
  return Math.min(hi, Math.max(lo, base + perWord * Math.max(0, words)));
};

/** what the model expects per word of a new verse, averaged over the whole Quran (≈ 13.2 s): the scale of a pace sample */
export const MODEL_MS_PER_WORD = (() => {
  let ms = 0, words = 0;
  for (const row of COUNTS) for (const w of row) { ms += model("new", w) * 60000; words += w; }
  return words ? ms / words : 13248;
})();

/** One pace sample (qmc.shams2.pace.v1 newMsPerWord) from a new verse the learner took `ms` milliseconds for: the time
 *  per word, scaled to a verse of average length – a learner exactly on the model gives MODEL_MS_PER_WORD for a short
 *  verse as for a long one, so samples from Juzʾ ʿAmma and from al-Baqara can be compared. */
export function paceSample(ms: number, words: number): number {
  return (ms / (model("new", words) * 60000)) * MODEL_MS_PER_WORD;
}

/** the learner's own pace as a factor on the model (1 = as the model expects): the median of the pace samples over
 *  MODEL_MS_PER_WORD, kept between 0.5 and 3; 1 while there are fewer than five samples */
export function paceFactor(samples?: readonly number[] | null): number {
  const xs = (samples ?? []).filter((x) => Number.isFinite(x) && x > 0).sort((a, b) => a - b);
  if (xs.length < PACE_MIN_SAMPLES) return 1;
  const mid = xs.length >> 1;
  const median = xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
  return Math.min(3, Math.max(0.5, median / MODEL_MS_PER_WORD));
}

/** minutes for one verse of `words` words: new (the seven steps), sabqi or manzil. `pace` = the pace samples
 *  (qmc.shams2.pace.v1 newMsPerWord); they change only the estimate for new verses. Not rounded. */
export function estimateMinutes({ words, kind = "new", pace }: { words: number; kind?: VerseKind; pace?: readonly number[] | null }): number {
  const m = model(kind, words);
  return kind === "new" ? m * paceFactor(pace) : m;
}

/** minutes for one verse by its key */
export const verseMinutes = (key: string, kind: VerseKind = "new", pace?: readonly number[] | null) => estimateMinutes({ words: verseWordsOf(key), kind, pace });

/** minutes for whole verse ranges (verses outside a surah are left out). Not rounded. */
export function rangeMinutes(ranges: VerseRange | readonly VerseRange[], kind: VerseKind = "new", pace?: readonly number[] | null): number {
  const factor = kind === "new" ? paceFactor(pace) : 1;
  let sum = 0;
  const list: readonly VerseRange[] = "s" in ranges ? [ranges] : ranges;
  for (const r of list) {
    const n = COUNTS[r.s - 1]?.length ?? 0;
    for (let v = Math.max(1, r.from); v <= Math.min(n, r.to); v++) sum += model(kind, COUNTS[r.s - 1][v - 1]);
  }
  return sum * factor;
}

/** whole surahs `from`–`to` as verse ranges (e.g. Juzʾ ʿAmma = surahs 78–114) */
export function surahRanges(from: number, to = from): VerseRange[] {
  const out: VerseRange[] = [];
  for (let s = Math.max(1, from); s <= Math.min(114, to); s++) out.push({ s, from: 1, to: COUNTS[s - 1].length });
  return out;
}
