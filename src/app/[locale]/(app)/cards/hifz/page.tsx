import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { srsMeta } from "@/components/learn/srs/meta";
import { HifzScreen } from "@/components/learn/srs/Hifz";

// /cards/hifz – the Hifz tracker (mirrors the app's /cards/hifz)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = srsMeta(locale, "hifz");
  return pageMeta(locale, "/cards/hifz", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HifzScreen />;
}
