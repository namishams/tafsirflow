import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { misharyMeta } from "@/components/learn/mishary/meta";
import { MisharyHome } from "@/components/learn/mishary/Home";

// /mishary – mirrors mobile/src/app/mishary/index.tsx: the Mishary track hub (after the Reciter Path)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = misharyMeta(locale, "home");
  return pageMeta(locale, "/mishary", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const m = misharyMeta(locale, "home");
  const ld = { "@context": "https://schema.org", "@type": "Course", name: m.title.split(" | ")[0], description: m.description, url: abs(`/${locale}/mishary`), inLanguage: locale, isAccessibleForFree: true, provider: { "@type": "Organization", name: "Quran Masterclass", url: abs("") }, hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" } };
  return (<><JsonLd data={ld} /><MisharyHome /></>);
}
