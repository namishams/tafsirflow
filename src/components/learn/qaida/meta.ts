// SEO texts of the reading course ("Read the Quran in Arabic", /arabic/read). Server-safe: plain objects, no hooks.
// de, en, ar written; every other locale falls back to English.
// Further languages: meta.i18n.json next to this file ({ "<lang>": { home, review, lesson } } with the lesson as
// templates "{n}" / "{stage}", see ../seoI18n.ts), English for every key they lack.
import I18N from "./meta.i18n.json";
import { seoFill, seoOver, seoString } from "@/components/learn/seoI18n";
import { STAGES, lessonOf, stageOf, txOf } from "@/lib/learn/qaida/curriculum";

type Meta = { title: string; description: string };
const T: Record<"de" | "en" | "ar", { home: Meta; review: Meta; lesson: (stage: string, n: number) => Meta }> = {
  en: {
    home: {
      title: "Read the Quran in Arabic: 20-stage reading course | Quran Masterclass",
      description: "Learn to read Arabic from the first letter to the whole mushaf: twenty stages in the order of the Quran schools (Qaida), with real Quran words, word recordings, speed drills and a reading check in your browser. Free.",
    },
    review: { title: "Review of your hardest letters and words | Quran Masterclass", description: "The letters, syllables and Quran words you missed most often come back until they sit." },
    lesson: (stage, n) => ({ title: `Stage ${n}: ${stage} | Quran Masterclass`, description: `A lesson of stage ${n} (${stage}) of the reading course "Read the Quran in Arabic", with real Quran words and recordings.` }),
  },
  de: {
    home: {
      title: "Den Koran auf Arabisch lesen: Lesekurs in 20 Stufen | Quran Masterclass",
      description: "Lernen Sie Arabisch lesen, vom ersten Buchstaben bis zum ganzen Mushaf: zwanzig Stufen in der Reihenfolge der Koranschulen (Qaida), mit echten Koranwörtern, Wortaufnahmen, Tempo-Übungen und einer Leseprüfung im Browser. Kostenlos.",
    },
    review: { title: "Wiederholung Ihrer schwierigsten Buchstaben und Wörter | Quran Masterclass", description: "Die Buchstaben, Silben und Koranwörter, die Ihnen am häufigsten schwerfielen, kommen zurück, bis sie sitzen." },
    lesson: (stage, n) => ({ title: `Stufe ${n}: ${stage} | Quran Masterclass`, description: `Eine Lektion der Stufe ${n} (${stage}) des Lesekurses „Den Koran auf Arabisch lesen“, mit echten Koranwörtern und Aufnahmen.` }),
  },
  ar: {
    home: {
      title: "اقرأ القرآن بالعربية: دورة القراءة في ٢٠ مرحلة | Quran Masterclass",
      description: "تعلّم قراءة العربية من الحرف الأول حتى المصحف كاملًا: عشرون مرحلة بترتيب القاعدة في مدارس القرآن، بكلمات قرآنية حقيقية وتسجيلات صوتية وتمارين سرعة وفحص للقراءة في المتصفح. مجانًا.",
    },
    review: { title: "مراجعة أصعب الحروف والكلمات | Quran Masterclass", description: "تعود الحروف والمقاطع والكلمات القرآنية التي أخطأت فيها أكثر حتى تثبت." },
    lesson: (stage, n) => ({ title: `المرحلة ${n}: ${stage} | Quran Masterclass`, description: `درس من المرحلة ${n} (${stage}) في دورة «اقرأ القرآن بالعربية»، بكلمات قرآنية حقيقية وتسجيلات.` }),
  },
};
const pickLang = (locale: string): "de" | "en" | "ar" => (locale === "de" || locale === "ar" ? locale : "en");

export function metaFor(locale: string, page: "home" | "review"): Meta {
  if (pickLang(locale) === "en") { const x = seoOver({ home: T.en.home, review: T.en.review }, I18N, locale); if (x) return x[page]; }
  return T[pickLang(locale)][page];
}
/** title and description of one lesson id (null for an unknown id) */
export function lessonMeta(locale: string, id: string): Meta | null {
  if (id === "review") return metaFor(locale, "review");
  const s = stageOf(id);
  if (!s || !lessonOf(id)) return null;
  const lang = pickLang(locale);
  const m = T[lang].lesson(txOf(s.title, locale), s.n);
  if (lang !== "en") return m;
  const v = { stage: txOf(s.title, locale), n: s.n };
  const title = seoString(I18N, locale, "lesson", "title"), description = seoString(I18N, locale, "lesson", "description");
  return { title: title ? seoFill(title, v) : m.title, description: description ? seoFill(description, v) : m.description };
}
export const allLessonIds = () => ["review", ...STAGES.flatMap((s) => s.lessons.map((l) => l.id))];
export const STAGE_COUNT = STAGES.length;
