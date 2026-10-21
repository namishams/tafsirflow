import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { metaFor } from "@/components/learn/courses/meta";
import VocabDecks from "@/components/learn/courses/VocabDecks";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = metaFor(locale, "vocab");
  return pageMeta(locale, "/vocab-decks", m.title, m.description);
}

export default async function VocabDecksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <VocabDecks />;
}
