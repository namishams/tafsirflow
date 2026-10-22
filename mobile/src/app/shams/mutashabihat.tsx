import { useLocalSearchParams } from "expo-router";
import { MutashabihatScreen } from "@/features/shams2/Mutashabihat";

// /shams/mutashabihat?g= – similar verses trainer (g: a group id or "due", e.g. from the wird's tathbīt block)
export default function Route() {
  const p = useLocalSearchParams<{ g?: string }>();
  return <MutashabihatScreen initial={typeof p.g === "string" && p.g ? p.g : undefined} />;
}
