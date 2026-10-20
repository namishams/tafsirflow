import { useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Svg, { Circle, Defs, G, Mask, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { Arcade } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { useX } from "./strings";
import { getVerseByKey } from "@/lib/quran";
import { ARABIC_FONT, FONT, type Theme, useTheme } from "@/lib/theme";
import { goBack } from "@/components/page";

// The ornaments of the website's Home / Quran pages (components/art/HomeOrnaments.tsx, Ornaments.tsx,
// styles/art-home.css, styles/art-quran.css) drawn with react-native-svg for the extra screens and widgets.

export const GOLD = "rgb(201,166,94)";       // --hm-gold
export const GOLD_L = "rgb(233,207,153)";    // --hm-gold-l
export const CREAM = "#f3e2b6";
export const STAGE = "rgb(8,38,29)";
export const EMERALD: [string, string] = ["rgb(13,68,52)", "rgb(6,36,27)"]; // --q-emerald-a/b

/** the warm palette of art-home.css / art-quran.css for the current appearance */
export function useHm(t: Theme = useTheme()) {
  return t.dark
    ? { ivory: "rgb(15,35,28)", sand: "rgb(19,40,32)", goldD: "rgb(214,178,106)", inkGold: "rgb(222,190,124)", marbleA: "rgb(14,42,33)", marbleB: "rgb(8,28,22)", tile: "rgb(14,35,28)" }
    : { ivory: "rgb(252,249,241)", sand: "rgb(246,239,224)", goldD: "rgb(150,116,52)", inkGold: "rgb(128,96,38)", marbleA: "rgb(252,249,241)", marbleB: "rgb(244,236,218)", tile: "rgb(255,255,255)" };
}

/** colour with another opacity: alpha("rgb(201,166,94)", .4) */
export function alpha(c: string, a: number): string {
  const m = /rgba?\(([^)]+)\)/.exec(c);
  if (m) { const [r, g, b] = m[1].split(",").map((x) => x.trim()); return `rgba(${r},${g},${b},${a})`; }
  const h = /^#([0-9a-f]{6})$/i.exec(c);
  if (h) { const n = parseInt(h[1], 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
  return c;
}

/** outline of the khatam (two overlapping squares) as one path */
export function khatam(cx: number, cy: number, R: number) {
  const r = R * 0.7654;
  const pts = Array.from({ length: 16 }, (_, i) => { const a = (Math.PI / 8) * i - Math.PI / 2, rad = i % 2 ? r : R; return `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`; });
  return `M${pts.join("L")}Z`;
}

/** small eight-pointed star used as bullet, finial or separator */
export function StarGlyph({ size = 12, color = GOLD }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      <Path d={khatam(12, 12, 11.5)} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={1.2} />
      <Circle cx={12} cy={12} r={3} fill={color} />
    </Svg>
  );
}

/** a number (or a short sign) in an eight-pointed star medallion (.hm-star) */
export function HomeStar({ children, size = 40, tone = "light" }: { children?: ReactNode; size?: number; tone?: "light" | "dark" | "gold" | "emerald" }) {
  const t = useTheme();
  const hm = useHm(t);
  const c = {
    light: { fill: hm.ivory, stroke: GOLD, inner: alpha(GOLD, 0.55), text: hm.goldD },
    dark: { fill: "rgba(8,38,29,0.85)", stroke: alpha(GOLD_L, 0.8), inner: alpha(GOLD_L, 0.45), text: GOLD_L },
    gold: { fill: "rgb(218,190,128)", stroke: "rgb(150,116,52)", inner: "rgba(255,255,255,0.55)", text: STAGE },
    emerald: { fill: t.accent, stroke: GOLD, inner: alpha(GOLD_L, 0.6), text: GOLD_L },
  }[tone];
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 40 40" style={StyleSheet.absoluteFill}>
        <Path d={khatam(20, 20, 19)} fill={c.fill} stroke={c.stroke} strokeWidth={1.1} />
        <Path d={khatam(20, 20, 15.6)} fill="none" stroke={c.inner} strokeWidth={0.7} />
        <Circle cx={20} cy={20} r={10.5} fill={alpha(GOLD, 0.08)} stroke={alpha(GOLD, 0.45)} strokeWidth={0.6} strokeDasharray="1 1.6" />
      </Svg>
      {children !== undefined ? <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: Math.max(10, Math.round(size * 0.32)), color: c.text, letterSpacing: -0.3 }}>{children}</Text> : null}
    </View>
  );
}

/** gilded sixteen-point rosette from the corners of an illuminated mushaf */
export function Rosette({ size = 22, color = GOLD }: { size?: number; color?: string }) {
  const pts = Array.from({ length: 32 }, (_, i) => { const a = (Math.PI / 16) * i - Math.PI / 2, r = i % 2 ? 9 : 14; return `${(16 + r * Math.cos(a)).toFixed(2)},${(16 + r * Math.sin(a)).toFixed(2)}`; });
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path d={`M${pts.join("L")}Z`} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={0.8} />
      <Circle cx={16} cy={16} r={6.5} fill="none" stroke={color} strokeWidth={0.8} />
      <Path d="M16 11.5l1.4 3.1 3.1 1.4-3.1 1.4-1.4 3.1-1.4-3.1-3.1-1.4 3.1-1.4z" fill={color} />
    </Svg>
  );
}

/** .illum-frame: an inner gold frame with a rosette in each corner (stage cards) */
export function IllumFrame({ inset = 6, rosettes = true, color = "rgba(214,180,108,0.28)" }: { inset?: number; rosettes?: boolean; color?: string }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { margin: inset }]}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: 8, borderWidth: 1, borderColor: color }]} />
      {rosettes ? (["tl", "tr", "bl", "br"] as const).map((k) => (
        <View key={k} style={{ position: "absolute", [k[0] === "t" ? "top" : "bottom"]: -4, [k[1] === "l" ? "left" : "right"]: -4 }}><Rosette size={18} color="rgb(214,180,108)" /></View>
      )) : null}
    </View>
  );
}

/** four tiny gold stars in the corners of a card (.hm-corners) */
export function Corners() {
  const star = <Svg width={9} height={9} viewBox="0 0 9 9"><Path d="M4.5 0l1.1 2.9 2.9 1.6-2.9 1.6L4.5 9 3.4 6.1.5 4.5l2.9-1.6z" fill={GOLD} fillOpacity={0.7} /></Svg>;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { margin: 6 }]}>
      <View style={{ position: "absolute", top: 0, left: 0 }}>{star}</View>
      <View style={{ position: "absolute", top: 0, right: 0 }}>{star}</View>
      <View style={{ position: "absolute", bottom: 0, left: 0 }}>{star}</View>
      <View style={{ position: "absolute", bottom: 0, right: 0 }}>{star}</View>
    </View>
  );
}

/** .hm-card: marble white with a fine gold frame and a gilded hairline on top */
export function HmCard({ children, style, onPress, corners = true, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; corners?: boolean; accessibilityLabel?: string }) {
  const t = useTheme();
  const hm = useHm(t);
  const body = (pressed: boolean) => (
    <>
      <LinearGradient colors={[hm.ivory, t.surface]} locations={[0, 0.72]} style={[StyleSheet.absoluteFill, { borderRadius: 12 }]} />
      <LinearGradient pointerEvents="none" colors={["transparent", alpha(GOLD, 0.95), "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: -1, left: 22, right: 22, height: 1 }} />
      {corners ? <Corners /> : null}
      <View style={pressed ? { opacity: 0.92 } : null}>{children}</View>
    </>
  );
  const base: StyleProp<ViewStyle> = [{ borderRadius: 12, borderWidth: 1, borderColor: alpha(GOLD, 0.26), padding: 20 }, style];
  if (!onPress) return <View style={base}>{body(false)}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [base, pressed && { borderColor: alpha(GOLD, 0.6), transform: [{ scale: 0.99 }] }]}>
      {({ pressed }) => body(pressed)}
    </Pressable>
  );
}

/** .hm-warm: ivory marble section with a faint eight-fold rosette pattern and gold hairlines top and bottom */
export function WarmSection({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const hm = useHm();
  return (
    <View style={[{ overflow: "hidden", backgroundColor: hm.ivory }, style]}>
      <LinearGradient colors={[hm.ivory, hm.sand]} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <Pattern id="warm" width={140} height={140} patternUnits="userSpaceOnUse">
            <G fill="none" stroke={GOLD} strokeOpacity={0.1} strokeWidth={1}>
              <Path d="M70 34l10.5 25.5L106 70 80.5 80.5 70 106 59.5 80.5 34 70l25.5-10.5z" />
              <Path d="M44.5 44.5h51v51h-51z" />
              <Circle cx={70} cy={70} r={12} />
              <Path d="M0 70h20M120 70h20M70 0v20M70 120v20M0 0l22 22M140 0l-22 22M0 140l22-22M140 140l-22-22" />
            </G>
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#warm)" />
      </Svg>
      <GoldHairline style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
      <GoldHairline style={{ position: "absolute", bottom: 0, left: 0, right: 0 }} />
      {children}
    </View>
  );
}

export function GoldHairline({ style, strength = 0.8 }: { style?: StyleProp<ViewStyle>; strength?: number }) {
  return <LinearGradient pointerEvents="none" colors={["transparent", alpha(GOLD, strength), "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[{ height: 1 }, style]} />;
}

/** small spaced capitals with a star (q-kicker / hm-k) */
export function Kicker({ children, color, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  const hm = useHm();
  const c = color ?? hm.inkGold;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Svg width={11} height={11} viewBox="0 0 24 24"><Path d="M12 1l2.8 8.2L23 12l-8.2 2.8L12 23l-2.8-8.2L1 12l8.2-2.8z" fill={c} /></Svg>
      <Text numberOfLines={1} style={[{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: c, flexShrink: 1 }, style]}>{children}</Text>
    </View>
  );
}

/** the white-marble hero of the Quran pages (.q-hero): ivory with a pool of gold lattice light, arcade below */
export function MarbleHero({ kicker, title, children, back }: { kicker?: string; title: string; children?: ReactNode; back?: boolean }) {
  const t = useTheme();
  const hm = useHm(t);
  const insets = useSafeAreaInsets();
  const canBack = back ?? router.canGoBack();
  const x = useX();
  return (
    <View style={{ overflow: "hidden", borderBottomWidth: 1, borderBottomColor: alpha(GOLD, 0.45) }}>
      <LinearGradient colors={[hm.marbleA, hm.marbleB]} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="mh-light" cx="82%" cy="38%" rx="70%" ry="90%">
            <Stop offset="0" stopColor={t.dark ? "rgb(214,180,108)" : "rgb(255,233,178)"} stopOpacity={t.dark ? 0.16 : 0.55} />
            <Stop offset="1" stopColor="rgb(255,233,178)" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="mh-pool" cx="70%" cy="44%" rx="48%" ry="70%">
            <Stop offset="0" stopColor="#ffffff" stopOpacity={1} />
            <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
          </RadialGradient>
          <Mask id="mh-mask"><Rect width="100%" height="100%" fill="url(#mh-pool)" /></Mask>
          <Pattern id="mh-lattice" width={120} height={120} patternUnits="userSpaceOnUse">
            <G fill="none" stroke="#b08a3e" strokeOpacity={t.dark ? 0.22 : 0.16} strokeWidth={1}>
              <Path d="M60 8l15 37 37 15-37 15-15 37-15-37-37-15 37-15z" />
              <Path d="M23 23h74v74H23z" />
              <Circle cx={60} cy={60} r={17} />
              <Path d="M0 0l23 23M120 0L97 23M0 120l23-23M120 120L97 97M60 0v8M60 112v8M0 60h8M112 60h8" />
            </G>
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#mh-light)" />
        <Rect width="100%" height="100%" fill="url(#mh-lattice)" mask="url(#mh-mask)" />
      </Svg>
      <View style={{ paddingHorizontal: 20, paddingTop: insets.top + (canBack ? 6 : 24), paddingBottom: 40 }}>
        {canBack ? (
          <Pressable onPress={() => goBack()} accessibilityRole="button" accessibilityLabel={x.back} hitSlop={12} style={{ width: 40, height: 40, justifyContent: "center", marginStart: -6, marginBottom: 8 }}>
            <Icon name="chevronLeft" color={t.ink} size={24} />
          </Pressable>
        ) : null}
        {kicker ? <Kicker>{kicker}</Kicker> : null}
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 36, lineHeight: 38, letterSpacing: -0.9, color: t.ink, marginTop: 12 }}>{title}</Text>
        {children ? <View style={{ marginTop: 24 }}>{children}</View> : null}
      </View>
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}><Arcade color={t.dark ? "rgb(214,180,108)" : "rgb(150,116,52)"} /></View>
    </View>
  );
}

/** verse key in an emerald pill with cream text (.q-key) */
export function QKey({ children }: { children: string }) {
  return (
    <LinearGradient colors={EMERALD} style={{ height: 26, paddingHorizontal: 11, borderRadius: 13, justifyContent: "center", borderWidth: 1, borderColor: "rgba(214,180,108,0.45)", alignSelf: "flex-start" }}>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 12.5, color: CREAM, fontVariant: ["tabular-nums"] }}>{children}</Text>
    </LinearGradient>
  );
}

/** a mihrab arch (pointed cap over a framed body), HomeOrnaments HomeArch */
export function Arch({ children, dark = false, ratio = 0.3, style }: { children: ReactNode; dark?: boolean; ratio?: number; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const hm = useHm(t);
  const H = Math.round(400 * ratio), y = (f: number) => (H * f).toFixed(1);
  const outer = `M0 ${H}L0 ${y(0.72)}C0 ${y(0.36)} 104 ${y(0.17)} 200 0C296 ${y(0.17)} 400 ${y(0.36)} 400 ${y(0.72)}L400 ${H}`;
  const inner = `M10 ${H + 1}L10 ${y(0.74)}C10 ${y(0.42)} 110 ${y(0.25)} 200 ${y(0.1)}C290 ${y(0.25)} 390 ${y(0.42)} 390 ${y(0.74)}L390 ${H + 1}`;
  const fill = dark ? "rgba(255,255,255,0.045)" : hm.ivory;
  const line = dark ? alpha(GOLD_L, 0.55) : alpha(GOLD, 0.7);
  return (
    <View style={style}>
      <View style={{ width: "100%", aspectRatio: 400 / H }}>
        <Svg width="100%" height="100%" viewBox={`0 0 400 ${H}`} preserveAspectRatio="none">
          <Path d={`${outer}V${H + 0.5}H0Z`} fill={fill} />
          <Path d={outer} fill="none" stroke={line} strokeWidth={1.2} />
          <Path d={inner} fill="none" stroke={alpha(GOLD, dark ? 0.3 : 0.4)} strokeWidth={0.8} />
        </Svg>
        <View style={{ position: "absolute", top: -12, left: 0, right: 0, alignItems: "center" }}><StarGlyph size={22} color={dark ? GOLD_L : GOLD} /></View>
      </View>
      <View style={{ backgroundColor: fill, borderStartWidth: 1.2, borderEndWidth: 1.2, borderBottomWidth: 1.2, borderColor: line, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, marginTop: -1 }}>
        <View style={{ position: "absolute", top: 0, left: 9, right: 9, bottom: 9, borderStartWidth: 0.8, borderEndWidth: 0.8, borderBottomWidth: 0.8, borderColor: alpha(GOLD, dark ? 0.3 : 0.4) }} pointerEvents="none" />
        {children}
      </View>
    </View>
  );
}

/**
 * A quoted verse in ornate brackets with its reference (HomeVerse). The Arabic always comes from the server
 * (getVerseByKey) – never typed by hand. While loading, the space stays empty.
 */
export function QuranQuote({ verseKey, size = 24, color, citeColor, center = true }: { verseKey: string; size?: number; color?: string; citeColor?: string; center?: boolean }) {
  const t = useTheme();
  const hm = useHm(t);
  const text = useVerseText(verseKey);
  return (
    <View style={{ alignItems: center ? "center" : "flex-end" }} accessible accessibilityLabel={`Quran ${verseKey}`}>
      {text ? (
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.9, color: color ?? hm.goldD, writingDirection: "rtl", textAlign: center ? "center" : "right" }}>
          {"﴿ "}{text}{" ﴾"}
        </Text>
      ) : <View style={{ height: size * 1.9 }} />}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: citeColor ?? t.muted, marginTop: 2, fontVariant: ["tabular-nums"] }}>{verseKey}</Text>
    </View>
  );
}

const verseText = new Map<string, Promise<string>>();
/** Uthmani text of one verse from the server (cached per language-independent key) */
export function useVerseText(verseKey: string): string | null {
  const { lang } = useLang();
  const [v, setV] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    let p = verseText.get(verseKey);
    if (!p) {
      p = getVerseByKey(verseKey, lang).then((x) => x.text_uthmani);
      p.catch(() => verseText.delete(verseKey));
      verseText.set(verseKey, p);
    }
    p.then((x) => { if (alive) setV(x); }).catch(() => undefined);
    return () => { alive = false; };
  }, [verseKey, lang]);
  return v;
}

/** soft radial light used on stage cards (".stage" glow from above) */
export function StageGlow() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id="sg" cx="85%" cy="15%" rx="45%" ry="45%">
          <Stop offset="0" stopColor="rgb(214,180,108)" stopOpacity={0.16} />
          <Stop offset="1" stopColor="rgb(214,180,108)" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#sg)" />
    </Svg>
  );
}
