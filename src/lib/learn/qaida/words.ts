// mirrors mobile/src/features/qaida/words.ts (copied for the website; keep both in step)
import { useEffect, useState } from "react";
import { useLang } from "@/lib/learn/i18n";
import { getVerses, type Verse, type Word } from "@/lib/learn/quran";
import { useReciter } from "@/lib/learn/reciter";
import { wordAudioUrl } from "@/lib/arabic";

// Every Quran example of the reading course comes from the app's word data (Quran.com via /api/q), never typed by
// hand: a lesson names a few surahs and a rule (contains tanwin, shadda, …), and the words are picked from the loaded
// verses. Letters and syllables are the only Arabic typed in the course.

export type QWord = { ar: string; ref: string; verseKey: string; position: number; tr: string; meaning: string };

// Unicode marks of the Uthmani text
export const M = {
  fatha: "َ", kasra: "ِ", damma: "ُ", sukun: "ْ", sukunU: "ۡ", shadda: "ّ",
  tanween: /[ً-ࣰٍ-ࣲ]/, dagger: "ٰ", wasla: "ٱ",
  waqf: /[ۖ-ۜ]/, small: /[ۥۦٰۧۨ]/, rasm: /[ۭ۟۠ۢ]/,
};
const MARK = "[ً-ٰٟۖ-ࣰۭ-ࣳ]";
const CLUSTER = new RegExp(`[^\\sً-ٰٟۖ-ࣰۭ-ࣳ]${MARK}*`, "gu");
const MARKS_ALL = new RegExp(MARK, "gu");

/** a word in letter clusters (base letter with its signs), right to left in reading order */
export const clusters = (w: string) => w.match(CLUSTER) ?? [];
/** the letters of a word without any signs */
export const bare = (w: string) => w.replace(MARKS_ALL, "").replace(/ٱ/g, "ا");

export type WordRule = "short" | "tanween" | "madd" | "sukun" | "shadda" | "taMarbuta" | "alifMaqsura" | "hamza" | "wasla" | "waqf" | "small" | "rasm" | "any";
const SHORT = new Set([M.fatha, M.kasra, M.damma]);
export function fits(rule: WordRule, ar: string): boolean {
  switch (rule) {
    case "short": {
      const cs = clusters(ar);
      return cs.length >= 2 && cs.length <= 4 && cs.every((c) => c.length === 2 && SHORT.has(c[1]));
    }
    case "tanween": return M.tanween.test(ar);
    case "madd": return ar.includes(M.dagger) || /َا|ِي(?![ً-ٟ])|ُو(?![ً-ٟ])/.test(ar);
    case "sukun": return ar.includes(M.sukun) || ar.includes(M.sukunU);
    case "shadda": return ar.includes(M.shadda);
    case "taMarbuta": return ar.includes("ة");
    case "alifMaqsura": return ar.includes("ى");
    case "hamza": return /[ءأإؤئ]/.test(ar);
    case "wasla": return ar.includes(M.wasla);
    case "waqf": return M.waqf.test(ar);
    case "small": return M.small.test(ar);
    case "rasm": return M.rasm.test(ar);
    default: return true;
  }
}

const cache = new Map<string, Promise<Verse[]>>();
function load(surah: number, lang: string, folder: string, reciter: Parameters<typeof getVerses>[2]) {
  const k = `${surah}:${lang}:${folder}`;
  let p = cache.get(k);
  if (!p) { p = getVerses(surah, lang, reciter); cache.set(k, p); p.catch(() => cache.delete(k)); }
  return p;
}

export const realWords = (v: Verse): Word[] => v.words.filter((w) => w.char_type_name === "word");
export function toQWord(v: Verse, w: Word): QWord {
  const [s, a] = v.verse_key.split(":");
  return { ar: w.text_uthmani, ref: `${s}:${a}:${w.position}`, verseKey: v.verse_key, position: w.position, tr: w.transliteration?.text ?? "", meaning: w.translation?.text ?? "" };
}
export const qwordAudio = (w: QWord) => wordAudioUrl(w.ref);

/** verses of several surahs (word data with timings), loaded once per language and reciter */
export function useSurahs(surahs: number[]): { verses: Verse[] | null; error: boolean } {
  const { lang } = useLang();
  const [reciter] = useReciter();
  const key = surahs.join(",");
  const [st, setSt] = useState<{ verses: Verse[] | null; error: boolean }>({ verses: null, error: false });
  useEffect(() => {
    if (!surahs.length) { setSt({ verses: [], error: false }); return; }
    let alive = true;
    setSt({ verses: null, error: false });
    Promise.all(surahs.map((s) => load(s, lang, reciter.folder, reciter)))
      .then((vs) => { if (alive) setSt({ verses: vs.flat(), error: false }); })
      .catch(() => { if (alive) setSt({ verses: null, error: true }); });
    return () => { alive = false; };
  }, [key, lang, reciter]); // eslint-disable-line react-hooks/exhaustive-deps
  return st;
}

/** the words of the loaded verses that follow a rule, unique by spelling, in mushaf order */
export function pickWords(verses: Verse[], rule: WordRule, max = 12, letters?: string[]): QWord[] {
  const seen = new Set<string>();
  const out: QWord[] = [];
  for (const v of verses) for (const w of realWords(v)) {
    const ar = w.text_uthmani;
    if (seen.has(ar) || !fits(rule, ar)) continue;
    if (letters && !letters.some((l) => bare(ar).includes(l))) continue;
    seen.add(ar);
    out.push(toQWord(v, w));
    if (out.length >= max) return out;
  }
  return out;
}

/** a model word for a letter: the first word in the loaded verses that starts with it (for its recording) */
export function wordStartingWith(verses: Verse[], ch: string): QWord | null {
  for (const v of verses) for (const w of realWords(v)) {
    const b = bare(w.text_uthmani).replace(/^ال/, "");
    if (b.startsWith(ch)) return toQWord(v, w);
  }
  return null;
}

/** short verses (up to `maxWords` words) */
export const shortVerses = (verses: Verse[], maxWords = 6) => verses.filter((v) => realWords(v).length <= maxWords);
