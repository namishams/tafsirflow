// /sticker-collection – the large sticker collection that feeds the garden
import { Stack } from "expo-router";
import Screen from "@/features/garden/Collection";

// the screen draws its own header
export default function Route() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen />
    </>
  );
}
