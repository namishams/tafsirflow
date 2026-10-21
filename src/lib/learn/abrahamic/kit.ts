// mirrors the data and progress part of mobile/src/features/abrahamic/courseKit.tsx (types, texts, progress); the
// screens are web components in src/components/learn/coursekit.
import { isRTL, pick, useLang } from "@/lib/learn/i18n";
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";

import { L14, type L } from "./core";
export { L14, L3, verseRange, vv } from "./core";
export type { L, Tag, Q, Lesson, CourseDef } from "./core";
import type { CourseDef } from "./core";

export const CK: Record<string, L> = {
  course: L14("Course", "Kurs", "الدورة", "Kurs", "کورس", "دوره", "کورس", "Cours", "Curso", "Kursus", "Kursus", "কোর্স", "Курс", "课程"),
  lesson: L14("Lesson", "Lektion", "الدرس", "Ders", "سبق", "درس", "لوست", "Leçon", "Lección", "Pelajaran", "Pelajaran", "পাঠ", "Урок", "课"),
  lessons: L14("Lessons", "Lektionen", "الدروس", "Dersler", "اسباق", "درس‌ها", "لوستونه", "Leçons", "Lecciones", "Pelajaran", "Pelajaran", "পাঠসমূহ", "Уроки", "课程列表"),
  free: L14("Free", "Kostenlos", "مجاني", "Ücretsiz", "مفت", "رایگان", "وړیا", "Gratuit", "Gratis", "Gratis", "Percuma", "বিনামূল্যে", "Бесплатно", "免费"),
  done: L14("Done", "Erledigt", "مكتمل", "Tamamlandı", "مکمل", "انجام شد", "بشپړ", "Terminé", "Hecho", "Selesai", "Selesai", "সম্পন্ন", "Готово", "已完成"),
  progress: L14("{n} of {m} lessons", "{n} von {m} Lektionen", "{n} من {m} دروس", "{m} dersten {n}", "{m} میں سے {n} اسباق", "{n} از {m} درس", "له {m} څخه {n} لوستونه", "{n} leçons sur {m}", "{n} de {m} lecciones", "{n} dari {m} pelajaran", "{n} daripada {m} pelajaran", "{m}টির মধ্যে {n}টি পাঠ", "{n} из {m} уроков", "{m} 课中的 {n} 课"),
  quran: L14("Quran", "Koran", "القرآن", "Kur'an", "قرآن", "قرآن", "قرآن", "Coran", "Corán", "Al-Qur'an", "Al-Quran", "কুরআন", "Коран", "古兰经"),
  explain: L14("Explanation", "Erläuterung", "شرح", "Açıklama", "وضاحت", "توضیح", "تشریح", "Explication", "Explicación", "Penjelasan", "Penjelasan", "ব্যাখ্যা", "Пояснение", "说明"),
  note: L14("Note on the traditions", "Hinweis zu den Traditionen", "ملاحظة حول التقاليد", "Gelenekler hakkında not", "روایات کے بارے میں نوٹ", "یادداشت درباره سنت‌ها", "د دودونو په اړه یادونه", "Note sur les traditions", "Nota sobre las tradiciones", "Catatan tentang tradisi", "Nota tentang tradisi", "ঐতিহ্য সম্পর্কে টীকা", "Примечание о традициях", "关于各传统的说明"),
  openReader: L14("Open in the reader", "Im Leser öffnen", "افتح في القارئ", "Okuyucuda açın", "ریڈر میں کھولیں", "در قاری باز کنید", "په لوستونکي کې یې پرانیزئ", "Ouvrir dans le lecteur", "Abrir en el lector", "Buka di pembaca", "Buka dalam pembaca", "রিডারে খুলুন", "Открыть в читалке", "在阅读器中打开"),
  loading: L14("Loading …", "Wird geladen …", "جارٍ التحميل …", "Yükleniyor …", "لوڈ ہو رہا ہے …", "در حال بارگذاری …", "پورته کېږي …", "Chargement …", "Cargando …", "Memuat …", "Memuatkan …", "লোড হচ্ছে …", "Загрузка …", "正在加载 …"),
  offline: L14("Not available offline.", "Offline nicht verfügbar.", "غير متاح دون اتصال.", "Çevrimdışı kullanılamaz.", "آف لائن دستیاب نہیں۔", "در حالت آفلاین در دسترس نیست.", "له انټرنېټ پرته شتون نه لري.", "Indisponible hors ligne.", "No disponible sin conexión.", "Tidak tersedia secara luring.", "Tidak tersedia di luar talian.", "অফলাইনে পাওয়া যায় না।", "Недоступно офлайн.", "离线时不可用。"),
  startQuiz: L14("Start the quiz", "Quiz starten", "ابدأ الاختبار", "Teste başlayın", "کوئز شروع کریں", "آزمون را شروع کنید", "ازموینه پیل کړئ", "Commencer le quiz", "Empezar el cuestionario", "Mulai kuis", "Mulakan kuiz", "কুইজ শুরু করুন", "Начать тест", "开始测验"),
  question: L14("Question {n} of {m}", "Frage {n} von {m}", "السؤال {n} من {m}", "Soru {n}/{m}", "سوال {n} از {m}", "پرسش {n} از {m}", "پوښتنه {n} له {m}", "Question {n} sur {m}", "Pregunta {n} de {m}", "Pertanyaan {n} dari {m}", "Soalan {n} daripada {m}", "প্রশ্ন {n}/{m}", "Вопрос {n} из {m}", "第 {n}/{m} 题"),
  right: L14("Correct", "Richtig", "صحيح", "Doğru", "درست", "درست", "سم دی", "Correct", "Correcto", "Benar", "Betul", "সঠিক", "Верно", "正确"),
  wrong: L14("Not quite", "Nicht ganz", "ليس تمامًا", "Tam değil", "مکمل درست نہیں", "نه کاملاً", "بشپړ نه", "Pas tout à fait", "No del todo", "Belum tepat", "Belum tepat", "পুরোপুরি নয়", "Не совсем", "不完全对"),
  next: L14("Continue", "Weiter", "متابعة", "Devam", "جاری رکھیں", "ادامه", "دوام", "Continuer", "Continuar", "Lanjut", "Teruskan", "চালিয়ে যান", "Далее", "继续"),
  result: L14("{n} of {m} correct", "{n} von {m} richtig", "{n} من {m} صحيحة", "{m} soruda {n} doğru", "{m} میں سے {n} درست", "{n} از {m} درست", "له {m} څخه {n} سم", "{n} sur {m} correctes", "{n} de {m} correctas", "{n} dari {m} benar", "{n} daripada {m} betul", "{m}টির মধ্যে {n}টি সঠিক", "{n} из {m} верно", "{m} 题答对 {n} 题"),
  growth: L14("+{n} growth for your tree", "+{n} Wachstum für Ihren Baum", "+{n} نمو لشجرتك", "Ağacınız için +{n} büyüme", "آپ کے درخت کے لیے +{n} نشوونما", "+{n} رشد برای درخت شما", "ستاسو ونې ته +{n} وده", "+{n} de croissance pour votre arbre", "+{n} de crecimiento para su árbol", "+{n} pertumbuhan untuk pohon Anda", "+{n} pertumbuhan untuk pokok anda", "আপনার গাছের জন্য +{n} বৃদ্ধি", "+{n} роста для вашего дерева", "您的树成长 +{n}"),
  retry: L14("Try again", "Nochmal versuchen", "حاول مرة أخرى", "Tekrar deneyin", "دوبارہ کوشش کریں", "دوباره تلاش کنید", "بیا هڅه وکړئ", "Réessayer", "Intentar de nuevo", "Coba lagi", "Cuba lagi", "আবার চেষ্টা করুন", "Ещё раз", "再试一次"),
  nextLesson: L14("Next lesson", "Nächste Lektion", "الدرس التالي", "Sonraki ders", "اگلا سبق", "درس بعدی", "بل لوست", "Leçon suivante", "Siguiente lección", "Pelajaran berikutnya", "Pelajaran seterusnya", "পরের পাঠ", "Следующий урок", "下一课"),
  overview: L14("Back to the course", "Zurück zum Kurs", "العودة إلى الدورة", "Kursa dönün", "کورس پر واپس", "بازگشت به دوره", "کورس ته بېرته", "Retour au cours", "Volver al curso", "Kembali ke kursus", "Kembali ke kursus", "কোর্সে ফিরে যান", "К курсу", "返回课程"),
  certificate: L14("Certificate", "Zertifikat", "الشهادة", "Sertifika", "سند", "گواهی", "سند", "Certificat", "Certificado", "Sertifikat", "Sijil", "সনদ", "Сертификат", "证书"),
  certLocked: L14("Complete all {m} lessons to receive the certificate.", "Schließen Sie alle {m} Lektionen ab, um das Zertifikat zu erhalten.", "أكمل جميع الدروس الـ{m} للحصول على الشهادة.", "Sertifika için {m} dersin tamamını bitirin.", "سند کے لیے تمام {m} اسباق مکمل کریں۔", "برای دریافت گواهی همه {m} درس را تمام کنید.", "د سند لپاره ټول {m} لوستونه بشپړ کړئ.", "Terminez les {m} leçons pour recevoir le certificat.", "Complete las {m} lecciones para recibir el certificado.", "Selesaikan semua {m} pelajaran untuk mendapat sertifikat.", "Lengkapkan kesemua {m} pelajaran untuk menerima sijil.", "সনদ পেতে সব {m}টি পাঠ শেষ করুন।", "Пройдите все {m} уроков, чтобы получить сертификат.", "完成全部 {m} 课即可获得证书。"),
  certYou: L14("has completed the course", "hat den Kurs abgeschlossen", "أتمّ الدورة", "kursu tamamladı", "نے کورس مکمل کیا", "دوره را به پایان رساند", "کورس یې بشپړ کړ", "a terminé le cours", "ha completado el curso", "telah menyelesaikan kursus", "telah melengkapkan kursus", "কোর্সটি সম্পন্ন করেছেন", "завершил(а) курс", "已完成课程"),
  certNote: L14("A learning certificate of the app, not an academic or religious qualification.", "Ein Lernnachweis der App, kein akademischer oder religiöser Abschluss.", "شهادة تعلّم من التطبيق، وليست مؤهلًا أكاديميًا أو دينيًا.", "Uygulamanın öğrenme belgesidir; akademik veya dini bir yeterlilik değildir.", "یہ ایپ کا تعلیمی ثبوت ہے، کوئی علمی یا دینی سند نہیں۔", "گواهی یادگیری برنامه است، نه مدرک دانشگاهی یا دینی.", "دا د اپ د زده‌کړې سند دی، نه علمي یا دیني سند.", "Attestation d'apprentissage de l'application, pas un diplôme académique ou religieux.", "Constancia de aprendizaje de la app, no un título académico ni religioso.", "Bukti belajar dari aplikasi, bukan kualifikasi akademik atau keagamaan.", "Bukti pembelajaran aplikasi, bukan kelayakan akademik atau keagamaan.", "অ্যাপের শেখার সনদ, কোনো একাডেমিক বা ধর্মীয় যোগ্যতা নয়।", "Подтверждение обучения в приложении, а не академическая или религиозная квалификация.", "本应用的学习证明，并非学术或宗教资格。"),
  share: L14("Share", "Teilen", "مشاركة", "Paylaşın", "شیئر کریں", "اشتراک", "شریکول", "Partager", "Compartir", "Bagikan", "Kongsi", "শেয়ার করুন", "Поделиться", "分享"),
  viewCert: L14("View certificate", "Zertifikat ansehen", "عرض الشهادة", "Sertifikayı görün", "سند دیکھیں", "مشاهده گواهی", "سند وګورئ", "Voir le certificat", "Ver certificado", "Lihat sertifikat", "Lihat sijil", "সনদ দেখুন", "Открыть сертификат", "查看证书"),
  unlock: L14("Unlock with Pro", "Mit Pro freischalten", "افتح مع Pro", "Pro ile açın", "Pro کے ساتھ کھولیں", "با Pro باز کنید", "د Pro سره یې خلاص کړئ", "Débloquer avec Pro", "Desbloquear con Pro", "Buka dengan Pro", "Buka dengan Pro", "Pro দিয়ে খুলুন", "Открыть с Pro", "通过 Pro 解锁"),
  notFound: L14("Lesson not found.", "Lektion nicht gefunden.", "الدرس غير موجود.", "Ders bulunamadı.", "سبق نہیں ملا۔", "درس پیدا نشد.", "لوست ونه موندل شو.", "Leçon introuvable.", "Lección no encontrada.", "Pelajaran tidak ditemukan.", "Pelajaran tidak dijumpai.", "পাঠ পাওয়া যায়নি।", "Урок не найден.", "未找到该课。"),
  // tags
  "tag.quran": L14("Quran", "Koran", "القرآن", "Kur'an", "قرآن", "قرآن", "قرآن", "Coran", "Corán", "Al-Qur'an", "Al-Quran", "কুরআন", "Коран", "古兰经"),
  "tag.tafsir": L14("Classical tafsir", "Klassischer Tafsir", "التفسير الكلاسيكي", "Klasik tefsir", "کلاسیکی تفسیر", "تفسیر کلاسیک", "کلاسیک تفسیر", "Tafsir classique", "Tafsir clásico", "Tafsir klasik", "Tafsir klasik", "ধ্রুপদী তাফসির", "Классический тафсир", "经典经注"),
  "tag.sunni": L14("Sunni views", "Sunnitische Sicht", "رأي أهل السنة", "Sünni görüş", "اہل سنت کا موقف", "دیدگاه اهل سنت", "د اهل سنت نظر", "Points de vue sunnites", "Visión sunní", "Pandangan Sunni", "Pandangan Sunni", "সুন্নি মত", "Суннитские взгляды", "逊尼派观点"),
  "tag.shia": L14("Shia views", "Schiitische Sicht", "رأي الشيعة", "Şii görüş", "اہل تشیع کا موقف", "دیدگاه شیعه", "د شیعه نظر", "Points de vue chiites", "Visión chií", "Pandangan Syiah", "Pandangan Syiah", "শিয়া মত", "Шиитские взгляды", "什叶派观点"),
  "tag.bible": L14("Also in the Bible", "Auch in der Bibel", "في الكتاب المقدس أيضًا", "Kitab-ı Mukaddes'te de", "بائبل میں بھی", "در کتاب مقدس نیز", "په انجیل کې هم", "Aussi dans la Bible", "También en la Biblia", "Juga dalam Alkitab", "Juga dalam Bible", "বাইবেলেও", "Также в Библии", "圣经中亦有"),
  "tag.history": L14("History", "Geschichte", "التاريخ", "Tarih", "تاریخ", "تاریخ", "تاریخ", "Histoire", "Historia", "Sejarah", "Sejarah", "ইতিহাস", "История", "历史"),
  "tag.fiqh": L14("Schools differ", "Rechtsschulen unterscheiden sich", "تختلف المذاهب", "Mezhepler farklıdır", "مسالک میں اختلاف", "مذاهب متفاوت‌اند", "مذهبونه توپیر لري", "Les écoles divergent", "Las escuelas difieren", "Mazhab berbeda", "Mazhab berbeza", "মাযহাবে মতভেদ", "Мазхабы расходятся", "教法学派有分歧"),
  review: L14("Explanation in our own words, awaiting review by a scholar.", "Erläuterung in eigenen Worten, die Prüfung durch Gelehrte steht noch aus.", "شرح بأسلوبنا، بانتظار مراجعة أهل العلم.", "Kendi ifademizle açıklama; bir âlimin incelemesi bekleniyor.", "ہمارے اپنے الفاظ میں وضاحت، کسی عالم کے جائزے کی منتظر۔", "توضیح به زبان خودمان، در انتظار بازبینی یک عالم.", "زموږ په خپلو ټکو تشریح، د یوه عالم بیاکتنې ته په تمه.", "Explication rédigée avec nos propres mots, en attente de relecture par un savant.", "Explicación con nuestras propias palabras, pendiente de revisión por un erudito.", "Penjelasan dengan kata-kata kami sendiri, menunggu tinjauan seorang ulama.", "Penjelasan dalam kata-kata kami sendiri, menunggu semakan seorang ulama.", "আমাদের নিজের ভাষায় ব্যাখ্যা, একজন আলেমের পর্যালোচনার অপেক্ষায়।", "Пояснение нашими словами, ожидает проверки учёным.", "以我们自己的话所作的说明，尚待学者审阅。"),
  translationBy: L14("Translation: {name}", "Übersetzung: {name}", "الترجمة: {name}", "Çeviri: {name}", "ترجمہ: {name}", "ترجمه: {name}", "ژباړه: {name}", "Traduction : {name}", "Traducción: {name}", "Terjemahan: {name}", "Terjemahan: {name}", "অনুবাদ: {name}", "Перевод: {name}", "译文：{name}"),
  "tag.today": L14("Today", "Heute", "اليوم", "Bugün", "آج", "امروز", "نن", "Aujourd'hui", "Hoy", "Kini", "Kini", "আজ", "Сегодня", "今日"),
};
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
export function useCK() {
  const { lang } = useLang();
  return { lang, rtl: isRTL(lang), c: (k: string, v?: Record<string, string | number>) => fill(pick(CK[k] ?? { en: k }, lang), v ?? {}) };
}

// ---------- progress (new keys only) ----------
export type CourseProgress = { done: Record<string, { at: number; score: number; of: number }>; cert?: { at: number; pct: number } };
const EMPTY: CourseProgress = { done: {} };
export const useCourseProgress = (def: CourseDef) => useStored<CourseProgress>(def.storeKey, EMPTY);
export function markDone(def: CourseDef, id: string, score: number, of: number): { first: boolean; complete: boolean } {
  const p = readJSON<CourseProgress>(def.storeKey, EMPTY);
  const prev = p.done[id];
  const done = { ...p.done, [id]: { at: prev?.at ?? Date.now(), score: Math.max(prev?.score ?? 0, score), of } };
  let cert = p.cert;
  const complete = def.lessons.every((l) => done[l.id]);
  if (complete && !cert) {
    const s = def.lessons.reduce((a, l) => a + done[l.id].score, 0), m = def.lessons.reduce((a, l) => a + done[l.id].of, 0);
    cert = { at: Date.now(), pct: m ? Math.round((100 * s) / m) : 100 };
  }
  writeJSON(def.storeKey, { ...p, done, cert });
  return { first: !prev, complete: complete && !p.cert };
}
export const lessonHref = (def: CourseDef, id: string) => `${def.route}/lesson/${id}`;
export const certHref = (def: CourseDef) => `${def.route}/certificate`;
