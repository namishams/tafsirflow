import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { metaFor } from "@/components/learn/haramain/meta";
import { HaramainCertificate } from "@/components/learn/haramain/Pages";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = metaFor(locale, "certificate")!;
  return { ...pageMeta(locale, "/haramain/certificate", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HaramainCertificate />;
}
