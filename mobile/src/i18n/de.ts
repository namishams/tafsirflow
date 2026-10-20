import type { Dict } from "./en";

const de: Dict = {
  tabs: { home: "Heute", quran: "Koran", learn: "Masterclass", library: "Entdecken", account: "Konto" },
  common: {
    cancel: "Abbrechen", done: "Fertig", save: "Sichern", retry: "Erneut versuchen", close: "Schließen", continue: "Weiter",
    loading: "Wird geladen …", offline: "Keine Verbindung. Bitte prüfe die Internetverbindung und versuche es erneut.",
    error: "Etwas ist schiefgelaufen. Bitte versuche es erneut.", free: "Kostenlos", locked: "Pro", back: "Zurück",
  },
  pro: {
    cta: "Pro holen", name: "Quran Masterclass Pro", price: "{price} im Monat", priceFallback: "4,99 € im Monat",
    lead: "Die ganze Masterclass: den Tafsir jeder Sure mit der Shams-Methode lernen, mit allen Rezitatoren und Kursen.",
    f_shams: "Shams-Methode für alle 114 Suren", f_reciters: "Alle Rezitatoren, mit Wort-Hervorhebung", f_radio: "Alle Radiosender",
    f_courses: "Arabisch- und Tadschwid-Kurs komplett", f_tests: "Academy-Tests für jede Sure", f_offline: "Suren offline",
    free: "Immer kostenlos: der ganze Koran mit Übersetzung und Tafsir, al-Fātiḥa und Juz ʿAmma mit der Shams-Methode, Gebetszeiten, Duas und vieles mehr.",
    summaryTitle: "Dein Abo", summaryWhat: "Quran Masterclass Pro", summaryTerm: "Monatlich, verlängert sich automatisch", summaryCancel: "Jederzeit in den App-Store-Einstellungen kündbar, spätestens 24 Stunden vor Ende des Monats.",
    subscribe: "Für {price} im Monat abonnieren", restore: "Käufe wiederherstellen", signInFirst: "Bitte melde dich zuerst an, damit Pro zu deinem Konto gehört und auf allen deinen Geräten gilt.",
    active: "Pro ist aktiv", activeUntil: "Verlängert sich oder endet am {date}", thanks: "Danke. Pro ist jetzt für dieses Konto aktiv.",
    pending: "Der Kauf wartet auf Freigabe.", failed: "Der Kauf konnte nicht abgeschlossen werden. Es wurde nichts abgebucht.", nothingToRestore: "Für diese Apple-ID wurde kein aktives Abo gefunden.",
    unavailable: "Käufe sind gerade nicht verfügbar. Bitte versuche es später erneut.", manage: "Abo verwalten",
    why_shams: "Diese Sure gehört zu Pro", why_reciters: "Dieser Rezitator gehört zu Pro", why_radio: "Dieser Sender gehört zu Pro", why_arabic: "Der ganze Arabischkurs gehört zu Pro",
    why_tajweed: "Der ganze Tadschwid-Kurs gehört zu Pro", why_academy: "Tests für diese Sure gehören zu Pro", why_offline: "Suren offline gehören zu Pro", why_vocab: "Mehr Wörter pro Tag gehören zu Pro", why_stats: "Die ausführliche Statistik gehört zu Pro", why_general: "Lerne den ganzen Koran mit der Shams-Methode",
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
    premium: "Quran Masterclass Pro", premiumActive: "Aktiv", restore: "Käufe wiederherstellen",
    legal: "Rechtliches", terms: "Nutzungsbedingungen", privacy: "Datenschutz", imprint: "Impressum", website: "Website",
    support: "Problem melden", deleteAccount: "Konto löschen",
    deleteTitle: "Konto löschen", deleteBody: "Dein Konto, dein Fortschritt, deine Notizen und Lesezeichen werden endgültig gelöscht. Ein laufendes Pro-Abo kündigst du in den App-Store-Einstellungen; es wird mit dem Konto nicht automatisch beendet.",
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
