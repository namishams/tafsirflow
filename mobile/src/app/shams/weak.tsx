import { useLocalSearchParams } from "expo-router";
import { DaysGate } from "@/features/sisters/ui";
import { WeakScreen } from "@/features/shams2/Weak";

// /shams/weak?s= – weak-spot practice
// "Meine Tage" (features/sisters): gate "recite"
export default function Route() {
  const p = useLocalSearchParams<{ s?: string }>();
  const s = Number(p.s);
  return <DaysGate kind="recite"><WeakScreen surah={s >= 1 && s <= 114 ? s : undefined} /></DaysGate>;
}
