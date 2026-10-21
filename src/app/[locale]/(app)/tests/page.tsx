import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { srsMeta } from "@/components/learn/srs/meta";
import { TestsHome } from "@/components/learn/srs/Tests";

// /tests – placement, weekly, vocabulary, juz and surah tests (mirrors the app's /tests)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = srsMeta(locale, "tests");
  return pageMeta(locale, "/tests", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TestsHome />;
}
