import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { langMeta } from "@/components/learn/arabic-lang/meta";
import { LangPathScreen } from "@/components/learn/arabic-lang/Screens";

// /arabic/lang – "Understand Arabic": the Arabic language course (Quranic + Modern Standard Arabic, A1 → C1)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = langMeta(locale, "home");
  return pageMeta(locale, "/arabic/lang", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const m = langMeta(locale, "home");
  const ld = {
    "@context": "https://schema.org", "@type": "Course", name: m.title.replace(/ \| Quran Masterclass$/, ""), description: m.description, url: abs(`/${locale}/arabic/lang`), inLanguage: locale,
    isAccessibleForFree: true, educationalLevel: "A1–C1", provider: { "@type": "Organization", name: "Quran Masterclass", url: abs("") },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT10M" },
  };
  return (<><JsonLd data={ld} /><LangPathScreen /></>);
}
