import { Tabs } from "expo-router/tabs";
import TabBar from "@/components/TabBar";
import { useT } from "@/i18n";

// Five tabs like the website's bottom bar: Today, Quran, Masterclass, Discover, Account
export default function TabsLayout() {
  const t = useT();
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="(home)" options={{ title: t("tabs.home") }} />
      <Tabs.Screen name="quran" options={{ title: t("tabs.quran") }} />
      <Tabs.Screen name="learn" options={{ title: t("tabs.learn") }} />
      <Tabs.Screen name="library" options={{ title: t("tabs.library") }} />
      <Tabs.Screen name="account" options={{ title: t("tabs.account") }} />
    </Tabs>
  );
}
