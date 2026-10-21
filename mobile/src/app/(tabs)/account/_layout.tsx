import { Stack } from "expo-router";
import { stackOptions } from "@/components/page";
import { useTheme } from "@/lib/theme";

export default function Layout() {
  const theme = useTheme();
  return (
    <Stack screenOptions={stackOptions(theme)}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}
