import { Tabs } from "expo-router/tabs";
import TabBar from "@/components/TabBar";
import { useT } from "@/i18n";
import { useFeedText } from "@/features/feed/texts";
import { tabFreezeLayout } from "@/lib/freeze";

// Five tab buttons: Feed (the start screen "/", social style), then Quran, Masterclass, Discover and Account in the
// Masterclass design. Explore opens from the feed header; Today lives at /today (Account). Tabs that are not selected
// stop re-rendering until they are selected again (lib/freeze.tsx).

export default function TabsLayout() {
  const t = useT();
  const f = useFeedText();
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }} screenLayout={tabFreezeLayout}>
      <Tabs.Screen name="(home)" options={{ title: f.feedButton }} />
      <Tabs.Screen name="quran" options={{ title: t("tabs.quran") }} />
      <Tabs.Screen name="learn" options={{ title: "Shams" }} />
      <Tabs.Screen name="library" options={{ title: t("tabs.library") }} />
      <Tabs.Screen name="explore" options={{ title: f.explore }} />
      <Tabs.Screen name="account" options={{ title: t("tabs.account") }} />
    </Tabs>
  );
}
