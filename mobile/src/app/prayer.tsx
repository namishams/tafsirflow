import { Stack } from "expo-router";
import PrayerBoard from "@/features/practice/prayer/PrayerBoard";

// /prayer – prayer times, Qibla, reminders (website: app/[locale]/(app)/prayer)
export default function PrayerScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PrayerBoard />
    </>
  );
}
