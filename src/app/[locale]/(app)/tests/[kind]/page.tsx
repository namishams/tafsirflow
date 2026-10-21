import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { isTestKind, normalRef, srsMeta } from "@/components/learn/srs/meta";
import { TestRunner } from "@/components/learn/srs/Tests";

// /tests/<kind>?ref=<juz | surah | deck> – one test under the exam rules (mirrors the app's /tests/[kind]);
// the Madrasa links to /tests/juz?ref=N
export async function generateMetadata({ params }: { params: Promise<{ locale: string; kind: string }> }): Promise<Metadata> {
  const { locale, kind } = await params;
  if (!isTestKind(kind)) return {};
  const m = srsMeta(locale, "test", kind);
  return { ...pageMeta(locale, `/tests/${kind}`, m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string; kind: string }>; searchParams: Promise<{ ref?: string | string[] }> }) {
  const { locale, kind } = await params;
  setRequestLocale(locale);
  if (!isTestKind(kind)) notFound();
  const { ref } = await searchParams;
  const r = normalRef(kind, typeof ref === "string" ? ref : undefined);
  return <TestRunner key={`${kind}:${r}`} kind={kind} refId={r} />;
}
