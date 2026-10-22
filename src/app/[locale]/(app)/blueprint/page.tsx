import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import JsonLd from "@/components/JsonLd";
import { ArrowNext } from "@/components/Icons";
import { BpCta, BpHero, BpLegal, BpSubNav, NextPage, SectionHead, StarNum, StatusBadge } from "@/components/blueprint/Parts";
import { HeroScene, SceneFigure } from "@/components/blueprint/Scenes";
import { bpText, operatorLine } from "@/lib/blueprint/text";
import { bpLd } from "@/lib/blueprint/ld";
import { countryName } from "@/lib/countries";
import { COMPANY, founderName } from "@/lib/company";
import { pageMeta } from "@/lib/site";

// Blueprint Shams 4.0 – overview for investors and strategic partners (owner, 23.10.2026). Honest split between what is
// built in this repository (linked) and what is planned; categories instead of amounts; no offer, no returns.
// Texts: src/lib/blueprint/i18n/<locale>.json.

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await bpText(locale);
  return pageMeta(locale, "/blueprint", t.seo.overview.title, t.seo.overview.desc, t.seo.overview.keywords);
}

// links of the built features (same order as overview.built); "" = no page of its own
const BUILT_HREF = ["/shams/method", "/quran", "/masterclass", "/verify", "/assistant", "/talents", "/messages", "/teacher", "/together", "/ranking", "/nahj", "/supporters", "", "/app"];
const PILLAR_HREF = ["/blueprint/studio", "/blueprint/studio", "/blueprint/live", "/blueprint/academy", "/blueprint/academy", "/talents"];
const SHOTS = ["shams", "swipe", "hadith", "nahj", "stickers", "feed"] as const;
const GCC = ["AE", "SA", "KW", "QA", "BH", "OM"];
const WORLD = ["ID", "MY", "TR", "PK", "BD", "EG", "BN"];

const icon = (d: string) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
const WHO_ICONS = [
  "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  "M12 3c-3.6 0-6 2.6-6 6 0 2.6 1 4.2.6 6.4 2.2-1.4 3.6-1.9 5.4-1.9s3.2.5 5.4 1.9c-.4-2.2.6-3.8.6-6.4 0-3.4-2.4-6-6-6zM5 21c1.2-2.8 3.8-4.5 7-4.5s5.8 1.7 7 4.5",
  "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 7.5V12l3 2",
  "M3 17h18M5.5 17a6.5 6.5 0 0 1 13 0M12 4v3M4.2 8.2l2 2M19.8 8.2l-2 2",
  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z",
  "M12 5.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM6 8h12M12 8v6m0 0l-3.5 7M12 14l3.5 7",
  "M8 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM16.5 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM3.5 21c.5-4.5 2.2-7 4.5-7s4 2.5 4.5 7M13 21c.3-3.4 1.6-5.5 3.5-5.5S19.7 17.6 20 21",
];
const USE_ICONS = [
  "M3 7.5A1.5 1.5 0 0 1 4.5 6h10A1.5 1.5 0 0 1 16 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 3 16.5zM16 10.5l5-3v9l-5-3",
  "M4 20V9l8-5 8 5v11M9 20v-6h6v6",
  "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.8c2 .6 3.2 2.4 3.5 5.2",
  "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z",
  "M4 7h16v4H4zM4 13h16v4H4zM7.5 9h.01M7.5 15h.01",
  "M4 6h9M8.5 4v2c0 4-2 7.5-5 9M6 10c1 2.5 3.4 4.6 6 5.6M13 20l4-10 4 10M14.5 17h5",
  "M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.5zM8 21h8M12 17v4",
  "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6zM9 12l2.2 2.2L15.5 10",
];

export default async function BlueprintPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await bpText(locale);
  const o = t.overview;
  const facts: [string | number, string][] = [[114, o.factSurahs], [routing.locales.length, o.factLangs], [7, o.factSteps], [1, o.factAccount]];
  return (
    <div>
      <JsonLd data={bpLd(locale, "overview", t)} />
      <BpHero t={t} title={o.heroTitle} lead={o.heroLead} note={o.heroFree}>
        <SceneFigure caption={o.heroScene}><HeroScene t={t} /></SceneFigure>
      </BpHero>
      <BpSubNav t={t} active="overview" />

      <main id="bp-start" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          {/* facts from the product itself (no market numbers) */}
          <dl className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map(([n, l]) => (
              <div key={l} className="pa-card pa-plain px-4 py-5 text-center">
                <dt className="font-display text-[38px] leading-none text-gold sm:text-5xl" dir="ltr">{n}</dt>
                <dd className="mt-2 text-[13.5px] leading-snug text-muted">{l}</dd>
              </div>
            ))}
          </dl>

          {/* vision */}
          <section className="mt-20 grid gap-10 lg:grid-cols-2 lg:items-center" aria-labelledby="bp-vision">
            <SectionHead id="bp-vision" kicker={o.visionKicker} title={o.visionTitle} lead={o.visionLead} />
            <ol className="relative grid gap-4">
              <li className="pa-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-[19px] font-extrabold">{o.todayTitle}</h3><StatusBadge t={t} built /></div>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{o.todayBody}</p>
              </li>
              <li aria-hidden className="mx-auto -my-2 grid h-9 w-9 place-items-center rounded-full border border-[rgb(201_166_94)]/60 bg-surface text-gold"><span className="rotate-90 rtl:-rotate-90"><ArrowNext /></span></li>
              <li className="stage girih relative overflow-hidden rounded-[12px] p-6 text-[#eef0f3]">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-[19px] font-extrabold text-[#f3e2b6]">{o.nextTitle}</h3><span className="bp-badge border border-[rgb(214_180_108)]/50 text-[#e9cf99]">{t.common.planned}</span></div>
                <p className="mt-2 text-[15px] leading-relaxed text-white/75">{o.nextBody}</p>
              </li>
            </ol>
          </section>

          {/* why not simply YouTube */}
          <section className="mt-24" aria-labelledby="bp-yt">
            <SectionHead id="bp-yt" title={o.ytTitle} lead={o.ytLead} />
            <div className="mt-8 hidden overflow-hidden rounded-xl border border-line bg-surface md:block">
              <table className="bp-compare w-full text-[15px]">
                <thead className="bg-bg text-[13px] font-semibold uppercase tracking-[0.08em] text-muted rtl:tracking-normal">
                  <tr><th scope="col" className="w-[18%]">{o.ytColTopic}</th><th scope="col" className="w-[36%]">{o.ytColA}</th><th scope="col" className="w-[46%] text-gold">{o.ytColB}</th></tr>
                </thead>
                <tbody>
                  {o.yt.map((r) => (
                    <tr key={r.k}>
                      <th scope="row" className="font-bold">{r.k}</th>
                      <td className="text-muted"><span className="flex gap-2"><span aria-hidden className="mt-0.5 text-muted/70">–</span>{r.a}</span></td>
                      <td className="font-semibold"><span className="flex gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(201 166 94)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>{r.b}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-8 grid gap-3 md:hidden">
              {o.yt.map((r) => (
                <li key={r.k} className="rounded-xl border border-line bg-surface p-4">
                  <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-gold rtl:tracking-normal">{r.k}</p>
                  <p className="mt-2 text-[14px] text-muted"><span className="font-semibold">{o.ytColA}:</span> {r.a}</p>
                  <p className="mt-1.5 text-[15px] font-semibold"><span className="text-gold">{o.ytColB}:</span> {r.b}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* who it reaches */}
          <section className="mt-24" aria-labelledby="bp-who">
            <SectionHead id="bp-who" title={o.whoTitle} lead={o.whoLead} />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {o.who.map((w, i) => (
                <li key={w.t} className={`pa-card pa-plain p-5 ${i === 0 ? "lg:col-span-1" : ""}`}>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[rgb(201_166_94)]/15 text-[rgb(138_106_44)] dark:text-[#e9cf99]">{icon(WHO_ICONS[i] ?? WHO_ICONS[0])}</span>
                  <h3 className="mt-3 text-[17px] font-bold">{w.t}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{w.d}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* six pillars */}
          <section className="mt-24" aria-labelledby="bp-pillars">
            <SectionHead id="bp-pillars" kicker={o.pillarsKicker} title={o.pillarsTitle} lead={o.pillarsLead} />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {o.pillars.map((p, i) => (
                <li key={p.t}>
                  <Link href={PILLAR_HREF[i] ?? "/blueprint"} className={`group flex h-full flex-col rounded-[12px] p-6 ${i === 0 ? "stage girih relative overflow-hidden text-[#eef0f3]" : "pa-card pa-card-hover"}`}>
                    <StarNum n={i + 1} />
                    <h3 className={`mt-4 text-[19px] font-extrabold ${i === 0 ? "text-[#f3e2b6]" : ""}`}>{p.t}</h3>
                    <p className={`mt-2 flex-1 text-[15px] leading-relaxed ${i === 0 ? "text-white/75" : "text-muted"}`}>{p.d}</p>
                    <span className={`mt-4 text-sm font-bold ${i === 0 ? "text-[#e9cf99]" : "text-accent"}`}>{p.cta} <ArrowNext /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* the product today: real screenshots, built vs planned */}
          <section className="mt-24" aria-labelledby="bp-today">
            <SectionHead id="bp-today" kicker={o.productKicker} title={o.productTitle} lead={o.productLead} />
            <ul className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-5 sm:px-5 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
              {SHOTS.map((s, i) => (
                <li key={s} className={`w-[46%] max-w-[200px] shrink-0 snap-center sm:w-[30%] lg:w-auto lg:max-w-none ${i % 2 ? "lg:translate-y-6" : ""}`}>
                  <figure>
                    <div className="rounded-[2rem] bg-gradient-to-b from-[#3a3f47] via-[#1c1f24] to-[#2b2f36] p-[5px] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.6)] ring-1 ring-black/10">
                      <div className="relative overflow-hidden rounded-[1.7rem] bg-black">
                        <Image src={`/images/app/${s}.webp`} alt={o.shots[s]} width={600} height={1304} sizes="(min-width: 1024px) 170px, (min-width: 640px) 30vw, 46vw" className="block h-auto w-full" />
                      </div>
                    </div>
                    <figcaption className="mt-2.5 text-center text-[13px] font-semibold text-muted">{o.shots[s]}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] text-muted">{o.shotsNote}</p>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1.35fr_1fr]">
              <div>
                <h3 className="flex items-center gap-3 text-[20px] font-extrabold">{o.builtTitle} <StatusBadge t={t} built /></h3>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {o.built.map((b, i) => {
                    const href = BUILT_HREF[i];
                    const body = (<><span className="block text-[16px] font-bold">{b.t}</span><span className="mt-1 block text-[14px] leading-relaxed text-muted">{b.d}</span></>);
                    return (
                      <li key={b.t} className="min-w-0">
                        {href ? <Link href={href} className="block h-full rounded-xl border border-line bg-surface p-4 transition hover:border-[rgb(201_166_94)]">{body}</Link> : <div className="h-full rounded-xl border border-line bg-surface p-4">{body}</div>}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h3 className="flex items-center gap-3 text-[20px] font-extrabold">{o.plannedTitle} <StatusBadge t={t} built={false} /></h3>
                <ul className="mt-5 grid gap-2.5">
                  {o.planned.map((p) => (
                    <li key={p} className="flex gap-3 rounded-xl border border-dashed border-[rgb(201_166_94)]/55 bg-[rgb(201_166_94)]/[0.05] p-4 text-[15px] leading-relaxed">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[rgb(201_166_94)]" />{p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* roadmap */}
          <section className="mt-24" aria-labelledby="bp-road">
            <SectionHead id="bp-road" kicker={o.roadKicker} title={o.roadTitle} lead={o.roadLead} />
            <ol className="mt-10 grid gap-4 lg:grid-cols-5">
              {o.road.map((r, i) => (
                <li key={r.t} className="pa-card relative flex flex-col p-5 pt-6">
                  <div className="flex items-center justify-between gap-2"><StarNum n={i + 1} size={40} /><span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted rtl:tracking-normal">{t.common.planned}</span></div>
                  <h3 className="mt-4 text-[17px] font-extrabold">{r.t}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{r.d}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* financing */}
          <section className="mt-24" aria-labelledby="bp-fund">
            <SectionHead id="bp-fund" kicker={o.fundKicker} title={o.fundTitle} lead={o.fundLead} />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {o.fund.map((f, i) => (
                <div key={f.t} className={`rounded-[12px] p-6 ${i === 2 ? "stage girih relative overflow-hidden text-[#eef0f3]" : "pa-card"}`}>
                  <StarNum n={i + 1} size={40} />
                  <h3 className={`mt-4 text-[18px] font-extrabold ${i === 2 ? "text-[#f3e2b6]" : ""}`}>{f.t}</h3>
                  <p className={`mt-2 text-[15px] leading-relaxed ${i === 2 ? "text-white/75" : "text-muted"}`}>{f.d}</p>
                </div>
              ))}
            </div>
            {/* the flow: partners -> production -> free website / Pro in the app */}
            <div aria-hidden className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-line bg-surface p-5 text-[14px] font-bold sm:flex-row sm:justify-center sm:gap-3">
              <span className="btn-gold rounded-full px-4 py-2">{o.flowPartners}</span>
              <span className="text-gold"><span className="inline-block rotate-90 sm:rotate-0 rtl:sm:-scale-x-100">→</span></span>
              <span className="rounded-full border border-[rgb(201_166_94)]/60 px-4 py-2">{o.flowProduction}</span>
              <span className="text-gold"><span className="inline-block rotate-90 sm:rotate-0 rtl:sm:-scale-x-100">→</span></span>
              <span className="flex flex-wrap justify-center gap-2"><span className="rounded-full bg-[rgb(6_108_78)]/10 px-4 py-2 text-accent">{o.flowWeb}</span><span className="rounded-full bg-[rgb(6_108_78)]/10 px-4 py-2 text-accent">{o.flowApp}</span></span>
            </div>
          </section>

          {/* use of funds: categories, no amounts */}
          <section className="mt-24" aria-labelledby="bp-use">
            <SectionHead id="bp-use" kicker={o.useKicker} title={o.useTitle} lead={o.useLead} />
            <ul className="mt-8 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
              {o.use.map((u, i) => (
                <li key={u.t} className="pa-card pa-plain p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[rgb(6_108_78)]/10 text-accent">{icon(USE_ICONS[i] ?? USE_ICONS[0])}</span>
                  <h3 className="mt-3 text-[16.5px] font-bold">{u.t}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{u.d}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[14px] text-muted">{o.useNote}</p>
          </section>
        </div>

        {/* why the Gulf */}
        <section className="stage girih relative mt-24 overflow-hidden text-[#eef0f3]" aria-labelledby="bp-gcc">
          <span className="bp-orb right-[-10%] top-[-20%] h-[420px] w-[420px] bg-[#d6b46c]/15" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-24">
            <SectionHead id="bp-gcc" kicker={o.gccKicker} title={o.gccTitle} lead={o.gccLead} dark />
            <p className="mt-6 max-w-3xl text-[17px] leading-relaxed text-white/85">{o.gccCall}</p>
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {GCC.map((c) => (
                <li key={c} className="rounded-xl border border-[rgb(214_180_108)]/35 bg-white/[0.04] px-4 py-4 text-center">
                  <span className="block text-[12px] font-bold tracking-[0.2em] text-[rgb(233_207_153)]" dir="ltr">{c}</span>
                  <span className="mt-1 block text-[15px] font-bold">{countryName(c, locale)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-[rgb(233_207_153)] rtl:tracking-normal">{o.gccWorld}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {WORLD.map((c) => <li key={c} className="rounded-full border border-white/20 px-4 py-2 text-[14px] font-semibold text-white/85">{countryName(c, locale)}</li>)}
            </ul>
            <p className="font-display mx-auto mt-14 max-w-3xl text-center text-[24px] leading-snug text-[#f3e2b6] sm:text-[32px]">{o.gccDedication}</p>
          </div>
          <div className="pa-arcade" />
        </section>

        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          {/* why now */}
          <section className="mt-24" aria-labelledby="bp-now">
            <SectionHead id="bp-now" kicker={o.nowKicker} title={o.nowTitle} />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {o.now.map((n, i) => (
                <li key={n.t} className="pa-card flex gap-4 p-5 pt-6"><StarNum n={i + 1} size={42} /><span className="min-w-0"><span className="block text-[17px] font-bold">{n.t}</span><span className="mt-1 block text-[15px] leading-relaxed text-muted">{n.d}</span></span></li>
              ))}
            </ul>
          </section>

          {/* founder and company */}
          <section className="mt-24 grid gap-4 lg:grid-cols-[1.4fr_1fr]" aria-labelledby="bp-founder">
            <div className="pa-card flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
              <span aria-hidden className="stage grid h-28 w-28 shrink-0 place-items-center rounded-full ring-2 ring-[rgb(214_180_108)]/70">
                <span className="font-callig text-[30px] leading-none text-[#ecd59a]" dir="rtl">{founderName("ar")}</span>
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gold rtl:tracking-normal">{o.founderKicker}</p>
                <h2 id="bp-founder" className="font-display mt-2 text-[28px] leading-tight">{founderName(locale)}</h2>
                <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{o.founderBody}</p>
                <Link href="/about#founder" className="mt-4 inline-block text-sm font-bold text-accent hover:underline">{o.founderLink} <ArrowNext /></Link>
              </div>
            </div>
            <div className="callout rounded-xl p-6 sm:p-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gold rtl:tracking-normal">{o.operatorTitle}</p>
              <p className="mt-3 text-[20px] font-extrabold leading-snug">{COMPANY.legalName} – {COMPANY.brand}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{operatorLine(t)}</p>
              <p className="mt-3 text-[15px] font-semibold" dir="ltr">{COMPANY.email}</p>
            </div>
          </section>

          {/* who we are looking for */}
          <section className="mt-24" aria-labelledby="bp-partner">
            <SectionHead id="bp-partner" kicker={o.partnerKicker} title={o.partnerTitle} lead={o.partnerLead} />
            <ul className="mt-6 flex flex-wrap gap-2">
              {t.partners.types.map((p) => <li key={p.t}><Link href="/partners" className="pa-chip">{p.t}</Link></li>)}
            </ul>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <p className="rounded-xl border border-line bg-surface p-4 text-[15px] leading-relaxed">{t.common.shariah}</p>
              <p className="rounded-xl border border-line bg-surface p-4 text-[15px] leading-relaxed">{t.common.bank}</p>
            </div>
          </section>

          <BpCta t={t} title={o.ctaTitle} lead={o.ctaLead} />
          <NextPage t={t} active="overview" />
          <BpLegal t={t} />
          <div className="h-16" />
        </div>
      </main>
    </div>
  );
}
