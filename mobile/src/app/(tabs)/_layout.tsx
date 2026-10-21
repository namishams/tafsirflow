import { Tabs } from "expo-router/tabs";
import TabBar from "@/components/TabBar";
import { useT } from "@/i18n";
import { useFeedText } from "@/features/feed/texts";

// Five tab buttons: Feed (the start screen "/"), Explore, Quran, Masterclass, Account. Today lives at /today and is
// reachable from Account; Discover (library) stays a route without a button.

export default function TabsLayout() {
  const t = useT();
  const f = useFeedText();
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="(home)" options={{ title: f.feedButton }} />
      <Tabs.Screen name="explore" options={{ title: f.explore }} />
      <Tabs.Screen name="quran" options={{ title: t("tabs.quran") }} />
      <Tabs.Screen name="learn" options={{ title: t("tabs.learn") }} />
      <Tabs.Screen name="library" options={{ title: t("tabs.library") }} />
      <Tabs.Screen name="account" options={{ title: t("tabs.account") }} />
    </Tabs>
  );
}
