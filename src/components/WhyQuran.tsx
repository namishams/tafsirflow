import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeCorners, HomeVerse, StarGlyph } from "./art/HomeOrnaments";
import { Rosette } from "./Ornaments";

// Why learning the Quran comes first – Quran and authentic hadith, shown on the home page and the Shams page.
// Each saying sits on a small marble card; the verse (54:17) is set in gold across the full width.
export default async function WhyQuran({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "shams" });
  return (
    <section className="relative overflow-hidden">
      <span aria-hidden className="hm-wm font-callig -end-6 top-10 text-[150px] sm:text-[240px]">القرآن</span>
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("whyTitle")}</h2>
        <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-muted">{t("whyLead")}</p>
        <div className="mt-10 grid gap-3 sm:gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <figure key={n} className="hm-card hm-lift flex flex-col p-6 sm:p-7">
              <HomeCorners />
              <svg aria-hidden viewBox="0 0 40 28" className="h-6 w-8 text-[rgb(var(--hm-gold))] rtl:-scale-x-100"><path d="M4 26V15C4 8 8 3 16 2v5c-4 1-6 4-6 8h6v11zM24 26V15c0-7 4-12 12-13v5c-4 1-6 4-6 8h6v11z" fill="currentColor" fillOpacity=".22" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
              <blockquote className="mt-3 flex-1 text-[17px] leading-relaxed">{t(`why${n}`)}</blockquote>
              <figcaption className="mt-4 flex items-center gap-2 text-sm font-semibold text-[rgb(var(--hm-gold-d))]"><StarGlyph size={10} />{t(`why${n}s`)}</figcaption>
            </figure>
          ))}
          <figure className="stage relative overflow-hidden rounded-2xl px-6 py-8 text-center text-[#eef0f3] sm:px-10 md:col-span-2">
            <span aria-hidden className="illum-frame" />
            {["start-1.5 top-1.5", "end-1.5 top-1.5", "bottom-1.5 start-1.5", "bottom-1.5 end-1.5"].map((c) => <Rosette key={c} size={22} className={`absolute ${c}`} />)}
            <HomeVerse text="وَلَقَدۡ يَسَّرۡنَا ٱلۡقُرۡءَانَ لِلذِّكۡرِ فَهَلۡ مِن مُّدَّكِرٖ" cite="54:17" className="relative text-[24px] sm:text-[32px]" />
            {locale !== "ar" && <blockquote className="relative mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-white/85">{t("why5")}</blockquote>}
            <figcaption className="relative mt-3 text-sm font-semibold text-[rgb(var(--gold))]">{t("why5s")}</figcaption>
          </figure>
        </div>
        <p className="mt-10 max-w-3xl text-[17px] leading-relaxed">{t("whyClose")}</p>
        <Link href="/academy" className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-ink px-6 text-[15px] font-bold text-bg shadow-[inset_0_0_0_1px_rgb(233_207_153/.3)] transition hover:opacity-90">{t("whyCta")} <span className="rtl:-scale-x-100">→</span></Link>
      </div>
    </section>
  );
}
