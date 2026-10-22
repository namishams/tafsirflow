// Sticker art kit: plain data types plus small geometry helpers that compute SVG path strings at module load.
// No React, no DOM. Every sticker is a list of <path> layers painted with a flat colour or a gradient.
// The app gets this folder as mobile/src/web/stickerArt/ through mobile/scripts/sync-web.mjs (never edit the copy).

export type StickerTier = "common" | "edel" | "selten" | "unikat";

/** a gradient; `id` is local to one sticker, a renderer should prefix it (e.g. with the sticker id) */
export type StickerGradient = {
  id: string;
  radial?: boolean;
  /** linear, objectBoundingBox units (0..1) */
  x1?: number; y1?: number; x2?: number; y2?: number;
  /** radial, objectBoundingBox units as percent strings */
  cx?: string; cy?: string; r?: string; fx?: string; fy?: string;
  stops: [offset: number, color: string, opacity?: number][];
};

/** one path: `fill` is a colour, `gradient` names a gradient of the same sticker; optional stroke and opacity */
export type StickerLayer = {
  d: string;
  fill?: string;
  gradient?: string;
  stroke?: string;
  strokeGradient?: string;
  sw?: number;
  op?: number;
  /** evenodd fill rule (for cut-outs) */
  evenodd?: boolean;
};

export type StickerArt = {
  id: string;
  pack: string;
  /** German display name */
  name: string;
  tier: StickerTier;
  viewBox: string;
  layers: StickerLayer[];
  gradients: StickerGradient[];
  /** rare pieces: the renderer may sweep a glint across */
  shimmer?: boolean;
  /** name of Allah, sacred phrases and holy places: never placed on the ground */
  sacred?: boolean;
};

export type StickerPack = { id: string; name: string; stickers: StickerArt[] };

// ---------- parts ----------

export type Part = { layers: StickerLayer[]; gradients: StickerGradient[] };
export type Paint = string; // "#hex" or "@gradientId" or "none"
export type LayerOpts = { stroke?: Paint; sw?: number; op?: number; evenodd?: boolean };

export const L = (d: string, paint: Paint, o: LayerOpts = {}): StickerLayer => {
  const l: StickerLayer = { d };
  if (paint.startsWith("@")) l.gradient = paint.slice(1);
  else l.fill = paint;
  if (o.stroke) { if (o.stroke.startsWith("@")) l.strokeGradient = o.stroke.slice(1); else l.stroke = o.stroke; }
  if (o.sw != null) l.sw = o.sw;
  if (o.op != null && o.op !== 1) l.op = o.op;
  if (o.evenodd) l.evenodd = true;
  return l;
};
/** a stroke-only layer */
export const S = (d: string, stroke: Paint, sw: number, op?: number): StickerLayer => L(d, "none", { stroke, sw, op });

export const part = (layers: StickerLayer[], gradients: StickerGradient[] = []): Part => ({ layers, gradients });

export function sticker(meta: Omit<StickerArt, "layers" | "gradients" | "viewBox"> & { viewBox?: string }, ...parts: (Part | StickerLayer | StickerLayer[])[]): StickerArt {
  const layers: StickerLayer[] = [];
  const grads = new Map<string, StickerGradient>();
  for (const p of parts) {
    if (Array.isArray(p)) layers.push(...p);
    else if ("layers" in p) { layers.push(...p.layers); for (const g of p.gradients) grads.set(g.id, g); }
    else layers.push(p);
  }
  return { viewBox: "0 0 200 200", ...meta, layers, gradients: [...grads.values()] };
}

// ---------- gradients ----------

export const lin = (id: string, stops: StickerGradient["stops"], x1 = 0, y1 = 0, x2 = 0, y2 = 1): StickerGradient => ({ id, x1, y1, x2, y2, stops });
export const rad = (id: string, stops: StickerGradient["stops"], cx = "50%", cy = "50%", r = "50%", fx?: string, fy?: string): StickerGradient => {
  const g: StickerGradient = { id, radial: true, cx, cy, r, stops };
  if (fx) g.fx = fx;
  if (fy) g.fy = fy;
  return g;
};

// ---------- colour ----------

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
export const mix = (a: string, b: string, t: number) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
/** pick from a dark-to-light ramp, v in 0..1 */
export const ramp = (cols: string[], v: number) => {
  const x = Math.max(0, Math.min(1, v)) * (cols.length - 1);
  const i = Math.min(cols.length - 2, Math.floor(x));
  return mix(cols[i], cols[i + 1], x - i);
};

/** palettes, dark to light */
export const PAL = {
  gold: ["#5a3a0c", "#8f6420", "#c9963a", "#e9c66e", "#fbe7a8", "#fffaf0"],
  roseGold: ["#5e2f24", "#985440", "#c98168", "#ebb39c", "#ffe0d2", "#fff7f2"],
  silver: ["#3a424c", "#6c7784", "#a5b0bc", "#d6dee6", "#f4f8fb", "#ffffff"],
  emerald: ["#02261a", "#06492f", "#0b7a4c", "#1fb173", "#79e6b2", "#e4fff1"],
  ruby: ["#33020c", "#6e0619", "#b5112f", "#ec3a57", "#ff9aab", "#fff0f3"],
  sapphire: ["#030c33", "#0a2170", "#1846b8", "#3d7ff0", "#9cc4ff", "#f0f7ff"],
  amber: ["#3d1a02", "#7a3a05", "#c46a0b", "#f2a12a", "#ffd982", "#fff7e0"],
  turquoise: ["#033a36", "#09665f", "#139e93", "#38d1c0", "#9ff3e6", "#f0fffc"],
  diamond: ["#3b5470", "#7393b3", "#b5cde3", "#e3f0fb", "#f7fbff", "#ffffff"],
  amethyst: ["#1f0a33", "#43186e", "#7232b0", "#a466e6", "#d9b8ff", "#faf3ff"],
  pearl: ["#8a7a63", "#b9a88d", "#ddd0bb", "#f2ebdf", "#fcf9f3", "#ffffff"],
  goldPearl: ["#6b4914", "#a8772d", "#d6a650", "#f0cf86", "#fff0c8", "#fffbef"],
  blackPearl: ["#05070a", "#141a22", "#2a333f", "#4c5868", "#8a97a8", "#e8eef5"],
  rosePearl: ["#8a5a60", "#c48a93", "#e8b6bd", "#f8dade", "#fff1f3", "#ffffff"],
  wood: ["#2a1608", "#4e2c12", "#7a4a22", "#a8713f", "#d6a26c", "#f3d4a8"],
  greenGlaze: ["#032a1c", "#08503a", "#13805a", "#2db57e", "#8de6bc", "#effff6"],
};
export type Pal = string[];

// ---------- geometry ----------

export const f = (n: number) => (Math.round(n * 10) / 10).toString();
export type Pt = [number, number];
export const poly = (pts: Pt[], close = true) => "M" + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L") + (close ? "Z" : "");
export const ell = (cx: number, cy: number, rx: number, ry = rx) => `M${f(cx - rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx + rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx - rx)} ${f(cy)}Z`;
export const circ = (cx: number, cy: number, r: number) => ell(cx, cy, r, r);
export const rect = (x: number, y: number, w: number, h: number, r = 0) =>
  r <= 0 ? `M${f(x)} ${f(y)}H${f(x + w)}V${f(y + h)}H${f(x)}Z`
    : `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}Z`;
export const polar = (cx: number, cy: number, r: number, deg: number): Pt => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
/** regular star with n points; r2 inner radius; rot in degrees (-90 points up) */
export const star = (cx: number, cy: number, n: number, r1: number, r2: number, rot = -90) => {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) pts.push(polar(cx, cy, i % 2 ? r2 : r1, rot + (i * 180) / n));
  return poly(pts);
};
export const ngon = (cx: number, cy: number, n: number, r: number, rot = -90) => poly(Array.from({ length: n }, (_, i) => polar(cx, cy, r, rot + (i * 360) / n)));
/** an arc band (ring sector) from a1 to a2 degrees */
export const arcBand = (cx: number, cy: number, r1: number, r2: number, a1: number, a2: number) => {
  const [x1, y1] = polar(cx, cy, r2, a1), [x2, y2] = polar(cx, cy, r2, a2), [x3, y3] = polar(cx, cy, r1, a2), [x4, y4] = polar(cx, cy, r1, a1);
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
  return `M${f(x1)} ${f(y1)}A${f(r2)} ${f(r2)} 0 ${large} 1 ${f(x2)} ${f(y2)}L${f(x3)} ${f(y3)}A${f(r1)} ${f(r1)} 0 ${large} 0 ${f(x4)} ${f(y4)}Z`;
};
/** a crescent: outer circle minus offset inner circle (as one closed path) */
export const crescent = (cx: number, cy: number, r: number, off: number, ir: number, rot = 0) => {
  // find intersections of circle (0,0,r) and (off,0,ir), then rotate
  const a = (r * r - ir * ir + off * off) / (2 * off);
  const h = Math.sqrt(Math.max(0, r * r - a * a));
  const rotp = ([x, y]: Pt): Pt => { const c = Math.cos((rot * Math.PI) / 180), s = Math.sin((rot * Math.PI) / 180); return [cx + x * c - y * s, cy + x * s + y * c]; };
  const [p1x, p1y] = rotp([a, -h]), [p2x, p2y] = rotp([a, h]);
  return `M${f(p1x)} ${f(p1y)}A${f(r)} ${f(r)} 0 1 0 ${f(p2x)} ${f(p2y)}A${f(ir)} ${f(ir)} 0 1 1 ${f(p1x)} ${f(p1y)}Z`;
};
/** four-pointed sparkle */
export const sparkle = (cx: number, cy: number, s: number, thin = 0.18) => {
  const t = s * thin;
  return `M${f(cx)} ${f(cy - s)}Q${f(cx + t)} ${f(cy - t)} ${f(cx + s)} ${f(cy)}Q${f(cx + t)} ${f(cy + t)} ${f(cx)} ${f(cy + s)}Q${f(cx - t)} ${f(cy + t)} ${f(cx - s)} ${f(cy)}Q${f(cx - t)} ${f(cy - t)} ${f(cx)} ${f(cy - s)}Z`;
};
/** leaf from base (x1,y1) to tip (x2,y2), width w, bend b */
export const leaf = (x1: number, y1: number, x2: number, y2: number, w: number, b = 0) => {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  const mx = x1 + dx * 0.45 + nx * b, my = y1 + dy * 0.45 + ny * b;
  return `M${f(x1)} ${f(y1)}Q${f(mx + nx * w)} ${f(my + ny * w)} ${f(x2)} ${f(y2)}Q${f(mx - nx * w)} ${f(my - ny * w)} ${f(x1)} ${f(y1)}Z`;
};
/** mirror a list of points across x = cx and return the closed symmetric outline (pts from top centre down the right side) */
export const symm = (cx: number, right: Pt[]) => poly([...right, ...right.slice().reverse().map(([x, y]) => [2 * cx - x, y] as Pt)]);
/** symmetric smooth outline from cubic segments given for the right half: start point then [c1,c2,p] triples */
export const symmC = (cx: number, start: Pt, segs: [Pt, Pt, Pt][]) => {
  let d = `M${f(start[0])} ${f(start[1])}`;
  for (const [a, b, c] of segs) d += `C${f(a[0])} ${f(a[1])} ${f(b[0])} ${f(b[1])} ${f(c[0])} ${f(c[1])}`;
  const m = (p: Pt): Pt => [2 * cx - p[0], p[1]];
  const all: Pt[] = [start, ...segs.map((s) => s[2])];
  for (let i = segs.length - 1; i >= 0; i--) { const [a, b] = segs[i]; const to = all[i]; d += `C${f(m(b)[0])} ${f(m(b)[1])} ${f(m(a)[0])} ${f(m(a)[1])} ${f(m(to)[0])} ${f(m(to)[1])}`; }
  return d + "Z";
};

// ---------- common pieces ----------

/** soft ground shadow */
export const shadow = (cx: number, cy: number, rx: number, ry: number, id = "shd"): Part =>
  part([L(ell(cx, cy, rx, ry), `@${id}`)], [rad(id, [[0, "#000000", 0.38], [0.6, "#000000", 0.14], [1, "#000000", 0]])]);

/** glow halo behind an object */
export const halo = (cx: number, cy: number, r: number, color: string, op = 0.55, id = "halo"): Part =>
  part([L(circ(cx, cy, r), `@${id}`)], [rad(id, [[0, color, op], [0.45, color, op * 0.45], [1, color, 0]])]);

/** scattered sparkles */
export const sparkles = (pts: [number, number, number][], color = "#ffffff", op = 0.95): StickerLayer[] =>
  pts.map(([x, y, s]) => L(sparkle(x, y, s), color, { op }));

/** a lustrous pearl with orient, specular highlight and rim light */
export function pearl(cx: number, cy: number, r: number, pal: Pal, id: string, orient: [string, string] = ["#ffc9e4", "#bff3e4"]): Part {
  return part([
    L(circ(cx, cy, r), `@${id}b`),
    L(circ(cx, cy, r), `@${id}o`),
    L(circ(cx, cy, r), `@${id}s`),
    L(arcBand(cx, cy, r * 0.8, r * 0.94, 30, 150), `@${id}rim`),
    L(ell(cx - r * 0.34, cy - r * 0.4, r * 0.3, r * 0.2), `@${id}h`),
    L(circ(cx - r * 0.42, cy - r * 0.46, r * 0.08), "#ffffff", { op: 0.95 }),
  ], [
    rad(`${id}b`, [[0, pal[5]], [0.35, pal[4]], [0.75, pal[2]], [1, pal[1]]], "38%", "34%", "70%"),
    rad(`${id}o`, [[0.45, orient[0], 0], [0.72, orient[0], 0.32], [0.88, orient[1], 0.3], [1, orient[1], 0]], "45%", "40%", "62%"),
    rad(`${id}s`, [[0.55, pal[0], 0], [0.85, pal[0], 0.22], [1, pal[0], 0.5]], "36%", "32%", "72%"),
    lin(`${id}rim`, [[0, pal[5], 0], [0.5, pal[5], 0.55], [1, pal[5], 0]], 1, 0, 0, 0),
    rad(`${id}h`, [[0, "#ffffff", 0.95], [1, "#ffffff", 0]]),
  ]);
}

type Facet = { pts: Pt[]; v: number };
/** draws faceted gem polygons with shading from a top-left light */
function facets(fs: Facet[], pal: Pal, outline: string): StickerLayer[] {
  return fs.map((fc) => L(poly(fc.pts), ramp(pal, 0.08 + 0.9 * Math.pow(Math.max(0, Math.min(1, fc.v)), 1.5)), { stroke: outline, sw: 0.45 }));
}
const lightAt = (cx: number, cy: number, p: Pt) => { const a = Math.atan2(p[1] - cy, p[0] - cx); return 0.5 + 0.5 * Math.cos(a - (-135 * Math.PI) / 180); };
const centroid = (pts: Pt[]): Pt => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];

export type GemShape = "round" | "oval" | "pear" | "heart";
/** brilliant-cut gem seen from above, with fire and sparkle; warp gives oval/pear outlines */
export function brilliant(cx: number, cy: number, r: number, pal: Pal, id: string, shape: GemShape = "round", fire = false, n = 8): Part {
  const warp = ([x, y]: Pt): Pt => {
    let u = (x - cx) / r, v = (y - cy) / r;
    if (shape === "oval") { v *= 1.28; u *= 0.86; }
    if (shape === "pear") { const w = v < 0 ? 1 - 0.78 * Math.pow(-v, 1.6) : 1; u *= w * 0.9; v = v * 1.2 + 0.08; }
    if (shape === "heart") { const top = v < -0.2 ? Math.abs(u) * 0.35 : 0; v = v * 0.95 + (v < 0 ? 0.18 - top * 1.1 + Math.pow(1 - Math.abs(u), 2) * 0.35 * (v < -0.2 ? 1 : 0) : 0); u = u * (1 + (v > 0 ? -0.35 * v * v : 0)); }
    return [cx + u * r, cy + v * r];
  };
  const P = (rad_: number, deg: number) => warp(polar(cx, cy, rad_, deg));
  const step = 360 / n, rt = r * 0.52, rs = r * 0.8;
  const fs: Facet[] = [];
  const T = (k: number) => P(rt, -90 + k * step), Sx = (k: number) => P(rs, -90 + k * step + step / 2), O = (j: number) => P(r, -90 + (j * step) / 2);
  for (let k = 0; k < n; k++) {
    const star_ = [T(k), T(k + 1), Sx(k)];
    const kite = [T(k), Sx(k - 1), O(2 * k), Sx(k)];
    const g1 = [Sx(k), O(2 * k), O(2 * k + 1)];
    const g2 = [Sx(k), O(2 * k + 1), O(2 * k + 2)];
    const l = (pts: Pt[]) => lightAt(cx, cy, centroid(pts));
    fs.push({ pts: star_, v: 0.35 + 0.45 * l(star_) });
    fs.push({ pts: kite, v: 0.2 + 0.55 * l(kite) + (k % 2 ? 0.08 : -0.04) });
    fs.push({ pts: g1, v: 0.1 + 0.6 * l(g1) + (k % 2 ? 0.18 : -0.06) });
    fs.push({ pts: g2, v: 0.12 + 0.55 * (1 - l(g2)) * 0.6 + 0.4 * l(g2) + (k % 2 ? -0.05 : 0.15) });
  }
  const table = Array.from({ length: n }, (_, k) => T(k));
  const outer = Array.from({ length: n * 2 }, (_, j) => O(j));
  const layers: StickerLayer[] = [
    L(poly(outer), pal[0]),
    ...facets(fs, pal, ramp(pal, 0.9)),
    L(poly(table), `@${id}t`, { stroke: ramp(pal, 0.95), sw: 0.6 }),
    L(poly(table), `@${id}tg`),
  ];
  if (fire) {
    const spectral = ["#ff6fa8", "#7fe8ff", "#ffe26a", "#9d8bff", "#7dffb0"];
    fs.filter((_, i) => i % 4 >= 2 && (i * 7) % 5 < 2).forEach((fc, i) => layers.push(L(poly(fc.pts), spectral[i % spectral.length], { op: 0.32 })));
  } else {
    // inner refraction: lighter facets mirrored on the far side
    fs.filter((_, i) => i % 4 === 1).slice(Math.floor(n / 2) - 1, Math.floor(n / 2) + 2).forEach((fc) => layers.push(L(poly(fc.pts), pal[4], { op: 0.35 })));
  }
  layers.push(
    L(poly(outer), "none", { stroke: `@${id}rim`, sw: Math.max(1.4, r * 0.05) }),
    L(poly([P(rt * 0.95, -150), P(rt * 0.95, -110), P(rt * 0.35, -70), P(rt * 0.2, -175)]), "#ffffff", { op: 0.5 }),
  );
  return part(layers, [
    lin(`${id}t`, [[0, pal[4]], [0.4, pal[3]], [1, pal[1]]], 0.1, 0, 0.9, 1),
    rad(`${id}tg`, [[0, "#ffffff", 0.3], [0.6, "#ffffff", 0.08], [1, "#ffffff", 0]], "38%", "35%", "60%"),
    lin(`${id}rim`, [[0, "#ffffff", 0.95], [0.45, pal[3], 0.6], [1, pal[0], 0.9]], 0, 0, 1, 1),
  ]);
}

/** emerald (step) cut seen from above: octagonal rectangle with three steps and a table */
export function stepCut(cx: number, cy: number, w: number, h: number, pal: Pal, id: string, corner = 0.22): Part {
  const oct = (s: number): Pt[] => {
    const hw = (w / 2) * s, hh = (h / 2) * s, c = Math.min(w, h) * corner * s;
    return [[cx - hw + c, cy - hh], [cx + hw - c, cy - hh], [cx + hw, cy - hh + c], [cx + hw, cy + hh - c], [cx + hw - c, cy + hh], [cx - hw + c, cy + hh], [cx - hw, cy + hh - c], [cx - hw, cy - hh + c]];
  };
  const rings = [1, 0.84, 0.7, 0.56];
  const layers: StickerLayer[] = [L(poly(oct(1)), pal[0])];
  // light comes from the top left: top and left steps bright, bottom and right dark; alternate rings for the hall-of-mirrors look
  const dirV = [0.85, 0.95, 0.55, 0.25, 0.1, 0.3, 0.6, 0.9];
  for (let ri = 0; ri < rings.length - 1; ri++) {
    const A = oct(rings[ri]), B = oct(rings[ri + 1]);
    for (let k = 0; k < 8; k++) {
      const pts = [A[k], A[(k + 1) % 8], B[(k + 1) % 8], B[k]];
      const base = ri % 2 === 0 ? dirV[k] : 1 - dirV[k] * 0.7;
      layers.push(L(poly(pts), ramp(pal, 0.12 + base * 0.72), { stroke: ramp(pal, 0.85), sw: 0.45 }));
    }
  }
  const t = oct(rings[rings.length - 1]);
  layers.push(
    L(poly(t), `@${id}t`, { stroke: ramp(pal, 0.95), sw: 0.6 }),
    L(poly([t[7], t[0], t[1], [cx, cy] as Pt]), "#ffffff", { op: 0.16 }),
    L(poly([oct(0.5)[0], oct(0.5)[1], oct(0.16)[1], oct(0.16)[0]]), "#ffffff", { op: 0.22 }),
    L(poly(oct(1)), "none", { stroke: `@${id}rim`, sw: Math.max(1.4, w * 0.035) }),
  );
  return part(layers, [
    lin(`${id}t`, [[0, pal[4]], [0.5, pal[3]], [1, pal[1]]], 0, 0, 1, 1),
    lin(`${id}rim`, [[0, "#ffffff", 0.95], [0.5, pal[3], 0.5], [1, pal[0], 0.9]], 0, 0, 1, 1),
  ]);
}

/** smooth polished cabochon (turquoise, amber, coral) */
export function cabochon(cx: number, cy: number, rx: number, ry: number, pal: Pal, id: string, veins?: string): Part {
  const layers: StickerLayer[] = [L(ell(cx, cy, rx, ry), `@${id}b`)];
  if (veins) layers.push(S(veins, "#5a4632", 0.9, 0.55));
  layers.push(
    L(ell(cx, cy, rx, ry), `@${id}d`),
    L(ell(cx - rx * 0.28, cy - ry * 0.42, rx * 0.42, ry * 0.2), `@${id}h`),
    L(arcBand(cx, cy, rx * 0.78, rx * 0.9, 25, 120), pal[5], { op: 0.22 }),
  );
  return part(layers, [
    rad(`${id}b`, [[0, pal[4]], [0.45, pal[3]], [0.85, pal[2]], [1, pal[1]]], "42%", "38%", "65%"),
    rad(`${id}d`, [[0.6, pal[0], 0], [1, pal[0], 0.45]], "45%", "40%", "60%"),
    rad(`${id}h`, [[0, "#ffffff", 0.9], [1, "#ffffff", 0]]),
  ]);
}

/** gold metal gradients: `${id}` diagonal sheen, `${id}v` vertical */
export const metal = (id: string, pal: Pal = PAL.gold): StickerGradient[] => [
  lin(id, [[0, pal[4]], [0.25, pal[3]], [0.5, pal[2]], [0.72, pal[4]], [1, pal[1]]], 0, 0, 1, 1),
  lin(`${id}v`, [[0, pal[5]], [0.3, pal[3]], [0.65, pal[2]], [1, pal[1]]], 0, 0, 0, 1),
  lin(`${id}h`, [[0, pal[1]], [0.3, pal[3]], [0.5, pal[5]], [0.7, pal[3]], [1, pal[1]]], 0, 0, 1, 0),
];

/** a fanous lantern, front view. x = centre, y = top of the hanging ring, s = scale (1 => about 150 tall) */
export function lantern(x: number, y: number, s: number, glass: Pal, id: string, metalPal: Pal = PAL.gold, jewels?: Pal): Part {
  const X = (dx: number) => x + dx * s, Y = (dy: number) => y + dy * s;
  const g = `@${id}m`;
  const body = poly([[X(-30), Y(48)], [X(30), Y(48)], [X(38), Y(80)], [X(26), Y(118)], [X(-26), Y(118)], [X(-38), Y(80)]]);
  const glassMid = poly([[X(-13), Y(52)], [X(13), Y(52)], [X(16), Y(80)], [X(11), Y(114)], [X(-11), Y(114)], [X(-16), Y(80)]]);
  const glassL = poly([[X(-27), Y(52)], [X(-15), Y(52)], [X(-18), Y(80)], [X(-13), Y(114)], [X(-23), Y(114)], [X(-34), Y(80)]]);
  const glassR = poly([[X(27), Y(52)], [X(15), Y(52)], [X(18), Y(80)], [X(13), Y(114)], [X(23), Y(114)], [X(34), Y(80)]]);
  const dome = `M${f(X(-32))} ${f(Y(48))}C${f(X(-32))} ${f(Y(30))} ${f(X(-14))} ${f(Y(20))} ${f(X(0))} ${f(Y(14))}C${f(X(14))} ${f(Y(20))} ${f(X(32))} ${f(Y(30))} ${f(X(32))} ${f(Y(48))}Z`;
  const layers: StickerLayer[] = [
    L(circ(X(0), Y(84), 62 * s), `@${id}glow`),
    S(circ(X(0), Y(5), 5 * s), g, 2.6 * s),
    L(poly([[X(-2.2), Y(9)], [X(2.2), Y(9)], [X(1.4), Y(16)], [X(-1.4), Y(16)]]), g),
    L(dome, g),
    L(`M${f(X(-22))} ${f(Y(46))}C${f(X(-20))} ${f(Y(34))} ${f(X(-10))} ${f(Y(27))} ${f(X(0))} ${f(Y(23))}`, "none", { stroke: metalPal[5], sw: 1.6 * s, op: 0.7 }),
    // pierced arches in the dome
    ...[-18, -6, 6, 18].map((dx) => L(`M${f(X(dx - 3.5))} ${f(Y(45))}V${f(Y(39))}Q${f(X(dx))} ${f(Y(32))} ${f(X(dx + 3.5))} ${f(Y(39))}V${f(Y(45))}Z`, `@${id}gl`, { op: 0.95 })),
    L(rect(X(-36), Y(45), 72 * s, 7 * s, 2 * s), `@${id}mh`),
    L(body, metalPal[1]),
    L(glassL, `@${id}gs`), L(glassR, `@${id}gs`), L(glassMid, `@${id}gl`),
    // flame
    L(`M${f(X(0))} ${f(Y(70))}C${f(X(5))} ${f(Y(80))} ${f(X(6))} ${f(Y(88))} ${f(X(0))} ${f(Y(92))}C${f(X(-6))} ${f(Y(88))} ${f(X(-5))} ${f(Y(80))} ${f(X(0))} ${f(Y(70))}Z`, `@${id}fl`),
    L(ell(X(0), Y(86), 2 * s, 4 * s), "#ffffff", { op: 0.9 }),
    // frame
    S(body, g, 3 * s),
    S(`M${f(X(-14))} ${f(Y(50))}L${f(X(-17))} ${f(Y(80))}L${f(X(-12))} ${f(Y(116))}M${f(X(14))} ${f(Y(50))}L${f(X(17))} ${f(Y(80))}L${f(X(12))} ${f(Y(116))}`, g, 2.4 * s),
    S(`M${f(X(-38))} ${f(Y(80))}H${f(X(38))}`, g, 2.4 * s),
    // filigree on the glass
    S(`M${f(X(0))} ${f(Y(56))}Q${f(X(8))} ${f(Y(62))} ${f(X(0))} ${f(Y(68))}Q${f(X(-8))} ${f(Y(62))} ${f(X(0))} ${f(Y(56))}Z`, metalPal[4], 0.9 * s, 0.85),
    S(`M${f(X(0))} ${f(Y(96))}Q${f(X(7))} ${f(Y(103))} ${f(X(0))} ${f(Y(110))}Q${f(X(-7))} ${f(Y(103))} ${f(X(0))} ${f(Y(96))}Z`, metalPal[4], 0.9 * s, 0.85),
    L(rect(X(-29), Y(116), 58 * s, 6 * s, 2 * s), `@${id}mh`),
    L(`M${f(X(-22))} ${f(Y(122))}L${f(X(22))} ${f(Y(122))}L${f(X(10))} ${f(Y(134))}L${f(X(-10))} ${f(Y(134))}Z`, g),
    L(`M${f(X(-4))} ${f(Y(134))}H${f(X(4))}L${f(X(0))} ${f(Y(146))}Z`, g),
    L(circ(X(0), Y(147), 2.6 * s), metalPal[4]),
    // rim light on the right
    S(`M${f(X(31))} ${f(Y(50))}L${f(X(38.5))} ${f(Y(80))}L${f(X(27))} ${f(Y(117))}`, metalPal[5], 1 * s, 0.6),
  ];
  if (jewels) {
    layers.push(...brilliant(X(0), Y(48.5), 4.2 * s, jewels, `${id}j1`).layers, ...brilliant(X(-38), Y(80), 3.4 * s, jewels, `${id}j1`).layers, ...brilliant(X(38), Y(80), 3.4 * s, jewels, `${id}j1`).layers, ...brilliant(X(0), Y(119), 3.4 * s, jewels, `${id}j1`).layers);
  }
  const grads = [
    ...metal(`${id}m`, metalPal).slice(0, 1),
    { ...metal(`${id}m`, metalPal)[2], id: `${id}mh` },
    rad(`${id}glow`, [[0, glass[4], 0.55], [0.4, glass[3], 0.2], [1, glass[3], 0]]),
    rad(`${id}gl`, [[0, "#fffbe8"], [0.3, glass[4]], [0.75, glass[3]], [1, glass[2]]], "50%", "55%", "65%"),
    rad(`${id}gs`, [[0, glass[4]], [0.6, glass[2]], [1, glass[1]]], "50%", "55%", "70%"),
    lin(`${id}fl`, [[0, "#fff6c8"], [0.6, "#ffc24a"], [1, "#ff8a2a"]]),
  ];
  if (jewels) grads.push(...brilliant(0, 0, 1, jewels, `${id}j1`).gradients);
  return part(layers, grads);
}

/** an eight-pointed star (rub el hizb style: two overlapping squares) */
export const octStar = (cx: number, cy: number, r: number, rot = 0) => {
  const pts: Pt[] = [];
  for (let i = 0; i < 16; i++) pts.push(polar(cx, cy, i % 2 ? r * 0.76 : r, -90 + rot + i * 22.5));
  return poly(pts);
};

/** translate a path string (absolute commands with x y pairs only: M L C Q Z H V A handled) */
export function shift(d: string, dx: number, dy: number): string {
  return d.replace(/([MLCQTSHVAZmlcqtshvaz])([^MLCQTSHVAZmlcqtshvaz]*)/g, (_, cmd: string, args: string) => {
    const n = (args.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
    const up = cmd.toUpperCase();
    if (up === "Z") return cmd;
    if (up === "H") return cmd + n.map((v) => f(v + dx)).join(" ");
    if (up === "V") return cmd + n.map((v) => f(v + dy)).join(" ");
    if (up === "A") { const o: string[] = []; for (let i = 0; i < n.length; i += 7) o.push(...n.slice(i, i + 5).map(String), f(n[i + 5] + dx), f(n[i + 6] + dy)); return cmd + o.join(" "); }
    return cmd + n.map((v, i) => f(v + (i % 2 ? dy : dx))).join(" ");
  });
}

/** points along the middle of a crescent band (same arguments as crescent()), with the band thickness there */
export function alongCrescent(cx: number, cy: number, r: number, off: number, ir: number, rot: number, angles: number[]): [x: number, y: number, thick: number][] {
  const dx = off * Math.cos((rot * Math.PI) / 180), dy = off * Math.sin((rot * Math.PI) / 180);
  return angles.map((deg) => {
    const ux = Math.cos((deg * Math.PI) / 180), uy = Math.sin((deg * Math.PI) / 180);
    const du = dx * ux + dy * uy, rho = Math.min(r, du + Math.sqrt(Math.max(0, du * du - off * off + ir * ir)));
    const mid = (rho + r) / 2;
    return [cx + ux * mid, cy + uy * mid, r - rho];
  });
}
