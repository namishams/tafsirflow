import { Stack } from "expo-router";
import PrayerSetup from "@/features/practice/prayer/setup/PrayerSetup";

// /prayer-setup – the guided setup of place, tradition, calculation and prayer reminders (app only)
export default function PrayerSetupScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      <PrayerSetup />
    </>
  );
}
