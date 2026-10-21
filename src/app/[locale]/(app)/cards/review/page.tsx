import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { srsMeta } from "@/components/learn/srs/meta";
import { ReviewScreen } from "@/components/learn/srs/Cards";

// /cards/review?deck=<id> – one review round (mirrors the app's /cards/review)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = srsMeta(locale, "review");
  return { ...pageMeta(locale, "/cards/review", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ deck?: string | string[] }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { deck } = await searchParams;
  return <ReviewScreen key={String(deck ?? "")} deck={typeof deck === "string" ? deck : undefined} />;
}
