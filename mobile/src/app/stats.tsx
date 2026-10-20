import { Stack } from "expo-router";
import { StatsScreen } from "@/features/progress/screens";

// /stats – same path as quranmasterclass.com/stats (Statistik, Sticker, Abzeichen)
export default function StatsRoute() {
  return <><Stack.Screen options={{ headerShown: false }} /><StatsScreen /></>;
}
