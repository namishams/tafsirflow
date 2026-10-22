import { useCallback } from "react";
import { useLang } from "@/i18n";
import { moduleText } from "@/i18n/app";

// Texts of the start greeting, the success moments (tree celebration and share card), sending to the in-app chat
// and the reader's night mode and word sheet. All 14 app languages are kept here, German in the Sie-form.
const de = {
  salam: "As-salamu alaikum", salamName: "As-salamu alaikum, {name}",
  planTitle: "Ihr Plan für heute", nextVerse: "Nächster Vers", reviews: "Wiederholungen", reviewsDue: "{n} fällig", reviewsNone: "Alles wiederholt",
  streak: "Tage in Folge", learnNow: "Jetzt lernen", skip: "Begrüßung schließen", skipHint: "Tippen Sie irgendwo, um fortzufahren.",
  kicker: "Ein gesegneter Moment",
  surahTitle: "Sure {name} abgeschlossen", surahBody: "Möge Allah das Gelernte in Ihrem Herzen bewahren.",
  levelTitle: "Stufe {n} erreicht", levelBody: "Schritt für Schritt wächst Ihr Wissen. Möge Allah es segnen.",
  juzTitle: "Juz {n} Ihrer Khatm gelesen", juzBody: "Ein weiterer Teil ist vollendet. Möge Allah es annehmen.",
  khatmTitle: "Khatm vollendet", khatmBody: "Sie haben den ganzen Quran gelesen. Möge Allah es von Ihnen annehmen.",
  streakTitle: "{n} Tage in Folge", streakBody: "Die liebsten Taten bei Allah sind die beständigen, auch wenn sie klein sind.",
  share: "Teilen", sendChat: "Im Chat senden", continue: "Weiter", cardLead: "erreicht mit",
  chatTitle: "An wen senden?", chatEmpty: "Noch keine Unterhaltungen. Beginnen Sie eine im Messenger.", chatSignIn: "Melden Sie sich an, um im Chat zu teilen.",
  signIn: "Anmelden", chatSent: "Gesendet", chatFailed: "Senden hat nicht geklappt. Bitte versuchen Sie es erneut.", close: "Schließen", sending: "Wird gesendet …",
  night: "Nachtmodus", nightHint: "Tiefes Smaragdschwarz mit warmem Gold, angenehm für die Augen.", sizeLabel: "Schriftgröße {n} %",
  meaning: "Bedeutung", translit: "Umschrift", root: "Wurzel", rootCount: "{n}-mal im Quran", noRoot: "Partikel ohne Wurzel", exploreRoot: "Wurzel erkunden", playWord: "Wort anhören",
};
type Dict = typeof de;

const en: Dict = {
  salam: "As-salamu alaikum", salamName: "As-salamu alaikum, {name}",
  planTitle: "Your plan for today", nextVerse: "Next verse", reviews: "Reviews", reviewsDue: "{n} due", reviewsNone: "All reviewed",
  streak: "Days in a row", learnNow: "Learn now", skip: "Close greeting", skipHint: "Tap anywhere to continue.",
  kicker: "A blessed moment",
  surahTitle: "Surah {name} completed", surahBody: "May Allah preserve what you have learned in your heart.",
  levelTitle: "Level {n} reached", levelBody: "Step by step your knowledge grows. May Allah bless it.",
  juzTitle: "Juz {n} of your Khatm read", juzBody: "Another part is complete. May Allah accept it.",
  khatmTitle: "Khatm completed", khatmBody: "You have read the whole Quran. May Allah accept it from you.",
  streakTitle: "{n} days in a row", streakBody: "The deeds most beloved to Allah are the most constant, even if they are small.",
  share: "Share", sendChat: "Send in chat", continue: "Continue", cardLead: "reached with",
  chatTitle: "Send to whom?", chatEmpty: "No conversations yet. Start one in the messenger.", chatSignIn: "Please sign in to share in the chat.",
  signIn: "Sign in", chatSent: "Sent", chatFailed: "Sending did not work. Please try again.", close: "Close", sending: "Sending …",
  night: "Night mode", nightHint: "Deep emerald black with warm gold, gentle on the eyes.", sizeLabel: "Font size {n} %",
  meaning: "Meaning", translit: "Transliteration", root: "Root", rootCount: "{n} times in the Quran", noRoot: "Particle without a root", exploreRoot: "Explore the root", playWord: "Listen to the word",
};

const ar: Dict = {
  salam: "السلام عليكم", salamName: "السلام عليكم، {name}",
  planTitle: "خطتك لهذا اليوم", nextVerse: "الآية التالية", reviews: "المراجعات", reviewsDue: "{n} مستحقة", reviewsNone: "تمت المراجعة كلها",
  streak: "أيام متتالية", learnNow: "ابدأ التعلم الآن", skip: "إغلاق الترحيب", skipHint: "اضغط في أي مكان للمتابعة.",
  kicker: "لحظة مباركة",
  surahTitle: "أتممت سورة {name}", surahBody: "حفظ الله ما تعلمته في قلبك.",
  levelTitle: "بلغت المستوى {n}", levelBody: "خطوة بعد خطوة يزداد علمك. بارك الله فيه.",
  juzTitle: "قرأت الجزء {n} من ختمتك", juzBody: "اكتمل جزء آخر. تقبل الله منك.",
  khatmTitle: "تمت الختمة", khatmBody: "قرأت القرآن كله. تقبل الله منك.",
  streakTitle: "{n} أيام متتالية", streakBody: "أحب الأعمال إلى الله أدومها وإن قل.",
  share: "مشاركة", sendChat: "إرسال في المحادثة", continue: "متابعة", cardLead: "بلغها مع",
  chatTitle: "إلى من ترسل؟", chatEmpty: "لا توجد محادثات بعد. ابدأ محادثة في الرسائل.", chatSignIn: "يرجى تسجيل الدخول للمشاركة في المحادثة.",
  signIn: "تسجيل الدخول", chatSent: "تم الإرسال", chatFailed: "تعذر الإرسال. يرجى المحاولة مرة أخرى.", close: "إغلاق", sending: "جارٍ الإرسال …",
  night: "الوضع الليلي", nightHint: "أسود زمردي عميق مع ذهب دافئ، مريح للعينين.", sizeLabel: "حجم الخط {n} %",
  meaning: "المعنى", translit: "النطق بالحروف اللاتينية", root: "الجذر", rootCount: "{n} مرة في القرآن", noRoot: "حرف بلا جذر", exploreRoot: "استكشف الجذر", playWord: "استمع إلى الكلمة",
};

const tr: Dict = {
  salam: "Esselamu aleyküm", salamName: "Esselamu aleyküm, {name}",
  planTitle: "Bugünkü planınız", nextVerse: "Sıradaki ayet", reviews: "Tekrarlar", reviewsDue: "{n} bekliyor", reviewsNone: "Hepsi tekrarlandı",
  streak: "Gün üst üste", learnNow: "Şimdi öğrenin", skip: "Karşılamayı kapat", skipHint: "Devam etmek için herhangi bir yere dokunun.",
  kicker: "Bereketli bir an",
  surahTitle: "{name} suresi tamamlandı", surahBody: "Allah öğrendiklerinizi kalbinizde muhafaza etsin.",
  levelTitle: "Seviye {n} ulaşıldı", levelBody: "Adım adım ilminiz artıyor. Allah bereketli kılsın.",
  juzTitle: "Hatminizin {n}. cüzü okundu", juzBody: "Bir bölüm daha tamamlandı. Allah kabul etsin.",
  khatmTitle: "Hatim tamamlandı", khatmBody: "Kur'an'ın tamamını okudunuz. Allah sizden kabul etsin.",
  streakTitle: "{n} gün üst üste", streakBody: "Allah'a en sevimli amel, az da olsa devamlı olanıdır.",
  share: "Paylaş", sendChat: "Sohbette gönder", continue: "Devam", cardLead: "ile ulaşıldı",
  chatTitle: "Kime gönderilsin?", chatEmpty: "Henüz sohbet yok. Mesajlarda bir sohbet başlatın.", chatSignIn: "Sohbette paylaşmak için lütfen giriş yapın.",
  signIn: "Giriş yap", chatSent: "Gönderildi", chatFailed: "Gönderilemedi. Lütfen tekrar deneyin.", close: "Kapat", sending: "Gönderiliyor …",
  night: "Gece modu", nightHint: "Derin zümrüt siyahı ve sıcak altın, gözleri yormaz.", sizeLabel: "Yazı boyutu %{n}",
  meaning: "Anlam", translit: "Okunuş", root: "Kök", rootCount: "Kur'an'da {n} kez", noRoot: "Kökü olmayan edat", exploreRoot: "Kökü keşfedin", playWord: "Kelimeyi dinleyin",
};

const ur: Dict = {
  salam: "السلام علیکم", salamName: "السلام علیکم، {name}",
  planTitle: "آج کے لیے آپ کا منصوبہ", nextVerse: "اگلی آیت", reviews: "دہرائی", reviewsDue: "{n} باقی", reviewsNone: "سب دہرا لیا گیا",
  streak: "مسلسل دن", learnNow: "ابھی سیکھیں", skip: "استقبال بند کریں", skipHint: "جاری رکھنے کے لیے کہیں بھی تھپتھپائیں۔",
  kicker: "ایک بابرکت لمحہ",
  surahTitle: "سورہ {name} مکمل ہوئی", surahBody: "اللہ آپ کے سیکھے ہوئے کو آپ کے دل میں محفوظ رکھے۔",
  levelTitle: "درجہ {n} حاصل ہوا", levelBody: "قدم بہ قدم آپ کا علم بڑھ رہا ہے۔ اللہ اس میں برکت دے۔",
  juzTitle: "آپ کے ختم کا پارہ {n} پڑھا گیا", juzBody: "ایک اور حصہ مکمل ہوا۔ اللہ قبول فرمائے۔",
  khatmTitle: "ختم مکمل ہوا", khatmBody: "آپ نے پورا قرآن پڑھ لیا۔ اللہ آپ سے قبول فرمائے۔",
  streakTitle: "{n} دن مسلسل", streakBody: "اللہ کو سب سے محبوب عمل وہ ہے جو ہمیشہ کیا جائے، چاہے تھوڑا ہو۔",
  share: "شیئر کریں", sendChat: "چیٹ میں بھیجیں", continue: "جاری رکھیں", cardLead: "کے ساتھ حاصل کیا",
  chatTitle: "کسے بھیجیں؟", chatEmpty: "ابھی کوئی گفتگو نہیں۔ پیغامات میں ایک شروع کریں۔", chatSignIn: "چیٹ میں شیئر کرنے کے لیے براہ کرم سائن ان کریں۔",
  signIn: "سائن ان", chatSent: "بھیج دیا گیا", chatFailed: "بھیجا نہیں جا سکا۔ براہ کرم دوبارہ کوشش کریں۔", close: "بند کریں", sending: "بھیجا جا رہا ہے …",
  night: "رات کا موڈ", nightHint: "گہرا زمردی سیاہ اور گرم سنہرا، آنکھوں کے لیے آرام دہ۔", sizeLabel: "فونٹ کا سائز {n} %",
  meaning: "معنی", translit: "تلفظ", root: "مادہ", rootCount: "قرآن میں {n} بار", noRoot: "بغیر مادے کا حرف", exploreRoot: "مادہ دیکھیں", playWord: "لفظ سنیں",
};

const fa: Dict = {
  salam: "السلام علیکم", salamName: "السلام علیکم، {name}",
  planTitle: "برنامهٔ امروز شما", nextVerse: "آیهٔ بعدی", reviews: "مرورها", reviewsDue: "{n} مانده", reviewsNone: "همه مرور شد",
  streak: "روز پیاپی", learnNow: "اکنون بیاموزید", skip: "بستن خوشامد", skipHint: "برای ادامه هر جایی را لمس کنید.",
  kicker: "لحظه‌ای پربرکت",
  surahTitle: "سورهٔ {name} کامل شد", surahBody: "خداوند آموخته‌های شما را در دلتان نگه دارد.",
  levelTitle: "به سطح {n} رسیدید", levelBody: "گام به گام دانش شما می‌افزاید. خداوند برکت دهد.",
  juzTitle: "جزء {n} از ختم شما خوانده شد", juzBody: "بخش دیگری کامل شد. خداوند بپذیرد.",
  khatmTitle: "ختم کامل شد", khatmBody: "شما همهٔ قرآن را خواندید. خداوند از شما بپذیرد.",
  streakTitle: "{n} روز پیاپی", streakBody: "محبوب‌ترین کارها نزد خدا پیوسته‌ترین آن‌هاست، هرچند اندک.",
  share: "اشتراک‌گذاری", sendChat: "ارسال در گفتگو", continue: "ادامه", cardLead: "به دست آمده با",
  chatTitle: "برای چه کسی بفرستید؟", chatEmpty: "هنوز گفتگویی نیست. در پیام‌ها یکی آغاز کنید.", chatSignIn: "لطفاً برای اشتراک در گفتگو وارد شوید.",
  signIn: "ورود", chatSent: "فرستاده شد", chatFailed: "ارسال انجام نشد. لطفاً دوباره تلاش کنید.", close: "بستن", sending: "در حال ارسال …",
  night: "حالت شب", nightHint: "سیاه زمردی عمیق با طلایی گرم، آرام برای چشم.", sizeLabel: "اندازهٔ قلم {n} %",
  meaning: "معنا", translit: "آوانگاری", root: "ریشه", rootCount: "{n} بار در قرآن", noRoot: "حرف بدون ریشه", exploreRoot: "کاوش ریشه", playWord: "شنیدن واژه",
};

const ps: Dict = {
  salam: "السلام علیکم", salamName: "السلام علیکم، {name}",
  planTitle: "د نن ورځې ستاسو پلان", nextVerse: "بل آیت", reviews: "تکرارونه", reviewsDue: "{n} پاتې", reviewsNone: "ټول تکرار شول",
  streak: "پرله پسې ورځې", learnNow: "اوس زده کړئ", skip: "هرکلی وتړئ", skipHint: "د دوام لپاره هر ځای ټک وکړئ.",
  kicker: "یوه برکتناکه شیبه",
  surahTitle: "د {name} سورت بشپړ شو", surahBody: "الله دې ستاسو زده کړې ستاسو په زړه کې وساتي.",
  levelTitle: "{n} کچې ته ورسېدئ", levelBody: "ګام په ګام ستاسو پوهه زیاتیږي. الله دې برکت ورکړي.",
  juzTitle: "ستاسو د ختم {n} پاره ولوستل شوه", juzBody: "بله برخه بشپړه شوه. الله دې ومني.",
  khatmTitle: "ختم بشپړ شو", khatmBody: "تاسو ټول قرآن ولوست. الله دې له تاسو ومني.",
  streakTitle: "{n} ورځې پرله پسې", streakBody: "الله ته تر ټولو خوښ عمل هغه دی چې دوام ولري، که څه هم لږ وي.",
  share: "شریکول", sendChat: "په چټ کې لیږل", continue: "دوام", cardLead: "سره ترلاسه شو",
  chatTitle: "چا ته یې ولیږئ؟", chatEmpty: "تر اوسه خبرې اترې نشته. په پیغامونو کې یوه پیل کړئ.", chatSignIn: "په چټ کې د شریکولو لپاره مهرباني وکړئ ننوځئ.",
  signIn: "ننوتل", chatSent: "ولیږل شو", chatFailed: "لیږل ونه شول. مهرباني وکړئ بیا هڅه وکړئ.", close: "تړل", sending: "لیږل کیږي …",
  night: "د شپې حالت", nightHint: "ژور زمردي تور له تود زرین سره، سترګو ته آرام.", sizeLabel: "د لیک کچه {n} %",
  meaning: "مانا", translit: "تلفظ", root: "ریښه", rootCount: "په قرآن کې {n} ځله", noRoot: "بې ریښې توری", exploreRoot: "ریښه وپلټئ", playWord: "کلمه واورئ",
};

const fr: Dict = {
  salam: "As-salamu alaykum", salamName: "As-salamu alaykum, {name}",
  planTitle: "Votre plan du jour", nextVerse: "Verset suivant", reviews: "Révisions", reviewsDue: "{n} à faire", reviewsNone: "Tout est révisé",
  streak: "Jours d'affilée", learnNow: "Apprendre maintenant", skip: "Fermer l'accueil", skipHint: "Touchez n'importe où pour continuer.",
  kicker: "Un moment béni",
  surahTitle: "Sourate {name} terminée", surahBody: "Qu'Allah préserve ce que vous avez appris dans votre cœur.",
  levelTitle: "Niveau {n} atteint", levelBody: "Pas à pas, votre savoir grandit. Qu'Allah le bénisse.",
  juzTitle: "Juz {n} de votre Khatm lu", juzBody: "Une autre partie est achevée. Qu'Allah l'accepte.",
  khatmTitle: "Khatm achevée", khatmBody: "Vous avez lu le Coran en entier. Qu'Allah l'accepte de vous.",
  streakTitle: "{n} jours d'affilée", streakBody: "Les œuvres les plus aimées d'Allah sont les plus constantes, même si elles sont modestes.",
  share: "Partager", sendChat: "Envoyer dans le chat", continue: "Continuer", cardLead: "atteint avec",
  chatTitle: "À qui envoyer ?", chatEmpty: "Pas encore de conversation. Commencez-en une dans la messagerie.", chatSignIn: "Veuillez vous connecter pour partager dans le chat.",
  signIn: "Se connecter", chatSent: "Envoyé", chatFailed: "L'envoi a échoué. Veuillez réessayer.", close: "Fermer", sending: "Envoi …",
  night: "Mode nuit", nightHint: "Noir émeraude profond et or chaleureux, doux pour les yeux.", sizeLabel: "Taille du texte {n} %",
  meaning: "Sens", translit: "Translittération", root: "Racine", rootCount: "{n} fois dans le Coran", noRoot: "Particule sans racine", exploreRoot: "Explorer la racine", playWord: "Écouter le mot",
};

const es: Dict = {
  salam: "As-salamu alaikum", salamName: "As-salamu alaikum, {name}",
  planTitle: "Su plan para hoy", nextVerse: "Siguiente aleya", reviews: "Repasos", reviewsDue: "{n} pendientes", reviewsNone: "Todo repasado",
  streak: "Días seguidos", learnNow: "Aprender ahora", skip: "Cerrar el saludo", skipHint: "Toque en cualquier lugar para continuar.",
  kicker: "Un momento bendito",
  surahTitle: "Sura {name} completada", surahBody: "Que Allah guarde en su corazón lo que ha aprendido.",
  levelTitle: "Nivel {n} alcanzado", levelBody: "Paso a paso crece su conocimiento. Que Allah lo bendiga.",
  juzTitle: "Yuz {n} de su Jatm leído", juzBody: "Otra parte está completa. Que Allah la acepte.",
  khatmTitle: "Jatm completado", khatmBody: "Ha leído el Corán entero. Que Allah se lo acepte.",
  streakTitle: "{n} días seguidos", streakBody: "Las obras más amadas por Allah son las más constantes, aunque sean pequeñas.",
  share: "Compartir", sendChat: "Enviar en el chat", continue: "Continuar", cardLead: "logrado con",
  chatTitle: "¿A quién enviarlo?", chatEmpty: "Aún no hay conversaciones. Inicie una en la mensajería.", chatSignIn: "Inicie sesión para compartir en el chat.",
  signIn: "Iniciar sesión", chatSent: "Enviado", chatFailed: "No se pudo enviar. Inténtelo de nuevo.", close: "Cerrar", sending: "Enviando …",
  night: "Modo noche", nightHint: "Negro esmeralda profundo con oro cálido, suave para la vista.", sizeLabel: "Tamaño de letra {n} %",
  meaning: "Significado", translit: "Transliteración", root: "Raíz", rootCount: "{n} veces en el Corán", noRoot: "Partícula sin raíz", exploreRoot: "Explorar la raíz", playWord: "Escuchar la palabra",
};

const id: Dict = {
  salam: "Assalamu'alaikum", salamName: "Assalamu'alaikum, {name}",
  planTitle: "Rencana Anda hari ini", nextVerse: "Ayat berikutnya", reviews: "Ulangan", reviewsDue: "{n} menunggu", reviewsNone: "Semua sudah diulang",
  streak: "Hari berturut-turut", learnNow: "Belajar sekarang", skip: "Tutup sambutan", skipHint: "Ketuk di mana saja untuk melanjutkan.",
  kicker: "Momen yang penuh berkah",
  surahTitle: "Surah {name} selesai", surahBody: "Semoga Allah menjaga apa yang Anda pelajari di dalam hati Anda.",
  levelTitle: "Level {n} tercapai", levelBody: "Selangkah demi selangkah ilmu Anda bertambah. Semoga Allah memberkahinya.",
  juzTitle: "Juz {n} khatam Anda telah dibaca", juzBody: "Satu bagian lagi selesai. Semoga Allah menerimanya.",
  khatmTitle: "Khatam selesai", khatmBody: "Anda telah membaca seluruh Al-Qur'an. Semoga Allah menerimanya dari Anda.",
  streakTitle: "{n} hari berturut-turut", streakBody: "Amalan yang paling dicintai Allah adalah yang paling konsisten, meskipun sedikit.",
  share: "Bagikan", sendChat: "Kirim di obrolan", continue: "Lanjut", cardLead: "dicapai bersama",
  chatTitle: "Kirim kepada siapa?", chatEmpty: "Belum ada percakapan. Mulailah di pesan.", chatSignIn: "Silakan masuk untuk berbagi di obrolan.",
  signIn: "Masuk", chatSent: "Terkirim", chatFailed: "Gagal mengirim. Silakan coba lagi.", close: "Tutup", sending: "Mengirim …",
  night: "Mode malam", nightHint: "Hitam zamrud yang dalam dengan emas hangat, nyaman di mata.", sizeLabel: "Ukuran huruf {n} %",
  meaning: "Makna", translit: "Transliterasi", root: "Akar kata", rootCount: "{n} kali dalam Al-Qur'an", noRoot: "Partikel tanpa akar", exploreRoot: "Jelajahi akar kata", playWord: "Dengarkan kata",
};

const ms: Dict = {
  salam: "Assalamualaikum", salamName: "Assalamualaikum, {name}",
  planTitle: "Rancangan anda hari ini", nextVerse: "Ayat seterusnya", reviews: "Ulang kaji", reviewsDue: "{n} menunggu", reviewsNone: "Semua sudah diulang kaji",
  streak: "Hari berturut-turut", learnNow: "Belajar sekarang", skip: "Tutup sambutan", skipHint: "Ketik di mana-mana untuk teruskan.",
  kicker: "Saat yang diberkati",
  surahTitle: "Surah {name} selesai", surahBody: "Semoga Allah memelihara apa yang anda pelajari di dalam hati anda.",
  levelTitle: "Tahap {n} dicapai", levelBody: "Langkah demi langkah ilmu anda bertambah. Semoga Allah memberkatinya.",
  juzTitle: "Juz {n} khatam anda telah dibaca", juzBody: "Satu bahagian lagi selesai. Semoga Allah menerimanya.",
  khatmTitle: "Khatam selesai", khatmBody: "Anda telah membaca seluruh al-Quran. Semoga Allah menerimanya daripada anda.",
  streakTitle: "{n} hari berturut-turut", streakBody: "Amalan yang paling disukai Allah ialah yang berterusan, walaupun sedikit.",
  share: "Kongsi", sendChat: "Hantar dalam sembang", continue: "Teruskan", cardLead: "dicapai bersama",
  chatTitle: "Hantar kepada siapa?", chatEmpty: "Belum ada perbualan. Mulakan satu dalam mesej.", chatSignIn: "Sila log masuk untuk berkongsi dalam sembang.",
  signIn: "Log masuk", chatSent: "Dihantar", chatFailed: "Gagal menghantar. Sila cuba lagi.", close: "Tutup", sending: "Menghantar …",
  night: "Mod malam", nightHint: "Hitam zamrud yang dalam dengan emas hangat, selesa untuk mata.", sizeLabel: "Saiz huruf {n} %",
  meaning: "Makna", translit: "Transliterasi", root: "Kata akar", rootCount: "{n} kali dalam al-Quran", noRoot: "Partikel tanpa kata akar", exploreRoot: "Teroka kata akar", playWord: "Dengar perkataan",
};

const bn: Dict = {
  salam: "আসসালামু আলাইকুম", salamName: "আসসালামু আলাইকুম, {name}",
  planTitle: "আজকের জন্য আপনার পরিকল্পনা", nextVerse: "পরবর্তী আয়াত", reviews: "পুনরাবৃত্তি", reviewsDue: "{n}টি বাকি", reviewsNone: "সব পুনরাবৃত্তি হয়েছে",
  streak: "টানা দিন", learnNow: "এখনই শিখুন", skip: "অভ্যর্থনা বন্ধ করুন", skipHint: "চালিয়ে যেতে যেকোনো জায়গায় ট্যাপ করুন।",
  kicker: "একটি বরকতময় মুহূর্ত",
  surahTitle: "সূরা {name} সম্পূর্ণ হয়েছে", surahBody: "আল্লাহ আপনার শেখা বিষয় আপনার হৃদয়ে সংরক্ষণ করুন।",
  levelTitle: "স্তর {n} অর্জিত", levelBody: "ধাপে ধাপে আপনার জ্ঞান বাড়ছে। আল্লাহ তাতে বরকত দিন।",
  juzTitle: "আপনার খতমের পারা {n} পড়া হয়েছে", juzBody: "আরেকটি অংশ সম্পূর্ণ হয়েছে। আল্লাহ কবুল করুন।",
  khatmTitle: "খতম সম্পূর্ণ", khatmBody: "আপনি পুরো কুরআন পড়েছেন। আল্লাহ আপনার কাছ থেকে কবুল করুন।",
  streakTitle: "টানা {n} দিন", streakBody: "আল্লাহর কাছে সবচেয়ে প্রিয় আমল তা-ই যা নিয়মিত করা হয়, যদিও তা অল্প হয়।",
  share: "শেয়ার করুন", sendChat: "চ্যাটে পাঠান", continue: "চালিয়ে যান", cardLead: "অর্জন করেছেন",
  chatTitle: "কাকে পাঠাবেন?", chatEmpty: "এখনও কোনো কথোপকথন নেই। বার্তায় একটি শুরু করুন।", chatSignIn: "চ্যাটে শেয়ার করতে অনুগ্রহ করে সাইন ইন করুন।",
  signIn: "সাইন ইন", chatSent: "পাঠানো হয়েছে", chatFailed: "পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।", close: "বন্ধ করুন", sending: "পাঠানো হচ্ছে …",
  night: "রাতের মোড", nightHint: "গভীর পান্না কালো ও উষ্ণ সোনালি, চোখের জন্য আরামদায়ক।", sizeLabel: "ফন্টের আকার {n} %",
  meaning: "অর্থ", translit: "উচ্চারণ", root: "মূল ধাতু", rootCount: "কুরআনে {n} বার", noRoot: "মূলহীন অব্যয়", exploreRoot: "মূল ধাতু দেখুন", playWord: "শব্দটি শুনুন",
};

const ru: Dict = {
  salam: "Ас-саляму алейкум", salamName: "Ас-саляму алейкум, {name}",
  planTitle: "Ваш план на сегодня", nextVerse: "Следующий аят", reviews: "Повторения", reviewsDue: "{n} ждут", reviewsNone: "Всё повторено",
  streak: "Дней подряд", learnNow: "Учиться сейчас", skip: "Закрыть приветствие", skipHint: "Коснитесь в любом месте, чтобы продолжить.",
  kicker: "Благословенный момент",
  surahTitle: "Сура {name} завершена", surahBody: "Пусть Аллах сохранит выученное в Вашем сердце.",
  levelTitle: "Достигнут уровень {n}", levelBody: "Шаг за шагом растут Ваши знания. Пусть Аллах благословит их.",
  juzTitle: "Джуз {n} Вашего хатма прочитан", juzBody: "Ещё одна часть завершена. Пусть Аллах примет её.",
  khatmTitle: "Хатм завершён", khatmBody: "Вы прочитали весь Коран. Пусть Аллах примет это от Вас.",
  streakTitle: "{n} дней подряд", streakBody: "Самые любимые Аллахом дела – самые постоянные, даже если они невелики.",
  share: "Поделиться", sendChat: "Отправить в чат", continue: "Дальше", cardLead: "достигнуто с",
  chatTitle: "Кому отправить?", chatEmpty: "Пока нет бесед. Начните беседу в сообщениях.", chatSignIn: "Пожалуйста, войдите, чтобы делиться в чате.",
  signIn: "Войти", chatSent: "Отправлено", chatFailed: "Не удалось отправить. Пожалуйста, попробуйте ещё раз.", close: "Закрыть", sending: "Отправка …",
  night: "Ночной режим", nightHint: "Глубокий изумрудно-чёрный и тёплое золото, бережно для глаз.", sizeLabel: "Размер шрифта {n} %",
  meaning: "Значение", translit: "Транслитерация", root: "Корень", rootCount: "{n} раз в Коране", noRoot: "Частица без корня", exploreRoot: "Изучить корень", playWord: "Прослушать слово",
};

const zh: Dict = {
  salam: "愿主赐您平安", salamName: "愿主赐您平安，{name}",
  planTitle: "您今天的计划", nextVerse: "下一节经文", reviews: "复习", reviewsDue: "{n} 项待复习", reviewsNone: "已全部复习",
  streak: "连续天数", learnNow: "现在学习", skip: "关闭问候", skipHint: "点按任意位置继续。",
  kicker: "蒙福的时刻",
  surahTitle: "已完成 {name} 章", surahBody: "愿真主将您所学保存在您心中。",
  levelTitle: "已达到第 {n} 级", levelBody: "您的知识一步步增长。愿真主赐福。",
  juzTitle: "已读完您通读计划的第 {n} 卷", juzBody: "又完成了一部分。愿真主接受。",
  khatmTitle: "通读完成", khatmBody: "您已读完整部古兰经。愿真主接受您的功修。",
  streakTitle: "连续 {n} 天", streakBody: "真主最喜爱的善功是持之以恒的，即使很少。",
  share: "分享", sendChat: "在聊天中发送", continue: "继续", cardLead: "达成于",
  chatTitle: "发送给谁？", chatEmpty: "还没有对话。请在消息中开始一个对话。", chatSignIn: "请登录后在聊天中分享。",
  signIn: "登录", chatSent: "已发送", chatFailed: "发送失败。请重试。", close: "关闭", sending: "正在发送 …",
  night: "夜间模式", nightHint: "深翡翠黑配暖金色，护眼舒适。", sizeLabel: "字号 {n}%",
  meaning: "含义", translit: "音译", root: "词根", rootCount: "在古兰经中出现 {n} 次", noRoot: "无词根的虚词", exploreRoot: "探索词根", playWord: "收听该词",
};

const T = { de, en, ar, tr, ur, fa, ps, fr, es, id, ms, bn, ru, zh };
export type MomentKey = keyof Dict;

export function useMomentT() {
  const { lang } = useLang();
  return useCallback((k: MomentKey, p?: Record<string, string | number>) => {
    const s = moduleText("moments", T, lang)[k] ?? en[k];
    return p ? s.replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : s;
  }, [lang]);
}
