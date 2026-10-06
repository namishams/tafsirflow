import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import TodayDashboard from "@/components/TodayDashboard";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "today" });
  return { ...pageMeta(locale, "/today", t("title"), t("scheduleBody")), robots: { index: false, follow: true } };
}

export default async function TodayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TodayDashboard />;
}
