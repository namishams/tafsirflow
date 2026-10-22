import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { ArrowNext } from "@/components/Icons";
import { BpCta, BpHero, BpLegal, BpSubNav, NextPage, SectionHead, StarNum } from "@/components/blueprint/Parts";
import { SceneFigure, StudioScene } from "@/components/blueprint/Scenes";
import StudioPlan from "@/components/blueprint/StudioPlan";
import { bpText } from "@/lib/blueprint/text";
import { bpLd } from "@/lib/blueprint/ld";
import { pageMeta } from "@/lib/site";

// Blueprint Shams 4.0 – the planned studio: floor plan (illustration), equipment by category (no brands, no prices),
// the production line with scholarly review, recording principles. Texts: src/lib/blueprint/i18n → studio.

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await bpText(locale);
  return pageMeta(locale, "/blueprint/studio", t.seo.studio.title, t.seo.studio.desc, t.seo.studio.keywords);
}

const KIT_ICONS = [
  "M3 7.5A1.5 1.5 0 0 1 4.5 6h10A1.5 1.5 0 0 1 16 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 3 16.5zM16 10.5l5-3v9l-5-3",
  "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3",
  "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z",
  "M4 21V11c0-4 3.6-7.4 8-9 4.4 1.6 8 5 8 9v10M8 21v-8c0-2.2 1.8-4 4-5.4 2.2 1.4 4 3.2 4 5.4v8",
  "M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.2 7.8L20 19M8.2 16.2L20 5",
  "M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
];

export default async function StudioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await bpText(locale);
  const s = t.studio;
  return (
    <div>
      <JsonLd data={bpLd(locale, "studio", t)} />
      <BpHero t={t} title={s.heroTitle} lead={s.heroLead}>
        <SceneFigure caption={s.heroScene}><StudioScene t={t} /></SceneFigure>
      </BpHero>
      <BpSubNav t={t} active="studio" />

      <main id="bp-start" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          {/* floor plan */}
          <section className="mt-16" aria-labelledby="bp-plan">
            <SectionHead id="bp-plan" kicker={s.planKicker} title={s.planTitle} lead={s.planLead} />
            <figure className="mt-8">
              <div className="stage overflow-x-auto rounded-[14px] p-3 sm:p-5">
                <StudioPlan className="block h-auto w-full min-w-[620px]" />
              </div>
              <figcaption className="mt-3 text-[13px] text-muted">{s.planCaption}</figcaption>
            </figure>
            <ol className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {s.legend.map((l, i) => (
                <li key={l} className="flex items-start gap-3 text-[14.5px] leading-snug">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/10 text-[12px] font-extrabold text-gold" dir="ltr">{i + 1}</span>
                  <span className="pt-1">{l}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* equipment */}
          <section className="mt-24" aria-labelledby="bp-kit">
            <SectionHead id="bp-kit" kicker={s.kitKicker} title={s.kitTitle} lead={s.kitLead} />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {s.kit.map((k, i) => (
                <li key={k.t} className="pa-card pa-plain p-6">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[rgb(201_166_94)]/15 text-[rgb(138_106_44)] dark:text-[#e9cf99]">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={KIT_ICONS[i] ?? KIT_ICONS[0]} /></svg>
                  </span>
                  <h3 className="mt-4 text-[18px] font-extrabold">{k.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{k.d}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* production line */}
          <section className="mt-24" aria-labelledby="bp-line">
            <SectionHead id="bp-line" kicker={s.lineKicker} title={s.lineTitle} />
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
              {s.line.map((l, i) => (
                <li key={l.t} className={`relative rounded-xl border p-4 pt-5 ${i === s.line.length - 1 ? "stage border-transparent text-[#eef0f3]" : "border-line bg-surface"}`}>
                  <StarNum n={i + 1} size={38} />
                  <h3 className={`mt-3 text-[15.5px] font-extrabold leading-snug ${i === s.line.length - 1 ? "text-[#f3e2b6]" : ""}`}>{l.t}</h3>
                  <p className={`mt-1.5 text-[13.5px] leading-relaxed ${i === s.line.length - 1 ? "text-white/75" : "text-muted"}`}>{l.d}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* principles */}
          <section className="mt-24 grid gap-8 lg:grid-cols-[1fr_1.1fr]" aria-labelledby="bp-rules">
            <SectionHead id="bp-rules" kicker={s.rulesKicker} title={s.rulesTitle} />
            <ul className="callout grid gap-3 rounded-xl p-6 sm:p-7">
              {s.rules.map((r) => (
                <li key={r} className="flex gap-3 text-[15.5px] leading-relaxed"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(201 166 94)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>{r}</li>
              ))}
            </ul>
          </section>

          {/* sponsor */}
          <section className="pa-card mt-16 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-2xl">
              <h2 className="text-[22px] font-extrabold">{s.sponsorTitle}</h2>
              <p className="mt-2 text-[15.5px] leading-relaxed text-muted">{s.sponsorLead}</p>
            </div>
            <Link href="/partners" className="btn-gold inline-flex h-12 shrink-0 items-center rounded-full px-7 text-[15px] font-bold">{t.common.ctaPartner} <span className="ms-2"><ArrowNext /></span></Link>
          </section>

          <BpCta t={t} title={t.overview.ctaTitle} lead={t.overview.ctaLead} />
          <NextPage t={t} active="studio" />
          <BpLegal t={t} />
          <div className="h-16" />
        </div>
      </main>
    </div>
  );
}
