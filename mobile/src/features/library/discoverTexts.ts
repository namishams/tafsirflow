import { pick, useLang } from "@/i18n";

// Texts of the endless Discover (row titles and the app-only courses and tools that have no website tile).
// Polite address in every language.
export type DiscoverText = {
  rowLearn: string; rowQuran: string; rowDaily: string; rowHeritage: string; rowCommunity: string; rowStream: string; streamLead: string; loading: string; open: string;
  reciterPath: string; reciterPathD: string; cards: string; cardsD: string; tests: string; testsD: string;
  abrahamic: string; abrahamicD: string; haramain: string; haramainD: string; hadith: string; hadithD: string; nahj: string; nahjD: string;
  qibla: string; qiblaD: string; stories: string; storiesD: string; feed: string; feedD: string;
};

const T: { en: DiscoverText } & Record<string, DiscoverText> = {
  en: {
    rowLearn: "Learn and practise", rowQuran: "Quran, recitation and radio", rowDaily: "Prayer and every day", rowHeritage: "Hadith, stories and heritage", rowCommunity: "Community and progress",
    rowStream: "Keep discovering", streamLead: "Tafsir, hadith, duas, scholars, art and history, fresh with every scroll.", loading: "Loading more…", open: "Open",
    reciterPath: "Reciter path", reciterPathD: "Learn to recite step by step, with units and an exam.", cards: "Cards", cardsD: "Review words and verses with spaced repetition.",
    tests: "Tests", testsD: "Check your knowledge and earn certificates.", abrahamic: "Abrahamic heritage", abrahamicD: "Prophets, books and places shared with Judaism and Christianity.",
    haramain: "Haramain", haramainD: "Mecca and Medina: the Kaaba, the Prophet's Mosque and their history.", hadith: "Hadith", hadithD: "The great collections, searchable, with sources.",
    nahj: "Nahj al-Balagha", nahjD: "Sermons, letters and sayings of Imam Ali.", qibla: "Qibla", qiblaD: "The direction of the Kaaba from where you are.",
    stories: "Stories of the prophets", storiesD: "The prophets of the Quran, told chapter by chapter.", feed: "Quran Feed", feedD: "Verses, recitations and knowledge to scroll through.",
  },
  de: {
    rowLearn: "Lernen und üben", rowQuran: "Koran, Rezitation und Radio", rowDaily: "Gebet und Alltag", rowHeritage: "Hadith, Geschichten und Erbe", rowCommunity: "Gemeinschaft und Fortschritt",
    rowStream: "Weiter entdecken", streamLead: "Tafsir, Hadith, Duas, Gelehrte, Kunst und Geschichte, mit jedem Wischen neu.", loading: "Weitere Inhalte werden geladen …", open: "Öffnen",
    reciterPath: "Rezitationspfad", reciterPathD: "Lernen Sie Schritt für Schritt rezitieren, mit Einheiten und Prüfung.", cards: "Karten", cardsD: "Wiederholen Sie Wörter und Verse in Abständen.",
    tests: "Tests", testsD: "Prüfen Sie Ihr Wissen und erhalten Sie Zertifikate.", abrahamic: "Abrahamitisches Erbe", abrahamicD: "Propheten, Bücher und Orte, die Judentum und Christentum teilen.",
    haramain: "Haramain", haramainD: "Mekka und Medina: die Kaaba, die Prophetenmoschee und ihre Geschichte.", hadith: "Hadith", hadithD: "Die großen Sammlungen, durchsuchbar, mit Quellen.",
    nahj: "Nahj al-Balagha", nahjD: "Predigten, Briefe und Worte von Imam Ali.", qibla: "Qibla", qiblaD: "Die Richtung der Kaaba von Ihrem Standort aus.",
    stories: "Prophetengeschichten", storiesD: "Die Propheten des Korans, Kapitel für Kapitel erzählt.", feed: "Koran-Feed", feedD: "Verse, Rezitationen und Wissen zum Durchblättern.",
  },
  ar: {
    rowLearn: "تعلّم وتدرّب", rowQuran: "القرآن والتلاوة والإذاعة", rowDaily: "الصلاة والحياة اليومية", rowHeritage: "الحديث والقصص والتراث", rowCommunity: "المجتمع والتقدّم",
    rowStream: "واصلوا الاكتشاف", streamLead: "تفسير وحديث وأدعية وعلماء وفن وتاريخ، جديد مع كل تمرير.", loading: "جارٍ تحميل المزيد…", open: "فتح",
    reciterPath: "مسار التلاوة", reciterPathD: "تعلّموا التلاوة خطوة بخطوة مع وحدات واختبار.", cards: "البطاقات", cardsD: "راجعوا الكلمات والآيات بالتكرار المتباعد.",
    tests: "الاختبارات", testsD: "اختبروا معرفتكم واحصلوا على شهادات.", abrahamic: "التراث الإبراهيمي", abrahamicD: "أنبياء وكتب وأماكن مشتركة مع اليهودية والمسيحية.",
    haramain: "الحرمان", haramainD: "مكة والمدينة: الكعبة والمسجد النبوي وتاريخهما.", hadith: "الحديث", hadithD: "الكتب الكبرى، قابلة للبحث، مع المصادر.",
    nahj: "نهج البلاغة", nahjD: "خطب ورسائل وحكم الإمام علي.", qibla: "القبلة", qiblaD: "اتجاه الكعبة من موقعكم.",
    stories: "قصص الأنبياء", storiesD: "أنبياء القرآن، فصلاً بعد فصل.", feed: "موجز القرآن", feedD: "آيات وتلاوات ومعرفة للتصفح.",
  },
  tr: {
    rowLearn: "Öğrenin ve çalışın", rowQuran: "Kur'an, tilavet ve radyo", rowDaily: "Namaz ve günlük hayat", rowHeritage: "Hadis, kıssalar ve miras", rowCommunity: "Topluluk ve ilerleme",
    rowStream: "Keşfetmeye devam edin", streamLead: "Tefsir, hadis, dualar, âlimler, sanat ve tarih; her kaydırmada yeni.", loading: "Daha fazlası yükleniyor…", open: "Aç",
    reciterPath: "Tilavet yolu", reciterPathD: "Üniteler ve sınavla adım adım okumayı öğrenin.", cards: "Kartlar", cardsD: "Kelimeleri ve ayetleri aralıklı tekrarla pekiştirin.",
    tests: "Testler", testsD: "Bilginizi sınayın ve sertifika kazanın.", abrahamic: "İbrahimî miras", abrahamicD: "Yahudilik ve Hristiyanlıkla ortak peygamberler, kitaplar ve mekânlar.",
    haramain: "Haremeyn", haramainD: "Mekke ve Medine: Kâbe, Mescid-i Nebevî ve tarihleri.", hadith: "Hadis", hadithD: "Büyük koleksiyonlar, aranabilir, kaynaklarıyla.",
    nahj: "Nehcü'l-Belâğa", nahjD: "Hz. Ali'nin hutbeleri, mektupları ve sözleri.", qibla: "Kıble", qiblaD: "Bulunduğunuz yerden Kâbe'nin yönü.",
    stories: "Peygamber kıssaları", storiesD: "Kur'an'daki peygamberler, bölüm bölüm.", feed: "Kur'an Akışı", feedD: "Kaydırarak ayetler, tilavetler ve bilgi.",
  },
  ur: {
    rowLearn: "سیکھیں اور مشق کریں", rowQuran: "قرآن، تلاوت اور ریڈیو", rowDaily: "نماز اور روزمرہ", rowHeritage: "حدیث، قصے اور ورثہ", rowCommunity: "کمیونٹی اور پیش رفت",
    rowStream: "دریافت جاری رکھیں", streamLead: "تفسیر، حدیث، دعائیں، علما، فن اور تاریخ، ہر اسکرول پر نیا۔", loading: "مزید لوڈ ہو رہا ہے…", open: "کھولیں",
    reciterPath: "تلاوت کا راستہ", reciterPathD: "اکائیوں اور امتحان کے ساتھ قدم بہ قدم تلاوت سیکھیں۔", cards: "کارڈز", cardsD: "الفاظ اور آیات وقفے وقفے سے دہرائیں۔",
    tests: "ٹیسٹ", testsD: "اپنا علم جانچیں اور سرٹیفکیٹ حاصل کریں۔", abrahamic: "ابراہیمی ورثہ", abrahamicD: "یہودیت اور مسیحیت کے ساتھ مشترک انبیا، کتابیں اور مقامات۔",
    haramain: "حرمین", haramainD: "مکہ اور مدینہ: کعبہ، مسجد نبوی اور ان کی تاریخ۔", hadith: "حدیث", hadithD: "بڑے مجموعے، قابل تلاش، حوالوں کے ساتھ۔",
    nahj: "نہج البلاغہ", nahjD: "امام علی کے خطبے، خطوط اور اقوال۔", qibla: "قبلہ", qiblaD: "آپ کے مقام سے کعبہ کی سمت۔",
    stories: "انبیا کے قصے", storiesD: "قرآن کے انبیا، باب بہ باب۔", feed: "قرآن فیڈ", feedD: "آیات، تلاوتیں اور علم اسکرول کرنے کے لیے۔",
  },
  fr: {
    rowLearn: "Apprendre et s'exercer", rowQuran: "Coran, récitation et radio", rowDaily: "Prière et quotidien", rowHeritage: "Hadith, récits et patrimoine", rowCommunity: "Communauté et progrès",
    rowStream: "Continuer à découvrir", streamLead: "Tafsir, hadiths, invocations, savants, art et histoire, renouvelés à chaque défilement.", loading: "Chargement…", open: "Ouvrir",
    reciterPath: "Parcours de récitation", reciterPathD: "Apprenez à réciter pas à pas, avec unités et examen.", cards: "Cartes", cardsD: "Révisez mots et versets par répétition espacée.",
    tests: "Tests", testsD: "Vérifiez vos connaissances et obtenez des certificats.", abrahamic: "Héritage abrahamique", abrahamicD: "Prophètes, livres et lieux partagés avec le judaïsme et le christianisme.",
    haramain: "Haramayn", haramainD: "La Mecque et Médine : la Kaaba, la Mosquée du Prophète et leur histoire.", hadith: "Hadith", hadithD: "Les grands recueils, consultables, avec sources.",
    nahj: "Nahj al-Balagha", nahjD: "Sermons, lettres et paroles de l'imam Ali.", qibla: "Qibla", qiblaD: "La direction de la Kaaba depuis votre position.",
    stories: "Récits des prophètes", storiesD: "Les prophètes du Coran, chapitre par chapitre.", feed: "Fil du Coran", feedD: "Versets, récitations et savoir à faire défiler.",
  },
  es: {
    rowLearn: "Aprender y practicar", rowQuran: "Corán, recitación y radio", rowDaily: "Oración y día a día", rowHeritage: "Hadiz, relatos y patrimonio", rowCommunity: "Comunidad y progreso",
    rowStream: "Siga descubriendo", streamLead: "Tafsir, hadices, súplicas, sabios, arte e historia, nuevos en cada desplazamiento.", loading: "Cargando más…", open: "Abrir",
    reciterPath: "Ruta de recitación", reciterPathD: "Aprenda a recitar paso a paso, con unidades y examen.", cards: "Tarjetas", cardsD: "Repase palabras y aleyas con repetición espaciada.",
    tests: "Pruebas", testsD: "Compruebe sus conocimientos y obtenga certificados.", abrahamic: "Herencia abrahámica", abrahamicD: "Profetas, libros y lugares compartidos con el judaísmo y el cristianismo.",
    haramain: "Haramain", haramainD: "La Meca y Medina: la Kaaba, la Mezquita del Profeta y su historia.", hadith: "Hadiz", hadithD: "Las grandes colecciones, con búsqueda y fuentes.",
    nahj: "Nahj al-Balagha", nahjD: "Sermones, cartas y dichos del imam Ali.", qibla: "Qibla", qiblaD: "La dirección de la Kaaba desde su ubicación.",
    stories: "Historias de los profetas", storiesD: "Los profetas del Corán, capítulo a capítulo.", feed: "Feed del Corán", feedD: "Aleyas, recitaciones y saber para desplazarse.",
  },
  id: {
    rowLearn: "Belajar dan berlatih", rowQuran: "Al-Qur'an, tilawah, dan radio", rowDaily: "Salat dan keseharian", rowHeritage: "Hadis, kisah, dan warisan", rowCommunity: "Komunitas dan kemajuan",
    rowStream: "Terus menjelajah", streamLead: "Tafsir, hadis, doa, ulama, seni, dan sejarah, baru di setiap guliran.", loading: "Memuat lagi…", open: "Buka",
    reciterPath: "Jalur tilawah", reciterPathD: "Belajar membaca langkah demi langkah, dengan unit dan ujian.", cards: "Kartu", cardsD: "Ulangi kata dan ayat dengan pengulangan berjarak.",
    tests: "Tes", testsD: "Uji pengetahuan Anda dan raih sertifikat.", abrahamic: "Warisan Ibrahimi", abrahamicD: "Nabi, kitab, dan tempat yang sama dengan Yahudi dan Kristen.",
    haramain: "Haramain", haramainD: "Makkah dan Madinah: Ka'bah, Masjid Nabawi, dan sejarahnya.", hadith: "Hadis", hadithD: "Kitab-kitab besar, dapat dicari, dengan sumber.",
    nahj: "Nahjul Balaghah", nahjD: "Khutbah, surat, dan ucapan Imam Ali.", qibla: "Kiblat", qiblaD: "Arah Ka'bah dari lokasi Anda.",
    stories: "Kisah para nabi", storiesD: "Para nabi dalam Al-Qur'an, bab demi bab.", feed: "Feed Al-Qur'an", feedD: "Ayat, tilawah, dan ilmu untuk digulir.",
  },
  ms: {
    rowLearn: "Belajar dan berlatih", rowQuran: "Al-Quran, bacaan dan radio", rowDaily: "Solat dan harian", rowHeritage: "Hadis, kisah dan warisan", rowCommunity: "Komuniti dan kemajuan",
    rowStream: "Terus meneroka", streamLead: "Tafsir, hadis, doa, ulama, seni dan sejarah, baharu pada setiap tatalan.", loading: "Memuatkan lagi…", open: "Buka",
    reciterPath: "Laluan bacaan", reciterPathD: "Belajar membaca langkah demi langkah, dengan unit dan peperiksaan.", cards: "Kad", cardsD: "Ulang kaji perkataan dan ayat secara berjarak.",
    tests: "Ujian", testsD: "Uji pengetahuan anda dan peroleh sijil.", abrahamic: "Warisan Ibrahimi", abrahamicD: "Nabi, kitab dan tempat yang dikongsi dengan Yahudi dan Kristian.",
    haramain: "Haramain", haramainD: "Makkah dan Madinah: Kaabah, Masjid Nabawi dan sejarahnya.", hadith: "Hadis", hadithD: "Himpunan besar, boleh dicari, dengan sumber.",
    nahj: "Nahjul Balaghah", nahjD: "Khutbah, surat dan kata-kata Imam Ali.", qibla: "Kiblat", qiblaD: "Arah Kaabah dari lokasi anda.",
    stories: "Kisah para nabi", storiesD: "Para nabi dalam al-Quran, bab demi bab.", feed: "Suapan al-Quran", feedD: "Ayat, bacaan dan ilmu untuk ditatal.",
  },
  ru: {
    rowLearn: "Учиться и практиковаться", rowQuran: "Коран, чтение и радио", rowDaily: "Молитва и каждый день", rowHeritage: "Хадисы, истории и наследие", rowCommunity: "Сообщество и прогресс",
    rowStream: "Продолжайте открывать", streamLead: "Тафсир, хадисы, дуа, учёные, искусство и история — новое при каждой прокрутке.", loading: "Загрузка…", open: "Открыть",
    reciterPath: "Путь чтеца", reciterPathD: "Учитесь читать шаг за шагом, с разделами и экзаменом.", cards: "Карточки", cardsD: "Повторяйте слова и аяты с интервалами.",
    tests: "Тесты", testsD: "Проверьте свои знания и получите сертификаты.", abrahamic: "Авраамическое наследие", abrahamicD: "Пророки, книги и места, общие с иудаизмом и христианством.",
    haramain: "Харамайн", haramainD: "Мекка и Медина: Кааба, Мечеть Пророка и их история.", hadith: "Хадисы", hadithD: "Великие сборники с поиском и источниками.",
    nahj: "Нахдж аль-Балага", nahjD: "Проповеди, письма и изречения имама Али.", qibla: "Кибла", qiblaD: "Направление на Каабу от вашего места.",
    stories: "Истории пророков", storiesD: "Пророки Корана, глава за главой.", feed: "Лента Корана", feedD: "Аяты, чтения и знания для пролистывания.",
  },
  fa: {
    rowLearn: "یادگیری و تمرین", rowQuran: "قرآن، تلاوت و رادیو", rowDaily: "نماز و زندگی روزمره", rowHeritage: "حدیث، داستان‌ها و میراث", rowCommunity: "جامعه و پیشرفت",
    rowStream: "به کشف ادامه دهید", streamLead: "تفسیر، حدیث، دعا، علما، هنر و تاریخ؛ با هر پیمایش تازه.", loading: "در حال بارگذاری…", open: "باز کردن",
    reciterPath: "مسیر تلاوت", reciterPathD: "تلاوت را گام‌به‌گام با واحدها و آزمون بیاموزید.", cards: "کارت‌ها", cardsD: "واژه‌ها و آیات را با تکرار فاصله‌دار مرور کنید.",
    tests: "آزمون‌ها", testsD: "دانش خود را بسنجید و گواهی بگیرید.", abrahamic: "میراث ابراهیمی", abrahamicD: "پیامبران، کتاب‌ها و مکان‌های مشترک با یهودیت و مسیحیت.",
    haramain: "حرمین", haramainD: "مکه و مدینه: کعبه، مسجدالنبی و تاریخشان.", hadith: "حدیث", hadithD: "مجموعه‌های بزرگ، قابل جست‌وجو، با منبع.",
    nahj: "نهج‌البلاغه", nahjD: "خطبه‌ها، نامه‌ها و حکمت‌های امام علی.", qibla: "قبله", qiblaD: "جهت کعبه از محل شما.",
    stories: "داستان پیامبران", storiesD: "پیامبران قرآن، فصل به فصل.", feed: "فید قرآن", feedD: "آیات، تلاوت‌ها و دانش برای پیمایش.",
  },
  bn: {
    rowLearn: "শিখুন ও অনুশীলন করুন", rowQuran: "কুরআন, তিলাওয়াত ও রেডিও", rowDaily: "নামাজ ও দৈনন্দিন", rowHeritage: "হাদিস, কাহিনি ও ঐতিহ্য", rowCommunity: "কমিউনিটি ও অগ্রগতি",
    rowStream: "আবিষ্কার চালিয়ে যান", streamLead: "তাফসির, হাদিস, দোয়া, আলেম, শিল্প ও ইতিহাস, প্রতিটি স্ক্রলে নতুন।", loading: "আরও লোড হচ্ছে…", open: "খুলুন",
    reciterPath: "তিলাওয়াতের পথ", reciterPathD: "ইউনিট ও পরীক্ষাসহ ধাপে ধাপে তিলাওয়াত শিখুন।", cards: "কার্ড", cardsD: "ব্যবধানে পুনরাবৃত্তিতে শব্দ ও আয়াত ঝালাই করুন।",
    tests: "পরীক্ষা", testsD: "আপনার জ্ঞান যাচাই করুন ও সনদ অর্জন করুন।", abrahamic: "ইব্রাহিমি ঐতিহ্য", abrahamicD: "ইহুদি ও খ্রিস্টধর্মের সাথে অভিন্ন নবী, কিতাব ও স্থান।",
    haramain: "হারামাইন", haramainD: "মক্কা ও মদিনা: কাবা, মসজিদে নববি ও তাদের ইতিহাস।", hadith: "হাদিস", hadithD: "বড় সংকলনগুলো, অনুসন্ধানযোগ্য, সূত্রসহ।",
    nahj: "নাহজুল বালাগা", nahjD: "ইমাম আলীর খুতবা, পত্র ও বাণী।", qibla: "কিবলা", qiblaD: "আপনার অবস্থান থেকে কাবার দিক।",
    stories: "নবীদের কাহিনি", storiesD: "কুরআনের নবীগণ, অধ্যায় অনুযায়ী।", feed: "কুরআন ফিড", feedD: "স্ক্রল করার জন্য আয়াত, তিলাওয়াত ও জ্ঞান।",
  },
  ps: {
    rowLearn: "زده کړه او تمرین", rowQuran: "قرآن، تلاوت او راډیو", rowDaily: "لمونځ او ورځني ژوند", rowHeritage: "حدیث، کیسې او میراث", rowCommunity: "ټولنه او پرمختګ",
    rowStream: "کشف ته دوام ورکړئ", streamLead: "تفسیر، حدیث، دعاګانې، علما، هنر او تاریخ؛ په هر سکرول کې نوي.", loading: "نور بارېږي…", open: "پرانیستل",
    reciterPath: "د تلاوت لاره", reciterPathD: "تلاوت ګام په ګام د برخو او ازموینې سره زده کړئ.", cards: "کارتونه", cardsD: "کلمې او آیتونه په واټن لرونکي تکرار سره بیا وګورئ.",
    tests: "ازموینې", testsD: "خپله پوهه وازمویئ او سندونه ترلاسه کړئ.", abrahamic: "ابراهیمي میراث", abrahamicD: "له یهودیت او مسیحیت سره ګډ پیغمبران، کتابونه او ځایونه.",
    haramain: "حرمین", haramainD: "مکه او مدینه: کعبه، مسجد نبوي او د دوی تاریخ.", hadith: "حدیث", hadithD: "لویې ټولګې، د لټون وړ، له سرچینو سره.",
    nahj: "نهج البلاغه", nahjD: "د امام علي خطبې، لیکونه او وینا.", qibla: "قبله", qiblaD: "ستاسو له ځایه د کعبې لوری.",
    stories: "د پیغمبرانو کیسې", storiesD: "د قرآن پیغمبران، فصل په فصل.", feed: "د قرآن فیډ", feedD: "د سکرول لپاره آیتونه، تلاوتونه او پوهه.",
  },
  zh: {
    rowLearn: "学习与练习", rowQuran: "古兰经、诵读与电台", rowDaily: "礼拜与日常", rowHeritage: "圣训、故事与遗产", rowCommunity: "社区与进度",
    rowStream: "继续探索", streamLead: "经注、圣训、祈祷、学者、艺术与历史，每次滑动都有新内容。", loading: "正在加载更多…", open: "打开",
    reciterPath: "诵读之路", reciterPathD: "通过单元和考试，一步步学习诵读。", cards: "卡片", cardsD: "以间隔重复复习词语和经文。",
    tests: "测试", testsD: "检验您的知识并获得证书。", abrahamic: "亚伯拉罕传统", abrahamicD: "与犹太教和基督教共有的先知、经典与圣地。",
    haramain: "两圣寺", haramainD: "麦加与麦地那：克尔白、先知寺及其历史。", hadith: "圣训", hadithD: "主要圣训集，可搜索，附出处。",
    nahj: "辞章之道", nahjD: "伊玛目阿里的演讲、书信与箴言。", qibla: "朝向", qiblaD: "从您所在位置看克尔白的方向。",
    stories: "先知的故事", storiesD: "古兰经中的先知，逐章讲述。", feed: "古兰经动态", feedD: "可滑动浏览的经文、诵读与知识。",
  },
};

export function useDiscoverText(): DiscoverText {
  const { lang } = useLang();
  return pick<DiscoverText>(T, lang);
}
