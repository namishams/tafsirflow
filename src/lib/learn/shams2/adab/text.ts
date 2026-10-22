// mirrors mobile/src/features/shams2/adab/text.ts – the pillar "Adab des Qurʾān-Trägers", interface texts. English,
// German (Sie-form) and Arabic here (the same tables as the app); the other eleven languages are the app's files, copied
// to ./i18n/<lang>.json and loaded the first time a language is used. Missing keys fall back to English. The content
// (./data.ts) is German and English; every other language reads the English content.
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useLang } from "@/lib/learn/i18n";

const en = {
  name: "Adab of the Qurʾān carrier",
  pageLead: "The fifth pillar of the Shams Method: the reciter lives what they recite. Daily sunnah etiquette with its status and its sources.",
  pillarKicker: "Pillar of the Shams Method",
  pillars: "Listening, reciting, understanding, memorising – and adab.",
  pillarBody: "Whoever wants to become a reciter of the Qurʾān lives the Qurʾān. This is part of the Shams Method and not optional: listening, reciting, understanding and memorising only become whole through lived adab. Understanding of the Qurʾān grows by living it.",
  pillarClassic: "The classical scholars – al-Nawawī in al-Tibyān, al-Ājurrī in Akhlāq Ḥamalat al-Qurʾān, al-Ghazālī in the Iḥyāʾ – made adab the mark of the true carrier of the Qurʾān.",
  pillarHonest: "This does not mean your recitation is invalid or forbidden while something is not yet working for you. Every sunnah stays a sunnah; none is declared a duty. The app does not judge your private life: no score, no ranking.",
  methodLine: "Adab of the Qurʾān carrier: the reciter lives what they recite – purity, the sunnah of the day, halal earnings and character. Understanding grows by living the Qurʾān.",
  tileLead: "The fifth pillar: daily sunnah etiquette, honest status, sources.",
  open: "Open the pillar",
  todayKicker: "Adab of the day",
  doneToday: "Done today",
  doneTodayOn: "Done today – may Allah accept it",
  privacy: "Stored only on this device. No score, no ranking.",
  topics: "Topics",
  status: "Status",
  sources: "Sources",
  jafari: "Jaʿfarī",
  sisters: "For sisters: the rulings for women on this",
  related: "Practise it",
  notFatwa: "Overview, not a fatwa – please ask a scholar you trust about individual questions.",
  review: "Content is being reviewed by scholars",
  showText: "Show the text",
  hideText: "Hide the text",
  loading: "Loading …",
  offline: "The text could not be loaded. Please try again later.",
  openReader: "Open in the reader",
  openSource: "Open the source",
  translationNote: "Content in English and German; your language follows.",
  classicLink: "Part of every Shams path: the adab of the Qurʾān carrier.",
  st_fard: "Obligatory (farḍ)", st_wajib: "Obligatory (wājib)", st_sunnah: "Sunnah", st_mustahabb: "Recommended (mustaḥabb)",
  st_adab: "Adab (etiquette)", st_makruh: "Disliked (makrūh)", st_haram: "Forbidden (ḥarām)",
};
type T = Record<keyof typeof en, string>;
const de: T = {
  name: "Adab des Qurʾān-Trägers",
  pageLead: "Die fünfte Säule der Shams-Methode: Der Rezitator lebt, was er rezitiert. Tägliche Sunna-Etikette mit ihrem Status und ihren Quellen.",
  pillarKicker: "Säule der Shams-Methode",
  pillars: "Hören, Rezitieren, Verstehen, Auswendiglernen – und Adab.",
  pillarBody: "Wer Rezitator des Qurʾān werden will, lebt den Qurʾān. Das ist Teil der Shams-Methode und keine Kür: Hören, Rezitieren, Verstehen und Auswendiglernen werden erst durch gelebtes Adab vollständig. Das Verständnis des Qurʾān wächst, indem man ihn lebt.",
  pillarClassic: "Die klassischen Gelehrten – al-Nawawī im Tibyān, al-Ājurrī in Akhlāq Ḥamalat al-Qurʾān, al-Ghazālī im Iḥyāʾ – machten das Adab zum Kennzeichen des wahren Qurʾān-Trägers.",
  pillarHonest: "Das heißt nicht, dass Ihre Rezitation ungültig oder verboten ist, solange Ihnen etwas noch nicht gelingt. Jede Sunna bleibt Sunna, keine wird zur Pflicht erklärt. Die App beurteilt Ihr Privatleben nicht: kein Punktestand, keine Rangliste.",
  methodLine: "Adab des Qurʾān-Trägers: Der Rezitator lebt, was er rezitiert – Reinheit, die Sunna des Tages, halal Verdienst und Charakter. Verständnis wächst, indem man den Qurʾān lebt.",
  tileLead: "Die fünfte Säule: tägliche Sunna-Etikette, ehrlicher Status, Quellen.",
  open: "Zur Säule",
  todayKicker: "Adab des Tages",
  doneToday: "Heute umgesetzt",
  doneTodayOn: "Heute umgesetzt – möge Allah es annehmen",
  privacy: "Nur auf diesem Gerät gespeichert. Kein Punktestand, keine Rangliste.",
  topics: "Themen",
  status: "Status",
  sources: "Quellen",
  jafari: "Jaʿfarī",
  sisters: "Für Schwestern: die Regeln für Frauen dazu",
  related: "Dazu üben",
  notFatwa: "Überblick, keine Fatwa – fragen Sie bei Einzelfragen einen Gelehrten Ihres Vertrauens.",
  review: "Inhalt wird von Gelehrten geprüft",
  showText: "Text anzeigen",
  hideText: "Text ausblenden",
  loading: "Wird geladen …",
  offline: "Der Text konnte nicht geladen werden. Bitte versuchen Sie es später erneut.",
  openReader: "Im Leser öffnen",
  openSource: "Quelle öffnen",
  translationNote: "Inhalt auf Deutsch und Englisch; Ihre Sprache folgt.",
  classicLink: "Teil jedes Shams-Wegs: das Adab des Qurʾān-Trägers.",
  st_fard: "Pflicht (farḍ)", st_wajib: "Pflicht (wājib)", st_sunnah: "Sunna", st_mustahabb: "Empfohlen (mustaḥabb)",
  st_adab: "Adab (Etikette)", st_makruh: "Missbilligt (makrūh)", st_haram: "Verboten (ḥarām)",
};
const ar: T = {
  name: "آداب حامل القرآن",
  pageLead: "الركن الخامس في منهج شمس: القارئ يعيش ما يقرأ. آداب السنة اليومية مع حكمها ومصادرها.",
  pillarKicker: "ركن من أركان منهج شمس",
  pillars: "الاستماع والتلاوة والفهم والحفظ – والأدب.",
  pillarBody: "من أراد أن يكون قارئًا للقرآن عاش القرآن. هذا جزء من منهج شمس وليس أمرًا اختياريًا: الاستماع والتلاوة والفهم والحفظ لا تكتمل إلا بالأدب المعاش. ويزداد فهم القرآن بالعمل به.",
  pillarClassic: "جعل العلماء الأوائل – النووي في التبيان، والآجري في أخلاق حملة القرآن، والغزالي في الإحياء – الأدبَ علامةَ حامل القرآن الحق.",
  pillarHonest: "ولا يعني ذلك أن تلاوتكم باطلة أو محرّمة ما دام شيء لم يتيسّر لكم بعد. كل سنة تبقى سنة، ولا يُجعل شيء منها فرضًا. والتطبيق لا يحكم على حياتكم الخاصة: لا نقاط ولا ترتيب.",
  methodLine: "آداب حامل القرآن: القارئ يعيش ما يقرأ – الطهارة وسنة اليوم والكسب الحلال والخُلق. ويزداد الفهم بالعمل بالقرآن.",
  tileLead: "الركن الخامس: آداب السنة اليومية وحكمها الصادق ومصادرها.",
  open: "افتحوا الركن",
  todayKicker: "أدب اليوم",
  doneToday: "طبّقته اليوم",
  doneTodayOn: "طبّقته اليوم – تقبّل الله منكم",
  privacy: "يُحفظ على هذا الجهاز فقط. لا نقاط ولا ترتيب.",
  topics: "الموضوعات",
  status: "الحكم",
  sources: "المصادر",
  jafari: "الجعفرية",
  sisters: "للأخوات: أحكام النساء في ذلك",
  related: "للتدرّب",
  notFatwa: "نظرة عامة وليست فتوى – اسألوا عالمًا تثقون به في المسائل الخاصة.",
  review: "المحتوى قيد المراجعة من العلماء",
  showText: "اعرض النص",
  hideText: "أخفِ النص",
  loading: "جارٍ التحميل …",
  offline: "تعذّر تحميل النص. نرجو المحاولة لاحقًا.",
  openReader: "افتح في القارئ",
  openSource: "افتح المصدر",
  translationNote: "الشرح بالإنجليزية والألمانية، والعربية قادمة.",
  classicLink: "جزء من كل طريق في منهج شمس: آداب حامل القرآن.",
  st_fard: "فرض", st_wajib: "واجب", st_sunnah: "سنة", st_mustahabb: "مستحب",
  st_adab: "أدب", st_makruh: "مكروه", st_haram: "حرام",
};
export type AdabKey = keyof typeof en;

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
export function adabText(lang: string): T {
  if (lang === "de") return de;
  if (lang === "ar") return ar;
  if (!LANGS.has(lang)) return en;
  let d = cache.get(lang);
  if (!d) {
    const tr = bundles.get(lang);
    if (!tr) return en;
    d = { ...en, ...tr };
    cache.set(lang, d);
  }
  return d;
}

/** the texts in the page language (a) and the content language of ./data.ts (cl: German or English) */
export function useAdabText() {
  const { lang } = useLang();
  useEffect(() => { loadBundle(lang); }, [lang]);
  useSyncExternalStore(subscribe, () => ver, () => 0);
  const d = adabText(lang);
  const a = useCallback((k: AdabKey) => d[k] ?? en[k] ?? k, [d]);
  const cl: "de" | "en" = lang === "de" ? "de" : "en";
  return { a, cl, lang };
}
export const ADAB_EN = en;
