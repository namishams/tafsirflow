// "Read the Quran" course: Arabic reading from zero, built like the Qa'ida Nuraniyya taught in Quran schools
// (letters → letter forms → short vowels → long vowels → tanwin → sukun → shadda → special signs → Quran words),
// with short Babbel-style lessons: learn cards, then varied exercises, mistakes come back at the end.
import { readJSON, writeJSON } from "./storage";

export type L2 = { de: string; en: string };
export type Letter = { ch: string; name: string; tr: string; connects: boolean; sound: L2; similar?: string[] };

// tr = the sound used in syllables (simple transliteration)
export const LETTERS: Letter[] = [
  { ch: "ا", name: "Alif", tr: "a", connects: false, sound: { de: "Träger für das lange „ā“ und für die Hamza – selbst kein Konsonant", en: "carrier of the long “ā” and of hamza – not a consonant itself" } },
  { ch: "ب", name: "Bā'", tr: "b", connects: true, sound: { de: "b wie in „Ball“", en: "b as in “ball”" }, similar: ["ت", "ث", "ن", "ي"] },
  { ch: "ت", name: "Tā'", tr: "t", connects: true, sound: { de: "t wie in „Tee“", en: "t as in “tea”" }, similar: ["ب", "ث", "ن"] },
  { ch: "ث", name: "Thā'", tr: "th", connects: true, sound: { de: "stimmloses „th“ wie im Englischen „think“ – Zungenspitze zwischen den Zähnen", en: "th as in “think” – tongue tip between the teeth" }, similar: ["ت", "ب", "ش"] },
  { ch: "ج", name: "Jīm", tr: "j", connects: true, sound: { de: "dsch wie in „Dschungel“", en: "j as in “jam”" }, similar: ["ح", "خ"] },
  { ch: "ح", name: "Ḥā'", tr: "ḥ", connects: true, sound: { de: "kräftig gehauchtes h aus der Kehlmitte – wie beim Anhauchen einer Brille", en: "a strong breathy h from the middle of the throat – like fogging up glasses" }, similar: ["ج", "خ", "ه"] },
  { ch: "خ", name: "Khā'", tr: "kh", connects: true, sound: { de: "ch wie in „Bach“", en: "kh like the “ch” in Scottish “loch”" }, similar: ["ح", "ج"] },
  { ch: "د", name: "Dāl", tr: "d", connects: false, sound: { de: "d wie in „Dach“", en: "d as in “door”" }, similar: ["ذ", "ر"] },
  { ch: "ذ", name: "Dhāl", tr: "dh", connects: false, sound: { de: "stimmhaftes „th“ wie im Englischen „this“", en: "th as in “this”" }, similar: ["د", "ز", "ظ"] },
  { ch: "ر", name: "Rā'", tr: "r", connects: false, sound: { de: "gerolltes Zungenspitzen-r", en: "a rolled r with the tongue tip" }, similar: ["ز", "د"] },
  { ch: "ز", name: "Zāy", tr: "z", connects: false, sound: { de: "stimmhaftes s wie in „Sonne“", en: "z as in “zoo”" }, similar: ["ر", "ذ"] },
  { ch: "س", name: "Sīn", tr: "s", connects: true, sound: { de: "scharfes s wie in „Fluss“", en: "s as in “sun”" }, similar: ["ش", "ص"] },
  { ch: "ش", name: "Shīn", tr: "sh", connects: true, sound: { de: "sch wie in „Schule“", en: "sh as in “ship”" }, similar: ["س", "ث"] },
  { ch: "ص", name: "Ṣād", tr: "ṣ", connects: true, sound: { de: "schweres, dunkles s – die Zunge drückt nach hinten, der Mund wird voll", en: "a heavy, dark s – the back of the tongue rises, the mouth sounds full" }, similar: ["س", "ض"] },
  { ch: "ض", name: "Ḍād", tr: "ḍ", connects: true, sound: { de: "schweres, dunkles d – ein Laut, für den Arabisch „die Sprache des Ḍād“ heißt", en: "a heavy, dark d – Arabic is called “the language of Ḍād” because of it" }, similar: ["ص", "ظ", "د"] },
  { ch: "ط", name: "Ṭā'", tr: "ṭ", connects: true, sound: { de: "schweres, dunkles t", en: "a heavy, dark t" }, similar: ["ظ", "ت"] },
  { ch: "ظ", name: "Ẓā'", tr: "ẓ", connects: true, sound: { de: "schweres, dunkles „th“ wie in „this“", en: "a heavy, dark “th” as in “this”" }, similar: ["ط", "ذ", "ض"] },
  { ch: "ع", name: "'Ayn", tr: "ʿ", connects: true, sound: { de: "gepresster Laut aus der Kehlmitte – kein Vokal, sondern ein eigener Kehllaut", en: "a squeezed sound from the middle of the throat – a consonant, not a vowel" }, similar: ["غ", "ء"] },
  { ch: "غ", name: "Ghayn", tr: "gh", connects: true, sound: { de: "Gaumen-r wie im Französischen „Paris“ – wie leises Gurgeln", en: "like the French “r” in “Paris” – a soft gargle" }, similar: ["ع", "خ"] },
  { ch: "ف", name: "Fā'", tr: "f", connects: true, sound: { de: "f wie in „Fisch“", en: "f as in “fish”" }, similar: ["ق"] },
  { ch: "ق", name: "Qāf", tr: "q", connects: true, sound: { de: "tiefes k ganz hinten im Rachen", en: "a deep k from the very back of the throat" }, similar: ["ف", "ك"] },
  { ch: "ك", name: "Kāf", tr: "k", connects: true, sound: { de: "k wie in „Kind“", en: "k as in “kite”" }, similar: ["ق", "ل"] },
  { ch: "ل", name: "Lām", tr: "l", connects: true, sound: { de: "l wie in „Licht“", en: "l as in “light”" }, similar: ["ك", "ا"] },
  { ch: "م", name: "Mīm", tr: "m", connects: true, sound: { de: "m wie in „Mond“", en: "m as in “moon”" }, similar: ["ن"] },
  { ch: "ن", name: "Nūn", tr: "n", connects: true, sound: { de: "n wie in „Nase“", en: "n as in “nose”" }, similar: ["ب", "ت", "م"] },
  { ch: "ه", name: "Hā'", tr: "h", connects: true, sound: { de: "leichtes h wie in „Haus“", en: "a light h as in “house”" }, similar: ["ح", "ة"] },
  { ch: "و", name: "Wāw", tr: "w", connects: false, sound: { de: "w wie im Englischen „water“ – und Träger für das lange „ū“", en: "w as in “water” – and the carrier of the long “ū”" }, similar: ["ر", "د"] },
  { ch: "ي", name: "Yā'", tr: "y", connects: true, sound: { de: "j wie in „Jahr“ – und Träger für das lange „ī“", en: "y as in “yes” – and the carrier of the long “ī”" }, similar: ["ب", "ن", "ت"] },
  { ch: "ء", name: "Hamza", tr: "'", connects: false, sound: { de: "kurzer Stimmabsatz wie zwischen „be-achten“", en: "a short glottal stop, as in “uh-oh”" }, similar: ["ع"] },
];
export const letter = (ch: string) => LETTERS.find((l) => l.ch === ch)!;

const FATHA = "َ", KASRA = "ِ", DAMMA = "ُ", SUKUN = "ْ", SHADDA = "ّ", TATWEEL = "ـ";
export const forms = (l: Letter) => l.connects
  ? { alone: l.ch, start: l.ch + TATWEEL, middle: TATWEEL + l.ch + TATWEEL, end: TATWEEL + l.ch }
  : { alone: l.ch, start: l.ch, middle: TATWEEL + l.ch, end: TATWEEL + l.ch };

export type Item = { ar: string; tr: string; meaning?: L2 };
const syl = (chs: string[], mark: string, vowel: string): Item[] => chs.map((c) => ({ ar: c + mark, tr: letter(c).tr + vowel }));
const CONS = LETTERS.filter((l) => l.ch !== "ا" && l.ch !== "ء").map((l) => l.ch);

export type Lesson = {
  id: string; unit: number; title: L2; goal: L2;
  learn: { ar: string; title: L2; body: L2 }[];
  letters?: string[];                 // letter lessons
  formsOf?: string[];                 // letter-form lessons
  items?: Item[];                     // reading lessons
  test?: boolean;                     // unit test: mixes everything before it
};

export const UNITS: { n: number; title: L2; lead: L2 }[] = [
  { n: 1, title: { de: "Die Buchstaben", en: "The letters" }, lead: { de: "Alle 28 Buchstaben und die Hamza – Form, Name und Klang.", en: "All 28 letters and the hamza – shape, name and sound." } },
  { n: 2, title: { de: "Buchstaben verbinden", en: "Joining letters" }, lead: { de: "Wie ein Buchstabe am Wortanfang, in der Mitte und am Ende aussieht.", en: "How a letter looks at the start, in the middle and at the end of a word." } },
  { n: 3, title: { de: "Kurze Vokale", en: "Short vowels" }, lead: { de: "Fatha, Kasra, Damma – die kleinen Zeichen, die Buchstaben zum Klingen bringen.", en: "Fatha, kasra, damma – the small marks that make letters sound." } },
  { n: 4, title: { de: "Lange Vokale, Tanwin, Sukun, Schadda", en: "Long vowels, tanwin, sukun, shadda" }, lead: { de: "Die Zeichen, mit denen du ganze Silben und Wörter liest.", en: "The signs that let you read whole syllables and words." } },
  { n: 5, title: { de: "Besondere Zeichen im Koran", en: "Special signs in the Quran" }, lead: { de: "Der Artikel „al-“, Sonnen- und Mondbuchstaben, Ta marbuta, das kleine Alif.", en: "The article “al-”, sun and moon letters, ta marbuta, the small alif." } },
  { n: 6, title: { de: "Koranwörter lesen", en: "Reading Quran words" }, lead: { de: "Al-Fatiha und die kurzen Suren – Wort für Wort, mit Bedeutung.", en: "Al-Fatiha and the short surahs – word by word, with meaning." } },
];

const L = (de: string, en: string): L2 => ({ de, en });
const letterLesson = (id: string, chs: string[]): Lesson => ({
  id, unit: 1, letters: chs,
  title: L(`Buchstaben ${chs.join(" ")}`, `Letters ${chs.join(" ")}`),
  goal: L(`Erkenne ${chs.length} Buchstaben an Form und Klang.`, `Recognise ${chs.length} letters by shape and sound.`),
  learn: chs.map((c) => { const l = letter(c); return { ar: c, title: L(`${l.name} – „${l.tr}“`, `${l.name} – “${l.tr}”`), body: l.sound }; }),
});
const formLesson = (id: string, chs: string[], extra?: { title: L2; body: L2 }): Lesson => ({
  id, unit: 2, formsOf: chs,
  title: L(`Formen: ${chs.join(" ")}`, `Forms: ${chs.join(" ")}`),
  goal: L("Erkenne die Buchstaben am Anfang, in der Mitte und am Ende eines Wortes.", "Recognise the letters at the start, in the middle and at the end of a word."),
  learn: [
    ...(extra ? [{ ar: chs.join(" "), title: extra.title, body: extra.body }] : []),
    ...chs.map((c) => { const f = forms(letter(c)); return { ar: `${f.start}  ${f.middle}  ${f.end}`, title: L(`${letter(c).name}: Anfang · Mitte · Ende`, `${letter(c).name}: start · middle · end`), body: letter(c).connects ? L("Arabisch wird von rechts nach links geschrieben. Dieser Buchstabe verbindet sich nach beiden Seiten.", "Arabic is written right to left. This letter joins on both sides.") : L("Dieser Buchstabe verbindet sich nur mit dem Buchstaben davor – nie mit dem danach.", "This letter only joins the letter before it – never the one after it.") }; }),
  ],
});

export const LESSONS: Lesson[] = [
  { ...letterLesson("a1", ["ا", "ب", "ت", "ث"]), learn: [{ ar: "ا ب ت ث", title: L("Willkommen!", "Welcome!"), body: L("Arabisch liest man von rechts nach links. Viele Buchstaben unterscheiden sich nur durch Punkte: ب hat einen Punkt unten, ت zwei oben, ث drei oben. Schau genau hin!", "Arabic is read from right to left. Many letters differ only by their dots: ب has one dot below, ت two above, ث three above. Look closely!") }, ...letterLesson("a1", ["ا", "ب", "ت", "ث"]).learn] },
  letterLesson("a2", ["ج", "ح", "خ"]),
  letterLesson("a3", ["د", "ذ", "ر", "ز"]),
  letterLesson("a4", ["س", "ش", "ص", "ض"]),
  letterLesson("a5", ["ط", "ظ", "ع", "غ"]),
  letterLesson("a6", ["ف", "ق", "ك", "ل"]),
  letterLesson("a7", ["م", "ن", "ه", "و", "ي"]),
  { ...letterLesson("a8", ["ء"]), title: L("Hamza & Test: alle Buchstaben", "Hamza & test: all letters"), test: true },
  formLesson("b1", ["ب", "ت", "ث", "ن", "ي"], { title: L("Gleiche Form, andere Punkte", "Same shape, different dots"), body: L("Am Wortanfang und in der Mitte sehen ب ت ث ن ي fast gleich aus – nur die Punkte verraten den Buchstaben.", "At the start and in the middle of a word ب ت ث ن ي look almost the same – only the dots tell them apart.") }),
  formLesson("b2", ["ج", "ح", "خ", "ع", "غ"]),
  formLesson("b3", ["س", "ش", "ص", "ض", "ط", "ظ"]),
  formLesson("b4", ["ف", "ق", "ك", "ل", "م", "ه"]),
  formLesson("b5", ["ا", "د", "ذ", "ر", "ز", "و"], { title: L("Die sechs „Egoisten“", "The six “loners”"), body: L("ا د ذ ر ز و verbinden sich nie mit dem nächsten Buchstaben. Danach beginnt das Wort scheinbar neu – deshalb sehen manche Wörter wie getrennt aus.", "ا د ذ ر ز و never join the following letter. After them the word seems to start again – that is why some words look split.") }),
  { id: "c1", unit: 3, title: L("Fatha – der a-Laut", "Fatha – the “a” sound"), goal: L("Lies Silben mit Fatha.", "Read syllables with fatha."), items: syl(CONS.slice(0, 14), FATHA, "a"), learn: [{ ar: "بَ تَ ثَ", title: L("Fatha ـَ", "Fatha ـَ"), body: L("Ein kleiner Schrägstrich ÜBER dem Buchstaben. Er wird kurz als „a“ gesprochen: بَ = ba.", "A small slanted stroke ABOVE the letter. It is read as a short “a”: بَ = ba.") }] },
  { id: "c2", unit: 3, title: L("Kasra – der i-Laut", "Kasra – the “i” sound"), goal: L("Lies Silben mit Kasra.", "Read syllables with kasra."), items: syl(CONS.slice(0, 14), KASRA, "i"), learn: [{ ar: "بِ تِ ثِ", title: L("Kasra ـِ", "Kasra ـِ"), body: L("Ein kleiner Strich UNTER dem Buchstaben. Kurz „i“: بِ = bi.", "A small stroke BELOW the letter. A short “i”: بِ = bi.") }] },
  { id: "c3", unit: 3, title: L("Damma – der u-Laut", "Damma – the “u” sound"), goal: L("Lies Silben mit Damma.", "Read syllables with damma."), items: syl(CONS.slice(0, 14), DAMMA, "u"), learn: [{ ar: "بُ تُ ثُ", title: L("Damma ـُ", "Damma ـُ"), body: L("Ein kleines Wāw-Häkchen ÜBER dem Buchstaben. Kurz „u“: بُ = bu.", "A small wāw-like hook ABOVE the letter. A short “u”: بُ = bu.") }] },
  { id: "c4", unit: 3, title: L("Alle drei Vokale gemischt", "All three vowels mixed"), goal: L("Unterscheide a, i und u sicher.", "Tell a, i and u apart with confidence."), items: [...syl(CONS.slice(14), FATHA, "a"), ...syl(CONS.slice(14), KASRA, "i"), ...syl(CONS.slice(14), DAMMA, "u")], learn: [{ ar: "سَ سِ سُ", title: L("Oben, unten, Häkchen", "Above, below, hook"), body: L("Fatha oben = a, Kasra unten = i, Damma als Häkchen = u. Sprich jede Silbe laut – Lesen lernt man mit dem Mund, nicht nur mit den Augen.", "Fatha above = a, kasra below = i, damma as a hook = u. Say every syllable out loud – you learn to read with your mouth, not only your eyes.") }] },
  { id: "d1", unit: 4, title: L("Lange Vokale (Madd)", "Long vowels (madd)"), goal: L("Lies ā, ī und ū – doppelt so lang.", "Read ā, ī and ū – twice as long."),
    items: ["ب", "ت", "س", "ق", "ك", "ل", "م", "ن", "ف", "ج"].flatMap((c) => [{ ar: c + FATHA + "ا", tr: letter(c).tr + "ā" }, { ar: c + KASRA + "ي", tr: letter(c).tr + "ī" }, { ar: c + DAMMA + "و", tr: letter(c).tr + "ū" }]),
    learn: [{ ar: "بَا بِي بُو", title: L("Drei Buchstaben dehnen", "Three letters that stretch"), body: L("Fatha + Alif = langes ā (بَا bā), Kasra + Yā' = langes ī (بِي bī), Damma + Wāw = langes ū (بُو bū). Halte den Vokal zwei Zählzeiten lang.", "Fatha + alif = long ā (بَا bā), kasra + yā' = long ī (بِي bī), damma + wāw = long ū (بُو bū). Hold the vowel for two counts.") }] },
  { id: "d2", unit: 4, title: L("Tanwin – das n am Ende", "Tanwin – the “n” at the end"), goal: L("Lies -an, -in, -un.", "Read -an, -in, -un."),
    items: ["ب", "ت", "د", "ر", "س", "ع", "ق", "ك", "م", "ن"].flatMap((c) => [{ ar: c + "ً" + "ا", tr: letter(c).tr + "an" }, { ar: c + "ٍ", tr: letter(c).tr + "in" }, { ar: c + "ٌ", tr: letter(c).tr + "un" }]),
    learn: [{ ar: "بًا بٍ بٌ", title: L("Doppelte Zeichen", "Doubled marks"), body: L("Steht ein Vokalzeichen doppelt, kommt ein „n“ dazu: بًا = ban, بٍ = bin, بٌ = bun. Tanwin steht nur am Wortende.", "When a vowel mark is doubled, an “n” is added: بًا = ban, بٍ = bin, بٌ = bun. Tanwin only appears at the end of a word.") }] },
  { id: "d3", unit: 4, title: L("Sukun – kein Vokal", "Sukun – no vowel"), goal: L("Lies geschlossene Silben wie „qul“ und „min“.", "Read closed syllables like “qul” and “min”."),
    items: [{ ar: "قُلْ", tr: "qul" }, { ar: "مِنْ", tr: "min" }, { ar: "لَمْ", tr: "lam" }, { ar: "هُمْ", tr: "hum" }, { ar: "كُنْ", tr: "kun" }, { ar: "قَدْ", tr: "qad" }, { ar: "عَنْ", tr: "ʿan" }, { ar: "بَلْ", tr: "bal" }, { ar: "هَلْ", tr: "hal" }, { ar: "لَنْ", tr: "lan" }, { ar: "إِذْ", tr: "idh" }, { ar: "أَمْ", tr: "am" }],
    learn: [{ ar: "قُلْ", title: L("Sukun ـْ", "Sukun ـْ"), body: L("Ein kleiner Kreis über dem Buchstaben: Er wird ohne Vokal gesprochen und schließt die Silbe. قُلْ = qul („sag!“).", "A small circle above the letter: it is pronounced without a vowel and closes the syllable. قُلْ = qul (“say!”).") }] },
  { id: "d4", unit: 4, title: L("Schadda – doppelter Buchstabe", "Shadda – doubled letter"), goal: L("Lies verdoppelte Buchstaben.", "Read doubled letters."),
    items: [{ ar: "رَبَّ", tr: "rabba" }, { ar: "إِنَّ", tr: "inna" }, { ar: "ثُمَّ", tr: "thumma" }, { ar: "كُلُّ", tr: "kullu" }, { ar: "حَقَّ", tr: "ḥaqqa" }, { ar: "أَنَّ", tr: "anna" }, { ar: "مِمَّا", tr: "mimmā" }, { ar: "رَبِّ", tr: "rabbi" }, { ar: "ٱللَّهُ", tr: "Allāhu" }, { ar: "إِيَّاكَ", tr: "iyyāka" }],
    learn: [{ ar: "رَبَّ", title: L("Schadda ـّ", "Shadda ـّ"), body: L("Das kleine „w“-förmige Zeichen verdoppelt den Buchstaben: رَبَّ = rab-ba. Sprich den Buchstaben zweimal – einmal am Ende der Silbe, einmal am Anfang der nächsten.", "The small “w”-shaped sign doubles the letter: رَبَّ = rab-ba. Say the letter twice – once closing the syllable, once opening the next.") }] },
  { id: "e1", unit: 5, title: L("Der Artikel „al-“: Sonne und Mond", "The article “al-”: sun and moon"), goal: L("Lies „al-“ richtig – mal mit l, mal ohne.", "Read “al-” correctly – sometimes with l, sometimes without."),
    items: [{ ar: "ٱلْقَمَرُ", tr: "al-qamaru", meaning: L("der Mond", "the moon") }, { ar: "ٱلْكِتَٰبُ", tr: "al-kitābu", meaning: L("das Buch", "the book") }, { ar: "ٱلْحَمْدُ", tr: "al-ḥamdu", meaning: L("das Lob", "the praise") }, { ar: "ٱلْعَٰلَمِينَ", tr: "al-ʿālamīna", meaning: L("die Welten", "the worlds") }, { ar: "ٱلشَّمْسُ", tr: "ash-shamsu", meaning: L("die Sonne", "the sun") }, { ar: "ٱلنَّاسِ", tr: "an-nāsi", meaning: L("der Menschen", "of mankind") }, { ar: "ٱلرَّحِيمِ", tr: "ar-raḥīmi", meaning: L("des Barmherzigen", "the Most Merciful") }, { ar: "ٱلدِّينِ", tr: "ad-dīni", meaning: L("des Gerichts", "of Judgement") }],
    learn: [
      { ar: "ٱلْقَمَرُ", title: L("Mondbuchstaben", "Moon letters"), body: L("Vor 14 „Mondbuchstaben“ (z. B. ق ك ح ع) hört man das l: al-qamar. Das Lām trägt ein Sukun.", "Before 14 “moon letters” (e.g. ق ك ح ع) you hear the l: al-qamar. The lām carries a sukun.") },
      { ar: "ٱلشَّمْسُ", title: L("Sonnenbuchstaben", "Sun letters"), body: L("Vor 14 „Sonnenbuchstaben“ (z. B. ش ن ر د) verschwindet das l und der nächste Buchstabe wird verdoppelt (Schadda): ash-shams, nicht al-shams.", "Before 14 “sun letters” (e.g. ش ن ر د) the l disappears and the next letter is doubled (shadda): ash-shams, not al-shams.") },
      { ar: "ٱ", title: L("Das Wasla-Alif ٱ", "The wasla alif ٱ"), body: L("Das kleine Zeichen auf dem Alif bedeutet: Am Satzanfang sprichst du „a“, mitten im Satz wird es übersprungen und verbunden.", "The small sign on the alif means: at the start you say “a”, in the middle of a sentence it is skipped and joined.") },
    ] },
  { id: "e2", unit: 5, title: L("Ta marbuta, Alif maqsura, kleines Alif", "Ta marbuta, alif maqsura, small alif"), goal: L("Lies die besonderen Zeichen der Koranschrift.", "Read the special signs of the Quranic script."),
    items: [{ ar: "رَحْمَةٌ", tr: "raḥmatun", meaning: L("Barmherzigkeit", "mercy") }, { ar: "جَنَّةٌ", tr: "jannatun", meaning: L("ein Garten", "a garden") }, { ar: "هُدًى", tr: "hudan", meaning: L("Rechtleitung", "guidance") }, { ar: "عَلَىٰ", tr: "ʿalā", meaning: L("auf", "upon") }, { ar: "مُوسَىٰ", tr: "mūsā", meaning: L("Musa (Mose)", "Musa (Moses)") }, { ar: "ذَٰلِكَ", tr: "dhālika", meaning: L("jenes", "that") }, { ar: "هَٰذَا", tr: "hādhā", meaning: L("dieses", "this") }, { ar: "ٱلرَّحْمَٰنِ", tr: "ar-raḥmāni", meaning: L("des Allerbarmers", "the Most Gracious") }],
    learn: [
      { ar: "ة", title: L("Ta marbuta ة", "Ta marbuta ة"), body: L("Ein Hā' mit zwei Punkten am Wortende. Im Fluss gelesen als „t“ (raḥmatun), beim Anhalten als „h“ (raḥmah).", "A hā' with two dots at the end of a word. Read as “t” when continuing (raḥmatun), as “h” when stopping (raḥmah).") },
      { ar: "ى", title: L("Alif maqsura ى", "Alif maqsura ى"), body: L("Sieht aus wie Yā' ohne Punkte und wird wie ein langes ā gelesen: عَلَىٰ = ʿalā.", "Looks like a yā' without dots and is read as a long ā: عَلَىٰ = ʿalā.") },
      { ar: "ذَٰلِكَ", title: L("Das kleine Alif ـٰ", "The small alif ـٰ"), body: L("Ein senkrechter Mini-Strich über dem Buchstaben – typisch für die Koranschrift – bedeutet ebenfalls langes ā: ذَٰلِكَ = dhālika.", "A tiny vertical stroke above the letter – typical of the Quranic script – also means a long ā: ذَٰلِكَ = dhālika.") },
    ] },
  { id: "f1", unit: 6, title: L("Al-Fatiha 1–4", "Al-Fatiha 1–4"), goal: L("Lies die ersten Wörter der Fatiha.", "Read the first words of Al-Fatiha."),
    items: [{ ar: "بِسْمِ", tr: "bismi", meaning: L("im Namen", "in the name") }, { ar: "ٱللَّهِ", tr: "Allāhi", meaning: L("Allahs", "of Allah") }, { ar: "ٱلرَّحْمَٰنِ", tr: "ar-raḥmāni", meaning: L("des Allerbarmers", "the Most Gracious") }, { ar: "ٱلرَّحِيمِ", tr: "ar-raḥīmi", meaning: L("des Barmherzigen", "the Most Merciful") }, { ar: "ٱلْحَمْدُ", tr: "al-ḥamdu", meaning: L("das Lob", "all praise") }, { ar: "لِلَّهِ", tr: "lillāhi", meaning: L("gehört Allah", "belongs to Allah") }, { ar: "رَبِّ", tr: "rabbi", meaning: L("dem Herrn", "Lord") }, { ar: "ٱلْعَٰلَمِينَ", tr: "al-ʿālamīna", meaning: L("der Welten", "of the worlds") }, { ar: "مَٰلِكِ", tr: "māliki", meaning: L("dem Herrscher", "Master") }, { ar: "يَوْمِ", tr: "yawmi", meaning: L("des Tages", "of the Day") }, { ar: "ٱلدِّينِ", tr: "ad-dīni", meaning: L("des Gerichts", "of Judgement") }],
    learn: [{ ar: "بِسْمِ ٱللَّهِ", title: L("Du liest jetzt den Koran!", "You are reading the Quran now!"), body: L("Alles, was du gelernt hast, kommt hier zusammen: Kasra, Sukun, Wasla, Schadda, das kleine Alif. Lies jedes Wort langsam, Silbe für Silbe.", "Everything you learned comes together here: kasra, sukun, wasla, shadda, the small alif. Read every word slowly, syllable by syllable.") }] },
  { id: "f2", unit: 6, title: L("Al-Fatiha 5–7", "Al-Fatiha 5–7"), goal: L("Lies das Ende der Fatiha.", "Read the end of Al-Fatiha."),
    items: [{ ar: "إِيَّاكَ", tr: "iyyāka", meaning: L("dir (allein)", "You (alone)") }, { ar: "نَعْبُدُ", tr: "naʿbudu", meaning: L("dienen wir", "we worship") }, { ar: "وَإِيَّاكَ", tr: "wa iyyāka", meaning: L("und dich (allein)", "and You (alone)") }, { ar: "نَسْتَعِينُ", tr: "nastaʿīnu", meaning: L("bitten wir um Hilfe", "we ask for help") }, { ar: "ٱهْدِنَا", tr: "ihdinā", meaning: L("leite uns", "guide us") }, { ar: "ٱلصِّرَٰطَ", tr: "aṣ-ṣirāṭa", meaning: L("den Weg", "the path") }, { ar: "ٱلْمُسْتَقِيمَ", tr: "al-mustaqīma", meaning: L("den geraden", "the straight") }, { ar: "أَنْعَمْتَ", tr: "anʿamta", meaning: L("du hast Gnade erwiesen", "You have blessed") }, { ar: "عَلَيْهِمْ", tr: "ʿalayhim", meaning: L("ihnen", "upon them") }],
    learn: [{ ar: "إِيَّاكَ نَعْبُدُ", title: L("Langsam und sicher", "Slow and sure"), body: L("Lies erst die Silben, dann das ganze Wort. Danach hörst du die Fatiha im Player – du wirst jedes Wort wiedererkennen.", "Read the syllables first, then the whole word. Then listen to Al-Fatiha in the player – you will recognise every word.") }] },
  { id: "f3", unit: 6, title: L("Al-Ikhlas (Sure 112)", "Al-Ikhlas (Surah 112)"), goal: L("Lies eine ganze Sure.", "Read a whole surah."),
    items: [{ ar: "قُلْ", tr: "qul", meaning: L("sag", "say") }, { ar: "هُوَ", tr: "huwa", meaning: L("er", "He") }, { ar: "أَحَدٌ", tr: "aḥadun", meaning: L("der Eine", "One") }, { ar: "ٱلصَّمَدُ", tr: "aṣ-ṣamadu", meaning: L("der Unabhängige, auf den alle angewiesen sind", "the Eternal Refuge") }, { ar: "لَمْ", tr: "lam", meaning: L("nicht", "not") }, { ar: "يَلِدْ", tr: "yalid", meaning: L("er zeugt", "He begets") }, { ar: "يُولَدْ", tr: "yūlad", meaning: L("er wurde gezeugt", "He was born") }, { ar: "يَكُن", tr: "yakun", meaning: L("ist", "is") }, { ar: "كُفُوًا", tr: "kufuwan", meaning: L("ebenbürtig", "equivalent") }],
    learn: [{ ar: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", title: L("Ein Drittel des Korans", "A third of the Quran"), body: L("Der Prophet ﷺ sagte, Al-Ikhlas komme einem Drittel des Korans gleich (Sahih al-Bukhari). Nach dieser Lektion kannst du sie selbst lesen.", "The Prophet ﷺ said Al-Ikhlas equals a third of the Quran (Sahih al-Bukhari). After this lesson you can read it yourself.") }] },
  { id: "f4", unit: 6, title: L("Al-Falaq & An-Nas", "Al-Falaq & An-Nas"), goal: L("Lies die beiden Schutzsuren.", "Read the two surahs of protection."),
    items: [{ ar: "أَعُوذُ", tr: "aʿūdhu", meaning: L("ich nehme Zuflucht", "I seek refuge") }, { ar: "بِرَبِّ", tr: "birabbi", meaning: L("beim Herrn", "in the Lord") }, { ar: "ٱلْفَلَقِ", tr: "al-falaqi", meaning: L("des Morgengrauens", "of daybreak") }, { ar: "شَرِّ", tr: "sharri", meaning: L("dem Übel", "the evil") }, { ar: "مَا", tr: "mā", meaning: L("was", "what") }, { ar: "خَلَقَ", tr: "khalaqa", meaning: L("er erschaffen hat", "He created") }, { ar: "ٱلنَّاسِ", tr: "an-nāsi", meaning: L("der Menschen", "of mankind") }, { ar: "مَلِكِ", tr: "maliki", meaning: L("dem König", "the King") }, { ar: "إِلَٰهِ", tr: "ilāhi", meaning: L("dem Gott", "the God") }],
    learn: [{ ar: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", title: L("Die Schutzsuren", "The surahs of protection"), body: L("Al-Falaq und An-Nas rezitierte der Prophet ﷺ morgens, abends und vor dem Schlafen. Lerne sie lesen – und dann auswendig.", "The Prophet ﷺ recited Al-Falaq and An-Nas in the morning, evening and before sleep. Learn to read them – then by heart.") }] },
  { id: "f5", unit: 6, title: L("Abschlusstest", "Final test"), goal: L("Zeig, dass du den Koran lesen kannst.", "Show that you can read the Quran."), test: true, learn: [{ ar: "ٱقْرَأْ", title: L("Iqra' – Lies!", "Iqra' – Read!"), body: L("Das erste offenbarte Wort des Korans war „Lies!“ (96:1). Dieser Test mischt alles aus dem Kurs.", "The first revealed word of the Quran was “Read!” (96:1). This test mixes everything from the course.") }] },
];

// ---------- exercises ----------
export type Ex =
  | { t: "learn"; ar: string; title: string; body: string; speak?: string }
  | { t: "choose"; q: string; ar?: string; speak?: string; options: { ar?: string; text?: string }[]; answer: number; key: string }
  | { t: "match"; pairs: { ar: string; text: string }[]; key: string };

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const uniq = <T,>(a: T[]) => Array.from(new Set(a));

type Lang = "de" | "en";
const tx = (v: L2, lang: Lang) => v[lang];

function letterExercises(chs: string[], pool: string[], lang: Lang): Ex[] {
  const out: Ex[] = [];
  for (const c of chs) {
    const l = letter(c);
    const others = uniq([...(l.similar ?? []), ...shuffle(pool)]).filter((x) => x !== c).slice(0, 3);
    const opts = shuffle([c, ...others]);
    out.push({ t: "choose", q: lang === "de" ? `Welcher Buchstabe ist „${l.name}“ (${l.tr})?` : `Which letter is “${l.name}” (${l.tr})?`, options: opts.map((o) => ({ ar: o })), answer: opts.indexOf(c), key: `L:${c}` });
    const names = shuffle([c, ...others]);
    out.push({ t: "choose", q: lang === "de" ? "Wie heißt dieser Buchstabe?" : "What is this letter called?", ar: c, speak: c, options: names.map((o) => ({ text: `${letter(o).name} · ${letter(o).tr}` })), answer: names.indexOf(c), key: `L:${c}` });
  }
  if (chs.length >= 3) out.push({ t: "match", pairs: shuffle(chs).slice(0, 4).map((c) => ({ ar: c, text: letter(c).name })), key: `M:${chs.join("")}` });
  return out;
}

function formExercises(chs: string[], lang: Lang): Ex[] {
  const out: Ex[] = [];
  const pos = ["start", "middle", "end"] as const;
  const posName = { start: lang === "de" ? "am Wortanfang" : "at the start", middle: lang === "de" ? "in der Wortmitte" : "in the middle", end: lang === "de" ? "am Wortende" : "at the end" };
  for (const c of chs) {
    const p = pos[Math.floor(Math.random() * 3)];
    const f = forms(letter(c))[p];
    const others = uniq([...(letter(c).similar ?? []), ...shuffle(LETTERS.map((x) => x.ch))]).filter((x) => x !== c).slice(0, 3);
    const opts = shuffle([c, ...others]);
    out.push({ t: "choose", q: lang === "de" ? `Welcher Buchstabe steht hier ${posName[p]}?` : `Which letter is this, ${posName[p]}?`, ar: f, options: opts.map((o) => ({ ar: o })), answer: opts.indexOf(c), key: `F:${c}` });
  }
  out.push({ t: "match", pairs: shuffle(chs).slice(0, 4).map((c) => ({ ar: forms(letter(c)).middle, text: letter(c).name })), key: `FM:${chs.join("")}` });
  return out;
}

function readingExercises(items: Item[], pool: Item[], lang: Lang): Ex[] {
  const out: Ex[] = [];
  const picks = shuffle(items).slice(0, 8);
  picks.forEach((it, i) => {
    const others = shuffle(uniq(pool.map((p) => p.tr)).filter((x) => x !== it.tr)).slice(0, 3);
    if (i % 2 === 0) {
      const opts = shuffle([it.tr, ...others]);
      out.push({ t: "choose", q: lang === "de" ? "Wie liest man das?" : "How is this read?", ar: it.ar, speak: it.ar, options: opts.map((o) => ({ text: o })), answer: opts.indexOf(it.tr), key: `R:${it.ar}` });
    } else {
      const arOthers = shuffle(uniq(pool.map((p) => p.ar)).filter((x) => x !== it.ar)).slice(0, 3);
      const opts = shuffle([it.ar, ...arOthers]);
      out.push({ t: "choose", q: lang === "de" ? `Wo steht „${it.tr}“?` : `Where does it say “${it.tr}”?`, speak: it.ar, options: opts.map((o) => ({ ar: o })), answer: opts.indexOf(it.ar), key: `R:${it.ar}` });
    }
    if (it.meaning && i % 3 === 1) {
      const mOthers = shuffle(uniq(pool.filter((p) => p.meaning).map((p) => tx(p.meaning!, lang))).filter((x) => x !== tx(it.meaning!, lang))).slice(0, 3);
      if (mOthers.length >= 2) { const opts = shuffle([tx(it.meaning, lang), ...mOthers]); out.push({ t: "choose", q: lang === "de" ? "Was bedeutet dieses Wort?" : "What does this word mean?", ar: it.ar, options: opts.map((o) => ({ text: o })), answer: opts.indexOf(tx(it.meaning, lang)), key: `W:${it.ar}` }); }
    }
  });
  const m = shuffle(items).slice(0, 4);
  if (m.length === 4 && uniq(m.map((x) => x.tr)).length === 4) out.push({ t: "match", pairs: m.map((x) => ({ ar: x.ar, text: x.tr })), key: `RM:${m.map((x) => x.ar).join("")}` });
  return out;
}

const ALL_ITEMS = () => LESSONS.flatMap((l) => l.items ?? []);

export function buildLesson(lesson: Lesson, lang: Lang): Ex[] {
  const learn: Ex[] = lesson.learn.map((c) => ({ t: "learn", ar: c.ar, title: tx(c.title, lang), body: tx(c.body, lang), speak: c.ar }));
  let ex: Ex[] = [];
  const idx = LESSONS.indexOf(lesson);
  if (lesson.test) {
    const before = LESSONS.slice(0, idx + 1);
    const lettersSoFar = uniq(before.flatMap((l) => l.letters ?? []));
    const itemsSoFar = before.flatMap((l) => l.items ?? []);
    if (lettersSoFar.length) ex.push(...letterExercises(shuffle(lettersSoFar).slice(0, 6), LETTERS.map((l) => l.ch), lang));
    if (before.some((l) => l.formsOf)) ex.push(...formExercises(shuffle(uniq(before.flatMap((l) => l.formsOf ?? []))).slice(0, 4), lang));
    if (itemsSoFar.length) ex.push(...readingExercises(itemsSoFar, itemsSoFar, lang));
    ex = shuffle(ex).slice(0, 16);
  } else if (lesson.letters) ex = letterExercises(lesson.letters, LETTERS.map((l) => l.ch), lang);
  else if (lesson.formsOf) ex = formExercises(lesson.formsOf, lang);
  else if (lesson.items) ex = readingExercises(lesson.items, lesson.unit >= 5 ? ALL_ITEMS() : lesson.items, lang);
  return [...learn, ...shuffle(ex.filter((e) => e.t !== "match")), ...ex.filter((e) => e.t === "match")];
}

// ---------- progress (synced with the account as "tf:arabic") ----------
export type ArabicProgress = { done: Record<string, { best: number; stars: number; at: number }>; xp: number; mistakes: Record<string, number>; streakDay?: number };
const KEY = "tf:arabic";
export const PASS_PCT = 70;
export const readArabic = (): ArabicProgress => readJSON<ArabicProgress>(KEY, { done: {}, xp: 0, mistakes: {} });
export const starsFor = (pct: number) => (pct >= 95 ? 3 : pct >= 85 ? 2 : pct >= PASS_PCT ? 1 : 0);
export function saveArabic(id: string, pct: number, xp: number, wrongKeys: string[]) {
  const p = readArabic();
  const prev = p.done[id];
  p.done[id] = { best: Math.max(prev?.best ?? 0, pct), stars: Math.max(prev?.stars ?? 0, starsFor(pct)), at: Date.now() };
  p.xp += xp;
  for (const k of wrongKeys) p.mistakes[k] = (p.mistakes[k] ?? 0) + 1;
  writeJSON(KEY, p);
  return p;
}
export const unlocked = (p: ArabicProgress, id: string) => {
  const i = LESSONS.findIndex((l) => l.id === id);
  return i <= 0 || (p.done[LESSONS[i - 1].id]?.best ?? 0) >= PASS_PCT;
};
export const nextArabic = (p: ArabicProgress) => LESSONS.find((l) => (p.done[l.id]?.best ?? 0) < PASS_PCT) ?? null;
export const arabicPercent = (p: ArabicProgress) => Math.round((LESSONS.filter((l) => (p.done[l.id]?.best ?? 0) >= PASS_PCT).length / LESSONS.length) * 100);
