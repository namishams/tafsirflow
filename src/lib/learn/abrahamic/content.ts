// mirrors mobile/src/features/abrahamic/content.ts (copied for the website; keep both in step)
// "Abraham and the Abrahamic religions in the Quran": units pairing Quran passages (verse keys only – the text comes
// from the app's verse data) with short neutral explanations and encyclopedia items (src/content/extra).
// From an Islamic perspective, respectful and factual: no polemics, no ranking, no rulings.
import type { ExtraKind } from "@/lib/learn/content/extra";

type L = { en: string } & Partial<Record<"de" | "ar" | "tr" | "ur" | "fa" | "ps" | "fr" | "es" | "id" | "ms" | "bn" | "ru" | "zh", string>>;

export type AbrahamicUnit = {
  id: string;
  arabic: string;
  title: L;
  /** short explanation in our own words (English fallback for languages without a version) */
  text: L;
  verses: string[];
  kind: ExtraKind;
  /** English Wikipedia titles, checked against the API */
  items: string[];
  highlight?: boolean;
};

export const UI: Record<string, L> = {
  eyebrow: { en: "Course", de: "Kurs", ar: "دورة", tr: "Kurs", ur: "کورس", fa: "دوره", ps: "کورس", fr: "Cours", es: "Curso", id: "Kursus", ms: "Kursus", bn: "কোর্স", ru: "Курс", zh: "课程" },
  title: {
    en: "Abraham and the Abrahamic religions in the Quran", de: "Abraham und die abrahamitischen Religionen im Koran",
    ar: "إبراهيم والأديان الإبراهيمية في القرآن", tr: "Kur'an'da Hz. İbrahim ve İbrahimî dinler", ur: "قرآن میں حضرت ابراہیم اور ابراہیمی مذاہب",
    fa: "ابراهیم و ادیان ابراهیمی در قرآن", ps: "په قرآن کې ابراهیم او ابراهیمي دینونه", fr: "Abraham et les religions abrahamiques dans le Coran",
    es: "Abraham y las religiones abrahámicas en el Corán", id: "Ibrahim dan agama-agama Abrahamik dalam Al-Qur'an",
    ms: "Ibrahim dan agama-agama Abrahamik dalam al-Quran", bn: "কুরআনে ইব্রাহিম ও আব্রাহামীয় ধর্মসমূহ", ru: "Авраам и авраамические религии в Коране", zh: "《古兰经》中的易卜拉欣与亚伯拉罕诸宗教",
  },
  lead: {
    en: "Quran passages on Ibrahim, Musa, Isa and Maryam, with short explanations and encyclopedia articles. Factual and respectful, without comparison or rulings.",
    de: "Koranstellen über Ibrahim, Musa, Isa und Maryam, mit kurzen Erläuterungen und Lexikonartikeln. Sachlich und respektvoll, ohne Vergleich und ohne Urteile.",
    ar: "آيات عن إبراهيم وموسى وعيسى ومريم مع شروح موجزة ومقالات موسوعية، بأسلوب موضوعي ومحترم دون مقارنة أو أحكام.",
    tr: "Hz. İbrahim, Musa, İsa ve Meryem hakkında ayetler; kısa açıklamalar ve ansiklopedi maddeleriyle. Tarafsız ve saygılı, karşılaştırma ve hüküm olmadan.",
    ur: "حضرت ابراہیم، موسیٰ، عیسیٰ اور مریم کے بارے میں آیات، مختصر وضاحتوں اور انسائیکلوپیڈیا مضامین کے ساتھ۔ غیر جانبدار اور باادب، بغیر موازنے یا احکام کے۔",
    fa: "آیاتی درباره ابراهیم، موسی، عیسی و مریم همراه با توضیحات کوتاه و مقالات دانشنامه‌ای؛ بی‌طرف و محترمانه، بدون مقایسه یا حکم.",
    ps: "د ابراهیم، موسی، عیسی او مریم په اړه آیتونه، د لنډو تشریحاتو او پوهنغونډ مقالو سره؛ بې‌طرفه او درناوي سره، پرته له پرتلې او حکمونو.",
    fr: "Des passages du Coran sur Ibrahim, Moussa, Issa et Maryam, avec de courtes explications et des articles d'encyclopédie. Factuel et respectueux, sans comparaison ni avis juridique.",
    es: "Pasajes del Corán sobre Ibrahim, Musa, Isa y Maryam, con breves explicaciones y artículos enciclopédicos. Objetivo y respetuoso, sin comparaciones ni dictámenes.",
    id: "Ayat-ayat tentang Ibrahim, Musa, Isa, dan Maryam, dengan penjelasan singkat dan artikel ensiklopedia. Faktual dan penuh hormat, tanpa perbandingan atau fatwa.",
    ms: "Ayat-ayat tentang Ibrahim, Musa, Isa dan Maryam, dengan penjelasan ringkas dan artikel ensiklopedia. Berfakta dan penuh hormat, tanpa perbandingan atau hukum.",
    bn: "ইব্রাহিম, মূসা, ঈসা ও মারইয়াম সম্পর্কে আয়াত, সংক্ষিপ্ত ব্যাখ্যা ও বিশ্বকোষ নিবন্ধসহ। তথ্যনিষ্ঠ ও শ্রদ্ধাশীল, তুলনা বা বিধান ছাড়া।",
    ru: "Аяты об Ибрахиме, Мусе, Исе и Марьям с краткими пояснениями и энциклопедическими статьями. Фактически и уважительно, без сравнений и правовых суждений.",
    zh: "关于易卜拉欣、穆萨、尔撒和麦尔彦的经文，配有简短说明和百科条目。客观、尊重，不作比较，不作裁决。",
  },
  verses: { en: "Quran", de: "Koran", ar: "القرآن", tr: "Kur'an", ur: "قرآن", fa: "قرآن", ps: "قرآن", fr: "Coran", es: "Corán", id: "Al-Qur'an", ms: "Al-Quran", bn: "কুরআন", ru: "Коран", zh: "古兰经" },
  read: { en: "Encyclopedia", de: "Lexikon", ar: "موسوعة", tr: "Ansiklopedi", ur: "انسائیکلوپیڈیا", fa: "دانشنامه", ps: "پوهنغونډ", fr: "Encyclopédie", es: "Enciclopedia", id: "Ensiklopedia", ms: "Ensiklopedia", bn: "বিশ্বকোষ", ru: "Энциклопедия", zh: "百科" },
  openReader: { en: "Open in the reader", de: "Im Leser öffnen", ar: "افتح في القارئ", tr: "Okuyucuda açın", ur: "ریڈر میں کھولیں", fa: "در قاری باز کنید", ps: "په لوستونکي کې یې پرانیزئ", fr: "Ouvrir dans le lecteur", es: "Abrir en el lector", id: "Buka di pembaca", ms: "Buka dalam pembaca", bn: "রিডারে খুলুন", ru: "Открыть в читалке", zh: "在阅读器中打开" },
  unlock: { en: "Unlock with Pro", de: "Mit Pro freischalten", ar: "افتح مع Pro", tr: "Pro ile açın", ur: "Pro کے ساتھ کھولیں", fa: "با Pro باز کنید", ps: "د Pro سره یې خلاص کړئ", fr: "Débloquer avec Pro", es: "Desbloquear con Pro", id: "Buka dengan Pro", ms: "Buka dengan Pro", bn: "Pro দিয়ে খুলুন", ru: "Открыть с Pro", zh: "通过 Pro 解锁" },
  free: { en: "Free", de: "Kostenlos", ar: "مجاني", tr: "Ücretsiz", ur: "مفت", fa: "رایگان", ps: "وړیا", fr: "Gratuit", es: "Gratis", id: "Gratis", ms: "Percuma", bn: "বিনামূল্যে", ru: "Бесплатно", zh: "免费" },
  unit: { en: "Unit", de: "Einheit", ar: "الوحدة", tr: "Ünite", ur: "یونٹ", fa: "بخش", ps: "برخه", fr: "Unité", es: "Unidad", id: "Unit", ms: "Unit", bn: "ইউনিট", ru: "Раздел", zh: "单元" },
  loading: { en: "Loading …", de: "Wird geladen …", ar: "جارٍ التحميل …", tr: "Yükleniyor …", ur: "لوڈ ہو رہا ہے …", fa: "در حال بارگذاری …", ps: "پورته کېږي …", fr: "Chargement …", es: "Cargando …", id: "Memuat …", ms: "Memuatkan …", bn: "লোড হচ্ছে …", ru: "Загрузка …", zh: "正在加载 …" },
  offline: { en: "Not available offline.", de: "Offline nicht verfügbar.", ar: "غير متاح دون اتصال.", tr: "Çevrimdışı kullanılamaz.", ur: "آف لائن دستیاب نہیں۔", fa: "در حالت آفلاین در دسترس نیست.", ps: "له انټرنېټ پرته شتون نه لري.", fr: "Indisponible hors ligne.", es: "No disponible sin conexión.", id: "Tidak tersedia secara luring.", ms: "Tidak tersedia di luar talian.", bn: "অফলাইনে পাওয়া যায় না।", ru: "Недоступно офлайн.", zh: "离线时不可用。" },
  card: {
    en: "Ibrahim, Musa, Isa and Maryam in the Quran", de: "Ibrahim, Musa, Isa und Maryam im Koran", ar: "إبراهيم وموسى وعيسى ومريم في القرآن",
    tr: "Kur'an'da İbrahim, Musa, İsa ve Meryem", ur: "قرآن میں ابراہیم، موسیٰ، عیسیٰ اور مریم", fa: "ابراهیم، موسی، عیسی و مریم در قرآن",
    ps: "په قرآن کې ابراهیم، موسی، عیسی او مریم", fr: "Ibrahim, Moussa, Issa et Maryam dans le Coran", es: "Ibrahim, Musa, Isa y Maryam en el Corán",
    id: "Ibrahim, Musa, Isa, dan Maryam dalam Al-Qur'an", ms: "Ibrahim, Musa, Isa dan Maryam dalam al-Quran", bn: "কুরআনে ইব্রাহিম, মূসা, ঈসা ও মারইয়াম",
    ru: "Ибрахим, Муса, Иса и Марьям в Коране", zh: "《古兰经》中的易卜拉欣、穆萨、尔撒和麦尔彦",
  },
  open: { en: "Open", de: "Öffnen", ar: "افتح", tr: "Açın", ur: "کھولیں", fa: "باز کنید", ps: "پرانیزئ", fr: "Ouvrir", es: "Abrir", id: "Buka", ms: "Buka", bn: "খুলুন", ru: "Открыть", zh: "打开" },
};

export const UNITS: AbrahamicUnit[] = [
  {
    id: "ibrahim", arabic: "إبراهيم", kind: "abrahamic-prophets",
    title: { en: "Ibrahim, the hanif", de: "Ibrahim, der Hanif", ar: "إبراهيم الحنيف", tr: "Hanif olan İbrahim", ur: "ابراہیم حنیف", fa: "ابراهیم حنیف", ps: "ابراهیم حنیف", fr: "Ibrahim, le hanif", es: "Ibrahim, el hanif", id: "Ibrahim yang hanif", ms: "Ibrahim yang hanif", bn: "হানিফ ইব্রাহিম", ru: "Ибрахим-ханиф", zh: "纯正的易卜拉欣" },
    text: {
      en: "The Quran presents Ibrahim as a hanif: someone who turned to the One God, tested and found true. With his son Ismail he raised the foundations of the House in Mecca, and his prayer for a safe town and a messenger from among its people is part of surah al-Baqarah and surah Ibrahim. Jews, Christians and Muslims all trace their faith back to Abraham, each in their own way.",
      de: "Der Koran beschreibt Ibrahim als Hanif: einen Menschen, der sich dem Einen Gott zuwandte, geprüft wurde und sich bewährte. Mit seinem Sohn Ismail errichtete er die Grundmauern des Hauses in Mekka; sein Gebet um eine sichere Stadt und einen Gesandten aus ihrer Mitte steht in Sure al-Baqara und Sure Ibrahim. Juden, Christen und Muslime führen ihren Glauben auf Abraham zurück, jede Tradition auf ihre eigene Weise.",
    },
    verses: ["2:124", "2:127", "2:128", "2:135", "3:67", "14:35", "14:37"],
    items: ["Abraham in Islam", "Abraham", "Hanif", "Millat Ibrahim", "Kaaba", "Maqam Ibrahim", "Zamzam Well"],
  },
  {
    id: "family", arabic: "آل إبراهيم", kind: "abrahamic-prophets",
    title: { en: "The family of Ibrahim", de: "Die Familie Ibrahims", ar: "آل إبراهيم", tr: "İbrahim ailesi", ur: "آلِ ابراہیم", fa: "خاندان ابراهیم", ps: "د ابراهیم کورنۍ", fr: "La famille d'Ibrahim", es: "La familia de Ibrahim", id: "Keluarga Ibrahim", ms: "Keluarga Ibrahim", bn: "ইব্রাহিমের পরিবার", ru: "Род Ибрахима", zh: "易卜拉欣的家族" },
    text: {
      en: "Through Ismail and Ishaq the Quran follows a line of prophets: Yaqub, who asked his sons what they would worship after him, and Yusuf, whose story is told as one surah. Al Imran opens its account by naming the family of Ibrahim and the family of Imran among those chosen. Many of these figures are also central in the Hebrew Bible.",
      de: "Über Ismail und Ishaq verfolgt der Koran eine Reihe von Propheten: Yaqub, der seine Söhne fragte, wem sie nach ihm dienen würden, und Yusuf, dessen Geschichte eine ganze Sure erzählt. Sure Al Imran nennt die Familie Ibrahims und die Familie Imrans unter den Erwählten. Viele dieser Gestalten stehen auch im Mittelpunkt der Hebräischen Bibel.",
    },
    verses: ["3:33", "3:34", "2:133", "2:136", "19:49", "19:54", "12:4"],
    items: ["Hagar in Islam", "Ishmael in Islam", "Isaac in Islam", "Jacob in Islam", "Joseph in Islam", "Israelites"],
  },
  {
    id: "musa", arabic: "موسى", kind: "abrahamic-prophets",
    title: { en: "Musa and Harun", de: "Musa und Harun", ar: "موسى وهارون", tr: "Musa ve Harun", ur: "موسیٰ اور ہارون", fa: "موسی و هارون", ps: "موسی او هارون", fr: "Moussa et Haroun", es: "Musa y Harún", id: "Musa dan Harun", ms: "Musa dan Harun", bn: "মূসা ও হারুন", ru: "Муса и Харун", zh: "穆萨与哈伦" },
    text: {
      en: "Musa is the prophet named most often in the Quran. Surah al-Qasas tells of his mother entrusting him to the river, his youth in Pharaoh's house and the call at the blessed valley, with Harun at his side. The Quran speaks of the Torah given to Musa as guidance and light; in Judaism Moses is the central teacher of the Torah.",
      de: "Musa ist der im Koran am häufigsten genannte Prophet. Sure al-Qasas erzählt, wie seine Mutter ihn dem Fluss anvertraute, von seiner Jugend im Haus Pharaos und vom Ruf im gesegneten Tal, mit Harun an seiner Seite. Der Koran spricht von der Tora, die Musa gegeben wurde, als Rechtleitung und Licht; im Judentum ist Mose der zentrale Lehrer der Tora.",
    },
    verses: ["28:7", "28:29", "28:30", "19:51", "19:53", "5:44"],
    items: ["Moses in Islam", "Moses", "Aaron in Islam", "Mount Sinai", "Torah in Islam", "Torah"],
  },
  {
    id: "maryam", arabic: "مريم", kind: "abrahamic-prophets",
    title: { en: "Maryam, Zakariya, Yahya and Isa", de: "Maryam, Zakariya, Yahya und Isa", ar: "مريم وزكريا ويحيى وعيسى", tr: "Meryem, Zekeriya, Yahya ve İsa", ur: "مریم، زکریا، یحییٰ اور عیسیٰ", fa: "مریم، زکریا، یحیی و عیسی", ps: "مریم، زکریا، یحیی او عیسی", fr: "Maryam, Zakariya, Yahya et Issa", es: "Maryam, Zakariya, Yahya e Isa", id: "Maryam, Zakaria, Yahya, dan Isa", ms: "Maryam, Zakaria, Yahya dan Isa", bn: "মারইয়াম, যাকারিয়া, ইয়াহইয়া ও ঈসা", ru: "Марьям, Закария, Яхья и Иса", zh: "麦尔彦、宰凯里雅、叶哈雅与尔撒" },
    text: {
      en: "Maryam is the only woman named in the Quran, and a surah carries her name. Al Imran and surah Maryam tell of her upbringing in Zakariya's care, the birth of Yahya, and the announcement of Isa, who is called a word from God and the Messiah. Christians hold Mary and Jesus in the highest honour as well; their beliefs about Jesus differ from the Quranic account, and this course describes the Quranic text without weighing one against the other.",
      de: "Maryam ist die einzige Frau, die der Koran beim Namen nennt, und eine Sure trägt ihren Namen. Al Imran und Sure Maryam erzählen von ihrem Aufwachsen in Zakariyas Obhut, der Geburt Yahyas und der Verkündigung Isas, der ein Wort Gottes und der Messias genannt wird. Auch Christen verehren Maria und Jesus zutiefst; ihr Glaube über Jesus unterscheidet sich von der koranischen Darstellung. Dieser Kurs beschreibt den Korantext, ohne das eine gegen das andere abzuwägen.",
    },
    verses: ["3:37", "3:42", "3:45", "19:7", "19:16", "19:30", "3:59"],
    items: ["Mary in Islam", "Mary, mother of Jesus", "Zechariah in Islam", "John the Baptist in Islam", "Jesus in Islam", "Jesus", "Gospel in Islam"],
  },
  {
    id: "book", arabic: "أهل الكتاب", kind: "abrahamic-religions",
    title: { en: "The People of the Book and a common word", de: "Die Leute der Schrift und ein gemeinsames Wort", ar: "أهل الكتاب والكلمة السواء", tr: "Ehl-i Kitap ve ortak söz", ur: "اہلِ کتاب اور مشترک بات", fa: "اهل کتاب و کلمه‌ای یکسان", ps: "اهل کتاب او یوه ګډه خبره", fr: "Les gens du Livre et une parole commune", es: "La gente del Libro y una palabra común", id: "Ahli Kitab dan kalimat yang sama", ms: "Ahli Kitab dan kalimah yang sama", bn: "আহলে কিতাব ও এক অভিন্ন বাণী", ru: "Люди Писания и общее слово", zh: "有经人与共同之言" },
    text: {
      en: "The Quran calls Jews and Christians the People of the Book and names earlier scriptures: the Torah, the Zabur given to Dawud, and the Injil given to Isa. Al Imran 3:64 invites them to a common word. In 2007 Muslim scholars took this verse as the title of an open letter to Christian leaders, and the Amman Message of 2004 set out a shared statement on Islam's diversity.",
      de: "Der Koran nennt Juden und Christen die Leute der Schrift und nennt frühere Schriften: die Tora, den Zabur, der Dawud gegeben wurde, und das Indschil, das Isa gegeben wurde. Al Imran 3:64 lädt sie zu einem gemeinsamen Wort ein. 2007 machten muslimische Gelehrte diesen Vers zum Titel eines offenen Briefes an christliche Kirchenführer; die Botschaft von Amman (2004) formulierte eine gemeinsame Erklärung zur Vielfalt im Islam.",
    },
    verses: ["3:64", "3:84", "4:163", "5:46", "29:46"],
    items: ["People of the Book", "Abrahamic religions", "Psalms in Islam", "David in Islam", "Solomon in Islam", "A Common Word between Us and You", "Amman Message"],
  },
  {
    id: "abu-dhabi", arabic: "بيت العائلة الإبراهيمية", kind: "abrahamic-places", highlight: true,
    title: { en: "Abrahamic Family House, Abu Dhabi", de: "Abrahamic Family House, Abu Dhabi", ar: "بيت العائلة الإبراهيمية، أبوظبي", tr: "İbrahimî Aile Evi, Abu Dabi", ur: "ابراہیمی فیملی ہاؤس، ابوظہبی", fa: "خانه خانواده ابراهیمی، ابوظبی", ps: "د ابراهیمي کورنۍ کور، ابوظبي", fr: "Maison de la famille abrahamique, Abou Dabi", es: "Casa de la Familia Abrahámica, Abu Dabi", id: "Rumah Keluarga Abrahamik, Abu Dhabi", ms: "Rumah Keluarga Abrahamik, Abu Dhabi", bn: "আব্রাহামিক ফ্যামিলি হাউস, আবুধাবি", ru: "Дом авраамической семьи, Абу-Даби", zh: "阿布扎比亚伯拉罕家族之家" },
    text: {
      en: "On Saadiyat Island in Abu Dhabi, the Abrahamic Family House opened in 2023: the Imam al-Tayeb Mosque, the St. Francis Church and the Moses Ben Maimon Synagogue stand side by side on one site, each a working house of worship. It grew out of the Document on Human Fraternity, signed in Abu Dhabi in 2019 by the Grand Imam of al-Azhar, Ahmad al-Tayeb, and Pope Francis. The Quran speaks of monasteries, churches, synagogues and mosques in which God's name is remembered (22:40), and of peoples made different so that they may know one another (49:13).",
      de: "Auf der Insel Saadiyat in Abu Dhabi wurde 2023 das Abrahamic Family House eröffnet: die Imam-al-Tayeb-Moschee, die Kirche St. Franziskus und die Moses-Ben-Maimon-Synagoge stehen nebeneinander auf einem Gelände, jedes ein genutztes Gotteshaus. Es geht auf das Dokument über die Brüderlichkeit aller Menschen zurück, das 2019 in Abu Dhabi vom Großimam der al-Azhar, Ahmad al-Tayyeb, und Papst Franziskus unterzeichnet wurde. Der Koran spricht von Klöstern, Kirchen, Synagogen und Moscheen, in denen Gottes Name gedacht wird (22:40), und von Völkern, die verschieden geschaffen wurden, damit sie einander kennenlernen (49:13).",
    },
    verses: ["22:40", "49:13", "5:48"],
    items: ["Abrahamic Family House", "Document on Human Fraternity", "Saadiyat Island"],
  },
  {
    id: "history", arabic: "التاريخ", kind: "interfaith-history",
    title: { en: "Places and history", de: "Orte und Geschichte", ar: "أماكن وتاريخ", tr: "Yerler ve tarih", ur: "مقامات اور تاریخ", fa: "مکان‌ها و تاریخ", ps: "ځایونه او تاریخ", fr: "Lieux et histoire", es: "Lugares e historia", id: "Tempat dan sejarah", ms: "Tempat dan sejarah", bn: "স্থান ও ইতিহাস", ru: "Места и история", zh: "地点与历史" },
    text: {
      en: "Hebron, Jerusalem, Mount Sinai and Mecca are tied to Abraham and his descendants in all three traditions. Historians also study how Muslims, Jews and Christians lived together, for example under the Constitution of Medina or in al-Andalus. The articles below describe these places and periods as historians see them.",
      de: "Hebron, Jerusalem, der Sinai und Mekka sind in allen drei Traditionen mit Abraham und seinen Nachkommen verbunden. Historiker untersuchen auch, wie Muslime, Juden und Christen zusammenlebten, etwa unter der Gemeindeordnung von Medina oder in al-Andalus. Die Artikel unten beschreiben diese Orte und Zeiten aus Sicht der Geschichtswissenschaft.",
    },
    verses: ["3:96", "3:97", "17:1", "95:2"],
    items: ["Cave of the Patriarchs", "Hebron", "Jerusalem", "Mount Sinai", "Constitution of Medina", "Convivencia", "Ashtiname of Muhammad"],
  },
];
