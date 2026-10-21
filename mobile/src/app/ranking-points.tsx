import { Stack } from "expo-router";
import { RankingScreen } from "@/features/progress/screens";

// /ranking-points – points ranking of all learners (website: /ranking/points)
export default function RankingPointsRoute() {
  return <><Stack.Screen options={{ headerShown: false }} /><RankingScreen /></>;
}
