// "Haramain": the Kaaba, Mecca and Medina. Verse keys only (the text comes from the app's verse data), encyclopedia items
// from src/content/extra (kinds kaaba, mecca-history, medina-history, hejaz-geography). Factual, no polemics, no rulings.
import type { ExtraKind } from "@/content/extra";
import { HEJAZ_GEOGRAPHY, KAABA, MECCA_HISTORY, MEDINA_HISTORY } from "@/content/extra/haramain";

export type L = { en: string } & Partial<Record<"de" | "ar" | "tr" | "ur" | "fa" | "ps" | "fr" | "es" | "id" | "ms" | "bn" | "ru" | "zh", string>>;

/** "2:125-129" → ["2:125", …, "2:129"] */
export function expandRange(r: string): string[] {
  const [s, v] = r.split(":");
  if (!v) return [];
  const [a, b] = v.split("-").map(Number);
  return Array.from({ length: (b || a) - a + 1 }, (_, i) => `${s}:${a + i}`);
}

export type Section = { id: string; arabic: string; title: L; text: L; ranges: string[]; kind: ExtraKind; items: string[] };

export const SECTIONS: Section[] = [
  {
    id: "kaaba", arabic: "الكعبة", kind: "kaaba", items: KAABA.map((e) => e.title),
    ranges: ["2:125-129", "3:96-97", "22:26-29"],
    title: { en: "The Kaaba", de: "Die Kaaba", ar: "الكعبة المشرفة", tr: "Kâbe", ur: "خانہ کعبہ", fa: "کعبه", ps: "کعبه", fr: "La Kaaba", es: "La Kaaba", id: "Ka'bah", ms: "Kaabah", bn: "কাবা", ru: "Кааба", zh: "克尔白" },
    text: {
      en: "The Quran links the House to Ibrahim and Ismail. The building was rebuilt several times, among others by the Quraysh shortly before the revelation, by Abd Allah ibn al-Zubayr in 683 and after the floods of 1629/1630. Around it lie the Black Stone, Hijr Ismail, Maqam Ibrahim and the well of Zamzam.",
      de: "Der Koran verbindet das Haus mit Ibrahim und Ismail. Das Gebäude wurde mehrmals neu errichtet, unter anderem von den Quraisch kurz vor der Offenbarung, von Abd Allah ibn az-Zubair im Jahr 683 und nach den Fluten von 1629/1630. Um sie herum liegen der Schwarze Stein, Hidschr Ismail, Maqam Ibrahim und der Brunnen Zamzam.",
      ar: "يربط القرآن البيت بإبراهيم وإسماعيل. أُعيد بناء الكعبة مرات عدة، منها بناء قريش قبيل البعثة، وبناء عبد الله بن الزبير سنة 683م، وبعد سيول 1629/1630م. وحولها الحجر الأسود وحِجر إسماعيل ومقام إبراهيم وبئر زمزم.",
    },
  },
  {
    id: "mecca", arabic: "مكة", kind: "mecca-history", items: MECCA_HISTORY.map((e) => e.title),
    ranges: ["14:35-41", "105:1-5", "106:1-4"],
    title: { en: "Mecca", de: "Mekka", ar: "مكة المكرمة", tr: "Mekke", ur: "مکہ مکرمہ", fa: "مکه", ps: "مکه", fr: "La Mecque", es: "La Meca", id: "Makkah", ms: "Makkah", bn: "মক্কা", ru: "Мекка", zh: "麦加" },
    text: {
      en: "Before Islam, Mecca was a trading town of the Quraysh on the caravan routes between Yemen and Syria. The articles cover the Year of the Elephant, the Hilf al-Fudul, the idols of the Kaaba and their removal in 630, Dar al-Arqam, the Hijra and the expansions of the Masjid al-Haram up to today.",
      de: "Vor dem Islam war Mekka eine Handelsstadt der Quraisch an den Karawanenwegen zwischen Jemen und Syrien. Die Artikel behandeln das Jahr des Elefanten, den Hilf al-Fudul, die Götzenbilder der Kaaba und ihre Entfernung im Jahr 630, Dar al-Arqam, die Hidschra und die Erweiterungen der Masjid al-Haram bis heute.",
      ar: "كانت مكة قبل الإسلام بلدة تجارية لقريش على طرق القوافل بين اليمن والشام. تتناول المقالات عام الفيل وحلف الفضول وأصنام الكعبة وإزالتها سنة 630م ودار الأرقم والهجرة وتوسعات المسجد الحرام حتى اليوم.",
    },
  },
  {
    id: "medina", arabic: "المدينة", kind: "medina-history", items: MEDINA_HISTORY.map((e) => e.title),
    ranges: ["9:100", "9:108", "59:9"],
    title: { en: "Medina", de: "Medina", ar: "المدينة المنورة", tr: "Medine", ur: "مدینہ منورہ", fa: "مدینه", ps: "مدینه", fr: "Médine", es: "Medina", id: "Madinah", ms: "Madinah", bn: "মদিনা", ru: "Медина", zh: "麦地那" },
    text: {
      en: "Yathrib was an oasis of the Aws and Khazraj and of Jewish tribes. After the Hijra in 622 it became Madinat an-Nabi. The articles cover the Constitution of Medina, the Prophet's Mosque and its expansions, the Green Dome, Quba, Qiblatayn, the battle sites and the city today.",
      de: "Yathrib war eine Oase der Aus und Chazradsch sowie jüdischer Stämme. Nach der Hidschra 622 wurde sie zur Madinat an-Nabi. Die Artikel behandeln die Gemeindeordnung von Medina, die Prophetenmoschee und ihre Erweiterungen, die Grüne Kuppel, Quba, Qiblatain, die Schauplätze der Schlachten und die Stadt heute.",
      ar: "كانت يثرب واحة للأوس والخزرج وقبائل يهودية، وبعد الهجرة سنة 622م صارت مدينة النبي. تتناول المقالات صحيفة المدينة والمسجد النبوي وتوسعاته والقبة الخضراء وقباء والقبلتين ومواقع الغزوات والمدينة اليوم.",
    },
  },
  {
    id: "hejaz", arabic: "الحجاز", kind: "hejaz-geography", items: HEJAZ_GEOGRAPHY.map((e) => e.title),
    ranges: [],
    title: { en: "The Hejaz", de: "Der Hidschas", ar: "الحجاز", tr: "Hicaz", ur: "حجاز", fa: "حجاز", ps: "حجاز", fr: "Le Hedjaz", es: "El Hiyaz", id: "Hijaz", ms: "Hijaz", bn: "হেজাজ", ru: "Хиджаз", zh: "汉志" },
    text: {
      en: "The Hejaz lies between the Red Sea coast (Tihamah) and the Sarawat Mountains. Wadis, lava fields such as Harrat Rahat and a hot desert climate shape the region of Mecca, Medina and Taif.",
      de: "Der Hidschas liegt zwischen der Küste am Roten Meer (Tihama) und dem Sarawat-Gebirge. Wadis, Lavafelder wie Harrat Rahat und heißes Wüstenklima prägen die Gegend um Mekka, Medina und Taif.",
      ar: "يقع الحجاز بين ساحل البحر الأحمر (تهامة) وجبال السروات، وتطبع الأوديةُ والحرّاتُ مثل حرة رهط والمناخُ الصحراوي الحار منطقةَ مكة والمدينة والطائف.",
    },
  },
];

export type Era = { year: string; title: L };
/** timeline from Ibrahim and Ismail to today (Gregorian years) */
export const TIMELINE: Era[] = [
  { year: "", title: { en: "Ibrahim and Ismail raise the House", de: "Ibrahim und Ismail errichten das Haus", ar: "إبراهيم وإسماعيل يرفعان القواعد من البيت", tr: "İbrahim ve İsmail Beyt'i yükseltir", ur: "ابراہیم اور اسماعیل بیت اللہ کی بنیادیں اٹھاتے ہیں", fa: "ابراهیم و اسماعیل پایه‌های خانه را بالا می‌برند", ps: "ابراهیم او اسماعیل د کور بنسټونه پورته کوي", fr: "Ibrahim et Ismaïl élèvent la Maison", es: "Ibrahim e Ismail levantan la Casa", id: "Ibrahim dan Ismail meninggikan Baitullah", ms: "Ibrahim dan Ismail meninggikan Baitullah", bn: "ইব্রাহিম ও ইসমাইল ঘরের ভিত্তি তোলেন", ru: "Ибрахим и Исмаил возводят Дом", zh: "易卜拉欣与伊斯玛仪建造天房" } },
  { year: "~5th c.", title: { en: "Qusayy unites the Quraysh in Mecca", de: "Qusai vereint die Quraisch in Mekka", ar: "قصي بن كلاب يجمع قريشًا في مكة", tr: "Kusay, Kureyş'i Mekke'de birleştirir", ur: "قصی بن کلاب قریش کو مکہ میں جمع کرتے ہیں", fa: "قصی قریش را در مکه گرد می‌آورد", ps: "قصي قریش په مکه کې راټولوي", fr: "Qusayy réunit les Quraych à La Mecque", es: "Qusayy reúne a los Quraysh en La Meca", id: "Qusay menyatukan Quraisy di Makkah", ms: "Qusai menyatukan Quraisy di Makkah", bn: "কুসাই মক্কায় কুরাইশকে একত্র করেন", ru: "Кусай объединяет курайшитов в Мекке", zh: "古赛伊在麦加联合古莱什人" } },
  { year: "~570", title: { en: "Year of the Elephant", de: "Jahr des Elefanten", ar: "عام الفيل", tr: "Fil Yılı", ur: "عام الفیل", fa: "عام‌الفیل", ps: "د فیل کال", fr: "Année de l'Éléphant", es: "Año del Elefante", id: "Tahun Gajah", ms: "Tahun Gajah", bn: "হস্তীর বছর", ru: "Год слона", zh: "象年" } },
  { year: "610", title: { en: "First revelation at Hira", de: "Erste Offenbarung in Hira", ar: "بدء الوحي في غار حراء", tr: "Hira'da ilk vahiy", ur: "غار حرا میں پہلی وحی", fa: "نخستین وحی در غار حرا", ps: "په حرا کې لومړی وحي", fr: "Première révélation à Hira", es: "Primera revelación en Hira", id: "Wahyu pertama di Gua Hira", ms: "Wahyu pertama di Gua Hira", bn: "হেরায় প্রথম ওহি", ru: "Первое откровение в Хира", zh: "希拉山洞首次启示" } },
  { year: "622", title: { en: "Hijra to Yathrib, which becomes Medina", de: "Hidschra nach Yathrib, das zu Medina wird", ar: "الهجرة إلى يثرب التي صارت المدينة", tr: "Yesrib'e hicret, şehir Medine olur", ur: "یثرب کی طرف ہجرت، جو مدینہ بنا", fa: "هجرت به یثرب که مدینه شد", ps: "یثرب ته هجرت چې مدینه شوه", fr: "Hégire vers Yathrib, qui devient Médine", es: "Hégira a Yathrib, que se convierte en Medina", id: "Hijrah ke Yatsrib yang menjadi Madinah", ms: "Hijrah ke Yathrib yang menjadi Madinah", bn: "ইয়াসরিবে হিজরত, যা মদিনা হয়", ru: "Хиджра в Ясриб, ставший Мединой", zh: "迁徙至叶斯里卜，即后来的麦地那" } },
  { year: "630", title: { en: "Conquest of Mecca, the idols are removed", de: "Einnahme Mekkas, die Götzenbilder werden entfernt", ar: "فتح مكة وإزالة الأصنام", tr: "Mekke'nin fethi, putlar kaldırılır", ur: "فتح مکہ، بت ہٹائے جاتے ہیں", fa: "فتح مکه و برداشتن بت‌ها", ps: "د مکې فتح، بتان لرې کېږي", fr: "Conquête de La Mecque, les idoles sont retirées", es: "Conquista de La Meca, se retiran los ídolos", id: "Fathu Makkah, berhala disingkirkan", ms: "Pembukaan Makkah, berhala disingkirkan", bn: "মক্কা বিজয়, মূর্তি অপসারণ", ru: "Взятие Мекки, идолы убраны", zh: "光复麦加，移除偶像" } },
  { year: "632–1258", title: { en: "Caliphates: first expansions of both mosques", de: "Kalifate: erste Erweiterungen beider Moscheen", ar: "الخلافات: أولى توسعات المسجدين", tr: "Hilafetler: iki mescidin ilk genişletmeleri", ur: "خلافتیں: دونوں مساجد کی پہلی توسیعات", fa: "خلافت‌ها: نخستین گسترش دو مسجد", ps: "خلافتونه: د دواړو جوماتونو لومړني پراختیاوې", fr: "Califats : premiers agrandissements des deux mosquées", es: "Califatos: primeras ampliaciones de ambas mezquitas", id: "Kekhalifahan: perluasan pertama kedua masjid", ms: "Kekhalifahan: perluasan pertama kedua-dua masjid", bn: "খিলাফত: দুই মসজিদের প্রথম সম্প্রসারণ", ru: "Халифаты: первые расширения обеих мечетей", zh: "哈里发时期：两座清真寺的首次扩建" } },
  { year: "1517–1916", title: { en: "Ottoman era: domes and arcades, Hejaz Railway", de: "Osmanische Zeit: Kuppeln und Arkaden, Hedschasbahn", ar: "العهد العثماني: القباب والأروقة وسكة حديد الحجاز", tr: "Osmanlı dönemi: kubbeler, revaklar, Hicaz Demiryolu", ur: "عثمانی دور: گنبد، برآمدے اور حجاز ریلوے", fa: "دوره عثمانی: گنبدها، رواق‌ها و راه‌آهن حجاز", ps: "عثماني دوره: گنبدونه، برنډې او د حجاز اورګاډی", fr: "Époque ottomane : coupoles, arcades, chemin de fer du Hedjaz", es: "Época otomana: cúpulas, arcadas y ferrocarril del Hiyaz", id: "Masa Utsmaniyah: kubah, serambi, Kereta Api Hijaz", ms: "Zaman Uthmaniyah: kubah, serambi, Kereta Api Hijaz", bn: "উসমানীয় যুগ: গম্বুজ, খিলান, হেজাজ রেলপথ", ru: "Османская эпоха: купола, галереи, Хиджазская железная дорога", zh: "奥斯曼时期：圆顶、拱廊与汉志铁路" } },
  { year: "1950s–today", title: { en: "Modern expansions, Mecca and Medina today", de: "Moderne Erweiterungen, Mekka und Medina heute", ar: "التوسعات الحديثة ومكة والمدينة اليوم", tr: "Modern genişletmeler, bugün Mekke ve Medine", ur: "جدید توسیعات، آج کا مکہ اور مدینہ", fa: "گسترش‌های جدید، مکه و مدینه امروز", ps: "نوې پراختیاوې، نن ورځ مکه او مدینه", fr: "Agrandissements modernes, La Mecque et Médine aujourd'hui", es: "Ampliaciones modernas, La Meca y Medina hoy", id: "Perluasan modern, Makkah dan Madinah kini", ms: "Perluasan moden, Makkah dan Madinah kini", bn: "আধুনিক সম্প্রসারণ, আজকের মক্কা ও মদিনা", ru: "Современные расширения, Мекка и Медина сегодня", zh: "现代扩建，今日的麦加与麦地那" } },
];

const L14 = (en: string, de: string, ar: string, tr: string, ur: string, fa: string, ps: string, fr: string, es: string, id: string, ms: string, bn: string, ru: string, zh: string): L =>
  ({ en, de, ar, tr, ur, fa, ps, fr, es, id, ms, bn, ru, zh });

export const UI: Record<string, L> = {
  eyebrow: L14("Haramain", "Haramain", "الحرمان", "Harameyn", "حرمین", "حرمین", "حرمین", "Haramayn", "Haramain", "Haramain", "Haramain", "হারামাইন", "Харамейн", "两圣地"),
  title: L14("The Kaaba, Mecca and Medina", "Kaaba, Mekka und Medina", "الكعبة ومكة والمدينة", "Kâbe, Mekke ve Medine", "کعبہ، مکہ اور مدینہ", "کعبه، مکه و مدینه", "کعبه، مکه او مدینه", "La Kaaba, La Mecque et Médine", "La Kaaba, La Meca y Medina", "Ka'bah, Makkah, dan Madinah", "Kaabah, Makkah dan Madinah", "কাবা, মক্কা ও মদিনা", "Кааба, Мекка и Медина", "克尔白、麦加与麦地那"),
  lead: L14(
    "History from Ibrahim and Ismail to today, with Quran passages and encyclopedia articles.",
    "Geschichte von Ibrahim und Ismail bis heute, mit Koranstellen und Lexikonartikeln.",
    "التاريخ من إبراهيم وإسماعيل إلى اليوم، مع آيات من القرآن ومقالات موسوعية.",
    "İbrahim ve İsmail'den bugüne tarih; ayetler ve ansiklopedi maddeleriyle.",
    "ابراہیم اور اسماعیل سے آج تک کی تاریخ، آیات اور انسائیکلوپیڈیا مضامین کے ساتھ۔",
    "تاریخ از ابراهیم و اسماعیل تا امروز، با آیات قرآن و مقالات دانشنامه‌ای.",
    "له ابراهیم او اسماعیل څخه تر نن پورې تاریخ، د آیتونو او پوهنغونډ مقالو سره.",
    "L'histoire d'Ibrahim et Ismaïl à aujourd'hui, avec des passages du Coran et des articles d'encyclopédie.",
    "La historia desde Ibrahim e Ismail hasta hoy, con pasajes del Corán y artículos enciclopédicos.",
    "Sejarah dari Ibrahim dan Ismail hingga kini, dengan ayat Al-Qur'an dan artikel ensiklopedia.",
    "Sejarah dari Ibrahim dan Ismail hingga kini, dengan ayat al-Quran dan artikel ensiklopedia.",
    "ইব্রাহিম ও ইসমাইল থেকে আজ পর্যন্ত ইতিহাস, কুরআনের আয়াত ও বিশ্বকোষ নিবন্ধসহ।",
    "История от Ибрахима и Исмаила до наших дней, с аятами Корана и энциклопедическими статьями.",
    "从易卜拉欣和伊斯玛仪到今天的历史，配有经文和百科条目。"),
  timeline: L14("Timeline", "Zeitleiste", "خط زمني", "Zaman çizelgesi", "ٹائم لائن", "گاه‌شمار", "مهال‌وېش", "Chronologie", "Cronología", "Lini masa", "Garis masa", "সময়রেখা", "Хронология", "时间线"),
  verses: L14("Quran", "Koran", "القرآن", "Kur'an", "قرآن", "قرآن", "قرآن", "Coran", "Corán", "Al-Qur'an", "Al-Quran", "কুরআন", "Коран", "古兰经"),
  read: L14("Encyclopedia", "Lexikon", "موسوعة", "Ansiklopedi", "انسائیکلوپیڈیا", "دانشنامه", "پوهنغونډ", "Encyclopédie", "Enciclopedia", "Ensiklopedia", "Ensiklopedia", "বিশ্বকোষ", "Энциклопедия", "百科"),
  openReader: L14("Open in the reader", "Im Leser öffnen", "افتح في القارئ", "Okuyucuda açın", "ریڈر میں کھولیں", "در قاری باز کنید", "په لوستونکي کې یې پرانیزئ", "Ouvrir dans le lecteur", "Abrir en el lector", "Buka di pembaca", "Buka dalam pembaca", "রিডারে খুলুন", "Открыть в читалке", "在阅读器中打开"),
  free: L14("Free", "Kostenlos", "مجاني", "Ücretsiz", "مفت", "رایگان", "وړیا", "Gratuit", "Gratis", "Gratis", "Percuma", "বিনামূল্যে", "Бесплатно", "免费"),
  pro: L14("Unlock with Pro", "Mit Pro freischalten", "افتح مع Pro", "Pro ile açın", "Pro کے ساتھ کھولیں", "با Pro باز کنید", "د Pro سره یې خلاص کړئ", "Débloquer avec Pro", "Desbloquear con Pro", "Buka dengan Pro", "Buka dengan Pro", "Pro দিয়ে খুলুন", "Открыть с Pro", "通过 Pro 解锁"),
  loading: L14("Loading …", "Wird geladen …", "جارٍ التحميل …", "Yükleniyor …", "لوڈ ہو رہا ہے …", "در حال بارگذاری …", "پورته کېږي …", "Chargement …", "Cargando …", "Memuat …", "Memuatkan …", "লোড হচ্ছে …", "Загрузка …", "正在加载 …"),
  offline: L14("Not available offline.", "Offline nicht verfügbar.", "غير متاح دون اتصال.", "Çevrimdışı kullanılamaz.", "آف لائن دستیاب نہیں۔", "در حالت آفلاین در دسترس نیست.", "له انټرنېټ پرته شتون نه لري.", "Indisponible hors ligne.", "No disponible sin conexión.", "Tidak tersedia secara luring.", "Tidak tersedia di luar talian.", "অফলাইনে পাওয়া যায় না।", "Недоступно офлайн.", "离线时不可用。"),
  share: L14("Share", "Teilen", "مشاركة", "Paylaşın", "شیئر کریں", "اشتراک‌گذاری", "شریک یې کړئ", "Partager", "Compartir", "Bagikan", "Kongsi", "শেয়ার করুন", "Поделиться", "分享"),
  shareMsg: L14(
    "The Kaaba, Mecca and Medina: history, Quran passages and pictures in Quran Masterclass",
    "Kaaba, Mekka und Medina: Geschichte, Koranstellen und Bilder in Quran Masterclass",
    "الكعبة ومكة والمدينة: تاريخ وآيات وصور في Quran Masterclass",
    "Kâbe, Mekke ve Medine: Quran Masterclass'ta tarih, ayetler ve görseller",
    "کعبہ، مکہ اور مدینہ: Quran Masterclass میں تاریخ، آیات اور تصاویر",
    "کعبه، مکه و مدینه: تاریخ، آیات و تصاویر در Quran Masterclass",
    "کعبه، مکه او مدینه: په Quran Masterclass کې تاریخ، آیتونه او انځورونه",
    "La Kaaba, La Mecque et Médine : histoire, versets et images dans Quran Masterclass",
    "La Kaaba, La Meca y Medina: historia, versículos e imágenes en Quran Masterclass",
    "Ka'bah, Makkah, dan Madinah: sejarah, ayat, dan gambar di Quran Masterclass",
    "Kaabah, Makkah dan Madinah: sejarah, ayat dan gambar dalam Quran Masterclass",
    "কাবা, মক্কা ও মদিনা: Quran Masterclass-এ ইতিহাস, আয়াত ও ছবি",
    "Кааба, Мекка и Медина: история, аяты и изображения в Quran Masterclass",
    "克尔白、麦加与麦地那：Quran Masterclass 中的历史、经文与图片"),
  card: L14("History, Quran passages and pictures", "Geschichte, Koranstellen und Bilder", "تاريخ وآيات وصور", "Tarih, ayetler ve görseller", "تاریخ، آیات اور تصاویر", "تاریخ، آیات و تصاویر", "تاریخ، آیتونه او انځورونه", "Histoire, versets et images", "Historia, versículos e imágenes", "Sejarah, ayat, dan gambar", "Sejarah, ayat dan gambar", "ইতিহাস, আয়াত ও ছবি", "История, аяты и изображения", "历史、经文与图片"),
  open: L14("Open", "Öffnen", "افتح", "Açın", "کھولیں", "باز کنید", "پرانیزئ", "Ouvrir", "Abrir", "Buka", "Buka", "খুলুন", "Открыть", "打开"),
};
