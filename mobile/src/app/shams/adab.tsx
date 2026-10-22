import { useLocalSearchParams } from "expo-router";
import { AdabScreen } from "@/features/shams2/adab/Adab";

// /shams/adab?i=<item> – the pillar "Adab des Qurʾān-Trägers" of the Shams Method (website: /shams/adab)
export default function Route() {
  const { i } = useLocalSearchParams<{ i?: string }>();
  return <AdabScreen initial={typeof i === "string" ? i : undefined} />;
}
