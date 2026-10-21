// mirrors mobile/src/features/mishary/texts.ts – interface texts of the Mishary track (forming the next generation of
// reciters). English and German here (the app's tables, unchanged); the other twelve languages are the app's files,
// copied to ./i18n/<lang>.json (only .json files in that folder) and loaded the first time a language is used.
// Missing keys fall back to English. Content marked "needs review" (maqam lessons, style notes) is a draft until a
// qualified teacher has checked it.
import { useEffect, useSyncExternalStore } from "react";
import { useLang } from "@/lib/learn/i18n";

const en = {
  // hub
  kicker: "Masār al-Qurrāʾ", title: "Forming the next generation of reciters", lead: "After the Reciter Path: train your ear for the maqamat, study the style of the masters, keep a daily recording journal, get feedback from a verified master and take part in the talent seasons.",
  cardTitle: "Masār al-Qurrāʾ", cardLead: "Maqam ear training, style studies of the masters, a daily recording journal, mentoring and talent seasons.",
  tileSub: "Maqam ear, masters' styles, mentoring, seasons",
  needsReview: "Needs review", needsReviewNote: "Marked content is a draft written by our team and is being checked by a qualified teacher.",
  open: "Open", back: "Back", loading: "Loading…", offline: "Could not load. Please check your connection.", retry: "Try again", error: "Something went wrong. Please try again.",
  free: "Free for now", play: "Play", stop: "Stop", verse: "Verse", verses: "Surah {s}, verses {a}–{b}", verseOne: "Surah {s}, verse {a}",
  // sections of the hub
  earTitle: "Maqam ear training", earLead: "Hear the seven main maqamat and learn to recognise them, step by step.",
  mastersTitle: "Style studies of the masters", mastersLead: "Listen phrase by phrase, see pace and pauses, and record yourself next to the master.",
  journalTitle: "Daily recording journal", journalLead: "One recitation a day. See how loudness, pace and accuracy develop over the weeks.",
  mentoringTitle: "Mentoring", mentoringLead: "A verified master reviews your short recordings: rubric and text, no video.",
  seasonsTitle: "Talent seasons", seasonsLead: "Monthly and Ramadan challenges, judged by masters. Winners enter the Hall of Fame.",
  hofTitle: "Hall of Fame", hofLead: "The podium of every season.",
  // maqamat
  m_bayati: "Bayati", m_saba: "Saba", m_hijaz: "Hijaz", m_rast: "Rast", m_nahawand: "Nahawand", m_sika: "Sika", m_ajam: "Ajam",
  d_bayati: "Begins with a neutral second (a quarter tone below the minor second). Calm, warm and grounded; many recitations start and end here.",
  d_saba: "Like Bayati at the start, but the fourth note is lowered. Heavy and longing; often heard in verses of grief and warning.",
  d_hijaz: "A small second followed by a wide step (augmented second). Intense and yearning; easy to recognise by this wide step.",
  d_rast: "A whole tone, then a neutral third (between minor and major). Upright and dignified; often called the father of the maqamat.",
  d_nahawand: "Close to the Western minor scale. Soft and tender; often used for verses of mercy.",
  d_sika: "Starts on a note a quarter tone below a natural note; the first step is a neutral second. Floating and solemn.",
  d_ajam: "Close to the Western major scale. Bright and clear; often used for verses of glad tidings and majesty.",
  // ear training
  tabLessons: "Lessons", tabDrills: "Drills", tabStats: "Statistics",
  earSynthNote: "Lessons and drills play the characteristic lower jins of each maqam as synthesised tones (quarter tones approximated). Real recitation moves freely between maqamat, so listen to the masters as well.",
  hearJins: "Hear the jins", hearScale: "Up and down", lowerJins: "Lower jins",
  stage: "Stage {n}", s1: "Major or minor: Ajam and Nahawand", s2: "The wide step: add Hijaz", s3: "Quarter tones: Rast and Bayati", s4: "All seven maqamat", s5: "Recordings of the masters",
  stageLocked: "Reach 80 % in the previous stage to unlock.", stageBest: "Best: {n} %", startDrill: "Start", whichMaqam: "Which maqam do you hear?", playAgain: "Play again",
  correct: "Correct", wrongWas: "Not quite: it was {m}", next: "Next", question: "Question {n} of {total}", result: "{ok} of {total} correct", unlocked: "Stage {n} unlocked", again: "Practise again", done: "Done",
  noExamples: "No reviewed recording examples yet. Examples of the masters are added only after a maqam teacher has confirmed them.",
  statAnswers: "Answers", statAccuracy: "Accuracy", statStage: "Highest stage", statDays: "Days practised", statPer: "{ok} of {n}", confused: "Often confused", noStats: "No answers yet. Start with stage 1.",
  // style studies
  studyPick: "Choose a master", proVoice: "This voice is part of Pro.", unlockPro: "Unlock with Pro", notOnServer: "This voice is not available on the server yet.",
  phrases: "Phrase by phrase", phrase: "Phrase {n}", playPhrase: "Play phrase", playAll: "Whole verse", noTimings: "Word timings are not available for this voice.",
  paceTitle: "Pace and pauses", wpm: "{n} words per minute", longestPause: "Longest pause {s} s", pauses: "{n} pauses", legendWords: "Words", legendPauses: "Pauses",
  yourTurn: "Your recording", styleNotes: "Style notes (in our own words)",
  n_alafasy: "A clear, bright voice with a moderate pace and clean, easy-to-follow melodic lines. Phrases are well rounded and endings are calm; a good model for learners who want clarity and balance.",
  n_abdulbasit: "Very long breath, a wide vocal range and a resonant tone. Madd lengths are held with great steadiness; in the murattal style the melody stays measured but full of expression.",
  n_minshawi: "A gentle, deeply moving voice with a sorrowful tenderness. Precise articulation at a calm pace; pauses give the meaning room to settle.",
  n_husary: "The teacher's recitation: exact makharij, rules applied very clearly, a steady and unhurried pace. Ideal for checking tajweed word by word.",
  n_sudais: "A high, intense voice with a brisk pace and a strong emotional pull, shaped by leading prayers in the Haram. Short pauses, flowing phrases.",
  // shared recorder
  record: "Record", stopRec: "Stop", recording: "Recording… {s} s", rerecord: "Record again", listen: "Listen", micDenied: "Microphone access was not allowed. You can allow it in the system settings.",
  // journal
  journalPrivate: "Private: recordings and charts stay on this device and are never shared.",
  today: "Today", todayDone: "Today's recitation is saved.", chooseVerse: "Choose a verse", saveEntry: "Save today's entry", saved: "Saved",
  wordCheck: "Word check (optional)", wordCheckStart: "Start word check", wordCheckStop: "Finish", wordCheckNa: "On-device word recognition for Arabic is not available on this device.", accuracy: "Accuracy {n} %",
  chartLoud: "Loudness by week (average level)", chartPace: "Pace by week (words per minute)", chartAcc: "Word-check accuracy by week", chartEmpty: "Charts appear after your first entries.",
  loudNote: "Loudness is the average microphone level; it depends on the device and the distance to it.",
  entries: "Entries", streak: "{n} days in a row", noEntries: "No entries yet.", delete: "Delete", weekOf: "Week of {d}",
  // mentoring
  signIn: "Sign in to use mentoring and seasons.", signInBtn: "Sign in", age16: "Mentoring and seasons are open from age 16 with a profile in Quran Talents.", needProfile: "Create your profile in Quran Talents first.", openTalents: "Open Quran Talents",
  yourMentors: "Your mentors", askMaster: "Ask a master", askLead: "Only verified masters you are connected with are listed (level master or sheikh, gold or official badge).",
  noMasters: "No connected masters yet. Connect with a master in Quran Talents first.", ask: "Ask for mentoring", requested: "Requested", accepted: "Mentor", endMentoring: "End",
  yourStudents: "Your students", requests: "Requests", accept: "Accept", decline: "Decline", toReview: "Recordings to review", none: "Nothing here yet.",
  yourRecordings: "Your recordings", send: "Send a recording", pending: "Waiting for feedback", reviewed: "Feedback received", expires: "Deleted on {d}", deletedFile: "The recording was deleted after 60 days.",
  sendTo: "Send a recording to {name}", record3060: "Record 30–60 seconds of the verse.", tooShort: "At least 30 seconds, please.", autoStop: "Recording stops automatically at {s} seconds.",
  noteLabel: "Note (optional)", sendBtn: "Send", sent: "Sent", privateRec: "Your recording is private: only your mentor hears it. It is deleted after 60 days.",
  feedback: "Feedback", r_makharij: "Makharij", r_tajweed: "Tajweed", r_waqf: "Waqf and ibtida", r_pace: "Pace", r_maqam: "Maqam", scaleHint: "1 = needs work, 5 = excellent",
  comment: "Comment", commentHint: "Short, kind and concrete. Links and contact details are not allowed.", sendFeedback: "Send feedback", feedbackSent: "Feedback sent", total: "{n} of 25",
  fromName: "From {name}", withdraw: "Withdraw", jury: "Jury",
  e_text_not_allowed: "This text is not allowed (links, contact details or inappropriate words).", e_media_unavailable: "Uploads are not available right now.",
  e_too_many_open: "You already have 3 recordings waiting with this mentor.", e_too_many_mentors: "You can have at most 5 mentors.", e_not_connected: "You need to be connected with this master first.",
  e_already_entered: "You have already entered this season.", e_season_closed: "This season is closed.", e_duration: "The recording has the wrong length.", e_text_required: "Please write a short comment.",
  // seasons
  k_month: "Monthly challenge", k_ramadan: "Ramadan challenge", k_special: "Special challenge",
  openUntil: "Open until {d}", judging: "Judging", closed: "Closed", published: "Results published", entriesN: "{n} entries",
  enter: "Enter the challenge", yourEntry: "Your entry", rewards: "Rewards: a mythic sticker for the winner, legendary stickers for places 2 and 3.",
  recordSeason: "Record {v} (up to {s} s).", entryPrivate: "Your entry is private: only the jury hears it, without your name.", withdrawEntry: "Withdraw entry",
  judge: "Judge entries", toJudge: "Entries to judge", entry: "Entry {n}", place: "Place {n}", score: "Score {s} of 25", mythic: "Mythic sticker", legendary: "Legendary sticker",
  noResults: "No results yet.", yourResult: "Your result: place {n}",
  // safety (report, block, guidelines) and the mentoring hero note
  safetyFor: "Report or block {name}", reportRecording: "Report recording", reportReview: "Report feedback", blockedNote: "{name} is blocked and no longer appears here.", mentoringNote: "Private recordings, deleted after 60 days. Open from age 16.",
  adminJudging: "Close entries (judging)", adminPublish: "Publish results", adminNew: "New season", slug: "Short name (a-z, 0-9, -)", startsOn: "Starts (YYYY-MM-DD)", endsOn: "Ends (YYYY-MM-DD)", titleField: "Title (optional)", create: "Create",
};
export type MtKey = keyof typeof en;
type T = Record<MtKey, string>;

const de: T = {
  kicker: "Masār al-Qurrāʾ", title: "Die nächste Generation von Rezitatoren", lead: "Nach dem Rezitationspfad: Schulen Sie Ihr Gehör für die Maqamat, studieren Sie den Stil der Meister, führen Sie ein tägliches Aufnahme-Tagebuch, erhalten Sie Rückmeldung von einem verifizierten Meister und nehmen Sie an den Talent-Saisons teil.",
  cardTitle: "Masār al-Qurrāʾ", cardLead: "Maqam-Gehörbildung, Stilstudien der Meister, tägliches Aufnahme-Tagebuch, Mentoring und Talent-Saisons.",
  tileSub: "Maqam-Gehör, Stil der Meister, Mentoring, Saisons",
  needsReview: "Wird geprüft", needsReviewNote: "Markierte Inhalte sind Entwürfe unseres Teams und werden von einer qualifizierten Lehrkraft geprüft.",
  open: "Öffnen", back: "Zurück", loading: "Wird geladen…", offline: "Konnte nicht geladen werden. Bitte prüfen Sie Ihre Verbindung.", retry: "Erneut versuchen", error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
  free: "Vorerst kostenlos", play: "Abspielen", stop: "Stopp", verse: "Vers", verses: "Sure {s}, Verse {a}–{b}", verseOne: "Sure {s}, Vers {a}",
  earTitle: "Maqam-Gehörbildung", earLead: "Hören Sie die sieben Haupt-Maqamat und lernen Sie, sie Schritt für Schritt zu erkennen.",
  mastersTitle: "Stilstudien der Meister", mastersLead: "Hören Sie Phrase für Phrase, sehen Sie Tempo und Pausen und nehmen Sie sich neben dem Meister auf.",
  journalTitle: "Tägliches Aufnahme-Tagebuch", journalLead: "Eine Rezitation am Tag. Sehen Sie, wie sich Lautstärke, Tempo und Genauigkeit über die Wochen entwickeln.",
  mentoringTitle: "Mentoring", mentoringLead: "Ein verifizierter Meister bewertet Ihre kurzen Aufnahmen: Bewertungsraster und Text, kein Video.",
  seasonsTitle: "Talent-Saisons", seasonsLead: "Monats- und Ramadan-Challenges, bewertet von Meistern. Die Gewinner kommen in die Hall of Fame.",
  hofTitle: "Hall of Fame", hofLead: "Das Podium jeder Saison.",
  m_bayati: "Bayati", m_saba: "Saba", m_hijaz: "Hidschaz", m_rast: "Rast", m_nahawand: "Nahawand", m_sika: "Sika", m_ajam: "Adscham",
  d_bayati: "Beginnt mit einer neutralen Sekunde (einen Viertelton unter der kleinen Sekunde). Ruhig, warm und geerdet; viele Rezitationen beginnen und enden hier.",
  d_saba: "Beginnt wie Bayati, doch der vierte Ton ist erniedrigt. Schwer und sehnsuchtsvoll; oft in Versen der Trauer und Warnung zu hören.",
  d_hijaz: "Eine kleine Sekunde, dann ein weiter Schritt (übermäßige Sekunde). Intensiv und sehnsuchtsvoll; an diesem weiten Schritt leicht zu erkennen.",
  d_rast: "Ein Ganzton, dann eine neutrale Terz (zwischen klein und groß). Aufrecht und würdevoll; oft Vater der Maqamat genannt.",
  d_nahawand: "Nahe an der westlichen Molltonleiter. Weich und zart; oft für Verse der Barmherzigkeit verwendet.",
  d_sika: "Beginnt auf einem Ton einen Viertelton unter einem Stammton; der erste Schritt ist eine neutrale Sekunde. Schwebend und feierlich.",
  d_ajam: "Nahe an der westlichen Durtonleiter. Hell und klar; oft für Verse der frohen Botschaft und der Erhabenheit verwendet.",
  tabLessons: "Lektionen", tabDrills: "Übungen", tabStats: "Statistik",
  earSynthNote: "Lektionen und Übungen spielen das typische untere Dschins jedes Maqams als synthetische Töne (Vierteltöne angenähert). Echte Rezitation wechselt frei zwischen Maqamat; hören Sie deshalb auch den Meistern zu.",
  hearJins: "Dschins hören", hearScale: "Auf und ab", lowerJins: "Unteres Dschins",
  stage: "Stufe {n}", s1: "Dur oder Moll: Adscham und Nahawand", s2: "Der weite Schritt: dazu Hidschaz", s3: "Vierteltöne: Rast und Bayati", s4: "Alle sieben Maqamat", s5: "Aufnahmen der Meister",
  stageLocked: "Erreichen Sie 80 % in der vorigen Stufe, um sie freizuschalten.", stageBest: "Bestwert: {n} %", startDrill: "Starten", whichMaqam: "Welchen Maqam hören Sie?", playAgain: "Noch einmal",
  correct: "Richtig", wrongWas: "Nicht ganz: Es war {m}", next: "Weiter", question: "Frage {n} von {total}", result: "{ok} von {total} richtig", unlocked: "Stufe {n} freigeschaltet", again: "Noch einmal üben", done: "Fertig",
  noExamples: "Noch keine geprüften Aufnahmebeispiele. Beispiele der Meister kommen erst hinzu, wenn eine Maqam-Lehrkraft sie bestätigt hat.",
  statAnswers: "Antworten", statAccuracy: "Trefferquote", statStage: "Höchste Stufe", statDays: "Übungstage", statPer: "{ok} von {n}", confused: "Oft verwechselt", noStats: "Noch keine Antworten. Beginnen Sie mit Stufe 1.",
  studyPick: "Meister wählen", proVoice: "Diese Stimme gehört zu Pro.", unlockPro: "Mit Pro freischalten", notOnServer: "Diese Stimme ist auf dem Server noch nicht verfügbar.",
  phrases: "Phrase für Phrase", phrase: "Phrase {n}", playPhrase: "Phrase abspielen", playAll: "Ganzer Vers", noTimings: "Für diese Stimme gibt es keine Wortzeiten.",
  paceTitle: "Tempo und Pausen", wpm: "{n} Wörter pro Minute", longestPause: "Längste Pause {s} s", pauses: "{n} Pausen", legendWords: "Wörter", legendPauses: "Pausen",
  yourTurn: "Ihre Aufnahme", styleNotes: "Stilnotizen (in eigenen Worten)",
  n_alafasy: "Eine klare, helle Stimme mit mäßigem Tempo und sauberen, leicht nachvollziehbaren Melodielinien. Die Phrasen sind gut gerundet, die Enden ruhig; ein gutes Vorbild für Lernende, die Klarheit und Ausgewogenheit suchen.",
  n_abdulbasit: "Sehr langer Atem, großer Stimmumfang und ein resonanter Klang. Die Madd-Längen werden sehr gleichmäßig gehalten; im Murattal-Stil bleibt die Melodie maßvoll, aber voller Ausdruck.",
  n_minshawi: "Eine sanfte, tief berührende Stimme mit wehmütiger Zartheit. Genaue Artikulation in ruhigem Tempo; Pausen geben der Bedeutung Raum.",
  n_husary: "Die Rezitation des Lehrers: genaue Makharidsch, sehr deutlich angewandte Regeln, gleichmäßiges und ruhiges Tempo. Ideal, um Tadschwid Wort für Wort zu prüfen.",
  n_sudais: "Eine hohe, intensive Stimme mit zügigem Tempo und starker emotionaler Wirkung, geprägt vom Vorbeten im Haram. Kurze Pausen, fließende Phrasen.",
  record: "Aufnehmen", stopRec: "Stopp", recording: "Aufnahme… {s} s", rerecord: "Neu aufnehmen", listen: "Anhören", micDenied: "Der Zugriff auf das Mikrofon wurde nicht erlaubt. Sie können ihn in den Systemeinstellungen erlauben.",
  journalPrivate: "Privat: Aufnahmen und Diagramme bleiben auf diesem Gerät und werden nie geteilt.",
  today: "Heute", todayDone: "Die heutige Rezitation ist gespeichert.", chooseVerse: "Vers wählen", saveEntry: "Heutigen Eintrag speichern", saved: "Gespeichert",
  wordCheck: "Wortprüfung (optional)", wordCheckStart: "Wortprüfung starten", wordCheckStop: "Beenden", wordCheckNa: "Die Worterkennung für Arabisch auf dem Gerät ist hier nicht verfügbar.", accuracy: "Genauigkeit {n} %",
  chartLoud: "Lautstärke pro Woche (Durchschnittspegel)", chartPace: "Tempo pro Woche (Wörter pro Minute)", chartAcc: "Genauigkeit der Wortprüfung pro Woche", chartEmpty: "Die Diagramme erscheinen nach Ihren ersten Einträgen.",
  loudNote: "Die Lautstärke ist der durchschnittliche Mikrofonpegel; sie hängt vom Gerät und vom Abstand ab.",
  entries: "Einträge", streak: "{n} Tage in Folge", noEntries: "Noch keine Einträge.", delete: "Löschen", weekOf: "Woche ab {d}",
  signIn: "Melden Sie sich an, um Mentoring und Saisons zu nutzen.", signInBtn: "Anmelden", age16: "Mentoring und Saisons stehen ab 16 Jahren mit einem Profil in Quran Talents offen.", needProfile: "Legen Sie zuerst Ihr Profil in Quran Talents an.", openTalents: "Quran Talents öffnen",
  yourMentors: "Ihre Mentoren", askMaster: "Einen Meister fragen", askLead: "Aufgeführt sind nur verifizierte Meister, mit denen Sie verbunden sind (Stufe Meister oder Scheich, goldenes oder offizielles Abzeichen).",
  noMasters: "Noch keine verbundenen Meister. Verbinden Sie sich zuerst in Quran Talents mit einem Meister.", ask: "Um Mentoring bitten", requested: "Angefragt", accepted: "Mentor", endMentoring: "Beenden",
  yourStudents: "Ihre Schüler", requests: "Anfragen", accept: "Annehmen", decline: "Ablehnen", toReview: "Zu bewertende Aufnahmen", none: "Noch nichts vorhanden.",
  yourRecordings: "Ihre Aufnahmen", send: "Aufnahme senden", pending: "Wartet auf Rückmeldung", reviewed: "Rückmeldung erhalten", expires: "Wird am {d} gelöscht", deletedFile: "Die Aufnahme wurde nach 60 Tagen gelöscht.",
  sendTo: "Aufnahme an {name} senden", record3060: "Nehmen Sie 30–60 Sekunden des Verses auf.", tooShort: "Bitte mindestens 30 Sekunden.", autoStop: "Die Aufnahme endet automatisch nach {s} Sekunden.",
  noteLabel: "Notiz (optional)", sendBtn: "Senden", sent: "Gesendet", privateRec: "Ihre Aufnahme ist privat: Nur Ihr Mentor hört sie. Sie wird nach 60 Tagen gelöscht.",
  feedback: "Rückmeldung", r_makharij: "Makharidsch", r_tajweed: "Tadschwid", r_waqf: "Waqf und Ibtida", r_pace: "Tempo", r_maqam: "Maqam", scaleHint: "1 = ausbaufähig, 5 = ausgezeichnet",
  comment: "Kommentar", commentHint: "Kurz, freundlich und konkret. Links und Kontaktdaten sind nicht erlaubt.", sendFeedback: "Rückmeldung senden", feedbackSent: "Rückmeldung gesendet", total: "{n} von 25",
  fromName: "Von {name}", withdraw: "Zurückziehen", jury: "Jury",
  e_text_not_allowed: "Dieser Text ist nicht erlaubt (Links, Kontaktdaten oder unangemessene Wörter).", e_media_unavailable: "Uploads sind gerade nicht verfügbar.",
  e_too_many_open: "Bei diesem Mentor warten bereits 3 Aufnahmen.", e_too_many_mentors: "Sie können höchstens 5 Mentoren haben.", e_not_connected: "Sie müssen zuerst mit diesem Meister verbunden sein.",
  e_already_entered: "Sie nehmen an dieser Saison bereits teil.", e_season_closed: "Diese Saison ist geschlossen.", e_duration: "Die Aufnahme hat nicht die richtige Länge.", e_text_required: "Bitte schreiben Sie einen kurzen Kommentar.",
  k_month: "Monats-Challenge", k_ramadan: "Ramadan-Challenge", k_special: "Sonder-Challenge",
  openUntil: "Offen bis {d}", judging: "In Bewertung", closed: "Geschlossen", published: "Ergebnisse veröffentlicht", entriesN: "{n} Teilnahmen",
  enter: "An der Challenge teilnehmen", yourEntry: "Ihre Teilnahme", rewards: "Belohnungen: ein mythischer Sticker für den Sieg, legendäre Sticker für die Plätze 2 und 3.",
  recordSeason: "Nehmen Sie {v} auf (bis {s} s).", entryPrivate: "Ihre Teilnahme ist privat: Nur die Jury hört sie, ohne Ihren Namen.", withdrawEntry: "Teilnahme zurückziehen",
  judge: "Teilnahmen bewerten", toJudge: "Zu bewertende Teilnahmen", entry: "Teilnahme {n}", place: "Platz {n}", score: "Wertung {s} von 25", mythic: "Mythischer Sticker", legendary: "Legendärer Sticker",
  noResults: "Noch keine Ergebnisse.", yourResult: "Ihr Ergebnis: Platz {n}",
  // safety (report, block, guidelines) and the mentoring hero note
  safetyFor: "{name} melden oder blockieren", reportRecording: "Aufnahme melden", reportReview: "Rückmeldung melden", blockedNote: "{name} ist blockiert und erscheint hier nicht mehr.", mentoringNote: "Private Aufnahmen, nach 60 Tagen gelöscht. Ab 16 Jahren.",
  adminJudging: "Teilnahme schließen (Bewertung)", adminPublish: "Ergebnisse veröffentlichen", adminNew: "Neue Saison", slug: "Kurzname (a-z, 0-9, -)", startsOn: "Beginn (JJJJ-MM-TT)", endsOn: "Ende (JJJJ-MM-TT)", titleField: "Titel (optional)", create: "Anlegen",
};

const OWN = new Set(["en", "de"]);
const LANGS = new Set(["ar", "tr", "ur", "fa", "ps", "fr", "es", "id", "ms", "bn", "ru", "zh"]);
const bundles = new Map<string, Partial<T> | null>();
const loading = new Set<string>();
const subs = new Set<() => void>();
let ver = 0;
function loadBundle(lang: string) {
  if (OWN.has(lang) || !LANGS.has(lang) || bundles.has(lang) || loading.has(lang)) return;
  loading.add(lang);
  import(`./i18n/${lang}.json`)
    .then((m: { default: Partial<T> }) => { bundles.set(lang, m.default); })
    .catch(() => { bundles.set(lang, null); })
    .finally(() => { loading.delete(lang); cache.delete(lang); ver++; subs.forEach((f) => f()); });
}
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

const cache = new Map<string, T>();
/** the texts in this language; English until the language file has arrived */
export function misharyText(lang: string): T {
  if (lang === "de") return de;
  if (lang === "en" || !LANGS.has(lang)) return en;
  let d = cache.get(lang);
  if (!d) {
    const tr = bundles.get(lang);
    if (!tr) return en;
    d = { ...en, ...tr };
    cache.set(lang, d);
  }
  return d;
}
export const fill = (s: string, p?: Record<string, string | number>) => (p ? s.replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : s);
export type Mt = (k: MtKey, p?: Record<string, string | number>) => string;
export function useMt(): Mt {
  const { lang } = useLang();
  useSyncExternalStore(subscribe, () => ver, () => 0);
  useEffect(() => { loadBundle(lang); }, [lang]);
  const d = misharyText(lang);
  return (k, p) => fill(d[k] ?? en[k] ?? k, p);
}
/** campus tile and entry card (no hook, for data lists) */
export const misharyTile = (lang: string) => { const d = misharyText(lang); return { title: d.cardTitle, sub: d.tileSub, lead: d.cardLead }; };
export const EN_TEXTS = en;
