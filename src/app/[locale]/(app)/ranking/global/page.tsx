import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import GlobalBoardWeb from "@/components/stats/GlobalBoardWeb";
import { pageMeta } from "@/lib/site";
import { careerText } from "@/lib/careerWeb";

// /ranking/global – the global boards of the progress profile (owner 22.10.2026): world, country, following; week,
// month, all time; XP, memorised verses, streak, passed exams. The worldwide rankings at /ranking stay as they are.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = careerText(locale);
  return pageMeta(locale, "/ranking/global", `${t.boardTitle} | Quran Masterclass`, t.boardLead);
}

export default async function GlobalBoardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = careerText(locale);
  return (
    <div>
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="relative mx-auto max-w-4xl px-5 py-10 sm:py-14">
          <h1 className="font-display text-[38px] leading-[1.05] sm:text-5xl">{t.boardTitle}</h1>
          <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-white/72">{t.boardLead}</p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-5"><GlobalBoardWeb locale={locale} /></section>
    </div>
  );
}
