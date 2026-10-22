import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, G, LinearGradient as SvgLinearGradient, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { WORDMARK, WORDMARK_FOIL } from "./wordmark-paths";
import { ARABIC_VARIANT, WORDMARK_FILES, type WordmarkFile } from "./wordmark-files";
import { isRTL, useLang } from "@/i18n";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, TONES, goldButton, stage, type, useTheme } from "@/lib/theme";
import { Icon, type IconName } from "./icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// The visual language of quranmasterclass.com, rebuilt natively: the dark green stage with a lattice of
// eight-pointed stars and gold hairlines, gold buttons, cards with an inner gold frame, mushaf ornaments.

/** subtle eight-point-star lattice (globals.css .pattern) */
export function StarLattice({ opacity = 0.1, size = 64 }: { opacity?: number; size?: number }) {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id="lattice" width={size} height={size} patternUnits="userSpaceOnUse">
          <Path d={`M${size / 2} ${size * 0.0625}l${size * 0.094} ${size * 0.3125} ${size * 0.3125} ${size * 0.094} -${size * 0.3125} ${size * 0.094} -${size * 0.094} ${size * 0.3125} -${size * 0.094} -${size * 0.3125} -${size * 0.3125} -${size * 0.094} ${size * 0.3125} -${size * 0.094}z`}
            fill="none" stroke="#ffffff" strokeOpacity={opacity} strokeWidth={1} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#lattice)" />
    </Svg>
  );
}

/** the stage: dark green like the binding of a mushaf, a soft glow from above, gold hairlines top and bottom */
export function Stage({ children, style, rounded = 0, hairlines = true, pattern = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; rounded?: number; hairlines?: boolean; pattern?: boolean }) {
  return (
    <View style={[{ borderRadius: rounded, overflow: "hidden", backgroundColor: stage.bg }, style]}>
      <LinearGradient colors={[stage.bg, stage.deep]} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="-20%" rx="80%" ry="70%">
            <Stop offset="0" stopColor="rgb(18,74,56)" stopOpacity={0.9} />
            <Stop offset="1" stopColor="rgb(18,74,56)" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#glow)" />
      </Svg>
      {pattern ? <StarLattice opacity={0.07} /> : null}
      {hairlines ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: rounded, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: stage.goldSoft }]} /> : null}
      {children}
    </View>
  );
}

/** no tracking in Arabic-script languages (ar, ur, fa, ps): letter-spacing breaks the joining of the letters */
const NO_TRACK: TextStyle = { letterSpacing: 0 };

/** small uppercase label above headings (.eyebrow), gold on the stage */
export function Eyebrow({ children, onStage, style }: { children: ReactNode; onStage?: boolean; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  const { lang } = useLang();
  return <Text style={[type.eyebrow, isRTL(lang) ? NO_TRACK : null, { color: onStage ? stage.gold : t.muted }, style]} accessibilityRole="text">{children}</Text>;
}

/** headline in the website's display face (Plus Jakarta Sans ExtraBold, tight tracking) */
export function Display({ children, size = "display", onStage, style, numberOfLines }: { children: ReactNode; size?: "display" | "largeTitle" | "title1" | "title2"; onStage?: boolean; style?: StyleProp<TextStyle>; numberOfLines?: number }) {
  const t = useTheme();
  const { lang } = useLang();
  // Arabic titles in the calligraphy of the Arabic wordmark (Aref Ruqaa); Quran text never goes through Display
  const callig = lang === "ar" ? { fontFamily: CALLIG_FONT, letterSpacing: 0, lineHeight: Math.round(type[size].fontSize * 1.5) } : null;
  return <Text accessibilityRole="header" numberOfLines={numberOfLines} style={[type[size], callig, { color: onStage ? "#ffffff" : t.ink }, style]}>{children}</Text>;
}

// ── Controls: ONE set for the whole app (mirrored on the web in src/components/ui/Glass.tsx) ─────────────
// Primary = gold capsule (GoldButton). Secondary = Liquid Glass capsule (GlassButton, alias OutlineButton).
// Tertiary = text button (TextButton, alias TextLink). Plus GlassChip/Chip, Segmented, GlassCard, GlassDock and
// round GlassIconButton (player transport). All built like the Shams tab: emerald stage, gold, glass.

/** Liquid Glass on iOS 26+, a blur on older iOS, a translucent fill elsewhere */
export const LIQUID_GLASS = Platform.OS === "ios" && isLiquidGlassAvailable();
const GLASS = LIQUID_GLASS;
/** shared glass radii (web: --glass-r-*) */
export const GLASS_R = { card: 22, dock: 28, chip: R.pill, button: R.pill };

type GlassTone = "stage" | "light" | "dark";
function glassTone(onStage: boolean | undefined, dark: boolean): GlassTone {
  return onStage ? "stage" : dark ? "dark" : "light";
}
/** tint, hairline and text colour of the glass on each canvas: emerald wash and a gold hairline, never plain white */
export function glassColors(tone: GlassTone) {
  if (tone === "stage") return { tint: "rgba(4,32,24,0.35)", fill: "rgba(255,255,255,0.07)", line: "rgba(255,255,255,0.22)", text: "#ffffff", sub: "rgba(255,255,255,0.7)" };
  if (tone === "dark") return { tint: "rgba(58,190,146,0.10)", fill: "rgba(22,52,42,0.72)", line: "rgba(214,178,106,0.30)", text: "rgb(236,238,242)", sub: "rgb(140,147,158)" };
  return { tint: "rgba(6,108,78,0.09)", fill: "rgba(230,242,236,0.92)", line: "rgba(150,116,52,0.32)", text: "rgb(6,108,78)", sub: "rgb(90,103,98)" };
}

/** the glass material itself: children sit on top; radius and padding come from style */
export function GlassSurface({ children, style, onStage, interactive, strong, ...rest }: Omit<ViewProps, "style" | "children"> & { children?: ReactNode; style?: StyleProp<ViewStyle>; onStage?: boolean; interactive?: boolean; strong?: boolean }) {
  const t = useTheme();
  const c = glassColors(glassTone(onStage, t.dark));
  const border = { borderWidth: StyleSheet.hairlineWidth, borderColor: c.line, overflow: "hidden" as const };
  if (GLASS) {
    return (
      <GlassView {...rest} glassEffectStyle={onStage || t.dark ? "clear" : "regular"} isInteractive={interactive} tintColor={strong && onStage ? "rgba(5,28,21,0.72)" : c.tint}
        style={[border, style]}>{children}</GlassView>
    );
  }
  if (Platform.OS === "ios") {
    return (
      <View {...rest} style={[border, style]}>
        <BlurView pointerEvents="none" intensity={onStage || t.dark ? 40 : 60} tint={onStage || t.dark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: strong && onStage ? "rgba(5,28,21,0.8)" : onStage ? "rgba(255,255,255,0.06)" : c.tint }]} />
        {children}
      </View>
    );
  }
  return <View {...rest} style={[border, { backgroundColor: strong && onStage ? "rgba(5,28,21,0.94)" : c.fill }, style]}>{children}</View>;
}

/** btn-gold: the main action; full width by default, always the same height */
export function GoldButton({ title, onPress, busy, disabled, icon, compact, style }: { title: string; onPress: () => void; busy?: boolean; disabled?: boolean; icon?: IconName; compact?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} disabled={disabled || busy} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!(disabled || busy), busy: !!busy }}
      style={({ pressed }) => [s.goldShadow, { opacity: disabled ? 0.45 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }, compact ? { alignSelf: "flex-start" } : null, style]}>
      <LinearGradient colors={[goldButton.from, goldButton.to]} style={[s.button, compact && s.compact]}>
        <LinearGradient pointerEvents="none" colors={["rgba(255,255,255,0.38)", "rgba(255,255,255,0)"]} style={s.goldSheen} />
        <View pointerEvents="none" style={s.goldHighlight} />
        {busy ? <ActivityIndicator color={goldButton.text} /> : (
          <View style={s.buttonRow}>
            {icon ? <Icon name={icon} size={16} color={goldButton.text} /> : null}
            <Text style={[type.button, { color: goldButton.text }]} numberOfLines={1}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

/** the secondary action: a Liquid Glass capsule (iOS 26+), blur on older iOS; emerald text and a gold hairline on light canvases */
export function GlassButton({ title, onPress, onStage, disabled, icon, compact, style }: { title: string; onPress: () => void; onStage?: boolean; disabled?: boolean; icon?: IconName; compact?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const c = glassColors(glassTone(onStage, t.dark));
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [{ opacity: disabled ? 0.45 : pressed && !GLASS ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }, compact ? { alignSelf: "flex-start" } : null, style]}>
      <GlassSurface onStage={onStage} interactive style={[s.button, compact && s.compact]}>
        <View style={s.buttonRow}>
          {icon ? <Icon name={icon} size={16} color={onStage ? stage.gold : c.text} /> : null}
          <Text style={[type.button, { color: c.text }]} numberOfLines={1}>{title}</Text>
        </View>
      </GlassSurface>
    </Pressable>
  );
}
/** older name of the secondary button; same glass capsule */
export const OutlineButton = GlassButton;

/** two or three actions side by side (Apple's button row) instead of a stack of full-width buttons */
export function ActionRow({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: "row", gap: 10 }, style]}>{children}</View>;
}

/** the tertiary action: text only, in emerald (gold on the stage), with a 44 pt touch target */
export function TextButton({ title, onPress, onStage, icon, style, disabled }: { title: string; onPress: () => void; onStage?: boolean; icon?: IconName; style?: StyleProp<ViewStyle>; disabled?: boolean }) {
  const t = useTheme();
  const color = onStage ? stage.gold : t.accent;
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={title} hitSlop={6}
      style={({ pressed }) => [{ minHeight: 44, flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 6, opacity: disabled ? 0.45 : pressed ? 0.55 : 1 }, style]}>
      {icon ? <Icon name={icon} size={15} color={color} /> : null}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color }} numberOfLines={1}>{title}</Text>
    </Pressable>
  );
}

/** text link in the accent colour (inline, inside running text) */
export function TextLink({ title, onPress, onStage, style }: { title: string; onPress: () => void; onStage?: boolean; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text onPress={onPress} accessibilityRole="link" style={[{ fontFamily: FONT.semibold, fontSize: 15, color: onStage ? stage.gold : t.accent, paddingVertical: 8 }, style]}>{title}</Text>;
}

/** round glass button (player transport, close, share); variant "gold" = the one main round action (play) */
export function GlassIconButton({ icon, onPress, label, size = 52, onStage, variant = "glass", disabled, style, children }: {
  icon?: IconName; onPress: () => void; label: string; size?: number; onStage?: boolean; variant?: "glass" | "gold"; disabled?: boolean; style?: StyleProp<ViewStyle>; children?: ReactNode;
}) {
  const t = useTheme();
  const c = glassColors(glassTone(onStage, t.dark));
  const round = { width: size, height: size, borderRadius: size / 2, alignItems: "center" as const, justifyContent: "center" as const };
  const glyph = Math.round(size * 0.4);
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} hitSlop={size < 44 ? (44 - size) / 2 : 0}
      style={({ pressed }) => [variant === "gold" ? s.goldShadow : null, { borderRadius: size / 2, opacity: disabled ? 0.4 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] }, style]}>
      {variant === "gold" ? (
        <LinearGradient colors={[goldButton.from, goldButton.to]} style={round}>
          <LinearGradient pointerEvents="none" colors={["rgba(255,255,255,0.4)", "rgba(255,255,255,0)"]} style={[StyleSheet.absoluteFill, { borderRadius: size / 2, bottom: size / 2 }]} />
          {children ?? (icon ? <Icon name={icon} size={glyph} color={goldButton.text} /> : null)}
        </LinearGradient>
      ) : (
        <GlassSurface onStage={onStage} interactive style={round}>
          {children ?? (icon ? <Icon name={icon} size={glyph} color={c.text} /> : null)}
        </GlassSurface>
      )}
    </Pressable>
  );
}

/** glass card: the Liquid Glass panel for floating content (player, overlays, cards on the stage) */
export function GlassCard({ children, style, onStage, padded = true, onPress, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onStage?: boolean; padded?: boolean; onPress?: () => void; accessibilityLabel?: string }) {
  const body = <GlassSurface onStage={onStage} interactive={!!onPress} style={[{ borderRadius: GLASS_R.card }, padded && { padding: 18 }, style]}>{children}</GlassSurface>;
  if (!onPress) return body;
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.985 : 1 }] })}>{body}</Pressable>;
}

/** glass bottom dock: floats above the home indicator (and above the tab bar with tabBar), content never hides behind it.
 *  Screens that use it add GLASS_DOCK_SPACE (+ safe area) of bottom padding to their scroll content. */
export const GLASS_DOCK_SPACE = 96;
export function GlassDock({ children, style, onStage, bottom = 0 }: { children: ReactNode; style?: StyleProp<ViewStyle>; onStage?: boolean; bottom?: number }) {
  const { bottom: safe } = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom: bottom + Math.max(safe, 12), paddingHorizontal: 12 }}>
      <GlassSurface onStage={onStage} strong style={[s.dockShadow, { borderRadius: GLASS_R.dock, padding: 8, flexDirection: "row", alignItems: "center", gap: 8 }, style]}>{children}</GlassSurface>
    </View>
  );
}

/** pa-card: surface with a gold border, a finer gold frame inside and a small star on the top edge */
export function GoldCard({ children, style, star = true, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; star?: boolean; padded?: boolean }) {
  const t = useTheme();
  return (
    <View style={[{ borderRadius: R.card, borderWidth: 1, borderColor: t.dark ? "rgba(214,178,106,0.26)" : "rgba(150,116,52,0.26)", backgroundColor: t.surface }, padded && { padding: 18, paddingTop: 20 }, style]}>
      <LinearGradient pointerEvents="none" colors={[t.dark ? "rgba(214,178,106,0.06)" : "rgba(150,116,52,0.06)", "transparent"]} style={[StyleSheet.absoluteFill, { borderRadius: R.card, height: 120 }]} />
      <View pointerEvents="none" style={{ position: "absolute", top: 4, left: 4, right: 4, bottom: 4, borderRadius: 9, borderWidth: 1, borderColor: t.dark ? "rgba(214,178,106,0.14)" : "rgba(150,116,52,0.14)" }} />
      {star ? <View pointerEvents="none" style={{ position: "absolute", top: -6, left: 0, right: 0, alignItems: "center" }}><SmallStar size={12} color="#c9a65e" /></View> : null}
      {children}
    </View>
  );
}

/** plain tile: white surface with a hairline border (the website's default card) */
export function Tile({ children, style, onPress, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string }) {
  const t = useTheme();
  const base = [{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => [base, pressed && { borderColor: goldButton.line }]}>{children}</Pressable>;
}

export function SmallStar({ size = 12, color = "#c9a65e" }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 12 12"><Path d="M6 .5l1.4 3.1L10.5 5 7.4 6.4 6 9.5 4.6 6.4 1.5 5l3.1-1.4z" fill={color} /></Svg>;
}

/** thin gold rule with a khatam star in the middle (Ornaments.tsx Divider) */
export function Divider({ style, onStage }: { style?: StyleProp<ViewStyle>; onStage?: boolean }) {
  const t = useTheme();
  const c = onStage ? stage.gold : t.gold;
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={["transparent", c]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 1, width: 64, opacity: 0.6 }} />
      <Svg width={8} height={8} viewBox="0 0 24 24"><Path d="M12 2l10 10-10 10L2 12z" fill={c} opacity={0.7} /></Svg>
      <Svg width={22} height={22} viewBox="0 0 40 40"><G fill="none" stroke={c} strokeWidth={1.4}><Path d="M9 9h22v22H9z" /><Path d="M20 4.5L35.5 20 20 35.5 4.5 20z" /></G><Circle cx={20} cy={20} r={3.2} fill={c} /></Svg>
      <Svg width={8} height={8} viewBox="0 0 24 24"><Path d="M12 2l10 10-10 10L2 12z" fill={c} opacity={0.7} /></Svg>
      <LinearGradient colors={[c, "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 1, width: 64, opacity: 0.6 }} />
    </View>
  );
}

/** the verse number in an eight-pointed star of two squares, like the verse cards on the website */
export function StarNumber({ n, size = 34, active }: { n: number | string; size?: number; active?: boolean }) {
  const t = useTheme();
  const c = t.gold;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }} accessibilityLabel={String(n)}>
      <Svg width={size} height={size} viewBox="0 0 40 40" style={StyleSheet.absoluteFill}>
        <G fill={active ? (t.dark ? "rgba(214,178,106,0.18)" : "rgba(150,116,52,0.12)") : "none"} stroke={c} strokeWidth={1.2}>
          <Path d="M9 9h22v22H9z" />
          <Path d="M20 4.5L35.5 20 20 35.5 4.5 20z" />
        </G>
      </Svg>
      <Text style={{ fontFamily: FONT.bold, fontSize: size * 0.3, color: c }} allowFontScaling={false}>{n}</Text>
    </View>
  );
}

/** surah title in a gold cartouche with pointed ends (Ornaments.tsx SurahBanner) */
export function SurahBanner({ arabic, onStage = true }: { arabic: string; onStage?: boolean }) {
  const t = useTheme();
  const c = onStage ? stage.gold : t.gold;
  return (
    <View style={{ width: "100%", aspectRatio: 600 / 96, justifyContent: "center" }}>
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 600 96" preserveAspectRatio="none">
        <Defs>
          <Pattern id="girih" width={24} height={24} patternUnits="userSpaceOnUse">
            <Path d="M6 6h12v12H6zM12 2.5l9.5 9.5L12 21.5 2.5 12z" fill="none" stroke={c} strokeOpacity={0.22} strokeWidth={0.8} />
          </Pattern>
        </Defs>
        <Path d="M40 6H560L594 48 560 90H40L6 48Z" fill="url(#girih)" />
        <Path d="M40 6H560L594 48 560 90H40L6 48Z" fill="none" stroke={c} strokeWidth={2} />
        <Path d="M46 13H554L582 48 554 83H46L18 48Z" fill={onStage ? "rgb(5,28,21)" : t.surface} fillOpacity={onStage ? 0.72 : 0.92} stroke={c} strokeWidth={1} />
      </Svg>
      <Text style={{ fontFamily: CALLIG_FONT, fontSize: 26, lineHeight: 40, textAlign: "center", color: onStage ? stage.gold : t.ink }} allowFontScaling={false}>{arabic}</Text>
    </View>
  );
}

/** row of pointed arches along the lower edge of a dark hero (art-practice.css .pa-arcade) */
export function Arcade({ color = stage.gold }: { color?: string }) {
  return (
    <View style={{ height: 30, overflow: "hidden" }} pointerEvents="none">
      <Svg width="100%" height={30}>
        <Defs>
          <Pattern id="arc" width={56} height={30} patternUnits="userSpaceOnUse">
            <G fill="none" stroke={color} strokeWidth={1}>
              <Path d="M5 30V17C5 10 15 5 28 1.5 41 5 51 10 51 17V30" strokeOpacity={0.42} />
              <Path d="M10 30V18C10 12.5 18 8.5 28 5.5 38 8.5 46 12.5 46 18V30" strokeOpacity={0.2} />
            </G>
            <Path d="M28 10.5l1.6 3.4 3.4 1.6-3.4 1.6-1.6 3.4-1.6-3.4-3.4-1.6 3.4-1.6z" fill={color} fillOpacity={0.35} />
          </Pattern>
        </Defs>
        <Rect width="100%" height={30} fill="url(#arc)" />
      </Svg>
      <LinearGradient colors={["transparent", "rgba(214,180,108,0.75)", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1 }} />
    </View>
  );
}

/** course poster: dark tone, Arabic word as watermark, label, title, short text, gold "open" line */
export function Poster({ title, desc, badge, arabic, tone = 0, colors, cta, locked, onPress, tall = true }: {
  title: string; desc: string; badge: string; arabic: string; tone?: number; colors?: [string, string]; cta: string; locked?: boolean; onPress: () => void; tall?: boolean;
}) {
  const [a, b] = colors ?? TONES[tone % TONES.length];
  const { lang } = useLang();
  const track = isRTL(lang) ? NO_TRACK : null;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${desc}${locked ? ". Pro" : ""}`}
      style={({ pressed }) => [{ flex: 1, borderRadius: R.md, overflow: "hidden", transform: [{ scale: pressed ? 0.985 : 1 }] }]}>
      <LinearGradient colors={[a, b]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={[{ padding: 16, justifyContent: "flex-end" }, tall ? { aspectRatio: 4 / 5 } : { minHeight: 150 }]}>
        <StarLattice opacity={0.05} size={48} />
        <View pointerEvents="none" style={{ position: "absolute", top: 8, left: 8, right: 8, bottom: 8, borderRadius: 6, borderWidth: 1, borderColor: "rgba(233,207,153,0.16)" }} />
        <Text numberOfLines={1} allowFontScaling={false} style={{ position: "absolute", right: -2, top: 6, fontFamily: CALLIG_FONT, fontSize: 64, lineHeight: 96, color: "rgba(233,207,153,0.13)" }}>{arabic}</Text>
        <View style={{ position: "absolute", left: 16, top: 16, right: 16, flexDirection: "row", alignItems: "center", gap: 6 }}>
          <SmallStar size={9} color="rgba(214,180,108,0.8)" />
          <Text numberOfLines={1} style={[type.eyebrow, track, { fontSize: 9.5, color: "rgba(255,255,255,0.6)", flex: 1 }]}>{badge}</Text>
          {locked ? <Icon name="lock" size={15} color={stage.gold} /> : null}
        </View>
        <Text style={{ fontFamily: FONT.display, fontSize: 19, lineHeight: 23, letterSpacing: -0.4, color: "#ffffff" }} numberOfLines={2}>{title}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: "rgba(255,255,255,0.65)", marginTop: 6 }} numberOfLines={2}>{desc}</Text>
        <Text style={[type.eyebrow, track, { fontSize: 10.5, color: stage.gold, marginTop: 12 }]}>{cta}</Text>
      </LinearGradient>
    </Pressable>
  );
}

/** the two colours of a website gradient like "linear-gradient(160deg,#3a2f12 0%,#14110a 100%)" */
export function gradientColors(css: string): [string, string] {
  const m = css.match(/#[0-9a-fA-F]{6}/g) ?? [];
  return [m[0] ?? TONES[0][0], m[1] ?? TONES[0][1]];
}

/** posters in a grid like the website's PosterGrid: two per row on phones, three on wide screens */
export function PosterGrid({ children }: { children: ReactNode[] }) {
  const { width } = useWindowDimensions();
  const cols = width >= 700 ? 3 : 2;
  const rows: ReactNode[][] = [];
  children.forEach((c, i) => { if (i % cols === 0) rows.push([]); rows[rows.length - 1].push(c); });
  return (
    <View style={{ gap: 12 }}>
      {/* a short last row is never padded with empty cells: its posters widen into banners (no white holes) */}
      {rows.map((r, i) => <View key={i} style={{ flexDirection: "row", gap: 12 }}>{r.length < cols ? r.map((c) => (isValidElement(c) && c.type === Poster ? cloneElement(c as ReactElement<{ tall?: boolean }>, { tall: false }) : c)) : r}</View>)}
    </View>
  );
}

/** glass chip (pa-chip): unselected = glass capsule, selected = gold capsule; disabled = dimmed and not tappable */
export function Chip({ label, selected, onPress, onStage, disabled, icon, role = "button", small }: {
  label: string; selected?: boolean; onPress: () => void; onStage?: boolean; disabled?: boolean; icon?: IconName;
  /** accessibility role: a tab of a filter row, a checkbox of a multiple choice, a radio of a single choice */
  role?: "button" | "tab" | "checkbox" | "radio"; small?: boolean;
}) {
  const t = useTheme();
  const c = glassColors(glassTone(onStage, t.dark));
  const checkable = role === "checkbox" || role === "radio";
  const a11y = { accessibilityRole: role, accessibilityState: checkable ? { checked: !!selected, disabled: !!disabled } : { selected: !!selected, disabled: !!disabled }, accessibilityLabel: label };
  if (selected) {
    return (
      <Pressable onPress={onPress} disabled={disabled} {...a11y} style={({ pressed }) => [{ opacity: disabled ? 0.45 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
        <LinearGradient colors={[goldButton.from, goldButton.to]} style={[s.chip, small && s.chipSmall, { borderColor: "rgba(255,255,255,0.35)" }]}>
          <View style={s.chipRow}>
            {icon ? <Icon name={icon} size={13} color={goldButton.text} /> : null}
            <Text style={[s.chipText, { color: goldButton.text, fontFamily: FONT.bold }]} numberOfLines={1}>{label}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} disabled={disabled} {...a11y} style={({ pressed }) => [{ opacity: disabled ? 0.45 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
      <GlassSurface onStage={onStage} interactive style={[s.chip, small && s.chipSmall, { borderWidth: StyleSheet.hairlineWidth }]}>
        <View style={s.chipRow}>
          {icon ? <Icon name={icon} size={13} color={onStage ? stage.gold : c.text} /> : null}
          <Text style={[s.chipText, { color: onStage ? "rgba(255,255,255,0.86)" : t.ink }]} numberOfLines={1}>{label}</Text>
        </View>
      </GlassSurface>
    </Pressable>
  );
}
/** the same chip under its descriptive name */
export const GlassChip = Chip;

/** segmented control: a glass track with the active segment as a gold capsule */
export function Segmented<T extends string>({ value, options, onChange, onStage, stretch }: { value: T | null; options: [T, string][]; onChange: (v: T) => void; onStage?: boolean; stretch?: boolean }) {
  const t = useTheme();
  return (
    <GlassSurface onStage={onStage} style={{ flexDirection: "row", alignSelf: stretch ? "stretch" : "flex-start", borderRadius: R.pill, padding: 4 }}>
      <View style={{ flexDirection: "row", flex: stretch ? 1 : undefined }} accessibilityRole="tablist">
        {options.map(([v, label]) => {
          const on = v === value;
          return (
            <Pressable key={v} onPress={() => onChange(v)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={label} style={stretch ? { flex: 1 } : undefined}>
              {on ? (
                <LinearGradient colors={[goldButton.from, goldButton.to]} style={s.segment}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: goldButton.text }} numberOfLines={1}>{label}</Text>
                </LinearGradient>
              ) : (
                <View style={s.segment}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: onStage ? "rgba(255,255,255,0.75)" : t.muted }} numberOfLines={1}>{label}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </GlassSurface>
  );
}

/** the brand: "Quran Masterclass" written in gold foil, nothing else (website public/brand/wordmark-*.svg).
 *  tone "gold" = light foil for the emerald stage, "deep" = darker gold for light canvases, "auto" follows the theme.
 *  variant "inline" = one line (headers), "stacked" = Quran over MASTERCLASS, "stackedAr" = plus the Arabic line. */
/** the gold wordmark as PNG files (assets/brand, rendered from the website's SVGs); Arabic app → calligraphic Arabic lockup */
export function Wordmark({ height = 26, variant = "inline", tone = "auto" }: { height?: number; variant?: WordmarkFile; tone?: "gold" | "deep" | "auto" }) {
  const t = useTheme();
  const { lang } = useLang();
  const v = (lang === "ar" && ARABIC_VARIANT[variant]) || variant;
  const file = WORDMARK_FILES[v];
  const h = v === "ar" ? Math.round(height * 1.3) : height; // the calligraphy needs a little more height to read as large as the Latin
  const src = tone === "gold" || (tone === "auto" && t.dark) ? file.gold : file.deep;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={v === "ar" || v === "arStacked" ? "ماستركلاس القرآن" : "Quran Masterclass"}>
      <Image source={src} style={{ width: (h * file.w) / file.h, height: h }} resizeMode="contain" fadeDuration={0} />
    </View>
  );
}

/** fallback: the v1 wordmark drawn from inline outlines (wordmark-paths.ts) */
export function WordmarkVector({ height = 26, variant = "inline", tone = "auto" }: { height?: number; variant?: keyof typeof WORDMARK; tone?: "gold" | "deep" | "auto" }) {
  const t = useTheme();
  const id = `qmfoil${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const foil = WORDMARK_FOIL[tone === "gold" || (tone === "auto" && t.dark) ? "light" : "deep"];
  const { box, parts } = WORDMARK[variant];
  const [x, y, w, h] = box;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Quran Masterclass">
      <Svg width={(height * w) / h} height={height} viewBox={`${x} ${y} ${w} ${h}`}>
        <Defs>
          <SvgLinearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={y} x2={0} y2={y + h}>
            {foil.map(([o, c]) => <Stop key={o} offset={o} stopColor={c} />)}
          </SvgLinearGradient>
        </Defs>
        <G fill={`url(#${id})`}>{parts.map((p, i) => <Path key={i} d={p.d} translateX={p.x} translateY={p.y} />)}</G>
      </Svg>
    </View>
  );
}

/** the old logo mark (kept for reference; the brand is now the gold Wordmark): an open mushaf on a rehal under a star */
export function LogoMark({ size = 30 }: { size?: number }) {
  const t = useTheme();
  const accent = t.dark ? "rgb(6,108,78)" : t.accent;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Rect width={64} height={64} rx={14} fill={accent} />
      <Path d="M17 41 L47 57 M47 41 L17 57" stroke="#e9cf99" strokeWidth={3.4} strokeLinecap="round" />
      <Path d="M32 21.5 C 26 17.5, 17.5 16.8, 11 18.6 V 43.4 C 17.5 41.8, 26 42.6, 32 46.4 Z" fill="#fff" />
      <Path d="M32 21.5 C 38 17.5, 46.5 16.8, 53 18.6 V 43.4 C 46.5 41.8, 38 42.6, 32 46.4 Z" fill="#fff" />
      <Path d="M32 21.5 V 46.4" stroke={accent} strokeWidth={1.6} />
      <Path d="M16 25.2 C 20 24.2, 24.5 24.4, 28 25.8 M16 30 C 20 29, 24.5 29.2, 28 30.6 M16 34.8 C 20 33.8, 24.5 34, 28 35.4 M36 25.8 C 39.5 24.4, 44 24.2, 48 25.2 M36 30.6 C 39.5 29.2, 44 29, 48 30 M36 35.4 C 39.5 34, 44 33.8, 48 34.8" stroke={accent} strokeOpacity={0.35} strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <Path d="M32 6.5 l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6z" fill="#e9cf99" />
    </Svg>
  );
}

/** section heading on the light canvas: display face, optional link on the right */
export function SectionTitle({ title, action, onAction, style }: { title: string; action?: string; onAction?: () => void; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 14 }, style]}>
      <Text accessibilityRole="header" style={[type.title1, { color: t.ink, flex: 1 }]}>{title}</Text>
      {action && onAction ? <Text onPress={onAction} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent, paddingBottom: 3 }}>{action}</Text> : null}
    </View>
  );
}

/** stat on the stage: big number, small gold star, label */
export function StageStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, paddingVertical: 14 }} accessible accessibilityLabel={`${value} ${label}`}>
      <Text style={{ fontFamily: FONT.display, fontSize: 24, color: "#ffffff", letterSpacing: -0.5 }}>{value}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 }}>
        <SmallStar size={8} color="rgba(214,180,108,0.7)" />
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{label}</Text>
      </View>
    </View>
  );
}

/** Arabic line in the website's Quran face */
export function Arabic({ children, size = 30, color, style, center }: { children: ReactNode; size?: number; color?: string; style?: StyleProp<TextStyle>; center?: boolean }) {
  const t = useTheme();
  return <Text style={[{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 2, color: color ?? t.arabic, writingDirection: "rtl", textAlign: center ? "center" : "right" }, style]}>{children}</Text>;
}

/** gold progress bar (step and lesson progress) */
export function GoldProgress({ value, track }: { value: number; track?: string }) {
  const t = useTheme();
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: track ?? t.line, overflow: "hidden" }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <LinearGradient colors={["#c6a65e", "#ecd7a2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 6, width: `${Math.max(0, Math.min(1, value)) * 100}%`, borderRadius: 3 }} />
    </View>
  );
}

const s = StyleSheet.create({
  button: { height: 52, borderRadius: R.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: 22, overflow: "hidden" },
  compact: { height: 44, borderRadius: R.pill, paddingHorizontal: 20 },
  buttonRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  goldHighlight: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  goldSheen: { position: "absolute", top: 0, left: 0, right: 0, height: "52%" },
  goldShadow: { shadowColor: "rgb(120,90,30)", shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  dockShadow: { shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  chip: { height: 38, paddingHorizontal: 15, borderRadius: R.pill, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  chipSmall: { height: 32, paddingHorizontal: 14 },
  chipRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  segment: { paddingHorizontal: 14, height: 32, justifyContent: "center", alignItems: "center", borderRadius: R.pill },
  chipText: { fontFamily: FONT.semibold, fontSize: 14 },
});
