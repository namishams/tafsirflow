import { useLocalSearchParams } from "expo-router";
import { DaysGate } from "@/features/sisters/ui";
import { TalaqqiScreen } from "@/features/shams2/Talaqqi";

// /shams/talaqqi?s=&v=&to= – talaqqi with a master reciter
// "Meine Tage" (features/sisters): gate "recite"
export default function Route() {
  const p = useLocalSearchParams<{ s?: string; v?: string; to?: string }>();
  const s = Math.max(1, Math.min(114, Number(p.s) || 1));
  const v = Math.max(1, Number(p.v) || 1);
  const to = Number(p.to) || undefined;
  return <DaysGate kind="recite"><TalaqqiScreen key={`${s}:${v}`} surah={s} from={v} to={to && to >= v ? to : undefined} /></DaysGate>;
}
