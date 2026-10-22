import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { loadArticle } from "@/lib/seo/articles";
import { ARTICLE_SLUGS, type ArticleKind } from "@/lib/seo/types";

type P = { params: Promise<{ locale: string; slug: string }> };

export const articleStatic = (kind: ArticleKind) => () => ARTICLE_SLUGS[kind].map((slug) => ({ slug }));

export const articleMetadata = (kind: ArticleKind) => async ({ params }: P): Promise<Metadata> => {
  const { locale, slug } = await params;
  const a = await loadArticle(locale, kind, slug);
  if (!a) return {};
  return pageMeta(locale, `/${kind}/${slug}`, a.title, a.description);
};

export const articlePage = (kind: ArticleKind) => async function ArticleRoute({ params }: P) {
  const { locale, slug } = await params;
  if (!ARTICLE_SLUGS[kind].includes(slug)) notFound();
  setRequestLocale(locale);
  const a = await loadArticle(locale, kind, slug);
  if (!a) notFound();
  const url = abs(`/${locale}/${kind}/${slug}`);
  const ld = [
    { "@context": "https://schema.org", "@type": "Article", "@id": url, mainEntityOfPage: url, headline: a.h1, description: a.description, abstract: a.answer, inLanguage: locale, author: { "@type": "Person", name: "Nami Shams" }, publisher: { "@id": abs("/#org") }, isPartOf: { "@id": abs("/#site") } },
    { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: locale, mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Quran Masterclass", item: abs(`/${locale}`) }, { "@type": "ListItem", position: 2, name: a.h1, item: url }] },
  ];
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative z-[1] overflow-hidden text-[#eef0f3]">
        <div className="relative mx-auto max-w-3xl px-5 pb-14 pt-14 sm:pb-16 sm:pt-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{a.kicker}</p>
          <h1 className="font-display mt-4 text-[32px] leading-[1.12] sm:text-5xl">{a.h1}</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-white/80">{a.intro}</p>
        </div>
      </section>
      <article className="mx-auto max-w-3xl px-5 py-10">
        <p className="isl-card mb-10 p-5 text-[17px] font-semibold leading-relaxed" data-answer>{a.answer}</p>
        {a.sections.map((s) => (
          <section key={s.h2} className="mb-9">
            <h2 className="font-display text-2xl sm:text-3xl">{s.h2}</h2>
            {s.p.map((p, i) => <p key={i} className="mt-3 text-[16px] leading-[1.8] text-muted">{p}</p>)}
            {s.links && <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[15px] font-bold">{s.links.map(([href, label]) => <Link key={href} href={href} className="text-accent hover:underline">{label}</Link>)}</p>}
          </section>
        ))}
        {a.note && <p className="isl-card mb-9 p-4 text-[15px] leading-relaxed text-muted">{a.note}</p>}
        <section className="mb-9">
          <h2 className="font-display text-2xl sm:text-3xl">{a.faqTitle}</h2>
          <div className="mt-5 flex flex-col gap-3">
            {a.faq.map((f) => (
              <details key={f.q} className="isl-card p-4 sm:p-5"><summary className="cursor-pointer text-[16px] font-bold">{f.q}</summary><p className="mt-3 text-[15px] leading-relaxed text-muted">{f.a}</p></details>
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-display text-2xl sm:text-3xl">{a.linksTitle}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">{a.links.map(([href, label]) => <li key={href}><Link href={href} className="isl-card block p-3 text-[15px] font-bold text-accent hover:underline">{label}</Link></li>)}</ul>
          <Link href={a.cta[0]} className="btn-gold mt-8 inline-flex h-12 items-center rounded-full px-7 text-[15px] font-bold">{a.cta[1]}</Link>
        </section>
      </article>
    </div>
  );
}
