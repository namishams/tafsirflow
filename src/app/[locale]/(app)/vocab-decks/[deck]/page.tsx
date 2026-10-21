import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { metaFor } from "@/components/learn/courses/meta";
import { parseDeck } from "@/lib/learn/courses/decks";
import VocabDeck from "@/components/learn/courses/VocabDeck";

type P = { params: Promise<{ locale: string; deck: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, deck } = await params;
  if (!parseDeck(deck)) return {};
  const m = metaFor(locale, "deck");
  // a practice runner whose words load in the browser: kept out of the index, the overview is indexed
  return { ...pageMeta(locale, `/vocab-decks/${deck}`, m.title, m.description), robots: { index: false, follow: true } };
}

export default async function VocabDeckPage({ params }: P) {
  const { locale, deck } = await params;
  setRequestLocale(locale);
  const d = parseDeck(deck);
  if (!d) notFound();
  return <VocabDeck deck={d} />;
}
