import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Ranking from "@/components/Ranking";
import { MoreTiles } from "@/components/PosterTiles";
import DonateCTA from "@/components/DonateCTA";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rewards" });
  return pageMeta(locale, "/ranking", `${t("rankTitle")} | Quran Masterclass`, t("rankLead"));
}

export default async function RankingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Ranking />
      <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-5"><DonateCTA /></div>
      <MoreTiles keys={["shams", "map", "arabic", "radio"]} />
    </>
  );
}
