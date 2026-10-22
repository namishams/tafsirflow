import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { ArrowNext } from "@/components/Icons";
import { BpCta, BpHero, BpLegal, BpSubNav, NextPage, SectionHead, StarNum, StatusBadge } from "@/components/blueprint/Parts";
import { AcademyScene, KidsScene, SceneFigure } from "@/components/blueprint/Scenes";
import { bpText } from "@/lib/blueprint/text";
import { bpLd } from "@/lib/blueprint/ld";
import { verseQuote } from "@/lib/verseQuotes";
import { pageMeta } from "@/lib/site";

// Blueprint Shams 4.0 – reciter academy and competitions in good (owner: competition only as competing in good, nothing
// staked, nothing random; never name a living reciter as partner – "renowned reciters" until an agreement is signed).
// Quran 83:26 from the bundled Quran data (never typed by hand). Texts: blueprint i18n → academy.

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await bpText(locale);
  return pageMeta(locale, "/blueprint/academy", t.seo.academy.title, t.seo.academy.desc, t.seo.academy.keywords);
}

export default async function AcademyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await bpText(locale);
  const a = t.academy;
  return (
    <div>
      <JsonLd data={bpLd(locale, "academy", t)} />
      <BpHero t={t} title={a.heroTitle} lead={a.heroLead}>
        <SceneFigure caption={a.heroScene}><AcademyScene t={t} /></SceneFigure>
      </BpHero>
      <BpSubNav t={t} active="academy" />

      <main id="bp-start" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          {/* the path from learner to reciter */}
          <section className="mt-16" aria-labelledby="bp-path">
            <SectionHead id="bp-path" kicker={a.pathKicker} title={a.pathTitle} />
            <ol className="relative mt-10 grid gap-4 lg:grid-cols-5">
              {a.path.map((p, i) => (
                <li key={p.t} className={`relative flex flex-col rounded-xl p-5 pt-6 ${p.built ? "stage text-[#eef0f3]" : "pa-card"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <StarNum n={i + 1} size={40} />
                    {p.built ? <span className="bp-badge border border-[rgb(214_180_108)]/60 text-[#e9cf99]">{t.common.built}</span> : <StatusBadge t={t} built={false} />}
                  </div>
                  <h3 className={`mt-4 text-[17px] font-extrabold ${p.built ? "text-[#f3e2b6]" : ""}`}>{p.t}</h3>
                  <p className={`mt-2 text-[14.5px] leading-relaxed ${p.built ? "text-white/75" : "text-muted"}`}>{p.d}</p>
                  {i === 0 ? <Link href="/reciter-path" className="mt-3 text-sm font-bold text-[#e9cf99] hover:underline">{a.pathLink} <ArrowNext /></Link> : null}
                </li>
              ))}
            </ol>
            <div className="callout mt-6 rounded-xl p-5 sm:p-6">
              <h3 className="text-[18px] font-extrabold">{a.mentorsTitle}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{a.mentorsLead}</p>
            </div>
          </section>
        </div>

        {/* competitions in good */}
        <section className="stage girih relative mt-24 overflow-hidden text-[#eef0f3]" aria-labelledby="bp-comp">
          <span className="bp-orb right-[-10%] top-[-20%] h-[420px] w-[420px] bg-[#d6b46c]/15" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20">
            <SectionHead id="bp-comp" kicker={a.compKicker} title={a.compTitle} lead={a.compLead} dark />
            <figure className="mx-auto mt-10 max-w-3xl text-center">
              <p className="font-callig text-[30px] leading-[1.7] text-[#ecd59a] sm:text-[42px]" dir="rtl" lang="ar">{verseQuote("imlaei", "83:26", 3)}</p>
              <figcaption className="mt-2 text-[13px] text-white/60">{a.verseRef} · {a.verseNote}</figcaption>
            </figure>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {a.compRules.map((r, i) => (
                <li key={r.t} className="rounded-xl border border-[rgb(214_180_108)]/30 bg-white/[0.04] p-5">
                  <span className="text-[12px] font-extrabold tracking-[0.2em] text-[rgb(233_207_153)]" dir="ltr">0{i + 1}</span>
                  <h3 className="mt-2 text-[17px] font-extrabold text-[#f3e2b6]">{r.t}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/75">{r.d}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="pa-arcade" />
        </section>

        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          {/* children */}
          <section className="mt-24 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center" aria-labelledby="bp-kids">
            <SectionHead id="bp-kids" kicker={a.kidsKicker} title={a.kidsTitle} lead={a.kidsLead} />
            <SceneFigure caption={a.kidsScene} dark={false}><KidsScene t={t} /></SceneFigure>
          </section>

          {/* video series of many reciters */}
          <section className="pa-card mt-16 p-6 sm:p-8">
            <h2 className="text-[22px] font-extrabold">{a.seriesTitle}</h2>
            <p className="mt-2 max-w-3xl text-[15.5px] leading-relaxed text-muted">{a.seriesLead}</p>
          </section>

          <BpCta t={t} title={t.overview.ctaTitle} lead={t.overview.ctaLead} />
          <NextPage t={t} active="academy" />
          <BpLegal t={t} />
          <div className="h-16" />
        </div>
      </main>
    </div>
  );
}
