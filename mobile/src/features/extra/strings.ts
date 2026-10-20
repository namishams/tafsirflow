import { useLang } from "@/i18n";

// App-only texts of the extra screens (search, assistant, feedback, legal, onboarding, kids mode, social, widgets).
// Texts the website already has are read with useWebT(); the assistant and the 404 page keep their texts in the
// website's component files (AssistantChat.tsx, not-found.tsx), so they are copied here word for word.
const de = {
  back: "Zurück",
  openWebsite: "Auf der Website öffnen",
  signIn: "Anmelden",
  verify: "Bitte bestätige zuerst deine E-Mail-Adresse mit dem Link aus unserer Mail.",
  offline: "Keine Verbindung. Bitte prüfe dein Internet und versuche es noch einmal.",
  search: {
    hint: "Suche nach einer Sure (Name oder Nummer), einem Vers wie 2:255 oder einem Wort in Arabisch oder Deutsch.",
    surahs: "Suren",
    verses: "Verse",
    goTo: "Zu Vers {key}",
    min: "Bitte gib mindestens zwei Zeichen ein.",
  },
  assistant: {
    kicker: "Frag nach",
    title: "Der Quran-Masterclass-Assistent",
    lead: "Fragen zum Koran, zum Islam und zur Shams-Methode – rund um die Uhr. Der Assistent antwortet nur zu diesen Themen und verweist dich bei persönlichen religiösen Fragen an einen Gelehrten.",
    ph: "Frag etwas über den Koran oder den Islam …",
    send: "Senden",
    hello: "As-salāmu ʿalaykum! Ich beantworte Fragen zum Koran, zum Islam und zur Shams-Methode. Bei persönlichen religiösen Urteilen verweise ich dich an einen Gelehrten.",
    off: "Der Assistent wird gerade eingerichtet.",
    err: "Das hat nicht geklappt. Bitte versuch es gleich noch einmal.",
    limit: "Du hast das Tageslimit erreicht – morgen geht es weiter.",
    note: "KI-gestützter Assistent: Er kann sich irren und ersetzt keinen Gelehrten. Für Fatwas und persönliche Fragen wende dich an einen qualifizierten Gelehrten.",
    sugg: ["Was ist die Shams-Methode?", "Wie lerne ich Al-Fatiha am besten?", "Was bedeutet Ayat al-Kursi?", "Wie bereite ich mich auf Ramadan vor?"],
    thinking: "denkt nach …",
    clear: "Neues Gespräch",
    login: "Melde dich an, damit der Assistent deine Fragen mit deinem Pro-Konto beantworten kann.",
    left: "Heute noch {n} Fragen",
    leftOne: "Heute noch eine Frage",
    proTitle: "Frag den Assistenten",
    proText: "Mit Pro beantwortet dir der Assistent jeden Tag deine Fragen zum Koran, zum Islam und zur Shams-Methode – ruhig, mit Quellen und mit dem Hinweis auf Gelehrte, wo es nötig ist.",
    examples: "Zum Beispiel",
  },
  feedback: {
    signIn: "Melde dich an, um Wünsche zu senden und abzustimmen.",
    captcha: "Aus der App lässt sich das gerade nicht senden. Bitte nutze dafür die Website.",
    report: "Problem melden",
    category: "Kategorie",
    titleLabel: "Titel",
    bodyLabel: "Beschreibung",
    cancel: "Abbrechen",
    votes: "{n} Stimmen",
  },
  legal: {
    imprintLead: "Anbieter und Kontakt von Quran Masterclass.",
    imprintOpen: "Impressum auf der Website",
  },
  notFound: { code: "404", title: "Diese Seite gibt es nicht", body: "Der Link ist vielleicht veraltet oder falsch geschrieben. Hier geht es weiter:", home: "Zur Startseite", quran: "Zum Koran" },
  onboard: {
    qAge: "Wer lernt hier?",
    qAgeD: "Kinder und Ältere bekommen ruhigere Rezitation, mehr Wiederholungen und mehr Zeit bei den Tests.",
    a_child: "Ein Kind",
    a_childD: "6 bis 12 Jahre",
    a_teen: "Jugendliche",
    a_teenD: "13 bis 17 Jahre",
    a_adult: "Erwachsene",
    a_adultD: "18 bis 59 Jahre",
    a_senior: "Ab 60",
    a_seniorD: "In ruhigerem Tempo",
    kidsHint: "Für Kinder gibt es den Kinder-Modus: große Schrift, helle Farben, Wort-für-Wort-Hilfe und weniger Bedienelemente.",
    sessionCta: "Zur heutigen Sitzung",
  },
  kids: {
    title: "Kinder-Modus",
    on: "Große Schrift, helle Farben, Wort-für-Wort-Hilfe und weniger Bedienelemente.",
    off: "Die ruhige Standard-Ansicht.",
  },
  social: {
    signIn: "Melde dich an, um Verse mit einem Herz zu markieren und zu kommentieren.",
    likes: "{n} Herzen",
    sheetTitle: "Kommentare · {key}",
    chars: "{n}/500",
  },
  recite: {
    title: "Aus dem Gedächtnis rezitieren",
    wordsSoon: "Die Prüfung Wort für Wort kommt bald in die App. Nimm dich bis dahin auf und vergleiche mit dem Rezitator.",
    privacy: "Deine Aufnahme bleibt auf diesem Gerät und wird nirgends gespeichert.",
    denied: "Kein Zugriff auf das Mikrofon. Bitte erlaube ihn in den Einstellungen.",
  },
  pro: {
    kicker: "Quran Masterclass Pro",
    title: "Die ganze Masterclass",
    body: "Die Shams-Methode für alle 114 Suren, alle Rezitatoren, die vollständigen Kurse und der Assistent. Koran, Übersetzung und Tafsir bleiben für alle frei.",
    cta: "Pro ansehen",
  },
  welcome: { title: "Quran Masterclass entdecken" },
};

const en: typeof de = {
  back: "Back",
  openWebsite: "Open on the website",
  signIn: "Sign in",
  verify: "Please confirm your email address first with the link in our email.",
  offline: "No connection. Please check your internet connection and try again.",
  search: {
    hint: "Search for a surah (name or number), a verse like 2:255 or a word in Arabic or English.",
    surahs: "Surahs",
    verses: "Verses",
    goTo: "Go to verse {key}",
    min: "Please type at least two characters.",
  },
  assistant: {
    kicker: "Ask",
    title: "The Quran Masterclass Assistant",
    lead: "Questions about the Quran, Islam and the Shams Method – any time. The assistant only answers on these topics and refers you to a scholar for personal religious questions.",
    ph: "Ask something about the Quran or Islam …",
    send: "Send",
    hello: "As-salāmu ʿalaykum! I answer questions about the Quran, Islam and the Shams Method. For personal religious rulings I will refer you to a scholar.",
    off: "The assistant is being set up.",
    err: "That did not work. Please try again in a moment.",
    limit: "You have reached today's limit – see you tomorrow.",
    note: "AI-based assistant: it can make mistakes and does not replace a scholar. For fatwas and personal questions, please ask a qualified scholar.",
    sugg: ["What is the Shams Method?", "How do I best learn Al-Fatiha?", "What does Ayat al-Kursi mean?", "How do I prepare for Ramadan?"],
    thinking: "thinking …",
    clear: "New conversation",
    login: "Sign in so the assistant can answer your questions with your Pro account.",
    left: "{n} questions left today",
    leftOne: "One question left today",
    proTitle: "Ask the assistant",
    proText: "With Pro, the assistant answers your questions about the Quran, Islam and the Shams Method every day – calmly, with sources, and pointing you to scholars where needed.",
    examples: "For example",
  },
  feedback: {
    signIn: "Sign in to send requests and vote.",
    captcha: "This cannot be sent from the app right now. Please use the website for it.",
    report: "Report a problem",
    category: "Category",
    titleLabel: "Title",
    bodyLabel: "Description",
    cancel: "Cancel",
    votes: "{n} votes",
  },
  legal: {
    imprintLead: "Provider and contact of Quran Masterclass.",
    imprintOpen: "Imprint on the website",
  },
  notFound: { code: "404", title: "This page does not exist", body: "The link may be outdated or mistyped. Here is where to go next:", home: "Back to the home page", quran: "Open the Quran" },
  onboard: {
    qAge: "Who is learning?",
    qAgeD: "Children and older learners get calmer recitation, more repetitions and more time in the tests.",
    a_child: "A child",
    a_childD: "6 to 12 years",
    a_teen: "A teenager",
    a_teenD: "13 to 17 years",
    a_adult: "An adult",
    a_adultD: "18 to 59 years",
    a_senior: "60 and older",
    a_seniorD: "At a calmer pace",
    kidsHint: "For children there is kids mode: large text, bright colours, word-by-word help and fewer controls.",
    sessionCta: "Go to today's session",
  },
  kids: {
    title: "Kids mode",
    on: "Large text, bright colours, word-by-word help and fewer controls.",
    off: "The calm standard view.",
  },
  social: {
    signIn: "Sign in to mark verses with a heart and to comment.",
    likes: "{n} hearts",
    sheetTitle: "Comments · {key}",
    chars: "{n}/500",
  },
  recite: {
    title: "Recite from memory",
    wordsSoon: "Word-by-word checking is coming to the app soon. Until then, record yourself and compare with the reciter.",
    privacy: "Your recording stays on this device and is not stored anywhere.",
    denied: "No access to the microphone. Please allow it in Settings.",
  },
  pro: {
    kicker: "Quran Masterclass Pro",
    title: "The whole Masterclass",
    body: "The Shams Method for all 114 surahs, every reciter, the complete courses and the assistant. The Quran, translation and tafsir stay free for everyone.",
    cta: "See Pro",
  },
  welcome: { title: "Discover Quran Masterclass" },
};

export const EXTRA = { de, en };
export type ExtraStrings = typeof de;

/** the app-only texts in the current language */
export function useX(): ExtraStrings {
  const { lang } = useLang();
  return lang === "de" ? de : en;
}

/** "{n} questions" -> "3 questions" */
export const fill = (s: string, p: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => (p[k] !== undefined ? String(p[k]) : `{${k}}`));
