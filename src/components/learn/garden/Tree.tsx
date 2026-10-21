"use client";
// mirrors mobile/src/features/garden/Tree.tsx
// DESIGN FROZEN (owner approved, tag garten-design-v1) — do not change visuals; only bug fixes.
// Web port: react-native-svg converted 1:1 to DOM SVG (same paths, colours, sizes). Gradient ids carry a per-instance
// prefix, because on the web all SVGs of a page share one id namespace. The Reanimated wind (sway, leaf flutter and an
// occasional gust, a rustle on tap) is a set of CSS animations around the crown layer (gd-* in Scene.tsx), frozen under
// prefers-reduced-motion.
import { memo, useId, useMemo } from "react";
import type { CSSProperties } from "react";
import type { Season, Trait, TreeType } from "@/lib/learn/garden/garden";

export const TREE_W = 300, TREE_H = 360;
const GROUND = 312, CX = 150;
export const CALLIG = '"Aref Ruqaa", "Amiri", serif';

const rng = (seed: string) => { let x = 2166136261; for (let i = 0; i < seed.length; i++) x = Math.imul(x ^ seed.charCodeAt(i), 16777619); x >>>= 0; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 10000) / 10000; }; };

/** a DOM-safe unique id prefix (useId may contain colons or guillemets) */
export function useUid(tag: string): string {
  const id = useId();
  return `${tag}${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

type Pal = { leaf: [string, string, string]; trunk: [string, string]; fruit: [string, string]; blossom: string };
const PAL: Record<TreeType, Pal> = {
  palm: { leaf: ["#1f6b4a", "#3f9a68", "#9fd28a"], trunk: ["#6d4a2b", "#a87a4a"], fruit: ["#c9761e", "#f3b14a"], blossom: "#f6e7b8" },
  olive: { leaf: ["#4d6b55", "#7f9c84", "#c6d6c0"], trunk: ["#5b4a3a", "#9a8366"], fruit: ["#3d2a40", "#7a5a7e"], blossom: "#f4f1de" },
  fig: { leaf: ["#1d5c3c", "#2f8456", "#7fc48a"], trunk: ["#7c7466", "#b7ad98"], fruit: ["#5a2a4a", "#a0517e"], blossom: "#efe6c8" },
  pomegranate: { leaf: ["#1a5a35", "#2e8048", "#86c06c"], trunk: ["#5e4030", "#94684a"], fruit: ["#9c1f2a", "#e2483c"], blossom: "#ff7a4d" },
  sidr: { leaf: ["#3a6a2c", "#6a9a3e", "#c3d983"], trunk: ["#6a5236", "#a8865a"], fruit: ["#c78a1c", "#f2c34a"], blossom: "#f8eebf" },
};

type Props = { id: string; type: TreeType; stage: number; traits?: Trait[]; season?: Season; resting?: boolean; fruits?: number; size?: number; still?: boolean; /** change it to rustle the crown (a tap) */ nudge?: number };

/** trunk height and crown size for a stage (shared with the scene for decorations) */
export function geom(type: TreeType, stage: number) {
  const k = Math.max(0, stage - 2) / 10;
  const h = stage < 3 ? 14 + stage * 14 : 70 + k * (type === "palm" ? 200 : 140);
  const crown = stage < 3 ? 0 : 36 + k * (type === "palm" ? 70 : 104);
  return { h, crown, top: GROUND - h, w: stage < 3 ? 2 : 6 + k * (type === "palm" ? 10 : 22) };
}

export const TreeArt = memo(function TreeArt({ id, type, stage, traits = [], season = null, resting = false, fruits = 0, size = 300, still = false, nudge = 0 }: Props) {
  const u = useUid("t");
  const g = geom(type, stage);
  const scale = size / TREE_W;
  const pivotY = (stage < 3 ? GROUND : g.top + g.crown * 0.3) * scale;
  const back = useMemo(() => <Back u={u} id={id} type={type} stage={stage} traits={traits} resting={resting} />, [u, id, type, stage, traits, resting]);
  const front = useMemo(() => <Crown u={u} id={id} type={type} stage={stage} traits={traits} season={season} resting={resting} fruits={fruits} />, [u, id, type, stage, traits, season, resting, fruits]);
  const h = (TREE_H * size) / TREE_W;
  const young = stage < 3;
  const seed = (id.length * 977) % 3000;
  const layer: CSSProperties = { position: "absolute", inset: 0, transformOrigin: `50% ${pivotY}px` };
  const vars = { "--gd-a": `${young ? 3 : 1.4}deg`, "--gd-b": `${young ? 1.6 : 0.9}deg`, "--gd-g": `${young ? 4.1 : 2.3}deg`, "--gd-gd": `${seed}ms` } as CSSProperties;
  const moving = !still && stage >= 1;
  return (
    <div style={{ position: "relative", width: size, height: h, ...vars }} aria-hidden>
      <svg width={size} height={h} viewBox={`0 0 ${TREE_W} ${TREE_H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>{back}</svg>
      <div key={nudge} className={nudge && !still ? "gd-kick" : undefined} style={layer}>
        <div className={moving ? "gd-gust" : undefined} style={layer}>
          <div className={moving ? "gd-sway" : undefined} style={layer}>
            <div className={moving ? "gd-flutter" : undefined} style={layer}>
              <svg width={size} height={h} viewBox={`0 0 ${TREE_W} ${TREE_H}`} style={{ overflow: "visible" }}>{front}</svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ---------- trunk, roots, ground ----------
function Back({ u, id, type, stage, traits: _traits, resting }: { u: string; id: string; type: TreeType; stage: number; traits: Trait[]; resting: boolean }) {
  const p = PAL[type];
  const g = geom(type, stage);
  const r = rng(id + "t");
  const dim = resting ? 0.75 : 1;
  const basin = 30 + Math.min(stage, 12) * 3.2;
  const tb0 = rng(id + "k")(), tb = () => tb0;
  const U = (x: string) => `url(#${u}${x})`;
  return (
    <g opacity={dim}>
      <defs>
        <linearGradient id={`${u}bface`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f4a39" /><stop offset="1" stopColor="#06261c" /></linearGradient>
        <radialGradient id={`${u}aura`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe6a6" stopOpacity={0.4} /><stop offset="1" stopColor="#ffe6a6" stopOpacity={0} /></radialGradient>
        <linearGradient id={`${u}trkHi`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffffff" stopOpacity={0} /><stop offset="0.5" stopColor="#fff3d6" stopOpacity={0.35} /><stop offset="1" stopColor="#ffffff" stopOpacity={0} /></linearGradient>
        <linearGradient id={`${u}trk`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={p.trunk[0]} /><stop offset="0.55" stopColor={p.trunk[1]} /><stop offset="1" stopColor={p.trunk[0]} /></linearGradient>
        <radialGradient id={`${u}soil`} cx="0.5" cy="0.4" r="0.6"><stop offset="0" stopColor="#7a5634" /><stop offset="1" stopColor="#3e2a18" /></radialGradient>
      </defs>
      {/* a light behind the crown of old trees */}
      {stage >= 9 ? <circle cx={CX} cy={g.top + g.crown * 0.55} r={g.crown * 1.25} fill={U("aura")} /> : null}
      {/* the raised marble basin with a zellige face and a gold rim, soil inside */}
      <ellipse cx={CX} cy={GROUND + 14} rx={basin + 8} ry={7} fill="#000" opacity={0.18} />
      <path d={`M${CX - basin} ${GROUND + 2} L${CX - basin} ${GROUND + 9} A${basin} ${9 + stage * 0.4} 0 0 0 ${CX + basin} ${GROUND + 9} L${CX + basin} ${GROUND + 2} Z`} fill={U("bface")} />
      {Array.from({ length: Math.floor(basin / 7) }, (_, i) => { const t = (i + 0.5) / Math.floor(basin / 7), x = CX - basin * 0.92 + t * basin * 1.84, y = GROUND + 6 + Math.sqrt(Math.max(0, 1 - ((x - CX) / basin) ** 2)) * (9 + stage * 0.4) * 0.85; return <path key={i} d={`M${x} ${y - 2.6} l2.6 2.6 l-2.6 2.6 l-2.6 -2.6 Z`} fill={i % 2 ? "#d6b46c" : "#f2e9d2"} opacity={0.9} />; })}
      <ellipse cx={CX} cy={GROUND + 2} rx={basin} ry={9 + stage * 0.4} fill="#efe4c8" />
      <ellipse cx={CX} cy={GROUND + 2} rx={basin} ry={9 + stage * 0.4} fill="none" stroke="#c6a65e" strokeWidth={1.2} />
      <ellipse cx={CX} cy={GROUND + 2.5} rx={basin - 5} ry={6.5 + stage * 0.35} fill={U("soil")} />
      <ellipse cx={CX - basin * 0.3} cy={GROUND - 0.5} rx={basin * 0.35} ry={1.4} fill="#ffffff" opacity={0.35} />
      {stage === 0 ? (
        <g>
          <ellipse cx={CX} cy={GROUND - 1} rx={9} ry={6} fill="#8c5f32" />
          <path d={`M${CX - 6} ${GROUND - 3} Q${CX} ${GROUND - 9} ${CX + 6} ${GROUND - 3}`} stroke="#e9cf99" strokeWidth={1.4} fill="none" />
          <circle cx={CX + 3} cy={GROUND - 4} r={1.6} fill="#fff6d8" />
        </g>
      ) : stage < 3 ? (
        <g>
          <path d={`M${CX} ${GROUND} Q${CX - 4} ${GROUND - g.h / 2} ${CX + 2} ${GROUND - g.h}`} stroke="#3f7a32" strokeWidth={2.4 + stage} fill="none" strokeLinecap="round" />
          <path d={`M${CX - 0.6} ${GROUND - 2} Q${CX - 4.6} ${GROUND - g.h / 2} ${CX + 0.8} ${GROUND - g.h + 2}`} stroke="#a7d68a" strokeWidth={0.9} fill="none" opacity={0.7} strokeLinecap="round" />
        </g>
      ) : type === "palm" ? (
        <PalmTrunk u={u} g={g} stage={stage} />
      ) : (
        <g>
          {/* roots */}
          {stage >= 6 ? [-1, 1, -0.5, 0.6].map((d, i) => <path key={i} d={`M${CX + d * 4} ${GROUND - 4} Q${CX + d * 18} ${GROUND - 2} ${CX + d * (26 + r() * 16)} ${GROUND + 4}`} stroke={p.trunk[0]} strokeWidth={5 - i} fill="none" strokeLinecap="round" />) : null}
          {/* trunk: two or three twisted strands for old olive / sidr, one tapered trunk otherwise */}
          <path d={trunkPath(g, type === "olive" || type === "sidr" ? 0.35 : 0.12, tb)} fill={U("trk")} />
          <path d={trunkPath({ ...g, w: g.w * 0.5 }, type === "olive" || type === "sidr" ? 0.35 : 0.12, tb)} fill={U("trkHi")} transform={`translate(${-g.w * 0.18} 0)`} />
          {(type === "olive" || type === "sidr") && stage >= 7 ? <path d={trunkPath({ ...g, w: g.w * 0.55 }, -0.5, r)} fill={p.trunk[0]} opacity={0.6} /> : null}
          {/* bark lines */}
          {Array.from({ length: Math.min(10, stage) }, (_, i) => { const y = GROUND - 10 - r() * g.h * 0.7; const x = CX + (r() - 0.5) * g.w * 0.6; return <path key={i} d={`M${x} ${y} q${(r() - 0.5) * 4} ${-6 - r() * 8} ${(r() - 0.5) * 3} ${-14 - r() * 6}`} stroke={p.trunk[0]} strokeWidth={0.9} opacity={0.55} fill="none" />; })}
          {/* branches to the crown clusters */}
          {branchTips(id, type, stage).map((b, i) => <path key={`b${i}`} d={`M${CX + (b.x - CX) * 0.1} ${g.top + g.crown * 0.55} Q${(CX + b.x) / 2} ${b.y + 18} ${b.x} ${b.y}`} stroke={p.trunk[1]} strokeWidth={Math.max(1.4, g.w * 0.22 - i * 0.3)} fill="none" strokeLinecap="round" />)}
        </g>
      )}
    </g>
  );
}
function trunkPath(g: { h: number; w: number; top: number; crown: number }, twist: number, r: () => number) {
  const top = g.top + g.crown * 0.5, w = g.w, tw = w * 0.45, bend = twist * 30 * (r() > 0.5 ? 1 : -1);
  return `M${CX - w} ${GROUND} C${CX - w * 0.6 + bend} ${GROUND - g.h * 0.4} ${CX - tw - bend} ${top + 40} ${CX - tw} ${top} L${CX + tw} ${top} C${CX + tw - bend} ${top + 40} ${CX + w * 0.6 + bend} ${GROUND - g.h * 0.4} ${CX + w} ${GROUND} Z`;
}
function PalmTrunk({ u, g, stage }: { u: string; g: ReturnType<typeof geom>; stage: number }) {
  const top = g.top, n = Math.floor(g.h / 9), bend = 10 + stage;
  const xAt = (t: number) => CX + Math.sin(t * 1.4) * bend * t;
  return (
    <g>
      <path d={`M${CX - g.w} ${GROUND} Q${CX + bend * 0.2} ${GROUND - g.h * 0.5} ${xAt(1) - g.w * 0.5} ${top} L${xAt(1) + g.w * 0.5} ${top} Q${CX + bend * 0.6 + g.w} ${GROUND - g.h * 0.5} ${CX + g.w} ${GROUND} Z`} fill={`url(#${u}trk)`} />
      {Array.from({ length: n }, (_, i) => { const t = (i + 0.5) / n, y = GROUND - t * g.h, x = CX + (xAt(1) - CX) * t * t, w = g.w * (1 - t * 0.45); return <path key={i} d={`M${x - w} ${y + 3} Q${x} ${y - 3} ${x + w} ${y + 3}`} stroke="#4a3018" strokeWidth={1.1} fill="none" opacity={0.6} />; })}
    </g>
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
function Crown({ u, id, type, stage, traits, season, resting, fruits }: { u: string; id: string; type: TreeType; stage: number; traits: Trait[]; season: Season; resting: boolean; fruits: number }) {
  const p = PAL[type];
  const g = geom(type, stage);
  const r = rng(id + "c");
  const dim = resting ? 0.55 : 1;
  if (stage === 0) return <g />;
  if (stage < 3) {
    const top = GROUND - g.h;
    return (
      <g opacity={dim}>
        {Array.from({ length: stage * 2 }, (_, i) => { const s = i % 2 ? 1 : -1, y = top + i * 5; return <path key={i} d={`M${CX + 2} ${y} q${s * 10} ${-8} ${s * 18} ${-2} q${-s * 8} ${8} ${-s * 18} ${2}`} fill={i % 2 ? p.leaf[1] : p.leaf[2]} />; })}
      </g>
    );
  }
  const ripe = Math.min(fruits + (stage >= 5 ? 2 : 0), 10);
  const lanterns = traits.includes("lanterns") || season === "ramadan";
  const U = (x: string) => `url(#${u}${x})`;
  return (
    <g>
      <defs>
        <radialGradient id={`${u}lf`} cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor={p.leaf[2]} /><stop offset="0.5" stopColor={p.leaf[1]} /><stop offset="1" stopColor={p.leaf[0]} /></radialGradient>
        <radialGradient id={`${u}fr`} cx="0.35" cy="0.3" r="0.7"><stop offset="0" stopColor="#fff2c4" /><stop offset="0.3" stopColor={p.fruit[1]} /><stop offset="1" stopColor={p.fruit[0]} /></radialGradient>
        <radialGradient id={`${u}glow`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe9a8" stopOpacity={0.75} /><stop offset="1" stopColor="#ffe9a8" stopOpacity={0} /></radialGradient>
      </defs>
      <g opacity={dim}>{type === "palm" ? <Fronds u={u} g={g} stage={stage} p={p} r={r} /> : <Clusters u={u} id={id} type={type} stage={stage} p={p} r={r} />}</g>
      {/* blossoms */}
      {traits.includes("blossoms") || (type === "pomegranate" && stage >= 6) ? Array.from({ length: Math.min(14, stage + 4) }, (_, i) => { const [x, y] = inCrown(type, g, r); return <g key={`bl${i}`}>{[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={x + Math.cos(k * 1.2566) * 1.9} cy={y + Math.sin(k * 1.2566) * 1.9} r={1.6} fill={p.blossom} />)}<circle cx={x} cy={y} r={1.1} fill="#d6a93a" /><circle cx={x - 0.6} cy={y - 0.8} r={0.5} fill="#fffbe8" /></g>; }) : null}
      {/* glowing fruits */}
      {stage >= 5 && !resting ? Array.from({ length: ripe }, (_, i) => {
        const [x, y] = type === "palm" ? [CX + (i % 2 ? 1 : -1) * (8 + (i >> 1) * 5) + (r() - 0.5) * 6, g.top + 14 + (i >> 1) * 4] : inCrown(type, g, r);
        const fr = type === "palm" ? 3 : type === "olive" || type === "sidr" ? 3.2 : 5;
        return <g key={`f${i}`}><circle cx={x} cy={y} r={fr * 2.6} fill={U("glow")} />{type === "olive" ? <ellipse cx={x} cy={y} rx={fr * 0.8} ry={fr * 1.1} fill={U("fr")} /> : <circle cx={x} cy={y} r={fr} fill={U("fr")} />}<circle cx={x - fr * 0.35} cy={y - fr * 0.4} r={fr * 0.28} fill="#fffbe8" opacity={0.85} />{type === "pomegranate" ? <path d={`M${x - 1.5} ${y - fr} l1.5 -2.4 l1.5 2.4`} fill={p.fruit[0]} /> : null}</g>;
      }) : null}
      {/* hanging lanterns (Ramadan or the lantern sticker) */}
      {lanterns ? [-0.6, 0.15, 0.7].slice(0, stage >= 6 ? 3 : 1).map((k, i) => { const x = CX + k * g.crown, y0 = g.top + g.crown * 0.75, y = y0 + 16 + i * 4; return (
        <g key={`ln${i}`}><line x1={x} y1={y0} x2={x} y2={y - 6} stroke="#c6a65e" strokeWidth={0.8} /><circle cx={x} cy={y + 2} r={11} fill={U("glow")} />
          <path d={`M${x - 4} ${y - 6} h8 l2 4 v8 l-2 3 h-8 l-2 -3 v-8 Z`} fill="#d9b25c" stroke="#8a6a2c" strokeWidth={0.6} /><rect x={x - 2.4} y={y - 1} width={4.8} height={6} fill="#fff1b8" opacity={0.95} /></g>
      ); }) : null}
      {/* Eid bunting of small triangles across the crown */}
      {season === "eid" ? <g>{Array.from({ length: 9 }, (_, i) => { const x = CX - g.crown + (i * 2 * g.crown) / 8, y = g.top + g.crown * 0.9 + Math.sin((i / 8) * Math.PI) * 10; return <path key={i} d={`M${x - 4} ${y} l8 0 l-4 8 Z`} fill={i % 2 ? "#c6a65e" : "#2f8f6a"} />; })}</g> : null}
      {/* Ramadan crescent garland (the Ramadan completion reward, or during Ramadan) */}
      {traits.includes("garland") || season === "ramadan" ? <g>{Array.from({ length: 7 }, (_, i) => { const x = CX - g.crown * 0.9 + (i * 1.8 * g.crown) / 6, y = g.top + g.crown * 0.35 + Math.sin((i / 6) * Math.PI) * 14; return i % 2 ? <Star8 key={i} x={x} y={y} r={3.2} /> : <path key={i} d={`M${x + 2} ${y - 5} a5 5 0 1 0 0 10 a4 4 0 1 1 0 -10 Z`} fill="#f3e2b6" />; })}</g> : null}
      {traits.includes("crescent") ? <path d={`M${CX + 8} ${g.top - 26} a12 12 0 1 0 0 20 a9 9 0 1 1 0 -20 Z`} fill="#f3e2b6" /> : null}
      {traits.includes("star") ? <Star8 x={CX - (traits.includes("crescent") ? 18 : 0)} y={g.top - 18} r={7} /> : null}
    </g>
  );
}
function inCrown(type: TreeType, g: ReturnType<typeof geom>, r: () => number): [number, number] {
  const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.85;
  const wide = type === "fig" || type === "sidr" ? 1.15 : 1;
  return [CX + Math.cos(a) * g.crown * wide * d, g.top + g.crown * 0.55 + Math.sin(a) * g.crown * 0.62 * d];
}
/** a lobed, cloud-like foliage mass (the painterly shape of a crown cluster) */
function blob(cx: number, cy: number, rad: number, r: () => number, lobes = 8, flat = 0.9): string {
  const pts = Array.from({ length: lobes }, (_, i) => { const a = (i / lobes) * Math.PI * 2 + r() * 0.3; return { a, k: 0.86 + r() * 0.14 }; });
  const at = (a: number, k: number) => `${(cx + Math.cos(a) * rad * k).toFixed(1)} ${(cy + Math.sin(a) * rad * k * flat).toFixed(1)}`;
  let d = `M${at(pts[0].a, pts[0].k)}`;
  for (let i = 0; i < lobes; i++) {
    const p0 = pts[i], p1 = pts[(i + 1) % lobes], a1 = i + 1 === lobes ? p1.a + Math.PI * 2 : p1.a, m = (p0.a + a1) / 2;
    d += ` Q${at(m, 1.2 + r() * 0.18)} ${at(p1.a, p1.k)}`;
  }
  return d + " Z";
}
function Fronds({ u, g, stage, p, r }: { u: string; g: ReturnType<typeof geom>; stage: number; p: Pal; r: () => number }) {
  const n = Math.min(16, 5 + stage);
  const top = g.top, bend = 10 + stage, tx = CX + Math.sin(1.4) * bend;
  const fronds = Array.from({ length: n }, (_, i) => {
    const a = Math.PI + (i / (n - 1)) * Math.PI + (r() - 0.5) * 0.25;
    const len = g.crown * (0.8 + r() * 0.4);
    const ex = tx + Math.cos(a) * len, ey = top + Math.sin(a) * len * 0.5 + len * 0.42;
    const mx = tx + Math.cos(a) * len * 0.55, my = top + Math.sin(a) * len * 0.55 - 8;
    return { a, len, ex, ey, mx, my, back: i % 2 === 0 };
  });
  // back fronds first (darker), front fronds on top; each frond: a soft blade, then drooping leaflets in two tones
  const one = (f: (typeof fronds)[number], k: number) => {
    const at = (t: number) => { const v = 1 - t; return [v * v * tx + 2 * v * t * f.mx + t * t * f.ex, v * v * top + 2 * v * t * (f.my - 10) + t * t * f.ey]; };
    let dark = "", light = "";
    const m = stage >= 5 ? 14 : 9;
    for (let j = 1; j <= m; j++) {
      const t = j / (m + 1), [x, y] = at(t), l = f.len * 0.26 * Math.sin(t * Math.PI * 0.9 + 0.15);
      const right = Math.cos(f.a) > 0 ? 1 : -1;
      dark += `M${x.toFixed(1)} ${y.toFixed(1)} q${(Math.cos(f.a + 1.2 * right) * l * 0.5).toFixed(1)} ${(l * 0.3).toFixed(1)} ${(Math.cos(f.a + 1.0 * right) * l).toFixed(1)} ${(l * 0.95).toFixed(1)} `;
      light += `M${x.toFixed(1)} ${y.toFixed(1)} q${(Math.cos(f.a - 0.9 * right) * l * 0.4).toFixed(1)} ${(-l * 0.15).toFixed(1)} ${(Math.cos(f.a - 0.7 * right) * l * 0.8).toFixed(1)} ${(l * 0.45).toFixed(1)} `;
    }
    return (
      <g key={k} opacity={f.back ? 0.9 : 1}>
        <path d={`M${tx} ${top} Q${f.mx} ${f.my - 10} ${f.ex} ${f.ey} Q${f.mx} ${f.my + 8} ${tx} ${top + 3} Z`} fill={f.back ? p.leaf[0] : `url(#${u}lf)`} opacity={0.55} />
        <path d={dark} stroke={f.back ? p.leaf[0] : p.leaf[1]} strokeWidth={stage >= 6 ? 2.6 : 2} fill="none" strokeLinecap="round" />
        <path d={light} stroke={f.back ? p.leaf[1] : p.leaf[2]} strokeWidth={stage >= 6 ? 2.2 : 1.7} fill="none" strokeLinecap="round" />
        <path d={`M${tx} ${top} Q${f.mx} ${f.my - 10} ${f.ex} ${f.ey}`} stroke={f.back ? p.leaf[0] : "#e9d7a0"} strokeWidth={1.1} fill="none" opacity={f.back ? 0.8 : 0.55} />
      </g>
    );
  };
  return (
    <g>
      {fronds.filter((f) => f.back).map(one)}
      {fronds.filter((f) => !f.back).map((f, k) => one(f, 100 + k))}
      <circle cx={tx} cy={top + 2} r={g.w * 0.8} fill={p.trunk[0]} />
      <circle cx={tx - g.w * 0.25} cy={top} r={g.w * 0.3} fill="#f3e2b6" opacity={0.35} />
    </g>
  );
}
function Clusters({ u, id, type, stage, p, r }: { u: string; id: string; type: TreeType; stage: number; p: Pal; r: () => number }) {
  const g = geom(type, stage);
  const tips = branchTips(id, type, stage);
  const blobK = type === "fig" ? 1.25 : type === "olive" ? 0.9 : 1;
  const leaves = Math.min(56, 12 + stage * 4);
  const flat = type === "olive" ? 0.78 : 0.9;
  const R0 = g.crown * 0.42 * blobK, R1 = g.crown * 0.36 * blobK;
  return (
    <g>
      {/* deep shadow masses, the body of the crown, then lit clusters with soft highlights */}
      {tips.map((b, i) => <path key={`s${i}`} d={blob(b.x + 4, b.y + 9, R0, r, 8, flat)} fill={p.leaf[0]} opacity={0.95} />)}
      <path d={blob(CX, g.top + g.crown * 0.6, g.crown * (type === "fig" || type === "sidr" ? 1.05 : 0.9), r, 11, 0.62)} fill={p.leaf[0]} />
      {tips.map((b, i) => <path key={`c${i}`} d={blob(b.x, b.y, R1, r, 9, flat)} fill={`url(#${u}lf)`} />)}
      {tips.map((b, i) => <path key={`h${i}`} d={blob(b.x - R1 * 0.22, b.y - R1 * 0.28, R1 * 0.52, r, 7, flat)} fill={p.leaf[2]} opacity={0.38} />)}
      {/* single leaves for texture, shaped per type */}
      {Array.from({ length: leaves }, (_, i) => {
        const [x, y] = inCrown(type, g, r), a = r() * 360, s = type === "fig" ? 7 : type === "olive" ? 5 : 4.5;
        const fill = i % 4 === 0 ? p.leaf[2] : i % 4 === 1 ? p.leaf[0] : p.leaf[1];
        const d = type === "fig"
          ? `M0 0 c-3 -3 -6 -1 -5 -5 c-3 -2 0 -6 3 -4 c1 -3 5 -3 5 0 c3 -2 6 2 3 4 c1 4 -2 6 -6 5 Z`
          : type === "olive" ? `M0 0 q${s * 0.4} ${-s} 0 ${-s * 2.2} q${-s * 0.4} ${s} 0 ${s * 2.2} Z` : `M0 0 q${s * 0.7} ${-s * 0.8} 0 ${-s * 1.8} q${-s * 0.7} ${s * 0.8} 0 ${s * 1.8} Z`;
        return <path key={i} d={d} fill={fill} opacity={0.92} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(0)})`} />;
      })}
      {/* sun-kissed edge: a few gold glints on the upper left of each cluster */}
      {tips.map((b, i) => <g key={`g${i}`}>{[0, 1, 2].map((k) => { const a = Math.PI * (1.05 + k * 0.17 + r() * 0.1); return <circle key={k} cx={b.x + Math.cos(a) * R1 * 0.9} cy={b.y + Math.sin(a) * R1 * 0.85 * flat} r={1.1 + r() * 0.8} fill="#f3e2b6" opacity={0.55} />; })}</g>)}
      <ellipse cx={CX - g.crown * 0.25} cy={g.top + g.crown * 0.25} rx={g.crown * 0.4} ry={g.crown * 0.18} fill="#fff6dc" opacity={0.08} />
    </g>
  );
}
export function Star8({ x, y, r, fill = "#e9cf99" }: { x: number; y: number; r: number; fill?: string }) {
  const pts = Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8 - Math.PI / 2, rr = i % 2 ? r * 0.55 : r; return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`; });
  return <path d={`M${pts.join(" L")} Z`} fill={fill} />;
}
/** the tree's name on a gold calligraphic plaque */
export function Plaque({ name, width = 160 }: { name: string; width?: number }) {
  const u = useUid("pq");
  return (
    <svg width={width} height={width * 0.28} viewBox="0 0 200 56" role="img" aria-label={name}>
      <defs><linearGradient id={`${u}pg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3e2b6" /><stop offset="0.5" stopColor="#c6a65e" /><stop offset="1" stopColor="#8a6a2c" /></linearGradient></defs>
      <path d="M14 4 H186 Q196 4 196 14 V42 Q196 52 186 52 H14 Q4 52 4 42 V14 Q4 4 14 4 Z" fill={`url(#${u}pg)`} />
      <path d="M18 9 H182 Q190 9 190 17 V39 Q190 47 182 47 H18 Q10 47 10 39 V17 Q10 9 18 9 Z" fill="#0b3d2e" stroke="#e9cf99" strokeWidth={0.8} />
      <text x={100} y={36} fontSize={name.length > 16 ? 15 : 19} fontFamily={CALLIG} fill="#f3e2b6" textAnchor="middle">{name}</text>
    </svg>
  );
}
