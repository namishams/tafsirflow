import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import WuduTrainer from "@/components/WuduTrainer";
import { CalligraphyDraw, Divider } from "@/components/Ornaments";
import { MoreTiles } from "@/components/PosterTiles";
import { ArrowNext } from "@/components/Icons";
import { PracticeStar } from "@/components/art/PracticeArt";
import { getResources, getVerseByKey, pickTranslation } from "@/lib/quran";
import { WUDU, langOf, type Lang } from "@/lib/wudu";
import { abs, pageMeta } from "@/lib/site";

type Virtue = { ar: string; text: string; src: string; href?: string };
// trBy: German and English name their fixed translation; the other languages give only the word "Translation" and the author is added
type Content = {
  kicker: string; title: string; lead: string; verseKicker: string; verseTitle: string; verseLead: string; verseRef: string; listen: string; trBy: string;
  breaksTitle: string; breaksLead: string; breaks: string[]; breaksNote: string; tayTitle: string; tay: string;
  quran: string; supply: string; virtueTitle: string; virtues: Virtue[]; more: string; links: [string, string][];
};
const C: Record<Lang, Content> = {
  de: {
    kicker: "Gebetswaschung · Schritt für Schritt", title: "Wudu – so waschen Sie sich für das Gebet",
    lead: "Bevor Sie vor Allah treten, waschen Sie sich – mit Wasser und mit Absicht. Der Trainer zeigt Ihnen jeden Schritt, sagt Ihnen, was Pflicht ist und was empfohlen, und am Ende prüfen Sie sich mit einem kleinen Quiz.",
    verseKicker: "Der Wudu-Vers", verseTitle: "Was Allah über die Waschung sagt",
    verseLead: "Die Gebetswaschung steht im Quran selbst: das Gesicht, die Arme bis zu den Ellenbogen, der Kopf und die Füße bis zu den Knöcheln.",
    verseRef: "Sura al-Ma'ida 5:6", listen: "Vers anhören", trBy: "Übersetzung: Bubenheim & Elyas",
    breaksTitle: "Was das Wudu aufhebt", breaksLead: "Darin sind sich alle Rechtsschulen einig:",
    breaks: ["Wenn Urin, Stuhl oder Winde den Körper verlassen", "Tiefer Schlaf", "Bewusstlosigkeit"],
    breaksNote: "Andere Punkte – etwa Berührungen, Blutungen oder andere Ausscheidungen – beurteilen die Rechtsschulen unterschiedlich. Fragen Sie dazu einen Lehrer Ihrer Schule.",
    tayTitle: "Kein Wasser? Tayammum",
    tay: "Finden Sie kein Wasser oder würde es Ihnen schaden, erlaubt Allah Ihnen die Reinigung mit reiner Erde (Tayammum) – im selben Vers 5:6 und in 4:43. Sie fassen die Absicht, schlagen mit den Handflächen auf reine Erde und streichen damit über das Gesicht und die Hände. Wie oft Sie aufschlagen und wie weit Sie über die Hände streichen, beschreiben die Rechtsschulen unterschiedlich. Sobald Sie wieder Wasser verwenden können, machen Sie für das nächste Gebet wieder Wudu.",
    virtueTitle: "Warum die Waschung so viel wert ist",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "Allah liebt die, die sich reumütig (Ihm) zuwenden, und Er liebt die, die sich reinigen.", src: "Quran 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "Die Reinheit ist die Hälfte des Glaubens.", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "Uthman ibn Affan zeigte, wie der Prophet ﷺ die Waschung verrichtete, und überlieferte seine Worte: Wer die Waschung so verrichtet wie diese und dann zwei Rak'a betet, ohne mit den Gedanken abzuschweifen, dem werden seine früheren Sünden vergeben.", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    quran: "Quran", supply: "Reines Wasser",
    more: "Weiter lernen", links: [["/salah", "Beten lernen – der Gebetstrainer"], ["/prayer", "Gebetszeiten und Adhan"], ["/islam", "Islam verstehen – alle Kapitel"], ["/islam/prayer-sunni", "Wudu und Gebet ausführlich – sunnitisch"], ["/islam/prayer-shia", "Wudu und Gebet ausführlich – schiitisch"]],
  },
  en: {
    kicker: "Ablution · step by step", title: "Wudu – how to purify yourself for the prayer",
    lead: "Before you stand before Allah, you wash – with water and with intention. The trainer shows you every step, tells you what is obligatory and what is recommended, and at the end you test yourself with a short quiz.",
    verseKicker: "The wudu verse", verseTitle: "What Allah says about the ablution",
    verseLead: "The ablution is laid down in the Quran itself: the face, the arms up to the elbows, the head and the feet up to the ankles.",
    verseRef: "Surah al-Ma'idah 5:6", listen: "Listen to the verse", trBy: "Translation: Saheeh International",
    breaksTitle: "What breaks wudu", breaksLead: "All the schools agree on these:",
    breaks: ["When urine, stool or wind leaves the body", "Deep sleep", "Loss of consciousness"],
    breaksNote: "Other points – such as touching, bleeding or other discharges – are judged differently by the schools. Ask a teacher of your school about them.",
    tayTitle: "No water? Tayammum",
    tay: "If you cannot find water, or it would harm you, Allah allows you to purify yourself with clean earth (tayammum) – in the same verse 5:6 and in 4:43. You make the intention, strike clean earth with your palms and wipe your face and hands with them. How many times you strike and how far you wipe the hands is described differently by the schools. As soon as you can use water again, you make wudu again for the next prayer.",
    virtueTitle: "Why the ablution is worth so much",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "Allah loves those who repent and loves those who purify themselves.", src: "Quran 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "Purity is half of faith.", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "Uthman ibn Affan showed how the Prophet ﷺ performed wudu and passed on his words: whoever performs wudu like this and then prays two rak'ahs without letting his thoughts wander, his previous sins are forgiven.", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    quran: "Quran", supply: "Clean water",
    more: "Keep learning", links: [["/salah", "Learn to pray – the prayer trainer"], ["/prayer", "Prayer times and adhan"], ["/islam", "Understanding Islam – all chapters"], ["/islam/prayer-sunni", "Wudu and prayer in detail – Sunni"], ["/islam/prayer-shia", "Wudu and prayer in detail – Shia"]],
  },
  ar: {
    kicker: "الوضوء خطوةً خطوة", title: "الوضوء – هكذا تتطهّر للصلاة",
    lead: "قبل أن تقف بين يدي الله تتوضّأ: بالماء وبالنيّة. يُريك المدرّب كل خطوة، ويبيّن لك الواجب من المستحبّ، وفي النهاية تختبر نفسك باختبارٍ قصير.",
    verseKicker: "آية الوضوء", verseTitle: "ما قاله الله تعالى في الوضوء",
    verseLead: "جاء الوضوء في القرآن الكريم نفسه: الوجه، واليدان إلى المرفقين، والرأس، والرجلان إلى الكعبين.",
    verseRef: "سورة المائدة، الآية 6", listen: "استمع إلى الآية", trBy: "",
    breaksTitle: "نواقض الوضوء", breaksLead: "وهذه متّفقٌ عليها بين المذاهب:",
    breaks: ["خروج البول أو الغائط أو الريح", "النوم المستغرق", "زوال العقل بالإغماء ونحوه"],
    breaksNote: "وأمّا غيرها – كاللمس وخروج الدم وسائر الخارج – ففيه خلافٌ بين المذاهب، فاسأل عنه معلّمًا من مذهبك.",
    tayTitle: "لا ماء؟ التيمّم",
    tay: "إذا لم تجد الماء أو كان استعماله يضرّك، أباح الله لك التطهّر بالصعيد الطيّب (التيمّم)، في الآية نفسها (المائدة: 6) وفي سورة النساء (43). تنوي، ثم تضرب بكفّيك على الصعيد الطاهر، وتمسح بهما وجهك ويديك. وتختلف المذاهب في عدد الضربات وفي القدر الذي يُمسح من اليدين. فإذا قدرت على استعمال الماء عدت إلى الوضوء للصلاة التالية.",
    virtueTitle: "فضل الوضوء",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "", src: "سورة البقرة، الآية 222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "", src: "صحيح مسلم 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "توضّأ عثمان بن عفّان رضي الله عنه كما رأى النبيَّ ﷺ يتوضّأ، ثم روى عنه ﷺ قوله:", src: "صحيح البخاري 159، صحيح مسلم 226" },
    ] as Virtue[],
    quran: "القرآن", supply: "ماء طهور",
    more: "تابع التعلّم", links: [["/salah", "تعلّم الصلاة – مدرّب الصلاة"], ["/prayer", "مواقيت الصلاة والأذان"], ["/islam", "تعرّف على الإسلام – كل الفصول"], ["/islam/prayer-sunni", "الوضوء والصلاة بالتفصيل عند أهل السنة"], ["/islam/prayer-shia", "الوضوء والصلاة بالتفصيل في المذهب الجعفري"]],
  },
  tr: {
    kicker: "Abdest · adım adım", title: "Abdest – namaz için nasıl arınılır",
    lead: "Allah'ın huzuruna çıkmadan önce yıkanırsın – su ile ve niyetle. Eğitim sana her adımı gösterir, neyin farz, neyin tavsiye edilen olduğunu söyler ve sonunda kısa bir quizle kendini sınarsın.",
    verseKicker: "Abdest ayeti", verseTitle: "Allah abdest hakkında ne buyuruyor?",
    verseLead: "Abdest, Kur'an'ın kendisinde belirlenmiştir: yüz, dirseklere kadar kollar, baş ve ayak bileklerine kadar ayaklar.",
    verseRef: "Mâide Suresi 5:6", listen: "Ayeti dinle", trBy: "Çeviri",
    breaksTitle: "Abdesti ne bozar?", breaksLead: "Tüm mezhepler şu konularda hemfikirdir:",
    breaks: ["İdrar, dışkı ya da yel bedenden çıktığında", "Derin uyku", "Bilinç kaybı"],
    breaksNote: "Diğer konular – örneğin dokunma, kanama ya da başka akıntılar – mezhepler tarafından farklı değerlendirilir. Bunları kendi mezhebinden bir hocaya sor.",
    tayTitle: "Su yok mu? Teyemmüm",
    tay: "Su bulamazsan ya da su sana zarar verecekse, Allah temiz toprakla arınmana (teyemmüm) izin verir – aynı 5:6 ayetinde ve 4:43'te. Niyet edersin, avuçlarınla temiz toprağa vurur ve onlarla yüzünü ve ellerini meshedersin. Kaç kez vurulacağını ve ellerin ne kadarının meshedileceğini mezhepler farklı anlatır. Tekrar su kullanabildiğin anda bir sonraki namaz için yeniden abdest alırsın.",
    virtueTitle: "Abdestin değeri neden bu kadar büyük?",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "Allah, tövbe edenleri sever ve kendilerini arındıranları sever.", src: "Kur'an 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "Temizlik imanın yarısıdır.", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "Osman ibn Affân, Peygamber ﷺ'in abdesti nasıl aldığını gösterdi ve onun sözlerini aktardı: Kim şöyle abdest alır, sonra düşüncelerini dağıtmadan iki rekât namaz kılarsa, geçmiş günahları bağışlanır.", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    quran: "Kur'an", supply: "Temiz su",
    more: "Öğrenmeye devam et", links: [["/salah", "Namaz öğren – namaz eğitimi"], ["/prayer", "Namaz vakitleri ve ezan"], ["/islam", "İslam'ı anlamak – tüm bölümler"], ["/islam/prayer-sunni", "Abdest ve namaz ayrıntılı – Sünni"], ["/islam/prayer-shia", "Abdest ve namaz ayrıntılı – Şii"]],
  },
  ur: {
    kicker: "وضو · قدم بہ قدم", title: "وضو – نماز کے لیے خود کو کیسے پاک کریں",
    lead: "اللہ کے حضور کھڑے ہونے سے پہلے آپ دھوتے ہیں – پانی سے اور نیت کے ساتھ۔ مشق آپ کو ہر قدم دکھاتی ہے، بتاتی ہے کہ کیا فرض ہے اور کیا مستحب، اور آخر میں آپ ایک مختصر کوئز سے خود کو آزماتے ہیں۔",
    verseKicker: "آیتِ وضو", verseTitle: "اللہ وضو کے بارے میں کیا فرماتا ہے",
    verseLead: "وضو کا حکم خود قرآن میں ہے: چہرہ، کہنیوں تک بازو، سر اور ٹخنوں تک پاؤں۔",
    verseRef: "سورۃ المائدہ 5:6", listen: "آیت سنیں", trBy: "ترجمہ",
    breaksTitle: "وضو کیا توڑتا ہے", breaksLead: "ان باتوں پر تمام مکاتب متفق ہیں:",
    breaks: ["جب پیشاب، پاخانہ یا ہوا جسم سے خارج ہو", "گہری نیند", "بے ہوشی"],
    breaksNote: "دوسری باتوں میں – جیسے چھونا، خون بہنا یا دیگر اخراجات – مکاتب کی رائے مختلف ہے۔ ان کے بارے میں اپنے مکتب کے کسی استاد سے پوچھیں۔",
    tayTitle: "پانی نہیں؟ تیمم",
    tay: "اگر آپ کو پانی نہ ملے، یا وہ آپ کو نقصان پہنچائے، تو اللہ آپ کو پاک مٹی سے پاکیزگی حاصل کرنے (تیمم) کی اجازت دیتا ہے – اسی آیت 5:6 میں اور 4:43 میں۔ آپ نیت کرتے ہیں، ہتھیلیاں پاک مٹی پر مارتے ہیں اور ان سے اپنے چہرے اور ہاتھوں کا مسح کرتے ہیں۔ کتنی بار ہاتھ مارنا ہے اور ہاتھوں کا کتنا حصہ مسح کرنا ہے، اس بارے میں مکاتب کی بات مختلف ہے۔ جیسے ہی آپ دوبارہ پانی استعمال کر سکیں، اگلی نماز کے لیے دوبارہ وضو کرتے ہیں۔",
    virtueTitle: "وضو کی اتنی قدر کیوں ہے",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "اللہ توبہ کرنے والوں سے محبت کرتا ہے اور پاکیزگی اختیار کرنے والوں سے محبت کرتا ہے۔", src: "قرآن 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "پاکیزگی ایمان کا نصف ہے۔", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "عثمان بن عفان نے دکھایا کہ نبی ﷺ نے وضو کیسے کیا اور آپ ﷺ کے الفاظ آگے پہنچائے: جو شخص اس طرح وضو کرے اور پھر دو رکعت نماز پڑھے اور ان میں اپنے خیالات کو بھٹکنے نہ دے، اس کے پچھلے گناہ معاف کر دیے جاتے ہیں۔", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    quran: "قرآن", supply: "صاف پانی",
    more: "سیکھتے رہیں", links: [["/salah", "نماز سیکھیں – نماز کی مشق"], ["/prayer", "نماز کے اوقات اور اذان"], ["/islam", "اسلام کو سمجھیں – تمام ابواب"], ["/islam/prayer-sunni", "وضو اور نماز تفصیل سے – سنی"], ["/islam/prayer-shia", "وضو اور نماز تفصیل سے – شیعہ"]],
  },
  fa: {
    kicker: "وضو · گام به گام", title: "وضو – چگونه برای نماز پاک شویم",
    lead: "پیش از آنکه در پیشگاه الله بایستید، خود را می‌شویید – با آب و با نیت. تمرین هر گام را به شما نشان می‌دهد، می‌گوید چه واجب است و چه توصیه‌شده، و در پایان خودتان را با یک آزمون کوتاه می‌سنجید.",
    verseKicker: "آیهٔ وضو", verseTitle: "الله دربارهٔ وضو چه می‌فرماید",
    verseLead: "وضو در خود قرآن آمده است: صورت، دست‌ها تا آرنج‌ها، سر و پاها تا مچ‌ها.",
    verseRef: "سورهٔ مائده 5:6", listen: "شنیدن آیه", trBy: "ترجمه",
    breaksTitle: "چه چیزی وضو را باطل می‌کند", breaksLead: "همهٔ مذاهب بر این موارد اتفاق دارند:",
    breaks: ["هنگامی که ادرار، مدفوع یا باد از بدن خارج شود", "خواب عمیق", "از دست دادن هوشیاری"],
    breaksNote: "موارد دیگر – مانند لمس، خونریزی یا دیگر ترشحات – را مذاهب به‌گونه‌ای متفاوت ارزیابی می‌کنند. دربارهٔ آنها از معلمی از مذهب خودتان بپرسید.",
    tayTitle: "آب نیست؟ تیمم",
    tay: "اگر آب نیافتید یا برای شما زیان‌آور باشد، الله اجازه می‌دهد با خاک پاک خود را پاک کنید (تیمم) – در همان آیهٔ 5:6 و در 4:43. نیت می‌کنید، کف دست‌ها را بر خاک پاک می‌زنید و با آنها صورت و دست‌هایتان را مسح می‌کنید. اینکه چند بار دست بزنید و دست‌ها را تا کجا مسح کنید را مذاهب به‌گونه‌ای متفاوت بیان می‌کنند. به‌محض اینکه دوباره بتوانید از آب استفاده کنید، برای نماز بعدی دوباره وضو می‌گیرید.",
    virtueTitle: "چرا وضو این‌قدر ارزشمند است",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "الله کسانی را که توبه می‌کنند دوست دارد و کسانی را که خود را پاک می‌کنند دوست دارد.", src: "قرآن 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "پاکیزگی نیمی از ایمان است.", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "عثمان بن عفان نشان داد که پیامبر ﷺ چگونه وضو می‌گرفت و سخنان او را نقل کرد: هر که همچون این وضو بگیرد و سپس دو رکعت نماز بخواند بی‌آنکه افکارش پراکنده شود، گناهان پیشین او آمرزیده می‌شود.", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    quran: "قرآن", supply: "آب پاک",
    more: "به یادگیری ادامه دهید", links: [["/salah", "آموزش نماز – تمرین نماز"], ["/prayer", "اوقات نماز و اذان"], ["/islam", "شناخت اسلام – همهٔ فصل‌ها"], ["/islam/prayer-sunni", "وضو و نماز به تفصیل – اهل سنت"], ["/islam/prayer-shia", "وضو و نماز به تفصیل – شیعه"]],
  },
  ps: {
    kicker: "اودس · ګام په ګام", title: "اودس – د لمانځه لپاره څنګه ځان پاک کړو",
    lead: "مخکې له دې چې د الله په وړاندې ودرېږئ، تاسو ځان مینځئ – په اوبو او په نیت سره. تمرین تاسو ته هر ګام ښيي، وايي چې څه فرض دي او څه سپارښتل شوي، او په پای کې تاسو ځان په یوه لنډه پوښتنه ازمويئ.",
    verseKicker: "د اودس آیت", verseTitle: "الله د اودس په اړه څه فرمایي",
    verseLead: "اودس په خپله په قرآن کې راغلی: مخ، تر څنګلو پورې لاسونه، سر او تر ټخنو پورې پښې.",
    verseRef: "د المائدې سورت 5:6", listen: "آیت واورئ", trBy: "ژباړه",
    breaksTitle: "اودس څه ماتوي", breaksLead: "پر دې ټول مذهبونه متفق دي:",
    breaks: ["کله چې تشماله، غایطه یا باد له بدن څخه وځي", "ژور خوب", "د هوش له لاسه ورکول"],
    breaksNote: "نور مسایل – لکه لمس، وینه بهېدل یا نور وتونکي شیان – مذهبونه په بېلابېل ډول ارزوي. د هغو په اړه د خپل مذهب له یوه ښوونکي وپوښتئ.",
    tayTitle: "اوبه نشته؟ تیمم",
    tay: "که اوبه ونه مومئ، یا هغه ته تاسو زیان رسوي، الله تاسو ته اجازه درکوي چې په پاکې خاورې ځان پاک کړئ (تیمم) – په همدې 5:6 آیت او په 4:43 کې. تاسو نیت کوئ، خپل لاسونه پر پاکې خاورې ږدئ او په هغو خپل مخ او لاسونو ته مسح کوئ. څو ځله ږدل او د لاسونو څومره برخې ته مسح کول، مذهبونه په بېلابېل ډول بیانوي. همدا چې بیا اوبه وکاروئ، د راتلونکي لمانځه لپاره بیا اودس کوئ.",
    virtueTitle: "ولې اودس دومره ارزښت لري",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "الله هغه کسان خوښوي چې توبه کوي او هغه کسان خوښوي چې ځان پاکوي.", src: "قرآن 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "پاکوالی د ایمان نیمایي دی.", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "عثمان بن عفان وښودله چې پیغمبر ﷺ څنګه اودس کاوه او د هغه خبرې یې نقل کړې: څوک چې داسې اودس وکړي او بیا دوه رکعته لمونځ وکړي پرته له دې چې ذهن یې بل لوري ته ولاړ شي، د هغه تېر ګناهونه بښل کېږي.", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    quran: "قرآن", supply: "پاکې اوبه",
    more: "زده کړه ته دوام ورکړئ", links: [["/salah", "لمونځ زده کړه – د لمانځه تمرین"], ["/prayer", "د لمانځه وختونه او اذان"], ["/islam", "اسلام درک کړئ – ټول فصلونه"], ["/islam/prayer-sunni", "اودس او لمونځ په تفصیل – سني"], ["/islam/prayer-shia", "اودس او لمونځ په تفصیل – شیعه"]],
  },
  fr: {
    kicker: "Ablutions · pas à pas", title: "Les ablutions (wudu) – comment se purifier pour la prière",
    lead: "Avant de te tenir devant Allah, tu te laves – avec de l'eau et avec l'intention. L'entraînement te montre chaque étape, t'indique ce qui est obligatoire et ce qui est recommandé, et à la fin tu te testes avec un court quiz.",
    verseKicker: "Le verset des ablutions", verseTitle: "Ce qu'Allah dit des ablutions",
    verseLead: "Les ablutions sont prescrites dans le Coran lui-même : le visage, les bras jusqu'aux coudes, la tête et les pieds jusqu'aux chevilles.",
    verseRef: "Sourate al-Ma'ida 5:6", listen: "Écouter le verset", trBy: "Traduction",
    breaksTitle: "Ce qui annule les ablutions (wudu)", breaksLead: "Toutes les écoles s'accordent sur ces points :",
    breaks: ["Quand de l'urine, des selles ou des gaz quittent le corps", "Le sommeil profond", "La perte de conscience"],
    breaksNote: "D'autres points – comme le toucher, les saignements ou d'autres écoulements – sont jugés différemment par les écoles. Interroge à ce sujet un enseignant de ton école.",
    tayTitle: "Pas d'eau ? Le tayammum",
    tay: "Si tu ne trouves pas d'eau, ou si elle te nuirait, Allah te permet de te purifier avec de la terre propre (tayammum) – dans le même verset 5:6 et en 4:43. Tu formules l'intention, tu frappes de la terre propre avec tes paumes et tu t'en essuies le visage et les mains. Le nombre de frappes et l'étendue de ce qu'on essuie des mains sont décrits différemment par les écoles. Dès que tu peux de nouveau utiliser de l'eau, tu refais les ablutions (wudu) pour la prière suivante.",
    virtueTitle: "Pourquoi les ablutions valent-elles tant",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "Allah aime ceux qui se repentent et aime ceux qui se purifient.", src: "Coran 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "La pureté est la moitié de la foi.", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "Uthman ibn Affan a montré comment le Prophète ﷺ accomplissait les ablutions et a transmis ses paroles : quiconque fait ses ablutions ainsi, puis prie deux rak'at sans laisser ses pensées vagabonder, ses péchés passés lui sont pardonnés.", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    quran: "Coran", supply: "Eau propre",
    more: "Continuer à apprendre", links: [["/salah", "Apprendre à prier – l'entraînement à la prière"], ["/prayer", "Heures de prière et adhan"], ["/islam", "Comprendre l'islam – tous les chapitres"], ["/islam/prayer-sunni", "Ablutions et prière en détail – sunnite"], ["/islam/prayer-shia", "Ablutions et prière en détail – chiite"]],
  },
  es: {
    kicker: "Ablución · paso a paso", title: "La ablución (wudu): cómo purificarte para la oración",
    lead: "Antes de presentarte ante Allah, te lavas: con agua y con intención. El entrenador te muestra cada paso, te dice qué es obligatorio y qué es recomendable, y al final te pones a prueba con un breve cuestionario.",
    verseKicker: "La aleya del wudu", verseTitle: "Lo que dice Allah sobre la ablución",
    verseLead: "La ablución está establecida en el propio Corán: el rostro, los brazos hasta los codos, la cabeza y los pies hasta los tobillos.",
    verseRef: "Sura al-Ma'ida 5:6", listen: "Escuchar la aleya", trBy: "Traducción",
    breaksTitle: "Qué anula el wudu", breaksLead: "Todas las escuelas coinciden en esto:",
    breaks: ["Cuando orina, heces o gases salen del cuerpo", "El sueño profundo", "La pérdida del conocimiento"],
    breaksNote: "Otros puntos, como el contacto, el sangrado u otras secreciones, son juzgados de forma distinta por las escuelas. Pregunta por ellos a un maestro de tu escuela.",
    tayTitle: "¿Sin agua? El tayammum",
    tay: "Si no encuentras agua, o si te perjudicaría, Allah te permite purificarte con tierra limpia (tayammum), en la misma aleya 5:6 y en 4:43. Haces la intención, golpeas tierra limpia con las palmas y te pasas las manos por el rostro y las manos. Cuántas veces se golpea y hasta dónde se pasa por las manos lo describen de forma distinta las escuelas. En cuanto puedas volver a usar agua, haces de nuevo el wudu para la siguiente oración.",
    virtueTitle: "Por qué la ablución vale tanto",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "Allah ama a los que se arrepienten y ama a los que se purifican.", src: "Corán 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "La pureza es la mitad de la fe.", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "Uthman ibn Affan mostró cómo realizaba el Profeta ﷺ el wudu y transmitió sus palabras: quien haga el wudu así y luego rece dos rak'at sin dejar vagar sus pensamientos, se le perdonan sus pecados anteriores.", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    quran: "Corán", supply: "Agua limpia",
    more: "Sigue aprendiendo", links: [["/salah", "Aprende a rezar: el entrenador de oración"], ["/prayer", "Horarios de oración y adhan"], ["/islam", "Comprender el islam: todos los capítulos"], ["/islam/prayer-sunni", "Wudu y oración en detalle: suní"], ["/islam/prayer-shia", "Wudu y oración en detalle: chií"]],
  },
  id: {
    kicker: "Wudhu · langkah demi langkah", title: "Wudhu – cara bersuci untuk shalat",
    lead: "Sebelum berdiri di hadapan Allah, kamu membasuh diri – dengan air dan dengan niat. Latihan ini menunjukkan setiap langkah, memberi tahu mana yang wajib dan mana yang dianjurkan, dan di akhir kamu menguji dirimu dengan kuis singkat.",
    verseKicker: "Ayat wudhu", verseTitle: "Apa kata Allah tentang wudhu",
    verseLead: "Wudhu ditetapkan dalam Al-Qur'an sendiri: wajah, lengan hingga siku, kepala, dan kaki hingga mata kaki.",
    verseRef: "Surah Al-Ma'idah 5:6", listen: "Dengarkan ayat", trBy: "Terjemahan",
    breaksTitle: "Yang membatalkan wudhu", breaksLead: "Semua mazhab sepakat tentang hal-hal ini:",
    breaks: ["Ketika air seni, tinja, atau angin keluar dari tubuh", "Tidur nyenyak", "Hilang kesadaran"],
    breaksNote: "Hal-hal lain – seperti bersentuhan, pendarahan, atau cairan lain yang keluar – dinilai berbeda oleh para mazhab. Tanyakan kepada guru dari mazhabmu.",
    tayTitle: "Tidak ada air? Tayamum",
    tay: "Jika kamu tidak menemukan air, atau air akan membahayakanmu, Allah membolehkanmu bersuci dengan tanah yang bersih (tayamum) – dalam ayat 5:6 yang sama dan dalam 4:43. Kamu berniat, menepukkan kedua telapak tangan pada tanah bersih, lalu mengusap wajah dan kedua tangan dengannya. Berapa kali menepuk dan sejauh mana tangan diusap dijelaskan berbeda oleh para mazhab. Begitu kamu bisa memakai air lagi, kamu berwudhu lagi untuk shalat berikutnya.",
    virtueTitle: "Mengapa wudhu begitu berharga",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "Allah mencintai orang-orang yang bertobat dan mencintai orang-orang yang menyucikan diri.", src: "Al-Qur'an 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "Kesucian adalah separuh iman.", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "Utsman bin Affan memperlihatkan bagaimana Nabi ﷺ berwudhu dan menyampaikan sabdanya: siapa yang berwudhu seperti ini lalu shalat dua rakaat tanpa membiarkan pikirannya melayang, dosa-dosanya yang telah lalu diampuni.", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    quran: "Al-Qur'an", supply: "Air bersih",
    more: "Terus belajar", links: [["/salah", "Belajar shalat – latihan shalat"], ["/prayer", "Waktu shalat dan azan"], ["/islam", "Memahami Islam – semua bab"], ["/islam/prayer-sunni", "Wudhu dan shalat secara rinci – Sunni"], ["/islam/prayer-shia", "Wudhu dan shalat secara rinci – Syiah"]],
  },
  ms: {
    kicker: "Wudhu · langkah demi langkah", title: "Wudhu – cara bersuci untuk solat",
    lead: "Sebelum berdiri di hadapan Allah, anda membasuh diri – dengan air dan dengan niat. Latihan ini menunjukkan setiap langkah, memberitahu mana yang wajib dan mana yang digalakkan, dan pada akhirnya anda menguji diri dengan kuiz ringkas.",
    verseKicker: "Ayat wudhu", verseTitle: "Apa yang Allah firmankan tentang wudhu",
    verseLead: "Wudhu ditetapkan dalam Quran itu sendiri: muka, lengan hingga siku, kepala dan kaki hingga buku lali.",
    verseRef: "Surah al-Ma'idah 5:6", listen: "Dengar ayat ini", trBy: "Terjemahan",
    breaksTitle: "Perkara yang membatalkan wudhu", breaksLead: "Semua mazhab bersetuju tentang perkara ini:",
    breaks: ["Apabila air kencing, najis atau angin keluar daripada badan", "Tidur nyenyak", "Hilang kesedaran"],
    breaksNote: "Perkara lain – seperti bersentuhan, pendarahan atau cecair lain yang keluar – dinilai secara berbeza oleh mazhab-mazhab. Tanyalah guru daripada mazhab anda tentangnya.",
    tayTitle: "Tiada air? Tayamum",
    tay: "Jika anda tidak menemui air, atau air itu akan memudaratkan anda, Allah membenarkan anda bersuci dengan tanah yang bersih (tayamum) – dalam ayat 5:6 yang sama dan dalam 4:43. Anda berniat, menepuk tanah yang bersih dengan telapak tangan dan menyapu muka serta tangan dengannya. Berapa kali menepuk dan sejauh mana tangan disapu diterangkan secara berbeza oleh mazhab-mazhab. Sebaik sahaja anda boleh menggunakan air semula, anda berwudhu semula untuk solat yang seterusnya.",
    virtueTitle: "Mengapa wudhu begitu bernilai",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "Allah mencintai orang yang bertaubat dan mencintai orang yang menyucikan diri.", src: "Quran 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "Kesucian ialah separuh daripada iman.", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "Uthman bin Affan menunjukkan bagaimana Nabi ﷺ berwudhu dan menyampaikan sabdanya: sesiapa yang berwudhu seperti ini kemudian solat dua rakaat tanpa membiarkan fikirannya melayang, dosanya yang lalu diampunkan.", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    quran: "Quran", supply: "Air bersih",
    more: "Teruskan belajar", links: [["/salah", "Belajar solat – latihan solat"], ["/prayer", "Waktu solat dan azan"], ["/islam", "Memahami Islam – semua bab"], ["/islam/prayer-sunni", "Wudhu dan solat secara terperinci – Sunni"], ["/islam/prayer-shia", "Wudhu dan solat secara terperinci – Syiah"]],
  },
  bn: {
    kicker: "ওযু · ধাপে ধাপে", title: "ওযু – নামাজের জন্য কীভাবে পবিত্র হবেন",
    lead: "আল্লাহর সামনে দাঁড়ানোর আগে আপনি ধৌত করেন – পানি দিয়ে এবং নিয়ত নিয়ে। প্রশিক্ষণটি প্রতিটি ধাপ দেখায়, কোনটি ফরজ আর কোনটি মুস্তাহাব তা বলে দেয়, এবং শেষে একটি ছোট কুইজে আপনি নিজেকে যাচাই করেন।",
    verseKicker: "ওযুর আয়াত", verseTitle: "ওযু সম্পর্কে আল্লাহ কী বলেন",
    verseLead: "ওযুর বিধান কুরআনেই আছে: মুখমণ্ডল, কনুই পর্যন্ত দুই হাত, মাথা এবং টাখনু পর্যন্ত দুই পা।",
    verseRef: "সূরা আল-মায়িদা 5:6", listen: "আয়াতটি শুনুন", trBy: "অনুবাদ",
    breaksTitle: "যা ওযু ভঙ্গ করে", breaksLead: "এই বিষয়গুলোতে সব মাযহাব একমত:",
    breaks: ["যখন প্রস্রাব, পায়খানা বা বায়ু দেহ থেকে বের হয়", "গভীর ঘুম", "জ্ঞান হারানো"],
    breaksNote: "অন্যান্য বিষয় – যেমন স্পর্শ, রক্তপাত বা অন্য নির্গমন – মাযহাবগুলো ভিন্নভাবে বিচার করে। এগুলো সম্পর্কে আপনার মাযহাবের একজন শিক্ষককে জিজ্ঞাসা করুন।",
    tayTitle: "পানি নেই? তায়াম্মুম",
    tay: "পানি না পেলে, বা পানি ব্যবহারে ক্ষতি হলে, আল্লাহ আপনাকে পবিত্র মাটি দিয়ে পবিত্রতা অর্জনের (তায়াম্মুম) অনুমতি দিয়েছেন – একই 5:6 আয়াতে এবং 4:43-এ। আপনি নিয়ত করেন, পবিত্র মাটিতে দুই হাতের তালু মারেন এবং তা দিয়ে মুখ ও হাত মাসেহ করেন। কতবার মারতে হবে এবং হাতের কতটুকু পর্যন্ত মাসেহ করতে হবে তা মাযহাবগুলো ভিন্নভাবে বর্ণনা করে। আবার পানি ব্যবহার করতে পারলেই পরবর্তী নামাজের জন্য আপনি আবার ওযু করেন।",
    virtueTitle: "কেন ওযুর এত মূল্য",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "আল্লাহ তাওবাকারীদের ভালোবাসেন এবং যারা নিজেদের পবিত্র করে তাদের ভালোবাসেন।", src: "কুরআন 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "পবিত্রতা ঈমানের অর্ধেক।", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "উসমান ইবনে আফফান দেখিয়েছিলেন নবী ﷺ কীভাবে ওযু করতেন এবং তাঁর কথা বর্ণনা করেছেন: যে ব্যক্তি এভাবে ওযু করে তারপর চিন্তা এলোমেলো হতে না দিয়ে দুই রাকাত নামাজ পড়ে, তার আগের গুনাহ ক্ষমা করা হয়।", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    quran: "কুরআন", supply: "পরিষ্কার পানি",
    more: "শিখতে থাকুন", links: [["/salah", "নামাজ শিখুন – নামাজ প্রশিক্ষণ"], ["/prayer", "নামাজের সময় ও আযান"], ["/islam", "ইসলাম বুঝুন – সব অধ্যায়"], ["/islam/prayer-sunni", "ওযু ও নামাজ বিস্তারিত – সুন্নি"], ["/islam/prayer-shia", "ওযু ও নামাজ বিস্তারিত – শিয়া"]],
  },
  ru: {
    kicker: "Омовение (вуду) · шаг за шагом", title: "Омовение (вуду) – как очиститься для намаза",
    lead: "Прежде чем встать перед Аллахом, ты совершаешь омовение – водой и с намерением. Тренажёр показывает каждый шаг, говорит, что обязательно, а что желательно, а в конце ты проверяешь себя коротким тестом.",
    verseKicker: "Аят об омовении", verseTitle: "Что Аллах говорит об омовении",
    verseLead: "Омовение предписано в самом Коране: лицо, руки до локтей, голова и ноги до щиколоток.",
    verseRef: "Сура аль-Маида 5:6", listen: "Послушать аят", trBy: "Перевод",
    breaksTitle: "Что нарушает омовение (вуду)", breaksLead: "В этом согласны все школы:",
    breaks: ["Когда из тела выходят моча, кал или газы", "Глубокий сон", "Потеря сознания"],
    breaksNote: "Другие случаи – например, прикосновение, кровотечение или иные выделения – школы оценивают по-разному. Спроси об этом наставника своей школы.",
    tayTitle: "Нет воды? Тайаммум",
    tay: "Если ты не можешь найти воду или она причинила бы тебе вред, Аллах разрешает очиститься чистой землёй (тайаммум) – в том же аяте 5:6 и в 4:43. Ты делаешь намерение, ударяешь ладонями по чистой земле и проводишь ими по лицу и рукам. Сколько раз ударять и докуда проводить по рукам, школы описывают по-разному. Как только ты снова сможешь пользоваться водой, ты снова совершаешь омовение (вуду) для следующего намаза.",
    virtueTitle: "Почему омовение так ценно",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "Аллах любит кающихся и любит очищающихся.", src: "Коран 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "Чистота – половина веры.", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "Усман ибн Аффан показал, как Пророк ﷺ совершал омовение, и передал его слова: тому, кто совершит омовение так, а затем совершит два ракаата, не давая мыслям блуждать, будут прощены его прежние грехи.", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    quran: "Коран", supply: "Чистая вода",
    more: "Продолжай учиться", links: [["/salah", "Учимся намазу – тренажёр намаза"], ["/prayer", "Время намаза и азан"], ["/islam", "Понять ислам – все главы"], ["/islam/prayer-sunni", "Омовение и намаз подробно – сунниты"], ["/islam/prayer-shia", "Омовение и намаз подробно – шииты"]],
  },
  zh: {
    kicker: "小净 · 一步一步", title: "小净——如何为礼拜做洁净",
    lead: "站在安拉面前之前，你要清洗自己——用水，并怀着意念。训练会演示每一步，告诉你哪些是必须的、哪些是建议的，最后你可以用一个简短的测验检验自己。",
    verseKicker: "小净经文", verseTitle: "安拉关于小净所说的话",
    verseLead: "小净载于古兰经本身：洗脸、洗双臂至肘、抹头、洗双脚至脚踝。",
    verseRef: "筵席章 5:6", listen: "收听经文", trBy: "译文",
    breaksTitle: "什么会使小净失效", breaksLead: "各学派对这些情况意见一致：",
    breaks: ["尿、便或气体从身体排出时", "沉睡", "失去知觉"],
    breaksNote: "其他情况——例如触碰、出血或其他排泄物——各学派的判断不同。请向你所属学派的老师请教。",
    tayTitle: "没有水？土净",
    tay: "如果找不到水，或用水会对你有害，安拉允许你用洁净的泥土做净（土净）——就在同一节经文 5:6 以及 4:43 中。你立意，用双掌拍在洁净的泥土上，再用它们抹脸和双手。拍几次、双手抹到什么位置，各学派的说法不同。一旦能再用水，下一次礼拜前你就重新做小净。",
    virtueTitle: "小净为何如此珍贵",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "安拉喜爱忏悔的人，也喜爱洁净自己的人。", src: "古兰经 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "洁净是信仰的一半。", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "奥斯曼·本·阿凡示范了先知ﷺ如何做小净，并传述了他的话：谁这样做小净，然后礼两拉克尔提而不让思绪游离，他以前的罪过就会得到饶恕。", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    quran: "古兰经", supply: "干净的水",
    more: "继续学习", links: [["/salah", "学习礼拜——礼拜训练"], ["/prayer", "礼拜时间与宣礼"], ["/islam", "了解伊斯兰——全部章节"], ["/islam/prayer-sunni", "小净与礼拜详解——逊尼派"], ["/islam/prayer-shia", "小净与礼拜详解——什叶派"]],
  },
};
const content = (l: string) => C[langOf(l)];

// Quran 5:6 from Quran.com (through our cache): Arabic plus a translation; nothing if unavailable.
// German and English keep their fixed translations; every other language gets the one the site uses for that language
// elsewhere (pickTranslation), named by its author.
async function wuduVerse(locale: string) {
  try {
    let id = locale === "de" ? 27 : 20;
    let by = "";
    if (locale !== "de" && locale !== "en" && locale !== "ar") {
      by = "Saheeh International"; // the English default if the list of translations is not available
      try {
        const { translations } = await getResources();
        id = pickTranslation(locale, translations);
        const t = translations.find((x) => x.id === id);
        by = t ? t.author_name || t.name : "";
      } catch { /* default translation */ }
    }
    const v = await getVerseByKey("5:6", locale, id);
    if (v.verse_key !== "5:6") return null;
    return { ar: v.text_uthmani, tr: v.translation.replace(/<[^>]+>/g, "").trim(), by };
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content(locale);
  return pageMeta(locale, "/wudu", `${c.kicker} | Quran Masterclass`, c.lead.slice(0, 158));
}

export default async function WuduPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content(locale);
  const lang = langOf(locale);
  const verse = await wuduVerse(locale);
  const ld = {
    "@context": "https://schema.org", "@type": "HowTo", name: c.title, description: c.lead, url: abs(`/${locale}/wudu`), inLanguage: locale,
    supply: [{ "@type": "HowToSupply", name: c.supply }],
    step: WUDU.sunni.map((s, k) => ({ "@type": "HowToStep", position: k + 1, name: s.title[lang], text: s.text[lang] })),
  };
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <CalligraphyDraw text={"الوضوء"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{c.kicker}</p>
          <h1 className="font-display mt-4 max-w-3xl text-[40px] leading-[1.05] sm:text-6xl">{c.title}</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70">{c.lead}</p>
        </div>
        <div className="pa-arcade" />
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-5 sm:pt-10">
        <WuduTrainer />

        <section className="mt-14 sm:mt-20">
          <div className="callout rounded-lg p-5 sm:p-8">
            <p className="eyebrow">{c.verseKicker}</p>
            <h2 className="font-display mt-2 text-3xl leading-tight sm:text-4xl">{c.verseTitle}</h2>
            <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-muted">{c.verseLead}</p>
            {verse?.ar && <p className="font-arabic mt-6 text-[24px] leading-[2.15] sm:text-[30px]" dir="rtl" lang="ar">{verse.ar} <span className="verse-end">﴿٦﴾</span></p>}
            {verse?.tr && lang !== "ar" && <p className="mt-4 max-w-4xl text-[16px] leading-relaxed text-ink/90">{verse.tr}</p>}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="font-semibold text-gold">{c.verseRef}</span>
              {verse?.tr && lang !== "ar" && <span className="text-muted">{verse.by ? `${c.trBy}: ${verse.by}` : c.trBy}</span>}
              <Link href="/surah/5?v=6" className="inline-block py-2 font-semibold text-accent hover:underline">{c.listen} <ArrowNext /></Link>
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-5 sm:mt-16 lg:grid-cols-2">
          <div className="pa-card p-5 pt-6 sm:p-7">
            <h2 className="font-display text-2xl leading-tight sm:text-3xl">{c.breaksTitle}</h2>
            <p className="mt-2 text-[15px] text-muted">{c.breaksLead}</p>
            <ul className="mt-4 grid gap-2.5">
              {c.breaks.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[16px] leading-snug">
                  <PracticeStar size={14} className="mt-1" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-[rgb(var(--gold))]/20 pt-4 text-[14.5px] leading-relaxed text-muted">{c.breaksNote}</p>
          </div>
          <div className="pa-card p-5 pt-6 sm:p-7">
            <h2 className="font-display text-2xl leading-tight sm:text-3xl">{c.tayTitle}</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-ink/90">{c.tay}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[["/surah/5?v=6", "5:6"], ["/surah/4?v=43", "4:43"]].map(([h, l]) => (
                <Link key={h} href={h} className="pa-chip tabular-nums">{lang === "ar" ? (l === "5:6" ? "المائدة: 6" : "النساء: 43") : `${c.quran} ${l}`}</Link>
              ))}
            </div>
          </div>
        </section>

        <Divider className="mt-14 sm:mt-16" />

        <section className="mt-10 sm:mt-12">
          <h2 className="font-display text-3xl leading-tight sm:text-4xl">{c.virtueTitle}</h2>
          <ul className="mt-7 grid gap-4 md:grid-cols-2">
            {c.virtues.map((v, k) => (
              <li key={v.src} className={`pa-card flex flex-col p-5 pt-7 sm:p-7 ${k === 2 ? "md:col-span-2" : ""}`}>
                {lang === "ar" && v.text && <p className="text-[15px] leading-relaxed text-muted">{v.text}</p>}
                <p className="font-arabic text-[23px] leading-[2] sm:text-[25px]" dir="rtl" lang="ar">{v.ar}</p>
                {lang !== "ar" && <p className="mt-2 text-[15.5px] leading-relaxed text-ink/90">{v.text}</p>}
                <p className="mt-auto pt-4 text-[13px] font-semibold text-gold">
                  {v.href ? <Link href={v.href} className="hover:underline">{v.src}</Link> : v.src}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="pa-card mt-12 p-5 pt-6 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted rtl:tracking-normal">{c.more}</p>
          <ul className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {c.links.map(([h, l]) => <li key={h}><Link href={h} className="flex min-h-11 items-center gap-2.5 rounded-lg px-2 font-semibold leading-snug text-accent hover:bg-[rgb(var(--gold))]/10"><PracticeStar size={10} /><span className="min-w-0 flex-1">{l}</span><ArrowNext /></Link></li>)}
          </ul>
        </section>
      </main>
      <MoreTiles keys={["salah", "prayer", "duas", "islam"]} />
    </div>
  );
}
