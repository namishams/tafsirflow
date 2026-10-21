import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { rpMeta } from "@/components/learn/reciter-path/meta";
import { MisharyEntryCard } from "@/components/learn/mishary/EntryCard";
import { PathHome } from "@/components/learn/reciter-path/Screens";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = rpMeta(locale, "home");
  return pageMeta(locale, "/reciter-path", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const m = rpMeta(locale, "home");
  const ld = { "@context": "https://schema.org", "@type": "Course", name: m.title.split(" | ")[0], description: m.description, url: abs(`/${locale}/reciter-path`), inLanguage: locale, isAccessibleForFree: true, provider: { "@type": "Organization", name: "Quran Masterclass", url: abs("") }, hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" } };
  return (<><JsonLd data={ld} /><PathHome /><div className="mx-auto max-w-6xl px-5 pb-16"><MisharyEntryCard /></div></>);
}
