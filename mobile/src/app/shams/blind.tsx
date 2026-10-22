import { useLocalSearchParams } from "expo-router";
import { BlindScreen } from "@/features/shams2/Blind";

// /shams/blind?s=&from=&to= – blind recitation of a passage (without parameters: choose the passage first)
export default function Route() {
  const p = useLocalSearchParams<{ s?: string; from?: string; to?: string }>();
  const s = Number(p.s);
  const from = Number(p.from) || 1;
  const to = Number(p.to) || undefined;
  const initial = s >= 1 && s <= 114 ? { s, from, to: to && to >= from ? to : 0 } : undefined;
  return <BlindScreen key={initial ? `${s}:${from}-${to ?? ""}` : "pick"} initial={initial} />;
}
