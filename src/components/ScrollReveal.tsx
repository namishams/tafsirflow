"use client";
import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

// Sections and cards rise in gently as they scroll into view; grids reveal their items one after another.
// Only what is below the fold is animated (nothing flickers on load); reduced motion turns it off.
export default function ScrollReveal() {
  const path = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("rv-in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -4% 0px", threshold: 0.01 });
    const t = setTimeout(() => {
      const fold = window.innerHeight;
      const els = document.querySelectorAll<HTMLElement>("main section, main > div > section, [data-reveal], ul.grid > li, ol.grid > li");
      let row = 0, parent: Element | null = null;
      els.forEach((el) => {
        if (el.closest("footer, [data-no-reveal], [role=dialog], .fixed") || el.classList.contains("rv")) return;
        if (el.getBoundingClientRect().top < fold * 0.95) return;
        if (el.tagName === "LI") { row = el.parentElement === parent ? row + 1 : 0; parent = el.parentElement; el.style.transitionDelay = `${Math.min(row, 7) * 55}ms`; }
        el.classList.add("rv");
        io.observe(el);
      });
    }, 60);
    return () => { clearTimeout(t); io.disconnect(); };
  }, [path]);
  return null;
}
