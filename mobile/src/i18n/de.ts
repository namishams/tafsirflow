import type { Dict } from "./en";

const de: Dict = {
  tabs: { home: "Übersicht", quran: "Quran", learn: "Lernen", library: "Bibliothek", account: "Konto" },
  common: {
    cancel: "Abbrechen", done: "Fertig", save: "Sichern", retry: "Erneut versuchen", close: "Schließen", continue: "Weiter",
    loading: "Wird geladen …", offline: "Keine Verbindung. Bitte prüfe die Internetverbindung und versuche es erneut.",
    error: "Etwas ist schiefgelaufen. Bitte versuche es erneut.", free: "Kostenlos", locked: "Premium",
  },
  quran: {
    search: "Sure suchen", verses: "{n} Verse", makki: "Mekkanisch", madani: "Medinensisch",
    juzAmma: "Juz ʿAmma", allSurahs: "Alle Suren",
  },
  account: {
    title: "Konto", signIn: "Anmelden", signOut: "Abmelden", createAccount: "Konto erstellen",
    signedInAs: "Angemeldet als {email}", notSignedIn: "Melde dich an, damit dein Fortschritt auf allen Geräten und auf der Website erhalten bleibt.",
    appearance: "Darstellung", system: "System", light: "Hell", dark: "Dunkel",
    language: "Sprache", languageSystem: "System", german: "Deutsch", english: "English",
    premium: "Masterclass Premium", premiumActive: "Aktiv", restore: "Käufe wiederherstellen",
    legal: "Rechtliches", terms: "Nutzungsbedingungen", privacy: "Datenschutz", imprint: "Impressum", website: "Website",
    support: "Problem melden", deleteAccount: "Konto löschen",
    deleteTitle: "Konto löschen", deleteBody: "Dein Konto, dein Fortschritt, deine Notizen und Lesezeichen werden endgültig gelöscht. Ein Premium-Kauf bleibt an deine Apple-ID gebunden und lässt sich wiederherstellen.",
    deleteConfirm: "Endgültig löschen", currentPassword: "Aktuelles Passwort", wrongPassword: "Das Passwort ist nicht korrekt.",
    version: "Version {v}",
  },
  auth: {
    email: "E-Mail", password: "Passwort", firstName: "Vorname", lastName: "Nachname", country: "Land",
    birthYear: "Geburtsjahr", chooseCountry: "Land auswählen",
    terms: "Ich akzeptiere die Nutzungsbedingungen und die Datenschutzerklärung.", marketing: "Neuigkeiten zu neuen Kursen per E-Mail (optional).",
    signInTitle: "Anmelden", registerTitle: "Konto erstellen", noAccount: "Noch kein Konto?", haveAccount: "Bereits ein Konto?",
    forgot: "Passwort vergessen?", forgotSent: "Falls ein Konto zu dieser Adresse besteht, bekommst du eine E-Mail mit einem Link.",
    errors: {
      invalid: "E-Mail oder Passwort ist nicht korrekt.", exists: "Zu dieser E-Mail-Adresse gibt es bereits ein Konto.",
      weak: "Bitte wähle ein längeres Passwort (mindestens 10 Zeichen).", terms: "Bitte akzeptiere die Nutzungsbedingungen.",
      age: "Bitte gib ein gültiges Geburtsjahr ein.", country: "Bitte wähle dein Land.", rate: "Zu viele Versuche. Bitte warte einige Minuten.",
      email: "Bitte gib eine gültige E-Mail-Adresse ein.", name: "Bitte gib Vor- und Nachnamen ein.",
    },
    verifyHint: "Wir haben dir eine E-Mail geschickt. Bitte bestätige deine Adresse über den Link darin.",
  },
};
export default de;
