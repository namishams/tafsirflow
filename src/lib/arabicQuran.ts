// Words and verses for units 7 ("Listen and read") and 8 ("Reading whole verses") of the Arabic course.
// Script: Uthmani, exactly as `text_uthmani` on Quran.com (incl. the tatweel that carries the small alif).
// Word positions follow Quran.com's word-by-word data: only words are counted (1-based), never the verse-end sign –
// so `ref: "1:2:1"` is the first word of verse 2 of surah 1 and maps straight to audio.qurancdn.com/wbw/001_002_001.mp3.
import type { Item, L2 } from "./arabic";

export type Verse = {
  s: number; a: number;
  words: Item[];
  meaning: L2;
  // long verses (more than ~8 words) are split for the "put the words in order" exercise: `to` = last word (1-based) of a part
  parts?: { to: number; meaning: L2 }[];
};

const L = (de: string, en: string, ar: string): L2 => ({ de, en, ar });
// word: [arabic, transliteration, de, en, ar]
type W = [string, string, string, string, string];
const V = (s: number, a: number, ws: W[], meaning: L2, parts?: Verse["parts"]): Verse => ({
  s, a, meaning, parts,
  words: ws.map(([ar, tr, de, en, ara], i) => ({ ar, tr, meaning: L(de, en, ara), ref: `${s}:${a}:${i + 1}` })),
});

// words that come back in several verses – one wording everywhere
const RAHMAN: W = ["ٱلرَّحْمَـٰنِ", "ar-raḥmāni", "des Allerbarmers", "the Most Gracious", "ذو الرحمة الواسعة"];
const RAHIM: W = ["ٱلرَّحِيمِ", "ar-raḥīmi", "des Barmherzigen", "the Most Merciful", "كثير الرحمة بعباده"];
const ALLAHU: W = ["ٱللَّهُ", "Allāhu", "Allah", "Allah", "اسم الجلالة"];
const AHAD: W = ["أَحَدٌ", "aḥadun", "der Eine", "One", "الواحد الذي لا شريك له"];
const HUWA: W = ["هُوَ", "huwa", "er", "he", "ضميرٌ للمفرد الغائب"];
const QUL: W = ["قُلْ", "qul", "sag", "say", "تكلَّم وأخبِر"];
const AUDHU: W = ["أَعُوذُ", "aʿūdhu", "ich suche Zuflucht", "I seek refuge", "ألتجئ وأحتمي"];
const BIRABBI: W = ["بِرَبِّ", "birabbi", "beim Herrn", "in the Lord", "بالربّ"];
const NAS: W = ["ٱلنَّاسِ", "an-nāsi", "der Menschen", "of mankind", "البشر"];
const MIN: W = ["مِن", "min", "vor", "from", "من"];
const WAMIN: W = ["وَمِن", "wa-min", "und vor", "and from", "ومن"];
const SHARRI: W = ["شَرِّ", "sharri", "dem Übel", "the evil", "الأذى والسوء"];
const IDHA: W = ["إِذَا", "idhā", "wenn", "when", "ظرفٌ للزمان"];
const FI: W = ["فِى", "fī", "in", "in", "حرف جرّ"];
const INNA: W = ["إِنَّ", "inna", "wahrlich", "indeed", "حرف توكيد"];
const ALLADHINA: W = ["ٱلَّذِينَ", "alladhīna", "diejenigen, die", "those who", "اسم موصول للجمع"];
const ALAYHIM: W = ["عَلَيْهِمْ", "ʿalayhim", "ihnen", "upon them", "على أولئك"];
const WALAM: W = ["وَلَمْ", "wa-lam", "und nicht", "and not", "عطفٌ ونفي"];
const TAWASAW: W = ["وَتَوَاصَوْا۟", "wa-tawāṣaw", "und sie ermahnten einander", "and advised each other", "وأوصى بعضهم بعضًا"];

export const VERSES: Verse[] = [
  // ---- Al-Fatiha (1) ----
  V(1, 1, [["بِسْمِ", "bismi", "im Namen", "in the name", "مستعينًا باسم"], ["ٱللَّهِ", "Allāhi", "Allahs", "of Allah", "اسم الجلالة"], RAHMAN, RAHIM],
    L("Im Namen Allahs, des Allerbarmers, des Barmherzigen.", "In the name of Allah, the Most Gracious, the Most Merciful.", "أبتدئ قراءتي مستعينًا باسم الله، ذي الرحمة الواسعة، كثير الرحمة بعباده.")),
  V(1, 2, [["ٱلْحَمْدُ", "al-ḥamdu", "das Lob", "all praise", "الثناء الكامل"], ["لِلَّهِ", "lillāhi", "gehört Allah", "belongs to Allah", "مستحَقٌّ لله وحده"], ["رَبِّ", "rabbi", "dem Herrn", "Lord", "المالك المربّي"], ["ٱلْعَـٰلَمِينَ", "al-ʿālamīna", "der Welten", "of the worlds", "جميع الخلائق"]],
    L("Alles Lob gebührt Allah, dem Herrn der Welten,", "All praise is due to Allah, Lord of the worlds –", "الثناء الكامل لله وحده، مالك جميع الخلائق ومربّيها.")),
  V(1, 3, [RAHMAN, RAHIM],
    L("dem Allerbarmer, dem Barmherzigen,", "The Most Gracious, the Most Merciful,", "ذو الرحمة الواسعة، كثير الرحمة بعباده.")),
  V(1, 4, [["مَـٰلِكِ", "māliki", "dem Herrscher", "Master", "المالك المتصرِّف"], ["يَوْمِ", "yawmi", "des Tages", "of the Day", "اليوم"], ["ٱلدِّينِ", "ad-dīni", "des Gerichts", "of Judgement", "الجزاء والحساب"]],
    L("dem Herrscher am Tage des Gerichts.", "Sovereign of the Day of Recompense.", "مالك يوم الجزاء والحساب.")),
  V(1, 5, [["إِيَّاكَ", "iyyāka", "dir (allein)", "You (alone)", "لك وحدك"], ["نَعْبُدُ", "naʿbudu", "dienen wir", "we worship", "نخضع ونطيع"], ["وَإِيَّاكَ", "wa iyyāka", "und dich (allein)", "and You (alone)", "ومنك وحدك"], ["نَسْتَعِينُ", "nastaʿīnu", "bitten wir um Hilfe", "we ask for help", "نطلب العون"]],
    L("Dir (allein) dienen wir, und Dich (allein) bitten wir um Hilfe.", "It is You we worship and You we ask for help.", "نخصّك وحدك بالعبادة، ونخصّك وحدك بطلب العون.")),
  V(1, 6, [["ٱهْدِنَا", "ihdinā", "leite uns", "guide us", "دُلَّنا ووفِّقنا"], ["ٱلصِّرَٰطَ", "aṣ-ṣirāṭa", "den Weg", "the path", "الطريق"], ["ٱلْمُسْتَقِيمَ", "al-mustaqīma", "den geraden", "the straight", "الذي لا عِوَج فيه"]],
    L("Leite uns den geraden Weg,", "Guide us to the straight path –", "دُلَّنا ووفِّقنا إلى الطريق المستقيم.")),
  V(1, 7, [["صِرَٰطَ", "ṣirāṭa", "Weg (von)", "path (of)", "طريقَ"], ALLADHINA, ["أَنْعَمْتَ", "anʿamta", "du hast Gnade erwiesen", "You have blessed", "تفضَّلتَ وأحسنتَ"], ALAYHIM, ["غَيْرِ", "ghayri", "nicht (derer)", "not (those)", "لا (أولئك)"], ["ٱلْمَغْضُوبِ", "al-maghḍūbi", "derer, die Zorn erregt haben", "of those who earned anger", "الذين غضب الله عليهم"], ALAYHIM, ["وَلَا", "wa-lā", "und nicht", "and not", "ولا"], ["ٱلضَّآلِّينَ", "aḍ-ḍāllīna", "der Irregehenden", "of those who go astray", "التائهين عن الحق"]],
    L("den Weg derjenigen, denen Du Gunst erwiesen hast, nicht derjenigen, die (Deinen) Zorn erregt haben, und nicht der Irregehenden.", "The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray.", "طريق الذين أنعمتَ عليهم، لا طريق المغضوب عليهم ولا الضالّين."),
    [{ to: 4, meaning: L("den Weg derjenigen, denen Du Gunst erwiesen hast,", "The path of those upon whom You have bestowed favor,", "طريق الذين أنعمتَ عليهم،") }, { to: 9, meaning: L("nicht derjenigen, die (Deinen) Zorn erregt haben, und nicht der Irregehenden.", "Not of those who have earned [Your] anger or of those who are astray.", "لا طريق المغضوب عليهم ولا الضالّين.") }]),

  // ---- Al-Ikhlas (112) ----
  V(112, 1, [QUL, HUWA, ALLAHU, AHAD],
    L("Sag: Er ist Allah, ein Einziger,", "Say, “He is Allah, [who is] One,", "قل: هو الله الواحد الذي لا شريك له.")),
  V(112, 2, [ALLAHU, ["ٱلصَّمَدُ", "aṣ-ṣamadu", "der Unabhängige, auf den alle angewiesen sind", "the Eternal Refuge", "السيِّد الذي تقصده الخلائق في حوائجها"]],
    L("Allah, der Absolute, auf den alle angewiesen sind.", "Allah, the Eternal Refuge.", "الله الذي تقصده الخلائق كلها في حاجاتها.")),
  V(112, 3, [["لَمْ", "lam", "nicht", "not", "حرف نفي"], ["يَلِدْ", "yalid", "er zeugt", "He begets", "يُنجب ولدًا"], WALAM, ["يُولَدْ", "yūlad", "er wurde gezeugt", "He was born", "وُلِد من أحد"]],
    L("Er hat nicht gezeugt, und Er wurde nicht gezeugt,", "He neither begets nor is born,", "ليس له ولدٌ، وليس له والدٌ.")),
  V(112, 4, [WALAM, ["يَكُن", "yakun", "ist", "is", "يوجد"], ["لَّهُۥ", "lahū", "Ihm", "to Him", "له سبحانه"], ["كُفُوًا", "kufuwan", "ebenbürtig", "equivalent", "مثيلًا ونظيرًا"], ["أَحَدٌۢ", "aḥadun", "irgendeiner", "anyone", "أحدٌ من الخلق"]],
    L("und niemand ist Ihm ebenbürtig.", "Nor is there to Him any equivalent.", "ولم يكن له أحدٌ مثلًا ولا نظيرًا.")),

  // ---- Al-Kawthar (108) ----
  V(108, 1, [["إِنَّآ", "innā", "wahrlich, Wir", "indeed, We", "حرف توكيد + «نحن»"], ["أَعْطَيْنَـٰكَ", "aʿṭaynāka", "haben dir gegeben", "We have given you", "منحناك وأكرمناك"], ["ٱلْكَوْثَرَ", "al-kawthara", "die Fülle des Guten (al-Kauthar)", "abundant good (al-Kawthar)", "الخير الكثير"]],
    L("Wahrlich, Wir haben dir al-Kauthar gegeben.", "Indeed, We have granted you al-Kawthar.", "إنا أعطيناك الخير الكثير، ومنه نهر الكوثر في الجنة.")),
  V(108, 2, [["فَصَلِّ", "fa-ṣalli", "so bete", "so pray", "فأدِّ الصلاة"], ["لِرَبِّكَ", "li-rabbika", "für deinen Herrn", "for your Lord", "لربّك وحده"], ["وَٱنْحَرْ", "wa-nḥar", "und opfere", "and sacrifice", "واذبح الأضحية"]],
    L("So bete zu deinem Herrn und opfere.", "So pray to your Lord and sacrifice [to Him alone].", "فأدِّ الصلاة خالصةً لربك، وانحر الذبيحة له وحده.")),
  V(108, 3, [INNA, ["شَانِئَكَ", "shāniʾaka", "dein Hasser", "your enemy", "مبغضك"], HUWA, ["ٱلْأَبْتَرُ", "al-abtaru", "der Abgeschnittene", "the one cut off", "المنقطع من كل خير"]],
    L("Wahrlich, dein Hasser ist es, der abgeschnitten ist.", "Indeed, your enemy is the one cut off.", "إن مبغضك هو المنقطع عن كل خير.")),

  // ---- Al-Falaq (113) ----
  V(113, 1, [QUL, AUDHU, BIRABBI, ["ٱلْفَلَقِ", "al-falaqi", "des Morgengrauens", "of daybreak", "الصبح"]],
    L("Sag: Ich suche Zuflucht beim Herrn des Tagesanbruchs", "Say, “I seek refuge in the Lord of daybreak", "قل: ألتجئ وأعتصم برب الصبح،")),
  V(113, 2, [MIN, SHARRI, ["مَا", "mā", "was", "what", "الذي"], ["خَلَقَ", "khalaqa", "er erschaffen hat", "He created", "أوجَد"]],
    L("vor dem Übel dessen, was Er erschaffen hat,", "From the evil of that which He created", "من شر جميع المخلوقات،")),
  V(113, 3, [WAMIN, SHARRI, ["غَاسِقٍ", "ghāsiqin", "der Dunkelheit", "darkness", "الليل المظلم"], IDHA, ["وَقَبَ", "waqaba", "sie einbricht", "it settles", "دخل ظلامه"]],
    L("und vor dem Übel der Dunkelheit, wenn sie einbricht,", "And from the evil of darkness when it settles", "ومن شر الليل إذا أظلم،")),
  V(113, 4, [WAMIN, SHARRI, ["ٱلنَّفَّـٰثَـٰتِ", "an-naffāthāti", "der Blasenden", "the blowers", "اللاتي ينفثن"], FI, ["ٱلْعُقَدِ", "al-ʿuqadi", "die Knoten", "the knots", "العُقَد"]],
    L("und vor dem Übel der (Zauberinnen), die in die Knoten blasen,", "And from the evil of the blowers in knots", "ومن شر السواحر اللاتي ينفثن في العقد،")),
  V(113, 5, [WAMIN, SHARRI, ["حَاسِدٍ", "ḥāsidin", "eines Neiders", "an envier", "حاسد"], IDHA, ["حَسَدَ", "ḥasada", "er neidet", "he envies", "أظهر حسده"]],
    L("und vor dem Übel eines Neiders, wenn er neidet.", "And from the evil of an envier when he envies.", "ومن شر كل حاسدٍ إذا أظهر حسده.")),

  // ---- An-Nas (114) ----
  V(114, 1, [QUL, AUDHU, BIRABBI, NAS],
    L("Sag: Ich suche Zuflucht beim Herrn der Menschen,", "Say, “I seek refuge in the Lord of mankind,", "قل: ألتجئ وأعتصم بربّ الناس،")),
  V(114, 2, [["مَلِكِ", "maliki", "dem König", "the King", "صاحب المُلك والسلطان"], NAS],
    L("dem König der Menschen,", "The Sovereign of mankind,", "مالك الناس،")),
  V(114, 3, [["إِلَـٰهِ", "ilāhi", "dem Gott", "the God", "المعبود بحقّ"], NAS],
    L("dem Gott der Menschen,", "The God of mankind,", "معبود الناس بحقّ،")),
  V(114, 4, [MIN, SHARRI, ["ٱلْوَسْوَاسِ", "al-waswāsi", "des Einflüsterers", "the whisperer", "الموسوس"], ["ٱلْخَنَّاسِ", "al-khannāsi", "der sich davonstiehlt", "the retreating one", "الذي يختفي عند ذكر الله"]],
    L("vor dem Übel des Einflüsterers, der sich davonstiehlt,", "From the evil of the retreating whisperer –", "من شر الشيطان الموسوس الذي يختفي إذا ذُكر الله،")),
  V(114, 5, [["ٱلَّذِى", "alladhī", "der", "who", "اسم موصول للمفرد"], ["يُوَسْوِسُ", "yuwaswisu", "einflüstert", "whispers", "يُلقي الوسوسة"], FI, ["صُدُورِ", "ṣudūri", "die Brüste", "the breasts", "الصدور"], NAS],
    L("der in die Brüste der Menschen einflüstert,", "Who whispers [evil] into the breasts of mankind", "الذي يُلقي الوسوسة في صدور الناس،")),
  V(114, 6, [["مِنَ", "mina", "von", "from", "من"], ["ٱلْجِنَّةِ", "al-jinnati", "den Ginn", "the jinn", "الجنّ"], ["وَٱلنَّاسِ", "wan-nāsi", "und den Menschen", "and mankind", "والبشر"]],
    L("von den Ginn und den Menschen.", "From among the jinn and mankind.", "من الجنّ ومن الناس.")),

  // ---- Al-Asr (103) ----
  V(103, 1, [["وَٱلْعَصْرِ", "wal-ʿaṣri", "bei der Zeit", "by time", "قسمٌ بالزمان"]],
    L("Bei der Zeit!", "By time,", "يُقسم الله تعالى بالزمان الذي تجري فيه أعمال العباد.")),
  V(103, 2, [INNA, ["ٱلْإِنسَـٰنَ", "al-insāna", "der Mensch", "mankind", "الإنسان"], ["لَفِى", "lafī", "ist wahrlich in", "is surely in", "لَ للتوكيد + في"], ["خُسْرٍ", "khusrin", "Verlust", "loss", "خسارة وهلاك"]],
    L("Wahrlich, der Mensch ist in einem Verlust,", "Indeed, mankind is in loss,", "إن جنس الإنسان لفي خسارةٍ وهلاك.")),
  V(103, 3, [["إِلَّا", "illā", "außer", "except", "أداة استثناء"], ALLADHINA, ["ءَامَنُوا۟", "āmanū", "sie glaubten", "who believed", "صدّقوا بالله"], ["وَعَمِلُوا۟", "wa-ʿamilū", "und sie taten", "and did", "وفعلوا"], ["ٱلصَّـٰلِحَـٰتِ", "aṣ-ṣāliḥāti", "das Rechtschaffene", "righteous deeds", "الأعمال الصالحة"], TAWASAW, ["بِٱلْحَقِّ", "bil-ḥaqqi", "zur Wahrheit", "to the truth", "بالحق"], TAWASAW, ["بِٱلصَّبْرِ", "biṣ-ṣabri", "zur Geduld", "to patience", "بالصبر"]],
    L("außer denjenigen, die glauben und rechtschaffene Werke tun und einander zur Wahrheit ermahnen und einander zur Geduld ermahnen.", "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.", "إلا الذين آمنوا وعملوا الصالحات، وأوصى بعضهم بعضًا بالحق، وأوصى بعضهم بعضًا بالصبر."),
    [{ to: 5, meaning: L("außer denjenigen, die glauben und rechtschaffene Werke tun", "Except for those who have believed and done righteous deeds", "إلا الذين آمنوا وعملوا الصالحات،") }, { to: 9, meaning: L("und einander zur Wahrheit ermahnen und einander zur Geduld ermahnen.", "And advised each other to truth and advised each other to patience.", "وأوصى بعضهم بعضًا بالحق، وأوصى بعضهم بعضًا بالصبر.") }]),
];

export const verseOf = (ref: string) => VERSES.find((v) => `${v.s}:${v.a}` === ref);
// all words of the given verses ("1:2" …), repeated words (same text) only once
export function wordsOf(refs: string[]): Item[] {
  const seen = new Set<string>();
  return refs.flatMap((r) => verseOf(r)?.words ?? []).filter((w) => !seen.has(w.ar) && !!seen.add(w.ar));
}
