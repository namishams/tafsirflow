import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { loadArticle } from "@/lib/seo/articles";
import { loadHub } from "@/lib/seo/hubs";
import { ARTICLE_AR, articleHub } from "@/lib/seo/related";
import { ARTICLE_SLUGS, type ArticleKind } from "@/lib/seo/types";
import { AnswerCard, Faq, LinkPosters, Sections, SeoHero } from "./SeoParts";

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
  const key = `${kind}/${slug}`;
  const url = abs(`/${locale}/${key}`);
  const hubId = articleHub(key);
  const hub = await loadHub(locale, hubId);
  const siblings = (await Promise.all(ARTICLE_SLUGS[kind].filter((s) => s !== slug).map(async (s) => {
    const x = await loadArticle(locale, kind, s);
    return x ? ([`/${kind}/${s}`, x.h1, x.description] as const) : null;
  }))).filter((x): x is NonNullable<typeof x> => !!x);
  const ld = [
    { "@context": "https://schema.org", "@type": "Article", "@id": url, mainEntityOfPage: url, headline: a.h1, description: a.description, abstract: a.answer, inLanguage: locale, author: { "@id": abs("/#org") }, publisher: { "@id": abs("/#org") }, isPartOf: { "@id": abs("/#site") } },
    { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: locale, mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Quran Masterclass", item: abs(`/${locale}`) }, { "@type": "ListItem", position: 2, name: hub.h1, item: abs(`/${locale}/${hubId}`) }, { "@type": "ListItem", position: 3, name: a.h1, item: url }] },
  ];
  return (
    <div>
      <JsonLd data={ld} />
      <SeoHero kicker={a.kicker} h1={a.h1} intro={a.intro} ar={ARTICLE_AR[key] ?? "قرآن"} />
      <div className="isl-marble isl-under">
        <article className="mx-auto max-w-3xl px-5 pb-16 pt-12 sm:pt-16">
          <nav className="mb-6 text-[13px] font-semibold text-muted"><Link href={`/${hubId}`} className="hover:text-accent hover:underline">{hub.h1}</Link></nav>
          <AnswerCard text={a.answer} />
          <Sections sections={a.sections} />
          {a.note && <p className="isl-card mt-10 border-s-4 border-[rgb(var(--isl-gold))] p-4 text-[15px] leading-relaxed text-muted">{a.note}</p>}
          <Faq title={a.faqTitle} faq={a.faq} />
          <div className="mt-12 text-center"><Link href={a.cta[0]} className="btn-gold inline-flex h-12 items-center rounded-full px-7 text-[15px] font-bold">{a.cta[1]}</Link></div>
        </article>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-20">
        <LinkPosters title={a.linksTitle} links={a.links} badge={a.kicker} />
        {siblings.length > 0 && <LinkPosters title={a.kicker} links={[[`/${hubId}`, hub.h1], ...siblings.map(([h, t]) => [h, t] as [string, string])]} badge={a.kicker} descs={Object.fromEntries([[`/${hubId}`, hub.description], ...siblings.map(([h, , d]) => [h, d])])} />}
      </div>
    </div>
  );
}
