"use client";
// The painted courtyard and the faceless figure of the prayer and wudu trainers, in the garden's illustration language
// (geometry and colours in ./trainerArt.ts, shared 1:1 with the app's features/practice/trainerScene.tsx). Motion is CSS
// only (transform and opacity, the garden's rhythm: slow sine sway, breathing light, drifting mist, twinkling motes) and
// stands still under prefers-reduced-motion.
import { useId, type CSSProperties, type ReactNode } from "react";
import { FIG, GRAD, MAT, MOTES, PROPS, TA, gardenTree, skyline, star8, terrace, type FigureParts, type PostureSet } from "./trainerArt";

export const TS_CSS = `
.ts-sway{transform-box:fill-box;transform-origin:50% 100%;animation:ts-sway 5.5s ease-in-out infinite alternate}
@keyframes ts-sway{from{transform:rotate(-1.4deg)}to{transform:rotate(1.4deg)}}
.ts-breathe{animation:ts-breathe 7s ease-in-out infinite alternate}
@keyframes ts-breathe{from{opacity:.7}to{opacity:1}}
.ts-mist{animation:ts-mist 26s ease-in-out infinite alternate}
@keyframes ts-mist{from{transform:translateX(-18px)}to{transform:translateX(18px)}}
.ts-twinkle{animation:ts-twinkle 3.6s ease-in-out infinite alternate}
@keyframes ts-twinkle{from{opacity:.15}to{opacity:.9}}
.ts-in{animation:ts-in .6s cubic-bezier(.22,1,.36,1) both}
@keyframes ts-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.tg-glass{background:linear-gradient(180deg,rgb(255 255 255/.13),rgb(255 255 255/.045));-webkit-backdrop-filter:blur(22px) saturate(170%);backdrop-filter:blur(22px) saturate(170%);border:1px solid rgb(255 255 255/.17);box-shadow:inset 0 1px 0 rgb(255 255 255/.3),inset 0 -1px 0 rgb(0 0 0/.18),0 20px 44px -24px rgb(0 0 0/.75)}
.tg-dark{background:linear-gradient(180deg,rgb(6 38 28/.62),rgb(4 29 22/.5))}
.tg-btn{transition:transform .18s cubic-bezier(.22,1,.36,1),background-color .18s,filter .18s}
.tg-btn:hover:not(:disabled){filter:brightness(1.12)}
.tg-btn:active:not(:disabled){transform:scale(.96)}
.tg-btn:focus-visible{outline:2px solid #e9cf99;outline-offset:2px}
.tg-btn:disabled{opacity:.35}
.tg-lens{background:linear-gradient(180deg,#f2dfaa,#c6a65e);color:#21180a;box-shadow:inset 0 1px 0 rgb(255 255 255/.65),inset 0 -1px 0 rgb(120 90 30/.35),0 6px 16px -8px rgb(198 166 94/.9)}
.tg-scroll{scrollbar-width:none}.tg-scroll::-webkit-scrollbar{display:none}
@media (prefers-reduced-motion:reduce){.ts-sway,.ts-breathe,.ts-mist,.ts-twinkle,.ts-in{animation:none!important}.ts-twinkle{opacity:.6}}
`;

type Stops = readonly (readonly [number, string, number])[];
const stops = (s: Stops) => s.map(([o, c, a]) => <stop key={o} offset={o} stopColor={c} stopOpacity={a} />);

/** a per-instance id prefix (all SVGs of a page share one id namespace) */
export function useTsId(tag: string) {
  return `${tag}${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/** the gradients every scene uses, ids prefixed with `u` */
export function TsDefs({ u }: { u: string }) {
  return (
    <defs>
      <linearGradient id={`${u}sky`} x1="0" y1="0" x2="0" y2="1">{stops(GRAD.sky)}</linearGradient>
      <radialGradient id={`${u}sun`} cx="0.5" cy="0.5" r="0.5">{stops(GRAD.sun)}</radialGradient>
      <radialGradient id={`${u}aura`} cx="0.5" cy="0.5" r="0.5">{stops(GRAD.aura)}</radialGradient>
      <radialGradient id={`${u}robe`} cx="0.35" cy="0.25" r="0.9">{stops(GRAD.robe)}</radialGradient>
      <radialGradient id={`${u}skin`} cx="0.35" cy="0.3" r="0.85">{stops(GRAD.skin)}</radialGradient>
      <radialGradient id={`${u}leaf`} cx="0.4" cy="0.35" r="0.7">{stops(GRAD.leaf)}</radialGradient>
      <linearGradient id={`${u}marble`} x1="0" y1="0" x2="0" y2="1">{stops(GRAD.marble)}</linearGradient>
      <linearGradient id={`${u}face`} x1="0" y1="0" x2="0" y2="1">{stops(GRAD.face)}</linearGradient>
      <linearGradient id={`${u}mat`} x1="0" y1="0" x2="1" y2="1">{stops(GRAD.mat)}</linearGradient>
      <linearGradient id={`${u}cap`} x1="0" y1="0" x2="1" y2="1">{stops(GRAD.cap)}</linearGradient>
      <linearGradient id={`${u}metal`} x1="0" y1="0" x2="1" y2="1">{stops(GRAD.metal)}</linearGradient>
      <linearGradient id={`${u}water`} x1="0" y1="0" x2="0" y2="1">{stops(GRAD.water)}</linearGradient>
      <linearGradient id={`${u}mist`} x1="0" y1="0" x2="1" y2="0">{stops(GRAD.mist)}</linearGradient>
    </defs>
  );
}

const TREES = { l: gardenTree(16, 0, 22, "salah-l"), r: gardenTree(224, 0, 19, "salah-r") };
function Tree({ u, x, G, side }: { u: string; x: number; G: number; side: "l" | "r" }) {
  const t = TREES[side];
  return (
    <g transform={`translate(${x - t.x} ${G})`}>
      <g className="ts-sway" style={{ animationDuration: side === "l" ? "5.5s" : "6.3s" } as CSSProperties}>
        <path d={t.trunk} fill={TA.trunk} />
        <path d={t.shade} fill={TA.leaf} opacity=".95" />
        <path d={t.body} fill={TA.leaf} />
        <path d={t.lit} fill={`url(#${u}leaf)`} />
        <path d={t.hi} fill={TA.sage} opacity=".38" />
        {t.glints.map(([gx, gy, r], i) => <circle key={i} cx={gx} cy={gy} r={r} fill={TA.goldPale} opacity=".55" />)}
      </g>
    </g>
  );
}

/** the courtyard at dawn: sky, sun glow, domes and minarets in mist, two garden trees, the marble terrace */
export function Courtyard({ u, H, G, children, qibla }: { u: string; H: number; G: number; children?: ReactNode; qibla?: string }) {
  const sky = skyline(G), ter = terrace(G, H);
  return (
    <g>
      <rect x="-20" y="-60" width="280" height={G + 60} fill={`url(#${u}sky)`} />
      <circle cx="120" cy={G - 26} r="120" fill={`url(#${u}sun)`} className="ts-breathe" />
      <path d={sky.far} fill={TA.mint} opacity=".28" />
      <rect x="-30" y={G - 46} width="300" height="34" fill={`url(#${u}mist)`} className="ts-mist" />
      <path d={sky.near} fill={TA.emerald} opacity=".7" />
      <Tree u={u} x={18} G={G} side="l" />
      <Tree u={u} x={232} G={G} side="r" />
      {qibla && (
        <g>
          <circle cx="204" cy={G - 12} r="16" fill={`url(#${u}aura)`} className="ts-breathe" />
          <rect x="196" y={G - 20} width="16" height="18" rx="1" fill="#0b0b0b" />
          <rect x="196" y={G - 15.5} width="16" height="2.2" fill={TA.gold} />
          <path d={`M201 ${G - 9}h3.4v7h-3.4z`} fill={TA.gold} opacity=".55" />
        </g>
      )}
      <path d={ter.top} fill={`url(#${u}marble)`} />
      <path d={ter.face} fill={`url(#${u}face)`} />
      {ter.diamonds.map(([d, c], i) => <path key={i} d={d} fill={c} opacity=".9" />)}
      <path d={ter.rim} stroke={TA.gold} strokeWidth="1" />
      <path d={`M0 ${G}H240`} stroke={TA.glint} strokeOpacity=".5" strokeWidth=".6" />
      {qibla && <text x="204" y={G - 24} textAnchor="middle" fontSize="7" fontWeight="600" letterSpacing=".4" fill={TA.goldPale}>{qibla}</text>}
      {children}
    </g>
  );
}

/** the motes of light that drift in the warm air */
export function Motes() {
  return (
    <g>
      {MOTES.map(([x, y, r, d]) => <path key={`${x}-${y}`} d={star8(x, y, r)} fill={TA.goldPale} className="ts-twinkle" style={{ animationDelay: `-${d}s` }} />)}
    </g>
  );
}

/** the prayer mat on the terrace */
export function Mat({ u }: { u: string }) {
  return (
    <g>
      <path d={MAT.base} fill={`url(#${u}mat)`} />
      <path d={MAT.border} fill="none" stroke={TA.goldHi} strokeOpacity=".8" strokeWidth=".7" />
      <path d={MAT.arch} fill="none" stroke={TA.goldHi} strokeWidth=".8" />
      <path d={MAT.fringe} stroke={TA.goldHi} strokeOpacity=".7" strokeWidth=".6" strokeLinecap="round" />
    </g>
  );
}

/** the figure's group: drawn from the joints, shown smaller around its feet (FIG) */
export const FIG_TRANSFORM = `translate(${FIG.cx} ${FIG.ground}) scale(${FIG.s}) translate(${-FIG.cx} ${-FIG.ground})`;

/** the chair or the cushion under the figure (in the figure's own coordinates, inside FIG_TRANSFORM) */
export function PropsArt({ u, set }: { u: string; set: PostureSet }) {
  if (set === "chair") return (
    <g>
      <path d={PROPS.chairBack} fill="#7a5634" />
      <path d={PROPS.chairLeg} fill={TA.trunk} />
      <path d={PROPS.chairSeat} fill={TA.trunkHi} />
      <path d={PROPS.chairRim} stroke={TA.gold} strokeWidth="1.2" />
    </g>
  );
  if (set === "lying") return <path d={PROPS.cushion} fill={`url(#${u}metal)`} />;
  return null;
}

/** the figure for a set of parts (figureParts of the current, possibly in-between pose) */
export function FigureArt({ u, f, finger, turbah }: { u: string; f: FigureParts; finger?: boolean; turbah?: boolean }) {
  return (
    <g>
      <path d={f.shadow} fill="#000" opacity=".22" />
      {turbah && <g><rect x="165" y="204.6" width="16" height="4.4" rx="1.2" fill="#8a6b45" /><rect x="166.5" y="204.9" width="13" height="1.2" rx=".6" fill="#b89268" /></g>}
      <path d={f.far} fill={TA.far} />
      <path d={f.feet} fill={`url(#${u}skin)`} />
      <path d={f.robe} fill={`url(#${u}robe)`} />
      <path d={f.folds} fill="none" stroke={TA.robeLo} strokeOpacity=".55" strokeWidth="1.2" strokeLinecap="round" />
      <path d={f.shoulder} fill="none" stroke={TA.robeLo} strokeOpacity=".7" strokeWidth="1.2" strokeLinecap="round" />
      <path d={f.robeHi} fill={TA.glint} opacity=".35" />
      <path d={f.sash} fill="none" stroke={TA.gold} strokeWidth="1.6" strokeLinecap="round" />
      <path d={f.neck} fill={`url(#${u}skin)`} />
      <path d={f.head} fill={`url(#${u}skin)`} />
      <path d={f.headHi} fill={TA.glint} opacity=".28" />
      <path d={f.cap} fill={`url(#${u}cap)`} />
      <path d={f.band} fill="none" stroke={TA.goldHi} strokeWidth="1.6" strokeLinecap="round" />
      <path d={f.hood} fill={`url(#${u}robe)`} />
      <path d={f.face} fill={`url(#${u}skin)`} />
      <path d={f.trim} fill="none" stroke={TA.gold} strokeWidth="1.5" strokeLinecap="round" />
      <path d={f.arm} fill="none" stroke={TA.robeLo} strokeOpacity=".8" strokeWidth="1.4" />
      <path d={f.arm} fill={`url(#${u}robe)`} />
      <path d={f.cuff} stroke={TA.gold} strokeWidth="1.4" strokeLinecap="round" />
      <path d={f.hand} fill={`url(#${u}skin)`} />
      {finger && <path d={f.finger} fill={`url(#${u}skin)`} />}
    </g>
  );
}

/** small glyphs of the glass controls (mirrored in right-to-left text) */
export function Glyph({ name, className = "h-5 w-5" }: { name: "prev" | "next" | "play" | "pause" | "restart" | "chevron"; className?: string }) {
  const flip = name === "prev" || name === "next" || name === "chevron" ? " rtl:-scale-x-100" : "";
  return (
    <svg viewBox="0 0 24 24" className={`${className}${flip}`} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {name === "prev" && <path d="M14.5 5.5L8 12l6.5 6.5" />}
      {(name === "next" || name === "chevron") && <path d="M9.5 5.5L16 12l-6.5 6.5" />}
      {name === "play" && <path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.2-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6z" fill="currentColor" stroke="none" />}
      {name === "pause" && <path d="M8 5v14M16 5v14" strokeWidth="3.2" />}
      {name === "restart" && <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4" />}
    </svg>
  );
}
