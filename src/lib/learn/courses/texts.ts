// mirrors mobile/src/features/courses/texts.ts (copied for the website; keep both in step)
import { useCallback } from "react";
import { useLang } from "@/lib/learn/i18n";
import { moduleText } from "@/lib/learn/i18n";

// Interface texts of the academy courses, Tajweed practice, Shams program and vocabulary decks in all 14 app
// languages (module "courses2"; a language file in src/i18n/app/<lang>.json may override single keys).
// German in the polite form of address.
const en = {
  coursesKicker: "Academy courses", coursesTitle: "Courses", coursesLead: "Seerah, the prophets, tafsir and hadith sciences, aqidah, fiqh, ethics, duas, the names of Allah, Ramadan and Hajj: structured lessons with quizzes.",
  coursesCard: "Eleven structured courses with lessons, quizzes and stickers",
  lesson: "Lesson", lessons: "{n} lessons", free: "Free", done: "Done", progress: "{d} of {n} lessons", start: "Start", continue: "Continue",
  verses: "In the Quran", hadith: "Hadith references", note: "Please note", openReader: "Open in the reader",
  startQuiz: "Start the quiz", question: "Question {n} of {m}", right: "Correct", wrong: "Not quite", next: "Continue",
  result: "{n} of {m} correct", passed: "Lesson complete", almost: "Almost there", needPass: "From {p} % the lesson counts as complete.",
  xp: "+{n} XP", growth: "+{n} growth for your tree", retry: "Try again", nextLesson: "Next lesson", overview: "Back to the course",
  unlock: "Unlock with Pro", lockedLead: "The first lessons are free. All further lessons are part of Pro.", notFound: "Lesson not found.",
  sticker: "Course sticker earned", stickerLead: "You have completed the whole course.", stickers: "Course stickers",
  tagsTitle: "Perspectives", tag_consensus: "Consensus", tag_majority: "Majority view", tag_varies: "Views differ", tag_hanafi: "Hanafi", tag_maliki: "Maliki", tag_shafii: "Shafi'i", tag_hanbali: "Hanbali", tag_jafari: "Ja'fari", tag_ashari: "Ash'ari", tag_maturidi: "Maturidi", tag_athari: "Athari",
  nameMeaning: "Meaning", nameInQuran: "Where it appears in the Quran", nameSunnah: "This name is known from the Sunnah and the scholars' lists; it does not appear in this exact form as a name in the Quran.", nameQ: "What does this name mean?", namesLoading: "Loading the names …",
  tjPractice: "Tajweed practice", tjPracticeLead: "Rules in real verses: find the rule, quizzes per surah and a deeper course.", tjFind: "Find the rule", tjFindLead: "A verse, a word: which rule applies there?", tjSurah: "Quiz per surah", tjSurahLead: "Rule questions from one surah.", tjDeep: "Tajweed in depth", tjWhich: "Which rule applies at “{w}”?", tjRound: "Round {n} of {m}", tjAgain: "Play again", tjScore: "{n} of {m} rules found", tjPick: "Choose a surah", tjItems: "{n} questions", tjHint: "Hint",
  shProgram: "30-day program", shProgramLead: "A guided month with the Shams Method: one small portion a day, with review built in.", shDay: "Day {n}", shToday: "Today", shMarkDone: "Mark the day as done", shDayDone: "Day complete", shOpen: "Open the session",
  shPlans: "Memorisation plans", shPlansLead: "A plan for any surah: choose your pace and see each day's verses.", shPace: "{n} verses per day", shDays: "{n} days", shVersesRange: "Verses {a}–{b}",
  shReview: "Shams review", shReviewLead: "Your weakest verses first, with the steps of the method.", shNoWeak: "No verses to review yet. Learn a few verses with the Shams Method first.", shStrength: "{p} % strength",
  shKind_learn: "New portion", shKind_review: "Review", shKind_link: "Connect", shKind_recite: "Recite aloud",
  vdTitle: "Vocabulary decks", vdLead: "More decks: words of a surah, straight from the Quran text, and theme decks from the core vocabulary.", vdBySurah: "By surah", vdByTheme: "By theme", vdWords: "{n} words",
  vdShow: "Show meaning", vdKnew: "I knew it", vdAgain: "Again", vdQuiz: "Quiz", vdCards: "Cards", vdDone: "Deck finished", vdKnown: "{n} of {m} known",
  theme_verbs: "Verbs", theme_names: "Names and attributes", theme_particles: "Particles", theme_nouns: "Nouns", theme_adjectives: "Qualities", theme_pronouns: "Pronouns", theme_root: "Root family {r}",
  shOneADay: "Done for today. The next day of the program opens tomorrow.",
};
export type CText = typeof en;
type Part = Partial<CText>;

const de: CText = {
  coursesKicker: "Akademie-Kurse", coursesTitle: "Kurse", coursesLead: "Sira, die Propheten, Tafsir- und Hadithwissenschaften, Aqida, Fiqh, Ethik, Duas, die Namen Allahs, Ramadan und Hadsch: strukturierte Lektionen mit Quiz.",
  coursesCard: "Elf strukturierte Kurse mit Lektionen, Quiz und Stickern",
  lesson: "Lektion", lessons: "{n} Lektionen", free: "Kostenlos", done: "Erledigt", progress: "{d} von {n} Lektionen", start: "Starten", continue: "Fortsetzen",
  verses: "Im Koran", hadith: "Hadith-Belege", note: "Bitte beachten Sie", openReader: "Im Leser öffnen",
  startQuiz: "Quiz starten", question: "Frage {n} von {m}", right: "Richtig", wrong: "Nicht ganz", next: "Weiter",
  result: "{n} von {m} richtig", passed: "Lektion abgeschlossen", almost: "Fast geschafft", needPass: "Ab {p} % gilt die Lektion als abgeschlossen.",
  xp: "+{n} XP", growth: "+{n} Wachstum für Ihren Baum", retry: "Erneut versuchen", nextLesson: "Nächste Lektion", overview: "Zurück zum Kurs",
  unlock: "Mit Pro freischalten", lockedLead: "Die ersten Lektionen sind kostenlos. Alle weiteren Lektionen sind Teil von Pro.", notFound: "Lektion nicht gefunden.",
  sticker: "Kurs-Sticker erhalten", stickerLead: "Sie haben den gesamten Kurs abgeschlossen.", stickers: "Kurs-Sticker",
  tagsTitle: "Sichtweisen", tag_consensus: "Konsens", tag_majority: "Mehrheitsmeinung", tag_varies: "Ansichten gehen auseinander", tag_hanafi: "Hanafitisch", tag_maliki: "Malikitisch", tag_shafii: "Schafiitisch", tag_hanbali: "Hanbalitisch", tag_jafari: "Dschafaritisch", tag_ashari: "Aschari", tag_maturidi: "Maturidi", tag_athari: "Athari",
  nameMeaning: "Bedeutung", nameInQuran: "Wo er im Koran vorkommt", nameSunnah: "Dieser Name ist aus der Sunna und den Listen der Gelehrten bekannt; in genau dieser Form kommt er im Koran nicht als Name vor.", nameQ: "Was bedeutet dieser Name?", namesLoading: "Die Namen werden geladen …",
  tjPractice: "Tajweed-Übung", tjPracticeLead: "Regeln in echten Versen: Regel finden, Quiz pro Sure und ein vertiefender Kurs.", tjFind: "Regel finden", tjFindLead: "Ein Vers, ein Wort: Welche Regel gilt dort?", tjSurah: "Quiz pro Sure", tjSurahLead: "Regelfragen aus einer Sure.", tjDeep: "Tajweed vertieft", tjWhich: "Welche Regel gilt bei „{w}“?", tjRound: "Runde {n} von {m}", tjAgain: "Noch einmal spielen", tjScore: "{n} von {m} Regeln gefunden", tjPick: "Wählen Sie eine Sure", tjItems: "{n} Fragen", tjHint: "Hinweis",
  shProgram: "30-Tage-Programm", shProgramLead: "Ein begleiteter Monat mit der Shams-Methode: jeden Tag ein kleiner Abschnitt, mit eingebauter Wiederholung.", shDay: "Tag {n}", shToday: "Heute", shMarkDone: "Tag als erledigt markieren", shDayDone: "Tag abgeschlossen", shOpen: "Einheit öffnen",
  shPlans: "Memorierpläne", shPlansLead: "Ein Plan für jede Sure: Wählen Sie Ihr Tempo und sehen Sie die Verse jedes Tages.", shPace: "{n} Verse pro Tag", shDays: "{n} Tage", shVersesRange: "Verse {a}–{b}",
  shReview: "Shams-Wiederholung", shReviewLead: "Ihre schwächsten Verse zuerst, mit den Schritten der Methode.", shNoWeak: "Noch keine Verse zum Wiederholen. Lernen Sie zuerst einige Verse mit der Shams-Methode.", shStrength: "{p} % Stärke",
  shKind_learn: "Neuer Abschnitt", shKind_review: "Wiederholung", shKind_link: "Verbinden", shKind_recite: "Laut rezitieren",
  vdTitle: "Vokabelstapel", vdLead: "Weitere Stapel: Wörter einer Sure, direkt aus dem Korantext, und Themenstapel aus dem Grundwortschatz.", vdBySurah: "Nach Sure", vdByTheme: "Nach Thema", vdWords: "{n} Wörter",
  vdShow: "Bedeutung zeigen", vdKnew: "Gewusst", vdAgain: "Nochmal", vdQuiz: "Quiz", vdCards: "Karten", vdDone: "Stapel beendet", vdKnown: "{n} von {m} gewusst",
  theme_verbs: "Verben", theme_names: "Namen und Eigenschaften", theme_particles: "Partikeln", theme_nouns: "Nomen", theme_adjectives: "Eigenschaftswörter", theme_pronouns: "Pronomen", theme_root: "Wurzelfamilie {r}",
  shOneADay: "Für heute erledigt. Der nächste Tag des Programms öffnet sich morgen.",
};

const ar: CText = {
  coursesKicker: "دورات الأكاديمية", coursesTitle: "الدورات", coursesLead: "السيرة، والأنبياء، وعلوم التفسير والحديث، والعقيدة، والفقه، والأخلاق، والأدعية، وأسماء الله، ورمضان والحج: دروس منظمة مع اختبارات.",
  coursesCard: "إحدى عشرة دورة منظمة مع دروس واختبارات وملصقات",
  lesson: "درس", lessons: "{n} دروس", free: "مجاني", done: "تم", progress: "{d} من {n} دروس", start: "ابدأ", continue: "تابع",
  verses: "في القرآن", hadith: "مراجع الحديث", note: "يرجى الانتباه", openReader: "افتح في القارئ",
  startQuiz: "ابدأ الاختبار", question: "السؤال {n} من {m}", right: "صحيح", wrong: "ليس تمامًا", next: "التالي",
  result: "{n} من {m} صحيحة", passed: "اكتمل الدرس", almost: "اقتربت", needPass: "يُعدّ الدرس مكتملًا ابتداءً من {p} %.",
  xp: "+{n} XP", growth: "+{n} نمو لشجرتك", retry: "حاول مرة أخرى", nextLesson: "الدرس التالي", overview: "العودة إلى الدورة",
  unlock: "افتح مع Pro", lockedLead: "الدروس الأولى مجانية. وجميع الدروس الأخرى جزء من Pro.", notFound: "لم يُعثر على الدرس.",
  sticker: "حصلت على ملصق الدورة", stickerLead: "لقد أكملت الدورة كاملة.", stickers: "ملصقات الدورات",
  tagsTitle: "وجهات النظر", tag_consensus: "إجماع", tag_majority: "قول الجمهور", tag_varies: "الآراء مختلفة", tag_hanafi: "حنفي", tag_maliki: "مالكي", tag_shafii: "شافعي", tag_hanbali: "حنبلي", tag_jafari: "جعفري", tag_ashari: "أشعري", tag_maturidi: "ماتريدي", tag_athari: "أثري",
  nameMeaning: "المعنى", nameInQuran: "مواضعه في القرآن", nameSunnah: "هذا الاسم معروف من السنة ومن قوائم العلماء، ولا يرد بهذه الصيغة اسمًا في القرآن.", nameQ: "ما معنى هذا الاسم؟", namesLoading: "جارٍ تحميل الأسماء …",
  tjPractice: "تدريب التجويد", tjPracticeLead: "الأحكام في آيات حقيقية: اكتشف الحكم، واختبارات لكل سورة، ودورة معمقة.", tjFind: "اكتشف الحكم", tjFindLead: "آية وكلمة: أي حكم ينطبق هنا؟", tjSurah: "اختبار لكل سورة", tjSurahLead: "أسئلة الأحكام من سورة واحدة.", tjDeep: "التجويد بتعمق", tjWhich: "أي حكم ينطبق عند «{w}»؟", tjRound: "الجولة {n} من {m}", tjAgain: "العب مرة أخرى", tjScore: "وجدت {n} من {m} أحكام", tjPick: "اختر سورة", tjItems: "{n} أسئلة", tjHint: "تلميح",
  shProgram: "برنامج 30 يومًا", shProgramLead: "شهر موجَّه مع طريقة Shams: مقطع صغير كل يوم، مع مراجعة مدمجة.", shDay: "اليوم {n}", shToday: "اليوم", shMarkDone: "علّم اليوم كمكتمل", shDayDone: "اكتمل اليوم", shOpen: "افتح الجلسة",
  shPlans: "خطط الحفظ", shPlansLead: "خطة لأي سورة: اختر وتيرتك واطّلع على آيات كل يوم.", shPace: "{n} آيات يوميًا", shDays: "{n} أيام", shVersesRange: "الآيات {a}–{b}",
  shReview: "مراجعة Shams", shReviewLead: "أضعف آياتك أولًا، مع خطوات الطريقة.", shNoWeak: "لا توجد آيات للمراجعة بعد. احفظ بعض الآيات بطريقة Shams أولًا.", shStrength: "قوة {p} %",
  shKind_learn: "مقطع جديد", shKind_review: "مراجعة", shKind_link: "ربط", shKind_recite: "تلاوة جهرية",
  vdTitle: "مجموعات المفردات", vdLead: "مجموعات أخرى: كلمات سورة مأخوذة من نص القرآن مباشرة، ومجموعات موضوعية من المفردات الأساسية.", vdBySurah: "حسب السورة", vdByTheme: "حسب الموضوع", vdWords: "{n} كلمات",
  vdShow: "أظهر المعنى", vdKnew: "عرفتها", vdAgain: "مرة أخرى", vdQuiz: "اختبار", vdCards: "بطاقات", vdDone: "انتهت المجموعة", vdKnown: "عرفت {n} من {m}",
  theme_verbs: "الأفعال", theme_names: "الأسماء والصفات", theme_particles: "الحروف", theme_nouns: "الأسماء", theme_adjectives: "الصفات", theme_pronouns: "الضمائر", theme_root: "عائلة الجذر {r}",
  shOneADay: "أنجزت يوم اليوم. يُفتح اليوم التالي من البرنامج غدًا.",
};

const tr: Part = {
  coursesKicker: "Akademi kursları", coursesTitle: "Kurslar", coursesCard: "Ders, test ve çıkartmalarla on bir yapılandırılmış kurs",
  lesson: "Ders", lessons: "{n} ders", free: "Ücretsiz", done: "Tamamlandı", progress: "{n} dersten {d}", start: "Başla", continue: "Devam et",
  verses: "Kur'an'da", hadith: "Hadis kaynakları", note: "Lütfen dikkat", openReader: "Okuyucuda aç",
  startQuiz: "Testi başlat", question: "Soru {n} / {m}", right: "Doğru", wrong: "Tam değil", next: "Devam",
  result: "{m} sorudan {n} doğru", passed: "Ders tamamlandı", almost: "Az kaldı", needPass: "%{p} ve üzeri ders tamamlanmış sayılır.",
  xp: "+{n} XP", growth: "Ağacınız için +{n} büyüme", retry: "Tekrar dene", nextLesson: "Sonraki ders", overview: "Kursa dön",
  unlock: "Pro ile aç", notFound: "Ders bulunamadı.", sticker: "Kurs çıkartması kazanıldı", stickerLead: "Kursun tamamını bitirdiniz.", stickers: "Kurs çıkartmaları",
  tagsTitle: "Görüşler", tag_consensus: "İcma", tag_majority: "Cumhurun görüşü", tag_varies: "Görüşler farklı", tag_hanafi: "Hanefi", tag_maliki: "Maliki", tag_shafii: "Şafii", tag_hanbali: "Hanbeli", tag_jafari: "Caferi", tag_ashari: "Eş'ari", tag_maturidi: "Maturidi", tag_athari: "Eseri",
  nameMeaning: "Anlamı", nameInQuran: "Kur'an'da geçtiği yerler", nameQ: "Bu ismin anlamı nedir?", namesLoading: "İsimler yükleniyor …",
  tjPractice: "Tecvid alıştırması", tjFind: "Kuralı bul", tjSurah: "Sure bazında test", tjDeep: "Derinlemesine Tajweed", tjWhich: "“{w}” kelimesinde hangi kural geçerli?", tjRound: "Tur {n} / {m}", tjAgain: "Tekrar oyna", tjScore: "{m} kuraldan {n} bulundu", tjPick: "Bir sure seçin", tjItems: "{n} soru", tjHint: "İpucu",
  shProgram: "30 günlük program", shDay: "Gün {n}", shToday: "Bugün", shMarkDone: "Günü tamamlandı işaretle", shDayDone: "Gün tamamlandı", shOpen: "Oturumu aç",
  shPlans: "Ezber planları", shPace: "Günde {n} ayet", shDays: "{n} gün", shVersesRange: "Ayet {a}–{b}", shReview: "Shams tekrarı", shStrength: "%{p} güç",
  shKind_learn: "Yeni bölüm", shKind_review: "Tekrar", shKind_link: "Bağla", shKind_recite: "Sesli oku",
  vdTitle: "Kelime desteleri", vdBySurah: "Sureye göre", vdByTheme: "Konuya göre", vdWords: "{n} kelime", vdShow: "Anlamı göster", vdKnew: "Biliyordum", vdAgain: "Tekrar", vdQuiz: "Test", vdCards: "Kartlar", vdDone: "Deste bitti", vdKnown: "{m} kelimeden {n} biliniyor",
  theme_verbs: "Fiiller", theme_names: "İsimler ve sıfatlar", theme_particles: "Edatlar", theme_nouns: "İsimler", theme_adjectives: "Nitelikler", theme_pronouns: "Zamirler", theme_root: "Kök ailesi {r}",
  shProgramLead: "Shams Metodu ile rehberli bir ay: her gün küçük bir bölüm, tekrar dahil.", shPlansLead: "Her sure için bir plan: temponuzu seçin ve her günün ayetlerini görün.", shReviewLead: "En zayıf ayetleriniz önce, metodun adımlarıyla.", shNoWeak: "Henüz tekrar edilecek ayet yok. Önce Shams Metodu ile birkaç ayet öğrenin.", shOneADay: "Bugünlük tamam. Programın sonraki günü yarın açılır.",
};

const ur: Part = {
  coursesKicker: "اکیڈمی کورسز", coursesTitle: "کورسز", lesson: "سبق", lessons: "{n} اسباق", free: "مفت", done: "مکمل", progress: "{n} میں سے {d} اسباق", start: "شروع کریں", continue: "جاری رکھیں",
  verses: "قرآن میں", hadith: "حدیث کے حوالے", note: "براہ کرم توجہ دیں", openReader: "ریڈر میں کھولیں",
  startQuiz: "کوئز شروع کریں", question: "سوال {n} از {m}", right: "درست", wrong: "بالکل نہیں", next: "آگے",
  result: "{m} میں سے {n} درست", passed: "سبق مکمل", almost: "تقریباً ہو گیا", xp: "+{n} XP", retry: "دوبارہ کوشش کریں", nextLesson: "اگلا سبق", overview: "کورس پر واپس",
  unlock: "Pro کے ساتھ کھولیں", notFound: "سبق نہیں ملا۔", stickers: "کورس اسٹیکرز",
  tagsTitle: "نقطہ ہائے نظر", tag_consensus: "اجماع", tag_majority: "جمہور کی رائے", tag_varies: "آراء مختلف ہیں", tag_hanafi: "حنفی", tag_maliki: "مالکی", tag_shafii: "شافعی", tag_hanbali: "حنبلی", tag_jafari: "جعفری", tag_ashari: "اشعری", tag_maturidi: "ماتریدی", tag_athari: "اثری",
  nameMeaning: "معنی", nameQ: "اس نام کا کیا مطلب ہے؟", tjPractice: "تجوید کی مشق", tjFind: "قاعدہ تلاش کریں", tjRound: "راؤنڈ {n} از {m}", tjAgain: "دوبارہ کھیلیں", tjPick: "سورت منتخب کریں", tjItems: "{n} سوالات", tjHint: "اشارہ",
  shProgram: "30 دن کا پروگرام", shDay: "دن {n}", shToday: "آج", shDayDone: "دن مکمل", shOpen: "سیشن کھولیں", shPlans: "حفظ کے منصوبے", shPace: "روزانہ {n} آیات", shDays: "{n} دن", shVersesRange: "آیات {a}–{b}", shReview: "Shams دہرائی",
  shKind_learn: "نیا حصہ", shKind_review: "دہرائی", shKind_link: "جوڑیں", shKind_recite: "بلند آواز سے تلاوت",
  vdTitle: "الفاظ کے ڈیک", vdBySurah: "سورت کے لحاظ سے", vdByTheme: "موضوع کے لحاظ سے", vdWords: "{n} الفاظ", vdShow: "معنی دکھائیں", vdKnew: "مجھے معلوم تھا", vdAgain: "دوبارہ", vdQuiz: "کوئز", vdCards: "کارڈز", vdDone: "ڈیک مکمل",
  theme_verbs: "افعال", theme_names: "اسماء و صفات", theme_particles: "حروف", theme_nouns: "اسماء", theme_pronouns: "ضمائر",
  shProgramLead: "شمس طریقے کے ساتھ ایک رہنمائی والا مہینہ: ہر دن ایک چھوٹا حصہ، دہرائی کے ساتھ۔", shMarkDone: "دن کو مکمل کے طور پر نشان زد کریں", shPlansLead: "ہر سورت کے لیے ایک منصوبہ: اپنی رفتار منتخب کریں اور ہر دن کی آیات دیکھیں۔", shReviewLead: "آپ کی سب سے کمزور آیات پہلے، طریقے کے مراحل کے ساتھ۔", shNoWeak: "ابھی دہرانے کے لیے کوئی آیت نہیں۔ پہلے شمس طریقے سے چند آیات یاد کریں۔", shStrength: "{p} % پختگی", shOneADay: "آج کا دن مکمل ہوا۔ پروگرام کا اگلا دن کل کھلے گا۔",
};

const fa: Part = {
  coursesKicker: "دوره‌های آکادمی", coursesTitle: "دوره‌ها", lesson: "درس", lessons: "{n} درس", free: "رایگان", done: "انجام شد", progress: "{d} از {n} درس", start: "شروع", continue: "ادامه",
  verses: "در قرآن", hadith: "منابع حدیث", note: "لطفاً توجه کنید", openReader: "باز کردن در قاری",
  startQuiz: "شروع آزمون", question: "پرسش {n} از {m}", right: "درست", wrong: "نه کاملاً", next: "ادامه",
  result: "{n} از {m} درست", passed: "درس کامل شد", almost: "نزدیک است", xp: "+{n} XP", retry: "دوباره تلاش کنید", nextLesson: "درس بعدی", overview: "بازگشت به دوره",
  unlock: "باز کردن با Pro", notFound: "درس پیدا نشد.", stickers: "برچسب‌های دوره",
  tagsTitle: "دیدگاه‌ها", tag_consensus: "اجماع", tag_majority: "قول مشهور", tag_varies: "دیدگاه‌ها متفاوت است", tag_hanafi: "حنفی", tag_maliki: "مالکی", tag_shafii: "شافعی", tag_hanbali: "حنبلی", tag_jafari: "جعفری", tag_ashari: "اشعری", tag_maturidi: "ماتریدی", tag_athari: "اثری",
  nameMeaning: "معنا", nameQ: "معنای این نام چیست؟", tjPractice: "تمرین تجوید", tjFind: "قاعده را پیدا کنید", tjRound: "دور {n} از {m}", tjAgain: "دوباره بازی کنید", tjPick: "یک سوره انتخاب کنید", tjItems: "{n} پرسش", tjHint: "راهنما",
  shProgram: "برنامه ۳۰ روزه", shDay: "روز {n}", shToday: "امروز", shDayDone: "روز کامل شد", shOpen: "باز کردن جلسه", shPlans: "برنامه‌های حفظ", shPace: "{n} آیه در روز", shDays: "{n} روز", shVersesRange: "آیات {a}–{b}", shReview: "مرور Shams",
  shKind_learn: "بخش جدید", shKind_review: "مرور", shKind_link: "اتصال", shKind_recite: "تلاوت بلند",
  vdTitle: "دسته‌های واژگان", vdBySurah: "بر اساس سوره", vdByTheme: "بر اساس موضوع", vdWords: "{n} واژه", vdShow: "نمایش معنا", vdKnew: "می‌دانستم", vdAgain: "دوباره", vdQuiz: "آزمون", vdCards: "کارت‌ها", vdDone: "دسته تمام شد",
  theme_verbs: "افعال", theme_names: "اسماء و صفات", theme_particles: "حروف", theme_nouns: "اسم‌ها", theme_pronouns: "ضمیرها",
  shProgramLead: "یک ماه همراه با روش شمس: هر روز بخشی کوچک، همراه با مرور.", shMarkDone: "علامت‌گذاری روز به‌عنوان انجام‌شده", shPlansLead: "برنامه‌ای برای هر سوره: سرعت خود را انتخاب کنید و آیات هر روز را ببینید.", shReviewLead: "ضعیف‌ترین آیات شما در اولویت، با گام‌های این روش.", shNoWeak: "هنوز آیه‌ای برای مرور نیست. ابتدا چند آیه را با روش شمس بیاموزید.", shStrength: "استحکام {p} %", shOneADay: "کار امروز انجام شد. روز بعدی برنامه فردا باز می‌شود.",
};

const ps: Part = {
  coursesKicker: "د اکاډمۍ کورسونه", coursesTitle: "کورسونه", lesson: "لوست", lessons: "{n} لوستونه", free: "وړیا", done: "بشپړ", start: "پیل کړئ", continue: "دوام ورکړئ",
  verses: "په قرآن کې", hadith: "د حدیثو سرچینې", openReader: "په لوستونکي کې پرانیزئ", startQuiz: "ازموینه پیل کړئ", question: "پوښتنه {n} له {m}", right: "سم", wrong: "بشپړ سم نه دی", next: "مخته",
  passed: "لوست بشپړ شو", xp: "+{n} XP", retry: "بیا هڅه وکړئ", nextLesson: "بل لوست", overview: "کورس ته بیرته",
  unlock: "د Pro سره یې پرانیزئ", tag_consensus: "اجماع", tag_hanafi: "حنفي", tag_maliki: "مالکي", tag_shafii: "شافعي", tag_hanbali: "حنبلي", tag_jafari: "جعفري",
  nameMeaning: "مانا", tjPractice: "د تجوید تمرین", tjHint: "اشاره", shDay: "ورځ {n}", shToday: "نن", shDays: "{n} ورځې", shVersesRange: "آیتونه {a}–{b}", shKind_review: "تکرار",
  vdWords: "{n} کلمې", vdAgain: "بیا", vdQuiz: "ازموینه", vdCards: "کارتونه",
  tjPick: "یو سورت وټاکئ", shProgram: "د ۳۰ ورځو پروګرام", shProgramLead: "د شمس طریقې سره لارښوونه شوې میاشت: هره ورځ یوه کوچنۍ برخه، له تکرار سره.", shMarkDone: "ورځ بشپړه په نښه کړئ", shDayDone: "ورځ بشپړه شوه", shOpen: "ناسته پرانیزئ", shPlans: "د حفظ پلانونه", shPlansLead: "د هر سورت لپاره یو پلان: خپله چټکتیا وټاکئ او د هرې ورځې آیتونه وګورئ.", shPace: "په ورځ کې {n} آیتونه", shReview: "د شمس تکرار", shReviewLead: "ستاسو تر ټولو کمزوري آیتونه لومړی، د طریقې له ګامونو سره.", shNoWeak: "تر اوسه د تکرار لپاره آیتونه نشته. لومړی د شمس په طریقه څو آیتونه زده کړئ.", shStrength: "{p} % ټینګښت", shKind_learn: "نوې برخه", shKind_link: "نښلول", shKind_recite: "په لوړ غږ تلاوت", shOneADay: "د نن ورځې کار بشپړ شو. د پروګرام بله ورځ سبا پرانیستل کېږي.",
};

const fr: Part = {
  coursesKicker: "Cours de l'académie", coursesTitle: "Cours", coursesLead: "Sîra, les prophètes, sciences du tafsir et du hadith, aqida, fiqh, éthique, invocations, les noms d'Allah, Ramadan et Hajj : des leçons structurées avec quiz.",
  coursesCard: "Onze cours structurés avec leçons, quiz et autocollants",
  lesson: "Leçon", lessons: "{n} leçons", free: "Gratuit", done: "Terminé", progress: "{d} leçons sur {n}", start: "Commencer", continue: "Continuer",
  verses: "Dans le Coran", hadith: "Références de hadith", note: "À noter", openReader: "Ouvrir dans le lecteur",
  startQuiz: "Commencer le quiz", question: "Question {n} sur {m}", right: "Correct", wrong: "Pas tout à fait", next: "Continuer",
  result: "{n} sur {m} correctes", passed: "Leçon terminée", almost: "Presque", needPass: "À partir de {p} %, la leçon est validée.",
  xp: "+{n} XP", growth: "+{n} de croissance pour votre arbre", retry: "Réessayer", nextLesson: "Leçon suivante", overview: "Retour au cours",
  unlock: "Débloquer avec Pro", lockedLead: "Les premières leçons sont gratuites. Toutes les autres font partie de Pro.", notFound: "Leçon introuvable.",
  sticker: "Autocollant du cours obtenu", stickerLead: "Vous avez terminé tout le cours.", stickers: "Autocollants des cours",
  tagsTitle: "Points de vue", tag_consensus: "Consensus", tag_majority: "Avis majoritaire", tag_varies: "Les avis divergent", tag_hanafi: "Hanafite", tag_maliki: "Malikite", tag_shafii: "Chafiite", tag_hanbali: "Hanbalite", tag_jafari: "Jafarite", tag_ashari: "Ach'arite", tag_maturidi: "Maturidite", tag_athari: "Athari",
  nameMeaning: "Signification", nameInQuran: "Où il apparaît dans le Coran", nameQ: "Que signifie ce nom ?", namesLoading: "Chargement des noms …",
  tjPractice: "Exercices de Tajweed", tjFind: "Trouver la règle", tjFindLead: "Un verset, un mot : quelle règle s'applique ?", tjSurah: "Quiz par sourate", tjSurahLead: "Questions de règles d'une sourate.", tjDeep: "Tajweed approfondi", tjWhich: "Quelle règle s'applique à « {w} » ?", tjRound: "Manche {n} sur {m}", tjAgain: "Rejouer", tjScore: "{n} règles trouvées sur {m}", tjPick: "Choisissez une sourate", tjItems: "{n} questions", tjHint: "Indice",
  shProgram: "Programme de 30 jours", shDay: "Jour {n}", shToday: "Aujourd'hui", shMarkDone: "Marquer le jour comme terminé", shDayDone: "Jour terminé", shOpen: "Ouvrir la séance",
  shPlans: "Plans de mémorisation", shPace: "{n} versets par jour", shDays: "{n} jours", shVersesRange: "Versets {a}–{b}", shReview: "Révision Shams", shStrength: "{p} % de solidité",
  shKind_learn: "Nouvelle portion", shKind_review: "Révision", shKind_link: "Relier", shKind_recite: "Réciter à voix haute",
  vdTitle: "Paquets de vocabulaire", vdBySurah: "Par sourate", vdByTheme: "Par thème", vdWords: "{n} mots", vdShow: "Afficher le sens", vdKnew: "Je savais", vdAgain: "Encore", vdQuiz: "Quiz", vdCards: "Cartes", vdDone: "Paquet terminé", vdKnown: "{n} sur {m} connus",
  theme_verbs: "Verbes", theme_names: "Noms et attributs", theme_particles: "Particules", theme_nouns: "Noms", theme_adjectives: "Qualités", theme_pronouns: "Pronoms", theme_root: "Famille de la racine {r}",
  shProgramLead: "Un mois accompagné avec la Méthode Shams : chaque jour une petite portion, révision comprise.", shPlansLead: "Un plan pour chaque sourate : choisissez votre rythme et voyez les versets de chaque jour.", shReviewLead: "Vos versets les plus fragiles d’abord, avec les étapes de la méthode.", shNoWeak: "Aucun verset à réviser pour l’instant. Apprenez d’abord quelques versets avec la Méthode Shams.", shOneADay: "C’est fait pour aujourd’hui. Le jour suivant du programme s’ouvre demain.",
};

const es: Part = {
  coursesKicker: "Cursos de la academia", coursesTitle: "Cursos", coursesCard: "Once cursos estructurados con lecciones, cuestionarios y pegatinas",
  lesson: "Lección", lessons: "{n} lecciones", free: "Gratis", done: "Hecho", progress: "{d} de {n} lecciones", start: "Empezar", continue: "Continuar",
  verses: "En el Corán", hadith: "Referencias de hadiz", note: "Tenga en cuenta", openReader: "Abrir en el lector",
  startQuiz: "Empezar el cuestionario", question: "Pregunta {n} de {m}", right: "Correcto", wrong: "No del todo", next: "Continuar",
  result: "{n} de {m} correctas", passed: "Lección completada", almost: "Casi", needPass: "A partir del {p} % la lección cuenta como completada.",
  xp: "+{n} XP", growth: "+{n} de crecimiento para su árbol", retry: "Intentar de nuevo", nextLesson: "Siguiente lección", overview: "Volver al curso",
  unlock: "Desbloquear con Pro", notFound: "Lección no encontrada.", sticker: "Pegatina del curso obtenida", stickerLead: "Ha completado todo el curso.", stickers: "Pegatinas de cursos",
  tagsTitle: "Perspectivas", tag_consensus: "Consenso", tag_majority: "Opinión mayoritaria", tag_varies: "Las opiniones difieren", tag_hanafi: "Hanafí", tag_maliki: "Malikí", tag_shafii: "Shafií", tag_hanbali: "Hanbalí", tag_jafari: "Yafarí", tag_ashari: "Asharí", tag_maturidi: "Maturidí", tag_athari: "Atharí",
  nameMeaning: "Significado", nameInQuran: "Dónde aparece en el Corán", nameQ: "¿Qué significa este nombre?", namesLoading: "Cargando los nombres …",
  tjPractice: "Práctica de Tajweed", tjFind: "Encontrar la regla", tjSurah: "Cuestionario por sura", tjDeep: "Tajweed a fondo", tjWhich: "¿Qué regla se aplica en «{w}»?", tjRound: "Ronda {n} de {m}", tjAgain: "Jugar de nuevo", tjScore: "{n} de {m} reglas encontradas", tjPick: "Elija una sura", tjItems: "{n} preguntas", tjHint: "Pista",
  shProgram: "Programa de 30 días", shDay: "Día {n}", shToday: "Hoy", shMarkDone: "Marcar el día como hecho", shDayDone: "Día completado", shOpen: "Abrir la sesión",
  shPlans: "Planes de memorización", shPace: "{n} aleyas al día", shDays: "{n} días", shVersesRange: "Aleyas {a}–{b}", shReview: "Repaso Shams", shStrength: "{p} % de solidez",
  shKind_learn: "Porción nueva", shKind_review: "Repaso", shKind_link: "Conectar", shKind_recite: "Recitar en voz alta",
  vdTitle: "Mazos de vocabulario", vdBySurah: "Por sura", vdByTheme: "Por tema", vdWords: "{n} palabras", vdShow: "Mostrar significado", vdKnew: "La sabía", vdAgain: "Otra vez", vdQuiz: "Cuestionario", vdCards: "Tarjetas", vdDone: "Mazo terminado", vdKnown: "{n} de {m} sabidas",
  theme_verbs: "Verbos", theme_names: "Nombres y atributos", theme_particles: "Partículas", theme_nouns: "Sustantivos", theme_adjectives: "Cualidades", theme_pronouns: "Pronombres", theme_root: "Familia de la raíz {r}",
  shProgramLead: "Un mes acompañado con el Método Shams: cada día una pequeña porción, con repaso incluido.", shPlansLead: "Un plan para cada sura: elija su ritmo y vea las aleyas de cada día.", shReviewLead: "Sus aleyas más débiles primero, con los pasos del método.", shNoWeak: "Todavía no hay aleyas para repasar. Aprenda primero algunas aleyas con el Método Shams.", shOneADay: "Listo por hoy. El siguiente día del programa se abre mañana.",
};

const id_: Part = {
  coursesKicker: "Kursus akademi", coursesTitle: "Kursus", lesson: "Pelajaran", lessons: "{n} pelajaran", free: "Gratis", done: "Selesai", progress: "{d} dari {n} pelajaran", start: "Mulai", continue: "Lanjutkan",
  verses: "Dalam Al-Qur'an", hadith: "Rujukan hadis", note: "Harap diperhatikan", openReader: "Buka di pembaca",
  startQuiz: "Mulai kuis", question: "Pertanyaan {n} dari {m}", right: "Benar", wrong: "Belum tepat", next: "Lanjut",
  result: "{n} dari {m} benar", passed: "Pelajaran selesai", almost: "Hampir", xp: "+{n} XP", growth: "+{n} pertumbuhan untuk pohon Anda", retry: "Coba lagi", nextLesson: "Pelajaran berikutnya", overview: "Kembali ke kursus",
  unlock: "Buka dengan Pro", notFound: "Pelajaran tidak ditemukan.", stickers: "Stiker kursus",
  tagsTitle: "Pandangan", tag_consensus: "Ijmak", tag_majority: "Pendapat jumhur", tag_varies: "Pendapat berbeda", tag_hanafi: "Hanafi", tag_maliki: "Maliki", tag_shafii: "Syafi'i", tag_hanbali: "Hanbali", tag_jafari: "Ja'fari", tag_ashari: "Asy'ari", tag_maturidi: "Maturidi", tag_athari: "Atsari",
  nameMeaning: "Makna", nameQ: "Apa makna nama ini?", tjPractice: "Latihan Tajweed", tjFind: "Temukan hukumnya", tjRound: "Ronde {n} dari {m}", tjAgain: "Main lagi", tjPick: "Pilih surah", tjItems: "{n} pertanyaan", tjHint: "Petunjuk",
  shProgram: "Program 30 hari", shDay: "Hari {n}", shToday: "Hari ini", shDayDone: "Hari selesai", shOpen: "Buka sesi", shPlans: "Rencana hafalan", shPace: "{n} ayat per hari", shDays: "{n} hari", shVersesRange: "Ayat {a}–{b}", shReview: "Murajaah Shams",
  shKind_learn: "Bagian baru", shKind_review: "Murajaah", shKind_link: "Sambungkan", shKind_recite: "Baca dengan suara",
  vdTitle: "Dek kosakata", vdBySurah: "Per surah", vdByTheme: "Per tema", vdWords: "{n} kata", vdShow: "Tampilkan makna", vdKnew: "Saya tahu", vdAgain: "Lagi", vdQuiz: "Kuis", vdCards: "Kartu", vdDone: "Dek selesai",
  theme_verbs: "Kata kerja", theme_names: "Nama dan sifat", theme_particles: "Partikel", theme_nouns: "Kata benda", theme_pronouns: "Kata ganti",
  shProgramLead: "Satu bulan terbimbing dengan Metode Shams: setiap hari satu bagian kecil, termasuk murajaah.", shMarkDone: "Tandai hari ini selesai", shPlansLead: "Rencana untuk setiap surah: pilih kecepatan Anda dan lihat ayat setiap hari.", shReviewLead: "Ayat-ayat terlemah Anda lebih dahulu, dengan langkah-langkah metode ini.", shNoWeak: "Belum ada ayat untuk diulang. Pelajari dahulu beberapa ayat dengan Metode Shams.", shStrength: "Kekuatan {p} %", shOneADay: "Selesai untuk hari ini. Hari berikutnya dari program terbuka besok.",
};

const ms: Part = {
  coursesKicker: "Kursus akademi", coursesTitle: "Kursus", lesson: "Pelajaran", lessons: "{n} pelajaran", free: "Percuma", done: "Selesai", progress: "{d} daripada {n} pelajaran", start: "Mula", continue: "Teruskan",
  verses: "Dalam al-Quran", hadith: "Rujukan hadis", note: "Sila ambil perhatian", openReader: "Buka dalam pembaca",
  startQuiz: "Mula kuiz", question: "Soalan {n} daripada {m}", right: "Betul", wrong: "Belum tepat", next: "Seterusnya",
  result: "{n} daripada {m} betul", passed: "Pelajaran selesai", almost: "Hampir", xp: "+{n} XP", retry: "Cuba lagi", nextLesson: "Pelajaran seterusnya", overview: "Kembali ke kursus",
  unlock: "Buka dengan Pro", notFound: "Pelajaran tidak dijumpai.", stickers: "Pelekat kursus",
  tagsTitle: "Pandangan", tag_consensus: "Ijmak", tag_majority: "Pendapat jumhur", tag_varies: "Pandangan berbeza", tag_hanafi: "Hanafi", tag_maliki: "Maliki", tag_shafii: "Syafie", tag_hanbali: "Hanbali", tag_jafari: "Ja'fari", tag_ashari: "Asya'irah", tag_maturidi: "Maturidi", tag_athari: "Athari",
  nameMeaning: "Makna", nameQ: "Apakah makna nama ini?", tjPractice: "Latihan Tajweed", tjFind: "Cari hukumnya", tjRound: "Pusingan {n} daripada {m}", tjAgain: "Main lagi", tjPick: "Pilih surah", tjItems: "{n} soalan", tjHint: "Petunjuk",
  shProgram: "Program 30 hari", shDay: "Hari {n}", shToday: "Hari ini", shDayDone: "Hari selesai", shOpen: "Buka sesi", shPlans: "Pelan hafazan", shPace: "{n} ayat sehari", shDays: "{n} hari", shVersesRange: "Ayat {a}–{b}", shReview: "Ulang kaji Shams",
  shKind_learn: "Bahagian baharu", shKind_review: "Ulang kaji", shKind_link: "Sambung", shKind_recite: "Baca dengan kuat",
  vdTitle: "Dek perbendaharaan kata", vdBySurah: "Ikut surah", vdByTheme: "Ikut tema", vdWords: "{n} perkataan", vdShow: "Tunjuk makna", vdKnew: "Saya tahu", vdAgain: "Lagi", vdQuiz: "Kuiz", vdCards: "Kad", vdDone: "Dek selesai",
  shProgramLead: "Sebulan berpandu dengan Kaedah Shams: setiap hari satu bahagian kecil, termasuk ulang kaji.", shMarkDone: "Tandakan hari ini selesai", shPlansLead: "Pelan untuk setiap surah: pilih rentak anda dan lihat ayat bagi setiap hari.", shReviewLead: "Ayat-ayat paling lemah anda dahulu, dengan langkah-langkah kaedah ini.", shNoWeak: "Belum ada ayat untuk diulang kaji. Hafal dahulu beberapa ayat dengan Kaedah Shams.", shStrength: "Kekuatan {p} %", shOneADay: "Selesai untuk hari ini. Hari seterusnya dalam program dibuka esok.",
};

const bn: Part = {
  coursesKicker: "একাডেমি কোর্স", coursesTitle: "কোর্স", lesson: "পাঠ", lessons: "{n}টি পাঠ", free: "বিনামূল্যে", done: "সম্পন্ন", progress: "{n}টির মধ্যে {d}টি পাঠ", start: "শুরু করুন", continue: "চালিয়ে যান",
  verses: "কুরআনে", hadith: "হাদিসের সূত্র", openReader: "রিডারে খুলুন", startQuiz: "কুইজ শুরু করুন", question: "প্রশ্ন {n}/{m}", right: "সঠিক", wrong: "পুরোপুরি নয়", next: "পরবর্তী",
  result: "{m}টির মধ্যে {n}টি সঠিক", passed: "পাঠ সম্পন্ন", xp: "+{n} XP", retry: "আবার চেষ্টা করুন", nextLesson: "পরবর্তী পাঠ", overview: "কোর্সে ফিরে যান",
  unlock: "Pro দিয়ে খুলুন", tag_consensus: "ইজমা", tag_hanafi: "হানাফি", tag_maliki: "মালিকি", tag_shafii: "শাফেয়ি", tag_hanbali: "হাম্বলি", tag_jafari: "জাফরি",
  nameMeaning: "অর্থ", tjPractice: "তাজবিদ অনুশীলন", tjHint: "ইঙ্গিত", tjItems: "{n}টি প্রশ্ন", shDay: "দিন {n}", shToday: "আজ", shDays: "{n} দিন", shVersesRange: "আয়াত {a}–{b}", shPace: "দিনে {n}টি আয়াত", shKind_review: "পুনরাবৃত্তি",
  vdWords: "{n}টি শব্দ", vdAgain: "আবার", vdQuiz: "কুইজ", vdCards: "কার্ড", vdShow: "অর্থ দেখান",
  tjPick: "একটি সূরা বেছে নিন", shProgram: "৩০ দিনের প্রোগ্রাম", shProgramLead: "শামস পদ্ধতির সাথে একটি নির্দেশিত মাস: প্রতিদিন একটি ছোট অংশ, পুনরাবৃত্তিসহ।", shMarkDone: "দিনটি সম্পন্ন হিসেবে চিহ্নিত করুন", shDayDone: "দিন সম্পন্ন", shOpen: "সেশন খুলুন", shPlans: "হিফজের পরিকল্পনা", shPlansLead: "প্রতিটি সূরার জন্য একটি পরিকল্পনা: আপনার গতি বেছে নিন এবং প্রতিদিনের আয়াত দেখুন।", shReview: "শামস পুনরাবৃত্তি", shReviewLead: "আপনার সবচেয়ে দুর্বল আয়াতগুলো আগে, পদ্ধতির ধাপগুলোসহ।", shNoWeak: "এখনও পুনরাবৃত্তির জন্য কোনো আয়াত নেই। প্রথমে শামস পদ্ধতিতে কয়েকটি আয়াত মুখস্থ করুন।", shStrength: "দৃঢ়তা {p} %", shKind_learn: "নতুন অংশ", shKind_link: "সংযুক্ত করুন", shKind_recite: "উচ্চস্বরে তিলাওয়াত", shOneADay: "আজকের কাজ সম্পন্ন। প্রোগ্রামের পরের দিন আগামীকাল খুলবে।",
};

const ru: Part = {
  coursesKicker: "Курсы академии", coursesTitle: "Курсы", coursesCard: "Одиннадцать структурированных курсов с уроками, тестами и наклейками",
  lesson: "Урок", lessons: "Уроков: {n}", free: "Бесплатно", done: "Готово", progress: "{d} из {n} уроков", start: "Начать", continue: "Продолжить",
  verses: "В Коране", hadith: "Ссылки на хадисы", note: "Обратите внимание", openReader: "Открыть в читалке",
  startQuiz: "Начать тест", question: "Вопрос {n} из {m}", right: "Верно", wrong: "Не совсем", next: "Далее",
  result: "{n} из {m} верно", passed: "Урок пройден", almost: "Почти", needPass: "Урок засчитывается от {p} %.",
  xp: "+{n} XP", growth: "+{n} роста для вашего дерева", retry: "Попробовать снова", nextLesson: "Следующий урок", overview: "Назад к курсу",
  unlock: "Открыть с Pro", notFound: "Урок не найден.", sticker: "Получена наклейка курса", stickerLead: "Вы прошли весь курс.", stickers: "Наклейки курсов",
  tagsTitle: "Мнения", tag_consensus: "Иджма", tag_majority: "Мнение большинства", tag_varies: "Мнения расходятся", tag_hanafi: "Ханафитский", tag_maliki: "Маликитский", tag_shafii: "Шафиитский", tag_hanbali: "Ханбалитский", tag_jafari: "Джафаритский", tag_ashari: "Ашаритский", tag_maturidi: "Матуридитский", tag_athari: "Асаритский",
  nameMeaning: "Значение", nameInQuran: "Где встречается в Коране", nameQ: "Что означает это имя?", namesLoading: "Загрузка имён …",
  tjPractice: "Практика Tajweed", tjFind: "Найдите правило", tjSurah: "Тест по суре", tjDeep: "Tajweed углублённо", tjWhich: "Какое правило действует в «{w}»?", tjRound: "Раунд {n} из {m}", tjAgain: "Сыграть ещё", tjScore: "Найдено правил: {n} из {m}", tjPick: "Выберите суру", tjItems: "Вопросов: {n}", tjHint: "Подсказка",
  shProgram: "Программа на 30 дней", shDay: "День {n}", shToday: "Сегодня", shMarkDone: "Отметить день выполненным", shDayDone: "День выполнен", shOpen: "Открыть занятие",
  shPlans: "Планы заучивания", shPace: "{n} аятов в день", shDays: "{n} дн.", shVersesRange: "Аяты {a}–{b}", shReview: "Повторение Shams", shStrength: "Прочность {p} %",
  shKind_learn: "Новая часть", shKind_review: "Повторение", shKind_link: "Связать", shKind_recite: "Читать вслух",
  vdTitle: "Колоды слов", vdBySurah: "По суре", vdByTheme: "По теме", vdWords: "Слов: {n}", vdShow: "Показать значение", vdKnew: "Знал(а)", vdAgain: "Ещё раз", vdQuiz: "Тест", vdCards: "Карточки", vdDone: "Колода пройдена", vdKnown: "Известно {n} из {m}",
  theme_verbs: "Глаголы", theme_names: "Имена и атрибуты", theme_particles: "Частицы", theme_nouns: "Существительные", theme_adjectives: "Качества", theme_pronouns: "Местоимения", theme_root: "Семья корня {r}",
  shProgramLead: "Месяц с сопровождением по Методу Шамса: каждый день небольшая часть, повторение включено.", shPlansLead: "План для любой суры: выберите свой темп и посмотрите аяты на каждый день.", shReviewLead: "Сначала ваши самые слабые аяты, по шагам метода.", shNoWeak: "Пока нет аятов для повторения. Сначала выучите несколько аятов по Методу Шамса.", shOneADay: "На сегодня готово. Следующий день программы откроется завтра.",
};

const zh: Part = {
  coursesKicker: "学院课程", coursesTitle: "课程", coursesCard: "十一门结构化课程，含课时、测验和贴纸",
  lesson: "课时", lessons: "{n} 节课", free: "免费", done: "已完成", progress: "{n} 节课中已完成 {d} 节", start: "开始", continue: "继续",
  verses: "古兰经中", hadith: "圣训出处", note: "请注意", openReader: "在阅读器中打开",
  startQuiz: "开始测验", question: "第 {n} 题，共 {m} 题", right: "正确", wrong: "不太对", next: "继续",
  result: "{m} 题答对 {n} 题", passed: "课时完成", almost: "差一点", needPass: "达到 {p} % 即视为完成。",
  xp: "+{n} XP", growth: "您的树成长 +{n}", retry: "再试一次", nextLesson: "下一课", overview: "返回课程",
  unlock: "使用 Pro 解锁", notFound: "未找到课时。", sticker: "获得课程贴纸", stickerLead: "您已完成整门课程。", stickers: "课程贴纸",
  tagsTitle: "观点", tag_consensus: "公议", tag_majority: "多数意见", tag_varies: "观点不一", tag_hanafi: "哈乃斐", tag_maliki: "马立克", tag_shafii: "沙斐仪", tag_hanbali: "罕百里", tag_jafari: "加法里", tag_ashari: "艾什尔里", tag_maturidi: "马图里迪", tag_athari: "圣训派",
  nameMeaning: "含义", nameInQuran: "在古兰经中出现的位置", nameQ: "这个名字是什么意思？", namesLoading: "正在加载名字 …",
  tjPractice: "Tajweed 练习", tjFind: "找出规则", tjSurah: "按章测验", tjDeep: "Tajweed 深入", tjWhich: "“{w}”处适用哪条规则？", tjRound: "第 {n} 轮，共 {m} 轮", tjAgain: "再玩一次", tjScore: "找到 {n}/{m} 条规则", tjPick: "选择一章", tjItems: "{n} 道题", tjHint: "提示",
  shProgram: "30 天计划", shDay: "第 {n} 天", shToday: "今天", shMarkDone: "标记今天已完成", shDayDone: "今日完成", shOpen: "打开练习",
  shPlans: "背诵计划", shPace: "每天 {n} 节", shDays: "{n} 天", shVersesRange: "第 {a}–{b} 节", shReview: "Shams 复习", shStrength: "牢固度 {p} %",
  shKind_learn: "新内容", shKind_review: "复习", shKind_link: "衔接", shKind_recite: "大声诵读",
  vdTitle: "词汇卡组", vdBySurah: "按章", vdByTheme: "按主题", vdWords: "{n} 个词", vdShow: "显示含义", vdKnew: "我会了", vdAgain: "再来", vdQuiz: "测验", vdCards: "卡片", vdDone: "卡组完成", vdKnown: "已掌握 {n}/{m}",
  theme_verbs: "动词", theme_names: "名称与属性", theme_particles: "虚词", theme_nouns: "名词", theme_adjectives: "性质词", theme_pronouns: "代词", theme_root: "词根 {r} 词族",
  shProgramLead: "跟随 Shams 方法的一个月：每天一小段，并包含复习。", shPlansLead: "为任意一章制定计划：请选择您的节奏，查看每天要学的经文。", shReviewLead: "先复习您最薄弱的经文，按照方法的步骤进行。", shNoWeak: "暂时没有需要复习的经文。请先用 Shams 方法学习几节经文。", shOneADay: "今天已完成。计划的下一天将在明天开放。",
};

const TABLE: { en: CText } & Record<string, CText | undefined> = { en, de, ar, tr: { ...en, ...tr }, ur: { ...en, ...ur }, fa: { ...en, ...fa }, ps: { ...en, ...ps }, fr: { ...en, ...fr }, es: { ...en, ...es }, id: { ...en, ...id_ }, ms: { ...en, ...ms }, bn: { ...en, ...bn }, ru: { ...en, ...ru }, zh: { ...en, ...zh } };
export type CKey = keyof CText;
export function fmt(s: string, p?: Record<string, string | number>) { return p ? s.replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : s; }
export function useCT() {
  const { lang } = useLang();
  return useCallback((k: CKey, p?: Record<string, string | number>) => fmt(moduleText("courses2", TABLE, lang)[k] ?? en[k], p), [lang]);
}
