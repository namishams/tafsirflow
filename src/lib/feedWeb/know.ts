// Knowledge cards of the web feed: names of Allah, exam-centre questions, Academy / Abrahamic / Haramain lessons, Shams
// tadabbur (maqasid) and mutashabihat, built on the server from the website's mirrors of the app's content
// (src/lib/learn/**) and the exam bank (qbank.ts). Port of mobile/src/features/feed/knowledge.ts `knowledgeByRef` and its
// builders: same texts, same truncation, same deterministic option shuffle (shuffle.ts), so the same question looks the
// same on the app and on the website. No Quran or hadith text is built here: a card only names its verse key(s); the
// resolver adds the verse text from Quran.com. Never throws; null when the item is unknown here or hidden.
import { getChapters } from "@/lib/quran";
import { memo, plain, withTimeout, DAY, HOUR } from "./net";
import { fill } from "./texts";
import type { FeedTexts } from "./texts";
import { hash, shuffleBy } from "./shuffle";
import { qLangOf, questionById } from "./qbank";
import type { WebCta } from "./types";
import type { FeedTradition } from "@/lib/feed/types";
import type { Course, L as CL } from "@/lib/learn/courses/types";
import type { Lesson as KitLesson, L as KitL } from "@/lib/learn/abrahamic/core";
import type { AllahName } from "@/lib/learn/prophet/stories";
import { nameLessonId, nameRefs } from "@/lib/learn/courses/namesRefs";

export type KnowTexts = FeedTexts["know"];
/** a knowledge card before its verse text is attached: the resolver turns `verse` / `group` (verse keys) into WebVerse */
export type KnowCard = {
  title: string;
  body: string;
  eyebrow?: string;
  arabic?: string;
  bullets?: string[];
  /** the course's own note (the madhhab remark is not in it: the card says it when `madhhab` is set) */
  note?: string;
  /** the schools of law can differ on details (fiqh lessons, lessons tagged with a school, questions with school tags) */
  madhhab?: boolean;
  review?: boolean;
  verse?: string;
  words?: number[];
  /** mutashabihat: the verse keys of the group */
  group?: string[];
  quiz?: { options: string[]; answer: number; explain: string; level: number };
  source: string;
  sourceUrl: string;
  lang: string;
  href?: string;
  cta?: WebCta;
};

const BRAND = "Quran Masterclass";
const clean = (s: string) => plain(s).replace(/\s+/g, " ").trim();
const cut = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n).replace(/\s+\S*$/, "")} …`);
const cl3 = (lang: string): "de" | "en" | "ar" => (lang === "de" ? "de" : lang === "ar" ? "ar" : "en");
const ctx = (l: CL, lang: string) => (lang === "de" ? l.de : lang === "ar" ? l.ar : l.en) || l.en;
const kitL = (l: KitL | undefined, lang: string) => (l ? (l as Record<string, string | undefined>)[lang] || l.en : "");
const FIQH_TAGS = new Set(["hanafi", "maliki", "shafii", "hanbali", "jafari", "varies", "majority"]);

/** a Markdown-light lesson body: the first paragraph as the insight and up to three bullets */
export function insight(body: string): { lead: string; bullets: string[] } {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const lead = blocks.find((b) => !b.startsWith("##") && !b.startsWith("- ")) ?? "";
  const bullets = body.split("\n").filter((l) => /^\s*-\s+/.test(l)).map((l) => clean(l.replace(/^\s*-\s+/, ""))).filter((l) => l.length > 8).slice(0, 3);
  return { lead: cut(clean(lead.replace(/^##[^\n]*\n/, "")), 420), bullets: bullets.map((b) => cut(b, 160)) };
}

// ---------- Academy courses ----------
const COURSE_LOADERS: Record<string, () => Promise<Course>> = {
  seerah: () => import("@/lib/learn/courses/content/seerah").then((m) => m.SEERAH),
  prophets: () => import("@/lib/learn/courses/content/prophets").then((m) => m.PROPHETS),
  ulum: () => import("@/lib/learn/courses/content/ulum").then((m) => m.ULUM),
  "hadith-sci": () => import("@/lib/learn/courses/content/hadithSci").then((m) => m.HADITH_SCI),
  aqidah: () => import("@/lib/learn/courses/content/aqidah").then((m) => m.AQIDAH),
  "fiqh-salah-sawm": () => import("@/lib/learn/courses/content/fiqh").then((m) => m.FIQH),
  akhlaq: () => import("@/lib/learn/courses/content/akhlaq").then((m) => m.AKHLAQ),
  adhkar: () => import("@/lib/learn/courses/content/adhkar").then((m) => m.ADHKAR),
  ramadan: () => import("@/lib/learn/courses/content/ramadan").then((m) => m.RAMADAN),
  hajj: () => import("@/lib/learn/courses/content/hajj").then((m) => m.HAJJ),
  "tajweed-deep": () => import("@/lib/learn/courses/content/tajweedDeep").then((m) => m.TAJWEED_DEEP),
};

function courseCard(c: Course, lessonId: string, lang: string, kt: KnowTexts): KnowCard | null {
  const i = c.lessons.findIndex((l) => l.id === lessonId);
  if (i < 0) return null;
  const l = c.lessons[i];
  const { lead, bullets } = insight(ctx(l.body, lang));
  if (lead.length <= 40) return null; // the app leaves out lessons without a real insight
  const madhhab = c.id === "fiqh-salah-sawm" || (l.tags ?? []).some((t) => FIQH_TAGS.has(t));
  return {
    title: clean(ctx(l.title, lang)), body: lead, bullets, eyebrow: `${ctx(c.title, lang)} · ${fill(kt.lessonOf, { n: i + 1 })}`,
    verse: l.verses?.[0], note: c.note ? clean(ctx(c.note, lang)) : undefined, madhhab: madhhab || undefined, lang: cl3(lang),
    href: `/courses/${c.id}/${l.id}`, cta: "course", source: `${BRAND} · ${kt.course}`, sourceUrl: "",
  };
}

// ---------- the 99 names ----------
const NAMES_TITLE: CL = { en: "The 99 Names of Allah", de: "Die 99 Namen Allahs", ar: "أسماء الله الحسنى" };
const NAME_Q: CL = { en: "What does this name mean?", de: "Was bedeutet dieser Name?", ar: "ما معنى هذا الاسم؟" }; // courseText(lang, "nameQ"): en / de / ar, other languages read English

/** the 99 names in the reader's language (the library chapter "names") */
const nameList = (lang: string) =>
  memo<{ list: AllahName[]; lang: string }>(`know:names:${lang}`, DAY, async () => {
    const { islamDoc, loadChapter } = await import("@/lib/islam");
    const d = islamDoc("names");
    if (!d) return null;
    const ch = await loadChapter(d, lang);
    const { allahNames } = await import("@/lib/learn/prophet/stories");
    const list = allahNames(ch);
    return list.length ? { list, lang: ch === d.de ? "de" : ch === d.en ? "en" : lang } : null;
  }, HOUR);

async function nameCard(ref: Record<string, unknown>, lang: string, kt: KnowTexts): Promise<KnowCard | null> {
  const i = Number(ref.i);
  const names = await nameList(lang);
  if (!names || !Number.isInteger(i) || i < 0 || i >= names.list.length) return null;
  const { list } = names;
  const n = list[i];
  const base: KnowCard = {
    title: n.latin, body: clean(n.meaning), arabic: n.ar, verse: nameRefs(list, i)[0], lang: names.lang,
    eyebrow: `${ctx(NAMES_TITLE, lang)} · ${fill(kt.lessonOf, { n: i + 1 })}`, href: `/courses/names/${nameLessonId(i)}`, cta: "course",
    source: `${BRAND} · ${kt.course}`, sourceUrl: "",
  };
  if (ref.v === "verse") {
    // the same name with its next place in the Quran (only when there is a second one)
    const second = nameRefs(list, i)[1];
    return second ? { ...base, verse: second } : null;
  }
  if (ref.v === "quiz") {
    const others = shuffleBy(list.map((x, k) => ({ x, k })).filter((o) => o.k !== i && o.x.meaning && o.x.meaning !== n.meaning), hash(`name-quiz:${i}`)).slice(0, 3);
    if (others.length < 3 || !n.meaning) return null;
    const order = shuffleBy([0, 1, 2, 3], hash(`name-order:${i}`));
    const opts = [n.meaning, ...others.map((o) => o.x.meaning)];
    return {
      ...base, title: ctx(NAME_Q, lang), body: "", verse: undefined, eyebrow: `${base.eyebrow ?? ""} · ${n.latin}`,
      quiz: { options: order.map((k) => clean(opts[k])), answer: order.indexOf(0), explain: `${n.latin}: ${clean(n.meaning)}`, level: 1 },
    };
  }
  return base;
}

// ---------- Shams 2.0 tadabbur (maqasid of a surah) ----------
/** surah names in the reader's language (id -> name), cached */
export const chapterNames = (lang: string) => memo<Map<number, string>>(`know:chapters:${lang}`, DAY, async () => {
  const cs = await withTimeout(getChapters(lang));
  return cs.length ? new Map(cs.map((c) => [c.id, c.name_simple])) : null;
}, HOUR);

async function tadabburCard(ref: Record<string, unknown>, lang: string, kt: KnowTexts): Promise<KnowCard | null> {
  const s = Number(ref.s);
  if (!Number.isInteger(s) || s < 1 || s > 114) return null;
  const { maqasidOf } = await import("@/lib/learn/shams2/maqasid");
  const m = maqasidOf(s);
  if (!m) return null;
  const cl = cl3(lang);
  const nameOf = (await chapterNames(lang))?.get(s) ?? `${s}`;
  const draft = m.review.status === "draft";
  const pickL = (x?: { de: string[]; en: string[]; ar: string[] }) => (x?.[cl]?.length ? x[cl] : x?.en ?? []);
  const sections = m.sections.filter((x) => x.lessons);
  if (sections.length) {
    // surahs with detailed sections have one card per section, none for the surah as a whole
    const f = Number(ref.f);
    const x = ref.f !== undefined && Number.isInteger(f) ? sections.find((sec) => sec.from === f) : undefined;
    if (!x) return null;
    return {
      title: x.title[cl] || x.title.en, body: x.takeaway ? x.takeaway[cl] || x.takeaway.en : "", bullets: pickL(x.lessons).slice(0, 4),
      eyebrow: `${nameOf} · ${s}:${x.from}–${x.to} · ${kt.sectionTeaches}`, verse: `${s}:${x.from}`, review: draft, lang: cl,
      href: `/shams/tadabbur?s=${s}&v=${x.from}`, cta: "shams", source: `${BRAND} · Shams 2.0`, sourceUrl: "",
    };
  }
  if (ref.f !== undefined) return null;
  return {
    title: m.theme[cl] || m.theme.en, body: m.context[cl] || m.context.en, bullets: pickL(m.lessons).slice(0, 4),
    eyebrow: `${nameOf} · ${kt.maqsad}`, verse: `${s}:1`, review: draft, lang: cl,
    href: `/shams/tadabbur?s=${s}`, cta: "shams", source: `${BRAND} · Shams 2.0`, sourceUrl: "",
  };
}

// ---------- exam centre ----------
function examCard(id: string, lang: string, kt: KnowTexts): KnowCard | null {
  const q = questionById(id, lang);
  if (!q) return null;
  const order = shuffleBy([0, 1, 2, 3], hash(id));
  const level = q.d <= 2 ? kt.levelEasy : q.d <= 4 ? kt.levelMid : kt.levelHard;
  const madhhab = (q.tr ?? []).some((t) => ["hanafi", "maliki", "shafii", "hanbali", "comparative"].includes(t));
  return {
    title: clean(q.q), body: "", eyebrow: `${kt.examQ} · ${level}`, verse: q.v, words: q.w ? [q.w] : undefined, lang: qLangOf(lang),
    quiz: { options: order.map((i) => clean(q.o[i])), answer: order.indexOf(0), explain: clean(q.e), level: q.d },
    madhhab: madhhab || undefined, review: q.rv !== "reviewed", source: q.src || `${BRAND} · ${kt.exam}`, sourceUrl: "",
  };
}

// ---------- Abrahamic and Haramain lessons ----------
async function kitCard(kit: "abrahamic" | "haramain", lessonId: string, lang: string, kt: KnowTexts, tradition: FeedTradition): Promise<KnowCard | null> {
  const list = kit === "abrahamic"
    ? (await import("@/lib/learn/abrahamic/lessons")).ABRAHAMIC_LESSONS
    : (await import("@/lib/learn/haramain/lessons")).HARAMAIN_LESSONS;
  const l: KitLesson | undefined = list.find((x) => x.id === lessonId);
  if (!l) return null;
  // the other tradition's lessons are left out (the app reads the learner's tradition; here it is the request's)
  if ((l.tags.includes("shia") && tradition === "sunni") || (l.tags.includes("sunni") && tradition === "shia")) return null;
  const label = kit === "abrahamic" ? kt.abrahamic : kt.haramain;
  const text = kitL(l.text, lang);
  const paras = text.split(/\n+/).map((x) => clean(x)).filter(Boolean);
  if (!paras.length) return null;
  const has = !!(l.text as Record<string, string | undefined>)[lang];
  return {
    title: clean(kitL(l.title, lang)), body: cut(paras[0], 420), bullets: paras.slice(1, 3).map((x) => cut(x, 180)), arabic: l.arabic,
    verse: l.verses[0], note: l.note ? clean(kitL(l.note, lang)) : undefined, eyebrow: label, lang: has ? lang : "en",
    href: `/${kit}/lesson/${l.id}`, cta: "lesson", source: `${BRAND} · ${label}`, sourceUrl: "",
  };
}

// ---------- mutashabihat ----------
const MUT_TITLE: Record<"de" | "en" | "ar", string> = { en: "Mutashābihāt", de: "Mutashābihāt", ar: "المتشابهات" }; // S2_TEXT[lang].mutTitle
async function mutCard(ref: Record<string, unknown>, lang: string): Promise<KnowCard | null> {
  const { MUT_GROUPS } = await import("@/lib/learn/shams2/mutData");
  const g = MUT_GROUPS.find((x) => x.id === ref.g);
  if (!g) return null;
  const cl = cl3(lang);
  return {
    title: g.topic[cl] || g.topic.en, body: "", bullets: g.keys.map((k) => `Quran ${k}`), eyebrow: `${MUT_TITLE[cl]} · ${g.keys.join(" · ")}`,
    verse: g.keys[0], group: g.keys, review: true, lang: cl, href: "/shams/mutashabihat", cta: "shams", source: `${BRAND} · Shams 2.0`, sourceUrl: "",
  };
}

/**
 * One knowledge card for a corpus reference (see the app's `knowledgeByRef`): name {i, v}, quiz {q}, course {c, l} or
 * {kit, l}, maqasid {s, f?}, mutashabihat {g, keys}. Null when the item is unknown or hidden for the tradition.
 */
export async function knowledgeByRef(kind: string, ref: Record<string, unknown>, lang: string, kt: KnowTexts, tradition: FeedTradition): Promise<KnowCard | null> {
  try {
    switch (kind) {
      case "quiz":
        return typeof ref.q === "string" ? examCard(ref.q, lang, kt) : null;
      case "course": {
        if (ref.kit === "abrahamic" || ref.kit === "haramain") return await kitCard(ref.kit, String(ref.l), lang, kt, tradition);
        const load = COURSE_LOADERS[String(ref.c)];
        return load ? courseCard(await load(), String(ref.l), lang, kt) : null;
      }
      case "maqasid":
        return await tadabburCard(ref, lang, kt);
      case "name":
        return await nameCard(ref, lang, kt);
      case "mutashabihat":
        return await mutCard(ref, lang);
      default:
        return null;
    }
  } catch {
    return null;
  }
}
