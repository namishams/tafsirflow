import { Redirect, Stack, type Href } from "expo-router";
import { FeedRoot } from "@/features/feed/FeedRoot";
import { shouldOnboard } from "@/features/extra/Onboarding";

// The start screen is the feed: stories, posts, Reels, Explore and sharing. Today lives at /today (Account).
export default function FeedHome() {
  if (shouldOnboard()) return <Redirect href={"/today" as Href} />;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FeedRoot inTab />
    </>
  );
}
