import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import KhatmPlanner from "@/components/KhatmPlanner";
import RequireAccount from "@/components/RequireAccount";
import { pageMeta } from "@/lib/site";
import { QuranInlay, QuranShamsa } from "@/components/art/QuranArt";

// verses around the medallion (exact Uthmani text): 35:29–30, on those who recite the Book of Allah
const RING = "إِنَّ ٱلَّذِينَ يَتۡلُونَ كِتَٰبَ ٱللَّهِ وَأَقَامُواْ ٱلصَّلَوٰةَ وَأَنفَقُواْ مِمَّا رَزَقۡنَٰهُمۡ سِرّٗا وَعَلَانِيَةٗ يَرۡجُونَ تِجَٰرَةٗ لَّن تَبُورَ ۞ لِيُوَفِّيَهُمۡ أُجُورَهُمۡ وَيَزِيدَهُم مِّن فَضۡلِهِۦٓۚ إِنَّهُۥ غَفُورٞ شَكُورٞ ۞";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "khatm" });
  return pageMeta(locale, "/khatm", t("seoTitle"), t("seoDesc"), t("seoKeywords"));
}

export default async function KhatmPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("khatm");
  const ta = await getTranslations("app");
  return (
    <main className="q-page min-w-0 pb-24">
      <section className="q-hero">
        <QuranInlay className="-bottom-4 -start-6 w-40 sm:w-56 rtl:-scale-x-100" />
        <div className="q-hero-grid mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
          <div className="q-a-title">
            <p className="q-kicker flex items-center gap-2 text-[rgb(var(--q-ink-gold))]">
              <svg aria-hidden viewBox="0 0 24 24" className="h-3 w-3 shrink-0"><path d="M12 1l2.8 8.2L23 12l-8.2 2.8L12 23l-2.8-8.2L1 12l8.2-2.8z" fill="currentColor" /></svg>
              <span className="truncate">{ta("name")}</span>
            </p>
            <h1 className="font-display mt-3 text-[32px] leading-[1.02] min-[360px]:text-[40px] sm:text-6xl">{t("title")}</h1>
          </div>
          <div className="q-a-medal"><QuranShamsa ring={RING} size={17.5} lines={["ختم", "القرآن"]} className="w-[100px] min-[360px]:w-[136px] sm:w-[210px] lg:w-[300px]" /></div>
          <p className="q-a-lead mt-5 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-[17px]">{t("lead")}</p>
        </div>
        <span aria-hidden className="q-arcade" />
      </section>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <RequireAccount feature={t("title")}><KhatmPlanner /></RequireAccount>
        <section className="mt-12 rounded-xl border border-[rgb(201_166_94/0.25)] bg-surface/60 p-5 text-[15px] leading-relaxed text-muted sm:p-7">
          <h2 className="font-display text-2xl text-ink">{t("aboutTitle")}</h2>
          <p className="mt-3">{t("about1")}</p>
          <p className="mt-3">{t("about2")}</p>
        </section>
      </div>
    </main>
  );
}
