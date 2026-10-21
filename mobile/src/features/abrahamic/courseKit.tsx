// Shared course engine for the Abrahamic and Haramain courses: lesson list, lesson screen (Quran passages by verse key,
// rendered from the app's verse data, plus a neutral explanation and tradition-aware tags), quiz, completion
// certificate and rewards (feed XP and stickers via gamify, tree growth via the garden). Progress lives under a new
// key per course; the older unit/section screens and their keys are untouched.
import { useEffect, useState } from "react";
import { Pressable, Share, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Arcade, Eyebrow, GoldButton, OutlineButton, SmallStar, Stage, TextLink, Wordmark } from "@/components/brand";
import { Icon } from "@/components/icons";
import { isRTL, pick, useLang } from "@/i18n";
import { ARABIC_FONT, FONT, useTheme } from "@/lib/theme";
import { useEntitlement } from "@/lib/entitlements";
import { usePro } from "@/lib/pro";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { getVerseByKey, type SingleVerse } from "@/lib/quran";
import { openVerse } from "@/features/coursekit/links";
import { GoldRing, StepIn, useNudge } from "@/features/coursekit/motion";
import { gEvent, useGamify } from "@/features/feed/gamify";
import { award } from "@/web/points";
import { takeBurst, tickGarden } from "@/features/garden/garden";

export type L = { en: string } & Partial<Record<"de" | "ar" | "tr" | "ur" | "fa" | "ps" | "fr" | "es" | "id" | "ms" | "bn" | "ru" | "zh", string>>;
export const L14 = (en: string, de: string, ar: string, tr: string, ur: string, fa: string, ps: string, fr: string, es: string, id: string, ms: string, bn: string, ru: string, zh: string): L =>
  ({ en, de, ar, tr, ur, fa, ps, fr, es, id, ms, bn, ru, zh });
/** content texts: at least en/de/ar */
export const L3 = (en: string, de: string, ar: string): L => ({ en, de, ar });

export type Tag = "quran" | "tafsir" | "sunni" | "shia" | "bible" | "history" | "fiqh" | "today";
export type Q = { q: L; options: L[]; answer: number; why?: L };
export type Lesson = { id: string; arabic: string; title: L; text: L; note?: L; verses: string[]; tags: Tag[]; quiz: Q[] };
export type CourseDef = {
  id: "abrahamic" | "haramain";
  storeKey: string;
  route: string; // "/abrahamic"
  title: L;
  lessons: Lesson[];
};

/** "2:125-129" → ["2:125", …, "2:129"] */
export function verseRange(r: string): string[] {
  const [s, v] = r.split(":");
  if (!v) return [];
  const [a, b] = v.split("-").map(Number);
  return Array.from({ length: (b || a) - a + 1 }, (_, i) => `${s}:${a + i}`);
}
export const vv = (...r: string[]) => r.flatMap(verseRange);

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
function markDone(def: CourseDef, id: string, score: number, of: number): { first: boolean; complete: boolean } {
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
const lessonHref = (def: CourseDef, id: string) => `${def.route}/lesson/${id}` as Href;
const certHref = (def: CourseDef) => `${def.route}/certificate` as Href;

// ---------- small pieces ----------
export function TagChips({ tags }: { tags: Tag[] }) {
  const t = useTheme();
  const { c } = useCK();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {tags.map((g) => (
        <View key={g} style={{ borderRadius: 999, borderWidth: 1, borderColor: t.line, paddingHorizontal: 10, paddingVertical: 3 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: t.muted }}>{c(`tag.${g}`)}</Text>
        </View>
      ))}
    </View>
  );
}

function Bar({ frac }: { frac: number }) {
  const t = useTheme();
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: t.line, overflow: "hidden" }}>
      <View style={{ width: `${Math.round(Math.max(0, Math.min(1, frac)) * 100)}%`, height: 6, backgroundColor: t.gold }} />
    </View>
  );
}

/** the lesson list, for the course overview screens (first lesson free, the rest Pro) */
export function CourseList({ def }: { def: CourseDef }) {
  const t = useTheme();
  const { c, lang, rtl } = useCK();
  const ent = useEntitlement(def.id);
  const p = useCourseProgress(def);
  const n = def.lessons.filter((l) => p.done[l.id]).length, m = def.lessons.length;
  const nextIdx = def.lessons.findIndex((l) => !p.done[l.id]);
  return (
    <View style={{ backgroundColor: t.surface, borderRadius: 14, borderWidth: 1, borderColor: t.line, padding: 16, gap: 12 }}>
      <Eyebrow>{c("course")}</Eyebrow>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{c("progress", { n, m })}</Text>
      <Bar frac={n / m} />
      <View>
        {def.lessons.map((l, i) => {
          const locked = i > 0 && !ent.allowed, done = !!p.done[l.id], current = i === nextIdx;
          return (
            <Pressable key={l.id} accessibilityRole="button"
              accessibilityLabel={`${c("lesson")} ${i + 1}: ${pick(l.title, lang)}${done ? `, ${c("done")}` : ""}${locked ? ", Pro" : ""}`}
              onPress={() => (locked ? ent.upsell() : router.push(lessonHref(def, l.id)))}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderTopWidth: i ? 1 : 0, borderTopColor: t.line, opacity: pressed ? 0.7 : 1 })}>
              <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: done || current ? t.gold : t.line, backgroundColor: done ? t.gold : "transparent" }}>
                {done ? <Icon name="check" size={15} color={t.bg} /> : <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: current ? t.gold : t.muted }}>{i + 1}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, writingDirection: rtl ? "rtl" : "ltr" }}>{pick(l.title, lang)}</Text>
                {i === 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.gold }}>{c("free")}</Text> : null}
              </View>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 16, color: t.gold }}>{l.arabic}</Text>
              <Icon name={locked ? "lock" : "chevronRight"} size={16} color={locked ? t.gold : t.muted} />
            </Pressable>
          );
        })}
      </View>
      {p.cert ? <GoldButton compact title={c("viewCert")} icon="trophy" onPress={() => router.push(certHref(def))} style={{ alignSelf: "flex-start" }} />
        : <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{c("certLocked", { m })}</Text>}
    </View>
  );
}

function Verses({ keys }: { keys: string[] }) {
  const t = useTheme();
  const { c, lang } = useCK();
  const [verses, setVerses] = useState<(SingleVerse | null)[] | null>(null);
  useEffect(() => {
    let live = true;
    setVerses(null);
    Promise.all(keys.map((k) => getVerseByKey(k, lang).catch(() => null))).then((v) => live && setVerses(v));
    return () => { live = false; };
  }, [keys, lang]);
  if (verses === null) return <Text style={{ color: t.muted, fontFamily: FONT.regular }}>{c("loading")}</Text>;
  return (
    <>
      {keys.map((k, i) => {
        const v = verses[i];
        return (
          <View key={k} style={{ borderTopWidth: 1, borderTopColor: t.line, paddingTop: 12, gap: 6 }}>
            {v ? (
              <>
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 42, color: t.arabic, textAlign: "right", writingDirection: "rtl" }}>{v.text_uthmani}</Text>
                {v.translation && lang !== "ar" ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted }}>{v.translation}</Text> : null}
              </>
            ) : <Text style={{ color: t.muted, fontFamily: FONT.regular }}>{c("offline")}</Text>}
            <TextLink title={`${k} · ${c("openReader")}`} onPress={() => openVerse(k)} />
          </View>
        );
      })}
    </>
  );
}

function Quiz({ quiz, onDone }: { quiz: Q[]; onDone: (score: number) => void }) {
  const t = useTheme();
  const { c, lang, rtl } = useCK();
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const nudge = useNudge();
  const q = quiz[i];
  const choose = (k: number) => {
    if (chosen !== null) return;
    const ok = k === q.answer;
    setChosen(k);
    if (ok) setScore((s) => s + 1); else nudge.run();
    gEvent({ t: "quiz", right: ok });
  };
  const next = () => {
    if (i + 1 >= quiz.length) { onDone(score); return; }
    setI(i + 1); setChosen(null);
  };
  return (
    <StepIn key={i} style={{ gap: 10 }}>
      <Eyebrow>{c("question", { n: i + 1, m: quiz.length })}</Eyebrow>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 19, lineHeight: 25, color: t.ink, writingDirection: rtl ? "rtl" : "ltr" }}>{pick(q.q, lang)}</Text>
      {q.options.map((o, k) => {
        const isRight = chosen !== null && k === q.answer, isWrong = chosen === k && k !== q.answer;
        return (
          <View key={k} style={isWrong ? nudge.style : undefined}>
            <Pressable onPress={() => choose(k)} accessibilityRole="button" accessibilityState={{ disabled: chosen !== null, selected: chosen === k }}
              style={{ borderRadius: 12, borderWidth: 1.5, padding: 14, borderColor: isRight ? t.gold : isWrong ? "rgb(160,58,52)" : t.line, backgroundColor: t.bg }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink, writingDirection: rtl ? "rtl" : "ltr" }}>{pick(o, lang)}</Text>
              <GoldRing on={isRight} />
            </Pressable>
          </View>
        );
      })}
      {chosen !== null ? (
        <View accessibilityLiveRegion="polite" style={{ gap: 8 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: chosen === q.answer ? t.gold : "rgb(160,58,52)" }}>{c(chosen === q.answer ? "right" : "wrong")}</Text>
          {q.why ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, writingDirection: rtl ? "rtl" : "ltr" }}>{pick(q.why, lang)}</Text> : null}
          <GoldButton title={c("next")} onPress={next} />
        </View>
      ) : null}
    </StepIn>
  );
}

/** one lesson: explanation, Quran passages, tags, quiz, rewards */
export function CourseLessonScreen({ def, id }: { def: CourseDef; id: string }) {
  const t = useTheme();
  const { c, lang, rtl } = useCK();
  const ent = useEntitlement(def.id);
  const { pro } = usePro();
  const gm = useGamify();
  const idx = def.lessons.findIndex((l) => l.id === id);
  const lesson = def.lessons[idx];
  const [phase, setPhase] = useState<"read" | "quiz" | "result">("read");
  const [res, setRes] = useState<{ score: number; burst: number; complete: boolean } | null>(null);
  useEffect(() => { setPhase("read"); setRes(null); }, [id]);
  if (!lesson) return <Page><PageHero back topInset title={c("notFound")} /></Page>;
  const locked = idx > 0 && !ent.allowed;
  const finish = (score: number) => {
    const r = markDone(def, lesson.id, score, lesson.quiz.length);
    if (r.first) { award("lesson"); gEvent({ t: "verse" }); }
    award("quiz");
    takeBurst();
    tickGarden(gm.xp, false, pro, gm.names);
    setRes({ score, burst: takeBurst(), complete: r.complete });
    setPhase("result");
  };
  const nextL = def.lessons[idx + 1];
  const para = { fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: t.ink, writingDirection: rtl ? "rtl" : "ltr" } as const;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={`${pick(def.title, lang)} · ${c("lesson")} ${idx + 1}/${def.lessons.length}`} title={pick(lesson.title, lang)} arabic={lesson.arabic} />
        <View style={{ padding: 16, gap: 14 }}>
          {locked ? (
            <View style={{ gap: 12 }}>
              <Text style={para}>{pick(lesson.text, lang).split("\n")[0]}</Text>
              <GoldButton title={c("unlock")} icon="lock" onPress={ent.upsell} />
            </View>
          ) : phase === "read" ? (
            <StepIn style={{ gap: 14 }}>
              <TagChips tags={lesson.tags} />
              <Eyebrow>{c("explain")}</Eyebrow>
              {pick(lesson.text, lang).split("\n").map((p, k) => <Text key={k} style={para}>{p}</Text>)}
              {lesson.note ? (
                <View style={{ borderRadius: 12, borderWidth: 1, borderColor: t.gold, padding: 14, gap: 6 }}>
                  <Eyebrow>{c("note")}</Eyebrow>
                  <Text style={{ ...para, fontSize: 14.5, lineHeight: 22 }}>{pick(lesson.note, lang)}</Text>
                </View>
              ) : null}
              <Eyebrow>{c("quran")}</Eyebrow>
              <Verses keys={lesson.verses} />
              <GoldButton title={c("startQuiz")} onPress={() => setPhase("quiz")} style={{ marginTop: 8 }} />
            </StepIn>
          ) : phase === "quiz" ? (
            <Quiz quiz={lesson.quiz} onDone={finish} />
          ) : res ? (
            <StepIn style={{ gap: 12, alignItems: "stretch" }}>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink, textAlign: "center" }}>{c("result", { n: res.score, m: lesson.quiz.length })}</Text>
              {res.burst > 0 ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.gold, textAlign: "center" }}>{c("growth", { n: res.burst })}</Text> : null}
              {res.complete || (!nextL && courseDone(def)) ? <GoldButton title={c("viewCert")} icon="trophy" onPress={() => router.replace(certHref(def))} /> : null}
              {nextL ? <GoldButton title={c("nextLesson")} onPress={() => (!ent.allowed ? ent.upsell() : router.replace(lessonHref(def, nextL.id)))} /> : null}
              <OutlineButton title={c("retry")} onPress={() => setPhase("quiz")} />
              <TextLink title={c("overview")} onPress={() => router.back()} style={{ alignSelf: "center" }} />
            </StepIn>
          ) : null}
        </View>
      </Page>
    </>
  );
}
function courseDone(def: CourseDef) { return !!readJSON<CourseProgress>(def.storeKey, EMPTY).cert; }

export function CourseCertificateScreen({ def }: { def: CourseDef }) {
  const t = useTheme();
  const { c, lang } = useCK();
  const p = useCourseProgress(def);
  const m = def.lessons.length;
  const title = pick(def.title, lang);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={c("certificate")} title={title} />
        <View style={{ padding: 16, gap: 14 }}>
          {!p.cert ? (
            <View style={{ borderRadius: 14, borderWidth: 1, borderStyle: "dashed", borderColor: t.line, padding: 18, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{`${c("certLocked", { m })} ${c("progress", { n: Object.keys(p.done).filter((k) => def.lessons.some((l) => l.id === k)).length, m })}`}</Text>
              <Icon name="lock" size={16} color={t.muted} />
            </View>
          ) : (
            <Stage rounded={14} style={{ borderWidth: 1, borderColor: "rgba(201,166,94,0.6)" }}>
              <View style={{ padding: 24, alignItems: "center", gap: 6 }}>
                <SmallStar size={14} />
                <Wordmark tone="gold" height={18} />
                <Text style={{ fontFamily: FONT.display, fontSize: 22, color: "#fff", textAlign: "center" }}>{title}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, color: "rgba(255,255,255,0.78)", textAlign: "center" }}>{c("certYou")}</Text>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: "#f3e7c9" }}>{`${p.cert.pct} % · ${new Date(p.cert.at).toLocaleDateString(lang)}`}</Text>
                <Text style={{ marginTop: 6, fontFamily: FONT.regular, fontSize: 11.5, color: "rgba(255,255,255,0.55)", textAlign: "center" }}>{c("certNote")}</Text>
                <OutlineButton onStage compact title={c("share")} icon="share" style={{ marginTop: 10 }}
                  onPress={() => { void Share.share({ message: `${c("certificate")} · ${title} · ${p.cert!.pct} %` }).catch(() => undefined); }} />
              </View>
              <Arcade />
            </Stage>
          )}
        </View>
      </Page>
    </>
  );
}
