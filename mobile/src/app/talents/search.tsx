import { Stack, useLocalSearchParams } from "expo-router";
import { SearchScreen } from "@/features/talents/Search";

// /talents/search – account search like Instagram / TikTok (feed header search icon, Explore search bar);
// ?q= starts with a query, ?tab=top opens the Top tab
export default function TalentSearchRoute() {
  const { q, tab } = useLocalSearchParams<{ q?: string; tab?: string }>();
  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: "fade" }} />
      <SearchScreen initial={typeof q === "string" ? q : undefined} initialTab={tab === "top" ? "top" : undefined} />
    </>
  );
}
