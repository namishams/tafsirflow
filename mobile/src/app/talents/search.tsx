import { Stack, useLocalSearchParams } from "expo-router";
import { SearchScreen } from "@/features/talents/Search";
export { TalentsRouteError as ErrorBoundary } from "@/features/talents/ui";

// header options once, also set in the root layout (no raw route title, no per-render setOptions)
const SCREEN = { headerShown: false, animation: "fade" } as const;

// /talents/search – account search like Instagram / TikTok (feed header search icon, Explore search bar);
// ?q= starts with a query, ?tab=top opens the Top tab
export default function TalentSearchRoute() {
  const { q, tab } = useLocalSearchParams<{ q?: string; tab?: string }>();
  return (
    <>
      <Stack.Screen options={SCREEN} />
      <SearchScreen initial={typeof q === "string" ? q : undefined} initialTab={tab === "top" ? "top" : undefined} />
    </>
  );
}
