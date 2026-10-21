// mirrors mobile/src/features/reciter-path/texts.ts (copied for the website; keep both in step)
import { useLang } from "@/lib/learn/i18n";
import { moduleText } from "@/lib/learn/i18n";

// Interface texts of the Reciter Path (module "reciterPath"; the other twelve languages in src/i18n/app/<lang>.json)
const en = {
  kicker: "Shams Method", title: "Reciter Path", lead: "Become a reciter step by step: ten levels from the makharij to maqamat, qira'at and whole surahs, with model recitation, your own recordings and tests.",
  start: "Start the path", continue: "Continue", level: "Level {n}", unit: "Unit {n}", free: "Free", locked: "Pro",
  lockedTitle: "Part of Pro", lockedLead: "The full Reciter Path with all ten levels, practice tools, tests and certificates is part of Quran Masterclass Pro.", unlock: "Unlock with Pro",
  preview: "Preview", explanation: "Explanation", examples: "Examples from the Quran", practice: "Practice", checklist: "Self-check", test: "Unit test", exam: "Level exam",
  playWord: "Play word", playVerse: "Play verse", loop: "Repeat", speed: "Speed", stop: "Stop", loading: "Loading words…", offline: "The words could not be loaded. Please check your connection.",
  record: "Record yourself", stopRec: "Stop recording", reciter: "A: Reciter", you: "B: You", ab: "A, then B", micDenied: "Microphone access was not allowed. You can allow it in the system settings.",
  visualNote: "Loudness over time, as a visual aid only. It does not judge your tajweed; listen and compare yourself.", yourVoice: "Your recording", reciterTiming: "Reciter, word timing",
  wordCheck: "Word check", wordCheckLead: "Recite the verse. Recognition on this device shows which words were heard, to check your memorisation. It is not a tajweed assessment.",
  wordCheckStart: "Start word check", wordCheckStop: "Finish", wordCheckUnavailable: "On-device word recognition for Arabic is not available on this device.", heard: "{n} of {total} words heard",
  checkSaved: "Saved for this device", tapPrompt: "Tap every word with: {rule}", check: "Check", next: "Next", finish: "Finish", correct: "Correct", wrong: "Not quite",
  result: "{score}% correct", passed: "Passed", notPassed: "Not passed yet. Review the unit and try again.", retry: "Try again", toPath: "Back to the path",
  certificate: "Certificate", certTitle: "Certificate of completion", certBody: "has completed level {n} of the Reciter Path:", certNote: "An app certificate of Quran Masterclass. It is not an ijazah.",
  certName: "Your name (optional)", shareCert: "Share certificate", examLocked: "Complete all units of this level to take the exam.",
  teacherTitle: "Find a teacher for ijazah", teacherCard: "Find a teacher", teacherLead: "An ijazah is a licence to recite and teach, given personally by a qualified teacher with a chain of transmission. An app cannot give it.",
  teacherSteps: "How to find a teacher", teacherS1: "Ask at your local mosque or Quran school for a teacher with an ijazah in the riwaya of Hafs ʿan ʿAsim.", teacherS2: "Ask the teacher about their chain (sanad) and how they teach: face to face or online, and how often.", teacherS3: "Prepare: recite al-Fatiha and Juz ʿAmma with the rules of this path; your recordings help you see your progress.", teacherS4: "Reciting the whole Quran to the teacher usually takes months or years. Be patient.",
  teacherSoon: "A directory of teachers is not part of the app yet.",
  surahVerses: "Surah {s}, verses {a}–{b}", done: "Completed", unitsDone: "{d} of {n} units", heroCard: "Become a reciter with the Shams Method",
};
type T = typeof en;

const de: T = {
  kicker: "Shams-Methode", title: "Rezitationspfad", lead: "Werden Sie Schritt für Schritt zur Rezitatorin oder zum Rezitator: zehn Stufen von den Makharidsch über Maqamat und Qiraʾat bis zu ganzen Suren, mit Vorbild-Rezitation, eigenen Aufnahmen und Tests.",
  start: "Pfad beginnen", continue: "Weiter", level: "Stufe {n}", unit: "Einheit {n}", free: "Kostenlos", locked: "Pro",
  lockedTitle: "Teil von Pro", lockedLead: "Der ganze Rezitationspfad mit allen zehn Stufen, Übungswerkzeugen, Tests und Zertifikaten gehört zu Quran Masterclass Pro.", unlock: "Mit Pro freischalten",
  preview: "Vorschau", explanation: "Erklärung", examples: "Beispiele aus dem Quran", practice: "Üben", checklist: "Selbstkontrolle", test: "Test der Einheit", exam: "Stufenprüfung",
  playWord: "Wort abspielen", playVerse: "Vers abspielen", loop: "Wiederholen", speed: "Tempo", stop: "Stopp", loading: "Wörter werden geladen…", offline: "Die Wörter konnten nicht geladen werden. Bitte prüfen Sie Ihre Verbindung.",
  record: "Sich selbst aufnehmen", stopRec: "Aufnahme beenden", reciter: "A: Rezitator", you: "B: Sie", ab: "A, dann B", micDenied: "Der Zugriff auf das Mikrofon wurde nicht erlaubt. Sie können ihn in den Systemeinstellungen erlauben.",
  visualNote: "Lautstärke im Zeitverlauf, nur als Sehhilfe. Sie bewertet Ihr Tadschwid nicht; hören und vergleichen Sie selbst.", yourVoice: "Ihre Aufnahme", reciterTiming: "Rezitator, Wortzeiten",
  wordCheck: "Wortprüfung", wordCheckLead: "Rezitieren Sie den Vers. Die Erkennung auf diesem Gerät zeigt, welche Wörter gehört wurden, um Ihr Auswendiglernen zu prüfen. Sie ist keine Tadschwid-Bewertung.",
  wordCheckStart: "Wortprüfung starten", wordCheckStop: "Beenden", wordCheckUnavailable: "Die Worterkennung für Arabisch auf dem Gerät ist hier nicht verfügbar.", heard: "{n} von {total} Wörtern gehört",
  checkSaved: "Auf diesem Gerät gespeichert", tapPrompt: "Tippen Sie jedes Wort mit: {rule}", check: "Prüfen", next: "Weiter", finish: "Abschließen", correct: "Richtig", wrong: "Noch nicht ganz",
  result: "{score} % richtig", passed: "Bestanden", notPassed: "Noch nicht bestanden. Wiederholen Sie die Einheit und versuchen Sie es erneut.", retry: "Erneut versuchen", toPath: "Zurück zum Pfad",
  certificate: "Zertifikat", certTitle: "Abschlusszertifikat", certBody: "hat Stufe {n} des Rezitationspfads abgeschlossen:", certNote: "Ein App-Zertifikat von Quran Masterclass. Es ist keine Idschaza.",
  certName: "Ihr Name (optional)", shareCert: "Zertifikat teilen", examLocked: "Schließen Sie alle Einheiten dieser Stufe ab, um die Prüfung abzulegen.",
  teacherTitle: "Eine Lehrkraft für die Idschaza finden", teacherCard: "Lehrkraft finden", teacherLead: "Eine Idschaza ist die Erlaubnis zu rezitieren und zu lehren, persönlich erteilt von einer qualifizierten Lehrkraft mit Überlieferungskette. Eine App kann sie nicht erteilen.",
  teacherSteps: "So finden Sie eine Lehrkraft", teacherS1: "Fragen Sie in Ihrer Moschee oder Quranschule nach einer Lehrkraft mit Idschaza in der Überlieferung Hafs ʿan ʿAsim.", teacherS2: "Fragen Sie nach ihrer Kette (Sanad) und wie sie unterrichtet: vor Ort oder online, und wie oft.", teacherS3: "Bereiten Sie sich vor: Rezitieren Sie al-Fatiha und Juz ʿAmma mit den Regeln dieses Pfads; Ihre Aufnahmen zeigen Ihnen Ihren Fortschritt.", teacherS4: "Den ganzen Quran der Lehrkraft vorzutragen dauert meist Monate oder Jahre. Haben Sie Geduld.",
  teacherSoon: "Ein Verzeichnis von Lehrkräften gibt es in der App noch nicht.",
  surahVerses: "Sure {s}, Verse {a}–{b}", done: "Abgeschlossen", unitsDone: "{d} von {n} Einheiten", heroCard: "Mit der Shams-Methode zum Rezitator",
};

export type RpKey = keyof T;
export function useRpT() {
  const { lang } = useLang();
  const d = moduleText("reciterPath", { en, de }, lang);
  return (k: RpKey, p?: Record<string, string | number>) => (p ? d[k].replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : d[k]);
}
