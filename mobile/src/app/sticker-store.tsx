import { Stack } from "expo-router";
import StoreScreen from "@/features/cosmetics/StoreScreen";

// /sticker-store[?pack=<slug>] – sticker packs, rare stickers and profile frames (features/cosmetics/StoreScreen.tsx)
export default function Route() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StoreScreen />
    </>
  );
}
