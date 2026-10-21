// /journey – Riḥlat al-ʿIlm, mirrors mobile/src/app/journey/index.tsx (JourneyScreen): the map of the Marāḥil,
// the app rank, milestones, garden areas and the album of seals. Indexable.
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { journeyMeta } from "@/components/learn/journey/meta";
import { JourneyHome } from "@/components/learn/journey/Screens";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = journeyMeta(locale, "home");
  return pageMeta(locale, "/journey", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const m = journeyMeta(locale, "home");
  const ld = { "@context": "https://schema.org", "@type": "WebPage", name: m.title.split(" | ")[0], description: m.description, url: abs(`/${locale}/journey`), inLanguage: locale, isAccessibleForFree: true, publisher: { "@type": "Organization", name: "Quran Masterclass", url: abs("") } };
  return (<><JsonLd data={ld} /><JourneyHome /></>);
}
