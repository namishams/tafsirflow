"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useHydrated, useStored, writeJSON } from "@/lib/learn/store";
import type { WebCard } from "@/lib/feedWeb/types";
import { useFeedTexts } from "@/lib/feedWeb/useTexts";
import { wasSeen } from "@/lib/feedWeb/client";
import { HomePost } from "./HomePosts";
import { PostSkeleton } from "./parts";
import { StoriesRail, type RailGroup } from "./Rings";
import { TopicChips } from "./Explore";
import { fmtN } from "./tokens";
import type { Stream, StreamTopic } from "./stream";

// The Home view: the rail (rings and story circles), the topic chips, then one post after the other (HomeFeed.tsx).
const HINT_KEY = "qmc.feed-hint-seen";

export function HomeList({ stream, topic, onTopic, onStories, header = true, endless = true, limit }: {
  stream: Stream; topic: StreamTopic; onTopic: (t: StreamTopic) => void; onStories: (rail: RailGroup[], i: number) => void; header?: boolean; endless?: boolean; limit?: number;
}) {
  const T = useFeedTexts();
  const locale = useLocale();
  const [active, setActive] = useState("");
  const onActive = useCallback((id: string) => setActive(id), []);
  const sentinel = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const hintSeen = useStored<boolean>(HINT_KEY, false);
  const [hintHidden, setHintHidden] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !endless) return;
    const io = new IntersectionObserver((e) => { if (e[0]?.isIntersecting) stream.more(); }, { rootMargin: "1400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [stream.more, stream.cards.length, endless]); // eslint-disable-line react-hooks/exhaustive-deps

  const cards: WebCard[] = limit ? stream.cards.slice(0, limit) : stream.cards;
  const fresh = useMemo(() => cards.filter((c) => !wasSeen(c.id)).length, [cards.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {header ? (
        <div className="pb-3 pt-2">
          <StoriesRail onOpen={onStories} />
          <TopicChips value={topic} onChange={(t) => { if (t === topic) window.scrollTo({ top: 0, behavior: "smooth" }); else onTopic(t); }} className="pt-2.5" />
          {hydrated && !hintSeen && !hintHidden ? (
            <div className="mx-3.5 mt-3 grid gap-1.5 rounded-xl border border-line bg-surface p-3.5">
              <p className="text-[15px] font-semibold">{T.feed.hintTitle}</p>
              {[T.feed.hint1, T.feed.hint2, T.feed.hint3].map((h) => <p key={h} className="text-[13.5px] leading-[19px] text-muted">{h}</p>)}
              <button type="button" onClick={() => { writeJSON(HINT_KEY, true, true); setHintHidden(true); }} className="justify-self-end py-1 text-[14px] font-semibold text-accent">{T.feed.gotIt}</button>
            </div>
          ) : null}
          {fresh > 0 && stream.ready ? (
            <div className="flex items-center gap-2 px-3.5 pt-3">
              <span aria-hidden className="h-[7px] w-[7px] rotate-45" style={{ background: "rgb(var(--gold))" }} />
              <span className="text-[13px] font-semibold">{T.feed.newForYou}</span>
              <span className="text-[13px] text-muted">{fmtN(fresh, locale)}</span>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-1">
        {cards.map((c) => <HomePost key={c.id} card={c} active={c.id === active} onActive={onActive} />)}
      </div>
      {stream.loading && !cards.length ? <><PostSkeleton /><PostSkeleton /></> : null}
      {endless ? (
        <div ref={sentinel} className="py-8 text-center text-sm text-muted" aria-live="polite">
          {stream.loading && cards.length ? <PostSkeleton /> : stream.failed ? <button type="button" onClick={stream.more} className="font-semibold text-accent underline">{T.feed.retry}</button> : null}
        </div>
      ) : null}
    </div>
  );
}
