import { useLocalSearchParams } from "expo-router";
import { DrillScreen, type DrillMode } from "@/features/shams2/Drill";

// /shams/drill?s=&v=&w=1,4&mode=word|phrase|link – word loop, phrase drill or transition drill for one verse
export default function Route() {
  const p = useLocalSearchParams<{ s?: string; v?: string; w?: string; mode?: string }>();
  const s = Math.max(1, Math.min(114, Number(p.s) || 1));
  const v = Math.max(1, Number(p.v) || 1);
  const words = (p.w ?? "").split(",").map(Number).filter((x) => Number.isInteger(x) && x > 0).slice(0, 30);
  const mode: DrillMode = p.mode === "link" || p.mode === "phrase" || p.mode === "word" ? p.mode : words.length ? "word" : "phrase";
  return <DrillScreen key={`${s}:${v}:${mode}:${words.join(",")}`} surah={s} verse={v} words={words} mode={mode} />;
}
