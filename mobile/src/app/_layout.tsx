import { SharerCelebration } from "@/features/share/SharerUI";
import "@/lib/digits-install";
import "@/lib/webshim";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Amiri_400Regular, Amiri_700Bold } from "@expo-google-fonts/amiri";
import { ArefRuqaa_700Bold } from "@expo-google-fonts/aref-ruqaa";
import { Fraunces_400Regular, Fraunces_400Regular_Italic, Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import { PlusJakartaSans_400Regular, PlusJakartaSans_400Regular_Italic, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LangProvider, useT } from "@/i18n";
import { AuthProvider } from "@/lib/auth";
import { SettingsProvider } from "@/lib/settings";
import { ProProvider } from "@/lib/pro";
import { hydrateStore } from "@/lib/store";
import { SyncBridge } from "@/lib/sync";
import { GardenCelebrate } from "@/features/garden/widgets";
import { stackOptions } from "@/components/page";
import { useTheme } from "@/lib/theme";
import { RewardsHost } from "@/features/progress";
import { NowPlayingBar } from "@/features/radio/MiniPlayer";
import { NotificationsBridge } from "@/features/daily/NotificationsBridge";
import { DailyMoment } from "@/features/daily/DailyMoment";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const HEADERLESS = { headerShown: false } as const;
const HEADERLESS_FADE = { headerShown: false, animation: "fade" } as const;

function Routes() {
  const t = useT();
  const theme = useTheme();
  return (
    <Stack screenOptions={stackOptions(theme)}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ presentation: "modal", headerShown: false, title: t("auth.signInTitle") }} />
      <Stack.Screen name="register" options={{ presentation: "modal", headerShown: false, title: t("auth.registerTitle") }} />
      <Stack.Screen name="pro" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="shams/[surah]" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="radio/now" options={{ presentation: "fullScreenModal", headerShown: false, animation: "slide_from_bottom" }} />
      {/* the learning journey draws its own hero with the back button: never a native header, not even for one frame */}
      <Stack.Screen name="journey/index" options={{ headerShown: false }} />
      <Stack.Screen name="journey/today" options={{ headerShown: false }} />
      <Stack.Screen name="journey/year" options={{ headerShown: false }} />
      <Stack.Screen name="journey/stats" options={{ headerShown: false }} />
      {/* talent profiles, follower lists and search: header options set once here (an inline options object in the
          screen re-ran setOptions on every render and could end in "Maximum update depth exceeded") */}
      <Stack.Screen name="talents/u/[username]" options={HEADERLESS} />
      <Stack.Screen name="talents/list" options={HEADERLESS} />
      <Stack.Screen name="talents/search" options={HEADERLESS_FADE} />
      {/* the legal pages draw their own hero: no native header with the raw route name during the push */}
      <Stack.Screen name="legal/[doc]" options={HEADERLESS} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fonts] = useFonts({
    Amiri_400Regular, Amiri_700Bold, ArefRuqaa_700Bold, Fraunces_400Regular, Fraunces_400Regular_Italic, Fraunces_600SemiBold,
    PlusJakartaSans_400Regular, PlusJakartaSans_400Regular_Italic, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
  });
  const [store, setStore] = useState(false);
  useEffect(() => { hydrateStore().finally(() => setStore(true)); }, []);
  const ready = fonts && store;
  useEffect(() => { if (ready) SplashScreen.hideAsync().catch(() => undefined); }, [ready]);
  if (!ready) return null;
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <LangProvider>
          <AuthProvider>
            <ProProvider>
              <SyncBridge />
              <StatusBar style="light" />
              <RewardsHost>
                <Routes />
                <NowPlayingBar />
                <NotificationsBridge />
                <DailyMoment />
                <SharerCelebration />
                <GardenCelebrate />
              </RewardsHost>
            </ProProvider>
          </AuthProvider>
        </LangProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
