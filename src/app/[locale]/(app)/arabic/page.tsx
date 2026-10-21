import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import ArabicHome from "@/components/ArabicHome";
import { LESSONS, UNITS, type L2, type Lang } from "@/lib/arabic";
import { PracticeStar, PracticeStarNum, PracticeWindow } from "@/components/art/PracticeArt";
import { PracticeAlphabetRing, PracticeLetterSheet } from "@/components/art/PracticeAlphabet";
import { abs, pageMeta } from "@/lib/site";
import { MoreTiles } from "@/components/PosterTiles";
import DonateCTA from "@/components/DonateCTA";

type Content = {
  kicker: string; title: string; lead: string; stats: string[]; pathTitle: string; alphaTitle: string;
  howTitle: string; how: [string, string][]; teacher: string; after: string; afterBody: string; ctaPath: string; ctaPlace: string;
  signsTitle: string; signsLead: string; sheetTitle: string; sheetLead: string; makhTitle: string; makhLead: string; makh: [string, string, string][];
  faqTitle: string; faq: [string, string][]; ctaShams: string; ctaTajweed: string;
};

const C: Record<Lang, Content> = {
  de: {
    kicker: "Arabisch lesen lernen · für Anfänger", title: "Lesen Sie den Koran – auch wenn Sie heute noch keinen Buchstaben kennen",
    lead: "Dieser Kurs bringt Ihnen das Lesen der Koranschrift bei, so wie es Koranschulen seit Generationen tun: erst die Buchstaben, dann ihre Formen, dann die Vokalzeichen – bis Sie Al-Fatiha und die kurzen Suren selbst lesen. In kleinen Lektionen von fünf Minuten, mit Übungen, Paaren und Tests.",
    stats: [`${LESSONS.length} Lektionen`, `${UNITS.length} Einheiten`, "28 Buchstaben", "5 Min. pro Lektion"],
    pathTitle: "Ihr Lernpfad", alphaTitle: "Das arabische Alphabet",
    howTitle: "So lernen Sie hier", how: [
      ["Kurze Lektionen", "Jede Lektion dauert etwa fünf Minuten: erst Lernkarten, dann abwechslungsreiche Übungen."],
      ["Fehler kommen zurück", "Was Sie falsch beantworten, kommt am Ende der Lektion noch einmal – so lange, bis es sitzt."],
      ["Laut mitsprechen", "Lesen lernt man mit dem Mund. Sprechen Sie jeden Laut mit – wo Ihr Gerät eine arabische Stimme hat, können Sie ihn anhören."],
      ["Vom Buchstaben zum Koran", "In Einheit 6 lesen Sie echte Koranwörter aus Al-Fatiha, Al-Ikhlas, Al-Falaq und An-Nas – mit Bedeutung. Danach hören Sie sie Wort für Wort in echter Rezitation und lesen ganze Verse. Wer schon etwas lesen kann, startet mit dem Einstufungstest."],
    ],
    teacher: "Die Aussprache mancher Laute (ح ع ق ص ض ط ظ) lernt man am besten durch Zuhören und mit einem Lehrer. Hören Sie im Player einem Rezitator zu und sprechen Sie nach – das ist der Weg, den auch Koranschulen gehen.",
    after: "Nach dem Kurs", afterBody: "Wenn Sie lesen können, beginnt das eigentliche Abenteuer: Mit der Shams-Methode lernen Sie Vers für Vers auswendig, im Tajwid-Kurs lernen Sie die Regeln der schönen Rezitation.",
    ctaPath: "Zum Lernpfad", ctaPlace: "Einstufungstest",
    signsTitle: "Die Zeichen der Koranschrift", signsLead: "Vokale, Dehnung, Verdopplung und die Besonderheiten des Mushaf – jedes Zeichen mit einem Beispiel. In den Einheiten 3 bis 5 üben Sie sie alle.",
    sheetTitle: "Alle Buchstaben auf einen Blick", sheetLead: "Name, Laut und die drei verbundenen Formen. Arabisch liest man von rechts nach links – die Form am Wortanfang steht rechts.",
    makhTitle: "Woher die Laute kommen", makhLead: "In der Tajwid-Lehre hat jeder Buchstabe seinen Austrittsort (Machradsch). Diese vier Gruppen helfenen Sie sich am Anfang besonders:",
    makh: [
      ["Aus der Kehle", "ء ه ع ح غ خ", "Sechs Buchstaben kommen aus der Kehle: ء und ه ganz aus der Tiefe, ع und ح aus der Mitte, غ und خ aus dem oberen Teil."],
      ["Mit den Lippen", "ف ب م و", "Vier Buchstaben bilden die Lippen: ف mit der Unterlippe und den oberen Schneidezähnen, ب und م mit geschlossenen Lippen, و mit gerundeten Lippen."],
      ["Die schweren Buchstaben", "خ ص ض غ ط ق ظ", "Sieben Buchstaben werden immer „schwer“ und voll gesprochen (Tafchim), weil sich der hintere Teil der Zunge hebt. Merksatz: «خُصَّ ضَغْطٍ قِظْ»."],
      ["Die Dehnungsbuchstaben", "ا و ي", "ا, و und ي verlängern den Vokal davor, wenn sie selbst keinen Vokal tragen: das lange ā, ū und ī. Ihr Austrittsort ist der Hohlraum von Mund und Kehle (al-Dschauf)."],
    ] as [string, string, string][],
    faqTitle: "Häufige Fragen", faq: [
      ["Wie lange dauert der Kurs?", `${LESSONS.length} kurze Lektionen von etwa fünf Minuten in ${UNITS.length} Einheiten. Mit einer Lektion am Tag lesen Sie nach wenigen Wochen ganze Verse – wer mehr Zeit hat, kommt schneller voran.`],
      ["Muss ich Arabisch verstehen?", "Nein. Der Kurs bringt Ihnen das Lesen der Schrift bei. Die Bedeutung vieler Koranwörter lernen Sie nebenbei – für mehr Wortschatz gibt es den Vokabeltrainer."],
      ["Welche Schrift lerne ich?", "Die Schrift des Korans mit allen Vokal- und Lesezeichen, wie im Mushaf – mit ihren Besonderheiten wie dem kleinen Alif und dem Wasla-Zeichen. Ab Einheit 6 lesen Sie echte Wörter und Verse aus dem Koran."],
      ["Brauche ich ein Konto?", "Ja, ein kostenloses. Darin wird Ihr Fortschritt gespeichert – Lektionen, Sterne und die Wörter, die Sie wiederholen sollten – und auf allen Ihren Geräten synchronisiert."],
      ["Ist der Kurs für Kinder geeignet?", "Ja. Die Lektionen sind kurz und spielerisch. Am schönsten ist es, wenn Eltern sie gemeinsam mit ihren Kindern machen und jeden Laut zusammen aussprechen."],
    ] as [string, string][],
    ctaShams: "Zur Shams-Methode", ctaTajweed: "Zum Tajwid-Kurs",
  },
  en: {
    kicker: "Learn to read Arabic · for beginners", title: "Read the Quran – even if you don't know a single letter today",
    lead: "This course teaches you to read the Quranic script the way Quran schools have done for generations: first the letters, then their shapes, then the vowel signs – until you read Al-Fatiha and the short surahs yourself. In small five-minute lessons, with exercises, pairs and tests.",
    stats: [`${LESSONS.length} lessons`, `${UNITS.length} units`, "28 letters", "5 min per lesson"],
    pathTitle: "Your learning path", alphaTitle: "The Arabic alphabet",
    howTitle: "How you learn here", how: [
      ["Short lessons", "Each lesson takes about five minutes: first learning cards, then varied exercises."],
      ["Mistakes come back", "Whatever you get wrong comes back at the end of the lesson – until it sticks."],
      ["Say it out loud", "You learn to read with your mouth. Say every sound – where your device has an Arabic voice you can listen to it."],
      ["From letters to the Quran", "In unit 6 you read real Quran words from Al-Fatiha, Al-Ikhlas, Al-Falaq and An-Nas – with their meaning. Then you hear them word by word in real recitation and read whole verses. If you can already read a little, start with the placement test."],
    ],
    teacher: "Some sounds (ح ع ق ص ض ط ظ) are best learned by listening and with a teacher. Listen to a reciter in the player and repeat – the same way Quran schools teach.",
    after: "After the course", afterBody: "Once you can read, the real adventure begins: with the Shams Method you memorise verse by verse, and the tajweed course teaches the rules of beautiful recitation.",
    ctaPath: "See the learning path", ctaPlace: "Placement test",
    signsTitle: "The signs of the Quranic script", signsLead: "Vowels, lengthening, doubling and the particular signs of the mushaf – every sign with an example. You practise all of them in units 3 to 5.",
    sheetTitle: "Every letter at a glance", sheetLead: "Name, sound and the three joined forms. Arabic is read from right to left – the form at the start of a word stands on the right.",
    makhTitle: "Where the sounds come from", makhLead: "In tajweed every letter has its point of articulation (makhraj). These four groups help you most at the start:",
    makh: [
      ["From the throat", "ء ه ع ح غ خ", "Six letters come from the throat: ء and ه from its deepest part, ع and ح from the middle, غ and خ from the upper part."],
      ["With the lips", "ف ب م و", "Four letters are formed by the lips: ف with the lower lip and the upper front teeth, ب and م with closed lips, و with rounded lips."],
      ["The heavy letters", "خ ص ض غ ط ق ظ", "Seven letters are always pronounced “heavy” and full (tafkhim), because the back of the tongue rises. Memory aid: «خُصَّ ضَغْطٍ قِظْ»."],
      ["The letters of lengthening", "ا و ي", "ا, و and ي lengthen the vowel before them when they carry no vowel themselves: the long ā, ū and ī. They come from the open space of the mouth and throat (al-jawf)."],
    ] as [string, string, string][],
    faqTitle: "Frequently asked questions", faq: [
      ["How long does the course take?", `${LESSONS.length} short lessons of about five minutes in ${UNITS.length} units. With one lesson a day you read whole verses within a few weeks – with more time you progress faster.`],
      ["Do I need to understand Arabic?", "No. The course teaches you to read the script. You pick up the meaning of many Quran words along the way – for more vocabulary there is the vocabulary trainer."],
      ["Which script do I learn?", "The script of the Quran with all its vowel and reading signs, as in the mushaf – including its particular signs such as the small alif and the wasla. From unit 6 you read real words and verses from the Quran."],
      ["Do I need an account?", "Yes, a free one. It keeps your progress – lessons, stars and the words you should review – and syncs it to all your devices."],
      ["Is the course suitable for children?", "Yes. The lessons are short and playful. It is most beautiful when parents do them together with their children and say every sound together."],
    ] as [string, string][],
    ctaShams: "Discover the Shams Method", ctaTajweed: "Tajweed course",
  },
  ar: {
    kicker: "تعلّم القراءة العربية · للمبتدئين", title: "اقرأ القرآن – ولو لم تكن تعرف اليوم حرفًا واحدًا",
    lead: "تعلّمك هذه الدورة قراءة الرسم القرآني كما دأبت مدارس تحفيظ القرآن جيلًا بعد جيل: الحروف أولًا، ثم أشكالها، ثم الحركات – حتى تقرأ الفاتحة والسور القصيرة بنفسك. في دروس صغيرة مدة كلٍّ منها خمس دقائق، مع تمارين وأزواج واختبارات.",
    stats: [`${LESSONS.length} درسًا`, `${UNITS.length} وحدات`, "28 حرفًا", "5 دقائق لكل درس"],
    pathTitle: "مسار تعلّمك", alphaTitle: "الأبجدية العربية",
    howTitle: "كيف تتعلّم هنا", how: [
      ["دروس قصيرة", "يستغرق كل درس نحو خمس دقائق: بطاقات تعليمية أولًا، ثم تمارين متنوعة."],
      ["الأخطاء تعود إليك", "كل ما أخطأت فيه يعود في آخر الدرس – حتى يثبت في ذهنك."],
      ["انطق بصوتك", "القراءة تُتعلَّم بالفم. انطق كل حرف بصوتك، وإن كان في جهازك صوت عربي فيمكنك الاستماع إليه."],
      ["من الحرف إلى القرآن", "في الوحدة السادسة تقرأ كلمات قرآنية حقيقية من الفاتحة والإخلاص والفلق والناس – مع معانيها. ثم تسمعها كلمةً كلمة بتلاوةٍ حقيقية، وتقرأ الآيات كاملة. ومن كان يقرأ شيئًا من قبل فليبدأ باختبار تحديد المستوى."],
    ],
    teacher: "إن مخارج بعض الحروف (ح ع ق ص ض ط ظ) تُتقَن بالسماع والتلقّي عن معلّم. استمع إلى قارئ في المشغّل ورَدِّد خلفه – فهذا هو الطريق الذي تسلكه مدارس القرآن.",
    after: "بعد الدورة", afterBody: "إذا صرت تقرأ فقد بدأت الرحلة الحقيقية: بمنهج شمس تحفظ آيةً آيةً، وفي دورة التجويد تتعلّم أحكام التلاوة الحسنة.",
    ctaPath: "إلى مسار التعلّم", ctaPlace: "اختبار تحديد المستوى",
    signsTitle: "علامات الضبط في المصحف", signsLead: "الحركات والمدود والتشديد وما يختصّ به رسم المصحف – كل علامةٍ بمثال، وتتدرّب عليها جميعًا في الوحدات من الثالثة إلى الخامسة.",
    sheetTitle: "الحروف كلها في لمحة", sheetLead: "اسم الحرف وصوته وأشكاله الثلاثة عند الوصل. تُقرأ العربية من اليمين إلى اليسار، فشكل الحرف في أول الكلمة يقع على اليمين.",
    makhTitle: "مخارج الحروف", makhLead: "لكل حرفٍ في علم التجويد مخرجٌ يخرج منه، وتعينك هذه المجموعات الأربع في البداية خاصة:",
    makh: [
      ["حروف الحلق", "ء ه ع ح غ خ", "ستة أحرف تخرج من الحلق: الهمزة والهاء من أقصاه، والعين والحاء من وسطه، والغين والخاء من أدناه."],
      ["الحروف الشفوية", "ف ب م و", "أربعة أحرف تخرج من الشفتين: الفاء من باطن الشفة السفلى مع أطراف الثنايا العليا، والباء والميم بانطباق الشفتين، والواو بانضمامهما."],
      ["حروف الاستعلاء", "خ ص ض غ ط ق ظ", "سبعة أحرف تُفخَّم دائمًا لاستعلاء أقصى اللسان عند النطق بها، ويجمعها قولهم: «خُصَّ ضَغْطٍ قِظْ»."],
      ["حروف المدّ", "ا و ي", "الألف والواو والياء حروف مدٍّ إذا سكنت وجانسها ما قبلها، فتمدّ الصوت: «ـَا» و«ـُو» و«ـِي». ومخرجها الجوف: الخلاء الممتد في الحلق والفم."],
    ] as [string, string, string][],
    faqTitle: "أسئلة شائعة", faq: [
      ["كم تستغرق الدورة؟", `${LESSONS.length} درسًا قصيرًا، مدة كلٍّ منها نحو خمس دقائق، في ${UNITS.length} وحدات. بدرسٍ واحد كل يوم تقرأ آياتٍ كاملة في غضون أسابيع قليلة، ومن كان لديه وقتٌ أكثر تقدّم أسرع.`],
      ["هل يجب أن أفهم العربية؟", "لا. تعلّمك الدورة قراءة الحروف والكلمات، وتتعرّف في أثناء ذلك على معاني كثيرٍ من كلمات القرآن، ولمزيدٍ من المفردات استعمل مدرّب المفردات."],
      ["بأيّ رسمٍ أتعلّم؟", "برسم المصحف مع جميع علامات الضبط، بما فيه ما يختصّ به كالألف الخنجرية وهمزة الوصل. ومن الوحدة السادسة تقرأ كلماتٍ وآياتٍ حقيقية من القرآن الكريم."],
      ["هل أحتاج إلى حساب؟", "نعم، حسابٌ مجاني يُحفظ فيه تقدّمك – الدروس والنجوم والكلمات التي تحتاج إلى مراجعتها – ويُزامَن على جميع أجهزتك."],
      ["هل تناسب الدورة الأطفال؟", "نعم، فالدروس قصيرة وممتعة، وأجمل ما تكون حين يؤدّيها الوالدان مع أبنائهم وينطقون كل حرفٍ معًا."],
    ] as [string, string][],
    ctaShams: "تعرّف على منهج شمس", ctaTajweed: "دورة التجويد",
  },
  tr: {
    kicker: "Arapça okumayı öğren · yeni başlayanlar için",
    title: "Kur’an’ı oku – bugün tek bir harf bile bilmesen de",
    lead: "Bu kurs, Kur’an yazısını Kur’an kurslarının nesillerdir yaptığı gibi öğretir: önce harfler, sonra şekilleri, sonra harekeler – Fâtiha’yı ve kısa sureleri kendin okuyana kadar. Beş dakikalık küçük derslerle; alıştırmalar, eşleştirmeler ve testlerle.",
    stats: [`${LESSONS.length} ders`, `${UNITS.length} ünite`, "28 harf", "ders başına 5 dk"],
    pathTitle: "Öğrenme yolun",
    alphaTitle: "Arap alfabesi",
    howTitle: "Burada nasıl öğrenirsin",
    how: [
      ["Kısa dersler", "Her ders yaklaşık beş dakika sürer: önce öğrenme kartları, sonra çeşitli alıştırmalar."],
      ["Hatalar geri gelir", "Yanlış yaptığın her şey dersin sonunda yeniden karşına çıkar – ta ki yerleşene kadar."],
      ["Yüksek sesle söyle", "Okumayı ağzınla öğrenirsin. Her sesi söyle – cihazında Arapça bir ses varsa onu dinleyebilirsin."],
      ["Harflerden Kur’an’a", "6. ünitede Fâtiha, İhlâs, Felak ve Nâs surelerinden gerçek Kur’an kelimelerini anlamlarıyla birlikte okursun. Ardından onları gerçek tilavette kelime kelime dinler ve ayetlerin tamamını okursun. Zaten biraz okuyabiliyorsan seviye belirleme testiyle başla."],
    ],
    teacher: "Bazı sesler (ح ع ق ص ض ط ظ) en iyi dinleyerek ve bir öğretmenle öğrenilir. Oynatıcıda bir kâriyi dinle ve tekrar et – Kur’an kurslarında öğretildiği gibi.",
    after: "Kurstan sonra",
    afterBody: "Okumayı öğrenince asıl yolculuk başlar: Shams Metodu ile ayet ayet ezberlersin, tecvid kursu ise güzel tilavetin kurallarını öğretir.",
    ctaPath: "Öğrenme yolunu gör",
    ctaPlace: "Seviye belirleme testi",
    signsTitle: "Kur’an yazısının işaretleri",
    signsLead: "Harekeler, uzatma, ikileme ve mushafın kendine özgü işaretleri – her işaret bir örnekle. Hepsini 3. ile 5. üniteler arasında çalışırsın.",
    sheetTitle: "Bir bakışta tüm harfler",
    sheetLead: "Ad, ses ve bitişik üç şekil. Arapça sağdan sola okunur – kelimenin başındaki şekil sağda durur.",
    makhTitle: "Seslerin geldiği yerler",
    makhLead: "Tecvidde her harfin bir çıkış noktası (mahreç) vardır. Başlangıçta en çok şu dört grup işine yarar:",
    makh: [
      ["Boğazdan", "ء ه ع ح غ خ", "Altı harf boğazdan çıkar: ء ve ه boğazın en derininden, ع ve ح ortasından, غ ve خ üst kısmından."],
      ["Dudaklarla", "ف ب م و", "Dört harf dudaklarla oluşur: ف alt dudak ve üst ön dişlerle, ب ve م kapalı dudaklarla, و yuvarlanmış dudaklarla."],
      ["Kalın harfler", "خ ص ض غ ط ق ظ", "Yedi harf, dilin arka kısmı yükseldiği için her zaman “kalın” ve dolgun (tafkhim) okunur. Hatırlatıcı: “خُصَّ ضَغْطٍ قِظْ”."],
      ["Uzatma harfleri", "ا و ي", "ا, و ve ي, kendileri ünlü taşımadıklarında kendilerinden önceki ünlüyü uzatır: uzun ā, ū ve ī. Ağız ve boğazın boşluğundan (al-jawf) çıkarlar."],
    ],
    faqTitle: "Sık sorulan sorular",
    faq: [
      ["Kurs ne kadar sürer?", `${UNITS.length} ünitede, her biri yaklaşık beş dakikalık ${LESSONS.length} kısa ders. Günde bir dersle birkaç hafta içinde ayetlerin tamamını okursun – daha fazla zamanla daha hızlı ilerlersin.`],
      ["Arapça bilmem gerekiyor mu?", "Hayır. Kurs sana yazıyı okumayı öğretir. Bu sırada birçok Kur’an kelimesinin anlamını da öğrenirsin – daha fazla kelime için Kelime hazinesi bölümü var."],
      ["Hangi yazıyı öğreniyorum?", "Kur’an yazısını, mushafta olduğu gibi tüm hareke ve okuma işaretleriyle – küçük alif ve wasla gibi kendine özgü işaretleri de dahil. 6. üniteden itibaren Kur’an’dan gerçek kelimeleri ve ayetleri okursun."],
      ["Hesap açmam gerekiyor mu?", "Evet, ücretsiz bir hesap. İlerlemeni – dersleri, yıldızları ve tekrar etmen gereken kelimeleri – saklar ve tüm cihazlarında eşitler."],
      ["Kurs çocuklar için uygun mu?", "Evet. Dersler kısa ve oyunlu. Ebeveynler dersleri çocuklarıyla birlikte yaptığında ve her sesi birlikte söylediğinde en güzelidir."],
    ],
    ctaShams: "Shams Metodu’nu keşfet",
    ctaTajweed: "Tecvid kursu",
  },
  ur: {
    kicker: "عربی پڑھنا سیکھیں · مبتدیوں کے لیے",
    title: "قرآن پڑھیں – چاہے آج آپ ایک حرف بھی نہ جانتے ہوں",
    lead: "یہ کورس آپ کو قرآنی رسم الخط پڑھنا اسی طرح سکھاتا ہے جیسے قرآن اسکول نسلوں سے سکھاتے آئے ہیں: پہلے حروف، پھر ان کی شکلیں، پھر حرکات کی علامات – یہاں تک کہ آپ خود الفاتحہ اور چھوٹی سورتیں پڑھنے لگیں۔ پانچ منٹ کے چھوٹے اسباق میں، مشقوں، جوڑے ملانے اور ٹیسٹوں کے ساتھ۔",
    stats: [`${LESSONS.length} اسباق`, `${UNITS.length} یونٹس`, "28 حروف", "ہر سبق 5 منٹ"],
    pathTitle: "آپ کا تعلیمی راستہ",
    alphaTitle: "عربی حروفِ تہجی",
    howTitle: "یہاں آپ کیسے سیکھتے ہیں",
    how: [
      ["مختصر اسباق", "ہر سبق تقریباً پانچ منٹ کا ہے: پہلے سیکھنے کے کارڈز، پھر طرح طرح کی مشقیں۔"],
      ["غلطیاں واپس آتی ہیں", "جو کچھ آپ غلط کرتے ہیں وہ سبق کے آخر میں دوبارہ آتا ہے – جب تک وہ یاد نہ ہو جائے۔"],
      ["بلند آواز سے بولیں", "پڑھنا منہ سے سیکھا جاتا ہے۔ ہر آواز خود بولیں – جہاں آپ کے آلے میں عربی آواز موجود ہو وہاں آپ اسے سن بھی سکتے ہیں۔"],
      ["حروف سے قرآن تک", "یونٹ 6 میں آپ الفاتحہ، الاخلاص، الفلق اور الناس کے اصل قرآنی الفاظ ان کے معنی کے ساتھ پڑھتے ہیں۔ پھر آپ انہیں اصل تلاوت میں لفظ بہ لفظ سنتے ہیں اور پوری آیات پڑھتے ہیں۔ اگر آپ پہلے سے تھوڑا بہت پڑھ لیتے ہیں تو سطح جانچنے کے ٹیسٹ سے آغاز کریں۔"],
    ],
    teacher: "کچھ آوازیں (ح ع ق ص ض ط ظ) سننے اور استاد کے ساتھ سیکھنا بہتر ہے۔ پلیئر میں کسی قاری کو سنیں اور دہرائیں – بالکل ویسے ہی جیسے قرآن اسکول سکھاتے ہیں۔",
    after: "کورس کے بعد",
    afterBody: "جب آپ پڑھنا سیکھ لیں تو اصل سفر شروع ہوتا ہے: شمس طریقے کے ساتھ آپ آیت بہ آیت حفظ کرتے ہیں، اور تجوید کورس خوبصورت تلاوت کے قواعد سکھاتا ہے۔",
    ctaPath: "تعلیمی راستہ دیکھیں",
    ctaPlace: "سطح جانچنے کا ٹیسٹ",
    signsTitle: "قرآنی رسم الخط کی علامات",
    signsLead: "حرکات، مد، تشدید اور مصحف کی خاص علامات – ہر علامت مثال کے ساتھ۔ آپ ان سب کی مشق یونٹ 3 سے 5 میں کرتے ہیں۔",
    sheetTitle: "ہر حرف ایک نظر میں",
    sheetLead: "نام، آواز اور جڑنے کی تینوں شکلیں۔ عربی دائیں سے بائیں پڑھی جاتی ہے – لفظ کے شروع والی شکل دائیں طرف ہوتی ہے۔",
    makhTitle: "آوازیں کہاں سے نکلتی ہیں",
    makhLead: "تجوید میں ہر حرف کا ایک مخرج (نکلنے کی جگہ) ہوتا ہے۔ شروع میں یہ چار گروہ آپ کے لیے سب سے زیادہ مددگار ہیں:",
    makh: [
      ["حلق سے", "ء ه ع ح غ خ", "چھ حروف حلق سے نکلتے ہیں: ء اور ه حلق کے سب سے گہرے حصے سے، ع اور ح بیچ سے، غ اور خ اوپر والے حصے سے۔"],
      ["ہونٹوں سے", "ف ب م و", "چار حروف ہونٹوں سے ادا ہوتے ہیں: ف نچلے ہونٹ اور اوپر کے سامنے والے دانتوں سے، ب اور م بند ہونٹوں سے، و گول ہونٹوں سے۔"],
      ["بھاری حروف", "خ ص ض غ ط ق ظ", "سات حروف ہمیشہ “بھاری” اور پُر (تفخیم) پڑھے جاتے ہیں، کیونکہ زبان کا پچھلا حصہ اوپر اٹھتا ہے۔ یاد رکھنے کا جملہ: “خُصَّ ضَغْطٍ قِظْ”۔"],
      ["مد کے حروف", "ا و ي", "ا و ي (جب ان پر خود کوئی حرکت نہ ہو) اپنے سے پہلے والی حرکت کو لمبا کر دیتے ہیں: لمبی ā، ū اور ī۔ یہ منہ اور حلق کی کھلی خالی جگہ (al-jawf) سے نکلتے ہیں۔"],
    ],
    faqTitle: "اکثر پوچھے جانے والے سوالات",
    faq: [
      ["کورس میں کتنا وقت لگتا ہے؟", `${UNITS.length} یونٹس میں ${LESSONS.length} مختصر اسباق، ہر ایک تقریباً پانچ منٹ کا۔ روزانہ ایک سبق کے ساتھ آپ چند ہفتوں میں پوری آیات پڑھنے لگتے ہیں – زیادہ وقت دیں تو رفتار اور تیز ہو جاتی ہے۔`],
      ["کیا مجھے عربی سمجھنا آنا ضروری ہے؟", "نہیں۔ کورس آپ کو رسم الخط پڑھنا سکھاتا ہے۔ راستے میں آپ قرآن کے کئی الفاظ کے معنی بھی سیکھ لیتے ہیں – مزید الفاظ کے لیے قرآنی الفاظ کی مشق موجود ہے۔"],
      ["کون سا رسم الخط سیکھا جاتا ہے؟", "قرآن کا رسم الخط، اپنی تمام حرکات اور پڑھنے کی علامات کے ساتھ، جیسا مصحف میں ہوتا ہے – بشمول اس کی خاص علامات جیسے چھوٹا الف اور ہمزۂ وصل۔ یونٹ 6 سے آپ قرآن کے اصل الفاظ اور آیات پڑھتے ہیں۔"],
      ["کیا اکاؤنٹ ضروری ہے؟", "جی ہاں، مفت اکاؤنٹ۔ یہ آپ کی پیش رفت – اسباق، ستارے اور وہ الفاظ جو آپ کو دہرانے ہیں – محفوظ رکھتا ہے اور آپ کے تمام آلات پر ہم آہنگ کر دیتا ہے۔"],
      ["کیا یہ کورس بچوں کے لیے موزوں ہے؟", "جی ہاں۔ اسباق مختصر اور کھیل کھیل میں سکھانے والے ہیں۔ سب سے اچھا طریقہ یہ ہے کہ والدین انہیں اپنے بچوں کے ساتھ مل کر کریں اور ہر آواز ساتھ بولیں۔"],
    ],
    ctaShams: "شمس طریقہ دریافت کریں",
    ctaTajweed: "تجوید کورس",
  },
  fa: {
    kicker: "خواندن عربی را بیاموزید · ویژه مبتدیان",
    title: "قرآن را بخوانید – حتی اگر امروز یک حرف هم نمی‌دانید",
    lead: "این دوره خواندن خط قرآن را همان‌گونه به شما می‌آموزد که مکتب‌خانه‌های قرآن نسل‌هاست می‌آموزند: نخست حروف، سپس شکل‌هایشان، سپس حرکات – تا خودتان الفاتحه و سوره‌های کوتاه را بخوانید. در درس‌های کوچک پنج‌دقیقه‌ای، با تمرین، جفت‌یابی و آزمون.",
    stats: [`${LESSONS.length} درس`, `${UNITS.length} بخش`, "28 حرف", "5 دقیقه برای هر درس"],
    pathTitle: "مسیر یادگیری شما",
    alphaTitle: "الفبای عربی",
    howTitle: "اینجا چگونه می‌آموزید",
    how: [
      ["درس‌های کوتاه", "هر درس حدود پنج دقیقه طول می‌کشد: نخست کارت‌های یادگیری، سپس تمرین‌های متنوع."],
      ["اشتباه‌ها برمی‌گردند", "هر آنچه اشتباه کنید در پایان درس دوباره می‌آید – تا جا بیفتد."],
      ["بلند بگویید", "خواندن را با دهان یاد می‌گیرید. هر صدا را بگویید – اگر دستگاه شما صدای عربی دارد، می‌توانید آن را بشنوید."],
      ["از حروف تا قرآن", "در بخش 6 کلمه‌های واقعی قرآن را از الفاتحه، الاخلاص، الفلق و الناس می‌خوانید – همراه با معنا. سپس آن‌ها را کلمه به کلمه در تلاوتی واقعی می‌شنوید و آیه‌های کامل را می‌خوانید. اگر از قبل کمی می‌توانید بخوانید، با آزمون تعیین سطح شروع کنید."],
    ],
    teacher: "برخی صداها (ح ع ق ص ض ط ظ) را بهتر است با گوش دادن و در کنار معلم بیاموزید. در پخش‌کننده به یک قاری گوش دهید و تکرار کنید – همان‌گونه که مکتب‌خانه‌های قرآن می‌آموزند.",
    after: "پس از دوره",
    afterBody: "وقتی خواندن را بلد شدید، ماجرای اصلی آغاز می‌شود: با روش شمس آیه به آیه حفظ می‌کنید و دوره تجوید قواعد تلاوت زیبا را به شما می‌آموزد.",
    ctaPath: "مشاهده مسیر یادگیری",
    ctaPlace: "آزمون تعیین سطح",
    signsTitle: "علامت‌های خط قرآن",
    signsLead: "حرکات، کشش، تشدید و علامت‌های ویژه مصحف – هر علامت با یک مثال. همه را در بخش‌های 3 تا 5 تمرین می‌کنید.",
    sheetTitle: "همه حروف در یک نگاه",
    sheetLead: "نام، صدا و سه شکل پیوسته. عربی از راست به چپ خوانده می‌شود – شکل آغاز کلمه سمت راست قرار دارد.",
    makhTitle: "صداها از کجا می‌آیند",
    makhLead: "در تجوید هر حرف مخرج خود را دارد. این چهار گروه در آغاز بیشترین کمک را به شما می‌کنند:",
    makh: [
      ["از گلو", "ء ه ع ح غ خ", "شش حرف از گلو می‌آیند: ء و ه از ژرف‌ترین بخش آن، ع و ح از میانه، غ و خ از بخش بالایی."],
      ["با لب‌ها", "ف ب م و", "چهار حرف با لب‌ها ساخته می‌شوند: ف با لب پایین و دندان‌های پیشین بالا، ب و م با لب‌های بسته، «و» با لب‌های گرد."],
      ["حروف سنگین", "خ ص ض غ ط ق ظ", "هفت حرف همیشه «سنگین» و پر ادا می‌شوند (تفخیم)، زیرا پشت زبان بالا می‌آید. یادآور: «خُصَّ ضَغْطٍ قِظْ»."],
      ["حروف کشش (مد)", "ا و ي", "الف (ا)، واو (و) و یاء (ي) هرگاه خودشان حرکت نداشته باشند، مصوت پیش از خود را می‌کشند: ā، ū و ī بلند. این‌ها از فضای باز دهان و گلو (al-jawf) می‌آیند."],
    ],
    faqTitle: "پرسش‌های متداول",
    faq: [
      ["دوره چقدر طول می‌کشد؟", `${LESSONS.length} درس کوتاه حدود پنج‌دقیقه‌ای در ${UNITS.length} بخش. با یک درس در روز، طی چند هفته آیه‌های کامل می‌خوانید – با وقت بیشتر سریع‌تر پیش می‌روید.`],
      ["آیا باید عربی بدانم؟", "نه. این دوره خواندن خط را به شما می‌آموزد. معنای بسیاری از کلمه‌های قرآن را در این مسیر یاد می‌گیرید – برای واژگان بیشتر، بخش واژگان قرآن را ببینید."],
      ["کدام خط را می‌آموزم؟", "خط قرآن با همه حرکات و علامت‌های خواندن، همان‌گونه که در مصحف است – از جمله علامت‌های ویژه آن مانند الف خنجری و همزه وصل. از بخش 6 کلمه‌ها و آیه‌های واقعی قرآن را می‌خوانید."],
      ["آیا حساب کاربری لازم است؟", "بله، یک حساب رایگان. پیشرفت شما را نگه می‌دارد – درس‌ها، ستاره‌ها و کلمه‌هایی که باید مرور کنید – و آن را روی همه دستگاه‌هایتان همگام می‌کند."],
      ["آیا دوره برای کودکان مناسب است؟", "بله. درس‌ها کوتاه و بازی‌گونه‌اند. وقتی والدین درس‌ها را همراه فرزندانشان انجام دهند و هر صدا را با هم بگویند، از همه زیباتر است."],
    ],
    ctaShams: "آشنایی با روش شمس",
    ctaTajweed: "دوره تجوید",
  },
  ps: {
    kicker: "عربي لوستل زده کړئ · د پیلونکو لپاره",
    title: "قرآن ولولئ – حتی که نن یو توری هم نه پېژنئ",
    lead: "دا کورس تاسو ته قرآني خط لوستل هغه ډول زده کوي لکه د قرآن مکتبونو چې د نسلونو راهیسې ښودلي: لومړی توري، بیا د هغوی بڼې، بیا حرکات – تر هغه چې الفاتحه او لنډ سورتونه پخپله ولولئ. په کوچنیو پنځه دقیقې درسونو کې، له تمرینونو، جوړو او ازموینو سره.",
    stats: [`${LESSONS.length} درسونه`, `${UNITS.length} څپرکي`, "28 توري", "هر درس 5 دقیقې"],
    pathTitle: "ستاسو د زده کړې لاره",
    alphaTitle: "عربي الفبا",
    howTitle: "دلته څنګه زده کړه کوئ",
    how: [
      ["لنډ درسونه", "هر درس نږدې پنځه دقیقې نیسي: لومړی د زده کړې کارتونه، بیا ډول ډول تمرینونه."],
      ["تېروتنې بېرته راځي", "هر هغه څه چې غلط یې کړئ د درس په پای کې بېرته راځي – تر هغه چې په یاد پاتې شي."],
      ["په لوړ غږ ووایاست", "تاسو لوستل په خوله زده کوئ. هر غږ ووایاست – چیرې چې ستاسو وسیله عربي غږ ولري، تاسو یې اورېدلای شئ."],
      ["له توریو څخه قرآن ته", "په 6 څپرکي کې تاسو د الفاتحې، الاخلاص، الفلق او الناس رښتیني قرآني ټکي لولئ – له معنا سره. بیا یې په رښتینې تلاوت کې ټکی په ټکي اورئ او بشپړ آیتونه لولئ. که تاسو دمخه لږ لوستلای شئ، د کچې ازموینې سره پیل وکړئ."],
    ],
    teacher: "ځینې غږونه (ح ع ق ص ض ط ظ) تر ټولو ښه په اورېدلو او له ښوونکي سره زده کېږي. په پلیر کې یو قاري واورئ او تکرار یې کړئ – هماغسې چې د قرآن مکتبونه ښيي.",
    after: "د کورس وروسته",
    afterBody: "کله چې لوستلای شئ، رښتینی سفر پیلېږي: د شمس طریقې سره آیت په آیت حفظ کوئ، او د تجوید کورس د ښکلي تلاوت قواعد ښيي.",
    ctaPath: "د زده کړې لاره وګورئ",
    ctaPlace: "د کچې ازموینه",
    signsTitle: "د قرآني خط نښې",
    signsLead: "حرکات، اوږدول، دوه چنده کول او د مصحف ځانګړې نښې – هره نښه له مثال سره. تاسو ټولې په 3 تر 5 څپرکو کې تمرین کوئ.",
    sheetTitle: "هر توری په یو نظر کې",
    sheetLead: "نوم، غږ او درې نښتې بڼې. عربي له ښي څخه کیڼ لورې ته لوستل کېږي – د ټکي په پیل کې بڼه په ښي لوري کې ده.",
    makhTitle: "غږونه له کومه ځایه راځي",
    makhLead: "په تجوید کې هر توری خپل د ادا ځای (مخرج) لري. دا څلور ډلې په پیل کې تاسو سره تر ټولو ډېره مرسته کوي:",
    makh: [
      ["له ستوني څخه", "ء ه ع ح غ خ", "شپږ توري له ستوني څخه راځي: ء او ه له ژورې برخې، ع او ح له منځنۍ برخې، غ او خ له پورتنۍ برخې."],
      ["په شونډو سره", "ف ب م و", "څلور توري په شونډو جوړېږي: ف د ښکتنۍ شونډې او پورتنیو مخکینیو غاښونو سره، ب او م د تړلو شونډو سره، و د ګردو شونډو سره."],
      ["درانه توري", "خ ص ض غ ط ق ظ", "اوه توري تل «درانه» او ډک ویل کېږي (تفخیم)، ځکه چې د ژبې شا پورته کېږي. د یادولو مرسته: «خُصَّ ضَغْطٍ قِظْ»."],
      ["د اوږدولو توري", "ا و ي", "ا, و او ي هغه حرکت اوږدوي چې مخکې یې دی، کله چې پخپله حرکت ونه لري: اوږد ā، ū او ī. دوی د خولې او ستوني له خلاصې تشې (al-jawf) راځي."],
    ],
    faqTitle: "ډېرې پوښتل شوې پوښتنې",
    faq: [
      ["کورس څومره وخت نیسي؟", `${LESSONS.length} لنډ درسونه، هر یو نږدې پنځه دقیقې، په ${UNITS.length} څپرکو کې. په ورځ کې د یو درس سره تاسو په څو اونیو کې بشپړ آیتونه لولئ – په ډېر وخت سره ګړندی پرمختګ کوئ.`],
      ["آیا عربي پوهېدل اړین دي؟", "نه. دا کورس تاسو ته د خط لوستل ښيي. د لارې په اوږدو کې د قرآن د ډېرو ټکو معنا هم زده کوئ – د لا ډېرو لغتونو لپاره د لغتونو تمرین شته."],
      ["کوم خط زده کوم؟", "د قرآن خط د خپلو ټولو حرکاتو او د لوستلو نښو سره، لکه په مصحف کې – په شمول د ځانګړو نښو لکه کوچنی الف او وصل. له 6 څپرکي څخه تاسو د قرآن رښتیني ټکي او آیتونه لولئ."],
      ["آیا حساب ته اړتیا لرم؟", "هو، یو وړیا حساب. دا ستاسو پرمختګ ساتي – درسونه، ستوري او هغه ټکي چې باید تکرار یې کړئ – او په ټولو وسیلو کې یې همغږی کوي."],
      ["آیا کورس د ماشومانو لپاره مناسب دی؟", "هو. درسونه لنډ او په لوبو ډک دي. تر ټولو ښکلی هغه وخت دی چې مور او پلار یې له خپلو ماشومانو سره یوځای کوي او هر غږ سره یوځای وايي."],
    ],
    ctaShams: "د شمس طریقه وپېژنئ",
    ctaTajweed: "د تجوید کورس",
  },
  fr: {
    kicker: "Apprendre à lire l’arabe · pour débutants",
    title: "Lis le Coran – même si tu ne connais pas encore une seule lettre aujourd’hui",
    lead: "Ce cours t’apprend à lire l’écriture du Coran comme le font les écoles coraniques depuis des générations : d’abord les lettres, puis leurs formes, puis les signes de voyelles – jusqu’à ce que tu lises toi-même Al-Fatiha et les courtes sourates. En petites leçons de cinq minutes, avec des exercices, des paires et des tests.",
    stats: [`${LESSONS.length} leçons`, `${UNITS.length} unités`, "28 lettres", "5 min par leçon"],
    pathTitle: "Ton parcours d’apprentissage",
    alphaTitle: "L’alphabet arabe",
    howTitle: "Comment tu apprends ici",
    how: [
      ["Leçons courtes", "Chaque leçon dure environ cinq minutes : d’abord des cartes d’apprentissage, puis des exercices variés."],
      ["Les erreurs reviennent", "Ce que tu rates revient à la fin de la leçon – jusqu’à ce que ce soit acquis."],
      ["À voix haute", "On apprend à lire avec la bouche. Prononce chaque son – si ton appareil dispose d’une voix arabe, tu peux l’écouter."],
      ["Des lettres au Coran", "À l’unité 6, tu lis de vrais mots du Coran tirés d’Al-Fatiha, d’Al-Ikhlas, d’Al-Falaq et d’An-Nas – avec leur sens. Ensuite, tu les entends mot à mot dans une vraie récitation et tu lis des versets entiers. Si tu sais déjà lire un peu, commence par le test de niveau."],
    ],
    teacher: "La prononciation de certains sons (ح ع ق ص ض ط ظ) s’apprend mieux en écoutant et avec un enseignant. Écoute un récitateur dans le lecteur et répète – c’est ainsi qu’enseignent les écoles coraniques.",
    after: "Après le cours",
    afterBody: "Quand tu sais lire, la vraie aventure commence : avec la Méthode Shams, tu mémorises verset par verset, et le cours de tajwid t’enseigne les règles de la belle récitation.",
    ctaPath: "Voir le parcours d’apprentissage",
    ctaPlace: "Test de niveau",
    signsTitle: "Les signes de l’écriture coranique",
    signsLead: "Voyelles, allongement, redoublement et signes particuliers du mushaf – chaque signe avec un exemple. Tu les travailles tous dans les unités 3 à 5.",
    sheetTitle: "Toutes les lettres en un coup d’œil",
    sheetLead: "Nom, son et les trois formes liées. L’arabe se lit de droite à gauche – la forme du début de mot se trouve à droite.",
    makhTitle: "D’où viennent les sons",
    makhLead: "En tajwid, chaque lettre a son point d’articulation (makhraj). Ces quatre groupes t’aident surtout au début :",
    makh: [
      ["De la gorge", "ء ه ع ح غ خ", "Six lettres viennent de la gorge : ء et ه du plus profond, ع et ح du milieu, غ et خ de la partie haute."],
      ["Avec les lèvres", "ف ب م و", "Quatre lettres sont formées par les lèvres : ف avec la lèvre inférieure et les incisives supérieures, ب et م avec les lèvres fermées, و avec les lèvres arrondies."],
      ["Les lettres lourdes", "خ ص ض غ ط ق ظ", "Sept lettres se prononcent toujours « lourdes » et pleines (tafkhim), parce que l’arrière de la langue se soulève. Aide-mémoire : « خُصَّ ضَغْطٍ قِظْ »."],
      ["Les lettres d’allongement", "ا و ي", "ا, و et ي allongent la voyelle qui les précède quand elles ne portent elles-mêmes aucune voyelle : le ā, le ū et le ī longs. Elles viennent de l’espace ouvert de la bouche et de la gorge (al-jawf)."],
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      ["Combien de temps dure le cours ?", `${LESSONS.length} courtes leçons d’environ cinq minutes réparties en ${UNITS.length} unités. Avec une leçon par jour, tu lis des versets entiers en quelques semaines – avec plus de temps, tu avances plus vite.`],
      ["Dois-je comprendre l’arabe ?", "Non. Le cours t’apprend à lire l’écriture. Tu retiens au passage le sens de nombreux mots du Coran – pour plus de vocabulaire, il y a l’entraînement au vocabulaire."],
      ["Quelle écriture vais-je apprendre ?", "L’écriture du Coran avec tous ses signes de voyelles et de lecture, comme dans le mushaf – y compris ses signes particuliers comme le petit alif et la wasla. À partir de l’unité 6, tu lis de vrais mots et versets du Coran."],
      ["Ai-je besoin d’un compte ?", "Oui, un compte gratuit. Il conserve ta progression – leçons, étoiles et mots à revoir – et la synchronise sur tous tes appareils."],
      ["Le cours convient-il aux enfants ?", "Oui. Les leçons sont courtes et ludiques. Le plus beau, c’est quand les parents les font avec leurs enfants et prononcent chaque son ensemble."],
    ],
    ctaShams: "Découvrir la Méthode Shams",
    ctaTajweed: "Cours de tajwid",
  },
  es: {
    kicker: "Aprende a leer árabe · para principiantes",
    title: "Lee el Corán, aunque hoy no conozcas ni una sola letra",
    lead: "Este curso te enseña a leer la escritura coránica como lo hacen las escuelas coránicas desde hace generaciones: primero las letras, luego sus formas y después los signos vocálicos, hasta que leas Al-Fatiha y las suras cortas por tu cuenta. En lecciones breves de cinco minutos, con ejercicios, parejas y pruebas.",
    stats: [`${LESSONS.length} lecciones`, `${UNITS.length} unidades`, "28 letras", "5 min por lección"],
    pathTitle: "Tu ruta de aprendizaje",
    alphaTitle: "El alfabeto árabe",
    howTitle: "Cómo aprendes aquí",
    how: [
      ["Lecciones breves", "Cada lección dura unos cinco minutos: primero tarjetas de aprendizaje y luego ejercicios variados."],
      ["Los errores vuelven", "Lo que falles vuelve al final de la lección, hasta que se te quede grabado."],
      ["Dilo en voz alta", "Se aprende a leer con la boca. Di cada sonido en voz alta; si tu dispositivo tiene una voz en árabe, puedes escucharla."],
      ["De las letras al Corán", "En la unidad 6 lees palabras reales del Corán de Al-Fatiha, Al-Ijlas, Al-Falaq y An-Nas, con su significado. Después las escuchas palabra por palabra en una recitación real y lees aleyas completas. Si ya sabes leer un poco, empieza con la prueba de nivel."],
    ],
    teacher: "Algunos sonidos (ح ع ق ص ض ط ظ) se aprenden mejor escuchando y con un maestro o una maestra. Escucha a un recitador en el reproductor y repite, igual que se enseña en las escuelas coránicas.",
    after: "Después del curso",
    afterBody: "Cuando sepas leer, empieza la verdadera aventura: con el Método Shams memorizas aleya por aleya, y el curso de tayuid te enseña las reglas de la recitación bella.",
    ctaPath: "Ver la ruta de aprendizaje",
    ctaPlace: "Prueba de nivel",
    signsTitle: "Los signos de la escritura coránica",
    signsLead: "Vocales, alargamiento, duplicación y los signos particulares del mushaf – cada signo con un ejemplo. Los practicas todos en las unidades 3 a 5.",
    sheetTitle: "Todas las letras de un vistazo",
    sheetLead: "Nombre, sonido y las tres formas unidas. El árabe se lee de derecha a izquierda: la forma al principio de una palabra queda a la derecha.",
    makhTitle: "De dónde vienen los sonidos",
    makhLead: "En el tayuid cada letra tiene su punto de articulación (makhraj). Estos cuatro grupos te ayudan más al principio:",
    makh: [
      ["Desde la garganta", "ء ه ع ح غ خ", "Seis letras salen de la garganta: ء y ه de su parte más profunda, ع y ح de la parte media, غ y خ de la parte superior."],
      ["Con los labios", "ف ب م و", "Cuatro letras se forman con los labios: ف con el labio inferior y los dientes frontales superiores, ب y م con los labios cerrados, و con los labios redondeados."],
      ["Las letras pesadas", "خ ص ض غ ط ق ظ", "Siete letras se pronuncian siempre «pesadas» y llenas (tafkhim), porque se eleva la parte posterior de la lengua. Regla mnemotécnica: «خُصَّ ضَغْطٍ قِظْ»."],
      ["Las letras de alargamiento", "ا و ي", "ا, و y ي alargan la vocal que las precede cuando ellas mismas no llevan vocal: la ā, la ū y la ī largas. Salen del espacio abierto de la boca y la garganta (al-jawf)."],
    ],
    faqTitle: "Preguntas frecuentes",
    faq: [
      ["¿Cuánto dura el curso?", `${LESSONS.length} lecciones breves de unos cinco minutos en ${UNITS.length} unidades. Con una lección al día, en pocas semanas lees aleyas completas; con más tiempo avanzas más rápido.`],
      ["¿Necesito entender árabe?", "No. El curso te enseña a leer la escritura. Por el camino aprendes el significado de muchas palabras del Corán; para más vocabulario existe el entrenador de vocabulario."],
      ["¿Qué escritura aprendo?", "La escritura del Corán con todos sus signos vocálicos y de lectura, como en el mushaf, incluidos sus signos particulares, como la alif pequeña y la wasla. A partir de la unidad 6 lees palabras y aleyas reales del Corán."],
      ["¿Necesito una cuenta?", "Sí, una gratuita. Guarda tu progreso – lecciones, estrellas y las palabras que debes repasar – y lo sincroniza en todos tus dispositivos."],
      ["¿Es adecuado el curso para niños?", "Sí. Las lecciones son breves y lúdicas. Es aún más bonito cuando los padres las hacen junto con sus hijos y pronuncian juntos cada sonido."],
    ],
    ctaShams: "Descubre el Método Shams",
    ctaTajweed: "Curso de tayuid",
  },
  id: {
    kicker: "Belajar membaca bahasa Arab · untuk pemula",
    title: "Baca Al-Qur’an – meski hari ini kamu belum mengenal satu huruf pun",
    lead: "Kursus ini mengajarkanmu membaca tulisan Al-Qur’an seperti yang dilakukan sekolah-sekolah Al-Qur’an secara turun-temurun: pertama huruf, lalu bentuk-bentuknya, lalu tanda-tanda vokal – sampai kamu sendiri membaca Al-Fatihah dan surah-surah pendek. Dalam pelajaran kecil berdurasi lima menit, dengan latihan, pasangan, dan tes.",
    stats: [`${LESSONS.length} pelajaran`, `${UNITS.length} unit`, "28 huruf", "5 menit per pelajaran"],
    pathTitle: "Jalur belajarmu",
    alphaTitle: "Alfabet Arab",
    howTitle: "Cara kamu belajar di sini",
    how: [
      ["Pelajaran singkat", "Setiap pelajaran memakan waktu sekitar lima menit: mula-mula kartu belajar, lalu latihan yang bervariasi."],
      ["Kesalahan akan kembali", "Apa pun yang kamu jawab salah akan muncul lagi di akhir pelajaran – sampai benar-benar melekat."],
      ["Ucapkan dengan lantang", "Kamu belajar membaca dengan mulutmu. Ucapkan setiap bunyi – jika perangkatmu memiliki suara bahasa Arab, kamu bisa mendengarkannya."],
      ["Dari huruf ke Al-Qur’an", "Di unit 6 kamu membaca kata-kata Al-Qur’an yang sesungguhnya dari Al-Fatihah, Al-Ikhlas, Al-Falaq, dan An-Nas – beserta artinya. Lalu kamu mendengarnya kata demi kata dalam bacaan yang asli dan membaca ayat yang utuh. Jika kamu sudah bisa membaca sedikit, mulailah dengan tes penempatan."],
    ],
    teacher: "Beberapa bunyi (ح ع ق ص ض ط ظ) paling baik dipelajari dengan mendengarkan dan bersama seorang guru. Dengarkan seorang qari di pemutar dan ulangi – seperti cara sekolah-sekolah Al-Qur’an mengajar.",
    after: "Setelah kursus",
    afterBody: "Setelah kamu bisa membaca, petualangan yang sesungguhnya dimulai: dengan Metode Shams kamu menghafal ayat demi ayat, dan kursus tajwid mengajarkan kaidah-kaidah bacaan yang indah.",
    ctaPath: "Lihat jalur belajar",
    ctaPlace: "Tes penempatan",
    signsTitle: "Tanda-tanda dalam tulisan Al-Qur’an",
    signsLead: "Vokal, pemanjangan, penggandaan, dan tanda-tanda khas mushaf – setiap tanda dengan contoh. Kamu melatih semuanya di unit 3 sampai 5.",
    sheetTitle: "Setiap huruf sekilas",
    sheetLead: "Nama, bunyi, dan tiga bentuk bersambungnya. Bahasa Arab dibaca dari kanan ke kiri – bentuk di awal kata berada di sebelah kanan.",
    makhTitle: "Dari mana bunyi-bunyi itu berasal",
    makhLead: "Dalam tajwid setiap huruf memiliki tempat keluarnya (makhraj). Empat kelompok ini paling membantu di awal:",
    makh: [
      ["Dari tenggorokan", "ء ه ع ح غ خ", "Enam huruf keluar dari tenggorokan: ء dan ه dari bagian terdalamnya, ع dan ح dari bagian tengah, غ dan خ dari bagian atas."],
      ["Dengan bibir", "ف ب م و", "Empat huruf dibentuk oleh bibir: ف dengan bibir bawah dan gigi atas bagian depan, ب dan م dengan bibir tertutup, و dengan bibir membulat."],
      ["Huruf-huruf tebal", "خ ص ض غ ط ق ظ", "Tujuh huruf selalu dilafalkan “tebal” dan penuh (tafkhim), karena pangkal lidah terangkat. Alat bantu ingatan: “خُصَّ ضَغْطٍ قِظْ”."],
      ["Huruf-huruf pemanjangan", "ا و ي", "ا, و dan ي memanjangkan vokal sebelumnya jika huruf-huruf itu sendiri tidak memiliki vokal: ā, ū, dan ī panjang. Huruf-huruf ini keluar dari rongga mulut dan tenggorokan (al-jawf)."],
    ],
    faqTitle: "Pertanyaan yang sering diajukan",
    faq: [
      ["Berapa lama kursus ini?", `${LESSONS.length} pelajaran singkat berdurasi sekitar lima menit dalam ${UNITS.length} unit. Dengan satu pelajaran sehari, kamu membaca ayat yang utuh dalam beberapa pekan – dengan waktu lebih banyak, kemajuanmu lebih cepat.`],
      ["Apakah saya perlu memahami bahasa Arab?", "Tidak. Kursus ini mengajarkan cara membaca tulisannya. Sambil belajar, kamu akan mengenal arti banyak kata Al-Qur’an – untuk kosakata yang lebih banyak ada latihan kosakata."],
      ["Tulisan mana yang saya pelajari?", "Tulisan Al-Qur’an lengkap dengan semua tanda vokal dan tanda bacanya, seperti dalam mushaf – termasuk tanda-tanda khasnya, seperti alif kecil dan wasal. Mulai unit 6 kamu membaca kata dan ayat yang sesungguhnya dari Al-Qur’an."],
      ["Apakah saya perlu akun?", "Ya, akun gratis. Akun menyimpan kemajuanmu – pelajaran, bintang, dan kata-kata yang perlu kamu ulang – dan menyinkronkannya ke semua perangkatmu."],
      ["Apakah kursus ini cocok untuk anak-anak?", "Ya. Pelajarannya singkat dan menyenangkan. Paling indah jika orang tua mengerjakannya bersama anak-anak mereka dan mengucapkan setiap bunyi bersama-sama."],
    ],
    ctaShams: "Kenali Metode Shams",
    ctaTajweed: "Kursus tajwid",
  },
  ms: {
    kicker: "Belajar membaca bahasa Arab · untuk pemula",
    title: "Baca Quran – walaupun hari ini anda belum mengenali satu huruf pun",
    lead: "Kursus ini mengajar anda membaca tulisan Quran seperti yang dilakukan oleh sekolah-sekolah Quran selama beberapa generasi: mula-mula huruf, kemudian bentuknya, kemudian tanda baris – sehingga anda sendiri membaca Al-Fatihah dan surah-surah pendek. Dalam pelajaran lima minit yang ringkas, dengan latihan, pasangan dan ujian.",
    stats: [`${LESSONS.length} pelajaran`, `${UNITS.length} unit`, "28 huruf", "5 minit setiap pelajaran"],
    pathTitle: "Laluan pembelajaran anda",
    alphaTitle: "Abjad Arab",
    howTitle: "Cara anda belajar di sini",
    how: [
      ["Pelajaran ringkas", "Setiap pelajaran mengambil masa kira-kira lima minit: mula-mula kad pembelajaran, kemudian pelbagai latihan."],
      ["Kesilapan akan kembali", "Apa-apa yang anda jawab salah akan kembali pada akhir pelajaran – sehingga ia melekat."],
      ["Sebut dengan kuat", "Anda belajar membaca dengan mulut. Sebut setiap bunyi – jika peranti anda mempunyai suara Arab, anda boleh mendengarnya."],
      ["Daripada huruf kepada Quran", "Dalam unit 6 anda membaca perkataan Quran yang sebenar daripada Al-Fatihah, Al-Ikhlas, Al-Falaq dan An-Nas – dengan maknanya. Kemudian anda mendengarnya perkataan demi perkataan dalam bacaan sebenar dan membaca ayat yang lengkap. Jika anda sudah boleh membaca sedikit, mulakan dengan ujian penempatan."],
    ],
    teacher: "Sebahagian bunyi (ح ع ق ص ض ط ظ) paling baik dipelajari dengan mendengar dan bersama seorang guru. Dengarkan seorang qari dalam pemain dan ulanginya – sama seperti cara sekolah-sekolah Quran mengajar.",
    after: "Selepas kursus",
    afterBody: "Setelah anda boleh membaca, perjalanan yang sebenar bermula: dengan Kaedah Shams anda menghafaz ayat demi ayat, dan kursus tajwid mengajar hukum bacaan yang indah.",
    ctaPath: "Lihat laluan pembelajaran",
    ctaPlace: "Ujian penempatan",
    signsTitle: "Tanda-tanda tulisan Quran",
    signsLead: "Vokal, pemanjangan, penggandaan dan tanda-tanda khas mushaf – setiap tanda dengan contoh. Anda berlatih kesemuanya dalam unit 3 hingga 5.",
    sheetTitle: "Semua huruf sekilas pandang",
    sheetLead: "Nama, bunyi dan tiga bentuk bersambung. Bahasa Arab dibaca dari kanan ke kiri – bentuk pada permulaan perkataan berada di sebelah kanan.",
    makhTitle: "Dari mana bunyi-bunyi datang",
    makhLead: "Dalam tajwid, setiap huruf mempunyai tempat keluarnya (makhraj). Empat kumpulan ini paling membantu anda pada peringkat permulaan:",
    makh: [
      ["Dari kerongkong", "ء ه ع ح غ خ", "Enam huruf keluar dari kerongkong: ء dan ه dari bahagian paling dalam, ع dan ح dari bahagian tengah, غ dan خ dari bahagian atas."],
      ["Dengan bibir", "ف ب م و", "Empat huruf dibentuk oleh bibir: ف dengan bibir bawah dan gigi hadapan atas, ب dan م dengan bibir tertutup, و dengan bibir yang dibulatkan."],
      ["Huruf tebal", "خ ص ض غ ط ق ظ", "Tujuh huruf sentiasa disebut “tebal” dan penuh (tafkhim), kerana bahagian belakang lidah naik. Pembantu ingatan: «خُصَّ ضَغْطٍ قِظْ»."],
      ["Huruf pemanjangan", "ا و ي", "ا, و dan ي memanjangkan vokal sebelumnya apabila ia sendiri tidak berbaris: ā, ū dan ī panjang. Ia datang dari ruang terbuka mulut dan kerongkong (al-jawf)."],
    ],
    faqTitle: "Soalan lazim",
    faq: [
      ["Berapa lama kursus ini?", `${LESSONS.length} pelajaran ringkas, kira-kira lima minit setiap satu, dalam ${UNITS.length} unit. Dengan satu pelajaran sehari, anda akan membaca ayat yang lengkap dalam beberapa minggu – dengan lebih banyak masa, kemajuan anda lebih pantas.`],
      ["Adakah saya perlu memahami bahasa Arab?", "Tidak. Kursus ini mengajar anda membaca tulisan. Anda memperoleh makna banyak perkataan Quran sambil belajar – untuk kosa kata yang lebih banyak, terdapat latihan kosa kata."],
      ["Tulisan manakah yang saya pelajari?", "Tulisan Quran dengan semua tanda baris dan tanda bacaannya, seperti dalam mushaf – termasuk tanda-tanda khasnya seperti alif kecil dan wasal. Mulai unit 6 anda membaca perkataan dan ayat sebenar daripada Quran."],
      ["Adakah saya memerlukan akaun?", "Ya, akaun percuma. Ia menyimpan kemajuan anda – pelajaran, bintang dan perkataan yang patut anda ulang kaji – dan menyegerakkannya ke semua peranti anda."],
      ["Adakah kursus ini sesuai untuk kanak-kanak?", "Ya. Pelajarannya ringkas dan menyeronokkan. Ia paling indah apabila ibu bapa melakukannya bersama anak-anak dan menyebut setiap bunyi bersama-sama."],
    ],
    ctaShams: "Terokai Kaedah Shams",
    ctaTajweed: "Kursus tajwid",
  },
  bn: {
    kicker: "আরবি পড়া শিখুন · নতুনদের জন্য",
    title: "কুরআন পড়ুন – আজ আপনি একটি হরফও না চিনলেও",
    lead: "এই কোর্সে আপনি কুরআনের লিপি পড়া শিখবেন, ঠিক যেভাবে কুরআন মক্তবগুলো প্রজন্মের পর প্রজন্ম ধরে শিখিয়ে আসছে: আগে হরফ, তারপর হরফের আকৃতি, তারপর হরকত – যতক্ষণ না আপনি নিজে আল-ফাতিহা ও ছোট সূরাগুলো পড়তে পারেন। পাঁচ মিনিটের ছোট ছোট পাঠে, অনুশীলন, জোড়া মেলানো ও পরীক্ষাসহ।",
    stats: [`${LESSONS.length}টি পাঠ`, `${UNITS.length}টি ইউনিট`, "28টি হরফ", "প্রতি পাঠে 5 মিনিট"],
    pathTitle: "আপনার শেখার পথ",
    alphaTitle: "আরবি বর্ণমালা",
    howTitle: "এখানে আপনি যেভাবে শেখেন",
    how: [
      ["ছোট ছোট পাঠ", "প্রতিটি পাঠে প্রায় পাঁচ মিনিট লাগে: প্রথমে শেখার কার্ড, তারপর নানা রকম অনুশীলন।"],
      ["ভুলগুলো ফিরে আসে", "যা ভুল করেন, তা পাঠের শেষে আবার ফিরে আসে – যতক্ষণ না তা মনে গেঁথে যায়।"],
      ["জোরে বলুন", "মুখ দিয়েই পড়া শেখা হয়। প্রতিটি ধ্বনি বলুন – আপনার ডিভাইসে আরবি কণ্ঠ থাকলে সেটি শুনতেও পারেন।"],
      ["হরফ থেকে কুরআনে", "ইউনিট 6-এ আপনি আল-ফাতিহা, আল-ইখলাস, আল-ফালাক ও আন-নাস থেকে কুরআনের আসল শব্দ পড়বেন – অর্থসহ। তারপর আসল তিলাওয়াতে সেগুলো শব্দে শব্দে শুনবেন এবং পুরো আয়াত পড়বেন। আপনি যদি আগেই একটু পড়তে পারেন, স্তর-নির্ধারণী পরীক্ষা দিয়ে শুরু করুন।"],
    ],
    teacher: "কিছু ধ্বনি (ح ع ق ص ض ط ظ) শুনে এবং শিক্ষকের সাথে শেখাই ভালো। প্লেয়ারে একজন ক্বারীর তিলাওয়াত শুনুন এবং সাথে সাথে বলুন – কুরআন মক্তবগুলো যেভাবে শেখায়।",
    after: "কোর্সের পর",
    afterBody: "পড়তে শেখার পর আসল যাত্রা শুরু হয়: শামস পদ্ধতিতে আপনি আয়াতের পর আয়াত মুখস্থ করেন, আর তাজবীদ কোর্স সুন্দর তিলাওয়াতের নিয়মগুলো শেখায়।",
    ctaPath: "শেখার পথ দেখুন",
    ctaPlace: "স্তর-নির্ধারণী পরীক্ষা",
    signsTitle: "কুরআনের লিপির চিহ্নসমূহ",
    signsLead: "স্বর, টেনে পড়া, দ্বিগুণ করা এবং মুসহাফের বিশেষ চিহ্নগুলো – প্রতিটি চিহ্ন উদাহরণসহ। ইউনিট 3 থেকে 5-এ আপনি সবগুলো অনুশীলন করবেন।",
    sheetTitle: "প্রতিটি হরফ এক নজরে",
    sheetLead: "নাম, ধ্বনি এবং যুক্ত অবস্থার তিনটি রূপ। আরবি ডান থেকে বামে পড়া হয় – শব্দের শুরুর রূপটি ডানদিকে থাকে।",
    makhTitle: "ধ্বনিগুলো কোথা থেকে আসে",
    makhLead: "তাজবীদে প্রতিটি হরফের একটি উচ্চারণস্থান (মাখরাজ) আছে। শুরুতে এই চারটি দল আপনাকে সবচেয়ে বেশি সাহায্য করবে:",
    makh: [
      ["গলা থেকে", "ء ه ع ح غ خ", "ছয়টি হরফ গলা থেকে আসে: ء ও ه গলার সবচেয়ে গভীর অংশ থেকে, ع ও ح মাঝখান থেকে, غ ও خ উপরের অংশ থেকে।"],
      ["ঠোঁট দিয়ে", "ف ب م و", "চারটি হরফ ঠোঁট দিয়ে উচ্চারিত হয়: ف নিচের ঠোঁট ও উপরের সামনের দাঁত দিয়ে, ب ও م বন্ধ ঠোঁটে, و গোল করা ঠোঁটে।"],
      ["ভারী হরফ", "خ ص ض غ ط ق ظ", "সাতটি হরফ সবসময় “ভারী” ও ভরাট (তাফখীম) করে উচ্চারিত হয়, কারণ জিহ্বার পেছনের অংশ উঁচু হয়। মনে রাখার সূত্র: «خُصَّ ضَغْطٍ قِظْ»।"],
      ["টেনে পড়ার হরফ", "ا و ي", "ا, و ও ي নিজেদের কোনো হরকত না থাকলে তাদের আগের স্বরকে লম্বা করে: দীর্ঘ ā, ū ও ī। এগুলো মুখ ও গলার খালি জায়গা (al-jawf) থেকে আসে।"],
    ],
    faqTitle: "সচরাচর জিজ্ঞাসিত প্রশ্ন",
    faq: [
      ["কোর্সটি শেষ করতে কত সময় লাগে?", `${UNITS.length}টি ইউনিটে ${LESSONS.length}টি ছোট পাঠ, প্রতিটি প্রায় পাঁচ মিনিটের। দিনে একটি পাঠ করলে কয়েক সপ্তাহের মধ্যেই আপনি পুরো আয়াত পড়বেন – বেশি সময় দিলে আরও দ্রুত এগোবেন।`],
      ["আমার কি আরবি বোঝা দরকার?", "না। কোর্সটি আপনাকে লিপি পড়তে শেখায়। পথে পথে আপনি কুরআনের অনেক শব্দের অর্থও শিখে যান – আরও শব্দভান্ডারের জন্য শব্দভান্ডারের অনুশীলন আছে।"],
      ["আমি কোন লিপি শিখব?", "কুরআনের লিপি – মুসহাফের মতোই সব হরকত ও পড়ার চিহ্নসহ, ছোট আলিফ ও ওয়াসলার মতো এর বিশেষ চিহ্নগুলোও। ইউনিট 6 থেকে আপনি কুরআনের আসল শব্দ ও আয়াত পড়বেন।"],
      ["অ্যাকাউন্ট কি লাগবে?", "হ্যাঁ, একটি বিনামূল্যের অ্যাকাউন্ট। এটি আপনার অগ্রগতি – পাঠ, তারা এবং যে শব্দগুলো আবার দেখা উচিত – সংরক্ষণ করে এবং সব ডিভাইসে সিঙ্ক করে।"],
      ["কোর্সটি কি শিশুদের জন্য উপযোগী?", "হ্যাঁ। পাঠগুলো ছোট ও খেলার মতো। বাবা-মা যখন সন্তানদের সাথে একসাথে পাঠগুলো করেন এবং প্রতিটি ধ্বনি একসাথে বলেন, তখন এটি সবচেয়ে সুন্দর হয়।"],
    ],
    ctaShams: "শামস পদ্ধতি সম্পর্কে জানুন",
    ctaTajweed: "তাজবীদ কোর্স",
  },
  ru: {
    kicker: "Научиться читать по-арабски · для начинающих",
    title: "Читай Коран – даже если сегодня ты не знаешь ни одной буквы",
    lead: "Этот курс учит читать письмо Корана так, как это делают в школах Корана уже много поколений: сначала буквы, затем их формы, затем огласовки – пока ты не начнёшь самостоятельно читать Аль-Фатиху и короткие суры. Небольшие уроки по пять минут – с упражнениями, парами и тестами.",
    stats: [`Уроков: ${LESSONS.length}`, `Разделов: ${UNITS.length}`, "28 букв", "5 мин на урок"],
    pathTitle: "Твой учебный путь",
    alphaTitle: "Арабский алфавит",
    howTitle: "Как ты здесь учишься",
    how: [
      ["Короткие уроки", "Каждый урок занимает около пяти минут: сначала учебные карточки, затем разнообразные упражнения."],
      ["Ошибки возвращаются", "Задания, в которых вышла ошибка, возвращаются в конце урока – пока материал не закрепится."],
      ["Произноси вслух", "Читать учатся ртом. Произноси каждый звук – если на твоём устройстве есть арабский голос, ты можешь его послушать."],
      ["От букв к Корану", "В разделе 6 ты читаешь настоящие слова Корана из сур Аль-Фатиха, Аль-Ихлас, Аль-Фаляк и Ан-Нас – с их значением. Затем ты слышишь их слово за словом в настоящем чтении и читаешь целые аяты. Если ты уже немного умеешь читать, начни с вводного теста."],
    ],
    teacher: "Некоторые звуки (ح ع ق ص ض ط ظ) лучше всего усваивать на слух и с учителем. Послушай чтеца в плеере и повторяй – так учат и в школах Корана.",
    after: "После курса",
    afterBody: "Когда ты умеешь читать, начинается настоящее приключение: по Методу Шамса ты заучиваешь Коран аят за аятом, а курс таджвида учит правилам красивого чтения.",
    ctaPath: "К учебному пути",
    ctaPlace: "Вводный тест",
    signsTitle: "Знаки письма Корана",
    signsLead: "Огласовки, удлинение, удвоение и особые знаки мушафа – каждый знак с примером. Ты отработаешь их все в разделах с 3 по 5.",
    sheetTitle: "Все буквы с первого взгляда",
    sheetLead: "Название, звук и три формы в соединении. Арабский читают справа налево – форма в начале слова стоит справа.",
    makhTitle: "Откуда берутся звуки",
    makhLead: "В таджвиде у каждой буквы есть своё место произношения (махрадж). Эти четыре группы особенно помогут тебе в начале:",
    makh: [
      ["Из горла", "ء ه ع ح غ خ", "Шесть букв выходят из горла: ء и ه – из самой глубины, ع и ح – из середины, غ и خ – из верхней части."],
      ["Губами", "ف ب م و", "Четыре буквы образуются губами: ف – нижней губой и верхними передними зубами, ب и م – сомкнутыми губами, و – округлёнными губами."],
      ["Тяжёлые буквы", "خ ص ض غ ط ق ظ", "Семь букв всегда произносятся «тяжело» и полно (тафхим), потому что поднимается задняя часть языка. Подсказка для запоминания: «خُصَّ ضَغْطٍ قِظْ»."],
      ["Буквы удлинения", "ا و ي", "ا, و и ي удлиняют предшествующую огласовку, если сами не несут огласовки: долгие ā, ū и ī. Место их произношения – полость рта и горла (аль-джауф)."],
    ],
    faqTitle: "Частые вопросы",
    faq: [
      ["Сколько длится курс?", `Уроков: ${LESSONS.length}, разделов: ${UNITS.length}. Каждый урок короткий, около пяти минут. Если заниматься по одному уроку в день, через несколько недель ты уже будешь читать целые аяты – а если времени больше, продвигаться можно быстрее.`],
      ["Нужно ли знать арабский?", "Нет. Курс учит читать письмо. Значение многих слов Корана ты узнаёшь попутно – для пополнения словарного запаса есть «Словарь Корана»."],
      ["Какое письмо я изучаю?", "Письмо Корана со всеми огласовками и знаками чтения, как в мушафе, – включая его особые знаки, такие как маленький алиф и васла. Начиная с раздела 6 ты читаешь настоящие слова и аяты из Корана."],
      ["Нужен ли аккаунт?", "Да, бесплатный. В нём сохраняется твой прогресс – уроки, звёзды и слова, которые стоит повторить, – и синхронизируется на всех твоих устройствах."],
      ["Подходит ли курс детям?", "Да. Уроки короткие и построены в игровой форме. Лучше всего, когда родители занимаются вместе с детьми и произносят каждый звук вместе."],
    ],
    ctaShams: "Узнать о Методе Шамса",
    ctaTajweed: "Курс таджвида",
  },
  zh: {
    kicker: "学读阿拉伯文 · 适合初学者",
    title: "学读古兰经——即使你今天一个字母都不认识",
    lead: "这门课程教你像古兰经学校世代相传的方式那样阅读古兰经文字：先学字母，再学字形，然后学元音符号——直到你能自己读开端章和各短章。每节课只有五分钟，配有练习、配对和测试。",
    stats: [`${LESSONS.length} 课`, `${UNITS.length} 个单元`, "28 个字母", "每课 5 分钟"],
    pathTitle: "你的学习路径",
    alphaTitle: "阿拉伯字母表",
    howTitle: "你在这里如何学习",
    how: [
      ["短课", "每节课大约五分钟：先是学习卡片，再是形式多样的练习。"],
      ["错题会再次出现", "你答错的内容会在课程结束时再次出现——直到你记住为止。"],
      ["大声读出来", "你是在用嘴巴学习阅读。把每个音都读出来——如果你的设备有阿拉伯语语音，还可以听它朗读。"],
      ["从字母到古兰经", "在第 6 单元，你会读到开端章、忠诚章、曙光章和世人章中的真实古兰经词语——并了解它们的含义。然后你会逐词聆听真实的诵读，并读出整节经文。如果你已经能读一点，请从水平测试开始。"],
    ],
    teacher: "有些音（ح ع ق ص ض ط ظ）最好通过聆听并在老师的指导下学习。请在播放器中聆听诵读者并跟读——就像古兰经学校的教法一样。",
    after: "课程之后",
    afterBody: "学会阅读之后，真正的旅程才刚刚开始：借助 Shams 方法，你可以逐节背诵经文；泰吉威德课程则教你优美诵读的规则。",
    ctaPath: "查看学习路径",
    ctaPlace: "水平测试",
    signsTitle: "古兰经书写体的符号",
    signsLead: "元音、延长、双写，以及 mushaf（古兰经抄本）特有的符号——每个符号都有示例。你将在第 3 至第 5 单元中练习所有这些符号。",
    sheetTitle: "每个字母一览",
    sheetLead: "名称、发音和三种连写字形。阿拉伯文从右向左阅读——词首的字形在最右边。",
    makhTitle: "声音从哪里发出",
    makhLead: "在泰吉威德中，每个字母都有自己的发音部位（makhraj）。刚开始时，这四组对你帮助最大：",
    makh: [
      ["来自喉部", "ء ه ع ح غ خ", "六个字母来自喉部：ء 和 ه 来自最深处，ع 和 ح 来自中部，غ 和 خ 来自上部。"],
      ["用双唇", "ف ب م و", "四个字母由嘴唇形成：ف 用下唇和上前齿，ب 和 م 双唇闭合，و 双唇圆拢。"],
      ["厚重字母", "خ ص ض غ ط ق ظ", "七个字母总是发得“厚重”而饱满（tafkhim），因为舌根抬起。记忆口诀：“خُصَّ ضَغْطٍ قِظْ”。"],
      ["延长字母", "ا و ي", "当 ا、و 和 ي 自身不带元音时，它们会延长前面的元音：长音 ā、ū 和 ī。它们来自口腔和喉部的空腔（al-jawf）。"],
    ],
    faqTitle: "常见问题",
    faq: [
      ["课程需要多长时间？", `分为 ${UNITS.length} 个单元，共 ${LESSONS.length} 节约五分钟的短课。每天学一课，几周内你就能读出整节经文——时间更充裕，进步会更快。`],
      ["我需要懂阿拉伯语吗？", "不需要。课程教你的是阅读文字。你会顺带学到许多古兰经词语的含义——想学更多词汇，可以使用词汇训练器。"],
      ["我学的是哪种文字？", "古兰经的文字，带有全部元音符号和诵读符号，与 mushaf（古兰经抄本）中的一致——包括小 alif 和 wasla 等特有符号。从第 6 单元起，你会读到古兰经中真实的词语和经文。"],
      ["我需要账户吗？", "需要，而且是免费的。它会保存你的进度——课程、星星和需要复习的词语——并同步到你所有的设备上。"],
      ["这门课程适合儿童吗？", "适合。课程简短而有趣。最美好的方式是家长和孩子一起学习，一起把每个音读出来。"],
    ],
    ctaShams: "了解 Shams 方法",
    ctaTajweed: "泰吉威德课程",
  },
};
// the locale's texts if the table has them, otherwise English
const langOf = (l: string): Lang => (l in C ? l : "en") as Lang;
const content = (l: string) => C[langOf(l)];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content(locale);
  return pageMeta(locale, "/arabic", `${c.kicker} | Quran Masterclass`, c.lead.slice(0, 158));
}

// the signs of the script, taken from the learning cards of units 3 to 5 (one place for every text)
const SIGN_LESSONS = ["c1", "c2", "c3", "d1", "d2", "d3", "d4", "e1", "e2"];

export default async function ArabicPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content(locale);
  const lang = langOf(locale);
  const ld = { "@context": "https://schema.org", "@type": "Course", name: c.title, description: c.lead, url: abs(`/${locale}/arabic`), inLanguage: locale, isAccessibleForFree: true, provider: { "@type": "Organization", name: "Quran Masterclass", url: abs("/") }, hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT5M" } };
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: c.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  const signs = SIGN_LESSONS.flatMap((id) => LESSONS.find((l) => l.id === id)?.learn ?? []);
  const tx = (v: L2) => v[lang] ?? v.en;
  return (
    <div>
      <JsonLd data={ld} />
      <JsonLd data={faqLd} />
      {/* hero: the alphabet on a ring of light */}
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 78% 45%, rgb(233 207 153 / .14) 0, transparent 46%)" }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] [&>*]:min-w-0">
          <div>
            <p className="rise text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{c.kicker}</p>
            <h1 className="rise font-display mt-4 max-w-3xl text-[38px] leading-[1.06] sm:text-[54px] lg:text-6xl" style={{ animationDelay: "100ms" }}>{c.title}</h1>
            <p className="rise mt-6 max-w-2xl text-[17px] leading-relaxed text-white/70 sm:text-[18px]" style={{ animationDelay: "200ms" }}>{c.lead}</p>
            <ul className="rise mt-7 flex flex-wrap gap-2" style={{ animationDelay: "280ms" }}>{c.stats.map((s) => <li key={s} className="inline-flex items-center gap-2 rounded-full border border-[rgb(214_180_108)]/30 bg-white/[0.04] px-3 py-1 text-sm text-white/85"><PracticeStar size={9} />{s}</li>)}</ul>
            <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "360ms" }}>
              <a href="#path" className="btn-gold inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{c.ctaPath}</a>
              <Link href="/arabic/placement" className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-[15px] font-bold hover:border-white">{c.ctaPlace}</Link>
            </div>
          </div>
          <figure className="pb-8" aria-label={c.alphaTitle}><PracticeAlphabetRing /></figure>
        </div>
        <div className="pa-arcade" />
      </section>

      <section id="path" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14">
        <h2 className="font-display mb-8 text-3xl sm:text-4xl">{c.pathTitle}</h2>
        <ArabicHome />
      </section>

      {/* how it works */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="font-display text-3xl sm:text-4xl">{c.howTitle}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.how.map(([h, d], i) => (
              <li key={h} className="pa-card p-5 pt-6">
                <PracticeStarNum n={i + 1} size={46} />
                <h3 className="mt-3 text-[17px] font-bold">{h}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{d}</p>
              </li>
            ))}
          </ul>
          <p className="callout mt-6 rounded-lg p-5 text-[15px] leading-relaxed">{c.teacher}</p>
        </div>
      </section>

      {/* the signs of the script */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-display text-3xl sm:text-4xl">{c.signsTitle}</h2>
        <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-muted">{c.signsLead}</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {signs.map((x) => (
            <li key={x.ar + tx(x.title)} className="pa-card flex gap-4 p-5">
              <span className="pa-arch-soft grid h-[92px] w-[84px] shrink-0 place-items-center border border-[rgb(var(--gold))]/35 bg-[rgb(var(--gold))]/[0.07] px-1 pt-3">
                <span className={`font-arabic whitespace-nowrap leading-[1.5] text-gold ${x.ar.length > 7 ? "text-[19px]" : x.ar.length > 4 ? "text-[25px]" : "text-[34px]"}`} dir="rtl" lang="ar">{x.ar}</span>
              </span>
              <span className="min-w-0">
                <span className="block text-[16px] font-bold leading-snug">{tx(x.title)}</span>
                <span className="mt-1 block text-[14px] leading-relaxed text-muted">{tx(x.body)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* where the sounds come from */}
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-16">
          <h2 className="font-display text-3xl sm:text-4xl">{c.makhTitle}</h2>
          <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-white/70">{c.makhLead}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.makh.map(([h, letters, d]) => (
              <li key={h} className="pa-arch-soft relative overflow-hidden border border-[rgb(214_180_108)]/30 bg-white/[0.04] px-5 pb-6 pt-8 text-center">
                <span aria-hidden className="niche" />
                <p className="font-arabic relative text-[27px] leading-[1.7] text-[#f3e2b6] sm:text-[30px]" dir="rtl" lang="ar">{letters}</p>
                <h3 className="relative mt-2 text-[17px] font-bold">{h}</h3>
                <p className="relative mt-2 text-[14px] leading-relaxed text-white/70">{d}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="pa-arcade" />
      </section>

      {/* every letter */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-display text-3xl sm:text-4xl">{c.sheetTitle}</h2>
        <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-muted">{c.sheetLead}</p>
        <div className="mt-8"><PracticeLetterSheet /></div>
      </section>

      {/* questions */}
      <section className="mx-auto max-w-3xl px-5 pb-16">
        <h2 className="font-display text-3xl sm:text-4xl">{c.faqTitle}</h2>
        <div className="mt-6 grid gap-3">
          {c.faq.map(([q, a]) => (
            <details key={q} className="pa-card pa-plain group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[17px] font-bold">{q}<span aria-hidden className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[rgb(var(--gold))]/50 text-gold transition group-open:rotate-45">+</span></summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="relative mx-auto grid max-w-5xl items-center gap-8 px-5 py-14 sm:grid-cols-[auto_minmax(0,1fr)] [&>*]:min-w-0">
          <PracticeWindow word="اقرأ" uid="ar-after" lamp className="mx-auto h-[220px] w-auto" />
          <div className="text-center sm:text-start">
            <h2 className="font-display text-3xl sm:text-4xl">{c.after}</h2>
            <p className="mt-4 max-w-2xl text-white/70">{c.afterBody}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 sm:justify-start">
              <Link href="/shams" className="btn-gold inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{c.ctaShams}</Link>
              <Link href="/tajweed" className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-[15px] font-bold hover:border-white">{c.ctaTajweed}</Link>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-4xl px-5 pt-12"><DonateCTA variant="slim" /></div>
      <MoreTiles keys={["salah", "tajweed", "vocab", "shams"]} />
    </div>
  );
}
