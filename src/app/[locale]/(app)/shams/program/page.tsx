import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { s2Meta } from "@/components/learn/shams2/meta";
import { ShamsProgramScreen } from "@/components/learn/shams2/Extensions";

// /shams/program – 30-day program (mirrors mobile/src/app/shams/program.tsx). Works with the learner's own progress: not indexed.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = s2Meta(locale, "program");
  return { ...pageMeta(locale, "/shams/program", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ShamsProgramScreen />;
}
