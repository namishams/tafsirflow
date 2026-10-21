import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { misharyMeta } from "@/components/learn/mishary/meta";
import { HallOfFameScreen } from "@/components/learn/mishary/Seasons";

// /mishary/hall-of-fame – mirrors mobile/src/app/mishary/hall-of-fame.tsx (screen in src/components/learn/mishary)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = misharyMeta(locale, "hof");
  return pageMeta(locale, "/mishary/hall-of-fame", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HallOfFameScreen />;
}
