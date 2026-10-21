import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { s2Meta } from "@/components/learn/shams2/meta";
import { ShamsPlansScreen } from "@/components/learn/shams2/Extensions";

// /shams/plans – memorisation plans for any surah (mirrors mobile/src/app/shams/plans.tsx). Works with the learner's own progress: not indexed.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = s2Meta(locale, "plans");
  return { ...pageMeta(locale, "/shams/plans", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ShamsPlansScreen />;
}
