"use client";
// Website-only interface strings of the course pages (the app texts come from useCT in @/lib/learn/courses/texts).
// en, de (Sie-form), ar; other languages fall back to en.
import { useCallback } from "react";
import { useLang } from "@/lib/learn/i18n";
import { fmt } from "@/lib/learn/courses/texts";

const en = {
  coursesDone: "Courses completed", lessonsDone: "Lessons passed", allCourses: "All courses", completed: "Completed",
  loading: "Loading …", loadFailed: "This could not be loaded. Please check the connection and try again.", tryAgain: "Try again",
  tajweed: "Tajweed", best: "Best result: {p} %", namesNote: "The meanings come from the Names of Allah chapter in the library.",
  stickersLead: "Each completed course adds its badge here.", noStickers: "No course completed yet.", openCourse: "Open the course",
  lessonOf: "Lesson {n} of {m}", courseOf: "Course {n}", vocabTrainer: "Vocabulary trainer",
};
type W = typeof en;
const de: W = {
  coursesDone: "Kurse abgeschlossen", lessonsDone: "Lektionen bestanden", allCourses: "Alle Kurse", completed: "Abgeschlossen",
  loading: "Wird geladen …", loadFailed: "Das konnte nicht geladen werden. Bitte prüfen Sie die Verbindung und versuchen Sie es erneut.", tryAgain: "Erneut versuchen",
  tajweed: "Tajweed", best: "Bestes Ergebnis: {p} %", namesNote: "Die Bedeutungen stammen aus dem Kapitel zu den Namen Allahs in der Bibliothek.",
  stickersLead: "Jeder abgeschlossene Kurs fügt hier sein Abzeichen hinzu.", noStickers: "Noch kein Kurs abgeschlossen.", openCourse: "Kurs öffnen",
  lessonOf: "Lektion {n} von {m}", courseOf: "Kurs {n}", vocabTrainer: "Vokabeltrainer",
};
const ar: W = {
  coursesDone: "دورات مكتملة", lessonsDone: "دروس ناجحة", allCourses: "كل الدورات", completed: "مكتملة",
  loading: "جارٍ التحميل …", loadFailed: "تعذّر التحميل. يرجى التحقق من الاتصال والمحاولة مرة أخرى.", tryAgain: "حاول مرة أخرى",
  tajweed: "التجويد", best: "أفضل نتيجة: {p} %", namesNote: "المعاني مأخوذة من فصل أسماء الله في المكتبة.",
  stickersLead: "كل دورة تكملها تضيف شارتها هنا.", noStickers: "لم تكتمل أي دورة بعد.", openCourse: "افتح الدورة",
  lessonOf: "الدرس {n} من {m}", courseOf: "الدورة {n}", vocabTrainer: "مدرّب المفردات",
};
const TABLE: Record<string, W> = { en, de, ar };
export function useWT() {
  const { lang } = useLang();
  return useCallback((k: keyof W, p?: Record<string, string | number>) => fmt((TABLE[lang] ?? en)[k] ?? en[k], p), [lang]);
}
