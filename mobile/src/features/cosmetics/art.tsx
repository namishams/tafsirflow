import { memo, useEffect, type ReactNode } from "react";
import { Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import Svg, { Circle, Defs, G, LinearGradient as SvgGrad, Path, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useReducedMotion } from "@/features/library/motion";

// Drawing of the store items: stickers from the server's SVG, the gold-foil shimmer of rare stickers, the avatar
// frames and the small rare mark next to a name. Shapes are geometric and calligraphic only (no faces, no figures).

/** one sticker; `shimmer` adds the slow gold-foil light of rare stickers (off with reduced motion) */
/** `gloss`: the noble ("Edel") pack stickers: a gentle light sweep every few seconds and two sparkle points, lighter
 *  than the rare shimmer so rare still stands out; with reduced motion only a static highlight */
export const StickerView = memo(function StickerView({ svg, size, shimmer, gloss, label }: { svg: string; size: number; shimmer?: boolean; gloss?: boolean; label?: string }) {
  return (
    <View accessible={!!label} accessibilityLabel={label} style={{ width: size, height: size }}>
      <SvgXml xml={svg} width={size} height={size} />
      {shimmer ? <Shimmer size={size} /> : gloss ? <Gloss size={size} /> : null}
    </View>
  );
});

function Gloss({ size }: { size: number }) {
  const reduce = useReducedMotion();
  const x = useSharedValue(-1);
  const tw = useSharedValue(0.3);
  useEffect(() => {
    if (reduce) return;
    // one slow sweep, then a long rest (about every 6 seconds); the sparkles breathe softly
    x.value = withRepeat(withSequence(withTiming(-1, { duration: 4200 }), withTiming(1.3, { duration: 1800, easing: Easing.inOut(Easing.quad) })), -1, false);
    tw.value = withRepeat(withTiming(0.9, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => { cancelAnimation(x); cancelAnimation(tw); };
  }, [reduce, x, tw]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * size }, { rotate: "20deg" }] }));
  const sp = useAnimatedStyle(() => ({ opacity: tw.value }));
  const dot = (l: number, t: number, r: number) => <View style={{ position: "absolute", left: l * size - r, top: t * size - r, width: r * 2, height: r * 2, borderRadius: r, backgroundColor: "#fff8e1" }} />;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
      {reduce ? (
        <LinearGradient colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"]} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 0.6 }} style={{ position: "absolute", left: 0, top: 0, width: size, height: size }} />
      ) : (
        <Animated.View style={[{ position: "absolute", top: -size * 0.2, width: size * 0.22, height: size * 1.4 }, st]}>
          <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,250,230,0.32)", "rgba(255,255,255,0)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1 }} />
        </Animated.View>
      )}
      <Animated.View style={[{ position: "absolute", left: 0, top: 0, width: size, height: size }, reduce ? { opacity: 0.6 } : sp]}>
        {dot(0.24, 0.2, Math.max(1, size * 0.018))}{dot(0.78, 0.3, Math.max(1, size * 0.014))}
      </Animated.View>
    </View>
  );
}

function Shimmer({ size }: { size: number }) {
  const reduce = useReducedMotion();
  const x = useSharedValue(-1);
  useEffect(() => {
    if (reduce) return;
    x.value = withRepeat(withTiming(1.4, { duration: 2600, easing: Easing.inOut(Easing.quad) }), -1, false);
    return () => cancelAnimation(x);
  }, [reduce, x]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * size }, { rotate: "20deg" }] }));
  if (reduce) return null;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
      <Animated.View style={[{ position: "absolute", top: -size * 0.2, width: size * 0.35, height: size * 1.4 }, st]}>
        <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,248,220,0.55)", "rgba(255,255,255,0)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1 }} />
      </Animated.View>
    </View>
  );
}

// ---------- avatar frames ----------
export type FrameSlug = "emerald" | "gold-arabesque" | "night-sky" | "haramain-arch" | "rose-garden" | "collector";
const FRAME_COLORS: Record<FrameSlug, [string, string, string]> = {
  emerald: ["#2a8a68", "#0b3d2e", "#c6a65e"],
  "gold-arabesque": ["#f3e2b6", "#a07a32", "#fff6dc"],
  "night-sky": ["#2b3f78", "#0a1430", "#f3e2b6"],
  "haramain-arch": ["#e3c98a", "#0b3d2e", "#f8ecc8"],
  "rose-garden": ["#efc2b0", "#a8695a", "#fff1ea"],
  collector: ["#fff1c2", "#9c7425", "#0b3d2e"],
};
export const isFrame = (s: string | null | undefined): s is FrameSlug => !!s && s in FRAME_COLORS;

/** the frame drawn around an avatar of `size` (the avatar sits inside, unchanged) */
export function FrameRing({ frame, size, children }: { frame: string | null | undefined; size: number; children: ReactNode }) {
  if (!isFrame(frame)) return <>{children}</>;
  const pad = Math.max(4, size * 0.12);
  const S = size + pad * 2;
  const [a, b, c] = FRAME_COLORS[frame];
  const r = S / 2, rim = r - pad * 0.45;
  const id = `fr${frame.replace(/-/g, "")}`;
  const n = frame === "gold-arabesque" || frame === "collector" ? 16 : frame === "rose-garden" ? 10 : 8;
  return (
    // the frame lies around the avatar without changing its place in the layout (negative margin)
    <View style={{ width: S, height: S, margin: -pad, alignItems: "center", justifyContent: "center" }}>
      <Svg width={S} height={S} style={{ position: "absolute" }} accessible={false}>
        <Defs><SvgGrad id={id} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={a} /><Stop offset="1" stopColor={b} /></SvgGrad></Defs>
        <Circle cx={r} cy={r} r={rim} stroke={`url(#${id})`} strokeWidth={pad * 0.9} fill="none" />
        <G>
          {Array.from({ length: n }, (_, i) => {
            const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
            const x = r + rim * Math.cos(ang), y = r + rim * Math.sin(ang);
            if (frame === "night-sky") return <Path key={i} d={star(x, y, pad * 0.32, pad * 0.13)} fill={c} />;
            if (frame === "haramain-arch" && i === 0) return <Path key={i} d={`M${x - pad},${y + pad * 0.4}Q${x},${y - pad * 1.3} ${x + pad},${y + pad * 0.4}`} stroke={c} strokeWidth={2} fill="none" />;
            return <Circle key={i} cx={x} cy={y} r={pad * (frame === "rose-garden" ? 0.26 : 0.18)} fill={c} />;
          })}
        </G>
      </Svg>
      {children}
    </View>
  );
}
const star = (cx: number, cy: number, r1: number, r2: number, pts = 5) =>
  `M${Array.from({ length: pts * 2 }, (_, i) => { const a = (i * Math.PI) / pts - Math.PI / 2; const r = i % 2 ? r2 : r1; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join("L")}Z`;

/** a frame preview on its own (store) */
export function FramePreview({ frame, size }: { frame: string; size: number }) {
  const inner = size * 0.78;
  return (
    <FrameRing frame={frame} size={inner}>
      <View style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: "#DCE5E0", overflow: "hidden", alignItems: "center", justifyContent: "flex-end" }}>
        <View style={{ width: inner * 0.34, height: inner * 0.34, borderRadius: inner, backgroundColor: "#F8F6EF", marginBottom: inner * 0.06 }} />
        <View style={{ width: inner * 0.66, height: inner * 0.32, borderTopLeftRadius: inner, borderTopRightRadius: inner, backgroundColor: "#F8F6EF" }} />
      </View>
    </FrameRing>
  );
}

/** the small mark of a pinned rare sticker next to a name (chats, comments, profile header) */
export function RareMark({ svg, size = 16, label }: { svg: string | null | undefined; size?: number; label?: string }) {
  if (!svg) return null;
  return <StickerView svg={svg} size={size} label={label} />;
}

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
/** a gold number plate (like a licence plate): the number in Arabic and Latin digits, for one-of-ones and numbers */
export function NumberPlate({ n, unique }: { n: number; unique?: boolean }) {
  const ar = String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
  return (
    <LinearGradient colors={unique ? ["#fff3c4", "#d6aa4a", "#8f6418"] : ["#f8ecc8", "#c9a65e", "#a07a32"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", borderRadius: 6, borderWidth: 1.5, borderColor: "#5a4518", overflow: "hidden" }}>
      <View style={{ paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "rgba(11,61,46,0.9)" }}>
        <Text style={{ fontWeight: "700", fontSize: 13, color: "#f3e2b6" }}>{ar}</Text>
      </View>
      <Text style={{ paddingHorizontal: 10, fontWeight: "800", fontSize: 15, letterSpacing: 1.5, color: "#2a1d05" }}>{unique ? "1/1" : `No. ${n}`}</Text>
    </LinearGradient>
  );
}
