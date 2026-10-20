import { Stack } from "expo-router";
import { Onboarding } from "@/features/extra/Onboarding";

// First start: who is learning, can you read Arabic, your goal, your time – then the personal path (website Onboarding)
export default function OnboardingScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      <Onboarding force fullScreen />
    </>
  );
}
