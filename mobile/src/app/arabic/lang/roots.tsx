import { useLocalSearchParams } from "expo-router";
import { RootExplorerScreen } from "@/features/arabic-lang/Screens";

// /arabic/lang/roots – root explorer: a root and its family of words from the Quran vocabulary
export default function ArabicLangRootsRoute() {
  const { r } = useLocalSearchParams<{ r?: string }>();
  return <RootExplorerScreen initial={r ? String(r) : undefined} />;
}
