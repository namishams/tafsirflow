// mirrors mobile/src/features/qaida/texts.ts (copied for the website; keep both in step)
import { useLang } from "@/lib/learn/i18n";
import { moduleText } from "@/lib/learn/i18n";

// Interface texts of the reading course (module "qaida"; the other twelve languages in src/i18n/app/<lang>.json).
// Always the polite form of address. Stage explanations live in curriculum.ts.
const en = {
  kicker: "Qaida method", title: "Read the Quran in Arabic", lead: "From the first letter to fluent reading in the whole mushaf: twenty stages in the order of the Quran schools, with real Quran words, recordings and an on-device reading check.",
  start: "Start", continue: "Continue", stage: "Stage {n}", lessonsDone: "{d} of {n} lessons", placed: "Placed by the test", locked: "Finish the previous stage first", free: "Free",
  placement: "Placement test", placementLead: "Can you already read? Twelve short questions show which stages you can skip.",
  goal: "Daily goal", goalN: "{n} per day", today: "Today: {d} of {n} lessons", goalMet: "Daily goal reached", streak: "{n} days in a row",
  review: "Review", reviewLead: "Your hardest letters and words come back until they sit. Words also go to your card trainer.", reviewEmpty: "Nothing to review yet. Mistakes from your lessons appear here.",
  unlockKicker: "Stages 1–3 complete", unlockTitle: "You can read all the letters. Now read the Quran.", unlockLead: "With Pro you continue with vowels, tanwin, madd, sukun, shadda, the signs of the mushaf and real verses, up to reading Juz ʿAmma with word-by-word highlighting.", unlockCta: "Unlock with Pro",
  unlockList1: "Seventeen more stages, from harakat to Juz 28, al-Kahf and timed challenges", unlockList2: "Reading check on your device", unlockList3: "Speed drills and mini-tests",
  learn: "New", lesson: "Lesson {n}", test: "Mini-test", juzSurah: "Surah {n}",
  listenTap: "Listen and tap what you hear", which: "Which one is “{x}”?", called: "What is this letter called?", whichLetter: "Which letter is this?",
  matchTitle: "Find the pairs", matchForms: "Match each form to its letter", hearWord: "Listen and pick the word",
  build: "Build the word", buildHint: "Drag the letters up into the row or tap them. The first letter goes on the right.", buildVerse: "Put the words in order", buildVerseHint: "Drag or tap the words. The first word goes on the right.", emptyRow: "Your word appears here", reset: "Reset",
  read: "Read aloud", readLead: "Read aloud. Recognition on this device shows which words were heard. It does not judge tajweed.", startCheck: "Start reading", stopCheck: "Finish", heard: "{n} of {total} words heard", unavailable: "On-device recognition for Arabic is not available on this device. Read aloud anyway and continue.", skip: "Skip",
  speed: "Speed drill", speedLead: "Read the row aloud from right to left, clearly and as fast as you can. Tap Done at the end.", go: "Start", stop: "Done", seconds: "{s} s", best: "Best: {s} s", target: "Goal: under {s} s", fast: "Within your goal", slow: "Try again a little faster",
  check: "Check", next: "Continue", right: "Correct", wrong: "Not quite. Correct is:", listen: "Listen", meaning: "Meaning", formsLbl: "Start · middle · end", asIn: "as in",
  complete: "Lesson complete", almost: "Almost there", needPass: "From {p} % the next lesson opens. Your mistakes come back on purpose.", score: "{p} % correct on the first try", retry: "Practise again", toMap: "Back to the path", nextLesson: "Next lesson", quit: "Quit",
  loading: "Loading Quran words…", offline: "The Quran words could not be loaded. Please check your connection.", tryAgain: "Try again",
  playAll: "Listen to the surah", pause: "Pause", checkVerse: "Check my reading", verseN: "Verse {n}", markRead: "I have read this surah", surahDone: "Read", juzLead: "Tap a surah. Listen with highlighting, then read each verse yourself.",
  cardLead: "Learn to read Arabic from zero: letters, vowels, signs, then real verses.", stars: "{n} of 3 stars",
};
type T = typeof en;
const de: T = {
  kicker: "Qaida-Methode", title: "Den Koran auf Arabisch lesen", lead: "Vom ersten Buchstaben bis zum flüssigen Lesen im ganzen Mushaf: zwanzig Stufen in der Reihenfolge der Koranschulen, mit echten Koranwörtern, Aufnahmen und einer Leseprüfung auf dem Gerät.",
  start: "Beginnen", continue: "Weiter", stage: "Stufe {n}", lessonsDone: "{d} von {n} Lektionen", placed: "Per Einstufungstest übersprungen", locked: "Schließen Sie zuerst die vorige Stufe ab", free: "Kostenlos",
  placement: "Einstufungstest", placementLead: "Sie können schon lesen? Zwölf kurze Fragen zeigen, welche Stufen Sie überspringen können.",
  goal: "Tagesziel", goalN: "{n} pro Tag", today: "Heute: {d} von {n} Lektionen", goalMet: "Tagesziel erreicht", streak: "{n} Tage in Folge",
  review: "Wiederholung", reviewLead: "Ihre schwierigsten Buchstaben und Wörter kommen zurück, bis sie sitzen. Wörter landen auch in Ihrem Kartentrainer.", reviewEmpty: "Noch nichts zu wiederholen. Fehler aus Ihren Lektionen erscheinen hier.",
  unlockKicker: "Stufen 1–3 geschafft", unlockTitle: "Sie können alle Buchstaben lesen. Jetzt lesen Sie den Koran.", unlockLead: "Mit Pro geht es weiter mit Vokalen, Tanwin, Madd, Sukun, Schadda, den Zeichen des Mushaf und echten Versen, bis Sie Juz ʿAmma mit Wort-für-Wort-Markierung lesen.", unlockCta: "Mit Pro freischalten",
  unlockList1: "Siebzehn weitere Stufen, von den Harakat bis Juz 28, al-Kahf und Lese-Challenges", unlockList2: "Leseprüfung auf Ihrem Gerät", unlockList3: "Tempoübungen und Mini-Tests",
  learn: "Neu", lesson: "Lektion {n}", test: "Mini-Test", juzSurah: "Sure {n}",
  listenTap: "Hören Sie zu und tippen Sie, was Sie hören", which: "Welches ist „{x}“?", called: "Wie heißt dieser Buchstabe?", whichLetter: "Welcher Buchstabe ist das?",
  matchTitle: "Finden Sie die Paare", matchForms: "Ordnen Sie jede Form ihrem Buchstaben zu", hearWord: "Hören Sie zu und wählen Sie das Wort",
  build: "Bauen Sie das Wort", buildHint: "Ziehen Sie die Buchstaben nach oben in die Zeile oder tippen Sie sie an. Der erste Buchstabe steht rechts.", buildVerse: "Bringen Sie die Wörter in die richtige Reihenfolge", buildVerseHint: "Ziehen oder tippen Sie die Wörter. Das erste Wort steht rechts.", emptyRow: "Hier entsteht Ihr Wort", reset: "Zurücksetzen",
  read: "Laut lesen", readLead: "Lesen Sie laut. Die Erkennung auf diesem Gerät zeigt, welche Wörter gehört wurden. Sie bewertet kein Tadschwid.", startCheck: "Lesen beginnen", stopCheck: "Beenden", heard: "{n} von {total} Wörtern gehört", unavailable: "Die Erkennung für Arabisch ist auf diesem Gerät nicht verfügbar. Lesen Sie trotzdem laut und fahren Sie fort.", skip: "Überspringen",
  speed: "Tempoübung", speedLead: "Lesen Sie die Reihe laut von rechts nach links, deutlich und so schnell Sie können. Tippen Sie am Ende auf Fertig.", go: "Los", stop: "Fertig", seconds: "{s} s", best: "Bestzeit: {s} s", target: "Ziel: unter {s} s", fast: "Im Ziel", slow: "Versuchen Sie es etwas schneller",
  check: "Prüfen", next: "Weiter", right: "Richtig", wrong: "Nicht ganz. Richtig ist:", listen: "Anhören", meaning: "Bedeutung", formsLbl: "Anfang · Mitte · Ende", asIn: "wie in",
  complete: "Lektion geschafft", almost: "Fast geschafft", needPass: "Ab {p} % öffnet sich die nächste Lektion. Ihre Fehler kommen gezielt zurück.", score: "{p} % beim ersten Versuch richtig", retry: "Nochmal üben", toMap: "Zurück zum Pfad", nextLesson: "Nächste Lektion", quit: "Beenden",
  loading: "Koranwörter werden geladen…", offline: "Die Koranwörter konnten nicht geladen werden. Bitte prüfen Sie Ihre Verbindung.", tryAgain: "Erneut versuchen",
  playAll: "Sure anhören", pause: "Pause", checkVerse: "Mein Lesen prüfen", verseN: "Vers {n}", markRead: "Ich habe diese Sure gelesen", surahDone: "Gelesen", juzLead: "Tippen Sie auf eine Sure. Hören Sie mit Markierung zu und lesen Sie dann jeden Vers selbst.",
  cardLead: "Arabisch lesen von null: Buchstaben, Vokale, Zeichen, dann echte Verse.", stars: "{n} von 3 Sternen",
};

export type QKey = keyof T;
export function useQT() {
  const { lang } = useLang();
  const d = moduleText("qaida", { en, de }, lang);
  return (k: QKey, p?: Record<string, string | number>) => (p ? d[k].replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : d[k]);
}
export const QAIDA_EN = en;
