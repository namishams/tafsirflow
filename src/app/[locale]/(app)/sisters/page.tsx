// /sisters – "Für Schwestern" (mirrors mobile/src/app/sisters.tsx): open to everyone, "Meine Tage" only after her consent
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { sistersText } from "@/lib/sisters";
import { SistersPage } from "@/components/sisters/Sisters";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = sistersText(locale);
  return { ...pageMeta(locale, "/sisters", `${t.title} | Quran Masterclass`, t.lead), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SistersPage />;
}
