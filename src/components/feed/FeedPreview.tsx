"use client";
import type { WebFeedPage } from "@/lib/feedWeb/types";
import { FeedProvider } from "./ctx";
import { HomePost } from "./HomePosts";

// The first posts of the feed on the home page: the same cards as in /feed, without autoplay
const none = () => undefined;
export default function FeedPreview({ locale, page }: { locale: string; page: WebFeedPage }) {
  return (
    <FeedProvider locale={locale}>
      <div className="mx-auto grid max-w-[620px] grid-cols-[minmax(0,1fr)] gap-1">
        {page.items.map((c) => <HomePost key={c.id} card={c} active={false} onActive={none} />)}
      </div>
    </FeedProvider>
  );
}
