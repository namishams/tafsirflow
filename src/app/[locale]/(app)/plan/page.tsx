import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PlanBoard from "@/components/PlanBoard";
import RequireAccount from "@/components/RequireAccount";
import Markdown from "@/components/Markdown";
import { pageMeta } from "@/lib/site";
import { QuranInlay, QuranShamsa } from "@/components/art/QuranArt";

// verses around the medallion (exact Uthmani text): 29:49 and 54:17, on the Quran kept in the hearts
const RING = "بَلۡ هُوَ ءَايَٰتُۢ بَيِّنَٰتٞ فِي صُدُورِ ٱلَّذِينَ أُوتُواْ ٱلۡعِلۡمَۚ وَمَا يَجۡحَدُ بِـَٔايَٰتِنَآ إِلَّا ٱلظَّـٰلِمُونَ ۞ وَلَقَدۡ يَسَّرۡنَا ٱلۡقُرۡءَانَ لِلذِّكۡرِ فَهَلۡ مِن مُّدَّكِرٖ ۞";

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
    <main className="q-page min-w-0 pb-24">
      <section className="q-hero">
        <QuranInlay className="-bottom-4 -start-6 w-40 sm:w-56 rtl:-scale-x-100" />
        <div className="q-hero-grid mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
          <div className="q-a-title">
            <p className="q-kicker flex items-center gap-2 text-[rgb(var(--q-ink-gold))]">
              <svg aria-hidden viewBox="0 0 24 24" className="h-3 w-3 shrink-0"><path d="M12 1l2.8 8.2L23 12l-8.2 2.8L12 23l-2.8-8.2L1 12l8.2-2.8z" fill="currentColor" /></svg>
              <span className="min-w-0">{t("eyebrow")}</span>
            </p>
            <h1 className="font-display mt-3 text-[32px] leading-[1.02] min-[360px]:text-[40px] sm:text-6xl">{t("title")}</h1>
          </div>
          <div className="q-a-medal"><QuranShamsa ring={RING} lines={["حفظ", "القرآن"]} className="w-[100px] min-[360px]:w-[136px] sm:w-[210px] lg:w-[300px]" /></div>
          <p className="q-a-lead mt-5 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-[17px]">{t("lead")}</p>
        </div>
        <span aria-hidden className="q-arcade" />
      </section>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <RequireAccount feature={t("title")}><PlanBoard /></RequireAccount>
        <section className="mt-14 max-w-3xl"><Markdown text={t("about")} /></section>
      </div>
    </main>
  );
}
