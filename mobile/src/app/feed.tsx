import { Stack } from "expo-router";
import { FeedScreen } from "@/features/feed/FeedScreen";

// /feed – the Quran Feed (full screen, vertical, one verse per page)
export default function Feed() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: "fade", gestureEnabled: true }} />
      <FeedScreen />
    </>
  );
}
