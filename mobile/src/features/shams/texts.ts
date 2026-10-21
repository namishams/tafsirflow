import { useLang } from "@/i18n";
import { moduleText } from "@/i18n/app";

// App-only texts of the Shams screens (everything the website also says comes from its messages via useWebT)
const T = {
  de: {
    close: "Schließen", verseOf: "Vers {n} von {total}", done: "Sure abgeschlossen", doneLead: "Sie haben alle Verse dieser Sure mit der Shams-Methode durchgearbeitet. Die Verse kommen zum richtigen Zeitpunkt zur Wiederholung zurück.",
    backToCourse: "Zurück zur Masterclass", again: "Noch einmal von vorn", sessionDone: "Heutige Sitzung abgeschlossen",
    sessionLead: "{done} Verse geübt, davon {fresh} neu, in etwa {minutes} Minuten. Bis morgen.", toToday: "Zu Heute",
    play: "Abspielen", pause: "Pause", noteTitle: "Ihre Notiz", saveNote: "Notiz sichern", noteSaved: "Gesichert",
    lockedTitle: "Diese Sure gehört zu Pro", lockedText: "Mit Quran Masterclass Pro lernen Sie jede Sure mit der Shams-Methode. Kostenlos: al-Fātiḥa und Juz ʿAmma.",
    item: "{i} von {n}",
  },
  en: {
    close: "Close", verseOf: "Verse {n} of {total}", done: "Surah completed", doneLead: "You worked through every verse of this surah with the Shams Method. They will come back for review at the right time.",
    backToCourse: "Back to the Masterclass", again: "Start again", sessionDone: "Today's session completed",
    sessionLead: "{done} verses practised, {fresh} of them new, in about {minutes} minutes. See you tomorrow.", toToday: "Go to Today",
    play: "Play", pause: "Pause", noteTitle: "Your note", saveNote: "Save note", noteSaved: "Saved",
    lockedTitle: "This surah is part of Pro", lockedText: "With Quran Masterclass Pro you learn every surah with the Shams Method. Free: al-Fātiḥa and Juz ʿAmma.",
    item: "{i} of {n}",
  },
};

export function useShamsT() {
  const { lang } = useLang();
  const d = moduleText("shams", T, lang);
  return (k: keyof typeof T.en, p?: Record<string, string | number>) => (p ? d[k].replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : d[k]);
}
