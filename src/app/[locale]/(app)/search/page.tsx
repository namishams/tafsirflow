import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SearchView from "@/components/SearchView";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  return { ...pageMeta(locale, "/search", t("title"), t("title")), robots: { index: false, follow: true } };
}

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SearchView />;
}
