import { useLocalSearchParams } from "expo-router";
import { SeasonScreen } from "@/features/mishary/Seasons";

// /mishary/seasons/[slug] – one season: entry, jury, results
export default function MisharySeasonRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <SeasonScreen slug={String(slug)} />;
}
