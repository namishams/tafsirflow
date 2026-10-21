// /garden – "Your garden": the tree that grows with learning
import { Stack } from "expo-router";
import Screen from "@/features/garden/GardenScreen";

// the screen draws its own header
export default function Route() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen />
    </>
  );
}
