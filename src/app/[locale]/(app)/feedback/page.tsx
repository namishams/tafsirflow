import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import FeedbackBoard from "@/components/FeedbackBoard";
import { pageMeta } from "@/lib/site";
import { ArrowNext } from "@/components/Icons";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feedback" });
  return pageMeta(locale, "/feedback", `${t("title")} | Quran Masterclass`, t("lead"));
}

export default async function FeedbackPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("feedback");
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <h1 className="font-display text-[40px] leading-[1.05] sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">{t("lead")}</p>
      <Link href="/changelog" className="mt-3 inline-block text-sm font-bold text-accent hover:underline">{t("changelogLink")} <ArrowNext /></Link>
      <FeedbackBoard />
    </main>
  );
}
