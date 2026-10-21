import { useEffect } from "react";
import { Tabs } from "expo-router/tabs";
import { router, usePathname, type Href } from "expo-router";
import TabBar from "@/components/TabBar";
import { useT } from "@/i18n";
import { useFeedText } from "@/features/feed/texts";
import { shouldOnboard } from "@/features/extra/Onboarding";

// Five tab buttons: Feed, Today, Quran, Masterclass, Account. The Feed is the landing screen once onboarding (shown on
// Today) is done; Discover (library) stays a route without its own button (TabBar HIDDEN), reached from Masterclass.
let landed = false;

export default function TabsLayout() {
  const t = useT();
  const f = useFeedText();
  const path = usePathname();
  useEffect(() => {
    // the app opens on "/" (Today); after onboarding it lands in the Feed instead. Other deep links stay untouched.
    if (landed) return;
    landed = true;
    if (path === "/" && !shouldOnboard()) router.navigate("/foryou" as Href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="foryou" options={{ title: f.feedButton }} />
      <Tabs.Screen name="(home)" options={{ title: t("tabs.home") }} />
      <Tabs.Screen name="quran" options={{ title: t("tabs.quran") }} />
      <Tabs.Screen name="learn" options={{ title: t("tabs.learn") }} />
      <Tabs.Screen name="library" options={{ title: t("tabs.library") }} />
      <Tabs.Screen name="account" options={{ title: t("tabs.account") }} />
    </Tabs>
  );
}
