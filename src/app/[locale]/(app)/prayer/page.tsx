import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PrayerBoard from "@/components/PrayerBoard";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prayer" });
  return pageMeta(locale, "/prayer", `${t("title")} – ${locale === "ar" ? "مكة المكرمة، دبي، طهران، إسلام آباد" : "Makkah, Dubai, Tehran, Islamabad"} | Quran Masterclass`, t("lead"));
}

export default async function PrayerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <PrayerBoard />
    </>
  );
}
