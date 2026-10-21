// SEO texts of the Madrasa pages (server-safe). German, English and Arabic written here; the other eleven languages are
// built from the Madrasa's own texts in that language (src/lib/learn/school/textTables.ts, module "school"), polite
// address throughout.
import { schoolTextFor } from "@/lib/learn/school/textTables";
type M = { title: string; description: string };
type Page = "home" | "stage" | "timetable" | "report" | "transcript" | "certificates";
const T: Record<"en" | "de" | "ar", Record<Page, M>> = {
  en: {
    home: { title: "The Madrasa – a Quran school in four stages | Quran Masterclass", description: "Your learning arranged like a classical Islamic school: four stages from Ibtidāʾī to ʿĀlī, eight subjects, a weekly timetable, a report card and verifiable certificates. Free on the website." },
    stage: { title: "{stage} – the Madrasa | Quran Masterclass", description: "{lead}" },
    timetable: { title: "Weekly timetable – the Madrasa | Quran Masterclass", description: "A weekly timetable for the minutes you have each day: the Quran first every day, the other subjects in turn." },
    report: { title: "Report card – the Madrasa | Quran Masterclass", description: "Grades per subject from your own quizzes and exams, semester by semester, compared only with yourself." },
    transcript: { title: "Transcript – the Madrasa | Quran Masterclass", description: "All courses of the four stages with progress and grades, your certificates and the sanad of the recitation Ḥafṣ ʿan ʿĀṣim." },
    certificates: { title: "My certificates | Quran Masterclass", description: "Verifiable certificates with code and QR code, kept on our server so that anyone can check them." },
  },
  de: {
    home: { title: "Die Madrasa – eine Koranschule in vier Stufen | Quran Masterclass", description: "Ihr Lernen geordnet wie eine klassische islamische Schule: vier Stufen von Ibtidāʾī bis ʿĀlī, acht Fächer, ein Wochenstundenplan, ein Zeugnis und überprüfbare Zertifikate. Kostenlos auf der Website." },
    stage: { title: "{stage} – die Madrasa | Quran Masterclass", description: "{lead}" },
    timetable: { title: "Wochenstundenplan – die Madrasa | Quran Masterclass", description: "Ein Wochenstundenplan für die Minuten, die Sie täglich haben: jeden Tag zuerst der Quran, die übrigen Fächer im Wechsel." },
    report: { title: "Zeugnis – die Madrasa | Quran Masterclass", description: "Noten je Fach aus Ihren eigenen Quizzen und Prüfungen, Semester für Semester, verglichen nur mit sich selbst." },
    transcript: { title: "Studienbuch – die Madrasa | Quran Masterclass", description: "Alle Kurse der vier Stufen mit Fortschritt und Noten, Ihre Zertifikate und der Sanad der Rezitation Ḥafṣ ʿan ʿĀṣim." },
    certificates: { title: "Meine Zertifikate | Quran Masterclass", description: "Überprüfbare Zertifikate mit Code und QR-Code, auf unserem Server gespeichert, damit jede Person sie prüfen kann." },
  },
  ar: {
    home: { title: "المدرسة – مدرسة قرآنية في أربع مراحل | Quran Masterclass", description: "تعلّمكم منظَّم كمدرسة إسلامية عريقة: أربع مراحل من الابتدائية إلى العالية، وثماني مواد، وجدول أسبوعي، وشهادة فصلية، وشهادات قابلة للتحقق. مجانًا على الموقع." },
    stage: { title: "{stage} – المدرسة | Quran Masterclass", description: "{lead}" },
    timetable: { title: "الجدول الأسبوعي – المدرسة | Quran Masterclass", description: "جدول أسبوعي بحسب الدقائق المتاحة لكم يوميًا: القرآن أولًا كل يوم، والمواد الأخرى بالتناوب." },
    report: { title: "كشف الدرجات – المدرسة | Quran Masterclass", description: "درجات كل مادة من اختباراتكم أنتم، فصلًا بعد فصل، ومقارنة بأنفسكم فقط." },
    transcript: { title: "السجل الأكاديمي – المدرسة | Quran Masterclass", description: "جميع مقررات المراحل الأربع مع التقدم والدرجات، وشهاداتكم، وسند رواية حفص عن عاصم." },
    certificates: { title: "شهاداتي | Quran Masterclass", description: "شهادات برمز ورمز QR محفوظة على خادمنا ليتمكّن أي شخص من التحقق منها." },
  },
};
const STAGE: Record<string, { en: [string, string]; de: [string, string]; ar: [string, string] }> = {
  ibtidai: { en: ["Foundation stage", "Reading the Quran correctly, first tajweed rules, Juz ʿAmma, and the foundations of belief and worship."], de: ["Grundstufe", "Den Quran richtig lesen, erste Tadschwid-Regeln, Juz ʿAmma und die Grundlagen von Glauben und Gottesdienst."], ar: ["المرحلة الابتدائية", "قراءة القرآن قراءة صحيحة، وأوائل أحكام التجويد، وجزء عمّ، وأسس العقيدة والعبادة."] },
  idadi: { en: ["Preparatory stage", "Tajweed of the long vowels and stops, Juz Tabārak, the life of the Prophet ﷺ, character and fasting."], de: ["Vorbereitungsstufe", "Tadschwid der Dehnungen und Pausen, Juz Tabārak, das Leben des Propheten ﷺ, Charakter und Fasten."], ar: ["المرحلة الإعدادية", "أحكام المدود والوقف، وجزء تبارك، وسيرة النبي ﷺ، والأخلاق والصيام."] },
  thanawi: { en: ["Secondary stage", "Recitation of whole passages, deeper tajweed, hadith sciences, sciences of the Quran and further memorisation."], de: ["Sekundarstufe", "Rezitation ganzer Abschnitte, vertieftes Tadschwid, Hadithwissenschaften, Quranwissenschaften und weiteres Auswendiglernen."], ar: ["المرحلة الثانوية", "تلاوة مقاطع كاملة، وتجويد متقدم، وعلوم الحديث، وعلوم القرآن، ومزيد من الحفظ."] },
  ali: { en: ["Higher stage", "The reciter's final levels, juz exams with review, Arabic at C1 level and the tafsir of long surahs."], de: ["Hochstufe", "Die letzten Stufen des Rezitationspfads, Dschuz-Prüfungen mit Begutachtung, Arabisch auf C1-Niveau und der Tafsir langer Suren."], ar: ["المرحلة العالية", "المستويات الأخيرة لمسار القارئ، واختبارات الأجزاء مع المراجعة، والعربية بمستوى C1، وتفسير السور الطويلة."] },
};

/** the other eleven languages: title and description from the page's own headings and leads */
function fromTexts(locale: string, page: Page, stage?: string): M {
  const st = schoolTextFor(locale);
  const SUF = " | Quran Masterclass";
  const school = st("title");
  const id = (stage && stage in STAGE ? stage : "ibtidai") as "ibtidai" | "idadi" | "thanawi" | "ali";
  switch (page) {
    case "stage": return { title: `${st(`stage_${id}`)} – ${school}${SUF}`, description: st(`lead_${id}`) };
    case "timetable": return { title: `${st("timetable")} – ${school}${SUF}`, description: st("timetableLead", { m: 20 }) };
    case "report": return { title: `${st("report")} – ${school}${SUF}`, description: st("reportLead") };
    case "transcript": return { title: `${st("w_sijill")} – ${school}${SUF}`, description: st("transcriptLead") };
    case "certificates": return { title: `${st("certificates")}${SUF}`, description: st("certificatesLead") };
    default: return { title: `${school}${SUF}`, description: st("lead") };
  }
}

export function schoolMeta(locale: string, page: Page, stage?: string): M {
  if (locale !== "en" && locale !== "de" && locale !== "ar") return fromTexts(locale, page, stage);
  const l = locale;
  const m = T[l][page];
  if (page !== "stage") return m;
  const s = STAGE[stage ?? ""]?.[l] ?? STAGE.ibtidai[l];
  return { title: m.title.replace("{stage}", s[0]), description: m.description.replace("{lead}", s[1]) };
}
export const SCHOOL_STAGE_IDS = Object.keys(STAGE);
