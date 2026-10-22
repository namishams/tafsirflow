// mirrors mobile/src/features/reciter-path/content2.ts (copied for the website; keep both in step)
// Levels 7–10 of the Reciter Path (maqamat, breath, qira'at, mutashabihat, longer surahs, Masterclass recital).
// Written in our own words, in English, German and Arabic; other languages fall back to English. No Quran text: the
// listening and practice verses are verse keys in curriculum.ts, rendered and played from the word data with the
// reciter the learner has chosen. Where a text names the words of a verse, it holds a token instead of typed words
// (BLUEPRINT §4): {{imlaei:55:13}} is the whole verse, {{imlaei:2:58:11-12}} its words 11–12. resolveQuotes() below
// replaces each token with verseQuote() from the Quran.com data (data/verse-quotes.json, written by
// scripts/gen-verse-quotes.mjs) when useContent() in content.ts reads the texts; the same tokens work in the
// "reciterPathExtra" texts of the language files.
import { verseQuote, type QuoteScript } from "@/lib/verseQuotes";

type Mcq = { q: string; options: string[]; answer: number };
type UnitText = { title: string; intro: string; points: string[]; check: string[]; mcq: Mcq[] };
export type ExtraContent = { levels: Record<string, { title: string; lead: string }>; units: Record<string, UnitText> };

const QUOTE = /\{\{(uthmani|qpc|imlaei):(\d{1,3}:\d{1,3})(?::(\d{1,3})-(\d{1,3}))?\}\}/g;
/** a text with its verse tokens replaced by the words from the Quran data; an unknown verse leaves only its key */
export const withQuotes = (text: string) =>
  text.replace(QUOTE, (_, script: QuoteScript, key: string, from?: string, to?: string) => {
    try {
      return verseQuote(script, key, from ? Number(from) : 1, to ? Number(to) : undefined);
    } catch {
      return key;
    }
  });
const resolveAll = (v: unknown): unknown =>
  typeof v === "string" ? withQuotes(v)
  : Array.isArray(v) ? v.map(resolveAll)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, w]) => [k, resolveAll(w)]))
  : v;
const resolved = new WeakMap<ExtraContent, ExtraContent>();
/** the texts of one language with every verse token replaced (once per texts object) */
export function resolveQuotes(x: ExtraContent): ExtraContent {
  let r = resolved.get(x);
  if (!r) resolved.set(x, (r = resolveAll(x) as ExtraContent));
  return r;
}

const en: ExtraContent = {
  levels: {
    "7": { title: "Maqamat: the melodic modes", lead: "An introduction by ear to the seven modes most often heard in recitation. Explanation and listening only; tajweed always comes first." },
    "8": { title: "Breath and long verses", lead: "Breathe from the belly, plan your stops before you start, and carry long verses without breaking the meaning." },
    "9": { title: "Qira'at and mutashabihat", lead: "The ten readings and their transmitters in overview, and the similar verses that trip up every hafiz." },
    "10": { title: "Longer surahs and Masterclass recital", lead: "al-Mulk, Ya-Sin, ar-Rahman, al-Waqiʿah and al-Kahf, then the final Masterclass recital with certificate." },
  },
  units: {
    "7-1": {
      title: "What a maqam is: Bayati, Saba, Hijaz",
      intro: "A maqam is a melodic mode: a set of notes, a typical path through them and a mood. Reciters use maqamat to carry the meaning, never to change letters or lengths. Bayati is calm and grounded and is often used to open and close a recitation. Saba sounds deep and sorrowful and suits verses of warning and grief. Hijaz has a characteristic wide step that sounds longing and solemn.",
      points: [
        "Bayati: starts low and settles; many reciters open with it.",
        "Saba: heavy and tender; the voice seems to sink at the end of phrases.",
        "Hijaz: the wide second gives a distant, yearning colour.",
        "Scholars differ on studying melodies; all agree that tajweed and humility come before any melody.",
      ],
      check: ["I can describe Bayati, Saba and Hijaz in my own words.", "I listen to al-Fatiha with two different reciters and compare the mood."],
      mcq: [
        { q: "What is a maqam?", options: ["A melodic mode with its own notes and mood", "A tajweed rule", "A type of madd", "A stop sign"], answer: 0 },
        { q: "Which maqam is often used to open a recitation?", options: ["Bayati", "Saba", "Sika", "Ajam"], answer: 0 },
        { q: "May a maqam lengthen a madd beyond its rule?", options: ["No, tajweed always comes first", "Yes, for beauty", "Only in Saba", "Only when stopping"], answer: 0 },
      ],
    },
    "7-2": {
      title: "Rast, Nahawand, Sika and Ajam",
      intro: "Rast is bright and stately, often called the father of the maqamat. Nahawand is gentle and close to a minor scale. Sika rests on a note between two Western notes and sounds soft and inward. Ajam is bright and close to a major scale, used for joyful verses. Listen for the colour, not for the name: you learn maqamat by ear, from teachers and recordings.",
      points: [
        "Rast: firm and noble, uses quarter tones.",
        "Nahawand: soft, reflective, close to minor.",
        "Sika: centred on a quarter-tone note, intimate.",
        "Ajam: bright and open, close to major.",
      ],
      check: ["I can name a mood for each of the seven maqamat.", "I notice when a reciter moves from one maqam to another."],
      mcq: [
        { q: "Which maqam is often called the father of the maqamat?", options: ["Rast", "Hijaz", "Saba", "Nahawand"], answer: 0 },
        { q: "Which maqam is close to a Western major scale?", options: ["Ajam", "Saba", "Sika", "Bayati"], answer: 0 },
        { q: "Which maqam rests on a quarter-tone note?", options: ["Sika", "Ajam", "Nahawand", "Hijaz"], answer: 0 },
      ],
    },
    "7-3": {
      title: "Listening lab: one passage, several voices",
      intro: "Choose a reciter in the settings, play these verses, then change the reciter and listen again. Notice where the voice rises, where it rests and which mood it builds. Recording is the same as in the earlier levels: imitate the melody only after the letters and lengths are correct.",
      points: ["Listen twice before you imitate.", "Imitate one phrase at a time, at slow speed first.", "Compare your recording only for tajweed, then for melody."],
      check: ["I compared at least two reciters on the same verses.", "I recorded one verse with a calm, steady melody."],
      mcq: [{ q: "What do you check first when imitating a reciter?", options: ["Letters and lengths", "The highest note", "The maqam name", "The speed"], answer: 0 }],
    },
    "8-1": {
      title: "Breath control",
      intro: "Breathe low, into the belly, not high into the chest. Fill quietly before a verse, and let the air out slowly and evenly while reciting. A short breath in the middle of a verse is allowed only at a place where the meaning permits a stop; never breathe in while continuing, because a breath means a stop.",
      points: [
        "Sit or stand upright; shoulders stay still when you breathe in.",
        "Practise: breathe in for four counts, recite a long madd steadily for six counts.",
        "Breathing in always counts as waqf: stop properly, then restart at a meaningful place.",
      ],
      check: ["I breathe in silently through the nose or mouth before each verse.", "I can hold a six-count madd evenly."],
      mcq: [
        { q: "Breathing in during recitation counts as …", options: ["a stop (waqf)", "a pause without stopping (sakt)", "nothing", "a madd"], answer: 0 },
        { q: "Where should the breath come from?", options: ["Low, from the belly", "High, from the shoulders", "Only the nose", "It does not matter"], answer: 0 },
      ],
    },
    "8-2": {
      title: "Planning a long verse",
      intro: "Before reciting a long verse, read it once and mark where you will stop: at a stop sign that allows it, or after a complete phrase. If you have to stop at an unsuitable place, go back one or two words and restart so that the meaning stays whole. The longest verse of the Quran, about debt, is the classic exercise.",
      points: ["Mark the stop signs first, then decide on your breath points.", "Never start a new breath on a word that depends on the word before it.", "Use the slower speed until the plan sits."],
      check: ["I planned my stops for the verse of debt before reciting it.", "When I stopped at an unsuitable place, I went back and restarted well."],
      mcq: [
        { q: "You ran out of breath in the middle of a phrase. What do you do?", options: ["Go back and restart where the meaning is whole", "Continue from the next word", "Start the surah again", "Skip the phrase"], answer: 0 },
        { q: "What do you mark first when planning a long verse?", options: ["The stop signs", "The maqam", "The tanween", "The page number"], answer: 0 },
      ],
    },
    "8-3": {
      title: "Applied: Ayat al-Kursi and the end of al-Baqarah",
      intro: "Recite Ayat al-Kursi and the last two verses of al-Baqarah with a breath plan. Keep madd lengths constant across the whole passage: a madd munfasil that is four counts at the start stays four counts at the end.",
      points: ["Choose one length for madd munfasil and keep it.", "Plan two or three breath points in Ayat al-Kursi."],
      check: ["My madd lengths stayed consistent.", "I recited Ayat al-Kursi with a planned breath."],
      mcq: [{ q: "Once you chose four counts for madd munfasil, you …", options: ["keep four counts throughout", "change freely", "use two counts at the end", "use six counts when tired"], answer: 0 }],
    },
    "9-1": {
      title: "The seven and ten qira'at",
      intro: "The Quran was passed on in several authentic readings (qira'at), each named after a master reader and handed down by two main transmitters (riwayat). The seven: Nafiʿ (Qalun, Warsh), Ibn Kathir (al-Bazzi, Qunbul), Abu ʿAmr (ad-Duri, as-Susi), Ibn ʿAmir (Hisham, Ibn Dhakwan), ʿAsim (Shuʿbah, Hafs), Hamzah (Khalaf, Khallad) and al-Kisaʾi (Abu l-Harith, ad-Duri). With Abu Jaʿfar, Yaʿqub and Khalaf al-ʿAshir they are ten. This app recites in Hafs ʿan ʿAsim, the most widespread riwayah today; Warsh is common in North and West Africa, Qalun in Libya and Tunisia, ad-Duri ʿan Abi ʿAmr in parts of Sudan.",
      points: [
        "A qira'ah is the reading of a master; a riwayah is one transmitter's line from him.",
        "All authentic readings are Quran; none is a dialect error or a later addition.",
        "Learning another riwayah needs a teacher with a sanad in that riwayah.",
      ],
      check: ["I can name the seven readers and the two transmitters of ʿAsim.", "I know which riwayah I recite."],
      mcq: [
        { q: "Hafs transmits the reading of …", options: ["ʿAsim", "Nafiʿ", "Ibn Kathir", "Hamzah"], answer: 0 },
        { q: "Warsh and Qalun transmit the reading of …", options: ["Nafiʿ", "Abu ʿAmr", "al-Kisaʾi", "Ibn ʿAmir"], answer: 0 },
        { q: "ad-Duri and as-Susi transmit from …", options: ["Abu ʿAmr", "ʿAsim", "Hamzah", "Yaʿqub"], answer: 0 },
        { q: "How many readings are counted with Abu Jaʿfar, Yaʿqub and Khalaf?", options: ["Ten", "Seven", "Fourteen", "Four"], answer: 0 },
      ],
    },
    "9-2": {
      title: "Differences explained",
      intro: "Differences between readings are of two kinds. Some concern the sound only: Warsh lengthens madd munfasil to six counts, moves the hamza onto a preceding silent letter (naql) and leans some alifs toward ya (taqlil); Qalun may join the meem of the plural to a long u (silat al-meem). Others concern the word: in al-Fatiha, verse 4, ʿAsim and al-Kisaʾi read with a long a, meaning “Owner”, while Nafiʿ and others read it short, meaning “King”; both meanings are true. In al-Baqarah, verses 9 and 10, other readers have forms that differ from Hafs in a letter or in the stem. Listen to the verses here in Hafs and read the explanation for the other readings.",
      points: ["Sound differences: madd lengths, hamza, imala, tafkhim of ra.", "Word differences: a long vowel, a doubled letter, a different person of the verb.", "Never mix riwayat within one recitation without the knowledge to do so."],
      check: ["I can explain the two readings of al-Fatiha, verse 4.", "I can name two sound features of Warsh."],
      mcq: [
        { q: "Warsh recites madd munfasil with …", options: ["six counts", "two counts", "no madd", "one count"], answer: 0 },
        { q: "In al-Fatiha 1:4 the reading with a long a means …", options: ["Owner", "King", "Lord", "Judge"], answer: 0 },
        { q: "Naql in Warsh means …", options: ["moving the hamza's vowel to the silent letter before it", "doubling a letter", "stopping early", "a heavy lam"], answer: 0 },
      ],
    },
    "9-3": {
      title: "Mutashabihat for hifz: Adam and Bani Israʾil",
      intro: "Mutashabihat are verses that look almost alike. They are the most common reason for mistakes in memorisation. Compare the pairs here: in al-Baqarah Adam is told “and eat” with waw, in al-Aʿraf “so eat” with fa; the order of “{{imlaei:2:58:11-12}}” (entering the gate) and “{{imlaei:2:58:14-15}}” (saying hittah) is reversed between al-Baqarah (2:58) and al-Aʿraf (7:161); and the punishment of Pharaoh's people uses one verb in al-Baqarah and Ibrahim (with an added waw in Ibrahim) and another in al-Aʿraf.",
      points: [
        "Learn pairs together, never one without the other.",
        "Find a hook: a letter, the order of words, the surah's theme.",
        "Recite both verses aloud one after the other and say the surah name.",
      ],
      check: ["I recite each pair without mixing them.", "I have a hook for every pair."],
      mcq: [
        { q: "What are mutashabihat in hifz?", options: ["Verses that look almost alike", "Abrogated verses", "Verses with sajdah", "The longest verses"], answer: 0 },
        { q: "The best way to learn a similar pair is …", options: ["together, with a hook for the difference", "one per year", "only the first one", "without listening"], answer: 0 },
      ],
    },
    "9-4": {
      title: "Mutashabihat: the believers' list",
      intro: "al-Baqarah 2:62 and al-Maʾidah 5:69 list the same groups, but the order and the grammatical case of one word differ. Listen to both, mark the difference in the word data and recite them back to back until the switch is automatic.",
      points: ["Mark the word that changes position.", "Say the surah name before reciting each verse."],
      check: ["I recite 2:62 and 5:69 without confusing the order."],
      mcq: [{ q: "What helps you to keep two similar verses apart?", options: ["Saying the surah name and the different word", "Reciting faster", "Skipping one", "Changing the maqam"], answer: 0 }],
    },
    "10-1": {
      title: "Surah al-Mulk",
      intro: "Thirty verses, often recited at night. Work in two halves: listen, repeat at slow speed, record, compare, then use the word check for memorisation.",
      points: ["Watch the many qalqalah letters and the madd lazim.", "Keep a steady speed across all thirty verses."],
      check: ["I recite verses 1–15 fluently.", "I recite verses 16–30 fluently."],
      mcq: [{ q: "How many verses does al-Mulk have?", options: ["30", "40", "29", "83"], answer: 0 }],
    },
    "10-2": {
      title: "Surah Ya-Sin, opening",
      intro: "The opening of Ya-Sin starts with separate letters (huruf muqattaʿah), recited as letter names with their madd. Then come the stories of the town and the messengers.",
      points: ["Ya-Sin is read as the names of two letters, with madd lazim on sin.", "Plan breaths for the longer narrative verses."],
      check: ["I recite the separate letters with their correct madd.", "I recite the opening verses without looking."],
      mcq: [{ q: "The separate letters at the start of Ya-Sin are recited as …", options: ["letter names with madd", "one word", "silent letters", "tanween"], answer: 0 }],
    },
    "10-3": {
      title: "Surah ar-Rahman",
      intro: "The refrain “{{imlaei:55:13}}” (first at 55:13), in essence a question about the Lord's favours, returns again and again. Keep it identical every time: the same madd, the same melody, the same clear ghunnah.",
      points: ["Recite the refrain the same way each time.", "Use the refrain to check your breath: one breath per refrain."],
      check: ["My refrain is identical every time.", "I recite the first section without looking."],
      mcq: [{ q: "What stays identical in the refrain of ar-Rahman?", options: ["Madd, ghunnah and melody", "Only the speed", "Nothing", "The stop sign"], answer: 0 }],
    },
    "10-4": {
      title: "Surah al-Waqiʿah and the first ten of al-Kahf",
      intro: "al-Waqiʿah has short, rhythmic verses that test steady speed; the first ten verses of al-Kahf are recommended to be memorised. Plan your stops at the sakt in al-Kahf, verse 1, where Hafs pauses briefly without breathing.",
      points: ["Sakt: a short pause without a breath, then continue.", "Keep the rhythm of al-Waqiʿah even."],
      check: ["I make the sakt at the end of al-Kahf, verse 1, without breathing.", "I recite al-Kahf 1–10 without looking."],
      mcq: [{ q: "Sakt means …", options: ["a short pause without taking a breath", "a long stop with breath", "a heavy ra", "a doubled letter"], answer: 0 }],
    },
    "10-5": {
      title: "Masterclass recital",
      intro: "Your final recital: al-Fatiha, Ayat al-Kursi and the opening of al-Mulk, as if in front of a teacher. Record the whole passage in one go, listen back and tick the self-check honestly. Then take the level exam: passing it earns the Masterclass certificate of the Reciter Path. It is an app certificate, not an ijazah; for an ijazah, recite to a qualified teacher.",
      points: ["Recite in one go, with your breath plan.", "Listen back once for tajweed, once for stops, once for melody.", "Share your recording with a teacher for feedback."],
      check: ["All letters leave from their makharij.", "Every madd has its length and stays consistent.", "Noon, meem and ghunnah rules are applied.", "My stops and restarts keep the meaning whole.", "My melody serves the meaning and never changes the letters."],
      mcq: [
        { q: "Idgham with ghunnah happens with the letters …", options: ["ي ن م و", "ء ه ع ح", "ق ط ب ج د", "ل ر"], answer: 0 },
        { q: "Madd lazim is …", options: ["six counts", "two counts", "four or five counts", "optional"], answer: 0 },
        { q: "The lam of Allah after a damma is …", options: ["heavy", "light", "silent", "echoed"], answer: 0 },
        { q: "Breathing in during recitation counts as …", options: ["a stop", "a sakt", "a madd", "nothing"], answer: 0 },
        { q: "Which riwayah does this app recite?", options: ["Hafs ʿan ʿAsim", "Warsh ʿan Nafiʿ", "Qalun ʿan Nafiʿ", "ad-Duri ʿan Abi ʿAmr"], answer: 0 },
        { q: "Can the app certificate replace an ijazah?", options: ["No", "Yes", "Only for level 10", "Only with Pro"], answer: 0 },
      ],
    },
  },
};

const de: ExtraContent = {
  levels: {
    "7": { title: "Maqamat: die melodischen Modi", lead: "Eine Einführung nach Gehör in die sieben Modi, die man in der Rezitation am häufigsten hört. Nur Erklärung und Hören; Tadschwid hat immer Vorrang." },
    "8": { title: "Atem und lange Verse", lead: "Atmen Sie aus dem Bauch, planen Sie Ihre Pausen vor dem Beginn und tragen Sie lange Verse, ohne den Sinn zu brechen." },
    "9": { title: "Qiraʾat und Mutaschabihat", lead: "Die zehn Lesarten und ihre Überlieferer im Überblick und die ähnlichen Verse, über die jeder Hafiz stolpert." },
    "10": { title: "Längere Suren und Masterclass-Rezitation", lead: "al-Mulk, Ya-Sin, ar-Rahman, al-Waqiʿa und al-Kahf, dann die abschließende Masterclass-Rezitation mit Zertifikat." },
  },
  units: {
    "7-1": {
      title: "Was ein Maqam ist: Bayati, Saba, Hidschaz",
      intro: "Ein Maqam ist ein melodischer Modus: eine Tonreihe, ein typischer Weg durch sie und eine Stimmung. Rezitatoren nutzen Maqamat, um den Sinn zu tragen, nie um Buchstaben oder Längen zu verändern. Bayati ist ruhig und geerdet und eröffnet und beschließt oft eine Rezitation. Saba klingt tief und traurig und passt zu Versen der Warnung und Trauer. Hidschaz hat einen auffälligen weiten Schritt, der sehnsuchtsvoll und feierlich klingt.",
      points: [
        "Bayati: beginnt tief und kommt zur Ruhe; viele Rezitatoren beginnen damit.",
        "Saba: schwer und zart; die Stimme scheint am Ende der Phrasen zu sinken.",
        "Hidschaz: die weite Sekunde gibt eine ferne, sehnsuchtsvolle Farbe.",
        "Gelehrte sind sich über das Studium von Melodien uneins; alle sind sich einig, dass Tadschwid und Demut vor jeder Melodie kommen.",
      ],
      check: ["Ich kann Bayati, Saba und Hidschaz mit eigenen Worten beschreiben.", "Ich höre al-Fatiha mit zwei Rezitatoren und vergleiche die Stimmung."],
      mcq: [
        { q: "Was ist ein Maqam?", options: ["Ein melodischer Modus mit eigenen Tönen und eigener Stimmung", "Eine Tadschwid-Regel", "Eine Madd-Art", "Ein Pausenzeichen"], answer: 0 },
        { q: "Mit welchem Maqam beginnt man oft eine Rezitation?", options: ["Bayati", "Saba", "Sika", "Adscham"], answer: 0 },
        { q: "Darf ein Maqam einen Madd über seine Regel hinaus dehnen?", options: ["Nein, Tadschwid hat immer Vorrang", "Ja, für die Schönheit", "Nur in Saba", "Nur beim Anhalten"], answer: 0 },
      ],
    },
    "7-2": {
      title: "Rast, Nahawand, Sika und Adscham",
      intro: "Rast ist hell und würdevoll und wird oft Vater der Maqamat genannt. Nahawand ist sanft und einer Molltonleiter nahe. Sika ruht auf einem Ton zwischen zwei westlichen Tönen und klingt weich und nach innen gekehrt. Adscham ist hell und einer Durtonleiter nahe und wird für freudige Verse genutzt. Hören Sie auf die Farbe, nicht auf den Namen: Maqamat lernt man nach Gehör, von Lehrkräften und Aufnahmen.",
      points: ["Rast: fest und edel, mit Vierteltönen.", "Nahawand: weich, nachdenklich, nahe an Moll.", "Sika: um einen Viertelton zentriert, innig.", "Adscham: hell und offen, nahe an Dur."],
      check: ["Ich kann für jeden der sieben Maqamat eine Stimmung nennen.", "Ich bemerke, wenn ein Rezitator von einem Maqam in einen anderen wechselt."],
      mcq: [
        { q: "Welcher Maqam wird oft Vater der Maqamat genannt?", options: ["Rast", "Hidschaz", "Saba", "Nahawand"], answer: 0 },
        { q: "Welcher Maqam ist einer westlichen Durtonleiter nahe?", options: ["Adscham", "Saba", "Sika", "Bayati"], answer: 0 },
        { q: "Welcher Maqam ruht auf einem Viertelton?", options: ["Sika", "Adscham", "Nahawand", "Hidschaz"], answer: 0 },
      ],
    },
    "7-3": {
      title: "Hörlabor: eine Passage, mehrere Stimmen",
      intro: "Wählen Sie in den Einstellungen einen Rezitator, spielen Sie diese Verse ab, wechseln Sie dann den Rezitator und hören Sie erneut. Achten Sie darauf, wo die Stimme steigt, wo sie ruht und welche Stimmung sie aufbaut. Die Aufnahme funktioniert wie in den früheren Stufen: Ahmen Sie die Melodie erst nach, wenn Buchstaben und Längen stimmen.",
      points: ["Hören Sie zweimal, bevor Sie nachahmen.", "Ahmen Sie Phrase für Phrase nach, zuerst langsam.", "Vergleichen Sie Ihre Aufnahme zuerst auf Tadschwid, dann auf Melodie."],
      check: ["Ich habe mindestens zwei Rezitatoren mit denselben Versen verglichen.", "Ich habe einen Vers mit ruhiger, gleichmäßiger Melodie aufgenommen."],
      mcq: [{ q: "Was prüfen Sie zuerst, wenn Sie einen Rezitator nachahmen?", options: ["Buchstaben und Längen", "Den höchsten Ton", "Den Namen des Maqam", "Das Tempo"], answer: 0 }],
    },
    "8-1": {
      title: "Atemführung",
      intro: "Atmen Sie tief in den Bauch, nicht hoch in die Brust. Füllen Sie vor einem Vers leise auf und lassen Sie die Luft beim Rezitieren langsam und gleichmäßig ausströmen. Ein kurzer Atemzug mitten im Vers ist nur an einer Stelle erlaubt, an der der Sinn ein Anhalten zulässt; atmen Sie nie ein und lesen dann einfach weiter, denn Einatmen bedeutet Anhalten.",
      points: ["Sitzen oder stehen Sie aufrecht; die Schultern bleiben beim Einatmen ruhig.", "Übung: vier Zählzeiten einatmen, einen langen Madd gleichmäßig sechs Zählzeiten halten.", "Einatmen gilt immer als Waqf: richtig anhalten, dann an sinnvoller Stelle neu beginnen."],
      check: ["Ich atme vor jedem Vers leise ein.", "Ich kann einen Madd von sechs Zählzeiten gleichmäßig halten."],
      mcq: [
        { q: "Einatmen während der Rezitation gilt als …", options: ["Anhalten (Waqf)", "Pause ohne Anhalten (Sakt)", "nichts", "Madd"], answer: 0 },
        { q: "Woher soll der Atem kommen?", options: ["Tief aus dem Bauch", "Hoch aus den Schultern", "Nur aus der Nase", "Das ist egal"], answer: 0 },
      ],
    },
    "8-2": {
      title: "Einen langen Vers planen",
      intro: "Lesen Sie einen langen Vers vor dem Rezitieren einmal und markieren Sie, wo Sie anhalten: an einem Pausenzeichen, das es erlaubt, oder nach einer vollständigen Phrase. Müssen Sie an einer ungeeigneten Stelle anhalten, gehen Sie ein oder zwei Wörter zurück und beginnen neu, damit der Sinn ganz bleibt. Der längste Vers des Korans, über die Schuld, ist die klassische Übung.",
      points: ["Markieren Sie zuerst die Pausenzeichen, dann Ihre Atempunkte.", "Beginnen Sie nie einen neuen Atem mit einem Wort, das vom vorigen abhängt.", "Nutzen Sie das langsame Tempo, bis der Plan sitzt."],
      check: ["Ich habe meine Pausen für den Vers über die Schuld vor dem Rezitieren geplant.", "Als ich an einer ungeeigneten Stelle anhielt, bin ich zurückgegangen und habe gut neu begonnen."],
      mcq: [
        { q: "Ihnen geht mitten in einer Phrase der Atem aus. Was tun Sie?", options: ["Zurückgehen und dort neu beginnen, wo der Sinn ganz ist", "Ab dem nächsten Wort weiterlesen", "Die Sure neu beginnen", "Die Phrase auslassen"], answer: 0 },
        { q: "Was markieren Sie zuerst beim Planen eines langen Verses?", options: ["Die Pausenzeichen", "Den Maqam", "Das Tanwin", "Die Seitenzahl"], answer: 0 },
      ],
    },
    "8-3": {
      title: "Angewandt: Ayat al-Kursi und das Ende von al-Baqara",
      intro: "Rezitieren Sie Ayat al-Kursi und die letzten beiden Verse von al-Baqara mit einem Atemplan. Halten Sie die Madd-Längen über die ganze Passage gleich: Ein Madd munfasil mit vier Zählzeiten am Anfang bleibt auch am Ende vier Zählzeiten lang.",
      points: ["Wählen Sie eine Länge für Madd munfasil und behalten Sie sie bei.", "Planen Sie zwei oder drei Atempunkte in Ayat al-Kursi."],
      check: ["Meine Madd-Längen blieben gleich.", "Ich habe Ayat al-Kursi mit geplantem Atem rezitiert."],
      mcq: [{ q: "Sie haben vier Zählzeiten für Madd munfasil gewählt. Dann …", options: ["bleiben Sie durchgehend bei vier", "wechseln Sie frei", "nehmen Sie am Ende zwei", "nehmen Sie bei Müdigkeit sechs"], answer: 0 }],
    },
    "9-1": {
      title: "Die sieben und zehn Qiraʾat",
      intro: "Der Koran wurde in mehreren authentischen Lesarten (Qiraʾat) überliefert, jede nach einem Meisterleser benannt und von zwei Hauptüberlieferern (Riwayat) weitergegeben. Die sieben: Nafiʿ (Qalun, Warsch), Ibn Kathir (al-Bazzi, Qunbul), Abu ʿAmr (ad-Duri, as-Susi), Ibn ʿAmir (Hischam, Ibn Dhakwan), ʿAsim (Schuʿba, Hafs), Hamza (Khalaf, Khallad) und al-Kisaʾi (Abu l-Harith, ad-Duri). Mit Abu Dschaʿfar, Yaʿqub und Khalaf al-ʿAschir sind es zehn. Diese App rezitiert in Hafs ʿan ʿAsim, der heute verbreitetsten Riwaya; Warsch ist in Nord- und Westafrika verbreitet, Qalun in Libyen und Tunesien, ad-Duri ʿan Abi ʿAmr in Teilen des Sudan.",
      points: ["Eine Qiraʾa ist die Lesart eines Meisters; eine Riwaya ist die Linie eines Überlieferers von ihm.", "Alle authentischen Lesarten sind Koran; keine ist ein Dialektfehler oder spätere Zutat.", "Eine andere Riwaya lernt man bei einer Lehrkraft mit Sanad in dieser Riwaya."],
      check: ["Ich kann die sieben Leser und die beiden Überlieferer von ʿAsim nennen.", "Ich weiß, in welcher Riwaya ich rezitiere."],
      mcq: [
        { q: "Hafs überliefert die Lesart von …", options: ["ʿAsim", "Nafiʿ", "Ibn Kathir", "Hamza"], answer: 0 },
        { q: "Warsch und Qalun überliefern die Lesart von …", options: ["Nafiʿ", "Abu ʿAmr", "al-Kisaʾi", "Ibn ʿAmir"], answer: 0 },
        { q: "ad-Duri und as-Susi überliefern von …", options: ["Abu ʿAmr", "ʿAsim", "Hamza", "Yaʿqub"], answer: 0 },
        { q: "Wie viele Lesarten zählt man mit Abu Dschaʿfar, Yaʿqub und Khalaf?", options: ["Zehn", "Sieben", "Vierzehn", "Vier"], answer: 0 },
      ],
    },
    "9-2": {
      title: "Unterschiede erklärt",
      intro: "Unterschiede zwischen den Lesarten sind von zweierlei Art. Manche betreffen nur den Klang: Warsch dehnt Madd munfasil auf sechs Zählzeiten, verschiebt die Hamza auf einen vorangehenden stillen Buchstaben (Naql) und neigt manche Alifs zum Ya (Taqlil); Qalun kann das Mim des Plurals mit einem langen u verbinden (Silat al-Mim). Andere betreffen das Wort: In al-Fatiha, Vers 4, lesen ʿAsim und al-Kisaʾi mit langem a, „Besitzer“, Nafiʿ und andere kurz, „König“; beide Bedeutungen sind wahr. In al-Baqara, Verse 9 und 10, haben andere Leser Formen, die sich von Hafs in einem Buchstaben oder im Verbstamm unterscheiden. Hören Sie die Verse hier in Hafs und lesen Sie die Erklärung zu den anderen Lesarten.",
      points: ["Klangunterschiede: Madd-Längen, Hamza, Imala, Tafkhim des Ra.", "Wortunterschiede: ein langer Vokal, ein verdoppelter Buchstabe, eine andere Person des Verbs.", "Mischen Sie Riwayat nie in einer Rezitation ohne das Wissen dafür."],
      check: ["Ich kann die beiden Lesarten von al-Fatiha, Vers 4, erklären.", "Ich kann zwei Klangmerkmale von Warsch nennen."],
      mcq: [
        { q: "Warsch rezitiert Madd munfasil mit …", options: ["sechs Zählzeiten", "zwei Zählzeiten", "keinem Madd", "einer Zählzeit"], answer: 0 },
        { q: "In al-Fatiha 1:4 bedeutet die Lesart mit langem a …", options: ["Besitzer", "König", "Herr", "Richter"], answer: 0 },
        { q: "Naql bei Warsch bedeutet …", options: ["den Vokal der Hamza auf den stillen Buchstaben davor zu verschieben", "einen Buchstaben zu verdoppeln", "früh anzuhalten", "ein schweres Lam"], answer: 0 },
      ],
    },
    "9-3": {
      title: "Mutaschabihat fürs Hifz: Adam und Bani Israʾil",
      intro: "Mutaschabihat sind Verse, die fast gleich aussehen. Sie sind der häufigste Grund für Fehler beim Auswendiglernen. Vergleichen Sie die Paare hier: In al-Baqara wird Adam „und esst“ mit Waw gesagt, in al-Aʿraf „so esst“ mit Fa; die Reihenfolge von „{{imlaei:2:58:11-12}}“ (durch das Tor eintreten) und „{{imlaei:2:58:14-15}}“ (Hitta sagen) ist zwischen al-Baqara (2:58) und al-Aʿraf (7:161) vertauscht; und die Strafe an Pharaos Leuten steht in al-Baqara und Ibrahim mit einem Verb (in Ibrahim mit zusätzlichem Waw), in al-Aʿraf mit einem anderen.",
      points: ["Lernen Sie Paare zusammen, nie eines ohne das andere.", "Suchen Sie einen Anker: einen Buchstaben, die Wortfolge, das Thema der Sure.", "Rezitieren Sie beide Verse laut nacheinander und nennen Sie den Surennamen."],
      check: ["Ich rezitiere jedes Paar, ohne es zu verwechseln.", "Ich habe für jedes Paar einen Anker."],
      mcq: [
        { q: "Was sind Mutaschabihat beim Hifz?", options: ["Verse, die fast gleich aussehen", "Abrogierte Verse", "Verse mit Sadschda", "Die längsten Verse"], answer: 0 },
        { q: "Wie lernt man ein ähnliches Paar am besten?", options: ["Zusammen, mit einem Anker für den Unterschied", "Eines pro Jahr", "Nur das erste", "Ohne Hören"], answer: 0 },
      ],
    },
    "9-4": {
      title: "Mutaschabihat: die Liste der Gläubigen",
      intro: "al-Baqara 2:62 und al-Maʾida 5:69 nennen dieselben Gruppen, doch die Reihenfolge und der grammatische Fall eines Wortes unterscheiden sich. Hören Sie beide, markieren Sie den Unterschied in den Wortdaten und rezitieren Sie sie direkt nacheinander, bis der Wechsel sitzt.",
      points: ["Markieren Sie das Wort, das die Stelle wechselt.", "Nennen Sie vor jedem Vers den Surennamen."],
      check: ["Ich rezitiere 2:62 und 5:69, ohne die Reihenfolge zu verwechseln."],
      mcq: [{ q: "Was hilft, zwei ähnliche Verse auseinanderzuhalten?", options: ["Den Surennamen und das abweichende Wort nennen", "Schneller rezitieren", "Einen auslassen", "Den Maqam wechseln"], answer: 0 }],
    },
    "10-1": {
      title: "Sure al-Mulk",
      intro: "Dreißig Verse, oft nachts rezitiert. Arbeiten Sie in zwei Hälften: hören, langsam wiederholen, aufnehmen, vergleichen, dann mit der Wortprüfung das Auswendiglernen prüfen.",
      points: ["Achten Sie auf die vielen Qalqala-Buchstaben und den Madd lazim.", "Halten Sie über alle dreißig Verse ein gleichmäßiges Tempo."],
      check: ["Ich rezitiere die Verse 1–15 flüssig.", "Ich rezitiere die Verse 16–30 flüssig."],
      mcq: [{ q: "Wie viele Verse hat al-Mulk?", options: ["30", "40", "29", "83"], answer: 0 }],
    },
    "10-2": {
      title: "Sure Ya-Sin, Anfang",
      intro: "Der Anfang von Ya-Sin beginnt mit getrennten Buchstaben (Huruf muqattaʿa), die als Buchstabennamen mit ihrem Madd rezitiert werden. Dann folgen die Geschichten der Stadt und der Gesandten.",
      points: ["Ya-Sin wird als Namen zweier Buchstaben gelesen, mit Madd lazim auf Sin.", "Planen Sie Atempausen für die längeren erzählenden Verse."],
      check: ["Ich rezitiere die getrennten Buchstaben mit dem richtigen Madd.", "Ich rezitiere die Anfangsverse ohne hinzusehen."],
      mcq: [{ q: "Die getrennten Buchstaben am Anfang von Ya-Sin werden rezitiert als …", options: ["Buchstabennamen mit Madd", "ein Wort", "stumme Buchstaben", "Tanwin"], answer: 0 }],
    },
    "10-3": {
      title: "Sure ar-Rahman",
      intro: "Der Kehrvers „{{imlaei:55:13}}“ (zuerst 55:13), sinngemäß eine Frage nach den Wohltaten des Herrn, kehrt immer wieder. Halten Sie ihn jedes Mal gleich: derselbe Madd, dieselbe Melodie, dieselbe klare Ghunna.",
      points: ["Rezitieren Sie den Kehrvers jedes Mal gleich.", "Nutzen Sie den Kehrvers als Atemprobe: ein Atem pro Kehrvers."],
      check: ["Mein Kehrvers ist jedes Mal gleich.", "Ich rezitiere den ersten Abschnitt ohne hinzusehen."],
      mcq: [{ q: "Was bleibt im Kehrvers von ar-Rahman gleich?", options: ["Madd, Ghunna und Melodie", "Nur das Tempo", "Nichts", "Das Pausenzeichen"], answer: 0 }],
    },
    "10-4": {
      title: "Sure al-Waqiʿa und die ersten zehn von al-Kahf",
      intro: "al-Waqiʿa hat kurze, rhythmische Verse, die ein gleichmäßiges Tempo prüfen; die ersten zehn Verse von al-Kahf soll man auswendig lernen. Planen Sie die Pause beim Sakt in al-Kahf, Vers 1, wo Hafs kurz innehält, ohne zu atmen.",
      points: ["Sakt: kurzes Innehalten ohne Atem, dann weiter.", "Halten Sie den Rhythmus von al-Waqiʿa gleichmäßig."],
      check: ["Ich mache den Sakt am Ende von al-Kahf, Vers 1, ohne zu atmen.", "Ich rezitiere al-Kahf 1–10 ohne hinzusehen."],
      mcq: [{ q: "Sakt bedeutet …", options: ["kurzes Innehalten ohne Atem", "langes Anhalten mit Atem", "schweres Ra", "verdoppelter Buchstabe"], answer: 0 }],
    },
    "10-5": {
      title: "Masterclass-Rezitation",
      intro: "Ihre Abschlussrezitation: al-Fatiha, Ayat al-Kursi und der Anfang von al-Mulk, als säßen Sie vor einer Lehrkraft. Nehmen Sie die ganze Passage in einem Zug auf, hören Sie sie an und haken Sie die Selbstkontrolle ehrlich ab. Legen Sie dann die Stufenprüfung ab: Wer sie besteht, erhält das Masterclass-Zertifikat des Rezitationspfads. Es ist ein App-Zertifikat, keine Idschaza; für eine Idschaza rezitieren Sie bei einer qualifizierten Lehrkraft.",
      points: ["Rezitieren Sie in einem Zug, mit Ihrem Atemplan.", "Hören Sie einmal auf Tadschwid, einmal auf Pausen, einmal auf Melodie.", "Teilen Sie Ihre Aufnahme mit einer Lehrkraft für Rückmeldung."],
      check: ["Alle Buchstaben kommen aus ihren Makharidsch.", "Jeder Madd hat seine Länge und bleibt gleich.", "Die Regeln für Nun, Mim und Ghunna sind angewendet.", "Meine Pausen und Neuanfänge erhalten den Sinn.", "Meine Melodie dient dem Sinn und verändert nie die Buchstaben."],
      mcq: [
        { q: "Idgham mit Ghunna geschieht bei den Buchstaben …", options: ["ي ن م و", "ء ه ع ح", "ق ط ب ج د", "ل ر"], answer: 0 },
        { q: "Madd lazim hat …", options: ["sechs Zählzeiten", "zwei Zählzeiten", "vier oder fünf Zählzeiten", "freie Länge"], answer: 0 },
        { q: "Das Lam von Allah nach einer Damma ist …", options: ["schwer", "leicht", "stumm", "mit Echo"], answer: 0 },
        { q: "Einatmen während der Rezitation gilt als …", options: ["Anhalten", "Sakt", "Madd", "nichts"], answer: 0 },
        { q: "In welcher Riwaya rezitiert diese App?", options: ["Hafs ʿan ʿAsim", "Warsch ʿan Nafiʿ", "Qalun ʿan Nafiʿ", "ad-Duri ʿan Abi ʿAmr"], answer: 0 },
        { q: "Kann das App-Zertifikat eine Idschaza ersetzen?", options: ["Nein", "Ja", "Nur für Stufe 10", "Nur mit Pro"], answer: 0 },
      ],
    },
  },
};

const ar: ExtraContent = {
  levels: {
    "7": { title: "المقامات: الأنماط اللحنية", lead: "مدخل سماعي إلى المقامات السبعة الأكثر سماعًا في التلاوة. شرح واستماع فقط، والتجويد مقدَّم دائمًا." },
    "8": { title: "النفَس والآيات الطويلة", lead: "تنفّس من البطن، وخطّط لوقفاتك قبل البدء، واحمل الآيات الطويلة دون أن ينقطع المعنى." },
    "9": { title: "القراءات والمتشابهات", lead: "القراءات العشر ورواتها في نظرة عامة، والآيات المتشابهة التي يتعثّر فيها كل حافظ." },
    "10": { title: "سور أطول وتلاوة الماستركلاس", lead: "الملك ويس والرحمن والواقعة والكهف، ثم تلاوة الماستركلاس الختامية مع الشهادة." },
  },
  units: {
    "7-1": {
      title: "ما المقام؟ البياتي والصبا والحجاز",
      intro: "المقام نمط لحني: سلّم من النغمات وطريق معتاد فيها وجوّ خاص. يستعمل القرّاء المقامات لحمل المعنى، لا لتغيير الحروف أو المدود. البياتي هادئ راسخ، وكثيرًا ما تُفتتح به التلاوة وتُختم. والصبا عميق حزين يناسب آيات الوعيد والأسى. والحجاز فيه مسافة واسعة مميِّزة تعطي شوقًا ووقارًا.",
      points: ["البياتي: يبدأ منخفضًا ويستقر، ويفتتح به كثير من القرّاء.", "الصبا: ثقيل رقيق، يكاد الصوت يهبط في آخر الجمل.", "الحجاز: المسافة الواسعة تعطي لونًا بعيدًا مشتاقًا.", "اختلف العلماء في تعلّم الألحان، واتفقوا على أن التجويد والخشوع مقدَّمان على كل لحن."],
      check: ["أستطيع وصف البياتي والصبا والحجاز بكلماتي.", "أستمع إلى الفاتحة بصوت قارئين وأقارن الجوّ."],
      mcq: [
        { q: "ما المقام؟", options: ["نمط لحني له نغماته وجوّه", "حكم من أحكام التجويد", "نوع من المدود", "علامة وقف"], answer: 0 },
        { q: "بأيّ مقام تُفتتح التلاوة غالبًا؟", options: ["البياتي", "الصبا", "السيكاه", "العجم"], answer: 0 },
        { q: "هل يجوز أن يطيل المقامُ المدَّ فوق حدّه؟", options: ["لا، التجويد مقدَّم دائمًا", "نعم، للتحسين", "في الصبا فقط", "عند الوقف فقط"], answer: 0 },
      ],
    },
    "7-2": {
      title: "الرست والنهاوند والسيكاه والعجم",
      intro: "الرست مشرق مهيب ويُسمّى أبا المقامات. والنهاوند رقيق قريب من السلّم الصغير. والسيكاه يرتكز على ربع تون فيبدو ليّنًا متأمّلًا. والعجم مشرق قريب من السلّم الكبير ويُستعمل لآيات البشرى. استمع إلى اللون لا إلى الاسم؛ فالمقامات تُتعلَّم بالسماع من المعلّمين والتسجيلات.",
      points: ["الرست: ثابت نبيل، فيه أرباع الأصوات.", "النهاوند: ليّن متأمّل.", "السيكاه: يدور حول ربع تون، حميم.", "العجم: مشرق منفتح."],
      check: ["أستطيع أن أذكر جوًّا لكل مقام من السبعة.", "ألاحظ انتقال القارئ من مقام إلى آخر."],
      mcq: [
        { q: "أيّ مقام يُسمّى أبا المقامات؟", options: ["الرست", "الحجاز", "الصبا", "النهاوند"], answer: 0 },
        { q: "أيّ مقام قريب من السلّم الكبير الغربي؟", options: ["العجم", "الصبا", "السيكاه", "البياتي"], answer: 0 },
        { q: "أيّ مقام يرتكز على ربع تون؟", options: ["السيكاه", "العجم", "النهاوند", "الحجاز"], answer: 0 },
      ],
    },
    "7-3": {
      title: "مختبر الاستماع: مقطع واحد وأصوات عدّة",
      intro: "اختر قارئًا من الإعدادات، وشغّل هذه الآيات، ثم بدّل القارئ واستمع مرة أخرى. لاحظ أين يعلو الصوت وأين يستقر وأيّ جوّ يبني. التسجيل كما في المستويات السابقة: لا تحاكِ اللحن إلا بعد إتقان الحروف والمدود.",
      points: ["استمع مرتين قبل المحاكاة.", "حاكِ جملة جملة، ببطء أولًا.", "قارن تسجيلك في التجويد أولًا ثم في اللحن."],
      check: ["قارنتُ قارئين على الأقل في الآيات نفسها.", "سجّلتُ آية بلحن هادئ ثابت."],
      mcq: [{ q: "ما الذي تتحقّق منه أولًا عند محاكاة قارئ؟", options: ["الحروف والمدود", "أعلى نغمة", "اسم المقام", "السرعة"], answer: 0 }],
    },
    "8-1": {
      title: "التحكّم في النفَس",
      intro: "تنفّس من أسفل، من البطن، لا من أعلى الصدر. املأ رئتيك بهدوء قبل الآية، وأخرج الهواء ببطء وانتظام أثناء القراءة. لا يجوز التنفّس في وسط الآية إلا في موضع يصحّ فيه الوقف معنًى؛ ولا تتنفّس ثم تصل، لأن التنفّس وقف.",
      points: ["اجلس أو قف مستقيمًا، ولا ترفع كتفيك عند الشهيق.", "تمرين: شهيق في أربع عدّات، ثم مدّ ست حركات بثبات.", "الشهيق وقف دائمًا: قف وقفًا صحيحًا ثم ابدأ من موضع حسن."],
      check: ["أتنفّس بهدوء قبل كل آية.", "أستطيع مدّ ست حركات بانتظام."],
      mcq: [
        { q: "التنفّس أثناء القراءة يُعدّ …", options: ["وقفًا", "سكتًا", "لا شيء", "مدًّا"], answer: 0 },
        { q: "من أين يكون النفَس؟", options: ["من أسفل البطن", "من الكتفين", "من الأنف فقط", "لا فرق"], answer: 0 },
      ],
    },
    "8-2": {
      title: "التخطيط للآية الطويلة",
      intro: "قبل تلاوة آية طويلة اقرأها مرة وحدّد مواضع وقفك: عند علامة تجيز الوقف أو بعد جملة تامّة. فإن اضطررت إلى الوقف في موضع غير مناسب فارجع كلمة أو كلمتين وابدأ من جديد ليبقى المعنى تامًّا. وآية الدَّين، أطول آية في القرآن، هي التمرين المعروف.",
      points: ["حدّد علامات الوقف أولًا ثم مواضع النفَس.", "لا تبدأ نفَسًا جديدًا بكلمة متعلّقة بما قبلها.", "استعمل السرعة البطيئة حتى تثبت الخطة."],
      check: ["خطّطت لوقفاتي في آية الدَّين قبل تلاوتها.", "إذا وقفت في موضع غير مناسب رجعت وابتدأت ابتداءً حسنًا."],
      mcq: [
        { q: "انقطع نفَسك في وسط جملة، فماذا تفعل؟", options: ["أرجع وأبدأ حيث يتمّ المعنى", "أكمل من الكلمة التالية", "أبدأ السورة من جديد", "أترك الجملة"], answer: 0 },
        { q: "ما أول ما تحدّده عند التخطيط لآية طويلة؟", options: ["علامات الوقف", "المقام", "التنوين", "رقم الصفحة"], answer: 0 },
      ],
    },
    "8-3": {
      title: "تطبيق: آية الكرسي وخواتيم البقرة",
      intro: "اقرأ آية الكرسي والآيتين الأخيرتين من البقرة بخطة للنفَس. وحافظ على مقادير المدود في المقطع كلّه: المدّ المنفصل الذي قرأته أربعًا في أوله يبقى أربعًا في آخره.",
      points: ["اختر مقدارًا للمدّ المنفصل والتزمه.", "خطّط لموضعين أو ثلاثة للنفَس في آية الكرسي."],
      check: ["بقيت مقادير المدود متساوية.", "قرأت آية الكرسي بنفَس مخطَّط."],
      mcq: [{ q: "إذا اخترت أربع حركات للمدّ المنفصل فإنك …", options: ["تلتزمها في المقطع كلّه", "تغيّرها كما تشاء", "تقرأ حركتين في آخره", "تقرأ ستًّا عند التعب"], answer: 0 }],
    },
    "9-1": {
      title: "القراءات السبع والعشر",
      intro: "نُقل القرآن بقراءات متواترة عدّة، تُنسب كل قراءة إلى إمام، ويرويها عنه راويان مشهوران. السبعة: نافع (قالون وورش)، وابن كثير (البزّي وقنبل)، وأبو عمرو (الدوري والسوسي)، وابن عامر (هشام وابن ذكوان)، وعاصم (شعبة وحفص)، وحمزة (خلف وخلّاد)، والكسائي (أبو الحارث والدوري). وبأبي جعفر ويعقوب وخلف العاشر تصير عشرًا. يقرأ هذا التطبيق برواية حفص عن عاصم، وهي الأوسع انتشارًا اليوم؛ وورش منتشر في شمال أفريقيا وغربها، وقالون في ليبيا وتونس، والدوري عن أبي عمرو في أجزاء من السودان.",
      points: ["القراءة تُنسب إلى الإمام، والرواية إلى الراوي عنه.", "كل القراءات المتواترة قرآن، وليست لحنًا ولا زيادة.", "تعلّم رواية أخرى يحتاج إلى شيخ مسنِد فيها."],
      check: ["أستطيع ذكر القرّاء السبعة وراويَي عاصم.", "أعرف الرواية التي أقرأ بها."],
      mcq: [
        { q: "حفص يروي قراءة …", options: ["عاصم", "نافع", "ابن كثير", "حمزة"], answer: 0 },
        { q: "ورش وقالون يرويان قراءة …", options: ["نافع", "أبي عمرو", "الكسائي", "ابن عامر"], answer: 0 },
        { q: "الدوري والسوسي يرويان عن …", options: ["أبي عمرو", "عاصم", "حمزة", "يعقوب"], answer: 0 },
        { q: "كم تصير القراءات بأبي جعفر ويعقوب وخلف؟", options: ["عشرًا", "سبعًا", "أربع عشرة", "أربعًا"], answer: 0 },
      ],
    },
    "9-2": {
      title: "شرح الفروق",
      intro: "الفروق بين القراءات نوعان. منها ما يتعلّق بالأداء: يمدّ ورش المنفصل ستّ حركات، وينقل حركة الهمزة إلى الساكن قبلها، ويقلّل بعض الألفات؛ ويجوز لقالون صلة ميم الجمع. ومنها ما يتعلّق بالكلمة: في الفاتحة، الآية الرابعة، قرأ عاصم والكسائي بالألف «مالك»، وقرأ نافع وغيره بغير ألف «ملك»، والمعنيان حقّ. وفي البقرة، الآيتين التاسعة والعاشرة، لقرّاء آخرين صيغ تختلف عن حفص في حرف أو في البناء. استمع إلى الآيات هنا برواية حفص واقرأ الشرح عن القراءات الأخرى.",
      points: ["فروق الأداء: مقادير المدّ، والهمز، والإمالة، وتفخيم الراء.", "فروق الكلمة: ألف، أو تشديد، أو اختلاف في الإسناد.", "لا تخلط الروايات في تلاوة واحدة دون علم."],
      check: ["أستطيع شرح القراءتين في الآية الرابعة من الفاتحة.", "أستطيع ذكر سمتين من أداء ورش."],
      mcq: [
        { q: "يقرأ ورش المدّ المنفصل بمقدار …", options: ["ستّ حركات", "حركتين", "بلا مدّ", "حركة"], answer: 0 },
        { q: "في الفاتحة ١:٤ قراءة «مالك» بالألف معناها …", options: ["المالك", "الملك", "الربّ", "القاضي"], answer: 0 },
        { q: "النقل عند ورش هو …", options: ["نقل حركة الهمزة إلى الساكن قبلها", "تشديد حرف", "الوقف مبكّرًا", "تفخيم اللام"], answer: 0 },
      ],
    },
    "9-3": {
      title: "المتشابهات للحفظ: آدم وبنو إسرائيل",
      intro: "المتشابهات آيات تكاد تتطابق، وهي أكثر أسباب الخطأ في الحفظ. قارن بين الأزواج هنا: في البقرة قيل لآدم «وكلا» بالواو، وفي الأعراف «فكلا» بالفاء؛ وترتيب «{{imlaei:2:58:11-12}}» و«{{imlaei:2:58:14-15}}» معكوس بين البقرة والأعراف؛ وعذاب قوم فرعون بفعل في البقرة وإبراهيم (مع واو زائدة في إبراهيم)، وبفعل آخر في الأعراف.",
      points: ["احفظ الزوجين معًا، لا أحدهما دون الآخر.", "اجعل لكل زوج علامة: حرفًا أو ترتيبًا أو موضوع السورة.", "اقرأ الآيتين بصوت متتابعتين واذكر اسم السورة."],
      check: ["أقرأ كل زوج دون خلط.", "لكل زوج علامة عندي."],
      mcq: [
        { q: "ما المتشابهات في الحفظ؟", options: ["آيات تكاد تتطابق", "آيات منسوخة", "آيات السجدة", "أطول الآيات"], answer: 0 },
        { q: "أفضل طريقة لحفظ زوج متشابه …", options: ["معًا مع علامة للفرق", "واحدة كل سنة", "الأولى فقط", "دون استماع"], answer: 0 },
      ],
    },
    "9-4": {
      title: "المتشابهات: قائمة المؤمنين",
      intro: "في البقرة ٢:٦٢ والمائدة ٥:٦٩ ذكرٌ للفرق نفسها، لكن الترتيب وإعراب كلمة منها يختلفان. استمع إليهما، وحدّد الفرق في بيانات الكلمات، واقرأهما متتابعتين حتى يثبت الفرق.",
      points: ["حدّد الكلمة التي تغيّر موضعها.", "اذكر اسم السورة قبل كل آية."],
      check: ["أقرأ ٢:٦٢ و٥:٦٩ دون خلط الترتيب."],
      mcq: [{ q: "ما الذي يساعد على التفريق بين آيتين متشابهتين؟", options: ["ذكر اسم السورة والكلمة المختلفة", "القراءة بسرعة", "ترك إحداهما", "تغيير المقام"], answer: 0 }],
    },
    "10-1": {
      title: "سورة الملك",
      intro: "ثلاثون آية تُقرأ كثيرًا في الليل. اعمل على نصفين: استمع، وكرّر ببطء، وسجّل، وقارن، ثم اختبر حفظك بفحص الكلمات.",
      points: ["انتبه لكثرة حروف القلقلة وللمدّ اللازم.", "حافظ على سرعة ثابتة في الآيات الثلاثين."],
      check: ["أقرأ الآيات ١–١٥ بطلاقة.", "أقرأ الآيات ١٦–٣٠ بطلاقة."],
      mcq: [{ q: "كم آية في سورة الملك؟", options: ["٣٠", "٤٠", "٢٩", "٨٣"], answer: 0 }],
    },
    "10-2": {
      title: "سورة يس: مطلعها",
      intro: "تبدأ يس بحروف مقطّعة تُقرأ بأسمائها مع مدّها، ثم تأتي قصة القرية والمرسلين.",
      points: ["«يس» تُقرأ اسمي حرفين، مع المدّ اللازم في السين.", "خطّط لنفَسك في الآيات القصصية الطويلة."],
      check: ["أقرأ الحروف المقطّعة بمدّها الصحيح.", "أقرأ آيات المطلع غيبًا."],
      mcq: [{ q: "الحروف المقطّعة في أول يس تُقرأ …", options: ["بأسمائها مع المدّ", "كلمة واحدة", "حروفًا ساكتة", "بالتنوين"], answer: 0 }],
    },
    "10-3": {
      title: "سورة الرحمن",
      intro: "تتكرّر «{{imlaei:55:13}}» مرّات كثيرة. اقرأها في كل مرة بالطريقة نفسها: المدّ نفسه، واللحن نفسه، والغنّة الواضحة نفسها.",
      points: ["اقرأ اللازمة بالطريقة نفسها كل مرة.", "اجعل اللازمة اختبارًا للنفَس: نفَس لكل لازمة."],
      check: ["لازمتي متطابقة في كل مرة.", "أقرأ المقطع الأول غيبًا."],
      mcq: [{ q: "ما الذي يبقى ثابتًا في لازمة سورة الرحمن؟", options: ["المدّ والغنّة واللحن", "السرعة فقط", "لا شيء", "علامة الوقف"], answer: 0 }],
    },
    "10-4": {
      title: "سورة الواقعة والعشر الأوائل من الكهف",
      intro: "الواقعة آياتها قصيرة موزونة تختبر ثبات السرعة، والعشر الأوائل من الكهف يُستحبّ حفظها. انتبه للسكت في آخر الآية الأولى من الكهف عند حفص: سكتة لطيفة بلا تنفّس.",
      points: ["السكت: قطع الصوت زمنًا يسيرًا دون تنفّس ثم الوصل.", "حافظ على إيقاع الواقعة متّزنًا."],
      check: ["أسكت في آخر الآية الأولى من الكهف دون تنفّس.", "أقرأ الكهف ١–١٠ غيبًا."],
      mcq: [{ q: "السكت هو …", options: ["قطع الصوت زمنًا يسيرًا دون تنفّس", "وقف طويل مع تنفّس", "تفخيم الراء", "تشديد حرف"], answer: 0 }],
    },
    "10-5": {
      title: "تلاوة الماستركلاس",
      intro: "تلاوتك الختامية: الفاتحة وآية الكرسي ومطلع الملك، كأنك بين يدي شيخ. سجّل المقطع كله دفعة واحدة، واستمع إليه، وأجب عن المراجعة الذاتية بصدق. ثم ادخل اختبار المستوى: النجاح فيه يمنحك شهادة الماستركلاس في مسار القارئ. وهي شهادة من التطبيق وليست إجازة؛ وللإجازة اقرأ على شيخ متقن.",
      points: ["اقرأ دفعة واحدة بخطة نفَسك.", "استمع مرة للتجويد، ومرة للوقف، ومرة للّحن.", "شارك تسجيلك مع معلّم ليعطيك ملاحظاته."],
      check: ["كل الحروف تخرج من مخارجها.", "لكل مدّ مقداره وهو ثابت.", "طبّقت أحكام النون والميم والغنّة.", "وقفي وابتدائي يحفظان المعنى.", "لحني يخدم المعنى ولا يغيّر الحروف."],
      mcq: [
        { q: "الإدغام بغنّة يكون في حروف …", options: ["ي ن م و", "ء ه ع ح", "ق ط ب ج د", "ل ر"], answer: 0 },
        { q: "المدّ اللازم مقداره …", options: ["ستّ حركات", "حركتان", "أربع أو خمس", "اختياري"], answer: 0 },
        { q: "لام لفظ الجلالة بعد الضمّة …", options: ["مفخّمة", "مرقّقة", "ساكتة", "مقلقلة"], answer: 0 },
        { q: "التنفّس أثناء القراءة يُعدّ …", options: ["وقفًا", "سكتًا", "مدًّا", "لا شيء"], answer: 0 },
        { q: "بأيّ رواية يقرأ هذا التطبيق؟", options: ["حفص عن عاصم", "ورش عن نافع", "قالون عن نافع", "الدوري عن أبي عمرو"], answer: 0 },
        { q: "هل تغني شهادة التطبيق عن الإجازة؟", options: ["لا", "نعم", "في المستوى العاشر فقط", "مع Pro فقط"], answer: 0 },
      ],
    },
  },
};

export const EXTRA: Record<string, ExtraContent> = { en, de, ar };
