// DESIGN FROZEN (owner approved, tag garten-design-v1) — do not change visuals; only bug fixes.
import { memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { AccessibilityInfo, Image, Pressable, StyleSheet, View, type ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient as SvgLinear, Path, Pattern, Polygon, RadialGradient, Rect, Stop } from "react-native-svg";
import Animated, { Easing, cancelAnimation, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming, type SharedValue } from "react-native-reanimated";
import { CITIES, dayFor, type Prayer, type Spot } from "@/web/prayer";
import { useStored, writeJSON } from "@/lib/store";
import { spotNow } from "@/features/feed/Extras";
import { stage as stageC } from "@/lib/theme";
import { tick } from "@/features/feed/haptics";

// The living landscape behind the garden and the onboarding: painted layers (assets/garden, made by
// scripts/gen-garden-art.mjs) of distant mountains and dunes in mist, a horizon of domes and minarets, cypress and
// palm groves, an Alhambra arcade and a Mughal pavilion. The sky follows the prayer times with smooth gradients
// (night after Isha, first light at Fajr, sunrise, day, golden light before Maghrib, dusk); day and night versions
// of every layer cross-fade. The landscape grows with the tree: flowers, lanterns, the arcade, fountains, the
// pavilion and its lights unlock stage by stage. Few particles, memoised layers, transforms and opacity only on the
// UI thread; Reduce Motion shows a still.

/* eslint-disable @typescript-eslint/no-require-imports */
const ART = {
  far: [require("../../../assets/garden/far-day.webp"), require("../../../assets/garden/far-night.webp")],
  city: [require("../../../assets/garden/city-day.webp"), require("../../../assets/garden/city-night.webp")],
  mid: [require("../../../assets/garden/mid-day.webp"), require("../../../assets/garden/mid-night.webp")],
  arcade: [require("../../../assets/garden/arcade-day.webp"), require("../../../assets/garden/arcade-night.webp")],
  iwan: [require("../../../assets/garden/iwan-day.webp"), require("../../../assets/garden/iwan-night.webp")],
  frond: require("../../../assets/garden/frond.webp"),
  mist: require("../../../assets/garden/mist.webp"),
} as const;
/* eslint-enable @typescript-eslint/no-require-imports */
const ASPECT = { far: 420 / 1200, city: 360 / 1600, mid: 560 / 1800, arcade: 300 / 1800, iwan: 560 / 700, frond: 820 / 520, mist: 220 / 1200 };

/** what unlocks with the stage of the oldest tree */
export const UNLOCK = { flowers: 3, lanterns: 4, arcade: 5, fountains: 6, iwan: 8, archLights: 10, aura: 12 } as const;

// ---------- the sky by the prayer times ----------
/** the moon: position in the sky (0 … 1), phase (0 new, 0.5 full), lit fraction */
export type Moon = { x: number; y: number; phase: number; illum: number };
export type Sky = { colors: [string, string, string]; night: number; warm: number; sun: { x: number; y: number } | null; moon: Moon | null; next?: { prayer: Prayer; at: number } };
type Key = { t: number; c: [string, string, string]; night: number; warm: number };
type C3 = [string, string, string];
// colours of the sky through the day: night, astronomical (Fajr), nautical and civil twilight, sunrise, morning,
// noon, Asr, golden hour, sunset, then the twilights again until Isha. Emerald, jade and gold only.
const K = {
  night: { c: ["#020c09", "#06211a", "#0f382d"] as C3, night: 1, warm: 0 },
  astro: { c: ["#03110d", "#0a2a21", "#21423a"] as C3, night: 0.92, warm: 0.02 },
  nautical: { c: ["#072019", "#1c4337", "#566650"] as C3, night: 0.75, warm: 0.12 },
  civil: { c: ["#0e3328", "#5a6a4c", "#cfae76"] as C3, night: 0.5, warm: 0.42 },
  predawn: { c: ["#041a14", "#174235", "#4f6248"] as C3, night: 0.8, warm: 0.1 },
  sunrise: { c: ["#123f35", "#8c845a", "#f0d49c"] as C3, night: 0.3, warm: 0.6 },
  morning: { c: ["#2a6b58", "#97c2aa", "#f0ecda"] as C3, night: 0, warm: 0.15 },
  noon: { c: ["#256a56", "#9cc9b2", "#f3f1e2"] as C3, night: 0, warm: 0 },
  asr: { c: ["#2b6650", "#a9c4a0", "#f3e6c2"] as C3, night: 0, warm: 0.2 },
  golden: { c: ["#173a2e", "#b08a45", "#f3d48e"] as C3, night: 0.12, warm: 0.85 },
  sunset: { c: ["#0f2c25", "#8f5f36", "#e2ac62"] as C3, night: 0.4, warm: 1 },
  dusk: { c: ["#0b261f", "#5b4a35", "#b08050"] as C3, night: 0.58, warm: 0.55 },
  nauticalDusk: { c: ["#061914", "#24453a", "#5d6040"] as C3, night: 0.8, warm: 0.25 },
};
const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: string, b: string, k: number) => { const x = hex(a), y = hex(b); return `#${x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join("")}`; };

// ---------- where the sky is: Makkah (default) or the learner's own place ----------
export const SKY_PLACE_KEY = "qmc.garden.sky";
export type SkyPlace = "mecca" | "local";
const MECCA: Spot = CITIES.find((c) => c.id === "makkah") ?? CITIES[0];
export const skySpot = (place: SkyPlace): Spot => (place === "local" ? spotNow() : MECCA);
export const useSkyPlace = (): SkyPlace => (useStored<SkyPlace>(SKY_PLACE_KEY, "mecca") === "local" ? "local" : "mecca");
export const setSkyPlace = (p: SkyPlace) => writeJSON(SKY_PLACE_KEY, p, true);

// ---------- the moon ----------
const SYNODIC = 29.530588853, NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
/** the moon's phase now: 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter */
export function moonPhase(now = new Date()): number { const d = (now.getTime() - NEW_MOON) / 86400000; return (((d % SYNODIC) + SYNODIC) % SYNODIC) / SYNODIC; }
/** where the moon stands: it crosses the meridian about phase × 24 h after the sun (rises ~50 min later each day) */
function moonAt(ms: number, noon: number): Moon | null {
  const phase = moonPhase(new Date(ms)), illum = (1 - Math.cos(phase * Math.PI * 2)) / 2;
  if (illum < 0.015) return null; // the new moon cannot be seen
  let h = ((ms - (noon + phase * 86400000)) / 3600000) % 24;
  if (h > 12) h -= 24; if (h < -12) h += 24;
  if (Math.abs(h) > 6.2) return null; // below the horizon
  const k = h / 6.2;
  return { x: 0.5 + k * 0.42, y: 0.66 - Math.cos(k * Math.PI / 2) * 0.5, phase, illum };
}

export function skyAt(now = new Date(), spot: Spot = MECCA): Sky {
  let times: Record<string, number>, next: Sky["next"];
  try {
    const d = dayFor(spot, now);
    times = Object.fromEntries(Object.entries(d.times).map(([k, v]) => [k, (v as Date).getTime()]));
    next = { prayer: d.next, at: d.nextAt.getTime() };
  } catch {
    const base = new Date(now); base.setHours(0, 0, 0, 0); const h = (n: number) => base.getTime() + n * 3600000;
    times = { fajr: h(5), sunrise: h(6.5), dhuhr: h(12.5), asr: h(15.5), maghrib: h(19), isha: h(20.5) };
  }
  const M = 60000, sr = times.sunrise, ss = times.maghrib;
  const keys: Key[] = [
    { t: times.fajr - 25 * M, ...K.night }, { t: times.fajr, ...K.astro },
    { t: Math.max(times.fajr + 5 * M, sr - 48 * M), ...K.nautical }, { t: Math.max(times.fajr + 10 * M, sr - 24 * M), ...K.civil },
    { t: sr, ...K.sunrise }, { t: sr + 60 * M, ...K.morning }, { t: times.dhuhr, ...K.noon }, { t: times.asr, ...K.asr },
    { t: ss - 45 * M, ...K.golden }, { t: ss, ...K.sunset },
    { t: Math.min(times.isha - 10 * M, ss + 24 * M), ...K.dusk }, { t: Math.min(times.isha - 5 * M, ss + 48 * M), ...K.nauticalDusk }, { t: times.isha, ...K.night },
  ].sort((x, y) => x.t - y.t);
  const ms = now.getTime();
  let c = K.night.c, night = 1, warm = 0;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (ms >= a.t && ms < b.t) {
      const k = (ms - a.t) / Math.max(1, b.t - a.t);
      c = [mix(a.c[0], b.c[0], k), mix(a.c[1], b.c[1], k), mix(a.c[2], b.c[2], k)];
      night = a.night + (b.night - a.night) * k; warm = a.warm + (b.warm - a.warm) * k;
      break;
    }
  }
  // the sun follows its real arc from sunrise to Maghrib (east on the left)
  const dayK = (ms - sr) / Math.max(1, ss - sr);
  const sun = dayK > -0.04 && dayK < 1.04 ? { x: 0.1 + dayK * 0.8, y: 0.62 - Math.sin(Math.max(0, Math.min(1, dayK)) * Math.PI) * 0.5 } : null;
  return { colors: c, night, warm, sun, moon: moonAt(ms, times.dhuhr), next };
}
const fixedMoon = (x: number, y: number): Moon | null => { const phase = moonPhase(), illum = (1 - Math.cos(phase * Math.PI * 2)) / 2; return illum < 0.015 ? null : { x, y, phase, illum }; };
/** a few fixed skies for the onboarding journey, share cards and previews (the moon in today's real phase) */
export const SKIES: Record<"night" | "predawn" | "dawn" | "day" | "golden", Sky> = {
  night: { colors: K.night.c, night: 1, warm: 0, sun: null, moon: fixedMoon(0.64, 0.3) },
  predawn: { colors: K.predawn.c, night: 0.8, warm: 0.1, sun: null, moon: fixedMoon(0.78, 0.4) },
  dawn: { colors: K.sunrise.c, night: 0.3, warm: 0.6, sun: { x: 0.24, y: 0.6 }, moon: null },
  day: { colors: K.morning.c, night: 0, warm: 0.15, sun: { x: 0.72, y: 0.16 }, moon: null },
  golden: { colors: K.golden.c, night: 0.12, warm: 0.85, sun: { x: 0.8, y: 0.48 }, moon: null },
};
/** the sky now over the chosen place, refreshed every minute */
export function useSky(place: SkyPlace = "mecca"): Sky {
  const [s, setS] = useState(() => skyAt(new Date(), skySpot(place)));
  useEffect(() => { setS(skyAt(new Date(), skySpot(place))); const id = setInterval(() => setS(skyAt(new Date(), skySpot(place))), 60000); return () => clearInterval(id); }, [place]);
  return s;
}
/** readable ink on top of a sky */
export const inkFor = (_s: Sky) => "#f6ead0";

/** an animated number that follows a prop smoothly (or jumps under Reduce Motion) */
function useFollow(v: number, still: boolean, ms = 1400): SharedValue<number> {
  const sv = useSharedValue(v);
  useEffect(() => { sv.value = still ? v : withTiming(v, { duration: ms, easing: Easing.inOut(Easing.quad) }); }, [v, still, ms, sv]);
  return sv;
}

// ---------- sky, sun, moon, stars, rays ----------
export const SkyFill = memo(function SkyFill({ sky }: { sky: Sky }) {
  return <LinearGradient colors={sky.colors} locations={[0, 0.62, 1]} style={StyleSheet.absoluteFill} />;
});

/** a deterministic star field: many faint stars, fewer bright ones (like the real sky), a few with a warm tint */
function starField(width: number, height: number) {
  let x = 2463534242;
  const r = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return (x % 100000) / 100000; };
  return Array.from({ length: 110 }, (_, i) => {
    const m = Math.pow(r(), 3.2); // magnitude: most stars faint
    return { x: r() * width, y: Math.pow(r(), 1.25) * height * 0.92, r: 0.45 + m * 1.6, o: 0.35 + m * 0.65, g: i % 3, warm: r() < 0.12 };
  });
}
export const Heavens = memo(function Heavens({ sky, width, height, still, noMoon }: { sky: Sky; width: number; height: number; still: boolean; noMoon?: boolean }) {
  const stars = useMemo(() => starField(width, height), [width, height]);
  const nightO = Math.max(0, (sky.night - 0.35) / 0.65);
  // the Milky Way: only on dark, moon-poor nights
  const milky = nightO * (1 - (sky.moon?.illum ?? 0) * 0.85) * 0.9;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {milky > 0.08 ? <MilkyWay width={width} height={height} o={milky} /> : null}
      {nightO > 0.02 ? [0, 1, 2].map((g) => (
        <Twinkle key={g} group={g} still={still} base={nightO}>
          <Svg width={width} height={height}>
            {stars.filter((st) => st.g === g).map((st, i) => <Circle key={i} cx={st.x} cy={st.y} r={st.r} fill={st.warm ? "#ffe7b8" : "#fbfbf4"} opacity={st.o} />)}
          </Svg>
        </Twinkle>
      )) : null}
      {nightO > 0.3 ? <Planet x={width * 0.18} y={height * 0.2} o={nightO} /> : null}
      {sky.moon && !noMoon ? <MoonDisc moon={sky.moon} x={sky.moon.x * width} y={Math.max(120, sky.moon.y * height)} o={Math.max(0.45, nightO)} /> : null}
      {sky.sun ? <Sun x={sky.sun.x * width} y={sky.sun.y * height} warm={sky.warm} width={width} height={height} still={still} /> : null}
    </View>
  );
});
/** a faint band of the galaxy across the sky */
function MilkyWay({ width, height, o }: { width: number; height: number; o: number }) {
  const w = Math.hypot(width, height);
  return (
    <Svg width={width} height={height} style={{ position: "absolute", opacity: o }}>
      <Defs>
        <RadialGradient id="mw" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#e9f0e4" stopOpacity={0.16} /><Stop offset="0.6" stopColor="#d9e6d6" stopOpacity={0.06} /><Stop offset="1" stopColor="#d9e6d6" stopOpacity={0} /></RadialGradient>
        <RadialGradient id="mw2" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#f6e7c6" stopOpacity={0.12} /><Stop offset="1" stopColor="#f6e7c6" stopOpacity={0} /></RadialGradient>
      </Defs>
      <G transform={`rotate(-28 ${width / 2} ${height / 2})`}>
        <Ellipse cx={width / 2} cy={height * 0.42} rx={w * 0.62} ry={height * 0.16} fill="url(#mw)" />
        <Ellipse cx={width * 0.42} cy={height * 0.44} rx={w * 0.22} ry={height * 0.07} fill="url(#mw2)" />
        <Ellipse cx={width * 0.62} cy={height * 0.4} rx={w * 0.16} ry={height * 0.05} fill="url(#mw2)" />
      </G>
    </Svg>
  );
}
/** a bright planet (steady light, no twinkle) */
function Planet({ x, y, o }: { x: number; y: number; o: number }) {
  return (
    <Svg width={30} height={30} style={{ position: "absolute", left: x - 15, top: y - 15, opacity: o }}>
      <Defs><RadialGradient id="pl" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#fff4d6" stopOpacity={0.7} /><Stop offset="1" stopColor="#fff4d6" stopOpacity={0} /></RadialGradient></Defs>
      <Circle cx={15} cy={15} r={15} fill="url(#pl)" /><Circle cx={15} cy={15} r={2.1} fill="#fffaf0" />
    </Svg>
  );
}
function Twinkle({ group, still, base, children }: { group: number; still: boolean; base: number; children: ReactNode }) {
  const v = useSharedValue(1);
  useEffect(() => {
    if (still) return;
    v.value = withDelay(group * 900, withRepeat(withSequence(withTiming(0.55, { duration: 1800 + group * 500, easing: Easing.inOut(Easing.sin) }), withTiming(1, { duration: 1800 + group * 500, easing: Easing.inOut(Easing.sin) })), -1, false));
    return () => cancelAnimation(v);
  }, [still, group, v]);
  const st = useAnimatedStyle(() => ({ opacity: v.value * base }));
  return <Animated.View style={[StyleSheet.absoluteFill, st]}>{children}</Animated.View>;
}
/** the moon in its real phase: lit limb plus terminator, the dark part faintly visible (earthshine), tilted like
 *  the crescent seen in Arabia */
function MoonDisc({ moon, x, y, o }: { moon: Moon; x: number; y: number; o: number }) {
  const R = 24, c = 70, k = Math.cos(moon.phase * Math.PI * 2), rx = Math.abs(k) * R;
  const waxing = moon.phase < 0.5;
  // lit half (right while waxing), closed by the terminator ellipse
  const d = `M${c} ${c - R} A${R} ${R} 0 0 1 ${c} ${c + R} A${rx.toFixed(2)} ${R} 0 0 ${k > 0 ? 0 : 1} ${c} ${c - R} Z`;
  return (
    <Svg width={140} height={140} style={{ position: "absolute", left: x - 70, top: y - 70, opacity: o }}>
      <Defs><RadialGradient id="mg" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#f3e2b6" stopOpacity={0.18 + moon.illum * 0.3} /><Stop offset="1" stopColor="#f3e2b6" stopOpacity={0} /></RadialGradient></Defs>
      <Circle cx={c} cy={c} r={70} fill="url(#mg)" />
      <G transform={`rotate(${waxing ? -35 : 35} ${c} ${c})${waxing ? "" : ` translate(${2 * c} 0) scale(-1 1)`}`}>
        <Circle cx={c} cy={c} r={R} fill="#f6e7bf" opacity={0.1} />
        <Path d={d} fill="#f6e7bf" />
        {moon.illum > 0.85 ? <><Circle cx={c - 6} cy={c - 5} r={4} fill="#e2cf9e" opacity={0.5} /><Circle cx={c + 7} cy={c + 6} r={3} fill="#e2cf9e" opacity={0.45} /><Circle cx={c + 2} cy={c - 10} r={2} fill="#e2cf9e" opacity={0.4} /></> : null}
      </G>
    </Svg>
  );
}
function Sun({ x, y, warm, width, height, still }: { x: number; y: number; warm: number; width: number; height: number; still: boolean }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    pulse.value = withRepeat(withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(pulse);
  }, [still, pulse]);
  const rays = useAnimatedStyle(() => ({ opacity: 0.55 + pulse.value * 0.35, transform: [{ rotate: `${-3 + pulse.value * 6}deg` }] }));
  const core = mix("#fff6dc", "#ffd27a", warm), R = Math.max(width, height) * 1.1;
  return (
    <>
      <Svg width={360} height={360} style={{ position: "absolute", left: x - 180, top: y - 180 }}>
        <Defs><RadialGradient id="sg" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor={core} stopOpacity={0.95} /><Stop offset="0.12" stopColor={core} stopOpacity={0.75} /><Stop offset="0.4" stopColor="#ffe9b0" stopOpacity={0.22} /><Stop offset="1" stopColor="#ffe9b0" stopOpacity={0} /></RadialGradient></Defs>
        <Circle cx={180} cy={180} r={180} fill="url(#sg)" />
        <Circle cx={180} cy={180} r={22} fill={core} opacity={0.95} />
      </Svg>
      <Animated.View style={[{ position: "absolute", left: x - R, top: y - R, width: R * 2, height: R * 2 }, rays]}>
        <Svg width={R * 2} height={R * 2}>
          <Defs><RadialGradient id="rg" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#fff2cc" stopOpacity={0.32} /><Stop offset="0.7" stopColor="#fff2cc" stopOpacity={0} /></RadialGradient></Defs>
          {[0.6, 1.05, 1.45, 1.9, 2.4].map((a, i) => { const s = 0.05 + (i % 2) * 0.03; return <Polygon key={i} points={`${R},${R} ${R + Math.cos(a - s) * R},${R + Math.sin(a - s) * R} ${R + Math.cos(a + s) * R},${R + Math.sin(a + s) * R}`} fill="url(#rg)" />; })}
        </Svg>
      </Animated.View>
    </>
  );
}

// ---------- the painted layers ----------
type Lay = { src: readonly [ImageSourcePropType, ImageSourcePropType]; w: number; h: number; left: number; top: number };
/** one painted layer: day and night versions cross-faded, optionally revealed (onboarding) */
function Painted({ l, night, reveal, from = 0, to = 1 }: { l: Lay; night: SharedValue<number>; reveal: SharedValue<number>; from?: number; to?: number }) {
  const st = useAnimatedStyle(() => {
    const k = interpolate(reveal.value, [from, to], [0, 1], "clamp");
    return { opacity: k, transform: [{ translateY: (1 - k) * 26 }] };
  });
  const nt = useAnimatedStyle(() => ({ opacity: night.value }));
  const box = { position: "absolute" as const, left: l.left, top: l.top, width: l.w, height: l.h };
  return (
    <Animated.View pointerEvents="none" style={[box, st]}>
      <Image source={l.src[0]} style={{ width: l.w, height: l.h }} resizeMode="stretch" fadeDuration={0} />
      <Animated.Image source={l.src[1]} style={[{ position: "absolute", width: l.w, height: l.h }, nt]} resizeMode="stretch" fadeDuration={0} />
    </Animated.View>
  );
}
function Mist({ width, top, h, speed, night, still, o }: { width: number; top: number; h: number; speed: number; night: SharedValue<number>; still: boolean; o: number }) {
  const x = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    x.value = withRepeat(withTiming(1, { duration: speed, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(x);
  }, [still, speed, x]);
  const w = width * 1.2;
  const st = useAnimatedStyle(() => ({ opacity: o * (1 - night.value * 0.55), transform: [{ translateX: -x.value * w }] }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: "absolute", left: 0, top, width: w * 2, height: h, flexDirection: "row" }, st]}>
      <Image source={ART.mist} style={{ width: w, height: h }} resizeMode="stretch" fadeDuration={0} />
      <Image source={ART.mist} style={{ width: w, height: h }} resizeMode="stretch" fadeDuration={0} />
    </Animated.View>
  );
}

export type PanoramaProps = {
  width: number; height: number;
  /** y of the ground line (the top of the terrace), from the top */
  ground: number;
  sky: Sky;
  /** stage of the garden (unlocks); 12 shows everything */
  level?: number;
  /** 0 … 1: how much of the landscape is revealed (onboarding); 1 by default */
  reveal?: SharedValue<number>;
  /** parallax pan (garden) */
  px?: SharedValue<number>;
  still?: boolean;
  /** draw sky and heavens (default) */
  withSky?: boolean;
  /** width of the painted layers relative to the view (1.4 … 2) */
  scale?: number;
};

/** sky + heavens + far mountains + mist + horizon city + groves + arcade + pavilion, in parallax */
export const Panorama = memo(function Panorama({ width, height, ground, sky, level = 12, reveal, px, still = false, withSky = true, scale = 1.4 }: PanoramaProps) {
  const night = useFollow(sky.night, still);
  const one = useSharedValue(1);
  const rv = reveal ?? one;
  const zero = useSharedValue(0);
  const pan = px ?? zero;
  const PW = width * scale, left = (width - PW) / 2;
  const L = useMemo(() => {
    const midH = PW * ASPECT.mid, cityH = PW * ASPECT.city, farH = PW * ASPECT.far;
    const cityBase = ground - PW * 0.06, farBase = cityBase - PW * 0.03;
    return {
      far: { src: ART.far, w: PW, h: farH, left, top: farBase - farH * (330 / 420) },
      city: { src: ART.city, w: PW, h: cityH, left, top: cityBase - cityH * (300 / 360) },
      mid: { src: ART.mid, w: PW, h: midH, left, top: ground - midH * (520 / 560) + 2 },
      arcade: { src: ART.arcade, w: PW, h: PW * ASPECT.arcade, left, top: ground - PW * ASPECT.arcade - PW * 0.012 },
      iwan: { src: ART.iwan, w: PW * (700 / 1800), h: PW * (700 / 1800) * ASPECT.iwan, left: left + PW * 0.5 - PW * (350 / 1800), top: ground - PW * (700 / 1800) * ASPECT.iwan - PW * 0.012 },
      farMist: { top: farBase - PW * 0.11, h: PW * 0.2 },
      cityMist: { top: cityBase - PW * 0.06, h: PW * 0.16 },
    };
  }, [PW, left, ground]);
  const p1 = useAnimatedStyle(() => ({ transform: [{ translateX: pan.value * 0.12 }] }));
  const p2 = useAnimatedStyle(() => ({ transform: [{ translateX: pan.value * 0.28 }] }));
  const p3 = useAnimatedStyle(() => ({ transform: [{ translateX: pan.value * 0.55 }] }));
  const warmSt = useAnimatedStyle(() => ({ opacity: interpolate(rv.value, [0.4, 1], [0, 1], "clamp") * sky.warm * 0.24 }));
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}>
      {withSky ? <><SkyFill sky={sky} /><Heavens sky={sky} width={width} height={ground} still={still} /></> : null}
      <Animated.View style={[StyleSheet.absoluteFill, p1]}>
        <Painted l={L.far} night={night} reveal={rv} from={0} to={0.25} />
        <Mist width={width} top={L.farMist.top} h={L.farMist.h} speed={90000} night={night} still={still} o={0.55} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, p2]}>
        <Painted l={L.city} night={night} reveal={rv} from={0.15} to={0.45} />
        <Mist width={width} top={L.cityMist.top} h={L.cityMist.h} speed={60000} night={night} still={still} o={0.45} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, p3]}>
        {level >= UNLOCK.arcade ? <Painted l={L.arcade} night={night} reveal={rv} from={0.55} to={0.8} /> : null}
        {level >= UNLOCK.iwan ? <Painted l={L.iwan} night={night} reveal={rv} from={0.7} to={0.95} /> : null}
        {level >= UNLOCK.aura ? <Aura x={L.iwan.left + L.iwan.w / 2} y={L.iwan.top + L.iwan.h * 0.2} r={L.iwan.w * 0.8} still={still} /> : null}
        <Painted l={L.mid} night={night} reveal={rv} from={0.35} to={0.65} />
      </Animated.View>
      {/* golden light washing over everything near sunrise and Maghrib */}
      <Animated.View style={[StyleSheet.absoluteFill, warmSt]}><LinearGradient colors={["#ffcf7a00", "#ffcf7a", "#ffcf7a00"]} locations={[0, 0.7, 1]} style={StyleSheet.absoluteFill} /></Animated.View>
    </View>
  );
});
function Aura({ x, y, r, still }: { x: number; y: number; r: number; still: boolean }) {
  const v = useSharedValue(0.7);
  useEffect(() => { if (still) return; v.value = withRepeat(withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.sin) }), -1, true); return () => cancelAnimation(v); }, [still, v]);
  const st = useAnimatedStyle(() => ({ opacity: v.value }));
  return (
    <Animated.View style={[{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2 }, st]}>
      <Svg width={r * 2} height={r * 2}><Defs><RadialGradient id="au" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#ffe3a0" stopOpacity={0.5} /><Stop offset="1" stopColor="#ffe3a0" stopOpacity={0} /></RadialGradient></Defs><Circle cx={r} cy={r} r={r} fill="url(#au)" /></Svg>
    </Animated.View>
  );
}

/** the dark palm fronds framing the picture (depth); move faster than the garden */
export const Fronds = memo(function Fronds({ width, height, px, reveal, side = "both" }: { width: number; height: number; px?: SharedValue<number>; reveal?: SharedValue<number>; side?: "both" | "left" | "right" }) {
  const zero = useSharedValue(0), one = useSharedValue(1);
  const pan = px ?? zero, rv = reveal ?? one;
  const w = Math.min(190, width * 0.42), h = w * ASPECT.frond;
  const l = useAnimatedStyle(() => ({ opacity: interpolate(rv.value, [0.5, 1], [0, 0.92], "clamp"), transform: [{ translateX: pan.value * 1.25 - (1 - rv.value) * 40 }] }));
  const r = useAnimatedStyle(() => ({ opacity: interpolate(rv.value, [0.6, 1], [0, 0.92], "clamp"), transform: [{ translateX: pan.value * 1.25 + (1 - rv.value) * 40 }, { scaleX: -1 }] }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {side !== "right" ? <Animated.Image source={ART.frond} style={[{ position: "absolute", left: -w * 0.28, top: -h * 0.12, width: w, height: h }, l]} fadeDuration={0} /> : null}
      {side !== "left" ? <Animated.Image source={ART.frond} style={[{ position: "absolute", right: -w * 0.34, top: height * 0.02 - h * 0.2, width: w * 0.86, height: h * 0.86 }, r]} fadeDuration={0} /> : null}
    </View>
  );
});

// ---------- the terrace: zellige, marble floor, water channel, flowers, lanterns, fountains ----------
export const TERRACE_H = 118;
/** the floor in front of the trees (tileable for any width) */
export const Terrace = memo(function Terrace({ width, level, night, still, fountain, bench, interactive }: { width: number; level: number; night: number; still: boolean; fountain?: boolean; bench?: boolean; interactive?: boolean }) {
  const [rip, setRip] = useState<{ id: number; x: number }[]>([]);
  const chY = 70, chH = 18, FACE = 94;
  const n = useFollow(night, still);
  const lanterns = level >= UNLOCK.lanterns ? Math.max(2, Math.round(width / 150)) : 0;
  const jets = level >= UNLOCK.fountains ? Math.max(1, Math.round(width / 300)) : 0;
  const floor = useMemo(() => (
    <Svg width={width} height={TERRACE_H} style={{ position: "absolute" }}>
      <Defs>
        <SvgLinear id="tfl" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#e9dcbc" /><Stop offset="1" stopColor="#c7b086" /></SvgLinear>
        <SvgLinear id="twt" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#0f4a3b" /><Stop offset="0.45" stopColor="#2f7d66" /><Stop offset="1" stopColor="#7fc2a8" /></SvgLinear>
        <Pattern id="tzl" x="0" y="0" width="26" height="26" patternUnits="userSpaceOnUse">
          <Rect width="26" height="26" fill="#0b3d2e" />
          <Path d="M13 1.5 L16.2 9.8 L24.5 13 L16.2 16.2 L13 24.5 L9.8 16.2 L1.5 13 L9.8 9.8 Z" fill="#f2e9d2" />
          <Path d="M13 7 L15 11 L19 13 L15 15 L13 19 L11 15 L7 13 L11 11 Z" fill="#1d6b52" />
          <Circle cx="13" cy="13" r="1.8" fill="#d6b46c" />
          <Path d="M0 0 L4 0 L0 4 Z M26 0 L22 0 L26 4 Z M0 26 L4 26 L0 22 Z M26 26 L22 26 L26 22 Z" fill="#d6b46c" />
        </Pattern>
        <Pattern id="tmb" x="0" y="0" width="36" height="18" patternUnits="userSpaceOnUse">
          <Path d="M0 9 L18 0 L36 9 L18 18 Z" fill="none" stroke="#b9a173" strokeWidth={0.6} opacity={0.7} />
          <Circle cx="18" cy="9" r="1.3" fill="#1d6b52" opacity={0.55} />
        </Pattern>
      </Defs>
      {/* coping, the marble floor with a lattice of inlays */}
      <Rect y={0} width={width} height={3} fill="#d6b46c" />
      <Rect y={3} width={width} height={FACE - 3} fill="url(#tfl)" />
      <Rect y={3} width={width} height={FACE - 3} fill="url(#tmb)" />
      {/* the water channel of the charbagh */}
      <Rect y={chY - 4} width={width} height={chH + 8} fill="#efe4c8" />
      <Rect y={chY - 4} width={width} height={1.5} fill="#d6b46c" />
      <Rect y={chY + chH + 2.5} width={width} height={1.5} fill="#d6b46c" />
      <Rect y={chY} width={width} height={chH} fill="url(#twt)" />
      {Array.from({ length: Math.ceil(width / 40) }, (_, i) => <Path key={i} d={`M${i * 40 + 6} ${chY + 7} q6 -2 12 0 t12 0`} stroke="#d9f2e6" strokeWidth={0.8} fill="none" opacity={0.45} />)}
      {/* the front face of the terrace in zellige */}
      <Rect y={FACE} width={width} height={2} fill="#d6b46c" />
      <Rect y={FACE + 2} width={width} height={TERRACE_H - FACE - 2} fill="url(#tzl)" />
      {/* a myrtle hedge with pale gold blossoms along the back of the floor (stage 3+) */}
      {level >= UNLOCK.flowers ? <G>
        <Path d={`M0 16 ${Array.from({ length: Math.ceil(width / 18) + 1 }, (_, i) => `Q${i * 18 + 9} ${i % 2 ? 2 : 5} ${i * 18 + 18} 15`).join(" ")} L${width} 18 L0 18 Z`} fill="#1f5a40" />
        <Path d={`M0 17 ${Array.from({ length: Math.ceil(width / 18) + 1 }, (_, i) => `Q${i * 18 + 9} ${i % 2 ? 8 : 10} ${i * 18 + 18} 17`).join(" ")} L${width} 19 L0 19 Z`} fill="#2f7a54" />
        {Array.from({ length: Math.ceil(width / 23) }, (_, i) => <Circle key={i} cx={i * 23 + 8 + (i % 3) * 4} cy={7 + (i % 4) * 2.2} r={1.7} fill={i % 2 ? "#f1d58f" : "#f7ecd2"} />)}
      </G> : null}
      {bench ? <G><Rect x={width * 0.06} y={38} width={58} height={6} rx={2} fill="#7a5634" /><Rect x={width * 0.06 + 4} y={44} width={4} height={14} fill="#5a3e24" /><Rect x={width * 0.06 + 50} y={44} width={4} height={14} fill="#5a3e24" /><Rect x={width * 0.06} y={31} width={58} height={4} rx={2} fill="#8a6440" /></G> : null}
    </Svg>
  ), [width, level, bench]);
  return (
    <View style={{ width, height: TERRACE_H }}>
      {floor}
      <FloorDusk width={width} night={n} />
      <NightWater width={width} top={chY} h={chH} night={n} lanterns={lanterns} />
      <Shimmer width={width} top={chY} h={chH} still={still} />
      {interactive ? <Pressable accessible={false} onPress={(e) => { tick(); const x = e.nativeEvent.locationX; setRip((r) => [...r.slice(-2), { id: Date.now(), x }]); }} style={{ position: "absolute", left: 0, right: 0, top: chY - 8, height: chH + 16 }} /> : null}
      {rip.map((r) => <WaterRing key={r.id} x={r.x} y={chY + chH / 2} still={still} />)}
      {fountain || jets ? Array.from({ length: Math.max(jets, fountain ? 1 : 0) }, (_, i) => <Jet key={i} x={(width * (i + 0.5)) / Math.max(jets, 1)} y={chY + chH / 2} still={still} delay={i * 400} />) : null}
      {Array.from({ length: lanterns }, (_, i) => <Lantern key={i} x={(width * (i + 0.5)) / lanterns} night={n} still={still} big={level >= UNLOCK.archLights} />)}
    </View>
  );
});
/** the marble takes the colour of the night (lighter towards the lanterns) */
function FloorDusk({ width, night }: { width: number; night: SharedValue<number> }) {
  const st = useAnimatedStyle(() => ({ opacity: night.value * 0.62 }));
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", left: 0, top: 0, width, height: TERRACE_H }, st]}><LinearGradient colors={["#06231b", "#03140f"]} style={StyleSheet.absoluteFill} /></Animated.View>;
}
/** the water darkens with the night and mirrors the lanterns as trembling gold */
function NightWater({ width, top, h, night, lanterns }: { width: number; top: number; h: number; night: SharedValue<number>; lanterns: number }) {
  const veil = useAnimatedStyle(() => ({ opacity: night.value * 0.7 }));
  const glints = useAnimatedStyle(() => ({ opacity: night.value }));
  return (
    <View pointerEvents="none" style={{ position: "absolute", top, left: 0, width, height: h }}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#03140f" }, veil]} />
      {lanterns ? <Animated.View style={[StyleSheet.absoluteFill, glints]}>
        {Array.from({ length: lanterns }, (_, i) => { const x = (width * (i + 0.5)) / lanterns; return <View key={i} style={{ position: "absolute", left: x - 9, top: h * 0.25, width: 18, height: h * 0.5, borderRadius: 9, backgroundColor: "rgba(255,214,122,0.45)" }} />; })}
      </Animated.View> : null}
    </View>
  );
}
/** rings on the water where it was touched */
function WaterRing({ x, y, still }: { x: number; y: number; still: boolean }) {
  const v = useSharedValue(still ? 1 : 0);
  useEffect(() => { if (!still) v.value = withTiming(1, { duration: 1300, easing: Easing.out(Easing.cubic) }); }, [still, v]);
  const a = useAnimatedStyle(() => ({ opacity: (1 - v.value) * 0.9, transform: [{ scaleX: 0.2 + v.value * 1.6 }, { scaleY: 0.2 + v.value * 1.6 }] }));
  const b = useAnimatedStyle(() => ({ opacity: (1 - v.value) * 0.6, transform: [{ scaleX: 0.1 + v.value * 0.9 }, { scaleY: 0.1 + v.value * 0.9 }] }));
  return (
    <>
      <Animated.View pointerEvents="none" style={[{ position: "absolute", left: x - 30, top: y - 7, width: 60, height: 14, borderRadius: 30, borderWidth: 1.2, borderColor: "#f1fff9" }, a]} />
      <Animated.View pointerEvents="none" style={[{ position: "absolute", left: x - 30, top: y - 7, width: 60, height: 14, borderRadius: 30, borderWidth: 1, borderColor: "#f3e2b6" }, b]} />
    </>
  );
}
function Shimmer({ width, top, h, still }: { width: number; top: number; h: number; still: boolean }) {
  const x = useSharedValue(0);
  useEffect(() => { if (still) return; x.value = withRepeat(withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.quad) }), -1, false); return () => cancelAnimation(x); }, [still, x]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: -160 + x.value * (width + 320) }], opacity: still ? 0 : 1 }));
  return (
    <View pointerEvents="none" style={{ position: "absolute", top, left: 0, width, height: h, overflow: "hidden" }}>
      <Animated.View style={[{ position: "absolute", top: 0, width: 160, height: h }, st]}>
        <LinearGradient colors={["#ffffff00", "#fffbe8aa", "#ffffff00"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}
/** a small fountain jet in the channel: an arc of water and a few drops */
function Jet({ x, y, still, delay }: { x: number; y: number; still: boolean; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => { if (still) return; t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1300, easing: Easing.linear }), -1, false)); return () => cancelAnimation(t); }, [still, delay, t]);
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: x - 22, top: y - 34, width: 44, height: 40 }}>
      <Svg width={44} height={40}>
        <Circle cx={22} cy={34} r={7} fill="#efe4c8" />
        <Circle cx={22} cy={34} r={5} fill="#3d8f78" />
        <Path d="M22 33 Q22 6 22 4 M22 30 Q14 8 6 30 M22 30 Q30 8 38 30" stroke="#e8fbf3" strokeWidth={1.4} fill="none" opacity={0.85} strokeLinecap="round" />
      </Svg>
      {[0, 1, 2].map((i) => <Drop key={i} t={t} i={i} />)}
    </View>
  );
}
function Drop({ t, i }: { t: SharedValue<number>; i: number }) {
  const st = useAnimatedStyle(() => {
    const k = (t.value + i / 3) % 1, dir = i - 1;
    return { opacity: k < 0.9 ? 0.9 : 0, transform: [{ translateX: 22 + dir * 16 * k - 1.5 }, { translateY: 30 - Math.sin(k * Math.PI) * 26 }] };
  });
  return <Animated.View style={[{ position: "absolute", width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#f1fff9" }, st]} />;
}
/** a brass lantern on a slender post; glows at night with a gentle flicker */
function Lantern({ x, night, still, big }: { x: number; night: SharedValue<number>; still: boolean; big: boolean }) {
  const f = useSharedValue(1);
  useEffect(() => { if (still) return; f.value = withRepeat(withSequence(withTiming(0.82, { duration: 900 + (x % 400) }), withTiming(1, { duration: 1100 })), -1, true); return () => cancelAnimation(f); }, [still, x, f]);
  const glow = useAnimatedStyle(() => ({ opacity: (0.25 + night.value * 0.75) * f.value }));
  const s = big ? 1.2 : 1;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: x - 30 * s, top: -62 * s, width: 60 * s, height: 66 * s }}>
      <Animated.View style={[StyleSheet.absoluteFill, glow]}>
        <Svg width={60 * s} height={60 * s}><Defs><RadialGradient id="lg" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#ffd98a" stopOpacity={0.85} /><Stop offset="1" stopColor="#ffd98a" stopOpacity={0} /></RadialGradient></Defs><Circle cx={30 * s} cy={22 * s} r={22 * s} fill="url(#lg)" /></Svg>
      </Animated.View>
      <Svg width={60 * s} height={66 * s} viewBox="0 0 60 66" style={StyleSheet.absoluteFill}>
        <Rect x={29} y={30} width={2} height={36} fill="#6b5326" />
        <Path d="M24 14 h12 l3 5 v10 l-3 4 h-12 l-3 -4 v-10 Z" fill="#c9a24e" stroke="#7a5c22" strokeWidth={0.8} />
        <Rect x={26} y={19} width={8} height={10} rx={1} fill="#fff1b8" />
        <Path d="M30 6 l5 8 h-10 Z" fill="#b38b3c" />
        <Circle cx={30} cy={5} r={1.6} fill="#e9cf99" />
      </Svg>
    </View>
  );
}

/** the stage a garden shows (the oldest tree carries the landscape) */
export const gardenLevel = (stages: number[]) => (stages.length ? Math.max(...stages) : 0);

/** a quiet backdrop for screens on the dark stage: the landscape at a given horizon, veiled for legible text */
export function JourneyBackdrop({ width, height, horizon, sky, reveal, level = 12, still, veil = 0.55, fronds = true }: { width: number; height: number; horizon: number; sky: Sky; reveal?: SharedValue<number>; level?: number; still: boolean; veil?: number; fronds?: boolean }) {
  const ground = height * horizon;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: stageC.deep }]}>
      <Panorama width={width} height={height} ground={ground} sky={sky} level={level} reveal={reveal} still={still} />
      {/* the terrace edge: a gold line and a zellige band, then the dark stage */}
      <LinearGradient colors={["rgba(5,28,21,0)", `rgba(5,28,21,${Math.min(1, veil + 0.35)})`, stageC.deep]} locations={[0, 0.22, 1]} style={{ position: "absolute", left: 0, right: 0, top: ground - 30, bottom: 0 }} />
      <LinearGradient colors={[`rgba(5,28,21,${veil * 0.55})`, "rgba(5,28,21,0)"]} locations={[0, 0.5]} style={{ position: "absolute", left: 0, right: 0, top: 0, height: ground }} />
      {fronds ? <Fronds width={width} height={height} reveal={reveal} /> : null}
    </View>
  );
}

/** motes of light drifting in the sun by day, fireflies low over the garden at night (7 pooled particles) */
export const Motes = memo(function Motes({ width, height, night, still, top = 0.3 }: { width: number; height: number; night: number; still: boolean; top?: number }) {
  if (still) return null;
  const fire = night > 0.5;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: 7 }, (_, i) => <Mote key={i} i={i} width={width} height={height} fire={fire} top={top} />)}
    </View>
  );
});
function Mote({ i, width, height, fire, top }: { i: number; width: number; height: number; fire: boolean; top: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(i * 1300, withRepeat(withTiming(1, { duration: 9000 + (i % 4) * 2200, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(t);
  }, [i, t]);
  const x0 = (((i * 41 + 17) % 90) / 100 + 0.05) * width, y0 = height * (fire ? 0.62 + (i % 3) * 0.08 : top + (i % 4) * 0.1);
  const st = useAnimatedStyle(() => {
    const k = t.value;
    const blink = fire ? 0.35 + 0.65 * Math.abs(Math.sin(k * Math.PI * 5 + i)) : 1;
    return {
      opacity: interpolate(k, [0, 0.15, 0.8, 1], [0, 0.9, 0.9, 0]) * blink,
      transform: [{ translateX: x0 + Math.sin(k * Math.PI * 2 + i) * 26 + (fire ? Math.sin(k * 11 + i) * 8 : k * 30) }, { translateY: y0 - k * (fire ? 40 : 90) + Math.cos(k * 9 + i) * (fire ? 10 : 4) }],
    };
  });
  const s = fire ? 4 : 3 + (i % 2);
  return <Animated.View style={[{ position: "absolute", width: s, height: s, borderRadius: s, backgroundColor: fire ? "#ffe08a" : "#fff6dc", shadowColor: fire ? "#ffd25a" : "#fff2c4", shadowOpacity: 1, shadowRadius: fire ? 6 : 4, shadowOffset: { width: 0, height: 0 } }, st]} />;
}

/** a sky between night and sunrise for a journey progress 0 … 1 (the onboarding dawns as it goes) */
export function journeySky(p: number): Sky {
  const a = p < 0.5 ? SKIES.night : SKIES.predawn, b = p < 0.5 ? SKIES.predawn : SKIES.dawn, k = p < 0.5 ? p / 0.5 : (p - 0.5) / 0.5;
  return {
    colors: [mix(a.colors[0], b.colors[0], k), mix(a.colors[1], b.colors[1], k), mix(a.colors[2], b.colors[2], k)],
    night: a.night + (b.night - a.night) * k, warm: a.warm + (b.warm - a.warm) * k,
    sun: p > 0.7 ? { x: 0.26, y: 0.95 - (p - 0.7) * 1.2 } : null, moon: p < 0.6 ? fixedMoon(0.8, 0.3) : null,
  };
}
/** the dark stage of the onboarding with the landscape revealing itself behind it as the answers come in */
export function JourneyStage({ progress, horizon = 0.4, veil = 0.55, level = 12, children }: { progress: number; horizon?: number; veil?: number; level?: number; children: ReactNode }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const still = useStillMotion();
  const reveal = useFollow(progress, still, 1600);
  const sky = journeySky(progress);
  const [prev, setPrev] = useState(sky);
  const fade = useSharedValue(1);
  const key = sky.colors.join();
  useEffect(() => {
    if (still) { setPrev(sky); return; }
    fade.value = 0;
    fade.value = withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) });
    const id = setTimeout(() => setPrev(sky), 1500);
    return () => clearTimeout(id);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const top = useAnimatedStyle(() => ({ opacity: fade.value }));
  return (
    <View style={{ flex: 1, backgroundColor: stageC.deep }} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {box.w ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <SkyFill sky={prev} />
          <Animated.View style={[StyleSheet.absoluteFill, top]}><SkyFill sky={sky} /></Animated.View>
          <Heavens sky={sky} width={box.w} height={box.h * horizon} still={still} noMoon />
          <JourneyBackdropLayers width={box.w} height={box.h} horizon={horizon} sky={sky} reveal={reveal} level={level} still={still} veil={veil} />
          <Motes width={box.w} height={box.h * horizon} night={sky.night} still={still} top={0.35} />
        </View>
      ) : null}
      {children}
    </View>
  );
}
function JourneyBackdropLayers({ width, height, horizon, sky, reveal, level, still, veil }: { width: number; height: number; horizon: number; sky: Sky; reveal: SharedValue<number>; level: number; still: boolean; veil: number }) {
  const ground = height * horizon;
  return (
    <>
      <Panorama width={width} height={height} ground={ground} sky={sky} level={level} reveal={reveal} still={still} withSky={false} scale={1.6} />
      <LinearGradient colors={["rgba(5,28,21,0)", `rgba(5,28,21,${Math.min(1, veil + 0.35)})`, stageC.deep]} locations={[0, 0.2, 1]} style={{ position: "absolute", left: 0, right: 0, top: ground - 34, bottom: 0 }} />
      <LinearGradient colors={[`rgba(5,28,21,${veil * 0.6})`, "rgba(5,28,21,0)"]} locations={[0, 0.6]} style={{ position: "absolute", left: 0, right: 0, top: 0, height: ground }} />
      <View style={{ position: "absolute", left: 0, right: 0, top: ground - 4, height: 1, backgroundColor: "rgba(214,180,108,0.45)" }} />
      <Fronds width={width} height={height} reveal={reveal} />
    </>
  );
}
/** Reduce Motion, read once and followed */
function useStillMotion(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (alive) setOn(v); }).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setOn);
    return () => { alive = false; sub.remove(); };
  }, []);
  return on;
}
