import { memo } from "react";
import { Animated, Text, View } from "react-native";
import { ARABIC_FONT, FONT, stage } from "@/lib/theme";
import { Stage } from "@/components/brand";
import { useWebT } from "@/i18n/web";
import type { Chapter } from "@/lib/quran";
import { SURAH_PREFIX } from "@/features/quran/arabic";
import { useUiVerses } from "@/features/quran/uiVerses";
import { useFadeIn } from "@/features/radio/motion";
import { Cartouche, IllumFrame, Medallion, Rosette } from "./ornaments";

// The illuminated opening of a surah, like the first page of a surah in a fine mushaf (website Player.tsx): the dark
// green stage in a double gold frame with a band of stars, rosettes in the corners, the cartouche with the surah's
// name between two margin medallions, its name and meaning, and the basmala in gold (not before al-Fatiha's own
// first verse and not before at-Tawba).
export const SurahOpening = memo(function SurahOpening({ chapter, reduce }: { chapter: Chapter; reduce: boolean }) {
  const wh = useWebT("home");
  const ink = useFadeIn(reduce, 1800);
  const withBismillah = chapter.id !== 1 && chapter.id !== 9;
  // the basmala is verse 1:1 from the Quran data (stored copy, bundled snapshot as fallback), never typed by hand
  const bismillah = useUiVerses()["1:1"];
  return (
    <Stage rounded={16} hairlines={false} style={{ marginHorizontal: 16, marginTop: 10 }}>
      <IllumFrame radius={16} />
      <Rosette size={26} style={{ position: "absolute", top: 6, left: 6 }} />
      <Rosette size={26} style={{ position: "absolute", top: 6, right: 6 }} />
      <Rosette size={26} style={{ position: "absolute", bottom: 6, left: 6 }} />
      <Rosette size={26} style={{ position: "absolute", bottom: 6, right: 6 }} />
      <View style={{ paddingHorizontal: 22, paddingTop: 34, paddingBottom: 32, alignItems: "center" }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2.4, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>
          {wh("surahLabel", { n: chapter.id })} · {chapter.verses_count} {wh("verses")}
        </Text>
        <View style={{ alignSelf: "stretch", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2, marginTop: 16 }}>
          <Medallion width={30} />
          <Cartouche arabic={`${SURAH_PREFIX}${chapter.name_arabic}`} />
          <Medallion width={30} flip />
        </View>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.7, color: "#eef0f3", marginTop: 18, textAlign: "center" }}>{chapter.name_simple}</Text>
        {chapter.translated_name?.name ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, color: "rgba(255,255,255,0.6)", marginTop: 6, textAlign: "center" }}>{chapter.translated_name.name}</Text> : null}
        {withBismillah ? (
          <Animated.Text accessibilityLanguage="ar" style={{ opacity: ink, fontFamily: ARABIC_FONT, fontSize: 29, lineHeight: 64, color: stage.gold, marginTop: 14, textAlign: "center", writingDirection: "rtl" }}>{bismillah}</Animated.Text>
        ) : null}
      </View>
    </Stage>
  );
});
