import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { misharyMeta } from "@/components/learn/mishary/meta";
import { SeasonsScreen } from "@/components/learn/mishary/Seasons";

// /mishary/seasons – mirrors mobile/src/app/mishary/seasons/index.tsx (screen in src/components/learn/mishary)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = misharyMeta(locale, "seasons");
  return pageMeta(locale, "/mishary/seasons", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SeasonsScreen />;
}
