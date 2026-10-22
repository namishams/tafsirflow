import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from "react-native-svg";
import RA, { Easing as REasing, useAnimatedProps, useAnimatedStyle, useFrameCallback, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";
import { Courtyard, Glyph, Layer, Motes, SceneBox, TsDefs } from "./trainerScene";
import { Glass, GlassPill, GlassRound, Lens, Segmented } from "./glass";
import { BUST, BUST_F, BUST_FIT, TA, dropPath, star8, trainerDefaults, trainerUi, type FigureKind } from "./web/trainerArt";
import { IDENTITY_KEY } from "@/lib/identity";
import { useStored } from "@/lib/store";
import { RULE, WUDU, WUDU_KEY, langOf, type L3, type Scene, type Tradition, type WuduDone, type WuduStep } from "@/web/wudu";
import { award } from "@/web/points";
import { readJSON, writeJSON } from "@/lib/store";
import { useLang } from "@/i18n";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, goldButton, stage, AR_RIGHT } from "@/lib/theme";
import { Stage as StageBg } from "@/components/brand";
import { Icon } from "@/components/icons";
import { go, useClock, useReducedMotion } from "./art";
import { AR_TIMES, ARM, DONE_AR as DONE_AR_TEXT, FOOT, GOLD, HAND, INSTEP, UI, WATER, arc, shuffle, slips, type Lang } from "./web/wuduTrainer";
import { trainerTradition } from "@/lib/tradition";

const goldC = GOLD.replace(/rgb\((\d+) (\d+) (\d+)\)/, "rgb($1,$2,$3)");
const waterC = WATER.replace(/rgb\((\d+) (\d+) (\d+)\)/, "rgb($1,$2,$3)");
// <span dir="ltr"> of the website: "3 / 12" and the Latin transliteration keep their order inside right-to-left text
const ltr = (s: string) => `\u2066${s}\u2069`;

// ---------- motion: one scene clock (seconds) on the UI thread; every moving part reads it in a worklet ----------
type Clock = { t: SharedValue<number>; still: boolean };
function useSceneClock(still: boolean): Clock {
  const t = useSharedValue(0);
  const cb = useFrameCallback((f) => { t.value = f.timeSinceFirstFrame / 1000; }, false);
  useEffect(() => { cb.setActive(!still); return () => cb.setActive(false); }, [still, cb]);
  return { t, still };
}
const APath = RA.createAnimatedComponent(Path);
const ACircle = RA.createAnimatedComponent(Circle);
const AEllipse = RA.createAnimatedComponent(Ellipse);
const fracW = (x: number) => { "worklet"; return x - Math.floor(x); };
const easeW = (p: number) => { "worklet"; return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; };

// length of an "M … C …" path (the routes of the drawing), for dashes measured along the path like pathLength={100}
function pathLength(d: string) {
  const nums = d.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
  let [x, y] = [nums[0], nums[1]], len = 0;
  for (let i = 2; i + 5 < nums.length + 0; i += 6) {
    const [x1, y1, x2, y2, x3, y3] = nums.slice(i, i + 6);
    let px = x, py = y;
    for (let k = 1; k <= 24; k++) {
      const s = k / 24, a = (1 - s) ** 3, b = 3 * (1 - s) ** 2 * s, c = 3 * (1 - s) * s * s, e = s ** 3;
      const nx = a * x + b * x1 + c * x2 + e * x3, ny = a * y + b * y1 + c * y2 + e * y3;
      len += Math.hypot(nx - px, ny - py); px = nx; py = ny;
    }
    x = x3; y = y3;
  }
  return len || 1;
}

// a falling drop with a bright point (website .wd-drop)
function Drop({ x, y, fall = 60, delay = 0, s = 1, clock }: { x: number; y: number; fall?: number; delay?: number; s?: number; clock: Clock }) {
  const still = clock.still, t = clock.t;
  const drop = useAnimatedProps(() => {
    if (still) return { d: dropPath(x, y + fall * 0.45, s), fillOpacity: 0.8 };
    const p = fracW((t.value + delay) / 2.4);
    const op = p < 0.15 ? (p / 0.15) * 0.95 : p < 0.75 ? 0.95 - ((p - 0.15) / 0.6) * 0.1 : 0.85 * (1 - (p - 0.75) / 0.25);
    return { d: dropPath(x, y + fall * p * p, s), fillOpacity: op };
  });
  const hi = useAnimatedProps(() => {
    if (still) return { cy: y + fall * 0.45 + 0.6 * s, fillOpacity: 0.8 };
    const p = fracW((t.value + delay) / 2.4);
    return { cy: y + fall * p * p + 0.6 * s, fillOpacity: p < 0.15 ? p / 0.15 : p < 0.75 ? 0.9 : 0.9 * (1 - (p - 0.75) / 0.25) };
  });
  return <G><APath animatedProps={drop} fill={TA.water} /><ACircle animatedProps={hi} cx={x - s} r={0.9 * s} fill={TA.waterHi} /></G>;
}
// a route of the hand: a dotted guide and a bright stroke that sweeps along it (website .wd-sweep / .wd-once)
function Route({ d, kind, w = 2.6, delay = 0, clock }: { d: string; kind: "sweep" | "once"; w?: number; delay?: number; clock: Clock }) {
  const L = useMemo(() => pathLength(d), [d]);
  const un = L / 100, still = clock.still, t = clock.t;
  const props = useAnimatedProps(() => {
    if (still) return { strokeDashoffset: 0, strokeOpacity: 1 };
    if (kind === "sweep") {
      const cyc = fracW((t.value + delay) / 6.4) * 2;
      return { strokeDashoffset: -84 * un * easeW(cyc <= 1 ? cyc : 2 - cyc), strokeOpacity: 1 };
    }
    const p = easeW(fracW((t.value + delay) / 2.8));
    return { strokeDashoffset: (20 - 120 * p) * un, strokeOpacity: p < 0.15 ? p / 0.15 : p > 0.85 ? (1 - p) / 0.15 : 1 };
  });
  return (
    <>
      <Path d={d} fill="none" stroke={TA.water} strokeOpacity={0.45} strokeWidth={1.1} strokeDasharray="1 4" strokeLinecap="round" />
      <APath animatedProps={props} d={d} fill="none" stroke={TA.water} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={still ? undefined : `${(kind === "sweep" ? 16 : 20) * un} ${200 * un}`} />
    </>
  );
}
/** a stream of water: a soft body and a bright core that flows along it (website Stream, .wd-flow) */
function Stream({ d, w = 2, clock }: { d: string; w?: number; clock: Clock }) {
  const still = clock.still, t = clock.t;
  const props = useAnimatedProps(() => ({ strokeDashoffset: still ? 0 : -28 * fracW(t.value / 1.7) }));
  return (
    <>
      <Path d={d} fill="none" stroke={TA.water} strokeOpacity={0.28} strokeWidth={w + 1.4} strokeLinecap="round" strokeLinejoin="round" />
      <Path d={d} fill="none" stroke={TA.water} strokeOpacity={0.85} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <APath animatedProps={props} d={d} fill="none" stroke={TA.waterHi} strokeWidth={Math.max(0.8, w * 0.45)} strokeLinecap="round" strokeDasharray="5 9" />
    </>
  );
}
// light that breathes (website .wd-glow): opacity .35 → .9 → .35 over 3.4 s
function useGlow(clock: Clock, base = 1) {
  const still = clock.still, t = clock.t;
  return useAnimatedProps(() => ({ opacity: base * (still ? 0.6 : 0.35 + 0.55 * (0.5 - 0.5 * Math.cos((2 * Math.PI * t.value) / 3.4))) }));
}
function Ripple({ cx, cy, r, w = 1.2, clock, color = TA.water }: { cx: number; cy: number; r: number; w?: number; clock: Clock; color?: string }) {
  const still = clock.still, t = clock.t;
  const props = useAnimatedProps(() => {
    if (still) return { r, strokeOpacity: 0.5 };
    const p = 1 - Math.pow(1 - fracW(t.value / 2.4), 2);
    return { r: r * (0.4 + 1.1 * p), strokeOpacity: 0.9 * (1 - p) };
  });
  return <ACircle animatedProps={props} cx={cx} cy={cy} fill="none" stroke={color} strokeWidth={w} />;
}
function RippleE({ cx, cy, rx, ry, clock }: { cx: number; cy: number; rx: number; ry: number; clock: Clock }) {
  const still = clock.still, t = clock.t;
  const props = useAnimatedProps(() => {
    if (still) return { rx, ry, strokeOpacity: 0.5 };
    const p = 1 - Math.pow(1 - fracW(t.value / 2.4), 2), k = 0.4 + 1.1 * p;
    return { rx: rx * k, ry: ry * k, strokeOpacity: 0.9 * (1 - p) };
  });
  return <AEllipse animatedProps={props} cx={cx} cy={cy} fill="none" stroke={TA.waterHi} strokeWidth={1} />;
}
// a dashed ring of water turning round the mouth (website .wd-turn): the dashes travel, which reads as turning
function Turn({ cx, cy, r, clock }: { cx: number; cy: number; r: number; clock: Clock }) {
  const still = clock.still, t = clock.t, C = 2 * Math.PI * r;
  const props = useAnimatedProps(() => ({ strokeDashoffset: still ? 0 : -C * fracW(t.value / 5) }));
  return <ACircle animatedProps={props} cx={cx} cy={cy} r={r} fill="none" stroke={TA.water} strokeWidth={1.2} strokeDasharray="3 5" />;
}
function Twinkle({ x, y, d, clock }: { x: number; y: number; d: number; clock: Clock }) {
  const still = clock.still, t = clock.t;
  const props = useAnimatedProps(() => {
    if (still) return { d: star8(x, y, 5 * 0.8), fillOpacity: 0.6 };
    const k = 0.5 - 0.5 * Math.cos((2 * Math.PI * (t.value + d)) / 3.6);
    return { d: star8(x, y, 5 * (0.6 + 0.4 * k)), fillOpacity: 0.15 + 0.85 * k };
  });
  return <APath animatedProps={props} fill={TA.goldPale} />;
}

// the garden's way of drawing: lit forms with a fine gold rim, no outlines of their own (website WuduTrainer)
const rim = { fill: "none", stroke: TA.goldHi, strokeOpacity: 0.5, strokeWidth: 0.9, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const crease = { fill: "none", stroke: TA.skinLo, strokeOpacity: 0.55, strokeWidth: 1.1, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const gold = (o = 1, w = 1.8) => ({ fill: "none", stroke: goldC, strokeOpacity: o, strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round" }) as const;
const EWER = "M108 72C108 84 106 92 100 99C80 113 74 146 86 168C94 182 146 182 154 168C166 146 160 113 140 99C134 92 132 84 132 72Z";
const u = "wd";

// the bust (website Bust / BustF, geometry BUST and BUST_F in web/trainerArt.ts): small and soft, faceless; a man with
// an emerald kufi (it comes off to wipe the head and the ears), a woman with a headscarf (its front edge drawn back for
// wiping the head, lifted at the ear for the ears)
function Bust({ hl, tradition, clock, kind }: { hl: Scene; tradition: Tradition; clock: Clock; kind: FigureKind }) {
  const g = useGlow(clock);
  const B = BUST, F = BUST_F;
  const fem = kind === "f";
  const bare = !fem && (hl === "head" || hl === "ears");
  return (
    <G>
      <Defs><ClipPath id="wd-face"><Path d={fem ? F.face : B.face} /></ClipPath></Defs>
      <Path d={B.garment} fill={`url(#${u}robe)`} />
      {fem ? (
        <G>
          <Path d={F.scarf} fill={`url(#${u}robe)`} />
          <Path d={F.scarf} {...rim} />
          <Path d="M100 178C112 186 128 186 140 176" {...gold(0.9, 1.6)} />
          <Circle cx={108} cy={92} r={16} fill={TA.glint} opacity={0.18} />
          <Path d={F.face} fill={`url(#${u}skin)`} />
          <Path d={F.trim} {...gold(1, 1.8)} />
          {hl === "head" ? (
            <G>
              <Path d={F.hairline} fill={TA.hair} />
              <APath animatedProps={g} d={F.hairline} fill={goldC} fillOpacity={0.35} />
              <Route d={F.headRoute} kind={tradition === "sunni" ? "sweep" : "once"} w={3.2} clock={clock} />
            </G>
          ) : null}
          {hl === "ears" ? <Path d={F.lift} fill={`url(#${u}skin)`} /> : null}
        </G>
      ) : (
        <G>
          <Path d={B.garment} {...rim} />
          <Path d={B.neckline} {...gold(0.95, 1.8)} />
          <Path d={B.neck} fill={`url(#${u}skin)`} />
          <Path d={B.head} fill={`url(#${u}skin)`} />
          <Path d={B.head} {...rim} />
          <Circle cx={108} cy={92} r={14} fill={TA.glint} opacity={0.16} />
          {bare ? <Path d={B.hair} fill={TA.hair} opacity={0.92} /> : null}
          {hl === "head" && (tradition === "sunni"
            ? <APath animatedProps={g} d={B.hair} fill={goldC} fillOpacity={0.32} />
            : <Path d={B.headRouteShia} {...gold(0.4, 10)} />)}
        </G>
      )}
      {hl === "face" ? <Path d={fem ? F.face : B.face} fill={goldC} fillOpacity={0.22} stroke={TA.goldHi} strokeOpacity={0.7} strokeWidth={1} /> : null}
      {hl === "ears" ? <ACircle animatedProps={g} cx={B.earGlow[0]} cy={B.earGlow[1]} r={18} fill={`url(#${u}aura)`} /> : null}
      {!fem || hl === "ears" ? <Path d={B.ear} fill={TA.skinLo} opacity={0.55} /> : null}
      {hl === "ears" ? <Path d={B.ear} {...gold(1, 1.8)} /> : null}
      {!fem && !bare ? (
        <G>
          <Path d={B.kufi} fill={`url(#${u}cap)`} />
          <Path d={B.kufiBand} {...gold(1, 1.8)} />
        </G>
      ) : null}
      {hl === "heart" ? (
        <G>
          <ACircle animatedProps={g} cx={B.heart[0]} cy={B.heart[1]} r={26} fill={`url(#${u}aura)`} />
          <Path d={star8(B.heart[0], B.heart[1], 9)} fill={TA.gold} stroke={TA.goldInk} strokeWidth={0.6} />
        </G>
      ) : null}
      {hl === "mouth" ? (
        <G>
          <Path d={B.lips} {...gold(1, 2.4)} />
          <Ripple cx={B.mouth[0]} cy={B.mouth[1]} r={8} w={1.8} clock={clock} />
          <Turn cx={B.mouth[0]} cy={B.mouth[1]} r={12} clock={clock} />
        </G>
      ) : null}
      {hl === "nose" ? (
        <G>
          <Path d={B.nose} {...gold(1, 2.4)} />
          <Route d={B.noseRoute} kind="sweep" w={3} clock={clock} />
        </G>
      ) : null}
      {hl === "face" ? (
        <G clipPath="url(#wd-face)">
          <Stream d={B.faceFlow} w={2.4} clock={clock} />
        </G>
      ) : null}
      {hl === "face" ? <><Drop x={B.faceDrops[0][0]} y={B.faceDrops[0][1]} fall={40} s={1.3} clock={clock} /><Drop x={B.faceDrops[1][0]} y={B.faceDrops[1][1]} fall={36} delay={1.2} s={1.1} clock={clock} /></> : null}
      {hl === "head" && !fem && (tradition === "sunni"
        ? <Route d={B.headRoute} kind="sweep" w={3.4} clock={clock} />
        : <Route d={B.headRouteShia} kind="once" w={3.4} clock={clock} />)}
      {hl === "ears" ? (
        <G>
          <Route d={B.earRoutes[0]} kind="sweep" w={2.8} clock={clock} />
          <Route d={B.earRoutes[1]} kind="sweep" w={2.8} delay={1.6} clock={clock} />
        </G>
      ) : null}
    </G>
  );
}

function Hand({ x, mirror, clock }: { x: number; mirror?: boolean; clock: Clock }) {
  return (
    <G x={x} y={204} scaleX={mirror ? -1 : 1}>
      <Path d="M-18 0C-18 12 -16 24 -15 40H17C18 24 18 12 18 0Z" fill={`url(#${u}robe)`} />
      <Path d="M-18 1H18" {...gold(0.95, 1.6)} />
      <Path d={`${HAND}Z`} fill={`url(#${u}skin)`} />
      <Path d={HAND} {...rim} />
      <Path d="M-15 -28C-6 -34 6 -36 15 -30M18 -20C11 -26 9 -36 13 -44" {...crease} />
      <Path d="M-20 -7L20 -7" {...gold(0.9, 1.3)} strokeDasharray="2 3" />
      <Stream d="M-7 -66C-7 -48 -5 -30 -3 -12M4 -70C4 -50 5 -30 6 -12M14 -62C14 -46 13 -30 12 -16" w={1.6} clock={clock} />
    </G>
  );
}

function Arm({ tradition, left, clock }: { tradition: Tradition; left?: boolean; clock: Clock }) {
  const id = left ? "wd-arm-l" : "wd-arm";
  return (
    <G x={left ? 240 : 0} scaleX={left ? -1 : 1}>
      <Defs><ClipPath id={id}><Path d={`${ARM}Z`} /></ClipPath></Defs>
      <G y={6}>
        <Path d={`${ARM}Z`} fill={`url(#${u}skin)`} />
        <Rect x={0} y={80} width={56} height={70} fill={`url(#${u}robe)`} clipPath={`url(#${id})`} />
        <Path d="M56 92V140" {...gold(0.95, 1.6)} clipPath={`url(#${id})`} />
        <Rect x={64} y={80} width={180} height={70} fill={goldC} fillOpacity={0.16} clipPath={`url(#${id})`} />
        <Path d={ARM} {...rim} />
        <Path d="M214 105C222 106 229 107 235 109M184 114C194 113 204 113 214 112" {...crease} />
        <Path d="M64 84V148" {...gold(0.85, 1.3)} strokeDasharray="2 3" />
        <Circle cx={74} cy={134} r={3} fill={TA.goldPale} />
        {tradition === "shia" ? (
          <>
            <Stream d="M80 112C120 114 160 113 200 109C214 107 226 108 232 110M84 121C124 121 160 119 196 115" w={1.8} clock={clock} />
            <Drop x={233} y={120} fall={72} clock={clock} /><Drop x={226} y={120} fall={66} delay={1.3} s={0.8} clock={clock} />
          </>
        ) : (
          <>
            <Drop x={100} y={44} fall={50} clock={clock} /><Drop x={132} y={40} fall={58} delay={0.8} clock={clock} /><Drop x={164} y={46} fall={50} delay={1.5} clock={clock} /><Drop x={202} y={42} fall={50} delay={0.4} s={0.85} clock={clock} />
            <Drop x={118} y={134} fall={60} delay={1.1} s={0.8} clock={clock} /><Drop x={176} y={128} fall={64} delay={0.2} s={0.8} clock={clock} />
            <Stream d="M84 112C120 116 160 116 200 110" w={1.6} clock={clock} />
          </>
        )}
      </G>
    </G>
  );
}

function Foot({ tradition, clock }: { tradition: Tradition; clock: Clock }) {
  return (
    <G>
      <Defs><ClipPath id="wd-foot"><Path d={`${FOOT}Z`} /></ClipPath></Defs>
      <Ellipse cx={150} cy={218} rx={92} ry={7} fill={TA.water} fillOpacity={0.22} />
      <Ellipse cx={150} cy={218} rx={70} ry={4} fill="none" stroke={TA.waterHi} strokeOpacity={0.35} strokeWidth={0.8} />
      <Path d={`${FOOT}Z`} fill={`url(#${u}skin)`} />
      <Rect x={60} y={0} width={100} height={62} fill={`url(#${u}robe)`} clipPath="url(#wd-foot)" />
      <Path d="M84 62H134" {...gold(0.95, 1.6)} clipPath="url(#wd-foot)" />
      {tradition === "sunni" ? (
        <>
          <Rect x={60} y={148} width={180} height={70} fill={goldC} fillOpacity={0.16} clipPath="url(#wd-foot)" />
          <Path d="M84 148H140" {...gold(0.85, 1.3)} strokeDasharray="2 3" />
        </>
      ) : <Path d={INSTEP} {...gold(0.35, 10)} />}
      <Path d={FOOT} {...rim} />
      <Path d="M204 193C208 199 209 207 206 214M212 196C215 197 217 199 217 202" {...crease} />
      {tradition === "sunni" ? (
        <>
          <Drop x={152} y={100} fall={66} clock={clock} /><Drop x={176} y={104} fall={74} delay={0.9} clock={clock} /><Drop x={198} y={100} fall={84} delay={1.6} s={0.85} clock={clock} /><Drop x={118} y={92} fall={52} delay={0.5} s={0.85} clock={clock} />
          <Ripple cx={208} cy={214} r={6} color={waterC} clock={clock} />
        </>
      ) : <Route d={INSTEP} kind="once" w={3} clock={clock} />}
    </G>
  );
}

function Vessel({ pouring, clock }: { pouring: boolean; clock: Clock }) {
  const g = useGlow(clock);
  return (
    <G>
      {!pouring ? <ACircle animatedProps={g} cx={120} cy={140} r={78} fill={`url(#${u}aura)`} /> : null}
      <Path d="M157 132C172 126 180 110 186 90M155 152C175 146 186 122 195 92M186 90C188 86 193 87 195 92" fill="none" stroke={`url(#${u}metal)`} strokeWidth={3.4} strokeLinecap="round" />
      <Path d="M107 80C88 72 64 82 64 104C64 117 71 125 80 129M107 86C92 81 72 88 72 104C72 113 76 118 81 121" fill="none" stroke={`url(#${u}metal)`} strokeWidth={3} strokeLinecap="round" />
      <Path d={EWER} fill={`url(#${u}metal)`} />
      <Path d="M100 180L96 194H144L140 180Z" fill={`url(#${u}metal)`} />
      <Path d="M106 72C108 60 132 60 134 72Z" fill={`url(#${u}metal)`} />
      <Path d="M102 72H138" {...gold(1, 2)} />
      <Circle cx={120} cy={57} r={3.2} fill={TA.goldPale} />
      <Path d="M88 132C104 140 136 140 152 132C150 144 146 152 140 158C126 164 114 164 100 158C94 152 90 144 88 132Z" fill={TA.emerald} fillOpacity={0.85} />
      <Path d="M86 134C104 142 136 142 154 134" {...gold(0.95, 1.4)} />
      <Path d="M120 144l5 5-5 5-5-5z" fill={TA.goldPale} />
      <Path d="M96 112C98 100 104 92 110 88" fill="none" stroke={TA.glint} strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />
      <Path d={EWER} {...rim} />
      {pouring ? (
        <>
          <Path d="M166 214C166 226 218 226 218 214Z" fill={`url(#${u}face)`} />
          <Ellipse cx={192} cy={214} rx={26} ry={5} fill={TA.marble} />
          <Ellipse cx={192} cy={214} rx={26} ry={5} fill="none" stroke={TA.gold} strokeWidth={1} />
          <Ellipse cx={192} cy={214.4} rx={21} ry={3.4} fill={TA.water} fillOpacity={0.7} />
          <RippleE cx={192} cy={214.4} rx={12} ry={2.2} clock={clock} />
          <Stream d="M195 93C197 120 194 170 192 212" w={2.2} clock={clock} />
          <Drop x={194} y={100} fall={110} clock={clock} /><Drop x={194} y={100} fall={110} delay={0.8} clock={clock} /><Drop x={194} y={100} fall={110} delay={1.6} clock={clock} />
        </>
      ) : (
        <G>
          {[[62, 70, 0], [182, 58, 1.2], [56, 168, 2.1], [190, 176, 0.6], [150, 40, 2.8]].map(([x, y, d]) => <Twinkle key={`${x}-${y}`} x={x} y={y} d={d} clock={clock} />)}
        </G>
      )}
    </G>
  );
}

// the scene of a step (website Stage): the garden courtyard at dawn behind the close-up, motes of light, a soft fade
function Scene({ scene, tradition, label, kind }: { scene: Scene; tradition: Tradition; label: string; kind: FigureKind }) {
  const reduce = useReducedMotion();
  const clock = useSceneClock(reduce);
  const fade = useSharedValue(1);
  useEffect(() => { fade.value = reduce ? 1 : 0; if (!reduce) fade.value = withTiming(1, { duration: 600, easing: REasing.out(REasing.cubic) }); }, [scene, tradition, kind, reduce, fade]);
  const fadeSt = useAnimatedStyle(() => ({ opacity: fade.value, transform: [{ translateY: (1 - fade.value) * 6 }] }));
  const bust = scene === "heart" || scene === "mouth" || scene === "nose" || scene === "face" || scene === "head" || scene === "ears";
  return (
    <SceneBox label={label}>
      <Courtyard u={u} G={240} H={254} still={reduce} />
      <Motes still={reduce} />
      <Layer style={fadeSt}>
        <TsDefs u={u} />
        {bust ? <G origin={`${BUST_FIT.cx}, ${BUST_FIT.base}`} scale={BUST_FIT.s}><Bust hl={scene} tradition={tradition} clock={clock} kind={kind} /></G> : null}
        {scene === "hands" ? (
          <G>
            <Hand x={152} clock={clock} /><Hand x={88} mirror clock={clock} />
            <Drop x={72} y={46} fall={58} clock={clock} /><Drop x={90} y={40} fall={60} delay={1.1} s={0.85} clock={clock} /><Drop x={150} y={42} fall={62} delay={0.5} clock={clock} /><Drop x={168} y={48} fall={56} delay={1.7} s={0.85} clock={clock} />
          </G>
        ) : null}
        {scene === "arm" || scene === "armL" ? <Arm tradition={tradition} left={scene === "armL"} clock={clock} /> : null}
        {scene === "feet" ? <Foot tradition={tradition} clock={clock} /> : null}
        {scene === "vessel" || scene === "end" ? <Vessel pouring={scene === "vessel"} clock={clock} /> : null}
      </Layer>
    </SceneBox>
  );
}

// ---------- tap counter: a ring of segments, one per round ----------
function Counter({ times, sides, u, lang }: { times: number; sides?: boolean; u: Record<string, string>; lang: Lang }) {
  const total = times * (sides ? 2 : 1);
  const [n, setN] = useState(0);
  const done = n >= total;
  const onLeft = sides && n >= times;
  const inSide = done ? times : n - (onLeft ? times : 0);
  const gap = total > 1 ? 0.22 : 0;
  const seg = (Math.PI * 2) / total;
  // Arabic says the count in words (مرّتين), the others "2×"
  const label = lang === "ar" ? `${AR_TIMES[times] ?? times}${sides ? ` ${u.each}` : ""}` : `${times}×${sides ? ` ${u.each}` : ""}`;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 20 }}>
      <Pressable onPress={() => setN(done ? 0 : n + 1)} accessibilityRole="button" accessibilityLabel={`${done ? u.again : u.count}: ${n} / ${total}`}
        style={({ pressed }) => ({ width: 64, height: 64, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.95 : 1 }] })}>
        <Svg width={64} height={64} viewBox="0 0 64 64" style={{ position: "absolute" }}>
          {total === 1
            ? <Circle cx={32} cy={32} r={28} fill="none" strokeWidth={3} stroke={n >= 1 ? goldC : "rgba(255,255,255,0.18)"} />
            : Array.from({ length: total }, (_, k) => {
                const a0 = -Math.PI / 2 + k * seg + gap / 2;
                return <Path key={k} d={arc(28, a0, a0 + seg - gap)} fill="none" strokeWidth={3} strokeLinecap="round" stroke={k < n ? goldC : "rgba(255,255,255,0.18)"} />;
              })}
        </Svg>
        {done ? <Icon name="checkCircle" color={stage.gold} size={28} /> : (
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 20, lineHeight: 22, color: "#ffffff", fontVariant: ["tabular-nums"] }}>{inSide}</Text>
            {sides ? <Text style={{ fontFamily: FONT.semibold, fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{onLeft ? u.left : u.right}</Text> : null}
          </View>
        )}
      </Pressable>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 26, color: stage.gold }}>{label}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>{done ? u.again : u.tapHint}</Text>
      </View>
    </View>
  );
}

// a quiz tile shakes when it was the wrong one; the next one glows after two misses
function QuizTile({ label, at, wrongAt, hint, onPress }: { label: string; at: number; wrongAt: number; hint: boolean; onPress: () => void }) {
  const shake = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!wrongAt || reduce) return;
    shake.setValue(0);
    Animated.sequence([-4, 4, -4, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 110, easing: Easing.linear, useNativeDriver: true }))).start();
  }, [wrongAt, reduce, shake]);
  useEffect(() => {
    if (!hint || reduce) { pulse.setValue(hint ? 1 : 0); return; }
    const loop = Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }), Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true })]));
    loop.start();
    return () => loop.stop();
  }, [hint, reduce, pulse]);
  const picked = at >= 0;
  return (
    <Animated.View style={{ width: "48.5%", flexGrow: 1, transform: [{ translateX: shake }] }}>
      {hint ? <Animated.View pointerEvents="none" style={{ position: "absolute", left: -4, top: -4, right: -4, bottom: -4, borderRadius: R.sm + 4, borderWidth: 4, borderColor: "rgba(214,180,108,0.35)", opacity: pulse }} /> : null}
      <Pressable onPress={onPress} disabled={picked} accessibilityRole="button" accessibilityState={{ disabled: picked }} accessibilityLabel={picked ? `${at + 1}. ${label}` : label}
        style={({ pressed }) => ({ minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: R.sm, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8,
          borderColor: picked ? "rgba(214,180,108,0.6)" : hint ? stage.gold : wrongAt ? "rgba(253,230,138,0.5)" : pressed ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)",
          backgroundColor: picked ? "rgba(214,180,108,0.15)" : hint ? "rgba(214,180,108,0.07)" : "rgba(255,255,255,0.04)" })}>
        <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: picked ? stage.gold : "transparent", borderWidth: picked ? 0 : 1, borderColor: "rgba(255,255,255,0.2)" }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: picked ? stage.bg : "rgba(255,255,255,0.4)" }}>{picked ? at + 1 : "·"}</Text>
        </View>
        <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14.5, lineHeight: 19, color: "#ffffff" }}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// a few small gold stars rise behind the result (PracticeCelebrate)
const RISE: [number, number, number][] = [[8, 0, 1], [18, 0.5, 0.8], [27, 1.1, 1.2], [36, 0.2, 0.7], [46, 0.8, 1], [55, 1.4, 0.8], [63, 0.3, 1.3], [72, 1, 0.9], [81, 0.6, 1.1], [90, 1.2, 0.8], [14, 1.7, 0.9], [68, 1.8, 1]];
function Celebrate() {
  const reduce = useReducedMotion();
  const t = useClock(!reduce, 30);
  const [h, setH] = useState(300);
  if (reduce || t > 6) return null;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, overflow: "hidden" }} onLayout={(e) => setH(e.nativeEvent.layout.height)}>
      {RISE.map(([l, d, s]) => {
        const p = Math.min(1, Math.max(0, (t - d) / 3.6));
        if (p <= 0 || p >= 1) return null;
        return (
          <View key={l} style={{ position: "absolute", left: `${l}%`, bottom: -12 + p * h * 0.9, opacity: p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8, transform: [{ scale: s }, { rotate: `${p * 180}deg` }] }}>
            <Svg width={10} height={10} viewBox="0 0 12 12"><Path d="M6 .5l1.4 3.1L10.5 5 7.4 6.4 6 9.5 4.6 6.4 1.5 5l3.1-1.4z" fill="#e9cf99" /></Svg>
          </View>
        );
      })}
    </View>
  );
}

// Wudu trainer (website WuduTrainer.tsx): every step drawn and explained, obligatory and recommended marked, a tap
// counter for the rounds, and an order quiz at the end (progress tf:wudu, points "wudu"). Every site language the wudu
// data has, otherwise English (website: langOf(locale)).
export default function WuduTrainer() {
  const { lang, rtl } = useLang();
  const l: Lang = langOf(lang);
  const u = UI[l];
  const tx = (v?: L3) => (v ? v[l] : "");
  const [tradition, setTradition] = useState<Tradition>(() => trainerTradition());
  const steps = WUDU[tradition];
  const order = useMemo(() => steps.filter((s) => s.quiz), [steps]);
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const [list, setList] = useState(false);
  const [mode, setMode] = useState<"learn" | "quiz" | "done">("learn");
  const [pool, setPool] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [miss, setMiss] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrong, setWrong] = useState<{ id: string; t: number } | null>(null);
  const [passed, setPassed] = useState<WuduDone | null>(() => { const r = readJSON<WuduDone | null>(WUDU_KEY, null); return r?.done ? r : null; });
  const step: WuduStep = steps[Math.min(i, steps.length - 1)];
  const last = i >= steps.length - 1;

  useEffect(() => {
    if (!auto || mode !== "learn") return;
    if (last) { setAuto(false); return; }
    const len = step.text[l].length + (step.duas?.reduce((n, d) => n + d.ar.length, 0) ?? 0);
    const id = setTimeout(() => setI((n) => n + 1), Math.min(13000, 4500 + len * 32));
    return () => clearTimeout(id);
  }, [auto, i, last, step, l, mode]);

  const startQuiz = (t: Tradition = tradition) => {
    const ids = WUDU[t].filter((s) => s.quiz).map((s) => s.id);
    let mixed = shuffle(ids);
    while (mixed.join() === ids.join()) mixed = shuffle(ids);
    setPool(mixed); setPicked([]); setMiss(0); setStreak(0); setWrong(null); setAuto(false); setMode("quiz");
  };
  const chooseTradition = (t: Tradition) => {
    if (t === tradition) return;
    setTradition(t); setI(0); setAuto(false);
    if (mode !== "learn") startQuiz(t);
  };
  const pick = (id: string) => {
    if (mode !== "quiz" || picked.includes(id)) return;
    if (id === order[picked.length].id) {
      const next = [...picked, id];
      setPicked(next); setStreak(0); setWrong(null);
      if (next.length === order.length) {
        const rec: WuduDone = { done: true, at: Date.now(), tradition };
        writeJSON(WUDU_KEY, rec);
        award("wudu");
        setPassed(rec);
        setTimeout(() => setMode("done"), 650);
      }
    } else {
      setMiss((m) => m + 1); setStreak((s) => s + 1); setWrong({ id, t: Date.now() });
    }
  };
  const goStep = (k: number) => { setAuto(false); setMode("learn"); setI(k); };
  const kindLabel = (s: WuduStep) => (tradition === "sunni" ? u[s.kind] : u[s.kind === "fard" ? "wajib" : "mustahabb"]);
  const byId = (id: string) => steps.find((s) => s.id === id)!;
  const flip = rtl ? { transform: [{ scaleX: -1 }] } : null;
  const traditions = (["sunni", "shia"] as const).map((t) => ({ id: t, label: u[t] }));
  // the figure follows the learner's identity (a sister sees the headscarf); anyone can switch it
  const tu = trainerUi(l);
  const rawIdentity = useStored<unknown>(IDENTITY_KEY, null);
  const [kind, setKind] = useState<FigureKind>(() => trainerDefaults(rawIdentity).kind);
  useEffect(() => { setKind(trainerDefaults(rawIdentity).kind); }, [rawIdentity]);

  return (
    <StageBg rounded={28} hairlines={false} style={{ borderWidth: 1, borderColor: "rgba(214,180,108,0.25)" }}>
      {mode !== "learn" ? (
        <View style={{ padding: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.14)" }}>
          <Segmented options={traditions} value={tradition} onChange={chooseTradition} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {passed ? <Icon name="checkCircle" color={stage.gold} size={20} /> : null}
            <GlassPill title={u.back} onPress={() => goStep(i)} height={40} icon={<View style={flip}><Glyph name="prev" size={14} /></View>} />
          </View>
        </View>
      ) : null}

      {mode === "learn" ? (
        <>
          <View>
            <Scene scene={step.scene} tradition={tradition} label={tx(step.title)} kind={kind} />
            <View style={{ position: "absolute", left: 12, right: 12, top: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 8, rowGap: 8 }}>
              <Segmented options={traditions} value={tradition} onChange={chooseTradition} />
              <View style={{ marginStart: "auto" }}><GlassPill title={u.quiz} onPress={() => startQuiz()} height={42} icon={passed ? <Icon name="checkCircle" color={stage.gold} size={16} /> : undefined} /></View>
            </View>
            <View style={{ position: "absolute", left: 0, right: 0, bottom: 12, alignItems: "center" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Glass dark radius={999} style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8 }}>
                {steps.map((s, k) => k === i
                  ? <LinearGradient key={s.id} colors={["#f2dfaa", "#c6a65e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 26, height: 6, borderRadius: 3 }} />
                  : <View key={s.id} style={{ width: 14, height: 6, borderRadius: 3, backgroundColor: k < i ? stage.gold : "rgba(255,255,255,0.2)" }} />)}
              </Glass>
            </View>
          </View>

          {/* the controls, part of the card right under the picture (they never cover any text), then the figure */}
          <View style={{ paddingHorizontal: 12, paddingTop: 12, gap: 10 }}>
            <Glass dark radius={30} style={{ padding: 8 }}>
              <View style={{ height: 4, borderRadius: 2, marginHorizontal: 12, marginTop: 2, marginBottom: 8, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: steps.length, now: i + 1 }}>
                <LinearGradient colors={["#c6a65e", "#f2dfaa"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 4, width: `${((i + 1) / steps.length) * 100}%`, borderRadius: 2, alignSelf: "flex-start" }} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <GlassRound label={u.prev} disabled={i === 0} onPress={() => { setAuto(false); setI((n) => Math.max(0, n - 1)); }}><View style={flip}><Glyph name="prev" /></View></GlassRound>
                <Pressable onPress={() => (last ? startQuiz() : setAuto((a) => !a))} accessibilityRole="button" style={({ pressed }) => ({ flex: 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
                  <Lens style={{ height: 48, flexDirection: "row", gap: 8, paddingHorizontal: 12 }}>
                    {!last ? <Glyph name={auto ? "pause" : "play"} size={16} color={goldButton.text} /> : null}
                    <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>{last ? u.toQuiz : auto ? u.pause : u.play}</Text>
                  </Lens>
                </Pressable>
                <GlassRound label={u.next} disabled={last} onPress={() => { setAuto(false); setI((n) => Math.min(steps.length - 1, n + 1)); }}><View style={flip}><Glyph name="next" /></View></GlassRound>
              </View>
            </Glass>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{tu.figure}</Text>
              <Segmented options={[{ id: "m" as FigureKind, label: tu.man }, { id: "f" as FigureKind, label: tu.woman }]} value={kind} onChange={setKind} />
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 20 }}>
            <View key={`${tradition}-${i}`}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 12, rowGap: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Svg width={10} height={10} viewBox="0 0 12 12"><Path d="M6 .5l1.4 3.1L10.5 5 7.4 6.4 6 9.5 4.6 6.4 1.5 5l3.1-1.4z" fill={stage.gold} /></Svg>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: rtl ? 0 : 1.9, color: stage.gold }}>{ltr(`${i + 1} / ${steps.length}`)}</Text>
                </View>
                <Glass radius={999} style={{ paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: step.kind === "fard" ? stage.gold : "rgba(255,255,255,0.75)" }}>{kindLabel(step)}</Text>
                </Glass>
              </View>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 35, letterSpacing: -0.7, color: "#eef0f3", marginTop: 8 }}>{tx(step.title)}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: "rgba(255,255,255,0.85)", marginTop: 12 }}>{tx(step.text)}</Text>
              {step.times ? <Glass radius={22} style={{ marginTop: 18, paddingHorizontal: 16, paddingBottom: 16 }}><Counter key={`${tradition}-${step.id}`} times={step.times} sides={step.sides} u={u} lang={l} /></Glass> : null}
              {step.duas?.map((d) => (
                <Glass key={d.ar} radius={22} style={{ marginTop: 18, paddingHorizontal: 16, paddingVertical: 12 }}>
                  <Text style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 52, color: "#ffffff", writingDirection: "rtl", textAlign: AR_RIGHT }}>{d.ar}</Text>
                  {l !== "ar" ? <Text style={{ fontFamily: FONT.italic, fontSize: 15, lineHeight: 24, color: stage.gold, marginTop: 8 }}>{rtl ? ltr(d.translit) : d.translit}</Text> : null}
                  {l !== "ar" ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: "rgba(255,255,255,0.8)", marginTop: 8 }}><Text style={{ fontFamily: FONT.semibold, color: "#ffffff" }}>{u.meaning}: </Text>{d.meaning[l]}</Text> : null}
                  {d.src ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{tx(d.src)}</Text> : null}
                </Glass>
              ))}
              {step.note ? (
                <Glass radius={18} style={{ marginTop: 16, padding: 14 }}>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: "rgba(255,255,255,0.8)" }}>{tx(step.note)}</Text>
                </Glass>
              ) : null}
            </View>
          </View>
        </>
      ) : null}

      {mode === "quiz" ? (
        <View style={{ padding: 20 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: rtl ? 0 : 1.9, textTransform: "uppercase", color: stage.gold }}>{u.quiz} · {ltr(`${picked.length} / ${order.length}`)}</Text>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 35, letterSpacing: -0.7, color: "#eef0f3", marginTop: 8 }}>{u.quizTitle}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: "rgba(255,255,255,0.75)", marginTop: 8 }}>{u.quizLead}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
            {pool.map((id) => (
              <QuizTile key={id} label={tx(byId(id).title)} at={picked.indexOf(id)} wrongAt={wrong?.id === id ? wrong.t : 0}
                hint={streak >= 2 && order[picked.length]?.id === id} onPress={() => pick(id)} />
            ))}
          </View>
          <Text accessibilityLiveRegion="polite" style={{ minHeight: 24, fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 16 }}>
            {wrong ? (streak >= 2 ? u.hint : u.wrong) : picked.length > 0 ? u.good : ""}
          </Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 19, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>{tx(RULE[tradition])}</Text>
        </View>
      ) : null}

      {mode === "done" ? (
        <View style={{ paddingHorizontal: 20, paddingVertical: 48, alignItems: "center", overflow: "hidden" }}>
          <Celebrate />
          <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 52, lineHeight: 80, color: stage.gold, textAlign: "center" }}>{DONE_AR_TEXT}</Text>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: "#eef0f3", textAlign: "center", marginTop: 16, maxWidth: 520 }}>{u.doneTitle}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: "rgba(255,255,255,0.75)", textAlign: "center", marginTop: 12, maxWidth: 520 }}>{u.doneText} {slips(miss, l, u)}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 28 }}>
            <GlassPill gold title={`${u.toSalah} ${rtl ? "←" : "→"}`} onPress={() => go("/salah")} />
            <GlassPill title={u.toVerse} onPress={() => go("/surah/5?v=6")} />
            <GlassPill title={u.practise} onPress={() => startQuiz()} />
          </View>
        </View>
      ) : null}

      <View style={{ padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.14)" }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <Pressable onPress={() => setList((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: list }}>
            <Glass radius={999} style={{ minHeight: 40, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16 }}>
              <View style={{ transform: [{ rotate: list ? "90deg" : rtl ? "180deg" : "0deg" }] }}><Glyph name="chevron" size={14} color="rgba(255,255,255,0.85)" /></View>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{u.steps}</Text>
            </Glass>
          </Pressable>
          {i > 0 || mode !== "learn" ? (
            <Pressable onPress={() => goStep(0)} accessibilityRole="button" style={{ minHeight: 40, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8 }}>
              <Glyph name="restart" size={14} color="rgba(255,255,255,0.65)" />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{u.restart}</Text>
            </Pressable>
          ) : null}
        </View>
        {list ? (
          <Glass radius={22} style={{ gap: 2, marginTop: 12, padding: 6 }}>
            {steps.map((s, k) => (
              <Pressable key={s.id} onPress={() => goStep(k)} accessibilityRole="button" accessibilityState={{ selected: mode === "learn" && k === i }}
                style={{ minHeight: 40, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: mode === "learn" && k === i ? "rgba(214,180,108,0.2)" : "transparent" }}>
                <Text style={{ flex: 1, fontFamily: mode === "learn" && k === i ? FONT.bold : FONT.regular, fontSize: 14, color: mode === "learn" && k === i ? "#ffffff" : "rgba(255,255,255,0.75)" }}>{k + 1}. {tx(s.title)}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: s.kind === "fard" ? stage.gold : "rgba(255,255,255,0.4)" }}>{kindLabel(s).split(" · ")[0]}</Text>
              </Pressable>
            ))}
          </Glass>
        ) : null}
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 19, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>{tx(RULE[tradition])}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 19, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>{u.note}</Text>
      </View>
    </StageBg>
  );
}
