import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { metaFor } from "@/components/learn/qaida/meta";
import QaidaPathScreen from "@/components/learn/qaida/PathScreen";

// /arabic/read – "Read the Quran in Arabic": the reading course (Qaida) as a path of twenty stages
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = metaFor(locale, "home");
  return pageMeta(locale, "/arabic/read", m.title, m.description);
}

export default async function QaidaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const m = metaFor(locale, "home");
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Course", name: m.title.replace(/ \| Quran Masterclass$/, ""), description: m.description, inLanguage: locale, isAccessibleForFree: true,
        provider: { "@type": "Organization", name: "Quran Masterclass" } }} />
      <QaidaPathScreen />
    </>
  );
}
