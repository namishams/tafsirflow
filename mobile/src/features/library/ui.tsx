import { useState, type ReactNode } from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, LinearGradient as SvgLinear, Path, Stop } from "react-native-svg";
import { CALLIG_FONT, FONT, R, goldButton, stage, useTheme, FWD } from "@/lib/theme";
import { Poster, PosterGrid, gradientColors } from "@/components/brand";
import { useWebT } from "@/i18n/web";
import { APP_TILES } from "@/lib/features";
import { TILES } from "@/web/tiles";
import { Dome, IslCard, IslH2, StageBackground, StarMark, useSaw } from "./art";
import { STAGE_GOLD, STAGE_TEXT, stageGold, useIsl } from "./palette";
import { openHref } from "./links";

/** btn-gold as a pill (h-12, rounded-full) */
export function GoldPill({ title, onPress, style, small }: { title: string; onPress: () => void; style?: StyleProp<ViewStyle>; small?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={({ pressed }) => [{ alignSelf: "flex-start", transform: [{ scale: pressed ? 0.985 : 1 }] }, style]}>
      <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: small ? 44 : 48, borderRadius: R.pill, paddingHorizontal: small ? 20 : 24, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />
        <Text style={{ fontFamily: FONT.bold, fontSize: small ? 14 : 15, color: goldButton.text }} numberOfLines={1}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

/** quiet pill with a hairline (on the marble or on the stage) */
export function OutlinePill({ title, onPress, onStage, style }: { title: string; onPress: () => void; onStage?: boolean; style?: StyleProp<ViewStyle> }) {
  const isl = useIsl();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}
      style={({ pressed }) => [{ alignSelf: "flex-start", height: 44, borderRadius: R.pill, paddingHorizontal: 20, alignItems: "center", justifyContent: "center", borderWidth: 1,
        borderColor: onStage ? (pressed ? STAGE_GOLD : stageGold(0.4)) : pressed ? isl.goldSoft : isl.a("goldSoft", 0.5) }, style]}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: onStage ? "rgba(255,255,255,0.9)" : isl.ink }} numberOfLines={1}>{title}</Text>
    </Pressable>
  );
}

/** a text link with an arrow in the accent colour */
export function ArrowLink({ title, onPress, onStage, style }: { title: string; onPress: () => void; onStage?: boolean; style?: StyleProp<TextStyle> }) {
  const isl = useIsl();
  return <Text onPress={onPress} accessibilityRole="link" style={[{ fontFamily: FONT.bold, fontSize: 14, color: onStage ? stage.gold : isl.accent, paddingVertical: 6 }, style]}>{title} {FWD}</Text>;
}

/** the + that turns into × (.isl-plus) */
function Plus({ open, size = 28, onStage }: { open: boolean; size?: number; onStage?: boolean }) {
  const isl = useIsl();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: onStage ? stageGold(0.4) : isl.a("goldSoft", 0.5), alignItems: "center", justifyContent: "center", transform: [{ rotate: open ? "135deg" : "0deg" }] }}>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: size * 0.6, lineHeight: size * 0.75, color: onStage ? STAGE_GOLD : isl.gold }}>+</Text>
    </View>
  );
}

const animate = () => LayoutAnimation.configureNext(LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));

/** one question that opens to its answer (<details class="isl-faq isl-card">) */
export function FaqItem({ q, a, star = true, badge }: { q: string; a: string; star?: boolean; badge?: ReactNode }) {
  const isl = useIsl();
  const sw = useSaw();
  const [open, setOpen] = useState(false);
  return (
    <IslCard highlight={open}>
      <Pressable onPress={() => { animate(); setOpen((o) => !o); }} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={q}
        style={({ pressed }) => ({ flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, opacity: pressed ? 0.85 : 1 })}>
        {star ? <View style={{ marginTop: 4 }}><StarMark size={16} color={isl.goldSoft} /></View> : null}
        <View style={{ flex: 1 }}>
          {badge}
          <Text style={{ fontFamily: FONT.semibold, fontSize: badge ? 16 : 16.5, lineHeight: 22.5, color: isl.ink }}>{sw(q)}</Text>
        </View>
        <Plus open={open} />
      </Pressable>
      {open ? <Text style={{ paddingStart: star ? 44 : 16, paddingEnd: 16, paddingBottom: 20, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: isl.muted }}>{sw(a)}</Text> : null}
    </IslCard>
  );
}

/** a <details> on the stage: summary in gold with a small +, the body below */
export function StageDetails({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 12 }}>
      <Pressable onPress={() => { animate(); setOpen((o) => !o); }} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={label}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: STAGE_GOLD }}>{label}</Text>
        <Plus open={open} size={24} onStage />
      </Pressable>
      {open ? <View>{children}</View> : null}
    </View>
  );
}

/** "Courses and tools" at the end of a page (PosterTiles MoreTiles); tiles the app does not have are left out */
export function MoreTiles({ keys, style }: { keys: string[]; style?: StyleProp<ViewStyle> }) {
  const w = useWebT();
  const isl = useIsl();
  const theme = useTheme();
  const tiles = keys.map((k) => TILES[k]).filter((x) => !!x && APP_TILES.some((a) => a.key === x.key));
  if (!tiles.length) return null;
  return (
    <View style={[{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 56, backgroundColor: theme.bg }, style]}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <IslH2 size={26}>{w("home2.coursesTitle")}</IslH2>
        <Text onPress={() => openHref("/academy")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 14, color: isl.accent, paddingBottom: 3 }}>{w("home2.coursesAll")} {FWD}</Text>
      </View>
      <PosterGrid>
        {tiles.map((x) => (
          <Poster key={x.key} title={w(`nav.${x.key}`)} desc={w(`home2.${x.desc}`)} badge={w(`home2.badge_${x.badge}`)} arabic={x.ar}
            colors={gradientColors(x.bg)} cta={w("home2.open")} onPress={() => openHref(x.href)} />
        ))}
      </PosterGrid>
    </View>
  );
}

/** an arched outline: elliptical top (rx = half the width, ry), rounded bottom corners (CSS border-radius 50% 50% r r / ry ry r r) */
export function archPath(w: number, h: number, inset: number, ry: number, r: number) {
  const x0 = inset, x1 = w - inset, y0 = inset, y1 = h - inset, rx = (w - 2 * inset) / 2;
  return `M${x0} ${y0 + ry}A${rx} ${ry} 0 0 1 ${x0 + rx} ${y0}A${rx} ${ry} 0 0 1 ${x1} ${y0 + ry}V${y1 - r}Q${x1} ${y1} ${x1 - r} ${y1}H${x0 + r}Q${x0} ${y1} ${x0} ${y1 - r}Z`;
}

/** the doorway to the next chapter: a domed stage with an inner gold frame (.isl-door); the marble around the dome is
 *  painted over the stage, so the doorway reads as cut out of the stone */
export function Doorway({ label, ar, title, lead, meta, onPress }: { label: string; ar: string; title: string; lead: string; meta: string; onPress: () => void }) {
  const isl = useIsl();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const sw = useSaw();
  const { w, h } = size;
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={`${label}: ${title}`} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.99 : 1 }] })}
      onLayout={(e) => { const { width, height } = e.nativeEvent.layout; if (Math.abs(width - w) > 1 || Math.abs(height - h) > 1) setSize({ w: width, h: height }); }}>
      <StageBackground>
        {w ? <Dome size={420} opacity={0.7} style={{ top: -120, left: w / 2 - 210 }} /> : null}
        <View style={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40, alignItems: "center" }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.6, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>{label} {FWD}</Text>
          <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 46, lineHeight: 64, color: STAGE_GOLD, marginTop: 12, textAlign: "center", writingDirection: "rtl" }}>{ar}</Text>
          <Text style={{ fontFamily: FONT.display, fontSize: 26, lineHeight: 31, letterSpacing: -0.5, color: STAGE_TEXT, marginTop: 8, textAlign: "center" }}>{sw(title)}</Text>
          <Text numberOfLines={3} style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: "rgba(255,255,255,0.65)", marginTop: 12, textAlign: "center" }}>{sw(lead)}</Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 20, textAlign: "center" }}>{meta}</Text>
        </View>
      </StageBackground>
      {w ? (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Path d={`M-1 -1H${w + 1}V${h + 1}H-1Z${archPath(w, h, 0, 120, 18)}`} fill={isl.paper2} fillRule="evenodd" />
          <Path d={archPath(w, h, 9, 112, 12)} fill="none" stroke="rgb(233,207,153)" strokeOpacity={0.35} strokeWidth={1} />
        </Svg>
      ) : null}
    </Pressable>
  );
}

/** a panel shaped like an arch (.arch) with the inner niche line (.niche); `fill` = "stage" for the dark gradient */
export function ArchPanel({ children, fill, stroke, style, onPress, accessibilityLabel }: { children: ReactNode; fill: "stage" | string; stroke?: string; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const { w, h } = size;
  const bg = w ? (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <SvgLinear id="archfill" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={stage.bg} /><Stop offset="1" stopColor={stage.deep} /></SvgLinear>
      </Defs>
      <Path d={archPath(w, h, 0.5, h * 0.24, 16)} fill={fill === "stage" ? "url(#archfill)" : fill} stroke={stroke ?? "none"} strokeWidth={1} />
      <Path d={archPath(w, h, 10, (h - 20) * 0.22, 10)} fill="none" stroke="rgb(233,207,153)" strokeOpacity={0.16} strokeWidth={1} />
    </Svg>
  ) : null;
  const layout = (e: { nativeEvent: { layout: { width: number; height: number } } }) => { const { width, height } = e.nativeEvent.layout; if (Math.abs(width - w) > 1 || Math.abs(height - h) > 1) setSize({ w: width, h: height }); };
  if (onPress) return <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={accessibilityLabel} onLayout={layout} style={({ pressed }) => [style, { transform: [{ scale: pressed ? 0.985 : 1 }] }]}>{bg}{children}</Pressable>;
  return <View onLayout={layout} style={style}>{bg}{children}</View>;
}

/** a stage section between marble sections (.stage.girih) */
export function StageSection({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <StageBackground><View style={[{ paddingHorizontal: 20, paddingVertical: 64 }, style]}>{children}</View></StageBackground>;
}

/** a card on the stage (.isl-jcard) */
export function StageCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ borderRadius: 16, borderWidth: 1, borderColor: stageGold(0.2), padding: 18, overflow: "hidden" }, style]}>
      <LinearGradient pointerEvents="none" colors={["rgba(255,255,255,0.055)", "rgba(255,255,255,0.02)"]} style={StyleSheet.absoluteFill} />
      <LinearGradient pointerEvents="none" colors={["transparent", stageGold(0.8), "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: 0, left: 24, right: 24, height: 1 }} />
      {children}
    </View>
  );
}
