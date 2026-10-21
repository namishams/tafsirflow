import { Stack } from "expo-router";
import { FeedRoot } from "@/features/feed/FeedRoot";

// /feed – the feed as a full-screen route for deep links (the Feed tab shows the same screens)
export default function Feed() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: "fade", gestureEnabled: true }} />
      <FeedRoot />
    </>
  );
}
