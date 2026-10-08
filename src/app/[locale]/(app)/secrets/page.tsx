import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import WordCounter from "@/components/WordCounter";
import { MoreTiles } from "@/components/PosterTiles";
import { secretsContent, type Verdict } from "@/lib/secrets/content";
import { getVerseByKey } from "@/lib/quran";
import { abs, pageMeta } from "@/lib/site";
import { CalligraphyDraw } from "@/components/Ornaments";
import { IslamArcadeLine, IslamArchWindow, IslamBreak, IslamCorners, IslamDome, IslamNum, IslamRain, IslamStarMark, saw, starPath } from "@/components/art/IslamArt";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = await secretsContent(locale);
  return pageMeta(locale, "/secrets", `${c.title} | Quran Masterclass`, c.lead.slice(0, 158));
}

// Arabic wording of a reference like "71:10-12" from Quran.com (through our cache); nothing if it is not available
async function arabicOf(ref: string): Promise<string> {
  const [s, range] = ref.split(":");
  const [a, b = a] = range.split("-").map(Number);
  try {
    const vs = await Promise.all(Array.from({ length: b - a + 1 }, (_, i) => getVerseByKey(`${s}:${a + i}`, "en", 20)));
    if (vs.some((v, i) => v.verse_key !== `${s}:${a + i}`)) return "";
    return vs.map((v) => v.text_uthmani).join(" ۝ ");
  } catch { return ""; }
}

const BADGE: Record<Verdict, string> = { true: "border-accent/35 bg-accent/10 text-accent", false: "border-[rgb(var(--isl-garnet))]/35 bg-[rgb(var(--isl-garnet))]/10 text-[rgb(var(--isl-garnet))]", method: "border-[rgb(var(--isl-gold-soft))]/45 bg-[rgb(var(--isl-gold-soft))]/10 text-[rgb(var(--isl-gold))]" };
const STAR = <svg viewBox="0 0 24 24" className="h-full w-full"><path d={starPath(12, 12, 11, 5)} fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="1" /><circle cx="12" cy="12" r="2.2" fill="currentColor" /></svg>;

export default async function SecretsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = await secretsContent(locale);
  const arabic = await Promise.all(c.promises.map((p) => arabicOf(p.ref)));
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", url: abs(`/${locale}/secrets`), inLanguage: locale, mainEntity: c.claims.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) };
  const refLink = (ref: string) => { const [s, r] = ref.split(":"); return `/surah/${s}?v=${r.split("-")[0]}`; };

  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih isl-arcade relative z-[1] overflow-hidden text-[#eef0f3]">
        <IslamDome id="dome-sec" className="-end-40 -top-44 w-[560px] sm:-end-24 sm:-top-48 sm:w-[780px]" />
        <IslamRain fall={700} className="opacity-70" />
        <CalligraphyDraw text={"أسرار"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-14 sm:pb-14 sm:pt-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{c.kicker}</p>
          <h1 className="font-display mt-4 max-w-3xl text-[40px] leading-[1.05] sm:text-6xl">{c.title}</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/75">{saw(c.lead)}</p>
        </div>
        <div className="relative mx-auto max-w-6xl px-5 pb-24 sm:pb-32">
          <div className="relative overflow-hidden rounded-2xl border border-[rgb(233_207_153)]/25 bg-white/[0.04] p-5 sm:p-8">
            <span aria-hidden className="illum-frame opacity-60" />
            <div className="relative">
              <h2 className="font-display text-2xl sm:text-3xl">{c.counterTitle}</h2>
              <p className="mt-2 max-w-2xl text-[15px] text-white/70">{c.counterLead}</p>
              <div className="mt-6"><WordCounter words={c.words} times={c.times} spots={c.spots} note={c.allahNote} locale={locale} /></div>
              <p className="mt-6 border-t border-white/10 pt-4 text-[12px] leading-relaxed text-white/50">{c.method}</p>
            </div>
          </div>
        </div>
        <IslamArcadeLine />
      </section>

      <div className="isl-marble isl-under">
        <section className="mx-auto max-w-4xl px-5 pb-14 pt-14 sm:pb-20 sm:pt-20">
          <h2 className="font-display text-3xl sm:text-4xl">{c.claimsTitle}</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-ink/75">{c.claimsLead}</p>
          <div className="mt-8 grid gap-3">
            {c.claims.map((x) => (
              <details key={x.q} className="isl-faq isl-card group p-0">
                <summary className="flex cursor-pointer list-none items-start gap-3 p-4 sm:p-5">
                  <span className="min-w-0 flex-1">
                    <span className={`mb-2 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold sm:mb-0 sm:me-3 ${BADGE[x.v]}`}>{c.verdicts[x.v]}</span>
                    <span className="block text-[16px] font-semibold leading-snug sm:inline">{saw(x.q)}</span>
                  </span>
                  <span aria-hidden className="isl-plus h-7 w-7 shrink-0 rounded-full border border-[rgb(var(--isl-gold-soft))]/50 text-[rgb(var(--isl-gold))]">+</span>
                </summary>
                <p className="px-4 pb-5 text-[15px] leading-relaxed text-muted sm:px-5">{saw(x.a)}</p>
              </details>
            ))}
          </div>
        </section>

        <IslamBreak className="!my-0 px-5" />

        <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <h2 className="font-display text-3xl sm:text-4xl">{c.factsTitle}</h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {c.facts.map((f, i) => (
              <li key={f.title} className="isl-card isl-card-hover flex flex-col overflow-hidden p-2.5 sm:p-3">
                <IslamArchWindow i={i} ar={f.ar} id={`sf${i}`} />
                <div className="flex flex-1 flex-col px-1.5 pb-2 pt-3 text-center">
                  <span className="font-display text-[18px] leading-tight sm:text-[20px]">{saw(f.title)}</span>
                  <span className="mt-2 text-[13.5px] leading-relaxed text-muted">{saw(f.body)}</span>
                  <span className="mt-auto pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--isl-gold))] rtl:tracking-normal">{f.src}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {c.more && c.more.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 pb-14 sm:pb-20">
            <h2 className="font-display text-3xl sm:text-4xl">{c.moreTitle}</h2>
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {c.more.map((f, i) => (
                <li key={f.title} className="isl-card relative overflow-hidden p-5">
                  <span aria-hidden className="font-callig pointer-events-none absolute -end-1 -top-1 whitespace-nowrap text-[3.4rem] leading-none text-[rgb(var(--isl-gold))] opacity-[0.12]" dir="rtl">{f.ar}</span>
                  <IslamNum n={i + 1} className="relative !h-9 !w-9" />
                  <h3 className="font-display relative mt-2 text-[19px] leading-tight">{saw(f.title)}</h3>
                  <p className="relative mt-2 text-[14.5px] leading-relaxed text-muted">{saw(f.body)}</p>
                  <p className="relative mt-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgb(var(--isl-gold))] rtl:tracking-normal">{f.src}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mx-auto max-w-4xl px-5 pb-14 sm:pb-20">
          <h2 className="font-display text-3xl sm:text-4xl">{c.readTitle}</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-ink/75">{c.readLead}</p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {c.hadith.map((h, i) => (
              <li key={h.src} className={c.hadith.length % 2 && i === c.hadith.length - 1 ? "sm:col-span-2" : ""}>
                <figure className="isl-quote !my-0 h-full">
                  <span className="isl-quote-star" aria-hidden>{STAR}</span>
                  <blockquote className="text-[17px]">{saw(h.text)}</blockquote>
                  <figcaption><span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--isl-gold))] rtl:tracking-normal">{h.src}</span></figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-4xl px-5 pb-14 sm:pb-20">
          <h2 className="font-display text-3xl sm:text-4xl">{c.wealthTitle}</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-ink/75">{c.wealthLead}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {c.promises.map((p, i) => (
              <li key={p.ref} className="isl-card flex flex-col p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[16px] font-bold leading-snug">{p.title}</h3>
                  <Link href={refLink(p.ref)} className="isl-ref !m-0 shrink-0"><IslamStarMark />{p.ref}</Link>
                </div>
                {arabic[i] && <p className="font-arabic mt-4 rounded-xl border border-[rgb(var(--isl-gold-soft))]/35 bg-[rgb(var(--isl-gold-soft))]/[0.07] px-3 py-2 text-center text-[21px] leading-[2.1] text-[rgb(var(--isl-head))]" dir="rtl" lang="ar">{arabic[i]}</p>}
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[16px] leading-relaxed">{c.wealthNote}</p>
          <figure className="isl-card relative mt-10 overflow-hidden px-6 py-10 text-center sm:px-12">
            <IslamCorners />
            <blockquote className="isl-serif relative text-[21px] leading-relaxed text-[rgb(var(--isl-head))] sm:text-[24px]">{saw(c.wealthHadith.text)}</blockquote>
            <figcaption className="relative mt-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--isl-gold))] rtl:tracking-normal">{c.wealthHadith.src}</figcaption>
          </figure>
        </section>
      </div>

      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <IslamRain fall={600} className="opacity-60" />
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <h2 className="font-display text-3xl sm:text-4xl">{c.placesTitle}</h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/70">{c.placesLead}</p>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {c.places.map((pl) => {
              const inner = (
                <>
                  <span aria-hidden className="niche" />
                  <span aria-hidden className="font-callig pointer-events-none absolute inset-x-0 top-10 text-center text-[2.6rem] leading-none text-[rgb(233_207_153)]/[0.22] transition duration-700 group-hover:text-[rgb(233_207_153)]/40" dir="rtl">{pl.ar}</span>
                  <span className="font-display relative text-[19px] leading-tight">{pl.title}</span>
                  <span className="relative mt-2 text-[13.5px] leading-relaxed text-white/70">{saw(pl.body)}</span>
                  {pl.src && <span className="relative mt-3 text-[11px] font-semibold text-[rgb(var(--gold))]">{pl.src}</span>}
                </>
              );
              const cls = "arch relative flex h-full min-h-[17rem] flex-col justify-end overflow-hidden border border-[rgb(233_207_153)]/20 bg-white/[0.04] p-5 pt-24";
              return <li key={pl.title} className="min-w-0">{pl.href ? <Link href={pl.href} className={`group ${cls} hover:border-[rgb(233_207_153)]/50`}>{inner}</Link> : <div className={`group ${cls}`}>{inner}</div>}</li>;
            })}
          </ul>
        </div>
      </section>

      <section className="isl-marble">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center sm:py-20">
          <p className="text-[13px] leading-relaxed text-muted">{c.note}</p>
          <IslamBreak />
          <h2 className="font-display text-3xl sm:text-4xl">{c.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-[16px] text-ink/75">{c.ctaBody}</p>
          <Link href="/surah/1?shams=1" className="btn-gold mt-6 inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{c.cta}</Link>
        </div>
      </section>

      <MoreTiles keys={["shams", "islam", "arabic", "radio"]} className="pt-12" />
    </div>
  );
}
