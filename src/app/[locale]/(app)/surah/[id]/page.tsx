import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Player from "@/components/Player";
import JsonLd from "@/components/JsonLd";
import { RECITERS, getChapter, getResources, getVerses, pickTranslation } from "@/lib/quran";
import { abs, pageMeta } from "@/lib/site";

const valid = (id: string) => {
  const n = Number(id);
  return Number.isInteger(n) && n >= 1 && n <= 114 ? n : null;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const n = valid(id);
  if (!n) return {};
  const t = await getTranslations({ locale, namespace: "seo" });
  const c = await getChapter(n, locale).catch(() => null);
  const vars = { name: c?.name_simple ?? `${n}`, arabic: c?.name_arabic ?? "", verses: c?.verses_count ?? "" };
  return pageMeta(locale, `/surah/${n}`, t("surahTitle", vars), t("surahDesc", vars), t("keywords"));
}

export default async function SurahPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ v?: string; m?: string; r?: string }> }) {
  const { locale, id } = await params;
  const { v, m, r } = await searchParams;
  setRequestLocale(locale);
  const n = valid(id);
  if (!n) notFound();

  // Server-side data: the verses are part of the first HTML, so search engines (and slow phones) see real content at once
  let initial;
  try {
    const [chapter, res] = await Promise.all([getChapter(n, locale), getResources()]);
    const translationId = pickTranslation(locale, res.translations);
    const verses = await getVerses(n, locale, RECITERS[0], translationId);
    initial = { chapter, verses, translationId };
  } catch {
    initial = undefined; // the player falls back to loading in the browser
  }

  const t = await getTranslations({ locale, namespace: "home" });
  const ld = initial && {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Quran Masterclass", item: abs(`/${locale}`) },
      { "@type": "ListItem", position: 2, name: t("surahs"), item: abs(`/${locale}/quran`) },
      { "@type": "ListItem", position: 3, name: initial.chapter.name_simple, item: abs(`/${locale}/surah/${n}`) },
    ],
  };

  return (
    <>
      {ld && <JsonLd data={ld} />}
      <Player chapterId={n} startVerse={Math.max(1, Number(v) || 1)} startHide={m === "1" ? 1 : m === "2" ? 2 : 0} reviewMode={r === "1"} initial={initial} />
    </>
  );
}
