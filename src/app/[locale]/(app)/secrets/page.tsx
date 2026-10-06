import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import WordCounter from "@/components/WordCounter";
import { Divider } from "@/components/Ornaments";
import { MoreTiles, TONES } from "@/components/PosterTiles";
import { secretsContent, type Verdict } from "@/lib/secrets/content";
import { getVerseByKey } from "@/lib/quran";
import { abs, pageMeta } from "@/lib/site";

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

const BADGE: Record<Verdict, string> = { true: "bg-accent/15 text-accent", false: "bg-red-500/10 text-red-600 dark:text-red-400", method: "bg-gold/15 text-gold" };

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
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <p aria-hidden className="font-callig pointer-events-none absolute -end-4 -top-2 select-none text-[150px] leading-none text-[rgb(var(--gold))] opacity-[0.09] sm:text-[240px]" dir="rtl">أسرار</p>
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{c.kicker}</p>
          <h1 className="font-display mt-4 max-w-3xl text-[40px] leading-[1.05] sm:text-6xl">{c.title}</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70">{c.lead}</p>
        </div>
        <div className="relative mx-auto max-w-6xl px-5 pb-14 sm:pb-20">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <h2 className="font-display text-2xl sm:text-3xl">{c.counterTitle}</h2>
            <p className="mt-2 max-w-2xl text-[15px] text-white/65">{c.counterLead}</p>
            <div className="mt-6"><WordCounter words={c.words} times={c.times} spots={c.spots} note={c.allahNote} locale={locale} /></div>
            <p className="mt-6 border-t border-white/10 pt-4 text-[12px] leading-relaxed text-white/50">{c.method}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
        <h2 className="font-display text-3xl sm:text-4xl">{c.claimsTitle}</h2>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">{c.claimsLead}</p>
        <div className="mt-8 grid gap-3">
          {c.claims.map((x) => (
            <details key={x.q} className="group rounded-xl border border-line bg-surface p-4 sm:p-5">
              <summary className="flex cursor-pointer list-none items-start gap-3">
                <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${BADGE[x.v]}`}>{c.verdicts[x.v]}</span>
                <span className="min-w-0 flex-1 text-[16px] font-semibold leading-snug">{x.q}</span>
                <span className="mt-0.5 text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{x.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Divider className="pb-4" />

      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <h2 className="font-display text-3xl sm:text-4xl">{c.factsTitle}</h2>
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {c.facts.map((f, i) => (
            <li key={f.title} className="relative flex min-h-[13rem] flex-col justify-end overflow-hidden rounded-lg p-5 text-white ring-1 ring-inset ring-white/[0.06]" style={{ background: TONES[i % TONES.length] }}>
              <span aria-hidden className="font-callig pointer-events-none absolute -end-1 top-1 whitespace-nowrap text-[4.5rem] leading-none text-white/[0.08]" dir="rtl">{f.ar}</span>
              <span className="font-display relative text-[21px] leading-tight">{f.title}</span>
              <span className="relative mt-2 text-[13.5px] leading-relaxed text-white/75">{f.body}</span>
              <span className="relative mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--gold))]">{f.src}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
          <h2 className="font-display text-3xl sm:text-4xl">{c.readTitle}</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-muted">{c.readLead}</p>
          <ul className="mt-8 grid gap-4">
            {c.hadith.map((h) => (
              <li key={h.src} className="border-s-2 border-gold/60 ps-4">
                <p className="text-[17px] leading-relaxed">{h.text}</p>
                <p className="mt-1.5 text-[13px] font-semibold text-gold">{h.src}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
        <h2 className="font-display text-3xl sm:text-4xl">{c.wealthTitle}</h2>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">{c.wealthLead}</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {c.promises.map((p, i) => (
            <li key={p.ref} className="rounded-xl border border-line bg-surface p-4 sm:p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[16px] font-bold">{p.title}</h3>
                <Link href={refLink(p.ref)} className="shrink-0 text-[13px] font-semibold tabular-nums text-accent hover:underline">{p.ref}</Link>
              </div>
              {arabic[i] && <p className="font-arabic mt-3 text-[21px] leading-[2.1]" dir="rtl">{arabic[i]}</p>}
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[16px] leading-relaxed">{c.wealthNote}</p>
        <figure className="mt-6 rounded-xl border border-gold/40 bg-gold/5 p-5 text-center">
          <blockquote className="font-display text-xl leading-relaxed">{c.wealthHadith.text}</blockquote>
          <figcaption className="mt-2 text-sm text-gold">{c.wealthHadith.src}</figcaption>
        </figure>
      </section>

      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <h2 className="font-display text-3xl sm:text-4xl">{c.placesTitle}</h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/70">{c.placesLead}</p>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {c.places.map((pl) => {
              const inner = (
                <>
                  <span aria-hidden className="font-callig pointer-events-none absolute -end-1 top-1 whitespace-nowrap text-[3.6rem] leading-none text-white/[0.08]" dir="rtl">{pl.ar}</span>
                  <span className="font-display relative text-[19px] leading-tight">{pl.title}</span>
                  <span className="relative mt-2 text-[13.5px] leading-relaxed text-white/70">{pl.body}</span>
                  {pl.src && <span className="relative mt-3 text-[11px] font-semibold text-[rgb(var(--gold))]">{pl.src}</span>}
                </>
              );
              const cls = "relative flex h-full min-h-[14rem] flex-col justify-end overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-5";
              return <li key={pl.title} className="min-w-0">{pl.href ? <Link href={pl.href} className={`group ${cls} hover:border-white/30`}>{inner}</Link> : <div className={cls}>{inner}</div>}</li>;
            })}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-14 text-center">
        <p className="text-[13px] leading-relaxed text-muted">{c.note}</p>
        <h2 className="font-display mt-10 text-3xl sm:text-4xl">{c.ctaTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[16px] text-muted">{c.ctaBody}</p>
        <Link href="/surah/1?shams=1" className="btn-gold mt-6 inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{c.cta}</Link>
      </section>

      <MoreTiles keys={["shams", "islam", "arabic", "radio"]} />
    </div>
  );
}
