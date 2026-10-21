"use client";
// mirrors mobile/src/features/garden/Scene.tsx (Petals) and holds the motion of the garden on the web.
// DESIGN FROZEN (owner approved, tag garten-design-v1) — do not change visuals; only bug fixes.
// The app moves the scene with Reanimated on the UI thread; the website uses CSS keyframes (transform and opacity only),
// the same rhythm and amplitudes, and freezes everything under prefers-reduced-motion (the app's Reduce Motion).
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

const CSS = `
.gd-sway{animation:gd-sway 2.75s ease-in-out infinite alternate}
@keyframes gd-sway{from{transform:rotate(calc(var(--gd-a)*-1))}to{transform:rotate(var(--gd-a))}}
.gd-flutter{animation:gd-flutter 1.8s ease-in-out infinite alternate}
@keyframes gd-flutter{from{transform:skewX(calc(var(--gd-b)*-1))}to{transform:skewX(var(--gd-b))}}
.gd-gust{animation:gd-gust 10.5s ease-in-out var(--gd-gd,0ms) infinite}
@keyframes gd-gust{0%,62%{transform:rotate(0)}75%{transform:rotate(var(--gd-g))}100%{transform:rotate(0)}}
.gd-kick{animation:gd-kick 1.17s ease-out 1}
@keyframes gd-kick{0%{transform:rotate(0)}9%{transform:rotate(3.2deg)}28%{transform:rotate(-2.2deg)}50%{transform:rotate(1.1deg)}72%{transform:rotate(-.4deg)}100%{transform:rotate(0)}}
.gd-twinkle{animation:gd-twinkle var(--gd-t,3.6s) ease-in-out var(--gd-d,0ms) infinite alternate}
@keyframes gd-twinkle{from{opacity:var(--gd-o,1)}to{opacity:calc(var(--gd-o,1)*.55)}}
.gd-mist{animation:gd-mist var(--gd-s,60s) linear infinite}
@keyframes gd-mist{from{transform:translateX(0)}to{transform:translateX(calc(var(--gd-w)*-1))}}
.gd-rays{animation:gd-rays 7s ease-in-out infinite alternate}
@keyframes gd-rays{from{opacity:.55;transform:rotate(-3deg)}to{opacity:.9;transform:rotate(3deg)}}
.gd-pulse{animation:gd-pulse var(--gd-t,3.6s) ease-in-out infinite alternate}
@keyframes gd-pulse{from{opacity:.7}to{opacity:1}}
.gd-shimmer{animation:gd-shimmer 5.2s ease-in-out infinite}
@keyframes gd-shimmer{from{transform:translateX(-160px)}to{transform:translateX(calc(var(--gd-w) + 160px))}}
.gd-flicker{animation:gd-flicker var(--gd-t,1s) ease-in-out infinite alternate}
@keyframes gd-flicker{from{opacity:var(--gd-o,1)}to{opacity:calc(var(--gd-o,1)*.82)}}
.gd-drop{animation:gd-drop 1.3s linear var(--gd-d,0ms) infinite}
@keyframes gd-drop{0%{transform:translate(20.5px,30px);opacity:.9}50%{transform:translate(calc(20.5px + var(--gd-dir)*8px),4px);opacity:.9}89%{transform:translate(calc(20.5px + var(--gd-dir)*14px),26px);opacity:.9}90%,100%{opacity:0}}
.gd-drift{animation:gd-drift 9.5s ease-in-out infinite alternate}
@keyframes gd-drift{from{transform:translateX(calc(var(--gd-dx,9px)*-1))}to{transform:translateX(var(--gd-dx,9px))}}
.gd-petal{animation:gd-petal var(--gd-t,9s) linear var(--gd-d,0ms) infinite;opacity:0}
@keyframes gd-petal{
0%{opacity:0;transform:translate(var(--gd-x),calc(var(--gd-h)*.15)) rotate(0)}
10%{opacity:.9}
25%{transform:translate(calc(var(--gd-x) + 22px),calc(var(--gd-h)*.33)) rotate(135deg) scaleX(.3)}
50%{transform:translate(calc(var(--gd-x) - 8px),calc(var(--gd-h)*.53)) rotate(270deg) scaleX(1)}
75%{transform:translate(calc(var(--gd-x) + 30px),calc(var(--gd-h)*.74)) rotate(405deg) scaleX(-.6)}
85%{opacity:.9}
100%{opacity:0;transform:translate(calc(var(--gd-x) + 40px),calc(var(--gd-h)*.95)) rotate(540deg) scaleX(1)}}
.gd-mote{animation:gd-mote var(--gd-t,9s) linear var(--gd-d,0ms) infinite;opacity:0}
@keyframes gd-mote{
0%{opacity:0;transform:translate(var(--gd-x),var(--gd-y))}
15%{opacity:.9}
50%{transform:translate(calc(var(--gd-x) + var(--gd-sx)),calc(var(--gd-y) - var(--gd-rise)*.5))}
80%{opacity:.9}
100%{opacity:0;transform:translate(calc(var(--gd-x) + var(--gd-ex)),calc(var(--gd-y) - var(--gd-rise)))}}
.gd-blink{animation:gd-blink 1.6s ease-in-out infinite alternate}
@keyframes gd-blink{from{opacity:1}to{opacity:.35}}
.gd-breathe{animation:gd-breathe 1.6s ease-in-out infinite alternate}
@keyframes gd-breathe{from{opacity:.6;transform:scale(.97)}to{opacity:1;transform:scale(1.05)}}
.gd-fadein{animation:gd-fadein .5s ease-out both}
@keyframes gd-fadein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.gd-skyfade{animation:gd-skyfade 1.4s ease-in-out both}
@keyframes gd-skyfade{from{opacity:0}to{opacity:1}}
.gd-seedfall{animation:gd-seedfall 1.75s both}
@keyframes gd-seedfall{0%{transform:translateY(-260px) scale(1);opacity:1;animation-timing-function:cubic-bezier(.55,0,1,.45)}63%{transform:translateY(0) scale(1);opacity:1}80%{transform:translateY(0) scale(.8);opacity:.6}100%{transform:translateY(0) scale(.6);opacity:0}}
.gd-ring{animation:gd-ring .75s ease-out var(--gd-d,1.05s) both}
@keyframes gd-ring{0%{opacity:0;transform:scale(.4)}20%{opacity:.9}100%{opacity:0;transform:scale(1.6)}}
.gd-soil{animation:gd-soil .7s ease-out 1.05s both}
@keyframes gd-soil{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(var(--gd-sx),var(--gd-sy))}}
.gd-rain{animation:gd-rain .63s linear var(--gd-d,0ms) both}
@keyframes gd-rain{0%{opacity:.9;transform:translate(0,-40px) scaleY(1.4)}99%{opacity:.9}100%{opacity:0;transform:translate(6px,var(--gd-b)) scaleY(1.4)}}
.gd-sprout{animation:gd-sprout 1.1s cubic-bezier(.3,1.5,.5,1) both}
@keyframes gd-sprout{from{opacity:.2;transform:scale(.35)}to{opacity:1;transform:scale(1)}}
.gd-burst{animation:gd-burst 2.3s ease-out both}
@keyframes gd-burst{0%{opacity:0;transform:scale(.5) rotate(0)}30%{opacity:1;transform:scale(1.2) rotate(25deg)}100%{opacity:.55;transform:scale(.885) rotate(14deg)}}
.gd-reveal{transition:opacity 1.6s ease-in-out,transform 1.6s ease-in-out}
.gd-night{transition:opacity 1.4s ease-in-out}
@media (prefers-reduced-motion: reduce){
.gd-root *,.gd-root{animation:none!important;transition:none!important}
.gd-root .gd-petal,.gd-root .gd-mote,.gd-root .gd-drop,.gd-root .gd-rain{display:none}
}
`;

/** the keyframes of the garden, once per page */
export function GardenStyles() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}

/** prefers-reduced-motion, read and followed (the app's Reduce Motion) */
export function useReducedMotion(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setOn(m.matches);
    const f = (e: MediaQueryListEvent) => setOn(e.matches);
    m.addEventListener?.("change", f);
    return () => m.removeEventListener?.("change", f);
  }, []);
  return on;
}

/** a few falling petals or leaves (max 6), drifting with the wind */
export function Petals({ width, height, color, still }: { width: number; height: number; color: string; still: boolean }) {
  if (still) return null;
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x0 = ((i * 37) % 80) / 100 * width + width * 0.1;
        const st = { position: "absolute", left: 0, top: 0, width: 7, height: 4, borderRadius: 4, backgroundColor: color, "--gd-x": `${x0}px`, "--gd-h": `${height}px`, "--gd-t": `${9000 + i * 900}ms`, "--gd-d": `${i * 1700}ms` } as CSSProperties;
        return <span key={i} className="gd-petal" style={st} />;
      })}
    </div>
  );
}
