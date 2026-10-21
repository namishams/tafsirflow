import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { misharyMeta } from "@/components/learn/mishary/meta";
import { SeasonScreen } from "@/components/learn/mishary/Seasons";

// /mishary/seasons/<slug> – mirrors mobile/src/app/mishary/seasons/[slug].tsx: one season (entry, jury, results).
// Seasons are created on the server over time, so the page is dynamic and not indexed.
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const m = misharyMeta(locale, "season");
  return { ...pageMeta(locale, `/mishary/seasons/${slug}`, m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) notFound();
  return <SeasonScreen slug={slug} />;
}
