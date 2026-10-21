import { useLocalSearchParams } from "expo-router";
import { NextScreen } from "@/features/shams2/Continue";

// /shams/next?s= – the next meaningful steps (never an end without one)
export default function Route() {
  const p = useLocalSearchParams<{ s?: string }>();
  const s = Number(p.s);
  return <NextScreen surah={s >= 1 && s <= 114 ? s : undefined} />;
}
