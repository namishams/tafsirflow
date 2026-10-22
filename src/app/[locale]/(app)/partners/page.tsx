import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import ContactForm from "@/components/ContactForm";
import { ArrowNext } from "@/components/Icons";
import { BpHero, BpLegal, BpSubNav, SectionHead, StarNum } from "@/components/blueprint/Parts";
import { bpText } from "@/lib/blueprint/text";
import { bpLd } from "@/lib/blueprint/ld";
import { abs, pageMeta } from "@/lib/site";

// Partnership and investment inquiry for Blueprint Shams 4.0 (owner, 23.10.2026). The form is the shared contact form
// (kind "partner": reCAPTCHA v2 checkbox + v3, honeypot, IP limit, word filter; mail "[Partner] …" to info@). Never any
// bank details here: account details only on request after review. Texts: src/lib/blueprint/i18n → partners, form.

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await bpText(locale);
  return pageMeta(locale, "/partners", t.seo.partners.title, t.seo.partners.desc, t.seo.partners.keywords);
}

const TYPE_ICONS = [
  "M4 21V8l8-5 8 5v13M9 21v-6h6v6M8 10h.01M12 10h.01M16 10h.01",
  "M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18",
  "M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.5zM8 21h8M12 17v4M10 8.5v5l4-2.5z",
  "M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z",
  "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3",
  "M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M2 10l10-6 10 6",
];

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await bpText(locale);
  const p = t.partners;
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", url: abs(`/${locale}/partners`), inLanguage: locale, mainEntity: p.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <div>
      <JsonLd data={bpLd(locale, "partners", t)} />
      <JsonLd data={faqLd} />
      <BpHero t={t} title={p.heroTitle} lead={p.heroLead} actions={false}>
        <div className="mx-auto flex max-w-3xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <a href="#bp-form" className="btn-gold inline-flex h-12 items-center justify-center rounded-full px-7 text-[15px] font-bold">{p.formTitle}</a>
          <Link href="/blueprint" className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-7 text-[15px] font-semibold text-white/90 transition hover:border-[rgb(214_180_108)]">{t.common.ctaRead}</Link>
        </div>
      </BpHero>
      <BpSubNav t={t} active="partners" />

      <main className="mx-auto max-w-6xl px-4 sm:px-5">
        {/* partner types */}
        <section className="mt-16" aria-labelledby="bp-types">
          <SectionHead id="bp-types" kicker={p.typesKicker} title={p.typesTitle} />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {p.types.map((x, i) => (
              <li key={x.t} className="pa-card pa-plain p-6">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[rgb(201_166_94)]/15 text-[rgb(138_106_44)] dark:text-[#e9cf99]">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={TYPE_ICONS[i] ?? TYPE_ICONS[0]} /></svg>
                </span>
                <h3 className="mt-4 text-[18px] font-extrabold">{x.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{x.d}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <p className="callout rounded-xl p-4 text-[15px] leading-relaxed">{t.common.shariah}</p>
            <p className="callout rounded-xl p-4 text-[15px] leading-relaxed">{t.common.bank}</p>
          </div>
        </section>

        {/* how an inquiry continues */}
        <section className="mt-24" aria-labelledby="bp-steps">
          <SectionHead id="bp-steps" kicker={p.stepsKicker} title={p.stepsTitle} />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {p.steps.map((s, i) => (
              <li key={s.t} className="pa-card flex gap-4 p-5 pt-6"><StarNum n={i + 1} size={40} /><span className="min-w-0"><span className="block text-[17px] font-bold">{s.t}</span><span className="mt-1 block text-[14.5px] leading-relaxed text-muted">{s.d}</span></span></li>
            ))}
          </ol>
        </section>

        {/* the inquiry form */}
        <section id="bp-form" className="mx-auto mt-24 max-w-2xl scroll-mt-24" aria-labelledby="bp-form-title">
          <SectionHead id="bp-form-title" kicker={p.formKicker} title={p.formTitle} lead={p.formLead} />
          <p className="mt-4 rounded-xl border border-line bg-surface p-4 text-[14px] leading-relaxed text-muted">{t.common.legal}</p>
          <ContactForm kind="partner" partner={t.form} />
          <p className="mt-5 text-[14px] text-muted">{p.reciterNote} <Link href="/reciters/apply" className="font-semibold text-accent hover:underline">{p.reciterLink} <ArrowNext /></Link></p>
        </section>

        {/* questions */}
        <section className="mx-auto mt-24 max-w-3xl" aria-labelledby="bp-faq">
          <h2 id="bp-faq" className="font-display text-3xl sm:text-4xl">{p.faqTitle}</h2>
          <div className="mt-6 grid gap-3">
            {p.faq.map((f) => (
              <details key={f.q} className="pa-card pa-plain group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[17px] font-bold">{f.q}<span aria-hidden className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[rgb(var(--gold))]/50 text-gold transition group-open:rotate-45">+</span></summary>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <BpLegal t={t} />
        <div className="h-16" />
      </main>
    </div>
  );
}
