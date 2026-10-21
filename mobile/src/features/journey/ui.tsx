import { memo, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, LinearGradient as SvgGrad, Path, Rect, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { StickerArt } from "@/features/feed/Sticker";
import { useReducedMotion } from "@/features/library/motion";
import { getVerseByKey, type SingleVerse } from "@/lib/quran";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import type { JDef } from "./stickers";
import { useJT } from "./texts";

// Shared pieces of the long path: the seal (feed sticker art, with the mythic sheen for the nine mythic seals), the
// reminder of Quran 12:76 at every top of the path, and the map of the Marāḥil in emerald and gold.

// ---------- seals ----------
const star = (cx: number, cy: number, r1: number, r2: number, pts = 8) =>
  `M${Array.from({ length: pts * 2 }, (_, i) => { const a = (i * Math.PI) / pts - Math.PI / 2; const r = i % 2 ? r2 : r1; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join("L")}Z`;
const MYTHIC_SHAPE = star(50, 50, 46, 38);
/** mother-of-pearl over gold: emerald, pearl and gold, like the inlay of a mushaf binding */
const PEARL = ["#fff6dc", "#bfe3d0", "#f3e2b6", "#9fd6c1", "#f8ecc8", "#d6b46c"];

/** a mythic seal: the feed seal art in the rare tone, a mother-of-pearl sheen and one slow light sweep when it appears */
function MythicSheen({ size, locked }: { size: number; locked: boolean }) {
  const reduce = useReducedMotion();
  const x = useSharedValue(-1);
  useEffect(() => {
    if (reduce || locked) return;
    x.value = -1;
    x.value = withDelay(350, withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.cubic) }));
  }, [reduce, locked, x]);
  const band = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * size }, { rotate: "20deg" }], opacity: x.value <= -1 || x.value >= 1 ? 0 : 0.85 }));
  if (locked) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: "hidden", borderRadius: size / 2 }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Defs>
          <ClipPath id="mclip"><Path d={MYTHIC_SHAPE} /></ClipPath>
          <SvgGrad id="mpearl" x1="0" y1="0" x2="1" y2="1">{PEARL.map((c, i) => <Stop key={c + i} offset={i / (PEARL.length - 1)} stopColor={c} />)}</SvgGrad>
        </Defs>
        <G clipPath="url(#mclip)">
          <Rect width={100} height={100} fill="url(#mpearl)" opacity={0.28} />
          {[[50, 4], [96, 50], [50, 96], [4, 50], [18, 18], [82, 18], [82, 82], [18, 82]].map(([cx, cy]) => <Path key={`${cx}-${cy}`} d={star(cx, cy, 3.4, 1.2, 4)} fill="#fffaf0" opacity={0.95} />)}
        </G>
        <Path d={MYTHIC_SHAPE} fill="none" stroke="#fff6dc" strokeOpacity={0.7} strokeWidth={1.2} />
      </Svg>
      <Animated.View style={[{ position: "absolute", top: -size * 0.25, bottom: -size * 0.25, width: size * 0.32, left: size * 0.34 }, band]}>
        <LinearGradient colors={["rgba(255,250,235,0)", "rgba(255,250,235,0.75)", "rgba(255,250,235,0)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1 }} />
      </Animated.View>
    </View>
  );
}

export const Seal = memo(function Seal({ def, size = 76, locked = false, pct = 0 }: { def: JDef; size?: number; locked?: boolean; pct?: number }) {
  const t = useTheme();
  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={locked ? { opacity: 0.45 } : undefined}><StickerArt def={def} size={size} locked={locked} /></View>
      {def.mythic ? <MythicSheen size={size} locked={locked} /> : null}
      {locked && pct > 0 ? (
        <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
          <Circle cx={50} cy={50} r={48} fill="none" stroke={t.gold} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={`${(Math.min(1, pct) * 301).toFixed(1)} 400`} transform="rotate(-90 50 50)" />
        </Svg>
      ) : null}
    </View>
  );
});

// ---------- Quran 12:76: above every possessor of knowledge is one more knowing ----------
const verseCache = new Map<string, SingleVerse>();
/** the verse from the app's Quran data (never typed by hand) with the translation in the reader's language */
export function HorizonVerse({ onStage = false }: { onStage?: boolean }) {
  const { lang } = useLang();
  const t = useTheme();
  const jt = useJT();
  const [v, setV] = useState<SingleVerse | null>(verseCache.get(lang) ?? null);
  useEffect(() => {
    if (verseCache.has(lang)) { setV(verseCache.get(lang)!); return; }
    let off = false;
    getVerseByKey("12:76", lang).then((x) => { verseCache.set(lang, x); if (!off) setV(x); }).catch(() => undefined);
    return () => { off = true; };
  }, [lang]);
  if (!v) return null;
  const ink = onStage ? "#fff" : t.ink, soft = onStage ? stage.textSoft : t.muted;
  return (
    <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: onStage ? stage.hair : t.line, paddingTop: 14 }} accessible accessibilityLabel={`${jt("horizon")}. ${v.translation} (${jt("quranRef", { k: "12:76" })})`}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.2, color: onStage ? stage.gold : t.gold }}>{jt("horizon")}</Text>
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 40, color: ink, writingDirection: "rtl", textAlign: "right" }}>{v.text_uthmani}</Text>
      {v.translation ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: soft }}>{v.translation}</Text> : null}
      <Text style={{ fontFamily: FONT.medium, fontSize: 12, color: soft }}>{jt("quranRef", { k: "12:76" })}</Text>
    </View>
  );
}

// ---------- the map ----------
export type MapNode = { m: number; state: "done" | "current" | "ahead"; frac: number; title: string; sub: string };
const ROW = 104;
/** the Marāḥil as stations on a winding gold path over deep emerald; the path never ends (dots after the last station) */
export function MarahilMap({ nodes, selected, onSelect, width }: { nodes: MapNode[]; selected: number; onSelect: (m: number) => void; width: number }) {
  const jt = useJT();
  const h = nodes.length * ROW + 70;
  const xs = nodes.map((_, i) => (i % 4 === 0 ? 0.3 : i % 4 === 1 ? 0.62 : i % 4 === 2 ? 0.74 : 0.42) * width);
  const ys = nodes.map((_, i) => 52 + i * ROW);
  const seg = (i: number) => `M${xs[i]},${ys[i]} C${xs[i]},${ys[i] + ROW * 0.55} ${xs[i + 1]},${ys[i + 1] - ROW * 0.55} ${xs[i + 1]},${ys[i + 1]}`;
  const lastX = xs[xs.length - 1], lastY = ys[ys.length - 1];
  return (
    <View style={{ width, height: h, borderRadius: R.card, overflow: "hidden", backgroundColor: stage.bg, borderWidth: 1, borderColor: "rgba(214,180,108,0.45)" }}>
      <Svg width={width} height={h} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGrad id="jbg" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#0c4a37" /><Stop offset="1" stopColor="#051c15" /></SvgGrad>
          <SvgGrad id="jgold" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#f6e7bf" /><Stop offset="0.5" stopColor="#d6b46c" /><Stop offset="1" stopColor="#a9802f" /></SvgGrad>
        </Defs>
        <Rect width={width} height={h} fill="url(#jbg)" />
        {/* a quiet lattice of eight-pointed stars */}
        {Array.from({ length: Math.ceil(h / 64) * Math.ceil(width / 64) }, (_, i) => { const c = i % Math.ceil(width / 64), r = Math.floor(i / Math.ceil(width / 64)); return <Path key={i} d={star(c * 64 + 32, r * 64 + 32, 7, 4)} fill="none" stroke="#d6b46c" strokeOpacity={0.07} strokeWidth={1} />; })}
        {nodes.slice(0, -1).map((n, i) => (
          <Path key={`p${n.m}`} d={seg(i)} fill="none" stroke={n.state === "done" ? "url(#jgold)" : "rgba(214,180,108,0.45)"} strokeWidth={n.state === "done" ? 3 : 2} strokeDasharray={n.state === "done" ? undefined : "2 7"} strokeLinecap="round" />
        ))}
        {[0, 1, 2].map((k) => <Circle key={`h${k}`} cx={lastX} cy={lastY + 30 + k * 12} r={2.2 - k * 0.5} fill="#d6b46c" opacity={0.6 - k * 0.18} />)}
        {nodes.map((n, i) => {
          const x = xs[i], y = ys[i], sel = n.m === selected;
          return (
            <G key={`n${n.m}`}>
              {sel ? <Circle cx={x} cy={y} r={30} fill="rgba(214,180,108,0.12)" /> : null}
              <Path d={`M${x - 15},${y - 15}h30v30h-30z`} fill={n.state === "done" ? "url(#jgold)" : "#08261d"} stroke="url(#jgold)" strokeWidth={1.5} />
              <Path d={`M${x},${y - 21}L${x + 21},${y}L${x},${y + 21}L${x - 21},${y}Z`} fill={n.state === "done" ? "url(#jgold)" : "#08261d"} stroke="url(#jgold)" strokeWidth={1.5} />
              {n.state === "current" ? <Circle cx={x} cy={y} r={27} fill="none" stroke="#e9cf99" strokeWidth={2.5} strokeLinecap="round" strokeDasharray={`${(Math.max(0.02, n.frac) * 169.6).toFixed(1)} 200`} transform={`rotate(-90 ${x} ${y})`} /> : null}
            </G>
          );
        })}
      </Svg>
      {nodes.map((n, i) => {
        const left = xs[i] < width / 2;
        return (
          <Pressable key={`l${n.m}`} onPress={() => onSelect(n.m)} accessibilityRole="button" accessibilityState={{ selected: n.m === selected }}
            accessibilityLabel={`${n.title}. ${n.sub}`} style={{ position: "absolute", top: ys[i] - 30, left: 0, right: 0, height: 60 }}>
            <Text style={{ position: "absolute", top: 21, left: xs[i] - 21, width: 42, textAlign: "center", fontFamily: FONT.bold, fontSize: 15, color: n.state === "done" ? "#08261d" : "#f3e2b6" }}>{n.m}</Text>
            <View style={{ position: "absolute", top: 10, ...(left ? { left: xs[i] + 36, right: 12 } : { right: width - xs[i] + 36, left: 12, alignItems: "flex-end" }) }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 14.5, color: n.state === "ahead" ? stage.textSoft : "#fff" }} numberOfLines={1}>{n.title}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: n.state === "current" ? stage.gold : stage.textMuted, textAlign: left ? "left" : "right" }} numberOfLines={2}>{n.sub}</Text>
            </View>
          </Pressable>
        );
      })}
      <Text style={{ position: "absolute", top: lastY + 62, left: 0, right: 0, textAlign: "center", fontFamily: FONT.semibold, fontSize: 13, color: stage.gold }} accessibilityLabel={jt("horizonOn")}>{jt("horizonOn")}</Text>
    </View>
  );
}
