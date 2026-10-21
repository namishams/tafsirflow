import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { s2Meta } from "@/components/learn/shams2/meta";
import { DarajatScreen } from "@/components/learn/shams2/Darajat";

// /shams/darajat – grades of hifz (darajat al-hifz) (mirrors mobile/src/app/shams/darajat.tsx)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = s2Meta(locale, "darajat");
  return pageMeta(locale, "/shams/darajat", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DarajatScreen />;
}
