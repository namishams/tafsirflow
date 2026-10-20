import { Pressable, Text, View } from "react-native";
import { ARABIC_FONT, useTheme } from "@/lib/theme";
import type { Verse } from "@/lib/quran";
import { firstLetter, hashOf } from "@/features/shams/memory";
import { toAr } from "./useVerseAudio";

// The Arabic verse word by word, as on the website's verse card: the word being recited lights up, and for practice
// words can be covered (hide 2), shown as first-letter cues (hide 3), half (1), soft (5) or randomly hidden (4).
export type Hide = 0 | 1 | 2 | 3 | 4 | 5;

export function VerseWords({ verse, activeWord, hide = 0, revealed = false, seed = 0, dimBefore, size = 30, onWord, color }: {
  verse: Verse; activeWord?: number | null; hide?: Hide; revealed?: boolean; seed?: number; dimBefore?: number | null; size?: number;
  onWord?: (position: number) => void; color?: string;
}) {
  const t = useTheme();
  const ink = color ?? t.arabic;
  const words = verse.words.filter((w) => w.char_type_name === "word");
  const lineHeight = Math.round(size * 2.05);
  return (
    <View style={{ flexDirection: "row", direction: "rtl", flexWrap: "wrap", alignItems: "center", columnGap: size * 0.28 }} accessible accessibilityLabel={verse.text_uthmani} accessibilityLanguage="ar">
      {words.map((w, wi) => {
        const randomHidden = hide === 4 && ((hashOf(`${verse.verse_key}:${seed}:${wi}`) % 100) < 45 || (words.length > 1 && wi === hashOf(`${verse.verse_key}:${seed}`) % words.length));
        const covered = !revealed && (hide === 2 || (hide === 1 && wi % 2 === 1) || randomHidden);
        const soft = hide === 5 && !revealed;
        const cue = hide === 3 && !revealed;
        const on = !covered && activeWord === w.position;
        const dim = dimBefore != null && w.position < dimBefore;
        const body = (
          <Text allowFontScaling style={{
            fontFamily: ARABIC_FONT, fontSize: size, lineHeight, writingDirection: "rtl", paddingHorizontal: 4, borderRadius: 8, overflow: "hidden",
            color: covered ? "transparent" : cue ? t.gold : on ? t.accent : ink,
            backgroundColor: covered ? t.line : on ? t.accentSoft : "transparent",
            opacity: soft ? 0.35 : dim ? 0.25 : 1,
          }}>{cue ? firstLetter(w.text_uthmani) : w.text_uthmani}</Text>
        );
        return onWord ? <Pressable key={w.position} onPress={() => onWord(w.position)} accessibilityRole="button" accessibilityLabel={w.translation?.text ?? w.text_uthmani}>{body}</Pressable> : <View key={w.position}>{body}</View>;
      })}
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: size * 0.7, lineHeight, color: t.gold, writingDirection: "rtl" }} accessibilityElementsHidden>﴿{toAr(verse.verse_number)}﴾</Text>
    </View>
  );
}

/** word-by-word grid (Shams step 3): Arabic, transliteration, meaning */
export function WordGrid({ verse, activeWord, onWord }: { verse: Verse; activeWord?: number | null; onWord?: (position: number) => void }) {
  const t = useTheme();
  const words = verse.words.filter((w) => w.char_type_name === "word");
  return (
    <View style={{ flexDirection: "row", direction: "rtl", flexWrap: "wrap", gap: 8 }}>
      {words.map((w) => {
        const on = activeWord === w.position;
        return (
          <Pressable key={w.position} onPress={() => onWord?.(w.position)} accessibilityRole="button" accessibilityLabel={`${w.transliteration?.text ?? ""}, ${w.translation?.text ?? ""}`}
            style={{ minWidth: 76, alignItems: "center", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: on ? "rgb(201,166,94)" : t.line, backgroundColor: on ? t.accentSoft : t.surface }}>
            <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 44, color: on ? t.accent : t.arabic }}>{w.text_uthmani}</Text>
            {w.transliteration?.text ? <Text style={{ fontFamily: "PlusJakartaSans_400Regular_Italic", fontSize: 12, color: t.gold }}>{w.transliteration.text}</Text> : null}
            {w.translation?.text ? <Text style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 12, color: t.muted, textAlign: "center", maxWidth: 120 }}>{w.translation.text}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** the word being recited at a position (ms) from the timing segments */
export function wordAt(verse: Verse | undefined, ms: number): number | null {
  const s = verse?.segments.find((x) => ms >= x.start && ms < x.end);
  return s ? s.word : null;
}
