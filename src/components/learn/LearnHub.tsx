"use client";
// "Learn on the website": the entry cards of every course ported from the app (the app's Masterclass tab), shown on
// /masterclass. Everything here is free; progress stays in this browser and follows the account when signed in.
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SchoolEntryCard } from "./school/EntryCard";
import { QaidaEntryCard } from "./qaida/EntryCard";
import { ReciterPathEntryCard } from "./reciter-path/EntryCard";
import { CoursesEntryCard } from "./courses/EntryCard";
import { AbrahamicEntryCard } from "./abrahamic/EntryCard";
import { HaramainEntryCard } from "./haramain/EntryCard";
import { NahjEntryCard } from "./nahj/NahjScreens";
import { Shams2EntryCard } from "./shams2/EntryCard";
import { JourneyEntryCard } from "./journey/EntryCard";
import { GardenEntryCard } from "./garden/EntryCard";
import { MisharyEntryCard } from "./mishary/EntryCard";
import { SrsEntryCard } from "./srs/EntryCard";
import { SwipeEntryCard } from "./swipe/EntryCard";
import { LangCourseEntryCard } from "./arabic-lang/EntryCard";
import { QbankEntryCard } from "./qbank/Screens";
import { StarGlyph } from "@/components/art/HomeOrnaments";
import { LEARN_LINKS } from "./learnLinks";

const T = {
  en: { kicker: "Free on the website", title: "Start learning right here", lead: "The Madrasa, the reading course, Arabic A1–C1, the Reciter Path, the Academy courses, review cards and exams – all free, in your browser. Signed in, your progress continues in the app.", links: "All sections" },
  de: { kicker: "Kostenlos auf der Website", title: "Beginnen Sie gleich hier", lead: "Die Madrasa, der Lesekurs, Arabisch A1–C1, der Rezitationspfad, die Akademie-Kurse, Lernkarten und Prüfungen – alles kostenlos im Browser. Angemeldet setzen Sie Ihren Fortschritt in der App fort.", links: "Alle Bereiche" },
  ar: { kicker: "مجانًا على الموقع", title: "ابدؤوا التعلّم هنا", lead: "المدرسة، ودورة القراءة، والعربية A1–C1، ومسار القارئ، ودورات الأكاديمية، وبطاقات المراجعة والاختبارات – كلها مجانًا في المتصفح. ومع تسجيل الدخول يتابع تقدّمكم في التطبيق.", links: "جميع الأقسام" },
  tr: { kicker: "Web sitesinde ücretsiz", title: "Hemen burada öğrenmeye başlayın", lead: "Medrese, okuma kursu, Arapça A1–C1, Kâri yolu, Akademi kursları, tekrar kartları ve sınavlar – hepsi ücretsiz, tarayıcınızda. Giriş yaptığınızda ilerlemeniz uygulamada devam eder.", links: "Tüm bölümler" },
  ur: { kicker: "ویب سائٹ پر مفت", title: "یہیں سے سیکھنا شروع کریں", lead: "مدرسہ، پڑھنے کا کورس، عربی A1–C1، قاری کا راستہ، اکیڈمی کورسز، دہرائی کارڈز اور امتحانات – سب مفت، آپ کے براؤزر میں۔ سائن ان ہونے پر آپ کی پیش رفت ایپ میں جاری رہتی ہے۔", links: "تمام حصے" },
  fa: { kicker: "رایگان در وب‌سایت", title: "همین‌جا یادگیری را شروع کنید", lead: "مدرسه، دورهٔ خواندن، عربی A1–C1، مسیر قاری، دوره‌های آکادمی، کارت‌های مرور و آزمون‌ها – همه رایگان و در مرورگر شما. با ورود به حساب، پیشرفت شما در اپ ادامه می‌یابد.", links: "همهٔ بخش‌ها" },
  ps: { kicker: "په وېب‌پاڼه کې وړیا", title: "همدلته زده‌کړه پیل کړئ", lead: "مدرسه، د لوستلو کورس، عربي A1–C1، د قاري لاره، د اکاډمۍ کورسونه، د بیاکتنې کارتونه او ازموینې – ټول وړیا، ستاسو په براوزر کې. کله چې ننوځئ، ستاسو پرمختګ په اپ کې دوام کوي.", links: "ټولې برخې" },
  fr: { kicker: "Gratuit sur le site", title: "Commencez à apprendre ici même", lead: "La Madrasa, le cours de lecture, l'arabe A1–C1, le Parcours du récitant, les cours de l'Académie, les cartes de révision et les examens – le tout gratuit, dans votre navigateur. Une fois connecté, votre progression se poursuit dans l'application.", links: "Toutes les sections" },
  es: { kicker: "Gratis en la web", title: "Empiece a aprender aquí mismo", lead: "La Madrasa, el curso de lectura, árabe A1–C1, el Camino del recitador, los cursos de la Academia, las tarjetas de repaso y los exámenes – todo gratis, en su navegador. Con la sesión iniciada, su progreso continúa en la app.", links: "Todas las secciones" },
  id: { kicker: "Gratis di situs web", title: "Mulai belajar di sini", lead: "Madrasah, kursus membaca, bahasa Arab A1–C1, Jalur Qari, kursus Akademi, kartu ulangan, dan ujian – semuanya gratis di peramban Anda. Setelah masuk, kemajuan Anda berlanjut di aplikasi.", links: "Semua bagian" },
  ms: { kicker: "Percuma di laman web", title: "Mula belajar di sini", lead: "Madrasah, kursus membaca, bahasa Arab A1–C1, Laluan Qari, kursus Akademi, kad ulang kaji dan peperiksaan – semuanya percuma dalam pelayar Anda. Selepas log masuk, kemajuan Anda bersambung dalam aplikasi.", links: "Semua bahagian" },
  bn: { kicker: "ওয়েবসাইটে বিনামূল্যে", title: "এখানেই শেখা শুরু করুন", lead: "মাদ্রাসা, পড়ার কোর্স, আরবি A1–C1, কারীর পথ, একাডেমি কোর্স, পুনরাবৃত্তি কার্ড ও পরীক্ষা – সবই বিনামূল্যে, আপনার ব্রাউজারে। সাইন ইন করলে আপনার অগ্রগতি অ্যাপে চলতে থাকে।", links: "সব বিভাগ" },
  ru: { kicker: "Бесплатно на сайте", title: "Начните учиться прямо здесь", lead: "Медресе, курс чтения, арабский A1–C1, Путь чтеца, курсы Академии, карточки для повторения и экзамены – всё бесплатно, в вашем браузере. После входа ваш прогресс продолжается в приложении.", links: "Все разделы" },
  zh: { kicker: "网站上免费", title: "就在这里开始学习", lead: "伊斯兰学堂、阅读课程、阿拉伯语 A1–C1、诵读者之路、学院课程、复习卡片和考试——全部免费，在您的浏览器中进行。登录后，您的进度会在应用中继续。", links: "全部栏目" },
};
// the links live in a server-safe module: a server page reading them from this client file gets a client reference
// instead of the array (that broke /masterclass)
export { LEARN_LINKS } from "./learnLinks";

export default function LearnHub({ labels }: { labels: Record<string, string> }) {
  const locale = useLocale();
  const t = T[locale as keyof typeof T] ?? T.en; // all fourteen website languages, polite address
  return (
    <section id="learn" className="relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <p className="hm-k flex items-center gap-2 text-[rgb(var(--hm-gold-d))]"><StarGlyph size={9} />{t.kicker}</p>
        <h2 className="font-display mt-3 text-3xl leading-tight sm:text-4xl">{t.title}</h2>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">{t.lead}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SwipeEntryCard />
          <SchoolEntryCard />
          <QaidaEntryCard />
          <LangCourseEntryCard />
          <ReciterPathEntryCard />
          <CoursesEntryCard />
          <AbrahamicEntryCard />
          <HaramainEntryCard />
          <NahjEntryCard />
          <Shams2EntryCard />
          <JourneyEntryCard />
          <GardenEntryCard />
          <MisharyEntryCard />
          <SrsEntryCard />
          <QbankEntryCard />
        </div>
        <nav aria-label={t.links} className="mt-8">
          <ul className="flex flex-wrap gap-2.5">
            {LEARN_LINKS.map(([href, key]) => (
              <li key={href}><Link href={href} className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--hm-gold))]/35 bg-surface px-4 py-2 text-[14px] font-semibold transition hover:border-[rgb(var(--hm-gold))]"><StarGlyph size={9} className="text-[rgb(var(--hm-gold))]" />{labels[key] ?? key}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
