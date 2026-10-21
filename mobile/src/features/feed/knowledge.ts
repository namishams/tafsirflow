import { COURSES, tx as ctx } from "@/features/courses";
import { readCP, isPassed } from "@/features/courses/progress";
import { nameLessonId, nameRefs } from "@/features/courses/names";
import { islamDoc, loadChapter } from "@/web/islam";
import { allahNames } from "@/features/prophet/stories";
import { maqasidOf } from "@/features/shams2/maqasid";
import { getChapters } from "@/lib/quran";
import { allQuestions, locOf, qLangOf, questionById, type Q } from "@/features/qbank/bank";
import { MUT_GROUPS } from "@/features/shams2/mutData";
import { S2_TEXT } from "@/features/shams2/text";
import { courseText } from "@/features/courses/texts";
import { drawAdaptive, poolOf } from "@/features/qbank/engine";
import type { QSubject } from "@/features/qbank/types";
import { CURRICULUM, FACULTIES, DEPARTMENTS, SUBJECT_PLACE, SUBJECTS, hrefOf, stateOf, timetable, titleOf, type FacultyId, type SubjectId } from "@/features/school/model";
import { schoolText } from "@/features/school/texts";
import { tajweedFor } from "@/web/tajweed";
import { EXTRA as RP_EXTRA } from "@/features/reciter-path/content2";
import { VOCAB_DECKS } from "@/web/vocab";
import { meaning as vocabMeaning } from "@/web/vocabI18n";
import { LESSONS as AR_LESSONS } from "@/features/arabic-lang/curriculum";
import { tx as arTx } from "@/features/arabic-lang/types";
import { ABRAHAMIC_LESSONS } from "@/features/abrahamic/lessons";
import { HARAMAIN_LESSONS } from "@/features/haramain/lessons";
import type { Lesson as KitLesson, L as KitL } from "@/features/abrahamic/courseKit";
import { allLessons as nahjLessons, nahjEdition, nextLesson as nahjNext, studyOf } from "@/features/nahj-course/data";
import { readTradition, showsNahj, showsShia, showsSunni } from "@/lib/tradition";
import { sijillApi, type Moment } from "@/features/sijill/api";
import type { KnowText } from "./knowTexts";

// Knowledge posts: the whole app as feed content. Every item is built from content that is already in the app
// (Academy courses, Shams 2.0 maqasid, the exam centre's question bank, the Madrasa model, tajweed and Reciter Path,
// Arabic, Abrahamic and Haramain lessons, Nahj studies from the bundled files, Sijill moments when switched on).
// No Quran or hadith text is stored here: verses are only keys, rendered from the Quran data by KnowledgePost.
// Each item carries its subject (a Madrasa subject: Explore chips and personal interest) and a CTA into the app.

import { knowVisible, type KnowKind, type KnowSubject } from "./knowKinds";
export type { KnowKind, KnowSubject } from "./knowKinds";

export type KnowQuiz = { options: string[]; answer: number; explain: string; level: number };
export type KnowItem = {
  id: string;
  kind: KnowKind;
  title: string;
  body: string;
  lang: string;
  source: string;
  sourceUrl: string;
  /** small line above the title (course name, faculty, surah …) */
  eyebrow?: string;
  subject: KnowSubject;
  /** the screen the CTA opens */
  href: string;
  cta: keyof KnowText;
  /** a verse key rendered from the Quran data, optionally with word positions to highlight (grammar: to find) */
  verse?: string;
  words?: number[];
  /** an Arabic word or phrase that is part of the app's own data (vocabulary, a tajweed example, a name of Allah) */
  arabic?: string;
  bullets?: string[];
  /** a short note (the course's own note, madhhab differences) */
  note?: string;
  madhhab?: boolean;
  review?: boolean;
  quiz?: KnowQuiz;
  /** grammar posts: tap the word(s) of the verse */
  find?: boolean;
  /** maqam posts: a listen button with the chosen reciter */
  listen?: boolean;
  moment?: Moment;
};

const PAGE = 5;
const day = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
const hash = (s: string) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
function seeded(seed: number) { let x = seed || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 100000) / 100000; }; }
function shuffleBy<T>(a: T[], seed: number): T[] {
  const r = seeded(seed); const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
const clean = (s: string) => s.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
const cut = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n).replace(/\s+\S*$/, "")} …`);
const cl3 = (lang: string): "de" | "en" | "ar" => (lang === "de" ? "de" : lang === "ar" ? "ar" : "en");
const kitL = (l: KitL | undefined, lang: string) => (l ? (l as Record<string, string | undefined>)[lang] || l.en : "");
const BRAND = "Quran Masterclass";

/** a Markdown-light lesson body: the first paragraph as the insight and up to three bullets */
function insight(body: string): { lead: string; bullets: string[] } {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const lead = blocks.find((b) => !b.startsWith("##") && !b.startsWith("- ")) ?? "";
  const bullets = body.split("\n").filter((l) => /^\s*-\s+/.test(l)).map((l) => clean(l.replace(/^\s*-\s+/, ""))).filter((l) => l.length > 8).slice(0, 3);
  return { lead: cut(clean(lead.replace(/^##[^\n]*\n/, "")), 420), bullets: bullets.map((b) => cut(b, 160)) };
}

// ---------- the subject of a course / question ----------
const COURSE_SUBJECT: Record<string, KnowSubject> = { seerah: "seerah", prophets: "seerah", ulum: "tafsir", "hadith-sci": "hadith", aqidah: "aqidah", "fiqh-salah-sawm": "fiqh", akhlaq: "akhlaq", adhkar: "akhlaq", names: "aqidah", ramadan: "fiqh", hajj: "fiqh", "tajweed-deep": "quran" };
const Q_SUBJECT: Record<QSubject, KnowSubject> = { tajweed: "quran", qiraat: "quran", ulum: "tafsir", tafsir: "tafsir", seerah: "seerah", prophets: "seerah", hadith: "hadith", aqidah: "aqidah", fiqh: "fiqh", nahw: "arabic", vocab: "arabic", history: "seerah" };
const FIQH_TAGS = new Set(["hanafi", "maliki", "shafii", "hanbali", "jafari", "varies", "majority"]);

// ---------- builders (a full, ordered list per kind and language; pages are slices of it) ----------
type Builder = (lang: string, kt: KnowText) => KnowItem[] | Promise<KnowItem[]>;

const courses: Builder = (lang, kt) => COURSES.filter((c) => c.id !== "names").flatMap((c) => c.lessons.map((l, i): KnowItem => {
  const { lead, bullets } = insight(ctx(l.body, lang));
  const madhhab = c.id === "fiqh-salah-sawm" || (l.tags ?? []).some((t) => FIQH_TAGS.has(t));
  return {
    id: `kn:course:${c.id}:${l.id}`, kind: "kn-course", lang, title: ctx(l.title, lang), body: lead, bullets,
    eyebrow: `${ctx(c.title, lang)} · ${kt.lessonOf.replace("{n}", String(i + 1))}`, subject: COURSE_SUBJECT[c.id] ?? "aqidah",
    href: `/courses/${c.id}/${l.id}`, cta: "ctaCourse", verse: l.verses?.[0], note: c.note ? ctx(c.note, lang) : undefined, madhhab,
    source: `${BRAND} · ${kt.course}`, sourceUrl: "",
  };
})).filter((i) => i.body.length > 40);

/** the 99 names in the reader's language (the library chapter "names"), loaded once per language */
const nameLists = new Map<string, Promise<ReturnType<typeof allahNames>>>();
function nameList(lang: string) {
  let p = nameLists.get(lang);
  if (!p) {
    const d = islamDoc("names");
    p = d ? loadChapter(d, lang).then(allahNames) : Promise.resolve([]);
    p.catch(() => nameLists.delete(lang));
    nameLists.set(lang, p);
  }
  return p;
}

const names: Builder = async (lang, kt) => {
  const list = await nameList(lang);
  if (!list.length) return [];
  const course = COURSES.find((c) => c.id === "names");
  return list.map((n, i): KnowItem => ({
    id: `kn:names:${i}`, kind: "kn-names", lang, title: n.latin, body: n.meaning, arabic: n.ar, verse: nameRefs(list, i)[0],
    eyebrow: course ? `${ctx(course.title, lang)} · ${kt.lessonOf.replace("{n}", String(i + 1))}` : kt.course, subject: "aqidah",
    href: `/courses/names/${nameLessonId(i)}`, cta: "ctaCourse", source: `${BRAND} · ${kt.course}`, sourceUrl: "",
  }));
};

const tadabbur: Builder = async (lang, kt) => {
  const cl = cl3(lang);
  const chapters = await getChapters(lang).catch(() => []);
  const nameOf = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${s}`;
  const out: KnowItem[] = [];
  for (let s = 1; s <= 114; s++) {
    const m = maqasidOf(s);
    if (!m) continue;
    const draft = m.review.status === "draft";
    const pickL = (x?: { de: string[]; en: string[]; ar: string[] }) => (x?.[cl]?.length ? x[cl] : x?.en ?? []);
    const sec = m.sections.filter((x) => x.lessons);
    if (sec.length) {
      for (const x of sec) out.push({
        id: `kn:tadabbur:${s}:${x.from}`, kind: "kn-tadabbur", lang, title: x.title[cl] || x.title.en, body: x.takeaway ? x.takeaway[cl] || x.takeaway.en : "",
        bullets: pickL(x.lessons).slice(0, 4), eyebrow: `${nameOf(s)} · ${s}:${x.from}–${x.to} · ${kt.sectionTeaches}`, subject: "tafsir",
        href: `/shams/tadabbur?s=${s}&v=${x.from}`, cta: "ctaShams", verse: `${s}:${x.from}`, review: draft, source: `${BRAND} · Shams 2.0`, sourceUrl: "",
      });
    } else {
      out.push({
        id: `kn:tadabbur:${s}`, kind: "kn-tadabbur", lang, title: m.theme[cl] || m.theme.en, body: m.context[cl] || m.context.en, bullets: pickL(m.lessons).slice(0, 4),
        eyebrow: `${nameOf(s)} · ${kt.maqsad}`, subject: "tafsir", href: `/shams/tadabbur?s=${s}`, cta: "ctaShams", verse: `${s}:1`, review: draft,
        source: `${BRAND} · Shams 2.0`, sourceUrl: "",
      });
    }
  }
  return out;
};

function examItem(q: Q, lang: string, kt: KnowText): KnowItem {
  const [stem, opts, explain] = locOf(q, qLangOf(lang));
  const order = shuffleBy([0, 1, 2, 3], hash(q.id));
  const level = q.d <= 2 ? kt.levelEasy : q.d <= 4 ? kt.levelMid : kt.levelHard;
  return {
    id: `kn:exam:${q.id}`, kind: "kn-exam", lang, title: stem, body: "", eyebrow: `${kt.examQ} · ${level}`, subject: Q_SUBJECT[q.s],
    href: `/exams/session?mode=practice&subject=${q.s}&n=10`, cta: "ctaExam", verse: q.v, words: q.w ? [q.w] : undefined,
    quiz: { options: order.map((i) => opts[i]), answer: order.indexOf(0), explain, level: q.d }, madhhab: (q.tr ?? []).some((t) => ["hanafi", "maliki", "shafii", "hanbali", "comparative"].includes(t)),
    review: q.review !== "reviewed", source: q.src || `${BRAND} · ${kt.exam}`, sourceUrl: "",
  };
}

const madrasa: Builder = (lang, kt) => {
  const st = schoolText(lang);
  const cut1 = (s: string) => s.split(/[:(（]/)[0].trim();
  const subjName = (s: SubjectId) => st(`subj_${s}` as never);
  const facOf: Record<FacultyId, KnowSubject> = { quran: "quran", arabic: "arabic", usul: "aqidah", sharia: "fiqh" };
  const fac = FACULTIES.map((f): KnowItem => {
    const subs = SUBJECTS.filter((s) => SUBJECT_PLACE[s.id].faculty === f.id);
    const depts = DEPARTMENTS.filter((d) => d.faculty === f.id).map((d) => st(`dept_${d.id}` as never));
    return {
      id: `kn:faculty:${f.id}`, kind: "kn-faculty", lang, title: st(`fac_${f.id}` as never), arabic: f.ar, body: depts.join(" · "), bullets: subs.map((s) => subjName(s.id)),
      eyebrow: `${kt.madrasa} · ${kt.faculty}`, subject: facOf[f.id], href: "/school", cta: "ctaMadrasa", source: `${BRAND} · ${kt.madrasa}`, sourceUrl: "",
    };
  });
  const subj = SUBJECTS.map((s): KnowItem => {
    const cs = CURRICULUM.filter((c) => c.subject === s.id);
    return {
      id: `kn:subject:${s.id}`, kind: "kn-faculty", lang, title: cut1(subjName(s.id)) || subjName(s.id), arabic: s.ar, body: subjName(s.id),
      bullets: cs.slice(0, 4).map((c) => titleOf(c, lang, st as never)), eyebrow: `${st(`fac_${SUBJECT_PLACE[s.id].faculty}` as never)} · ${kt.subject}`,
      subject: s.id, href: "/school", cta: "ctaMadrasa", source: `${BRAND} · ${kt.madrasa}`, sourceUrl: "",
    };
  });
  return [...fac, ...subj];
};

// The adab of the student: general study manners (no quotations), marked for scholar review like all new religious content.
const ADAB: { en: string; de: string; ar: string; title: [string, string, string]; verse?: string }[] = [
  { title: ["Renew your intention", "Erneuern Sie Ihre Absicht", "جدّد نيتك"], en: "Begin each lesson by renewing your intention: to learn for the sake of Allah and to act on what you learn.", de: "Beginnen Sie jede Lektion, indem Sie Ihre Absicht erneuern: um Allahs willen lernen und nach dem Gelernten handeln.", ar: "ابدأ كل درس بتجديد النية: أن تتعلم لوجه الله وأن تعمل بما تعلمت." },
  { title: ["Ask for beneficial knowledge", "Bitten Sie um nützliches Wissen", "اسأل الله العلم النافع"], en: "Before you study, ask Allah to increase you in knowledge, as the Quran teaches in this verse.", de: "Bitten Sie Allah vor dem Lernen, Ihr Wissen zu mehren, wie es der Koran in diesem Vers lehrt.", ar: "قبل أن تدرس، اسأل الله أن يزيدك علمًا كما يعلّمنا القرآن في هذه الآية.", verse: "20:114" },
  { title: ["A little, every day", "Wenig, aber täglich", "قليل دائم"], en: "A small portion every day stays longer than a long session once a week. Choose a fixed time and keep it.", de: "Ein kleiner Teil jeden Tag bleibt länger als eine lange Sitzung einmal pro Woche. Wählen Sie eine feste Zeit und halten Sie sie ein.", ar: "قليل كل يوم يبقى أطول من جلسة طويلة مرة في الأسبوع. اختر وقتًا ثابتًا وحافظ عليه." },
  { title: ["Review before you move on", "Wiederholen, dann weitergehen", "راجع قبل أن تتقدم"], en: "Revise what you learned yesterday before you start something new. Knowledge that is reviewed becomes your own.", de: "Wiederholen Sie das Gestrige, bevor Sie Neues beginnen. Wiederholtes Wissen wird zu Ihrem eigenen.", ar: "راجع ما تعلمته بالأمس قبل أن تبدأ جديدًا؛ فالعلم المُراجَع يصبح ملكك." },
  { title: ["Honour your teachers", "Ehren Sie Ihre Lehrkräfte", "وقّر معلميك"], en: "Speak of your teachers with respect, listen fully before you reply and thank those who taught you.", de: "Sprechen Sie respektvoll über Ihre Lehrkräfte, hören Sie ganz zu, bevor Sie antworten, und danken Sie denen, die Sie unterrichtet haben.", ar: "تحدّث عن معلميك باحترام، وأنصت حتى النهاية قبل أن تجيب، واشكر من علّمك." },
  { title: ["Say: I do not know", "Sagen Sie: Ich weiß es nicht", "قل: لا أدري"], en: "Humility keeps knowledge alive. When you do not know, say so, and look it up with a trustworthy source.", de: "Demut hält Wissen lebendig. Wenn Sie etwas nicht wissen, sagen Sie es und schlagen Sie es in einer vertrauenswürdigen Quelle nach.", ar: "التواضع يحفظ العلم. إذا لم تعلم فقل ذلك، وابحث عنه في مصدر موثوق." },
  { title: ["Check the source", "Prüfen Sie die Quelle", "تحقّق من المصدر"], en: "Learn from trustworthy teachers and books, and ask where a statement comes from before you pass it on.", de: "Lernen Sie von vertrauenswürdigen Lehrkräften und Büchern und fragen Sie, woher eine Aussage stammt, bevor Sie sie weitergeben.", ar: "تعلّم من معلمين وكتب موثوقة، واسأل عن مصدر القول قبل أن تنقله." },
  { title: ["Act on what you learn", "Handeln Sie nach dem Gelernten", "اعمل بما تعلم"], en: "Choose one thing from today's lesson and put it into practice. Knowledge grows when it is lived.", de: "Wählen Sie eine Sache aus der heutigen Lektion und setzen Sie sie um. Wissen wächst, wenn es gelebt wird.", ar: "اختر أمرًا واحدًا من درس اليوم وطبّقه؛ فالعلم ينمو بالعمل." },
  { title: ["Patience with yourself", "Geduld mit sich selbst", "الصبر على النفس"], en: "Every scholar was once a beginner. Mistakes are part of learning; correct them calmly and keep going.", de: "Jeder Gelehrte war einmal Anfänger. Fehler gehören zum Lernen; korrigieren Sie sie ruhig und machen Sie weiter.", ar: "كل عالم كان مبتدئًا يومًا. الخطأ جزء من التعلم؛ صحّحه بهدوء وواصل." },
  { title: ["A clear place, a clear mind", "Ruhiger Ort, klarer Kopf", "مكان هادئ وذهن صافٍ"], en: "Study in a calm place, put the phone aside for the lesson and keep your book and notes in order.", de: "Lernen Sie an einem ruhigen Ort, legen Sie das Telefon für die Lektion beiseite und halten Sie Buch und Notizen in Ordnung.", ar: "ادرس في مكان هادئ، وضع الهاتف جانبًا أثناء الدرس، ورتّب كتابك ومذكراتك." },
];
const adab: Builder = (lang, kt) => ADAB.map((a, i): KnowItem => {
  const cl = cl3(lang);
  return {
    id: `kn:adab:${i}`, kind: "kn-adab", lang, title: a.title[cl === "de" ? 1 : cl === "ar" ? 2 : 0], body: a[cl], verse: a.verse, eyebrow: `${kt.madrasa} · ${kt.adab}`,
    subject: "akhlaq", href: "/school", cta: "ctaMadrasa", review: true, source: `${BRAND} · ${kt.madrasa}`, sourceUrl: "",
  };
});

/** "your next step": today's Madrasa timetable, a started Academy course, the Nahj study (when visible) */
const next: Builder = (lang, kt) => {
  const st = schoolText(lang);
  const d = day();
  const out: KnowItem[] = [];
  const today = timetable()[new Date().getDay() % 7] ?? [];
  for (const slot of today.slice(0, 2)) {
    const c = slot.course;
    const pct = Math.round(stateOf(c).done * 100);
    out.push({
      id: `kn:next:${d}:${c.id}`, kind: "kn-next", lang, title: titleOf(c, lang, st as never), body: `${st(`subj_${c.subject}` as never)} · ${slot.minutes} min · ${pct} %`,
      eyebrow: `${kt.madrasa} · ${kt.nextStep}`, subject: c.subject, href: hrefOf(c), cta: "ctaNext", source: `${BRAND} · ${kt.madrasa}`, sourceUrl: "",
    });
  }
  const p = readCP();
  for (const c of COURSES) {
    if (c.id === "names") continue;
    const passed = c.lessons.filter((l) => isPassed(p, c.id, l.id)).length;
    const nx = c.lessons.find((l) => !isPassed(p, c.id, l.id));
    if (!passed || !nx) continue;
    out.push({
      id: `kn:next:${d}:course:${c.id}`, kind: "kn-next", lang, title: ctx(nx.title, lang), body: `${passed} / ${c.lessons.length}`, eyebrow: `${ctx(c.title, lang)} · ${kt.nextStep}`,
      subject: COURSE_SUBJECT[c.id] ?? "aqidah", href: `/courses/${c.id}/${nx.id}`, cta: "ctaNext", source: `${BRAND} · ${kt.course}`, sourceUrl: "",
    });
    if (out.length >= 4) break;
  }
  if (showsNahj(readTradition())) {
    const nl = nahjNext(nahjEdition(lang));
    if (nl) out.push({ id: `kn:next:${d}:nahj:${nl.id}`, kind: "kn-next", lang, title: nl.title, body: nl.aim, eyebrow: `${kt.nahj} · ${kt.nextStep}`, subject: "hadith", href: `/nahj-studies/lesson/${nl.id}`, cta: "ctaNahj", source: kt.nahj, sourceUrl: "" });
  }
  return out;
};

const tajweed: Builder = (lang, kt) => tajweedFor(lang).flatMap((l) => l.examples.filter((e) => e.key).map((e, i): KnowItem => ({
  id: `kn:tajweed:${l.id}:${i}`, kind: "kn-tajweed", lang, title: lang === "de" ? l.title_de : l.title_en, body: cut(lang === "de" ? l.summary_de : l.summary_en, 300),
  bullets: [(lang === "de" ? e.note_de : e.note_en)].filter(Boolean), arabic: e.ar, verse: e.key, eyebrow: `${kt.tajweed} · ${kt.example.replace("{ref}", e.key!)}`,
  subject: "quran", href: `/tajweed/${l.id}`, cta: "ctaLesson", source: `${BRAND} · Tajweed`, sourceUrl: "",
})));

const maqam: Builder = (lang, kt) => {
  const ex = RP_EXTRA[cl3(lang)] ?? RP_EXTRA.en;
  const out: KnowItem[] = [];
  for (const [unit, verse] of [["7-1", "1:1"], ["7-2", "93:1"]] as const) {
    const u = ex.units[unit];
    if (!u) continue;
    u.points.forEach((pt, i) => {
      const m = pt.match(/^([^:：]{2,24})[:：]\s*(.+)$/);
      if (!m) return;
      out.push({
        id: `kn:maqam:${unit}:${i}`, kind: "kn-maqam", lang, title: m[1].trim(), body: m[2].trim(), bullets: [cut(u.intro, 260)], verse, listen: true,
        eyebrow: `${kt.maqam} · ${u.title}`, subject: "quran", href: `/reciter-path/${unit}`, cta: "ctaTajweed", source: `${BRAND} · Reciter Path`, sourceUrl: "",
      });
    });
  }
  return out;
};

const arabicWord: Builder = (lang, kt) => VOCAB_DECKS.flatMap((d) => d.words.filter((w) => w.ex?.key).map((w): KnowItem => ({
  id: `kn:word:${w.id}`, kind: "kn-arabic-word", lang, title: w.tr, body: vocabMeaning(w, lang), arabic: w.ar, verse: w.ex!.key,
  bullets: w.root ? [`${w.root}`] : undefined, eyebrow: `${kt.arabicWord} · ${lang === "de" ? d.title_de : d.title_en}`, subject: "arabic",
  href: "/arabic/lang", cta: "ctaArabic", source: `${BRAND} · Arabic`, sourceUrl: "",
})));

const grammar: Builder = (lang, kt) => AR_LESSONS.flatMap((l) => (l.spot ?? []).map((s, i): KnowItem => ({
  id: `kn:grammar:${l.id}:${i}`, kind: "kn-grammar", lang, title: arTx(l.title, lang), body: cut(clean(arTx(l.expl, lang)), 320), bullets: [arTx(s.ask, lang)],
  verse: s.key, words: s.pos, find: true, eyebrow: `${kt.grammar} · ${s.key}`, subject: "arabic", href: `/arabic/lang/${l.id}`, cta: "ctaArabic",
  source: `${BRAND} · Arabic`, sourceUrl: "",
})));

function kitItems(kind: "kn-abrahamic" | "kn-haramain", list: KitLesson[], route: string, label: string, lang: string): KnowItem[] {
  const t = readTradition();
  return list.filter((l) => (!l.tags.includes("shia") || showsShia(t)) && (!l.tags.includes("sunni") || showsSunni(t))).map((l): KnowItem => {
    const paras = kitL(l.text, lang).split(/\n+/).map((x) => x.trim()).filter(Boolean);
    return {
      id: `kn:${kind}:${l.id}`, kind, lang, title: kitL(l.title, lang), body: cut(paras[0] ?? "", 420), bullets: paras.slice(1, 3).map((x) => cut(x, 180)), arabic: l.arabic,
      verse: l.verses[0], note: l.note ? kitL(l.note, lang) : undefined, eyebrow: label, subject: kind === "kn-haramain" ? "fiqh" : "seerah",
      href: `${route}/lesson/${l.id}`, cta: "ctaLesson", source: `${BRAND} · ${label}`, sourceUrl: "",
    };
  });
}
const abrahamic: Builder = (lang, kt) => kitItems("kn-abrahamic", ABRAHAMIC_LESSONS, "/abrahamic", kt.abrahamic, lang);
const haramain: Builder = (lang, kt) => kitItems("kn-haramain", HARAMAIN_LESSONS, "/haramain", kt.haramain, lang);

/** only when the Nahj al-Balagha is visible; content stays the bundled study files (never fetched or uploaded) */
const nahj: Builder = (lang, kt) => {
  if (!showsNahj(readTradition())) return [];
  const ed = nahjEdition(lang);
  return nahjLessons(ed).flatMap((l) => l.items.slice(0, 2).map((p): KnowItem | null => {
    const s = studyOf(ed, p.id);
    if (!s?.e) return null;
    return {
      id: `kn:nahj:${l.id}:${p.id}`, kind: "kn-nahj", lang: ed, title: l.title, body: cut(clean(s.e), 420), bullets: s.r.slice(0, 2), eyebrow: `${kt.nahj} · ${p.ref}`,
      subject: "hadith", href: `/nahj-studies/lesson/${l.id}`, cta: "ctaNahj", source: p.credit || kt.nahj, sourceUrl: "",
    };
  }).filter((x): x is KnowItem => !!x));
};

const BUILD: Record<Exclude<KnowKind, "kn-exam" | "kn-moment">, Builder> = {
  "kn-course": courses, "kn-names": names, "kn-tadabbur": tadabbur, "kn-faculty": madrasa, "kn-adab": adab, "kn-next": next, "kn-tajweed": tajweed,
  "kn-maqam": maqam, "kn-arabic-word": arabicWord, "kn-grammar": grammar, "kn-abrahamic": abrahamic, "kn-haramain": haramain, "kn-nahj": nahj,
};
/** lists that change with the learner's progress are rebuilt (next steps); the rest is cached per language */
const VOLATILE = new Set<KnowKind>(["kn-next"]);
const cache = new Map<string, KnowItem[]>();

/** the full list of a kind in this language (cached like the pages; "your next step" is rebuilt) */
async function listOf(kind: Exclude<KnowKind, "kn-exam" | "kn-moment">, lang: string, kt: KnowText): Promise<KnowItem[]> {
  const ck = `${kind}|${lang}`;
  let all = VOLATILE.has(kind) ? undefined : cache.get(ck);
  if (!all) {
    all = shuffleBy(await BUILD[kind](lang, kt), hash(`${kind}:${day()}`));
    if (!VOLATILE.has(kind)) cache.set(ck, all);
  }
  return all;
}

/**
 * One knowledge post for a reference of the server corpus (/api/feed/page, see the website's src/lib/feed/types.ts
 * FeedRef): name {i, v}, quiz {q}, course {c, l} or {kit, l}, maqasid {s, f?}, mutashabihat {g, keys}. Built from the
 * app's own content like every other knowledge post; null when the item is unknown here or hidden (tradition, Nahj).
 * Never throws.
 */
export async function knowledgeByRef(kind: string, ref: Record<string, unknown>, lang: string, kt: KnowText): Promise<KnowItem | null> {
  try {
    const find = async (k: Exclude<KnowKind, "kn-exam" | "kn-moment">, id: string) => (knowVisible(k) ? (await listOf(k, lang, kt)).find((x) => x.id === id) ?? null : null);
    switch (kind) {
      case "quiz": {
        const q = typeof ref.q === "string" ? questionById(ref.q) : undefined;
        return q ? examItem(q, lang, kt) : null;
      }
      case "course":
        if (ref.kit === "abrahamic" || ref.kit === "haramain") return find(ref.kit === "abrahamic" ? "kn-abrahamic" : "kn-haramain", `kn:kn-${ref.kit}:${String(ref.l)}`);
        return find("kn-course", `kn:course:${String(ref.c)}:${String(ref.l)}`);
      case "maqasid":
        return find("kn-tadabbur", ref.f !== undefined ? `kn:tadabbur:${Number(ref.s)}:${Number(ref.f)}` : `kn:tadabbur:${Number(ref.s)}`);
      case "name": {
        const i = Number(ref.i);
        const base = Number.isInteger(i) ? await find("kn-names", `kn:names:${i}`) : null;
        if (!base) return null;
        if (ref.v === "verse") {
          // the same name with its next place in the Quran (only when there is a second one)
          const second = nameRefs(await nameList(lang), i)[1];
          return second ? { ...base, id: `kn:names:${i}:verse`, verse: second } : null;
        }
        if (ref.v === "quiz") {
          const list = await nameList(lang);
          const others = shuffleBy(list.map((n, k) => ({ n, k })).filter((x) => x.k !== i && x.n.meaning && x.n.meaning !== list[i]?.meaning), hash(`name-quiz:${i}`)).slice(0, 3);
          if (others.length < 3 || !list[i]?.meaning) return null;
          const order = shuffleBy([0, 1, 2, 3], hash(`name-order:${i}`));
          const opts = [list[i].meaning, ...others.map((x) => x.n.meaning)];
          return {
            ...base, id: `kn:names:${i}:quiz`, title: courseText(lang, "nameQ"), body: "", verse: undefined, eyebrow: `${base.eyebrow ?? ""} · ${list[i].latin}`,
            quiz: { options: order.map((k) => opts[k]), answer: order.indexOf(0), explain: `${list[i].latin}: ${list[i].meaning}`, level: 1 },
          };
        }
        return base;
      }
      case "mutashabihat": {
        const g = MUT_GROUPS.find((x) => x.id === ref.g);
        if (!g) return null;
        const cl = cl3(lang);
        return {
          id: `kn:mut:${g.id}`, kind: "kn-tadabbur", lang, title: g.topic[cl] || g.topic.en, body: "", bullets: g.keys.map((k) => `Quran ${k}`),
          eyebrow: `${S2_TEXT[cl].mutTitle} · ${g.keys.join(" · ")}`, subject: "quran", href: "/shams/mutashabihat", cta: "ctaShams", verse: g.keys[0],
          review: true, source: `${BRAND} · Shams 2.0`, sourceUrl: "",
        };
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

const momentCursor = new Map<string, string | null>();
/**
 * One page of a knowledge kind (PAGE items). Order: a fixed shuffle per day (the word of the day is the first word of
 * page 0), [] past the end (the library then starts again at page 0). Exam questions are drawn adaptively around the
 * learner's rating in each subject on every page. Never throws.
 */
export async function knowledgeFeedItems(kind: KnowKind, lang: string, page: number, kt: KnowText): Promise<KnowItem[]> {
  try {
    if (!knowVisible(kind)) return [];
    if (kind === "kn-exam") {
      if (page > 40) return [];
      allQuestions();
      let pool = poolOf({});
      if (!pool.length) pool = poolOf({ free: true });
      return drawAdaptive(pool, PAGE).map((q) => examItem(q, lang, kt));
    }
    if (kind === "kn-moment") {
      const key = lang;
      if (page === 0) momentCursor.delete(key);
      if (page > 0 && !momentCursor.get(key)) return [];
      const r = await sijillApi.moments({ scope: "friends", locale: lang, before: page ? momentCursor.get(key) ?? undefined : undefined });
      momentCursor.set(key, r.more);
      return r.moments.filter((m) => !m.own).map((m): KnowItem => ({
        id: `kn:moment:${m.id}`, kind: "kn-moment", lang, title: m.author.name, body: m.title ?? "", eyebrow: kt.moment, subject: "quran",
        href: "/talents/friends", cta: "ctaMoment", moment: m, source: BRAND, sourceUrl: "",
      }));
    }
    const all = await listOf(kind, lang, kt);
    return all.slice(page * PAGE, page * PAGE + PAGE);
  } catch {
    return [];
  }
}
