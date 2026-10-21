// SEO texts of the Shams Method 2.0 pages (server-safe). German (Sie-form), English and Arabic; other languages use
// English. {s} is a surah name where the page has one.
type M = { title: string; description: string };
export type S2Page = "method" | "wird" | "quality" | "mutashabihat" | "weak" | "tadabbur" | "darajat" | "ard" | "week" | "handbook" | "welcome" | "next" | "talaqqi" | "teacher";
const B = " | Quran Masterclass";
const T: Record<"en" | "de" | "ar", Record<S2Page, M>> = {
  en: {
    method: { title: `Shams Method 2.0 – the classical hifz system with learning science${B}`, description: "Sabaq, sabqi and manzil every day, hifz quality of every page, similar verses, talaqqi with a master reciter, grades of hifz and recitation tests – computed from what you have memorised. Free." },
    wird: { title: `Today's wird – sabaq, sabqi, manzil${B}`, description: "Your daily wird of new verses, the recent portion and the long-term review, planned from your memorisation." },
    quality: { title: `Hifz quality – heatmap of every page, surah and juz${B}`, description: "The itqan of your memorisation over the 604 pages of the mushaf, the 114 surahs or the 30 ajza, with the weakest verses." },
    mutashabihat: { title: `Mutashabihat – trainer for similar verses of the Quran${B}`, description: "Verses with almost the same wording side by side, the differing words marked, and an interleaved drill to tell them apart. Free." },
    weak: { title: `Weak spots – tathbit practice${B}`, description: "The verses and words with repeated errors, collected automatically and practised until they hold." },
    tadabbur: { title: `Tadabbur and maqasid of Surah {s}${B}`, description: "What Surah {s} wants to teach: central theme, setting, structure, lessons, questions for reflection and tafsir of each verse." },
    darajat: { title: `Darajat al-hifz – the grades of memorisation${B}`, description: "Seven grades of hifz with their demands: prompts, pass marks, pace, manzil cycle and the weekly and monthly recitation tests." },
    ard: { title: `ʿArd – recitation test from memory${B}`, description: "The classical teacher's question: a verse from your memorised portion is given – continue from here." },
    week: { title: `Weekly review – murajaʿat al-usbuʿ${B}`, description: "Your week of memorisation in review: consistency, new and reviewed verses, quality and what to focus on next." },
    handbook: { title: `Shams Method handbook – principles, practice, grades and terms${B}`, description: "The principles of the Shams Method from the madrasa and learning science, the daily practice, the grades of hifz and a glossary of terms, with sources." },
    welcome: { title: `Welcome to the Shams Method${B}`, description: "Eight principles of memorising the Quran in two minutes, then your daily time." },
    next: { title: `Next steps – Shams Method${B}`, description: "The next meaningful steps after every surah, juz and test." },
    talaqqi: { title: `Talaqqi – recite phrase by phrase with a master reciter${B}`, description: "Listen phrase by phrase, recite from memory, check the words and compare your recording with the reciter." },
    teacher: { title: `Teacher view – share your hifz progress${B}`, description: "Share your wird, quality and streak with your teacher through a code, read-only, without an account." },
  },
  de: {
    method: { title: `Shams-Methode 2.0 – das klassische Hifz-System mit Lernwissenschaft${B}`, description: "Sabaq, Sabqi und Manzil jeden Tag, die Hifz-Qualität jeder Seite, ähnliche Verse, Talaqqi mit einem Meister-Rezitator, Hifz-Stufen und Rezitationsprüfungen – berechnet aus dem, was Sie auswendig können. Kostenlos." },
    wird: { title: `Wird von heute – Sabaq, Sabqi, Manzil${B}`, description: "Ihr täglicher Wird aus neuen Versen, dem jüngsten Abschnitt und der langfristigen Wiederholung, geplant aus Ihrem Hifz." },
    quality: { title: `Hifz-Qualität – Heatmap jeder Seite, Sure und jedes Dschuz${B}`, description: "Der Itqan Ihres Hifz über die 604 Seiten des Mushaf, die 114 Suren oder die 30 Adschza, mit den schwächsten Versen." },
    mutashabihat: { title: `Mutaschabihat – Training für ähnliche Verse des Quran${B}`, description: "Verse mit fast gleichem Wortlaut nebeneinander, die Unterschiede markiert, und ein gemischtes Training, um sie zu unterscheiden. Kostenlos." },
    weak: { title: `Schwachstellen – Tathbit-Übung${B}`, description: "Die Verse und Wörter mit wiederholten Fehlern, automatisch gesammelt und geübt, bis sie sitzen." },
    tadabbur: { title: `Tadabbur und Maqasid der Sure {s}${B}`, description: "Was die Sure {s} lehren will: Kernthema, Hintergrund, Aufbau, Lehren, Fragen zum Nachdenken und Tafsir zu jedem Vers." },
    darajat: { title: `Daradschat al-Hifz – die Stufen des Auswendiglernens${B}`, description: "Sieben Hifz-Stufen mit ihren Anforderungen: Hilfen, Bestehensgrenzen, Tempo, Manzil-Zyklus und die wöchentlichen und monatlichen Rezitationsprüfungen." },
    ard: { title: `ʿArd – Rezitationsprüfung aus dem Gedächtnis${B}`, description: "Die klassische Frage der Lehrkraft: Ein Vers aus Ihrem Hifz wird genannt – rezitieren Sie von hier weiter." },
    week: { title: `Wochenrückblick – Muradschaʿat al-Usbuʿ${B}`, description: "Ihre Hifz-Woche im Rückblick: Beständigkeit, neue und wiederholte Verse, Qualität und der Schwerpunkt der nächsten Woche." },
    handbook: { title: `Handbuch der Shams-Methode – Prinzipien, Praxis, Stufen und Begriffe${B}`, description: "Die Prinzipien der Shams-Methode aus der Madrasa und der Lernwissenschaft, die tägliche Praxis, die Hifz-Stufen und ein Glossar der Begriffe, mit Quellen." },
    welcome: { title: `Willkommen bei der Shams-Methode${B}`, description: "Acht Prinzipien des Quran-Auswendiglernens in zwei Minuten, dann Ihre tägliche Zeit." },
    next: { title: `Nächste Schritte – Shams-Methode${B}`, description: "Die nächsten sinnvollen Schritte nach jeder Sure, jedem Dschuz und jeder Prüfung." },
    talaqqi: { title: `Talaqqi – Satz für Satz mit einem Meister-Rezitator${B}`, description: "Hören Sie Satz für Satz, rezitieren Sie aus dem Gedächtnis, prüfen Sie die Wörter und vergleichen Sie Ihre Aufnahme mit dem Rezitator." },
    teacher: { title: `Ansicht für Lehrkräfte – Hifz-Fortschritt teilen${B}`, description: "Teilen Sie Wird, Qualität und Serie per Code mit Ihrer Lehrkraft, nur lesend und ohne Konto." },
  },
  ar: {
    method: { title: `منهج شمس 2.0 – نظام الحفظ الكلاسيكي مع علم التعلّم${B}`, description: "السبق والسبقي والمنزل كل يوم، وجودة الحفظ لكل صفحة، والمتشابهات، والتلقي مع قارئ متقن، ودرجات الحفظ واختبارات العرض – محسوبة مما تحفظونه. مجانًا." },
    wird: { title: `ورد اليوم – السبق والسبقي والمنزل${B}`, description: "وردكم اليومي من الآيات الجديدة والمقطع القريب والمراجعة البعيدة، مخطط من حفظكم." },
    quality: { title: `جودة الحفظ – خريطة لكل صفحة وسورة وجزء${B}`, description: "إتقان حفظكم على صفحات المصحف الـ604 أو السور الـ114 أو الأجزاء الثلاثين، مع أضعف الآيات." },
    mutashabihat: { title: `المتشابهات – تدريب على الآيات المتشابهة في القرآن${B}`, description: "آيات متقاربة اللفظ جنبًا إلى جنب مع تمييز الفروق، وتدريب مختلط للتفريق بينها. مجانًا." },
    weak: { title: `مواضع الضعف – تدريب التثبيت${B}`, description: "الآيات والكلمات التي يتكرر فيها الخطأ، تُجمع تلقائيًا وتُراجع حتى تثبت." },
    tadabbur: { title: `تدبر ومقاصد سورة {s}${B}`, description: "ما تريد سورة {s} أن تعلّمه: المقصد والسياق والبناء والدروس وأسئلة للتدبر وتفسير كل آية." },
    darajat: { title: `درجات الحفظ${B}`, description: "سبع درجات للحفظ بمتطلباتها: التلقين وحدود النجاح والسرعة ودورة المنزل واختبارات العرض الأسبوعية والشهرية." },
    ard: { title: `العرض – اختبار التلاوة من الحفظ${B}`, description: "سؤال الشيخ الكلاسيكي: تُعطى آية من محفوظكم – أكملوا من هنا." },
    week: { title: `مراجعة الأسبوع${B}`, description: "أسبوع حفظكم في مراجعة: المداومة والآيات الجديدة والمراجعة والجودة وما يستحق التركيز." },
    handbook: { title: `دليل منهج شمس – المبادئ والتطبيق والدرجات والمصطلحات${B}`, description: "مبادئ منهج شمس من المدرسة وعلم التعلّم، والتطبيق اليومي، ودرجات الحفظ، ومسرد المصطلحات مع المصادر." },
    welcome: { title: `مرحبًا بكم في منهج شمس${B}`, description: "ثمانية مبادئ لحفظ القرآن في دقيقتين، ثم وقتكم اليومي." },
    next: { title: `الخطوات التالية – منهج شمس${B}`, description: "الخطوات المفيدة التالية بعد كل سورة وجزء واختبار." },
    talaqqi: { title: `التلقي – التلاوة جملةً جملة مع قارئ متقن${B}`, description: "استمعوا جملةً جملة، ثم اتلوا من الحفظ، وافحصوا الكلمات وقارنوا تسجيلكم بالقارئ." },
    teacher: { title: `عرض المعلّم – مشاركة تقدّم الحفظ${B}`, description: "شاركوا وردكم وجودة حفظكم وسلسلتكم مع معلّمكم عبر رمز، للقراءة فقط ودون حساب." },
  },
};
export function s2Meta(locale: string, page: S2Page, v: { s?: string } = {}): M {
  const m = T[locale === "de" || locale === "ar" ? locale : "en"][page];
  return { title: m.title.replaceAll("{s}", v.s ?? ""), description: m.description.replaceAll("{s}", v.s ?? "") };
}
