import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Markdown from "@/components/Markdown";
import JsonLd from "@/components/JsonLd";
import { GUIDES, guideText } from "@/lib/guides";
import { abs, pageMeta } from "@/lib/site";
import { ArrowNext, ArrowBack } from "@/components/Icons";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) return {};
  const gt = guideText(g, locale);
  const m = pageMeta(locale, `/guides/${slug}`, `${gt.title} | Quran Masterclass`, gt.desc, gt.keywords);
  return { ...m, openGraph: { ...m.openGraph, type: "article" } };
}

export default async function GuidePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) notFound();
  const t = await getTranslations("guides");
  const gt = guideText(g, locale);
  const title = gt.title;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: title, description: gt.desc, datePublished: g.date, dateModified: g.date, inLanguage: locale, author: { "@type": "Person", name: "Nami Shams" }, publisher: { "@type": "Organization", name: "Quran Masterclass", logo: abs("/icon-512.png") }, mainEntityOfPage: abs(`/${locale}/guides/${slug}`) },
      { "@type": "FAQPage", inLanguage: locale, mainEntity: gt.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Quran Masterclass", item: abs(`/${locale}`) },
        { "@type": "ListItem", position: 2, name: t("title"), item: abs(`/${locale}/guides`) },
        { "@type": "ListItem", position: 3, name: title, item: abs(`/${locale}/guides/${slug}`) },
      ] },
    ],
  };
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <JsonLd data={ld} />
      <Link href="/guides" className="text-sm font-semibold text-muted hover:text-ink"><ArrowBack /> {t("title")}</Link>
      <h1 className="font-display mt-4 text-4xl leading-tight sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-muted">{t("by")} · {new Date(g.date).toLocaleDateString(locale, { calendar: "gregory", numberingSystem: "latn", day: "numeric", month: "long", year: "numeric" })}</p>
      <article className="mt-4"><Markdown text={gt.body} /></article>
      <section className="mt-12">
        <h2 className="font-display text-2xl">{t("faq")}</h2>
        <div className="mt-4 divide-y divide-line rounded-lg border border-line bg-surface">
          {gt.faq.map((f, i) => (
            <details key={i} className="p-5">
              <summary className="cursor-pointer list-none text-[16px] font-bold">{f.q}</summary>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="text-lg font-bold">{t("related")}</h2>
        <ul className="mt-3 grid gap-2">
          {g.related.map((r) => GUIDES.find((x) => x.slug === r)).filter(Boolean).map((r) => <li key={r!.slug}><Link href={`/guides/${r!.slug}`} className="font-semibold text-accent hover:underline">{guideText(r!, locale).title} <ArrowNext /></Link></li>)}
        </ul>
      </section>
      <div className="mt-10 rounded-lg bg-ink p-6 text-bg">
        <p className="text-lg font-bold">{t("ctaTitle")}</p>
        <Link href="/academy" className="mt-4 inline-flex h-11 items-center rounded-md bg-bg px-5 text-sm font-bold text-ink">{t("cta")}</Link>
      </div>
    </main>
  );
}
