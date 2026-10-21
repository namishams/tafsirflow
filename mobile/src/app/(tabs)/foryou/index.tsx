import { Stack } from "expo-router";
import { FeedRoot } from "@/features/feed/FeedRoot";

// The Feed tab: Home feed with stories, Explore, Saved and Reels
export default function FeedTab() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FeedRoot inTab />
    </>
  );
}
