import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import NameGenerator from "@/components/NameGenerator";
import { CalligraphyDraw } from "@/components/Ornaments";
import { MoreTiles } from "@/components/PosterTiles";
import { namesText } from "@/lib/names";
import { abs, pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = namesText(locale);
  return pageMeta(locale, "/names", `${t("metaTitle")} | Quran Masterclass`, t("metaDesc"));
}

export default async function NamesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = namesText(locale);
  const ld = { "@context": "https://schema.org", "@type": "WebApplication", name: t("metaTitle"), description: t("metaDesc"), url: abs(`/${locale}/names`), applicationCategory: "LifestyleApplication", operatingSystem: "Any", inLanguage: locale, offers: { "@type": "Offer", price: "0", priceCurrency: "AED" } };
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <CalligraphyDraw text={"أسماء"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-4xl px-5 py-14 sm:py-20">
          <p className="rise text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{t("kicker")}</p>
          <h1 className="rise font-display mt-3 text-[40px] leading-[1.05] sm:text-6xl" style={{ animationDelay: "120ms" }}>{t("title")}</h1>
          <p className="rise mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70" style={{ animationDelay: "240ms" }}>{t("lead")}</p>
          <p className="rise font-arabic mt-6 text-2xl leading-[1.9] text-[rgb(var(--gold))]" dir="rtl" lang="ar" style={{ animationDelay: "360ms" }}>
            يَا زَكَرِيَّا إِنَّا نُبَشِّرُكَ بِغُلَامٍ اسْمُهُ يَحْيَىٰ <span className="text-sm text-white/45">({t("heroRef")})</span>
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-5">
        <NameGenerator />
      </div>
      <MoreTiles keys={["duagen", "duas", "islam", "community"]} />
    </div>
  );
}
