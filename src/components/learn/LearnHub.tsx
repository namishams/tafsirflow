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
import { Shams2EntryCard } from "./shams2/EntryCard";
import { JourneyEntryCard } from "./journey/EntryCard";
import { GardenEntryCard } from "./garden/EntryCard";
import { MisharyEntryCard } from "./mishary/EntryCard";
import { SrsEntryCard } from "./srs/EntryCard";
import { LangCourseEntryCard } from "./arabic-lang/EntryCard";
import { StarGlyph } from "@/components/art/HomeOrnaments";

const T = {
  en: { kicker: "Free on the website", title: "Start learning right here", lead: "The Madrasa, the reading course, Arabic A1–C1, the Reciter Path, the Academy courses, review cards and exams – all free, in your browser. Signed in, your progress continues in the app.", links: "All sections" },
  de: { kicker: "Kostenlos auf der Website", title: "Beginnen Sie gleich hier", lead: "Die Madrasa, der Lesekurs, Arabisch A1–C1, der Rezitationspfad, die Akademie-Kurse, Lernkarten und Prüfungen – alles kostenlos im Browser. Angemeldet setzen Sie Ihren Fortschritt in der App fort.", links: "Alle Bereiche" },
  ar: { kicker: "مجانًا على الموقع", title: "ابدؤوا التعلّم هنا", lead: "المدرسة، ودورة القراءة، والعربية A1–C1، ومسار القارئ، ودورات الأكاديمية، وبطاقات المراجعة والاختبارات – كلها مجانًا في المتصفح. ومع تسجيل الدخول يتابع تقدّمكم في التطبيق.", links: "جميع الأقسام" },
};
export const LEARN_LINKS: [string, string][] = [
  ["/school", "school"], ["/courses", "academyCourses"], ["/arabic/read", "arabicRead"], ["/arabic/lang", "arabicLang"], ["/reciter-path", "reciterPath"], ["/shams/method", "shamsMethod"], ["/journey", "journey"], ["/garden", "garden"], ["/mishary", "mishary"],
  ["/cards", "cards"], ["/tests", "tests"], ["/abrahamic", "abrahamic"], ["/haramain", "haramain"], ["/school/certificates", "certificates"],
];

export default function LearnHub({ labels }: { labels: Record<string, string> }) {
  const locale = useLocale();
  const t = T[locale === "de" || locale === "ar" ? locale : "en"];
  return (
    <section id="learn" className="relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <p className="hm-k flex items-center gap-2 text-[rgb(var(--hm-gold-d))]"><StarGlyph size={9} />{t.kicker}</p>
        <h2 className="font-display mt-3 text-3xl leading-tight sm:text-4xl">{t.title}</h2>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">{t.lead}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SchoolEntryCard />
          <QaidaEntryCard />
          <LangCourseEntryCard />
          <ReciterPathEntryCard />
          <CoursesEntryCard />
          <AbrahamicEntryCard />
          <HaramainEntryCard />
          <Shams2EntryCard />
          <JourneyEntryCard />
          <GardenEntryCard />
          <MisharyEntryCard />
          <SrsEntryCard />
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
