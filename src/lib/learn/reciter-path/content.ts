// mirrors mobile/src/features/reciter-path/content.ts (copied for the website; keep both in step)
import { useLang } from "@/lib/learn/i18n";
import { moduleText } from "@/lib/learn/i18n";
import type { RuleId } from "./curriculum";
import { EXTRA } from "./content2";

// Course content of the Reciter Path, written in our own words (established tajweed of the riwaya of Hafs ʿan ʿAsim).
// English and German here; the other languages can add a "reciterPathContent" entry to src/i18n/app/<lang>.json and
// fall back to English until then. No Quran text: examples are rendered from the word data.

type Mcq = { q: string; options: string[]; answer: number };
type UnitText = { title: string; intro: string; points: string[]; check: string[]; mcq: Mcq[] };
type Content = {
  levels: Record<string, { title: string; lead: string }>;
  rules: Record<RuleId, { name: string; short: string }>;
  units: Record<string, UnitText>;
};

const en: Content = {
  levels: {
    "1": { title: "Foundations", lead: "Where each letter comes from, its qualities, and the vowel signs." },
    "2": { title: "Noon sakinah and tanween", lead: "The four rules for a silent noon and for tanween." },
    "3": { title: "Meem sakinah and ghunnah", lead: "The silent meem and the nasal sound of noon and meem with shadda." },
    "4": { title: "Madd: lengthening", lead: "Natural lengthening and the longer madd types caused by hamza or sukun." },
    "5": { title: "Qalqalah, lam and ra", lead: "The echo letters, the lam of the article and of the name of Allah, and heavy or light ra." },
    "6": { title: "Waqf and applied recitation", lead: "Stopping and starting well, then whole surahs of Juz ʿAmma." },
  },
  rules: {
    makharij: { name: "Makharij", short: "Points of articulation" },
    sifat: { name: "Sifat", short: "Qualities of the letters" },
    harakat: { name: "Harakat", short: "Short vowels" },
    shadda: { name: "Shadda", short: "Doubled letter" },
    sukun: { name: "Sukun", short: "No vowel" },
    izhar: { name: "Izhar", short: "Clear noon" },
    idgham: { name: "Idgham with ghunnah", short: "Merging with nasal sound" },
    idghamNoGhunnah: { name: "Idgham without ghunnah", short: "Merging without nasal sound" },
    iqlab: { name: "Iqlab", short: "Noon turns into meem" },
    ikhfa: { name: "Ikhfa", short: "Hidden noon" },
    idghamShafawi: { name: "Idgham shafawi", short: "Meem merges into meem" },
    ikhfaShafawi: { name: "Ikhfa shafawi", short: "Hidden meem before ba" },
    izharShafawi: { name: "Izhar shafawi", short: "Clear meem" },
    ghunnah: { name: "Ghunnah", short: "Noon or meem with shadda" },
    maddTabii: { name: "Madd tabiʿi", short: "Natural madd, 2 counts" },
    maddMuttasil: { name: "Madd muttasil", short: "Hamza in the same word" },
    maddMunfasil: { name: "Madd munfasil", short: "Hamza in the next word" },
    maddLazim: { name: "Madd lazim", short: "Permanent sukun, 6 counts" },
    maddArid: { name: "Madd ʿarid lis-sukun", short: "Sukun only when stopping" },
    qalqalah: { name: "Qalqalah", short: "Echo of ق ط ب ج د" },
    lamShamsiyyah: { name: "Lam shamsiyyah", short: "Silent lam of the article" },
    lamQamariyyah: { name: "Lam qamariyyah", short: "Pronounced lam of the article" },
    lamAllahHeavy: { name: "Heavy lam of Allah", short: "After fatha or damma" },
    lamAllahLight: { name: "Light lam of Allah", short: "After kasra" },
    raHeavy: { name: "Heavy ra", short: "Tafkhim" },
    raLight: { name: "Light ra", short: "Tarqiq" },
    waqf: { name: "Waqf", short: "Stopping" },
  },
  units: {
    "1-1": {
      title: "Arabic letters and their makharij",
      intro: "Every letter has a place where it is produced: the empty space of mouth and throat (for the madd letters), the throat, the tongue, the lips and the nasal passage. When a letter leaves from its correct place, it keeps its own sound and cannot be confused with a neighbour.",
      points: [
        "Throat: ء ه from the deepest part, ع ح from the middle, غ خ from the top.",
        "Tongue: ق and ك at the back, ج ش ي in the middle, the tip of the tongue for ت د ط, ث ذ ظ, س ص ز and ل ن ر.",
        "Lips: ف (lower lip and upper teeth), ب م و with both lips.",
        "Nose: the ghunnah of noon and meem.",
        "Listen to each example word several times and say only the target letter before saying the whole word.",
      ],
      check: ["I can name the five areas of articulation.", "I distinguish ح from ه and ع from ء.", "I pronounce ق deeper than ك."],
      mcq: [
        { q: "Which letter comes from the deepest part of the throat?", options: ["ء", "خ", "ق", "ك"], answer: 0 },
        { q: "Which letters are produced with both lips?", options: ["ب م و", "ف ث ذ", "ت د ط", "س ص ز"], answer: 0 },
      ],
    },
    "1-2": {
      title: "Sifat: the qualities of the letters",
      intro: "Two letters can share a place of articulation and still sound different because of their qualities. Some letters let the breath flow, some hold it; some raise the back of the tongue and sound full, others stay light.",
      points: [
        "Hams (breath flows): ف ح ث ه ش خ ص س ك ت. Jahr (breath is held): the remaining letters.",
        "Istiʿla (heavy, the back of the tongue rises): خ ص ض غ ط ق ظ. These letters are always full.",
        "Safir (a whistle): ص ز س.",
        "Qalqalah (an echo when silent): ق ط ب ج د, practised in level 5.",
      ],
      check: ["I keep the seven heavy letters full, even with kasra.", "I let the breath flow with ه and ح.", "I hear the whistle of س and ص."],
      mcq: [
        { q: "Which letter is one of the seven heavy letters (istiʿla)?", options: ["ق", "ك", "ت", "س"], answer: 0 },
        { q: "Which letters have the quality of whistling (safir)?", options: ["ص ز س", "ق ط ب", "ء ه ع", "ل ن ر"], answer: 0 },
      ],
    },
    "1-3": {
      title: "Harakat, sukun and shadda",
      intro: "Fatha, kasra and damma are short vowels of one count. Sukun means the letter has no vowel and is joined to the letter before it. Shadda doubles a letter: the first is silent, the second carries the vowel.",
      points: [
        "Keep the short vowels short; do not stretch them into madd.",
        "With sukun, close the letter cleanly without adding a vowel.",
        "With shadda, hold the letter for a moment before releasing it with its vowel.",
      ],
      check: ["My short vowels stay short.", "I close letters with sukun without an extra vowel.", "I hold every letter with shadda."],
      mcq: [
        { q: "What does a shadda mean?", options: ["The letter is doubled", "The letter is silent", "The vowel is stretched", "The letter is skipped"], answer: 0 },
        { q: "How long is a short vowel?", options: ["One count", "Two counts", "Four counts", "Six counts"], answer: 0 },
      ],
    },
    "2-1": {
      title: "Izhar: the clear noon",
      intro: "When noon sakinah or tanween is followed by one of the six throat letters (ء ه ع ح غ خ), the noon is pronounced clearly, without extra nasal sound.",
      points: ["The throat letters are far from the tip of the tongue, so the noon simply stays clear.", "Do not pause between the noon and the following letter."],
      check: ["I recognise the six throat letters after a noon.", "My noon is clear and short, without ghunnah."],
      mcq: [
        { q: "Which letter after noon sakinah causes izhar?", options: ["ح", "ب", "ي", "ت"], answer: 0 },
        { q: "How many letters cause izhar?", options: ["Six", "Four", "Fifteen", "One"], answer: 0 },
      ],
    },
    "2-2": {
      title: "Idgham: merging",
      intro: "When noon sakinah or tanween is followed in the next word by one of the letters ي ر م ل و ن, the noon merges into that letter. With ي ن م و a nasal sound of two counts remains; with ل and ر it merges completely.",
      points: ["Idgham happens between two words; inside one word the noon stays clear.", "With ghunnah: ي ن م و. Without ghunnah: ل ر."],
      check: ["I hold the ghunnah for two counts before ي ن م و.", "I merge completely into ل and ر."],
      mcq: [
        { q: "Which letters merge without ghunnah?", options: ["ل ر", "ي و", "م ن", "ب ت"], answer: 0 },
        { q: "How long is the ghunnah in idgham?", options: ["Two counts", "One count", "Four counts", "None"], answer: 0 },
      ],
    },
    "2-3": {
      title: "Iqlab and ikhfa",
      intro: "Before ب the noon turns into a hidden meem with ghunnah (iqlab). Before the remaining fifteen letters the noon is hidden: the tongue prepares the next letter while a nasal sound of two counts remains (ikhfa).",
      points: ["Iqlab: lips close gently, without pressing.", "Ikhfa: the sound sits between clear and merged, coloured by the next letter."],
      check: ["I change noon into a light meem before ب.", "I hide the noon before the ikhfa letters and keep two counts."],
      mcq: [
        { q: "Which letter causes iqlab?", options: ["ب", "ق", "ل", "ه"], answer: 0 },
        { q: "How many letters cause ikhfa?", options: ["Fifteen", "Six", "Two", "Four"], answer: 0 },
      ],
    },
    "3-1": {
      title: "The rules of meem sakinah",
      intro: "A silent meem has three rules: it merges into a following meem with ghunnah (idgham shafawi), it is hidden before ب with ghunnah (ikhfa shafawi), and it stays clear before every other letter (izhar shafawi).",
      points: ["Take special care to keep meem clear before و and ف.", "In ikhfa shafawi the lips touch lightly."],
      check: ["I hold ghunnah when meem meets meem.", "I keep meem clear before و and ف."],
      mcq: [
        { q: "What happens to meem sakinah before ب?", options: ["Ikhfa shafawi", "Izhar shafawi", "Iqlab", "Qalqalah"], answer: 0 },
        { q: "Before which letters is meem sakinah clear?", options: ["All letters except م and ب", "Only throat letters", "Only ل and ر", "None"], answer: 0 },
      ],
    },
    "3-2": {
      title: "Ghunnah of noon and meem with shadda",
      intro: "Every noon or meem with shadda carries a full ghunnah of two counts. It is the strongest nasal sound in recitation.",
      points: ["Let the sound rest in the nose for two counts.", "Do not shorten it in fast recitation."],
      check: ["I hold two counts on every نّ and مّ."],
      mcq: [{ q: "How long is the ghunnah of noon with shadda?", options: ["Two counts", "Six counts", "One count", "None"], answer: 0 }],
    },
    "4-1": {
      title: "Madd tabiʿi: natural lengthening",
      intro: "The madd letters are alif after fatha, waw sakinah after damma and ya sakinah after kasra. Without hamza or sukun after them they are lengthened by two counts, never more and never less.",
      points: ["Count evenly; two counts are about the time of two short vowels.", "Keep the same length in the whole recitation."],
      check: ["I lengthen natural madd by exactly two counts."],
      mcq: [{ q: "How long is the natural madd?", options: ["Two counts", "Four counts", "Six counts", "One count"], answer: 0 }],
    },
    "4-2": {
      title: "Madd muttasil and munfasil",
      intro: "When a hamza follows a madd letter in the same word, the madd is connected (muttasil) and lengthened by four or five counts. When the hamza starts the next word, it is separated (munfasil); in Hafs by way of ash-Shatibiyyah it is also lengthened by four or five counts.",
      points: ["Choose one length and keep it throughout.", "Muttasil is obligatory; munfasil is permitted to be shortened in other ways of transmission."],
      check: ["I see whether the hamza is in the same or the next word.", "I keep my chosen length consistent."],
      mcq: [{ q: "In madd muttasil the hamza is …", options: ["in the same word", "in the next word", "absent", "at the start of the verse"], answer: 0 }],
    },
    "4-3": {
      title: "Madd lazim and madd ʿarid",
      intro: "When a permanent sukun or a shadda follows a madd letter, the madd is lazim and always six counts. When the sukun comes only from stopping at the end of a word, the madd is ʿarid lis-sukun: two, four or six counts.",
      points: ["Madd lazim: six counts, always.", "Madd ʿarid: only when you stop; when you continue it is natural madd."],
      check: ["I lengthen madd lazim by six counts.", "I choose two, four or six counts for madd ʿarid and keep it."],
      mcq: [{ q: "How long is madd lazim?", options: ["Six counts", "Two counts", "Four counts", "One count"], answer: 0 }],
    },
    "5-1": {
      title: "Qalqalah: the echo",
      intro: "The letters ق ط ب ج د make a slight echo when they carry sukun. The echo is lighter in the middle of a word and stronger when you stop on the letter at the end of a verse.",
      points: ["Release the letter without adding a vowel.", "The echo leans towards the vowel before it, never into a full fatha."],
      check: ["I echo the five letters when they are silent.", "My echo is stronger at a stop."],
      mcq: [{ q: "Which group are the qalqalah letters?", options: ["ق ط ب ج د", "ي ر م ل و ن", "ء ه ع ح غ خ", "ص ز س"], answer: 0 }],
    },
    "5-2": {
      title: "Lam rules",
      intro: "The lam of the article is pronounced before fourteen letters (qamariyyah) and merges into the next letter before the other fourteen (shamsiyyah). The lam of the name Allah is heavy after fatha or damma and light after kasra.",
      points: ["Shamsiyyah: the following letter carries a shadda.", "Allah after kasra: light lam."],
      check: ["I silence the lam before the sun letters.", "I make the lam of Allah heavy or light correctly."],
      mcq: [
        { q: "The lam of Allah after a kasra is …", options: ["light", "heavy", "silent", "doubled"], answer: 0 },
        { q: "In lam shamsiyyah the lam is …", options: ["not pronounced", "pronounced clearly", "lengthened", "echoed"], answer: 0 },
      ],
    },
    "5-3": {
      title: "Heavy and light ra",
      intro: "Ra is heavy with fatha or damma and light with kasra. A silent ra follows the vowel before it, with a few exceptions such as a heavy letter after it.",
      points: ["Heavy: the back of the tongue rises, the sound is full.", "Light: the tongue stays low, the sound is thin."],
      check: ["I make ra heavy with fatha and damma.", "I make ra light with kasra."],
      mcq: [{ q: "Ra with kasra is …", options: ["light", "heavy", "silent", "echoed"], answer: 0 }],
    },
    "6-1": {
      title: "Waqf and ibtida: stopping and starting",
      intro: "Stop at the end of a verse or at a stop sign, and start again where the meaning is complete. When stopping, the last vowel becomes sukun; tanween with fatha becomes a short alif.",
      points: ["Do not stop in the middle of a phrase unless you run out of breath; then go back and start at a meaningful place.", "Follow the stop signs printed in your mushaf."],
      check: ["I stop with sukun on the last letter.", "When I run out of breath, I restart at a meaningful place."],
      mcq: [{ q: "When stopping, the last vowel usually becomes …", options: ["sukun", "shadda", "madd", "tanween"], answer: 0 }],
    },
    "6-2": {
      title: "Applied: al-Ikhlas, al-Falaq, an-Nas",
      intro: "Recite the three protective surahs verse by verse: listen, repeat, record yourself and compare. Pay attention to every rule you have learned.",
      points: ["First listen to the whole verse twice.", "Then repeat word by word at a slower speed.", "Finally record the verse and compare it with the reciter."],
      check: ["I recite each verse with the rules I have learned.", "My stops fall at the end of the verses."],
      mcq: [],
    },
    "6-3": {
      title: "Applied: al-ʿAsr, al-Kawthar, al-Fil",
      intro: "Three short surahs with many rules close together: ikhfa, idgham, madd and qalqalah. Work through them with the same steps.",
      points: ["Mark the rules in each verse before reciting.", "Use the word check to test your memorisation."],
      check: ["I recite each surah without looking.", "I keep madd lengths consistent."],
      mcq: [],
    },
  },
};

const de: Content = {
  levels: {
    "1": { title: "Grundlagen", lead: "Woher jeder Buchstabe kommt, seine Eigenschaften und die Vokalzeichen." },
    "2": { title: "Nun sakina und Tanwin", lead: "Die vier Regeln für ein stilles Nun und für Tanwin." },
    "3": { title: "Mim sakina und Ghunna", lead: "Das stille Mim und der Nasallaut von Nun und Mim mit Schadda." },
    "4": { title: "Madd: Dehnung", lead: "Natürliche Dehnung und die längeren Madd-Arten durch Hamza oder Sukun." },
    "5": { title: "Qalqala, Lam und Ra", lead: "Die Echo-Buchstaben, das Lam des Artikels und des Namens Allah, schweres und leichtes Ra." },
    "6": { title: "Waqf und angewandte Rezitation", lead: "Gut anhalten und neu beginnen, dann ganze Suren aus Juz ʿAmma." },
  },
  rules: {
    makharij: { name: "Makharidsch", short: "Artikulationsstellen" },
    sifat: { name: "Sifat", short: "Eigenschaften der Buchstaben" },
    harakat: { name: "Harakat", short: "Kurze Vokale" },
    shadda: { name: "Schadda", short: "Verdoppelter Buchstabe" },
    sukun: { name: "Sukun", short: "Ohne Vokal" },
    izhar: { name: "Izhar", short: "Klares Nun" },
    idgham: { name: "Idgham mit Ghunna", short: "Verschmelzung mit Nasallaut" },
    idghamNoGhunnah: { name: "Idgham ohne Ghunna", short: "Verschmelzung ohne Nasallaut" },
    iqlab: { name: "Iqlab", short: "Nun wird zu Mim" },
    ikhfa: { name: "Ikhfa", short: "Verborgenes Nun" },
    idghamShafawi: { name: "Idgham schafawi", short: "Mim verschmilzt mit Mim" },
    ikhfaShafawi: { name: "Ikhfa schafawi", short: "Verborgenes Mim vor Ba" },
    izharShafawi: { name: "Izhar schafawi", short: "Klares Mim" },
    ghunnah: { name: "Ghunna", short: "Nun oder Mim mit Schadda" },
    maddTabii: { name: "Madd tabiʿi", short: "Natürliche Dehnung, 2 Zählzeiten" },
    maddMuttasil: { name: "Madd muttasil", short: "Hamza im selben Wort" },
    maddMunfasil: { name: "Madd munfasil", short: "Hamza im nächsten Wort" },
    maddLazim: { name: "Madd lazim", short: "Festes Sukun, 6 Zählzeiten" },
    maddArid: { name: "Madd ʿarid lis-sukun", short: "Sukun nur beim Anhalten" },
    qalqalah: { name: "Qalqala", short: "Echo von ق ط ب ج د" },
    lamShamsiyyah: { name: "Lam schamsiyya", short: "Stilles Lam des Artikels" },
    lamQamariyyah: { name: "Lam qamariyya", short: "Gesprochenes Lam des Artikels" },
    lamAllahHeavy: { name: "Schweres Lam in Allah", short: "Nach Fatha oder Damma" },
    lamAllahLight: { name: "Leichtes Lam in Allah", short: "Nach Kasra" },
    raHeavy: { name: "Schweres Ra", short: "Tafkhim" },
    raLight: { name: "Leichtes Ra", short: "Tarqiq" },
    waqf: { name: "Waqf", short: "Anhalten" },
  },
  units: {
    "1-1": {
      title: "Arabische Buchstaben und ihre Makharidsch",
      intro: "Jeder Buchstabe hat eine Stelle, an der er entsteht: der Hohlraum von Mund und Rachen (für die Madd-Buchstaben), der Rachen, die Zunge, die Lippen und der Nasenraum. Kommt ein Buchstabe von seiner richtigen Stelle, behält er seinen eigenen Klang und wird nicht mit einem Nachbarn verwechselt.",
      points: [
        "Rachen: ء ه ganz hinten, ع ح in der Mitte, غ خ oben.",
        "Zunge: ق und ك hinten, ج ش ي in der Mitte, die Zungenspitze für ت د ط, ث ذ ظ, س ص ز und ل ن ر.",
        "Lippen: ف (Unterlippe und obere Zähne), ب م و mit beiden Lippen.",
        "Nase: die Ghunna von Nun und Mim.",
        "Hören Sie jedes Beispielwort mehrmals und sprechen Sie zuerst nur den Zielbuchstaben, dann das ganze Wort.",
      ],
      check: ["Ich kann die fünf Bereiche der Artikulation nennen.", "Ich unterscheide ح von ه und ع von ء.", "Ich spreche ق tiefer als ك."],
      mcq: [
        { q: "Welcher Buchstabe kommt aus dem tiefsten Teil des Rachens?", options: ["ء", "خ", "ق", "ك"], answer: 0 },
        { q: "Welche Buchstaben werden mit beiden Lippen gebildet?", options: ["ب م و", "ف ث ذ", "ت د ط", "س ص ز"], answer: 0 },
      ],
    },
    "1-2": {
      title: "Sifat: die Eigenschaften der Buchstaben",
      intro: "Zwei Buchstaben können dieselbe Artikulationsstelle haben und trotzdem verschieden klingen, weil ihre Eigenschaften verschieden sind. Bei manchen fließt der Atem, bei anderen wird er gehalten; manche heben den hinteren Teil der Zunge und klingen voll, andere bleiben leicht.",
      points: [
        "Hams (Atem fließt): ف ح ث ه ش خ ص س ك ت. Dschahr (Atem wird gehalten): die übrigen Buchstaben.",
        "Istiʿla (schwer, der Zungenrücken hebt sich): خ ص ض غ ط ق ظ. Diese Buchstaben sind immer voll.",
        "Safir (Pfeifen): ص ز س.",
        "Qalqala (Echo bei Sukun): ق ط ب ج د, geübt in Stufe 5.",
      ],
      check: ["Ich spreche die sieben schweren Buchstaben voll, auch mit Kasra.", "Ich lasse bei ه und ح den Atem fließen.", "Ich höre das Pfeifen von س und ص."],
      mcq: [
        { q: "Welcher Buchstabe gehört zu den sieben schweren Buchstaben (Istiʿla)?", options: ["ق", "ك", "ت", "س"], answer: 0 },
        { q: "Welche Buchstaben haben die Eigenschaft des Pfeifens (Safir)?", options: ["ص ز س", "ق ط ب", "ء ه ع", "ل ن ر"], answer: 0 },
      ],
    },
    "1-3": {
      title: "Harakat, Sukun und Schadda",
      intro: "Fatha, Kasra und Damma sind kurze Vokale von einer Zählzeit. Sukun bedeutet, dass der Buchstabe keinen Vokal trägt und an den vorigen anschließt. Schadda verdoppelt einen Buchstaben: Der erste ist still, der zweite trägt den Vokal.",
      points: ["Halten Sie kurze Vokale kurz; dehnen Sie sie nicht zu einem Madd.", "Schließen Sie Buchstaben mit Sukun sauber, ohne einen Vokal anzuhängen.", "Halten Sie einen Buchstaben mit Schadda kurz an, bevor Sie ihn mit seinem Vokal lösen."],
      check: ["Meine kurzen Vokale bleiben kurz.", "Ich schließe Buchstaben mit Sukun ohne zusätzlichen Vokal.", "Ich halte jeden Buchstaben mit Schadda."],
      mcq: [
        { q: "Was bedeutet Schadda?", options: ["Der Buchstabe wird verdoppelt", "Der Buchstabe ist still", "Der Vokal wird gedehnt", "Der Buchstabe entfällt"], answer: 0 },
        { q: "Wie lang ist ein kurzer Vokal?", options: ["Eine Zählzeit", "Zwei Zählzeiten", "Vier Zählzeiten", "Sechs Zählzeiten"], answer: 0 },
      ],
    },
    "2-1": {
      title: "Izhar: das klare Nun",
      intro: "Folgt auf Nun sakina oder Tanwin einer der sechs Rachenbuchstaben (ء ه ع ح غ خ), wird das Nun klar gesprochen, ohne zusätzlichen Nasallaut.",
      points: ["Die Rachenbuchstaben liegen weit von der Zungenspitze entfernt, daher bleibt das Nun einfach klar.", "Machen Sie keine Pause zwischen Nun und folgendem Buchstaben."],
      check: ["Ich erkenne die sechs Rachenbuchstaben nach einem Nun.", "Mein Nun ist klar und kurz, ohne Ghunna."],
      mcq: [
        { q: "Welcher Buchstabe nach Nun sakina bewirkt Izhar?", options: ["ح", "ب", "ي", "ت"], answer: 0 },
        { q: "Wie viele Buchstaben bewirken Izhar?", options: ["Sechs", "Vier", "Fünfzehn", "Einer"], answer: 0 },
      ],
    },
    "2-2": {
      title: "Idgham: Verschmelzung",
      intro: "Folgt auf Nun sakina oder Tanwin im nächsten Wort einer der Buchstaben ي ر م ل و ن, verschmilzt das Nun mit diesem Buchstaben. Bei ي ن م و bleibt ein Nasallaut von zwei Zählzeiten; bei ل und ر verschmilzt es vollständig.",
      points: ["Idgham geschieht zwischen zwei Wörtern; innerhalb eines Wortes bleibt das Nun klar.", "Mit Ghunna: ي ن م و. Ohne Ghunna: ل ر."],
      check: ["Ich halte die Ghunna zwei Zählzeiten vor ي ن م و.", "Ich verschmelze vollständig mit ل und ر."],
      mcq: [
        { q: "Bei welchen Buchstaben verschmilzt das Nun ohne Ghunna?", options: ["ل ر", "ي و", "م ن", "ب ت"], answer: 0 },
        { q: "Wie lang ist die Ghunna beim Idgham?", options: ["Zwei Zählzeiten", "Eine Zählzeit", "Vier Zählzeiten", "Keine"], answer: 0 },
      ],
    },
    "2-3": {
      title: "Iqlab und Ikhfa",
      intro: "Vor ب wird das Nun zu einem verborgenen Mim mit Ghunna (Iqlab). Vor den übrigen fünfzehn Buchstaben wird das Nun verborgen: Die Zunge bereitet den nächsten Buchstaben vor, während ein Nasallaut von zwei Zählzeiten bleibt (Ikhfa).",
      points: ["Iqlab: Die Lippen schließen sich sanft, ohne Druck.", "Ikhfa: Der Laut liegt zwischen klar und verschmolzen und nimmt die Farbe des nächsten Buchstabens an."],
      check: ["Ich spreche vor ب ein leichtes Mim statt Nun.", "Ich verberge das Nun vor den Ikhfa-Buchstaben und halte zwei Zählzeiten."],
      mcq: [
        { q: "Welcher Buchstabe bewirkt Iqlab?", options: ["ب", "ق", "ل", "ه"], answer: 0 },
        { q: "Wie viele Buchstaben bewirken Ikhfa?", options: ["Fünfzehn", "Sechs", "Zwei", "Vier"], answer: 0 },
      ],
    },
    "3-1": {
      title: "Die Regeln des Mim sakina",
      intro: "Ein stilles Mim hat drei Regeln: Es verschmilzt mit Ghunna in ein folgendes Mim (Idgham schafawi), es wird vor ب mit Ghunna verborgen (Ikhfa schafawi), und vor allen anderen Buchstaben bleibt es klar (Izhar schafawi).",
      points: ["Achten Sie besonders darauf, Mim vor و und ف klar zu halten.", "Beim Ikhfa schafawi berühren sich die Lippen nur leicht."],
      check: ["Ich halte die Ghunna, wenn Mim auf Mim trifft.", "Ich halte Mim vor و und ف klar."],
      mcq: [
        { q: "Was geschieht mit Mim sakina vor ب?", options: ["Ikhfa schafawi", "Izhar schafawi", "Iqlab", "Qalqala"], answer: 0 },
        { q: "Vor welchen Buchstaben bleibt Mim sakina klar?", options: ["Vor allen außer م und ب", "Nur vor Rachenbuchstaben", "Nur vor ل und ر", "Vor keinem"], answer: 0 },
      ],
    },
    "3-2": {
      title: "Ghunna bei Nun und Mim mit Schadda",
      intro: "Jedes Nun oder Mim mit Schadda trägt eine volle Ghunna von zwei Zählzeiten. Sie ist der stärkste Nasallaut der Rezitation.",
      points: ["Lassen Sie den Klang zwei Zählzeiten in der Nase ruhen.", "Kürzen Sie ihn auch bei schneller Rezitation nicht."],
      check: ["Ich halte zwei Zählzeiten bei jedem نّ und مّ."],
      mcq: [{ q: "Wie lang ist die Ghunna bei Nun mit Schadda?", options: ["Zwei Zählzeiten", "Sechs Zählzeiten", "Eine Zählzeit", "Keine"], answer: 0 }],
    },
    "4-1": {
      title: "Madd tabiʿi: natürliche Dehnung",
      intro: "Die Madd-Buchstaben sind Alif nach Fatha, Waw sakina nach Damma und Ya sakina nach Kasra. Folgt kein Hamza und kein Sukun, werden sie um zwei Zählzeiten gedehnt, nie mehr und nie weniger.",
      points: ["Zählen Sie gleichmäßig; zwei Zählzeiten entsprechen etwa zwei kurzen Vokalen.", "Halten Sie dieselbe Länge in der ganzen Rezitation."],
      check: ["Ich dehne den natürlichen Madd um genau zwei Zählzeiten."],
      mcq: [{ q: "Wie lang ist der natürliche Madd?", options: ["Zwei Zählzeiten", "Vier Zählzeiten", "Sechs Zählzeiten", "Eine Zählzeit"], answer: 0 }],
    },
    "4-2": {
      title: "Madd muttasil und munfasil",
      intro: "Folgt ein Hamza auf einen Madd-Buchstaben im selben Wort, ist der Madd verbunden (muttasil) und wird um vier oder fünf Zählzeiten gedehnt. Steht das Hamza am Anfang des nächsten Wortes, ist er getrennt (munfasil); bei Hafs über asch-Schatibiyya wird er ebenfalls vier oder fünf Zählzeiten gedehnt.",
      points: ["Wählen Sie eine Länge und behalten Sie sie bei.", "Muttasil ist verpflichtend; munfasil darf in anderen Überlieferungswegen gekürzt werden."],
      check: ["Ich sehe, ob das Hamza im selben oder im nächsten Wort steht.", "Ich halte meine gewählte Länge gleich."],
      mcq: [{ q: "Beim Madd muttasil steht das Hamza …", options: ["im selben Wort", "im nächsten Wort", "gar nicht", "am Versanfang"], answer: 0 }],
    },
    "4-3": {
      title: "Madd lazim und Madd ʿarid",
      intro: "Folgt auf einen Madd-Buchstaben ein festes Sukun oder eine Schadda, ist der Madd lazim und immer sechs Zählzeiten lang. Entsteht das Sukun nur durch das Anhalten am Wortende, ist es Madd ʿarid lis-sukun: zwei, vier oder sechs Zählzeiten.",
      points: ["Madd lazim: immer sechs Zählzeiten.", "Madd ʿarid: nur beim Anhalten; beim Weiterlesen ist es ein natürlicher Madd."],
      check: ["Ich dehne Madd lazim um sechs Zählzeiten.", "Ich wähle für Madd ʿarid zwei, vier oder sechs Zählzeiten und bleibe dabei."],
      mcq: [{ q: "Wie lang ist Madd lazim?", options: ["Sechs Zählzeiten", "Zwei Zählzeiten", "Vier Zählzeiten", "Eine Zählzeit"], answer: 0 }],
    },
    "5-1": {
      title: "Qalqala: das Echo",
      intro: "Die Buchstaben ق ط ب ج د erzeugen ein leichtes Echo, wenn sie Sukun tragen. Mitten im Wort ist das Echo leichter, beim Anhalten am Versende stärker.",
      points: ["Lösen Sie den Buchstaben, ohne einen Vokal anzuhängen.", "Das Echo neigt sich zum vorigen Vokal, nie zu einer vollen Fatha."],
      check: ["Ich lasse die fünf Buchstaben bei Sukun nachklingen.", "Mein Echo ist beim Anhalten stärker."],
      mcq: [{ q: "Welche Gruppe sind die Qalqala-Buchstaben?", options: ["ق ط ب ج د", "ي ر م ل و ن", "ء ه ع ح غ خ", "ص ز س"], answer: 0 }],
    },
    "5-2": {
      title: "Regeln des Lam",
      intro: "Das Lam des Artikels wird vor vierzehn Buchstaben gesprochen (qamariyya) und verschmilzt vor den anderen vierzehn mit dem nächsten Buchstaben (schamsiyya). Das Lam im Namen Allah ist nach Fatha oder Damma schwer und nach Kasra leicht.",
      points: ["Schamsiyya: Der folgende Buchstabe trägt eine Schadda.", "Allah nach Kasra: leichtes Lam."],
      check: ["Ich spreche das Lam vor Sonnenbuchstaben nicht.", "Ich spreche das Lam in Allah richtig schwer oder leicht."],
      mcq: [
        { q: "Das Lam in Allah nach einer Kasra ist …", options: ["leicht", "schwer", "stumm", "verdoppelt"], answer: 0 },
        { q: "Beim Lam schamsiyya wird das Lam …", options: ["nicht gesprochen", "klar gesprochen", "gedehnt", "mit Echo gesprochen"], answer: 0 },
      ],
    },
    "5-3": {
      title: "Schweres und leichtes Ra",
      intro: "Ra ist mit Fatha oder Damma schwer und mit Kasra leicht. Ein stilles Ra richtet sich nach dem Vokal davor, mit wenigen Ausnahmen, etwa wenn ein schwerer Buchstabe folgt.",
      points: ["Schwer: Der Zungenrücken hebt sich, der Klang ist voll.", "Leicht: Die Zunge bleibt unten, der Klang ist dünn."],
      check: ["Ich spreche Ra mit Fatha und Damma schwer.", "Ich spreche Ra mit Kasra leicht."],
      mcq: [{ q: "Ra mit Kasra ist …", options: ["leicht", "schwer", "stumm", "mit Echo"], answer: 0 }],
    },
    "6-1": {
      title: "Waqf und Ibtida: anhalten und neu beginnen",
      intro: "Halten Sie am Versende oder an einem Haltezeichen an und beginnen Sie dort neu, wo der Sinn vollständig ist. Beim Anhalten wird der letzte Vokal zu Sukun; Tanwin mit Fatha wird zu einem kurzen Alif.",
      points: ["Halten Sie nicht mitten in einer Aussage an, außer der Atem reicht nicht; gehen Sie dann zurück und beginnen Sie an einer sinnvollen Stelle.", "Folgen Sie den Haltezeichen Ihres Mushafs."],
      check: ["Ich halte mit Sukun auf dem letzten Buchstaben an.", "Wenn der Atem nicht reicht, beginne ich an einer sinnvollen Stelle neu."],
      mcq: [{ q: "Beim Anhalten wird der letzte Vokal meist zu …", options: ["Sukun", "Schadda", "Madd", "Tanwin"], answer: 0 }],
    },
    "6-2": {
      title: "Angewandt: al-Ikhlas, al-Falaq, an-Nas",
      intro: "Rezitieren Sie die drei Schutzsuren Vers für Vers: hören, wiederholen, sich selbst aufnehmen und vergleichen. Achten Sie auf jede Regel, die Sie gelernt haben.",
      points: ["Hören Sie zuerst den ganzen Vers zweimal.", "Wiederholen Sie ihn dann Wort für Wort langsamer.", "Nehmen Sie zum Schluss den Vers auf und vergleichen Sie ihn mit dem Rezitator."],
      check: ["Ich rezitiere jeden Vers mit den gelernten Regeln.", "Meine Pausen liegen an den Versenden."],
      mcq: [],
    },
    "6-3": {
      title: "Angewandt: al-ʿAsr, al-Kauthar, al-Fil",
      intro: "Drei kurze Suren mit vielen Regeln auf engem Raum: Ikhfa, Idgham, Madd und Qalqala. Arbeiten Sie sie mit denselben Schritten durch.",
      points: ["Markieren Sie die Regeln jedes Verses vor dem Rezitieren.", "Prüfen Sie Ihr Auswendiglernen mit der Wortprüfung."],
      check: ["Ich rezitiere jede Sure ohne hinzusehen.", "Ich halte die Madd-Längen gleich."],
      mcq: [],
    },
  },
};

const mergedCache = new Map<string, Content>();
export function useContent(): Content {
  const { lang } = useLang();
  const base = moduleText("reciterPathContent", { en, de }, lang);
  const hit = mergedCache.get(lang);
  if (hit && (hit as Content & { _base?: Content })._base === base) return hit;
  // levels 7–10 (content2.ts): the learner's language, else English
  const x = EXTRA[lang] ?? EXTRA.en;
  const m = { ...base, levels: { ...base.levels, ...x.levels }, units: { ...base.units, ...x.units }, _base: base } as Content;
  mergedCache.set(lang, m);
  return m;
}
