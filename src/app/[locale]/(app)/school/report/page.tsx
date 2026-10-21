import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { schoolMeta } from "@/components/learn/school/meta";
import { ReportScreen } from "@/components/learn/school/Screens";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = schoolMeta(locale, "report");
  return { ...pageMeta(locale, "/school/report", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ReportScreen />;
}
