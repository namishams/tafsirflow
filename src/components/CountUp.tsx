"use client";
import { useEffect, useRef, useState } from "react";

// A number that counts up once it scrolls into view (keeps the final value for screen readers and without motion)
export default function CountUp({ to, decimals = 0, locale, className = "" }: { to: number; decimals?: number; locale?: string; className?: string }) {
  const [v, setV] = useState(to);
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !el.current) return;
    setV(0);
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => { const p = Math.min(1, (now - t0) / 1400); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={el} className={className} aria-label={to.toLocaleString(locale)}>{v.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals, numberingSystem: "latn" } as Intl.NumberFormatOptions)}</span>;
}
