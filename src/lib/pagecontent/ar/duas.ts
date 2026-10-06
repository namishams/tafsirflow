// Arabic descriptive fields for the Sunnah supplications (src/lib/sunnahDuas.ts + src/lib/sunnahDuas2.ts).
// For Arabic readers the Arabic dua text (`ar`) is itself the meaning, so `translation` is always "".
// `when` renders the usage notes that the English translation carries in parentheses
// (occasion, number of repetitions, virtue); "" when the English has none.
// The dua text (`ar`) and the source reference (`src`) are NOT repeated here – keep using them from the source entry.
import type { SunnahCat } from "../../sunnahDuas";

export type ArDua = {
  translation: string; // mirrors `en`; always "" for Arabic
  when: string; // occasion / usage note in Arabic, "" if none
};

export const cats: Record<SunnahCat, string> = {
  morning: "أذكار الصباح والمساء",
  sleep: "أذكار النوم والاستيقاظ",
  prayer: "الصلاة والمسجد",
  home: "البيت وشؤون اليوم",
  food: "الطعام والصيام",
  travel: "السفر",
  forgiveness: "الاستغفار والتوبة",
  hardship: "الكرب والشفاء",
  knowledge: "العلم والهداية",
  daily: "أذكار اليوم والليلة",
  salawat: "الصلاة على النبي ﷺ",
};

const duas: Record<string, ArDua> = {
  // ── sunnahDuas.ts ─────────────────────────────
  // الصباح والمساء
  asbahna: { translation: "", when: "يقوله إذا أصبح، وإذا أمسى قال: «أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ…»." },
  "bika-asbahna": { translation: "", when: "في الصباح. وفي المساء يقول: «اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ»." },
  "bismillah-la-yadurr": { translation: "", when: "" },
  raditu: { translation: "", when: "" },
  "kalimat-tammat": { translation: "", when: "" },
  "subhanallah-wa-bihamdihi": { translation: "", when: "" },
  // النوم والاستيقاظ
  "bismika-amutu": { translation: "", when: "" },
  "qini-adhabak": { translation: "", when: "" },
  waking: { translation: "", when: "" },
  // الصلاة والمسجد
  "after-wudu": { translation: "", when: "بعد الفراغ من الوضوء." },
  "after-adhan": { translation: "", when: "بعد سماع الأذان." },
  "after-salah": { translation: "", when: "بعد الصلاة المفروضة: يستغفر الله ثلاثًا، ثم يقول الذكر." },
  "tasbih-after-salah": { translation: "", when: "دبر كل صلاة مفروضة: التسبيح والتحميد والتكبير ثلاثًا وثلاثين مرة لكلٍّ منها، ثم تمام المئة بالتهليل." },
  "aini-ala-dhikrik": { translation: "", when: "" },
  "enter-mosque": { translation: "", when: "عند دخول المسجد." },
  "leave-mosque": { translation: "", when: "عند الخروج من المسجد." },
  // البيت
  "leave-home": { translation: "", when: "عند الخروج من البيت." },
  "enter-toilet": { translation: "", when: "قبل دخول الخلاء." },
  "leave-toilet": { translation: "", when: "بعد الخروج من الخلاء." },
  clothes: { translation: "", when: "عند لبس الثوب." },
  // الطعام والصيام
  "before-eating": { translation: "", when: "" },
  "after-eating": { translation: "", when: "" },
  iftar: { translation: "", when: "عند الفطر من الصيام." },
  // السفر
  travel: { translation: "", when: "دعاء السفر: يكبّر ثلاثًا إذا استوى على راحلته خارجًا إلى سفر، ثم يدعو." },
  // الاستغفار
  "sayyid-istighfar": { translation: "", when: "سيّد الاستغفار." },
  afuwwun: { translation: "", when: "ولا سيما في ليالي العشر الأواخر من رمضان." },
  "la-hawla": { translation: "", when: "" },
  // الكرب والشفاء
  karb: { translation: "", when: "عند الكرب." },
  "hamm-hazan": { translation: "", when: "" },
  musiba: { translation: "", when: "عند نزول المصيبة." },
  "fear-people": { translation: "", when: "عند الخوف من الناس." },
  anger: { translation: "", when: "عند الغضب." },
  "sick-visit": { translation: "", when: "عند عيادة المريض." },
  // العلم والهداية
  nafani: { translation: "", when: "" },
  "huda-tuqa": { translation: "", when: "" },
  muqallib: { translation: "", when: "" },
  // أذكار اليوم
  sneeze: { translation: "", when: "" },
  rain: { translation: "", when: "عند نزول المطر." },
  "new-moon": { translation: "", when: "عند رؤية الهلال." },
  // الصلاة على النبي ﷺ
  "salat-ibrahimiyya": { translation: "", when: "" },

  // ── sunnahDuas2.ts ────────────────────────────
  // الصباح والمساء
  "afiyah-dunya-akhirah": { translation: "", when: "في الصباح والمساء – ولم يكن النبي ﷺ يدعهنّ." },
  "alim-al-ghayb": { translation: "", when: "في الصباح والمساء، وإذا أخذ مضجعه." },
  "tahlil-100": { translation: "", when: "مئة مرة في اليوم؛ ومن قالها عشر مرات كان كمن أعتق أربعة أنفس من ولد إسماعيل." },
  "adada-khalqihi": { translation: "", when: "علّمه النبي ﷺ أمَّ المؤمنين جويرية رضي الله عنها بعد صلاة الصبح." },
  // النوم
  "aslamtu-nafsi": { translation: "", when: "آخر ما يقوله قبل النوم، مضطجعًا على شقّه الأيمن بعد الوضوء." },
  "tasbih-fatima": { translation: "", when: "التسبيح ثلاثًا وثلاثين، والتحميد ثلاثًا وثلاثين، والتكبير أربعًا وثلاثين، عند النوم. علّمه النبي ﷺ فاطمة وعليًّا رضي الله عنهما، وقال: «فهو خير لكما من خادم»." },
  "bismika-rabbi-wadatu": { translation: "", when: "عند الاضطجاع للنوم." },
  "atamana-wa-saqana": { translation: "", when: "إذا أوى إلى فراشه." },
  "khalaqta-nafsi": { translation: "", when: "إذا أوى إلى فراشه." },
  "rabb-as-samawat-sleep": { translation: "", when: "إذا أوى إلى فراشه." },
  "waking-at-night": { translation: "", when: "لمن تعارّ من الليل (استيقظ)؛ فإن دعا استُجيب له، وإن توضّأ وصلّى قُبلت صلاته." },
  // الصلاة
  "istiftah-baid": { translation: "", when: "دعاء الاستفتاح بعد تكبيرة الإحرام." },
  "istiftah-subhanaka": { translation: "", when: "دعاء استفتاح الصلاة." },
  "ruku-sujud-tasbih": { translation: "", when: "الأول في الركوع، والثاني في السجود." },
  "subhanaka-rabbana-ighfir": { translation: "", when: "كان النبي ﷺ يُكثر أن يقوله في ركوعه وسجوده." },
  "rabbana-lakal-hamd": { translation: "", when: "عند الرفع من الركوع؛ وقد رأى النبي ﷺ بضعةً وثلاثين ملكًا يبتدرونها أيّهم يكتبها أولًا." },
  "sujud-laka-sajadtu": { translation: "", when: "في السجود." },
  "sujud-dhanbi-kullahu": { translation: "", when: "في السجود." },
  "sujud-ridaka": { translation: "", when: "في السجود." },
  "between-sajdas": { translation: "", when: "في الجلسة بين السجدتين." },
  tashahhud: { translation: "", when: "التشهّد كما علّمه النبي ﷺ عبدَ الله بن مسعود رضي الله عنه." },
  "before-salam-four": { translation: "", when: "بعد التشهّد الأخير، قبل السلام." },
  "abu-bakr-zalamtu": { translation: "", when: "علّمه النبي ﷺ أبا بكر الصدّيق رضي الله عنه ليدعو به في صلاته." },
  "ma-qaddamtu": { translation: "", when: "من آخر ما كان يقوله النبي ﷺ بين التشهّد والتسليم." },
  "la-mania": { translation: "", when: "دبر كل صلاة مكتوبة." },
  "qunut-witr": { translation: "", when: "دعاء القنوت في الوتر، علّمه النبي ﷺ الحسنَ بن علي رضي الله عنهما." },
  istikhara: { translation: "", when: "صلاة الاستخارة: يصلّي ركعتين من غير الفريضة ثم يدعو، ويسمّي حاجته عند قوله «هَذَا الْأَمْرَ». وفي الرواية شكّ الراوي: قال «عَاجِلِ أَمْرِي وَآجِلِهِ» بدل «عَاقِبَةِ أَمْرِي»." },
  "adhan-shahada": { translation: "", when: "عند سماع المؤذّن يتشهّد؛ ومن قاله غُفر له ذنبه." },
  "janazah-ighfir-lahu": { translation: "", when: "في صلاة الجنازة، وشكّ الراوي في أيّ اللفظين الأخيرين قال. وللمرأة تُؤنَّث الضمائر: «اللَّهُمَّ اغْفِرْ لَهَا وَارْحَمْهَا…»." },
  // البيت
  "enter-home": { translation: "", when: "ذكر الله عند دخول البيت وعند الطعام؛ فيقول الشيطان لأصحابه: «لا مبيت لكم ولا عشاء»." },
  "leave-home-adilla": { translation: "", when: "عند الخروج من البيت." },
  "new-clothes": { translation: "", when: "عند لبس الثوب الجديد." },
  "protect-children": { translation: "", when: "كان النبي ﷺ يعوّذ بها الحسن والحسين رضي الله عنهما؛ وللولد الواحد يقول: «أُعِيذُكَ»، وللبنت: «أُعِيذُكِ»." },
  // الطعام
  "after-eating-kathiran": { translation: "", when: "إذا رُفعت المائدة." },
  "for-host": { translation: "", when: "دعاء للمضيف بعد الطعام." },
  "atim-man-atamani": { translation: "", when: "" },
  "aftara-indakum": { translation: "", when: "دعاء لمن دعاك إلى الإفطار عنده." },
  // السفر
  "travel-return": { translation: "", when: "يُزاد على دعاء السفر عند الرجوع منه." },
  "farewell-traveller": { translation: "", when: "عند توديع المسافر." },
  talbiyah: { translation: "", when: "التلبية في الحج والعمرة." },
  // الاستغفار
  "astaghfirullah-wa-atubu": { translation: "", when: "كان النبي ﷺ يقولها في اليوم أكثر من سبعين مرة؛ وفي رواية مسلم: «فإني أتوب في اليوم إليه مئة مرة»." },
  "astaghfirullah-al-hayy": { translation: "", when: "من قالها غُفر له وإن كان فرّ من الزحف." },
  "khatiati-wa-jahli": { translation: "", when: "جزء من دعاء أطول للنبي ﷺ." },
  "sharri-ma-amiltu": { translation: "", when: "" },
  // الكرب والشفاء
  condolence: { translation: "", when: "التعزية – رسالة النبي ﷺ إلى ابنته حين اشتدّ بها الحزن." },
  "ruqya-adhhib-al-bas": { translation: "", when: "رقية للمريض." },
  "asalullah-al-azim": { translation: "", when: "سبع مرات عند عيادة مريض لم يحضر أجله." },
  pain: { translation: "", when: "يضع يده على موضع الألم، ويقول: «بِسْمِ اللَّهِ» ثلاثًا، ثم الاستعاذة سبع مرات." },
  "ikfini-bihalalik": { translation: "", when: "لقضاء الدَّين – «ولو كان عليك مثل جبل دَينًا أدّاه الله عنك»." },
  "zawal-nimatik": { translation: "", when: "" },
  qadarullah: { translation: "", when: "إذا أصابه ما يكره – بدل أن يقول: «لو أنّي فعلت كذا…»." },
  // العلم والهداية
  "ati-nafsi-taqwaha": { translation: "", when: "" },
  "aslih-li-dini": { translation: "", when: "" },
  "musarrif-al-qulub": { translation: "", when: "" },
  "ilman-nafia": { translation: "", when: "بعد التسليم من صلاة الصبح." },
  "laka-aslamtu": { translation: "", when: "" },
  // أذكار اليوم
  "subhanallah-al-azim": { translation: "", when: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن." },
  "four-words": { translation: "", when: "أحبّ الكلام إلى الله أربع." },
  "kaffarat-al-majlis": { translation: "", when: "في ختام المجلس – كفّارة لما كان فيه." },
  "strong-wind": { translation: "", when: "إذا عصفت الريح." },
  "after-rain": { translation: "", when: "بعد نزول المطر." },
  hawalayna: { translation: "", when: "إذا كثر المطر وخُشي ضرره." },
  "visiting-graves": { translation: "", when: "عند زيارة القبور." },
  newlywed: { translation: "", when: "تهنئة المتزوّج." },
  jazakallah: { translation: "", when: "لمن صنع إليك معروفًا – ومن قالها فقد أبلغ في الثناء." },
  "seeing-afflicted": { translation: "", when: "إذا رأى مبتلًى قالها في سرّه لئلا يؤذيه؛ فلا يصيبه ذلك البلاء." },
  "akthir-malahu": { translation: "", when: "دعاء النبي ﷺ لأنس بن مالك رضي الله عنه بطلب أمّه – دعاء للولد أو لأحد الأهل." },
  // الصلاة على النبي ﷺ
  "salawat-azwaj": { translation: "", when: "" },
  "salawat-fil-alamin": { translation: "", when: "" },
};

export default duas;
