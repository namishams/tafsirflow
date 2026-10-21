import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { srsMeta } from "@/components/learn/srs/meta";
import { CardsHome } from "@/components/learn/srs/Cards";

// /cards – spaced-repetition cards (mirrors the app's /cards)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = srsMeta(locale, "cards");
  return pageMeta(locale, "/cards", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CardsHome />;
}
