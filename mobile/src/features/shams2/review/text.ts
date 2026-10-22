import { useCallback } from "react";
import { useLang } from "@/i18n";

// Texts of Shams 3.0 package 5 (smarter review): today's minutes and the verse strip in the wird, the tathbīt block,
// the mastery card (six dimensions) and the mutashābihāt additions (spoken mode, due groups, automatic candidates).
// English, German and Arabic here; the other eleven languages in ./i18n/<lang>.json (polite form of address in every
// language). Missing keys fall back to English. The website keeps the same texts in src/lib/learn/shams2/review/.
const en = {
  // wird: today's minutes
  todayTitle: "Today I have …", todayMin: "{n} min", todayAsSet: "As set", todayNote: "Only for today; tomorrow your usual {n} minutes apply again.",
  // wird: verse strip
  stripShow: "Rate verse by verse", stripHide: "Hide verses", stripHint: "Tap a verse to rate it, or the line between two verses for the transition.",
  v_ok: "Held", v_hesitant: "Hesitated", v_weak: "Shaky", gapOk: "Transition held", gapMiss: "Transition stalled", gapLabel: "Transition {a} → {b}", verseLabel: "Verse {v}",
  // wird: tathbīt block
  tathbitMeta: "{n} items · about {m} min, at most 15 % of today", tathbitEmpty: "Nothing to consolidate today: no weak words, shaky transitions or due similar verses.",
  t_spot: "{n} weak words", t_fading: "Recall is fading", t_lapses: "Slipped several times", t_link: "Transition {a} → {b}", t_mut: "Similar verses", t_mutSpot: "Confused with a similar verse", practise: "Practise",
  why_transition: "transition into this verse stalls",
  // quality: mastery
  mTitle: "Six sides of mastery", mLead: "Each side has its own source and is never mixed into one number.", mFor: "Shown for: {x}", mOverall: "all verses",
  d_hifz: "Memory", d_words: "Words heard", d_links: "Transitions", d_understand: "Understanding", d_tajweed: "Pronunciation and tajwīd", d_similar: "Similar verses",
  src_memory: "from your reviews", src_wordCheck: "word check: words heard, not pronunciation", src_links: "transitions marked in the wird and in tests", src_quiz: "comprehension questions", src_teacher: "teacher's rating", src_self: "your own rating", src_mut: "mutashābihāt trainer",
  srcN: "{src} · {n} verses", noData: "No data yet – how to measure it:",
  how_hifz: "Rate your verses in the wird or in a Shams session.", how_words: "Use the word check in Talaqqī or in the weak-spot practice.", how_links: "Mark transitions in the wird (tap the line between two verses) or take a weekly test.", how_understand: "Answer the comprehension question in the classic Shams path.", how_tajweed: "Rate yourself after comparing with the reciter, or ask a teacher to rate you.", how_similar: "Practise in the mutashābihāt trainer.",
  go: "Go there",
  // mutashābihāt
  modeTap: "Choose", modeSpeak: "Recite", qSpeak: "Continue after the shared beginning: {ref}", qSpeakNoCue: "Recite {ref} from memory",
  spokenHeard: "{n} of {total} differing words heard (speech recognition, words only)", spokenRate: "Did you recite the right wording?", rightWording: "Right wording", confused: "Confused", showVerse: "Show the verse",
  dueTitle: "Due for review", dueLead: "{n} groups: confused more often than right, last practised more than 14 days ago, or never practised yet.", dueStart: "Practise due groups",
  candTitle: "Found automatically, not reviewed", candLead: "Pairs with very similar wording, found by comparing the words of all verses. Not checked by a scholar.", candSim: "{p} % similar", candTopic: "Automatically found pair (not reviewed)", candMine: "In your hifz", candAll: "All pairs", candMore: "Show more",
};
export type RvKey = keyof typeof en;
type T = Record<RvKey, string>;

const de: T = {
  todayTitle: "Heute habe ich …", todayMin: "{n} Min.", todayAsSet: "Wie eingestellt", todayNote: "Nur für heute; morgen gelten wieder Ihre üblichen {n} Minuten.",
  stripShow: "Verse einzeln bewerten", stripHide: "Verse ausblenden", stripHint: "Tippen Sie auf einen Vers, um ihn zu bewerten, oder auf den Strich zwischen zwei Versen für den Übergang.",
  v_ok: "Sitzt", v_hesitant: "Gezögert", v_weak: "Wackelt", gapOk: "Übergang sitzt", gapMiss: "Übergang gestockt", gapLabel: "Übergang {a} → {b}", verseLabel: "Vers {v}",
  tathbitMeta: "{n} Punkte · etwa {m} Min., höchstens 15 % von heute", tathbitEmpty: "Heute gibt es nichts zu festigen: keine schwachen Wörter, keine wackeligen Übergänge, keine fälligen ähnlichen Verse.",
  t_spot: "{n} schwache Wörter", t_fading: "Das Erinnern lässt nach", t_lapses: "Mehrmals entfallen", t_link: "Übergang {a} → {b}", t_mut: "Ähnliche Verse", t_mutSpot: "Mit einem ähnlichen Vers verwechselt", practise: "Üben",
  why_transition: "Übergang in diesen Vers stockt",
  mTitle: "Sechs Seiten der Meisterschaft", mLead: "Jede Seite hat ihre eigene Quelle und wird nie zu einer einzigen Zahl vermischt.", mFor: "Angezeigt für: {x}", mOverall: "alle Verse",
  d_hifz: "Gedächtnis", d_words: "Gehörte Wörter", d_links: "Übergänge", d_understand: "Verständnis", d_tajweed: "Aussprache und Tadschwid", d_similar: "Ähnliche Verse",
  src_memory: "aus Ihren Wiederholungen", src_wordCheck: "Wortprüfung: gehörte Wörter, keine Aussprache", src_links: "im Wird und in Prüfungen markierte Übergänge", src_quiz: "Verständnisfragen", src_teacher: "Bewertung durch einen Lehrer", src_self: "Ihre eigene Bewertung", src_mut: "Mutašābihāt-Training",
  srcN: "{src} · {n} Verse", noData: "Noch keine Daten – so messen Sie es:",
  how_hifz: "Bewerten Sie Ihre Verse im Wird oder in einer Shams-Sitzung.", how_words: "Nutzen Sie die Wortprüfung in Talaqqī oder beim Üben der Schwachstellen.", how_links: "Markieren Sie Übergänge im Wird (Strich zwischen zwei Versen antippen) oder legen Sie eine Wochenprüfung ab.", how_understand: "Beantworten Sie die Verständnisfrage im klassischen Shams-Weg.", how_tajweed: "Bewerten Sie sich nach dem Vergleich mit dem Rezitator selbst, oder lassen Sie sich von einem Lehrer bewerten.", how_similar: "Üben Sie im Mutašābihāt-Training.",
  go: "Dorthin",
  modeTap: "Auswählen", modeSpeak: "Rezitieren", qSpeak: "Fahren Sie nach dem gemeinsamen Anfang fort: {ref}", qSpeakNoCue: "Rezitieren Sie {ref} aus dem Gedächtnis",
  spokenHeard: "{n} von {total} abweichenden Wörtern gehört (Spracherkennung, nur Wörter)", spokenRate: "Haben Sie den richtigen Wortlaut rezitiert?", rightWording: "Richtiger Wortlaut", confused: "Verwechselt", showVerse: "Vers zeigen",
  dueTitle: "Fällig zur Wiederholung", dueLead: "{n} Gruppen: öfter verwechselt als richtig, zuletzt vor mehr als 14 Tagen geübt oder noch nie geübt.", dueStart: "Fällige Gruppen üben",
  candTitle: "Automatisch gefunden, ungeprüft", candLead: "Verspaare mit sehr ähnlichem Wortlaut, gefunden durch einen Vergleich der Wörter aller Verse. Nicht von einem Gelehrten geprüft.", candSim: "{p} % ähnlich", candTopic: "Automatisch gefundenes Paar (ungeprüft)", candMine: "In Ihrem Hifz", candAll: "Alle Paare", candMore: "Mehr zeigen",
};

const ar: T = {
  todayTitle: "لديّ اليوم …", todayMin: "{n} د", todayAsSet: "كما في الإعدادات", todayNote: "لليوم فقط؛ وغدًا تعود دقائقكم المعتادة ({n}).",
  stripShow: "تقييم الآيات آيةً آية", stripHide: "إخفاء الآيات", stripHint: "المسوا آيةً لتقييمها، أو الخطَّ بين آيتين لتقييم الانتقال.",
  v_ok: "ثابتة", v_hesitant: "تردّدتُ", v_weak: "مهتزّة", gapOk: "الانتقال ثابت", gapMiss: "تعثّر الانتقال", gapLabel: "الانتقال {a} ← {b}", verseLabel: "الآية {v}",
  tathbitMeta: "{n} عناصر · نحو {m} د، وبحدّ أقصى 15 ٪ من اليوم", tathbitEmpty: "لا شيء للتثبيت اليوم: لا كلمات ضعيفة ولا انتقالات مهتزّة ولا متشابهات مستحقّة.",
  t_spot: "{n} كلمات ضعيفة", t_fading: "الاستذكار يضعف", t_lapses: "نُسيت مرّات", t_link: "الانتقال {a} ← {b}", t_mut: "آيات متشابهة", t_mutSpot: "اختلطت بآية متشابهة", practise: "تدرّبوا",
  why_transition: "يتعثّر الانتقال إلى هذه الآية",
  mTitle: "ستّة جوانب للإتقان", mLead: "لكل جانب مصدره الخاص، ولا تُدمج الجوانب في رقم واحد.", mFor: "معروض لـ: {x}", mOverall: "جميع الآيات",
  d_hifz: "الحفظ", d_words: "الكلمات المسموعة", d_links: "الانتقالات", d_understand: "الفهم", d_tajweed: "النطق والتجويد", d_similar: "المتشابهات",
  src_memory: "من مراجعاتكم", src_wordCheck: "فحص الكلمات: كلمات مسموعة، لا حكم على النطق", src_links: "انتقالات مُعلَّمة في الورد والاختبارات", src_quiz: "أسئلة الفهم", src_teacher: "تقييم المعلّم", src_self: "تقييمكم الذاتي", src_mut: "تدريب المتشابهات",
  srcN: "{src} · {n} آيات", noData: "لا بيانات بعد – هكذا تقيسونه:",
  how_hifz: "قيّموا آياتكم في الورد أو في جلسة شمس.", how_words: "استخدموا فحص الكلمات في التلقّي أو في تدريب مواطن الضعف.", how_links: "علّموا الانتقالات في الورد (المسوا الخط بين آيتين) أو أدّوا الاختبار الأسبوعي.", how_understand: "سؤال الفهم غير متاح بعد في الواجهة العربية (لا توجد ترجمة للمقارنة)؛ تأمّلوا معنى الآية في خطوة التفسير.", how_tajweed: "قيّموا أنفسكم بعد المقارنة بالقارئ، أو اطلبوا تقييم معلّم.", how_similar: "تدرّبوا في تدريب المتشابهات.",
  go: "انتقلوا إليه",
  modeTap: "اختيار", modeSpeak: "تلاوة", qSpeak: "أكملوا بعد البداية المشتركة: {ref}", qSpeakNoCue: "اتلوا {ref} من الحفظ",
  spokenHeard: "سُمعت {n} من {total} كلمات مختلفة (التعرّف على الكلام، الكلمات فقط)", spokenRate: "هل تلوتم اللفظ الصحيح؟", rightWording: "اللفظ الصحيح", confused: "اختلط عليّ", showVerse: "إظهار الآية",
  dueTitle: "مستحقّة للمراجعة", dueLead: "{n} مجموعات: الخلط فيها أكثر من الصواب، أو آخر تدريب قبل أكثر من 14 يومًا، أو لم تُتدرَّب بعد.", dueStart: "تدرّبوا على المستحقّ",
  candTitle: "عُثر عليها آليًّا، غير مُراجَعة", candLead: "أزواج آيات متقاربة اللفظ جدًّا، وُجدت بمقارنة كلمات جميع الآيات. لم يراجعها عالم.", candSim: "تشابه {p} ٪", candTopic: "زوج عُثر عليه آليًّا (غير مُراجَع)", candMine: "في محفوظكم", candAll: "جميع الأزواج", candMore: "عرض المزيد",
};

/* eslint-disable @typescript-eslint/no-require-imports */
const LOAD: Record<string, () => Partial<T>> = {
  tr: () => require("./i18n/tr.json"), ur: () => require("./i18n/ur.json"), fa: () => require("./i18n/fa.json"), ps: () => require("./i18n/ps.json"),
  fr: () => require("./i18n/fr.json"), es: () => require("./i18n/es.json"), id: () => require("./i18n/id.json"), ms: () => require("./i18n/ms.json"),
  bn: () => require("./i18n/bn.json"), ru: () => require("./i18n/ru.json"), zh: () => require("./i18n/zh.json"),
};
/* eslint-enable @typescript-eslint/no-require-imports */

const cache = new Map<string, T>();
export function reviewText(lang: string): T {
  if (lang === "de") return de;
  if (lang === "ar") return ar;
  if (lang === "en" || !LOAD[lang]) return en;
  let d = cache.get(lang);
  if (!d) {
    let tr: Partial<T> = {};
    try { tr = LOAD[lang]() ?? {}; } catch { tr = {}; }
    d = { ...en, ...tr };
    cache.set(lang, d);
  }
  return d;
}
export type Rv = (k: RvKey, p?: Record<string, string | number>) => string;
/** the texts of this package in the app language */
export function useRv(): Rv {
  const { lang } = useLang();
  const d = reviewText(lang);
  return useCallback((k, p) => { const v = d[k] ?? en[k] ?? k; return p ? v.replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : v; }, [d]);
}
export const EN_TEXTS = en;
