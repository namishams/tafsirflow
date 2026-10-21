import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { DECK_ROUTE_IDS, isDeck, srsMeta } from "@/components/learn/srs/meta";
import { DeckScreen } from "@/components/learn/srs/Cards";

// /cards/deck/<id> – a deck with a preview of three cards (mirrors the app's /cards/deck/[id])
export function generateStaticParams() {
  return DECK_ROUTE_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isDeck(id)) return {};
  const m = srsMeta(locale, "deck", id);
  const meta = pageMeta(locale, `/cards/deck/${id}`, m.title, m.description);
  return id === "mine" ? { ...meta, robots: { index: false, follow: true } } : meta;
}

export default async function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!isDeck(id)) notFound();
  return <DeckScreen id={id} />;
}
