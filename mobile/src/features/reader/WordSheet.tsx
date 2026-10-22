import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { GlassButton, GlassIconButton, GlassSurface } from "@/components/brand";
import { ARABIC_FONT, FONT, useTheme } from "@/lib/theme";
import type { Verse } from "@/lib/quran";
import { useVerseRoots } from "@/features/shams/roots";
import { useMomentT } from "@/features/moments/texts";

// Word by word in the reader: a tap on a word shows a glass card above the player with the word as the Quran data
// writes it, its meaning and transliteration (Quran.com word data) and its root with how often the root occurs
// (the roots table of features/shams/roots.ts). It does not cover the verse and closes with one tap.
export function WordSheet({ verse, position, bottom, reduce, onPlay, onClose }: {
  verse: Verse; position: number; bottom: number; reduce: boolean; onPlay: () => void; onClose: () => void;
}) {
  const t = useTheme();
  const tx = useMomentT();
  const [s, v] = verse.verse_key.split(":").map(Number);
  const roots = useVerseRoots(s, v);
  const word = verse.words.find((x) => x.position === position && x.char_type_name === "word");
  const root = roots[position];
  const enter = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  useEffect(() => {
    if (!word) return;
    AccessibilityInfo.announceForAccessibility([word.translation?.text, word.transliteration?.text].filter(Boolean).join(", "));
    if (reduce) { enter.setValue(1); return; }
    enter.setValue(0);
    Animated.timing(enter, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [verse.verse_key, position]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!word) return null;
  const ink = t.ink, muted = t.muted, gold = t.gold;
  const nf = (n: number) => n.toLocaleString();
  return (
    <Animated.View pointerEvents="box-none" style={{ position: "absolute", left: 12, right: 12, bottom, opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
      <GlassSurface strong style={{ borderRadius: 24, padding: 16, backgroundColor: t.dark ? "rgba(5,24,18,0.86)" : "rgba(255,255,255,0.9)" }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: 34, lineHeight: 64, color: t.arabic, writingDirection: "rtl", textAlign: "left" }}>{word.text_uthmani}</Text>
            <Row label={tx("meaning")} value={word.translation?.text ?? "–"} ink={ink} muted={muted} />
            <Row label={tx("translit")} value={word.transliteration?.text ?? "–"} ink={gold} muted={muted} italic />
            <Row label={tx("root")} ink={ink} muted={muted}
              value={root ? `${root.letters}  ·  ${tx("rootCount", { n: nf(root.count) })}` : tx("noRoot")} arabic={!!root} />
          </View>
          <View style={{ gap: 8 }}>
            <GlassIconButton icon="close" size={36} label={tx("close")} onPress={onClose} />
            <GlassIconButton icon="volume" size={36} label={tx("playWord")} onPress={onPlay} />
          </View>
        </View>
        {root ? <GlassButton compact icon="search" title={tx("exploreRoot")} onPress={() => { onClose(); router.push(`/arabic/lang/roots?r=${encodeURIComponent(root.root)}` as Href); }} style={{ marginTop: 10 }} /> : null}
      </GlassSurface>
    </Animated.View>
  );
}

function Row({ label, value, ink, muted, italic, arabic }: { label: string; value: string; ink: string; muted: string; italic?: boolean; arabic?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={{ width: 96, fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: muted }}>{label}</Text>
      <Text style={{ flex: 1, fontFamily: arabic ? FONT.medium : italic ? FONT.italic : FONT.medium, fontSize: 15, lineHeight: 21, color: ink }}>{value}</Text>
    </View>
  );
}
