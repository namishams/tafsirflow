import { readJSON, writeJSON } from "@/lib/store";
import { VERSE_COUNTS } from "@/web/counts";
import { today } from "@/web/learning";
import { JUZ_START, TOTAL_VERSES, indexOf, keyAt } from "@/web/quranIndex";
import { shuffle } from "@/web/vocabStudy";
import { meaning } from "@/web/vocabI18n";
import { tajweedQ, vocabWord } from "./CardFace";
import { deckItems, kindOf, refOf, type DeckId } from "./decks";
import { EMPTY_TESTS, TESTS_KEY, type TestKind, type TestResult, type TestStore } from "./gate";
import { readSrsState } from "./store";
import { loadVerse } from "./verse";

// Test generation. Every question is multiple choice with four options:
//   meaning – an Arabic word (from the app's word data), choose its meaning
//   tajweed – a question of the tajweed course
//   cloze   – a verse from the Quran API with one word hidden, choose the missing word (other words of nearby verses as
//             distractors)
// Results are kept on this device (last MAX_RESULTS); a juz exam passed with PASS % gives an app certificate (Pro).
export type Question =
  | { type: "meaning"; ar: string; options: string[]; answer: number }
  | { type: "text"; prompt: string; options: string[]; answer: number }
  | { type: "cloze"; verseKey: string; words: { position: number; text: string }[]; hide: number; options: string[]; answer: number };
export const PASS = 0.8;
const MAX_RESULTS = 200;

function mc(right: string, pool: string[], n = 3) {
  const opts = shuffle([right, ...shuffle([...new Set(pool.filter((x) => x && x !== right))]).slice(0, n)]);
  return { options: opts, answer: opts.indexOf(right) };
}

function meaningQs(ids: string[], lang: string, n: number): Question[] {
  const words = ids.map((id) => vocabWord(refOf(id), lang)).filter((w): w is NonNullable<typeof w> => !!w);
  const pool = words.map((w) => meaning(w, lang));
  return shuffle(words).slice(0, n).map((w) => ({ type: "meaning" as const, ar: w.ar, ...mc(meaning(w, lang), pool) }));
}
function tajweedQs(n: number, lang: string): Question[] {
  return shuffle(deckItems("tajweed")).slice(0, n).map((id) => tajweedQ(refOf(id), lang)).filter((q): q is NonNullable<typeof q> => !!q)
    .map((q) => ({ type: "text" as const, prompt: q.q, options: q.options, answer: q.answer }));
}

async function clozeQs(keys: string[], lang: string): Promise<Question[]> {
  const verses = (await Promise.all(keys.map((k) => loadVerse(k, lang).catch(() => null)))).filter((v): v is NonNullable<typeof v> => !!v && v.words.length >= 2);
  const pool = verses.flatMap((v) => v.words.map((w) => w.text));
  return verses.map((v) => {
    const long = v.words.filter((w) => w.text.length >= 3);
    const target = shuffle(long.length ? long : v.words)[0];
    return { type: "cloze" as const, verseKey: v.key, words: v.words.map((w) => ({ position: w.position, text: w.text })), hide: target.position, ...mc(target.text, pool) };
  }).filter((q) => q.options.length === 4);
}

function randomKeys(from: number, to: number, n: number): string[] {
  const out = new Set<string>();
  for (let tries = 0; out.size < Math.min(n, to - from) && tries < n * 10; tries++) {
    const { s, v } = keyAt(from + Math.floor(Math.random() * (to - from)));
    if (!(s === 1 && v === 1)) out.add(`${s}:${v}`);
  }
  return [...out];
}
const juzBounds = (j: number) => {
  const a = indexOf(...(JUZ_START[j - 1].split(":").map(Number) as [number, number]));
  const b = j < 30 ? indexOf(...(JUZ_START[j].split(":").map(Number) as [number, number])) : TOTAL_VERSES;
  return [a, b] as const;
};

export async function buildTest(kind: TestKind, ref: string, lang: string): Promise<Question[]> {
  switch (kind) {
    case "placement":
      return shuffle([...meaningQs(deckItems("juzamma"), lang, 4), ...meaningQs(deckItems("vocab"), lang, 4), ...tajweedQs(2, lang)]);
    case "vocab":
      return meaningQs(deckItems((["juzamma", "vocab", "names"].includes(ref) ? ref : "juzamma") as DeckId), lang, 15);
    case "juz": { const j = Math.min(30, Math.max(1, Number(ref) || 30)); const [a, b] = juzBounds(j); return clozeQs(randomKeys(a, b, 10), lang); }
    case "surah": { const s = Math.min(114, Math.max(1, Number(ref) || 1)); const a = indexOf(s, 1); return clozeQs(randomKeys(a, a + VERSE_COUNTS[s - 1], Math.min(10, VERSE_COUNTS[s - 1])), lang); }
    case "weekly": {
      // a mix of the cards studied in the last seven days; Juz ʿAmma words when there are not enough yet
      const day = today();
      const recent = Object.entries(readSrsState().cards).filter(([, c]) => c.m && day - c.m.last <= 7).map(([id]) => id);
      const words = recent.filter((id) => ["word", "name"].includes(kindOf(id)));
      const verses = recent.filter((id) => ["verse", "dua"].includes(kindOf(id))).map(refOf);
      const qs = [...meaningQs(words.length >= 4 ? words : deckItems("juzamma"), lang, 6), ...(await clozeQs(shuffle(verses).slice(0, 4), lang))];
      return shuffle(qs.length >= 6 ? qs : [...qs, ...meaningQs(deckItems("juzamma"), lang, 10 - qs.length)]);
    }
  }
}

export const readTests = () => readJSON<TestStore>(TESTS_KEY, EMPTY_TESTS);
export function saveResult(r: Omit<TestResult, "id" | "at">, certify: boolean): TestResult {
  const s = readTests();
  const res: TestResult = { ...r, id: `${Date.now().toString(36)}`, at: Date.now() };
  const pct = r.total ? r.score / r.total : 0;
  const certs = certify && r.kind === "juz" && pct >= PASS && !s.certs.some((c) => c.juz === Number(r.ref))
    ? [...s.certs, { juz: Number(r.ref), at: Date.now(), pct: Math.round(pct * 100) }] : s.certs;
  writeJSON(TESTS_KEY, { results: [res, ...s.results].slice(0, MAX_RESULTS), certs: certs.slice(0, 30) }, true);
  return res;
}
