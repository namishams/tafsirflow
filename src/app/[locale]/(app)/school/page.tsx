import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { schoolMeta } from "@/components/learn/school/meta";
import { SchoolHome } from "@/components/learn/school/Screens";

// /school – the Madrasa (mirrors the app's /school): stages, faculties, timetable, report card, certificates
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = schoolMeta(locale, "home");
  return pageMeta(locale, "/school", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const m = schoolMeta(locale, "home");
  const ld = {
    "@context": "https://schema.org", "@type": "Course", name: m.title.split(" | ")[0], description: m.description, url: abs(`/${locale}/school`), inLanguage: locale,
    isAccessibleForFree: true, provider: { "@type": "Organization", name: "Quran Masterclass", url: abs("") },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT15M" },
  };
  return (<><JsonLd data={ld} /><SchoolHome /></>);
}
