import { useEffect, useState, type ReactNode, type Ref } from "react";
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent, type ScrollViewInstance, type StyleProp, type ViewStyle } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, ClipPath, Defs, G, LinearGradient as SvgLinear, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, goldButton, stage, useTheme, AR_RIGHT, FWD } from "@/lib/theme";
import { Arcade, GoldCard, Poster, PosterGrid, SmallStar, Stage, gradientColors } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import { TILES } from "@/web/tiles";
import { hasAppRoute } from "@/lib/features";
import { archPath, starPath } from "./web/practiceArt";
import { StatusScrim, goBack } from "@/components/page";

export { archPath, starPath };

// The website's practice art (components/art/PracticeArt.tsx, Ornaments.tsx, the .pa-* and .callout classes), drawn
// natively: the gilded arch window, rosettes, the illuminated frame of the dark result cards, the callout box, the
// page heroes and the "courses and tools" posters at the end of a page.

/** gold of the current canvas as "r,g,b" (rgb(var(--gold)) on the website) */
export function useGold() {
  const t = useTheme();
  return t.dark ? "214,178,106" : "150,116,52";
}

/** true when the person asked the system for less motion (all animations then stand still) */
export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

/** seconds since mount, ticking at `fps` while `on` (drives the gentle SVG animations) */
export function useClock(on: boolean, fps = 30) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!on) return;
    const t0 = Date.now();
    const id = setInterval(() => setT((Date.now() - t0) / 1000), 1000 / fps);
    return () => clearInterval(id);
  }, [on, fps]);
  return t;
}

/** open a website path in the app (identical routes) */
export const go = (href: string) => router.push(href as Href);

// metallic gold, as on the calligraphy rings and medallions
function Metal({ id }: { id: string }) {
  return (
    <SvgLinear id={id} x1="0" y1="0" x2="1" y2="1">
      <Stop offset="0" stopColor="#f6e7bf" /><Stop offset="0.45" stopColor="#c9a65e" /><Stop offset="0.72" stopColor="#efe2bf" /><Stop offset="1" stopColor="#8f7238" />
    </SvgLinear>
  );
}

/** the arch window: a gilded pointed arch, a lattice of eight-pointed stars inside, light from above, an optional lamp
 *  and a word at its foot (PracticeWindow). Size it with width/height in the 240:320 ratio. */
export function PracticeWindow({ word, uid = "pw", lamp = false, width, height, style, wordFont = CALLIG_FONT }: {
  word?: string; uid?: string; lamp?: boolean; width?: number | `${number}%`; height?: number | `${number}%`; style?: StyleProp<ViewStyle>; wordFont?: string;
}) {
  const outer = archPath(8, 232, 320, 128, 6), inner = archPath(20, 220, 320, 132, 22), clip = archPath(28, 212, 300, 135, 34);
  const fs = !word ? 0 : word.length <= 4 ? 62 : word.length <= 6 ? 50 : word.length <= 9 ? 40 : 32;
  return (
    <View pointerEvents="none" style={[{ width, height, aspectRatio: 240 / 320 }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox="0 0 240 320">
        <Defs>
          <Metal id={`${uid}-m`} />
          <RadialGradient id={`${uid}-l`} cx="50%" cy="26%" r="68%">
            <Stop offset="0" stopColor="#fff4d6" stopOpacity={0.7} /><Stop offset="0.35" stopColor="#e9cf99" stopOpacity={0.28} /><Stop offset="1" stopColor="#e9cf99" stopOpacity={0} />
          </RadialGradient>
          <Pattern id={`${uid}-p`} width={30} height={30} patternUnits="userSpaceOnUse">
            <G fill="none" stroke="#e9cf99" strokeWidth={0.7} strokeOpacity={0.36}>
              <Path d="M8 8h14v14H8z" /><Path d="M15 5.1L24.9 15 15 24.9 5.1 15z" /><Path d="M0 0l5 5M30 0l-5 5M0 30l5-5M30 30l-5-5" />
            </G>
          </Pattern>
          <Pattern id={`${uid}-r`} width={16} height={48} patternUnits="userSpaceOnUse">
            <Path d="M4 2v7M12 26v5" stroke="#fff1cc" strokeOpacity={0.45} strokeWidth={1} strokeLinecap="round" />
          </Pattern>
          <ClipPath id={`${uid}-c`}><Path d={`${clip}Z`} /></ClipPath>
        </Defs>
        <Path d={`${inner}Z`} fill="rgba(255,255,255,0.035)" />
        <G clipPath={`url(#${uid}-c)`}>
          <Rect x={0} y={0} width={240} height={320} fill={`url(#${uid}-l)`} />
          <Rect x={-20} y={0} width={280} height={320} fill={`url(#${uid}-p)`} />
          <Rect x={0} y={-48} width={240} height={380} fill={`url(#${uid}-r)`} />
        </G>
        <Path d={outer} fill="none" stroke={`url(#${uid}-m)`} strokeWidth={2} />
        <Path d={inner} fill="none" stroke="#d6b46c" strokeOpacity={0.55} strokeWidth={1} />
        <Path d={clip} fill="none" stroke="#d6b46c" strokeOpacity={0.25} strokeWidth={0.8} strokeDasharray="2 4" />
        <G fill={`url(#${uid}-m)`}><Rect x={3} y={124} width={22} height={5} rx={1} /><Rect x={215} y={124} width={22} height={5} rx={1} /></G>
        <Path d={starPath(120, 6, 7, 3)} fill={`url(#${uid}-m)`} />
        {lamp ? (
          <G>
            <Path d="M120 36v38" stroke="#d6b46c" strokeOpacity={0.6} strokeWidth={0.8} />
            <Circle cx={120} cy={92} r={22} fill="#ffe7a8" fillOpacity={0.14} />
            <Path d="M108 78h24l-3 6h-18zM111 84h18l-2 18c-.6 5-13.4 5-14 0z" fill="none" stroke={`url(#${uid}-m)`} strokeWidth={1.3} />
            <Path d="M120 88c3.4 3.2 3.4 8 0 10.6-3.4-2.6-3.4-7.4 0-10.6z" fill="#ffe7a8" fillOpacity={0.85} />
          </G>
        ) : null}
        {word ? (
          <>
            <Path d="M44 300h152" stroke="#d6b46c" strokeOpacity={0.45} strokeWidth={0.8} />
            <Path d={starPath(120, 300, 5, 2.2)} fill="#d6b46c" />
          </>
        ) : null}
      </Svg>
      {word ? <WindowWord word={word} fs={fs} font={wordFont} /> : null}
    </View>
  );
}
// the word stands on the rule at y=300 of the 320-high window (baseline at 286 - fs*0.12, as on the website)
function WindowWord({ word, fs, font }: { word: string; fs: number; font: string }) {
  const [h, setH] = useState(0);
  const scale = h / 320;
  return (
    <View style={StyleSheet.absoluteFill} onLayout={(e: LayoutChangeEvent) => setH(e.nativeEvent.layout.height)}>
      {h ? (
        <Text allowFontScaling={false} numberOfLines={1}
          style={{ position: "absolute", left: 0, right: 0, top: (286 - fs * 0.12 - fs * 1.05) * scale, textAlign: "center", fontFamily: font, fontSize: fs * scale, lineHeight: fs * 1.35 * scale, color: "#e3c88e", writingDirection: "rtl" }}>
          {word}
        </Text>
      ) : null}
    </View>
  );
}

/** rosette from Ornaments.tsx: a 16-point star, a ring and a small star */
export function Rosette({ size = 28, color }: { size?: number; color?: string }) {
  const t = useTheme();
  const c = color ?? t.gold;
  const pts = Array.from({ length: 32 }, (_, i) => { const a = (Math.PI / 16) * i - Math.PI / 2, r = i % 2 ? 9 : 14; return `${(16 + r * Math.cos(a)).toFixed(2)},${(16 + r * Math.sin(a)).toFixed(2)}`; });
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path d={`M${pts.join("L")}Z`} fill={c} fillOpacity={0.18} stroke={c} strokeWidth={0.8} />
      <Circle cx={16} cy={16} r={6.5} fill="none" stroke={c} strokeWidth={0.8} />
      <Path d="M16 11.5l1.4 3.1 3.1 1.4-3.1 1.4-1.4 3.1-1.4-3.1-3.1-1.4 3.1-1.4z" fill={c} />
    </Svg>
  );
}

/** .illum-frame: a gold rule 7px inside the card, a band of small stars inside it, a rosette in every corner */
export function IllumFrame({ rosettes = 24 }: { rosettes?: number | false }) {
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const ring = box ? (() => {
    const o = 12, i = 19, w = box.w, h = box.h;
    const rr = (x: number, y: number, ww: number, hh: number, r: number) => `M${x + r} ${y}H${x + ww - r}A${r} ${r} 0 0 1 ${x + ww} ${y + r}V${y + hh - r}A${r} ${r} 0 0 1 ${x + ww - r} ${y + hh}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + hh - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
    return { band: `${rr(o, o, w - 2 * o, h - 2 * o, 9)}${rr(i, i, w - 2 * i, h - 2 * i, 4)}`, outer: rr(o, o, w - 2 * o, h - 2 * o, 9), inner: rr(i, i, w - 2 * i, h - 2 * i, 4) };
  })() : null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={{ position: "absolute", top: 7, left: 7, right: 7, bottom: 7, borderRadius: 12, borderWidth: 1, borderColor: "rgba(201,166,94,0.45)" }} />
      {ring ? (
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <Pattern id="illum" width={14} height={14} patternUnits="userSpaceOnUse">
              <Path d="M7 1.5l1.3 3.2 3.2 1.3-3.2 1.3L7 10.5 5.7 7.3 2.5 6l3.2-1.3z" fill="#c9a65e" fillOpacity={0.55} />
            </Pattern>
          </Defs>
          <Path d={ring.band} fill="url(#illum)" fillRule="evenodd" />
          <Path d={ring.outer} fill="none" stroke="rgba(201,166,94,0.5)" strokeWidth={1} />
          <Path d={ring.inner} fill="none" stroke="rgba(201,166,94,0.5)" strokeWidth={1} />
        </Svg>
      ) : null}
      {rosettes ? (["tl", "tr", "bl", "br"] as const).map((c) => (
        <View key={c} style={{ position: "absolute", top: c[0] === "t" ? 6 : undefined, bottom: c[0] === "b" ? 6 : undefined, left: c[1] === "l" ? 6 : undefined, right: c[1] === "r" ? 6 : undefined }}>
          <Rosette size={rosettes} color={stage.gold} />
        </View>
      )) : null}
    </View>
  );
}

/** .callout: gold hairline border, a soft gold wash from the top, a brighter gold line along the top edge */
export function Callout({ children, style, radius = R.md }: { children: ReactNode; style?: StyleProp<ViewStyle>; radius?: number }) {
  const t = useTheme();
  const g = useGold();
  return (
    <View style={[{ borderRadius: radius, borderWidth: 1, borderColor: `rgba(${g},0.28)`, backgroundColor: t.surface, overflow: "hidden" }, style]}>
      <LinearGradient pointerEvents="none" colors={[`rgba(${g},0.07)`, `rgba(${g},0)`]} locations={[0, 0.7]} style={StyleSheet.absoluteFill} />
      <LinearGradient pointerEvents="none" colors={["transparent", `rgba(${g},0.95)`, "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: 0, left: 22, right: 22, height: 1 }} />
      {children}
    </View>
  );
}

/** .niche: a pointed-arch outline 10px inside a card */
export function Niche({ color = "rgba(201,166,94,0.25)" }: { color?: string }) {
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {box ? (() => {
        const x0 = 10, x1 = box.w - 10, y0 = 10, y1 = box.h - 10, rx = (x1 - x0) / 2, ry = Math.min((y1 - y0) * 0.22, rx);
        const d = `M${x0} ${y1 - 10}V${y0 + ry}A${rx} ${ry} 0 0 1 ${x1} ${y0 + ry}V${y1 - 10}A10 10 0 0 1 ${x1 - 10} ${y1}H${x0 + 10}A10 10 0 0 1 ${x0} ${y1 - 10}Z`;
        return <Svg style={StyleSheet.absoluteFill}><Path d={d} fill="none" stroke={color} strokeWidth={1} /></Svg>;
      })() : null}
    </View>
  );
}

/** small gold eight-pointed star (PracticeStar) */
export function PStar({ size = 12, color }: { size?: number; color?: string }) {
  const t = useTheme();
  return <SmallStar size={size} color={color ?? t.gold} />;
}

/** pa-chip-dark: a pill on the stage; selected = gold */
export function DarkChip({ label, on, onPress, accessibilityRole = "button" }: { label: string; on?: boolean; onPress: () => void; accessibilityRole?: "button" | "tab" }) {
  return (
    <Pressable onPress={onPress} accessibilityRole={accessibilityRole} accessibilityState={{ selected: !!on }} accessibilityLabel={label}>
      {on ? (
        <LinearGradient colors={[goldButton.from, goldButton.to]} style={chip.base}><Text style={[chip.text, { color: goldButton.text }]}>{label}</Text></LinearGradient>
      ) : (
        <View style={[chip.base, { borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", backgroundColor: "rgba(255,255,255,0.04)" }]}><Text style={[chip.text, { color: "rgba(255,255,255,0.8)" }]}>{label}</Text></View>
      )}
    </Pressable>
  );
}
const chip = StyleSheet.create({
  base: { height: 40, paddingHorizontal: 16, borderRadius: R.pill, alignItems: "center", justifyContent: "center" },
  text: { fontFamily: FONT.semibold, fontSize: 14 },
});

/** light pill (pa-chip and the selectable chips of the forms): selected = gold border and wash */
export function LightChip({ label, on, onPress, icon, style }: { label: string; on?: boolean; onPress: () => void; icon?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!on }} accessibilityLabel={label}
      style={({ pressed }) => [{ minHeight: 40, paddingHorizontal: 16, paddingVertical: 6, borderRadius: R.pill, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
        borderColor: on ? "rgb(201,166,94)" : pressed ? "rgba(201,166,94,0.6)" : t.line, backgroundColor: on ? "rgba(201,166,94,0.15)" : t.surface }, style]}>
      {icon}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: on ? t.ink : t.muted, textAlign: "center" }}>{label}</Text>
    </Pressable>
  );
}

/** round arrow button on the stage (back/next of the trainers) */
export function RoundButton({ dir, onPress, disabled, label, size = 48, gold = false }: { dir: "prev" | "next"; onPress: () => void; disabled?: boolean; label: string; size?: number; gold?: boolean }) {
  const icon = <Icon name={dir === "prev" ? "chevronLeft" : "chevronRight"} color={gold ? goldButton.text : "#ffffff"} size={20} />;
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} hitSlop={4}
      style={({ pressed }) => [{ width: size, height: size, borderRadius: size / 2, opacity: disabled ? (gold ? 0.4 : 0.3) : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }]}>
      {gold ? (
        <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ flex: 1, borderRadius: size / 2, alignItems: "center", justifyContent: "center" }}>{icon}</LinearGradient>
      ) : (
        <View style={{ flex: 1, borderRadius: size / 2, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" }}>{icon}</View>
      )}
    </Pressable>
  );
}

/** pill button on the stage with a hairline (secondary actions on dark cards) */
export function StageButton({ title, onPress, gold = false, disabled, icon }: { title: string; onPress: () => void; gold?: boolean; disabled?: boolean; icon?: ReactNode }) {
  const inner = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {icon}
      <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: gold ? goldButton.text : "#ffffff" }} numberOfLines={1}>{title}</Text>
    </View>
  );
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={title}
      style={({ pressed }) => [{ height: 44, borderRadius: R.pill, opacity: disabled ? 0.6 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
      {gold ? (
        <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ flex: 1, borderRadius: R.pill, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" }}>{inner}</LinearGradient>
      ) : (
        <View style={{ flex: 1, borderRadius: R.pill, paddingHorizontal: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" }}>{inner}</View>
      )}
    </Pressable>
  );
}

/** back arrow at the top of a pushed screen's hero */
export function HeroBack() {
  return (
    <Pressable onPress={() => goBack()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} style={{ width: 40, height: 40, justifyContent: "center", marginStart: -6 }}>
      <Icon name="chevronLeft" color="#ffffff" size={24} />
    </Pressable>
  );
}

/** the dark hero of a practice page: kicker, big title, lead, an Arabic line with its reference and actions; behind it
 *  either the arch window (PracticeHero) or a large calligraphic word (CalligraphyDraw); the arcade along the edge */
export function Hero({ kicker, title, lead, word, art = "callig", lamp, arabic, arabicRef, arcade = true, children }: {
  kicker?: string; title: string; lead?: string; word?: string; art?: "callig" | "window"; lamp?: boolean; arabic?: string; arabicRef?: string; arcade?: boolean; children?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Stage hairlines={false}>
      {word && art === "callig" ? (
        <Text allowFontScaling={false} numberOfLines={1} style={{ position: "absolute", right: -4, top: insets.top + 6, fontFamily: CALLIG_FONT, fontSize: 108, lineHeight: 170, color: "rgba(214,180,108,0.12)" }}
          accessibilityElementsHidden importantForAccessibility="no">{word}</Text>
      ) : null}
      {word && art === "window" ? <PracticeWindow word={word} uid="hero" lamp={lamp} height={230} style={{ position: "absolute", right: -40, top: insets.top + 16, opacity: 0.3 }} /> : null}
      <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: arcade ? 40 : 56 }}>
        <HeroBack />
        {kicker ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.6, textTransform: "uppercase", color: stage.gold, marginTop: 20 }}>{kicker}</Text> : null}
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: art === "window" ? 38 : 40, lineHeight: art === "window" ? 40 : 42, letterSpacing: -1, color: "#eef0f3", marginTop: kicker ? 12 : 20 }}>{title}</Text>
        {lead ? <Text style={{ fontFamily: FONT.regular, fontSize: 17, lineHeight: 28, color: "rgba(255,255,255,0.7)", marginTop: 20 }}>{lead}</Text> : null}
        {arabic ? (
          <Text style={{ marginTop: 24, writingDirection: "rtl", textAlign: AR_RIGHT }}>
            <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 46, color: stage.gold }}>{arabic}</Text>
            {arabicRef ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.45)" }}>{"  "}{arabicRef}</Text> : null}
          </Text>
        ) : null}
        {children ? <View style={{ marginTop: 28 }}>{children}</View> : null}
      </View>
      {arcade ? <Arcade /> : null}
    </Stage>
  );
}

/** "Courses and tools" posters at the end of a page (PosterTiles MoreTiles) */
export function MoreTiles({ keys }: { keys: string[] }) {
  const w = useWebT();
  const t = useTheme();
  const items = keys.map((k) => TILES[k]).filter((x) => !!x && hasAppRoute(x.href));
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 40 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 26, lineHeight: 31, letterSpacing: -0.6, color: t.ink }}>{w("home2.coursesTitle")}</Text>
        <Text onPress={() => go("/academy")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent, paddingBottom: 3 }}>{w("home2.coursesAll")} {FWD}</Text>
      </View>
      <PosterGrid>
        {items.map((it) => (
          <Poster key={it.key} title={w(`nav.${it.key}`)} desc={w(`home2.${it.desc}`)} badge={w(`home2.badge_${it.badge}`)} arabic={it.ar}
            colors={gradientColors(it.bg)} cta={w("home2.open")} onPress={() => go(it.href)} />
        ))}
      </PosterGrid>
    </View>
  );
}

/** section heading in the display face (h2.font-display text-3xl) */
export function H2({ children, style, size = 30 }: { children: ReactNode; style?: StyleProp<import("react-native").TextStyle>; size?: number }) {
  const t = useTheme();
  return <Text accessibilityRole="header" style={[{ fontFamily: FONT.display, fontSize: size, lineHeight: size * 1.2, letterSpacing: -0.6, color: t.ink }, style]}>{children}</Text>;
}

/** small uppercase label (text-[11px] font-semibold uppercase tracking-[0.16em] text-muted) */
export function Label({ children, style, color }: { children: ReactNode; style?: StyleProp<import("react-native").TextStyle>; color?: string }) {
  const t = useTheme();
  return <Text style={[{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", color: color ?? t.muted }, style]}>{children}</Text>;
}

/** .pa-paper: a quiet sheet with a gold hairline and a finer frame inside */
export function Paper({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const g = useGold();
  return (
    <View style={[{ borderRadius: 14, borderWidth: 1, borderColor: `rgba(${g},0.22)`, backgroundColor: t.surface, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 28, shadowColor: `rgb(${g})`, shadowOpacity: 0.18, shadowRadius: 30, shadowOffset: { width: 0, height: 18 } }, style]}>
      <View pointerEvents="none" style={{ position: "absolute", top: 6, left: 6, right: 6, bottom: 6, borderRadius: 10, borderWidth: 1, borderColor: `rgba(${g},0.12)` }} />
      {children}
    </View>
  );
}

/** "Explained in detail" / "Keep learning": a card of links with a small star and an arrow */
export function LinkList({ title, links }: { title: string; links: readonly (readonly [string, string])[] | string[][] }) {
  const t = useTheme();
  const g = useGold();
  return (
    <GoldCard>
      <Text style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: 1.9, textTransform: "uppercase", color: t.muted }}>{title}</Text>
      <View style={{ marginTop: 12, gap: 4 }}>
        {links.map(([h, l]) => (
          <Pressable key={h} onPress={() => go(h)} accessibilityRole="link" accessibilityLabel={l}
            style={({ pressed }) => ({ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: R.md, paddingHorizontal: 8, backgroundColor: pressed ? `rgba(${g},0.1)` : "transparent" })}>
            <SmallStar size={10} color={t.gold} />
            <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, lineHeight: 21, color: t.accent }}>{l}</Text>
            <Icon name="chevronRight" color={t.accent} size={16} />
          </Pressable>
        ))}
      </View>
    </GoldCard>
  );
}

/** the page's scroll view: canvas background, light status bar over the dark hero, dark once the light page shows */
export function PageScroll({ children, scrollRef }: { children: ReactNode; scrollRef?: Ref<ScrollViewInstance> }) {
  const t = useTheme();
  const [over, setOver] = useState(false);
  const [under, setUnder] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={over && !t.dark ? "dark" : "light"} />
      <ScrollView ref={scrollRef} style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled"
        scrollEventThrottle={64} onScroll={(e) => { const y = e.nativeEvent.contentOffset.y; setOver(y > 320); setUnder(y > 6); }}>
        {children}
      </ScrollView>
      <StatusScrim visible={under} />
    </View>
  );
}
