// The learning journey on the Quran map (/map): every learning area of the site as a station on one path, with the
// learner's real progress (read from the synced localStorage keys) and the single best next step.
// Course catalogues (Arabic lessons, tajweed lessons, vocabulary size) are passed in from the server page, so the big
// course modules never end up in the browser bundle of the map.
import { readJSON } from "./storage";
import { readSrs, strength, today, type Srs } from "./learning";
import { NOT_COUNTED, nextNew, verseStrength } from "./coach";
import { VERSE_COUNTS } from "./counts";
import type { ArabicProgress } from "./arabic";
import type { Goal } from "./coach";

export type StationId = "wudu" | "salah" | "arabic" | "fatiha" | "tajweed" | "vocab" | "memo" | "duas" | "islam";
// order of a Muslim learner's path: purity → prayer → reading → al-Fatiha → recitation → words → memorising → du'a → understanding
export const STATION_IDS: StationId[] = ["wudu", "salah", "arabic", "fatiha", "tajweed", "vocab", "memo", "duas", "islam"];

export type CatalogItem = { id: string; title: string };
export type JourneyCatalog = { arabic: CatalogItem[]; arabicPass: number; tajweed: CatalogItem[]; tajweedPass: number; vocabTotal: number; islamCount: number };

// Juz 'Amma = surahs 78–114
export const JUZ_AMMA = { from: 78, to: 114 };
export const JUZ_AMMA_TOTAL = VERSE_COUNTS.slice(JUZ_AMMA.from - 1, JUZ_AMMA.to).reduce((a, b) => a + b, 0);
const FATIHA_KEYS = [2, 3, 4, 5, 6, 7].map((v) => `1:${v}`); // the basmala 1:1 never counts

export type Snapshot = {
  wudu: boolean;
  visited: StationId[]; // stations without a progress key that were opened from the journey (this device only)
  reads: Goal["read"] | null; // what the learner told us at the start (tf:goal)
  arabic: { passed: number; tried: number; total: number; next: CatalogItem | null };
  fatiha: { learned: number; total: number; next: number | null };
  tajweed: { passed: number; tried: number; total: number; next: CatalogItem | null };
  vocab: { practised: number; known: number; total: number };
  memo: { juzAmma: number; juzAmmaTotal: number; beyond: number; learned: number; strong: number; mid: number; weak: number; due: number; next: { surah: number; verse: number } };
  duas: number;
  islamCount: number;
};

const VISITED_KEY = "tf:jv"; // local only (not synced): which open stations were opened from the map
export const readVisited = () => readJSON<StationId[]>(VISITED_KEY, []);
export function markVisited(id: StationId) {
  const v = readVisited();
  if (v.includes(id)) return;
  try { localStorage.setItem(VISITED_KEY, JSON.stringify([...v, id])); } catch { /* storage blocked */ }
}

export function readSnapshot(cat: JourneyCatalog, srs: Srs = readSrs()): Snapshot {
  const t = today();
  const wudu = !!readJSON<{ done?: boolean } | null>("tf:wudu", null)?.done;
  const goal = readJSON<Goal | null>("tf:goal", null);

  const ar = readJSON<Partial<ArabicProgress>>("tf:arabic", {}).done ?? {};
  const arPassed = cat.arabic.filter((l) => (ar[l.id]?.best ?? 0) >= cat.arabicPass);
  const arNext = cat.arabic.find((l) => (ar[l.id]?.best ?? 0) < cat.arabicPass) ?? null;

  const fl = FATIHA_KEYS.filter((k) => srs[k]);
  const fNext = FATIHA_KEYS.find((k) => !srs[k]);

  const taj = readJSON<Record<string, number>>("tf:tajweed", {});
  const tajPassed = cat.tajweed.filter((l) => (taj[l.id] ?? 0) >= cat.tajweedPass).length;
  const tajTried = cat.tajweed.filter((l) => taj[l.id] !== undefined).length;
  const tajNext = cat.tajweed.find((l) => (taj[l.id] ?? 0) < cat.tajweedPass) ?? null;

  const vocab = readJSON<Record<string, { box?: number }>>("tf:vocab", {});
  const vv = Object.values(vocab);

  let juzAmma = 0, beyond = 0, strong = 0, mid = 0, weak = 0, due = 0;
  for (const [k, e] of Object.entries(srs)) {
    if (NOT_COUNTED.has(k)) continue;
    const s = Number(k.split(":")[0]);
    if (s >= JUZ_AMMA.from && s <= JUZ_AMMA.to) juzAmma++; else beyond++;
    const st = verseStrength(srs, k) ?? strength(e);
    if (st >= 0.8) strong++; else if (st >= 0.5) mid++; else weak++;
    if (e.due <= t) due++;
  }

  return {
    wudu,
    visited: readVisited(),
    reads: goal?.read ?? null,
    arabic: { passed: arPassed.length, tried: cat.arabic.filter((l) => ar[l.id]).length, total: cat.arabic.length, next: arNext },
    fatiha: { learned: fl.length, total: FATIHA_KEYS.length, next: fNext ? Number(fNext.split(":")[1]) : null },
    tajweed: { passed: tajPassed, tried: tajTried, total: cat.tajweed.length, next: tajNext },
    vocab: { practised: vv.length, known: vv.filter((x) => (x.box ?? 0) >= 3).length, total: cat.vocabTotal },
    memo: { juzAmma, juzAmmaTotal: JUZ_AMMA_TOTAL, beyond, learned: juzAmma + beyond, strong, mid, weak, due, next: nextNew(srs) },
    duas: readJSON<string[]>("tf:duafav", []).length,
    islamCount: cat.islamCount,
  };
}

// done = the station is complete; progress = started (pct null: open-ended, e.g. favourite duas);
// open = the area has no progress counter and is open at any time
export type StationState = "done" | "progress" | "none" | "open";
export type StationView = { id: StationId; state: StationState; pct: number | null; href: string; status: string; detail?: string; cta: string };

export type NextReason = "due" | "wudu" | "salah" | "fatihaGoOn" | "arabicStart" | "arabicGoOn" | "fatiha" | "tajweed" | "tajweedGoOn" | "vocab" | "memo";

// The single best next step. Verses that are due come first (keeping what you learned), then the path in order.
// Learners who read fluently, or who already memorise actively, are not sent back to the reading course.
export function nextStep(s: Snapshot): { id: StationId; reason: NextReason } {
  if (s.memo.learned > 0 && s.memo.due >= 5) return { id: "memo", reason: "due" };
  if (!s.wudu) return { id: "wudu", reason: "wudu" };
  if (!s.visited.includes("salah")) return { id: "salah", reason: "salah" };
  if (s.fatiha.learned > 0 && s.fatiha.learned < s.fatiha.total) return { id: "fatiha", reason: "fatihaGoOn" };
  const reads = s.reads === "fluent" || s.memo.learned >= 20;
  if (!reads && s.arabic.total > 0 && s.arabic.passed < s.arabic.total) return { id: "arabic", reason: s.arabic.tried ? "arabicGoOn" : "arabicStart" };
  if (s.fatiha.learned < s.fatiha.total) return { id: "fatiha", reason: "fatiha" };
  if (s.memo.learned < 20 && s.tajweed.total > 0 && s.tajweed.passed < s.tajweed.total) return { id: "tajweed", reason: s.tajweed.tried ? "tajweedGoOn" : "tajweed" };
  if (s.vocab.practised === 0) return { id: "vocab", reason: "vocab" };
  return { id: "memo", reason: "memo" };
}

export const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => (v[k] !== undefined ? String(v[k]) : `{${k}}`));
const tiny = (have: number, pct: number) => (have > 0 ? Math.max(0.03, pct) : pct); // started but nothing finished yet: a visible sliver

export function stationViews(s: Snapshot, T: JourneyText, nf: (n: number) => string = String): StationView[] {
  const S = T.st;
  const out: StationView[] = [];
  // 1 purity
  out.push(s.wudu
    ? { id: "wudu", state: "done", pct: 1, href: "/wudu", status: S.wuduDone, cta: T.cta.review }
    : { id: "wudu", state: "none", pct: 0, href: "/wudu", status: S.wuduNone, cta: T.cta.wudu });
  // 2 prayer
  out.push({ id: "salah", state: "open", pct: null, href: "/salah", status: s.visited.includes("salah") ? S.salahVisited : S.salahOpen, cta: T.cta.salah });
  // 3 reading
  const a = s.arabic;
  out.push(a.total > 0 && a.passed >= a.total
    ? { id: "arabic", state: "done", pct: 1, href: "/arabic", status: fill(S.arabicDone, { total: nf(a.total) }), cta: T.cta.course }
    : { id: "arabic", state: a.tried ? "progress" : "none", pct: tiny(a.tried, a.passed / Math.max(1, a.total)), href: a.next ? `/arabic/${a.next.id}` : "/arabic",
      status: fill(S.arabic, { n: nf(a.passed), total: nf(a.total) }), detail: a.next ? fill(T.nextLesson, { title: a.next.title }) : undefined, cta: a.tried ? T.cta.goOn : T.cta.start });
  // 4 al-Fatiha
  const f = s.fatiha;
  out.push(f.learned >= f.total
    ? { id: "fatiha", state: "done", pct: 1, href: "/surah/1?v=2&m=2", status: S.fatihaDone, detail: S.basmala, cta: T.cta.review }
    : { id: "fatiha", state: f.learned ? "progress" : "none", pct: f.learned / f.total, href: `/surah/1?v=${f.next ?? 1}&shams=1`, status: fill(S.fatiha, { n: nf(f.learned) }), detail: S.basmala, cta: f.learned ? T.cta.goOn : T.cta.fatiha });
  // 5 tajweed
  const tj = s.tajweed;
  out.push(tj.total > 0 && tj.passed >= tj.total
    ? { id: "tajweed", state: "done", pct: 1, href: "/tajweed", status: fill(S.tajweedDone, { total: nf(tj.total) }), cta: T.cta.overview }
    : { id: "tajweed", state: tj.tried ? "progress" : "none", pct: tiny(tj.tried, tj.passed / Math.max(1, tj.total)), href: tj.next ? `/tajweed/${tj.next.id}` : "/tajweed",
      status: fill(S.tajweed, { n: nf(tj.passed), total: nf(tj.total) }), detail: tj.next ? fill(T.nextLesson, { title: tj.next.title }) : undefined, cta: tj.tried ? T.cta.nextLesson : T.cta.firstLesson });
  // 6 vocabulary
  const v = s.vocab;
  out.push(v.total > 0 && v.known >= v.total
    ? { id: "vocab", state: "done", pct: 1, href: "/vocab", status: fill(S.vocabDone, { total: nf(v.total) }), cta: T.cta.vocab }
    : { id: "vocab", state: v.practised ? "progress" : "none", pct: tiny(v.practised, v.known / Math.max(1, v.total)), href: "/vocab",
      status: v.practised ? fill(S.vocab, { n: nf(v.practised), k: nf(v.known) }) : fill(S.vocabNone, { total: nf(v.total) }), cta: T.cta.vocab });
  // 7 memorisation
  const m = s.memo;
  const memoHref = `/surah/${m.next.surah}?v=${m.next.verse}&shams=1`;
  out.push({
    id: "memo", state: m.juzAmma >= m.juzAmmaTotal ? "done" : m.learned ? "progress" : "none", pct: tiny(m.learned, m.juzAmma / m.juzAmmaTotal), href: memoHref,
    status: fill(S.memo, { n: nf(m.juzAmma), total: nf(m.juzAmmaTotal) }),
    detail: m.learned ? [fill(S.memoMix, { s: nf(m.strong), m: nf(m.mid), w: nf(m.weak) }), m.beyond ? fill(S.memoBeyond, { n: nf(m.beyond) }) : ""].filter(Boolean).join(" · ") : undefined,
    cta: T.cta.memo,
  });
  // 8 du'a
  out.push({ id: "duas", state: s.duas ? "progress" : "none", pct: null, href: "/duas", status: s.duas ? fill(S.duas, { n: nf(s.duas) }) : S.duasNone, cta: T.cta.duas });
  // 9 understanding
  out.push({ id: "islam", state: "open", pct: null, href: "/islam", status: fill(s.visited.includes("islam") ? S.islamVisited : S.islamOpen, { n: nf(s.islamCount) }), cta: T.cta.islam });
  return out;
}

// ---------- texts ----------
type Station = { area: string; title: string; ar: string };
export type JourneyText = {
  kicker: string; title: string; lead: string; summary: string; nextLabel: string; nextBadge: string; openNote: string;
  legend: Record<"done" | "progress" | "none" | "open", string>;
  stations: Record<StationId, Station>;
  st: {
    wuduDone: string; wuduNone: string; salahOpen: string; salahVisited: string; arabic: string; arabicDone: string; fatiha: string; fatihaDone: string; basmala: string;
    tajweed: string; tajweedDone: string; vocab: string; vocabNone: string; vocabDone: string; memo: string; memoMix: string; memoBeyond: string; duas: string; duasNone: string; islamOpen: string; islamVisited: string;
  };
  nextLesson: string;
  cta: Record<"review" | "wudu" | "salah" | "course" | "goOn" | "start" | "fatiha" | "overview" | "nextLesson" | "firstLesson" | "vocab" | "memo" | "duas" | "islam" | "dueNow", string>;
  reason: Record<NextReason, string>;
  verseOf: string; // "{surah}, verse {v}"
  strip: { latest: string; none: string; level: string };
  map: { actions: string; learnNext: string; repeatWeak: string; refreshMid: string; listen: string; quiz: string; quizNeed: string; allLearned: string };
  quiz: { title: string; lead: string; prompt: string; of: string; right: string; wrong: string; wrongNote: string; next: string; result: string; again: string; close: string; loading: string; error: string; finish: string };
};

const de: JourneyText = {
  kicker: "Dein Lernweg",
  title: "Neun Stationen – von der Reinheit bis zum Verstehen",
  lead: "Alles, was du hier lernen kannst, liegt auf einem Weg: Wudu und Gebet, Lesen und Al-Fatiha, Tadschwid und Wortschatz, das Auswendiglernen, Bittgebete und das Verständnis des Islam. Jede Station zeigt deinen echten Stand – und eine davon ist dein nächster Schritt.",
  summary: "{d} von 9 Stationen abgeschlossen · {p} begonnen",
  nextLabel: "Dein nächster Schritt",
  nextBadge: "Nächster Schritt",
  openNote: "Der Gebetstrainer und die Islam-Kapitel zählen keinen Fortschritt – sie stehen dir jederzeit offen. Alles andere wird mit deinem Konto auf allen Geräten abgeglichen.",
  legend: { done: "abgeschlossen", progress: "begonnen", none: "noch nicht begonnen", open: "jederzeit offen" },
  stations: {
    wudu: { area: "Reinheit", title: "Wudu", ar: "الطهارة" },
    salah: { area: "Gebet", title: "Gebetstrainer", ar: "الصلاة" },
    arabic: { area: "Lesen", title: "Arabisch lesen", ar: "اقرأ" },
    fatiha: { area: "Erste Sure", title: "Al-Fatiha", ar: "الفاتحة" },
    tajweed: { area: "Rezitation", title: "Tadschwid", ar: "التجويد" },
    vocab: { area: "Wortschatz", title: "Koranwörter", ar: "المفردات" },
    memo: { area: "Auswendiglernen", title: "Juz 'Amma und weiter", ar: "الحفظ" },
    duas: { area: "Bittgebete", title: "Duas", ar: "الدعاء" },
    islam: { area: "Verstehen", title: "Islam-Kapitel", ar: "الفهم" },
  },
  st: {
    wuduDone: "Trainer abgeschlossen", wuduNone: "Noch nicht abgeschlossen",
    salahOpen: "Alle fünf Gebete, sunnitisch und schiitisch", salahVisited: "Schon geöffnet – übe, so oft du willst",
    arabic: "{n} von {total} Lektionen bestanden", arabicDone: "Alle {total} Lektionen bestanden",
    fatiha: "Verse 2–7: {n} von 6 gelernt", fatihaDone: "Alle Verse gelernt", basmala: "Die Basmala (1:1) zählt nicht extra",
    tajweed: "{n} von {total} Lektionen bestanden", tajweedDone: "Alle {total} Lektionen bestanden",
    vocab: "{n} Wörter geübt · {k} sicher", vocabNone: "{total} häufige Koranwörter", vocabDone: "Alle {total} Wörter sicher",
    memo: "Juz 'Amma: {n} von {total} Versen", memoMix: "{s} sitzen · {m} wackeln · {w} schwierig", memoBeyond: "+{n} in anderen Suren",
    duas: "{n} Lieblingsduas gespeichert", duasNone: "Noch keine Lieblingsduas",
    islamOpen: "{n} Kapitel – jederzeit offen", islamVisited: "Schon geöffnet · {n} Kapitel",
  },
  nextLesson: "Als Nächstes: {title}",
  cta: { review: "Wiederholen", wudu: "Wudu lernen", salah: "Gebet üben", course: "Kurs öffnen", goOn: "Weiterlernen", start: "Kurs beginnen", fatiha: "Al-Fatiha lernen", overview: "Übersicht", nextLesson: "Nächste Lektion", firstLesson: "Erste Lektion", vocab: "Wörter üben", memo: "Nächsten Vers lernen", duas: "Duas entdecken", islam: "Kapitel lesen", dueNow: "Jetzt wiederholen" },
  reason: {
    due: "{n} Verse sind heute zur Wiederholung fällig. Wiederhole sie zuerst – was du rechtzeitig wiederholst, bleibt.",
    wudu: "Das Gebet beginnt mit der Reinheit (Sure 5:6). Der Trainer führt dich Schritt für Schritt durch die Gebetswaschung.",
    salah: "Nach dem Wudu kommt das Gebet. Der Trainer zeigt dir jede Haltung mit den arabischen Worten und ihrer Bedeutung.",
    fatihaGoOn: "Du hast mit Al-Fatiha begonnen: {n} von 6 Versen sind gelernt. Lerne sie zu Ende – du rezitierst sie in jedem Gebet.",
    arabicStart: "Wer die Buchstaben kennt, liest den Koran selbst. Beginne mit der ersten Lektion: {title}.",
    arabicGoOn: "Du liest dich Schritt für Schritt ein. Als Nächstes: {title}.",
    fatiha: "Al-Fatiha rezitierst du in jedem Gebet. Lerne sie Vers für Vers mit der Shams-Methode.",
    tajweed: "Tadschwid macht deine Rezitation richtig und schön. Beginne mit: {title}.",
    tajweedGoOn: "Weiter im Tadschwid. Als Nächstes: {title}.",
    vocab: "Die häufigsten Wörter des Korans helfen dir zu verstehen, was du rezitierst.",
    memo: "Weiter mit dem Auswendiglernen: {verse}.",
  },
  verseOf: "{surah}, Vers {v}",
  strip: { latest: "Zuletzt verdient", none: "Noch keine Sticker – sie kommen mit deiner Lernzeit.", level: "Dein Level" },
  map: { actions: "Mit dieser Sure lernen", learnNext: "Nächsten Vers lernen · {key}", repeatWeak: "Schwache Verse wiederholen ({n})", refreshMid: "Wackelnde Verse auffrischen ({n})", listen: "Ganze Sure anhören", quiz: "Quiz: Welcher Vers kommt als Nächstes?", quizNeed: "Das Quiz öffnet sich ab 3 gelernten Versen dieser Sure.", allLearned: "Alle Verse dieser Sure gelernt" },
  quiz: {
    title: "Welcher Vers kommt als Nächstes?", lead: "Du siehst das Ende eines Verses, den du gelernt hast. Wähle, wie es weitergeht.",
    prompt: "Nach Vers {v} kommt …", of: "Frage {i} von {n}", right: "Richtig.", wrong: "Nicht ganz – richtig ist Vers {v}.", wrongNote: "Nicht ganz – richtig ist Vers {v}. Er kommt morgen zur Wiederholung.",
    next: "Weiter", finish: "Ergebnis", result: "{c} von {n} richtig", again: "Noch einmal", close: "Schließen", loading: "Verse werden geladen …", error: "Die Verse konnten gerade nicht geladen werden.",
  },
};

const en: JourneyText = {
  kicker: "Your learning path",
  title: "Nine stations – from purity to understanding",
  lead: "Everything you can learn here lies on one path: wudu and prayer, reading and Al-Fatiha, tajweed and vocabulary, memorisation, supplications and understanding Islam. Every station shows where you really stand – and one of them is your next step.",
  summary: "{d} of 9 stations completed · {p} in progress",
  nextLabel: "Your next step",
  nextBadge: "Next step",
  openNote: "The prayer trainer and the Islam chapters have no progress count – they are open to you at any time. Everything else is kept in step across your devices with your account.",
  legend: { done: "completed", progress: "in progress", none: "not started", open: "open any time" },
  stations: {
    wudu: { area: "Purity", title: "Wudu", ar: "الطهارة" },
    salah: { area: "Prayer", title: "Prayer trainer", ar: "الصلاة" },
    arabic: { area: "Reading", title: "Read Arabic", ar: "اقرأ" },
    fatiha: { area: "First surah", title: "Al-Fatiha", ar: "الفاتحة" },
    tajweed: { area: "Recitation", title: "Tajweed", ar: "التجويد" },
    vocab: { area: "Vocabulary", title: "Quran words", ar: "المفردات" },
    memo: { area: "Memorisation", title: "Juz 'Amma and beyond", ar: "الحفظ" },
    duas: { area: "Supplication", title: "Duas", ar: "الدعاء" },
    islam: { area: "Understanding", title: "Islam chapters", ar: "الفهم" },
  },
  st: {
    wuduDone: "Trainer completed", wuduNone: "Not completed yet",
    salahOpen: "All five prayers, Sunni and Shia", salahVisited: "Opened before – practise as often as you like",
    arabic: "{n} of {total} lessons passed", arabicDone: "All {total} lessons passed",
    fatiha: "Verses 2–7: {n} of 6 learned", fatihaDone: "All verses learned", basmala: "The basmala (1:1) is not counted separately",
    tajweed: "{n} of {total} lessons passed", tajweedDone: "All {total} lessons passed",
    vocab: "{n} words practised · {k} secure", vocabNone: "{total} common Quran words", vocabDone: "All {total} words secure",
    memo: "Juz 'Amma: {n} of {total} verses", memoMix: "{s} firm · {m} wobbling · {w} difficult", memoBeyond: "+{n} in other surahs",
    duas: "{n} favourite duas saved", duasNone: "No favourite duas yet",
    islamOpen: "{n} chapters – open any time", islamVisited: "Opened before · {n} chapters",
  },
  nextLesson: "Next: {title}",
  cta: { review: "Review", wudu: "Learn wudu", salah: "Practise the prayer", course: "Open the course", goOn: "Continue", start: "Start the course", fatiha: "Learn Al-Fatiha", overview: "Overview", nextLesson: "Next lesson", firstLesson: "First lesson", vocab: "Practise words", memo: "Learn the next verse", duas: "Explore duas", islam: "Read the chapters", dueNow: "Review now" },
  reason: {
    due: "{n} verses are due for review today. Review them first – what you review on time, stays.",
    wudu: "Prayer begins with purity (Surah 5:6). The trainer guides you through the ablution step by step.",
    salah: "After wudu comes the prayer. The trainer shows you every posture with the Arabic words and their meaning.",
    fatihaGoOn: "You have started Al-Fatiha: {n} of 6 verses are learned. Finish it – you recite it in every prayer.",
    arabicStart: "Once you know the letters, you read the Quran yourself. Start with the first lesson: {title}.",
    arabicGoOn: "You are reading your way in, step by step. Next: {title}.",
    fatiha: "You recite Al-Fatiha in every prayer. Learn it verse by verse with the Shams Method.",
    tajweed: "Tajweed makes your recitation correct and beautiful. Start with: {title}.",
    tajweedGoOn: "On with tajweed. Next: {title}.",
    vocab: "The most frequent words of the Quran help you understand what you recite.",
    memo: "Continue memorising: {verse}.",
  },
  verseOf: "{surah}, verse {v}",
  strip: { latest: "Recently earned", none: "No stickers yet – they come with your learning time.", level: "Your level" },
  map: { actions: "Learn with this surah", learnNext: "Learn the next verse · {key}", repeatWeak: "Repeat weak verses ({n})", refreshMid: "Refresh wobbling verses ({n})", listen: "Listen to the whole surah", quiz: "Quiz: which verse comes next?", quizNeed: "The quiz opens once you have learned 3 verses of this surah.", allLearned: "All verses of this surah learned" },
  quiz: {
    title: "Which verse comes next?", lead: "You see the end of a verse you have learned. Choose how it continues.",
    prompt: "After verse {v} comes …", of: "Question {i} of {n}", right: "Correct.", wrong: "Not quite – the right one is verse {v}.", wrongNote: "Not quite – the right one is verse {v}. It comes back for review tomorrow.",
    next: "Next", finish: "Result", result: "{c} of {n} correct", again: "Again", close: "Close", loading: "Loading verses …", error: "The verses could not be loaded just now.",
  },
};

const ar: JourneyText = {
  kicker: "طريق تعلّمك",
  title: "تسع محطات – من الطهارة إلى الفهم",
  lead: "كل ما تتعلّمه هنا يقع على طريقٍ واحد: الوضوء والصلاة، والقراءة والفاتحة، والتجويد والمفردات، والحفظ، والدعاء، وفهم الإسلام. تُظهر كل محطةٍ مستواك الحقيقي، وإحداها هي خطوتك التالية.",
  summary: "أكملتَ {d} من 9 محطات · وبدأتَ {p}",
  nextLabel: "خطوتك التالية",
  nextBadge: "الخطوة التالية",
  openNote: "مدرّب الصلاة وفصول الإسلام لا يُحتسب فيها تقدّم، فهي متاحةٌ لك في كل وقت. أمّا سائر المحطات فتُزامَن مع حسابك على جميع أجهزتك.",
  legend: { done: "مكتملة", progress: "بدأتَها", none: "لم تبدأ بعد", open: "متاحة دائمًا" },
  stations: {
    wudu: { area: "الطهارة", title: "الوضوء", ar: "الطهارة" },
    salah: { area: "الصلاة", title: "مدرّب الصلاة", ar: "الصلاة" },
    arabic: { area: "القراءة", title: "تعلّم القراءة", ar: "اقرأ" },
    fatiha: { area: "أمّ الكتاب", title: "سورة الفاتحة", ar: "الفاتحة" },
    tajweed: { area: "التلاوة", title: "التجويد", ar: "التجويد" },
    vocab: { area: "المفردات", title: "كلمات القرآن", ar: "المفردات" },
    memo: { area: "الحفظ", title: "جزء عمّ وما بعده", ar: "الحفظ" },
    duas: { area: "الدعاء", title: "الأدعية", ar: "الدعاء" },
    islam: { area: "الفهم", title: "فصول الإسلام", ar: "الفهم" },
  },
  st: {
    wuduDone: "أتممتَ المدرّب", wuduNone: "لم تُتمّه بعد",
    salahOpen: "الصلوات الخمس على مذهب أهل السنة والمذهب الجعفري", salahVisited: "فتحتَه من قبل – تدرّب متى شئت",
    arabic: "اجتزتَ {n} من {total} درسًا", arabicDone: "اجتزتَ الدروس كلها ({total})",
    fatiha: "الآيات 2–7: حفظتَ {n} من 6", fatihaDone: "حفظتَ آياتها كلها", basmala: "البسملة (1:1) لا تُحتسب على حدة",
    tajweed: "اجتزتَ {n} من {total} درسًا", tajweedDone: "اجتزتَ الدروس كلها ({total})",
    vocab: "تدرّبتَ على {n} كلمة · {k} منها ثابتة", vocabNone: "{total} من أكثر كلمات القرآن ورودًا", vocabDone: "الكلمات كلها ثابتة ({total})",
    memo: "جزء عمّ: {n} من {total} آية", memoMix: "{s} ثابتة · {m} متزعزعة · {w} صعبة", memoBeyond: "و{n} في سور أخرى",
    duas: "حفظتَ {n} من أدعيتك المفضّلة", duasNone: "لا أدعية مفضّلة بعد",
    islamOpen: "{n} فصلًا – متاحة دائمًا", islamVisited: "فتحتَها من قبل · {n} فصلًا",
  },
  nextLesson: "التالي: {title}",
  cta: { review: "راجِع", wudu: "تعلّم الوضوء", salah: "تدرّب على الصلاة", course: "افتح الدورة", goOn: "تابِع التعلّم", start: "ابدأ الدورة", fatiha: "احفظ الفاتحة", overview: "نظرة عامة", nextLesson: "الدرس التالي", firstLesson: "الدرس الأول", vocab: "تدرّب على الكلمات", memo: "احفظ الآية التالية", duas: "تصفّح الأدعية", islam: "اقرأ الفصول", dueNow: "راجِع الآن" },
  reason: {
    due: "حان اليوم موعد مراجعة {n} آية. راجِعها أولًا، فما تراجعه في وقته يثبت.",
    wudu: "الصلاة تبدأ بالطهارة (المائدة: 6). يرشدك المدرّب في الوضوء خطوةً خطوة.",
    salah: "بعد الوضوء تأتي الصلاة: يُريك المدرّب كل هيئةٍ مع أذكارها ومعانيها.",
    fatihaGoOn: "بدأتَ بالفاتحة وحفظتَ {n} من 6 آيات. أكمِلها، فأنت تقرؤها في كل صلاة.",
    arabicStart: "من عرف الحروف قرأ القرآن بنفسه. ابدأ بالدرس الأول: {title}.",
    arabicGoOn: "تتقدّم في القراءة خطوةً خطوة. الدرس التالي: {title}.",
    fatiha: "تقرأ الفاتحة في كل صلاة. احفظها آيةً آيةً بمنهج شمس.",
    tajweed: "التجويد يجعل تلاوتك صحيحةً جميلة. ابدأ بـ: {title}.",
    tajweedGoOn: "تابِع التجويد. الدرس التالي: {title}.",
    vocab: "أكثر كلمات القرآن ورودًا تُعينك على فهم ما تتلوه.",
    memo: "تابِع الحفظ: {verse}.",
  },
  verseOf: "{surah}، الآية {v}",
  strip: { latest: "آخر ما نلتَه", none: "لا أوسمة بعد – تأتي مع وقت تعلّمك.", level: "مستواك" },
  map: { actions: "تعلّم بهذه السورة", learnNext: "احفظ الآية التالية · {key}", repeatWeak: "راجِع الآيات الصعبة ({n})", refreshMid: "ثبّت الآيات المتزعزعة ({n})", listen: "استمع إلى السورة كاملة", quiz: "اختبار: ما الآية التالية؟", quizNeed: "يُتاح الاختبار بعد حفظ 3 آيات من هذه السورة.", allLearned: "حفظتَ آيات هذه السورة كلها" },
  quiz: {
    title: "ما الآية التالية؟", lead: "ترى نهاية آيةٍ حفظتَها. اختر ما يليها.",
    prompt: "بعد الآية {v} تأتي …", of: "السؤال {i} من {n}", right: "صحيح.", wrong: "ليس تمامًا – الصحيحة هي الآية {v}.", wrongNote: "ليس تمامًا – الصحيحة هي الآية {v}، وستعود إليك للمراجعة غدًا.",
    next: "التالي", finish: "النتيجة", result: "{c} من {n} إجابات صحيحة", again: "مرةً أخرى", close: "إغلاق", loading: "جارٍ تحميل الآيات …", error: "تعذّر تحميل الآيات الآن.",
  },
};

// other languages fall back to English
export const journeyText = (locale: string): JourneyText => (locale === "de" ? de : locale === "ar" ? ar : en);
