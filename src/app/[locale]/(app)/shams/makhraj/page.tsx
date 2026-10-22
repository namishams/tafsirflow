import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { makhrajText } from "@/lib/learn/shams2/makhraj/tables";
import { MakhrajScreen } from "@/components/learn/shams2/Makhraj";
import { DaysGate } from "@/components/sisters/Sisters";

// /shams/makhraj?l=ayn|ha|kha|qaf|dad – the makhraj coach (mirrors mobile/src/app/shams/makhraj.tsx). A tool page: not indexed.
type SP = Promise<{ l?: string | string[] }>;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = makhrajText(locale);
  return { ...pageMeta(locale, "/shams/makhraj", `${t.metaTitle} | Quran Masterclass`, t.metaDesc), robots: { index: false, follow: true } };
}

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SP }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const p = await searchParams;
  const l = Array.isArray(p.l) ? p.l[0] : p.l;
  return <DaysGate kind="practice"><MakhrajScreen initial={l} /></DaysGate>;
}
