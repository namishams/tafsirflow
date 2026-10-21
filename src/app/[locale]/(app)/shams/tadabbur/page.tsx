import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { getChapters } from "@/lib/quran";
import { abs, pageMeta } from "@/lib/site";
import { s2Meta } from "@/components/learn/shams2/meta";
import { TadabburScreen } from "@/components/learn/shams2/Tadabbur";
import type { NameRow } from "@/components/learn/shams2/ui";

// /shams/tadabbur?s=&v= – tadabbur and maqasid of a surah (mirrors mobile/src/app/shams/tadabbur.tsx). One indexable page
// per surah (canonical /shams/tadabbur?s=N, without the verse); surah names come from the server.
type SP = Promise<{ s?: string | string[]; v?: string | string[] }>;
const one = (x: string | string[] | undefined) => (Array.isArray(x) ? x[0] : x);
const surahOf = (x: string | undefined) => Math.max(1, Math.min(114, Math.trunc(Number(x)) || 1));
const namesOf = (locale: string): Promise<NameRow[]> =>
  getChapters(locale).then((cs) => cs.map((c) => [c.id, c.name_simple, c.name_arabic, (c as { revelation_place?: string }).revelation_place] as NameRow)).catch(() => []);

export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SP }): Promise<Metadata> {
  const { locale } = await params;
  const s = surahOf(one((await searchParams).s));
  const names = await namesOf(locale);
  const m = s2Meta(locale, "tadabbur", { s: names.find((r) => r[0] === s)?.[1] ?? String(s) });
  return pageMeta(locale, `/shams/tadabbur?s=${s}`, m.title, m.description);
}

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SP }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const p = await searchParams;
  const s = surahOf(one(p.s));
  const v = Number(one(p.v)) || undefined;
  const names = await namesOf(locale);
  const m = s2Meta(locale, "tadabbur", { s: names.find((r) => r[0] === s)?.[1] ?? String(s) });
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: m.title.split(" | ")[0], description: m.description, url: abs(`/${locale}/shams/tadabbur?s=${s}`), inLanguage: locale, isAccessibleForFree: true, publisher: { "@type": "Organization", name: "Quran Masterclass", url: abs("") } };
  return (<><JsonLd data={ld} /><TadabburScreen key={s} surah={s} verse={v} names={names} /></>);
}
