import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Markdown from "@/components/Markdown";
import JsonLd from "@/components/JsonLd";
import { GUIDES } from "@/lib/guides";
import { abs, pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) return {};
  const de = locale === "de";
  const m = pageMeta(locale, `/guides/${slug}`, `${de ? g.title_de : g.title_en} | Quran Masterclass`, de ? g.desc_de : g.desc_en, de ? g.keywords_de : g.keywords_en);
  return { ...m, openGraph: { ...m.openGraph, type: "article" } };
}

export default async function GuidePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) notFound();
  const t = await getTranslations("guides");
  const de = locale === "de";
  const title = de ? g.title_de : g.title_en;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: title, description: de ? g.desc_de : g.desc_en, datePublished: g.date, dateModified: g.date, inLanguage: locale, author: { "@type": "Person", name: "Nami Shams" }, publisher: { "@type": "Organization", name: "Quran Masterclass", logo: abs("/icon.svg") }, mainEntityOfPage: abs(`/${locale}/guides/${slug}`) },
      { "@type": "FAQPage", inLanguage: locale, mainEntity: g.faq.map((f) => ({ "@type": "Question", name: de ? f.q_de : f.q_en, acceptedAnswer: { "@type": "Answer", text: de ? f.a_de : f.a_en } })) },
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
      <Link href="/guides" className="text-sm font-semibold text-muted hover:text-ink">← {t("title")}</Link>
      <h1 className="font-display mt-4 text-4xl leading-tight sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-muted">{t("by")} · {new Date(g.date).toLocaleDateString(locale, { calendar: "gregory", numberingSystem: "latn", day: "numeric", month: "long", year: "numeric" })}</p>
      <article className="mt-4"><Markdown text={de ? g.body_de : g.body_en} /></article>
      <section className="mt-12">
        <h2 className="font-display text-2xl">{t("faq")}</h2>
        <div className="mt-4 divide-y divide-line rounded-lg border border-line bg-surface">
          {g.faq.map((f, i) => (
            <details key={i} className="p-5">
              <summary className="cursor-pointer list-none text-[16px] font-bold">{de ? f.q_de : f.q_en}</summary>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{de ? f.a_de : f.a_en}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="text-lg font-bold">{t("related")}</h2>
        <ul className="mt-3 grid gap-2">
          {g.related.map((r) => GUIDES.find((x) => x.slug === r)).filter(Boolean).map((r) => <li key={r!.slug}><Link href={`/guides/${r!.slug}`} className="font-semibold text-accent hover:underline">{de ? r!.title_de : r!.title_en} →</Link></li>)}
        </ul>
      </section>
      <div className="mt-10 rounded-lg bg-ink p-6 text-bg">
        <p className="text-lg font-bold">{t("ctaTitle")}</p>
        <Link href="/academy" className="mt-4 inline-flex h-11 items-center rounded-md bg-bg px-5 text-sm font-bold text-ink">{t("cta")}</Link>
      </div>
    </main>
  );
}
