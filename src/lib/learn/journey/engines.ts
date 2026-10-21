// mirrors mobile/src/features/journey/engines.ts (copied for the website; keep in step with the app)
import { cachedFetch, DAY } from "@/lib/learn/content/sources/net";
import { TOTAL_VERSES, indexOf, keyAt } from "@/lib/quranIndex";
import { readSrs, today } from "@/lib/learning";
import { readSrsState } from "@/lib/learn/srs/store";
import { knownVerses } from "@/lib/learn/shams2/qualityModel";
import { MUT_GROUPS } from "@/lib/learn/shams2/mutData";
import { SHIA_BOOKS, SUNNI_COLLECTIONS } from "./hadithCatalog";
import { shiaHadith, sunniHadith, type HadithItem } from "./hadith";
import type { TraditionChoice } from "@/lib/learn/tradition";
import { dayNum } from "@/lib/learn/feed/statsStore";
import { advance, readJourney, update, type EngineId } from "./store";

// The endless daily plans. Each is a pointer through a sequence that starts again when it ends and counts the cycle:
// the Quran in reading order (khatm), the memorised verses in order (hifz review), tafsir verse by verse with a
// different classical work for each pass, hadith of the day through whole collections, every Quranic lemma, and the
// groups of similar verses. No text is typed here: verses, tafsir and hadith come from the existing sources.

/** consecutive verse ranges ("2:142–2:150") of a list of verse indices in reading order */
export type Range = { s: number; a: number; b: number };
export function rangesOf(idx: number[]): Range[] {
  const out: Range[] = [];
  for (const i of idx) {
    const { s, v } = keyAt(i);
    const last = out[out.length - 1];
    if (last && last.s === s && last.b === v - 1) last.b = v; else out.push({ s, a: v, b: v });
  }
  return out;
}
export const readerHref = (s: number, v: number, tafsir = false) => `/surah/${s}?v=${v}${tafsir ? "&tafsir=1" : ""}`;

// ---------- Quran khatm (reading) ----------
export function khatmPortion(pos: number, per: number): { idx: number[]; to: number } {
  const to = Math.min(TOTAL_VERSES, pos + per);
  return { idx: Array.from({ length: to - pos }, (_, i) => pos + i), to };
}
export function doneKhatm() { const e = readJourney().e.khatm; const { to, idx } = khatmPortion(e.pos, e.per); advance("khatm", to, idx.length, TOTAL_VERSES); }

// ---------- hifz review over the memorised verses ----------
export function knownIndices(): number[] {
  try { return [...knownVerses(readSrs(), readSrsState(), today()).values()].map((k) => k.i).sort((a, b) => a - b); } catch { return []; }
}
export function reviewPortion(pos: number, per: number, known: number[]): { idx: number[]; to: number } {
  const from = known.findIndex((i) => i >= pos);
  if (from < 0) return { idx: [], to: TOTAL_VERSES };
  const idx = known.slice(from, from + per);
  const nextI = known[from + per];
  return { idx, to: nextI === undefined ? TOTAL_VERSES : nextI };
}
/** a review cycle over the whole Quran counts as "full" when every verse was memorised (6,230 of 6,236 counted) */
export function doneReview() {
  const known = knownIndices();
  const e = readJourney().e.review;
  const { idx, to } = reviewPortion(e.pos, e.per, known);
  if (!idx.length && to < TOTAL_VERSES) return;
  advance("review", to, idx.length, TOTAL_VERSES, (j) => { if (known.length >= TOTAL_VERSES - 6) j.full++; });
}

// ---------- tafsir, one classical work per pass ----------
export type Work = { key: "muyassar" | "saadi" | "ibnkathir"; re: RegExp };
export const WORKS: Work[] = [{ key: "muyassar", re: /muyassar/i }, { key: "saadi", re: /sa'?di|saadi|sa‘di/i }, { key: "ibnkathir", re: /kathir/i }];
/** the work suggested for pass n (1-based); the reader shows the source and lets the learner choose */
export const workOf = (pass: number) => WORKS[(Math.max(1, pass) - 1) % WORKS.length];
export function doneTafsir() { const e = readJourney().e.tafsir; const { to, idx } = khatmPortion(e.pos, e.per); advance("tafsir", to, idx.length, TOTAL_VERSES); }

// ---------- hadith of the day through whole collections ----------
export type HCol = { src: "sunnah" | "thaqalayn"; id: string; max: number; name: string };
export function hadithSequence(t: TraditionChoice | null): HCol[] {
  const sunni = ["nawawi", "bukhari", "muslim"].map((k) => SUNNI_COLLECTIONS.find((c) => c.key === k)).filter((c): c is (typeof SUNNI_COLLECTIONS)[number] => !!c)
    .map((c): HCol => ({ src: "sunnah", id: c.key, max: c.max, name: c.name }));
  const kafi = SHIA_BOOKS.filter((b) => b.id.startsWith("Al-Kafi"));
  const rest = SHIA_BOOKS.filter((b) => !b.id.startsWith("Al-Kafi"));
  const shia = [...kafi, ...rest].map((b): HCol => ({ src: "thaqalayn", id: b.id, max: b.max, name: `${b.name}${b.volume > 1 || b.id.includes("Volume") ? ` · ${b.volume}` : ""}` }));
  if (t === "shia") return shia;
  if (t === "both") return [...sunni, ...shia];
  return sunni;
}
/** the next hadith from position pos (numbers without a text in the source are skipped, at most 6 at a time) */
export async function loadHadith(col: HCol, pos: number, lang: string): Promise<{ item: HadithItem | null; n: number }> {
  for (let n = pos + 1, tries = 0; n <= col.max && tries < 6; n++, tries++) {
    const item = col.src === "sunnah" ? await sunniHadith(col.id, n, lang).catch(() => null) : await shiaHadith(col.id, n, lang).catch(() => null);
    if (item) return { item, n };
  }
  return { item: null, n: Math.min(col.max, pos + 6) };
}
/** marks hadith n of the current collection as read; at the end of a collection the next one starts */
export function doneHadith(seq: HCol[], n: number) {
  if (!seq.length) return;
  update((x) => {
    const e = x.e.hadith;
    const col = seq[x.hCol % seq.length];
    e.units += Math.max(1, n - e.pos);
    e.last = dayNum();
    if (n >= col.max) {
      const last = x.hCol % seq.length === seq.length - 1;
      e.pos = 0; x.hCol = last ? 0 : x.hCol + 1;
      if (last) e.cycles++;
      x.log.push(["hadith", e.last]);
    } else e.pos = n;
  });
}

// ---------- every Quranic lemma (nouns and verbs), most frequent first ----------
const MORPH = "https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt";
/** lemma, root, number of words, first occurrence "s:a:w" (the same parse as arabic-lang/freq.ts, without its 800 limit) */
export type Lemma = [string, string, number, string];
let lemmas: Promise<Lemma[]> | null = null;
export function allLemmas(): Promise<Lemma[]> {
  if (!lemmas) {
    lemmas = cachedFetch<Lemma[]>(MORPH, {
      key: "journey:lemmas:v1", text: true, ttlMs: 365 * DAY, timeoutMs: 60_000,
      transform: (txt: string) => {
        const m = new Map<string, Lemma>();
        const seen = new Set<string>();
        for (const line of txt.split("\n")) {
          const parts = line.split("\t");
          if (parts.length < 4 || (parts[2] !== "N" && parts[2] !== "V")) continue;
          const f = parts[3];
          const lem = /LEM:([^|]+)/.exec(f)?.[1];
          if (!lem) continue;
          const root = /ROOT:([^|]+)/.exec(f)?.[1] ?? "";
          const [s, a, w] = parts[0].split(":");
          const k = `${s}:${a}:${w}:${lem}`;
          if (seen.has(k)) continue;
          seen.add(k);
          const row = m.get(lem);
          if (row) row[2]++; else m.set(lem, [lem, root, 1, `${s}:${a}:${w}`]);
        }
        return [...m.values()].sort((x, y) => y[2] - x[2]);
      },
    });
    lemmas.catch(() => { lemmas = null; });
  }
  return lemmas;
}
export function doneLemmas(total: number) { const e = readJourney().e.lemma; const to = Math.min(total, e.pos + e.per); advance("lemma", to, to - e.pos, total); }

// ---------- mutashābihāt: one group after another ----------
export const MUT_COUNT = MUT_GROUPS.length;
export const mutGroup = (pos: number) => MUT_GROUPS[pos % Math.max(1, MUT_COUNT)];
export function doneMut() { const e = readJourney().e.mut; const to = Math.min(MUT_COUNT, e.pos + e.per); advance("mut", to, to - e.pos, MUT_COUNT); }

export const verseIndex = (key: string) => { const [s, v] = key.split(":").map(Number); return indexOf(s, v); };
export const isToday = (last: number) => last === dayNum();
export type { EngineId };
