// Study wisdom: one tip per day about learning with the Shams Method and the adab of the student of knowledge.
// Own words, except the three classical sayings, which carry their Arabic wording and the book they are found in.
// No Quran or hadith text is typed here. The whole selection is marked for scholar review (BLUEPRINT §4).

import { WISDOM_I18N } from "./wisdom-i18n";

export type WisdomCat = "method" | "adab" | "saying";
/** en and de written here; the other twelve app languages come from wisdom-i18n.ts (filled in below) */
type L = { en: string; de: string } & Partial<Record<string, string>>;
export type Wisdom = { id: string; cat: WisdomCat; title: L; body: L; ar?: string; who?: string; source?: string };

export const WISDOM_REVIEW = { status: "pending" as const };

export const WISDOM: Wisdom[] = [
  { id: "listen-first", cat: "method",
    title: { en: "Listen before you recite", de: "Erst hören, dann sprechen" },
    body: { en: "Hear the verse from a master reciter several times before you say it yourself. The ear learns the melody and the stops, and mistakes never settle in.", de: "Hören Sie den Vers mehrmals von einem Meisterrezitator, bevor Sie ihn selbst sprechen. Das Ohr lernt Melodie und Pausen, und Fehler setzen sich gar nicht erst fest." } },
  { id: "little-daily", cat: "method",
    title: { en: "A little every day", de: "Wenig, aber jeden Tag" },
    body: { en: "A short, fixed portion each day stays longer than a long session once a week. Choose an amount you can keep on your busiest day.", de: "Ein kurzer, fester Abschnitt jeden Tag bleibt länger als eine lange Sitzung einmal pro Woche. Wählen Sie eine Menge, die Sie auch am vollsten Tag schaffen." } },
  { id: "three-parts", cat: "method",
    title: { en: "New, recent, long-term", de: "Neu, frisch, langfristig" },
    body: { en: "The classical wird has three parts: the new lesson (sabaq), the recent pages (sabqī) and the long-term review (manzil). Leave out none of them, and the old never fades while the new grows.", de: "Der klassische Wird hat drei Teile: die neue Lektion (Sabaq), die frischen Seiten (Sabqī) und die langfristige Wiederholung (Manzil). Lassen Sie keinen aus, dann verblasst das Alte nicht, während das Neue wächst." } },
  { id: "recall", cat: "method",
    title: { en: "Recall instead of rereading", de: "Abrufen statt nachlesen" },
    body: { en: "Close the mushaf and say the verse from memory, then check. Every successful recall makes the memory stronger than another reading would.", de: "Schließen Sie den Mushaf, sagen Sie den Vers aus dem Gedächtnis und prüfen Sie dann. Jeder gelungene Abruf festigt mehr als ein weiteres Nachlesen." } },
  { id: "understand", cat: "method",
    title: { en: "Understand what you memorise", de: "Verstehen, was Sie auswendig lernen" },
    body: { en: "Read the meaning and a short tafsir before you memorise a verse. A verse you understand has a place in your heart to return to.", de: "Lesen Sie Bedeutung und einen kurzen Tafsir, bevor Sie einen Vers auswendig lernen. Ein verstandener Vers hat einen Ort im Herzen, an den er zurückkehrt." } },
  { id: "one-mushaf", cat: "method",
    title: { en: "One mushaf, one reciter", de: "Ein Mushaf, ein Rezitator" },
    body: { en: "Learn from the same page layout and the same reciter for a long time. The picture of the page and the sound of the verse then help each other.", de: "Lernen Sie lange mit demselben Seitenbild und demselben Rezitator. Dann stützen sich das Bild der Seite und der Klang des Verses gegenseitig." } },
  { id: "spaced", cat: "method",
    title: { en: "Review at the right moment", de: "Im richtigen Moment wiederholen" },
    body: { en: "Reviews work best just before you would forget. The app plans them for you; trust the plan even on days when a verse still feels fresh.", de: "Wiederholungen wirken am besten kurz bevor man vergisst. Die App plant sie für Sie; vertrauen Sie dem Plan auch an Tagen, an denen ein Vers noch frisch wirkt." } },
  { id: "teacher", cat: "method",
    title: { en: "Recite to a teacher", de: "Einem Lehrer vortragen" },
    body: { en: "The Quran has always been passed on from teacher to student. The app prepares you, but recite regularly to a qualified teacher who can correct you.", de: "Der Koran wurde immer vom Lehrer zum Schüler weitergegeben. Die App bereitet Sie vor, doch tragen Sie regelmäßig einer qualifizierten Lehrperson vor, die Sie korrigieren kann." } },
  { id: "intention", cat: "adab",
    title: { en: "Renew your intention", de: "Die Absicht erneuern" },
    body: { en: "Begin each session by making your intention sincere for Allah: to understand His words and to live by them, not to be praised.", de: "Beginnen Sie jede Sitzung damit, Ihre Absicht aufrichtig für Allah zu fassen: Seine Worte zu verstehen und nach ihnen zu leben, nicht um gelobt zu werden." } },
  { id: "act", cat: "adab",
    title: { en: "Act on what you learn", de: "Nach dem Gelernten handeln" },
    body: { en: "Take one thing from today's verses into your day, however small. Knowledge that is lived stays; knowledge that is only collected is easily lost.", de: "Nehmen Sie aus den Versen von heute eine Sache in Ihren Tag mit, so klein sie ist. Gelebtes Wissen bleibt; nur gesammeltes geht leicht verloren." } },
  { id: "respect", cat: "adab",
    title: { en: "Honour the book and the teacher", de: "Buch und Lehrer ehren" },
    body: { en: "Sit in a quiet place, in a state of purity when you can, and give the mushaf and your teachers the respect they are owed.", de: "Setzen Sie sich an einen ruhigen Ort, wenn möglich im Zustand der Reinheit, und erweisen Sie dem Mushaf und Ihren Lehrern den Respekt, der ihnen gebührt." } },
  { id: "ask", cat: "adab",
    title: { en: "Ask with humility", de: "Mit Demut fragen" },
    body: { en: "Asking is half of learning. Ask when something is unclear, admit what you do not know, and leave questions of rulings to scholars.", de: "Fragen ist die Hälfte des Lernens. Fragen Sie, wenn etwas unklar ist, geben Sie zu, was Sie nicht wissen, und überlassen Sie Fragen der Rechtsurteile den Gelehrten." } },
  { id: "zuhri", cat: "saying", who: "Ibn Shihāb az-Zuhrī", source: "Ibn ʿAbd al-Barr, Jāmiʿ Bayān al-ʿIlm wa Faḍlih",
    ar: "مَنْ رامَ العِلْمَ جُمْلَةً ذَهَبَ عَنْهُ جُمْلَةً، وإنَّما يُطْلَبُ العِلْمُ عَلى مَرِّ الأيّامِ واللَّيالي",
    title: { en: "Over days and nights", de: "Über Tage und Nächte" },
    body: { en: "Whoever seeks knowledge all at once loses it all at once; knowledge is sought over the passing of days and nights.", de: "Wer das Wissen auf einmal erlangen will, dem geht es auf einmal verloren; Wissen wird im Lauf der Tage und Nächte gesucht." } },
  { id: "shafii", cat: "saying", who: "al-Imām ash-Shāfiʿī", source: "Dīwān al-Imām ash-Shāfiʿī",
    ar: "شَكَوْتُ إلى وَكيعٍ سوءَ حِفْظي ... فَأرْشَدَني إلى تَرْكِ المَعاصي",
    title: { en: "Memory and the heart", de: "Gedächtnis und Herz" },
    body: { en: "I complained to Wakīʿ about my weak memory, and he guided me to leave sins. (The poem continues: knowledge is a light, and the light of Allah is not given to one who sins.)", de: "Ich klagte Wakīʿ über mein schwaches Gedächtnis, und er wies mich an, die Sünden zu lassen. (Das Gedicht fährt fort: Wissen ist ein Licht, und das Licht Allahs wird keinem Sünder gegeben.)" } },
  { id: "malik-mother", cat: "saying", who: "the mother of Imām Mālik", source: "al-Qāḍī ʿIyāḍ, Tartīb al-Madārik",
    ar: "اذْهَبْ إلى رَبيعَةَ فَتَعَلَّمْ مِنْ أدَبِهِ قَبْلَ عِلْمِهِ",
    title: { en: "Adab before knowledge", de: "Adab vor Wissen" },
    body: { en: "Go to Rabīʿa and learn his adab before his knowledge.", de: "Geh zu Rabīʿa und lerne von seinem Adab vor seinem Wissen." } },
];

// the twelve other languages, by entry id (no new store; ids and order stay the same)
for (const w of WISDOM) {
  for (const [lang, rows] of Object.entries(WISDOM_I18N)) {
    const r = rows[w.id];
    if (r) { w.title[lang] = r[0]; w.body[lang] = r[1]; }
  }
}

/** today's tip: one per calendar day, the same for everyone */
export function tipOfDay(d = new Date()): number {
  const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  return ((day % WISDOM.length) + WISDOM.length) % WISDOM.length;
}
export const wisdomText = (l: L, lang: string) => l[lang] || l.en;
