import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { s2Meta } from "@/components/learn/shams2/meta";
import { WelcomeScreen } from "@/components/learn/shams2/Guide";

// /shams/welcome – onboarding to the principles of the method (mirrors mobile/src/app/shams/welcome.tsx)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = s2Meta(locale, "welcome");
  return { ...pageMeta(locale, "/shams/welcome", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WelcomeScreen />;
}
