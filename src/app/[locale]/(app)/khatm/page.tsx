import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import KhatmPlanner from "@/components/KhatmPlanner";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "khatm" });
  return pageMeta(locale, "/khatm", t("seoTitle"), t("seoDesc"), t("seoKeywords"));
}

export default async function KhatmPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("khatm");
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <h1 className="font-display text-[40px] leading-[1.05] sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-muted">{t("lead")}</p>
      <KhatmPlanner />
      <section className="mt-12 space-y-4 text-[15px] leading-relaxed text-muted">
        <h2 className="text-xl font-bold text-ink">{t("aboutTitle")}</h2>
        <p>{t("about1")}</p>
        <p>{t("about2")}</p>
      </section>
    </main>
  );
}
