// Wudu trainer (/wudu): the ablution step by step, in the common Sunni form and in the Ja'fari (Shia) form.
// Only what is well established is stated; where the Sunni schools differ on a point, the note says so.
import type { Tradition } from "./salah";

export type { Tradition };
export type L3 = { de: string; en: string; ar: string };
// which drawing the stage shows for a step
export type Scene = "heart" | "vessel" | "hands" | "mouth" | "nose" | "face" | "arm" | "armL" | "head" | "ears" | "feet" | "end";
export type Dua = { ar: string; tr: string; meaning: { de: string; en: string }; src?: L3 };
export type WuduStep = {
  id: string;
  scene: Scene;
  title: L3;
  text: L3;
  // fard/sunnah for Sunni, shown as wajib/mustahabb for Ja'fari
  kind: "fard" | "sunnah";
  times?: number;
  sides?: boolean; // right, then left
  note?: L3;
  duas?: Dua[];
  quiz?: boolean; // part of the order quiz
};

const L = (de: string, en: string, ar: string): L3 => ({ de, en, ar });

const BISMILLAH: Dua = { ar: "بِسْمِ اللَّهِ", tr: "Bismillāh", meaning: { de: "Im Namen Allahs.", en: "In the name of Allah." } };
const END_DUAS: Dua[] = [
  {
    ar: "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    tr: "Ashhadu an lā ilāha illā llāhu waḥdahū lā sharīka lah, wa ashhadu anna Muḥammadan ʿabduhū wa rasūluh.",
    meaning: {
      de: "Ich bezeuge, dass es keinen Gott gibt außer Allah allein, ohne Teilhaber, und ich bezeuge, dass Muhammad Sein Diener und Gesandter ist.",
      en: "I bear witness that there is no god but Allah alone, without partner, and I bear witness that Muhammad is His servant and messenger.",
    },
    src: L("Sahih Muslim 234", "Sahih Muslim 234", "صحيح مسلم 234"),
  },
  {
    ar: "اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ، وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
    tr: "Allāhumma jʿalnī mina t-tawwābīn, wajʿalnī mina l-mutaṭahhirīn.",
    meaning: {
      de: "O Allah, lass mich zu denen gehören, die reumütig zu Dir umkehren, und lass mich zu denen gehören, die sich reinigen.",
      en: "O Allah, make me one of those who turn to You in repentance, and make me one of those who purify themselves.",
    },
    src: L("at-Tirmidhi 55", "at-Tirmidhi 55", "سنن الترمذي 55"),
  },
];

const intention = (shia: boolean): WuduStep => ({
  id: "niyyah", scene: "heart", kind: "fard",
  title: L("Die Absicht (Niyya)", "Intention (niyyah)", "النيّة"),
  text: shia
    ? L("Fasse im Herzen die Absicht, die Gebetswaschung zu verrichten, um Allah näherzukommen (qurbatan ila llah).",
        "Make the intention in your heart to perform wudu in order to draw closer to Allah (qurbatan ilā llāh).",
        "انوِ بقلبك الوضوءَ قربةً إلى الله تعالى.")
    : L("Fasse im Herzen die Absicht, die Gebetswaschung für Allah zu verrichten. Laut aussprechen musst du sie nicht.",
        "Make the intention in your heart to perform wudu for Allah. You do not need to say it aloud.",
        "انوِ بقلبك أنك تتوضّأ لله تعالى، ولا يلزمك أن تتلفّظ بالنيّة."),
  note: shia ? undefined : L("Pflicht bei den Schafi'iten, Malikiten und Hanbaliten; bei den Hanafiten Sunna.",
    "Obligatory in the Shafi'i, Maliki and Hanbali schools; sunnah in the Hanafi school.",
    "النيّة فرضٌ عند الشافعية والمالكية والحنابلة، وسنّةٌ عند الحنفية."),
});

const bismillah = (shia: boolean): WuduStep => ({
  id: "bismillah", scene: "vessel", kind: "sunnah",
  title: L("Bismillah sprechen", "Say Bismillah", "التسمية"),
  text: L("Beginne mit dem Namen Allahs.", "Begin with the name of Allah.", "ابدأ وضوءك باسم الله."),
  note: shia ? undefined : L("Bei den Hanbaliten Pflicht, wenn man daran denkt.", "In the Hanbali school it is obligatory if you remember it.", "وهي واجبةٌ عند الحنابلة مع التذكّر."),
  duas: [BISMILLAH],
});

const ending = (shia: boolean): WuduStep => ({
  id: "dua", scene: "end", kind: "sunnah",
  title: L("Das Bittgebet danach", "The du'a afterwards", "الدعاء بعد الوضوء"),
  text: L("Wenn du fertig bist, bezeuge die Einheit Allahs und bitte Ihn, dich zu den Reinen zu zählen.",
    "When you have finished, bear witness to the oneness of Allah and ask Him to count you among those who purify themselves.",
    "إذا فرغت من وضوئك فاشهد لله بالتوحيد، واسأله أن يجعلك من التوّابين والمتطهّرين."),
  note: shia ? L("Auch in der Dscha'fari-Tradition werden während und nach dem Wudu Bittgebete empfohlen – lerne ihre Formen bei einem Lehrer deiner Schule.",
    "In the Ja'fari tradition, too, du'as are recommended during and after wudu – learn their wording with a teacher of your school.",
    "ويُستحبّ الدعاء أثناء الوضوء وبعده في المذهب الجعفري أيضًا، فتعلّم صيغه على يد معلّم من مذهبك.") : undefined,
  duas: END_DUAS,
});

const SUNNI: WuduStep[] = [
  intention(false),
  bismillah(false),
  {
    id: "hands", scene: "hands", kind: "sunnah", times: 3, quiz: true,
    title: L("Hände waschen", "Wash the hands", "غسل الكفّين"),
    text: L("Wasche beide Hände bis zu den Handgelenken und lass das Wasser auch zwischen die Finger laufen.",
      "Wash both hands up to the wrists and let the water run between the fingers too.",
      "اغسل كفّيك إلى الرُّسغين، وخلِّل بين أصابعك."),
  },
  {
    id: "mouth", scene: "mouth", kind: "sunnah", times: 3, quiz: true,
    title: L("Mund ausspülen", "Rinse the mouth", "المضمضة"),
    text: L("Nimm mit der rechten Hand Wasser in den Mund, spüle ihn gut aus und spucke das Wasser wieder aus.",
      "Take water into your mouth with your right hand, rinse it well and spit the water out.",
      "خذ الماء بيدك اليمنى إلى فمك، وأدِره فيه، ثم مُجَّه."),
    note: L("Bei den Hanbaliten Pflicht – Mund und Nase gehören dort zum Gesicht.", "Obligatory in the Hanbali school, where mouth and nose count as part of the face.", "وهي واجبةٌ عند الحنابلة، لأنّ الفم والأنف عندهم من الوجه."),
  },
  {
    id: "nose", scene: "nose", kind: "sunnah", times: 3, quiz: true,
    title: L("Nase spülen", "Rinse the nose", "الاستنشاق والاستنثار"),
    text: L("Zieh etwas Wasser in die Nase und schnäuze es wieder aus.",
      "Draw a little water into your nose and blow it out again.",
      "اجذب الماء بنَفَسك إلى أنفك، ثم انثره."),
    note: L("Bei den Hanbaliten Pflicht – Mund und Nase gehören dort zum Gesicht.", "Obligatory in the Hanbali school, where mouth and nose count as part of the face.", "وهو واجبٌ عند الحنابلة، لأنّ الفم والأنف عندهم من الوجه."),
  },
  {
    id: "face", scene: "face", kind: "fard", times: 3, quiz: true,
    title: L("Gesicht waschen", "Wash the face", "غسل الوجه"),
    text: L("Wasche das ganze Gesicht – vom Haaransatz bis unter das Kinn und von einem Ohr zum anderen.",
      "Wash the whole face – from the hairline to below the chin and from one ear to the other.",
      "اغسل وجهك كلّه: من منابت شعر الرأس إلى أسفل الذقن، ومن الأذن إلى الأذن."),
    note: L("Pflicht nach dem Quran (5:6).", "Obligatory by the Quran (5:6).", "فرضٌ بنصّ القرآن (المائدة: 6)."),
  },
  {
    id: "arms", scene: "arm", kind: "fard", times: 3, sides: true, quiz: true,
    title: L("Arme waschen", "Wash the arms", "غسل اليدين إلى المرفقين"),
    text: L("Wasche den rechten Arm von den Fingerspitzen bis einschließlich des Ellenbogens, danach den linken.",
      "Wash the right arm from the fingertips up to and including the elbow, then the left.",
      "اغسل يدك اليمنى من أطراف الأصابع إلى المرفق مع المرفق، ثم اليسرى كذلك."),
    note: L("Pflicht nach dem Quran (5:6).", "Obligatory by the Quran (5:6).", "فرضٌ بنصّ القرآن (المائدة: 6)."),
  },
  {
    id: "head", scene: "head", kind: "fard", times: 1, quiz: true,
    title: L("Über den Kopf streichen", "Wipe the head", "مسح الرأس"),
    text: L("Streiche mit nassen Händen einmal über den Kopf – von der Stirn bis zum Nacken und wieder zurück.",
      "Wipe over your head once with wet hands – from the forehead to the nape of the neck and back again.",
      "امسح رأسك مرّةً واحدةً بيديك المبلولتين: من مقدَّم الرأس إلى القفا، ثم ارجع بهما إلى حيث بدأت."),
    note: L("Wie viel vom Kopf Pflicht ist, sehen die Rechtsschulen unterschiedlich.", "How much of the head must be wiped differs between the schools.", "وتختلف المذاهب في القدر الواجب مسحه من الرأس."),
  },
  {
    id: "ears", scene: "ears", kind: "sunnah", times: 1, quiz: true,
    title: L("Ohren abwischen", "Wipe the ears", "مسح الأذنين"),
    text: L("Wische mit den Zeigefingern das Innere der Ohren und mit den Daumen ihre Rückseite.",
      "Wipe the inside of the ears with your index fingers and the back of them with your thumbs.",
      "امسح باطن أذنيك بالسبّابتين، وظاهرهما بالإبهامين."),
  },
  {
    id: "feet", scene: "feet", kind: "fard", times: 3, sides: true, quiz: true,
    title: L("Füße waschen", "Wash the feet", "غسل الرجلين إلى الكعبين"),
    text: L("Wasche den rechten Fuß bis einschließlich des Knöchels, danach den linken. Vergiss die Zwischenräume der Zehen nicht.",
      "Wash the right foot up to and including the ankle, then the left. Don't forget the spaces between the toes.",
      "اغسل رجلك اليمنى إلى الكعبين مع الكعبين، ثم اليسرى، وخلِّل بين أصابع رجليك."),
    note: L("Pflicht nach dem Quran (5:6).", "Obligatory by the Quran (5:6).", "فرضٌ بنصّ القرآن (المائدة: 6)."),
  },
  ending(false),
];

const ONCE = L("Einmal ist Pflicht, ein zweites Mal ist erlaubt, ein drittes Mal nicht.", "Once is obligatory, a second time is permissible, a third time is not.", "الغسلة الأولى واجبة، والثانية جائزة، والثالثة غير مشروعة.");

const SHIA: WuduStep[] = [
  intention(true),
  bismillah(true),
  {
    id: "hands", scene: "hands", kind: "sunnah", quiz: true,
    title: L("Hände waschen", "Wash the hands", "غسل الكفّين"),
    text: L("Wasche zu Beginn beide Hände bis zu den Handgelenken.", "To begin, wash both hands up to the wrists.", "اغسل كفّيك إلى الزندين قبل أن تبدأ."),
  },
  {
    id: "mouth", scene: "mouth", kind: "sunnah", quiz: true,
    title: L("Mund ausspülen", "Rinse the mouth", "المضمضة"),
    text: L("Spüle den Mund mit Wasser aus.", "Rinse your mouth with water.", "أدِر الماء في فمك ثم مُجَّه."),
  },
  {
    id: "nose", scene: "nose", kind: "sunnah", quiz: true,
    title: L("Nase spülen", "Rinse the nose", "الاستنشاق"),
    text: L("Zieh etwas Wasser in die Nase und lass es wieder heraus.", "Draw a little water into your nose and let it out again.", "اجذب الماء إلى أنفك ثم أخرجه."),
  },
  {
    id: "face", scene: "face", kind: "fard", times: 1, quiz: true,
    title: L("Gesicht waschen", "Wash the face", "غسل الوجه"),
    text: L("Wasche das Gesicht von oben nach unten: vom Haaransatz bis zum Kinn, so breit, wie Mittelfinger und Daumen es umspannen.",
      "Wash the face from top to bottom: from the hairline to the chin, as wide as the span between your middle finger and thumb.",
      "اغسل وجهك من الأعلى إلى الأسفل: من قُصاص شعر الرأس إلى الذقن طولًا، وما دارت عليه الإصبع الوسطى والإبهام عرضًا."),
    note: ONCE,
  },
  {
    id: "armR", scene: "arm", kind: "fard", times: 1, quiz: true,
    title: L("Rechten Arm waschen", "Wash the right arm", "غسل اليد اليمنى"),
    text: L("Wasche den rechten Arm vom Ellenbogen abwärts bis zu den Fingerspitzen – nicht umgekehrt.",
      "Wash the right arm from the elbow down to the fingertips – not the other way round.",
      "اغسل يدك اليمنى من المرفق إلى أطراف الأصابع، لا بالعكس."),
    note: ONCE,
  },
  {
    id: "armL", scene: "armL", kind: "fard", times: 1, quiz: true,
    title: L("Linken Arm waschen", "Wash the left arm", "غسل اليد اليسرى"),
    text: L("Wasche danach den linken Arm genauso – vom Ellenbogen bis zu den Fingerspitzen.",
      "Then wash the left arm in the same way – from the elbow down to the fingertips.",
      "ثم اغسل يدك اليسرى كذلك، من المرفق إلى أطراف الأصابع."),
    note: ONCE,
  },
  {
    id: "head", scene: "head", kind: "fard", times: 1, quiz: true,
    title: L("Über den Kopf wischen", "Wipe the head", "مسح الرأس"),
    text: L("Wische mit der Feuchtigkeit, die noch an der rechten Hand ist, über den vorderen Teil des Kopfes – ohne neues Wasser zu nehmen.",
      "With the wetness still left on your right hand, wipe the front part of your head – without taking new water.",
      "امسح مقدَّم رأسك ببلّة الوضوء الباقية في يدك اليمنى، من غير أن تأخذ ماءً جديدًا."),
  },
  {
    id: "feet", scene: "feet", kind: "fard", times: 1, sides: true, quiz: true,
    title: L("Über die Füße wischen", "Wipe the feet", "مسح القدمين"),
    text: L("Wische mit der verbliebenen Feuchtigkeit über den Fußrücken – von den Zehenspitzen bis zum Knöchel, der Erhebung oben am Fuß. Zuerst den rechten Fuß, dann den linken.",
      "With the remaining wetness, wipe the top of the foot – from the tips of the toes to the ankle, the raised part on top of the foot. First the right foot, then the left.",
      "امسح ظاهر قدمك ببلّة الوضوء الباقية، من أطراف الأصابع إلى الكعب، وهو قُبّة القدم: اليمنى ثم اليسرى."),
  },
  ending(true),
];

export const WUDU: Record<Tradition, WuduStep[]> = { sunni: SUNNI, shia: SHIA };

// a rule that belongs to the whole sequence, shown under the trainer and in the quiz
export const RULE: Record<Tradition, L3> = {
  sunni: L("Jeden Teil einmal zu waschen ist gültig, dreimal ist Sunna. In der schafi'itischen und hanbalitischen Schule ist die Reihenfolge Pflicht.",
    "Washing each part once is valid; three times is the sunnah. In the Shafi'i and Hanbali schools the order is obligatory.",
    "غسل كل عضو مرّةً واحدةً يُجزئ، والتثليث سنّة. والترتيب فرضٌ عند الشافعية والحنابلة."),
  shia: L("Reihenfolge (Tartib) und zügige Abfolge (Muwalat) sind Pflicht.", "Order (tartib) and continuity (muwalat) are obligatory.", "الترتيب والموالاة واجبان."),
};

export type WuduDone = { done: true; at: number; tradition: Tradition };
export const WUDU_KEY = "tf:wudu";
