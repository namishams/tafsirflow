import { Stack } from "expo-router";
import QiblaScreen from "@/features/practice/prayer/QiblaScreen";

// /qibla – the live Qibla compass (app only; linked from /prayer)
export default function Qibla() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <QiblaScreen />
    </>
  );
}
