// mirrors mobile/src/features/arabic-lang/build.ts (copied for the website; keep both in step)
import { lessonItems, unitItems, unitOfLesson, type LItem } from "./curriculum";
import { tx, type Lesson } from "./types";
import { loadFreq } from "./freq";

// Builds the exercises of a lesson or unit test from its content. Every exercise except "intro" is scored.
export type Ex =
  | { k: "intro"; item: LItem }
  | { k: "choose"; q: string; qAr: boolean; say?: string; opts: string[]; optsAr: boolean; ans: number }
  | { k: "listen"; say: string; opts: string[]; ans: number }
  | { k: "tiles"; q: string; answer: string[]; pool: string[] }
  | { k: "type"; q: string; target: string; say?: string }
  | { k: "speak"; target: string; q: string }
  | { k: "conj"; title: string; label: string; tr: string; opts: string[]; ans: number }
  | { k: "spot"; key: string; pos: number[]; ask: string };

const shuffle = <T,>(a: T[]): T[] => { const c = [...a]; for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; };
const words = (s: string) => s.replace(/[.،,؟?!]/g, "").split(/\s+/).filter(Boolean);
const isSentence = (it: LItem) => words(it.ar).length >= 2 && words(it.ar).length <= 7;

function options(right: string, pool: string[]): { opts: string[]; ans: number } {
  const others = shuffle([...new Set(pool.filter((p) => p !== right))]).slice(0, 3);
  const opts = shuffle([right, ...others]);
  return { opts, ans: opts.indexOf(right) };
}
function choose(it: LItem, pool: LItem[], reverse: boolean): Ex {
  if (reverse) { const o = options(it.ar, pool.map((p) => p.ar)); return { k: "choose", q: it.local, qAr: false, opts: o.opts, optsAr: true, ans: o.ans }; }
  const o = options(it.local, pool.map((p) => p.local));
  return { k: "choose", q: it.ar, qAr: true, say: it.ar, opts: o.opts, optsAr: false, ans: o.ans };
}
function tiles(it: LItem, pool: LItem[]): Ex {
  const answer = words(it.ar);
  const extra = shuffle(pool.flatMap((p) => words(p.ar)).filter((w) => !answer.includes(w))).slice(0, 2);
  return { k: "tiles", q: it.local, answer, pool: shuffle([...answer, ...extra]) };
}
function conjEx(l: Lesson, lang: string, n: number): Ex[] {
  if (!l.conj) return [];
  const rows = l.conj.rows;
  return shuffle(rows).slice(0, n).map((r) => {
    const o = options(r[1], rows.map((x) => x[1]));
    return { k: "conj", title: tx(l.conj!.title, lang), label: r[0], tr: r[2], opts: o.opts, ans: o.ans };
  });
}
const spotEx = (l: Lesson, lang: string): Ex[] => (l.spot ?? []).map((s) => ({ k: "spot", key: s.key, pos: s.pos, ask: tx(s.ask, lang) }));

/** loads run-time data a lesson needs before its exercises can be built (the Quran frequency track) */
export async function prepareLesson(l: Lesson, lang: string): Promise<void> {
  const u = unitOfLesson(l.id);
  if (l.freq) return loadFreq(l.freq, lang);
  if (l.test && u) {
    const fl = shuffle(u.lessons.filter((x) => x.freq)).slice(0, 2);
    await Promise.all(fl.map((x) => loadFreq(x.freq!, lang)));
  }
}

export function buildLesson(l: Lesson, lang: string, opt: { canSpeak: boolean }): Ex[] {
  const u = unitOfLesson(l.id);
  if (l.freq) return buildFreq(l, lang, opt);
  if (l.test && u) return buildTest(u.lessons.filter((x) => !x.test), lang, opt);
  const items = lessonItems(l, lang);
  const pool = u ? [...items, ...unitItems(u, lang)] : items;
  const intro: Ex[] = items.slice(0, 10).map((item) => ({ k: "intro", item }));
  const ex: Ex[] = [];
  items.forEach((it, i) => ex.push(choose(it, pool, i % 2 === 1)));
  if (opt.canSpeak) shuffle(items).slice(0, 2).forEach((it) => { const o = options(it.ar, pool.map((p) => p.ar)); ex.push({ k: "listen", say: it.ar, opts: o.opts, ans: o.ans }); });
  shuffle(items.filter(isSentence)).slice(0, 3).forEach((it) => ex.push(tiles(it, pool)));
  const short = items.filter((it) => words(it.ar).length <= 2);
  shuffle(short).slice(0, 2).forEach((it) => ex.push({ k: "type", q: it.local, target: it.ar, say: opt.canSpeak ? it.ar : undefined }));
  const speakable = items.filter((it) => words(it.ar).length >= 2) ;
  const sp = shuffle(speakable.length ? speakable : items)[0];
  if (sp) ex.push({ k: "speak", target: sp.ar, q: sp.local });
  ex.push(...conjEx(l, lang, 3));
  const mixed = shuffle(ex).slice(0, 12);
  return [...intro, ...mixed, ...spotEx(l, lang)];
}

export function buildTest(lessons: Lesson[], lang: string, opt: { canSpeak: boolean }): Ex[] {
  const all = lessons.flatMap((l) => lessonItems(l, lang));
  const picks = shuffle(all).slice(0, 10);
  const ex: Ex[] = picks.map((it, i) => (isSentence(it) && i % 3 === 2 ? tiles(it, all) : choose(it, all, i % 2 === 0)));
  if (opt.canSpeak && picks[0]) { const o = options(picks[0].ar, all.map((p) => p.ar)); ex.push({ k: "listen", say: picks[0].ar, opts: o.opts, ans: o.ans }); }
  const withConj = lessons.filter((l) => l.conj);
  if (withConj.length) ex.push(...conjEx(shuffle(withConj)[0], lang, 2));
  const spots = shuffle(lessons.flatMap((l) => spotEx(l, lang))).slice(0, 2);
  return [...shuffle(ex), ...spots];
}

export const scored = (e: Ex) => e.k !== "intro";

/** Quran frequency track: meaning both ways and listening; no typing (Uthmani spelling with its special signs) */
function buildFreq(l: Lesson, lang: string, opt: { canSpeak: boolean }): Ex[] {
  const items = lessonItems(l, lang);
  const intro: Ex[] = items.map((item) => ({ k: "intro", item }));
  const ex: Ex[] = items.map((it, i) => choose(it, items, i % 2 === 1));
  if (opt.canSpeak) shuffle(items).slice(0, 3).forEach((it) => { const o = options(it.ar, items.map((p) => p.ar)); ex.push({ k: "listen", say: it.ar, opts: o.opts, ans: o.ans }); });
  return [...intro, ...shuffle(ex).slice(0, 16)];
}
