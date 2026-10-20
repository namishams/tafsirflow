import { Stack } from "expo-router";
import { PlanScreen } from "@/features/progress/screens";

// /plan – same path as quranmasterclass.com/plan (365-Tage-Plan)
export default function PlanRoute() {
  return <><Stack.Screen options={{ headerShown: false }} /><PlanScreen /></>;
}
