// Makhraj coach (Shams 3.0): the five letters learners find hardest – ʿayn, ḥāʾ, khāʾ, qāf, ḍād – with the place of
// articulation (makhraj), the letter they are most often confused with, the classical practice syllables and the
// surahs whose words are used for the listening quiz. Pure data, no text in a reader's language (that is in
// makhraj/text.ts); mirrors mobile/src/features/shams2/makhrajData.ts (keep both identical below this comment).
// Arabic here is letters and practice syllables only; every Quran word comes from the word data (Quran.com), never
// typed. Places of articulation after Ibn al-Jazarī, al-Muqaddima (al-Jazariyya), verses 9–17; the listening quiz
// surahs were chosen from the word data so that both letters of a pair occur (counted 22.10.2026).
// Honesty: nothing here measures pronunciation. The device voice speaks the syllables for orientation only; the model
// is the reciter's recording; the learner rates their own sound, a teacher corrects.

export const REGIONS = ["throatDeep", "throatMid", "throatNear", "tongueBack", "tongueBackFront", "tongueSide", "tongueTipTeeth"] as const;
export type Region = (typeof REGIONS)[number];

export type LetterId = "ayn" | "ha" | "kha" | "qaf" | "dad";
export type PartnerId = "hamza" | "h" | "ha" | "kaf" | "zha";
export type Partner = { id: PartnerId; ch: string; chars: string[]; region: Region };
export type MakhrajLetter = {
  id: LetterId;
  ch: string; // the letter
  arName: string; // its name in Arabic
  region: Region;
  heavy: boolean; // tafkhīm (one of the elevated letters خص ضغط قظ)
  partner: Partner; // the letter it is most often confused with (listening quiz)
  syllables: string[]; // with sukūn after a hamza with fatḥa (the classical way to find a makhraj), then the three vowels
  quizSurahs: number[]; // surahs whose words carry both letters of the pair
};

export const MAKHRAJ_LETTERS: MakhrajLetter[] = [
  { id: "ayn", ch: "ع", arName: "عَيْن", region: "throatMid", heavy: false, partner: { id: "hamza", ch: "ء", chars: ["ء", "أ", "إ", "ؤ", "ئ"], region: "throatDeep" }, syllables: ["أَعْ", "عَ", "عِ", "عُ"], quizSurahs: [1, 78, 79, 80] },
  { id: "ha", ch: "ح", arName: "حَاء", region: "throatMid", heavy: false, partner: { id: "h", ch: "ه", chars: ["ه"], region: "throatDeep" }, syllables: ["أَحْ", "حَ", "حِ", "حُ"], quizSurahs: [1, 79, 80, 85] },
  { id: "kha", ch: "خ", arName: "خَاء", region: "throatNear", heavy: true, partner: { id: "ha", ch: "ح", chars: ["ح"], region: "throatMid" }, syllables: ["أَخْ", "خَ", "خِ", "خُ"], quizSurahs: [78, 79, 87, 98] },
  { id: "qaf", ch: "ق", arName: "قَاف", region: "tongueBack", heavy: true, partner: { id: "kaf", ch: "ك", chars: ["ك"], region: "tongueBackFront" }, syllables: ["أَقْ", "قَ", "قِ", "قُ"], quizSurahs: [78, 84, 86, 113] },
  { id: "dad", ch: "ض", arName: "ضَاد", region: "tongueSide", heavy: true, partner: { id: "zha", ch: "ظ", chars: ["ظ"], region: "tongueTipTeeth" }, syllables: ["أَضْ", "ضَ", "ضِ", "ضُ"], quizSurahs: [1, 83, 86, 88, 92, 94] },
];
export const letterById = (id: string | undefined | null): MakhrajLetter => MAKHRAJ_LETTERS.find((l) => l.id === id) ?? MAKHRAJ_LETTERS[0];

// ---------- words (from the loaded word data; the caller passes the verses) ----------
const MARK = "[ً-ٰٟۖ-ࣰۭ-ࣳ]";
const MARKS_ALL = new RegExp(MARK, "gu");
const CLUSTER = new RegExp(`[^\\sً-ٰٟۖ-ࣰۭ-ࣳ]${MARK}*`, "gu");
const SUKUN = /[ْۡ]/;
/** the letters of a word without signs (alif wasla as alif) */
export const bareOf = (w: string) => w.replace(MARKS_ALL, "").replace(/ٱ/g, "ا");
/** the word contains the letter (any of `chars`) */
export const hasAny = (w: string, chars: string[]) => { const b = bareOf(w); return chars.some((c) => b.includes(c)); };
/** the word contains the letter with sukūn (the letter is easiest to hear there: أَعْ) */
export function withSukun(w: string, ch: string): boolean {
  return (w.match(CLUSTER) ?? []).some((c) => c[0] === ch && SUKUN.test(c));
}

export type WordRef = { ar: string; ref: string; verseKey: string; position: number };
type VerseLike = { verse_key: string; words: { char_type_name: string; text_uthmani: string; position: number }[] };
const refOf = (v: VerseLike, w: VerseLike["words"][number]): WordRef => {
  const [s, a] = v.verse_key.split(":");
  return { ar: w.text_uthmani, ref: `${s}:${a}:${w.position}`, verseKey: v.verse_key, position: w.position };
};
/** words of the verses with the letter (unique by spelling, mushaf order); those with sukūn on the letter first */
export function wordsWithLetter(verses: VerseLike[], l: MakhrajLetter, max = 8, exclude: string[] = []): WordRef[] {
  const seen = new Set<string>();
  const strong: WordRef[] = [], rest: WordRef[] = [];
  for (const v of verses) for (const w of v.words) {
    if (w.char_type_name !== "word") continue;
    const ar = w.text_uthmani;
    if (seen.has(ar) || !hasAny(ar, [l.ch]) || (exclude.length && hasAny(ar, exclude))) continue;
    seen.add(ar);
    (withSukun(ar, l.ch) ? strong : rest).push(refOf(v, w));
  }
  return [...strong, ...rest].slice(0, max);
}

export type QuizItem = { answer: "letter" | "partner"; word: WordRef; exact: boolean };
/** pairs for the listening quiz: a word with the letter and a word with its partner (never both in one word).
 *  A real minimal pair (the same letters except this one) is used where the loaded words have one; otherwise words
 *  of similar length. The order is shuffled with `seed` (stable for one round). */
export function quizItems(verses: VerseLike[], l: MakhrajLetter, n = 8, seed = 1): QuizItem[] {
  const mine = wordsWithLetter(verses, l, 200, l.partner.chars);
  const seen = new Set<string>();
  const theirs: WordRef[] = [];
  for (const v of verses) for (const w of v.words) {
    if (w.char_type_name !== "word" || seen.has(w.text_uthmani)) continue;
    if (!hasAny(w.text_uthmani, l.partner.chars) || hasAny(w.text_uthmani, [l.ch])) continue;
    seen.add(w.text_uthmani);
    theirs.push(refOf(v, w));
  }
  if (!mine.length || !theirs.length) return [];
  const used = new Set<string>();
  const pairs: [WordRef, WordRef, boolean][] = [];
  const swap = (b: string) => b.split(l.ch).join("\u0000");
  const skel = (b: string) => { let x = b; for (const c of l.partner.chars) x = x.split(c).join("\u0000"); return x; };
  for (const a of mine) {
    if (pairs.length >= Math.ceil(n / 2)) break;
    const ka = swap(bareOf(a.ar));
    let b = theirs.find((x) => !used.has(x.ref) && skel(bareOf(x.ar)) === ka);
    const exact = !!b;
    b ??= theirs.filter((x) => !used.has(x.ref)).sort((x, y) => Math.abs(bareOf(x.ar).length - bareOf(a.ar).length) - Math.abs(bareOf(y.ar).length - bareOf(a.ar).length))[0];
    if (!b) break;
    used.add(b.ref);
    pairs.push([a, b, exact]);
  }
  const items: QuizItem[] = pairs.flatMap(([a, b, exact]) => [{ answer: "letter" as const, word: a, exact }, { answer: "partner" as const, word: b, exact }]);
  // deterministic shuffle (mulberry32)
  let s = seed >>> 0;
  const rnd = () => { s += 0x6d2b79f5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
  return items.slice(0, n);
}

// ---------- the side view of mouth and throat (MouthDiagram, app and web draw the same geometry) ----------
// Coordinates 0–260, shown through VIEWBOX; the face looks to the left. Hand-drawn paths, not anatomy to scale.
export const VIEWBOX = "28 40 216 214";
export const DIAGRAM = {
  head: "M86 10 C62 14 56 34 62 48 C58 58 46 70 38 82 C36 86 40 89 46 89 L56 90 C52 95 50 99 51 103 C53 106 55 107 57 108 C53 111 51 115 52 119 C54 124 58 126 60 128 C56 134 54 142 56 150 C60 160 76 166 96 168 C108 170 114 178 116 196 L118 252 L214 252 C206 226 202 204 204 184 C206 166 220 150 232 128 C246 100 242 60 220 36 C200 16 160 4 120 6 C106 6 96 7 86 10 Z",
  nasal: "M64 62 C86 58 118 60 150 70 C162 74 170 80 176 88",
  palate: "M62 99 C70 92 86 86 104 84 C120 82 134 84 146 90",
  velum: "M146 90 C156 96 162 104 162 112 C162 118 158 121 155 119 C152 116 152 110 148 106",
  pharynx: "M176 88 C180 110 180 140 178 170 C177 190 176 210 176 252",
  cavity: "M62 99 C70 92 86 86 104 84 C120 82 134 84 146 90 C156 92 166 92 174 92 C178 120 178 150 177 180 L176 252 L156 252 L156 214 C154 200 152 190 150 178 C152 158 156 130 146 108 C136 100 120 98 102 99 C84 100 70 106 64 113 C60 110 59 104 62 99 Z",
  tongueBody: "M64 113 C70 106 84 100 102 99 C120 98 136 100 146 108 C154 116 156 128 154 142 C152 158 150 170 146 180 C140 192 130 196 122 196 C108 194 96 186 86 176 C76 164 66 140 64 113 Z",
  tongue: "M64 113 C70 106 84 100 102 99 C120 98 136 100 146 108 C154 116 156 128 154 142 C152 158 150 170 146 180 C140 192 130 196 122 196",
  epiglottis: "M150 178 C154 170 160 168 164 172",
  larynx: "M156 204 C160 200 168 200 172 204 M156 214 C160 210 168 210 172 214",
  teethUp: "M57 99 L65 99 L64 108 C62 110 59 110 58 108 Z",
  teethDown: "M58 114 C59 112 62 112 64 114 L65 123 L57 123 Z",
  molars: "M98 92 L118 90 L119 95 L99 97 Z",
  lipUp: "M51 103 C53 106 55 107 57 108",
  lipDown: "M57 110 C53 112 51 115 52 119",
};
/** where each place of articulation is marked: centre and radius of the glow, and the anchor of its label */
export const REGION_SPOTS: Record<Region, { x: number; y: number; r: number; side?: boolean }> = {
  throatDeep: { x: 166, y: 200, r: 11 },
  throatMid: { x: 168, y: 160, r: 12 },
  throatNear: { x: 166, y: 126, r: 11 },
  tongueBack: { x: 152, y: 112, r: 10 },
  tongueBackFront: { x: 134, y: 94, r: 10 },
  tongueSide: { x: 108, y: 97, r: 12, side: true }, // the edge of the tongue at the upper molars (seen through the cheek)
  tongueTipTeeth: { x: 63, y: 111, r: 8 },
};
