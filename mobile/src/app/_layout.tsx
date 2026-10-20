import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Amiri_400Regular, Amiri_700Bold } from "@expo-google-fonts/amiri";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LangProvider, useT } from "@/i18n";
import { AuthProvider } from "@/lib/auth";
import { SettingsProvider } from "@/lib/settings";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Routes() {
  const t = useT();
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ presentation: "modal", title: t("auth.signInTitle") }} />
      <Stack.Screen name="register" options={{ presentation: "modal", title: t("auth.registerTitle") }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fonts] = useFonts({ Amiri_400Regular, Amiri_700Bold });
  useEffect(() => { if (fonts) SplashScreen.hideAsync().catch(() => undefined); }, [fonts]);
  if (!fonts) return null;
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <LangProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <Routes />
          </AuthProvider>
        </LangProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
