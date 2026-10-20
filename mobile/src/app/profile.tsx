import { Stack, useLocalSearchParams } from "expo-router";
import { ProfileScreen } from "@/features/progress/screens";

// /profile – same path as quranmasterclass.com/profile; /profile?tab=badges opens a tab (website: #badges)
export default function ProfileRoute() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  return <><Stack.Screen options={{ headerShown: false }} /><ProfileScreen tab={tab} /></>;
}
