// SEO texts of the Arabic language course (/arabic/lang). Server-safe: plain objects, no hooks.
// de, en, ar written; every other locale falls back to English.
// The unit content is read directly (not through curriculum.ts, which pulls in the client-only verse loader).
// Further languages: meta.i18n.json next to this file ({ "<lang>": { home, certificate, roots, lesson, testTitle } }
// with the lesson as templates "{title}" / "{unit}" / "{level}", see ../seoI18n.ts), English for every key they lack.
import I18N from "./meta.i18n.json";
import { seoFill, seoOver, seoString } from "@/components/learn/seoI18n";
import { UNITS_A } from "@/lib/learn/arabic-lang/content1";
import { UNITS_B } from "@/lib/learn/arabic-lang/content2";
import { UNITS_C } from "@/lib/learn/arabic-lang/content3";
import { tx } from "@/lib/learn/arabic-lang/types";

const UNITS = [...UNITS_A, ...UNITS_B, ...UNITS_C];
const TEST_TITLE = { en: "Unit test {n}", de: "Einheitentest {n}", ar: "اختبار الوحدة {n}" };

type Meta = { title: string; description: string };
type Page = "home" | "certificate" | "roots";
const T: Record<"de" | "en" | "ar", Record<Page, Meta> & { lesson: (title: string, unit: number, level: string) => Meta }> = {
  en: {
    home: {
      title: "Understand Arabic: language course A1 to C1 | Quran Masterclass",
      description: "Learn Quranic and Modern Standard Arabic from your first sentence to reading verses with understanding: seventeen units from A1 to C1, grammar, roots, dialogues, the 500 most frequent Quran words, unit tests and certificates. Free.",
    },
    certificate: { title: "Certificates of the Arabic language course | Quran Masterclass", description: "Your certificates A1, A2, B1, B2 and C1 of the Arabic language course, with the verifiable certificate of each level." },
    roots: { title: "Arabic root explorer: word families of the Quran | Quran Masterclass", description: "Enter an Arabic root and see its family of words from the Quran vocabulary, each with an example verse." },
    lesson: (title, unit, level) => ({ title: `${title} (unit ${unit}, ${level}) | Quran Masterclass`, description: `A lesson of unit ${unit} (${level}) of the Arabic language course "Understand Arabic", with explanation and exercises.` }),
  },
  de: {
    home: {
      title: "Arabisch verstehen: Sprachkurs A1 bis C1 | Quran Masterclass",
      description: "Lernen Sie koranisches und modernes Hocharabisch vom ersten Satz bis zum verstehenden Lesen der Verse: siebzehn Einheiten von A1 bis C1, Grammatik, Wurzeln, Dialoge, die 500 häufigsten Koranwörter, Einheitentests und Zertifikate. Kostenlos.",
    },
    certificate: { title: "Zertifikate des Arabisch-Sprachkurses | Quran Masterclass", description: "Ihre Zertifikate A1, A2, B1, B2 und C1 des Arabisch-Sprachkurses, mit dem überprüfbaren Zertifikat jeder Stufe." },
    roots: { title: "Arabischer Wurzel-Explorer: Wortfamilien des Korans | Quran Masterclass", description: "Geben Sie eine arabische Wurzel ein und sehen Sie ihre Wortfamilie aus dem Koranwortschatz, jeweils mit einem Beispielvers." },
    lesson: (title, unit, level) => ({ title: `${title} (Einheit ${unit}, ${level}) | Quran Masterclass`, description: `Eine Lektion der Einheit ${unit} (${level}) des Sprachkurses „Arabisch verstehen“, mit Erklärung und Übungen.` }),
  },
  ar: {
    home: {
      title: "افهم العربية: دورة اللغة من A1 إلى C1 | Quran Masterclass",
      description: "تعلّم العربية القرآنية والفصحى المعاصرة من جملتك الأولى إلى قراءة الآيات بفهم: سبع عشرة وحدة من A1 إلى C1، نحو وجذور وحوارات وأكثر ٥٠٠ كلمة ورودًا في القرآن، واختبارات وشهادات. مجانًا.",
    },
    certificate: { title: "شهادات دورة اللغة العربية | Quran Masterclass", description: "شهاداتك A1 وA2 وB1 وB2 وC1 في دورة اللغة العربية، مع الشهادة القابلة للتحقق لكل مستوى." },
    roots: { title: "مستكشف الجذور العربية: أسر كلمات القرآن | Quran Masterclass", description: "أدخل جذرًا عربيًا وشاهد أسرة كلماته من مفردات القرآن، مع آية مثال لكل كلمة." },
    lesson: (title, unit, level) => ({ title: `${title} (الوحدة ${unit}، ${level}) | Quran Masterclass`, description: `درس من الوحدة ${unit} (${level}) في دورة «افهم العربية»، مع الشرح والتمارين.` }),
  },
};
const pickLang = (locale: string): "de" | "en" | "ar" => (locale === "de" || locale === "ar" ? locale : "en");

export function langMeta(locale: string, page: Page): Meta {
  if (pickLang(locale) === "en") { const x = seoOver({ home: T.en.home, certificate: T.en.certificate, roots: T.en.roots }, I18N, locale); if (x) return x[page]; }
  return T[pickLang(locale)][page];
}
/** the lesson meta in this locale: the written tables for de/en/ar, the templates of meta.i18n.json for the others */
function lessonIn(locale: string, title: string, unit: number, level: string): Meta {
  const lang = pickLang(locale);
  const m = T[lang].lesson(title, unit, level);
  if (lang !== "en") return m;
  const v = { title, unit, level };
  const t = seoString(I18N, locale, "lesson", "title"), d = seoString(I18N, locale, "lesson", "description");
  return { title: t ? seoFill(t, v) : m.title, description: d ? seoFill(d, v) : m.description };
}
/** title and description of one lesson id (null for an unknown id) */
export function langLessonMeta(locale: string, id: string): Meta | null {
  const lang = pickLang(locale);
  const test = /^u(\d+)-test$/.exec(id);
  if (test) {
    const u = UNITS.find((x) => x.n === Number(test[1]));
    const testTitle = (lang === "en" ? seoString(I18N, locale, "testTitle") : undefined) ?? TEST_TITLE[lang];
    return u ? lessonIn(locale, testTitle.replace("{n}", String(u.n)), u.n, u.level) : null;
  }
  const u = UNITS.find((x) => x.lessons.some((l) => l.id === id));
  const l = u?.lessons.find((x) => x.id === id);
  if (!l || !u) return null;
  return lessonIn(locale, tx(l.title, locale), u.n, u.level);
}
