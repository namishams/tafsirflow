// /journey/stats – mirrors mobile/src/app/journey/stats.tsx (StatsScreen of mobile/src/features/journey). Personal page:
// noindex, follow.
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { journeyMeta } from "@/components/learn/journey/meta";
import { JourneyStats } from "@/components/learn/journey/Screens";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = journeyMeta(locale, "stats");
  return { ...pageMeta(locale, "/journey/stats", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <JourneyStats />;
}
