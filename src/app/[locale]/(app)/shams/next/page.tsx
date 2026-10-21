import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { s2Meta } from "@/components/learn/shams2/meta";
import { NextScreen } from "@/components/learn/shams2/Continue";

// /shams/next – the next meaningful steps (?s=) (mirrors mobile/src/app/shams/next.tsx). A tool page without own content: not indexed.
type SP = Promise<{ s?: string | string[] }>;
const one = (x: string | string[] | undefined) => (Array.isArray(x) ? x[0] : x);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = s2Meta(locale, "next");
  return { ...pageMeta(locale, "/shams/next", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SP }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const p = await searchParams;
  const s = Number(one(p.s));
  return <NextScreen surah={s >= 1 && s <= 114 ? s : undefined} />;
}
