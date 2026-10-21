import { useEffect } from "react";
import { View } from "react-native";
import { Stack, router } from "expo-router";
import { useTheme } from "@/lib/theme";

// quranmasterclass://passkey is the callback of the passkey sign-in sheet (features/auth/api.ts). On iOS the sign-in
// sheet catches it; on Android the Custom Tab hands it to the app as a link, which lands here: step straight back to
// the screen that opened the sheet (it finishes the sign-in itself).
export default function PasskeyCallback() {
  const theme = useTheme();
  useEffect(() => {
    const id = setTimeout(() => { if (router.canGoBack()) router.back(); else router.replace("/"); }, 0);
    return () => clearTimeout(id);
  }, []);
  return <View style={{ flex: 1, backgroundColor: theme.bg }}><Stack.Screen options={{ headerShown: false, animation: "none" }} /></View>;
}
