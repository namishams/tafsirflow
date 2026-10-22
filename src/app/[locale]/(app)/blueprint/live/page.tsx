import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { BpCta, BpHero, BpLegal, BpSubNav, NextPage, SectionHead, StarNum, StatusBadge } from "@/components/blueprint/Parts";
import { ConferenceScene, LiveScene, SceneFigure, TimetableScene } from "@/components/blueprint/Scenes";
import { bpText } from "@/lib/blueprint/text";
import { bpLd } from "@/lib/blueprint/ld";
import { pageMeta } from "@/lib/site";

// Blueprint Shams 4.0 – the planned live school: class formats, how a live lesson runs, the weekly timetable,
// conferences with subtitles, safety rules, and the parts it builds on (built today). Texts: blueprint i18n → live.

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await bpText(locale);
  return pageMeta(locale, "/blueprint/live", t.seo.live.title, t.seo.live.desc, t.seo.live.keywords);
}

export default async function LivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await bpText(locale);
  const l = t.live;
  return (
    <div>
      <JsonLd data={bpLd(locale, "live", t)} />
      <BpHero t={t} title={l.heroTitle} lead={l.heroLead}>
        <SceneFigure caption={l.heroScene}><LiveScene t={t} /></SceneFigure>
      </BpHero>
      <BpSubNav t={t} active="live" />

      <main id="bp-start" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          {/* formats */}
          <section className="mt-16" aria-labelledby="bp-formats">
            <SectionHead id="bp-formats" kicker={l.formatsKicker} title={l.formatsTitle} />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {l.formats.map((f, i) => (
                <li key={f.t} className="pa-card p-6 pt-7">
                  <StarNum n={i + 1} size={40} />
                  <h3 className="mt-4 text-[18px] font-extrabold">{f.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.d}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* how a lesson runs */}
          <section className="mt-24" aria-labelledby="bp-flow">
            <SectionHead id="bp-flow" kicker={l.flowKicker} title={l.flowTitle} />
            <ol className="mt-10 grid gap-3 md:grid-cols-5">
              {l.flow.map((f, i) => (
                <li key={f.t} className="relative rounded-xl border border-line bg-surface p-5">
                  <span className="text-[12px] font-extrabold tracking-[0.2em] text-gold" dir="ltr">0{i + 1}</span>
                  <h3 className="mt-2 text-[16.5px] font-extrabold">{f.t}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{f.d}</p>
                  {i < l.flow.length - 1 ? <span aria-hidden className="absolute -end-2.5 top-1/2 z-[1] hidden h-5 w-5 -translate-y-1/2 place-items-center rounded-full border border-[rgb(201_166_94)]/60 bg-surface text-[11px] text-gold md:grid"><span className="rtl:-scale-x-100">›</span></span> : null}
                </li>
              ))}
            </ol>
          </section>

          {/* timetable */}
          <section className="mt-24 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center" aria-labelledby="bp-tt">
            <SectionHead id="bp-tt" kicker={l.timetableKicker} title={l.timetableTitle} lead={l.timetableLead} />
            <SceneFigure caption={l.timetableScene} dark={false}><TimetableScene t={t} locale={locale} /></SceneFigure>
          </section>
        </div>

        {/* conferences */}
        <section className="stage girih relative mt-24 overflow-hidden text-[#eef0f3]" aria-labelledby="bp-conf">
          <span className="bp-orb left-[-10%] top-[-20%] h-[420px] w-[420px] bg-[#1d7a5c]/40" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20">
            <SectionHead id="bp-conf" kicker={l.confKicker} title={l.confTitle} lead={l.confLead} dark center />
            <div className="mt-10"><SceneFigure caption={l.confScene}><ConferenceScene t={t} /></SceneFigure></div>
          </div>
          <div className="pa-arcade" />
        </section>

        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          {/* safety and what it builds on */}
          <section className="mt-24 grid gap-6 lg:grid-cols-2" aria-labelledby="bp-safe">
            <div>
              <SectionHead id="bp-safe" kicker={l.safeKicker} title={l.safeTitle} />
              <ul className="mt-6 grid gap-3">
                {l.safe.map((x) => (
                  <li key={x} className="flex gap-3 rounded-xl border border-line bg-surface p-4 text-[15px] leading-relaxed">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(6 108 78)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 dark:stroke-[rgb(58_190_146)]" aria-hidden><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6zM9 12l2.2 2.2L15.5 10" /></svg>{x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="callout self-start rounded-xl p-6 sm:p-7">
              <h3 className="flex flex-wrap items-center gap-3 text-[20px] font-extrabold">{l.basisTitle} <StatusBadge t={t} built /></h3>
              <ul className="mt-4 grid gap-2.5">
                {l.basis.map((b) => <li key={b} className="flex gap-3 text-[15px] leading-relaxed"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[rgb(201_166_94)]" />{b}</li>)}
              </ul>
            </div>
          </section>

          <BpCta t={t} title={t.overview.ctaTitle} lead={t.overview.ctaLead} />
          <NextPage t={t} active="live" />
          <BpLegal t={t} />
          <div className="h-16" />
        </div>
      </main>
    </div>
  );
}
