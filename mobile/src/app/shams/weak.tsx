import { useLocalSearchParams } from "expo-router";
import { WeakScreen } from "@/features/shams2/Weak";

// /shams/weak?s= – weak-spot practice
export default function Route() {
  const p = useLocalSearchParams<{ s?: string }>();
  const s = Number(p.s);
  return <WeakScreen surah={s >= 1 && s <= 114 ? s : undefined} />;
}
