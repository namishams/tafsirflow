"use client";
import { useEffect } from "react";

// Moves the soft light on dark stage sections with the pointer (desktop only; see .stage in globals.css)
export default function StageLight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, ev: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      const el = ev && (ev.target as Element | null)?.closest?.(".stage");
      if (!el || !ev) return;
      const r = el.getBoundingClientRect();
      (el as HTMLElement).style.setProperty("--mx", `${Math.round(ev.clientX - r.left)}px`);
      (el as HTMLElement).style.setProperty("--my", `${Math.round(ev.clientY - r.top)}px`);
    };
    const move = (e: PointerEvent) => { ev = e; if (!raf) raf = requestAnimationFrame(apply); };
    document.addEventListener("pointermove", move, { passive: true });
    return () => { document.removeEventListener("pointermove", move); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return null;
}
