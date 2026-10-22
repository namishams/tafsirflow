import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { organizationLd } from "@/lib/company";
import { loadHub } from "@/lib/seo/hubs";
import { loadArticle } from "@/lib/seo/articles";
import { HUB_AR, HUB_ARTICLES } from "@/lib/seo/related";
import type { ArticleKind, HubId } from "@/lib/seo/types";
import { AnswerCard, Faq, LinkPosters, Sections, SeoHero, Steps } from "./SeoParts";

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
  const related = (await Promise.all(HUB_ARTICLES[id].map(async (k) => {
    const [kind, slug] = k.split("/") as [ArticleKind, string];
    const a = await loadArticle(locale, kind, slug);
    return a ? { href: `/${k}`, title: a.h1, desc: a.description, kicker: a.kicker } : null;
  }))).filter((x): x is NonNullable<typeof x> => !!x);
  const ld = [
    { "@context": "https://schema.org", ...organizationLd(abs) },
    { "@context": "https://schema.org", "@type": "WebPage", "@id": url, url, name: h.title, description: h.description, abstract: h.answer, inLanguage: locale, isPartOf: { "@id": abs("/#site") }, publisher: { "@id": abs("/#org") }, about: h.h1 },
    { "@context": "https://schema.org", "@type": "HowTo", name: h.stepsTitle, description: h.answer, inLanguage: locale, step: h.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body })) },
    { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: locale, mainEntity: h.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Quran Masterclass", item: abs(`/${locale}`) }, { "@type": "ListItem", position: 2, name: h.h1, item: url }] },
  ];
  return (
    <div>
      <JsonLd data={ld} />
      <SeoHero kicker={h.kicker} h1={h.h1} intro={h.intro} ar={HUB_AR[id]} cta={h.cta} />
      <div className="isl-marble isl-under">
        <article className="mx-auto max-w-4xl px-5 pb-16 pt-12 sm:pt-16">
          <AnswerCard text={h.answer} />
          <Sections sections={h.sections} />
          <Steps title={h.stepsTitle} steps={h.steps} />
          <Faq title={h.faqTitle} faq={h.faq} />
        </article>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-20">
        {related.length > 0 && <LinkPosters title={related[0].kicker} links={related.map((r) => [r.href, r.title])} badge={related[0].kicker} descs={Object.fromEntries(related.map((r) => [r.href, r.desc]))} />}
        <LinkPosters title={h.linksTitle} links={h.links} badge={h.kicker} />
      </div>
    </div>
  );
}
