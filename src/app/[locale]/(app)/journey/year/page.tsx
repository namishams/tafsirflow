// /journey/year – mirrors mobile/src/app/journey/year.tsx (YearScreen of mobile/src/features/journey). Personal page:
// noindex, follow.
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { journeyMeta } from "@/components/learn/journey/meta";
import { JourneyYear } from "@/components/learn/journey/Screens";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = journeyMeta(locale, "year");
  return { ...pageMeta(locale, "/journey/year", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <JourneyYear />;
}
