import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GUIDES, guideText } from "@/lib/guides";
import { pageMeta } from "@/lib/site";
import { CalligraphyDraw } from "@/components/Ornaments";
import { IslamArcadeLine, IslamNum, IslamRain, saw } from "@/components/art/IslamArt";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guides" });
  return pageMeta(locale, "/guides", t("seoTitle"), t("seoDesc"), t("seoKeywords"));
}

export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides");
  return (
    <main>
      <section className="stage girih isl-arcade relative z-[1] overflow-hidden text-[#eef0f3]">
        <IslamRain fall={420} className="opacity-70" />
        <CalligraphyDraw text={"دليل"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-4xl px-5 pb-24 pt-14 sm:pb-28 sm:pt-20">
          <h1 className="font-display text-[40px] leading-[1.05] sm:text-6xl">{t("title")}</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/75">{t("lead")}</p>
        </div>
        <IslamArcadeLine />
      </section>
      <div className="isl-marble isl-under">
        <ul className="mx-auto grid max-w-4xl gap-3 px-5 pb-20 pt-12 sm:grid-cols-2 sm:gap-4 sm:pt-16">
          {GUIDES.map((g, i) => {
            const gt = guideText(g, locale);
            return (
              <li key={g.slug} className="min-w-0">
                <Link href={`/guides/${g.slug}`} className="isl-card isl-card-hover group flex h-full gap-4 p-5">
                  <IslamNum n={i + 1} className="!h-10 !w-10 !text-[13px]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17.5px] font-bold leading-snug">{saw(gt.title)}</span>
                    <span className="mt-1.5 block text-[14.5px] leading-relaxed text-muted">{saw(gt.desc)}</span>
                  </span>
                  <span aria-hidden className="mt-1 shrink-0 text-[rgb(var(--isl-gold))] transition group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
