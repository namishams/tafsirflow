// Dua generator: for each concern the fitting Quran duas (verse keys), Sunnah duas (ids from sunnahDuas) and
// beautiful names of Allah. The personal dua follows the etiquette taught in the hadith of Fadalah ibn Ubayd
// (Jami' at-Tirmidhi 3477, Sunan Abi Dawud 1481): praise Allah, send blessings on the Prophet ﷺ, then ask.
export const TOPICS = ["worry", "illness", "knowledge", "forgiveness", "parents", "children", "marriage", "provision", "guidance", "travel", "protection", "gratitude", "deceased", "heart"] as const;
export type Topic = (typeof TOPICS)[number];

export type Name = { id: string; ar: string; voc: string };
// vocative form ("ya ...") is what is said in the dua
export const NAMES: Record<string, Name> = {
  latif: { id: "latif", ar: "اللَّطِيفُ", voc: "يَا لَطِيفُ" },
  salam: { id: "salam", ar: "السَّلَامُ", voc: "يَا سَلَامُ" },
  wakil: { id: "wakil", ar: "الْوَكِيلُ", voc: "يَا وَكِيلُ" },
  shafi: { id: "shafi", ar: "الشَّافِي", voc: "يَا شَافِي" },
  rahman: { id: "rahman", ar: "الرَّحْمَٰنُ", voc: "يَا رَحْمَٰنُ" },
  rahim: { id: "rahim", ar: "الرَّحِيمُ", voc: "يَا رَحِيمُ" },
  alim: { id: "alim", ar: "الْعَلِيمُ", voc: "يَا عَلِيمُ" },
  fattah: { id: "fattah", ar: "الْفَتَّاحُ", voc: "يَا فَتَّاحُ" },
  hakim: { id: "hakim", ar: "الْحَكِيمُ", voc: "يَا حَكِيمُ" },
  ghafur: { id: "ghafur", ar: "الْغَفُورُ", voc: "يَا غَفُورُ" },
  tawwab: { id: "tawwab", ar: "التَّوَّابُ", voc: "يَا تَوَّابُ" },
  afuww: { id: "afuww", ar: "الْعَفُوُّ", voc: "يَا عَفُوُّ" },
  barr: { id: "barr", ar: "الْبَرُّ", voc: "يَا بَرُّ" },
  wahhab: { id: "wahhab", ar: "الْوَهَّابُ", voc: "يَا وَهَّابُ" },
  hafiz: { id: "hafiz", ar: "الْحَفِيظُ", voc: "يَا حَفِيظُ" },
  wadud: { id: "wadud", ar: "الْوَدُودُ", voc: "يَا وَدُودُ" },
  razzaq: { id: "razzaq", ar: "الرَّزَّاقُ", voc: "يَا رَزَّاقُ" },
  karim: { id: "karim", ar: "الْكَرِيمُ", voc: "يَا كَرِيمُ" },
  hadi: { id: "hadi", ar: "الْهَادِي", voc: "يَا هَادِي" },
  shakur: { id: "shakur", ar: "الشَّكُورُ", voc: "يَا شَكُورُ" },
  hamid: { id: "hamid", ar: "الْحَمِيدُ", voc: "يَا حَمِيدُ" },
};

export const PLAN: Record<Topic, { names: string[]; quran: string[]; sunnah: string[] }> = {
  worry: { names: ["latif", "salam", "wakil"], quran: ["21:87", "2:286", "3:8"], sunnah: ["hamm-hazan", "karb", "la-hawla", "fear-people"] },
  illness: { names: ["shafi", "rahman", "latif"], quran: ["21:83", "2:201"], sunnah: ["ruqya-adhhib-al-bas", "pain", "asalullah-al-azim", "sick-visit"] },
  knowledge: { names: ["alim", "fattah", "hakim"], quran: ["20:114", "20:25", "20:26", "20:27", "20:28"], sunnah: ["nafani", "ilman-nafia", "huda-tuqa"] },
  forgiveness: { names: ["ghafur", "tawwab", "afuww"], quran: ["7:23", "3:16", "3:147", "28:16", "66:8"], sunnah: ["sayyid-istighfar", "afuwwun", "astaghfirullah-al-hayy", "khatiati-wa-jahli"] },
  parents: { names: ["rahim", "rahman", "barr"], quran: ["17:24", "14:41", "71:28", "46:15"], sunnah: ["afiyah-dunya-akhirah"] },
  children: { names: ["wahhab", "hafiz", "latif"], quran: ["25:74", "3:38", "14:40", "46:15"], sunnah: ["protect-children"] },
  marriage: { names: ["wadud", "rahman", "wahhab"], quran: ["25:74", "2:201"], sunnah: ["newlywed"] },
  provision: { names: ["razzaq", "karim", "wahhab"], quran: ["28:24", "2:201"], sunnah: ["ilman-nafia", "ikfini-bihalalik", "afiyah-dunya-akhirah"] },
  guidance: { names: ["hadi", "alim", "hakim"], quran: ["1:6", "3:8", "18:10", "17:80"], sunnah: ["istikhara", "muqallib", "huda-tuqa", "laka-aslamtu"] },
  travel: { names: ["hafiz", "wakil", "salam"], quran: ["17:80"], sunnah: ["travel", "travel-return", "farewell-traveller", "leave-home"] },
  protection: { names: ["hafiz", "salam", "latif"], quran: ["23:97", "23:98", "2:201"], sunnah: ["bismillah-la-yadurr", "kalimat-tammat", "afiyah-dunya-akhirah", "zawal-nimatik"] },
  gratitude: { names: ["shakur", "hamid", "karim"], quran: ["27:19", "46:15"], sunnah: ["aini-ala-dhikrik", "raditu", "after-eating-kathiran"] },
  deceased: { names: ["ghafur", "rahim", "rahman"], quran: ["59:10", "71:28", "14:41"], sunnah: ["janazah-ighfir-lahu", "visiting-graves", "condolence"] },
  heart: { names: ["latif", "hadi", "salam"], quran: ["3:8", "20:25", "59:10"], sunnah: ["muqallib", "musarrif-al-qulub", "ati-nafsi-taqwaha", "aslih-li-dini"] },
};

// a few words per language that point to a concern when someone types freely (specific concerns first, worry and heart last)
const KEYS: [Topic, RegExp][] = [
  ["illness", /krank|heil|schmerz|operation|ill|sick|heal|pain|surgery|مرض|شفاء|ألم|hasta|şifa|بیمار|شفا|malad|guéri|enferm|sakit|sembuh|болез|исцел|生病|疾病|康复/i],
  ["knowledge", /prüfung|examen|klausur|studium|schule|lernen|exam|test|study|school|university|امتحان|اختبار|دراسة|علم|sınav|ders|امتحان|examen|étud|estudi|ujian|belajar|экзамен|учеб|考试|学习/i],
  ["forgiveness", /vergeb|sünde|reue|forgiv|sin|repent|توبة|ذنب|مغفرة|استغفار|tövbe|günah|گناه|توبه|pardon|péché|perdón|pecado|ampun|dosa|прощ|грех|宽恕|罪/i],
  ["parents", /eltern|mutter|vater|mama|papa|parent|mother|father|mom|dad|والد|أمي|أبي|anne|baba|مادر|پدر|parents|mère|père|padres|madre|padre|orang tua|ibu|ayah|родител|мать|отец|父母|妈妈|爸爸/i],
  ["children", /kind|kinder|baby|sohn|tochter|schwanger|child|kids|son|daughter|pregnan|ولد|أولاد|ذرية|حمل|çocuk|bebek|فرزند|enfant|bébé|hijo|niño|anak|bayi|ребен|дети|孩子|子女/i],
  ["marriage", /ehe|heirat|ehepartner|frau|mann|hochzeit|marri|spouse|wife|husband|wedding|زواج|زوج|زوجة|evlilik|eş|ازدواج|mariage|époux|matrimonio|nikah|jodoh|брак|жена|муж|婚/i],
  ["provision", /arbeit|job|geld|schulden|rizq|versorgung|beruf|work|money|debt|business|provision|رزق|عمل|دين|مال|iş|rızık|borç|روزی|کار|travail|argent|dette|trabajo|dinero|deuda|rezeki|kerja|hutang|работ|деньг|долг|工作|钱|债/i],
  ["guidance", /entscheid|istikhara|weg|rechtleit|decision|choose|guidance|استخارة|هداية|قرار|karar|hidayet|تصمیم|هدایت|décision|guidance|decisión|petunjuk|keputusan|решен|путь|决定|指引/i],
  ["travel", /reise|flug|unterwegs|travel|journey|flight|trip|سفر|رحلة|yolculuk|seyahat|voyage|viaje|perjalanan|путешеств|поездк|旅行/i],
  ["protection", /schutz|beschütz|böse|neid|protect|safety|evil eye|harm|حفظ|حماية|عين|حسد|koru|nazar|محافظت|protection|protección|perlindungan|защит|保护/i],
  ["gratitude", /dank|segen|alhamdulillah|grateful|thank|blessing|شكر|حمد|نعمة|şükür|شکر|gratitude|merci|gratitud|syukur|благодар|感谢/i],
  ["deceased", /verstorb|tod|beerdig|grab|died|death|passed away|funeral|grave|ميت|وفاة|قبر|رحمه|vefat|ölüm|درگذشت|décéd|mort|fallec|muerte|meninggal|умер|смерт|去世|亡/i],
  ["worry", /sorge|angst|stress|kummer|traurig|depress|anxi|worr|fear|sad|grief|هم|حزن|قلق|خوف|ضيق|kaygı|endişe|غم|پریشان|tristesse|peur|ansiedad|miedo|cemas|takut|тревог|страх|грус|焦虑|担心|害怕/i],
  ["heart", /herz|glaube|iman|standhaft|heart|faith|iman|steadfast|قلب|إيمان|ثبات|kalp|iman|دل|ایمان|cœur|foi|corazón|fe|hati|iman|сердц|вера|心|信仰/i],
];
export const guessTopic = (text: string): Topic | null => KEYS.find(([, re]) => re.test(text))?.[0] ?? null;

export const WHO = ["me", "mother", "father", "parents", "child", "loved", "ummah"] as const;
export type Who = (typeof WHO)[number];

// fixed Arabic frame of the personal dua (Quran 1:2 and 2:201, the blessing from the salat ibrahimiyya)
export const FRAME = {
  praise: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
  salawat: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
  close: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
  end: "وَصَلَّى اللَّهُ عَلَى نَبِيِّنَا مُحَمَّدٍ، آمِين",
};
