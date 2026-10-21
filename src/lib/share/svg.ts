import type { Palette, ShareFormat } from "./formats";

// SVG markup of the share designs, ported 1:1 from mobile/src/features/share/ShareTemplates.tsx (ground with the girih
// lattice, frame with the mihrab arch and khatam corners, ornamental rule, rosette). Pure functions that return strings
// (no React, no DOM), so the same art is used inline on the page (ShareArt) and rasterised for the exported image
// (render.ts). Every call takes a `uid` that prefixes its gradient and pattern ids; without one a counter makes it
// unique, so several inline SVGs on one page never clash. Components pass a stable id (React useId) so server and
// client markup agree.

/** the layout of a card in points: paddings, frame inset, arch height, kicker and footer heights */
export type Lay = { padX: number; top: number; bottom: number; frame: number; arch: number; kicker: number; foot: number };
export const LAYOUT: Record<ShareFormat, Lay> = {
  // story: Instagram keeps the top ~13 % and the bottom ~12 % for its own controls
  story: { padX: 36, top: 96, bottom: 74, frame: 14, arch: 70, kicker: 40, foot: 64 },
  post: { padX: 34, top: 46, bottom: 30, frame: 12, arch: 38, kicker: 36, foot: 56 },
  square: { padX: 32, top: 34, bottom: 24, frame: 11, arch: 0, kicker: 32, foot: 52 },
};
/** the panel of a feed card: frame only, no paddings */
export const PANEL: Lay = { padX: 0, top: 0, bottom: 0, frame: 8, arch: 0, kicker: 0, foot: 0 };

let counter = 0;
const nextUid = () => `qs${(counter++).toString(36)}`;

/** at most two decimals, without trailing zeros */
const n2 = (v: number) => String(Math.round(v * 100) / 100);

/** "rgba(233,207,153,0.20)" → colour and alpha; hex and rgb() colours keep alpha 1 */
function split(color: string): { c: string; a: number } {
  const m = color.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/);
  return m ? { c: `rgb(${m[1]},${m[2]},${m[3]})`, a: Number(m[4]) } : { c: color, a: 1 };
}
const stop = (offset: number, color: string, opacity: number) => {
  const s = split(color);
  return `<stop offset="${offset}" stop-color="${s.c}" stop-opacity="${n2(s.a * opacity)}"/>`;
};

/** an elliptical radial gradient in fractions of the filled box (react-native-svg's rx/ry): r = rx plus a y scale */
function radial(id: string, cx: number, cy: number, rx: number, ry: number, stops: string): string {
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${rx}" gradientTransform="translate(${cx} ${cy}) scale(1 ${n2(ry / rx)}) translate(${-cx} ${-cy})">${stops}</radialGradient>`;
}

const hash = (s: string) => { let h = 11; for (const ch of s) h = (h * 33 + ch.charCodeAt(0)) >>> 0; return h; };
function rng(seed: string) { let x = hash(seed) || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 10000) / 10000; }; }

// ---------- the ground ----------
const TILE = 44;
const GIRIH = (() => {
  const c = TILE / 2, r = 12, a = r * Math.SQRT1_2;
  const diamond = `M${c} ${c - r}L${c + r} ${c}L${c} ${c + r}L${c - r} ${c}Z`;
  const square = `M${c - a} ${c - a}L${c + a} ${c - a}L${c + a} ${c + a}L${c - a} ${c + a}Z`;
  const links = `M${c} 0V${c - r}M${c} ${c + r}V${TILE}M0 ${c}H${c - r}M${c + r} ${c}H${TILE}`
    + `M0 0L${c - a} ${c - a}M${TILE} 0L${c + a} ${c - a}M0 ${TILE}L${c - a} ${c + a}M${TILE} ${TILE}L${c + a} ${c + a}`;
  return { star: `${diamond}${square}`, links };
})();

/**
 * The ground of a card as inner SVG markup (incl. its <defs>), for a w × h box: the gradient, the girih lattice, a veil that
 * calms it, the light from above, the dawn sun, night stars, marble veins and the vignette. `seed` makes stars and veins stable.
 */
export function groundSvg(p: Palette, w: number, h: number, seed: string, uid: string = nextUid()): string {
  const r = rng(`${seed}|${p.id}`);
  const stars = p.id === "night" ? Array.from({ length: 46 }, () => ({ x: r() * w, y: r() * h * 0.5, s: 0.35 + r() * 0.9, o: 0.25 + r() * 0.6 })) : [];
  const veins = p.id === "marble" ? Array.from({ length: 6 }, (_, i) => {
    const y0 = r() * h, y1 = y0 + (r() - 0.3) * h * 0.7;
    return { d: `M${-20} ${y0.toFixed(0)}C${(w * 0.3).toFixed(0)} ${(y0 + (r() - 0.5) * 160).toFixed(0)} ${(w * 0.65).toFixed(0)} ${(y1 + (r() - 0.5) * 160).toFixed(0)} ${w + 20} ${y1.toFixed(0)}`, gold: i === 2, wd: 0.5 + r() * 1.2 };
  }) : [];
  const pat = p.dark ? 0.1 : 0.12;
  const id = (k: string) => `${uid}-${k}`;
  const vig = p.id === "parchment" ? 0.28 : p.dark ? 0 : 0.08;
  const full = `x="0" y="0" width="${w}" height="${h}"`;
  const defs = `<defs>`
    + `<linearGradient id="${id("bg")}" x1="0.35" y1="0" x2="0.65" y2="1">${p.bg.map((c, i) => stop(i / (p.bg.length - 1), c, 1)).join("")}</linearGradient>`
    + `<pattern id="${id("girih")}" width="${TILE}" height="${TILE}" patternUnits="userSpaceOnUse"><g fill="none" stroke="${p.line}" stroke-width="0.7">`
    + `<path d="${GIRIH.star}" stroke-opacity="${pat}"/><path d="${GIRIH.links}" stroke-opacity="${n2(pat * 0.6)}"/></g></pattern>`
    + radial(id("veil"), 0.5, 0.52, 0.62, 0.46, stop(0, p.veil, 0.94) + stop(0.7, p.veil, 0.55) + stop(1, p.veil, 0))
    + radial(id("glow"), 0.5, 0, 0.85, 0.55, stop(0, p.glow, 1) + stop(1, p.glow, 0))
    + radial(id("vig"), 0.5, 0.5, 0.75, 0.7, stop(0.6, "#6b4a17", 0) + stop(1, "#6b4a17", vig))
    + radial(id("sun"), 0.5, 1, 0.7, 0.38, stop(0, "#FFFFFF", 0.85) + stop(0.5, "#FFE9C4", 0.35) + stop(1, "#FFE9C4", 0))
    + `</defs>`;
  const parts: string[] = [defs, `<rect ${full} fill="url(#${id("bg")})"/>`];
  for (const v of veins) parts.push(`<path d="${v.d}" fill="none" stroke="${v.gold ? p.line : "#5d625e"}" stroke-opacity="${v.gold ? 0.28 : 0.1}" stroke-width="${n2(v.wd)}"/>`);
  parts.push(`<rect ${full} fill="url(#${id("girih")})"/>`, `<rect ${full} fill="url(#${id("veil")})"/>`);
  if (p.id === "dawn") {
    parts.push(`<rect ${full} fill="url(#${id("sun")})"/>`);
    for (const k of [0.5, 0.62, 0.76]) parts.push(`<circle cx="${n2(w / 2)}" cy="${n2(h * 1.04)}" r="${n2(w * k)}" fill="none" stroke="${p.line}" stroke-opacity="0.14" stroke-width="0.7"/>`);
  }
  parts.push(`<rect ${full} fill="url(#${id("glow")})"/>`);
  for (const s of stars) parts.push(`<circle cx="${n2(s.x)}" cy="${n2(s.y)}" r="${n2(s.s)}" fill="#FFF6DC" fill-opacity="${n2(s.o)}"/>`);
  parts.push(`<rect ${full} fill="url(#${id("vig")})"/>`);
  return parts.join("");
}

// ---------- the frame ----------
/** an eight-pointed star (khatam) as a path */
export function star8Path(cx: number, cy: number, r: number, inner = 0.72): string {
  return `M${Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8 - Math.PI / 2; const rr = i % 2 ? r * inner : r; return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`; }).join("L")}Z`;
}

/** the inner frame: a rectangle, on tall formats with a pointed arch at the top (a mihrab) */
function archPath(x0: number, y0: number, x1: number, y1: number, arch: number): string {
  if (!arch) return `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
  const cx = (x0 + x1) / 2, ys = y0 + arch;
  return `M${x0} ${y1}V${ys}C${x0} ${n2(ys - arch * 0.55)} ${n2(cx - (cx - x0) * 0.42)} ${n2(y0 + arch * 0.22)} ${n2(cx)} ${y0}`
    + `C${n2(cx + (x1 - cx) * 0.42)} ${n2(y0 + arch * 0.22)} ${x1} ${n2(ys - arch * 0.55)} ${x1} ${ys}V${y1}Z`;
}

/** a corner piece: a khatam star with two small leaves along the edges (drawn for the top-left corner, mirrored by sx / sy) */
function corner(p: Palette, x: number, y: number, sx: 1 | -1, sy: 1 | -1): string {
  return `<g transform="translate(${n2(x)} ${n2(y)}) scale(${sx} ${sy})">`
    + `<path d="M9 0q9 -5.5 19 0q-10 5.5 -19 0Z" fill="${p.line}" fill-opacity="0.55"/>`
    + `<path d="M0 9q-5.5 9 0 19q5.5 -10 0 -19Z" fill="${p.line}" fill-opacity="0.55"/>`
    + `<path d="M30 0h10M0 30v10" fill="none" stroke="${p.line}" stroke-opacity="0.6" stroke-width="0.8"/>`
    + `<path d="${star8Path(0, 0, 8.5)}" fill="${p.bg[1]}" stroke="${p.line}" stroke-width="0.9"/>`
    + `<path d="${star8Path(0, 0, 4.6)}" fill="${p.line}" fill-opacity="0.8"/>`
    + `</g>`;
}

/** The double gold frame of a card as inner SVG markup: outer line, arch (tall formats) or rectangle, khatam stars in the corners, lozenges. */
export function frameSvg(p: Palette, w: number, h: number, l: Lay, uid: string = nextUid()): string {
  const m = l.frame, i1 = m + 5, i2 = m + 8;
  const arch = `${uid}-arch`;
  const lozenges = [[w / 2, h - m], [m, h / 2], [w - m, h / 2]]
    .map(([x, y]) => `<path d="M${n2(x)} ${n2(y - 3.5)}L${n2(x + 3.5)} ${n2(y)}L${n2(x)} ${n2(y + 3.5)}L${n2(x - 3.5)} ${n2(y)}Z" fill="${p.line}"/>`).join("");
  return `<defs><linearGradient id="${arch}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.line}" stop-opacity="0.75"/><stop offset="1" stop-color="${p.line}" stop-opacity="0.4"/></linearGradient></defs>`
    + `<rect x="${m}" y="${m}" width="${w - m * 2}" height="${h - m * 2}" fill="none" stroke="${p.line}" stroke-opacity="0.85" stroke-width="1.1"/>`
    + `<path d="${archPath(i1, i1, w - i1, h - i1, l.arch)}" fill="none" stroke="url(#${arch})" stroke-width="0.75"/>`
    + `<path d="${archPath(i2, i2 + (l.arch ? 2 : 0), w - i2, h - i2, l.arch ? l.arch - 1 : 0)}" fill="none" stroke="${p.line}" stroke-opacity="0.22" stroke-width="0.5"/>`
    + (l.arch ? `<path d="${star8Path(w / 2, i1 + 1, 4)}" fill="${p.line}"/>` : "")
    + lozenges
    + corner(p, m, m, 1, 1) + corner(p, w - m, m, -1, 1) + corner(p, m, h - m, 1, -1) + corner(p, w - m, h - m, -1, -1);
}

// ---------- ornament rule and rosette ----------
/** height of the ornamental rule in points */
export const RULE_H = 12;

/** The inner markup of the ornamental rule (tapering lines, a khatam star in the middle, two dots) in a width × 12 box. */
export function ornamentRuleInner(p: Palette, width: number, uid: string = nextUid()): string {
  const c = width / 2;
  const l = `${uid}-l`, r = `${uid}-r`;
  // user-space gradients: a horizontal line has no height, so a bounding-box gradient would not be drawn
  return `<defs>`
    + `<linearGradient id="${l}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${n2(c - 13)}" y2="0"><stop offset="0" stop-color="${p.line}" stop-opacity="0"/><stop offset="1" stop-color="${p.line}" stop-opacity="0.9"/></linearGradient>`
    + `<linearGradient id="${r}" gradientUnits="userSpaceOnUse" x1="${n2(c + 13)}" y1="0" x2="${n2(width)}" y2="0"><stop offset="0" stop-color="${p.line}" stop-opacity="0.9"/><stop offset="1" stop-color="${p.line}" stop-opacity="0"/></linearGradient>`
    + `</defs>`
    + `<line x1="0" y1="6" x2="${n2(c - 13)}" y2="6" stroke="url(#${l})" stroke-width="0.9"/>`
    + `<line x1="${n2(c + 13)}" y1="6" x2="${n2(width)}" y2="6" stroke="url(#${r})" stroke-width="0.9"/>`
    + `<circle cx="${n2(c - 10)}" cy="6" r="1.2" fill="${p.line}"/><circle cx="${n2(c + 10)}" cy="6" r="1.2" fill="${p.line}"/>`
    + `<path d="${star8Path(c, 6, 5.5)}" fill="none" stroke="${p.line}" stroke-width="0.9"/>`
    + `<circle cx="${n2(c)}" cy="6" r="1.6" fill="${p.line}"/>`;
}

/** A standalone <svg> of the ornamental rule (width × 12), e.g. for dangerouslySetInnerHTML. */
export function ornamentRuleSvg(p: Palette, width: number, uid: string = nextUid()): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${RULE_H}" viewBox="0 0 ${width} ${RULE_H}" aria-hidden="true" focusable="false">${ornamentRuleInner(p, width, uid)}</svg>`;
}

/** The inner markup of the gold rosette (a sixteen-point star, double ring and a faint khatam) in a size × size box. */
export function rosetteInner(p: Palette, size: number): string {
  const r = size / 2;
  const rays = Array.from({ length: 32 }, (_, i) => { const a = (i * Math.PI) / 16 - Math.PI / 2; const rr = i % 2 ? r * 0.8 : r * 0.97; return `${(r + rr * Math.cos(a)).toFixed(2)},${(r + rr * Math.sin(a)).toFixed(2)}`; }).join("L");
  return `<path d="M${rays}Z" fill="${p.dark ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.45)"}" stroke="${p.line}" stroke-width="0.9"/>`
    + `<circle cx="${n2(r)}" cy="${n2(r)}" r="${n2(r * 0.72)}" fill="none" stroke="${p.line}" stroke-width="1"/>`
    + `<circle cx="${n2(r)}" cy="${n2(r)}" r="${n2(r * 0.66)}" fill="none" stroke="${p.line}" stroke-opacity="0.45" stroke-width="0.6"/>`
    + `<path d="${star8Path(r, r, r * 0.6, 0.76)}" fill="none" stroke="${p.line}" stroke-opacity="0.22" stroke-width="0.6"/>`;
}

/** A standalone <svg> of the rosette (size × size). */
export function rosetteSvg(p: Palette, size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true" focusable="false">${rosetteInner(p, size)}</svg>`;
}
