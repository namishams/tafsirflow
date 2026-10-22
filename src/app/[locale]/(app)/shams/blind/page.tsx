import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { recMeta } from "@/lib/learn/shams2/rec/strings";
import { BlindScreen } from "@/components/learn/shams2/Blind";
import { DaysGate } from "@/components/sisters/Sisters";

// /shams/blind – blind recitation (?s=&from=&to=; without: choose the passage) (mirrors mobile/src/app/shams/blind.tsx).
// A tool page without own content: not indexed.
type SP = Promise<{ s?: string | string[]; from?: string | string[]; to?: string | string[] }>;
const one = (x: string | string[] | undefined) => (Array.isArray(x) ? x[0] : x);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = recMeta(locale);
  return { ...pageMeta(locale, "/shams/blind", `${t.blindTitle} | Quran Masterclass`, t.blindLead), robots: { index: false, follow: true } };
}

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SP }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const p = await searchParams;
  const s = Math.trunc(Number(one(p.s)));
  const from = Math.trunc(Number(one(p.from))) || 1;
  const to = Math.trunc(Number(one(p.to))) || 0;
  const initial = Number.isInteger(s) && s >= 1 && s <= 114 ? { s, from, to: to >= from ? to : 0 } : undefined;
  return <DaysGate kind="recite"><BlindScreen key={initial ? `${s}:${from}-${to}` : "pick"} initial={initial} /></DaysGate>;
}
