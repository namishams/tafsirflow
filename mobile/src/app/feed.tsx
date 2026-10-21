import { useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { FeedScreen } from "@/features/feed/FeedScreen";
import { HomeFeed } from "@/features/feed/HomeFeed";

// /feed – Instagram-style home feed (posts + stories) by default, the Quran Feed (Reels, full screen, one verse per
// page) as the second tab. Deep links with ?mode / ?s / ?key / ?cat open the Reels tab directly.
export default function Feed() {
  const p = useLocalSearchParams<{ mode?: string; s?: string; key?: string; cat?: string; tab?: string }>();
  const [tab, setTab] = useState<"home" | "reels">(p.tab === "reels" || p.mode || p.s || p.key || p.cat ? "reels" : "home");
  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: "fade", gestureEnabled: true }} />
      {tab === "home" ? <HomeFeed tab={tab} onTab={setTab} /> : <FeedScreen onHome={() => setTab("home")} />}
    </>
  );
}
