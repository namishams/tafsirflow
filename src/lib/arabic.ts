// "Read the Quran" course: Arabic reading from zero, built like the Qa'ida Nuraniyya taught in Quran schools
// (letters → letter forms → short vowels → long vowels → tanwin → sukun → shadda → special signs → Quran words),
// with short Babbel-style lessons: learn cards, then varied exercises, mistakes come back at the end.
import { readJSON, writeJSON } from "./storage";
import { VERSES, verseOf, wordsOf, type Verse } from "./arabicQuran";

export type L2 = { de: string; en: string; ar?: string };
export type Letter = { ch: string; name: string; tr: string; connects: boolean; sound: L2; similar?: string[] };

// tr = the sound used in syllables (simple transliteration)
export const LETTERS: Letter[] = [
  { ch: "ا", name: "Alif", tr: "a", connects: false, sound: { de: "Träger für das lange „ā“ und für die Hamza – selbst kein Konsonant", en: "carrier of the long “ā” and of hamza – not a consonant itself", ar: "حرفُ مدٍّ يحمل الفتحة الطويلة «ـَا»، ويكون كرسيًّا للهمزة – ولا يقبل الحركة بنفسه؛ مخرجه الجَوف (الفراغ الممتد في الحلق والفم)" } },
  { ch: "ب", name: "Bā'", tr: "b", connects: true, sound: { de: "b wie in „Ball“", en: "b as in “ball”", ar: "مخرجها من بين الشفتين بانطباقهما، كما في «باب»" }, similar: ["ت", "ث", "ن", "ي"] },
  { ch: "ت", name: "Tā'", tr: "t", connects: true, sound: { de: "t wie in „Tee“", en: "t as in “tea”", ar: "مخرجها من طرف اللسان مع أصول الثنايا العليا، كما في «تمر»" }, similar: ["ب", "ث", "ن"] },
  { ch: "ث", name: "Thā'", tr: "th", connects: true, sound: { de: "stimmloses „th“ wie im Englischen „think“ – Zungenspitze zwischen den Zähnen", en: "th as in “think” – tongue tip between the teeth", ar: "مخرجها من طرف اللسان مع أطراف الثنايا العليا – يبرز طرف اللسان قليلًا بين الأسنان، كما في «ثوب»" }, similar: ["ت", "ب", "ش"] },
  { ch: "ج", name: "Jīm", tr: "j", connects: true, sound: { de: "dsch wie in „Dschungel“", en: "j as in “jam”", ar: "مخرجها من وسط اللسان مع ما يحاذيه من الحنك الأعلى، جيمٌ فصيحةٌ شديدة كما في «جبل»" }, similar: ["ح", "خ"] },
  { ch: "ح", name: "Ḥā'", tr: "ḥ", connects: true, sound: { de: "kräftig gehauchtes h aus der Kehlmitte – wie beim Anhauchen einer Brille", en: "a strong breathy h from the middle of the throat – like fogging up glasses", ar: "مخرجها من وسط الحلق، صوتٌ مهموسٌ فيه بُحّة – كمن ينفخ على زجاج النظارة ليمسحها، كما في «حمد»" }, similar: ["ج", "خ", "ه"] },
  { ch: "خ", name: "Khā'", tr: "kh", connects: true, sound: { de: "ch wie in „Bach“", en: "kh like the “ch” in Scottish “loch”", ar: "مخرجها من أدنى الحلق (أقربه إلى الفم)، صوتٌ فيه خشونةٌ واحتكاك، كما في «خير»" }, similar: ["ح", "ج"] },
  { ch: "د", name: "Dāl", tr: "d", connects: false, sound: { de: "d wie in „Dach“", en: "d as in “door”", ar: "مخرجها من طرف اللسان مع أصول الثنايا العليا، كما في «دار»" }, similar: ["ذ", "ر"] },
  { ch: "ذ", name: "Dhāl", tr: "dh", connects: false, sound: { de: "stimmhaftes „th“ wie im Englischen „this“", en: "th as in “this”", ar: "مخرجها من طرف اللسان مع أطراف الثنايا العليا كالثاء، لكن بصوتٍ مجهور، كما في «ذهب»" }, similar: ["د", "ز", "ظ"] },
  { ch: "ر", name: "Rā'", tr: "r", connects: false, sound: { de: "gerolltes Zungenspitzen-r", en: "a rolled r with the tongue tip", ar: "مخرجها من طرف اللسان مع ما يليه من اللثة العليا، مع ارتعادٍ خفيفٍ لا يُبالَغ فيه، كما في «رمّان»" }, similar: ["ز", "د"] },
  { ch: "ز", name: "Zāy", tr: "z", connects: false, sound: { de: "stimmhaftes s wie in „Sonne“", en: "z as in “zoo”", ar: "مخرجها من طرف اللسان فوق الثنايا السفلى، صوتُ صفيرٍ مجهور، كما في «زيتون»" }, similar: ["ر", "ذ"] },
  { ch: "س", name: "Sīn", tr: "s", connects: true, sound: { de: "scharfes s wie in „Fluss“", en: "s as in “sun”", ar: "مخرجها من طرف اللسان فوق الثنايا السفلى، صوتُ صفيرٍ مهموس، كما في «سماء»" }, similar: ["ش", "ص"] },
  { ch: "ش", name: "Shīn", tr: "sh", connects: true, sound: { de: "sch wie in „Schule“", en: "sh as in “ship”", ar: "مخرجها من وسط اللسان مع الحنك الأعلى، وينتشر الهواء في الفم (التفشّي)، كما في «شمس»" }, similar: ["س", "ث"] },
  { ch: "ص", name: "Ṣād", tr: "ṣ", connects: true, sound: { de: "schweres, dunkles s – die Zunge drückt nach hinten, der Mund wird voll", en: "a heavy, dark s – the back of the tongue rises, the mouth sounds full", ar: "صادٌ مفخَّمة: مخرجها كالسين، لكن يرتفع أقصى اللسان وينطبق فيمتلئ الفم بالصوت، كما في «صبر»" }, similar: ["س", "ض"] },
  { ch: "ض", name: "Ḍād", tr: "ḍ", connects: true, sound: { de: "schweres, dunkles d – ein Laut, für den Arabisch „die Sprache des Ḍād“ heißt", en: "a heavy, dark d – Arabic is called “the language of Ḍād” because of it", ar: "ضادٌ مفخَّمة، مخرجها من إحدى حافتي اللسان مع ما يحاذيها من الأضراس العليا – وبها سُمّيت العربية «لغة الضاد»" }, similar: ["ص", "ظ", "د"] },
  { ch: "ط", name: "Ṭā'", tr: "ṭ", connects: true, sound: { de: "schweres, dunkles t", en: "a heavy, dark t", ar: "طاءٌ مفخَّمة، مخرجها كالتاء من طرف اللسان مع أصول الثنايا العليا، مع إطباقٍ واستعلاء، كما في «طين»" }, similar: ["ظ", "ت"] },
  { ch: "ظ", name: "Ẓā'", tr: "ẓ", connects: true, sound: { de: "schweres, dunkles „th“ wie in „this“", en: "a heavy, dark “th” as in “this”", ar: "ظاءٌ مفخَّمة، مخرجها كالذال من طرف اللسان مع أطراف الثنايا العليا، مع إطباقٍ واستعلاء، كما في «ظلّ»" }, similar: ["ط", "ذ", "ض"] },
  { ch: "ع", name: "'Ayn", tr: "ʿ", connects: true, sound: { de: "gepresster Laut aus der Kehlmitte – kein Vokal, sondern ein eigener Kehllaut", en: "a squeezed sound from the middle of the throat – a consonant, not a vowel", ar: "مخرجها من وسط الحلق، صوتٌ يضيق معه الحلق وينضغط – حرفٌ مستقلٌّ وليس حركة، كما في «عين»" }, similar: ["غ", "ء"] },
  { ch: "غ", name: "Ghayn", tr: "gh", connects: true, sound: { de: "Gaumen-r wie im Französischen „Paris“ – wie leises Gurgeln", en: "like the French “r” in “Paris” – a soft gargle", ar: "مخرجها من أدنى الحلق، صوتٌ يشبه الغرغرة الخفيفة، كما في «غيم»" }, similar: ["ع", "خ"] },
  { ch: "ف", name: "Fā'", tr: "f", connects: true, sound: { de: "f wie in „Fisch“", en: "f as in “fish”", ar: "مخرجها من باطن الشفة السفلى مع أطراف الثنايا العليا، كما في «فم»" }, similar: ["ق"] },
  { ch: "ق", name: "Qāf", tr: "q", connects: true, sound: { de: "tiefes k ganz hinten im Rachen", en: "a deep k from the very back of the throat", ar: "مخرجها من أقصى اللسان مع ما يحاذيه من الحنك الأعلى، أعمق من الكاف، كما في «قلم»" }, similar: ["ف", "ك"] },
  { ch: "ك", name: "Kāf", tr: "k", connects: true, sound: { de: "k wie in „Kind“", en: "k as in “kite”", ar: "مخرجها من أقصى اللسان أسفلَ مخرج القاف قليلًا، كما في «كتاب»" }, similar: ["ق", "ل"] },
  { ch: "ل", name: "Lām", tr: "l", connects: true, sound: { de: "l wie in „Licht“", en: "l as in “light”", ar: "مخرجها من حافة اللسان وطرفه مع ما يحاذيها من اللثة العليا، كما في «ليل»" }, similar: ["ك", "ا"] },
  { ch: "م", name: "Mīm", tr: "m", connects: true, sound: { de: "m wie in „Mond“", en: "m as in “moon”", ar: "مخرجها من بين الشفتين بانطباقهما، مع غُنّةٍ من الخيشوم، كما في «ماء»" }, similar: ["ن"] },
  { ch: "ن", name: "Nūn", tr: "n", connects: true, sound: { de: "n wie in „Nase“", en: "n as in “nose”", ar: "مخرجها من طرف اللسان مع ما يحاذيه من اللثة العليا، مع غُنّةٍ من الخيشوم، كما في «نور»" }, similar: ["ب", "ت", "م"] },
  { ch: "ه", name: "Hā'", tr: "h", connects: true, sound: { de: "leichtes h wie in „Haus“", en: "a light h as in “house”", ar: "مخرجها من أقصى الحلق، هاءٌ خفيفةٌ مهموسة، كما في «هدى»" }, similar: ["ح", "ة"] },
  { ch: "و", name: "Wāw", tr: "w", connects: false, sound: { de: "w wie im Englischen „water“ – und Träger für das lange „ū“", en: "w as in “water” – and the carrier of the long “ū”", ar: "مخرجها من بين الشفتين بانضمامهما، كما في «ولد» – وهي أيضًا حرفُ المدّ للضمة الطويلة «ـُو»" }, similar: ["ر", "د"] },
  { ch: "ي", name: "Yā'", tr: "y", connects: true, sound: { de: "j wie in „Jahr“ – und Träger für das lange „ī“", en: "y as in “yes” – and the carrier of the long “ī”", ar: "مخرجها من وسط اللسان مع الحنك الأعلى، كما في «يد» – وهي أيضًا حرفُ المدّ للكسرة الطويلة «ـِي»" }, similar: ["ب", "ن", "ت"] },
  { ch: "ء", name: "Hamza", tr: "'", connects: false, sound: { de: "kurzer Stimmabsatz wie zwischen „be-achten“", en: "a short glottal stop, as in “uh-oh”", ar: "مخرجها من أقصى الحلق: وقفةٌ قصيرةٌ ينحبس فيها الصوت ثم ينطلق، كما في «أَمْر»" }, similar: ["ع"] },
];
export const letter = (ch: string) => LETTERS.find((l) => l.ch === ch)!;
// Arabic letter names (used only in the Arabic UI texts)
const AR_NAME: Record<string, string> = { "ا": "الألف", "ب": "الباء", "ت": "التاء", "ث": "الثاء", "ج": "الجيم", "ح": "الحاء", "خ": "الخاء", "د": "الدال", "ذ": "الذال", "ر": "الراء", "ز": "الزاي", "س": "السين", "ش": "الشين", "ص": "الصاد", "ض": "الضاد", "ط": "الطاء", "ظ": "الظاء", "ع": "العين", "غ": "الغين", "ف": "الفاء", "ق": "القاف", "ك": "الكاف", "ل": "اللام", "م": "الميم", "ن": "النون", "ه": "الهاء", "و": "الواو", "ي": "الياء", "ء": "الهمزة" };
export const arName = (ch: string) => AR_NAME[ch] ?? letter(ch).name;

const FATHA = "َ", KASRA = "ِ", DAMMA = "ُ", SUKUN = "ْ", SHADDA = "ّ", TATWEEL = "ـ";
export const forms = (l: Letter) => l.connects
  ? { alone: l.ch, start: l.ch + TATWEEL, middle: TATWEEL + l.ch + TATWEEL, end: TATWEEL + l.ch }
  : { alone: l.ch, start: l.ch, middle: TATWEEL + l.ch, end: TATWEEL + l.ch };

// ref = "surah:ayah:word" (word position counts words only) – lets us play the Quran.com word recording
export type Item = { ar: string; tr: string; meaning?: L2; ref?: string };
const syl = (chs: string[], mark: string, vowel: string): Item[] => chs.map((c) => ({ ar: c + mark, tr: letter(c).tr + vowel }));
const CONS = LETTERS.filter((l) => l.ch !== "ا" && l.ch !== "ء").map((l) => l.ch);

export type Lesson = {
  id: string; unit: number; title: L2; goal: L2;
  learn: { ar: string; title: L2; body: L2; ref?: string }[];   // ref: a word recording is played on the card
  letters?: string[];                 // letter lessons
  formsOf?: string[];                 // letter-form lessons
  items?: Item[];                     // reading lessons
  listen?: boolean;                   // unit 7: items carry a word reference → "hear the word, pick the written one"
  verses?: string[];                  // unit 8: verse references ("112:3") → "put the words in order"
  test?: boolean;                     // unit test: mixes everything before it
  placement?: boolean;                // placement test (not part of LESSONS)
};

export const UNITS: { n: number; title: L2; lead: L2 }[] = [
  { n: 1, title: { de: "Die Buchstaben", en: "The letters", ar: "الحروف" }, lead: { de: "Alle 28 Buchstaben und die Hamza – Form, Name und Klang.", en: "All 28 letters and the hamza – shape, name and sound.", ar: "الحروف الثمانية والعشرون والهمزة – الشكل والاسم والصوت." } },
  { n: 2, title: { de: "Buchstaben verbinden", en: "Joining letters", ar: "وصل الحروف" }, lead: { de: "Wie ein Buchstabe am Wortanfang, in der Mitte und am Ende aussieht.", en: "How a letter looks at the start, in the middle and at the end of a word.", ar: "كيف يُكتب الحرف في أول الكلمة ووسطها وآخرها." } },
  { n: 3, title: { de: "Kurze Vokale", en: "Short vowels", ar: "الحركات القصيرة" }, lead: { de: "Fatha, Kasra, Damma – die kleinen Zeichen, die Buchstaben zum Klingen bringen.", en: "Fatha, kasra, damma – the small marks that make letters sound.", ar: "الفتحة والكسرة والضمة – العلامات الصغيرة التي تُنطِق الحروف." } },
  { n: 4, title: { de: "Lange Vokale, Tanwin, Sukun, Schadda", en: "Long vowels, tanwin, sukun, shadda", ar: "المدود والتنوين والسكون والشدّة" }, lead: { de: "Die Zeichen, mit denen du ganze Silben und Wörter liest.", en: "The signs that let you read whole syllables and words.", ar: "العلامات التي تقرأ بها المقاطع والكلمات كاملة." } },
  { n: 5, title: { de: "Besondere Zeichen im Koran", en: "Special signs in the Quran", ar: "علامات خاصة في المصحف" }, lead: { de: "Der Artikel „al-“, Sonnen- und Mondbuchstaben, Ta marbuta, das kleine Alif.", en: "The article “al-”, sun and moon letters, ta marbuta, the small alif.", ar: "«أل» التعريف، والحروف الشمسية والقمرية، والتاء المربوطة، والألف الخنجرية." } },
  { n: 6, title: { de: "Koranwörter lesen", en: "Reading Quran words", ar: "قراءة كلمات القرآن" }, lead: { de: "Al-Fatiha und die kurzen Suren – Wort für Wort, mit Bedeutung.", en: "Al-Fatiha and the short surahs – word by word, with meaning.", ar: "الفاتحة وقِصار السور – كلمةً كلمة، مع المعنى." } },
  { n: 7, title: { de: "Hören und lesen", en: "Listen and read", ar: "استمع واقرأ" }, lead: { de: "Du hörst echte Rezitation Wort für Wort und erkennst das Geschriebene wieder – mit Bedeutung.", en: "You hear real recitation word by word and recognise the written word – with its meaning.", ar: "تستمع إلى التلاوة كلمةً كلمة، وتتعرّف على الكلمة المكتوبة – مع معناها." } },
  { n: 8, title: { de: "Ganze Verse lesen", en: "Reading whole verses", ar: "قراءة الآيات كاملة" }, lead: { de: "Setze die Wörter eines Verses in die richtige Reihenfolge und lies ganze Verse von rechts nach links.", en: "Put the words of a verse in order and read whole verses from right to left.", ar: "رتِّب كلمات الآية، ثم اقرأ الآيات كاملةً من اليمين إلى اليسار." } },
];

const L = (de: string, en: string, ar?: string): L2 => ({ de, en, ar });
const letterLesson = (id: string, chs: string[]): Lesson => ({
  id, unit: 1, letters: chs,
  title: L(`Buchstaben ${chs.join(" ")}`, `Letters ${chs.join(" ")}`, `الحروف ${chs.join(" ")}`),
  goal: L(`Erkenne ${chs.length} Buchstaben an Form und Klang.`, `Recognise ${chs.length} letters by shape and sound.`, chs.length === 1 ? "تعرَّف على هذا الحرف من شكله وصوته." : `تعرَّف على ${chs.length} أحرف من أشكالها وأصواتها.`),
  learn: chs.map((c) => { const l = letter(c); return { ar: c, title: L(`${l.name} – „${l.tr}“`, `${l.name} – “${l.tr}”`, `${arName(c)} – «${l.tr}»`), body: l.sound }; }),
});
const formLesson = (id: string, chs: string[], extra?: { title: L2; body: L2 }): Lesson => ({
  id, unit: 2, formsOf: chs,
  title: L(`Formen: ${chs.join(" ")}`, `Forms: ${chs.join(" ")}`, `أشكال الحروف: ${chs.join(" ")}`),
  goal: L("Erkenne die Buchstaben am Anfang, in der Mitte und am Ende eines Wortes.", "Recognise the letters at the start, in the middle and at the end of a word.", "تعرَّف على الحروف في أول الكلمة ووسطها وآخرها."),
  learn: [
    ...(extra ? [{ ar: chs.join(" "), title: extra.title, body: extra.body }] : []),
    ...chs.map((c) => { const f = forms(letter(c)); return { ar: `${f.start}  ${f.middle}  ${f.end}`, title: L(`${letter(c).name}: Anfang · Mitte · Ende`, `${letter(c).name}: start · middle · end`, `${arName(c)}: أول · وسط · آخر`), body: letter(c).connects ? L("Arabisch wird von rechts nach links geschrieben. Dieser Buchstabe verbindet sich nach beiden Seiten.", "Arabic is written right to left. This letter joins on both sides.", "تُكتب العربية من اليمين إلى اليسار، وهذا الحرف يتصل بما قبله وبما بعده.") : L("Dieser Buchstabe verbindet sich nur mit dem Buchstaben davor – nie mit dem danach.", "This letter only joins the letter before it – never the one after it.", "هذا الحرف يتصل بما قبله فقط، ولا يتصل أبدًا بما بعده.") }; }),
  ],
});

export const LESSONS: Lesson[] = [
  { ...letterLesson("a1", ["ا", "ب", "ت", "ث"]), learn: [{ ar: "ا ب ت ث", title: L("Willkommen!", "Welcome!", "أهلًا وسهلًا!"), body: L("Arabisch liest man von rechts nach links. Viele Buchstaben unterscheiden sich nur durch Punkte: ب hat einen Punkt unten, ت zwei oben, ث drei oben. Schau genau hin!", "Arabic is read from right to left. Many letters differ only by their dots: ب has one dot below, ت two above, ث three above. Look closely!", "تُقرأ العربية من اليمين إلى اليسار، وكثيرٌ من الحروف لا يفرِّق بينها إلا النقاط: الباء ب بنقطةٍ من تحت، والتاء ت بنقطتين من فوق، والثاء ث بثلاث نقاطٍ من فوق. فدقِّق النظر!") }, ...letterLesson("a1", ["ا", "ب", "ت", "ث"]).learn] },
  letterLesson("a2", ["ج", "ح", "خ"]),
  letterLesson("a3", ["د", "ذ", "ر", "ز"]),
  letterLesson("a4", ["س", "ش", "ص", "ض"]),
  letterLesson("a5", ["ط", "ظ", "ع", "غ"]),
  letterLesson("a6", ["ف", "ق", "ك", "ل"]),
  letterLesson("a7", ["م", "ن", "ه", "و", "ي"]),
  { ...letterLesson("a8", ["ء"]), title: L("Hamza & Test: alle Buchstaben", "Hamza & test: all letters", "الهمزة واختبار: جميع الحروف"), test: true },
  formLesson("b1", ["ب", "ت", "ث", "ن", "ي"], { title: L("Gleiche Form, andere Punkte", "Same shape, different dots", "شكلٌ واحد ونقاطٌ مختلفة"), body: L("Am Wortanfang und in der Mitte sehen ب ت ث ن ي fast gleich aus – nur die Punkte verraten den Buchstaben.", "At the start and in the middle of a word ب ت ث ن ي look almost the same – only the dots tell them apart.", "في أول الكلمة ووسطها تتشابه ب ت ث ن ي في الرسم تقريبًا – والنقاط وحدها هي التي تميِّز بينها.") }),
  formLesson("b2", ["ج", "ح", "خ", "ع", "غ"]),
  formLesson("b3", ["س", "ش", "ص", "ض", "ط", "ظ"]),
  formLesson("b4", ["ف", "ق", "ك", "ل", "م", "ه"]),
  formLesson("b5", ["ا", "د", "ذ", "ر", "ز", "و"], { title: L("Die sechs „Egoisten“", "The six “loners”", "الحروف الستة «المنفصلة»"), body: L("ا د ذ ر ز و verbinden sich nie mit dem nächsten Buchstaben. Danach beginnt das Wort scheinbar neu – deshalb sehen manche Wörter wie getrennt aus.", "ا د ذ ر ز و never join the following letter. After them the word seems to start again – that is why some words look split.", "الحروف ا د ذ ر ز و لا تتصل أبدًا بالحرف الذي بعدها، فتبدو الكلمة بعدها كأنها تبدأ من جديد – ولهذا تظهر بعض الكلمات كأنها مقطَّعة.") }),
  { id: "c1", unit: 3, title: L("Fatha – der a-Laut", "Fatha – the “a” sound", "الفتحة – صوت الفتح"), goal: L("Lies Silben mit Fatha.", "Read syllables with fatha.", "اقرأ مقاطع مفتوحة بالفتحة."), items: syl(CONS.slice(0, 14), FATHA, "a"), learn: [{ ar: "بَ تَ ثَ", title: L("Fatha ـَ", "Fatha ـَ", "الفتحة ـَ"), body: L("Ein kleiner Schrägstrich ÜBER dem Buchstaben. Er wird kurz als „a“ gesprochen: بَ = ba.", "A small slanted stroke ABOVE the letter. It is read as a short “a”: بَ = ba.", "شَرطةٌ مائلةٌ صغيرة فوق الحرف، يُنطق معها الحرف بفتح الفم فتحًا قصيرًا: بَ = «بَ».") }] },
  { id: "c2", unit: 3, title: L("Kasra – der i-Laut", "Kasra – the “i” sound", "الكسرة – صوت الكسر"), goal: L("Lies Silben mit Kasra.", "Read syllables with kasra.", "اقرأ مقاطع مكسورة بالكسرة."), items: syl(CONS.slice(0, 14), KASRA, "i"), learn: [{ ar: "بِ تِ ثِ", title: L("Kasra ـِ", "Kasra ـِ", "الكسرة ـِ"), body: L("Ein kleiner Strich UNTER dem Buchstaben. Kurz „i“: بِ = bi.", "A small stroke BELOW the letter. A short “i”: بِ = bi.", "شَرطةٌ صغيرة تحت الحرف، يُنطق معها الحرف بخفض الفكّ السفلي قليلًا: بِ = «بِ».") }] },
  { id: "c3", unit: 3, title: L("Damma – der u-Laut", "Damma – the “u” sound", "الضمة – صوت الضم"), goal: L("Lies Silben mit Damma.", "Read syllables with damma.", "اقرأ مقاطع مضمومة بالضمة."), items: syl(CONS.slice(0, 14), DAMMA, "u"), learn: [{ ar: "بُ تُ ثُ", title: L("Damma ـُ", "Damma ـُ", "الضمة ـُ"), body: L("Ein kleines Wāw-Häkchen ÜBER dem Buchstaben. Kurz „u“: بُ = bu.", "A small wāw-like hook ABOVE the letter. A short “u”: بُ = bu.", "علامةٌ صغيرة تشبه الواو فوق الحرف، يُنطق معها الحرف بضمّ الشفتين ضمًّا قصيرًا: بُ = «بُ».") }] },
  { id: "c4", unit: 3, title: L("Alle drei Vokale gemischt", "All three vowels mixed", "الحركات الثلاث معًا"), goal: L("Unterscheide a, i und u sicher.", "Tell a, i and u apart with confidence.", "ميِّز بين الفتحة والكسرة والضمة بثقة."), items: [...syl(CONS.slice(14), FATHA, "a"), ...syl(CONS.slice(14), KASRA, "i"), ...syl(CONS.slice(14), DAMMA, "u")], learn: [{ ar: "سَ سِ سُ", title: L("Oben, unten, Häkchen", "Above, below, hook", "فوق، وتحت، وواوٌ صغيرة"), body: L("Fatha oben = a, Kasra unten = i, Damma als Häkchen = u. Sprich jede Silbe laut – Lesen lernt man mit dem Mund, nicht nur mit den Augen.", "Fatha above = a, kasra below = i, damma as a hook = u. Say every syllable out loud – you learn to read with your mouth, not only your eyes.", "الفتحة فوق الحرف، والكسرة تحته، والضمة واوٌ صغيرة فوقه. انطق كل مقطعٍ بصوتٍ مسموع – فالقراءة تُتعلَّم باللسان، لا بالعين وحدها.") }] },
  { id: "d1", unit: 4, title: L("Lange Vokale (Madd)", "Long vowels (madd)", "حروف المدّ (المدّ الطبيعي)"), goal: L("Lies ā, ī und ū – doppelt so lang.", "Read ā, ī and ū – twice as long.", "اقرأ المدود الثلاثة – بضعف زمن الحركة القصيرة."),
    items: ["ب", "ت", "س", "ق", "ك", "ل", "م", "ن", "ف", "ج"].flatMap((c) => [{ ar: c + FATHA + "ا", tr: letter(c).tr + "ā" }, { ar: c + KASRA + "ي", tr: letter(c).tr + "ī" }, { ar: c + DAMMA + "و", tr: letter(c).tr + "ū" }]),
    learn: [{ ar: "بَا بِي بُو", title: L("Drei Buchstaben dehnen", "Three letters that stretch", "ثلاثة حروفٍ تُمدّ"), body: L("Fatha + Alif = langes ā (بَا bā), Kasra + Yā' = langes ī (بِي bī), Damma + Wāw = langes ū (بُو bū). Halte den Vokal zwei Zählzeiten lang.", "Fatha + alif = long ā (بَا bā), kasra + yā' = long ī (بِي bī), damma + wāw = long ū (بُو bū). Hold the vowel for two counts.", "فتحة + ألف = مدٌّ بالألف (بَا)، وكسرة + ياء = مدٌّ بالياء (بِي)، وضمة + واو = مدٌّ بالواو (بُو). امدد الصوت بمقدار حركتين.") }] },
  { id: "d2", unit: 4, title: L("Tanwin – das n am Ende", "Tanwin – the “n” at the end", "التنوين – نونٌ في آخر الكلمة"), goal: L("Lies -an, -in, -un.", "Read -an, -in, -un.", "اقرأ تنوين الفتح والكسر والضم."),
    items: ["ب", "ت", "د", "ر", "س", "ع", "ق", "ك", "م", "ن"].flatMap((c) => [{ ar: c + "ً" + "ا", tr: letter(c).tr + "an" }, { ar: c + "ٍ", tr: letter(c).tr + "in" }, { ar: c + "ٌ", tr: letter(c).tr + "un" }]),
    learn: [{ ar: "بًا بٍ بٌ", title: L("Doppelte Zeichen", "Doubled marks", "حركاتٌ مضاعفة"), body: L("Steht ein Vokalzeichen doppelt, kommt ein „n“ dazu: بًا = ban, بٍ = bin, بٌ = bun. Tanwin steht nur am Wortende.", "When a vowel mark is doubled, an “n” is added: بًا = ban, بٍ = bin, بٌ = bun. Tanwin only appears at the end of a word.", "إذا تكرَّرت الحركة زِدنا نونًا ساكنةً تُنطق ولا تُكتب: بًا = «بَنْ»، بٍ = «بِنْ»، بٌ = «بُنْ». ولا يكون التنوين إلا في آخر الكلمة.") }] },
  { id: "d3", unit: 4, title: L("Sukun – kein Vokal", "Sukun – no vowel", "السكون – حرفٌ بلا حركة"), goal: L("Lies geschlossene Silben wie „qul“ und „min“.", "Read closed syllables like “qul” and “min”.", "اقرأ المقاطع الساكنة مثل «قُلْ» و«مِنْ»."),
    items: [{ ar: "قُلْ", tr: "qul" }, { ar: "مِنْ", tr: "min" }, { ar: "لَمْ", tr: "lam" }, { ar: "هُمْ", tr: "hum" }, { ar: "كُنْ", tr: "kun" }, { ar: "قَدْ", tr: "qad" }, { ar: "عَنْ", tr: "ʿan" }, { ar: "بَلْ", tr: "bal" }, { ar: "هَلْ", tr: "hal" }, { ar: "لَنْ", tr: "lan" }, { ar: "إِذْ", tr: "idh" }, { ar: "أَمْ", tr: "am" }],
    learn: [{ ar: "قُلْ", title: L("Sukun ـْ", "Sukun ـْ", "السكون ـْ"), body: L("Ein kleiner Kreis über dem Buchstaben: Er wird ohne Vokal gesprochen und schließt die Silbe. قُلْ = qul („sag!“).", "A small circle above the letter: it is pronounced without a vowel and closes the syllable. قُلْ = qul (“say!”).", "دائرةٌ صغيرة فوق الحرف، معناها أن الحرف ساكنٌ لا حركة عليه، فيُغلَق به المقطع: قُلْ = «قُلْ» (فعل أمر).") }] },
  { id: "d4", unit: 4, title: L("Schadda – doppelter Buchstabe", "Shadda – doubled letter", "الشدّة – حرفٌ مضعَّف"), goal: L("Lies verdoppelte Buchstaben.", "Read doubled letters.", "اقرأ الحروف المشدَّدة."),
    items: [{ ar: "رَبَّ", tr: "rabba" }, { ar: "إِنَّ", tr: "inna" }, { ar: "ثُمَّ", tr: "thumma" }, { ar: "كُلُّ", tr: "kullu" }, { ar: "حَقَّ", tr: "ḥaqqa" }, { ar: "أَنَّ", tr: "anna" }, { ar: "مِمَّا", tr: "mimmā" }, { ar: "رَبِّ", tr: "rabbi" }, { ar: "ٱللَّهُ", tr: "Allāhu" }, { ar: "إِيَّاكَ", tr: "iyyāka" }],
    learn: [{ ar: "رَبَّ", title: L("Schadda ـّ", "Shadda ـّ", "الشدّة ـّ"), body: L("Das kleine „w“-förmige Zeichen verdoppelt den Buchstaben: رَبَّ = rab-ba. Sprich den Buchstaben zweimal – einmal am Ende der Silbe, einmal am Anfang der nächsten.", "The small “w”-shaped sign doubles the letter: رَبَّ = rab-ba. Say the letter twice – once closing the syllable, once opening the next.", "علامةٌ صغيرة تشبه رأس السين تدلّ على أن الحرف مكرَّر: رَبَّ = «رَبْ + بَ». انطق الحرف مرتين: الأولى ساكنةً تُغلق المقطع، والثانية متحركةً تفتح المقطع الذي يليه.") }] },
  { id: "e1", unit: 5, title: L("Der Artikel „al-“: Sonne und Mond", "The article “al-”: sun and moon", "«أل» التعريف: الشمسية والقمرية"), goal: L("Lies „al-“ richtig – mal mit l, mal ohne.", "Read “al-” correctly – sometimes with l, sometimes without.", "اقرأ «أل» قراءةً صحيحة – تُظهر اللام تارةً وتُدغمها تارةً أخرى."),
    items: [{ ar: "ٱلْقَمَرُ", tr: "al-qamaru", meaning: L("der Mond", "the moon", "القمر") }, { ar: "ٱلْكِتَٰبُ", tr: "al-kitābu", meaning: L("das Buch", "the book", "الكتاب") }, { ar: "ٱلْحَمْدُ", tr: "al-ḥamdu", meaning: L("das Lob", "the praise", "الثناء الجميل") }, { ar: "ٱلْعَٰلَمِينَ", tr: "al-ʿālamīna", meaning: L("die Welten", "the worlds", "جميع الخلائق") }, { ar: "ٱلشَّمْسُ", tr: "ash-shamsu", meaning: L("die Sonne", "the sun", "الشمس") }, { ar: "ٱلنَّاسِ", tr: "an-nāsi", meaning: L("der Menschen", "of mankind", "البشر") }, { ar: "ٱلرَّحِيمِ", tr: "ar-raḥīmi", meaning: L("des Barmherzigen", "the Most Merciful", "كثير الرحمة بعباده") }, { ar: "ٱلدِّينِ", tr: "ad-dīni", meaning: L("des Gerichts", "of Judgement", "الجزاء والحساب") }],
    learn: [
      { ar: "ٱلْقَمَرُ", title: L("Mondbuchstaben", "Moon letters", "الحروف القمرية"), body: L("Vor 14 „Mondbuchstaben“ (z. B. ق ك ح ع) hört man das l: al-qamar. Das Lām trägt ein Sukun.", "Before 14 “moon letters” (e.g. ق ك ح ع) you hear the l: al-qamar. The lām carries a sukun.", "قبل الحروف القمرية الأربعة عشر (مثل ق ك ح ع) تظهر اللام في النطق: ٱلْقَمَر، وتكون اللام ساكنة.") },
      { ar: "ٱلشَّمْسُ", title: L("Sonnenbuchstaben", "Sun letters", "الحروف الشمسية"), body: L("Vor 14 „Sonnenbuchstaben“ (z. B. ش ن ر د) verschwindet das l und der nächste Buchstabe wird verdoppelt (Schadda): ash-shams, nicht al-shams.", "Before 14 “sun letters” (e.g. ش ن ر د) the l disappears and the next letter is doubled (shadda): ash-shams, not al-shams.", "قبل الحروف الشمسية الأربعة عشر (مثل ش ن ر د) لا تُنطق اللام، ويُشدَّد الحرف الذي بعدها: ٱلشَّمْس تُقرأ «اَشَّمْس» لا «اَلْشَمْس».") },
      { ar: "ٱ", title: L("Das Wasla-Alif ٱ", "The wasla alif ٱ", "همزة الوصل ٱ"), body: L("Das kleine Zeichen auf dem Alif bedeutet: Am Satzanfang sprichst du „a“, mitten im Satz wird es übersprungen und verbunden.", "The small sign on the alif means: at the start you say “a”, in the middle of a sentence it is skipped and joined.", "العلامة الصغيرة فوق الألف (الصِّلة) تعني: إذا ابتدأتَ بها نطقتَ همزةً مفتوحة، وإذا وصلتَها بما قبلها سقطت في النطق.") },
    ] },
  { id: "e2", unit: 5, title: L("Ta marbuta, Alif maqsura, kleines Alif", "Ta marbuta, alif maqsura, small alif", "التاء المربوطة، والألف المقصورة، والألف الخنجرية"), goal: L("Lies die besonderen Zeichen der Koranschrift.", "Read the special signs of the Quranic script.", "اقرأ العلامات الخاصة بالرسم القرآني."),
    items: [{ ar: "رَحْمَةٌ", tr: "raḥmatun", meaning: L("Barmherzigkeit", "mercy", "الرأفة والعطف") }, { ar: "جَنَّةٌ", tr: "jannatun", meaning: L("ein Garten", "a garden", "بستان") }, { ar: "هُدًى", tr: "hudan", meaning: L("Rechtleitung", "guidance", "الرشاد") }, { ar: "عَلَىٰ", tr: "ʿalā", meaning: L("auf", "upon", "فوق") }, { ar: "مُوسَىٰ", tr: "mūsā", meaning: L("Musa (Mose)", "Musa (Moses)", "موسى عليه السلام") }, { ar: "ذَٰلِكَ", tr: "dhālika", meaning: L("jenes", "that", "اسم إشارة للبعيد") }, { ar: "هَٰذَا", tr: "hādhā", meaning: L("dieses", "this", "اسم إشارة للقريب") }, { ar: "ٱلرَّحْمَٰنِ", tr: "ar-raḥmāni", meaning: L("des Allerbarmers", "the Most Gracious", "ذو الرحمة الواسعة") }],
    learn: [
      { ar: "ة", title: L("Ta marbuta ة", "Ta marbuta ة", "التاء المربوطة ة"), body: L("Ein Hā' mit zwei Punkten am Wortende. Im Fluss gelesen als „t“ (raḥmatun), beim Anhalten als „h“ (raḥmah).", "A hā' with two dots at the end of a word. Read as “t” when continuing (raḥmatun), as “h” when stopping (raḥmah).", "هاءٌ بنقطتين في آخر الكلمة؛ تُنطق تاءً عند الوصل (رَحْمَةٌ = «رَحْمَتُنْ»)، وهاءً ساكنةً عند الوقف («رَحْمَهْ»).") },
      { ar: "ى", title: L("Alif maqsura ى", "Alif maqsura ى", "الألف المقصورة ى"), body: L("Sieht aus wie Yā' ohne Punkte und wird wie ein langes ā gelesen: عَلَىٰ = ʿalā.", "Looks like a yā' without dots and is read as a long ā: عَلَىٰ = ʿalā.", "تشبه الياء بلا نقاط، وتُقرأ ألفًا ممدودة: عَلَىٰ = «عَلا».") },
      { ar: "ذَٰلِكَ", title: L("Das kleine Alif ـٰ", "The small alif ـٰ", "الألف الخنجرية ـٰ"), body: L("Ein senkrechter Mini-Strich über dem Buchstaben – typisch für die Koranschrift – bedeutet ebenfalls langes ā: ذَٰلِكَ = dhālika.", "A tiny vertical stroke above the letter – typical of the Quranic script – also means a long ā: ذَٰلِكَ = dhālika.", "شَرطةٌ عموديةٌ صغيرة فوق الحرف – من خصائص الرسم القرآني – تدلّ كذلك على المدّ بالألف: ذَٰلِكَ = «ذالِكَ».") },
    ] },
  { id: "f1", unit: 6, title: L("Al-Fatiha 1–4", "Al-Fatiha 1–4", "الفاتحة 1–4"), goal: L("Lies die ersten Wörter der Fatiha.", "Read the first words of Al-Fatiha.", "اقرأ الكلمات الأولى من سورة الفاتحة."),
    items: [{ ar: "بِسْمِ", tr: "bismi", meaning: L("im Namen", "in the name", "مستعينًا باسم") }, { ar: "ٱللَّهِ", tr: "Allāhi", meaning: L("Allahs", "of Allah", "اسم الجلالة") }, { ar: "ٱلرَّحْمَٰنِ", tr: "ar-raḥmāni", meaning: L("des Allerbarmers", "the Most Gracious", "ذو الرحمة الواسعة") }, { ar: "ٱلرَّحِيمِ", tr: "ar-raḥīmi", meaning: L("des Barmherzigen", "the Most Merciful", "كثير الرحمة بعباده") }, { ar: "ٱلْحَمْدُ", tr: "al-ḥamdu", meaning: L("das Lob", "all praise", "الثناء الكامل") }, { ar: "لِلَّهِ", tr: "lillāhi", meaning: L("gehört Allah", "belongs to Allah", "مستحَقٌّ لله وحده") }, { ar: "رَبِّ", tr: "rabbi", meaning: L("dem Herrn", "Lord", "المالك المربّي") }, { ar: "ٱلْعَٰلَمِينَ", tr: "al-ʿālamīna", meaning: L("der Welten", "of the worlds", "جميع الخلائق") }, { ar: "مَٰلِكِ", tr: "māliki", meaning: L("dem Herrscher", "Master", "المالك المتصرِّف") }, { ar: "يَوْمِ", tr: "yawmi", meaning: L("des Tages", "of the Day", "اليوم") }, { ar: "ٱلدِّينِ", tr: "ad-dīni", meaning: L("des Gerichts", "of Judgement", "الجزاء والحساب") }],
    learn: [{ ar: "بِسْمِ ٱللَّهِ", title: L("Du liest jetzt den Koran!", "You are reading the Quran now!", "أنت الآن تقرأ القرآن!"), body: L("Alles, was du gelernt hast, kommt hier zusammen: Kasra, Sukun, Wasla, Schadda, das kleine Alif. Lies jedes Wort langsam, Silbe für Silbe.", "Everything you learned comes together here: kasra, sukun, wasla, shadda, the small alif. Read every word slowly, syllable by syllable.", "هنا يجتمع كل ما تعلَّمته: الكسرة، والسكون، وهمزة الوصل، والشدّة، والألف الخنجرية. اقرأ كل كلمةٍ على مهل، مقطعًا مقطعًا.") }] },
  { id: "f2", unit: 6, title: L("Al-Fatiha 5–7", "Al-Fatiha 5–7", "الفاتحة 5–7"), goal: L("Lies das Ende der Fatiha.", "Read the end of Al-Fatiha.", "اقرأ خواتيم سورة الفاتحة."),
    items: [{ ar: "إِيَّاكَ", tr: "iyyāka", meaning: L("dir (allein)", "You (alone)", "لك وحدك") }, { ar: "نَعْبُدُ", tr: "naʿbudu", meaning: L("dienen wir", "we worship", "نخضع ونطيع") }, { ar: "وَإِيَّاكَ", tr: "wa iyyāka", meaning: L("und dich (allein)", "and You (alone)", "ومنك وحدك") }, { ar: "نَسْتَعِينُ", tr: "nastaʿīnu", meaning: L("bitten wir um Hilfe", "we ask for help", "نطلب العون") }, { ar: "ٱهْدِنَا", tr: "ihdinā", meaning: L("leite uns", "guide us", "دُلَّنا ووفِّقنا") }, { ar: "ٱلصِّرَٰطَ", tr: "aṣ-ṣirāṭa", meaning: L("den Weg", "the path", "الطريق") }, { ar: "ٱلْمُسْتَقِيمَ", tr: "al-mustaqīma", meaning: L("den geraden", "the straight", "الذي لا عِوَج فيه") }, { ar: "أَنْعَمْتَ", tr: "anʿamta", meaning: L("du hast Gnade erwiesen", "You have blessed", "تفضَّلتَ وأحسنتَ") }, { ar: "عَلَيْهِمْ", tr: "ʿalayhim", meaning: L("ihnen", "upon them", "على أولئك") }],
    learn: [{ ar: "إِيَّاكَ نَعْبُدُ", title: L("Langsam und sicher", "Slow and sure", "بتأنٍّ وثبات"), body: L("Lies erst die Silben, dann das ganze Wort. Danach hörst du die Fatiha im Player – du wirst jedes Wort wiedererkennen.", "Read the syllables first, then the whole word. Then listen to Al-Fatiha in the player – you will recognise every word.", "اقرأ المقاطع أولًا، ثم الكلمة كاملة. بعد ذلك استمع إلى الفاتحة في المشغِّل – وستعرف كل كلمةٍ فيها.") }] },
  { id: "f3", unit: 6, title: L("Al-Ikhlas (Sure 112)", "Al-Ikhlas (Surah 112)", "الإخلاص (السورة 112)"), goal: L("Lies eine ganze Sure.", "Read a whole surah.", "اقرأ سورةً كاملة."),
    items: [{ ar: "قُلْ", tr: "qul", meaning: L("sag", "say", "تكلَّم وأخبِر") }, { ar: "هُوَ", tr: "huwa", meaning: L("er", "He", "ضميرٌ يعود على الله تعالى") }, { ar: "أَحَدٌ", tr: "aḥadun", meaning: L("der Eine", "One", "الواحد الذي لا شريك له") }, { ar: "ٱلصَّمَدُ", tr: "aṣ-ṣamadu", meaning: L("der Unabhängige, auf den alle angewiesen sind", "the Eternal Refuge", "السيِّد الذي تقصده الخلائق في حوائجها") }, { ar: "لَمْ", tr: "lam", meaning: L("nicht", "not", "حرف نفي") }, { ar: "يَلِدْ", tr: "yalid", meaning: L("er zeugt", "He begets", "يُنجب ولدًا") }, { ar: "يُولَدْ", tr: "yūlad", meaning: L("er wurde gezeugt", "He was born", "وُلِد من أحد") }, { ar: "يَكُن", tr: "yakun", meaning: L("ist", "is", "يوجد") }, { ar: "كُفُوًا", tr: "kufuwan", meaning: L("ebenbürtig", "equivalent", "مثيلًا ونظيرًا") }],
    learn: [{ ar: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", title: L("Ein Drittel des Korans", "A third of the Quran", "ثلث القرآن"), body: L("Der Prophet ﷺ sagte, Al-Ikhlas komme einem Drittel des Korans gleich (Sahih al-Bukhari). Nach dieser Lektion kannst du sie selbst lesen.", "The Prophet ﷺ said Al-Ikhlas equals a third of the Quran (Sahih al-Bukhari). After this lesson you can read it yourself.", "أخبر النبي ﷺ أن سورة الإخلاص تعدل ثلث القرآن (صحيح البخاري). وبعد هذا الدرس تستطيع أن تقرأها بنفسك.") }] },
  { id: "f4", unit: 6, title: L("Al-Falaq & An-Nas", "Al-Falaq & An-Nas", "الفلق والناس"), goal: L("Lies die beiden Schutzsuren.", "Read the two surahs of protection.", "اقرأ المعوِّذتين."),
    items: [{ ar: "أَعُوذُ", tr: "aʿūdhu", meaning: L("ich nehme Zuflucht", "I seek refuge", "ألتجئ وأحتمي") }, { ar: "بِرَبِّ", tr: "birabbi", meaning: L("beim Herrn", "in the Lord", "بالربّ") }, { ar: "ٱلْفَلَقِ", tr: "al-falaqi", meaning: L("des Morgengrauens", "of daybreak", "الصبح") }, { ar: "شَرِّ", tr: "sharri", meaning: L("dem Übel", "the evil", "الأذى والسوء") }, { ar: "مَا", tr: "mā", meaning: L("was", "what", "الذي") }, { ar: "خَلَقَ", tr: "khalaqa", meaning: L("er erschaffen hat", "He created", "أوجَد") }, { ar: "ٱلنَّاسِ", tr: "an-nāsi", meaning: L("der Menschen", "of mankind", "البشر") }, { ar: "مَلِكِ", tr: "maliki", meaning: L("dem König", "the King", "صاحب المُلك والسلطان") }, { ar: "إِلَٰهِ", tr: "ilāhi", meaning: L("dem Gott", "the God", "المعبود بحقّ") }],
    learn: [{ ar: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", title: L("Die Schutzsuren", "The surahs of protection", "المعوِّذتان"), body: L("Al-Falaq und An-Nas rezitierte der Prophet ﷺ morgens, abends und vor dem Schlafen. Lerne sie lesen – und dann auswendig.", "The Prophet ﷺ recited Al-Falaq and An-Nas in the morning, evening and before sleep. Learn to read them – then by heart.", "كان النبي ﷺ يقرأ الفلق والناس في الصباح والمساء وعند النوم. تعلَّم قراءتهما – ثم احفظهما عن ظهر قلب.") }] },
  { id: "f5", unit: 6, title: L("Abschlusstest", "Final test", "الاختبار النهائي"), goal: L("Zeig, dass du den Koran lesen kannst.", "Show that you can read the Quran.", "أثبِت أنك تستطيع قراءة القرآن."), test: true, learn: [{ ar: "ٱقْرَأْ", title: L("Iqra' – Lies!", "Iqra' – Read!", "اقرأ!"), body: L("Das erste offenbarte Wort des Korans war „Lies!“ (96:1). Dieser Test mischt alles aus dem Kurs.", "The first revealed word of the Quran was “Read!” (96:1). This test mixes everything from the course.", "أول كلمةٍ نزلت من القرآن هي «اقرأ» (العلق: 1). وهذا الاختبار يجمع كل ما في الدورة.") }] },

  // ---- unit 7: hear the word (Quran.com word recordings), then recognise it in the script ----
  { id: "g1", unit: 7, listen: true, title: L("Al-Fatiha hören (1–4)", "Listening to Al-Fatiha (1–4)", "الاستماع إلى الفاتحة (1–4)"), goal: L("Erkenne gesprochene Wörter der Fatiha in der Schrift.", "Recognise spoken words of Al-Fatiha in the script.", "تعرَّف في الرسم على كلمات الفاتحة التي تسمعها."),
    items: wordsOf(["1:1", "1:2", "1:3", "1:4"]),
    learn: [
      { ar: "ٱلْحَمْدُ", ref: "1:2:1", title: L("Jetzt hörst du echten Koran", "Now you hear the real Quran", "الآن تسمع القرآن الحقيقي"), body: L("Tippe auf den Lautsprecher: Ein Rezitator spricht dieses eine Wort. Achte darauf, wie jeder Vokal klingt, und verbinde den Klang mit den Zeichen, die du schon kennst. Wer gut hört, liest bald viel sicherer.", "Tap the speaker: a reciter says this one word. Notice how each vowel sounds and connect the sound with the signs you already know. Whoever listens well soon reads with much more confidence.", "اضغط على السماعة لتسمع قارئًا ينطق هذه الكلمة وحدها. أصغِ إلى كل حركةٍ كيف تُنطق، واربط الصوت بالعلامات التي تعرفها؛ فمن أحسن الاستماع أحسن القراءة.") },
      { ar: "بِسْمِ", ref: "1:1:1", title: L("Erst hören, dann erkennen", "First listen, then recognise", "أصغِ أولًا ثم تعرَّف"), body: L("In den Übungen hörst du ein Wort und wählst unter vier Schreibweisen die richtige. Die Aufnahme startet einmal von allein – mit dem runden Knopf spielst du sie so oft ab, wie du magst. Danach lernst du, was die Wörter bedeuten.", "In the exercises you hear a word and pick the right spelling out of four. The recording starts once by itself – with the round button you can play it as often as you like. Then you learn what the words mean.", "في التمارين تسمع كلمةً ثم تختار رسمها الصحيح من أربعة خيارات. تبدأ التلاوة وحدها مرةً واحدة، ويمكنك إعادتها بالزر الدائري كما شئت. ثم تتعلّم معاني الكلمات.") },
    ] },
  { id: "g2", unit: 7, listen: true, title: L("Al-Fatiha hören (5–7)", "Listening to Al-Fatiha (5–7)", "الاستماع إلى الفاتحة (5–7)"), goal: L("Erkenne auch die Wörter der letzten Verse der Fatiha.", "Recognise the words of the last verses of Al-Fatiha as well.", "تعرَّف أيضًا على كلمات الآيات الأخيرة من الفاتحة."),
    items: wordsOf(["1:5", "1:6", "1:7"]),
    learn: [
      { ar: "إِيَّاكَ", ref: "1:5:1", title: L("Aus „Er“ wird „Du“", "From “He” to “You”", "من الغيبة إلى الخطاب"), body: L("Bis hierher spricht die Sure über Allah, jetzt wendest du dich direkt an Ihn: „Dir allein dienen wir.“ Höre auf die Schadda über dem ي von إِيَّاكَ – der Laut wird doppelt gesprochen.", "Up to here the surah speaks about Allah; now you turn to Him directly: “It is You we worship.” Listen for the shadda on the yā' of إِيَّاكَ – the sound is doubled.", "كانت السورة حتى هنا تتحدث عن الله تعالى، وهنا تخاطبه مباشرةً: «إِيَّاكَ نَعْبُدُ». أصغِ إلى الشدّة على الياء في إِيَّاكَ: يُنطق الحرف مرتين.") },
      { ar: "ٱلضَّآلِّينَ", ref: "1:7:9", title: L("Das Madd-Zeichen ٓ", "The madd sign ٓ", "علامة المدّ ٓ"), body: L("Die kleine Welle über dem Alif ist das Madd-Zeichen: Der Laut wird lang gezogen. Höre in ٱلضَّآلِّينَ genau hin, wie lange das ā gehalten wird.", "The little wave above the alif is the madd sign: the sound is stretched. Listen carefully to how long the ā is held in ٱلضَّآلِّينَ.", "الموجة الصغيرة فوق الألف علامة المدّ، فيُطال الصوت بها. أصغِ في ٱلضَّآلِّينَ إلى مقدار مدّ الألف.") },
    ] },
  { id: "g3", unit: 7, listen: true, title: L("Al-Ikhlas und Al-Kawthar hören", "Listening to Al-Ikhlas and Al-Kawthar", "الاستماع إلى الإخلاص والكوثر"), goal: L("Erkenne Wörter aus zwei kurzen Suren am Klang.", "Recognise words from two short surahs by their sound.", "تعرَّف على كلمات من سورتين قصيرتين من صوتها."),
    items: wordsOf(["112:1", "112:2", "112:3", "112:4", "108:1", "108:2", "108:3"]),
    learn: [
      { ar: "أَحَدٌ", ref: "112:1:4", title: L("Das Wort für „der Eine“", "The word for “One”", "كلمة «أحد»"), body: L("Al-Ikhlas bedeutet „die Aufrichtigkeit“ – die reine Hinwendung zu Allah allein. Das Wort أَحَدٌ endet auf Tanwin: Du hörst ein „n“, das nicht als Buchstabe geschrieben steht.", "Al-Ikhlas means “sincerity” – turning purely to Allah alone. The word أَحَدٌ ends in tanwin: you hear an “n” that is not written as a letter.", "الإخلاص: تصفية القصد لله وحده. وكلمة أَحَدٌ تنتهي بتنوين الضمّ، فتسمع نونًا لا تُكتب حرفًا.") },
      { ar: "ٱلْكَوْثَرَ", ref: "108:1:3", title: L("Die kürzeste Sure", "The shortest surah", "أقصر سورة"), body: L("Al-Kawthar hat nur drei Verse und ist die kürzeste Sure des Korans. ٱلْكَوْثَرَ bedeutet „die Fülle des Guten“. Hör zu, wie das ث mit der Zungenspitze gebildet wird.", "Al-Kawthar has only three verses and is the shortest surah of the Quran. ٱلْكَوْثَرَ means “abundant good”. Listen to how the ث is made with the tip of the tongue.", "الكوثر ثلاث آياتٍ فقط، وهي أقصر سور القرآن. ومعنى ٱلْكَوْثَرَ: الخير الكثير. أصغِ إلى الثاء كيف تخرج من طرف اللسان.") },
    ] },
  { id: "g4", unit: 7, listen: true, title: L("Al-Falaq, An-Nas und Al-Asr hören", "Listening to Al-Falaq, An-Nas and Al-Asr", "الاستماع إلى الفلق والناس والعصر"), goal: L("Erkenne Wörter aus drei weiteren Suren am Klang.", "Recognise words from three more surahs by their sound.", "تعرَّف على كلمات من ثلاث سور أخرى من صوتها."),
    items: wordsOf(["113:1", "113:2", "113:3", "113:4", "113:5", "114:1", "114:2", "114:3", "114:4", "114:5", "114:6", "103:1", "103:2", "103:3"]),
    learn: [
      { ar: "قُلْ", ref: "113:1:1", title: L("Zuflucht suchen", "Seeking refuge", "الاستعاذة"), body: L("Al-Falaq und An-Nas beginnen beide mit „Sag: Ich suche Zuflucht …“. Die Wörter قُلْ أَعُوذُ hörst du in beiden Suren – ein guter Anker zum Wiedererkennen.", "Al-Falaq and An-Nas both begin with “Say: I seek refuge …”. You hear the words قُلْ أَعُوذُ in both surahs – a good anchor for recognising them.", "تبدأ الفلق والناس بقوله تعالى: «قُلْ أَعُوذُ …»، فتسمع قُلْ أَعُوذُ في السورتين، وهي علامةٌ تعينك على التمييز.") },
      { ar: "وَٱلْعَصْرِ", ref: "103:1:1", title: L("Vier Dinge gegen den Verlust", "Four things against loss", "أربعة أمورٍ تقي من الخسران"), body: L("Al-Asr hat nur drei Verse, nennt aber vier Dinge, die vor dem Verlust bewahren: Glaube, gute Taten, einander zur Wahrheit und einander zur Geduld ermahnen. ءَامَنُوا۟ und وَعَمِلُوا۟ enden auf Wāw und ein stilles Alif – das Alif wird nicht gesprochen.", "Al-Asr has only three verses, yet it names four things that protect against loss: faith, good deeds, and advising one another to truth and to patience. ءَامَنُوا۟ and وَعَمِلُوا۟ end in wāw and a silent alif – the alif is not pronounced.", "في سورة العصر ثلاث آياتٍ فقط، وفيها أربعة أمورٍ تنجي من الخسران: الإيمان، والعمل الصالح، والتواصي بالحق، والتواصي بالصبر. وتنتهي ءَامَنُوا۟ وَعَمِلُوا۟ بواوٍ وألفٍ لا تُنطق، وعليها دائرةٌ صغيرة.") },
    ] },

  // ---- unit 8: whole verses – put the words in order, hear the verse ----
  { id: "h1", unit: 8, title: L("Al-Fatiha: ganze Verse", "Al-Fatiha: whole verses", "الفاتحة: آياتٌ كاملة"), goal: L("Setze die Verse der Fatiha Wort für Wort zusammen.", "Put the verses of Al-Fatiha together word by word.", "ركِّب آيات الفاتحة كلمةً كلمة."),
    verses: ["1:1", "1:2", "1:3", "1:4", "1:5", "1:6", "1:7"],
    learn: [
      { ar: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", title: L("Von Wörtern zu Versen", "From words to verses", "من الكلمات إلى الآيات"), body: L("Ein Vers ist wie ein Satz – und du liest ihn von rechts nach links. In den Übungen tippst du die Wörter in der richtigen Reihenfolge an: Das erste Wort steht ganz rechts. Zum Schluss hörst du den ganzen Vers.", "A verse is like a sentence – and you read it from right to left. In the exercises you tap the words in the right order: the first word sits on the far right. At the end you hear the whole verse.", "الآية كالجملة، وتُقرأ من اليمين إلى اليسار. في التمارين تضغط على الكلمات بالترتيب الصحيح، فتكون الكلمة الأولى في أقصى اليمين. وفي النهاية تسمع الآية كاملة.") },
      { ar: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ", title: L("Die Bedeutung hilft dir", "The meaning helps you", "المعنى يعينك"), body: L("Unter jeder Aufgabe steht die Bedeutung des Verses. Sie hilft dir, die Wörter wie ein Puzzle mit Vorlage zu ordnen – und nebenbei lernst du, was du liest.", "Under every task you see the meaning of the verse. It helps you arrange the words like a puzzle with a picture – and you learn what you are reading along the way.", "تحت كل تمرينٍ معنى الآية، وهو يعينك على ترتيب الكلمات كأنه صورة الأحجية، وتتعلّم في الوقت نفسه ما تقرؤه.") },
    ] },
  { id: "h2", unit: 8, title: L("Al-Ikhlas und Al-Kawthar: ganze Verse", "Al-Ikhlas and Al-Kawthar: whole verses", "الإخلاص والكوثر: آياتٌ كاملة"), goal: L("Ordne die kurzen Verse zweier Suren.", "Put the short verses of two surahs in order.", "رتِّب الآيات القصيرة لسورتين."),
    verses: ["112:1", "112:2", "112:3", "112:4", "108:1", "108:2", "108:3"],
    learn: [
      { ar: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", title: L("Kurze Verse, schnell gelernt", "Short verses, quickly learned", "آياتٌ قصيرة تُحفظ بسهولة"), body: L("Al-Ikhlas und Al-Kawthar bestehen aus kurzen Versen. Hast du einen Vers richtig geordnet, lies ihn laut und höre ihn noch einmal – so setzt sich sein Klang fest.", "Al-Ikhlas and Al-Kawthar consist of short verses. Once you have put a verse in order, read it aloud and listen again – that is how its sound settles in.", "آيات الإخلاص والكوثر قصيرة. فإذا رتَّبتَ الآية فاقرأها بصوتٍ مسموع ثم استمع إليها مرةً أخرى؛ فبذلك يثبت لحنها في أذنك.") },
    ] },
  { id: "h3", unit: 8, title: L("Al-Falaq und Al-Asr: ganze Verse", "Al-Falaq and Al-Asr: whole verses", "الفلق والعصر: آياتٌ كاملة"), goal: L("Erkenne Muster in den Versen und setze auch lange Verse in Teilen zusammen.", "Spot patterns in the verses and put even long verses together in parts.", "انتبه إلى الأنماط المتكررة، وركِّب الآيات الطويلة على أجزاء."),
    verses: ["113:1", "113:2", "113:3", "113:4", "113:5", "103:1", "103:2", "103:3"],
    learn: [
      { ar: "وَمِن شَرِّ", title: L("Ein Muster, das sich wiederholt", "A pattern that repeats", "نمطٌ يتكرر"), body: L("In Al-Falaq beginnen vier Verse mit „min sharri“ (مِن شَرِّ) – „vor dem Übel“. Wer das Muster erkennt, ordnet diese Verse viel schneller.", "In Al-Falaq four verses begin with “min sharri” (مِن شَرِّ) – “from the evil of”. Once you spot the pattern, you order these verses much faster.", "في الفلق أربع آياتٍ تبدأ بـ «مِن شَرِّ» أو «وَمِن شَرِّ». فإذا انتبهتَ إلى هذا النمط رتَّبتَ هذه الآيات أسرع.") },
      { ar: "إِلَّا ٱلَّذِينَ ءَامَنُوا۟", title: L("Ein langer Vers in zwei Teilen", "A long verse in two parts", "آيةٌ طويلة على جزأين"), body: L("Der letzte Vers von Al-Asr ist lang. Du setzt ihn in zwei Teilen zusammen – erst die erste Hälfte, dann die zweite. Den siebten Vers der Fatiha hast du genauso geübt.", "The last verse of Al-Asr is long. You put it together in two parts – first the first half, then the second. You practised verse 7 of Al-Fatiha the same way.", "الآية الأخيرة من سورة العصر طويلة، فتركِّبها على جزأين: النصف الأول ثم النصف الثاني، وكذلك فعلتَ في الآية السابعة من الفاتحة.") },
    ] },
  { id: "h4", unit: 8, test: true, title: L("An-Nas und alle Verse zusammen", "An-Nas and all verses together", "الناس وجميع الآيات معًا"), goal: L("Zeig, dass du ganze Verse lesen kannst.", "Show that you can read whole verses.", "أثبِت أنك تستطيع قراءة الآيات كاملة."),
    verses: ["114:1", "114:2", "114:3", "114:4", "114:5", "114:6"],
    learn: [
      { ar: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", title: L("Dein Abschlusstest", "Your final test", "اختبارك الختامي"), body: L("Zuerst An-Nas, dann Verse aus den Suren davor und ein paar Wörter zum Hören. Lies in Ruhe – nach jeder Aufgabe kannst du den Vers anhören.", "First An-Nas, then verses from the surahs before it and a few words to listen to. Read calmly – after every task you can listen to the verse.", "تبدأ بسورة الناس، ثم آياتٍ من السور السابقة وبعض الكلمات للاستماع. اقرأ بهدوء، وبعد كل تمرينٍ يمكنك الاستماع إلى الآية.") },
    ] },
];

// ---------- exercises ----------
// `key` identifies the item for the mistake counter; a wrong answer re-queues the exercise once at the end of the lesson.
// `u` (placement test only) = the unit a question belongs to.
export type Ex = (
  | { t: "learn"; ar: string; title: string; body: string; speak?: string; ref?: string }
  | { t: "choose"; q: string; ar?: string; speak?: string; options: { ar?: string; text?: string }[]; answer: number; key: string }
  | { t: "match"; pairs: { ar: string; text: string }[]; key: string }
  // hear a Quran word (Quran.com word recording, `ref` = "S:A:W"), pick the written word; `tr`/`info` = fallback and reveal text
  | { t: "listen"; q: string; ref: string; tr: string; info: string; options: { ar: string }[]; answer: number; key: string }
  // put the words of a verse (or a part of it) in order; `tiles` are in the correct order, (s, a) = verse for the recording
  | { t: "build"; q: string; hint: string; tiles: string[]; s: number; a: number; tr: string; key: string }
) & { u?: number };

// word recordings come from Quran.com; whole-verse recordings are self-hosted
const p3 = (n: number | string) => String(n).padStart(3, "0");
export const wordAudioUrl = (ref: string) => { const [s, a, w] = ref.split(":"); return `https://audio.qurancdn.com/wbw/${p3(s)}_${p3(a)}_${p3(w)}.mp3`; };
export const verseAudioUrl = (s: number, a: number) => `/audio/Alafasy_128kbps/${p3(s)}${p3(a)}.mp3`;

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const uniq = <T,>(a: T[]) => Array.from(new Set(a));

type Lang = "de" | "en" | "ar";
const tx = (v: L2, lang: Lang) => v[lang] ?? v.en;

function letterExercises(chs: string[], pool: string[], lang: Lang): Ex[] {
  const out: Ex[] = [];
  const say = (de: string, en: string, ar: string) => (lang === "de" ? de : lang === "ar" ? ar : en);
  for (const c of chs) {
    const l = letter(c);
    const others = uniq([...(l.similar ?? []), ...shuffle(pool)]).filter((x) => x !== c).slice(0, 3);
    const opts = shuffle([c, ...others]);
    out.push({ t: "choose", q: say(`Welcher Buchstabe ist „${l.name}“ (${l.tr})?`, `Which letter is “${l.name}” (${l.tr})?`, `أيُّ هذه الحروف هو «${arName(c)}»؟`), options: opts.map((o) => ({ ar: o })), answer: opts.indexOf(c), key: `L:${c}` });
    const names = shuffle([c, ...others]);
    out.push({ t: "choose", q: say("Wie heißt dieser Buchstabe?", "What is this letter called?", "ما اسم هذا الحرف؟"), ar: c, speak: c, options: names.map((o) => ({ text: say(`${letter(o).name} · ${letter(o).tr}`, `${letter(o).name} · ${letter(o).tr}`, arName(o)) })), answer: names.indexOf(c), key: `L:${c}` });
  }
  if (chs.length >= 3) out.push({ t: "match", pairs: shuffle(chs).slice(0, 4).map((c) => ({ ar: c, text: say(letter(c).name, letter(c).name, arName(c)) })), key: `M:${chs.join("")}` });
  return out;
}

function formExercises(chs: string[], lang: Lang): Ex[] {
  const out: Ex[] = [];
  const pos = ["start", "middle", "end"] as const;
  const say = (de: string, en: string, ar: string) => (lang === "de" ? de : lang === "ar" ? ar : en);
  const posName = { start: say("am Wortanfang", "at the start", "في أول الكلمة"), middle: say("in der Wortmitte", "in the middle", "في وسط الكلمة"), end: say("am Wortende", "at the end", "في آخر الكلمة") };
  for (const c of chs) {
    const p = pos[Math.floor(Math.random() * 3)];
    const f = forms(letter(c))[p];
    const others = uniq([...(letter(c).similar ?? []), ...shuffle(LETTERS.map((x) => x.ch))]).filter((x) => x !== c).slice(0, 3);
    const opts = shuffle([c, ...others]);
    out.push({ t: "choose", q: say(`Welcher Buchstabe steht hier ${posName[p]}?`, `Which letter is this, ${posName[p]}?`, `أيُّ حرفٍ هذا ${posName[p]}؟`), ar: f, options: opts.map((o) => ({ ar: o })), answer: opts.indexOf(c), key: `F:${c}` });
  }
  out.push({ t: "match", pairs: shuffle(chs).slice(0, 4).map((c) => ({ ar: forms(letter(c)).middle, text: say(letter(c).name, letter(c).name, arName(c)) })), key: `FM:${chs.join("")}` });
  return out;
}

function readingExercises(items: Item[], pool: Item[], lang: Lang): Ex[] {
  const out: Ex[] = [];
  const say = (de: string, en: string, ar: string) => (lang === "de" ? de : lang === "ar" ? ar : en);
  const picks = shuffle(items).slice(0, 8);
  picks.forEach((it, i) => {
    const others = shuffle(uniq(pool.map((p) => p.tr)).filter((x) => x !== it.tr)).slice(0, 3);
    if (i % 2 === 0) {
      const opts = shuffle([it.tr, ...others]);
      out.push({ t: "choose", q: say("Wie liest man das?", "How is this read?", "كيف تُقرأ هذه الكلمة؟"), ar: it.ar, speak: it.ar, options: opts.map((o) => ({ text: o })), answer: opts.indexOf(it.tr), key: `R:${it.ar}` });
    } else {
      const arOthers = shuffle(uniq(pool.map((p) => p.ar)).filter((x) => x !== it.ar)).slice(0, 3);
      const opts = shuffle([it.ar, ...arOthers]);
      out.push({ t: "choose", q: say(`Wo steht „${it.tr}“?`, `Where does it say “${it.tr}”?`, `أين كُتِب «${it.tr}»؟`), speak: it.ar, options: opts.map((o) => ({ ar: o })), answer: opts.indexOf(it.ar), key: `R:${it.ar}` });
    }
    if (it.meaning && i % 3 === 1) {
      const mOthers = shuffle(uniq(pool.filter((p) => p.meaning).map((p) => tx(p.meaning!, lang))).filter((x) => x !== tx(it.meaning!, lang))).slice(0, 3);
      if (mOthers.length >= 2) { const opts = shuffle([tx(it.meaning, lang), ...mOthers]); out.push({ t: "choose", q: say("Was bedeutet dieses Wort?", "What does this word mean?", "ما معنى هذه الكلمة؟"), ar: it.ar, options: opts.map((o) => ({ text: o })), answer: opts.indexOf(tx(it.meaning, lang)), key: `W:${it.ar}` }); }
    }
  });
  const m = shuffle(items).slice(0, 4);
  if (m.length === 4 && uniq(m.map((x) => x.tr)).length === 4) out.push({ t: "match", pairs: m.map((x) => ({ ar: x.ar, text: x.tr })), key: `RM:${m.map((x) => x.ar).join("")}` });
  return out;
}

const ALL_ITEMS = () => LESSONS.filter((l) => l.unit <= 6).flatMap((l) => l.items ?? []);

// ---------- units 7 + 8: hear the word / put the verse in order ----------
// skeleton = letters only (no vowel signs, no tatweel): two words with the same skeleton must never be offered together
const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const skel = (s: string) => s.replace(MARKS, "").replace(/ٱ/g, "ا");
// stem = skeleton without article / "and" / simple prefixes – used so meaning questions never offer the same word with another prefix
const stem = (s: string) => skel(s).replace(/^(?:وال|بال|فال|لل|ال|و|ب|ل|ف)(?=.{2,}$)/, "");
const HEAR_POOL = () => wordsOf(VERSES.map((v) => `${v.s}:${v.a}`));

// spread picks over the surahs of a lesson (round robin) so every surah gets heard
function spread<T extends { ref?: string }>(items: T[], n: number): T[] {
  const groups = new Map<string, T[]>();
  for (const it of shuffle(items)) { const k = (it.ref ?? "").split(":")[0]; groups.set(k, [...(groups.get(k) ?? []), it]); }
  const lists = shuffle(Array.from(groups.values()));
  const out: T[] = [];
  for (let i = 0; out.length < n && lists.some((l) => l.length > i); i++) for (const l of lists) if (l[i] && out.length < n) out.push(l[i]);
  return out;
}
// wrong options for "hear the word": up to two from the lesson itself, the rest from all words – never the same letters as the answer
function otherWords(it: Item, near: Item[], far: Item[], n: number): Item[] {
  const out: Item[] = [];
  const seen = new Set([skel(it.ar)]);
  const take = (src: Item[], max: number) => { let c = 0; for (const p of shuffle(src)) { if (c >= max || out.length >= n) break; const k = skel(p.ar); if (seen.has(k)) continue; seen.add(k); out.push(p); c++; } };
  take(near, 2); take(far, n);
  return out;
}
// wrong options for meaning questions: another stem, another meaning text
function otherMeanings(it: Item, pool: Item[], lang: Lang, n: number): Item[] {
  const out: Item[] = [];
  const stems = new Set([stem(it.ar)]);
  const texts = new Set([tx(it.meaning!, lang)]);
  for (const p of shuffle(pool)) {
    if (!p.meaning) continue;
    const s = stem(p.ar), m = tx(p.meaning, lang);
    if (stems.has(s) || texts.has(m)) continue;
    stems.add(s); texts.add(m); out.push(p);
    if (out.length === n) break;
  }
  return out;
}

function listenExercises(items: Item[], pool: Item[], lang: Lang, n = { listen: 7, meaning: 3, read: 2, match: true }): Ex[] {
  const out: Ex[] = [];
  const say = (de: string, en: string, ar: string) => (lang === "de" ? de : lang === "ar" ? ar : en);
  const withRef = items.filter((i) => i.ref);
  for (const it of spread(withRef, n.listen)) {
    const opts = shuffle([it, ...otherWords(it, items, pool, 3)]);
    out.push({ t: "listen", q: say("Welches Wort hörst du?", "Which word do you hear?", "أيَّ كلمةٍ تسمع؟"), ref: it.ref!, tr: it.tr, info: it.meaning ? `${it.tr} · ${tx(it.meaning, lang)}` : it.tr, options: opts.map((o) => ({ ar: o.ar })), answer: opts.indexOf(it), key: `H:${it.ref}` });
  }
  for (const it of shuffle(items.filter((i) => i.meaning)).slice(0, n.meaning)) {
    const others = otherMeanings(it, pool, lang, 3);
    if (others.length < 3) continue;
    const opts = shuffle([tx(it.meaning!, lang), ...others.map((o) => tx(o.meaning!, lang))]);
    out.push({ t: "choose", q: say("Was bedeutet dieses Wort?", "What does this word mean?", "ما معنى هذه الكلمة؟"), ar: it.ar, options: opts.map((o) => ({ text: o })), answer: opts.indexOf(tx(it.meaning!, lang)), key: `W:${it.ar}` });
  }
  for (const it of shuffle(items).slice(0, n.read)) {
    const others = otherWords(it, items, pool, 3);
    const opts = shuffle([it, ...others]);
    out.push({ t: "choose", q: say(`Wo steht „${it.tr}“?`, `Where does it say “${it.tr}”?`, `أين كُتِب «${it.tr}»؟`), speak: it.ar, options: opts.map((o) => ({ ar: o.ar })), answer: opts.indexOf(it), key: `R:${it.ar}` });
  }
  if (n.match) {
    // four pairs with short meanings (the buttons are small) and four different stems
    const stems = new Set<string>(), texts = new Set<string>();
    const m = shuffle(items.filter((i) => i.meaning && tx(i.meaning, lang).length <= 24)).filter((i) => { const s = stem(i.ar), t = tx(i.meaning!, lang); if (stems.has(s) || texts.has(t)) return false; stems.add(s); texts.add(t); return true; }).slice(0, 4);
    if (m.length === 4) out.push({ t: "match", pairs: m.map((x) => ({ ar: x.ar, text: tx(x.meaning!, lang) })), key: `HM:${m.map((x) => x.ref ?? x.ar).join(",")}` });
  }
  return out;
}

// one "put in order" exercise per verse (long verses in parts, one-/two-word verses are too easy) + meaning questions on whole verses
function buildExercises(refs: string[], lang: Lang, nMeaning = 2): Ex[] {
  const out: Ex[] = [];
  const say = (de: string, en: string, ar: string) => (lang === "de" ? de : lang === "ar" ? ar : en);
  const vs = refs.map(verseOf).filter((v): v is Verse => !!v);
  for (const v of vs) {
    const cuts = v.parts?.length ? v.parts : [{ to: v.words.length, meaning: v.meaning }];
    let from = 0;
    cuts.forEach((c, i) => {
      const ws = v.words.slice(from, c.to);
      from = c.to;
      if (ws.length >= 3) out.push({ t: "build", q: say("Bringe die Wörter in die richtige Reihenfolge.", "Put the words in the right order.", "رتِّب الكلمات ترتيبًا صحيحًا."), hint: tx(c.meaning, lang), tiles: ws.map((w) => w.ar), s: v.s, a: v.a, tr: ws.map((w) => w.tr).join(" "), key: `B:${v.s}:${v.a}:${i}` });
    });
  }
  const text = (v: Verse) => v.words.map((w) => w.ar).join(" ");
  for (const v of shuffle(vs).slice(0, nMeaning)) {
    const mine = tx(v.meaning, lang);
    const seen = new Set([mine]);
    const others = [...shuffle(vs), ...shuffle(VERSES)].filter((o) => { const m = tx(o.meaning, lang); if (o === v || text(o) === text(v) || seen.has(m)) return false; seen.add(m); return true; }).slice(0, 3);
    if (others.length < 3) continue;
    const opts = shuffle([mine, ...others.map((o) => tx(o.meaning, lang))]);
    out.push({ t: "choose", q: say("Was bedeutet dieser Vers?", "What does this verse mean?", "ما معنى هذه الآية؟"), ar: text(v), options: opts.map((o) => ({ text: o })), answer: opts.indexOf(mine), key: `VM:${v.s}:${v.a}` });
  }
  return out;
}

// unit 8 test: the verses of its own lesson + verses from the earlier lessons + a few words to listen to (unit 7)
function unit8Test(lesson: Lesson, lang: Lang): Ex[] {
  const mine = buildExercises(lesson.verses ?? [], lang, 2);
  const earlier = shuffle(buildExercises(LESSONS.filter((l) => l.unit === 8 && l !== lesson).flatMap((l) => l.verses ?? []), lang, 3));
  const words = LESSONS.filter((l) => l.unit === 7).flatMap((l) => l.items ?? []);
  const hear = listenExercises(words, HEAR_POOL(), lang, { listen: 3, meaning: 0, read: 0, match: false });
  return [...mine, ...earlier.filter((e) => e.t === "build").slice(0, 3), ...earlier.filter((e) => e.t === "choose").slice(0, 2), ...hear];
}

// ---------- placement test: 2 questions per unit (1–6), built with the same builders as the lessons ----------
export const PLACEMENT_ID = "placement";
function placementExercises(lang: Lang): Ex[] {
  const tag = (u: number, e: Ex): Ex => ({ ...e, u });
  const all = LETTERS.map((l) => l.ch);
  const [l1, l2] = shuffle(all);
  const out: Ex[] = [tag(1, letterExercises([l1], all, lang)[0]), tag(1, letterExercises([l2], all, lang)[1])];
  out.push(...formExercises(shuffle(LETTERS.filter((l) => l.connects).map((l) => l.ch)).slice(0, 2), lang).filter((e) => e.t === "choose").slice(0, 2).map((e) => tag(2, e)));
  for (const u of [3, 4, 5, 6]) {
    const items = LESSONS.filter((l) => l.unit === u).flatMap((l) => l.items ?? []);
    const qs = readingExercises(shuffle(items).slice(0, 2), u >= 5 ? ALL_ITEMS() : items, lang);
    // units 5–6 have meanings: one reading question and one meaning question; units 3–4: two reading questions
    const meaning = qs.find((e) => e.t === "choose" && e.key.startsWith("W:"));
    out.push(...(meaning ? [qs[0], meaning] : qs.slice(0, 2)).map((e) => tag(u, e)));
  }
  return out;
}

export function buildLesson(lesson: Lesson, lang: Lang): Ex[] {
  if (lesson.placement) return placementExercises(lang);
  const learn: Ex[] = lesson.learn.map((c) => ({ t: "learn", ar: c.ar, title: tx(c.title, lang), body: tx(c.body, lang), speak: c.ar, ref: c.ref }));
  let ex: Ex[] = [];
  const idx = LESSONS.indexOf(lesson);
  if (lesson.test && lesson.unit >= 7) ex = unit8Test(lesson, lang);
  else if (lesson.test) {
    const before = LESSONS.slice(0, idx + 1);
    const lettersSoFar = uniq(before.flatMap((l) => l.letters ?? []));
    const itemsSoFar = before.flatMap((l) => l.items ?? []);
    if (lettersSoFar.length) ex.push(...letterExercises(shuffle(lettersSoFar).slice(0, 6), LETTERS.map((l) => l.ch), lang));
    if (before.some((l) => l.formsOf)) ex.push(...formExercises(shuffle(uniq(before.flatMap((l) => l.formsOf ?? []))).slice(0, 4), lang));
    if (itemsSoFar.length) ex.push(...readingExercises(itemsSoFar, itemsSoFar, lang));
    ex = shuffle(ex).slice(0, 16);
  } else if (lesson.letters) ex = letterExercises(lesson.letters, LETTERS.map((l) => l.ch), lang);
  else if (lesson.formsOf) ex = formExercises(lesson.formsOf, lang);
  else if (lesson.verses) ex = buildExercises(lesson.verses, lang);
  else if (lesson.items && lesson.listen) ex = listenExercises(lesson.items, HEAR_POOL(), lang);
  else if (lesson.items) ex = readingExercises(lesson.items, lesson.unit >= 5 ? ALL_ITEMS() : lesson.items, lang);
  return [...learn, ...shuffle(ex.filter((e) => e.t !== "match")), ...ex.filter((e) => e.t === "match")];
}

// ---------- progress (synced with the account as "tf:arabic") ----------
export type ArabicProgress = { done: Record<string, { best: number; stars: number; at: number }>; xp: number; mistakes: Record<string, number>; streakDay?: number; placement?: { at: number; units: number; correct: number; total: number } };
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

// ---------- placement test ("Einstufungstest") ----------
// Runs like a lesson (route /arabic/placement) but is not part of LESSONS. 12 questions, 2 per unit (1–6).
// A unit counts as known when both of its questions are right; units are only skipped in a row from the start
// (lessons unlock one after the other), so the first unit with a mistake is where the learner starts.
// Skipped lessons get best = PASS_PCT and one star – never lower than what the learner already has.
export const PLACEMENT: Lesson = {
  id: PLACEMENT_ID, unit: 0, placement: true, learn: [],
  title: L("Einstufungstest", "Placement test", "اختبار تحديد المستوى"),
  goal: L("12 kurze Fragen zeigen, wo du im Kurs einsteigst.", "12 short questions show where you join the course.", "12 سؤالًا قصيرًا تبيِّن لك من أين تبدأ في الدورة."),
};
export const lessonById = (id: string): Lesson | undefined => (id === PLACEMENT_ID ? PLACEMENT : LESSONS.find((l) => l.id === id));
export const PLACEMENT_UNITS = [1, 2, 3, 4, 5, 6];
export type PlacementResult = { passed: number[]; start: number; correct: number; total: number; byUnit: Record<number, { ok: number; n: number }> };
export function placementResult(byUnit: Record<number, { ok: number; n: number }>): PlacementResult {
  const passed: number[] = [];
  for (const u of PLACEMENT_UNITS) { const r = byUnit[u]; if (r && r.n > 0 && r.ok === r.n) passed.push(u); else break; }
  const rs = Object.values(byUnit);
  return { passed, start: passed.length + 1, correct: rs.reduce((a, r) => a + r.ok, 0), total: rs.reduce((a, r) => a + r.n, 0), byUnit };
}
export function savePlacement(res: PlacementResult, wrongKeys: string[]) {
  const p = readArabic();
  const now = Date.now();
  for (const l of LESSONS) {
    if (!res.passed.includes(l.unit)) continue;
    const prev = p.done[l.id];
    p.done[l.id] = { best: Math.max(prev?.best ?? 0, PASS_PCT), stars: Math.max(prev?.stars ?? 0, 1), at: prev?.at ?? now };
  }
  for (const k of wrongKeys) p.mistakes[k] = (p.mistakes[k] ?? 0) + 1;
  p.placement = { at: now, units: res.passed.length, correct: res.correct, total: res.total };
  writeJSON(KEY, p);
  return p;
}
