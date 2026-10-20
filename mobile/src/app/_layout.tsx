import "@/lib/webshim";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Amiri_400Regular, Amiri_700Bold } from "@expo-google-fonts/amiri";
import { ArefRuqaa_700Bold } from "@expo-google-fonts/aref-ruqaa";
import { PlusJakartaSans_400Regular, PlusJakartaSans_400Regular_Italic, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LangProvider, useT } from "@/i18n";
import { AuthProvider } from "@/lib/auth";
import { SettingsProvider } from "@/lib/settings";
import { ProProvider } from "@/lib/pro";
import { hydrateStore } from "@/lib/store";
import { SyncBridge } from "@/lib/sync";
import { stackOptions } from "@/components/page";
import { useTheme } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Routes() {
  const t = useT();
  const theme = useTheme();
  return (
    <Stack screenOptions={stackOptions(theme)}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ presentation: "modal", title: t("auth.signInTitle") }} />
      <Stack.Screen name="register" options={{ presentation: "modal", title: t("auth.registerTitle") }} />
      <Stack.Screen name="pro" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="shams/[surah]" options={{ headerShown: false, gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fonts] = useFonts({
    Amiri_400Regular, Amiri_700Bold, ArefRuqaa_700Bold,
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
              <StatusBar style="auto" />
              <Routes />
            </ProProvider>
          </AuthProvider>
        </LangProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
