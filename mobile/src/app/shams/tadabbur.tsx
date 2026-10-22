import { useLocalSearchParams } from "expo-router";
import { DaysGate } from "@/features/sisters/ui";
import { TadabburScreen } from "@/features/shams2/Tadabbur";

// /shams/tadabbur?s=&v= – tadabbur and maqasid of a surah
// "Meine Tage" (features/sisters): gate "study"
export default function Route() {
  const p = useLocalSearchParams<{ s?: string; v?: string }>();
  const s = Math.max(1, Math.min(114, Number(p.s) || 1));
  return <DaysGate kind="study"><TadabburScreen key={s} surah={s} verse={Number(p.v) || undefined} /></DaysGate>;
}
