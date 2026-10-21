// SEO texts of Swipe & Learn (server-safe: plain objects, no hooks). de, en, ar in the polite form; every other locale
// falls back to English (the page itself is translated through src/lib/learn/i18n/<lang>.json "swipe").
type M = { title: string; description: string };
const T: Record<"en" | "de" | "ar", M> = {
  en: { title: "Swipe & Learn: Quran words, verses, hadith and tajweed card by card | Quran Masterclass", description: "Learning cards like a stack: read each card mindfully for 10 seconds, then swipe it to the left. Quran words, verses, hadith, tajweed, names of Allah, questions and your due review cards. Free." },
  de: { title: "Wischen & Lernen: Quranwörter, Verse, Hadithe und Tadschwid Karte für Karte | Quran Masterclass", description: "Lernkarten als Stapel: Lesen Sie jede Karte 10 Sekunden achtsam und wischen Sie sie dann nach links. Quranwörter, Verse, Hadithe, Tadschwid, Namen Allahs, Fragen und Ihre fälligen Wiederholungskarten. Kostenlos." },
  ar: { title: "اسحب وتعلّم: كلمات القرآن والآيات والأحاديث والتجويد بطاقةً بطاقة | Quran Masterclass", description: "بطاقات تعلّم في كومة: اقرؤوا كل بطاقة بتأنٍّ عشر ثوانٍ ثم اسحبوها إلى اليسار. كلمات قرآنية وآيات وأحاديث وتجويد وأسماء الله وأسئلة وبطاقات المراجعة المستحقة. مجانًا." },
};
export const swipeMeta = (locale: string): M => T[locale === "de" || locale === "ar" ? locale : "en"];
