import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import Markdown from "@/components/Markdown";
import MapView from "@/components/MapView";
import { mapContent } from "@/lib/mapContent";
import { abs, pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = await mapContent(locale);
  return pageMeta(locale, "/map", `${c.title} | Quran Masterclass`, c.lead.slice(0, 158));
}

const DOT: Record<string, string> = { strong: "bg-accent", mid: "bg-gold/70", weak: "bg-red-500/80", none: "bg-white/15" };

export default async function MapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = await mapContent(locale);
  const dark = "stage text-[#eef0f3]";
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", url: abs(`/${locale}/map`), mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  return (
    <div>
      <JsonLd data={ld} />

      {/* Hero + the map itself */}
      <section className={`${dark} relative overflow-hidden`}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 85% 10%, rgb(var(--gold)) 0, transparent 40%)" }} />
        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-12 sm:pb-20 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{c.kicker}</p>
              <h1 className="font-display mt-4 text-[44px] leading-[1.02] sm:text-7xl">{c.title}</h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/70">{c.lead}</p>
            </div>
            <dl className="grid grid-cols-3 gap-4 lg:w-[360px]">
              {c.stats.map((s) => <div key={s.l} className="border-s border-white/15 ps-3"><dt className="font-display text-3xl text-[rgb(var(--gold))]">{s.n}</dt><dd className="mt-1 text-xs leading-snug text-white/60">{s.l}</dd></div>)}
            </dl>
          </div>
          <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:p-6">
            <MapView />
          </div>
        </div>
      </section>

      {/* Colours */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{c.readTitle}</h2>
        <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-muted">{c.readLead}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.colors.map((col) => (
            <div key={col.key} className="rounded-lg border border-line bg-surface p-5">
              <div className="flex gap-1">{[0, 1, 2, 3, 4].map((i) => <span key={i} className={`h-5 w-5 rounded-[3px] ${col.key === "none" ? "bg-[rgb(var(--line))]" : DOT[col.key]}`} />)}</div>
              <h3 className="mt-4 text-lg font-bold">{col.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{col.d}</p>
              <p className="mt-4 border-t border-line pt-3 text-sm font-semibold leading-relaxed">{col.todo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className={dark}>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{c.howTitle}</h2>
            <div className="mt-8 grid gap-3">
              {c.views.map((v, i) => (
                <div key={v.t} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--gold))]">0{i + 1} · {v.t}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-white/70">{v.d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:pt-2"><Markdown text={c.howBody} dark /></div>
        </div>
      </section>

      {/* Use */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{c.useTitle}</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {c.uses.map((u, i) => (
            <div key={u.t} className="bg-surface p-6"><p className="font-display text-3xl text-[rgb(var(--gold))]">0{i + 1}</p><h3 className="mt-2 text-lg font-bold">{u.t}</h3><p className="mt-2 text-[15px] leading-relaxed text-muted">{u.d}</p></div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 pb-16 sm:pb-24">
        <h2 className="font-display text-4xl leading-[1.1]">{c.faqTitle}</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {c.faq.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[17px] font-bold">{f.q}<span className="mt-1 text-muted transition group-open:rotate-45">+</span></summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className={dark}>
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:py-24">
          <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{c.finalTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70">{c.finalLead}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/surah/1?shams=1" className="inline-flex h-12 items-center rounded-md btn-gold px-6 text-[15px] font-bold">{c.ctaStart}</Link>
            <Link href="/today" className="inline-flex h-12 items-center rounded-md border border-white/30 px-6 text-[15px] font-bold hover:border-white">{c.ctaToday}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
