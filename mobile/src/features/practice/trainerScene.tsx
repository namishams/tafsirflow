import { useEffect, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient as SvgLinear, Path, RadialGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { FONT } from "@/lib/theme";
import { GRAD, MAT, MOTES, PROPS, TA, gardenTree, skyline, star8, terrace, type PostureSet } from "./web/trainerArt";

// The painted courtyard of the prayer and wudu trainers (website: components/art/TrainerScene.tsx), drawn natively from
// the same geometry (web/trainerArt.ts). Like the garden scene, every moving part is its own layer moved by Reanimated
// on the UI thread (transform and opacity only): the sun's breathing light, the drifting mist, the two trees swaying in
// the garden's sine rhythm, the twinkling motes. Under Reduce Motion everything stands still.

/** the trainers' viewBox: the courtyard of 240 × 254 with 36 units of sky above for the glass controls */
export const VB = "0 -36 240 290";
export const VB_W = 240, VB_H = 290, VB_TOP = -36;

type Stops = readonly (readonly [number, string, number])[];
const stops = (s: Stops) => s.map(([o, c, a]) => <Stop key={o} offset={o} stopColor={c} stopOpacity={a} />);

/** the gradients of a scene layer (react-native-svg keeps ids per Svg, so every layer that paints with them has its own) */
export function TsDefs({ u }: { u: string }) {
  return (
    <Defs>
      <SvgLinear id={`${u}sky`} x1="0" y1="0" x2="0" y2="1">{stops(GRAD.sky)}</SvgLinear>
      <RadialGradient id={`${u}sun`} cx="0.5" cy="0.5" r="0.5">{stops(GRAD.sun)}</RadialGradient>
      <RadialGradient id={`${u}aura`} cx="0.5" cy="0.5" r="0.5">{stops(GRAD.aura)}</RadialGradient>
      <RadialGradient id={`${u}robe`} cx="0.35" cy="0.25" r="0.9">{stops(GRAD.robe)}</RadialGradient>
      <RadialGradient id={`${u}skin`} cx="0.35" cy="0.3" r="0.85">{stops(GRAD.skin)}</RadialGradient>
      <RadialGradient id={`${u}leaf`} cx="0.4" cy="0.35" r="0.7">{stops(GRAD.leaf)}</RadialGradient>
      <SvgLinear id={`${u}marble`} x1="0" y1="0" x2="0" y2="1">{stops(GRAD.marble)}</SvgLinear>
      <SvgLinear id={`${u}face`} x1="0" y1="0" x2="0" y2="1">{stops(GRAD.face)}</SvgLinear>
      <SvgLinear id={`${u}mat`} x1="0" y1="0" x2="1" y2="1">{stops(GRAD.mat)}</SvgLinear>
      <SvgLinear id={`${u}cap`} x1="0" y1="0" x2="1" y2="1">{stops(GRAD.cap)}</SvgLinear>
      <SvgLinear id={`${u}metal`} x1="0" y1="0" x2="1" y2="1">{stops(GRAD.metal)}</SvgLinear>
      <SvgLinear id={`${u}mist`} x1="0" y1="0" x2="1" y2="0">{stops(GRAD.mist)}</SvgLinear>
    </Defs>
  );
}

/** one full-size layer of the scene */
export function Layer({ children, style }: { children: ReactNode; style?: object }) {
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" viewBox={VB}>{children}</Svg>
    </Animated.View>
  );
}

/** a value that swings between 0 and 1 forever (sine easing), or stays at `rest` when still */
export function useSwing(ms: number, still: boolean, delay = 0, rest = 1) {
  const v = useSharedValue(rest);
  useEffect(() => {
    if (still) { v.value = rest; return; }
    v.value = 0;
    v.value = withDelay(delay, withRepeat(withTiming(1, { duration: ms, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(v);
  }, [ms, still, delay, rest, v]);
  return v;
}

const TREES = { l: gardenTree(16, 0, 22, "salah-l"), r: gardenTree(224, 0, 19, "salah-r") };
function Tree({ u, x, G: gl, side, still }: { u: string; x: number; G: number; side: "l" | "r"; still: boolean }) {
  const ground = gl;
  const t = TREES[side];
  const s = useSwing(side === "l" ? 2750 : 3150, still, 0, 0.5);
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${(s.value * 2 - 1) * 1.4}deg` }] }));
  return (
    <Layer style={[{ transformOrigin: `${(x / VB_W) * 100}% ${((ground - VB_TOP) / VB_H) * 100}%` }, st]}>
      <TsDefs u={u} />
      <G x={x - t.x} y={ground}>
        <Path d={t.trunk} fill={TA.trunk} />
        <Path d={t.shade} fill={TA.leaf} opacity={0.95} />
        <Path d={t.body} fill={TA.leaf} />
        <Path d={t.lit} fill={`url(#${u}leaf)`} />
        <Path d={t.hi} fill={TA.sage} opacity={0.38} />
        {t.glints.map(([gx, gy, r], i) => <Circle key={i} cx={gx} cy={gy} r={r} fill={TA.goldPale} opacity={0.55} />)}
      </G>
    </Layer>
  );
}

/** the courtyard at dawn behind a scene: sky, breathing sun, domes and minarets in drifting mist, two garden trees, the
 *  marble terrace (and the qibla on the horizon for the prayer) */
export function Courtyard({ u, G: gl, H, still, qibla }: { u: string; G: number; H: number; still: boolean; qibla?: string }) {
  const g = gl;
  const sky = skyline(g), ter = terrace(g, H);
  const sun = useSwing(7000, still);
  const mist = useSwing(26000, still, 0, 0.5);
  const sunSt = useAnimatedStyle(() => ({ opacity: 0.7 + 0.3 * sun.value }));
  // 18 of 240 units either way, as the website's ts-mist
  const mistSt = useAnimatedStyle(() => ({ transform: [{ translateX: `${(mist.value * 2 - 1) * 7.5}%` }] }));
  return (
    <>
      <Layer><TsDefs u={u} /><Rect x={-20} y={-60} width={280} height={g + 60} fill={`url(#${u}sky)`} /></Layer>
      <Layer style={sunSt}><TsDefs u={u} /><Circle cx={120} cy={g - 26} r={120} fill={`url(#${u}sun)`} /></Layer>
      <Layer><Path d={sky.far} fill={TA.mint} opacity={0.28} /></Layer>
      <Layer style={mistSt}><TsDefs u={u} /><Rect x={-30} y={g - 46} width={300} height={34} fill={`url(#${u}mist)`} /></Layer>
      <Layer><Path d={sky.near} fill={TA.emerald} opacity={0.7} /></Layer>
      <Tree u={u} x={18} G={g} side="l" still={still} />
      <Tree u={u} x={232} G={g} side="r" still={still} />
      {qibla ? <Layer style={sunSt}><TsDefs u={u} /><Circle cx={204} cy={g - 12} r={16} fill={`url(#${u}aura)`} /></Layer> : null}
      <Layer>
        <TsDefs u={u} />
        {qibla ? (
          <G>
            <Rect x={196} y={g - 20} width={16} height={18} rx={1} fill="#0b0b0b" />
            <Rect x={196} y={g - 15.5} width={16} height={2.2} fill={TA.gold} />
            <Path d={`M201 ${g - 9}h3.4v7h-3.4z`} fill={TA.gold} opacity={0.55} />
            <SvgText x={204} y={g - 24} textAnchor="middle" fontSize={7} fontFamily={FONT.semibold} letterSpacing={0.4} fill={TA.goldPale}>{qibla}</SvgText>
          </G>
        ) : null}
        <Path d={ter.top} fill={`url(#${u}marble)`} />
        <Path d={ter.face} fill={`url(#${u}face)`} />
        {ter.diamonds.map(([d, c], i) => <Path key={i} d={d} fill={c} opacity={0.9} />)}
        <Path d={ter.rim} stroke={TA.gold} strokeWidth={1} />
        <Path d={`M0 ${g}H240`} stroke={TA.glint} strokeOpacity={0.5} strokeWidth={0.6} />
      </Layer>
    </>
  );
}

function Mote({ x, y, r, d, still }: { x: number; y: number; r: number; d: number; still: boolean }) {
  const v = useSwing(3600, still, d * 1000, 0.6);
  const st = useAnimatedStyle(() => ({ opacity: 0.15 + 0.75 * v.value }));
  return <Layer style={st}><Path d={star8(x, y, r)} fill={TA.goldPale} /></Layer>;
}
/** the motes of light that drift in the warm air */
export function Motes({ still }: { still: boolean }) {
  return <>{MOTES.map(([x, y, r, d]) => <Mote key={`${x}-${y}`} x={x} y={y} r={r} d={d} still={still} />)}</>;
}

/** the soft light behind the figure, breathing slowly */
export function Aura({ u, cx, cy, r, still }: { u: string; cx: number; cy: number; r: number; still: boolean }) {
  const v = useSwing(7000, still);
  const st = useAnimatedStyle(() => ({ opacity: 0.7 + 0.3 * v.value }));
  return <Layer style={st}><TsDefs u={u} /><Circle cx={cx} cy={cy} r={r} fill={`url(#${u}aura)`} /></Layer>;
}

/** the prayer mat on the terrace */
export function MatArt({ u }: { u: string }) {
  return (
    <G>
      <Path d={MAT.base} fill={`url(#${u}mat)`} />
      <Path d={MAT.border} fill="none" stroke={TA.goldHi} strokeOpacity={0.8} strokeWidth={0.7} />
      <Path d={MAT.arch} fill="none" stroke={TA.goldHi} strokeWidth={0.8} />
      <Path d={MAT.fringe} stroke={TA.goldHi} strokeOpacity={0.7} strokeWidth={0.6} strokeLinecap="round" />
    </G>
  );
}

/** small glyphs of the glass controls (mirrored by the caller in right-to-left layouts) */
export function Glyph({ name, size = 20, color = "#ffffff" }: { name: "prev" | "next" | "play" | "pause" | "restart" | "chevron"; size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      {name === "prev" ? <Path d="M14.5 5.5L8 12l6.5 6.5" /> : null}
      {name === "next" || name === "chevron" ? <Path d="M9.5 5.5L16 12l-6.5 6.5" /> : null}
      {name === "play" ? <Path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.2-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6z" fill={color} stroke="none" /> : null}
      {name === "pause" ? <Path d="M8 5v14M16 5v14" strokeWidth={3.2} /> : null}
      {name === "restart" ? <Path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4" /> : null}
    </Svg>
  );
}

/** the scene box: the illustration's aspect, the layers stacked, overlays (glass controls) on top */
export function SceneBox({ children, label }: { children: ReactNode; label: string }) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ width: "100%", aspectRatio: VB_W / VB_H, backgroundColor: TA.night, overflow: "hidden" }}>
      {children}
    </View>
  );
}

/** the chair or the cushion under the figure (in the figure's own coordinates, inside the figure's group) */
export function PropsArt({ u, set }: { u: string; set: PostureSet }) {
  if (set === "chair") return (
    <G>
      <Path d={PROPS.chairBack} fill="#7a5634" />
      <Path d={PROPS.chairLeg} fill={TA.trunk} />
      <Path d={PROPS.chairSeat} fill={TA.trunkHi} />
      <Path d={PROPS.chairRim} stroke={TA.gold} strokeWidth={1.2} />
    </G>
  );
  if (set === "lying") return <Path d={PROPS.cushion} fill={`url(#${u}metal)`} />;
  return null;
}
