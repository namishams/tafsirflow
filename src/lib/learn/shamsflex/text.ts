// mirrors mobile/src/features/shams/flex/text.ts – interface texts of the flexible classic path (Shams 3.0, package 3).
// English, German and Arabic here (the app's tables, unchanged); the other eleven languages are the app's files, copied
// to ./i18n/<lang>.json and loaded the first time a language is used. Missing keys fall back to English.
import { useEffect, useSyncExternalStore } from "react";
import { useLang } from "@/lib/learn/i18n";

const en = {
  quickOffer: "I know this already",
  quickTitle: "Quick check: is this verse already secure?",
  quickLead: "Recite the verse from memory. Then reveal it and say honestly whether it was right.",
  quickPlacement: "Several verses were already secure, so this verse starts with the quick check.",
  quickReveal: "Reveal",
  quickPass: "Without a mistake",
  quickFail: "Not yet secure",
  quickPassed: "Well done. The verse comes back for review when your memory of it is expected to fade.",
  quickLearn: "Learn it step by step",
  unitOf: "Part {k} of {n}",
  unitsLead: "The verse is built up in {n} parts, divided at the pause marks.",
  shortLoop: "A short verse: listen, then repeat it in the pause – three times.",
  yourTurn: "Your turn",
  wordTap: "Tap a word to hear it on its own.",
  wordLoop: "{n}× with a pause",
  wordLoopOn: "Each tapped word plays {n} times, with a pause to repeat it.",
  rootOf: "Root {r}",
  rootCount: "{n}× in the Quran",
  rootSource: "Roots and counts: Quranic Arabic Corpus",
  nextTitle: "What comes next",
  nextLead: "The meaning of verse {v}, so that you know where the recitation leads.",
  takeaway: "The core of this passage",
  shortTitle: "In brief: what this passage is about",
  readFull: "Read the detailed tafsir",
  alwaysFull: "Always show the detailed tafsir",
  draft: "In our own words, drawn from the classical works; a draft until a scholar has reviewed it.",
  compQ: "Which meaning belongs to this verse?",
  compRight: "Correct.",
  compWrong: "Not quite – the correct meaning is marked.",
  linkQ: "How did the transition from the previous verse go?",
  linkOk: "Transition secure",
  linkMiss: "I hesitated",
  linkSaved: "Noted. Transitions that falter come back more often.",
  blindTitle: "Today's verses in one go, from memory",
  blindLead: "Recite verses {a}–{b} without the text, to check that the transitions hold.",
  blindLeadOne: "Recite verse {a} without the text.",
  blindGo: "Recite in one go",
  suggested: "Suggestion from the words heard",
};
type T = typeof en;
export type FlexKey = keyof T;

const de: T = {
  quickOffer: "Kann ich schon",
  quickTitle: "Kurz prüfen: Sitzt dieser Vers schon?",
  quickLead: "Rezitieren Sie den Vers aus dem Gedächtnis. Decken Sie ihn dann auf und sagen Sie ehrlich, ob er saß.",
  quickPlacement: "Mehrere Verse saßen schon – deshalb beginnt dieser Vers gleich mit der kurzen Prüfung.",
  quickReveal: "Aufdecken",
  quickPass: "Fehlerfrei",
  quickFail: "Noch nicht sicher",
  quickPassed: "Sehr gut. Der Vers kommt zur Wiederholung, wenn Ihr Erinnern voraussichtlich nachlässt.",
  quickLearn: "Schritt für Schritt lernen",
  unitOf: "Abschnitt {k} von {n}",
  unitsLead: "Der Vers wird in {n} Abschnitten aufgebaut, geteilt an den Pausenzeichen.",
  shortLoop: "Ein kurzer Vers: hören, in der Pause nachsprechen – dreimal.",
  yourTurn: "Jetzt Sie",
  wordTap: "Tippen Sie auf ein Wort, um es einzeln zu hören.",
  wordLoop: "{n}× mit Pause",
  wordLoopOn: "Jedes angetippte Wort erklingt {n}-mal, mit einer Pause zum Nachsprechen.",
  rootOf: "Wurzel {r}",
  rootCount: "{n}× im Koran",
  rootSource: "Wurzeln und Zählung: Quranic Arabic Corpus",
  nextTitle: "Was danach kommt",
  nextLead: "Die Bedeutung von Vers {v} – so wissen Sie beim Rezitieren, wohin es geht.",
  takeaway: "Der Kern dieses Abschnitts",
  shortTitle: "Kurz: Worum es in diesem Abschnitt geht",
  readFull: "Ausführlichen Tafsir lesen",
  alwaysFull: "Immer den ausführlichen Tafsir zeigen",
  draft: "In eigenen Worten nach den klassischen Werken; ein Entwurf, bis ein Gelehrter ihn geprüft hat.",
  compQ: "Welche Bedeutung gehört zu diesem Vers?",
  compRight: "Richtig.",
  compWrong: "Nicht ganz – die richtige Bedeutung ist markiert.",
  linkQ: "Wie war der Übergang vom vorigen Vers?",
  linkOk: "Übergang sitzt",
  linkMiss: "Gestockt",
  linkSaved: "Vermerkt. Übergänge, die stocken, kommen öfter.",
  blindTitle: "Heutige Verse am Stück aus dem Gedächtnis",
  blindLead: "Rezitieren Sie die Verse {a}–{b} ohne Text – so prüfen Sie, ob die Übergänge halten.",
  blindLeadOne: "Rezitieren Sie Vers {a} ohne Text.",
  blindGo: "Am Stück rezitieren",
  suggested: "Vorschlag nach den erkannten Wörtern",
};

const ar: T = {
  quickOffer: "أحفظها مسبقًا",
  quickTitle: "فحص سريع: هل هذه الآية ثابتة عندكم؟",
  quickLead: "اقرؤوا الآية من الذاكرة، ثم اكشفوها وقولوا بصدق هل كانت صحيحة.",
  quickPlacement: "ثبتت عدة آيات من قبل، لذلك تبدأ هذه الآية بالفحص السريع.",
  quickReveal: "اكشف",
  quickPass: "دون خطأ",
  quickFail: "ليست ثابتة بعد",
  quickPassed: "أحسنتم. تعود الآية للمراجعة حين يُتوقع أن يضعف حفظكم لها.",
  quickLearn: "التعلّم خطوة خطوة",
  unitOf: "المقطع {k} من {n}",
  unitsLead: "تُبنى الآية في {n} مقاطع مقسّمة عند علامات الوقف.",
  shortLoop: "آية قصيرة: استمعوا ثم ردّدوها في الوقفة – ثلاث مرات.",
  yourTurn: "دوركم الآن",
  wordTap: "اضغطوا على كلمة لسماعها وحدها.",
  wordLoop: "{n}× مع وقفة",
  wordLoopOn: "كل كلمة تضغطون عليها تُسمع {n} مرات مع وقفة للترديد.",
  rootOf: "الجذر {r}",
  rootCount: "{n} مرة في القرآن",
  rootSource: "الجذور والعدّ: Quranic Arabic Corpus",
  nextTitle: "ما يأتي بعدها",
  nextLead: "معنى الآية {v}، لتعرفوا أثناء التلاوة إلى أين تمضي.",
  takeaway: "خلاصة هذا المقطع",
  shortTitle: "باختصار: عمّ يتحدث هذا المقطع",
  readFull: "قراءة التفسير المفصّل",
  alwaysFull: "اعرض التفسير المفصّل دائمًا",
  draft: "بكلماتنا مستندين إلى المصادر الكلاسيكية؛ مسودة حتى يراجعها عالم.",
  compQ: "أيّ معنى يخصّ هذه الآية؟",
  compRight: "صحيح.",
  compWrong: "ليس تمامًا – المعنى الصحيح مُعلَّم.",
  linkQ: "كيف كان الانتقال من الآية السابقة؟",
  linkOk: "الانتقال ثابت",
  linkMiss: "تعثّرت",
  linkSaved: "سُجّل ذلك. الانتقالات التي يُتعثّر فيها تعود أكثر.",
  blindTitle: "آيات اليوم متتابعة من الذاكرة",
  blindLead: "اقرؤوا الآيات {a}–{b} دون نص، لتتأكدوا من ثبات الانتقالات.",
  blindLeadOne: "اقرؤوا الآية {a} دون نص.",
  blindGo: "التلاوة متتابعة",
  suggested: "اقتراح بحسب الكلمات المسموعة",
};

const OWN: Record<string, T> = { de, ar };
const LANGS = new Set(["tr", "ur", "fa", "ps", "fr", "es", "id", "ms", "bn", "ru", "zh"]);
const bundles = new Map<string, Partial<T> | null>();
const loading = new Set<string>();
const subs = new Set<() => void>();
let ver = 0;
function loadBundle(lang: string) {
  if (!LANGS.has(lang) || bundles.has(lang) || loading.has(lang)) return;
  loading.add(lang);
  import(`./i18n/${lang}.json`)
    .then((m: { default: Partial<T> }) => { bundles.set(lang, m.default); })
    .catch(() => { bundles.set(lang, null); })
    .finally(() => { loading.delete(lang); cache.delete(lang); ver++; subs.forEach((f) => f()); });
}
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

const cache = new Map<string, T>();
/** the texts in this language; English until the language file has arrived */
export function flexText(lang: string): T {
  if (OWN[lang]) return OWN[lang];
  if (lang === "en" || !LANGS.has(lang)) return en;
  let d = cache.get(lang);
  if (!d) {
    const tr = bundles.get(lang);
    if (!tr) return en;
    d = { ...en, ...tr };
    cache.set(lang, d);
  }
  return d;
}
export const fill = (s: string, p?: Record<string, string | number>) => (p ? s.replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : s);
export type Ft = (k: FlexKey, p?: Record<string, string | number>) => string;
export function useFlexT(): Ft {
  const { lang } = useLang();
  useSyncExternalStore(subscribe, () => ver, () => 0);
  useEffect(() => { loadBundle(lang); }, [lang]);
  const d = flexText(lang);
  return (k, p) => fill(d[k] ?? en[k] ?? k, p);
}
export const EN_TEXTS = en;
