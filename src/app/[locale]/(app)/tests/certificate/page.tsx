import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { srsMeta } from "@/components/learn/srs/meta";
import { CertificateScreen } from "@/components/learn/srs/Tests";

// /tests/certificate?juz=N – the juz certificates earned in this browser and the verifiable one (mirrors the app)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = srsMeta(locale, "certificate");
  return { ...pageMeta(locale, "/tests/certificate", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ juz?: string | string[] }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { juz } = await searchParams;
  const n = Number(juz);
  return <CertificateScreen juz={Number.isInteger(n) && n >= 1 && n <= 30 ? n : null} />;
}
