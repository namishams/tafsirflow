import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { s2Meta } from "@/components/learn/shams2/meta";
import { TalaqqiScreen } from "@/components/learn/shams2/Talaqqi";
import { DaysGate } from "@/components/sisters/Sisters";

// /shams/talaqqi – talaqqi with a master reciter (?s=&v=&to=) (mirrors mobile/src/app/shams/talaqqi.tsx). A tool page without own content: not indexed.
type SP = Promise<{ s?: string | string[]; v?: string | string[]; to?: string | string[] }>;
const one = (x: string | string[] | undefined) => (Array.isArray(x) ? x[0] : x);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = s2Meta(locale, "talaqqi");
  return { ...pageMeta(locale, "/shams/talaqqi", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SP }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const p = await searchParams;
  const s = Math.max(1, Math.min(114, Number(one(p.s)) || 1));
  const v = Math.max(1, Number(one(p.v)) || 1);
  const to = Number(one(p.to)) || undefined;
  return <DaysGate kind="recite"><TalaqqiScreen key={`${s}:${v}`} surah={s} from={v} to={to && to >= v ? to : undefined} /></DaysGate>;
}
