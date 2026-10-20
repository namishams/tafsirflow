import { Stack, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/ui";

// reader and player: next build step
export default function SurahScreen() {
  const { surah } = useLocalSearchParams<{ surah: string }>();
  return <><Stack.Screen options={{ title: surah, headerLargeTitle: false }} /><Screen>{null}</Screen></>;
}
