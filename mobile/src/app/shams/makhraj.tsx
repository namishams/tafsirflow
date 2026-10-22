import { useLocalSearchParams } from "expo-router";
import { DaysGate } from "@/features/sisters/ui";
import { MakhrajScreen } from "@/features/shams2/Makhraj";

// /shams/makhraj?l=ayn|ha|kha|qaf|dad – the makhraj coach (free)
// "Meine Tage" (features/sisters): gate "practice"
export default function Route() {
  const p = useLocalSearchParams<{ l?: string }>();
  return <DaysGate kind="practice"><MakhrajScreen initial={p.l} /></DaysGate>;
}
