import type { Metadata } from "next";
import { ShamsPromo } from "@/components/learn/ShamsExplain";
import { setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { metaFor } from "@/components/learn/courses/meta";
import { CATALOG, txs } from "@/lib/learn/courses/catalog";
import CoursesHome from "@/components/learn/courses/CoursesHome";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = metaFor(locale, "home");
  return pageMeta(locale, "/courses", m.title, m.description);
}

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: CATALOG.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        name: txs(c.title, locale),
        description: txs(c.lead, locale),
        url: abs(`/${locale}/courses/${c.id}`),
        inLanguage: locale,
        isAccessibleForFree: true,
        provider: { "@type": "Organization", name: "Quran Masterclass", sameAs: abs("") },
      },
    })),
  };
  return (
    <>
      <JsonLd data={ld} />
      <CoursesHome />
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-5 md:pb-16"><ShamsPromo /></div>
    </>
  );
}
