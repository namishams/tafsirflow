// The painted world of the prayer and wudu trainers, in the illustration language of the garden (the frozen tree and
// landscape art, components/learn/garden and mobile/src/features/garden): an emerald courtyard at dawn, domes and
// minarets in mist, small trees built like the garden tree (shadow masses, a lit body, light clusters, gold glints), a
// marble terrace with a zellige band and a gold rim, and the figure itself: faceless, in a long ivory robe lit from the
// upper left, a soft emerald cap with a gold band, standing on an emerald prayer mat.
// Pure geometry and colours only (no React), so the website and the app (scripts/sync-practice.mjs copies this file to
// mobile/src/features/practice/web/trainerArt.ts) draw exactly the same picture. The functions that run while a posture
// changes carry the "worklet" directive: the app evaluates them on the UI thread (Reanimated); on the website the
// directive is an ordinary, unused string.

/** the trainers' palette, taken from the garden art (Tree.tsx PAL, Landscape.tsx, the basin and the plaque) */
export const TA = {
  night: "#041d16", deep: "#06261c", emerald: "#0f4a39", leaf: "#1f6b4a", mint: "#3f9a68", sage: "#9fd28a",
  gold: "#c6a65e", goldHi: "#e9cf99", goldPale: "#f3e2b6", goldInk: "#8a6a2c",
  marble: "#efe4c8", marbleLo: "#c7b086", ivory: "#fbf6ea", robeLo: "#b9a57a", far: "#8f7c56",
  skin: "#e7cfa2", skinLo: "#bf9c6c", hair: "#3b2a1c",
  light: "#ffe6a6", glint: "#fffbe8",
  water: "#9fd8cf", waterHi: "#effffb", waterLo: "#2f7d66",
  trunk: "#6d4a2b", trunkHi: "#a87a4a",
} as const;

/** gradient stops [offset, colour, opacity] shared by both renderers */
export const GRAD = {
  sky: [[0, "#041d16", 1], [0.5, "#0b3f30", 1], [0.8, "#2a7560", 1], [0.94, "#c9b27a", 1], [1, "#efd9a2", 1]],
  sun: [[0, "#fff1c8", 0.75], [0.25, "#ffe6a6", 0.32], [1, "#ffe6a6", 0]],
  aura: [[0, "#ffe6a6", 0.42], [0.55, "#ffe6a6", 0.1], [1, "#ffe6a6", 0]],
  robe: [[0, "#fffaf0", 1], [0.45, "#efe4c8", 1], [1, "#b9a57a", 1]],
  skin: [[0, "#f6e3bf", 1], [0.55, "#e2c493", 1], [1, "#b58f5e", 1]],
  leaf: [[0, "#9fd28a", 1], [0.5, "#3f9a68", 1], [1, "#1f6b4a", 1]],
  marble: [[0, "#f6eedb", 1], [1, "#c7b086", 1]],
  face: [[0, "#0f4a39", 1], [1, "#06261c", 1]],
  mat: [[0, "#2f8f6a", 1], [1, "#0f4a39", 1]],
  cap: [[0, "#2f8f6a", 1], [1, "#0b3d2e", 1]],
  metal: [[0, "#f6e7bf", 1], [0.45, "#c9a65e", 1], [0.72, "#efe2bf", 1], [1, "#8f7238", 1]],
  water: [[0, "#effffb", 0.95], [0.5, "#9fd8cf", 0.9], [1, "#2f7d66", 0.75]],
  mist: [[0, "#e9f0e4", 0], [0.5, "#e9f0e4", 0.16], [1, "#e9f0e4", 0]],
} as const;

function f2(n: number): string {
  "worklet";
  return (Math.round(n * 100) / 100).toString();
}

/** a tapered capsule from a to b (radius ra at a, rb at b), sides optionally bowed outwards by `bulge`; every capsule
 *  winds the same way, so several of them in one path join into one smooth body under the default fill rule */
export function capsule(ax: number, ay: number, bx: number, by: number, ra: number, rb: number, bulge = 0): string {
  "worklet";
  let dx = bx - ax, dy = by - ay, len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.01) { dx = 0; dy = 1; len = 1; }
  const ux = dx / len, uy = dy / len, nx = -uy, ny = ux, k = 0.5523;
  const mx = (ax + bx) / 2, my = (ay + by) / 2, mr = (ra + rb) / 2 + bulge;
  const a1x = ax + nx * ra, a1y = ay + ny * ra, b1x = bx + nx * rb, b1y = by + ny * rb;
  const b2x = bx - nx * rb, b2y = by - ny * rb, a2x = ax - nx * ra, a2y = ay - ny * ra;
  const btx = bx + ux * rb, bty = by + uy * rb, atx = ax - ux * ra, aty = ay - uy * ra;
  const P = (x: number, y: number) => `${f2(x)} ${f2(y)}`;
  return `M${P(a1x, a1y)}Q${P(mx + nx * mr, my + ny * mr)} ${P(b1x, b1y)}`
    + `C${P(b1x + ux * rb * k, b1y + uy * rb * k)} ${P(btx + nx * rb * k, bty + ny * rb * k)} ${P(btx, bty)}`
    + `C${P(btx - nx * rb * k, bty - ny * rb * k)} ${P(b2x + ux * rb * k, b2y + uy * rb * k)} ${P(b2x, b2y)}`
    + `Q${P(mx - nx * mr, my - ny * mr)} ${P(a2x, a2y)}`
    + `C${P(a2x - ux * ra * k, a2y - uy * ra * k)} ${P(atx - nx * ra * k, aty - ny * ra * k)} ${P(atx, aty)}`
    + `C${P(atx + nx * ra * k, aty + ny * ra * k)} ${P(a1x - ux * ra * k, a1y - uy * ra * k)} ${P(a1x, a1y)}Z`;
}

/** a full circle as a path (same winding as the capsules) */
export function disc(cx: number, cy: number, r: number): string {
  "worklet";
  return `M${f2(cx - r)} ${f2(cy)}A${f2(r)} ${f2(r)} 0 1 1 ${f2(cx + r)} ${f2(cy)}A${f2(r)} ${f2(r)} 0 1 1 ${f2(cx - r)} ${f2(cy)}Z`;
}

/** eight-pointed star (Star8 of the garden) */
export function star8(x: number, y: number, r: number): string {
  "worklet";
  let d = "";
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 - Math.PI / 2, rr = i % 2 ? r * 0.55 : r;
    d += `${i ? "L" : "M"}${f2(x + Math.cos(a) * rr)} ${f2(y + Math.sin(a) * rr)}`;
  }
  return `${d}Z`;
}

/** a water drop with its tip up, centred at (x, y), scaled by s */
export function dropPath(x: number, y: number, s: number): string {
  "worklet";
  const P = (px: number, py: number) => `${f2(x + px * s)} ${f2(y + py * s)}`;
  return `M${P(0, -4.6)}C${P(1.7, -2)} ${P(3.3, 0)} ${P(3.3, 1.8)}A${f2(3.3 * s)} ${f2(3.3 * s)} 0 0 1 ${P(-3.3, 1.8)}C${P(-3.3, 0)} ${P(-1.7, -2)} ${P(0, -4.6)}Z`;
}

// ---------- the figure ----------
export type TJ = [number, number];
export type TPose = { head: TJ; neck: TJ; shoulder: TJ; hip: TJ; knee: TJ; ankle: TJ; toe: TJ; elbow: TJ; hand: TJ };
const JOINTS = ["head", "neck", "shoulder", "hip", "knee", "ankle", "toe", "elbow", "hand"] as const;

/** the pose between a and b (t from 0 to 1) */
export function mixPose(a: TPose, b: TPose, t: number): TPose {
  "worklet";
  const o = {} as TPose;
  for (let i = 0; i < JOINTS.length; i++) {
    const k = JOINTS[i];
    o[k] = [a[k][0] + (b[k][0] - a[k][0]) * t, a[k][1] + (b[k][1] - a[k][1]) * t];
  }
  return o;
}

export type FigureParts = { shadow: string; far: string; robe: string; robeHi: string; folds: string; sash: string; neck: string; head: string; headHi: string; cap: string; band: string; feet: string; arm: string; cuff: string; hand: string; finger: string };
/** the faceless figure for a pose (side view, facing the qibla on the right) as paths, back to front */
export function figureParts(p: TPose): FigureParts {
  "worklet";
  const ox = -3.6, oy = -1.2;
  const far = capsule(p.hip[0] + ox, p.hip[1] + oy, p.knee[0] + ox, p.knee[1] + oy, 8.5, 7)
    + capsule(p.knee[0] + ox, p.knee[1] + oy, p.ankle[0] + ox, p.ankle[1] + oy, 6.4, 4.4)
    + capsule(p.ankle[0] + ox, p.ankle[1] + oy, p.toe[0] + ox, p.toe[1] + oy, 2.9, 2.1)
    + capsule(p.shoulder[0] + ox, p.shoulder[1] + oy, p.elbow[0] + ox, p.elbow[1] + oy, 4.6, 4)
    + capsule(p.elbow[0] + ox, p.elbow[1] + oy, p.hand[0] + ox, p.hand[1] + oy, 4, 3.2)
    + disc(p.hand[0] + ox, p.hand[1] + oy, 3.2);
  // the robe falls straight when the shin stands upright, and lies close to the leg when it rests on the floor
  const sx = p.ankle[0] - p.knee[0], sy = p.ankle[1] - p.knee[1], sl = Math.sqrt(sx * sx + sy * sy) || 1;
  const upright = Math.max(0, sy / sl);
  const hem = 6.5 + 7 * upright * upright;
  const hx = p.ankle[0] - (sx / sl) * 3 * upright, hy = p.ankle[1] - 3 * upright;
  const robe = capsule(p.neck[0], p.neck[1] + 3, p.hip[0], p.hip[1], 9.5, 12.5, 2)
    + capsule(p.shoulder[0] + 1, p.shoulder[1] + 4, p.hip[0], p.hip[1] - 6, 10, 11)
    + capsule(p.hip[0], p.hip[1], p.knee[0], p.knee[1], 12.5, 10.5, 1)
    + capsule(p.knee[0], p.knee[1], hx, hy, 10.5, hem, 0.6);
  // two soft folds down the skirt and a gold sash at the waist
  const tx = p.hip[0] - p.neck[0], ty = p.hip[1] - p.neck[1], tl = Math.sqrt(tx * tx + ty * ty) || 1;
  const qx = -ty / tl, qy = tx / tl;
  const kx = p.knee[0] - p.hip[0], ky = p.knee[1] - p.hip[1], kl = Math.sqrt(kx * kx + ky * ky) || 1;
  const fx = -ky / kl, fy = kx / kl;
  let folds = "";
  for (let j = -1; j <= 1; j += 2) {
    const o1 = j * 4.5, o2 = j * (4 + hem * 0.45);
    folds += `M${f2(p.hip[0] + fx * o1 + kx * 0.25)} ${f2(p.hip[1] + fy * o1 + ky * 0.25)}Q${f2(p.knee[0] + fx * o1 * 1.1)} ${f2(p.knee[1] + fy * o1 * 1.1)} ${f2(hx + fx * o2 * upright + (1 - upright) * fx * o1)} ${f2(hy + fy * o2 * upright + (1 - upright) * fy * o1 - 2)}`;
  }
  const wx = p.neck[0] + tx * 0.7, wy = p.neck[1] + ty * 0.7, ww = 11.8;
  const sash = `M${f2(wx + qx * ww)} ${f2(wy + qy * ww)}Q${f2(wx + (tx / tl) * 1.6)} ${f2(wy + (ty / tl) * 1.6)} ${f2(wx - qx * ww)} ${f2(wy - qy * ww)}`;
  const robeHi = capsule(p.neck[0] - 3, p.neck[1] + 6, (p.neck[0] + p.hip[0]) / 2 - 4, (p.neck[1] + p.hip[1]) / 2 - 2, 2.2, 3.4, 1);
  // head: direction from the neck to the head decides where the cap sits
  const hdx = p.head[0] - p.neck[0], hdy = p.head[1] - p.neck[1], hl = Math.sqrt(hdx * hdx + hdy * hdy) || 1;
  const ux = hdx / hl, uy = hdy / hl, a = Math.atan2(uy, ux), r = 11.5;
  const at = (ang: number, rr: number) => `${f2(p.head[0] + Math.cos(ang) * rr)} ${f2(p.head[1] + Math.sin(ang) * rr)}`;
  const cap = `M${at(a - 1.45, r + 0.6)}A${f2(r + 0.6)} ${f2(r + 0.6)} 0 0 1 ${at(a + 1.45, r + 0.6)}Q${f2(p.head[0] + ux * r * 0.12)} ${f2(p.head[1] + uy * r * 0.12)} ${at(a - 1.45, r + 0.6)}Z`;
  const band = `M${at(a - 1.42, r + 0.4)}Q${f2(p.head[0] + ux * r * 0.12)} ${f2(p.head[1] + uy * r * 0.12)} ${at(a + 1.42, r + 0.4)}`;
  const neck = capsule(p.neck[0], p.neck[1] + 2, p.head[0] - ux * 6, p.head[1] - uy * 6, 4.4, 4.6);
  const head = disc(p.head[0], p.head[1], r);
  const headHi = disc(p.head[0] - r * 0.32, p.head[1] - r * 0.3, r * 0.34);
  const feet = capsule(p.ankle[0], p.ankle[1], p.toe[0], p.toe[1], 3.1, 2.3);
  const arm = capsule(p.shoulder[0], p.shoulder[1], p.elbow[0], p.elbow[1], 5.4, 4.7, 0.6) + capsule(p.elbow[0], p.elbow[1], p.hand[0], p.hand[1], 4.7, 4);
  const ex = p.hand[0] - p.elbow[0], ey = p.hand[1] - p.elbow[1], el = Math.sqrt(ex * ex + ey * ey) || 1;
  const cx = p.hand[0] - (ex / el) * 3.2, cy = p.hand[1] - (ey / el) * 3.2, nx = -ey / el, ny = ex / el;
  const cuff = `M${f2(cx + nx * 4.2)} ${f2(cy + ny * 4.2)}L${f2(cx - nx * 4.2)} ${f2(cy - ny * 4.2)}`;
  const hand = disc(p.hand[0] + (ex / el) * 1.2, p.hand[1] + (ey / el) * 1.2, 3.6);
  const finger = capsule(p.hand[0] + 1, p.hand[1] - 1, p.hand[0] + 10, p.hand[1] - 5.5, 1.4, 1.1);
  const xs = [p.hip[0], p.knee[0], p.ankle[0], p.toe[0], p.head[0]];
  let lo = xs[0], hi = xs[0];
  for (let i = 1; i < xs.length; i++) { lo = Math.min(lo, xs[i]); hi = Math.max(hi, xs[i]); }
  const scx = (lo + hi) / 2, srx = 16 + (hi - lo) * 0.55;
  const shadow = `M${f2(scx - srx)} 209.5A${f2(srx)} 3.6 0 1 1 ${f2(scx + srx)} 209.5A${f2(srx)} 3.6 0 1 1 ${f2(scx - srx)} 209.5Z`;
  return { shadow, far, robe, robeHi, folds, sash, neck, head, headHi, cap, band, feet, arm, cuff, hand, finger };
}

// ---------- the courtyard behind the scenes (static) ----------
const rng = (seed: string) => { let x = 2166136261; for (let i = 0; i < seed.length; i++) x = Math.imul(x ^ seed.charCodeAt(i), 16777619); x >>>= 0; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 10000) / 10000; }; };
/** a lobed, cloud-like foliage mass (blob of the garden tree) */
function blob(cx: number, cy: number, rad: number, r: () => number, lobes = 8, flat = 0.9): string {
  const pts = Array.from({ length: lobes }, (_, i) => ({ a: (i / lobes) * Math.PI * 2 + r() * 0.3, k: 0.86 + r() * 0.14 }));
  const at = (a: number, k: number) => `${f2(cx + Math.cos(a) * rad * k)} ${f2(cy + Math.sin(a) * rad * k * flat)}`;
  let d = `M${at(pts[0].a, pts[0].k)}`;
  for (let i = 0; i < lobes; i++) {
    const p0 = pts[i], p1 = pts[(i + 1) % lobes], a1 = i + 1 === lobes ? p1.a + Math.PI * 2 : p1.a, m = (p0.a + a1) / 2;
    d += ` Q${at(m, 1.2 + r() * 0.18)} ${at(p1.a, p1.k)}`;
  }
  return `${d} Z`;
}
export type GardenTree = { x: number; ground: number; trunk: string; shade: string; body: string; lit: string; hi: string; glints: [number, number, number][] };
/** a small garden tree (trunk, deep shadow masses, the crown, lit clusters, soft highlights, gold glints) */
export function gardenTree(x: number, ground: number, crown: number, seed: string): GardenTree {
  const r = rng(seed), top = ground - crown * 2.3, w = crown * 0.12;
  const trunk = `M${f2(x - w)} ${ground}C${f2(x - w * 0.6)} ${f2(ground - crown)} ${f2(x - w * 0.5)} ${f2(top + crown)} ${f2(x - w * 0.35)} ${f2(top + crown * 0.6)}L${f2(x + w * 0.35)} ${f2(top + crown * 0.6)}C${f2(x + w * 0.5)} ${f2(top + crown)} ${f2(x + w * 0.6)} ${f2(ground - crown)} ${f2(x + w)} ${ground}Z`;
  const tips = Array.from({ length: 4 }, (_, i) => { const a = -Math.PI / 2 + ((i / 3) - 0.5) * 2.3; return [x + Math.cos(a) * crown * (0.55 + r() * 0.3), top + crown * 0.55 + Math.sin(a) * crown * 0.55] as const; });
  const R1 = crown * 0.42;
  const shade = tips.map(([bx, by]) => blob(bx + 3, by + 6, crown * 0.46, r, 8, 0.9)).join(" ");
  const body = blob(x, top + crown * 0.62, crown * 0.86, r, 11, 0.7);
  const lit = tips.map(([bx, by]) => blob(bx, by, R1, r, 9, 0.9)).join(" ");
  const hi = tips.map(([bx, by]) => blob(bx - R1 * 0.22, by - R1 * 0.28, R1 * 0.5, r, 7, 0.9)).join(" ");
  const glints: [number, number, number][] = [];
  tips.forEach(([bx, by]) => { for (let k = 0; k < 2; k++) { const a = Math.PI * (1.05 + k * 0.2 + r() * 0.1); glints.push([+f2(bx + Math.cos(a) * R1 * 0.9), +f2(by + Math.sin(a) * R1 * 0.8), +f2(0.8 + r() * 0.6)]); } });
  return { x, ground, trunk, shade, body, lit, hi, glints };
}

/** domes and minarets on the horizon (G = ground line): far layer and near layer */
export function skyline(G: number): { far: string; near: string } {
  const minaret = (x: number, h: number, w: number) => `M${x - w} ${G}V${G - h}L${x - w - 1.5} ${G - h}L${x - w - 1.5} ${G - h - 3}L${x + w + 1.5} ${G - h - 3}L${x + w + 1.5} ${G - h}L${x + w} ${G - h}V${G - h - 3}L${x + w} ${G - h - 12}Q${x} ${G - h - 26} ${x - w} ${G - h - 12}V${G - h}Z`;
  const dome = (x: number, rw: number, drum: number) => `M${x - rw - 4} ${G}V${G - drum}H${x - rw}C${x - rw} ${G - drum - rw * 1.2} ${x - 2} ${G - drum - rw * 1.4} ${x} ${G - drum - rw * 1.75}C${x + 2} ${G - drum - rw * 1.4} ${x + rw} ${G - drum - rw * 1.2} ${x + rw} ${G - drum}H${x + rw + 4}V${G}Z`;
  const hills = `M0 ${G}V${G - 14}C30 ${G - 24} 60 ${G - 10} 96 ${G - 16}C130 ${G - 22} 170 ${G - 8} 204 ${G - 18}C220 ${G - 21} 232 ${G - 16} 240 ${G - 14}V${G}Z`;
  const far = [hills, dome(64, 15, 14), minaret(34, 40, 2.6), dome(184, 13, 12), minaret(212, 46, 2.6)].join(" ");
  const near = [dome(24, 11, 6), minaret(84, 26, 2), dome(222, 10, 6), minaret(160, 22, 2)].join(" ");
  return { far, near };
}

/** the terrace: marble top from G to G + 7, an emerald face below with a zellige row (diamonds alternately gold and ivory) */
export function terrace(G: number, H: number): { top: string; face: string; rim: string; diamonds: [string, string][] } {
  const top = `M0 ${G}H240V${G + 7}H0Z`, face = `M0 ${G + 7}H240V${H}H0Z`, rim = `M0 ${G + 7}H240`;
  const s = Math.min(3, (H - G - 7) / 2 - 0.6), y = G + 7 + 1.4 + s;
  const diamonds: [string, string][] = Array.from({ length: 20 }, (_, i) => { const x = 6 + i * 12; return [`M${x} ${f2(y - s)}l${s} ${s}l${-s} ${s}l${-s} ${-s}Z`, i % 2 ? TA.gold : "#f2e9d2"]; });
  return { top, face, rim, diamonds };
}

/** the prayer mat on the terrace (perspective), its gold border and the arch at the qibla end */
export const MAT = {
  base: "M44 206.2L198 206.2L204 212.6L38 212.6Z",
  border: "M48 207.1L194.6 207.1L199.2 211.7L43 211.7Z",
  arch: "M184 211.7C184 208.6 186.6 207.4 189.6 207.1C192.6 207.4 195 208.6 195.6 211.7",
  fringe: "M36 207.4l-3 1.2M35 209.4l-3.6 .9M34.4 211.4l-3.8 .6M206.2 207.4l3 1.2M207 209.4l3.6 .9M207.6 211.4l3.8 .6",
} as const;

/** the floating motes of light (x, y, r, delay in s) */
export const MOTES: [number, number, number, number][] = [[42, 96, 2.4, 0], [196, 74, 2.8, 1.3], [70, 52, 1.8, 2.1], [168, 128, 2, 0.6], [132, -14, 2.2, 2.8], [216, 150, 1.6, 1.8]];
