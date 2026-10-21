// SEO texts of the card trainer, the Hifz tracker and the tests (server-safe: plain objects, no hooks).
// de, en, ar written in the polite form; every other locale falls back to English.
import type { DeckId } from "@/lib/learn/srs/decks";
import type { TestKind } from "@/lib/learn/srs/gate";

type M = { title: string; description: string };
export type SrsPage = "cards" | "review" | "deck" | "hifz" | "tests" | "test" | "certificate";
const T: Record<"en" | "de" | "ar", Record<SrsPage, M>> = {
  en: {
    cards: { title: "Review cards with spaced repetition | Quran Masterclass", description: "Quran words, verses, names of Allah, tajweed rules and duas, each shown again just before you would forget it (FSRS). With a 7-day forecast and your own cards from saved verses. Free." },
    review: { title: "Review round | Quran Masterclass", description: "Turn the card, then rate it: Again, Hard, Good or Easy." },
    deck: { title: "{deck} – review cards | Quran Masterclass", description: "A preview of the deck “{deck}” and a review round with spaced repetition." },
    hifz: { title: "Hifz tracker: how well you know each surah and juz | Quran Masterclass", description: "A map of all 30 juz and 114 surahs, coloured by the verses you review and how well you remember them today." },
    tests: { title: "Quran tests and exams: placement, weekly, juz and surah | Quran Masterclass", description: "A placement test, a weekly test, vocabulary exams and exams for every juz and surah with verses from the Quran. Free on the website." },
    test: { title: "{test} | Quran Masterclass", description: "A test of Quran Masterclass under fair exam rules: time limits, no going back, verses from the Quran." },
    certificate: { title: "App certificates | Quran Masterclass", description: "Your app certificates for passed juz exams and the verifiable certificate." },
  },
  de: {
    cards: { title: "Karten wiederholen mit verteilter Wiederholung | Quran Masterclass", description: "Quranwörter, Verse, Namen Allahs, Tajwid-Regeln und Duas, jeweils kurz bevor Sie sie vergessen würden (FSRS). Mit 7-Tage-Vorschau und eigenen Karten aus gespeicherten Versen. Kostenlos." },
    review: { title: "Wiederholungsrunde | Quran Masterclass", description: "Drehen Sie die Karte um und bewerten Sie sie: Nochmal, Schwer, Gut oder Leicht." },
    deck: { title: "{deck} – Karten wiederholen | Quran Masterclass", description: "Eine Vorschau des Stapels „{deck}“ und eine Wiederholungsrunde mit verteilter Wiederholung." },
    hifz: { title: "Hifz-Übersicht: wie gut Sie jede Sure und jeden Juz kennen | Quran Masterclass", description: "Eine Karte aller 30 Juz und 114 Suren, gefärbt nach den Versen, die Sie wiederholen, und wie gut Sie sie heute erinnern." },
    tests: { title: "Quran-Tests und Prüfungen: Einstufung, Woche, Juz und Sure | Quran Masterclass", description: "Ein Einstufungstest, ein Wochentest, Wortschatz-Prüfungen und Prüfungen für jeden Juz und jede Sure mit Versen aus dem Quran. Kostenlos auf der Website." },
    test: { title: "{test} | Quran Masterclass", description: "Ein Test von Quran Masterclass nach fairen Prüfungsregeln: Zeitlimits, kein Zurück, Verse aus dem Quran." },
    certificate: { title: "App-Zertifikate | Quran Masterclass", description: "Ihre App-Zertifikate für bestandene Juz-Prüfungen und das überprüfbare Zertifikat." },
  },
  ar: {
    cards: { title: "مراجعة البطاقات بالتكرار المتباعد | Quran Masterclass", description: "كلمات قرآنية وآيات وأسماء الله وأحكام التجويد وأدعية، تعود إليكم قبيل أن تنسوها (FSRS). مع توقع لسبعة أيام وبطاقاتكم الخاصة من الآيات المحفوظة. مجانًا." },
    review: { title: "جولة مراجعة | Quran Masterclass", description: "اقلبوا البطاقة ثم قيّموها: مرة أخرى، صعب، جيد أو سهل." },
    deck: { title: "{deck} – مراجعة البطاقات | Quran Masterclass", description: "معاينة لمجموعة «{deck}» وجولة مراجعة بالتكرار المتباعد." },
    hifz: { title: "متابعة الحفظ: مدى إتقانكم لكل سورة وجزء | Quran Masterclass", description: "خريطة للأجزاء الثلاثين والسور المئة والأربع عشرة، ملوّنة بحسب الآيات التي تراجعونها ومدى تذكّركم لها اليوم." },
    tests: { title: "اختبارات القرآن: تحديد المستوى والأسبوع والجزء والسورة | Quran Masterclass", description: "اختبار تحديد المستوى، واختبار أسبوعي، واختبارات المفردات، واختبارات لكل جزء وسورة بآيات من القرآن. مجانًا على الموقع." },
    test: { title: "{test} | Quran Masterclass", description: "اختبار من Quran Masterclass بقواعد امتحان عادلة: حدود زمنية، دون رجوع، وآيات من القرآن." },
    certificate: { title: "شهادات التطبيق | Quran Masterclass", description: "شهاداتكم في التطبيق لاختبارات الأجزاء الناجحة والشهادة القابلة للتحقق." },
  },
};
const DECK: Record<string, { en: string; de: string; ar: string }> = {
  juzamma: { en: "Juz ʿAmma vocabulary", de: "Wortschatz Juz ʿAmma", ar: "مفردات جزء عمّ" },
  vocab: { en: "Quran vocabulary", de: "Quran-Wortschatz", ar: "مفردات القرآن" },
  names: { en: "Names of Allah", de: "Namen Allahs", ar: "أسماء الله الحسنى" },
  tajweed: { en: "Tajweed rules", de: "Tajwid-Regeln", ar: "أحكام التجويد" },
  duas: { en: "Duas from the Quran", de: "Duas aus dem Quran", ar: "أدعية من القرآن" },
  mine: { en: "My cards", de: "Meine Karten", ar: "بطاقاتي" },
};
const TEST: Record<string, { en: string; de: string; ar: string }> = {
  placement: { en: "Placement test", de: "Einstufungstest", ar: "اختبار تحديد المستوى" },
  weekly: { en: "Weekly test", de: "Wochentest", ar: "الاختبار الأسبوعي" },
  juz: { en: "Juz exams", de: "Juz-Prüfungen", ar: "اختبارات الأجزاء" },
  surah: { en: "Surah exams", de: "Suren-Prüfungen", ar: "اختبارات السور" },
  vocab: { en: "Vocabulary exams", de: "Wortschatz-Prüfungen", ar: "اختبارات المفردات" },
};
const L = (locale: string): "en" | "de" | "ar" => (locale === "de" || locale === "ar" ? locale : "en");

export function srsMeta(locale: string, page: SrsPage, arg?: string): M {
  const l = L(locale);
  const m = T[l][page];
  const name = page === "deck" ? DECK[arg ?? ""]?.[l] : page === "test" ? TEST[arg ?? ""]?.[l] : undefined;
  if (!name) return m;
  return { title: m.title.replaceAll(page === "deck" ? "{deck}" : "{test}", name), description: m.description.replaceAll("{deck}", name) };
}

// route helpers for the server pages (no client code here)
export const DECK_ROUTE_IDS: DeckId[] = ["juzamma", "vocab", "names", "tajweed", "duas", "mine"];
export const isDeck = (d: string | undefined): d is DeckId => !!d && (DECK_ROUTE_IDS as string[]).includes(d);
export const TEST_KINDS: TestKind[] = ["placement", "weekly", "juz", "surah", "vocab"];
export const isTestKind = (k: string | undefined): k is TestKind => !!k && (TEST_KINDS as string[]).includes(k);
export const VOCAB_TEST_DECKS = ["juzamma", "vocab", "names"] as const;
/** the ref of a test as the app reads it: juz 1–30 (default 30), surah 1–114 (default 1), a vocabulary deck */
export function normalRef(kind: TestKind, ref: string | undefined): string {
  const n = Number(ref);
  if (kind === "juz") return String(Number.isInteger(n) && n >= 1 && n <= 30 ? n : 30);
  if (kind === "surah") return String(Number.isInteger(n) && n >= 1 && n <= 114 ? n : 1);
  if (kind === "vocab") return (VOCAB_TEST_DECKS as readonly string[]).includes(ref ?? "") ? String(ref) : "juzamma";
  return "";
}
