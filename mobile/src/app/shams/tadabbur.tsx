import { useLocalSearchParams } from "expo-router";
import { TadabburScreen } from "@/features/shams2/Tadabbur";

// /shams/tadabbur?s=&v= – tadabbur and maqasid of a surah
export default function Route() {
  const p = useLocalSearchParams<{ s?: string; v?: string }>();
  const s = Math.max(1, Math.min(114, Number(p.s) || 1));
  return <TadabburScreen key={s} surah={s} verse={Number(p.v) || undefined} />;
}
