"use client";
// A few website-only texts of the reading course (everything else comes from useQT() in @/lib/learn/qaida/texts).
// en, de, ar written in the polite form; other languages fall back to English.
import { useLang } from "@/lib/learn/i18n";
import { formatWeb } from "@/lib/learn/i18n";

const en = {
  back: "Arabic course", stagesDone: "stages complete", starsLbl: "stars", daysLbl: "days in a row", path: "The path", pathLead: "Twenty stages, one after the other. Tap a stage to see its lessons.",
  close: "Close", ofLessons: "{d} of {n} lessons passed", dropHere: "Drop here", verseRead: "Verse {n} read: {p} %",
};
type W = typeof en;
const de: W = {
  back: "Arabischkurs", stagesDone: "Stufen geschafft", starsLbl: "Sterne", daysLbl: "Tage in Folge", path: "Der Weg", pathLead: "Zwanzig Stufen, eine nach der anderen. Tippen Sie auf eine Stufe, um ihre Lektionen zu sehen.",
  close: "Schließen", ofLessons: "{d} von {n} Lektionen bestanden", dropHere: "Hier ablegen", verseRead: "Vers {n} gelesen: {p} %",
};
const ar: W = {
  back: "دورة العربية", stagesDone: "مراحل مكتملة", starsLbl: "نجوم", daysLbl: "أيام متتالية", path: "الطريق", pathLead: "عشرون مرحلة، واحدة بعد الأخرى. اضغط على مرحلة لترى دروسها.",
  close: "إغلاق", ofLessons: "{d} من {n} دروس ناجحة", dropHere: "ضعها هنا", verseRead: "قُرئت الآية {n}: {p} %",
};
const TABLE: Record<string, W> = { en, de, ar };

export function useQW() {
  const { lang } = useLang();
  const t = TABLE[lang] ?? en;
  return (k: keyof W, p?: Record<string, string | number>) => formatWeb(t[k], p);
}
