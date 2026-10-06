import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PlanBoard from "@/components/PlanBoard";
import RequireAccount from "@/components/RequireAccount";
import Markdown from "@/components/Markdown";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plan" });
  return pageMeta(locale, "/plan", t("seoTitle"), t("seoDesc"), t("seoKeywords"));
}

export default async function PlanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("plan");
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <p className="eyebrow">{t("eyebrow")}</p>
      <h1 className="font-display mt-2 text-[40px] leading-[1.05] sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">{t("lead")}</p>
      <RequireAccount feature={t("title")}><PlanBoard /></RequireAccount>
      <section className="mt-14 max-w-3xl"><Markdown text={t("about")} /></section>
    </main>
  );
}
