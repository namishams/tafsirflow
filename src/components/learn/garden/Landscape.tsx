"use client";
// mirrors mobile/src/features/garden/Landscape.tsx
// DESIGN FROZEN (owner approved, tag garten-design-v1) — do not change visuals; only bug fixes.
// The living landscape on the web: the same painted layers (public/garden/*.webp, made by
// mobile/scripts/gen-garden-art.mjs), the same layout maths, the sky by the prayer times (src/lib/learn/garden/sky.ts)
// with sun arc, real moon phase, stars and Milky Way, the terrace with zellige, water channel, lanterns and fountains
// that unlock with the stage. Day and night layers cross-fade by opacity. Motion is CSS (Scene.tsx). Not on the web:
// the panorama wings (Makkah and the desert, seen only while swiping the garden in the app) and the near dunes at the
// ends of the swipeable world, because the web scene is not swiped; tapping the water channel for ripples.
import { memo, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import { UNLOCK, mix, type Moon, type Sky } from "@/lib/learn/garden/sky";
import { useUid } from "./Tree";

const ART = {
  far: ["/garden/far-day.webp", "/garden/far-night.webp"],
  city: ["/garden/city-day.webp", "/garden/city-night.webp"],
  mid: ["/garden/mid-day.webp", "/garden/mid-night.webp"],
  arcade: ["/garden/arcade-day.webp", "/garden/arcade-night.webp"],
  iwan: ["/garden/iwan-day.webp", "/garden/iwan-night.webp"],
  frond: "/garden/frond.webp",
  mist: "/garden/mist.webp",
} as const;
const ASPECT = { far: 420 / 1200, city: 360 / 1600, mid: 560 / 1800, arcade: 300 / 1800, iwan: 560 / 700, frond: 820 / 520, mist: 220 / 1200 };
const FILL: CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none" };
const STAGE_DEEP = "rgb(5,28,21)";

// ---------- sky, sun, moon, stars, rays ----------
export const SkyFill = memo(function SkyFill({ sky, className }: { sky: Sky; className?: string }) {
  return <div className={className} style={{ ...FILL, background: `linear-gradient(180deg, ${sky.colors[0]} 0%, ${sky.colors[1]} 62%, ${sky.colors[2]} 100%)` }} />;
});

function starField(width: number, height: number) {
  let x = 2463534242;
  const r = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return (x % 100000) / 100000; };
  return Array.from({ length: 110 }, (_, i) => {
    const m = Math.pow(r(), 3.2);
    return { x: r() * width, y: Math.pow(r(), 1.25) * height * 0.92, r: 0.45 + m * 1.6, o: 0.35 + m * 0.65, g: i % 3, warm: r() < 0.12 };
  });
}
export const Heavens = memo(function Heavens({ sky, width, height, still, noMoon }: { sky: Sky; width: number; height: number; still: boolean; noMoon?: boolean }) {
  const stars = useMemo(() => starField(width, height), [width, height]);
  const nightO = Math.max(0, (sky.night - 0.35) / 0.65);
  const milky = nightO * (1 - (sky.moon?.illum ?? 0) * 0.85) * 0.9;
  return (
    <div style={FILL}>
      {milky > 0.08 ? <MilkyWay width={width} height={height} o={milky} /> : null}
      {nightO > 0.02 ? [0, 1, 2].map((g) => (
        <div key={g} className={still ? undefined : "gd-twinkle"} style={{ ...FILL, opacity: nightO, "--gd-o": nightO, "--gd-t": `${1800 + g * 500}ms`, "--gd-d": `${g * 900}ms` } as CSSProperties}>
          <svg width={width} height={height} style={{ position: "absolute" }}>
            {stars.filter((st) => st.g === g).map((st, i) => <circle key={i} cx={st.x} cy={st.y} r={st.r} fill={st.warm ? "#ffe7b8" : "#fbfbf4"} opacity={st.o} />)}
          </svg>
        </div>
      )) : null}
      {nightO > 0.3 ? <Planet x={width * 0.18} y={height * 0.2} o={nightO} /> : null}
      {sky.moon && !noMoon ? <MoonDisc moon={sky.moon} x={sky.moon.x * width} y={Math.max(120, sky.moon.y * height)} o={Math.max(0.45, nightO)} /> : null}
      {sky.sun ? <Sun x={sky.sun.x * width} y={sky.sun.y * height} warm={sky.warm} width={width} height={height} still={still} /> : null}
    </div>
  );
});
function MilkyWay({ width, height, o }: { width: number; height: number; o: number }) {
  const u = useUid("mw");
  const w = Math.hypot(width, height);
  return (
    <svg width={width} height={height} style={{ position: "absolute", opacity: o }}>
      <defs>
        <radialGradient id={`${u}a`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#e9f0e4" stopOpacity={0.16} /><stop offset="0.6" stopColor="#d9e6d6" stopOpacity={0.06} /><stop offset="1" stopColor="#d9e6d6" stopOpacity={0} /></radialGradient>
        <radialGradient id={`${u}b`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#f6e7c6" stopOpacity={0.12} /><stop offset="1" stopColor="#f6e7c6" stopOpacity={0} /></radialGradient>
      </defs>
      <g transform={`rotate(-28 ${width / 2} ${height / 2})`}>
        <ellipse cx={width / 2} cy={height * 0.42} rx={w * 0.62} ry={height * 0.16} fill={`url(#${u}a)`} />
        <ellipse cx={width * 0.42} cy={height * 0.44} rx={w * 0.22} ry={height * 0.07} fill={`url(#${u}b)`} />
        <ellipse cx={width * 0.62} cy={height * 0.4} rx={w * 0.16} ry={height * 0.05} fill={`url(#${u}b)`} />
      </g>
    </svg>
  );
}
function Planet({ x, y, o }: { x: number; y: number; o: number }) {
  const u = useUid("pl");
  return (
    <svg width={30} height={30} style={{ position: "absolute", left: x - 15, top: y - 15, opacity: o }}>
      <defs><radialGradient id={u} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff4d6" stopOpacity={0.7} /><stop offset="1" stopColor="#fff4d6" stopOpacity={0} /></radialGradient></defs>
      <circle cx={15} cy={15} r={15} fill={`url(#${u})`} /><circle cx={15} cy={15} r={2.1} fill="#fffaf0" />
    </svg>
  );
}
/** the moon in its real phase: lit limb plus terminator, the dark part faintly visible, tilted like the crescent in Arabia */
function MoonDisc({ moon, x, y, o }: { moon: Moon; x: number; y: number; o: number }) {
  const u = useUid("mg");
  const R = 24, c = 70, k = Math.cos(moon.phase * Math.PI * 2), rx = Math.abs(k) * R;
  const waxing = moon.phase < 0.5;
  const d = `M${c} ${c - R} A${R} ${R} 0 0 1 ${c} ${c + R} A${rx.toFixed(2)} ${R} 0 0 ${k > 0 ? 0 : 1} ${c} ${c - R} Z`;
  return (
    <svg width={140} height={140} style={{ position: "absolute", left: x - 70, top: y - 70, opacity: o }}>
      <defs><radialGradient id={u} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#f3e2b6" stopOpacity={0.18 + moon.illum * 0.3} /><stop offset="1" stopColor="#f3e2b6" stopOpacity={0} /></radialGradient></defs>
      <circle cx={c} cy={c} r={70} fill={`url(#${u})`} />
      <g transform={`rotate(${waxing ? -35 : 35} ${c} ${c})${waxing ? "" : ` translate(${2 * c} 0) scale(-1 1)`}`}>
        <circle cx={c} cy={c} r={R} fill="#f6e7bf" opacity={0.1} />
        <path d={d} fill="#f6e7bf" />
        {moon.illum > 0.85 ? <><circle cx={c - 6} cy={c - 5} r={4} fill="#e2cf9e" opacity={0.5} /><circle cx={c + 7} cy={c + 6} r={3} fill="#e2cf9e" opacity={0.45} /><circle cx={c + 2} cy={c - 10} r={2} fill="#e2cf9e" opacity={0.4} /></> : null}
      </g>
    </svg>
  );
}
function Sun({ x, y, warm, width, height, still }: { x: number; y: number; warm: number; width: number; height: number; still: boolean }) {
  const u = useUid("sun");
  const core = mix("#fff6dc", "#ffd27a", warm), R = Math.max(width, height) * 1.1;
  return (
    <>
      <svg width={360} height={360} style={{ position: "absolute", left: x - 180, top: y - 180 }}>
        <defs><radialGradient id={`${u}s`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={core} stopOpacity={0.95} /><stop offset="0.12" stopColor={core} stopOpacity={0.75} /><stop offset="0.4" stopColor="#ffe9b0" stopOpacity={0.22} /><stop offset="1" stopColor="#ffe9b0" stopOpacity={0} /></radialGradient></defs>
        <circle cx={180} cy={180} r={180} fill={`url(#${u}s)`} />
        <circle cx={180} cy={180} r={22} fill={core} opacity={0.95} />
      </svg>
      <div className={still ? undefined : "gd-rays"} style={{ position: "absolute", left: x - R, top: y - R, width: R * 2, height: R * 2, opacity: 0.55 }}>
        <svg width={R * 2} height={R * 2}>
          <defs><radialGradient id={`${u}r`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff2cc" stopOpacity={0.32} /><stop offset="0.7" stopColor="#fff2cc" stopOpacity={0} /></radialGradient></defs>
          {[0.6, 1.05, 1.45, 1.9, 2.4].map((a, i) => { const s = 0.05 + (i % 2) * 0.03; return <polygon key={i} points={`${R},${R} ${R + Math.cos(a - s) * R},${R + Math.sin(a - s) * R} ${R + Math.cos(a + s) * R},${R + Math.sin(a + s) * R}`} fill={`url(#${u}r)`} />; })}
        </svg>
      </div>
    </>
  );
}

// ---------- the painted layers ----------
type Lay = { src: readonly [string, string]; w: number; h: number; left: number; top: number };
/** one painted layer: day and night versions cross-faded, optionally revealed (the planting ceremony) */
function Painted({ l, night, reveal = 1, from = 0, to = 1 }: { l: Lay; night: number; reveal?: number; from?: number; to?: number }) {
  const k = Math.max(0, Math.min(1, (reveal - from) / Math.max(0.0001, to - from)));
  const img: CSSProperties = { position: "absolute", left: 0, top: 0, width: l.w, height: l.h, maxWidth: "none" };
  return (
    <div className="gd-reveal" style={{ position: "absolute", left: l.left, top: l.top, width: l.w, height: l.h, opacity: k, transform: `translateY(${(1 - k) * 26}px)`, pointerEvents: "none" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={l.src[0]} alt="" draggable={false} decoding="async" style={img} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={l.src[1]} alt="" draggable={false} decoding="async" className="gd-night" style={{ ...img, opacity: night }} />
    </div>
  );
}
function Mist({ width, top, h, speed, night, still, o }: { width: number; top: number; h: number; speed: number; night: number; still: boolean; o: number }) {
  const w = width * 1.2;
  const img: CSSProperties = { width: w, height: h, maxWidth: "none", flex: "none" };
  return (
    <div className={still ? "gd-night" : "gd-mist gd-night"} style={{ position: "absolute", left: 0, top, width: w * 2, height: h, display: "flex", pointerEvents: "none", opacity: o * (1 - night * 0.55), "--gd-w": `${w}px`, "--gd-s": `${speed}ms` } as CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ART.mist} alt="" draggable={false} style={img} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ART.mist} alt="" draggable={false} style={img} />
    </div>
  );
}
function Aura({ x, y, r, still }: { x: number; y: number; r: number; still: boolean }) {
  const u = useUid("au");
  return (
    <div className={still ? undefined : "gd-pulse"} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, "--gd-t": "3.6s" } as CSSProperties}>
      <svg width={r * 2} height={r * 2}><defs><radialGradient id={u} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe3a0" stopOpacity={0.5} /><stop offset="1" stopColor="#ffe3a0" stopOpacity={0} /></radialGradient></defs><circle cx={r} cy={r} r={r} fill={`url(#${u})`} /></svg>
    </div>
  );
}

export type PanoramaProps = {
  width: number; height: number;
  /** y of the ground line (the top of the terrace), from the top */
  ground: number;
  sky: Sky;
  /** stage of the garden (unlocks); 12 shows everything */
  level?: number;
  /** 0 … 1: how much of the landscape is revealed (planting ceremony); 1 by default */
  reveal?: number;
  /** the idle camera drift of the garden (parallax by depth) */
  drift?: boolean;
  still?: boolean;
  withSky?: boolean;
  /** width of the painted layers relative to the view (1.4 … 2) */
  scale?: number;
};

/** a parallax layer that drifts with the idle camera by a factor of the garden's drift (9 px) */
function Depth({ f, on, children }: { f: number; on: boolean; children: ReactNode }) {
  return <div className={on ? "gd-drift" : undefined} style={{ ...FILL, "--gd-dx": `${9 * f}px` } as CSSProperties}>{children}</div>;
}

/** sky + heavens + far mountains + mist + horizon city + groves + arcade + pavilion, in parallax */
export const Panorama = memo(function Panorama({ width, height, ground, sky, level = 12, reveal = 1, drift = false, still = false, withSky = true, scale = 1.4 }: PanoramaProps) {
  const night = sky.night;
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
  const move = drift && !still;
  const warmO = Math.max(0, Math.min(1, (reveal - 0.4) / 0.6)) * sky.warm * 0.24;
  return (
    <div style={{ ...FILL, overflow: "hidden" }}>
      {withSky ? <><SkyFill sky={sky} /><Heavens sky={sky} width={width} height={ground} still={still} /></> : null}
      <Depth f={0.12} on={move}>
        <Painted l={L.far} night={night} reveal={reveal} from={0} to={0.25} />
        <Mist width={width} top={L.farMist.top} h={L.farMist.h} speed={90000} night={night} still={still} o={0.55} />
      </Depth>
      <Depth f={0.28} on={move}>
        <Painted l={L.city} night={night} reveal={reveal} from={0.15} to={0.45} />
        <Mist width={width} top={L.cityMist.top} h={L.cityMist.h} speed={60000} night={night} still={still} o={0.45} />
      </Depth>
      <Depth f={0.55} on={move}>
        {level >= UNLOCK.arcade ? <Painted l={L.arcade} night={night} reveal={reveal} from={0.55} to={0.8} /> : null}
        {level >= UNLOCK.iwan ? <Painted l={L.iwan} night={night} reveal={reveal} from={0.7} to={0.95} /> : null}
        {level >= UNLOCK.aura ? <Aura x={L.iwan.left + L.iwan.w / 2} y={L.iwan.top + L.iwan.h * 0.2} r={L.iwan.w * 0.8} still={still} /> : null}
        <Painted l={L.mid} night={night} reveal={reveal} from={0.35} to={0.65} />
      </Depth>
      {/* golden light washing over everything near sunrise and Maghrib */}
      <div className="gd-night" style={{ ...FILL, opacity: warmO, background: "linear-gradient(180deg, #ffcf7a00 0%, #ffcf7a 70%, #ffcf7a00 100%)" }} />
    </div>
  );
});

/** the dark palm fronds framing the picture (depth); they drift more than the garden */
export const Fronds = memo(function Fronds({ width, height, reveal = 1, drift = false, still = false }: { width: number; height: number; reveal?: number; drift?: boolean; still?: boolean }) {
  const w = Math.min(190, width * 0.42), h = w * ASPECT.frond;
  const lo = Math.max(0, Math.min(1, (reveal - 0.5) / 0.5)) * 0.92, ro = Math.max(0, Math.min(1, (reveal - 0.6) / 0.4)) * 0.92;
  return (
    <div style={FILL}>
      <div className={drift && !still ? "gd-drift" : undefined} style={{ ...FILL, "--gd-dx": `${9 * 1.25}px` } as CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ART.frond} alt="" draggable={false} className="gd-reveal" style={{ position: "absolute", left: -w * 0.28, top: -h * 0.12, width: w, height: h, maxWidth: "none", opacity: lo, transform: `translateX(${-(1 - reveal) * 40}px)` }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ART.frond} alt="" draggable={false} className="gd-reveal" style={{ position: "absolute", right: -w * 0.34, top: height * 0.02 - h * 0.2, width: w * 0.86, height: h * 0.86, maxWidth: "none", opacity: ro, transform: `translateX(${(1 - reveal) * 40}px) scaleX(-1)` }} />
      </div>
    </div>
  );
});

// ---------- the terrace: zellige, marble floor, water channel, flowers, lanterns, fountains ----------
export const TERRACE_H = 118;
export const Terrace = memo(function Terrace({ width, level, night, still, fountain, bench }: { width: number; level: number; night: number; still: boolean; fountain?: boolean; bench?: boolean }) {
  const u = useUid("tr");
  const chY = 70, chH = 18, FACE = 94;
  const lanterns = level >= UNLOCK.lanterns ? 2 * Math.max(1, Math.round(width / 300)) : 0;
  const jets = level >= UNLOCK.fountains ? Math.max(1, Math.round(width / 300)) : 0;
  const floor = useMemo(() => (
    <svg width={width} height={TERRACE_H} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <linearGradient id={`${u}fl`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9dcbc" /><stop offset="1" stopColor="#c7b086" /></linearGradient>
        <linearGradient id={`${u}wt`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f4a3b" /><stop offset="0.45" stopColor="#2f7d66" /><stop offset="1" stopColor="#7fc2a8" /></linearGradient>
        <pattern id={`${u}zl`} x="0" y="0" width="26" height="26" patternUnits="userSpaceOnUse">
          <rect width="26" height="26" fill="#0b3d2e" />
          <path d="M13 1.5 L16.2 9.8 L24.5 13 L16.2 16.2 L13 24.5 L9.8 16.2 L1.5 13 L9.8 9.8 Z" fill="#f2e9d2" />
          <path d="M13 7 L15 11 L19 13 L15 15 L13 19 L11 15 L7 13 L11 11 Z" fill="#1d6b52" />
          <circle cx="13" cy="13" r="1.8" fill="#d6b46c" />
          <path d="M0 0 L4 0 L0 4 Z M26 0 L22 0 L26 4 Z M0 26 L4 26 L0 22 Z M26 26 L22 26 L26 22 Z" fill="#d6b46c" />
        </pattern>
        <pattern id={`${u}mb`} x="0" y="0" width="36" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 9 L18 0 L36 9 L18 18 Z" fill="none" stroke="#b9a173" strokeWidth={0.6} opacity={0.7} />
          <circle cx="18" cy="9" r="1.3" fill="#1d6b52" opacity={0.55} />
        </pattern>
      </defs>
      <rect y={0} width={width} height={3} fill="#d6b46c" />
      <rect y={3} width={width} height={FACE - 3} fill={`url(#${u}fl)`} />
      <rect y={3} width={width} height={FACE - 3} fill={`url(#${u}mb)`} />
      <rect y={chY - 4} width={width} height={chH + 8} fill="#efe4c8" />
      <rect y={chY - 4} width={width} height={1.5} fill="#d6b46c" />
      <rect y={chY + chH + 2.5} width={width} height={1.5} fill="#d6b46c" />
      <rect y={chY} width={width} height={chH} fill={`url(#${u}wt)`} />
      {Array.from({ length: Math.ceil(width / 40) }, (_, i) => <path key={i} d={`M${i * 40 + 6} ${chY + 7} q6 -2 12 0 t12 0`} stroke="#d9f2e6" strokeWidth={0.8} fill="none" opacity={0.45} />)}
      <rect y={FACE} width={width} height={2} fill="#d6b46c" />
      <rect y={FACE + 2} width={width} height={TERRACE_H - FACE - 2} fill={`url(#${u}zl)`} />
      {level >= UNLOCK.flowers ? <g>
        <path d={`M0 16 ${Array.from({ length: Math.ceil(width / 18) + 1 }, (_, i) => `Q${i * 18 + 9} ${i % 2 ? 2 : 5} ${i * 18 + 18} 15`).join(" ")} L${width} 18 L0 18 Z`} fill="#1f5a40" />
        <path d={`M0 17 ${Array.from({ length: Math.ceil(width / 18) + 1 }, (_, i) => `Q${i * 18 + 9} ${i % 2 ? 8 : 10} ${i * 18 + 18} 17`).join(" ")} L${width} 19 L0 19 Z`} fill="#2f7a54" />
        {Array.from({ length: Math.ceil(width / 23) }, (_, i) => <circle key={i} cx={i * 23 + 8 + (i % 3) * 4} cy={7 + (i % 4) * 2.2} r={1.7} fill={i % 2 ? "#f1d58f" : "#f7ecd2"} />)}
      </g> : null}
      {bench ? <g><rect x={width * 0.06} y={38} width={58} height={6} rx={2} fill="#7a5634" /><rect x={width * 0.06 + 4} y={44} width={4} height={14} fill="#5a3e24" /><rect x={width * 0.06 + 50} y={44} width={4} height={14} fill="#5a3e24" /><rect x={width * 0.06} y={31} width={58} height={4} rx={2} fill="#8a6440" /></g> : null}
    </svg>
  ), [u, width, level, bench]);
  return (
    <div style={{ position: "relative", width, height: TERRACE_H }}>
      {floor}
      {/* the marble takes the colour of the night */}
      <div className="gd-night" style={{ position: "absolute", left: 0, top: 0, width, height: TERRACE_H, opacity: night * 0.62, background: "linear-gradient(180deg, #06231b, #03140f)", pointerEvents: "none" }} />
      {/* the water darkens with the night and mirrors the lanterns as trembling gold */}
      <div style={{ position: "absolute", top: chY, left: 0, width, height: chH, pointerEvents: "none" }}>
        <div className="gd-night" style={{ position: "absolute", inset: 0, backgroundColor: "#03140f", opacity: night * 0.7 }} />
        {lanterns ? <div className="gd-night" style={{ position: "absolute", inset: 0, opacity: night }}>
          {Array.from({ length: lanterns }, (_, i) => { const x = (width * (i + 0.5)) / lanterns; return <span key={i} style={{ position: "absolute", left: x - 9, top: chH * 0.25, width: 18, height: chH * 0.5, borderRadius: 9, backgroundColor: "rgba(255,214,122,0.45)" }} />; })}
        </div> : null}
      </div>
      {!still ? (
        <div style={{ position: "absolute", top: chY, left: 0, width, height: chH, overflow: "hidden", pointerEvents: "none" }}>
          <div className="gd-shimmer" style={{ position: "absolute", top: 0, left: 0, width: 160, height: chH, background: "linear-gradient(90deg, #ffffff00, #fffbe8aa, #ffffff00)", "--gd-w": `${width}px` } as CSSProperties} />
        </div>
      ) : null}
      {fountain || jets ? Array.from({ length: Math.max(jets, fountain ? 1 : 0) }, (_, i) => <Jet key={i} x={(width * (i + 0.5)) / Math.max(jets, 1)} y={chY + chH / 2} still={still} delay={i * 400} />) : null}
      {Array.from({ length: lanterns }, (_, i) => <Lantern key={i} x={(width * (i + 0.5)) / lanterns} night={night} still={still} big={level >= UNLOCK.archLights} />)}
    </div>
  );
});
/** a small fountain jet in the channel: an arc of water and a few drops */
function Jet({ x, y, still, delay }: { x: number; y: number; still: boolean; delay: number }) {
  return (
    <div style={{ position: "absolute", left: x - 22, top: y - 34, width: 44, height: 40, pointerEvents: "none" }}>
      <svg width={44} height={40}>
        <circle cx={22} cy={34} r={7} fill="#efe4c8" />
        <circle cx={22} cy={34} r={5} fill="#3d8f78" />
        <path d="M22 33 Q22 6 22 4 M22 30 Q14 8 6 30 M22 30 Q30 8 38 30" stroke="#e8fbf3" strokeWidth={1.4} fill="none" opacity={0.85} strokeLinecap="round" />
      </svg>
      {!still ? [0, 1, 2].map((i) => <span key={i} className="gd-drop" style={{ position: "absolute", left: 0, top: 0, width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#f1fff9", "--gd-dir": i - 1, "--gd-d": `${delay - (i / 3) * 1300}ms` } as CSSProperties} />) : null}
    </div>
  );
}
/** a brass lantern on a slender post; glows at night with a gentle flicker */
function Lantern({ x, night, still, big }: { x: number; night: number; still: boolean; big: boolean }) {
  const u = useUid("lg");
  const s = big ? 1.2 : 1;
  const o = 0.25 + night * 0.75;
  return (
    <div style={{ position: "absolute", left: x - 30 * s, top: -62 * s, width: 60 * s, height: 66 * s, pointerEvents: "none" }}>
      <div className={still ? "gd-night" : "gd-flicker gd-night"} style={{ position: "absolute", inset: 0, opacity: o, "--gd-o": o, "--gd-t": `${900 + (x % 400)}ms` } as CSSProperties}>
        <svg width={60 * s} height={60 * s}><defs><radialGradient id={u} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffd98a" stopOpacity={0.85} /><stop offset="1" stopColor="#ffd98a" stopOpacity={0} /></radialGradient></defs><circle cx={30 * s} cy={22 * s} r={22 * s} fill={`url(#${u})`} /></svg>
      </div>
      <svg width={60 * s} height={66 * s} viewBox="0 0 60 66" style={{ position: "absolute", inset: 0 }}>
        <rect x={29} y={30} width={2} height={36} fill="#6b5326" />
        <path d="M24 14 h12 l3 5 v10 l-3 4 h-12 l-3 -4 v-10 Z" fill="#c9a24e" stroke="#7a5c22" strokeWidth={0.8} />
        <rect x={26} y={19} width={8} height={10} rx={1} fill="#fff1b8" />
        <path d="M30 6 l5 8 h-10 Z" fill="#b38b3c" />
        <circle cx={30} cy={5} r={1.6} fill="#e9cf99" />
      </svg>
    </div>
  );
}

/** motes of light drifting in the sun by day, fireflies low over the garden at night (7 particles) */
export const Motes = memo(function Motes({ width, height, night, still, top = 0.3 }: { width: number; height: number; night: number; still: boolean; top?: number }) {
  if (still) return null;
  const fire = night > 0.5;
  return (
    <div aria-hidden style={{ ...FILL, overflow: "hidden" }}>
      {Array.from({ length: 7 }, (_, i) => {
        const x0 = (((i * 41 + 17) % 90) / 100 + 0.05) * width, y0 = height * (fire ? 0.62 + (i % 3) * 0.08 : top + (i % 4) * 0.1);
        const s = fire ? 4 : 3 + (i % 2);
        const st = {
          position: "absolute", left: 0, top: 0, width: s, height: s, borderRadius: s,
          backgroundColor: fire ? "#ffe08a" : "#fff6dc", boxShadow: `0 0 ${fire ? 6 : 4}px ${fire ? "#ffd25a" : "#fff2c4"}`,
          "--gd-x": `${x0}px`, "--gd-y": `${y0}px`, "--gd-sx": `${(i % 2 ? 1 : -1) * 22 + (fire ? 0 : 15)}px`, "--gd-ex": `${fire ? (i % 2 ? -8 : 8) : 30}px`, "--gd-rise": `${fire ? 40 : 90}px`,
          "--gd-t": `${9000 + (i % 4) * 2200}ms`, "--gd-d": `${i * 1300}ms`,
        } as CSSProperties;
        return <span key={i} className="gd-mote" style={st}>{fire ? <span className="gd-blink" style={{ display: "block", width: "100%", height: "100%", borderRadius: s, background: "inherit" }} /> : null}</span>;
      })}
    </div>
  );
});

/** the dark stage of the planting ceremony with the landscape revealing itself behind it as the steps go on */
export function JourneyStage({ width, height, progress, sky, horizon = 0.4, veil = 0.55, level = 12, still }: { width: number; height: number; progress: number; sky: Sky; horizon?: number; veil?: number; level?: number; still: boolean }) {
  const ground = height * horizon;
  return (
    <div aria-hidden style={{ ...FILL, overflow: "hidden", backgroundColor: STAGE_DEEP }}>
      <SkyFill key={sky.colors.join()} sky={sky} className={still ? undefined : "gd-skyfade"} />
      <Heavens sky={sky} width={width} height={ground} still={still} noMoon />
      <Panorama width={width} height={height} ground={ground} sky={sky} level={level} reveal={progress} still={still} withSky={false} scale={1.6} />
      <div className="gd-reveal" style={{ position: "absolute", left: 0, right: 0, top: ground - 34, bottom: 0, background: `linear-gradient(180deg, rgba(5,28,21,0) 0%, rgba(5,28,21,${Math.min(1, veil + 0.35)}) 20%, ${STAGE_DEEP} 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: ground, background: `linear-gradient(180deg, rgba(5,28,21,${veil * 0.6}) 0%, rgba(5,28,21,0) 60%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ground - 4, height: 1, backgroundColor: "rgba(214,180,108,0.45)" }} />
      <Fronds width={width} height={height} reveal={progress} still={still} />
      <Motes width={width} height={ground} night={sky.night} still={still} top={0.35} />
    </div>
  );
}
