import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { misharyMeta } from "@/components/learn/mishary/meta";
import { JournalScreen } from "@/components/learn/mishary/Journal";

// /mishary/journal – mirrors mobile/src/app/mishary/journal.tsx (screen in src/components/learn/mishary)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = misharyMeta(locale, "journal");
  return { ...pageMeta(locale, "/mishary/journal", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <JournalScreen />;
}
