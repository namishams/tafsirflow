import { Stack } from "expo-router";
import { stackOptions } from "@/components/page";
import { useTheme } from "@/lib/theme";

// The surah list is always the root of the Quran tab: a reader opened by a deep or universal link (/surah/2,
// quranmasterclass:///quran/2) starts with the list underneath, so its back button and the tab button lead to the list.
// Readers pushed from another tab get the same anchor in the reader itself ([surah].tsx, useListAnchor).
// (expo-router 58 renamed initialRouteName to anchor; the old name still worked but warned on every reader push)
export const unstable_settings = { anchor: "index" };

export default function Layout() {
  const theme = useTheme();
  return (
    <Stack screenOptions={stackOptions(theme)}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
