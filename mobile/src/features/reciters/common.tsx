import { type ReactNode } from "react";
import { Animated, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { CALLIG_FONT, FONT, R, useTheme } from "@/lib/theme";
import { Poster, PosterGrid, SectionTitle, gradientColors } from "@/components/brand";
import { useWebT } from "@/i18n/web";
import { TILES } from "@/web/tiles";
import { COUNTRIES_DE, type ReciterBio } from "@/web/reciters";
import { useFadeIn, useReduceMotion } from "@/features/radio/motion";
import { useQ } from "@/features/radio/art";

// Pieces shared by /reciters and /reciters/[slug]: the drawn calligraphy behind the hero, the warm "marble" page wash,
// the gold-framed tile (.q-tile), initials and country names like the website, and the "Courses and tools" posters.

/** CalligraphyDraw: a large Arabic word in faint gold behind the hero (fades in instead of being drawn) */
export function CalligraphyBackdrop({ text }: { text: string }) {
  const reduce = useReduceMotion();
  const o = useFadeIn(reduce, 2400);
  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", top: -6, right: -6, left: 40, alignItems: "flex-end", opacity: o }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: CALLIG_FONT, fontSize: 108, lineHeight: 170, color: "rgba(214,180,108,0.12)", writingDirection: "rtl", textAlign: "right" }}>{text}</Text>
    </Animated.View>
  );
}

/** .q-page: warm parchment wash over the canvas */
export function QPageWash() {
  const t = useTheme();
  const q = useQ();
  const b = q.marbleB.replace("rgb(", "").replace(")", "");
  const colors: [string, string, string] = t.dark ? [`rgba(${b},0.6)`, `rgba(${b},0.3)`, `rgba(${b},0)`] : [`rgba(${b},0.7)`, `rgba(${b},0.42)`, `rgba(${b},0.3)`];
  return <LinearGradient pointerEvents="none" colors={colors} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1400 }} />;
}

/** .q-tile: white tile with a gold border, a fine inner ring and a short gold hairline on the top edge */
export function QTile({ children, onPress, style, label }: { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; label?: string }) {
  const q = useQ();
  const inner = (pressed: boolean) => (
    <>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { margin: 3, borderRadius: 9, borderWidth: 1, borderColor: pressed ? "rgba(201,166,94,0.22)" : "rgba(201,166,94,0.1)" }]} />
      <LinearGradient pointerEvents="none" colors={["rgba(201,166,94,0)", "rgb(201,166,94)", "rgba(201,166,94,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ position: "absolute", top: 0, left: pressed ? 18 : "38%", right: pressed ? 18 : "38%", height: 1, opacity: pressed ? 1 : 0.55 }} />
      {children}
    </>
  );
  const base = { borderRadius: R.card, borderWidth: 1, backgroundColor: q.tile, overflow: "hidden" as const };
  if (!onPress) return <View style={[base, { borderColor: "rgba(201,166,94,0.24)" }, style]}>{inner(false)}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [base, { borderColor: pressed ? "rgba(201,166,94,0.6)" : "rgba(201,166,94,0.24)", transform: [{ scale: pressed ? 0.985 : 1 }] }, style]}>
      {({ pressed }) => inner(pressed)}
    </Pressable>
  );
}

/** initials on the seal, like the website (Latin names without Al-/Ash-/Abu …) */
export const bioInitials = (r: ReciterBio) =>
  r.name.split(/[\s-]+/).filter((w) => /^[A-Z]/.test(w) && !["Al", "Ash", "As", "Ar", "Ad", "At", "Az", "An", "Abu"].includes(w)).slice(0, 2).map((w) => w[0]).join("");
export const countryName = (r: ReciterBio, lang: string) => (lang === "de" ? COUNTRIES_DE[r.country] ?? r.country : r.country);

/** "Courses and tools" posters at the end of a page (PosterTiles.tsx MoreTiles) */
export function MoreTiles({ keys }: { keys: string[] }) {
  const w = useWebT();
  const items = keys.map((k) => TILES[k]).filter(Boolean);
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
      <SectionTitle title={w("home2.coursesTitle")} action={w("home2.coursesAll")} onAction={() => router.push("/academy" as Href)} />
      <PosterGrid>
        {items.map((c) => (
          <Poster key={c.key} title={w(`nav.${c.key}`)} desc={w(`home2.${c.desc}`)} badge={w(`home2.badge_${c.badge}`)} arabic={c.ar}
            colors={gradientColors(c.bg)} cta={w("home2.open")} onPress={() => router.push(c.href as Href)} />
        ))}
      </PosterGrid>
    </View>
  );
}

export const labelStyle = { fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.6, textTransform: "uppercase" as const };
