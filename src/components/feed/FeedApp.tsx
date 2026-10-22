"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import Segmented from "@/components/ui/Segmented";
import { initGamify } from "@/lib/learn/feed/gamify";
import { useFeedTimer } from "@/lib/learn/feed/statsStore";
import type { WebCard, WebFeedPage } from "@/lib/feedWeb/types";
import { useFeedTexts } from "@/lib/feedWeb/useTexts";
import { touchVisit } from "@/lib/feedWeb/client";
import { FeedProvider, useFeed } from "./ctx";
import { ExploreView, TopicChips } from "./Explore";
import { HomeList } from "./HomeList";
import { AppIcon } from "./icons";
import { ReelList } from "./Reels";
import type { RailGroup } from "./Rings";
import { StoryViewer } from "./StoryViewer";
import { useFeedStream, type StreamTopic } from "./stream";

// The feed of the website: Home (the rail with rings and stories, topic chips, posts), Reels (vertical full-screen pages
// with the recitation) and Explore (a grid with topic chips), like the app's Feed tab. Everything is free.

type Tab = "home" | "reels" | "explore";
const TABS: Tab[] = ["home", "reels", "explore"];

function FeedBody({ locale, initial }: { locale: string; initial: WebFeedPage | null }) {
  const T = useFeedTexts();
  const f = useFeed();
  const [tab, setTab] = useState<Tab>("home");
  const [visited, setVisited] = useState<Record<Tab, boolean>>({ home: true, reels: false, explore: false });
  const [homeTopic, setHomeTopic] = useState<StreamTopic>("all");
  const [exTopic, setExTopic] = useState<StreamTopic>("all");
  const [query, setQuery] = useState("");
  const [viewer, setViewer] = useState<{ rail: RailGroup[]; start: { group: number; story: number } } | null>(null);
  const [opened, setOpened] = useState<WebCard | null>(null);
  const scrolls = useRef<Record<Tab, number>>({ home: 0, reels: 0, explore: 0 });

  const home = useFeedStream({ locale, topic: homeTopic, initial });
  const explore = useFeedStream({ locale, topic: exTopic, enabled: visited.explore });

  useEffect(() => { initGamify(); touchVisit(); }, []);
  // ?tab=explore&q=… (the search screen hands a query over to Explore)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("tab");
    if (t === "reels" || t === "explore") { setTab(t); setVisited((v) => ({ ...v, [t]: true })); }
    const q = p.get("q");
    if (q) setQuery(q.slice(0, 80));
  }, []);
  useFeedTimer(true);

  const select = useCallback((next: Tab) => {
    scrolls.current[tab] = window.scrollY;
    if (next === tab) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    f.stop();
    setVisited((v) => ({ ...v, [next]: true }));
    setTab(next);
    try { const u = new URL(window.location.href); if (next === "home") u.searchParams.delete("tab"); else u.searchParams.set("tab", next); window.history.replaceState(null, "", u); } catch { /* history unavailable */ }
    window.setTimeout(() => window.scrollTo({ top: next === "reels" ? 0 : scrolls.current[next] || 0 }), 0);
  }, [tab, f]);

  const openStories = useCallback((rail: RailGroup[], i: number) => { f.stop(); setViewer({ rail, start: { group: i, story: 0 } }); }, [f]);
  const openFromExplore = useCallback((c: WebCard) => { setOpened(c); select("reels"); }, [select]);
  const reelCards = opened ? [opened, ...home.cards.filter((c) => c.id !== opened.id)] : home.cards;

  return (
    <div>
      <div className="sticky top-[57px] z-30 border-b border-line bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
        <div className="mx-auto flex h-12 max-w-[560px] items-center gap-2 px-2">
          <Segmented tabs full size="sm" className="min-w-0 flex-1" label={T.feed.title} value={tab} onChange={select}
            options={TABS.map((k) => ({ id: k, label: k === "home" ? T.feed.home : k === "reels" ? T.feed.reels : T.feed.explore }))} />
          <span className="ms-1 flex items-center gap-0.5">
            <Link href="/talents/search" aria-label={T.feed.search} title={T.feed.search} className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent-soft/60"><AppIcon name="search" size={21} /></Link>
            <Link href="/stats" aria-label={T.feed.statsOpen} title={T.feed.statsOpen} className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent-soft/60"><AppIcon name="trophy" size={21} /></Link>
            <Link href="/profile" aria-label={T.feed.saved} title={T.feed.saved} className="hidden h-10 w-10 place-items-center rounded-full hover:bg-accent-soft/60 sm:grid"><AppIcon name="bookmark" size={21} /></Link>
          </span>
        </div>
      </div>

      <div hidden={tab !== "home"}>
        <div className="mx-auto max-w-[620px]">
          <HomeList stream={home} topic={homeTopic} onTopic={setHomeTopic} onStories={openStories} />
        </div>
      </div>

      {visited.reels ? (
        <div hidden={tab !== "reels"} className="relative h-[calc(100dvh-106px-4.25rem)] min-h-[460px] w-full overflow-hidden bg-[rgb(5,28,21)] lg:h-[calc(100dvh-106px)]">
          <ReelList cards={reelCards} onEnd={home.more} startId={opened?.id} visible={tab === "reels"}
            topbar={<TopicChips value={homeTopic} onChange={(t) => { setOpened(null); setHomeTopic(t); }} dark className="!px-0 !py-0" />} />
        </div>
      ) : null}

      {visited.explore ? (
        <div hidden={tab !== "explore"}>
          <ExploreView cards={explore.cards} topic={exTopic} onTopic={setExTopic} onOpen={openFromExplore} onEnd={explore.more} loading={explore.loading || !explore.ready} query={query} onQuery={setQuery} />
        </div>
      ) : null}

      {viewer ? <StoryViewer rail={viewer.rail} start={viewer.start} onClose={() => setViewer(null)} /> : null}
    </div>
  );
}

export default function FeedApp({ locale, initial }: { locale: string; initial: WebFeedPage | null }) {
  return (
    <FeedProvider locale={locale}>
      <FeedBody locale={locale} initial={initial} />
    </FeedProvider>
  );
}
