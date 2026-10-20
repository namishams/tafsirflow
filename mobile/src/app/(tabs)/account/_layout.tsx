import { Stack } from "expo-router";
import { useT } from "@/i18n";
import { useTheme } from "@/lib/theme";

export default function Layout() {
  const t = useT();
  const theme = useTheme();
  return (
    <Stack screenOptions={{ headerLargeTitle: true, headerTransparent: false, headerShadowVisible: false, headerLargeStyle: { backgroundColor: theme.bg }, headerStyle: { backgroundColor: theme.bg }, headerTintColor: theme.tint, headerTitleStyle: { color: theme.text }, headerBackButtonDisplayMode: "minimal" }}>
      <Stack.Screen name="index" options={{ title: t("tabs.account") }} />
    </Stack>
  );
}
