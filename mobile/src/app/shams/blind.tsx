import { useLocalSearchParams } from "expo-router";
import { DaysGate } from "@/features/sisters/ui";
import { BlindScreen } from "@/features/shams2/Blind";

// /shams/blind?s=&from=&to= – blind recitation of a passage (without parameters: choose the passage first)
// "Meine Tage" (features/sisters): gate "recite"
export default function Route() {
  const p = useLocalSearchParams<{ s?: string; from?: string; to?: string }>();
  const s = Math.trunc(Number(p.s));
  const from = Math.trunc(Number(p.from)) || 1;
  const to = Math.trunc(Number(p.to)) || undefined;
  const initial = Number.isInteger(s) && s >= 1 && s <= 114 ? { s, from, to: to && to >= from ? to : 0 } : undefined;
  return <DaysGate kind="recite"><BlindScreen key={initial ? `${s}:${from}-${to ?? ""}` : "pick"} initial={initial} /></DaysGate>;
}
