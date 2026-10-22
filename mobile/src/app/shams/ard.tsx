import { useLocalSearchParams } from "expo-router";
import { DaysGate } from "@/features/sisters/ui";
import { ArdScreen } from "@/features/shams2/Darajat";

// /shams/ard?kind=weekly|monthly|ard – formal and surprise recitation checks
// "Meine Tage" (features/sisters): gate "recite"
export default function Route() {
  const p = useLocalSearchParams<{ kind?: string }>();
  const kind = p.kind === "monthly" ? "monthly" : p.kind === "ard" ? "ard" : "weekly";
  return <DaysGate kind="recite"><ArdScreen key={kind} kind={kind} /></DaysGate>;
}
