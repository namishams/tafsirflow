import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { s2Meta } from "@/components/learn/shams2/meta";
import { ArdScreen } from "@/components/learn/shams2/Darajat";
import { DaysGate } from "@/components/sisters/Sisters";

// /shams/ard – formal and surprise recitation checks (?kind=weekly|monthly|ard) (mirrors mobile/src/app/shams/ard.tsx). A tool page without own content: not indexed.
type SP = Promise<{ kind?: string | string[] }>;
const one = (x: string | string[] | undefined) => (Array.isArray(x) ? x[0] : x);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = s2Meta(locale, "ard");
  return { ...pageMeta(locale, "/shams/ard", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SP }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const p = await searchParams;
  const k = one(p.kind);
  const kind = k === "monthly" ? "monthly" : k === "ard" ? "ard" : "weekly";
  return <DaysGate kind="recite"><ArdScreen key={kind} kind={kind} /></DaysGate>;
}
