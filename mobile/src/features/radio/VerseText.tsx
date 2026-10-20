import { memo } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";
import { ARABIC_FONT, AR_RIGHT } from "@/lib/theme";
import type { Verse } from "@/lib/quran";

// The verse on air in the Quran face. With word timings, the word being recited is lit in gold. The words are only
// set one by one when, joined, they are exactly the verse text from the server; otherwise the verse text is shown as is.
export const VerseArabic = memo(function VerseArabic({ verse, activeWord, size = 28, color = "#ffffff", active = "#e9cf99", style }: {
  verse: Verse; activeWord?: number | null; size?: number; color?: string; active?: string; style?: StyleProp<TextStyle>;
}) {
  const words = verse.words.filter((w) => w.char_type_name === "word");
  const exact = words.length > 0 && words.map((w) => w.text_uthmani).join(" ") === verse.text_uthmani;
  const base: StyleProp<TextStyle> = [{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 2.05, color, writingDirection: "rtl", textAlign: AR_RIGHT }, style];
  if (!exact || !activeWord) return <Text style={base} accessibilityLanguage="ar">{verse.text_uthmani}</Text>;
  return (
    <Text style={base} accessibilityLanguage="ar" accessibilityLabel={verse.text_uthmani}>
      {words.map((w, i) => (
        <Text key={w.position} style={w.position === activeWord ? { color: active } : null}>{w.text_uthmani}{i < words.length - 1 ? " " : ""}</Text>
      ))}
    </Text>
  );
});

/** the word being recited at `ms` (segments from the reciter's timings) */
export function wordAt(verse: Verse | undefined, ms: number): number | null {
  if (!verse?.segments.length) return null;
  const s = verse.segments.find((x) => ms >= x.start && ms < x.end);
  return s ? s.word : null;
}
