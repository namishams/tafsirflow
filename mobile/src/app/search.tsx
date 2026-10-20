import { Stack, useLocalSearchParams } from "expo-router";
import { SearchView } from "@/features/extra/SearchView";

// Website /search: surahs by name or number, verse references, full-text verse search (?q= runs it right away)
export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SearchView initial={typeof q === "string" ? q : undefined} />
    </>
  );
}
