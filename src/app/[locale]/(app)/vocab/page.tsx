import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import VocabTrainer from "@/components/VocabTrainer";
import RequireAccount from "@/components/RequireAccount";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "vocab" });
  return pageMeta(locale, "/vocab", t("seoTitle"), t("seoDesc"), t("seoKeywords"));
}

export default async function VocabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("vocab");
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <h1 className="font-display text-[40px] leading-[1.05] sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-muted">{t("lead")}</p>
      <RequireAccount feature={t("title")}><VocabTrainer /></RequireAccount>
    </main>
  );
}
