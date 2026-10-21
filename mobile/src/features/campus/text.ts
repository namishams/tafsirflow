import { useLang } from "@/i18n";
import { moduleText } from "@/i18n/app";

// Texts of the campus (module "campus"): the Madrasa hero on Discover and Masterclass, the faculty rails with
// progress, the "continue" rail and the study wisdom. de + en here; the other languages fall back to English until
// mobile/src/i18n/app/<lang>.json carries the module key "campus". Polite address throughout.
const en = {
  heroLead: "Four stages, four faculties and the Quran at the centre of every day, built from the courses of this app.",
  nextStep: "Your next step", allDone: "Everything in this stage is done", todayWird: "Today's wird", faculties: "Faculties · Kulliyyāt",
  enter: "Enter the Madrasa", stageN: "Stage {n}", current: "Current", done: "Completed", start: "Start", pct: "{p} %",
  continueTitle: "Continue where you left off", stageTitle: "The courses of your stage", examsTitle: "Markaz al-Imtiḥānāt · exams and records",
  growthTitle: "Garden, Sijill and Talents", heritageTitle: "Heritage and the Holy Places",
  shamsHub: "Shams Method 2.0", shamsHubD: "Sabaq, sabqī and manzil: your daily wird with grades and checks.",
  shams: "Shams Method", shamsD: "Seven steps per verse: hear, speak, understand, explain, recall, live.",
  wird: "Today's wird", wirdD: "New, recent and long-term verses for today.",
  darajat: "Darajāt al-Ḥifẓ", darajatD: "Your hifz grade, weekly and monthly checks.",
  mutashabihat: "Mutashābihāt", mutashabihatD: "Similar verses side by side, so they never mix.",
  reciterPath: "Reciter Path", reciterPathD: "Ten levels from the makhārij to whole surahs, with exams.",
  tajweed: "Tajweed", tajweedD: "The rules step by step with examples from the Quran.",
  readArabic: "Read the Quran in Arabic", readArabicD: "Letters, vowels and signs, then real verses.",
  arabicLevel: "Arabic {level}", arabicLevelD: "Grammar, roots and the most frequent Quran words.",
  vocab: "Quran vocabulary", vocabD: "The most common words of the Quran as cards.",
  cards: "Cards", cardsD: "Spaced review of words and verses.", hifz: "Hifz tracker", hifzD: "Every page you know, and what is due.",
  tests: "Tests and juz exams", testsD: "Check yourself and earn certificates.",
  hadithLib: "Hadith library", hadithLibD: "The great collections, with their sources.",
  salah: "Learn to pray", salahD: "The prayer step by step.", wudu: "Learn wudu", wuduD: "The ritual washing step by step.",
  duas: "Duas", duasD: "Supplications from the Quran and the Sunnah.",
  examsD: "Practice by subject, timed tests and mock exams for every stage.", mock: "Mock exam", mockD: "A full exam under exam conditions.",
  examStats: "Your exam statistics", examStatsD: "Accuracy by subject and stage.",
  certificatesD: "Verifiable certificates with code and QR.", reportD: "Grades from your quizzes and exams.",
  transcriptD: "Every subject with progress and grade.", timetableD: "Your week, with the Quran first every day.",
  garden: "Your garden", gardenD: "Your tree grows with every verse you learn.",
  talents: "Quran Talents", talentsD: "Reciters and learners: follow, connect, show achievements.",
  sijill: "Your Sijill", sijillD: "Your academic record, shared only if you wish.", leaderboard: "Leaderboard", leaderboardD: "Opt-in, only between friends.",
  abrahamicD: "Ibrāhīm, Mūsā, ʿĪsā and Maryam in the Quran.", haramainD: "The Kaaba, Mecca and Medina.",
  // study wisdom
  wisdomTitle: "Study wisdom", wisdomLead: "A thought for each day about learning with the Shams Method and the adab of the student of knowledge.",
  tipOfDay: "Tip of the day", cat_method: "Shams Method", cat_adab: "Adab of the student", cat_saying: "Classical saying",
  source: "Source", review: "Selection awaiting scholar review", more: "More tips",
};
type T = typeof en;

const de: T = {
  heroLead: "Vier Stufen, vier Fakultäten und der Koran jeden Tag im Mittelpunkt, aufgebaut aus den Kursen dieser App.",
  nextStep: "Ihr nächster Schritt", allDone: "In dieser Stufe ist alles erledigt", todayWird: "Ihr Wird heute", faculties: "Fakultäten · Kulliyyāt",
  enter: "Die Madrasa betreten", stageN: "Stufe {n}", current: "Aktuell", done: "Abgeschlossen", start: "Beginnen", pct: "{p} %",
  continueTitle: "Dort weitermachen, wo Sie aufgehört haben", stageTitle: "Die Kurse Ihrer Stufe", examsTitle: "Markaz al-Imtiḥānāt · Prüfungen und Zeugnisse",
  growthTitle: "Garten, Sijill und Talente", heritageTitle: "Erbe und die heiligen Stätten",
  shamsHub: "Shams-Methode 2.0", shamsHubD: "Sabaq, Sabqī und Manzil: Ihr täglicher Wird mit Graden und Prüfungen.",
  shams: "Shams-Methode", shamsD: "Sieben Schritte pro Vers: hören, sprechen, verstehen, erklären, abrufen, leben.",
  wird: "Ihr Wird heute", wirdD: "Neue, frische und langfristige Verse für heute.",
  darajat: "Darajāt al-Ḥifẓ", darajatD: "Ihr Hifz-Grad, wöchentliche und monatliche Prüfungen.",
  mutashabihat: "Mutashābihāt", mutashabihatD: "Ähnliche Verse nebeneinander, damit sie sich nie vermischen.",
  reciterPath: "Rezitatorenweg", reciterPathD: "Zehn Stufen von den Makhārij bis zu ganzen Suren, mit Prüfungen.",
  tajweed: "Tajwid", tajweedD: "Die Regeln Schritt für Schritt mit Beispielen aus dem Koran.",
  readArabic: "Den Koran auf Arabisch lesen", readArabicD: "Buchstaben, Vokale und Zeichen, dann echte Verse.",
  arabicLevel: "Arabisch {level}", arabicLevelD: "Grammatik, Wurzeln und die häufigsten Wörter des Korans.",
  vocab: "Koranwortschatz", vocabD: "Die häufigsten Wörter des Korans als Karten.",
  cards: "Karten", cardsD: "Wörter und Verse im richtigen Abstand wiederholen.", hifz: "Hifz-Übersicht", hifzD: "Jede Seite, die Sie können, und was fällig ist.",
  tests: "Tests und Juz-Prüfungen", testsD: "Sich selbst prüfen und Zertifikate erhalten.",
  hadithLib: "Hadith-Bibliothek", hadithLibD: "Die großen Sammlungen, mit ihren Quellen.",
  salah: "Beten lernen", salahD: "Das Gebet Schritt für Schritt.", wudu: "Wudu lernen", wuduD: "Die rituelle Waschung Schritt für Schritt.",
  duas: "Duas", duasD: "Bittgebete aus Koran und Sunna.",
  examsD: "Üben nach Fach, Tests mit Zeit und Probeprüfungen für jede Stufe.", mock: "Probeprüfung", mockD: "Eine vollständige Prüfung unter Prüfungsbedingungen.",
  examStats: "Ihre Prüfungsstatistik", examStatsD: "Trefferquote nach Fach und Stufe.",
  certificatesD: "Prüfbare Zertifikate mit Code und QR.", reportD: "Noten aus Ihren Quizzen und Prüfungen.",
  transcriptD: "Jedes Fach mit Fortschritt und Note.", timetableD: "Ihre Woche, jeden Tag zuerst der Koran.",
  garden: "Ihr Garten", gardenD: "Ihr Baum wächst mit jedem Vers, den Sie lernen.",
  talents: "Quran Talents", talentsD: "Rezitatoren und Lernende: folgen, verbinden, Erfolge zeigen.",
  sijill: "Ihr Sijill", sijillD: "Ihr akademischer Werdegang, nur geteilt, wenn Sie es möchten.", leaderboard: "Bestenliste", leaderboardD: "Freiwillig und nur unter Freunden.",
  abrahamicD: "Ibrāhīm, Mūsā, ʿĪsā und Maryam im Koran.", haramainD: "Die Kaaba, Mekka und Medina.",
  wisdomTitle: "Weisheit für das Lernen", wisdomLead: "Ein Gedanke für jeden Tag zum Lernen mit der Shams-Methode und zum Adab des Wissenssuchenden.",
  tipOfDay: "Tipp des Tages", cat_method: "Shams-Methode", cat_adab: "Adab des Lernenden", cat_saying: "Klassisches Wort",
  source: "Quelle", review: "Auswahl zur Prüfung durch Gelehrte vorgesehen", more: "Weitere Tipps",
};

export type CampusKey = keyof T;
export function useCampusT() {
  const { lang } = useLang();
  const d = moduleText("campus", { en, de }, lang);
  return (k: CampusKey, p?: Record<string, string | number>) => (p ? d[k].replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : d[k]);
}
