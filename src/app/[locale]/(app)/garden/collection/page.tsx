// mirrors the route of mobile/src/features/garden/Collection.tsx (app route /sticker-collection)
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { loadFeedTexts } from "@/lib/feedWeb/loadTexts";
import { FeedTextsProvider } from "@/lib/feedWeb/useTexts";
import { gardenMeta } from "@/components/learn/garden/meta";
import { Collection } from "@/components/learn/garden/Collection";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = gardenMeta(locale, "collection");
  return pageMeta(locale, "/garden/collection", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // the feed texts name the link to the sticker album of the feed (/garden/album)
  const texts = await loadFeedTexts(locale);
  return <FeedTextsProvider texts={texts}><Collection /></FeedTextsProvider>;
}
