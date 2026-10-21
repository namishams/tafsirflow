import { useLocalSearchParams } from "expo-router";
import { QualityScreen } from "@/features/shams2/Quality";

// /shams/quality?juz= – hifz quality heatmap
export default function Route() {
  const p = useLocalSearchParams<{ juz?: string }>();
  const j = Number(p.juz);
  return <QualityScreen juz={j >= 1 && j <= 30 ? j : undefined} />;
}
