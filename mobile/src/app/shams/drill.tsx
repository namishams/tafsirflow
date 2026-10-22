import { useLocalSearchParams } from "expo-router";
import { VERSE_COUNTS } from "@/web/counts";
import { DaysGate } from "@/features/sisters/ui";
import { DrillScreen, type DrillMode } from "@/features/shams2/Drill";

// /shams/drill?s=&v=&w=1,4&mode=word|phrase|link – word loop, phrase drill or transition drill for one verse
// "Meine Tage" (features/sisters): gate "recite"
export default function Route() {
  const p = useLocalSearchParams<{ s?: string; v?: string; w?: string; mode?: string }>();
  // whole numbers inside the Quran: surah 1–114, verse 1 to the surah's last verse
  const s = Math.max(1, Math.min(114, Math.round(Number(p.s)) || 1));
  const v = Math.max(1, Math.min(VERSE_COUNTS[s - 1], Math.round(Number(p.v)) || 1));
  const words = (p.w ?? "").split(",").map(Number).filter((x) => Number.isInteger(x) && x > 0).slice(0, 30);
  const mode: DrillMode = p.mode === "link" || p.mode === "phrase" || p.mode === "word" ? p.mode : words.length ? "word" : "phrase";
  return <DaysGate kind="recite"><DrillScreen key={`${s}:${v}:${mode}:${words.join(",")}`} surah={s} verse={v} words={words} mode={mode} /></DaysGate>;
}
