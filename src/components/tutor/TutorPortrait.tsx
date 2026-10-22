"use client";

import { useId } from "react";
import { TUTOR_ART, paint, shapesAt, type ArtGrad, type ArtShape, type TutorPersonaArt } from "@/lib/tutorArt";

// Renders a tutor portrait from the shared art data (src/lib/tutorArt.ts; the app draws the same data in
// mobile/src/features/tutor/Portrait.tsx). Idle motion is pure CSS (breathing, an occasional blink, a glow while
// speaking) and only runs with prefers-reduced-motion: no-preference.

const CSS = `
@media (prefers-reduced-motion: no-preference) {
  .tutor-anim .tutor-breath { animation: tutor-breathe 4s ease-in-out infinite; }
  .tutor-anim .tutor-lids { animation: tutor-blink 5.2s linear infinite; }
  .tutor-anim .tutor-eyes { animation: tutor-eyes 5.2s linear infinite; }
  .tutor-anim .tutor-glow { animation: tutor-glow 1.6s ease-in-out infinite; }
}
@keyframes tutor-breathe { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-1.2px) scale(1.015); } }
@keyframes tutor-blink { 0%, 93% { opacity: 0; } 93.4%, 95.4% { opacity: 1; } 95.8%, 100% { opacity: 0; } }
@keyframes tutor-eyes { 0%, 93% { opacity: 1; } 93.4%, 95.4% { opacity: 0; } 95.8%, 100% { opacity: 1; } }
@keyframes tutor-glow { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.85; } }
`;

function Grad({ g, p }: { g: ArtGrad; p: string }) {
  const stops = g.stops.map(([o, c, a], i) => <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />);
  return g.radial
    ? <radialGradient id={p + g.id} cx={g.cx} cy={g.cy} r={g.r}>{stops}</radialGradient>
    : <linearGradient id={p + g.id} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}>{stops}</linearGradient>;
}

function Shapes({ shapes, size, p }: { shapes: ArtShape[]; size: number; p: string }) {
  return <>{shapesAt(shapes, size).map((s, i) => <path key={i} d={s.d} fill={paint(s.fill, p)} stroke={s.stroke ? paint(s.stroke, p) : undefined} strokeWidth={s.sw} strokeLinecap="round" strokeLinejoin="round" opacity={s.op} />)}</>;
}

export default function TutorPortrait({ persona, size = 40, still = false, speaking = false, className = "" }: { persona: TutorPersonaArt; size?: number; still?: boolean; speaking?: boolean; className?: string }) {
  const art = TUTOR_ART[persona];
  const p = `${persona}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}-`;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={art.label} className={`${still ? "" : "tutor-anim "}${className}`.trim()}>
      <style>{CSS}</style>
      <defs>
        {art.grads.map((g) => <Grad key={g.id} g={g} p={p} />)}
        <clipPath id={p + "clip"}><circle cx="100" cy="100" r="97" /></clipPath>
      </defs>
      <g clipPath={`url(#${p}clip)`}>
        <Shapes shapes={art.back} size={size} p={p} />
        <g className="tutor-breath" style={{ transformBox: "view-box", transformOrigin: "100px 200px" }}>
          <Shapes shapes={art.bust} size={size} p={p} />
          <g className="tutor-eyes"><Shapes shapes={art.eyes} size={size} p={p} /></g>
          <g className="tutor-lids" opacity={0}><Shapes shapes={art.lids} size={size} p={p} /></g>
        </g>
      </g>
      {speaking ? <circle className="tutor-glow" cx="100" cy="100" r="95" fill="none" stroke="#f3dfa2" strokeWidth={5} opacity={0.5} /> : null}
      <circle cx="100" cy="100" r="96" fill="none" stroke={`url(#${p}gold)`} strokeWidth={2.4} />
      {size >= 40 ? <circle cx="100" cy="100" r="92.5" fill="none" stroke="#e8c877" strokeWidth={0.6} opacity={0.45} /> : null}
    </svg>
  );
}
