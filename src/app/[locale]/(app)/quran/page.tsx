import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import SurahBrowser from "@/components/SurahBrowser";
import { getChapters } from "@/lib/quran";
import { pageMeta } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return pageMeta(locale, "/quran", t("quranTitle"), t("quranDesc"), t("keywords"));
}

export default async function QuranPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const chapters = await getChapters(locale);
  return (
    <main className="mx-auto w-full max-w-3xl min-w-0 px-4 pb-20 pt-2">
      <section className="border-b border-line pb-8 pt-10">
        <p className="eyebrow">{t("app.name")}</p>
        <h1 className="font-display mt-3 text-5xl leading-none sm:text-6xl">{t("home.surahs")}</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{t("seo.quranDesc")}</p>
      </section>

      <div className="pt-8">
        <SurahBrowser chapters={chapters} />
      </div>
    </main>
  );
}
