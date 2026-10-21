import type { Verse } from "@/lib/quran";
import { LETTERS, arName, forms, letter } from "@/web/arabic";
import { TEST_PASS, txOf, type QLesson, type QStage } from "./curriculum";
import { bare, clusters, fits, pickWords, realWords, shortVerses, toQWord, wordStartingWith, M, type QWord } from "./words";
import type { QKey } from "./texts";

// Builds the exercises of one lesson from the curriculum and the loaded Quran word data.
// Keys: "L:<letter>", "S:<syllable>|<sound>", "W:<s>:<a>:<w>" – the mistake counter and the review use them.

export type Ex =
  | { t: "learn"; big: string; title: string; body: string; speak?: string; word?: QWord }
  | { t: "choose"; q: string; big?: string; speak?: string; word?: QWord; options: { ar?: string; text?: string }[]; answer: number; key: string }
  | { t: "match"; q: string; pairs: { a: string; b: string; bAr?: boolean }[]; key: string }
  | { t: "build"; q: string; hint: string; tiles: string[]; joiner: string; word?: QWord; key: string }
  | { t: "read"; words: QWord[]; key: string }
  | { t: "speed"; items: string[]; targetMs: number; lessonId: string };

type Tr = (k: QKey, p?: Record<string, string | number>) => string;
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const uniq = <T,>(a: T[]) => Array.from(new Set(a));
const ALL = LETTERS.map((l) => l.ch);
const nameOf = (c: string, lang: string) => (lang === "ar" ? arName(c) : `${letter(c).name} · ${letter(c).tr}`);
const soundOf = (c: string, lang: string) => { const s = letter(c).sound as Record<string, string | undefined>; return s[lang] ?? s.en ?? ""; };

function options<T>(right: T, pool: T[], n = 4): { opts: T[]; answer: number } {
  const others = shuffle(pool.filter((x) => x !== right)).slice(0, n - 1);
  const opts = shuffle([right, ...others]);
  return { opts, answer: opts.indexOf(right) };
}

// the sound of a sign on a letter (simple transliteration for the "which one is …" questions)
const VOWEL: Record<string, string> = { "َ": "a", "ِ": "i", "ُ": "u", "ً": "an", "ٍ": "in", "ٌ": "un", "َا": "ā", "ِي": "ī", "ُو": "ū" };
export function syllable(c: string, mark: string): { ar: string; tr: string } {
  const t = letter(c).tr;
  if (mark === "ْ") return { ar: `أَ${c}ْ`, tr: `a${t}` };
  if (mark.startsWith("ّ")) { const v = VOWEL[mark.slice(1)] ?? ""; return { ar: `أَ${c}${mark}`, tr: `a${t}${t}${v}` }; }
  const ar = mark === "ً" ? `${c}ًا` : `${c}${mark}`;
  return { ar, tr: `${t}${VOWEL[mark] ?? ""}` };
}

function letterEx(chs: string[], lang: string, verses: Verse[], tr: Tr, canSpeak: boolean, learn = true): Ex[] {
  const out: Ex[] = [];
  for (const c of chs) {
    const w = wordStartingWith(verses, c);
    if (learn) out.push({ t: "learn", big: c, title: nameOf(c, lang), body: soundOf(c, lang), speak: c, word: w ?? undefined });
    const pool = uniq([...(letter(c).similar ?? []), ...ALL]).filter((x) => ALL.includes(x));
    const a = options(c, pool);
    out.push({ t: "choose", q: tr("which", { x: lang === "ar" ? arName(c) : letter(c).name }), options: a.opts.map((o) => ({ ar: o })), answer: a.answer, key: `L:${c}` });
    if (canSpeak || w) {
      const b = options(c, pool);
      out.push({ t: "choose", q: tr("listenTap"), speak: canSpeak ? c : undefined, word: canSpeak ? undefined : w ?? undefined, options: b.opts.map((o) => ({ ar: o })), answer: b.answer, key: `L:${c}` });
    }
    const n = options(c, pool);
    out.push({ t: "choose", q: tr("called"), big: c, speak: canSpeak ? c : undefined, options: n.opts.map((o) => ({ text: nameOf(o, lang) })), answer: n.answer, key: `L:${c}` });
  }
  if (chs.length >= 3) out.push({ t: "match", q: tr("matchTitle"), pairs: shuffle(chs).slice(0, 4).map((c) => ({ a: c, b: nameOf(c, lang) })), key: `M:${chs.join("")}` });
  return out;
}

function formEx(chs: string[], lang: string, tr: Tr, learn = true): Ex[] {
  const out: Ex[] = [];
  const pos = ["start", "middle", "end"] as const;
  for (const c of chs) {
    const f = forms(letter(c));
    if (learn) out.push({ t: "learn", big: `${f.start}   ${f.middle}   ${f.end}`, title: nameOf(c, lang), body: tr("formsLbl") });
    const p = pos[Math.floor(Math.random() * 3)];
    const a = options(c, ALL);
    out.push({ t: "choose", q: tr("whichLetter"), big: f[p], options: a.opts.map((o) => ({ ar: o })), answer: a.answer, key: `L:${c}` });
  }
  const pairs = shuffle(chs).slice(0, 4).map((c) => ({ a: forms(letter(c))[pos[Math.floor(Math.random() * 3)]], b: c, bAr: true }));
  if (pairs.length >= 2) out.push({ t: "match", q: tr("matchForms"), pairs, key: `F:${chs.join("")}` });
  return out;
}

const wordKey = (w: QWord) => `W:${w.ref}`;
function wordChoose(w: QWord, pool: QWord[], tr: Tr): Ex {
  const a = options(w.ar, uniq(pool.map((x) => x.ar)));
  return { t: "choose", q: tr("hearWord"), word: w, options: a.opts.map((o) => ({ ar: o })), answer: a.answer, key: wordKey(w) };
}

function joinEx(words: QWord[], tr: Tr): Ex[] {
  const out: Ex[] = [];
  const ws = words.filter((w) => { const n = bare(w.ar).length; return n >= 2 && n <= 5; }).slice(0, 4);
  for (const w of ws) {
    out.push({ t: "learn", big: w.ar, title: w.tr, body: w.meaning, word: w });
    out.push({ t: "build", q: tr("build"), hint: tr("buildHint"), tiles: [...bare(w.ar)], joiner: "", word: w, key: wordKey(w) });
  }
  if (ws.length) out.push({ t: "read", words: ws.slice(0, 3), key: `R:${ws[0].ref}` });
  return out;
}

function wordEx(words: QWord[], tr: Tr, lessonId: string): Ex[] {
  const out: Ex[] = [];
  const ws = words.slice(0, 5);
  for (const w of ws) out.push({ t: "learn", big: w.ar, title: w.tr, body: w.meaning, word: w });
  for (const w of shuffle(ws).slice(0, 3)) out.push(wordChoose(w, words, tr));
  const b = ws.find((w) => { const n = clusters(w.ar).length; return n >= 2 && n <= 6; });
  if (b) out.push({ t: "build", q: tr("build"), hint: tr("buildHint"), tiles: clusters(b.ar), joiner: "", word: b, key: wordKey(b) });
  if (ws.length) out.push({ t: "read", words: ws.slice(0, 3), key: `R:${ws[0].ref}` });
  if (words.length >= 4) out.push({ t: "speed", items: words.slice(0, 6).map((w) => w.ar), targetMs: Math.min(6, words.length) * 2000, lessonId });
  return out;
}

function syllableEx(l: QLesson, lang: string, tr: Tr, canSpeak: boolean, stage: QStage, learn = true): Ex[] {
  const out: Ex[] = [];
  const marks = l.marks ?? [];
  const chs = shuffle(l.syllableLetters ?? []).slice(0, 6);
  if (learn) out.push({ t: "learn", big: marks.map((m) => syllable("ب", m).ar).join("   "), title: txOf(stage.title, lang), body: txOf(stage.explain, lang), speak: marks.map((m) => syllable("ب", m).ar).join(" ") });
  const all = chs.flatMap((c) => marks.map((m) => syllable(c, m)));
  for (const s of shuffle(all).slice(0, 6)) {
    const a = options(s.ar, all.map((x) => x.ar));
    out.push({ t: "choose", q: tr("which", { x: s.tr }), speak: canSpeak ? s.ar : undefined, options: a.opts.map((o) => ({ ar: o })), answer: a.answer, key: `S:${s.ar}|${s.tr}` });
  }
  const m = shuffle(all).slice(0, 4);
  if (m.length >= 3) out.push({ t: "match", q: tr("matchTitle"), pairs: m.map((s) => ({ a: s.ar, b: s.tr })), key: `MS:${l.id}` });
  out.push({ t: "speed", items: shuffle(all).slice(0, 8).map((s) => s.ar), targetMs: 8 * 1200, lessonId: l.id });
  return out;
}

function verseEx(verses: Verse[], l: QLesson, tr: Tr): Ex[] {
  const out: Ex[] = [];
  let vs = shortVerses(verses, 7);
  if (l.rule === "waqf") vs = verses.filter((v) => realWords(v).some((w) => M.waqf.test(w.text_uthmani))).slice(0, 3);
  for (const v of vs.slice(0, 3)) {
    const ws = realWords(v).map((w) => toQWord(v, w));
    out.push({ t: "learn", big: ws.map((w) => w.ar).join(" "), title: v.verse_key, body: v.translation.replace(/<[^>]+>/g, "") });
    if (ws.length >= 2 && ws.length <= 7) out.push({ t: "build", q: tr("buildVerse"), hint: tr("buildVerseHint"), tiles: ws.map((w) => w.ar), joiner: " ", key: `V:${v.verse_key}` });
    out.push({ t: "read", words: ws, key: `R:${v.verse_key}` });
  }
  const sp = vs[0];
  if (sp) out.push({ t: "speed", items: realWords(sp).map((w) => w.text_uthmani), targetMs: realWords(sp).length * 1500, lessonId: l.id });
  return out;
}

function testEx(stage: QStage, l: QLesson, verses: Verse[], lang: string, tr: Tr, canSpeak: boolean): Ex[] {
  let pool: Ex[] = [];
  if (stage.id === "letters") pool = letterEx(l.letters ?? [], lang, verses, tr, canSpeak, false).filter((e) => e.t === "choose");
  else if (stage.id === "forms") pool = formEx(l.letters ?? [], lang, tr, false).filter((e) => e.t === "choose");
  else {
    if (l.marks) {
      const chs = shuffle(["ب", "ت", "ن", "م", "ل", "ك", "س", "د", "ر", "ف"]).slice(0, 5);
      const all = chs.flatMap((c) => l.marks!.map((m) => syllable(c, m)));
      pool.push(...shuffle(all).slice(0, 4).map((s): Ex => { const a = options(s.ar, all.map((x) => x.ar)); return { t: "choose", q: tr("which", { x: s.tr }), options: a.opts.map((o) => ({ ar: o })), answer: a.answer, key: `S:${s.ar}|${s.tr}` }; }));
    }
    const words = pickWords(verses, l.rule ?? "any", 16);
    pool.push(...shuffle(words).slice(0, 8).map((w) => wordChoose(w, words, tr)));
  }
  return shuffle(pool).slice(0, 10);
}

// stages 13+: long verses read in phrases, and timed reading (one speed card per verse)
function longEx(verses: Verse[], l: QLesson, tr: Tr): Ex[] {
  const out: Ex[] = [];
  const min = l.minWords ?? 12;
  const ms = l.msPerWord ?? 1400;
  const vs = shuffle(verses.filter((v) => realWords(v).length >= min)).slice(0, 3);
  for (const v of vs) {
    const ws = realWords(v).map((w) => toQWord(v, w));
    out.push({ t: "learn", big: ws.map((w) => w.ar).join(" "), title: v.verse_key, body: v.translation.replace(/<[^>]+>/g, "") });
    out.push({ t: "read", words: ws, key: `R:${v.verse_key}` });
    for (const w of shuffle(ws).slice(0, 2)) out.push(wordChoose(w, ws, tr));
    out.push({ t: "speed", items: ws.map((w) => w.ar), targetMs: ws.length * ms, lessonId: l.id });
  }
  return out;
}
function timedEx(verses: Verse[], l: QLesson, tr: Tr): Ex[] {
  const ms = l.msPerWord ?? 1000;
  const vs = shuffle(verses.filter((v) => { const n = realWords(v).length; return n >= 4 && n <= 30; })).slice(0, 5);
  const out: Ex[] = vs.map((v) => ({ t: "speed", items: realWords(v).map((w) => w.text_uthmani), targetMs: realWords(v).length * ms, lessonId: l.id }));
  const pool = vs.flatMap((v) => realWords(v).map((w) => toQWord(v, w)));
  for (const w of shuffle(pool).slice(0, 3)) out.push(wordChoose(w, pool, tr));
  return out;
}

/** the exercises of one lesson (null while the Quran words are needed but not loaded) */
export function buildLesson(stage: QStage, l: QLesson, verses: Verse[], lang: string, tr: Tr, canSpeak: boolean): Ex[] {
  const core = buildCore(stage, l, verses, lang, tr, canSpeak);
  return l.note ? [{ t: "learn", big: stage.glyph, title: txOf(stage.title, lang), body: txOf(l.note, lang) }, ...core] : core;
}
function buildCore(stage: QStage, l: QLesson, verses: Verse[], lang: string, tr: Tr, canSpeak: boolean): Ex[] {
  switch (l.kind) {
    case "long": return longEx(verses, l, tr);
    case "timed": return timedEx(verses, l, tr);
    case "letters": return letterEx(l.letters ?? [], lang, verses, tr, canSpeak);
    case "forms": return formEx(l.letters ?? [], lang, tr);
    case "join": return joinEx(pickWords(verses, "any", 30, l.letters), tr);
    case "syllables": return syllableEx(l, lang, tr, canSpeak, stage);
    case "words": return wordEx(shuffle(pickWords(verses, l.rule ?? "any", 14)), tr, l.id);
    case "verses": return verseEx(verses, l, tr);
    case "test": return testEx(stage, l, verses, lang, tr, canSpeak);
    default: return [];
  }
}

/** review: the most-missed items again (letters, syllables, words) */
export function buildReview(keys: string[], verses: Verse[], lang: string, tr: Tr, canSpeak: boolean): Ex[] {
  const out: Ex[] = [];
  const allWords = verses.flatMap((v) => realWords(v).map((w) => toQWord(v, w)));
  for (const k of keys) {
    if (k.startsWith("L:")) out.push(...letterEx([k.slice(2)], lang, verses, tr, canSpeak, false).filter((e) => e.t === "choose").slice(0, 1));
    else if (k.startsWith("S:")) {
      const [ar, sound] = k.slice(2).split("|");
      const others = ["ب", "ت", "ن", "م", "ل"].map((c) => syllable(c, "َ").ar);
      const a = options(ar, [ar, ...others]);
      out.push({ t: "choose", q: tr("which", { x: sound }), speak: canSpeak ? ar : undefined, options: a.opts.map((o) => ({ ar: o })), answer: a.answer, key: k });
    } else if (k.startsWith("W:")) {
      const w = allWords.find((x) => x.ref === k.slice(2));
      if (w) out.push(wordChoose(w, allWords.filter((x) => fits("any", x.ar)).slice(0, 40), tr));
    }
  }
  return out;
}
export const reviewSurahs = (keys: string[]) => uniq(keys.filter((k) => k.startsWith("W:")).map((k) => Number(k.split(":")[1])));
export const passFor = (l: QLesson) => (l.kind === "test" ? TEST_PASS : 70);
