import { Stack } from "expo-router";
import { SwipeScreen } from "@/features/swipe/SwipeScreen";

// /swipe – Swipe & Learn: a full-screen stack of learning cards (same path as the website's /swipe)
export default function Swipe() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: "fade", gestureEnabled: false }} />
      <SwipeScreen />
    </>
  );
}
