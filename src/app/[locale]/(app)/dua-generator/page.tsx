import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import DuaGenerator from "@/components/DuaGenerator";
import { CalligraphyDraw } from "@/components/Ornaments";
import { MoreTiles } from "@/components/PosterTiles";
import { abs, pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "duagen" });
  return pageMeta(locale, "/dua-generator", `${t("metaTitle")} | Quran Masterclass`, t("metaDesc"));
}

export default async function DuaGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "duagen" });
  const ld = { "@context": "https://schema.org", "@type": "WebApplication", name: t("metaTitle"), description: t("metaDesc"), url: abs(`/${locale}/dua-generator`), applicationCategory: "LifestyleApplication", operatingSystem: "Any", inLanguage: locale, offers: { "@type": "Offer", price: "0", priceCurrency: "AED" } };
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <CalligraphyDraw text={"دعاء"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-4xl px-5 py-14 sm:py-20">
          <p className="rise text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{t("kicker")}</p>
          <h1 className="rise font-display mt-3 text-[40px] leading-[1.05] sm:text-6xl" style={{ animationDelay: "120ms" }}>{t("title")}</h1>
          <p className="rise mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70" style={{ animationDelay: "240ms" }}>{t("lead")}</p>
          <p className="rise font-arabic mt-6 text-2xl text-[rgb(var(--gold))]" dir="rtl" lang="ar" style={{ animationDelay: "360ms" }}>وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ <span className="text-sm text-white/45">(40:60)</span></p>
        </div>
      </section>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-5">
        <DuaGenerator />
      </div>
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-4xl gap-10 px-5 py-14 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">{t("timesTitle")}</h2>
            <ol className="mt-6 grid gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/50 font-display text-sm text-gold">{i}</span>
                  <span><b className="block text-[15px]">{t(`time${i}`)}</b><span className="text-[14px] leading-relaxed text-muted">{t(`time${i}d`)}</span></span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">{t("adabTitle")}</h2>
            <ul className="mt-6 grid gap-3">
              {[1, 2, 3, 4].map((i) => <li key={i} className="callout rounded-lg p-4 text-[15px] leading-relaxed">{t(`adab${i}`)}</li>)}
            </ul>
            <Link href="/duas" className="mt-6 inline-flex text-sm font-semibold text-accent hover:underline">{t("more")}</Link>
          </div>
        </div>
      </section>
      <MoreTiles keys={["duas", "prayer", "salah", "community"]} />
    </div>
  );
}
