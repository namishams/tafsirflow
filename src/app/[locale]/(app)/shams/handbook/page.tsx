import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { s2Meta } from "@/components/learn/shams2/meta";
import { HandbookScreen } from "@/components/learn/shams2/Guide";

// /shams/handbook – the method handbook with the grades and the glossary of terms (mirrors mobile/src/app/shams/handbook.tsx)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = s2Meta(locale, "handbook");
  return pageMeta(locale, "/shams/handbook", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HandbookScreen />;
}
