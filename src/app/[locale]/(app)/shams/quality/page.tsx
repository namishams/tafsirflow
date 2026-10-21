import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { s2Meta } from "@/components/learn/shams2/meta";
import { QualityScreen } from "@/components/learn/shams2/Quality";

// /shams/quality – hifz quality heatmap (?juz=) (mirrors mobile/src/app/shams/quality.tsx). A tool page without own content: not indexed.
type SP = Promise<{ juz?: string | string[] }>;
const one = (x: string | string[] | undefined) => (Array.isArray(x) ? x[0] : x);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = s2Meta(locale, "quality");
  return { ...pageMeta(locale, "/shams/quality", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SP }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const p = await searchParams;
  const j = Number(one(p.juz));
  return <QualityScreen juz={j >= 1 && j <= 30 ? j : undefined} />;
}
