"use client";
// A few website-only texts of the Arabic language course (everything else comes from useLT() in
// @/lib/learn/arabic-lang/texts). en, de, ar written in the polite form; other languages fall back to English.
import { formatWeb, useLang } from "@/lib/learn/i18n";

const en = {
  back: "Arabic course", backPath: "Language course", lessonsLbl: "lessons done", certsLbl: "certificates", daysLbl: "days in a row",
  levels: "The path, level by level", levelsLead: "Seventeen units from A1 to C1. Each lesson opens when the one before it is done; every unit ends with a unit test, and the last test of a level leads to its certificate.",
  lvl_A1: "Beginner", lvl_A2: "Elementary", lvl_B1: "Intermediate", lvl_B2: "Upper intermediate", lvl_C1: "Advanced",
  levelUnits: "Units {a}–{b}", certAfter: "Certificate after the test of unit {n}", earned: "Earned",
  showLessons: "Show lessons", hideLessons: "Hide lessons", test: "Unit test", examRules: "Exam rules",
  loading: "Loading the lesson…", freqError: "The Quran word list could not be loaded. Please check your connection and try again.", tryAgain: "Try again",
  notFound: "This lesson does not exist.", copied: "Copied to the clipboard", certsLead: "Your certificates of this course on this device. With an account, the final unit tests of each level also give a verifiable certificate.",
  conjForm: "Form", conjLabel: "Person", rootsCount: "{n} words",
};
type W = typeof en;
const de: W = {
  back: "Arabischkurs", backPath: "Sprachkurs", lessonsLbl: "Lektionen geschafft", certsLbl: "Zertifikate", daysLbl: "Tage in Folge",
  levels: "Der Weg, Stufe für Stufe", levelsLead: "Siebzehn Einheiten von A1 bis C1. Jede Lektion öffnet sich, wenn die vorige geschafft ist; jede Einheit endet mit einem Einheitentest, und der letzte Test einer Stufe führt zu ihrem Zertifikat.",
  lvl_A1: "Anfänger", lvl_A2: "Grundstufe", lvl_B1: "Mittelstufe", lvl_B2: "Obere Mittelstufe", lvl_C1: "Fortgeschritten",
  levelUnits: "Einheiten {a}–{b}", certAfter: "Zertifikat nach dem Test von Einheit {n}", earned: "Erreicht",
  showLessons: "Lektionen zeigen", hideLessons: "Lektionen ausblenden", test: "Einheitentest", examRules: "Prüfungsregeln",
  loading: "Die Lektion wird geladen…", freqError: "Die Liste der Koranwörter konnte nicht geladen werden. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.", tryAgain: "Erneut versuchen",
  notFound: "Diese Lektion gibt es nicht.", copied: "In die Zwischenablage kopiert", certsLead: "Ihre Zertifikate dieses Kurses auf diesem Gerät. Mit einem Konto ergeben die Abschlusstests jeder Stufe zusätzlich ein überprüfbares Zertifikat.",
  conjForm: "Form", conjLabel: "Person", rootsCount: "{n} Wörter",
};
const ar: W = {
  back: "دورة العربية", backPath: "دورة اللغة", lessonsLbl: "دروس مكتملة", certsLbl: "شهادات", daysLbl: "أيام متتالية",
  levels: "الطريق مستوى بعد مستوى", levelsLead: "سبع عشرة وحدة من A1 إلى C1. يُفتح كل درس بعد إتمام الدرس الذي قبله، وتنتهي كل وحدة باختبار، ويؤدي آخر اختبار في كل مستوى إلى شهادته.",
  lvl_A1: "مبتدئ", lvl_A2: "أساسي", lvl_B1: "متوسط", lvl_B2: "فوق المتوسط", lvl_C1: "متقدم",
  levelUnits: "الوحدات {a}–{b}", certAfter: "الشهادة بعد اختبار الوحدة {n}", earned: "حُصّلت",
  showLessons: "عرض الدروس", hideLessons: "إخفاء الدروس", test: "اختبار الوحدة", examRules: "قواعد الاختبار",
  loading: "جارٍ تحميل الدرس…", freqError: "تعذّر تحميل قائمة كلمات القرآن. يُرجى التحقق من الاتصال والمحاولة مرة أخرى.", tryAgain: "حاول مرة أخرى",
  notFound: "هذا الدرس غير موجود.", copied: "نُسخ إلى الحافظة", certsLead: "شهاداتك في هذه الدورة على هذا الجهاز. ومع حساب، تمنح الاختبارات الختامية لكل مستوى شهادة قابلة للتحقق أيضًا.",
  conjForm: "الصيغة", conjLabel: "الضمير", rootsCount: "{n} كلمات",
};
const TABLE: Record<string, W> = { en, de, ar };
export type WKey = keyof W;

export function useLW() {
  const { lang } = useLang();
  const t = TABLE[lang] ?? en;
  return (k: WKey, p?: Record<string, string | number>) => formatWeb(t[k], p);
}
