import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import RadioPlayer from "@/components/RadioPlayer";
import { loadFeedTexts } from "@/lib/feedWeb/loadTexts";
import { FeedTextsProvider } from "@/lib/feedWeb/useTexts";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "radio" });
  return pageMeta(locale, "/radio", `${t("title")} – ${locale === "ar" ? "القرآن الكريم" : "Quran"} | Quran Masterclass`, t("lead"));
}

export default async function RadioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const texts = await loadFeedTexts(locale);
  return <FeedTextsProvider texts={texts}><RadioPlayer /></FeedTextsProvider>;
}
