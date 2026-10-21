import type { WordRule } from "./words";

// "Read the Quran in Arabic": the order of the Qāʿida Nūrāniyya / Baghdādiyya taught in Quran schools, in twelve
// stages from the single letter to reading Juz ʿAmma. Letters and syllables are typed here (they are not Quran text);
// every Quran word and verse is picked at run time from the word data (see words.ts).
// Explanations: de, en, ar, tr, ur, id, fr (other languages fall back to English).

export type Tx = { en: string; de: string; ar: string; tr: string; ur: string; id: string; fr: string };
export const txOf = (v: Tx, lang: string) => (v as Record<string, string>)[lang] ?? v.en;

export type LessonKind = "letters" | "forms" | "join" | "syllables" | "words" | "verses" | "juz" | "test";
export type QLesson = {
  id: string;
  kind: LessonKind;
  letters?: string[];      // letters / forms lessons
  marks?: string[];        // syllables: the sign(s) put on the letters
  syllableLetters?: string[];
  rule?: WordRule;         // words: which Quran words fit
  surahs?: number[];       // where the words come from
  surah?: number;          // juz: the surah to read
};
export type QStage = { n: number; id: string; glyph: string; title: Tx; explain: Tx; lessons: QLesson[] };

export const FREE_STAGES = 3;
export const PASS = 70;
export const TEST_PASS = 80;

const GROUPS = [["ا", "ب", "ت", "ث"], ["ج", "ح", "خ"], ["د", "ذ", "ر", "ز"], ["س", "ش", "ص", "ض"], ["ط", "ظ", "ع", "غ"], ["ف", "ق", "ك", "ل"], ["م", "ن", "ه", "و", "ي", "ء"]];
const CONNECTING = GROUPS.map((g) => g.filter((c) => !"اوزرذدء".includes(c))).filter((g) => g.length);
const EASY = ["ب", "ت", "ن", "م", "ل", "ك", "ر", "س", "د", "ف", "ق", "ع", "ح", "ه"];
const BASE_SURAHS = [1, 112, 113, 114, 108, 103];
const MORE_SURAHS = [1, 112, 113, 114, 108, 103, 110, 111, 105, 106, 107, 109, 97, 95, 94, 93];

const T = (en: string, de: string, ar: string, tr: string, ur: string, id: string, fr: string): Tx => ({ en, de, ar, tr, ur, id, fr });

export const STAGES: QStage[] = [
  {
    n: 1, id: "letters", glyph: "ب",
    title: T("The letters", "Die Buchstaben", "الحروف المفردة", "Harfler", "حروفِ تہجی", "Huruf hijaiyah", "Les lettres"),
    explain: T(
      "Arabic has 28 letters plus the hamza, written from right to left. Learn each letter by its shape, its name and its sound. Say every sound out loud.",
      "Arabisch hat 28 Buchstaben und die Hamza und wird von rechts nach links geschrieben. Lernen Sie jeden Buchstaben an Form, Name und Klang. Sprechen Sie jeden Laut laut mit.",
      "للعربية ثمانية وعشرون حرفًا والهمزة، وتُكتب من اليمين إلى اليسار. تعرّف على كل حرف بشكله واسمه وصوته، وانطق كل صوت بصوت مسموع.",
      "Arapçada 28 harf ve hemze vardır; sağdan sola yazılır. Her harfi şekli, adı ve sesiyle öğrenin. Her sesi yüksek sesle söyleyin.",
      "عربی میں 28 حروف اور ہمزہ ہیں، جو دائیں سے بائیں لکھے جاتے ہیں۔ ہر حرف کو اس کی شکل، نام اور آواز سے پہچانیں اور ہر آواز بلند آواز سے ادا کریں۔",
      "Bahasa Arab memiliki 28 huruf ditambah hamzah, ditulis dari kanan ke kiri. Kenali setiap huruf dari bentuk, nama, dan bunyinya. Ucapkan setiap bunyi dengan suara keras.",
      "L’arabe compte 28 lettres plus la hamza, écrites de droite à gauche. Apprenez chaque lettre par sa forme, son nom et son son. Prononcez chaque son à voix haute."),
    lessons: [...GROUPS.map((g, i) => ({ id: `letters-${i + 1}`, kind: "letters" as const, letters: g, surahs: BASE_SURAHS })), { id: "letters-test", kind: "test", letters: GROUPS.flat(), surahs: BASE_SURAHS }],
  },
  {
    n: 2, id: "forms", glyph: "بـ",
    title: T("Letter forms", "Buchstabenformen", "أشكال الحروف", "Harflerin şekilleri", "حروف کی شکلیں", "Bentuk huruf", "Les formes des lettres"),
    explain: T(
      "Most letters change their shape at the start, in the middle and at the end of a word. Six letters (ا د ذ ر ز و) never join the letter after them.",
      "Die meisten Buchstaben ändern ihre Form am Anfang, in der Mitte und am Ende eines Wortes. Sechs Buchstaben (ا د ذ ر ز و) verbinden sich nie mit dem folgenden Buchstaben.",
      "تتغيّر أشكال أكثر الحروف في أول الكلمة ووسطها وآخرها. وستة أحرف (ا د ذ ر ز و) لا تتصل بما بعدها أبدًا.",
      "Harflerin çoğu kelimenin başında, ortasında ve sonunda şekil değiştirir. Altı harf (ا د ذ ر ز و) kendisinden sonraki harfe asla bağlanmaz.",
      "اکثر حروف لفظ کے شروع، درمیان اور آخر میں اپنی شکل بدلتے ہیں۔ چھ حروف (ا د ذ ر ز و) اپنے بعد والے حرف سے کبھی نہیں ملتے۔",
      "Sebagian besar huruf berubah bentuk di awal, tengah, dan akhir kata. Enam huruf (ا د ذ ر ز و) tidak pernah tersambung dengan huruf sesudahnya.",
      "La plupart des lettres changent de forme au début, au milieu et à la fin d’un mot. Six lettres (ا د ذ ر ز و) ne se lient jamais à la lettre suivante."),
    lessons: [...CONNECTING.map((g, i) => ({ id: `forms-${i + 1}`, kind: "forms" as const, letters: g, surahs: BASE_SURAHS })), { id: "forms-test", kind: "test", letters: CONNECTING.flat(), surahs: BASE_SURAHS }],
  },
  {
    n: 3, id: "join", glyph: "بتن",
    title: T("Joining letters", "Buchstaben verbinden", "وصل الحروف", "Harfleri birleştirme", "حروف جوڑنا", "Menyambung huruf", "Lier les lettres"),
    explain: T(
      "Letters join into words. Find the letters inside real Quran words, then build the words yourself, letter by letter, from right to left.",
      "Buchstaben verbinden sich zu Wörtern. Finden Sie die Buchstaben in echten Koranwörtern und bauen Sie die Wörter dann selbst, Buchstabe für Buchstabe, von rechts nach links.",
      "تتصل الحروف فتصير كلمات. اكتشف الحروف في كلمات حقيقية من القرآن، ثم ركّب الكلمات بنفسك حرفًا حرفًا من اليمين إلى اليسار.",
      "Harfler birleşerek kelimeleri oluşturur. Gerçek Kur’an kelimelerindeki harfleri bulun, sonra kelimeleri sağdan sola harf harf kendiniz kurun.",
      "حروف مل کر الفاظ بنتے ہیں۔ قرآن کے حقیقی الفاظ میں حروف تلاش کریں، پھر دائیں سے بائیں حرف بہ حرف خود الفاظ بنائیں۔",
      "Huruf-huruf bersambung menjadi kata. Temukan huruf dalam kata-kata Al-Qur’an yang asli, lalu susun sendiri katanya huruf demi huruf dari kanan ke kiri.",
      "Les lettres s’assemblent en mots. Retrouvez les lettres dans de vrais mots du Coran, puis construisez vous-même les mots, lettre par lettre, de droite à gauche."),
    lessons: [
      { id: "join-1", kind: "join", rule: "any", surahs: [1], letters: EASY },
      { id: "join-2", kind: "join", rule: "any", surahs: [112, 113, 114] },
      { id: "join-3", kind: "join", rule: "any", surahs: [108, 103, 110] },
      { id: "join-test", kind: "test", rule: "any", surahs: BASE_SURAHS },
    ],
  },
  {
    n: 4, id: "harakat", glyph: "بَ بِ بُ",
    title: T("Short vowels (harakat)", "Kurze Vokale (Harakat)", "الحركات", "Harekeler", "حرکات (زبر، زیر، پیش)", "Harakat (fathah, kasrah, dhammah)", "Les voyelles brèves (harakât)"),
    explain: T(
      "Three small signs give a letter its vowel: fatha above (a), kasra below (i), damma above like a small waw (u). Read every letter with its sign, quickly and clearly.",
      "Drei kleine Zeichen geben dem Buchstaben seinen Vokal: Fatha oben (a), Kasra unten (i), Damma oben wie ein kleines Waw (u). Lesen Sie jeden Buchstaben mit seinem Zeichen, kurz und klar.",
      "ثلاث علامات صغيرة تعطي الحرف حركته: الفتحة فوقه، والكسرة تحته، والضمة فوقه كواوٍ صغيرة. اقرأ كل حرف بحركته قراءةً قصيرةً واضحة.",
      "Üç küçük işaret harfe ünlüsünü verir: üstün (a), esre (i) ve küçük bir vav gibi duran ötre (u). Her harfi işaretiyle kısa ve net okuyun.",
      "تین چھوٹی علامتیں حرف کو اس کی حرکت دیتی ہیں: زبر اوپر (a)، زیر نیچے (i)، پیش اوپر چھوٹے واو کی طرح (u)۔ ہر حرف کو اس کی حرکت کے ساتھ مختصر اور صاف پڑھیں۔",
      "Tiga tanda kecil memberi huruf bunyi vokalnya: fathah di atas (a), kasrah di bawah (i), dhammah di atas seperti wau kecil (u). Bacalah setiap huruf dengan tandanya, pendek dan jelas.",
      "Trois petits signes donnent à la lettre sa voyelle : fatha au-dessus (a), kasra en dessous (i), damma au-dessus comme un petit wâw (u). Lisez chaque lettre avec son signe, brièvement et clairement."),
    lessons: [
      { id: "harakat-1", kind: "syllables", marks: ["َ"], syllableLetters: GROUPS.flat().filter((c) => c !== "ء" && c !== "ا") },
      { id: "harakat-2", kind: "syllables", marks: ["ِ"], syllableLetters: GROUPS.flat().filter((c) => c !== "ء" && c !== "ا") },
      { id: "harakat-3", kind: "syllables", marks: ["ُ"], syllableLetters: GROUPS.flat().filter((c) => c !== "ء" && c !== "ا") },
      { id: "harakat-4", kind: "words", rule: "short", surahs: MORE_SURAHS },
      { id: "harakat-test", kind: "test", rule: "short", marks: ["َ", "ِ", "ُ"], surahs: MORE_SURAHS },
    ],
  },
  {
    n: 5, id: "tanween", glyph: "بً بٍ بٌ",
    title: T("Tanwin", "Tanwin", "التنوين", "Tenvin", "تنوین", "Tanwin", "Le tanwîn"),
    explain: T(
      "A doubled vowel sign adds an “n” at the end of a word: an, in, un. In the mushaf, tanwin is sometimes written staggered; it is read the same way.",
      "Ein doppeltes Vokalzeichen fügt am Wortende ein „n“ hinzu: an, in, un. Im Mushaf steht das Tanwin manchmal versetzt; gelesen wird es gleich.",
      "تضعيف الحركة يزيد نونًا ساكنة في آخر الكلمة نطقًا: ـًا ـٍ ـٌ. وقد يُرسم التنوين في المصحف متتابعًا، ويُقرأ كذلك نونًا.",
      "Çift harekeli işaret kelime sonuna bir “n” ekler: en, in, ün. Mushafta tenvin bazen kaydırılmış yazılır; aynı şekilde okunur.",
      "دوہری حرکت لفظ کے آخر میں “ن” کی آواز بڑھاتی ہے: اً، اٍ، اٌ۔ مصحف میں تنوین کبھی آگے پیچھے لکھی ہوتی ہے، پڑھی ویسے ہی جاتی ہے۔",
      "Tanda harakat ganda menambahkan bunyi “n” di akhir kata: an, in, un. Di mushaf, tanwin kadang ditulis bertingkat; dibaca dengan cara yang sama.",
      "Un signe vocalique doublé ajoute un « n » à la fin du mot : an, in, oun. Dans le mushaf, le tanwîn est parfois décalé ; il se lit de la même façon."),
    lessons: [
      { id: "tanween-1", kind: "syllables", marks: ["ً", "ٍ", "ٌ"], syllableLetters: EASY },
      { id: "tanween-2", kind: "words", rule: "tanween", surahs: MORE_SURAHS },
      { id: "tanween-test", kind: "test", rule: "tanween", marks: ["ً", "ٍ", "ٌ"], surahs: MORE_SURAHS },
    ],
  },
  {
    n: 6, id: "madd", glyph: "بَا بِي بُو",
    title: T("Long vowels (madd)", "Lange Vokale (Madd)", "حروف المد", "Uzatma harfleri (med)", "حروفِ مدّہ", "Huruf mad", "Les voyelles longues (madd)"),
    explain: T(
      "Alif after fatha, ya after kasra and waw after damma stretch the vowel to two counts: ā, ī, ū. The small standing alif above a letter is also a long ā.",
      "Alif nach Fatha, Ya nach Kasra und Waw nach Damma dehnen den Vokal auf zwei Zählzeiten: ā, ī, ū. Auch das kleine stehende Alif über einem Buchstaben ist ein langes ā.",
      "الألف بعد الفتحة، والياء بعد الكسرة، والواو بعد الضمة تمدّ الصوت حركتين. والألف الخنجرية الصغيرة فوق الحرف مدٌّ كذلك.",
      "Üstünden sonra elif, esreden sonra ye ve ötreden sonra vav ünlüyü iki elif miktarı uzatır: â, î, û. Harfin üstündeki küçük dik elif de uzun â’dır.",
      "زبر کے بعد الف، زیر کے بعد یا اور پیش کے بعد واو آواز کو دو حرکت تک کھینچتے ہیں: آ، ای، او۔ حرف کے اوپر کھڑا زبر بھی لمبا آ ہے۔",
      "Alif setelah fathah, ya setelah kasrah, dan wau setelah dhammah memanjangkan vokal dua harakat: ā, ī, ū. Alif kecil berdiri di atas huruf juga dibaca panjang ā.",
      "L’alif après fatha, le yâ’ après kasra et le wâw après damma allongent la voyelle de deux temps : â, î, oû. Le petit alif suscrit au-dessus d’une lettre est aussi un â long."),
    lessons: [
      { id: "madd-1", kind: "syllables", marks: ["َا", "ِي", "ُو"], syllableLetters: EASY },
      { id: "madd-2", kind: "words", rule: "madd", surahs: MORE_SURAHS },
      { id: "madd-test", kind: "test", rule: "madd", marks: ["َا", "ِي", "ُو"], surahs: MORE_SURAHS },
    ],
  },
  {
    n: 7, id: "sukun", glyph: "أَبْ",
    title: T("Sukun", "Sukun", "السكون", "Cezm (sükûn)", "جزم (سکون)", "Sukun", "Le soukoûn"),
    explain: T(
      "A letter with sukun has no vowel: it closes the syllable before it, as in “ab”. In the Uthmani mushaf, sukun looks like a small head of the letter ḥāʾ.",
      "Ein Buchstabe mit Sukun hat keinen Vokal: Er schließt die Silbe davor, wie in „ab“. Im Uthmani-Mushaf sieht das Sukun aus wie ein kleiner Kopf des Buchstabens Ḥāʾ.",
      "الحرف الساكن لا حركة له، فيُغلق المقطع الذي قبله كما في «أَبْ». وفي المصحف العثماني يُرسم السكون كرأس حاءٍ صغيرة.",
      "Cezimli harfin harekesi yoktur: Kendisinden önceki heceyi kapatır, “eb” gibi. Osmanî mushafta cezm küçük bir hâ başı gibi görünür.",
      "جزم والا حرف بغیر حرکت کے ہوتا ہے: یہ پچھلے حرف کے ساتھ مل کر ہجا بند کرتا ہے، جیسے «اَبْ»۔ عثمانی مصحف میں جزم چھوٹے ح کے سر جیسا ہوتا ہے۔",
      "Huruf bersukun tidak berharakat: menutup suku kata sebelumnya, seperti “ab”. Dalam mushaf Utsmani, sukun tampak seperti kepala huruf ḥa kecil.",
      "Une lettre avec soukoûn n’a pas de voyelle : elle ferme la syllabe précédente, comme dans « ab ». Dans le mushaf uthmânî, le soukoûn ressemble à une petite tête de ḥâ’."),
    lessons: [
      { id: "sukun-1", kind: "syllables", marks: ["ْ"], syllableLetters: EASY },
      { id: "sukun-2", kind: "words", rule: "sukun", surahs: MORE_SURAHS },
      { id: "sukun-test", kind: "test", rule: "sukun", surahs: MORE_SURAHS },
    ],
  },
  {
    n: 8, id: "shadda", glyph: "بّ",
    title: T("Shadda", "Schadda", "الشدّة", "Şedde", "تشدید", "Tasydid (syaddah)", "La chadda"),
    explain: T(
      "Shadda (like a small w) doubles a letter: the first one with sukun, the second with the vowel. Hold the doubled letter briefly; with ن and م you also hum (ghunna).",
      "Die Schadda (wie ein kleines w) verdoppelt den Buchstaben: der erste mit Sukun, der zweite mit dem Vokal. Halten Sie den doppelten Buchstaben kurz; bei ن und م summen Sie dabei (Ghunna).",
      "الشدة تضعّف الحرف: الأول ساكن والثاني متحرك. أمسك الحرف المشدد قليلًا، ومع النون والميم تأتي الغنّة.",
      "Şedde (küçük bir w gibi) harfi iki kez okutur: ilki cezimli, ikincisi harekeli. Şeddeli harfte kısaca durun; ن ve م’de genizden ses (gunne) verin.",
      "تشدید (چھوٹے w جیسی) حرف کو دوہرا کرتی ہے: پہلا ساکن اور دوسرا متحرک۔ مشدد حرف پر ذرا ٹھہریں؛ ن اور م میں غنّہ بھی کریں۔",
      "Tasydid (seperti w kecil) menggandakan huruf: yang pertama sukun, yang kedua berharakat. Tahan sebentar huruf yang bertasydid; pada ن dan م disertai dengung (ghunnah).",
      "La chadda (comme un petit w) double la lettre : la première avec soukoûn, la seconde avec la voyelle. Tenez brièvement la lettre doublée ; avec ن et م, on nasalise (ghunna)."),
    lessons: [
      { id: "shadda-1", kind: "syllables", marks: ["َّ", "ِّ", "ُّ"], syllableLetters: EASY },
      { id: "shadda-2", kind: "words", rule: "shadda", surahs: MORE_SURAHS },
      { id: "shadda-test", kind: "test", rule: "shadda", surahs: MORE_SURAHS },
    ],
  },
  {
    n: 9, id: "special", glyph: "ة ى أ",
    title: T("Special letters", "Besondere Buchstaben", "حروف خاصة", "Özel harfler", "خاص حروف", "Huruf khusus", "Lettres particulières"),
    explain: T(
      "Ta marbuta (ة) is read as t, and as h when you stop. Alif maqsura (ى) is a long ā without dots. Hamza sits on a seat (أ إ ؤ ئ) or alone (ء). Hamzat al-wasl (ٱ) is silent inside a sentence.",
      "Ta marbuta (ة) wird als t gelesen, beim Anhalten als h. Alif maqsura (ى) ist ein langes ā ohne Punkte. Die Hamza sitzt auf einem Träger (أ إ ؤ ئ) oder allein (ء). Hamzat al-Wasl (ٱ) bleibt im Satz stumm.",
      "التاء المربوطة (ة) تُقرأ تاءً في الوصل وهاءً في الوقف. والألف المقصورة (ى) مدٌّ بلا نقط. والهمزة تأتي على كرسي (أ إ ؤ ئ) أو منفردة (ء). وهمزة الوصل (ٱ) تسقط في درج الكلام.",
      "Te merbûta (ة) t okunur, durunca h olur. Elif maksûre (ى) noktasız uzun â’dır. Hemze bir kürsü üzerinde (أ إ ؤ ئ) ya da tek başına (ء) durur. Vasl hemzesi (ٱ) cümle içinde okunmaz.",
      "گول تا (ة) ملا کر پڑھنے میں ت اور وقف میں ہ پڑھی جاتی ہے۔ الف مقصورہ (ى) بغیر نقطوں کا لمبا آ ہے۔ ہمزہ کرسی پر (أ إ ؤ ئ) یا اکیلا (ء) آتا ہے۔ ہمزۂ وصل (ٱ) ملا کر پڑھتے وقت نہیں پڑھا جاتا۔",
      "Ta marbuthah (ة) dibaca t, dan h saat berhenti. Alif maqshurah (ى) adalah ā panjang tanpa titik. Hamzah duduk di atas kursi (أ إ ؤ ئ) atau sendiri (ء). Hamzah washal (ٱ) tidak dibaca di tengah kalimat.",
      "Le tâ’ marbûta (ة) se lit t, et h à la pause. L’alif maqsûra (ى) est un â long sans points. La hamza repose sur un support (أ إ ؤ ئ) ou seule (ء). La hamzat al-wasl (ٱ) est muette à l’intérieur de la phrase."),
    lessons: [
      { id: "special-1", kind: "words", rule: "taMarbuta", surahs: MORE_SURAHS },
      { id: "special-2", kind: "words", rule: "alifMaqsura", surahs: MORE_SURAHS },
      { id: "special-3", kind: "words", rule: "hamza", surahs: MORE_SURAHS },
      { id: "special-4", kind: "words", rule: "wasla", surahs: MORE_SURAHS },
      { id: "special-test", kind: "test", rule: "any", surahs: MORE_SURAHS },
    ],
  },
  {
    n: 10, id: "signs", glyph: "ۚ ۖ ۗ",
    title: T("Signs of the mushaf", "Zeichen des Mushaf", "علامات المصحف", "Mushaf işaretleri", "مصحف کی علامات", "Tanda-tanda mushaf", "Les signes du mushaf"),
    explain: T(
      "Small marks above the line guide pauses: ۘ must stop, ۗ better to stop, ۖ better to continue, ۚ both are fine, ۛ stop at one of the two. Small letters (ۥ ۦ) are read long; letters with a small circle (۟) are written but not read.",
      "Kleine Zeichen über der Zeile regeln das Anhalten: ۘ unbedingt anhalten, ۗ besser anhalten, ۖ besser weiterlesen, ۚ beides erlaubt, ۛ an einer der beiden Stellen anhalten. Kleine Buchstaben (ۥ ۦ) werden lang gelesen; Buchstaben mit kleinem Kreis (۟) werden geschrieben, aber nicht gelesen.",
      "علامات صغيرة فوق السطر تدلّ على الوقف: ۘ وقف لازم، ۗ الوقف أولى، ۖ الوصل أولى، ۚ جائز، ۛ تعانق الوقف. والحروف الصغيرة (ۥ ۦ) تُمدّ، والحرف الذي عليه دائرة صغيرة (۟) يُكتب ولا يُقرأ.",
      "Satır üstündeki küçük işaretler durmayı yönetir: ۘ mutlaka durulur, ۗ durmak daha iyidir, ۖ geçmek daha iyidir, ۚ ikisi de olur, ۛ ikisinden birinde durulur. Küçük harfler (ۥ ۦ) uzatılır; küçük yuvarlaklı harfler (۟) yazılır ama okunmaz.",
      "سطر کے اوپر چھوٹی علامات وقف بتاتی ہیں: ۘ لازمی وقف، ۗ وقف بہتر، ۖ ملا کر پڑھنا بہتر، ۚ دونوں جائز، ۛ دو میں سے ایک جگہ وقف۔ چھوٹے حروف (ۥ ۦ) کھینچ کر پڑھے جاتے ہیں؛ چھوٹے دائرے والا حرف (۟) لکھا جاتا ہے مگر پڑھا نہیں جاتا۔",
      "Tanda kecil di atas baris mengatur waqaf: ۘ wajib berhenti, ۗ lebih baik berhenti, ۖ lebih baik lanjut, ۚ boleh keduanya, ۛ berhenti di salah satunya. Huruf kecil (ۥ ۦ) dibaca panjang; huruf bertanda lingkaran kecil (۟) ditulis tetapi tidak dibaca.",
      "De petits signes au-dessus de la ligne guident les pauses : ۘ arrêt obligatoire, ۗ arrêt préférable, ۖ continuer de préférence, ۚ les deux sont permis, ۛ s’arrêter à l’un des deux. Les petites lettres (ۥ ۦ) se lisent longues ; une lettre avec un petit cercle (۟) s’écrit mais ne se lit pas."),
    lessons: [
      { id: "signs-1", kind: "verses", rule: "waqf", surahs: [112, 113, 114, 103, 108, 110, 97, 98, 99, 100, 101, 102, 104] },
      { id: "signs-2", kind: "words", rule: "small", surahs: MORE_SURAHS },
      { id: "signs-3", kind: "words", rule: "rasm", surahs: [76, 88, 89, 98, ...MORE_SURAHS] },
      { id: "signs-test", kind: "test", rule: "any", surahs: MORE_SURAHS },
    ],
  },
  {
    n: 11, id: "verses", glyph: "قُلْ",
    title: T("Words and short verses", "Wörter und kurze Verse", "كلمات وآيات قصيرة", "Kelimeler ve kısa ayetler", "الفاظ اور چھوٹی آیات", "Kata dan ayat pendek", "Mots et versets courts"),
    explain: T(
      "Now everything comes together: read whole Quran words and short verses, first with the recording, then on your own, and finally against the clock.",
      "Jetzt kommt alles zusammen: Lesen Sie ganze Koranwörter und kurze Verse, erst mit der Aufnahme, dann allein und schließlich auf Zeit.",
      "الآن يجتمع كل ما تعلّمته: اقرأ كلمات القرآن والآيات القصيرة كاملة، أولًا مع التسجيل، ثم وحدك، ثم في وقتٍ محدّد.",
      "Şimdi her şey bir araya geliyor: Kur’an kelimelerini ve kısa ayetleri önce kayıtla, sonra kendiniz ve sonunda süreye karşı okuyun.",
      "اب سب کچھ یکجا ہوتا ہے: قرآن کے پورے الفاظ اور چھوٹی آیات پہلے ریکارڈنگ کے ساتھ، پھر خود اور آخر میں وقت کے ساتھ پڑھیں۔",
      "Sekarang semuanya menyatu: bacalah kata-kata Al-Qur’an dan ayat-ayat pendek secara utuh, mula-mula bersama rekaman, lalu sendiri, dan akhirnya dengan batas waktu.",
      "Tout se rejoint maintenant : lisez des mots entiers du Coran et des versets courts, d’abord avec l’enregistrement, puis seul, enfin contre la montre."),
    lessons: [
      { id: "verses-1", kind: "words", rule: "any", surahs: [1] },
      { id: "verses-2", kind: "verses", rule: "any", surahs: [1] },
      { id: "verses-3", kind: "verses", rule: "any", surahs: [112, 113, 114] },
      { id: "verses-4", kind: "verses", rule: "any", surahs: [108, 103, 110, 111] },
      { id: "verses-test", kind: "test", rule: "any", surahs: [1, 112, 113, 114] },
    ],
  },
  {
    n: 12, id: "juz", glyph: "عَمَّ",
    title: T("Reading Juz ʿAmma", "Juz ʿAmma lesen", "قراءة جزء عمّ", "Amme cüzünü okuma", "پارہ عمّ پڑھنا", "Membaca Juz ʿAmma", "Lire le Juz’ ʿAmma"),
    explain: T(
      "Read the last part of the Quran surah by surah. Listen with word-by-word highlighting, then read each verse yourself and check the words.",
      "Lesen Sie den letzten Teil des Korans Sure für Sure. Hören Sie mit Wort-für-Wort-Markierung zu, lesen Sie dann jeden Vers selbst und prüfen Sie die Wörter.",
      "اقرأ الجزء الأخير من القرآن سورةً سورة. استمع مع تظليل الكلمات كلمةً كلمة، ثم اقرأ كل آية بنفسك وتحقّق من كلماتها.",
      "Kur’an’ın son cüzünü sure sure okuyun. Kelime kelime vurgulamayla dinleyin, sonra her ayeti kendiniz okuyup kelimeleri kontrol edin.",
      "قرآن کا آخری پارہ سورت بہ سورت پڑھیں۔ لفظ بہ لفظ نشان دہی کے ساتھ سنیں، پھر ہر آیت خود پڑھیں اور الفاظ جانچیں۔",
      "Bacalah juz terakhir Al-Qur’an surah demi surah. Dengarkan dengan penanda kata demi kata, lalu bacalah sendiri setiap ayat dan periksa kata-katanya.",
      "Lisez la dernière partie du Coran sourate par sourate. Écoutez avec le surlignage mot à mot, puis lisez chaque verset vous-même et vérifiez les mots."),
    lessons: Array.from({ length: 37 }, (_, i) => 114 - i).map((s) => ({ id: `juz-${s}`, kind: "juz" as const, surah: s })),
  },
];

export const stageOf = (lessonId: string) => STAGES.find((s) => s.lessons.some((l) => l.id === lessonId));
export const lessonOf = (lessonId: string) => STAGES.flatMap((s) => s.lessons).find((l) => l.id === lessonId);
export const isFreeStage = (n: number) => n <= FREE_STAGES;

/** placement: units of the existing Arabic course (/arabic/placement) → stages of this course that are skipped */
export const UNIT_STAGES: Record<number, number[]> = { 1: [1], 2: [2, 3], 3: [4], 4: [5, 6, 7, 8], 5: [9, 10], 6: [11] };
