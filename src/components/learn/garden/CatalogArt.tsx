"use client";
// mirrors mobile/src/features/garden/CatalogArt.tsx
// Procedural sticker art (frozen framework: ids, series, rarities and art style never change): frame shape × geometric
// pattern × palette × rarity, all from the id. Only text and geometry. react-native-svg converted 1:1 to DOM SVG; the
// foil shine of legendary stickers is a CSS animation (gd-foil, frozen under prefers-reduced-motion).
import { memo } from "react";
import type { CSSProperties } from "react";
import { hashId, itemById, rarityOf, type Rarity, type Series } from "@/lib/learn/garden/catalog";
import { useLang } from "@/lib/learn/i18n";
import { stickerLabel } from "@/lib/learn/garden/texts";
import { CALLIG, useUid } from "./Tree";

const FRAMES = ["circle", "octagon", "arch", "star", "hex", "rosette"] as const;
type Frame = (typeof FRAMES)[number];
const PALETTES: [string, string, string][] = [
  ["#0b3d2e", "#1d6b52", "#e9cf99"], ["#1f2b47", "#3e5a8c", "#f3e2b6"], ["#47301f", "#b0662a", "#f6e2b8"], ["#2b1f47", "#5a3e8c", "#e9d6ff"],
  ["#0b2f3d", "#1d5a6b", "#d7f0f2"], ["#3d0b1f", "#8c1d3e", "#f7d7de"], ["#2a3a14", "#5f7d2a", "#eef3c8"], ["#3d2a0b", "#8c6a1d", "#fff1c2"],
];
const SERIES_FRAME: Partial<Record<Series, Frame>> = { surah: "arch", juz: "octagon", names: "star", prophets: "arch", months: "circle", letters: "hex", roots: "hex", tajweed: "rosette", places: "arch", scholars: "octagon" };
const RIM: Record<Rarity, [string, string]> = { common: ["#9aa5a0", "#d8dedb"], rare: ["#8fb7d6", "#e6f3ff"], epic: ["#8a5ad6", "#e8d4ff"], legendary: ["#c6a65e", "#fff1c2"] };
const ARABIC = "Amiri, 'Scheherazade New', serif";
const SANS = '"Plus Jakarta Sans Variable", "Inter Variable", system-ui, sans-serif';

function framePath(f: Frame, c: number, r: number): string {
  const poly = (n: number, rot: number, inner?: number) => Array.from({ length: inner ? n * 2 : n }, (_, i) => { const a = rot + (i * Math.PI * 2) / (inner ? n * 2 : n), rr = inner && i % 2 ? inner : r; return `${i ? "L" : "M"}${(c + Math.cos(a) * rr).toFixed(1)} ${(c + Math.sin(a) * rr).toFixed(1)}`; }).join(" ") + " Z";
  switch (f) {
    case "circle": return `M${c - r} ${c} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
    case "octagon": return poly(8, Math.PI / 8);
    case "hex": return poly(6, 0);
    case "star": return poly(8, -Math.PI / 2, r * 0.8);
    case "rosette": return poly(12, 0, r * 0.88);
    case "arch": return `M${c - r * 0.8} ${c + r} V${c - r * 0.1} Q${c - r * 0.8} ${c - r} ${c} ${c - r} Q${c + r * 0.8} ${c - r} ${c + r * 0.8} ${c - r * 0.1} V${c + r} Z`;
  }
}

const FOIL = `.gd-foil{animation:gd-foil 2.8s ease-in-out infinite}@keyframes gd-foil{from{transform:translateX(calc(var(--gd-fs)*-1)) rotate(20deg)}to{transform:translateX(var(--gd-fs)) rotate(20deg)}}@media (prefers-reduced-motion: reduce){.gd-foil{animation:none;display:none}}`;

export const CatalogArt = memo(function CatalogArt({ id, size = 84, locked = false }: { id: string; size?: number; locked?: boolean }) {
  const u = useUid("ca");
  const { lang } = useLang();
  const it0 = itemById(id);
  // seasons and juz read in the learner's language (the id stays the same); every other label as before
  const it = it0 && (it0.series === "seasonal" || it0.series === "juz") ? { ...it0, label: stickerLabel(it0, lang) } : it0;
  const h = hashId(id);
  const rarity = rarityOf(id);
  const frame: Frame = (it && SERIES_FRAME[it.series]) ?? FRAMES[h % FRAMES.length];
  const [deep, mid, light] = PALETTES[(h >>> 3) % PALETTES.length];
  const pat = (h >>> 7) % 4;
  const c = 50, r = 46;
  const d = framePath(frame, c, r);
  const big = it?.ar ?? (it?.series === "ayah" ? it.label : it?.series === "surah" ? it.sub : null);
  const sub = it?.series === "ayah" ? it.sub : it?.series === "surah" ? it.label : it?.ar ? it.label : it?.label;
  const arabicBig = !!it?.ar && it.series !== "juz";
  if (locked) return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <path d={d} fill="rgba(127,127,127,0.12)" stroke="rgba(127,127,127,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />
    </svg>
  );
  return (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size }} aria-hidden>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
        <defs>
          <linearGradient id={`${u}bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={mid} /><stop offset="1" stopColor={deep} /></linearGradient>
          <linearGradient id={`${u}rim`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={RIM[rarity][1]} /><stop offset="0.5" stopColor={RIM[rarity][0]} /><stop offset="1" stopColor={RIM[rarity][1]} /></linearGradient>
          <clipPath id={`${u}cl`}><path d={d} /></clipPath>
        </defs>
        <path d={d} fill={`url(#${u}bg)`} />
        <g clipPath={`url(#${u}cl)`} opacity={rarity === "common" ? 0.12 : 0.22}>
          {pat === 0 ? Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${i * 10 - 20} 0 L${i * 10 + 20} 100`} stroke={light} strokeWidth={2} />) : null}
          {pat === 1 ? Array.from({ length: 5 }, (_, i) => <circle key={i} cx={50} cy={50} r={10 + i * 9} stroke={light} strokeWidth={1.4} fill="none" />) : null}
          {pat === 2 ? Array.from({ length: 25 }, (_, i) => <circle key={i} cx={10 + (i % 5) * 20} cy={10 + Math.floor(i / 5) * 20} r={2.5} fill={light} />) : null}
          {pat === 3 ? Array.from({ length: 9 }, (_, i) => <path key={i} d={`M0 ${i * 12} l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8`} stroke={light} strokeWidth={1.4} fill="none" />) : null}
        </g>
        <path d={d} fill="none" stroke={`url(#${u}rim)`} strokeWidth={rarity === "common" ? 2 : rarity === "rare" ? 3 : 4} />
        {rarity === "legendary" || rarity === "epic" ? <path d={framePath(frame, c, r - 6)} fill="none" stroke={RIM[rarity][1]} strokeWidth={0.7} opacity={0.7} /> : null}
        {big ? <text x={50} y={arabicBig ? 56 : 54} fontSize={arabicBig ? (big.length > 6 ? 16 : 26) : big.length > 6 ? 15 : 20} fontFamily={arabicBig ? (it?.series === "letters" || it?.series === "roots" ? ARABIC : CALLIG) : SANS} fontWeight={arabicBig ? undefined : 700} fill={light} textAnchor="middle" direction={arabicBig ? "rtl" : undefined}>{big}</text> : null}
        {sub ? <text x={50} y={big ? 74 : 54} fontSize={subSize(sub, !!big)} fontFamily={SANS} fontWeight={600} fill={light} opacity={big ? 0.85 : 1} textAnchor="middle">{sub}</text> : null}
      </svg>
      {rarity === "legendary" ? (
        <span style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: size / 2, pointerEvents: "none" }}>
          <style dangerouslySetInnerHTML={{ __html: FOIL }} />
          <span className="gd-foil" style={{ position: "absolute", top: -size * 0.2, left: 0, width: size * 0.35, height: size * 1.4, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,248,220,0.45), rgba(255,255,255,0))", "--gd-fs": `${size}px` } as CSSProperties} />
        </span>
      ) : null}
    </span>
  );
});
export const rarityColor = (r: Rarity) => RIM[r][0];
/** the size of the small line: as before up to 20 characters; a longer name (Dhul-Jalali-wal-Ikram, a season in some
 *  languages) is set smaller to fit whole instead of being cut off */
const subSize = (sub: string, big: boolean) => (big ? 8 : sub.length > 20 ? Math.max(5.5, (8.5 * 19) / sub.length) : sub.length > 14 ? 8.5 : 11);
