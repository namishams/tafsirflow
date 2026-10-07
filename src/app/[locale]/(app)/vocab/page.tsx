import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import VocabTrainer from "@/components/VocabTrainer";
import RequireAccount from "@/components/RequireAccount";
import { pageMeta } from "@/lib/site";
import { PracticeHero } from "@/components/art/PracticeArt";

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
    <>
      <PracticeHero uid="vocab-h" word="كلمات" title={t("title")} lead={t("lead")} />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-4 sm:px-5">
        <RequireAccount feature={t("title")}><VocabTrainer /></RequireAccount>
      </main>
    </>
  );
}
