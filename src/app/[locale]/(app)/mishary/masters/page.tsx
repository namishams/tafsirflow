import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { misharyMeta } from "@/components/learn/mishary/meta";
import { MastersScreen } from "@/components/learn/mishary/StyleStudy";

// /mishary/masters – mirrors mobile/src/app/mishary/masters/index.tsx (screen in src/components/learn/mishary)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = misharyMeta(locale, "masters");
  return pageMeta(locale, "/mishary/masters", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MastersScreen />;
}
