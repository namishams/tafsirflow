import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { s2Meta } from "@/components/learn/shams2/meta";
import { HubScreen } from "@/components/learn/shams2/Hub";

// /shams/method – Shams Method 2.0 hub (mirrors mobile/src/app/shams/method.tsx; the existing /shams page stays unchanged)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = s2Meta(locale, "method");
  return pageMeta(locale, "/shams/method", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const m = s2Meta(locale, "method");
  const ld = { "@context": "https://schema.org", "@type": "Course", name: m.title.split(" | ")[0], description: m.description, url: abs(`/${locale}/shams/method`), inLanguage: locale, isAccessibleForFree: true, provider: { "@type": "Organization", name: "Quran Masterclass", url: abs("") }, hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" } };
  return (<><JsonLd data={ld} /><HubScreen /></>);
}
