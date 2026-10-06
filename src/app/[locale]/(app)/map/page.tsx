import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import MemoryMap from "@/components/MemoryMap";
import RequireAccount from "@/components/RequireAccount";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "map" });
  return { ...pageMeta(locale, "/map", `${t("title")} | Quran Masterclass`, t("lead")), robots: { index: false, follow: true } };
}

export default async function MapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("map");
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <h1 className="font-display text-[40px] leading-[1.05] sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">{t("lead")}</p>
      <RequireAccount feature={t("title")}><div className="mt-8"><MemoryMap /></div></RequireAccount>
    </main>
  );
}
