import { pick, useLang } from "@/i18n";

// Texts of the share buttons, the branded share cards and the daily share prompt in every app language (polite address).
const TEXT = {
  en: {
    getApp: "Get the app", settingTitle: "Daily share suggestion", settingBody: "Once a day, a gentle suggestion in the feed to share today's verse or hadith.", settingPro: "Turning it off is part of Pro.", share: "Share", verseOfDay: "Verse of the day", hadithOfDay: "Hadith of the day", nameOfAllah: "Name of Allah", dua: "Dua", hadith: "Hadith", story: "Story of the prophets",
    lessonDone: "Lesson completed", unitDone: "Unit completed", levelDone: "Level completed", testResult: "Test result", review: "Review done", milestone: "Milestone", prayerTimes: "Prayer times", calendar: "Islamic calendar", course: "Course unit completed",
    promptTitle: "Have you shared something today?", promptBody: "Would you like to share today's verse or hadith with someone? One tap is enough.", promptVerse: "Share verse", promptHadith: "Share hadith", notToday: "Not today",
    bannerLesson: "Well done. Would you like to share today's verse?", sharedToday: "Thank you for sharing. {n} shares so far.", reward: "+{n} XP",
  },
  de: {
    getApp: "App laden", settingTitle: "Tägliche Teil-Anregung", settingBody: "Einmal am Tag eine dezente Anregung im Feed, den Vers oder Hadith des Tages zu teilen.", settingPro: "Das Ausschalten ist Teil von Pro.", share: "Teilen", verseOfDay: "Vers des Tages", hadithOfDay: "Hadith des Tages", nameOfAllah: "Name Allahs", dua: "Dua", hadith: "Hadith", story: "Geschichte der Propheten",
    lessonDone: "Lektion abgeschlossen", unitDone: "Einheit abgeschlossen", levelDone: "Stufe abgeschlossen", testResult: "Testergebnis", review: "Wiederholung erledigt", milestone: "Meilenstein", prayerTimes: "Gebetszeiten", calendar: "Islamischer Kalender", course: "Kurseinheit abgeschlossen",
    promptTitle: "Haben Sie heute schon etwas geteilt?", promptBody: "Möchten Sie den Vers oder Hadith des Tages mit jemandem teilen? Ein Tippen genügt.", promptVerse: "Vers teilen", promptHadith: "Hadith teilen", notToday: "Heute nicht",
    bannerLesson: "Gut gemacht. Möchten Sie den Vers des Tages teilen?", sharedToday: "Danke fürs Teilen. Bisher {n}-mal geteilt.", reward: "+{n} XP",
  },
  ar: {
    getApp: "حمّل التطبيق", settingTitle: "اقتراح المشاركة اليومي", settingBody: "مرة في اليوم، اقتراح لطيف في الصفحة لمشاركة آية اليوم أو حديثه.", settingPro: "إيقافه متاح في Pro.", share: "مشاركة", verseOfDay: "آية اليوم", hadithOfDay: "حديث اليوم", nameOfAllah: "اسم من أسماء الله", dua: "دعاء", hadith: "حديث", story: "قصص الأنبياء",
    lessonDone: "اكتمل الدرس", unitDone: "اكتملت الوحدة", levelDone: "اكتمل المستوى", testResult: "نتيجة الاختبار", review: "اكتملت المراجعة", milestone: "إنجاز", prayerTimes: "مواقيت الصلاة", calendar: "التقويم الهجري", course: "اكتملت وحدة الدورة",
    promptTitle: "هل شاركت شيئًا اليوم؟", promptBody: "هل تود مشاركة آية اليوم أو حديث اليوم مع أحد؟ تكفي لمسة واحدة.", promptVerse: "مشاركة الآية", promptHadith: "مشاركة الحديث", notToday: "ليس اليوم",
    bannerLesson: "أحسنت. هل تود مشاركة آية اليوم؟", sharedToday: "شكرًا على المشاركة. {n} مشاركة حتى الآن.", reward: "+{n} نقطة",
  },
  tr: {
    getApp: "Uygulamayı indirin", settingTitle: "Günlük paylaşım önerisi", settingBody: "Günde bir kez akışta, günün ayetini veya hadisini paylaşmak için nazik bir öneri.", settingPro: "Kapatmak Pro'ya dahildir.", share: "Paylaş", verseOfDay: "Günün ayeti", hadithOfDay: "Günün hadisi", nameOfAllah: "Allah'ın ismi", dua: "Dua", hadith: "Hadis", story: "Peygamber kıssaları",
    lessonDone: "Ders tamamlandı", unitDone: "Ünite tamamlandı", levelDone: "Seviye tamamlandı", testResult: "Test sonucu", review: "Tekrar tamamlandı", milestone: "Dönüm noktası", prayerTimes: "Namaz vakitleri", calendar: "Hicri takvim", course: "Kurs ünitesi tamamlandı",
    promptTitle: "Bugün bir şey paylaştınız mı?", promptBody: "Günün ayetini veya hadisini biriyle paylaşmak ister misiniz? Tek dokunuş yeterli.", promptVerse: "Ayeti paylaş", promptHadith: "Hadisi paylaş", notToday: "Bugün değil",
    bannerLesson: "Tebrikler. Günün ayetini paylaşmak ister misiniz?", sharedToday: "Paylaştığınız için teşekkürler. Şimdiye kadar {n} paylaşım.", reward: "+{n} XP",
  },
  ur: {
    getApp: "ایپ حاصل کریں", settingTitle: "روزانہ شیئر کی تجویز", settingBody: "دن میں ایک بار فیڈ میں آج کی آیت یا حدیث شیئر کرنے کی نرم تجویز۔", settingPro: "اسے بند کرنا Pro میں شامل ہے۔", share: "شیئر کریں", verseOfDay: "آج کی آیت", hadithOfDay: "آج کی حدیث", nameOfAllah: "اللہ کا نام", dua: "دعا", hadith: "حدیث", story: "انبیاء کے قصے",
    lessonDone: "سبق مکمل", unitDone: "یونٹ مکمل", levelDone: "درجہ مکمل", testResult: "ٹیسٹ کا نتیجہ", review: "دہرائی مکمل", milestone: "سنگ میل", prayerTimes: "اوقات نماز", calendar: "اسلامی کیلنڈر", course: "کورس کا یونٹ مکمل",
    promptTitle: "کیا آپ نے آج کچھ شیئر کیا؟", promptBody: "کیا آپ آج کی آیت یا حدیث کسی کے ساتھ شیئر کرنا چاہیں گے؟ ایک ٹچ کافی ہے۔", promptVerse: "آیت شیئر کریں", promptHadith: "حدیث شیئر کریں", notToday: "آج نہیں",
    bannerLesson: "شاباش۔ کیا آپ آج کی آیت شیئر کرنا چاہیں گے؟", sharedToday: "شیئر کرنے کا شکریہ۔ اب تک {n} بار۔", reward: "+{n} XP",
  },
  fa: {
    getApp: "دریافت برنامه", settingTitle: "پیشنهاد روزانهٔ اشتراک", settingBody: "روزی یک بار، پیشنهادی ملایم در فید برای اشتراک آیه یا حدیث روز.", settingPro: "خاموش کردن آن بخشی از Pro است.", share: "اشتراک‌گذاری", verseOfDay: "آیهٔ روز", hadithOfDay: "حدیث روز", nameOfAllah: "نامی از نام‌های خدا", dua: "دعا", hadith: "حدیث", story: "داستان پیامبران",
    lessonDone: "درس کامل شد", unitDone: "واحد کامل شد", levelDone: "سطح کامل شد", testResult: "نتیجهٔ آزمون", review: "مرور انجام شد", milestone: "نقطهٔ عطف", prayerTimes: "اوقات نماز", calendar: "تقویم هجری", course: "واحد دوره کامل شد",
    promptTitle: "آیا امروز چیزی به اشتراک گذاشته‌اید؟", promptBody: "آیا مایلید آیه یا حدیث امروز را با کسی به اشتراک بگذارید؟ یک لمس کافی است.", promptVerse: "اشتراک آیه", promptHadith: "اشتراک حدیث", notToday: "امروز نه",
    bannerLesson: "آفرین. آیا مایلید آیهٔ امروز را به اشتراک بگذارید؟", sharedToday: "از اشتراک‌گذاری شما سپاسگزاریم. تاکنون {n} بار.", reward: "+{n} XP",
  },
  ps: {
    getApp: "اپ ترلاسه کړئ", settingTitle: "د شریکولو ورځنی وړاندیز", settingBody: "ورځ کې یو ځل، په فیډ کې د ورځې د آیت یا حدیث د شریکولو نرم وړاندیز.", settingPro: "بندول یې د Pro برخه ده.", share: "شریکول", verseOfDay: "د ورځې آیت", hadithOfDay: "د ورځې حدیث", nameOfAllah: "د الله نوم", dua: "دعا", hadith: "حدیث", story: "د انبیاوو کیسې",
    lessonDone: "لوست بشپړ شو", unitDone: "برخه بشپړه شوه", levelDone: "کچه بشپړه شوه", testResult: "د ازموینې پایله", review: "تکرار بشپړ شو", milestone: "مهمه لاسته راوړنه", prayerTimes: "د لمانځه وختونه", calendar: "اسلامي کلیزه", course: "د کورس برخه بشپړه شوه",
    promptTitle: "ایا تاسو نن څه شریک کړي؟", promptBody: "ایا غواړئ د نن ورځې آیت یا حدیث له چا سره شریک کړئ؟ یو ټک بس دی.", promptVerse: "آیت شریک کړئ", promptHadith: "حدیث شریک کړئ", notToday: "نن نه",
    bannerLesson: "ښه مو وکړل. ایا غواړئ د نن ورځې آیت شریک کړئ؟", sharedToday: "د شریکولو مننه. تر اوسه {n} ځله.", reward: "+{n} XP",
  },
  fr: {
    getApp: "Télécharger l’app", settingTitle: "Suggestion de partage quotidienne", settingBody: "Une fois par jour, une suggestion discrète dans le fil pour partager le verset ou le hadith du jour.", settingPro: "La désactivation fait partie de Pro.", share: "Partager", verseOfDay: "Verset du jour", hadithOfDay: "Hadith du jour", nameOfAllah: "Nom d'Allah", dua: "Dou'a", hadith: "Hadith", story: "Histoire des prophètes",
    lessonDone: "Leçon terminée", unitDone: "Unité terminée", levelDone: "Niveau terminé", testResult: "Résultat du test", review: "Révision terminée", milestone: "Étape franchie", prayerTimes: "Horaires de prière", calendar: "Calendrier islamique", course: "Unité du cours terminée",
    promptTitle: "Avez-vous partagé quelque chose aujourd'hui ?", promptBody: "Souhaitez-vous partager le verset ou le hadith du jour avec quelqu'un ? Un seul geste suffit.", promptVerse: "Partager le verset", promptHadith: "Partager le hadith", notToday: "Pas aujourd'hui",
    bannerLesson: "Bravo. Souhaitez-vous partager le verset du jour ?", sharedToday: "Merci pour le partage. {n} partages jusqu'ici.", reward: "+{n} XP",
  },
  es: {
    getApp: "Descargue la app", settingTitle: "Sugerencia diaria para compartir", settingBody: "Una vez al día, una sugerencia discreta en el feed para compartir la aleya o el hadiz del día.", settingPro: "Desactivarla forma parte de Pro.", share: "Compartir", verseOfDay: "Aleya del día", hadithOfDay: "Hadiz del día", nameOfAllah: "Nombre de Alá", dua: "Dua", hadith: "Hadiz", story: "Historia de los profetas",
    lessonDone: "Lección completada", unitDone: "Unidad completada", levelDone: "Nivel completado", testResult: "Resultado del test", review: "Repaso hecho", milestone: "Hito", prayerTimes: "Horarios de oración", calendar: "Calendario islámico", course: "Unidad del curso completada",
    promptTitle: "¿Ha compartido algo hoy?", promptBody: "¿Desea compartir la aleya o el hadiz del día con alguien? Basta un toque.", promptVerse: "Compartir aleya", promptHadith: "Compartir hadiz", notToday: "Hoy no",
    bannerLesson: "Muy bien. ¿Desea compartir la aleya del día?", sharedToday: "Gracias por compartir. {n} veces hasta ahora.", reward: "+{n} XP",
  },
  id: {
    getApp: "Unduh aplikasinya", settingTitle: "Saran berbagi harian", settingBody: "Sekali sehari, saran lembut di feed untuk membagikan ayat atau hadis hari ini.", settingPro: "Menonaktifkannya termasuk dalam Pro.", share: "Bagikan", verseOfDay: "Ayat hari ini", hadithOfDay: "Hadis hari ini", nameOfAllah: "Nama Allah", dua: "Doa", hadith: "Hadis", story: "Kisah para nabi",
    lessonDone: "Pelajaran selesai", unitDone: "Unit selesai", levelDone: "Level selesai", testResult: "Hasil tes", review: "Ulangan selesai", milestone: "Pencapaian", prayerTimes: "Waktu salat", calendar: "Kalender Hijriah", course: "Unit kursus selesai",
    promptTitle: "Apakah Anda sudah berbagi hari ini?", promptBody: "Apakah Anda ingin membagikan ayat atau hadis hari ini kepada seseorang? Cukup satu ketukan.", promptVerse: "Bagikan ayat", promptHadith: "Bagikan hadis", notToday: "Tidak hari ini",
    bannerLesson: "Bagus sekali. Apakah Anda ingin membagikan ayat hari ini?", sharedToday: "Terima kasih telah berbagi. Sudah {n} kali.", reward: "+{n} XP",
  },
  ms: {
    getApp: "Muat turun aplikasi", settingTitle: "Cadangan berkongsi harian", settingBody: "Sekali sehari, cadangan lembut dalam suapan untuk berkongsi ayat atau hadis hari ini.", settingPro: "Mematikannya ialah sebahagian daripada Pro.", share: "Kongsi", verseOfDay: "Ayat hari ini", hadithOfDay: "Hadis hari ini", nameOfAllah: "Nama Allah", dua: "Doa", hadith: "Hadis", story: "Kisah para nabi",
    lessonDone: "Pelajaran selesai", unitDone: "Unit selesai", levelDone: "Tahap selesai", testResult: "Keputusan ujian", review: "Ulang kaji selesai", milestone: "Pencapaian", prayerTimes: "Waktu solat", calendar: "Kalendar Hijrah", course: "Unit kursus selesai",
    promptTitle: "Adakah anda sudah berkongsi sesuatu hari ini?", promptBody: "Adakah anda ingin berkongsi ayat atau hadis hari ini dengan seseorang? Satu sentuhan sudah cukup.", promptVerse: "Kongsi ayat", promptHadith: "Kongsi hadis", notToday: "Bukan hari ini",
    bannerLesson: "Syabas. Adakah anda ingin berkongsi ayat hari ini?", sharedToday: "Terima kasih kerana berkongsi. {n} kali setakat ini.", reward: "+{n} XP",
  },
  bn: {
    getApp: "অ্যাপটি নিন", settingTitle: "দৈনিক শেয়ারের পরামর্শ", settingBody: "দিনে একবার, ফিডে আজকের আয়াত বা হাদিস শেয়ার করার একটি কোমল পরামর্শ।", settingPro: "এটি বন্ধ করা Pro-এর অংশ।", share: "শেয়ার করুন", verseOfDay: "আজকের আয়াত", hadithOfDay: "আজকের হাদিস", nameOfAllah: "আল্লাহর নাম", dua: "দোয়া", hadith: "হাদিস", story: "নবীদের কাহিনি",
    lessonDone: "পাঠ সম্পন্ন", unitDone: "ইউনিট সম্পন্ন", levelDone: "স্তর সম্পন্ন", testResult: "পরীক্ষার ফল", review: "পুনরাবৃত্তি সম্পন্ন", milestone: "মাইলফলক", prayerTimes: "নামাজের সময়", calendar: "হিজরি ক্যালেন্ডার", course: "কোর্সের ইউনিট সম্পন্ন",
    promptTitle: "আপনি কি আজ কিছু শেয়ার করেছেন?", promptBody: "আপনি কি আজকের আয়াত বা হাদিস কারও সাথে শেয়ার করতে চান? একটি ট্যাপই যথেষ্ট।", promptVerse: "আয়াত শেয়ার করুন", promptHadith: "হাদিস শেয়ার করুন", notToday: "আজ নয়",
    bannerLesson: "চমৎকার। আপনি কি আজকের আয়াত শেয়ার করতে চান?", sharedToday: "শেয়ার করার জন্য ধন্যবাদ। এ পর্যন্ত {n} বার।", reward: "+{n} XP",
  },
  ru: {
    getApp: "Скачать приложение", settingTitle: "Ежедневное предложение поделиться", settingBody: "Раз в день ненавязчивое предложение в ленте поделиться аятом или хадисом дня.", settingPro: "Отключение доступно в Pro.", share: "Поделиться", verseOfDay: "Аят дня", hadithOfDay: "Хадис дня", nameOfAllah: "Имя Аллаха", dua: "Дуа", hadith: "Хадис", story: "Истории пророков",
    lessonDone: "Урок пройден", unitDone: "Раздел пройден", levelDone: "Уровень пройден", testResult: "Результат теста", review: "Повторение завершено", milestone: "Веха", prayerTimes: "Время намаза", calendar: "Исламский календарь", course: "Раздел курса пройден",
    promptTitle: "Вы уже чем-нибудь поделились сегодня?", promptBody: "Хотите поделиться аятом или хадисом дня? Достаточно одного касания.", promptVerse: "Поделиться аятом", promptHadith: "Поделиться хадисом", notToday: "Не сегодня",
    bannerLesson: "Отлично. Хотите поделиться аятом дня?", sharedToday: "Спасибо, что делитесь. Уже {n} раз.", reward: "+{n} XP",
  },
  zh: {
    getApp: "下载应用", settingTitle: "每日分享建议", settingBody: "每天一次，在动态中温和地建议您分享今日经文或圣训。", settingPro: "关闭此功能属于 Pro。", share: "分享", verseOfDay: "每日经文", hadithOfDay: "每日圣训", nameOfAllah: "真主的尊名", dua: "祈祷词", hadith: "圣训", story: "先知故事",
    lessonDone: "课程已完成", unitDone: "单元已完成", levelDone: "级别已完成", testResult: "测试结果", review: "复习完成", milestone: "里程碑", prayerTimes: "礼拜时间", calendar: "伊斯兰历", course: "课程单元已完成",
    promptTitle: "您今天分享过了吗？", promptBody: "您想与他人分享今天的经文或圣训吗？轻点一下即可。", promptVerse: "分享经文", promptHadith: "分享圣训", notToday: "今天不了",
    bannerLesson: "做得好。您想分享今天的经文吗？", sharedToday: "感谢您的分享。目前共 {n} 次。", reward: "+{n} XP",
  },
};
export type ShareText = typeof TEXT.en;
export function useShareText(): ShareText {
  const { lang } = useLang();
  return pick<ShareText>(TEXT, lang);
}
