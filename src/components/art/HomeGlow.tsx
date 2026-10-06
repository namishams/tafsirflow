"use client";
import { useEffect } from "react";

// A soft gold light follows the pointer inside cards marked .hm-glow (desktop only, off with reduced motion).
// Mounted by several grids; only the first instance listens.
let users = 0;
let stop: (() => void) | null = null;

export default function HomeGlow() {
  useEffect(() => {
    users++;
    if (users === 1 && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      let raf = 0, ev: PointerEvent | null = null;
      const apply = () => {
        raf = 0;
        const el = ev && ((ev.target as Element | null)?.closest?.(".hm-glow") as HTMLElement | null);
        if (!el || !ev) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--hx", `${Math.round(ev.clientX - r.left)}px`);
        el.style.setProperty("--hy", `${Math.round(ev.clientY - r.top)}px`);
      };
      const move = (e: PointerEvent) => { ev = e; if (!raf) raf = requestAnimationFrame(apply); };
      document.addEventListener("pointermove", move, { passive: true });
      stop = () => { document.removeEventListener("pointermove", move); if (raf) cancelAnimationFrame(raf); };
    }
    return () => { users--; if (users === 0 && stop) { stop(); stop = null; } };
  }, []);
  return null;
}
