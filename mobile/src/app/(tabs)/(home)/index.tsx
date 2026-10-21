import { useEffect } from "react";
import { Stack, router, type Href } from "expo-router";
import { FeedRoot } from "@/features/feed/FeedRoot";
import { shouldOnboard } from "@/features/extra/Onboarding";
import { quizPending } from "@/features/plan/Funnel";
import { readJSON, writeJSON } from "@/lib/store";

// The start screen is always the feed: stories, posts, Reels, Explore and sharing. Today lives at /today (Account).
// On the very first start the onboarding opens once on top of it.
export default function FeedHome() {
  useEffect(() => {
    // an unfinished quiz (the reload after choosing a right-to-left language) opens again at the same question
    if (quizPending()) { router.push("/onboarding" as Href); return; }
    if (readJSON<boolean>("tf:onboardShown", false) || !shouldOnboard()) return;
    writeJSON("tf:onboardShown", true);
    router.push("/onboarding" as Href);
  }, []);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FeedRoot inTab />
    </>
  );
}
