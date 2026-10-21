// SEO texts of the garden pages (server-safe), in all 14 website languages.
type M = { title: string; description: string };
type Page = "home" | "collection";
const T: Record<string, Record<Page, M>> = {
  en: {
    home: { title: "Your garden – a tree that grows with your Quran learning | Quran Masterclass", description: "Plant your own tree with a short ceremony and watch it grow with every verse you learn with the Shams Method. Thirteen stages over a year, a living landscape under the real sky over Makkah." },
    collection: { title: "Sticker collection – your garden | Quran Masterclass", description: "Your sticker collection from Quran Masterclass: verses, surahs, names of Allah, prophets, Hijri months and more, with series progress and the stated odds." },
  },
  de: {
    home: { title: "Ihr Garten – ein Baum, der mit Ihrem Quran-Lernen wächst | Quran Masterclass", description: "Pflanzen Sie mit einer kleinen Zeremonie Ihren eigenen Baum und sehen Sie ihn mit jedem Vers wachsen, den Sie mit der Shams-Methode lernen. Dreizehn Stufen über ein Jahr, eine lebendige Landschaft unter dem echten Himmel über Mekka." },
    collection: { title: "Sticker-Sammlung – Ihr Garten | Quran Masterclass", description: "Ihre Sticker-Sammlung aus Quran Masterclass: Verse, Suren, Namen Allahs, Propheten, Hidschri-Monate und mehr, mit Fortschritt je Serie und offen genannten Wahrscheinlichkeiten." },
  },
  ar: {
    home: { title: "حديقتك – شجرة تنمو مع تعلمك القرآن | Quran Masterclass", description: "ازرع شجرتك الخاصة في مراسم قصيرة وشاهدها تنمو مع كل آية تتعلمها بمنهج شمس. ثلاث عشرة مرحلة على مدى عام، في منظر حيّ تحت سماء مكة الحقيقية." },
    collection: { title: "مجموعة الملصقات – حديقتك | Quran Masterclass", description: "مجموعة ملصقاتك في Quran Masterclass: آيات وسور وأسماء الله الحسنى والأنبياء والأشهر الهجرية وغيرها، مع تقدم كل سلسلة والاحتمالات المعلنة." },
  },
  tr: {
    home: {"title":"Bahçeniz – Kur'an öğreniminizle büyüyen bir ağaç | Quran Masterclass","description":"Kısa bir törenle kendi ağacınızı dikin ve Şems Metodu ile öğrendiğiniz her ayetle büyüdüğünü görün. Bir yıla yayılan on üç aşama, Mekke'nin gerçek göğü altında canlı bir manzara."},
    collection: {"title":"Çıkartma koleksiyonu – bahçeniz | Quran Masterclass","description":"Quran Masterclass çıkartma koleksiyonunuz: ayetler, sureler, Esmaü'l-Hüsna, peygamberler, Hicri aylar ve dahası; seri ilerlemesi ve açıkça belirtilen olasılıklarla."},
  },
  ur: {
    home: {"title":"آپ کا باغ – ایک درخت جو آپ کے قرآن سیکھنے کے ساتھ بڑھتا ہے | Quran Masterclass","description":"ایک مختصر تقریب کے ساتھ اپنا درخت لگائیے اور شمس طریقے سے سیکھی ہر آیت کے ساتھ اسے بڑھتا دیکھیے۔ ایک سال پر پھیلے تیرہ مراحل، مکہ کے حقیقی آسمان تلے ایک زندہ منظر۔"},
    collection: {"title":"اسٹیکر مجموعہ – آپ کا باغ | Quran Masterclass","description":"Quran Masterclass میں آپ کا اسٹیکر مجموعہ: آیات، سورتیں، اللہ کے نام، انبیاء، ہجری مہینے اور مزید، ہر سلسلے کی پیش رفت اور واضح احتمالات کے ساتھ۔"},
  },
  fa: {
    home: {"title":"باغ شما – درختی که با یادگیری قرآن شما رشد می‌کند | Quran Masterclass","description":"با آیینی کوتاه درخت خود را بکارید و ببینید که با هر آیه‌ای که با روش شمس می‌آموزید رشد می‌کند. سیزده مرحله در طول یک سال، در چشم‌اندازی زنده زیر آسمان واقعی مکه."},
    collection: {"title":"مجموعه برچسب – باغ شما | Quran Masterclass","description":"مجموعه برچسب‌های شما در Quran Masterclass: آیات، سوره‌ها، اسماء الله، پیامبران، ماه‌های هجری و بیشتر، با پیشرفت هر مجموعه و احتمالات اعلام‌شده."},
  },
  ps: {
    home: {"title":"ستاسو باغ – یوه ونه چې ستاسو د قرآن زده کړې سره وده کوي | Quran Masterclass","description":"په یوه لنډ مراسم خپله ونه وکرئ او وګورئ چې د شمس طریقې سره د هر زده شوي آیت سره څنګه وده کوي. د یو کال په اوږدو کې دیارلس پړاوونه، د مکې د ریښتیني آسمان لاندې ژوندۍ منظره."},
    collection: {"title":"د سټیکرونو ټولګه – ستاسو باغ | Quran Masterclass","description":"په Quran Masterclass کې ستاسو د سټیکرونو ټولګه: آیتونه، سورتونه، د الله نومونه، پېغمبران، هجري میاشتې او نور، د هرې لړۍ پرمختګ او ښکاره احتمالونو سره."},
  },
  fr: {
    home: {"title":"Votre jardin – un arbre qui grandit avec votre apprentissage du Coran | Quran Masterclass","description":"Plantez votre propre arbre lors d'une courte cérémonie et regardez-le grandir avec chaque verset appris avec la méthode Shams. Treize étapes sur une année, un paysage vivant sous le vrai ciel de La Mecque."},
    collection: {"title":"Collection d'autocollants – votre jardin | Quran Masterclass","description":"Votre collection d'autocollants Quran Masterclass : versets, sourates, Noms d'Allah, prophètes, mois hégiriens et plus encore, avec la progression de chaque série et les probabilités affichées."},
  },
  es: {
    home: {"title":"Su jardín – un árbol que crece con su aprendizaje del Corán | Quran Masterclass","description":"Plante su propio árbol en una breve ceremonia y véalo crecer con cada versículo que aprende con el método Shams. Trece etapas a lo largo de un año, un paisaje vivo bajo el cielo real de La Meca."},
    collection: {"title":"Colección de pegatinas – su jardín | Quran Masterclass","description":"Su colección de pegatinas de Quran Masterclass: versículos, suras, Nombres de Alá, profetas, meses de la Hégira y más, con el progreso de cada serie y las probabilidades indicadas."},
  },
  id: {
    home: {"title":"Kebun Anda – pohon yang tumbuh bersama belajar Al-Qur'an Anda | Quran Masterclass","description":"Tanam pohon Anda sendiri dengan upacara singkat dan saksikan ia tumbuh dengan setiap ayat yang Anda pelajari dengan Metode Shams. Tiga belas tahap selama setahun, pemandangan hidup di bawah langit Makkah yang nyata."},
    collection: {"title":"Koleksi stiker – kebun Anda | Quran Masterclass","description":"Koleksi stiker Anda di Quran Masterclass: ayat, surah, Asmaul Husna, para nabi, bulan Hijriah, dan lainnya, dengan kemajuan setiap seri dan peluang yang dinyatakan."},
  },
  ms: {
    home: {"title":"Taman Anda – pokok yang membesar bersama pembelajaran Al-Quran Anda | Quran Masterclass","description":"Tanam pokok Anda sendiri dengan upacara ringkas dan lihat ia membesar dengan setiap ayat yang Anda pelajari dengan Kaedah Shams. Tiga belas peringkat sepanjang setahun, pemandangan hidup di bawah langit Makkah yang sebenar."},
    collection: {"title":"Koleksi pelekat – taman Anda | Quran Masterclass","description":"Koleksi pelekat Anda dalam Quran Masterclass: ayat, surah, Asmaul Husna, para nabi, bulan Hijrah dan banyak lagi, dengan kemajuan setiap siri dan kebarangkalian yang dinyatakan."},
  },
  bn: {
    home: {"title":"আপনার বাগান – একটি গাছ যা আপনার কুরআন শেখার সাথে বাড়ে | Quran Masterclass","description":"একটি ছোট অনুষ্ঠানে নিজের গাছ লাগান এবং শামস পদ্ধতিতে শেখা প্রতিটি আয়াতের সাথে একে বাড়তে দেখুন। এক বছর জুড়ে তেরোটি ধাপ, মক্কার আসল আকাশের নিচে একটি জীবন্ত দৃশ্য।"},
    collection: {"title":"স্টিকার সংগ্রহ – আপনার বাগান | Quran Masterclass","description":"Quran Masterclass-এ আপনার স্টিকার সংগ্রহ: আয়াত, সূরা, আল্লাহর নাম, নবীগণ, হিজরি মাস এবং আরও অনেক কিছু, প্রতিটি সিরিজের অগ্রগতি ও স্পষ্টভাবে উল্লিখিত সম্ভাবনাসহ।"},
  },
  ru: {
    home: {"title":"Ваш сад – дерево, которое растёт вместе с изучением Корана | Quran Masterclass","description":"Посадите своё дерево в короткой церемонии и смотрите, как оно растёт с каждым аятом, выученным по методу Шамс. Тринадцать этапов за год, живой пейзаж под настоящим небом Мекки."},
    collection: {"title":"Коллекция наклеек – Ваш сад | Quran Masterclass","description":"Ваша коллекция наклеек Quran Masterclass: аяты, суры, имена Аллаха, пророки, месяцы хиджры и многое другое, с прогрессом каждой серии и открыто указанными вероятностями."},
  },
  zh: {
    home: {"title":"您的花园 – 随您学习《古兰经》而成长的树 | Quran Masterclass","description":"通过简短的仪式种下您自己的树，看着它随您用 Shams 方法学习的每一节经文成长。一年中的十三个阶段，在麦加真实天空下的生动景色。"},
    collection: {"title":"贴纸收藏 – 您的花园 | Quran Masterclass","description":"您在 Quran Masterclass 的贴纸收藏：经文、章、真主的尊名、先知、伊斯兰历月份等，附有每个系列的进度和明确标示的概率。"},
  },
};
/** the sticker album of the feed (/garden/album, the app's /feed-stickers) */
const ALBUM: Record<string, M> = {
  en: { title: "Sticker album – your milestones | Quran Masterclass", description: "The sticker album of the Quran Masterclass feed: milestones for verses, words, quizzes, streaks and topics, and rare stickers that appear now and then, next to the big collection that feeds your tree." },
  de: { title: "Stickeralbum – Ihre Meilensteine | Quran Masterclass", description: "Das Stickeralbum des Quran-Masterclass-Feeds: Meilensteine für Verse, Wörter, Quizze, Serien und Themen und seltene Sticker, die ab und zu erscheinen, neben der großen Sammlung, die Ihren Baum nährt." },
  ar: { title: "ألبوم الملصقات – إنجازاتك | Quran Masterclass", description: "ألبوم ملصقات صفحة Quran Masterclass: إنجازات للآيات والكلمات والاختبارات والأيام المتتالية والموضوعات، وملصقات نادرة تظهر بين حين وآخر، إلى جانب المجموعة الكبرى التي تغذّي شجرتك." },
  tr: { title: "Çıkartma albümü – kilometre taşlarınız | Quran Masterclass", description: "Quran Masterclass akışının çıkartma albümü: ayetler, kelimeler, testler, seriler ve konular için kilometre taşları ve ara sıra çıkan nadir çıkartmalar; ağacınızı besleyen büyük koleksiyonun yanında." },
  ur: { title: "اسٹیکر البم – آپ کے سنگ میل | Quran Masterclass", description: "Quran Masterclass فیڈ کا اسٹیکر البم: آیات، الفاظ، کوئز، تسلسل اور موضوعات کے سنگ میل اور کبھی کبھار ملنے والے نایاب اسٹیکر، اس بڑے مجموعے کے ساتھ جو آپ کے درخت کی پرورش کرتا ہے۔" },
  fa: { title: "آلبوم برچسب – نقطه‌های عطف شما | Quran Masterclass", description: "آلبوم برچسب فید Quran Masterclass: نقطه‌های عطف برای آیات، واژه‌ها، آزمون‌ها، روزهای پیاپی و موضوعات، و برچسب‌های کمیابی که گاه‌به‌گاه پیدا می‌شوند، در کنار مجموعه بزرگی که درخت شما را می‌پروراند." },
  ps: { title: "د سټیکرونو البوم – ستاسو لاسته راوړنې | Quran Masterclass", description: "د Quran Masterclass فیډ د سټیکرونو البوم: د آیتونو، کلمو، ازموینو، پرلپسې ورځو او موضوعاتو لاسته راوړنې او نادر سټیکرونه چې کله ناکله راځي، د هغې لویې ټولګې تر څنګ چې ستاسو ونه پالي." },
  fr: { title: "Album d'autocollants – vos étapes | Quran Masterclass", description: "L'album d'autocollants du fil Quran Masterclass : des étapes pour les versets, les mots, les quiz, les séries et les thèmes, et des autocollants rares qui apparaissent de temps en temps, à côté de la grande collection qui nourrit votre arbre." },
  es: { title: "Álbum de pegatinas – sus logros | Quran Masterclass", description: "El álbum de pegatinas del feed de Quran Masterclass: logros por versículos, palabras, cuestionarios, rachas y temas, y pegatinas raras que aparecen de vez en cuando, junto a la gran colección que nutre su árbol." },
  id: { title: "Album stiker – pencapaian Anda | Quran Masterclass", description: "Album stiker feed Quran Masterclass: pencapaian untuk ayat, kata, kuis, hari beruntun, dan topik, serta stiker langka yang sesekali muncul, di samping koleksi besar yang menyuburkan pohon Anda." },
  ms: { title: "Album pelekat – pencapaian Anda | Quran Masterclass", description: "Album pelekat suapan Quran Masterclass: pencapaian untuk ayat, perkataan, kuiz, hari berturut-turut dan topik, serta pelekat jarang yang muncul sekali-sekala, di samping koleksi besar yang menyuburkan pokok Anda." },
  bn: { title: "স্টিকার অ্যালবাম – আপনার মাইলফলক | Quran Masterclass", description: "Quran Masterclass ফিডের স্টিকার অ্যালবাম: আয়াত, শব্দ, কুইজ, ধারাবাহিক দিন ও বিষয়ের মাইলফলক এবং মাঝে মাঝে আসা দুর্লভ স্টিকার, আপনার গাছকে পুষ্টি দেওয়া বড় সংগ্রহের পাশে।" },
  ru: { title: "Альбом наклеек – Ваши достижения | Quran Masterclass", description: "Альбом наклеек ленты Quran Masterclass: достижения за аяты, слова, викторины, серии дней и темы, а также редкие наклейки, которые иногда появляются, рядом с большой коллекцией, питающей Ваше дерево." },
  zh: { title: "贴纸册 – 您的里程碑 | Quran Masterclass", description: "Quran Masterclass 动态的贴纸册：经文、词汇、测验、连续天数和主题的里程碑，以及偶尔出现的稀有贴纸，旁边是滋养您的树的大收藏。" },
};
export function gardenMeta(locale: string, page: Page | "album"): M {
  if (page === "album") return ALBUM[locale] ?? ALBUM.en;
  return (T[locale] ?? T.en)[page];
}
