// SEO texts of the Reciter Path pages (server-safe). German, English and Arabic; other languages use English.
// Further languages: meta.i18n.json next to this file (see ../seoI18n.ts), English for every key they lack.
import I18N from "./meta.i18n.json";
import { seoOver, seoString } from "@/components/learn/seoI18n";
type M = { title: string; description: string };
type Page = "home" | "unit" | "exam" | "teacher";
const T: Record<"en" | "de" | "ar", Record<Page, M>> = {
  en: {
    home: { title: "Reciter Path – ten levels of tajweed and recitation | Quran Masterclass", description: "Become a reciter step by step: ten levels from the makharij to maqamat, qira'at and whole surahs, with model recitation, your own recordings, tests and certificates. Free on the website." },
    unit: { title: "{t} – Reciter Path | Quran Masterclass", description: "Explanation, examples from the Quran with model recitation, practice with your own recording, a self-check and a unit test." },
    exam: { title: "Level exam {n} – Reciter Path | Quran Masterclass", description: "The level exam of the Reciter Path with time limits and a verifiable certificate for signed-in learners." },
    teacher: { title: "Find a teacher for ijazah – Reciter Path | Quran Masterclass", description: "An ijazah is given personally by a qualified teacher with a chain of transmission. How to find a teacher." },
  },
  de: {
    home: { title: "Rezitationspfad – zehn Stufen Tadschwid und Rezitation | Quran Masterclass", description: "Schritt für Schritt zur Rezitation: zehn Stufen von den Makharidsch über Maqamat und Qiraʾat bis zu ganzen Suren, mit Vorbild-Rezitation, eigenen Aufnahmen, Tests und Zertifikaten. Kostenlos auf der Website." },
    unit: { title: "{t} – Rezitationspfad | Quran Masterclass", description: "Erklärung, Beispiele aus dem Quran mit Vorbild-Rezitation, Üben mit eigener Aufnahme, Selbstkontrolle und Test der Einheit." },
    exam: { title: "Stufenprüfung {n} – Rezitationspfad | Quran Masterclass", description: "Die Stufenprüfung des Rezitationspfads mit Zeitlimits und einem überprüfbaren Zertifikat für angemeldete Lernende." },
    teacher: { title: "Eine Lehrkraft für die Idschaza finden | Quran Masterclass", description: "Eine Idschaza erteilt eine qualifizierte Lehrkraft mit Überlieferungskette persönlich. So finden Sie eine Lehrkraft." },
  },
  ar: {
    home: { title: "مسار القارئ – عشرة مستويات في التجويد والتلاوة | Quran Masterclass", description: "كن قارئًا خطوة بخطوة: عشرة مستويات من المخارج إلى المقامات والقراءات والسور الكاملة، مع تلاوة نموذجية وتسجيلاتك واختبارات وشهادات. مجانًا على الموقع." },
    unit: { title: "{t} – مسار القارئ | Quran Masterclass", description: "شرح وأمثلة من القرآن بتلاوة نموذجية، وتدريب بتسجيل صوتك، وتقييم ذاتي واختبار الوحدة." },
    exam: { title: "اختبار المستوى {n} – مسار القارئ | Quran Masterclass", description: "اختبار مستوى مسار القارئ بوقت محدد وشهادة قابلة للتحقق للمسجّلين." },
    teacher: { title: "البحث عن معلّم للإجازة | Quran Masterclass", description: "الإجازة يمنحها معلّم مؤهل بسند متصل. كيف تجد معلّمًا." },
  },
};
export function rpMeta(locale: string, page: Page, v: { t?: string; n?: number } = {}): M {
  const own = locale === "de" || locale === "ar" ? null : seoOver(T.en, I18N, locale);
  const m = (own ?? T[locale === "de" || locale === "ar" ? locale : "en"])[page];
  return { title: m.title.replace("{t}", v.t ?? "").replace("{n}", String(v.n ?? "")), description: m.description };
}
/** the word before a level number in a unit title ("Level 3 · …"), in this locale */
export const LEVEL_WORD: Record<"en" | "de" | "ar", string> = { en: "Level", de: "Stufe", ar: "المستوى" };
export function rpLevelWord(locale: string): string {
  if (locale === "de" || locale === "ar") return LEVEL_WORD[locale];
  return seoString(I18N, locale, "levelWord") ?? LEVEL_WORD.en;
}
