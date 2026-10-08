import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import StatsView from "@/components/StatsView";
import { MoreTiles } from "@/components/PosterTiles";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rewards" });
  return { ...pageMeta(locale, "/stats", `${t("metaTitle")} | Quran Masterclass`, t("metaDesc")), robots: { index: false } };
}

export default async function StatsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <StatsView />
      <MoreTiles keys={["map", "shams", "arabic", "radio"]} />
    </>
  );
}
