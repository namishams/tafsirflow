import { Stack } from "expo-router";
import { ProphetStoriesScreen } from "@/features/prophet/ProphetStoriesScreen";

// /prophet-stories – "The Prophet ﷺ": short stories from the vetted Islam library (and reciters, tips, secrets)
export default function ProphetStories() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ProphetStoriesScreen />
    </>
  );
}
