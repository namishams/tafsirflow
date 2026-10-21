// mirrors mobile/src/features/arabic-lang/texts.ts (copied for the website; keep both in step)
import { useCallback } from "react";
import { useLang } from "@/lib/learn/i18n";
import { moduleText } from "@/lib/learn/i18n";

// Interface texts of the Arabic language course in all 14 app languages (module "arabicLang"; a language file in
// src/i18n/app/<lang>.json may override single keys). Always the polite form of address.
const en = {
  kicker: "Arabic language course", title: "Understand Arabic", lead: "From your first sentence to reading the Quran with understanding: seventeen units from A1 to C1, Quranic and Modern Standard Arabic, with the 500 most frequent Quran words.",
  cardLead: "Learn the language itself: grammar, roots, rhetoric and the most frequent Quran words, A1 to C1.",
  start: "Start", continue: "Continue", unit: "Unit {n}", lessonsDone: "{d} of {n} lessons", locked: "Finish the previous lesson first", free: "Free", pro: "Pro",
  goal: "Daily goal", goalN: "{n} per day", today: "Today: {d} of {n} lessons", goalMet: "Daily goal reached", streak: "{n} days in a row",
  roots: "Root explorer", rootsLead: "Enter a root and see its family of words, with an example verse from the Quran.", rootPh: "Root, e.g. ع ل م", rootNone: "No words with this root in the course vocabulary yet.", rootPick: "Frequent roots", inQuran: "In the Quran",
  certs: "Certificates", certTitle: "Certificate {level}", certNote: "App certificate of Quran Masterclass, not an official CEFR certificate.", certFor: "has completed level {level} of the Arabic language course", certLocked: "Pass the unit tests up to unit {n}", certYou: "You",
  unlockKicker: "Unit 1 complete", unlockTitle: "Keep going: from A1 to C1", unlockLead: "Nine more units take you from the past tense to verb forms, iʿrāb and reading whole verses with understanding.", unlockList1: "119 more lessons and 16 unit tests", unlockList2: "Grammar spotting in real verses", unlockList3: "App certificates A1, A2, B1 and B2", unlockCta: "Unlock with Pro",
  check: "Check", next: "Continue", right: "Correct", wrong: "Not quite. Correct is:", listen: "Listen", isNew: "New",
  chooseMeaning: "What does this mean?", chooseArabic: "Which is the Arabic for this?", listenPick: "Listen and choose what you hear", tilesQ: "Build the sentence", tilesHint: "Tap the words in order. The first word goes on the right.", reset: "Reset",
  typeQ: "Write it in Arabic", typeDict: "Listen and write what you hear", typeHint: "Vowel signs are optional.", typePad: "Letters", del: "Delete", space: "Space",
  speakQ: "Say it aloud", speakStart: "Start", speakStop: "Finish", speakHeard: "{n} of {total} words heard", speakNA: "On-device speech recognition for Arabic is not available here. Say it aloud anyway and continue.", skip: "Skip",
  conjQ: "Choose the right form", spotLoading: "Loading the verse…", spotOffline: "The verse could not be loaded.", spotHint: "Tap the word or words, then check.",
  dialogue: "Read and listen", explain: "Explanation", startEx: "Start exercises",
  complete: "Lesson complete", testPassed: "Unit test passed", almost: "Almost there", needPass: "From {p} % the test counts as passed.", score: "{p} % correct on the first try", retry: "Practise again", toMap: "Back to the path", nextLesson: "Next lesson", wordsAdded: "{n} words added to your review cards", quit: "Quit", openRoots: "Open the root explorer", share: "Share",
};
type T = typeof en;
const de: T = {
  kicker: "Arabisch-Sprachkurs", title: "Arabisch verstehen", lead: "Vom ersten Satz bis Sie den Koran verstehend lesen: siebzehn Einheiten von A1 bis C1, koranisches und modernes Hocharabisch, mit den 500 häufigsten Koranwörtern.",
  cardLead: "Lernen Sie die Sprache selbst: Grammatik, Wurzeln, Rhetorik und die häufigsten Koranwörter, A1 bis C1.",
  start: "Beginnen", continue: "Weiter", unit: "Einheit {n}", lessonsDone: "{d} von {n} Lektionen", locked: "Schließen Sie zuerst die vorige Lektion ab", free: "Kostenlos", pro: "Pro",
  goal: "Tagesziel", goalN: "{n} pro Tag", today: "Heute: {d} von {n} Lektionen", goalMet: "Tagesziel erreicht", streak: "{n} Tage in Folge",
  roots: "Wurzel-Explorer", rootsLead: "Geben Sie eine Wurzel ein und sehen Sie ihre Wortfamilie mit einem Beispielvers aus dem Koran.", rootPh: "Wurzel, z. B. ع ل م", rootNone: "Zu dieser Wurzel gibt es im Kurswortschatz noch keine Wörter.", rootPick: "Häufige Wurzeln", inQuran: "Im Koran",
  certs: "Zertifikate", certTitle: "Zertifikat {level}", certNote: "App-Zertifikat von Quran Masterclass, kein offizielles GER-Zertifikat.", certFor: "hat die Stufe {level} des Arabisch-Sprachkurses abgeschlossen", certLocked: "Bestehen Sie die Einheitentests bis Einheit {n}", certYou: "Sie",
  unlockKicker: "Einheit 1 geschafft", unlockTitle: "Weiter von A1 bis C1", unlockLead: "Neun weitere Einheiten führen Sie von der Vergangenheit über die Verbstämme und den Iʿrāb bis zum verstehenden Lesen ganzer Verse.", unlockList1: "119 weitere Lektionen und 16 Einheitentests", unlockList2: "Grammatik in echten Versen erkennen", unlockList3: "App-Zertifikate A1, A2, B1 und B2", unlockCta: "Mit Pro freischalten",
  check: "Prüfen", next: "Weiter", right: "Richtig", wrong: "Nicht ganz. Richtig ist:", listen: "Anhören", isNew: "Neu",
  chooseMeaning: "Was bedeutet das?", chooseArabic: "Wie heißt das auf Arabisch?", listenPick: "Hören Sie zu und wählen Sie, was Sie hören", tilesQ: "Bauen Sie den Satz", tilesHint: "Tippen Sie die Wörter der Reihe nach an. Das erste Wort steht rechts.", reset: "Zurücksetzen",
  typeQ: "Schreiben Sie es auf Arabisch", typeDict: "Hören Sie zu und schreiben Sie, was Sie hören", typeHint: "Vokalzeichen sind freiwillig.", typePad: "Buchstaben", del: "Löschen", space: "Leerzeichen",
  speakQ: "Sprechen Sie es laut", speakStart: "Beginnen", speakStop: "Beenden", speakHeard: "{n} von {total} Wörtern gehört", speakNA: "Die Spracherkennung für Arabisch ist auf diesem Gerät nicht verfügbar. Sprechen Sie trotzdem laut und fahren Sie fort.", skip: "Überspringen",
  conjQ: "Wählen Sie die richtige Form", spotLoading: "Der Vers wird geladen…", spotOffline: "Der Vers konnte nicht geladen werden.", spotHint: "Tippen Sie auf das Wort oder die Wörter und prüfen Sie dann.",
  dialogue: "Lesen und hören", explain: "Erklärung", startEx: "Übungen beginnen",
  complete: "Lektion geschafft", testPassed: "Einheitentest bestanden", almost: "Fast geschafft", needPass: "Ab {p} % gilt der Test als bestanden.", score: "{p} % beim ersten Versuch richtig", retry: "Noch einmal üben", toMap: "Zurück zum Pfad", nextLesson: "Nächste Lektion", wordsAdded: "{n} Wörter zu Ihren Lernkarten hinzugefügt", quit: "Beenden", openRoots: "Wurzel-Explorer öffnen", share: "Teilen",
};
const ar: T = {
  kicker: "دورة اللغة العربية", title: "افهم العربية", lead: "من جملتك الأولى إلى قراءة القرآن بفهم: عشر وحدات من A1 إلى B2، بالعربية القرآنية والفصحى المعاصرة.",
  cardLead: "تعلّم اللغة نفسها: النحو والجذور وأكثر كلمات القرآن تكرارًا.",
  start: "ابدأ", continue: "تابع", unit: "الوحدة {n}", lessonsDone: "{d} من {n} دروس", locked: "أكمل الدرس السابق أولًا", free: "مجاني", pro: "Pro",
  goal: "الهدف اليومي", goalN: "{n} يوميًا", today: "اليوم: {d} من {n} دروس", goalMet: "تحقق الهدف اليومي", streak: "{n} أيام متتالية",
  roots: "مستكشف الجذور", rootsLead: "أدخل جذرًا وشاهد أسرة كلماته مع آية مثال من القرآن.", rootPh: "جذر، مثل ع ل م", rootNone: "لا توجد كلمات لهذا الجذر في مفردات الدورة بعد.", rootPick: "جذور شائعة", inQuran: "في القرآن",
  certs: "الشهادات", certTitle: "شهادة {level}", certNote: "شهادة من تطبيق Quran Masterclass، وليست شهادة رسمية للإطار الأوروبي.", certFor: "أتمّ المستوى {level} من دورة اللغة العربية", certLocked: "انجح في اختبارات الوحدات حتى الوحدة {n}", certYou: "أنت",
  unlockKicker: "أتممت الوحدة الأولى", unlockTitle: "واصل من A1 إلى B2", unlockLead: "تسع وحدات أخرى من الماضي إلى الأوزان والإعراب وقراءة الآيات بفهم.", unlockList1: "63 درسًا آخر و9 اختبارات", unlockList2: "تمييز النحو في آيات حقيقية", unlockList3: "شهادات التطبيق A1 وA2 وB1 وB2", unlockCta: "افتح مع Pro",
  check: "تحقق", next: "تابع", right: "صحيح", wrong: "ليس تمامًا. الصحيح:", listen: "استمع", isNew: "جديد",
  chooseMeaning: "ما معنى هذا؟", chooseArabic: "ما هذا بالعربية؟", listenPick: "استمع واختر ما تسمعه", tilesQ: "رتّب الجملة", tilesHint: "اضغط الكلمات بالترتيب؛ الكلمة الأولى على اليمين.", reset: "إعادة",
  typeQ: "اكتبها بالعربية", typeDict: "استمع واكتب ما تسمعه", typeHint: "الحركات اختيارية.", typePad: "الحروف", del: "حذف", space: "مسافة",
  speakQ: "قلها بصوت عالٍ", speakStart: "ابدأ", speakStop: "إنهاء", speakHeard: "سُمعت {n} من {total} كلمات", speakNA: "التعرف على الكلام بالعربية غير متاح على هذا الجهاز. قلها بصوت عالٍ وتابع.", skip: "تخطَّ",
  conjQ: "اختر الصيغة الصحيحة", spotLoading: "جارٍ تحميل الآية…", spotOffline: "تعذّر تحميل الآية.", spotHint: "اضغط على الكلمة أو الكلمات ثم تحقق.",
  dialogue: "اقرأ واستمع", explain: "الشرح", startEx: "ابدأ التمارين",
  complete: "أتممت الدرس", testPassed: "نجحت في اختبار الوحدة", almost: "اقتربت", needPass: "يُعدّ الاختبار ناجحًا من {p}٪.", score: "{p}٪ صحيحة من المحاولة الأولى", retry: "تدرّب مرة أخرى", toMap: "العودة إلى المسار", nextLesson: "الدرس التالي", wordsAdded: "أضيفت {n} كلمات إلى بطاقات المراجعة", quit: "خروج", openRoots: "افتح مستكشف الجذور", share: "مشاركة",
};
const tr: T = {
  kicker: "Arapça dil kursu", title: "Arapçayı anlayın", lead: "İlk cümlenizden Kur'an'ı anlayarak okumaya: A1'den B2'ye on ünite, Kur'an Arapçası ve modern fasih Arapça.",
  cardLead: "Dilin kendisini öğrenin: dil bilgisi, kökler ve en sık Kur'an kelimeleri.",
  start: "Başlayın", continue: "Devam", unit: "Ünite {n}", lessonsDone: "{n} dersten {d}", locked: "Önce önceki dersi bitirin", free: "Ücretsiz", pro: "Pro",
  goal: "Günlük hedef", goalN: "Günde {n}", today: "Bugün: {n} dersten {d}", goalMet: "Günlük hedefe ulaşıldı", streak: "{n} gün üst üste",
  roots: "Kök kâşifi", rootsLead: "Bir kök girin, kelime ailesini Kur'an'dan bir örnek ayetle görün.", rootPh: "Kök, örn. ع ل م", rootNone: "Bu kökle kurs sözlüğünde henüz kelime yok.", rootPick: "Sık kökler", inQuran: "Kur'an'da",
  certs: "Sertifikalar", certTitle: "{level} sertifikası", certNote: "Quran Masterclass uygulama sertifikası; resmî bir AOÇ sertifikası değildir.", certFor: "Arapça dil kursunun {level} seviyesini tamamladı", certLocked: "Ünite {n}'e kadar ünite testlerini geçin", certYou: "Siz",
  unlockKicker: "Ünite 1 tamamlandı", unlockTitle: "A1'den B2'ye devam edin", unlockLead: "Dokuz ünite daha sizi geçmiş zamandan bablara, i'raba ve ayetleri anlayarak okumaya taşır.", unlockList1: "63 ders ve 9 ünite testi daha", unlockList2: "Gerçek ayetlerde dil bilgisi", unlockList3: "A1, A2, B1 ve B2 uygulama sertifikaları", unlockCta: "Pro ile açın",
  check: "Kontrol", next: "Devam", right: "Doğru", wrong: "Tam değil. Doğrusu:", listen: "Dinleyin", isNew: "Yeni",
  chooseMeaning: "Bunun anlamı ne?", chooseArabic: "Bunun Arapçası hangisi?", listenPick: "Dinleyin ve duyduğunuzu seçin", tilesQ: "Cümleyi kurun", tilesHint: "Kelimelere sırayla dokunun. İlk kelime sağdadır.", reset: "Sıfırla",
  typeQ: "Arapça yazın", typeDict: "Dinleyin ve duyduğunuzu yazın", typeHint: "Harekeler isteğe bağlıdır.", typePad: "Harfler", del: "Sil", space: "Boşluk",
  speakQ: "Sesli söyleyin", speakStart: "Başlayın", speakStop: "Bitir", speakHeard: "{total} kelimeden {n} duyuldu", speakNA: "Arapça ses tanıma bu cihazda yok. Yine de sesli söyleyip devam edin.", skip: "Atla",
  conjQ: "Doğru çekimi seçin", spotLoading: "Ayet yükleniyor…", spotOffline: "Ayet yüklenemedi.", spotHint: "Kelimeye veya kelimelere dokunup kontrol edin.",
  dialogue: "Okuyun ve dinleyin", explain: "Açıklama", startEx: "Alıştırmalara başlayın",
  complete: "Ders tamamlandı", testPassed: "Ünite testi geçildi", almost: "Az kaldı", needPass: "Test %{p} ile geçilir.", score: "İlk denemede %{p} doğru", retry: "Tekrar çalışın", toMap: "Yola dönün", nextLesson: "Sonraki ders", wordsAdded: "{n} kelime tekrar kartlarınıza eklendi", quit: "Çık", openRoots: "Kök kâşifini açın", share: "Paylaş",
};
const ur: T = {
  kicker: "عربی زبان کورس", title: "عربی سمجھیں", lead: "پہلے جملے سے قرآن سمجھ کر پڑھنے تک: A1 سے B2 تک دس یونٹ، قرآنی اور جدید فصیح عربی۔",
  cardLead: "زبان خود سیکھیں: قواعد، مادے اور قرآن کے سب سے عام الفاظ۔",
  start: "شروع کریں", continue: "جاری رکھیں", unit: "یونٹ {n}", lessonsDone: "{n} میں سے {d} اسباق", locked: "پہلے پچھلا سبق مکمل کریں", free: "مفت", pro: "Pro",
  goal: "روزانہ ہدف", goalN: "روزانہ {n}", today: "آج: {n} میں سے {d} اسباق", goalMet: "روزانہ ہدف پورا", streak: "مسلسل {n} دن",
  roots: "مادہ ایکسپلورر", rootsLead: "کوئی مادہ لکھیں اور قرآن کی مثال کے ساتھ اس کے الفاظ دیکھیں۔", rootPh: "مادہ، مثلاً ع ل م", rootNone: "اس مادے کے الفاظ ابھی کورس میں نہیں۔", rootPick: "عام مادے", inQuran: "قرآن میں",
  certs: "سرٹیفکیٹ", certTitle: "{level} سرٹیفکیٹ", certNote: "Quran Masterclass ایپ کا سرٹیفکیٹ، سرکاری CEFR سرٹیفکیٹ نہیں۔", certFor: "نے عربی کورس کا درجہ {level} مکمل کیا", certLocked: "یونٹ {n} تک کے ٹیسٹ پاس کریں", certYou: "آپ",
  unlockKicker: "یونٹ 1 مکمل", unlockTitle: "A1 سے B2 تک آگے بڑھیں", unlockLead: "نو مزید یونٹ: ماضی، ابواب، اعراب اور آیات کو سمجھ کر پڑھنا۔", unlockList1: "63 مزید اسباق اور 9 ٹیسٹ", unlockList2: "حقیقی آیات میں قواعد پہچاننا", unlockList3: "A1، A2، B1، B2 ایپ سرٹیفکیٹ", unlockCta: "Pro سے کھولیں",
  check: "جانچیں", next: "آگے", right: "درست", wrong: "مکمل درست نہیں۔ درست:", listen: "سنیں", isNew: "نیا",
  chooseMeaning: "اس کا مطلب کیا ہے؟", chooseArabic: "اس کی عربی کیا ہے؟", listenPick: "سنیں اور جو سنا وہ چنیں", tilesQ: "جملہ بنائیں", tilesHint: "الفاظ کو ترتیب سے ٹیپ کریں۔ پہلا لفظ دائیں طرف۔", reset: "دوبارہ",
  typeQ: "عربی میں لکھیں", typeDict: "سنیں اور لکھیں", typeHint: "حرکات اختیاری ہیں۔", typePad: "حروف", del: "مٹائیں", space: "خالی جگہ",
  speakQ: "بلند آواز سے کہیں", speakStart: "شروع کریں", speakStop: "ختم", speakHeard: "{total} میں سے {n} الفاظ سنے گئے", speakNA: "اس آلے پر عربی پہچان دستیاب نہیں۔ پھر بھی بلند آواز سے کہیں اور آگے بڑھیں۔", skip: "چھوڑیں",
  conjQ: "درست صیغہ چنیں", spotLoading: "آیت لوڈ ہو رہی ہے…", spotOffline: "آیت لوڈ نہیں ہو سکی۔", spotHint: "لفظ یا الفاظ ٹیپ کریں، پھر جانچیں۔",
  dialogue: "پڑھیں اور سنیں", explain: "وضاحت", startEx: "مشقیں شروع کریں",
  complete: "سبق مکمل", testPassed: "یونٹ ٹیسٹ پاس", almost: "تقریباً", needPass: "{p}٪ سے ٹیسٹ پاس ہوتا ہے۔", score: "پہلی کوشش میں {p}٪ درست", retry: "دوبارہ مشق", toMap: "راستے پر واپس", nextLesson: "اگلا سبق", wordsAdded: "{n} الفاظ آپ کے کارڈز میں شامل", quit: "بند کریں", openRoots: "مادہ ایکسپلورر کھولیں", share: "شیئر کریں",
};
const fa: T = {
  ...en,
  kicker: "دورهٔ زبان عربی", title: "عربی را بفهمید", lead: "از نخستین جمله تا خواندن قرآن با فهم: ده واحد از A1 تا B2.", cardLead: "خود زبان را بیاموزید: دستور، ریشه‌ها و پرکاربردترین واژه‌های قرآن.",
  start: "شروع کنید", continue: "ادامه", unit: "واحد {n}", lessonsDone: "{d} از {n} درس", locked: "ابتدا درس قبلی را تمام کنید", free: "رایگان",
  goal: "هدف روزانه", goalN: "{n} در روز", today: "امروز: {d} از {n} درس", goalMet: "هدف روزانه انجام شد", streak: "{n} روز پیاپی",
  roots: "کاوشگر ریشه", rootsLead: "یک ریشه وارد کنید و خانوادهٔ واژه‌هایش را ببینید.", rootPh: "ریشه، مثلاً ع ل م", rootNone: "هنوز واژه‌ای با این ریشه نیست.", rootPick: "ریشه‌های پرکاربرد", inQuran: "در قرآن",
  certs: "گواهی‌ها", certTitle: "گواهی {level}", certNote: "گواهی برنامهٔ Quran Masterclass، نه گواهی رسمی CEFR.", certFor: "سطح {level} دورهٔ زبان عربی را به پایان رساند", certLocked: "آزمون‌ها را تا واحد {n} قبول شوید", certYou: "شما",
  unlockKicker: "واحد ۱ تمام شد", unlockTitle: "ادامه از A1 تا B2", unlockLead: "نه واحد دیگر تا خواندن آیات با فهم.", unlockCta: "باز کردن با Pro",
  check: "بررسی", next: "ادامه", right: "درست", wrong: "نه کاملاً. درست:", listen: "گوش دهید", isNew: "جدید",
  chooseMeaning: "معنای این چیست؟", chooseArabic: "عربی این کدام است؟", listenPick: "گوش دهید و انتخاب کنید", tilesQ: "جمله را بسازید", typeQ: "به عربی بنویسید", speakQ: "بلند بگویید", conjQ: "صیغهٔ درست را انتخاب کنید", skip: "رد شدن",
  complete: "درس تمام شد", retry: "دوباره تمرین کنید", toMap: "بازگشت به مسیر", nextLesson: "درس بعدی", quit: "خروج", explain: "توضیح", startEx: "شروع تمرین‌ها",
};
const ps: T = {
  ...en,
  kicker: "د عربي ژبې کورس", title: "عربي پوه شئ", lead: "له لومړۍ جملې تر قرآن په پوهې لوستلو: له A1 تر B2 لس واحدونه.", cardLead: "پخپله ژبه زده کړئ: ګرامر، ریښې او د قرآن ډېر عام لغات.",
  start: "پیل کړئ", continue: "دوام", unit: "واحد {n}", free: "وړیا", goal: "ورځنی هدف", streak: "{n} ورځې پرله پسې",
  roots: "د ریښو لټوونکی", certs: "سندونه", certNote: "د Quran Masterclass اپ سند، رسمي CEFR سند نه دی.", unlockCta: "د Pro سره پرانیزئ",
  check: "وګورئ", next: "مخکې", right: "سم", wrong: "بشپړ سم نه دی. سم:", listen: "واورئ", complete: "درس بشپړ شو", toMap: "لار ته ستنېدل", nextLesson: "بل درس", quit: "وتل",
};
const fr: T = {
  kicker: "Cours de langue arabe", title: "Comprendre l'arabe", lead: "De votre première phrase à la lecture du Coran avec compréhension : dix unités de A1 à B2, arabe coranique et standard moderne.",
  cardLead: "Apprenez la langue elle-même : grammaire, racines et mots les plus fréquents du Coran.",
  start: "Commencer", continue: "Continuer", unit: "Unité {n}", lessonsDone: "{d} leçons sur {n}", locked: "Terminez d'abord la leçon précédente", free: "Gratuit", pro: "Pro",
  goal: "Objectif du jour", goalN: "{n} par jour", today: "Aujourd'hui : {d} leçons sur {n}", goalMet: "Objectif du jour atteint", streak: "{n} jours d'affilée",
  roots: "Explorateur de racines", rootsLead: "Saisissez une racine et voyez sa famille de mots, avec un verset d'exemple.", rootPh: "Racine, p. ex. ع ل م", rootNone: "Aucun mot de cette racine dans le vocabulaire du cours pour l'instant.", rootPick: "Racines fréquentes", inQuran: "Dans le Coran",
  certs: "Certificats", certTitle: "Certificat {level}", certNote: "Certificat de l'application Quran Masterclass, pas un certificat CECRL officiel.", certFor: "a terminé le niveau {level} du cours d'arabe", certLocked: "Réussissez les tests jusqu'à l'unité {n}", certYou: "Vous",
  unlockKicker: "Unité 1 terminée", unlockTitle: "Continuez de A1 à B2", unlockLead: "Neuf unités de plus : passé, formes verbales, iʿrāb et lecture des versets avec compréhension.", unlockList1: "63 leçons et 9 tests de plus", unlockList2: "Repérer la grammaire dans de vrais versets", unlockList3: "Certificats A1, A2, B1 et B2", unlockCta: "Débloquer avec Pro",
  check: "Vérifier", next: "Continuer", right: "Correct", wrong: "Pas tout à fait. La bonne réponse :", listen: "Écouter", isNew: "Nouveau",
  chooseMeaning: "Que signifie ceci ?", chooseArabic: "Comment dit-on cela en arabe ?", listenPick: "Écoutez et choisissez ce que vous entendez", tilesQ: "Construisez la phrase", tilesHint: "Touchez les mots dans l'ordre. Le premier mot est à droite.", reset: "Réinitialiser",
  typeQ: "Écrivez-le en arabe", typeDict: "Écoutez et écrivez", typeHint: "Les voyelles sont facultatives.", typePad: "Lettres", del: "Effacer", space: "Espace",
  speakQ: "Dites-le à voix haute", speakStart: "Commencer", speakStop: "Terminer", speakHeard: "{n} mots sur {total} entendus", speakNA: "La reconnaissance vocale arabe n'est pas disponible sur cet appareil. Dites-le quand même et continuez.", skip: "Passer",
  conjQ: "Choisissez la bonne forme", spotLoading: "Chargement du verset…", spotOffline: "Le verset n'a pas pu être chargé.", spotHint: "Touchez le ou les mots, puis vérifiez.",
  dialogue: "Lire et écouter", explain: "Explication", startEx: "Commencer les exercices",
  complete: "Leçon terminée", testPassed: "Test de l'unité réussi", almost: "Presque", needPass: "Le test est réussi à partir de {p} %.", score: "{p} % juste du premier coup", retry: "S'exercer encore", toMap: "Retour au parcours", nextLesson: "Leçon suivante", wordsAdded: "{n} mots ajoutés à vos cartes", quit: "Quitter", openRoots: "Ouvrir l'explorateur de racines", share: "Partager",
};
const es: T = {
  ...en,
  kicker: "Curso de lengua árabe", title: "Entienda el árabe", lead: "De su primera frase a leer el Corán comprendiendo: diez unidades de A1 a B2.", cardLead: "Aprenda la lengua: gramática, raíces y las palabras más frecuentes del Corán.",
  start: "Empezar", continue: "Continuar", unit: "Unidad {n}", lessonsDone: "{d} de {n} lecciones", locked: "Termine primero la lección anterior", free: "Gratis",
  goal: "Meta diaria", goalN: "{n} al día", today: "Hoy: {d} de {n} lecciones", goalMet: "Meta diaria cumplida", streak: "{n} días seguidos",
  roots: "Explorador de raíces", rootsLead: "Escriba una raíz y vea su familia de palabras con un versículo de ejemplo.", rootPick: "Raíces frecuentes", inQuran: "En el Corán",
  certs: "Certificados", certTitle: "Certificado {level}", certNote: "Certificado de la app Quran Masterclass, no es un certificado MCER oficial.", certFor: "ha completado el nivel {level} del curso de árabe", certYou: "Usted",
  unlockKicker: "Unidad 1 completada", unlockTitle: "Siga de A1 a B2", unlockCta: "Desbloquear con Pro",
  check: "Comprobar", next: "Continuar", right: "Correcto", wrong: "No del todo. Lo correcto:", listen: "Escuchar", isNew: "Nuevo",
  chooseMeaning: "¿Qué significa esto?", chooseArabic: "¿Cómo se dice en árabe?", tilesQ: "Construya la frase", typeQ: "Escríbalo en árabe", speakQ: "Dígalo en voz alta", conjQ: "Elija la forma correcta", skip: "Omitir",
  complete: "Lección completada", retry: "Practicar de nuevo", toMap: "Volver al camino", nextLesson: "Siguiente lección", quit: "Salir", explain: "Explicación", startEx: "Empezar ejercicios",
};
const id: T = {
  kicker: "Kursus bahasa Arab", title: "Memahami bahasa Arab", lead: "Dari kalimat pertama hingga membaca Al-Qur'an dengan paham: sepuluh unit dari A1 sampai B2, bahasa Arab Qur'ani dan fusha modern.",
  cardLead: "Pelajari bahasanya: tata bahasa, akar kata dan kata Al-Qur'an yang paling sering.",
  start: "Mulai", continue: "Lanjutkan", unit: "Unit {n}", lessonsDone: "{d} dari {n} pelajaran", locked: "Selesaikan dulu pelajaran sebelumnya", free: "Gratis", pro: "Pro",
  goal: "Target harian", goalN: "{n} per hari", today: "Hari ini: {d} dari {n} pelajaran", goalMet: "Target harian tercapai", streak: "{n} hari berturut-turut",
  roots: "Penjelajah akar kata", rootsLead: "Masukkan akar kata dan lihat keluarga katanya dengan contoh ayat.", rootPh: "Akar, mis. ع ل م", rootNone: "Belum ada kata dengan akar ini di kosakata kursus.", rootPick: "Akar yang sering", inQuran: "Dalam Al-Qur'an",
  certs: "Sertifikat", certTitle: "Sertifikat {level}", certNote: "Sertifikat aplikasi Quran Masterclass, bukan sertifikat CEFR resmi.", certFor: "telah menyelesaikan level {level} kursus bahasa Arab", certLocked: "Lulus tes unit hingga unit {n}", certYou: "Anda",
  unlockKicker: "Unit 1 selesai", unlockTitle: "Lanjutkan dari A1 ke B2", unlockLead: "Sembilan unit lagi: lampau, bentuk kata kerja, i'rab, dan membaca ayat dengan paham.", unlockList1: "63 pelajaran dan 9 tes unit lagi", unlockList2: "Mengenali tata bahasa di ayat asli", unlockList3: "Sertifikat aplikasi A1, A2, B1, B2", unlockCta: "Buka dengan Pro",
  check: "Periksa", next: "Lanjut", right: "Benar", wrong: "Belum tepat. Yang benar:", listen: "Dengarkan", isNew: "Baru",
  chooseMeaning: "Apa artinya?", chooseArabic: "Apa bahasa Arabnya?", listenPick: "Dengarkan dan pilih yang Anda dengar", tilesQ: "Susun kalimatnya", tilesHint: "Ketuk kata-kata secara berurutan. Kata pertama di kanan.", reset: "Ulang",
  typeQ: "Tulis dalam bahasa Arab", typeDict: "Dengarkan dan tulis", typeHint: "Harakat tidak wajib.", typePad: "Huruf", del: "Hapus", space: "Spasi",
  speakQ: "Ucapkan dengan keras", speakStart: "Mulai", speakStop: "Selesai", speakHeard: "{n} dari {total} kata terdengar", speakNA: "Pengenalan suara bahasa Arab tidak tersedia di perangkat ini. Tetap ucapkan dan lanjutkan.", skip: "Lewati",
  conjQ: "Pilih bentuk yang benar", spotLoading: "Memuat ayat…", spotOffline: "Ayat tidak dapat dimuat.", spotHint: "Ketuk kata atau kata-kata, lalu periksa.",
  dialogue: "Baca dan dengarkan", explain: "Penjelasan", startEx: "Mulai latihan",
  complete: "Pelajaran selesai", testPassed: "Tes unit lulus", almost: "Hampir", needPass: "Tes lulus mulai {p} %.", score: "{p} % benar pada percobaan pertama", retry: "Latihan lagi", toMap: "Kembali ke jalur", nextLesson: "Pelajaran berikutnya", wordsAdded: "{n} kata ditambahkan ke kartu Anda", quit: "Keluar", openRoots: "Buka penjelajah akar kata", share: "Bagikan",
};
const ms: T = {
  ...en,
  kicker: "Kursus bahasa Arab", title: "Fahami bahasa Arab", lead: "Dari ayat pertama hingga membaca al-Quran dengan faham: sepuluh unit dari A1 hingga B2.", cardLead: "Pelajari bahasanya: tatabahasa, akar kata dan perkataan al-Quran yang paling kerap.",
  start: "Mula", continue: "Teruskan", unit: "Unit {n}", free: "Percuma", goal: "Sasaran harian", streak: "{n} hari berturut-turut",
  roots: "Penjelajah akar kata", certs: "Sijil", certNote: "Sijil aplikasi Quran Masterclass, bukan sijil CEFR rasmi.", unlockCta: "Buka dengan Pro",
  check: "Semak", next: "Teruskan", right: "Betul", wrong: "Belum tepat. Yang betul:", listen: "Dengar", complete: "Pelajaran selesai", toMap: "Kembali ke laluan", nextLesson: "Pelajaran seterusnya", quit: "Keluar",
};
const bn: T = {
  ...en,
  kicker: "আরবি ভাষা কোর্স", title: "আরবি বুঝুন", lead: "প্রথম বাক্য থেকে বুঝে কুরআন পড়া পর্যন্ত: A1 থেকে B2 পর্যন্ত দশটি ইউনিট।", cardLead: "ভাষাটিই শিখুন: ব্যাকরণ, মূল ধাতু ও কুরআনের সবচেয়ে বেশি আসা শব্দ।",
  start: "শুরু করুন", continue: "চালিয়ে যান", unit: "ইউনিট {n}", free: "বিনামূল্যে", goal: "দৈনিক লক্ষ্য", streak: "টানা {n} দিন",
  roots: "ধাতু অনুসন্ধান", certs: "সনদ", certNote: "Quran Masterclass অ্যাপের সনদ, সরকারি CEFR সনদ নয়।", unlockCta: "Pro দিয়ে খুলুন",
  check: "যাচাই", next: "এগিয়ে যান", right: "সঠিক", wrong: "পুরোপুরি নয়। সঠিক:", listen: "শুনুন", complete: "পাঠ সম্পন্ন", toMap: "পথে ফিরুন", nextLesson: "পরের পাঠ", quit: "বন্ধ",
};
const ru: T = {
  ...en,
  kicker: "Курс арабского языка", title: "Понимать арабский", lead: "От первой фразы до чтения Корана с пониманием: десять разделов от A1 до B2.", cardLead: "Изучайте сам язык: грамматику, корни и самые частые слова Корана.",
  start: "Начать", continue: "Продолжить", unit: "Раздел {n}", lessonsDone: "{d} из {n} уроков", free: "Бесплатно", goal: "Цель на день", streak: "{n} дн. подряд",
  roots: "Обозреватель корней", certs: "Сертификаты", certNote: "Сертификат приложения Quran Masterclass, не официальный сертификат CEFR.", unlockCta: "Открыть с Pro",
  check: "Проверить", next: "Далее", right: "Верно", wrong: "Не совсем. Правильно:", listen: "Слушать", complete: "Урок пройден", retry: "Повторить", toMap: "К маршруту", nextLesson: "Следующий урок", quit: "Выйти",
};
const zh: T = {
  ...en,
  kicker: "阿拉伯语课程", title: "理解阿拉伯语", lead: "从第一句话到理解地诵读古兰经：A1 至 B2 共十个单元。", cardLead: "学习语言本身：语法、词根和古兰经最常见的词汇。",
  start: "开始", continue: "继续", unit: "第 {n} 单元", free: "免费", goal: "每日目标", streak: "连续 {n} 天",
  roots: "词根探索", certs: "证书", certNote: "Quran Masterclass 应用证书，非官方 CEFR 证书。", unlockCta: "通过 Pro 解锁",
  check: "检查", next: "继续", right: "正确", wrong: "不完全对。正确答案：", listen: "收听", complete: "课程完成", toMap: "返回路径", nextLesson: "下一课", quit: "退出",
};

const TABLE = { en, de, ar, tr, ur, fa, ps, fr, es, id, ms, bn, ru, zh };
export type LangKey = keyof T;
export function useLT() {
  const { lang } = useLang();
  return useCallback((k: LangKey, p?: Record<string, string | number>) => {
    const s = moduleText("arabicLang", TABLE, lang)[k] ?? en[k];
    return p ? s.replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : s;
  }, [lang]);
}
