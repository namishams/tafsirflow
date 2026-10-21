import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from "react-native";
import { BlurView } from "expo-blur";
import { ARABIC_FONT, useTheme } from "@/lib/theme";
import type { Verse } from "@/lib/quran";
import { firstLetter, hashOf } from "@/features/shams/memory";
import { toAr } from "./useVerseAudio";

// The Arabic verse word by word, as on the website's verse card: the word being recited lights up, and for practice
// words can be covered (hide 2), shown as first-letter cues (hide 3), half (1), soft = blurred (5), randomly hidden (4)
// or covered from the test position on (6). Single words can be revealed (`shown`).
export type Hide = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Cover = "none" | "hidden" | "soft" | "cue";

/** how one word of a verse is covered */
export function coverOf(hide: number, verseKey: string, seed: number, wi: number, n: number, o: { revealed?: boolean; shown?: ReadonlySet<number>; testPos?: number } = {}): Cover {
  if (!hide || o.revealed || o.shown?.has(wi)) return "none";
  if (hide === 5) return "soft";
  if (hide === 3) return "cue";
  const randomHidden = hide === 4 && ((hashOf(`${verseKey}:${seed}:${wi}`) % 100) < 45 || (n > 1 && wi === hashOf(`${verseKey}:${seed}`) % n));
  if (hide === 2 || (hide === 1 && wi % 2 === 1) || randomHidden || (hide === 6 && wi >= (o.testPos ?? 0))) return "hidden";
  return "none";
}

const AnimatedBlur = Animated.createAnimatedComponent(BlurView);

/** a real blur over a word (soft level); fades out when revealed, unless the system asks for reduced motion */
export function Veil({ on, reduce, radius = 8 }: { on: boolean; reduce: boolean; radius?: number }) {
  const t = useTheme();
  const max = t.dark ? 38 : 30;
  const a = useRef(new Animated.Value(on ? max : 0)).current;
  const [mounted, setMounted] = useState(on);
  useEffect(() => {
    if (on) { setMounted(true); a.setValue(max); return; }
    if (reduce) { a.setValue(0); setMounted(false); return; }
    const anim = Animated.timing(a, { toValue: 0, duration: 220, useNativeDriver: false });
    anim.start(({ finished }) => { if (finished) setMounted(false); });
    return () => anim.stop();
  }, [on, reduce, max, a]);
  if (!mounted) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: "hidden" }]}>
      <AnimatedBlur intensity={a} tint={t.dark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
    </View>
  );
}

/** one Arabic word with its cover: hidden = a placeholder with a visible outline, soft = blurred, cue = first letter */
export function ArabicWord({ text, cover, size, lineHeight, color, background = "transparent", reduce, style }: {
  text: string; cover: Cover; size: number; lineHeight: number; color: string; background?: string; reduce: boolean; style?: StyleProp<TextStyle>;
}) {
  const t = useTheme();
  const hidden = cover === "hidden";
  return (
    <View style={{ borderRadius: 8 }}>
      <Text allowFontScaling maxFontSizeMultiplier={1.6} style={[{
        fontFamily: ARABIC_FONT, fontSize: size, lineHeight, writingDirection: "rtl", paddingHorizontal: 6, borderRadius: 8, overflow: "hidden",
        color: hidden ? "transparent" : cover === "cue" ? t.gold : color,
        backgroundColor: hidden ? t.line : background,
        // the outline keeps a covered word visible as a shape in light and dark (muted ≥ 3:1 against the card)
        borderWidth: hidden ? 1 : 0, borderColor: t.muted, borderStyle: "dashed",
        opacity: cover === "soft" ? 0.6 : 1,
      }, style]}>{cover === "cue" ? firstLetter(text) : text}</Text>
      <Veil on={cover === "soft"} reduce={reduce} />
    </View>
  );
}

export function VerseWords({ verse, activeWord, hide = 0, revealed = false, seed = 0, dimBefore, size = 30, onWord, onLongPress, color, shown, testPos, reduce = false, labels }: {
  verse: Verse; activeWord?: number | null; hide?: Hide; revealed?: boolean; seed?: number; dimBefore?: number | null; size?: number;
  onWord?: (position: number, wi: number, cover: Cover) => void; onLongPress?: () => void; color?: string; shown?: ReadonlySet<number>; testPos?: number; reduce?: boolean;
  /** accessibility labels of covered words (word n of total) */
  labels?: (cover: Cover, n: number, total: number) => string;
}) {
  const t = useTheme();
  const ink = color ?? t.arabic;
  const words = verse.words.filter((w) => w.char_type_name === "word");
  const lineHeight = Math.round(size * 2.05);
  const anyCover = words.some((_, wi) => coverOf(hide, verse.verse_key, seed, wi, words.length, { revealed, shown, testPos }) !== "none");
  // a plain verse is read as one Arabic sentence; with covers every word is its own element
  const group = !onWord || !anyCover;
  return (
    <View style={{ flexDirection: "row", direction: "rtl", flexWrap: "wrap", alignItems: "center", columnGap: size * 0.28 }}
      accessible={group} accessibilityLabel={group ? verse.text_uthmani : undefined} accessibilityLanguage="ar">
      {words.map((w, wi) => {
        const cover = coverOf(hide, verse.verse_key, seed, wi, words.length, { revealed, shown, testPos });
        const on = cover !== "hidden" && activeWord === w.position;
        const dim = dimBefore != null && w.position < dimBefore;
        const body = (
          <ArabicWord text={w.text_uthmani} cover={cover} size={size} lineHeight={lineHeight} color={on ? t.accent : ink} background={on ? t.accentSoft : "transparent"} reduce={reduce}
            style={dim ? { opacity: 0.25 } : undefined} />
        );
        if (!onWord) return <View key={w.position}>{body}</View>;
        const label = cover !== "none" && labels ? labels(cover, wi + 1, words.length) : w.text_uthmani;
        return (
          <Pressable key={w.position} onPress={() => onWord(w.position, wi, cover)} onLongPress={onLongPress} delayLongPress={450}
            accessibilityRole="button" accessibilityLabel={label} accessibilityLanguage={cover === "none" ? "ar" : undefined} hitSlop={2}
            style={{ minHeight: 44, justifyContent: "center" }}>
            {body}
          </Pressable>
        );
      })}
      <Text maxFontSizeMultiplier={1.6} style={{ fontFamily: ARABIC_FONT, fontSize: size * 0.7, lineHeight, color: t.gold, writingDirection: "rtl" }} accessibilityElementsHidden importantForAccessibility="no">﴿{toAr(verse.verse_number)}﴾</Text>
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
