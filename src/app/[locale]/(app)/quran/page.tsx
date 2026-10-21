import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import SurahBrowser from "@/components/SurahBrowser";
import CountUp from "@/components/CountUp";
import DonateCTA from "@/components/DonateCTA";
import { Divider } from "@/components/Ornaments";
import { QuranInlay, QuranShamsa } from "@/components/art/QuranArt";
import { getChapters } from "@/lib/quran";
import { TOTAL_VERSES } from "@/lib/quranIndex";
import { pageMeta } from "@/lib/site";
import { getUiVerses, ringOf } from "@/lib/uiVerses";

export const dynamic = "force-dynamic";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return pageMeta(locale, "/quran", t("quranTitle"), t("quranDesc"), t("keywords"));
}

// The 114 surahs: an illuminated opening in white marble and gold (a shamsa with "al-Qur'an al-Karim" and a ring of
// verses about the Quran), then the surahs as small illuminated tiles (see SurahBrowser)
export default async function QuranPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const chapters = await getChapters(locale);
  // the verses around the medallion (54:17 and 56:77–80) from the Quran data, never typed by hand
  const ring = ringOf(await getUiVerses());
  const stats: [number, string][] = [[114, t("home.surahs")], [TOTAL_VERSES, t("home.verses")], [30, t("map.juz")]];
  return (
    <main className="q-page min-w-0">
      <section className="q-hero">
        <QuranInlay className="-bottom-4 -start-6 w-44 sm:w-60 rtl:-scale-x-100" />
        <QuranInlay className="-top-12 end-[40%] hidden w-44 rotate-180 !opacity-25 lg:block" />
        <div className="q-hero-grid mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:pb-20 lg:pt-12">
          <div className="q-a-title">
            <p className="q-kicker flex items-center gap-2 text-[rgb(var(--q-ink-gold))]">
              <svg aria-hidden viewBox="0 0 24 24" className="h-3 w-3 shrink-0"><path d="M12 1l2.8 8.2L23 12l-8.2 2.8L12 23l-2.8-8.2L1 12l8.2-2.8z" fill="currentColor" /></svg>
              <span className="truncate">{t("app.name")}</span>
            </p>
            <h1 className="font-display mt-3 text-[34px] leading-[0.95] min-[360px]:text-[44px] sm:text-7xl lg:text-[88px]">{t("home.surahs")}</h1>
          </div>
          <div className="q-a-medal">
            <QuranShamsa ring={ring} className="w-[104px] min-[360px]:w-[156px] sm:w-[230px] lg:w-[400px]" />
          </div>
          <p className="q-a-lead mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-[17px] lg:mt-6">{t("seo.quranDesc")}</p>
          <div className="q-a-stats mt-6 max-w-md lg:mt-8">
            <div className="q-stats">
              {stats.map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-[19px] leading-none tabular-nums min-[360px]:text-[22px] sm:text-[28px]"><CountUp to={n} locale={locale} /></p>
                  <p className="mt-1.5 truncate text-[12px] text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <span aria-hidden className="q-arcade" />
      </section>

      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
        <SurahBrowser chapters={chapters} />
        <Divider className="mt-14" />
        <DonateCTA variant="slim" className="mt-10" />
      </div>
    </main>
  );
}
