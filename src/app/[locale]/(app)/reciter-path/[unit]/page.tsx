import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { ALL_UNITS, unitById } from "@/lib/learn/reciter-path/curriculum";
import { rpLevelWord, rpMeta } from "@/components/learn/reciter-path/meta";
import { UnitPage } from "@/components/learn/reciter-path/Screens";

export function generateStaticParams() {
  return ALL_UNITS.map((u) => ({ unit: u.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; unit: string }> }): Promise<Metadata> {
  const { locale, unit } = await params;
  const u = unitById(unit);
  if (!u) return {};
  const m = rpMeta(locale, "unit", { t: `${rpLevelWord(locale)} ${u.level} · ${unit}` });
  return { ...pageMeta(locale, `/reciter-path/${unit}`, m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string; unit: string }> }) {
  const { locale, unit } = await params;
  setRequestLocale(locale);
  if (!unitById(unit)) notFound();
  return <UnitPage id={unit} />;
}
