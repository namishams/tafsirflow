import { useLang } from "@/i18n";
import { formatWeb } from "@/i18n/web";
import { moduleText } from "@/i18n/app";

// App-only texts of the courses (everything else comes from the website). German uses the Sie-form, like the website.
const S = {
  de: {
    proEyebrow: "Quran Masterclass Pro",
    arabicProTitle: "Den ganzen Koran lesen lernen",
    arabicProText: "Die ersten {n} Lektionen sind kostenlos. Mit Pro lernen Sie alle {total} Lektionen: Buchstabenformen, Vokale, Koranwörter, echte Rezitation und ganze Verse.",
    tajweedProTitle: "Der ganze Tajweed-Kurs",
    tajweedProText: "Die ersten {n} Lektionen sind kostenlos. Mit Pro lernen Sie alle {total} Regeln – mit Beispielen aus dem Koran und einem Quiz in jeder Lektion.",
    vocabLimitTitle: "Das waren Ihre {n} Wörter für heute",
    vocabLimitText: "Kostenlos üben Sie {n} Wörter am Tag. Mit Pro üben Sie so viele, wie Sie möchten – jeden Stapel, jeden Tag. Morgen geht es kostenlos weiter.",
    vocabLeft: "Heute noch {n} von {total} kostenlosen Wörtern",
    lessonLocked: "Diese Lektion gehört zu Pro",
    proLabel: "Pro",
    notFound: "Diese Lektion gibt es nicht.",
    toOverview: "Zur Übersicht",
    best: "Bestes Ergebnis: {pct} %",
  },
  en: {
    proEyebrow: "Quran Masterclass Pro",
    arabicProTitle: "Learn to read the whole Quran",
    arabicProText: "The first {n} lessons are free. With Pro you learn all {total} lessons: letter forms, vowels, Quran words, real recitation and whole verses.",
    tajweedProTitle: "The complete tajweed course",
    tajweedProText: "The first {n} lessons are free. With Pro you learn all {total} rules – with examples from the Quran and a quiz in every lesson.",
    vocabLimitTitle: "That was your {n} words for today",
    vocabLimitText: "The free version has {n} words a day. With Pro you practise as many as you like – every deck, every day. Tomorrow you can carry on for free.",
    vocabLeft: "{n} of {total} free words left today",
    lessonLocked: "This lesson is part of Pro",
    proLabel: "Pro",
    notFound: "This lesson does not exist.",
    toOverview: "Back to the overview",
    best: "Best result: {pct}%",
  },
};
export type CourseKey = keyof (typeof S)["en"];

export function useCourseT() {
  const { lang } = useLang();
  return (key: CourseKey, params?: Record<string, string | number>) => formatWeb(moduleText("coursekit", S, lang)[key] ?? S.en[key], params);
}
