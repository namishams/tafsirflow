// mirrors the app's first-run funnel (mobile/src/app/onboarding.tsx → features/plan/Funnel.tsx): the personal path with
// the 30-day plan and the planting ceremony, without the day-1 paywall (the website is free)
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { StartFunnel } from "@/components/learn/plan/StartFunnel";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "start" });
  return { ...pageMeta(locale, "/start", t("title"), t("description")), robots: { index: false, follow: true } };
}

export default async function StartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <main><StartFunnel /></main>;
}
