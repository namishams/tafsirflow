import { Stack } from "expo-router";
import { Funnel } from "@/features/plan/Funnel";

// First start: eight short questions, "building your plan", the personal 30-day plan and the day-1 paywall
// (features/plan). Also opened from "Adjust plan" on the Masterclass tab.
export default function OnboardingScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      <Funnel />
    </>
  );
}
