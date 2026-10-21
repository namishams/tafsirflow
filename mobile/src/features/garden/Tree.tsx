import { memo, useEffect, useMemo } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient as SvgLinear, Line, Path, RadialGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { CALLIG_FONT } from "@/lib/theme";
import type { Season, Trait, TreeType } from "./garden";

// The tree, drawn per type and stage (0 seed … 12 ancient). Two stacked layers: the trunk with the ground, and the
// crown in its own layer that sways gently in the wind (Reanimated on the UI thread; static under Reduce Motion).
// Everything is derived deterministically from the tree id, memoised, and drawn in a 300 × 360 box.
export const TREE_W = 300, TREE_H = 360;
const GROUND = 312, CX = 150;

const rng = (seed: string) => { let x = 2166136261; for (let i = 0; i < seed.length; i++) x = Math.imul(x ^ seed.charCodeAt(i), 16777619); x >>>= 0; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 10000) / 10000; }; };

type Pal = { leaf: [string, string, string]; trunk: [string, string]; fruit: [string, string]; blossom: string };
const PAL: Record<TreeType, Pal> = {
  palm: { leaf: ["#1f6b4a", "#3f9a68", "#9fd28a"], trunk: ["#6d4a2b", "#a87a4a"], fruit: ["#c9761e", "#f3b14a"], blossom: "#f6e7b8" },
  olive: { leaf: ["#4d6b55", "#7f9c84", "#c6d6c0"], trunk: ["#5b4a3a", "#9a8366"], fruit: ["#3d2a40", "#7a5a7e"], blossom: "#f4f1de" },
  fig: { leaf: ["#1d5c3c", "#2f8456", "#7fc48a"], trunk: ["#7c7466", "#b7ad98"], fruit: ["#5a2a4a", "#a0517e"], blossom: "#efe6c8" },
  pomegranate: { leaf: ["#1a5a35", "#2e8048", "#86c06c"], trunk: ["#5e4030", "#94684a"], fruit: ["#9c1f2a", "#e2483c"], blossom: "#ff7a4d" },
  sidr: { leaf: ["#3a6a2c", "#6a9a3e", "#c3d983"], trunk: ["#6a5236", "#a8865a"], fruit: ["#c78a1c", "#f2c34a"], blossom: "#f8eebf" },
};

type Props = { id: string; type: TreeType; stage: number; traits?: Trait[]; season?: Season; resting?: boolean; fruits?: number; size?: number; still?: boolean };

/** trunk height and crown size for a stage (shared with the scene for decorations) */
export function geom(type: TreeType, stage: number) {
  const k = Math.max(0, stage - 2) / 10;
  const h = stage < 3 ? 14 + stage * 14 : 70 + k * (type === "palm" ? 200 : 140);
  const crown = stage < 3 ? 0 : 36 + k * (type === "palm" ? 70 : 104);
  return { h, crown, top: GROUND - h, w: stage < 3 ? 2 : 6 + k * (type === "palm" ? 10 : 22) };
}

export const TreeArt = memo(function TreeArt({ id, type, stage, traits = [], season = null, resting = false, fruits = 0, size = 300, still = false }: Props) {
  const sway = useSharedValue(0);
  useEffect(() => {
    if (still || stage < 1) return;
    sway.value = withRepeat(withSequence(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), withTiming(-1, { duration: 2900, easing: Easing.inOut(Easing.sin) })), -1, true);
    return () => cancelAnimation(sway);
  }, [still, stage, sway]);
  const g = geom(type, stage);
  const scale = size / TREE_W;
  const pivotY = (stage < 3 ? GROUND : g.top + g.crown * 0.3) * scale;
  const crownStyle = useAnimatedStyle(() => ({ transform: [{ translateX: 0 }, { translateY: pivotY - (TREE_H * scale) / 2 }, { rotate: `${sway.value * (stage < 3 ? 3 : 1.4)}deg` }, { translateY: -(pivotY - (TREE_H * scale) / 2) }] }));
  const back = useMemo(() => <Back id={id} type={type} stage={stage} traits={traits} season={season} resting={resting} />, [id, type, stage, traits, season, resting]);
  const front = useMemo(() => <Crown id={id} type={type} stage={stage} traits={traits} season={season} resting={resting} fruits={fruits} />, [id, type, stage, traits, season, resting, fruits]);
  const h = (TREE_H * size) / TREE_W;
  return (
    <View style={{ width: size, height: h }} accessible={false}>
      <Svg width={size} height={h} viewBox={`0 0 ${TREE_W} ${TREE_H}`} style={{ position: "absolute" }}>{back}</Svg>
      <Animated.View style={[{ position: "absolute", width: size, height: h }, crownStyle]}>
        <Svg width={size} height={h} viewBox={`0 0 ${TREE_W} ${TREE_H}`}>{front}</Svg>
      </Animated.View>
    </View>
  );
});

// ---------- trunk, roots, ground ----------
function Back({ id, type, stage, traits, resting }: { id: string; type: TreeType; stage: number; traits: Trait[]; season: Season; resting: boolean }) {
  const p = PAL[type];
  const g = geom(type, stage);
  const r = rng(id + "t");
  const dim = resting ? 0.75 : 1;
  return (
    <G opacity={dim}>
      <Defs>
        <SvgLinear id="trk" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor={p.trunk[0]} /><Stop offset="0.55" stopColor={p.trunk[1]} /><Stop offset="1" stopColor={p.trunk[0]} /></SvgLinear>
        <RadialGradient id="soil" cx="0.5" cy="0.4" r="0.6"><Stop offset="0" stopColor="#7a5634" /><Stop offset="1" stopColor="#3e2a18" /></RadialGradient>
      </Defs>
      {/* soil mound */}
      <Ellipse cx={CX} cy={GROUND + 6} rx={46 + stage * 4} ry={10 + stage * 0.6} fill="url(#soil)" />
      <Ellipse cx={CX} cy={GROUND + 2} rx={30 + stage * 3} ry={5} fill="#8a6440" opacity={0.5} />
      {stage === 0 ? (
        <G>
          <Ellipse cx={CX} cy={GROUND - 1} rx={9} ry={6} fill="#8c5f32" />
          <Path d={`M${CX - 6} ${GROUND - 3} Q${CX} ${GROUND - 9} ${CX + 6} ${GROUND - 3}`} stroke="#e9cf99" strokeWidth={1.4} fill="none" />
          <Circle cx={CX + 3} cy={GROUND - 4} r={1.6} fill="#fff6d8" />
        </G>
      ) : stage < 3 ? (
        <Path d={`M${CX} ${GROUND} Q${CX - 4} ${GROUND - g.h / 2} ${CX + 2} ${GROUND - g.h}`} stroke="#4f8a3c" strokeWidth={2.4 + stage} fill="none" strokeLinecap="round" />
      ) : type === "palm" ? (
        <PalmTrunk g={g} stage={stage} />
      ) : (
        <G>
          {/* roots */}
          {stage >= 6 ? [-1, 1, -0.5, 0.6].map((d, i) => <Path key={i} d={`M${CX + d * 4} ${GROUND - 4} Q${CX + d * 18} ${GROUND - 2} ${CX + d * (26 + r() * 16)} ${GROUND + 4}`} stroke={p.trunk[0]} strokeWidth={5 - i} fill="none" strokeLinecap="round" />) : null}
          {/* trunk: two or three twisted strands for old olive / sidr, one tapered trunk otherwise */}
          <Path d={trunkPath(g, type === "olive" || type === "sidr" ? 0.35 : 0.12, r)} fill="url(#trk)" />
          {(type === "olive" || type === "sidr") && stage >= 7 ? <Path d={trunkPath({ ...g, w: g.w * 0.55 }, -0.5, r)} fill={p.trunk[0]} opacity={0.6} /> : null}
          {/* bark lines */}
          {Array.from({ length: Math.min(10, stage) }, (_, i) => { const y = GROUND - 10 - r() * g.h * 0.7; const x = CX + (r() - 0.5) * g.w * 0.6; return <Path key={i} d={`M${x} ${y} q${(r() - 0.5) * 4} ${-6 - r() * 8} ${(r() - 0.5) * 3} ${-14 - r() * 6}`} stroke={p.trunk[0]} strokeWidth={0.9} opacity={0.55} fill="none" />; })}
          {/* branches to the crown clusters */}
          {branchTips(id, type, stage).map((b, i) => <Path key={`b${i}`} d={`M${CX + (b.x - CX) * 0.1} ${g.top + g.crown * 0.55} Q${(CX + b.x) / 2} ${b.y + 18} ${b.x} ${b.y}`} stroke={p.trunk[1]} strokeWidth={Math.max(1.4, g.w * 0.22 - i * 0.3)} fill="none" strokeLinecap="round" />)}
        </G>
      )}
    </G>
  );
}
function trunkPath(g: { h: number; w: number; top: number; crown: number }, twist: number, r: () => number) {
  const top = g.top + g.crown * 0.5, w = g.w, tw = w * 0.45, bend = twist * 30 * (r() > 0.5 ? 1 : -1);
  return `M${CX - w} ${GROUND} C${CX - w * 0.6 + bend} ${GROUND - g.h * 0.4} ${CX - tw - bend} ${top + 40} ${CX - tw} ${top} L${CX + tw} ${top} C${CX + tw - bend} ${top + 40} ${CX + w * 0.6 + bend} ${GROUND - g.h * 0.4} ${CX + w} ${GROUND} Z`;
}
function PalmTrunk({ g, stage }: { g: ReturnType<typeof geom>; stage: number }) {
  const top = g.top, n = Math.floor(g.h / 9), bend = 10 + stage;
  const xAt = (t: number) => CX + Math.sin(t * 1.4) * bend * t;
  return (
    <G>
      <Path d={`M${CX - g.w} ${GROUND} Q${CX + bend * 0.2} ${GROUND - g.h * 0.5} ${xAt(1) - g.w * 0.5} ${top} L${xAt(1) + g.w * 0.5} ${top} Q${CX + bend * 0.6 + g.w} ${GROUND - g.h * 0.5} ${CX + g.w} ${GROUND} Z`} fill="url(#trk)" />
      {Array.from({ length: n }, (_, i) => { const t = (i + 0.5) / n, y = GROUND - t * g.h, x = CX + (xAt(1) - CX) * t * t, w = g.w * (1 - t * 0.45); return <Path key={i} d={`M${x - w} ${y + 3} Q${x} ${y - 3} ${x + w} ${y + 3}`} stroke="#4a3018" strokeWidth={1.1} fill="none" opacity={0.6} />; })}
    </G>
  );
}
/** branch end points (= crown cluster centres) */
function branchTips(id: string, type: TreeType, stage: number) {
  if (stage < 3 || type === "palm") return [];
  const g = geom(type, stage), r = rng(id + "b");
  const n = Math.min(7, 2 + Math.floor(stage / 2));
  const wide = type === "fig" || type === "sidr" ? 1.2 : type === "olive" ? 1.1 : 0.9;
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + ((i / (n - 1 || 1)) - 0.5) * 2.3;
    return { x: CX + Math.cos(a) * g.crown * wide * (0.6 + r() * 0.35), y: g.top + g.crown * 0.25 + Math.sin(a) * g.crown * (0.55 + r() * 0.25) + g.crown * 0.35 };
  });
}

// ---------- crown: fronds or leaf clusters, blossoms, fruits, lanterns, ornaments ----------
function Crown({ id, type, stage, traits, season, resting, fruits }: { id: string; type: TreeType; stage: number; traits: Trait[]; season: Season; resting: boolean; fruits: number }) {
  const p = PAL[type];
  const g = geom(type, stage);
  const r = rng(id + "c");
  const dim = resting ? 0.55 : 1;
  if (stage === 0) return <G />;
  if (stage < 3) {
    const top = GROUND - g.h;
    return (
      <G opacity={dim}>
        {Array.from({ length: stage * 2 }, (_, i) => { const s = i % 2 ? 1 : -1, y = top + i * 5; return <Path key={i} d={`M${CX + 2} ${y} q${s * 10} ${-8} ${s * 18} ${-2} q${-s * 8} ${8} ${-s * 18} ${2}`} fill={i % 2 ? p.leaf[1] : p.leaf[2]} />; })}
      </G>
    );
  }
  const ripe = Math.min(fruits + (stage >= 5 ? 2 : 0), 10);
  const lanterns = traits.includes("lanterns") || season === "ramadan";
  return (
    <G>
      <Defs>
        <RadialGradient id="lf" cx="0.4" cy="0.35" r="0.7"><Stop offset="0" stopColor={p.leaf[2]} /><Stop offset="0.5" stopColor={p.leaf[1]} /><Stop offset="1" stopColor={p.leaf[0]} /></RadialGradient>
        <RadialGradient id="fr" cx="0.35" cy="0.3" r="0.7"><Stop offset="0" stopColor="#fff2c4" /><Stop offset="0.3" stopColor={p.fruit[1]} /><Stop offset="1" stopColor={p.fruit[0]} /></RadialGradient>
        <RadialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#ffe9a8" stopOpacity={0.75} /><Stop offset="1" stopColor="#ffe9a8" stopOpacity={0} /></RadialGradient>
      </Defs>
      <G opacity={dim}>{type === "palm" ? <Fronds g={g} stage={stage} p={p} r={r} /> : <Clusters id={id} type={type} stage={stage} p={p} r={r} />}</G>
      {/* blossoms */}
      {traits.includes("blossoms") || (type === "pomegranate" && stage >= 6) ? Array.from({ length: Math.min(14, stage + 4) }, (_, i) => { const [x, y] = inCrown(type, g, r); return <G key={`bl${i}`}><Circle cx={x} cy={y} r={2.6} fill={p.blossom} /><Circle cx={x} cy={y} r={1} fill="#f7c948" /></G>; }) : null}
      {/* glowing fruits */}
      {stage >= 5 && !resting ? Array.from({ length: ripe }, (_, i) => {
        const [x, y] = type === "palm" ? [CX + (i % 2 ? 1 : -1) * (8 + (i >> 1) * 5) + (r() - 0.5) * 6, g.top + 14 + (i >> 1) * 4] : inCrown(type, g, r);
        const fr = type === "palm" ? 3 : type === "olive" || type === "sidr" ? 3.2 : 5;
        return <G key={`f${i}`}><Circle cx={x} cy={y} r={fr * 2.6} fill="url(#glow)" />{type === "olive" ? <Ellipse cx={x} cy={y} rx={fr * 0.8} ry={fr * 1.1} fill="url(#fr)" /> : <Circle cx={x} cy={y} r={fr} fill="url(#fr)" />}{type === "pomegranate" ? <Path d={`M${x - 1.5} ${y - fr} l1.5 -2.4 l1.5 2.4`} fill={p.fruit[0]} /> : null}</G>;
      }) : null}
      {/* hanging lanterns (Ramadan or the lantern sticker) */}
      {lanterns ? [-0.6, 0.15, 0.7].slice(0, stage >= 6 ? 3 : 1).map((k, i) => { const x = CX + k * g.crown, y0 = g.top + g.crown * 0.75, y = y0 + 16 + i * 4; return (
        <G key={`ln${i}`}><Line x1={x} y1={y0} x2={x} y2={y - 6} stroke="#c6a65e" strokeWidth={0.8} /><Circle cx={x} cy={y + 2} r={11} fill="url(#glow)" />
          <Path d={`M${x - 4} ${y - 6} h8 l2 4 v8 l-2 3 h-8 l-2 -3 v-8 Z`} fill="#d9b25c" stroke="#8a6a2c" strokeWidth={0.6} /><Rect x={x - 2.4} y={y - 1} width={4.8} height={6} fill="#fff1b8" opacity={0.95} /></G>
      ); }) : null}
      {/* Eid bunting of small triangles across the crown */}
      {season === "eid" ? <G>{Array.from({ length: 9 }, (_, i) => { const x = CX - g.crown + (i * 2 * g.crown) / 8, y = g.top + g.crown * 0.9 + Math.sin((i / 8) * Math.PI) * 10; return <Path key={i} d={`M${x - 4} ${y} l8 0 l-4 8 Z`} fill={i % 2 ? "#c6a65e" : "#2f8f6a"} />; })}</G> : null}
      {/* Ramadan crescent garland (the Ramadan completion reward, or during Ramadan) */}
      {traits.includes("garland") || season === "ramadan" ? <G>{Array.from({ length: 7 }, (_, i) => { const x = CX - g.crown * 0.9 + (i * 1.8 * g.crown) / 6, y = g.top + g.crown * 0.35 + Math.sin((i / 6) * Math.PI) * 14; return i % 2 ? <Star8 key={i} x={x} y={y} r={3.2} /> : <Path key={i} d={`M${x + 2} ${y - 5} a5 5 0 1 0 0 10 a4 4 0 1 1 0 -10 Z`} fill="#f3e2b6" />; })}</G> : null}
      {traits.includes("crescent") ? <Path d={`M${CX + 8} ${g.top - 26} a12 12 0 1 0 0 20 a9 9 0 1 1 0 -20 Z`} fill="#f3e2b6" /> : null}
      {traits.includes("star") ? <Star8 x={CX - (traits.includes("crescent") ? 18 : 0)} y={g.top - 18} r={7} /> : null}
    </G>
  );
}
function inCrown(type: TreeType, g: ReturnType<typeof geom>, r: () => number): [number, number] {
  const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.85;
  const wide = type === "fig" || type === "sidr" ? 1.15 : 1;
  return [CX + Math.cos(a) * g.crown * wide * d, g.top + g.crown * 0.55 + Math.sin(a) * g.crown * 0.62 * d];
}
function Fronds({ g, stage, p, r }: { g: ReturnType<typeof geom>; stage: number; p: Pal; r: () => number }) {
  const n = Math.min(16, 5 + stage);
  const top = g.top, bend = 10 + stage, tx = CX + Math.sin(1.4) * bend;
  return (
    <G>
      {Array.from({ length: n }, (_, i) => {
        const a = Math.PI + (i / (n - 1)) * Math.PI + (r() - 0.5) * 0.25;
        const len = g.crown * (0.8 + r() * 0.4);
        const ex = tx + Math.cos(a) * len, ey = top + Math.sin(a) * len * 0.5 + len * 0.42;
        const mx = tx + Math.cos(a) * len * 0.55, my = top + Math.sin(a) * len * 0.55 - 8;
        const col = i % 3 === 0 ? p.leaf[0] : i % 3 === 1 ? p.leaf[1] : "url(#lf)";
        return (
          <G key={i}>
            <Path d={`M${tx} ${top} Q${mx} ${my - 10} ${ex} ${ey} Q${mx} ${my + 8} ${tx} ${top + 3} Z`} fill={col} />
            {stage >= 5 ? Array.from({ length: 7 }, (_, j) => { const t = (j + 1) / 8, x = tx + (ex - tx) * t, y = top + (ey - top) * t - Math.sin(t * Math.PI) * 10; return <Line key={j} x1={x} y1={y} x2={x + Math.cos(a + 0.9) * 9} y2={y + Math.sin(a + 0.9) * 9 + 4} stroke={p.leaf[2]} strokeWidth={0.7} opacity={0.7} />; }) : null}
          </G>
        );
      })}
      <Circle cx={tx} cy={top + 2} r={g.w * 0.8} fill={p.trunk[0]} />
    </G>
  );
}
function Clusters({ id, type, stage, p, r }: { id: string; type: TreeType; stage: number; p: Pal; r: () => number }) {
  const g = geom(type, stage);
  const tips = branchTips(id, type, stage);
  const blob = type === "fig" ? 1.25 : type === "olive" ? 0.9 : 1;
  const leaves = Math.min(70, 14 + stage * 5);
  return (
    <G>
      {/* deep shadow layer, then lit clusters */}
      {tips.map((b, i) => <Circle key={`s${i}`} cx={b.x + 4} cy={b.y + 8} r={g.crown * 0.42 * blob} fill={p.leaf[0]} opacity={0.9} />)}
      <Ellipse cx={CX} cy={g.top + g.crown * 0.6} rx={g.crown * (type === "fig" || type === "sidr" ? 1.05 : 0.9)} ry={g.crown * 0.55} fill={p.leaf[0]} />
      {tips.map((b, i) => <Circle key={`c${i}`} cx={b.x} cy={b.y} r={g.crown * 0.36 * blob} fill="url(#lf)" />)}
      {/* single leaves for texture, shaped per type */}
      {Array.from({ length: leaves }, (_, i) => {
        const [x, y] = inCrown(type, g, r), a = r() * 360, s = type === "fig" ? 7 : type === "olive" ? 5 : 4.5;
        const fill = i % 4 === 0 ? p.leaf[2] : i % 4 === 1 ? p.leaf[0] : p.leaf[1];
        const d = type === "fig"
          ? `M0 0 c-3 -3 -6 -1 -5 -5 c-3 -2 0 -6 3 -4 c1 -3 5 -3 5 0 c3 -2 6 2 3 4 c1 4 -2 6 -6 5 Z`
          : type === "olive" ? `M0 0 q${s * 0.4} ${-s} 0 ${-s * 2.2} q${-s * 0.4} ${s} 0 ${s * 2.2} Z` : `M0 0 q${s * 0.7} ${-s * 0.8} 0 ${-s * 1.8} q${-s * 0.7} ${s * 0.8} 0 ${s * 1.8} Z`;
        return <Path key={i} d={d} fill={fill} opacity={0.92} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(0)})`} />;
      })}
      {/* rim light */}
      <Ellipse cx={CX - g.crown * 0.25} cy={g.top + g.crown * 0.25} rx={g.crown * 0.4} ry={g.crown * 0.18} fill="#ffffff" opacity={0.07} />
    </G>
  );
}
export function Star8({ x, y, r, fill = "#e9cf99" }: { x: number; y: number; r: number; fill?: string }) {
  const pts = Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8 - Math.PI / 2, rr = i % 2 ? r * 0.55 : r; return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`; });
  return <Path d={`M${pts.join(" L")} Z`} fill={fill} />;
}
/** the tree's name on a gold calligraphic plaque */
export function Plaque({ name, width = 160 }: { name: string; width?: number }) {
  return (
    <Svg width={width} height={width * 0.28} viewBox="0 0 200 56">
      <Defs><SvgLinear id="pg" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#f3e2b6" /><Stop offset="0.5" stopColor="#c6a65e" /><Stop offset="1" stopColor="#8a6a2c" /></SvgLinear></Defs>
      <Path d="M14 4 H186 Q196 4 196 14 V42 Q196 52 186 52 H14 Q4 52 4 42 V14 Q4 4 14 4 Z" fill="url(#pg)" />
      <Path d="M18 9 H182 Q190 9 190 17 V39 Q190 47 182 47 H18 Q10 47 10 39 V17 Q10 9 18 9 Z" fill="#0b3d2e" stroke="#e9cf99" strokeWidth={0.8} />
      <SvgText x={100} y={36} fontSize={name.length > 16 ? 15 : 19} fontFamily={CALLIG_FONT} fill="#f3e2b6" textAnchor="middle">{name}</SvgText>
    </Svg>
  );
}
