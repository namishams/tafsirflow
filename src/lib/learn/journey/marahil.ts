// mirrors mobile/src/features/journey/marahil.ts (copied for the website; keep in step with the app)
import { TOTAL_VERSES } from "@/lib/quranIndex";
import type { Metrics } from "./metrics";

// The Marāḥil of the long path. Marḥala 1–7 follow the classical order of study (the Madrasa's four stages, hifz
// through Shams 2.0, tajweed and the Reciter Path, qirāʾāt, Arabic up to the classical texts, a full tafsir pass with
// another classical work each time, hadith through whole collections, seerah, the Academy). From Marḥala 8 on the
// milestones continue by formula (review cycles over the whole Quran, deeper itqān, further qirāʾāt revision, more
// tafsir passes, khatms, hadith and lemma cycles): there is no last Marḥala. No durations, only the next horizon.
// Every milestone reads progress from existing stores; qirāʾāt steps are marked by the learner (with a teacher; the
// app cannot verify a recitation and says so).

export type Area = "madrasa" | "hifz" | "itqan" | "tajweed" | "qiraat" | "arabic" | "tafsir" | "hadith" | "seerah" | "academy" | "nahj" | "khatm" | "review" | "lemma" | "mut" | "garden" | "streak";
export type Milestone = { id: string; area: Area; key: string; vars?: Record<string, string | number>; have: number; goal: number; href?: string; q?: string };

/** the qirāʾāt steps (ids are stored; names are transliterations of the readers and their transmitters) */
export const QIRAAT: { id: string; m: number; tr: string }[] = [
  { id: "q-hafs", m: 4, tr: "Ḥafṣ ʿan ʿĀṣim" },
  { id: "q-warsh", m: 5, tr: "Warsh ʿan Nāfiʿ" },
  { id: "q-qalun", m: 5, tr: "Qālūn ʿan Nāfiʿ" },
  { id: "q-ibnkathir", m: 6, tr: "Ibn Kathīr (al-Bazzī, Qunbul)" },
  { id: "q-abuamr", m: 6, tr: "Abū ʿAmr (ad-Dūrī, as-Sūsī)" },
  { id: "q-shuba", m: 6, tr: "Shuʿba ʿan ʿĀṣim" },
  { id: "q-ibnamir", m: 7, tr: "Ibn ʿĀmir (Hishām, Ibn Dhakwān)" },
  { id: "q-hamza", m: 7, tr: "Ḥamza (Khalaf, Khallād)" },
  { id: "q-kisai", m: 7, tr: "al-Kisāʾī (Abū l-Ḥārith, ad-Dūrī)" },
  { id: "q-abujafar", m: 8, tr: "Abū Jaʿfar (Ibn Wardān, Ibn Jammāz)" },
  { id: "q-yaqub", m: 8, tr: "Yaʿqūb (Ruways, Rawḥ)" },
  { id: "q-khalaf", m: 8, tr: "Khalaf al-ʿĀshir (Isḥāq, Idrīs)" },
];
/** the seven readers (both transmitters of each, Ḥafṣ and Shuʿba for ʿĀṣim) and the ten */
export const SEVEN = QIRAAT.filter((q) => q.m <= 7).map((q) => q.id);
export const TEN = QIRAAT.map((q) => q.id);

const at = <T,>(list: T[], m: number, after: (n: number) => T) => (m <= list.length ? list[m - 1] : after(m - list.length));
export const hadithGoal = (m: number) => at([40, 500, 1500, 3000, 5000, 8000, 12000], m, (n) => 12000 + 4000 * n);
export const khatmGoal = (m: number) => at([1, 3, 7, 10, 15, 20, 30], m, (n) => 30 + 10 * n);
export const juzGoal = (m: number) => at([1, 5, 10, 15, 20, 25, 30], m, () => 30);
/** tafsir: Marḥala 1 = al-Fātiḥa and al-Baqara (293 verses) of the first pass, then one full pass more per Marḥala */
export const tafsirGoal = (m: number) => (m === 1 ? 293 : (m - 1) * TOTAL_VERSES);

const pct = (x: number) => Math.round(Math.min(1, x) * 100);

export function marhala(m: number, M: Metrics): Milestone[] {
  const j = M.j;
  const out: Milestone[] = [];
  const add = (x: Milestone) => out.push(x);
  const school = (id: string, area: Area, key: string, href: string, vars?: Milestone["vars"]) => add({ id: `${area}-${id}`, area, key, vars, have: pct(M.course(id)), goal: 100, href });
  const stage = (s: "ibtidai" | "idadi" | "thanawi" | "ali") => add({ id: `madrasa-${s}`, area: "madrasa", key: `m_stage_${s}`, have: pct(M.stage[s]), goal: 100, href: "/school" });
  const qiraat = (ids: string[]) => { for (const id of ids) add({ id, area: "qiraat", key: "m_qiraat", vars: { name: QIRAAT.find((q) => q.id === id)?.tr ?? id }, have: j.q[id] ? 1 : 0, goal: 1, q: id }); };
  const tafsirUnits = j.e.tafsir.cycles * TOTAL_VERSES + j.e.tafsir.pos;

  // hifz: juz 30 first, then whole juz
  if (m === 1) add({ id: "hifz-juz30", area: "hifz", key: "m_juz30", have: pct(M.juzPct[29]), goal: 100, href: "/shams" });
  else add({ id: `hifz-${m}`, area: "hifz", key: "m_juz", vars: { n: juzGoal(m) }, have: Math.min(M.juzFull, juzGoal(m)), goal: juzGoal(m), href: "/shams" });

  if (m === 1) {
    stage("ibtidai");
    school("qaida", "arabic", "m_qaida", "/arabic/read");
    school("tajweed", "tajweed", "m_tajweed", "/tajweed");
    school("rp-1-3", "tajweed", "m_rp", "/reciter-path", { a: 1, b: 3 });
    school("ar-a1", "arabic", "m_arabic", "/arabic/lang", { l: "A1" });
    school("ar-a2", "arabic", "m_arabic", "/arabic/lang", { l: "A2" });
    school("prophets", "seerah", "m_prophets", "/courses/prophets");
  } else if (m === 2) {
    stage("idadi");
    school("rp-4-6", "tajweed", "m_rp", "/reciter-path", { a: 4, b: 6 });
    school("ar-b1", "arabic", "m_arabic", "/arabic/lang", { l: "B1" });
    school("seerah", "seerah", "m_seerah", "/courses/seerah");
    add({ id: "review-2", area: "review", key: "m_review", vars: { n: 1 }, have: Math.min(1, j.e.review.cycles), goal: 1, href: "/journey/today" });
    add({ id: "lemma-2", area: "lemma", key: "m_lemmas", vars: { n: 500 }, have: Math.min(500, j.e.lemma.units), goal: 500, href: "/journey/today" });
  } else if (m === 3) {
    stage("thanawi");
    school("rp-7-8", "tajweed", "m_rp", "/reciter-path", { a: 7, b: 8 });
    school("tajweed-deep", "tajweed", "m_tajweedDeep", "/courses/tajweed-deep");
    school("ar-b2", "arabic", "m_arabic", "/arabic/lang", { l: "B2" });
    school("hadith-sci", "academy", "m_hadithSci", "/courses/hadith-sci");
    school("ulum", "academy", "m_ulum", "/courses/ulum");
    if (M.nahj) add({ id: "nahj-3", area: "nahj", key: "m_nahj", have: pct(M.course("nahj")), goal: 100, href: "/nahj-studies" });
    add({ id: "mut-3", area: "mut", key: "m_mut", vars: { n: 1 }, have: Math.min(1, j.e.mut.cycles), goal: 1, href: "/journey/today" });
  } else if (m === 4) {
    stage("ali");
    school("rp-9-10", "tajweed", "m_rp", "/reciter-path", { a: 9, b: 10 });
    school("ar-c1", "arabic", "m_arabic", "/arabic/lang", { l: "C1" });
    add({ id: "lemma-4", area: "lemma", key: "m_lemmaCycle", vars: { n: 1 }, have: Math.min(1, j.e.lemma.cycles), goal: 1, href: "/journey/today" });
    add({ id: "review-4", area: "review", key: "m_review", vars: { n: 3 }, have: Math.min(3, j.e.review.cycles), goal: 3, href: "/journey/today" });
  } else if (m === 5) {
    add({ id: "arabic-c2", area: "arabic", key: "m_c2", have: Math.min(2, j.e.lemma.cycles), goal: 2, href: "/journey/today" });
    add({ id: "academy-all", area: "academy", key: "m_academy", have: M.coursesDone, goal: M.coursesTotal, href: "/courses" });
    add({ id: "mut-5", area: "mut", key: "m_mut", vars: { n: 3 }, have: Math.min(3, j.e.mut.cycles), goal: 3, href: "/journey/today" });
    add({ id: "review-5", area: "review", key: "m_review", vars: { n: 5 }, have: Math.min(5, j.e.review.cycles), goal: 5, href: "/journey/today" });
  } else if (m === 6) {
    add({ id: "itqan-6", area: "itqan", key: "m_itqan", vars: { n: 10, q: 90 }, have: Math.min(10, M.itqan90), goal: 10, href: "/shams/quality" });
    add({ id: "lemma-6", area: "lemma", key: "m_lemmaCycle", vars: { n: 3 }, have: Math.min(3, j.e.lemma.cycles), goal: 3, href: "/journey/today" });
    add({ id: "review-6", area: "review", key: "m_review", vars: { n: 7 }, have: Math.min(7, j.e.review.cycles), goal: 7, href: "/journey/today" });
  } else if (m === 7) {
    add({ id: "itqan-7", area: "itqan", key: "m_itqan", vars: { n: 20, q: 90 }, have: Math.min(20, M.itqan90), goal: 20, href: "/shams/quality" });
    add({ id: "review-7", area: "review", key: "m_review", vars: { n: 10 }, have: Math.min(10, j.e.review.cycles), goal: 10, href: "/journey/today" });
    add({ id: "streak-7", area: "streak", key: "m_streak", vars: { n: 365 }, have: Math.min(365, M.streakBest), goal: 365 });
  } else {
    // Marḥala 8 and every one after it
    const n = m - 7;
    add({ id: `review-${m}`, area: "review", key: "m_reviewFull", vars: { n: 2 * n }, have: Math.min(2 * n, j.full), goal: 2 * n, href: "/journey/today" });
    if (n <= 2) add({ id: `itqan-${m}`, area: "itqan", key: "m_itqan", vars: { n: 20 + 5 * n, q: 90 }, have: Math.min(20 + 5 * n, M.itqan90), goal: 20 + 5 * n, href: "/shams/quality" });
    else { const g = Math.min(30, 5 * (n - 2)); add({ id: `itqan-${m}`, area: "itqan", key: "m_itqan", vars: { n: g, q: 95 }, have: Math.min(g, M.itqan95), goal: g, href: "/shams/quality" }); }
    add({ id: `lemma-${m}`, area: "lemma", key: "m_lemmaCycle", vars: { n: 3 + n }, have: Math.min(3 + n, j.e.lemma.cycles), goal: 3 + n, href: "/journey/today" });
    add({ id: `mut-${m}`, area: "mut", key: "m_mut", vars: { n: 3 + n }, have: Math.min(3 + n, j.e.mut.cycles), goal: 3 + n, href: "/journey/today" });
    if (n >= 2) add({ id: `q-rev-${m}`, area: "qiraat", key: "m_qiraatRev", have: j.q[`q-rev-${m}`] ? 1 : 0, goal: 1, q: `q-rev-${m}` });
  }
  qiraat(QIRAAT.filter((q) => q.m === m).map((q) => q.id));

  // in every Marḥala: tafsir, hadith, khatm (and the garden in the first three)
  const tg = tafsirGoal(m);
  add({ id: `tafsir-${m}`, area: "tafsir", key: m === 1 ? "m_tafsir1" : "m_tafsir", vars: { n: m - 1 }, have: Math.min(tg, tafsirUnits), goal: tg, href: "/journey/today" });
  add({ id: `hadith-${m}`, area: "hadith", key: m === 1 ? "m_hadith40" : "m_hadith", vars: { n: hadithGoal(m) }, have: Math.min(hadithGoal(m), j.e.hadith.units), goal: hadithGoal(m), href: "/journey/today" });
  add({ id: `khatm-${m}`, area: "khatm", key: "m_khatm", vars: { n: khatmGoal(m) }, have: Math.min(khatmGoal(m), M.khatms), goal: khatmGoal(m), href: "/journey/today" });
  if (m <= 3) { const s = [6, 9, 12][m - 1]; add({ id: `garden-${m}`, area: "garden", key: "m_garden", vars: { n: s }, have: Math.min(s, M.treeStage), goal: s, href: "/garden" }); }
  return out;
}

export const doneOf = (ms: Milestone[]) => ms.filter((x) => x.have >= x.goal).length;
export const complete = (ms: Milestone[]) => ms.every((x) => x.have >= x.goal);
/** progress of a Marḥala 0..1 (each milestone weighs the same) */
export const fracOf = (ms: Milestone[]) => (ms.length ? ms.reduce((a, x) => a + Math.min(1, x.goal ? x.have / x.goal : 1), 0) / ms.length : 0);

/** the open-ended scale of the path: points toward the next Marḥala (100 per milestone, each counted up to its goal) */
export const marhalaPoints = (ms: Milestone[]): [number, number] => [Math.round(ms.reduce((a, x) => a + 100 * Math.min(1, x.goal ? x.have / x.goal : 1), 0)), ms.length * 100];

/** the learner's Marḥala: the first one not complete (a reached Marḥala is never taken away, see stickers) */
export function currentMarhala(M: Metrics, earned: (m: number) => boolean): number {
  let m = 1;
  while ((earned(m) || complete(marhala(m, M))) && m < 10_000) m++;
  return m;
}
