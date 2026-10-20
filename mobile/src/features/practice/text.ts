import { useCallback } from "react";
import { useLang } from "@/i18n";

// Texts that exist only in the app (phone notifications, the live compass, the purchase of a personal dua, native
// pickers). Everything the website already says comes from the website (useWebT, the synced modules, ./web/*).
const de = {
  // prayer reminders (local notifications)
  alertsTitle: "Gebetserinnerungen",
  alertsLead: "Wähle die Gebete, an die dich dein Handy erinnern soll. Die Erinnerungen werden auf deinem Gerät für die nächsten 7 Tage geplant.",
  alertsFor: "Die Zeiten gelten für {place}. Öffne die App mindestens einmal in der Woche, damit die Erinnerungen weiterlaufen.",
  alertsDenied: "Benachrichtigungen sind für diese App ausgeschaltet. Du kannst sie in den Einstellungen deines Handys erlauben.",
  alertsUnavailable: "Erinnerungen sind in dieser Version der App noch nicht verfügbar.",
  openSettings: "Einstellungen öffnen",
  channel: "Gebetszeiten",
  autoAdhanNote: "Der Adhan spielt automatisch, solange dieser Bildschirm geöffnet ist.",
  play: "Abspielen",
  pause: "Pause",
  // live compass
  openQibla: "Qibla-Kompass öffnen",
  compassOff: "Kompass ausschalten",
  compassHint: "Halte das Handy flach vor dir, fern von Metall, Magneten und Lautsprechern.",
  facing: "Du schaust in Richtung Qibla.",
  turnRight: "Dreh dich nach rechts",
  turnLeft: "Dreh dich nach links",
  calibrate: "Der Kompass ist ungenau. Bewege das Handy ein paarmal in Form einer Acht.",
  magnetic: "Ausgerichtet nach magnetisch Nord – die Richtung kann einige Grad abweichen.",
  noCompass: "Ein Live-Kompass ist auf diesem Gerät nicht verfügbar. Die Gradzahl gilt von geografisch Nord aus.",
  compassPermission: "Für den Live-Kompass braucht die App die Standortfreigabe. Dein Standort wird nicht gespeichert.",
  forPlace: "für {place}",
  changePlace: "Ort ändern",
  // pickers
  choose: "Auswählen",
  done: "Fertig",
  minutes: "Min.",
  noDate: "Kein Datum",
  clear: "Löschen",
  // personal dua (paid, written by the server)
  personalTitle: "Eine persönliche Dua für dieses Anliegen",
  personalLead: "Deine Bitte wird für dein Anliegen in deinen eigenen Worten formuliert – nach der Etikette aus dem Hadith von {narrator}:",
  personalGet: "Du bekommst 3 bis 6 kurze, warme Sätze an Allah, mit den passenden Namen Allahs – in deiner Sprache. Sie ersetzen die Bitte oben; Lob, Segen und die Duas aus Quran und Sunna bleiben.",
  personalSignIn: "Melde dich an, damit deine persönlichen Duas deinem Konto gutgeschrieben werden.",
  signIn: "Anmelden",
  write: "Persönliche Dua schreiben",
  left: "Noch {n} persönliche Duas verfügbar",
  leftOne: "Noch 1 persönliche Dua verfügbar",
  one: "Eine persönliche Dua",
  pack: "Fünf persönliche Duas",
  packNote: "Günstiger pro Dua",
  buyFailed: "Der Kauf wurde nicht abgeschlossen. Es wurde nichts berechnet.",
  noCredit: "Für diese Dua ist kein Guthaben mehr vorhanden.",
  storeNote: "Einmalkauf über den App Store bzw. Google Play. Pro enthält jeden Monat einige persönliche Duas.",
  unavailable: "Persönliche Duas sind gerade nicht verfügbar.",
  open: "Öffnen",
};
type Dict = typeof de;
const en: Dict = {
  alertsTitle: "Prayer reminders",
  alertsLead: "Choose the prayers your phone should remind you of. The reminders are scheduled on your device for the next 7 days.",
  alertsFor: "Times are for {place}. Open the app at least once a week to keep the reminders going.",
  alertsDenied: "Notifications are turned off for this app. You can allow them in your phone's settings.",
  alertsUnavailable: "Reminders are not available in this version of the app yet.",
  openSettings: "Open settings",
  channel: "Prayer times",
  autoAdhanNote: "The adhan plays automatically while this screen is open.",
  play: "Play",
  pause: "Pause",
  openQibla: "Open the Qibla compass",
  compassOff: "Turn the compass off",
  compassHint: "Hold the phone flat in front of you, away from metal, magnets and speakers.",
  facing: "You are facing the qibla.",
  turnRight: "Turn to the right",
  turnLeft: "Turn to the left",
  calibrate: "The compass is inaccurate. Move the phone a few times in a figure eight.",
  magnetic: "Aligned to magnetic north – the direction may be off by a few degrees.",
  noCompass: "A live compass is not available on this device. The degrees are measured from true north.",
  compassPermission: "The live compass needs location access. Your location is not stored.",
  forPlace: "for {place}",
  changePlace: "Change place",
  choose: "Choose",
  done: "Done",
  minutes: "min",
  noDate: "No date",
  clear: "Clear",
  personalTitle: "A personal dua for this concern",
  personalLead: "Your request is put into your own words for your concern – following the etiquette from the hadith of {narrator}:",
  personalGet: "You receive 3 to 6 short, warm sentences to Allah, with the fitting names of Allah – in your language. They replace the request above; the praise, the blessings and the duas of the Quran and the Sunnah stay.",
  personalSignIn: "Sign in so that your personal duas are credited to your account.",
  signIn: "Sign in",
  write: "Write my personal dua",
  left: "{n} personal duas left",
  leftOne: "1 personal dua left",
  one: "One personal dua",
  pack: "Five personal duas",
  packNote: "Lower price per dua",
  buyFailed: "The purchase was not completed. You have not been charged.",
  noCredit: "There is no credit left for this dua.",
  storeNote: "One-time purchase through the App Store or Google Play. Pro includes a few personal duas every month.",
  unavailable: "Personal duas are not available right now.",
  open: "Open",
};

/** app-only texts: tx("alertsFor", { place }) */
export function useTx() {
  const { lang } = useLang();
  return useCallback((key: keyof Dict, params?: Record<string, string | number>) => {
    const s = (lang === "de" ? de : en)[key];
    return params ? s.replace(/\{(\w+)\}/g, (_, p: string) => String(params[p] ?? `{${p}}`)) : s;
  }, [lang]);
}
