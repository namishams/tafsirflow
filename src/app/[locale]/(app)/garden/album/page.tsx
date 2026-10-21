// mirrors the route of mobile/src/features/feed/StickerAlbum.tsx (app route /feed-stickers): the sticker album of the feed
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { loadFeedTexts } from "@/lib/feedWeb/loadTexts";
import { FeedTextsProvider } from "@/lib/feedWeb/useTexts";
import { gardenMeta } from "@/components/learn/garden/meta";
import { Album } from "@/components/learn/garden/Album";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = gardenMeta(locale, "album");
  return pageMeta(locale, "/garden/album", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const texts = await loadFeedTexts(locale);
  return <FeedTextsProvider texts={texts}><Album /></FeedTextsProvider>;
}
