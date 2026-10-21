// mirrors mobile/src/features/arabic-lang/freq.ts (copied for the website; keep both in step)
import { cachedFetch, DAY } from "@/lib/learn/content/sources/net";
import { loadVerse } from "@/lib/learn/srs/verse";
import type { LItem } from "./curriculum";

// The Quran frequency track (unit 17): the 500 most frequent Quran lemmas (nouns and verbs), counted from the
// Quranic Arabic Corpus morphology that the app already uses for its root table (GPL, via quran-morphology). Nothing
// is typed by hand: the list is built at run time, and each word is shown in the form and with the meaning of its
// first occurrence in Quran.com's word data (loadVerse), in the learner's language.

const MORPH = "https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt";
/** lemma, root, number of words, first occurrence "s:a:w" */
export type LemmaRow = [string, string, number, string];
export const FREQ_TOTAL = 500;
export const FREQ_PER_LESSON = 20;

let table: Promise<LemmaRow[]> | null = null;
export function lemmaTable(): Promise<LemmaRow[]> {
  if (!table) {
    table = cachedFetch<LemmaRow[]>(MORPH, {
      key: "lemmas:v1",
      text: true,
      ttlMs: 180 * DAY,
      timeoutMs: 60_000,
      transform: (txt: string) => {
        const m = new Map<string, LemmaRow>();
        const seen = new Set<string>();
        for (const line of txt.split("\n")) {
          const parts = line.split("\t");
          if (parts.length < 4 || (parts[2] !== "N" && parts[2] !== "V")) continue;
          const f = parts[3];
          if (/\bPRON\b|\bDEM\b|\bREL\b/.test(f)) continue; // pronouns and particles-like nouns are taught elsewhere
          const lem = /LEM:([^|]+)/.exec(f)?.[1];
          if (!lem) continue;
          const root = /ROOT:([^|]+)/.exec(f)?.[1] ?? "";
          const [s, a, w] = parts[0].split(":");
          const k = `${s}:${a}:${w}:${lem}`;
          if (seen.has(k)) continue;
          seen.add(k);
          const row = m.get(lem);
          if (row) row[2]++;
          else m.set(lem, [lem, root, 1, `${s}:${a}:${w}`]);
        }
        return [...m.values()].sort((x, y) => y[2] - x[2]).slice(0, 800);
      },
    });
    table.catch(() => { table = null; });
  }
  return table;
}

const items = new Map<string, LItem[]>();
const ck = (f: { from: number; n: number }, lang: string) => `${f.from}:${f.n}:${lang}`;

/** loads the words of one lesson of the track (form, transliteration and meaning from the word data) */
export async function loadFreq(f: { from: number; n: number }, lang: string): Promise<void> {
  if (items.has(ck(f, lang))) return;
  const rows = (await lemmaTable()).slice(f.from, f.from + f.n);
  // the verses of a lesson load side by side (at most six requests at a time) instead of four rounds one after the
  // other; the order of the list stays the frequency order
  const part: (LItem | null)[] = new Array(rows.length).fill(null);
  let next = 0;
  const worker = async () => {
    while (next < rows.length) {
      const i = next++;
      const [lemma, root, count, ref] = rows[i];
      const [s, a, w] = ref.split(":");
      try {
        const v = await loadVerse(`${s}:${a}`, lang);
        const word = v.words.find((x) => x.position === Number(w));
        if (!word || !word.meaning) continue;
        const tr = `${word.tr} · ${lemma}${root ? ` · ${[...root].join(" ")}` : ""} · ${count}×`;
        part[i] = { ar: word.text, tr, en: word.meaning, de: word.meaning, local: word.meaning } as LItem;
      } catch { /* this word is left out */ }
    }
  };
  await Promise.all(Array.from({ length: Math.min(6, rows.length) }, worker));
  const out: LItem[] = [];
  for (const p of part) if (p && !out.some((o) => o.ar === p.ar)) out.push(p);
  // an empty result is not kept, so "try again" really asks again
  if (out.length) items.set(ck(f, lang), out);
}
/** the loaded words of a lesson (empty until loadFreq finished) */
export const freqItems = (f: { from: number; n: number }, lang: string): LItem[] => items.get(ck(f, lang)) ?? [];
