import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { loadHub } from "@/lib/seo/hubs";
import type { HubId } from "@/lib/seo/types";

type P = { params: Promise<{ locale: string }> };

// Static, server-rendered landing page for a search intent. The text lives in src/lib/seo/hubs/<locale>.ts
export const hubMetadata = (id: HubId) => async ({ params }: P): Promise<Metadata> => {
  const { locale } = await params;
  const h = await loadHub(locale, id);
  return pageMeta(locale, `/${id}`, h.title, h.description);
};

export const hubPage = (id: HubId) => async function Hub({ params }: P) {
  const { locale } = await params;
  setRequestLocale(locale);
  const h = await loadHub(locale, id);
  const url = abs(`/${locale}/${id}`);
  const ld = [
    { "@context": "https://schema.org", "@type": "WebPage", "@id": url, url, name: h.title, description: h.description, abstract: h.answer, inLanguage: locale, isPartOf: { "@id": abs("/#site") }, publisher: { "@id": abs("/#org") } },
    { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: locale, mainEntity: h.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Quran Masterclass", item: abs(`/${locale}`) }, { "@type": "ListItem", position: 2, name: h.h1, item: url }] },
  ];
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative z-[1] overflow-hidden text-[#eef0f3]">
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-14 sm:pb-20 sm:pt-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{h.kicker}</p>
          <h1 className="font-display mt-4 text-[34px] leading-[1.1] sm:text-5xl">{h.h1}</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/80">{h.intro}</p>
          <Link href={h.cta[0]} className="btn-gold mt-7 inline-flex h-12 items-center rounded-full px-7 text-[15px] font-bold">{h.cta[1]}</Link>
        </div>
      </section>
      <article className="mx-auto max-w-4xl px-5 py-12">
        <p className="isl-card mb-10 p-5 text-[17px] font-semibold leading-relaxed" data-answer>{h.answer}</p>
        {h.sections.map((s) => (
          <section key={s.h2} className="mb-10">
            <h2 className="font-display text-2xl sm:text-3xl">{s.h2}</h2>
            {s.p.map((p, i) => <p key={i} className="mt-3 text-[16px] leading-relaxed text-muted">{p}</p>)}
            {s.links && <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[15px] font-bold">{s.links.map(([href, label]) => <Link key={href} href={href} className="text-accent hover:underline">{label}</Link>)}</p>}
          </section>
        ))}
        <section className="mb-10">
          <h2 className="font-display text-2xl sm:text-3xl">{h.stepsTitle}</h2>
          <ol className="mt-5 flex flex-col gap-3">
            {h.steps.map((s, i) => (
              <li key={s.title} className="isl-card flex gap-4 p-4 sm:p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[rgb(var(--isl-gold-soft))]/50 text-[15px] font-bold text-[rgb(var(--isl-gold))]">{i + 1}</span>
                <div><h3 className="text-[17px] font-bold">{s.title}</h3><p className="mt-1 text-[15px] leading-relaxed text-muted">{s.body}</p></div>
              </li>
            ))}
          </ol>
        </section>
        <section className="mb-10">
          <h2 className="font-display text-2xl sm:text-3xl">{h.faqTitle}</h2>
          <div className="mt-5 flex flex-col gap-3">
            {h.faq.map((f) => (
              <details key={f.q} className="isl-card group p-4 sm:p-5">
                <summary className="cursor-pointer text-[16px] font-bold">{f.q}</summary>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-display text-2xl sm:text-3xl">{h.linksTitle}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {h.links.map(([href, label]) => <li key={href}><Link href={href} className="isl-card block p-3 text-[15px] font-bold text-accent hover:underline">{label}</Link></li>)}
          </ul>
        </section>
      </article>
    </div>
  );
}
