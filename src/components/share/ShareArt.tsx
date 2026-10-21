"use client";
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { PALETTES, darkPaletteFor, type Palette, type PaletteId, type ShareFormat } from "@/lib/share/formats";
import { LAYOUT, PANEL, frameSvg, groundSvg, type Lay } from "@/lib/share/svg";

// The art of the share designs on the page: the ground with its girih lattice and the double gold frame as one inline
// SVG (web port of ShareGround / ShareFrame / PostPanel in the app's ShareTemplates.tsx).

const idOf = (raw: string) => `qa${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
const paletteOf = (p: Palette | PaletteId) => (typeof p === "string" ? PALETTES[p] : p);
const layoutOf = (l: Lay | ShareFormat) => (typeof l === "string" ? LAYOUT[l] : l);

/**
 * Ground and frame of a share design as one <svg viewBox="0 0 w h">. It is as wide as its container and keeps its
 * aspect ratio (give it `absolute inset-0 h-full` to let it fill a box instead). `w` × `h` are the layout units of the
 * geometry (the app's 360-wide points); `layout` is a LAYOUT entry, a format name or PANEL.
 */
export function ShareArt({ palette, seed, w, h, layout, className }: { palette: Palette | PaletteId; seed: string; w: number; h: number; layout: Lay | ShareFormat; className?: string }) {
  const uid = idOf(useId());
  const p = paletteOf(palette);
  const l = layoutOf(layout);
  const markup = useMemo(() => groundSvg(p, w, h, seed, `${uid}g`) + frameSvg(p, w, h, l, `${uid}f`), [p, w, h, seed, l, uid]);
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${w} ${h}`} width="100%" className={`block ${className ?? ""}`} aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: markup }} />;
}

/**
 * A box whose ground is a dark share design (night or emerald by `seed`, so white text stays legible) with the thin panel
 * frame, drawn behind its children. The art is sized to the box with a ResizeObserver, so lines and corner stars keep
 * their size at every width.
 */
export function PostPanel({ seed, className, style, children }: { seed: string; className?: string; style?: CSSProperties; children?: ReactNode }) {
  const uid = idOf(useId());
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const p = PALETTES[darkPaletteFor(seed)];
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const read = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      setSize((s) => (s && Math.abs(s.w - w) <= 1 && Math.abs(s.h - h) <= 1 ? s : { w, h }));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const markup = useMemo(() => (size ? groundSvg(p, size.w, size.h, seed, `${uid}g`) + frameSvg(p, size.w, size.h, PANEL, `${uid}f`) : ""), [p, size, seed, uid]);
  return (
    <div ref={box} className={`relative isolate overflow-hidden ${className ?? ""}`} style={{ backgroundColor: p.bg[1], ...style }}>
      {size && size.w > 0 && size.h > 0 ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size.w} ${size.h}`} width={size.w} height={size.h} className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: markup }} />
      ) : null}
      {children}
    </div>
  );
}
