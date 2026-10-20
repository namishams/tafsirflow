import { Stack } from "expo-router";
import { RankingScreen } from "@/features/progress/screens";

// /ranking – same path as quranmasterclass.com/ranking
export default function RankingRoute() {
  return <><Stack.Screen options={{ headerShown: false }} /><RankingScreen /></>;
}
