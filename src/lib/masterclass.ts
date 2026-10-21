// Texts and structure of the Masterclass pages: the home sections (promise, pillars, school stages, talents, pricing,
// testimonials), /masterclass (curriculum and school structure) and /talents (verified reciter profiles).
// German, English and Arabic are written here; every other language falls back to English (like the rest of the site).
// Facts only from the app's curriculum: Reciter Path 10 levels ending in the Masterclass recital, reading course in
// 20 stages, language course A1–C1 with the 500 most frequent Quran words, Academy courses, garden, Talents (16+ to post).
// Prices are NOT written here: they come from messages/<locale>.json "premium" (single source).

export type StageKey = "ibtidai" | "idadi" | "thanawi" | "ali";
export type PillarKey = "shams" | "path" | "school" | "arabic" | "tajweed" | "hifz" | "academy" | "garden" | "talents";

type Pillar = { t: string; d: string };
type Stage = { name: string; t: string; d: string; items: string[] };
export type Testimonial = { quote: string; name: string; place?: string; role?: string };

export type MC = {
  hero: { title: string; accent: string; lead: string; cta: string; ctaFree: string };
  pillarsKicker: string; pillarsTitle: string; pillarsLead: string; pillars: Record<PillarKey, Pillar>; open: string;
  schoolKicker: string; schoolTitle: string; schoolLead: string; stages: Record<StageKey, Stage>; stageWord: string;
  pathKicker: string; pathTitle: string; pathLead: string; levels: string[]; recitalT: string; recitalD: string; levelWord: string;
  arabicTitle: string; arabicLead: string; readingT: string; readingD: string; cefr: [string, string][];
  tajweedT: string; tajweedD: string; hifzT: string; hifzD: string; gardenT: string; gardenD: string;
  academyTitle: string; academyLead: string; courses: string[];
  certT: string; certD: string;
  talents: {
    kicker: string; title: string; lead: string; cta: string; ctaApp: string;
    levelsTitle: string; levels: [string, string][];
    pathTitle: string; steps: [string, string][];
    safetyTitle: string; safety: string[];
    soonTitle: string; soonBody: string; soonBack: string;
    metaTitle: string; metaDesc: string;
  };
  pricing: { kicker: string; title: string; lead: string; freeT: string; freeNote: string; proT: string; proNote: string; cta: string; ctaApp: string };
  voices: { kicker: string; title: string; empty: string; cta: string };
  page: { metaTitle: string; metaDesc: string; kicker: string; title: string; lead: string; ctaApp: string; ctaShams: string; outroT: string; outroD: string };
  appPage: { title: string; lead: string; cta: string };
};

const en: MC = {
  hero: {
    title: "Become a reciter of the Quran.",
    accent: "With the Shams Method.",
    lead: "A complete school of the Quran – from the first Arabic letter to your Masterclass recital. Reading, tajweed, memorisation and meaning, verse by verse, guided by a plan that remembers for you.",
    cta: "Discover the Masterclass", ctaFree: "Start free",
  },
  pillarsKicker: "The Masterclass", pillarsTitle: "Nine pillars, one path", open: "Learn more",
  pillarsLead: "Everything you need to recite the Quran beautifully and understand what you recite – built as one connected curriculum, not a collection of tools.",
  pillars: {
    shams: { t: "The Shams Method", d: "Every verse in short steps: listen, build up, word by word, meaning, tafsir, recall. Daily new portions, recent ones and long-term review." },
    path: { t: "The Reciter Path", d: "Ten levels from makharij to qira'at and maqamat – ending in your Masterclass recital with certificate." },
    school: { t: "The school stages", d: "Ibtidāʾī, Iʿdādī, Thānawī, ʿĀlī: four stages like a traditional Islamic school, each with clear goals." },
    arabic: { t: "Arabic reading and language", d: "Read from the first letter in 20 stages, then understand the Quran's Arabic from A1 to C1 with its 500 most frequent words." },
    tajweed: { t: "Tajweed", d: "Every rule explained with examples from the mushaf, heard from great reciters and practised in short tests." },
    hifz: { t: "Hifz cards", d: "Memorisation cards that return exactly when you are about to forget – so what you learn stays with you." },
    academy: { t: "Academy courses", d: "Seerah, the Prophets, tafsir, hadith, ʿaqīdah, fiqh, akhlāq and more – short lessons with tests and certificates." },
    garden: { t: "Your growing garden", d: "A tree that grows with every verse you learn. Quiet, patient progress you can see." },
    talents: { t: "The Talents community", d: "Verified reciters and teachers from around the world, with levels, rewaya and ijazah chain." },
  },
  schoolKicker: "The school", schoolTitle: "Four stages, like a traditional Islamic school", stageWord: "Stage",
  schoolLead: "The Masterclass follows the order in which the Quran has been taught for centuries: first reading, then correct recitation, then depth and mastery.",
  stages: {
    ibtidai: { name: "Ibtidāʾiyya", t: "Foundation", d: "Letters, vowels and your first surahs.", items: ["Arabic reading course, first stages", "al-Fātiḥa and Juz ʿAmma with the Shams Method", "Reciter Path levels 1–2", "Arabic language A1"] },
    idadi: { name: "Iʿdādiyya", t: "Preparation", d: "Fluent reading and the core rules of tajweed.", items: ["Reading course completed (20 stages)", "Reciter Path levels 3–5", "Daily hifz cards", "Arabic language A2"] },
    thanawi: { name: "Thānawiyya", t: "Consolidation", d: "Stopping well, breath, melody and longer surahs.", items: ["Reciter Path levels 6–8: waqf, maqamat, breath", "Longer surahs with the Shams Method", "Academy: tafsir, hadith, fiqh", "Arabic language B1–B2"] },
    ali: { name: "ʿĀliya", t: "Mastery", d: "Qira'at, similar verses and your Masterclass recital.", items: ["Reciter Path levels 9–10", "Masterclass recital with certificate", "Arabic language C1", "Verified profile in the Talents community"] },
  },
  pathKicker: "Reciter Path", pathTitle: "Ten levels to the Masterclass recital", levelWord: "Level",
  pathLead: "Each level teaches a group of rules with examples from the mushaf, played by the reciter you choose, and closes with a test.",
  levels: ["Foundations: makharij, sifat, vowels", "Noon sakinah and tanween", "Meem sakinah and ghunnah", "Madd: lengthening", "Qalqalah, lam and ra", "Waqf and applied recitation", "Maqamat: the melodic modes", "Breath and long verses", "Qira'at and mutashabihat", "Longer surahs and Masterclass recital"],
  recitalT: "The Masterclass recital",
  recitalD: "Your final recital: al-Fātiḥa, Āyat al-Kursī and the opening of al-Mulk, recorded in one go as if in front of a teacher. Passing the level exam earns the Masterclass certificate of the Reciter Path.",
  arabicTitle: "Arabic: read it, then understand it",
  arabicLead: "Two courses that build on each other – so the Quran is no longer only heard, but read and understood.",
  readingT: "Reading course in 20 stages", readingD: "From the shapes of the letters to fluent reading of the mushaf, with a placement test for those who can already read.",
  cefr: [["A1", "Letters to first sentences"], ["A2", "Everyday Quran words"], ["B1", "Verb forms and roots"], ["B2", "Reading whole passages"], ["C1", "500 most frequent Quran words"]],
  tajweedT: "Tajweed", tajweedD: "Clear lessons, examples from the mushaf and short quizzes – the rules you need for a correct recitation.",
  hifzT: "Hifz cards and plans", hifzD: "Memorisation plans that grow step by step, and cards that bring each verse back at the right time.",
  gardenT: "The growing garden", gardenD: "Your tree grows with every verse you learn with the Shams Method – a quiet sign of steady effort.",
  academyTitle: "The Academy", academyLead: "Short courses with lessons, tests and certificates – for the knowledge around the Quran.",
  courses: ["Seerah", "The Prophets", "Tafsir", "Hadith", "ʿAqīdah", "Fiqh", "Akhlāq", "Duʿāʾ", "The 99 Names", "Ramadan", "Hajj and ʿUmrah", "Tajweed", "Ibrāhīm", "The Haramain"],
  certT: "Certificates, honestly", certD: "Certificates in the Masterclass confirm your learning in the app. They are not an ijazah – for an ijazah, recite to a qualified teacher.",
  talents: {
    kicker: "Quran Masterclass Talents", title: "A community of verified reciters",
    lead: "Discover reciters and teachers from around the world, follow them and connect. Profiles show the level, the rewaya and – where verified – the ijazah chain.",
    cta: "Get the app to join", ctaApp: "About the app",
    levelsTitle: "Four levels",
    levels: [["Talent", "At the beginning of the path, reciting with care."], ["Rising", "Correct recitation with growing confidence."], ["Master", "Mastery of tajweed and long passages."], ["Sheikh", "Teachers with ijazah and a verified chain."]],
    pathTitle: "The path to posting your recitation",
    steps: [["16 or older", "Viewing and following is open from 13; posting, connecting and messages from 16."], ["A reached level", "Your level on the Reciter Path, reported by the app, opens posting step by step."], ["Verification", "You apply in the app; the team checks your profile and, where given, the ijazah chain. Verified profiles carry a seal."], ["Pro, where required", "The community is free. Where posting is tied to Quran Masterclass Pro, the app tells you before you start."]],
    safetyTitle: "Built with care",
    safety: ["No contact details or links in messages", "Messages only between connected members", "Report and block on every profile and message", "Profiles of minors are protected"],
    soonTitle: "Public profiles are coming soon", soonBody: "Reciter profiles will soon be visible here on the website. Until then, the Talents community lives in the app.", soonBack: "About the Talents",
    metaTitle: "Quran Masterclass Talents – verified Quran reciters", metaDesc: "A community of verified Quran reciters and teachers: levels from Talent to Sheikh, rewaya, ijazah chain. Posting from 16 with a verified profile.",
  },
  pricing: {
    kicker: "Free and Pro", title: "Begin free. Go further with Pro.",
    lead: "The website stays free for everyone. In the app, Quran Masterclass Pro opens the whole curriculum.",
    freeT: "Free", freeNote: "On the website and in the app",
    proT: "Quran Masterclass Pro", proNote: "In the app for iPhone, iPad and Android",
    cta: "Everything in Pro", ctaApp: "Download on the App Store",
  },
  voices: {
    kicker: "Voices", title: "From the Masterclass",
    empty: "Here we will share the experiences of learners – only real ones, and only with their permission.",
    cta: "Share your experience",
  },
  page: {
    metaTitle: "The Masterclass – curriculum, school stages and Reciter Path",
    metaDesc: "Become a Quran reciter with the Shams Method: four school stages from Ibtidāʾī to ʿĀlī, the Reciter Path to the Masterclass recital, Arabic A1–C1, tajweed, hifz and Academy courses.",
    kicker: "The curriculum", title: "The Masterclass",
    lead: "One school of the Quran in four stages. You learn to read, to recite correctly, to memorise and to understand – and finish with your Masterclass recital.",
    ctaApp: "Start in the app", ctaShams: "The Shams Method",
    outroT: "Begin with one verse", outroD: "Every stage starts with the next small step. Al-Fātiḥa and Juz ʿAmma are free with the Shams Method.",
  },
  appPage: { title: "The whole Masterclass in the app", lead: "The school stages, the Reciter Path, the Arabic courses, hifz cards and your garden – all in one app with the same account as the website.", cta: "See the curriculum" },
};

const de: MC = {
  hero: {
    title: "Werde Rezitator des Korans.",
    accent: "Mit der Shams-Methode.",
    lead: "Eine vollständige Koranschule – vom ersten arabischen Buchstaben bis zu Ihrer Masterclass-Rezitation. Lesen, Tadschwid, Auswendiglernen und Bedeutung, Vers für Vers, mit einem Plan, der sich für Sie erinnert.",
    cta: "Die Masterclass entdecken", ctaFree: "Kostenlos starten",
  },
  pillarsKicker: "Die Masterclass", pillarsTitle: "Neun Säulen, ein Weg", open: "Mehr erfahren",
  pillarsLead: "Alles, was Sie brauchen, um den Koran schön zu rezitieren und zu verstehen, was Sie rezitieren – als ein zusammenhängender Lehrplan, nicht als Sammlung von Werkzeugen.",
  pillars: {
    shams: { t: "Die Shams-Methode", d: "Jeder Vers in kurzen Schritten: hören, aufbauen, Wort für Wort, Bedeutung, Tafsir, abrufen. Täglich Neues, Frisches und langfristige Wiederholung." },
    path: { t: "Der Rezitatorweg", d: "Zehn Stufen von den Makharidsch bis zu Qiraʾat und Maqamat – mit Ihrer Masterclass-Rezitation und Zertifikat als Abschluss." },
    school: { t: "Die Schulstufen", d: "Ibtidāʾī, Iʿdādī, Thānawī, ʿĀlī: vier Stufen wie an einer traditionellen islamischen Schule, jede mit klaren Zielen." },
    arabic: { t: "Arabisch lesen und verstehen", d: "Lesen ab dem ersten Buchstaben in 20 Stufen, dann das Arabisch des Korans von A1 bis C1 mit seinen 500 häufigsten Wörtern." },
    tajweed: { t: "Tadschwid", d: "Jede Regel mit Beispielen aus dem Mushaf erklärt, von großen Rezitatoren gehört und in kurzen Tests geübt." },
    hifz: { t: "Hifz-Karten", d: "Lernkarten, die genau dann wiederkommen, wenn Sie kurz vor dem Vergessen sind – damit bleibt, was Sie gelernt haben." },
    academy: { t: "Kurse der Akademie", d: "Sira, die Propheten, Tafsir, Hadith, ʿAqida, Fiqh, Achlaq und mehr – kurze Lektionen mit Tests und Zertifikaten." },
    garden: { t: "Ihr wachsender Garten", d: "Ein Baum, der mit jedem gelernten Vers wächst. Stiller, geduldiger Fortschritt, den man sieht." },
    talents: { t: "Die Talents-Gemeinschaft", d: "Verifizierte Rezitatoren und Lehrende aus aller Welt, mit Stufe, Rewaya und Idschaza-Kette." },
  },
  schoolKicker: "Die Schule", schoolTitle: "Vier Stufen wie an einer traditionellen islamischen Schule", stageWord: "Stufe",
  schoolLead: "Die Masterclass folgt der Reihenfolge, in der der Koran seit Jahrhunderten gelehrt wird: zuerst lesen, dann richtig rezitieren, dann Tiefe und Meisterschaft.",
  stages: {
    ibtidai: { name: "Ibtidāʾiyya", t: "Grundlage", d: "Buchstaben, Vokale und Ihre ersten Suren.", items: ["Arabisch-Lesekurs, erste Stufen", "al-Fātiḥa und Juz ʿAmma mit der Shams-Methode", "Rezitatorweg Stufen 1–2", "Arabisch-Sprachkurs A1"] },
    idadi: { name: "Iʿdādiyya", t: "Vorbereitung", d: "Flüssig lesen und die Kernregeln des Tadschwid.", items: ["Lesekurs abgeschlossen (20 Stufen)", "Rezitatorweg Stufen 3–5", "Tägliche Hifz-Karten", "Arabisch-Sprachkurs A2"] },
    thanawi: { name: "Thānawiyya", t: "Festigung", d: "Gut anhalten, Atem, Melodie und längere Suren.", items: ["Rezitatorweg Stufen 6–8: Waqf, Maqamat, Atem", "Längere Suren mit der Shams-Methode", "Akademie: Tafsir, Hadith, Fiqh", "Arabisch-Sprachkurs B1–B2"] },
    ali: { name: "ʿĀliya", t: "Meisterschaft", d: "Qiraʾat, ähnliche Verse und Ihre Masterclass-Rezitation.", items: ["Rezitatorweg Stufen 9–10", "Masterclass-Rezitation mit Zertifikat", "Arabisch-Sprachkurs C1", "Verifiziertes Profil in der Talents-Gemeinschaft"] },
  },
  pathKicker: "Rezitatorweg", pathTitle: "Zehn Stufen bis zur Masterclass-Rezitation", levelWord: "Stufe",
  pathLead: "Jede Stufe lehrt eine Gruppe von Regeln mit Beispielen aus dem Mushaf, gespielt von dem Rezitator Ihrer Wahl, und endet mit einem Test.",
  levels: ["Grundlagen: Makharidsch, Sifat, Vokale", "Nun sakina und Tanwin", "Mim sakina und Ghunna", "Madd: Dehnung", "Qalqala, Lam und Ra", "Waqf und angewandte Rezitation", "Maqamat: die melodischen Modi", "Atem und lange Verse", "Qiraʾat und Mutaschabihat", "Längere Suren und Masterclass-Rezitation"],
  recitalT: "Die Masterclass-Rezitation",
  recitalD: "Ihre abschließende Rezitation: al-Fātiḥa, Āyat al-Kursī und der Beginn von al-Mulk, in einem Zug aufgenommen wie vor einem Lehrer. Mit der bestandenen Stufenprüfung erhalten Sie das Masterclass-Zertifikat des Rezitatorwegs.",
  arabicTitle: "Arabisch: erst lesen, dann verstehen",
  arabicLead: "Zwei Kurse, die aufeinander aufbauen – damit der Koran nicht nur gehört, sondern gelesen und verstanden wird.",
  readingT: "Lesekurs in 20 Stufen", readingD: "Von den Formen der Buchstaben bis zum flüssigen Lesen im Mushaf, mit Einstufungstest für alle, die schon lesen können.",
  cefr: [["A1", "Buchstaben bis erste Sätze"], ["A2", "Häufige Wörter des Korans"], ["B1", "Verbformen und Wurzeln"], ["B2", "Ganze Abschnitte lesen"], ["C1", "Die 500 häufigsten Koranwörter"]],
  tajweedT: "Tadschwid", tajweedD: "Klare Lektionen, Beispiele aus dem Mushaf und kurze Quizze – die Regeln, die Sie für eine richtige Rezitation brauchen.",
  hifzT: "Hifz-Karten und Pläne", hifzD: "Lernpläne, die Schritt für Schritt wachsen, und Karten, die jeden Vers zur richtigen Zeit zurückbringen.",
  gardenT: "Der wachsende Garten", gardenD: "Ihr Baum wachsen mit jedem Vers, den Sie mit der Shams-Methode lernen – ein stilles Zeichen beständiger Mühe.",
  academyTitle: "Die Akademie", academyLead: "Kurze Kurse mit Lektionen, Tests und Zertifikaten – für das Wissen rund um den Koran.",
  courses: ["Sira", "Die Propheten", "Tafsir", "Hadith", "ʿAqida", "Fiqh", "Achlaq", "Duʿa", "Die 99 Namen", "Ramadan", "Hadsch und ʿUmra", "Tadschwid", "Ibrahim", "Die Haramain"],
  certT: "Zertifikate, ehrlich gesagt", certD: "Zertifikate der Masterclass bestätigen Ihr Lernen in der App. Sie sind keine Idschaza – dafür rezitieren Sie vor einem qualifizierten Lehrer.",
  talents: {
    kicker: "Quran Masterclass Talents", title: "Eine Gemeinschaft verifizierter Rezitatoren",
    lead: "Entdecken Sie Rezitatorinnen, Rezitatoren und Lehrende aus aller Welt, folgen Sie ihnen und vernetzen Sie sich. Profile zeigen Stufe, Rewaya und – wenn geprüft – die Idschaza-Kette.",
    cta: "Mit der App beitreten", ctaApp: "Mehr zur App",
    levelsTitle: "Vier Stufen",
    levels: [["Talent", "Am Anfang des Weges, mit Sorgfalt rezitierend."], ["Aufstrebend", "Richtige Rezitation mit wachsender Sicherheit."], ["Meister", "Beherrschung des Tadschwid und langer Abschnitte."], ["Scheich", "Lehrende mit Idschaza und geprüfter Kette."]],
    pathTitle: "Der Weg zur eigenen Rezitation im Netzwerk",
    steps: [["Ab 16 Jahren", "Ansehen und Folgen ab 13; Posten, Vernetzen und Nachrichten ab 16."], ["Eine erreichte Stufe", "Ihre Stufe auf dem Rezitatorweg, von der App gemeldet, öffnet das Posten Schritt für Schritt."], ["Verifizierung", "Sie bewerben sich in der App; das Team prüft Ihr Profil und, falls angegeben, die Idschaza-Kette. Geprüfte Profile tragen ein Siegel."], ["Pro, wo erforderlich", "Die Gemeinschaft ist kostenlos. Wo das Posten an Quran Masterclass Pro gebunden ist, sagt es Ihnen die App vorher."]],
    safetyTitle: "Mit Sorgfalt gebaut",
    safety: ["Keine Kontaktdaten oder Links in Nachrichten", "Nachrichten nur zwischen verbundenen Mitgliedern", "Melden und Blockieren auf jedem Profil und jeder Nachricht", "Profile Minderjähriger sind geschützt"],
    soonTitle: "Öffentliche Profile kommen bald", soonBody: "Rezitatorenprofile werden bald auch hier auf der Website sichtbar. Bis dahin lebt die Talents-Gemeinschaft in der App.", soonBack: "Über die Talents",
    metaTitle: "Quran Masterclass Talents – verifizierte Koranrezitatoren", metaDesc: "Eine Gemeinschaft verifizierter Koranrezitatoren und Lehrender: Stufen von Talent bis Scheich, Rewaya, Idschaza-Kette. Posten ab 16 mit verifiziertem Profil.",
  },
  pricing: {
    kicker: "Kostenlos und Pro", title: "Kostenlos beginnen. Mit Pro weitergehen.",
    lead: "Die Website bleibt für alle kostenlos. In der App öffnet Quran Masterclass Pro den ganzen Lehrplan.",
    freeT: "Kostenlos", freeNote: "Auf der Website und in der App",
    proT: "Quran Masterclass Pro", proNote: "In der App für iPhone, iPad und Android",
    cta: "Alles in Pro", ctaApp: "Im App Store laden",
  },
  voices: {
    kicker: "Stimmen", title: "Aus der Masterclass",
    empty: "Hier teilen wir die Erfahrungen von Lernenden – nur echte und nur mit ihrer Erlaubnis.",
    cta: "Ihre Erfahrung teilen",
  },
  page: {
    metaTitle: "Die Masterclass – Lehrplan, Schulstufen und Rezitatorweg",
    metaDesc: "Werde Koranrezitator mit der Shams-Methode: vier Schulstufen von Ibtidāʾī bis ʿĀlī, der Rezitatorweg bis zur Masterclass-Rezitation, Arabisch A1–C1, Tadschwid, Hifz und Kurse der Akademie.",
    kicker: "Der Lehrplan", title: "Die Masterclass",
    lead: "Eine Koranschule in vier Stufen. Sie lernen lesen, richtig rezitieren, auswendig lernen und verstehen – und schließt mit Ihrer Masterclass-Rezitation ab.",
    ctaApp: "In der App beginnen", ctaShams: "Die Shams-Methode",
    outroT: "Beginnen Sie mit einem Vers", outroD: "Jede Stufe beginnt mit dem nächsten kleinen Schritt. al-Fātiḥa und Juz ʿAmma sind mit der Shams-Methode kostenlos.",
  },
  appPage: { title: "Die ganze Masterclass in der App", lead: "Die Schulstufen, der Rezitatorweg, die Arabischkurse, Hifz-Karten und Ihr Garten – alles in einer App mit demselben Konto wie die Website.", cta: "Den Lehrplan ansehen" },
};

const ar: MC = {
  hero: {
    title: "كن قارئًا للقرآن.",
    accent: "بمنهج شمس.",
    lead: "مدرسة قرآنية متكاملة، من أول حرف عربي إلى تلاوة الماستركلاس الختامية: القراءة والتجويد والحفظ والمعنى، آيةً آية، مع خطة تتذكّر عنك.",
    cta: "اكتشف الماستركلاس", ctaFree: "ابدأ مجانًا",
  },
  pillarsKicker: "الماستركلاس", pillarsTitle: "تسع ركائز وطريق واحد", open: "اعرف المزيد",
  pillarsLead: "كل ما تحتاجه لتتلو القرآن تلاوةً حسنة وتفهم ما تتلو، في منهج واحد مترابط، لا مجموعة أدوات متفرقة.",
  pillars: {
    shams: { t: "منهج شمس", d: "كل آية في خطوات قصيرة: استماع، ثم بناء، كلمةً كلمة، فالمعنى، فالتفسير، فالاسترجاع. جديد كل يوم، ومراجعة القريب والبعيد." },
    path: { t: "طريق القارئ", d: "عشر مراحل من المخارج إلى القراءات والمقامات، تُختم بتلاوة الماستركلاس مع الشهادة." },
    school: { t: "المراحل الدراسية", d: "ابتدائي وإعدادي وثانوي وعالٍ: أربع مراحل كما في المدرسة الإسلامية التقليدية، ولكل مرحلة أهداف واضحة." },
    arabic: { t: "قراءة العربية وفهمها", d: "القراءة من أول حرف في ٢٠ مرحلة، ثم فهم عربية القرآن من A1 إلى C1 بأكثر ٥٠٠ كلمة ورودًا فيه." },
    tajweed: { t: "التجويد", d: "كل حكم مشروح بأمثلة من المصحف، مسموع من كبار القرّاء، ومُتدرَّب عليه في اختبارات قصيرة." },
    hifz: { t: "بطاقات الحفظ", d: "بطاقات تعود إليك حين توشك أن تنسى، ليبقى ما حفظته." },
    academy: { t: "دورات الأكاديمية", d: "السيرة والأنبياء والتفسير والحديث والعقيدة والفقه والأخلاق وغيرها: دروس قصيرة مع اختبارات وشهادات." },
    garden: { t: "حديقتك التي تنمو", d: "شجرة تنمو مع كل آية تتعلّمها. تقدّم هادئ صبور تراه بعينك." },
    talents: { t: "مجتمع المواهب", d: "قرّاء ومعلّمون موثَّقون من أنحاء العالم، مع المستوى والرواية وسند الإجازة." },
  },
  schoolKicker: "المدرسة", schoolTitle: "أربع مراحل كما في المدرسة الإسلامية التقليدية", stageWord: "المرحلة",
  schoolLead: "تتبع الماستركلاس الترتيب الذي عُلِّم به القرآن قرونًا: القراءة أولًا، ثم التلاوة الصحيحة، ثم العمق والإتقان.",
  stages: {
    ibtidai: { name: "ابتدائية", t: "التأسيس", d: "الحروف والحركات وسورك الأولى.", items: ["دورة قراءة العربية، المراحل الأولى", "الفاتحة وجزء عمّ بمنهج شمس", "طريق القارئ، المرحلتان ١–٢", "اللغة العربية A1"] },
    idadi: { name: "إعدادية", t: "الإعداد", d: "القراءة بطلاقة وأصول أحكام التجويد.", items: ["إتمام دورة القراءة (٢٠ مرحلة)", "طريق القارئ، المراحل ٣–٥", "بطاقات الحفظ يوميًا", "اللغة العربية A2"] },
    thanawi: { name: "ثانوية", t: "التثبيت", d: "الوقف الحسن والنفَس واللحن والسور الأطول.", items: ["طريق القارئ، المراحل ٦–٨: الوقف والمقامات والنفَس", "سور أطول بمنهج شمس", "الأكاديمية: التفسير والحديث والفقه", "اللغة العربية B1–B2"] },
    ali: { name: "عالية", t: "الإتقان", d: "القراءات والمتشابهات وتلاوة الماستركلاس.", items: ["طريق القارئ، المرحلتان ٩–١٠", "تلاوة الماستركلاس مع الشهادة", "اللغة العربية C1", "ملف موثَّق في مجتمع المواهب"] },
  },
  pathKicker: "طريق القارئ", pathTitle: "عشر مراحل حتى تلاوة الماستركلاس", levelWord: "المرحلة",
  pathLead: "كل مرحلة تعلّم مجموعة من الأحكام بأمثلة من المصحف، بصوت القارئ الذي تختاره، وتُختم باختبار.",
  levels: ["الأساس: المخارج والصفات والحركات", "النون الساكنة والتنوين", "الميم الساكنة والغنّة", "المدّ", "القلقلة واللام والراء", "الوقف والتلاوة التطبيقية", "المقامات: الأنماط اللحنية", "النفَس والآيات الطويلة", "القراءات والمتشابهات", "سور أطول وتلاوة الماستركلاس"],
  recitalT: "تلاوة الماستركلاس",
  recitalD: "تلاوتك الختامية: الفاتحة وآية الكرسي ومطلع سورة الملك، تسجّلها دفعةً واحدة كأنك بين يدي معلّم. وبالنجاح في اختبار المرحلة تنال شهادة الماستركلاس لطريق القارئ.",
  arabicTitle: "العربية: اقرأها ثم افهمها",
  arabicLead: "دورتان يبني بعضهما على بعض، ليصير القرآن مقروءًا مفهومًا لا مسموعًا فحسب.",
  readingT: "دورة القراءة في ٢٠ مرحلة", readingD: "من أشكال الحروف إلى القراءة المتصلة من المصحف، مع اختبار تحديد المستوى لمن يقرأ من قبل.",
  cefr: [["A1", "من الحروف إلى الجمل الأولى"], ["A2", "كلمات القرآن الشائعة"], ["B1", "أوزان الأفعال والجذور"], ["B2", "قراءة مقاطع كاملة"], ["C1", "أكثر ٥٠٠ كلمة ورودًا في القرآن"]],
  tajweedT: "التجويد", tajweedD: "دروس واضحة وأمثلة من المصحف واختبارات قصيرة: الأحكام التي تحتاجها لتلاوة صحيحة.",
  hifzT: "بطاقات الحفظ وخططه", hifzD: "خطط حفظ تنمو خطوةً خطوة، وبطاقات تعيد كل آية في وقتها.",
  gardenT: "الحديقة التي تنمو", gardenD: "تنمو شجرتك مع كل آية تتعلّمها بمنهج شمس، علامةً هادئة على جهد دائم.",
  academyTitle: "الأكاديمية", academyLead: "دورات قصيرة بدروس واختبارات وشهادات، للعلوم المحيطة بالقرآن.",
  courses: ["السيرة", "الأنبياء", "التفسير", "الحديث", "العقيدة", "الفقه", "الأخلاق", "الدعاء", "الأسماء الحسنى", "رمضان", "الحج والعمرة", "التجويد", "إبراهيم", "الحرمان"],
  certT: "شهادات بصدق", certD: "شهادات الماستركلاس تُثبت تعلّمك في التطبيق، وليست إجازة؛ فالإجازة تُنال بالقراءة على معلّم مجاز.",
  talents: {
    kicker: "Quran Masterclass Talents", title: "مجتمع من القرّاء الموثَّقين",
    lead: "اكتشف قارئات وقرّاء ومعلّمين من أنحاء العالم، وتابعهم وتواصل معهم. تُظهر الملفات المستوى والرواية، وسند الإجازة إن وُثِّق.",
    cta: "انضمّ عبر التطبيق", ctaApp: "عن التطبيق",
    levelsTitle: "أربعة مستويات",
    levels: [["موهبة", "في أول الطريق، يتلو بعناية."], ["صاعد", "تلاوة صحيحة وثقة تزداد."], ["متقن", "إتقان التجويد والمقاطع الطويلة."], ["شيخ", "معلّمون مجازون بسند موثَّق."]],
    pathTitle: "الطريق إلى نشر تلاوتك",
    steps: [["من سن ١٦", "المشاهدة والمتابعة من ١٣ عامًا، والنشر والتواصل والرسائل من ١٦."], ["مستوى مُحقَّق", "مستواك في طريق القارئ، كما يسجّله التطبيق، يفتح لك النشر خطوةً خطوة."], ["التوثيق", "تقدّم طلبك في التطبيق، ويراجع الفريق ملفك وسند الإجازة إن ذُكر، وتحمل الملفات الموثَّقة ختمًا."], ["Pro عند الحاجة", "المجتمع مجاني، وإن رُبط النشر باشتراك Quran Masterclass Pro أخبرك التطبيق بذلك قبل أن تبدأ."]],
    safetyTitle: "مبنيّ بعناية",
    safety: ["لا بيانات اتصال ولا روابط في الرسائل", "الرسائل بين الأعضاء المتواصلين فقط", "الإبلاغ والحظر في كل ملف ورسالة", "ملفات القاصرين محمية"],
    soonTitle: "الملفات العامة قريبًا", soonBody: "ستظهر ملفات القرّاء قريبًا هنا على الموقع، وحتى ذلك الحين يعيش مجتمع المواهب في التطبيق.", soonBack: "عن المواهب",
    metaTitle: "Quran Masterclass Talents – قرّاء قرآن موثَّقون", metaDesc: "مجتمع من قرّاء القرآن ومعلّميه الموثَّقين: مستويات من موهبة إلى شيخ، والرواية وسند الإجازة. النشر من سن ١٦ بملف موثَّق.",
  },
  pricing: {
    kicker: "مجاني وPro", title: "ابدأ مجانًا، وامضِ أبعد مع Pro.",
    lead: "يبقى الموقع مجانيًا للجميع، وفي التطبيق يفتح Quran Masterclass Pro المنهج كاملًا.",
    freeT: "مجاني", freeNote: "على الموقع وفي التطبيق",
    proT: "Quran Masterclass Pro", proNote: "في التطبيق لآيفون وآيباد وأندرويد",
    cta: "كل ما في Pro", ctaApp: "حمّله من App Store",
  },
  voices: {
    kicker: "أصوات", title: "من الماستركلاس",
    empty: "سنشارك هنا تجارب المتعلّمين، الحقيقية منها فقط وبإذن أصحابها.",
    cta: "شارك تجربتك",
  },
  page: {
    metaTitle: "الماستركلاس – المنهج والمراحل الدراسية وطريق القارئ",
    metaDesc: "كن قارئًا للقرآن بمنهج شمس: أربع مراحل دراسية من الابتدائي إلى العالي، وطريق القارئ حتى تلاوة الماستركلاس، والعربية A1–C1، والتجويد والحفظ ودورات الأكاديمية.",
    kicker: "المنهج", title: "الماستركلاس",
    lead: "مدرسة قرآنية في أربع مراحل: تتعلّم القراءة والتلاوة الصحيحة والحفظ والفهم، وتختم بتلاوة الماستركلاس.",
    ctaApp: "ابدأ في التطبيق", ctaShams: "منهج شمس",
    outroT: "ابدأ بآية واحدة", outroD: "كل مرحلة تبدأ بالخطوة الصغيرة التالية. الفاتحة وجزء عمّ مجانيان بمنهج شمس.",
  },
  appPage: { title: "الماستركلاس كاملةً في التطبيق", lead: "المراحل الدراسية وطريق القارئ ودورتا العربية وبطاقات الحفظ وحديقتك، كلها في تطبيق واحد بالحساب نفسه الذي تستخدمه على الموقع.", cta: "اطّلع على المنهج" },
};

export const mc = (locale: string): MC => (locale === "de" ? de : locale === "ar" ? ar : en);

// order and Arabic calligraphy of the pillars, with the page on the website that explains each one
export const PILLARS: { k: PillarKey; ar: string; href: string }[] = [
  { k: "shams", ar: "شمس", href: "/shams" },
  { k: "path", ar: "قارئ", href: "/masterclass#reciter-path" },
  { k: "school", ar: "مدرسة", href: "/masterclass#school" },
  { k: "arabic", ar: "عربية", href: "/arabic" },
  { k: "tajweed", ar: "تجويد", href: "/tajweed" },
  { k: "hifz", ar: "حفظ", href: "/plan" },
  { k: "academy", ar: "أكاديمية", href: "/academy" },
  { k: "garden", ar: "حديقة", href: "/app" },
  { k: "talents", ar: "مواهب", href: "/talents" },
];
export const STAGES: { k: StageKey; ar: string }[] = [
  { k: "ibtidai", ar: "ابتدائية" }, { k: "idadi", ar: "إعدادية" }, { k: "thanawi", ar: "ثانوية" }, { k: "ali", ar: "عالية" },
];

/** real, approved testimonials only (with the learner's permission). Empty until there are some. */
export const TESTIMONIALS: Testimonial[] = [];

/** schema.org Course entries for the main courses (provider = the organisation in organizationLd) */
export function courseLd(locale: string, abs: (p: string) => string) {
  const c = mc(locale);
  const provider = { "@id": abs("/#org") };
  const course = (id: string, name: string, description: string, path: string) => ({
    "@type": "Course", "@id": abs(`/${locale}/masterclass#${id}`), name, description, url: abs(`/${locale}${path}`), inLanguage: locale, provider,
    isAccessibleForFree: id === "shams" || id === "tajweed",
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: "PT15M" },
  });
  return [
    course("shams", c.pillars.shams.t, c.pillars.shams.d, "/shams"),
    course("reciter-path", c.pillars.path.t, `${c.pathLead} ${c.recitalD}`, "/masterclass"),
    course("arabic-reading", c.readingT, c.readingD, "/arabic"),
    course("arabic-language", c.pillars.arabic.t, c.pillars.arabic.d, "/masterclass"),
    course("tajweed", c.pillars.tajweed.t, c.pillars.tajweed.d, "/tajweed"),
    course("academy", c.pillars.academy.t, c.pillars.academy.d, "/academy"),
  ];
}

/** schema.org MobileApplication for the iOS app */
export function mobileAppLd(locale: string, abs: (p: string) => string, storeUrl: string, description: string) {
  return {
    "@type": "MobileApplication", "@id": abs("/#ios-app"), name: "Quran Masterclass", operatingSystem: "iOS", applicationCategory: "EducationalApplication",
    description, inLanguage: locale, url: abs(`/${locale}/app`), downloadUrl: storeUrl, installUrl: storeUrl, publisher: { "@id": abs("/#org") },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };
}
