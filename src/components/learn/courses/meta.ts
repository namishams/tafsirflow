// SEO titles and descriptions of the course routes (server-safe; de, en, ar written, other locales use en).
// Further languages: meta.i18n.json next to this file ({ "<lang>": { home, tajweed, vocab, deck, lessonWord, nameWord } },
// titles without the suffix, see ../seoI18n.ts), English for every key they lack.
import I18N from "./meta.i18n.json";
import { seoOver, seoString } from "@/components/learn/seoI18n";
type M = { title: string; description: string };
type Key = "home" | "tajweed" | "vocab" | "deck";
const SFX = " | Quran Masterclass";
const T: Record<"en" | "de" | "ar", Record<Key, M>> = {
  en: {
    home: { title: "Academy courses: Seerah, aqidah, fiqh, the 99 Names and more", description: "Twelve structured courses with lessons, Quran verses, hadith references and quizzes: Seerah, the prophets, tafsir and hadith sciences, aqidah, fiqh, ethics, adhkar, the Names of Allah, Ramadan, Hajj and tajweed. Free." },
    tajweed: { title: "Tajweed practice: find the rule in real verses", description: "Practise the tajweed rules on real places in the Quran: find the rule, a quiz per surah and an in-depth tajweed course. Free." },
    vocab: { title: "Quran vocabulary decks by surah and by theme", description: "Flashcards and quizzes for the words of any surah, taken straight from the Quran text, plus theme decks by word type and root family. Free." },
    deck: { title: "Vocabulary deck", description: "Flashcards and a quiz for the words of this deck." },
  },
  de: {
    home: { title: "Akademie-Kurse: Sira, Aqida, Fiqh, die 99 Namen und mehr", description: "Zwölf strukturierte Kurse mit Lektionen, Koranversen, Hadith-Belegen und Quiz: Sira, Propheten, Tafsir- und Hadithwissenschaften, Aqida, Fiqh, Ethik, Adhkar, die Namen Allahs, Ramadan, Hadsch und Tajweed. Kostenlos." },
    tajweed: { title: "Tajweed-Übung: die Regel in echten Versen finden", description: "Üben Sie die Tajweed-Regeln an echten Stellen im Koran: Regel finden, Quiz pro Sure und ein vertiefender Tajweed-Kurs. Kostenlos." },
    vocab: { title: "Koran-Vokabelstapel nach Sure und Thema", description: "Karteikarten und Quiz zu den Wörtern jeder Sure, direkt aus dem Korantext, dazu Themenstapel nach Wortart und Wurzelfamilie. Kostenlos." },
    deck: { title: "Vokabelstapel", description: "Karteikarten und ein Quiz zu den Wörtern dieses Stapels." },
  },
  ar: {
    home: { title: "دورات الأكاديمية: السيرة والعقيدة والفقه والأسماء الحسنى وغيرها", description: "اثنتا عشرة دورة منظمة بدروس وآيات ومراجع حديثية واختبارات: السيرة، الأنبياء، علوم التفسير والحديث، العقيدة، الفقه، الأخلاق، الأذكار، أسماء الله، رمضان، الحج والتجويد. مجانًا." },
    tajweed: { title: "تدريب التجويد: اكتشف الحكم في آيات حقيقية", description: "تدرّب على أحكام التجويد في مواضع حقيقية من القرآن: اكتشف الحكم، واختبار لكل سورة، ودورة تجويد معمّقة. مجانًا." },
    vocab: { title: "بطاقات مفردات القرآن حسب السورة والموضوع", description: "بطاقات واختبارات لكلمات أي سورة مأخوذة من نص القرآن مباشرة، مع مجموعات موضوعية حسب نوع الكلمة وعائلة الجذر. مجانًا." },
    deck: { title: "مجموعة مفردات", description: "بطاقات واختبار لكلمات هذه المجموعة." },
  },
};
const lk = (locale: string) => (locale === "de" || locale === "ar" ? locale : "en");
export function metaFor(locale: string, key: Key): M {
  const x = lk(locale) === "en" ? seoOver(T.en, I18N, locale) : null;
  const m = (x ?? T[lk(locale)])[key];
  return { title: m.title + SFX, description: m.description };
}
/** "<title> | Quran Masterclass" */
export const withSuffix = (title: string) => title + SFX;
/** kicker words for lesson titles */
export const LESSON_WORD: Record<"en" | "de" | "ar", string> = { en: "Lesson", de: "Lektion", ar: "درس" };
export const lessonWord = (locale: string) => (lk(locale) === "en" ? seoString(I18N, locale, "lessonWord") : undefined) ?? LESSON_WORD[lk(locale)];
export const NAME_WORD: Record<"en" | "de" | "ar", string> = { en: "Name", de: "Name", ar: "الاسم" };
export const nameWord = (locale: string) => (lk(locale) === "en" ? seoString(I18N, locale, "nameWord") : undefined) ?? NAME_WORD[lk(locale)];
