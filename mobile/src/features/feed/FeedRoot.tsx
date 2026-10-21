import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useTabBarSpace } from "@/components/TabBar";
import { FeedScreen } from "./FeedScreen";
import { HomeFeed } from "./HomeFeed";
import type { HadithFeedItem } from "./hadith";

// a tile of the Explore tab opens in the Feed tab's Reels
type Pending = { item: string; hadith?: HadithFeedItem };
let pending: Pending | null = null;
const subs = new Set<() => void>();
export function openInFeed(item: string, hadith?: HadithFeedItem) { pending = { item, hadith }; subs.forEach((f) => f()); }

// The feed's two views: Home (posts + stories) and Reels (full screen). Used by the Feed tab (inTab: room for the
// floating tab bar, no close button) and by the /feed route for deep links (?mode / ?s / ?key / ?cat open Reels).
export function FeedRoot({ inTab }: { inTab?: boolean }) {
  const p = useLocalSearchParams<{ mode?: string; s?: string; key?: string; cat?: string; tab?: string }>();
  const [tab, setTab] = useState<"home" | "reels">(p.tab === "reels" || p.mode || p.s || p.key || p.cat ? "reels" : "home");
  const [start, setStart] = useState<{ item: string; hadith?: HadithFeedItem; n: number } | null>(null);
  const tabSpace = useTabBarSpace();
  const space = inTab ? tabSpace : 0;
  const home = () => { setStart(null); setTab("home"); };
  useEffect(() => {
    if (!inTab) return;
    const take = () => { const x = pending; if (!x) return; pending = null; setStart((s) => ({ item: x.item, hadith: x.hadith, n: (s?.n ?? 0) + 1 })); setTab("reels"); };
    take();
    subs.add(take);
    return () => { subs.delete(take); };
  }, [inTab]);
  return tab === "home"
    ? <HomeFeed tab={tab} onTab={setTab} inTab={inTab} bottomSpace={space} onOpen={(item, hadith) => { setStart((s) => ({ item, hadith, n: (s?.n ?? 0) + 1 })); setTab("reels"); }} />
    : <FeedScreen key={start ? `start-${start.n}` : "reels"} onHome={home} start={start?.item} startHadith={start?.hadith} bottomSpace={space} />;
}
