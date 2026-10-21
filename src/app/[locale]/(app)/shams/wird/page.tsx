import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { s2Meta } from "@/components/learn/shams2/meta";
import { WirdScreen } from "@/components/learn/shams2/Wird";

// /shams/wird – today's wird: sabaq, sabqi, manzil (mirrors mobile/src/app/shams/wird.tsx)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = s2Meta(locale, "wird");
  return { ...pageMeta(locale, "/shams/wird", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WirdScreen />;
}
