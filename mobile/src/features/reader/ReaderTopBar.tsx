import { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { CALLIG_FONT, FONT, useTheme } from "@/lib/theme";
import { LogoMark } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";

// The reader's pinned top bar in the website's style: back on the start side; in the centre the gold logo mark,
// "Quran Masterclass" and the surah's Arabic name in calligraphy; focus mode and search on the end side. Transparent
// over the surah banner, a quiet glass (Liquid Glass on iOS 26+, blur elsewhere) once the reader scrolled past it.
export const TOP_BAR_H = 56;
const GLASS = Platform.OS === "ios" && isLiquidGlassAvailable();

function BarButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? t.line : "transparent" })}>
      <Icon name={icon} color={t.ink} size={icon === "chevronLeft" ? 24 : 20} />
    </Pressable>
  );
}

export function ReaderTopBar({ top, solid, reduce, arabicName, brand, backLabel, focusLabel, searchLabel, onBack, onFocus, onSearch }: {
  top: number; solid: boolean; reduce: boolean; arabicName: string; brand: string; backLabel: string; focusLabel: string; searchLabel: string;
  onBack: () => void; onFocus: () => void; onSearch: () => void;
}) {
  const t = useTheme();
  const a = useRef(new Animated.Value(solid ? 1 : 0)).current;
  useEffect(() => {
    if (reduce) { a.setValue(solid ? 1 : 0); return; }
    const anim = Animated.timing(a, { toValue: solid ? 1 : 0, duration: 180, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [solid, reduce, a]);
  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: top + TOP_BAR_H }} pointerEvents="box-none">
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: a }]}>
        {GLASS ? (
          <GlassView glassEffectStyle="regular" tintColor={t.dark ? "rgba(7,22,17,0.35)" : "rgba(255,255,255,0.45)"} style={StyleSheet.absoluteFill} />
        ) : (
          <BlurView intensity={60} tint={t.dark ? "dark" : "light"} style={[StyleSheet.absoluteFill, { backgroundColor: t.dark ? "rgba(7,22,17,0.55)" : "rgba(245,247,246,0.6)" }]} />
        )}
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth, backgroundColor: t.line }} />
      </Animated.View>
      <View style={{ marginTop: top, height: TOP_BAR_H, flexDirection: "row", alignItems: "center", paddingHorizontal: 6 }}>
        <View style={{ width: 92, flexDirection: "row", justifyContent: "flex-start" }}>
          <BarButton icon="chevronLeft" label={backLabel} onPress={onBack} />
        </View>
        <View style={{ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }} accessible accessibilityRole="header" accessibilityLabel={`${brand}, ${arabicName}`}>
          <LogoMark size={26} />
          <View style={{ minWidth: 0, alignItems: "flex-start" }}>
            <Text numberOfLines={1} maxFontSizeMultiplier={1.3} style={{ fontFamily: FONT.semibold, fontSize: 12.5, lineHeight: 16, color: t.ink }}>{brand}</Text>
            <Text numberOfLines={1} allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 14, lineHeight: 22, color: t.gold, writingDirection: "rtl" }}>{arabicName}</Text>
          </View>
        </View>
        <View style={{ width: 92, flexDirection: "row", justifyContent: "flex-end" }}>
          <BarButton icon="eye" label={focusLabel} onPress={onFocus} />
          <BarButton icon="search" label={searchLabel} onPress={onSearch} />
        </View>
      </View>
    </View>
  );
}
