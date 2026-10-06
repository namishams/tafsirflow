import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Markdown from "@/components/Markdown";
import JsonLd from "@/components/JsonLd";
import { aboutContent } from "@/lib/aboutContent";
import { abs, pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return pageMeta(locale, "/about", t("seoTitle"), t("seoDesc"));
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const c = aboutContent(locale);
  const dark = "stage text-[#eef0f3]";
  const ld = { "@context": "https://schema.org", "@type": "AboutPage", url: abs(`/${locale}/about`), mainEntity: { "@type": "Organization", name: "Quran Masterclass", founder: { "@type": "Person", name: "Nami Shams" }, foundingLocation: "Dubai", email: "info@quranmasterclass.com", url: abs("/") } };
  return (
    <div>
      <JsonLd data={ld} />

      {/* Hero */}
      <section className={`${dark} relative overflow-hidden`}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 15% 0%, rgb(var(--gold)) 0, transparent 45%)" }} />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{c.eyebrow}</p>
          <h1 className="font-display mt-4 max-w-4xl text-[42px] leading-[1.04] sm:text-7xl">{c.title}</h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/70">{c.lead}</p>
          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {c.facts.map((f) => <div key={f.l} className="border-s border-white/15 ps-4"><dt className="font-display text-4xl text-[rgb(var(--gold))]">{f.n}</dt><dd className="mt-1 text-sm text-white/60">{f.l}</dd></div>)}
          </dl>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <article className="[&_h2:first-child]:mt-0"><Markdown text={c.story} /></article>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-24">
        <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{c.valuesTitle}</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {c.values.map((v, i) => (
            <div key={v.t} className="bg-surface p-6"><p className="font-display text-3xl text-[rgb(var(--gold))]">0{i + 1}</p><h3 className="mt-2 text-lg font-bold">{v.t}</h3><p className="mt-2 text-[15px] leading-relaxed text-muted">{v.d}</p></div>
          ))}
        </div>
        <div className="mt-12 rounded-lg border border-line border-s-4 border-s-gold bg-surface p-6 sm:p-8">
          <h2 className="font-display text-3xl leading-tight">{c.freeTitle}</h2>
          <Markdown text={c.free} />
        </div>
      </section>

      {/* Dubai and the Quran */}
      <section className={`${dark} relative overflow-hidden`}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 90% 30%, rgb(var(--gold)) 0, transparent 40%)" }} />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{c.dubaiEyebrow}</p>
          <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[1.08] sm:text-6xl">{c.dubaiTitle}</h2>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/70">{c.dubaiLead}</p>
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">
            <Markdown text={c.dubai} dark />
            <ol className="grid content-start gap-3">
              {c.dubaiMoments.map((m) => (
                <li key={m.t} className="rounded-md border border-white/10 bg-white/[0.03] p-5">
                  <p className="font-display text-2xl text-[rgb(var(--gold))]">{m.t}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/70">{m.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Thanks */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
        <p className="eyebrow text-gold">{c.thanksEyebrow}</p>
        <h2 className="font-display mt-2 text-4xl leading-tight">{c.thanksTitle}</h2>
        <Markdown text={c.thanks} />
      </section>

      {/* Letter */}
      <section className="mx-auto max-w-3xl px-5 pb-16 sm:pb-24">
        <figure className="rounded-lg border border-line bg-surface p-6 sm:p-10">
          <h2 className="font-display text-3xl leading-tight">{c.letterTitle}</h2>
          <blockquote className="font-display mt-2 text-[19px] leading-relaxed"><Markdown text={c.letter} /></blockquote>
          <figcaption className="mt-8 border-t border-line pt-5"><p className="font-display text-2xl">{c.signature}</p><p className="text-sm text-muted">{c.signatureRole}</p></figcaption>
        </figure>
        <h2 className="font-display mt-14 text-3xl">{c.contactTitle}</h2>
        <Markdown text={c.contact} />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/shams" className="inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-bold text-bg">{t("ctaShams")}</Link>
          <Link href="/feedback" className="inline-flex h-11 items-center rounded-md border border-line px-5 text-sm font-bold hover:border-ink">{t("ctaFeedback")}</Link>
        </div>
      </section>
    </div>
  );
}
