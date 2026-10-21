// mirrors mobile/src/features/qaida/curriculum-mushaf.ts (copied for the website; keep both in step)
import type { QLesson, QStage, Tx } from "./curriculum";

// Stages 13–20 of the reading course: from Juz ʿAmma to fluent reading in the whole mushaf. Appended after stage 12,
// so the ids and progress of stages 1–12 stay as they were. Every Quran word and verse is still picked at run time
// from the app's word data (words.ts); only the explanations are written here (de, en, ar; others fall back to en).

const X = (en: string, de: string, ar: string): Tx => ({ en, de, ar });
const surahLessons = (prefix: string, surahs: number[]): QLesson[] => surahs.map((s) => ({ id: `${prefix}-${s}`, kind: "juz" as const, surah: s }));

export const MUSHAF_STAGES: QStage[] = [
  {
    n: 13, id: "scripts", glyph: "ۡ ْ",
    title: X("Uthmani and IndoPak script", "Uthmani- und IndoPak-Schrift", "الرسم العثماني والهندي"),
    explain: X(
      "Two printing traditions are common: the Uthmani (Madinah) mushaf used in the Arab world and much of the West, and the IndoPak mushaf used in South Asia and many mosques worldwide. The words are the same; the signs differ. This app shows the Uthmani text. Each lesson explains one difference, then you read real words from the app's Quran data.",
      "Zwei Drucktraditionen sind verbreitet: der Uthmani-Mushaf (Madina), der in der arabischen Welt und weiten Teilen des Westens genutzt wird, und der IndoPak-Mushaf aus Südasien, den viele Moscheen weltweit verwenden. Die Wörter sind dieselben, die Zeichen unterscheiden sich. Diese App zeigt den Uthmani-Text. Jede Lektion erklärt einen Unterschied, dann lesen Sie echte Wörter aus den Korandaten der App.",
      "ينتشر تقليدان في طباعة المصحف: المصحف العثماني (مصحف المدينة) في العالم العربي وكثير من بلاد الغرب، والمصحف الهندي (IndoPak) في جنوب آسيا وكثير من المساجد حول العالم. الكلمات واحدة والعلامات مختلفة. يعرض هذا التطبيق الرسم العثماني، وكل درس يشرح فرقًا واحدًا ثم تقرأ كلمات حقيقية من بيانات القرآن في التطبيق."),
    lessons: [
      { id: "scripts-1", kind: "words", rule: "sukun", surahs: [67, 78],
        note: X(
          "Sukun. In the Uthmani mushaf the sukun looks like the small head of the letter ḥāʾ, and a letter that merges into the next one (idgham) carries no sukun at all. The IndoPak mushaf uses a jazm shaped like a small arc and writes it on almost every silent letter.",
          "Sukun. Im Uthmani-Mushaf sieht das Sukun aus wie der kleine Kopf des Buchstabens Ḥāʾ, und ein Buchstabe, der in den nächsten übergeht (Idgham), trägt gar kein Sukun. Der IndoPak-Mushaf nutzt ein Dschazm in Form eines kleinen Bogens und setzt es auf fast jeden stummen Buchstaben.",
          "السكون: في المصحف العثماني يُرسم كرأس حاء صغيرة، والحرف المدغم فيما بعده لا يوضع عليه سكون. وفي المصحف الهندي يُرسم الجزم كقوس صغير ويوضع على كل حرف ساكن تقريبًا.") },
      { id: "scripts-2", kind: "words", rule: "small", surahs: [36, 67],
        note: X(
          "Small letters. The Uthmani text writes a small alif above a letter for a long ā, and a small waw or ya after the pronoun hu/hi when it is lengthened. The IndoPak text shows the same sounds with a standing fatha (khaṛā zabar), a standing kasra (khaṛī zēr) and an inverted damma (ulṭā pēsh).",
          "Kleine Buchstaben. Der Uthmani-Text setzt ein kleines Alif über einen Buchstaben für ein langes ā und ein kleines Waw oder Ya nach dem Pronomen hu/hi, wenn es gedehnt wird. Der IndoPak-Text zeigt dieselben Laute mit einer stehenden Fatha (khaṛā zabar), einer stehenden Kasra (khaṛī zēr) und einer umgedrehten Damma (ulṭā pēsh).",
          "الحروف الصغيرة: يكتب الرسم العثماني ألفًا صغيرة فوق الحرف للمدّ، وواوًا أو ياءً صغيرة بعد هاء الضمير عند الصلة. ويعبّر المصحف الهندي عن الأصوات نفسها بالفتحة القائمة والكسرة القائمة والضمة المقلوبة.") },
      { id: "scripts-3", kind: "words", rule: "tanween", surahs: [55, 56],
        note: X(
          "Tanwin. In the Uthmani mushaf the two strokes of tanwin are written staggered when the noon sound is hidden or merged, and one above the other when it is pronounced clearly; the sign itself tells you the rule. The IndoPak mushaf writes tanwin the same way every time, and you apply the rule yourself.",
          "Tanwin. Im Uthmani-Mushaf stehen die zwei Striche des Tanwin versetzt, wenn der Nun-Laut verborgen oder angeglichen wird, und übereinander, wenn er deutlich gesprochen wird; das Zeichen verrät die Regel. Der IndoPak-Mushaf schreibt Tanwin immer gleich, und Sie wenden die Regel selbst an.",
          "التنوين: في المصحف العثماني تُرسم الحركتان متتابعتين عند الإخفاء والإدغام، ومتراكبتين عند الإظهار، فالعلامة نفسها تدلّ على الحكم. وفي المصحف الهندي يُرسم التنوين بصورة واحدة دائمًا، ويطبّق القارئ الحكم بنفسه.") },
      { id: "scripts-4", kind: "words", rule: "rasm", surahs: [18, 76, 89],
        note: X(
          "Written but not read. Some letters belong to the Uthmani spelling but are not pronounced, such as an alif after the plural waw. The Uthmani mushaf puts a small oval zero on letters that are never read; the IndoPak mushaf simply leaves them without any vowel sign.",
          "Geschrieben, nicht gelesen. Manche Buchstaben gehören zur uthmanischen Schreibung, werden aber nicht gesprochen, etwa ein Alif nach dem Plural-Waw. Der Uthmani-Mushaf setzt eine kleine ovale Null auf Buchstaben, die nie gelesen werden; der IndoPak-Mushaf lässt sie einfach ohne Vokalzeichen.",
          "حروف تُكتب ولا تُقرأ: بعض الحروف من الرسم العثماني ولا يُنطق بها، كالألف بعد واو الجماعة. يضع المصحف العثماني عليها صفرًا مستطيلًا صغيرًا، ويتركها المصحف الهندي بلا حركة.") },
      { id: "scripts-5", kind: "verses", rule: "waqf", surahs: [67, 36],
        note: X(
          "Stop signs. The Uthmani mushaf uses six signs: must stop, better to stop, better to continue, both allowed, stop at one of two places, and do not stop. The IndoPak mushaf has more letters above the line, such as ṭāʾ for an absolute stop, jīm for an allowed stop and zāy or ṣād for preferring to continue, and marks the end of each rukūʿ with ʿayn in the margin.",
          "Pausenzeichen. Der Uthmani-Mushaf nutzt sechs Zeichen: anhalten müssen, besser anhalten, besser weiterlesen, beides erlaubt, an einer von zwei Stellen anhalten, nicht anhalten. Der IndoPak-Mushaf hat mehr Buchstaben über der Zeile, etwa Ṭāʾ für ein unbedingtes Anhalten, Ǧīm für ein erlaubtes und Zāy oder Ṣād für besser weiterlesen, und markiert das Ende jedes Rukūʿ mit ʿAyn am Rand.",
          "علامات الوقف: في المصحف العثماني ست علامات: الوقف اللازم، والوقف أولى، والوصل أولى، والجائز، وتعانق الوقف، ومنع الوقف. وفي المصحف الهندي علامات أكثر مثل الطاء للوقف المطلق، والجيم للجائز، والزاي والصاد لترجيح الوصل، وتُعلَّم نهاية كل ركوع بحرف العين في الهامش.") },
      { id: "scripts-test", kind: "test", rule: "any", surahs: [67, 36] },
    ],
  },
  {
    n: 14, id: "long", glyph: "آيَة",
    title: X("Reading long verses", "Lange Verse lesen", "قراءة الآيات الطويلة"),
    explain: X(
      "Beyond Juz ʿAmma verses get longer. Read them in phrases: look ahead to the next stop sign, read up to it in one flow, then continue. Each lesson shows long verses from the app's data, then you read them aloud and against a target time.",
      "Nach Juz ʿAmma werden die Verse länger. Lesen Sie sie in Abschnitten: Schauen Sie voraus zum nächsten Pausenzeichen, lesen Sie bis dorthin in einem Fluss und fahren Sie dann fort. Jede Lektion zeigt lange Verse aus den Daten der App; dann lesen Sie sie laut und gegen eine Zielzeit.",
      "بعد جزء عمّ تطول الآيات. اقرأها جُملًا: انظر إلى علامة الوقف التالية، واقرأ إليها دفعة واحدة، ثم أكمل. يعرض كل درس آيات طويلة من بيانات التطبيق، ثم تقرؤها بصوت مسموع وفي زمن محدّد."),
    lessons: [
      { id: "long-1", kind: "long", surahs: [67, 36], minWords: 12, msPerWord: 1400 },
      { id: "long-2", kind: "long", surahs: [18], minWords: 14, msPerWord: 1300 },
      { id: "long-3", kind: "long", surahs: [24], minWords: 18, msPerWord: 1200 },
      { id: "long-4", kind: "long", surahs: [2], minWords: 24, msPerWord: 1100 },
      { id: "long-test", kind: "test", rule: "any", surahs: [36, 18] },
    ],
  },
  {
    n: 15, id: "waqfdrill", glyph: "قِف",
    title: X("Waqf practice", "Waqf-Übungen", "تدريبات الوقف"),
    explain: X(
      "Practise stopping and starting at the signs. Find the stop signs in each verse, read up to them, pause, and continue. When you stop, the last vowel becomes sukun and a tanwin with fatha becomes a short ā.",
      "Üben Sie das Anhalten und Neubeginnen an den Zeichen. Finden Sie die Pausenzeichen in jedem Vers, lesen Sie bis dorthin, halten Sie an und lesen Sie weiter. Beim Anhalten wird der letzte Vokal zum Sukun, und Tanwin mit Fatha wird zu einem kurzen ā.",
      "تدرّب على الوقف والابتداء عند العلامات. ابحث عن علامات الوقف في كل آية، واقرأ إليها، ثم قف، ثم أكمل. وعند الوقف تُسكَّن الحركة الأخيرة، ويُبدَل تنوين الفتح ألفًا."),
    lessons: [
      { id: "waqfdrill-1", kind: "verses", rule: "waqf", surahs: [67] },
      { id: "waqfdrill-2", kind: "verses", rule: "waqf", surahs: [36] },
      { id: "waqfdrill-3", kind: "verses", rule: "waqf", surahs: [55, 56] },
      { id: "waqfdrill-4", kind: "verses", rule: "waqf", surahs: [18] },
      { id: "waqfdrill-test", kind: "test", rule: "waqf", surahs: [67, 36, 18] },
    ],
  },
  {
    n: 16, id: "speed", glyph: "سُرْعَة",
    title: X("Speed levels", "Tempostufen", "مستويات السرعة"),
    explain: X(
      "Reciters distinguish three speeds: taḥqīq (slow, for learning), tadwīr (medium) and ḥadr (fluent, still with every rule). Each lesson sets a faster target per word. Speed never comes before correctness: if you miss a word, slow down.",
      "Rezitatoren unterscheiden drei Tempi: Taḥqīq (langsam, zum Lernen), Tadwīr (mittel) und Ḥadr (flüssig, aber mit jeder Regel). Jede Lektion setzt ein schnelleres Ziel pro Wort. Tempo kommt nie vor Richtigkeit: Wenn Sie ein Wort verfehlen, werden Sie langsamer.",
      "يفرّق القرّاء بين ثلاث مراتب: التحقيق (بطيء للتعلّم)، والتدوير (متوسط)، والحدر (سريع مع حفظ الأحكام). يرفع كل درس الهدف لكل كلمة. ولا تتقدّم السرعة على الصحة: إذا أخطأت في كلمة فتمهّل."),
    lessons: [
      { id: "speed-1", kind: "timed", surahs: [78, 79], msPerWord: 1500 },
      { id: "speed-2", kind: "timed", surahs: [80, 81, 82, 83], msPerWord: 1100 },
      { id: "speed-3", kind: "timed", surahs: [67], msPerWord: 900 },
      { id: "speed-4", kind: "timed", surahs: [36], msPerWord: 700 },
    ],
  },
  {
    n: 17, id: "juz29", glyph: "٢٩",
    title: X("Reading Juz 29 (Tabarak)", "Juz 29 lesen (Tabarak)", "قراءة جزء تبارك"),
    explain: X(
      "Juz 29, from al-Mulk to al-Mursalat, surah by surah. Listen with word highlighting, then read every verse yourself and check the words. Six surahs complete the stage.",
      "Juz 29, von al-Mulk bis al-Mursalat, Sure für Sure. Hören Sie mit Wortmarkierung zu, lesen Sie dann jeden Vers selbst und prüfen Sie die Wörter. Sechs Suren schließen die Stufe ab.",
      "جزء تبارك، من الملك إلى المرسلات، سورةً سورة. استمع مع تظليل الكلمات، ثم اقرأ كل آية بنفسك وتحقّق من كلماتها. ست سور تُتمّ المرحلة."),
    lessons: surahLessons("juz", [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77]),
    openAll: true, need: 6,
  },
  {
    n: 18, id: "juz28", glyph: "٢٨",
    title: X("Reading Juz 28 (Qad samiʿa)", "Juz 28 lesen (Qad samiʿa)", "قراءة جزء قد سمع"),
    explain: X(
      "Juz 28, from al-Mujadilah to at-Tahrim. Longer verses with legal and social themes: read in phrases and use the stop signs. Five surahs complete the stage.",
      "Juz 28, von al-Mudschadila bis at-Tahrim. Längere Verse mit rechtlichen und gesellschaftlichen Themen: Lesen Sie in Abschnitten und nutzen Sie die Pausenzeichen. Fünf Suren schließen die Stufe ab.",
      "جزء قد سمع، من المجادلة إلى التحريم. آيات أطول في الأحكام وشؤون المجتمع: اقرأ جُملًا واستعن بعلامات الوقف. خمس سور تُتمّ المرحلة."),
    lessons: surahLessons("juz", [58, 59, 60, 61, 62, 63, 64, 65, 66]),
    openAll: true, need: 5,
  },
  {
    n: 19, id: "surahs", glyph: "سُوَر",
    title: X("Beloved surahs", "Beliebte Suren", "سور مختارة"),
    explain: X(
      "Surahs many people read regularly: al-Kahf on Fridays, Ya-Sin, ar-Rahman and al-Waqiʿah. Read them surah by surah with the recording; al-Mulk is in Juz 29. Three surahs complete the stage.",
      "Suren, die viele regelmäßig lesen: al-Kahf am Freitag, Ya-Sin, ar-Rahman und al-Waqiʿa. Lesen Sie sie Sure für Sure mit der Aufnahme; al-Mulk finden Sie in Juz 29. Drei Suren schließen die Stufe ab.",
      "سور يقرؤها كثيرون بانتظام: الكهف يوم الجمعة، ويس، والرحمن، والواقعة. اقرأها سورةً سورة مع التسجيل؛ وسورة الملك في جزء تبارك. ثلاث سور تُتمّ المرحلة."),
    lessons: surahLessons("sura", [18, 36, 55, 56]),
    openAll: true, need: 3,
  },
  {
    n: 20, id: "challenge", glyph: "تَحَدٍّ",
    title: X("Reading challenges", "Lese-Challenges", "تحديات القراءة"),
    explain: X(
      "Timed challenges across the mushaf: verses appear one after the other, you read each aloud as soon as you start the timer and stop it at the end. Beat the target time and your best time is saved per challenge.",
      "Challenges auf Zeit quer durch den Mushaf: Verse erscheinen nacheinander, Sie lesen jeden laut, sobald Sie die Uhr starten, und stoppen sie am Ende. Unterbieten Sie die Zielzeit; Ihre Bestzeit wird je Challenge gespeichert.",
      "تحديات بالوقت عبر المصحف: تظهر الآيات واحدة بعد أخرى، فتقرأ كل آية بصوت مسموع منذ تشغيل المؤقت وتوقفه عند نهايتها. تغلّب على الزمن المستهدف، وتُحفظ أفضل نتيجة لكل تحدٍّ."),
    lessons: [
      { id: "challenge-1", kind: "timed", surahs: [78, 79, 80], msPerWord: 800 },
      { id: "challenge-2", kind: "timed", surahs: [67, 68], msPerWord: 800 },
      { id: "challenge-3", kind: "timed", surahs: [58, 59], msPerWord: 750 },
      { id: "challenge-4", kind: "timed", surahs: [36, 18], msPerWord: 700 },
      { id: "challenge-5", kind: "timed", surahs: [2], msPerWord: 650 },
      { id: "challenge-test", kind: "test", rule: "any", surahs: [2, 18, 36] },
    ],
  },
];
