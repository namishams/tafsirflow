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
  return `M${f2(cx - r)} ${f2(cy)}A${f2(r)} ${f2(r)} 0 1 0 ${f2(cx + r)} ${f2(cy)}A${f2(r)} ${f2(r)} 0 1 0 ${f2(cx - r)} ${f2(cy)}Z`;
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

/** the figure is drawn from the trainer's joints and then shown at this scale around its feet (cx, ground), so it
 *  stands on the mat in the lower third of the scene with sky, trees and the qibla around it */
export const FIG = { s: 0.62, cx: 118, ground: 209 } as const;

export type FigureParts = { shadow: string; far: string; robe: string; robeHi: string; folds: string; sash: string; shoulder: string; neck: string; head: string; headHi: string; cap: string; band: string; feet: string; arm: string; cuff: string; hand: string; finger: string; hood: string; face: string; trim: string };
/** "m": thobe and kufi; "f": a full, loose prayer garment (khimar over head and shoulders, the face open, a jilbab
 *  falling over the feet), ivory with gold trim */
export type FigureKind = "m" | "f";
const NONE = "M0 0";
/** the faceless figure for a pose (side view, facing the qibla on the right) as paths, back to front: a flowing thobe
 *  with a rounded shoulder, a softly bent arm, a head of about a seventh of the height under an emerald kufi */
export function figureParts(p: TPose, kind: FigureKind = "m"): FigureParts {
  "worklet";
  const fem = kind === "f";
  // a straight arm bends softly at the elbow (backwards, as a relaxed arm does)
  const ahx = p.hand[0] - p.shoulder[0], ahy = p.hand[1] - p.shoulder[1], ahl = Math.sqrt(ahx * ahx + ahy * ahy) || 1;
  const dev = Math.abs(((p.elbow[0] - p.shoulder[0]) * ahy - (p.elbow[1] - p.shoulder[1]) * ahx) / ahl);
  const bend = Math.max(0, 4.5 - dev);
  let bx = ahy / ahl, by = -ahx / ahl; // perpendicular of shoulder to hand, turned towards the back (smaller x)
  if (bx > 0 || (bx === 0 && by > 0)) { bx = -bx; by = -by; }
  const el: TJ = [p.elbow[0] + bx * bend, p.elbow[1] + by * bend];
  const ox = -3.8, oy = -1.4;
  const far = capsule(p.hip[0] + ox, p.hip[1] + oy, p.knee[0] + ox, p.knee[1] + oy, 9.5, 8)
    + capsule(p.knee[0] + ox, p.knee[1] + oy, p.ankle[0] + ox, p.ankle[1] + oy, 7, 5)
    + capsule(p.ankle[0] + ox, p.ankle[1] + oy, p.toe[0] + ox, p.toe[1] + oy, 3.1, 2.3)
    + capsule(p.shoulder[0] + ox, p.shoulder[1] + oy, el[0] + ox, el[1] + oy, 5.4, 4.6, 0.6)
    + capsule(el[0] + ox, el[1] + oy, p.hand[0] + ox, p.hand[1] + oy, 4.6, 3.8)
    + disc(p.hand[0] + ox, p.hand[1] + oy, 3.6);
  // the thobe falls wide to the ankles when the shin stands upright, and lies close to the leg when it rests on the floor
  const sx = p.ankle[0] - p.knee[0], sy = p.ankle[1] - p.knee[1], sl = Math.sqrt(sx * sx + sy * sy) || 1;
  const upright = Math.max(0, sy / sl);
  const hem = 8 + 11 * upright * upright + (fem ? 3 : 0);
  const hx = p.ankle[0] - (sx / sl) * 3 * upright + (fem ? (p.toe[0] - p.ankle[0]) * 0.5 : 0), hy = p.ankle[1] - 2.5 * upright + (fem ? 1.5 : 0);
  // the torso: spine from neck to hip, a rounded chest in front and the curve of the upper back behind
  const tx = p.hip[0] - p.neck[0], ty = p.hip[1] - p.neck[1], tl = Math.sqrt(tx * tx + ty * ty) || 1;
  const qx = -ty / tl, qy = tx / tl; // towards the back
  const robe = capsule(p.neck[0], p.neck[1] + 3, p.hip[0], p.hip[1], 10.5, 13.5, 2.4)
    + capsule(p.shoulder[0] + 0.5, p.shoulder[1] + 3, p.hip[0], p.hip[1] - 6, 11.5, 12)
    + disc(p.neck[0] + tx * 0.34 - qx * 4.2, p.neck[1] + ty * 0.34 - qy * 4.2, 10.5)
    + disc(p.neck[0] + tx * 0.2 + qx * 3.2, p.neck[1] + ty * 0.2 + qy * 3.2, 10)
    + disc(p.shoulder[0], p.shoulder[1] + 1.5, 9)
    + capsule(p.hip[0], p.hip[1], p.knee[0], p.knee[1], 14, 13.5, 1.6)
    + capsule(p.knee[0], p.knee[1], hx, hy, 13.5, hem, 1.6);
  // two soft folds down the skirt and a gold sash at the waist
  const kx = p.knee[0] - p.hip[0], ky = p.knee[1] - p.hip[1], kl = Math.sqrt(kx * kx + ky * ky) || 1;
  const fx = -ky / kl, fy = kx / kl;
  let folds = "";
  for (let j = -1; j <= 1; j += 2) {
    const o1 = j * 5, o2 = j * (4.5 + hem * 0.5);
    folds += `M${f2(p.hip[0] + fx * o1 + kx * 0.25)} ${f2(p.hip[1] + fy * o1 + ky * 0.25)}Q${f2(p.knee[0] + fx * o1 * 1.1)} ${f2(p.knee[1] + fy * o1 * 1.1)} ${f2(hx + fx * o2 * upright + (1 - upright) * fx * o1)} ${f2(hy + fy * o2 * upright + (1 - upright) * fy * o1 - 2)}`;
  }
  const wx = p.neck[0] + tx * 0.7, wy = p.neck[1] + ty * 0.7, ww = 12.8;
  const sash = `M${f2(wx + qx * ww)} ${f2(wy + qy * ww)}Q${f2(wx + (tx / tl) * 1.8)} ${f2(wy + (ty / tl) * 1.8)} ${f2(wx - qx * ww)} ${f2(wy - qy * ww)}`;
  const robeHi = capsule(p.neck[0] - 3.5, p.neck[1] + 7, (p.neck[0] + p.hip[0]) / 2 - 4.5, (p.neck[1] + p.hip[1]) / 2 - 2, 2.6, 3.8, 1);
  // the shoulder: a rounded seam over the top of the upper arm
  const sax = el[0] - p.shoulder[0], say = el[1] - p.shoulder[1], aa = Math.atan2(say, sax), sr = 8.6;
  const sp = (ang: number) => `${f2(p.shoulder[0] + Math.cos(ang) * sr)} ${f2(p.shoulder[1] + 1.5 + Math.sin(ang) * sr)}`;
  const shoulder = `M${sp(aa + 1.75)}A${sr} ${sr} 0 0 1 ${sp(aa + 4.3)}`;
  // head: direction from the neck to the head decides where the kufi sits
  const hdx = p.head[0] - p.neck[0], hdy = p.head[1] - p.neck[1], hl = Math.sqrt(hdx * hdx + hdy * hdy) || 1;
  const ux = hdx / hl, uy = hdy / hl, a = Math.atan2(uy, ux), r = 13.2;
  const at = (ang: number, rr: number) => `${f2(p.head[0] + Math.cos(ang) * rr)} ${f2(p.head[1] + Math.sin(ang) * rr)}`;
  const cap = `M${at(a - 1.4, r + 0.7)}A${f2(r + 0.7)} ${f2(r + 0.7)} 0 0 1 ${at(a + 1.4, r + 0.7)}Q${f2(p.head[0] + ux * r * 0.18)} ${f2(p.head[1] + uy * r * 0.18)} ${at(a - 1.4, r + 0.7)}Z`;
  const band = `M${at(a - 1.37, r + 0.5)}Q${f2(p.head[0] + ux * r * 0.18)} ${f2(p.head[1] + uy * r * 0.18)} ${at(a + 1.37, r + 0.5)}`;
  const neck = capsule(p.neck[0], p.neck[1] + 3, p.head[0] - ux * 7, p.head[1] - uy * 7, 5, 5.2);
  const head = disc(p.head[0], p.head[1], r);
  const headHi = disc(p.head[0] - r * 0.3, p.head[1] - r * 0.28, r * 0.36);
  const feet = capsule(p.ankle[0], p.ankle[1], p.toe[0], p.toe[1], 3.3, 2.5);
  const arm = capsule(p.shoulder[0], p.shoulder[1] + 1, el[0], el[1], 6.2, 5.2, 0.8) + capsule(el[0], el[1], p.hand[0], p.hand[1], 5.2, 4.4, 0.4);
  const ex = p.hand[0] - el[0], ey = p.hand[1] - el[1], ell = Math.sqrt(ex * ex + ey * ey) || 1;
  const cx = p.hand[0] - (ex / ell) * 3.4, cy = p.hand[1] - (ey / ell) * 3.4, nx = -ey / ell, ny = ex / ell;
  const cuff = `M${f2(cx + nx * 4.6)} ${f2(cy + ny * 4.6)}L${f2(cx - nx * 4.6)} ${f2(cy - ny * 4.6)}`;
  const hand = disc(p.hand[0] + (ex / ell) * 1.4, p.hand[1] + (ey / ell) * 1.4, 4);
  const finger = capsule(p.hand[0] + 1, p.hand[1] - 1, p.hand[0] + 10, p.hand[1] - 5.5, 1.5, 1.2);
  const xs = [p.hip[0], p.knee[0], p.ankle[0], p.toe[0], p.head[0]];
  let lo = xs[0], hi = xs[0];
  for (let i = 1; i < xs.length; i++) { lo = Math.min(lo, xs[i]); hi = Math.max(hi, xs[i]); }
  const scx = (lo + hi) / 2, srx = 18 + (hi - lo) * 0.55;
  const shadow = `M${f2(scx - srx)} 209.5A${f2(srx)} 4.4 0 1 1 ${f2(scx + srx)} 209.5A${f2(srx)} 4.4 0 1 1 ${f2(scx - srx)} 209.5Z`;
  if (!fem) return { shadow, far, robe, robeHi, folds, sash, shoulder, neck, head, headHi, cap, band, feet, arm, cuff, hand, finger, hood: NONE, face: NONE, trim: NONE };
  // khimar: the head wrapped, the cloth falling over the shoulders to the chest; the face open towards the front
  const fdx = -uy, fdy = ux; // the side the face looks to
  const hood = disc(p.head[0] - fdx * 0.6, p.head[1] - fdy * 0.6, r + 2.4)
    + capsule(p.head[0] - fdx * 1.2, p.head[1] - fdy * 1.2, p.neck[0] + tx * 0.32 + qx * 1.5, p.neck[1] + ty * 0.32 + qy * 1.5, r + 2.2, 14, 1.8);
  const face = disc(p.head[0] + fdx * r * 0.32, p.head[1] + fdy * r * 0.32, r * 0.76);
  const tr = r * 0.9;
  const tp = (ang: number) => `${f2(p.head[0] + fdx * r * 0.32 + Math.cos(ang) * tr)} ${f2(p.head[1] + fdy * r * 0.32 + Math.sin(ang) * tr)}`;
  const fa = Math.atan2(fdy, fdx);
  const trim = `M${tp(fa + 1.25)}A${f2(tr)} ${f2(tr)} 0 0 1 ${tp(fa + 5.03)}`;
  return { shadow, far, robe, robeHi, folds, sash: NONE, shoulder: NONE, neck, head, headHi: NONE, cap: NONE, band: NONE, feet: NONE, arm, cuff, hand, finger, hood, face, trim };
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

/** the wudu bust: small and soft, a rounded profile facing the qibla side, no features; an emerald kufi, which comes
 *  off for the steps that wipe the head and the ears (there the hair shows as a soft dark cap) */
export const BUST = {
  head: "M122 72C142 72 156 84 158 100C159 106 160 110 163 115C165 119 166 122 163 124C161 125 160 126 160 128C160 131 161 133 160 135C159 137 160 139 159 141C158 146 154 150 146 151C136 152 126 148 118 142C104 132 92 120 90 104C88 86 100 72 122 72Z",
  neck: capsule(122, 138, 118, 170, 13, 14.5),
  garment: "M50 240C52 206 76 182 104 171C112 178 128 179 136 170C164 180 186 204 190 240Z",
  neckline: "M104 172C112 182 128 182 136 171",
  kufi: "M93 90C93 76 106 67 123 67C140 67 153 75 155 86C140 82 108 84 93 90Z",
  kufiBand: "M93 90C108 84 140 82 155 86",
  hair: "M92 102C90 82 104 70 123 70C142 70 155 82 157 96C146 92 132 94 122 100C112 106 104 116 100 128C94 120 92 112 92 102Z",
  ear: "M106 114A6 9 0 1 0 118 114A6 9 0 1 0 106 114Z",
  face: "M157 96C158 98 158 99 158 100C159 106 160 110 163 115C165 119 166 122 163 124C161 125 160 126 160 128C160 131 161 133 160 135C159 137 160 139 159 141C158 146 154 150 146 151C138 140 133 120 139 101C145 97 151 95 157 96Z",
  faceFlow: "M151 100C153 114 153 128 151 144M142 102C143 116 143 130 142 148",
  lips: "M160 128C161 131 161 134 160 136C159 138 160 140 159 141",
  mouth: [165, 133] as const,
  nose: "M158 104C160 110 162 114 164 118C166 121 165 123 162 124",
  noseRoute: "M168 138C166 133 165 129 164 125C163 121 162 117 161 113",
  headRoute: "M154 92C146 78 128 72 110 78C98 84 92 96 94 112",
  headRouteShia: "M126 72C140 74 150 82 155 92",
  earRoutes: ["M116 106C111 108 110 115 113 121", "M104 104C101 112 102 120 106 126"] as const,
  earGlow: [112, 114] as const,
  heart: [128, 208] as const,
  faceDrops: [[150, 156], [142, 158]] as const,
} as const;

// ---------- other ways to pray: sitting on the floor, on a chair, lying ----------
/** the postures of the prayer trainer (the same keys as Posture in lib/salah) */
export type TPostureKey = "stand" | "takbir" | "folded" | "sides" | "qunut" | "ruku" | "sujud" | "sujudTurbah" | "sit" | "tashahhud" | "salamR" | "salamL";
/** "standing" uses the trainer's own poses; for "sitting" and "chair" the standing parts are done seated, ruku' and
 *  sujud as bows forward from the hips (sujud lower than ruku'); "lying" is one still picture with a note */
export type PostureSet = "standing" | "sitting" | "chair" | "lying";
export const POSTURE_SETS: readonly PostureSet[] = ["standing", "sitting", "chair", "lying"];

const SIT_BASE: TPose = { head: [106, 103], neck: [105, 120], shoulder: [104, 127], hip: [96, 187], knee: [148, 206], ankle: [82, 204], toe: [70, 209], elbow: [116, 158], hand: [140, 185] };
/** sitting on the floor */
export const SEATED: Record<TPostureKey, TPose> = {
  stand: SIT_BASE,
  sides: SIT_BASE,
  takbir: { ...SIT_BASE, elbow: [93, 134], hand: [101, 104] },
  folded: { ...SIT_BASE, elbow: [96, 160], hand: [116, 156] },
  qunut: { ...SIT_BASE, elbow: [100, 156], hand: [126, 137] },
  ruku: { ...SIT_BASE, head: [138, 114], neck: [129.5, 129], shoulder: [126, 135], elbow: [140, 162], hand: [150, 188] },
  sujud: { ...SIT_BASE, head: [165, 139], neck: [151, 148.6], shoulder: [145, 152.6], elbow: [156, 177], hand: [166, 200] },
  sujudTurbah: { ...SIT_BASE, head: [165, 139], neck: [151, 148.6], shoulder: [145, 152.6], elbow: [156, 177], hand: [166, 200] },
  sit: SIT_BASE,
  tashahhud: SIT_BASE,
  salamR: SIT_BASE,
  salamL: SIT_BASE,
};
const CHAIR_BASE: TPose = { head: [103, 78], neck: [102, 95], shoulder: [102, 102], hip: [100, 160], knee: [140, 162], ankle: [142, 205], toe: [156, 209], elbow: [110, 130], hand: [130, 154] };
/** sitting on a chair, the feet on the floor */
export const CHAIRED: Record<TPostureKey, TPose> = {
  stand: CHAIR_BASE,
  sides: CHAIR_BASE,
  takbir: { ...CHAIR_BASE, elbow: [92, 108], hand: [100, 80] },
  folded: { ...CHAIR_BASE, elbow: [93, 132], hand: [116, 127] },
  qunut: { ...CHAIR_BASE, elbow: [97, 129], hand: [122, 109] },
  ruku: { ...CHAIR_BASE, head: [141, 89], neck: [132.5, 103.7], shoulder: [129, 110], elbow: [141, 136], hand: [146, 158] },
  sujud: { ...CHAIR_BASE, head: [167, 113], neck: [153, 122.7], shoulder: [147.5, 126.7], elbow: [157, 148], hand: [161, 166] },
  sujudTurbah: { ...CHAIR_BASE, head: [167, 113], neck: [153, 122.7], shoulder: [147.5, 126.7], elbow: [157, 148], hand: [161, 166] },
  sit: CHAIR_BASE,
  tashahhud: CHAIR_BASE,
  salamR: CHAIR_BASE,
  salamL: CHAIR_BASE,
};
/** lying on the back, the head raised on a cushion, the feet towards the qibla */
export const LYING: TPose = { head: [62, 186], neck: [78, 192], shoulder: [84, 194], hip: [140, 199], knee: [172, 197], ankle: [200, 201], toe: [205, 192], elbow: [108, 201], hand: [128, 197] };
/** the pose of a step in a set (standing: the trainer's own table) */
export function poseIn(set: PostureSet, key: TPostureKey, standing: Record<TPostureKey, TPose>): TPose {
  return set === "sitting" ? SEATED[key] : set === "chair" ? CHAIRED[key] : set === "lying" ? LYING : standing[key];
}
/** the chair (wood with a gold rim) and the cushion for lying, in the figure's own coordinates */
export const PROPS = {
  chairBack: "M78 209V112C78 108 82 106 85 108L88 110V168H84V209Z",
  chairSeat: "M78 160H130C133 160 134 162 134 164V167H78Z",
  chairLeg: "M124 167H130V209H124Z",
  chairRim: "M80 160H132",
  cushion: "M44 196C44 186 56 182 72 184C84 186 90 192 88 200C86 206 72 207 58 206C48 205 44 202 44 196Z",
} as const;

/** the trainer's defaults from the learner's identity (qmc.identity.v1, read raw and defensively): a sister sees the
 *  female figure, `prayerPosture` picks the way of praying; anything missing or unknown means "m" and "standing" */
export function trainerDefaults(raw: unknown): { kind: FigureKind; set: PostureSet } {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const kind: FigureKind = o.gender === "sister" ? "f" : "m";
  const set = typeof o.prayerPosture === "string" && (POSTURE_SETS as readonly string[]).includes(o.prayerPosture) ? (o.prayerPosture as PostureSet) : "standing";
  return { kind, set };
}

/** the wudu bust with a headscarf: the scarf wraps head and neck and falls onto the shoulders, the face is open; for
 *  wiping the head the front edge is drawn back a little (the hairline shows), for the ears the scarf is lifted there */
export const BUST_F = {
  scarf: "M148 78C140 68 128 64 118 64C96 64 82 80 82 104C82 126 90 146 98 160C100 166 98 172 94 176C70 186 52 208 50 240H190C186 206 166 184 142 176C150 166 154 158 155 150C133 142 125 108 148 78Z",
  face: "M148 78C155 86 158 96 158 100C159 106 160 110 163 115C165 119 166 122 163 124C161 125 160 126 160 128C160 131 161 133 160 135C159 137 160 139 159 141C158 146 157 148 155 150C133 142 125 108 148 78Z",
  trim: "M148 78C125 108 133 142 155 150",
  hairline: "M148 78C152 82 156 89 158 96C154 92 150 90 144 87C145 84 146 81 148 78Z",
  headRoute: "M158 96C155 87 150 81 144 78",
  lift: "M103 100C112 95 123 102 123 114C123 126 115 133 106 129C99 125 97 108 103 100Z",
} as const;
/** the bust is shown at this scale around the middle of its foot (cx, base), so sky and trees frame it */
export const BUST_FIT = { s: 0.84, cx: 120, base: 240 } as const;

/** the words of the figure and posture selectors (every language of the trainers; missing ones fall back to English) */
export type TrainerUiKey = "figure" | "man" | "woman" | "posture" | "standing" | "sitting" | "chair" | "lying" | "lyingNote";
export const TRAINER_UI: Record<string, Record<TrainerUiKey, string>> = {
  de: { figure: "Figur", man: "Mann", woman: "Frau", posture: "Gebetshaltung", standing: "Stehend", sitting: "Im Sitzen", chair: "Auf dem Stuhl", lying: "Im Liegen", lyingNote: "Wer weder stehen noch sitzen kann, betet im Liegen: auf der rechten Seite mit dem Gesicht zur Qibla oder auf dem Rücken mit den Füßen zur Qibla. Verbeugung und Niederwerfung deuten Sie mit dem Kopf an, die Niederwerfung etwas tiefer. Fragen Sie im Zweifel einen Gelehrten Ihrer Schule." },
  en: { figure: "Figure", man: "Man", woman: "Woman", posture: "Prayer posture", standing: "Standing", sitting: "Sitting", chair: "On a chair", lying: "Lying down", lyingNote: "Whoever can neither stand nor sit prays lying down: on the right side facing the qibla, or on the back with the feet towards the qibla. Indicate bowing and prostration with the head, the prostration a little lower. If in doubt, ask a scholar of your school." },
  ar: { figure: "الشكل", man: "رجل", woman: "امرأة", posture: "هيئة الصلاة", standing: "قائمًا", sitting: "جالسًا", chair: "على كرسي", lying: "مستلقيًا", lyingNote: "من لم يستطع القيام ولا القعود صلّى على جنبه الأيمن مستقبلًا القبلة، أو مستلقيًا على ظهره ورجلاه إلى القبلة، ويومئ برأسه للركوع والسجود، ويجعل السجود أخفض من الركوع. وعند الشك فاسأل عالمًا من مذهبك." },
  tr: { figure: "Figür", man: "Erkek", woman: "Kadın", posture: "Namaz duruşu", standing: "Ayakta", sitting: "Oturarak", chair: "Sandalyede", lying: "Yatarak", lyingNote: "Ne ayakta ne oturarak kılabilen, yatarak kılar: sağ tarafı üzerine yüzü kıbleye dönük ya da sırtüstü ayakları kıbleye doğru. Rükû ve secdeyi başla işaret edin, secdeyi biraz daha aşağı. Şüphede kendi mezhebinizden bir âlime danışın." },
  ur: { figure: "شکل", man: "مرد", woman: "عورت", posture: "نماز کی حالت", standing: "کھڑے ہو کر", sitting: "بیٹھ کر", chair: "کرسی پر", lying: "لیٹ کر", lyingNote: "جو نہ کھڑا ہو سکے نہ بیٹھ سکے وہ لیٹ کر نماز پڑھے: دائیں کروٹ پر چہرہ قبلہ کی طرف، یا پیٹھ کے بل پاؤں قبلہ کی طرف۔ رکوع اور سجدے کا اشارہ سر سے کریں، سجدہ کچھ زیادہ جھکا کر۔ شک ہو تو اپنے مکتب کے کسی عالم سے پوچھیں۔" },
  fa: { figure: "شکل", man: "مرد", woman: "زن", posture: "حالت نماز", standing: "ایستاده", sitting: "نشسته", chair: "روی صندلی", lying: "خوابیده", lyingNote: "کسی که نه می‌تواند بایستد و نه بنشیند، خوابیده نماز می‌خواند: بر پهلوی راست رو به قبله، یا به پشت با پاها به سوی قبله. رکوع و سجده را با سر اشاره کنید و سجده را کمی پایین‌تر. در صورت تردید از عالمی از مذهب خود بپرسید." },
  ps: { figure: "بڼه", man: "سړی", woman: "ښځه", posture: "د لمانځه حالت", standing: "ولاړ", sitting: "ناست", chair: "په څوکۍ", lying: "پروت", lyingNote: "څوک چې نه ودرېدای شي او نه کېناستای شي، پروت لمونځ کوي: په ښي اړخ مخ قبلې ته، یا شا ته پروت پښې قبلې ته. رکوع او سجده په سر اشاره کړئ، سجده لږ ټیټه. په شک کې د خپل مذهب له یوه عالم وپوښتئ." },
  fr: { figure: "Silhouette", man: "Homme", woman: "Femme", posture: "Position de prière", standing: "Debout", sitting: "Assis", chair: "Sur une chaise", lying: "Allongé", lyingNote: "Celui qui ne peut ni se tenir debout ni s'asseoir prie allongé : sur le côté droit, le visage vers la qibla, ou sur le dos, les pieds vers la qibla. Indiquez l'inclinaison et la prosternation de la tête, la prosternation un peu plus bas. En cas de doute, demandez à un savant de votre école." },
  es: { figure: "Figura", man: "Hombre", woman: "Mujer", posture: "Postura de oración", standing: "De pie", sitting: "Sentado", chair: "En una silla", lying: "Acostado", lyingNote: "Quien no puede estar de pie ni sentado reza acostado: sobre el lado derecho mirando a la qibla, o boca arriba con los pies hacia la qibla. Indique la inclinación y la postración con la cabeza, la postración un poco más baja. En caso de duda, consulte a un sabio de su escuela." },
  id: { figure: "Figur", man: "Laki-laki", woman: "Perempuan", posture: "Posisi shalat", standing: "Berdiri", sitting: "Duduk", chair: "Di kursi", lying: "Berbaring", lyingNote: "Siapa yang tidak mampu berdiri maupun duduk, shalat sambil berbaring: di sisi kanan menghadap kiblat, atau telentang dengan kaki ke arah kiblat. Isyaratkan rukuk dan sujud dengan kepala, sujud sedikit lebih rendah. Jika ragu, tanyakan kepada ulama mazhab Anda." },
  ms: { figure: "Figura", man: "Lelaki", woman: "Wanita", posture: "Kedudukan solat", standing: "Berdiri", sitting: "Duduk", chair: "Di kerusi", lying: "Berbaring", lyingNote: "Sesiapa yang tidak mampu berdiri atau duduk, solat sambil berbaring: di sisi kanan menghadap kiblat, atau terlentang dengan kaki ke arah kiblat. Isyaratkan rukuk dan sujud dengan kepala, sujud sedikit lebih rendah. Jika ragu, tanyalah ulama mazhab anda." },
  bn: { figure: "আকৃতি", man: "পুরুষ", woman: "নারী", posture: "নামাজের ভঙ্গি", standing: "দাঁড়িয়ে", sitting: "বসে", chair: "চেয়ারে", lying: "শুয়ে", lyingNote: "যে দাঁড়াতেও পারে না, বসতেও পারে না, সে শুয়ে নামাজ পড়বে: ডান কাতে কিবলামুখী হয়ে, অথবা চিত হয়ে পা কিবলার দিকে রেখে। রুকু ও সিজদা মাথা দিয়ে ইশারা করুন, সিজদা একটু বেশি নিচু। সন্দেহ হলে আপনার মাযহাবের একজন আলেমকে জিজ্ঞেস করুন।" },
  ru: { figure: "Фигура", man: "Мужчина", woman: "Женщина", posture: "Положение в намазе", standing: "Стоя", sitting: "Сидя", chair: "На стуле", lying: "Лёжа", lyingNote: "Кто не может ни стоять, ни сидеть, молится лёжа: на правом боку лицом к кибле или на спине ногами к кибле. Поясной поклон и земной поклон обозначьте движением головы, земной поклон чуть ниже. В случае сомнений спросите учёного своей школы." },
  zh: { figure: "人物", man: "男", woman: "女", posture: "礼拜姿势", standing: "站立", sitting: "坐着", chair: "坐椅子", lying: "躺着", lyingNote: "既不能站也不能坐的人躺着礼拜：右侧卧面向基卜拉，或仰卧双脚朝向基卜拉。用头示意鞠躬和叩头，叩头时比鞠躬更低。如有疑问，请询问您所属学派的学者。" },
};
export const trainerUi = (lang: string): Record<TrainerUiKey, string> => TRAINER_UI[lang] ?? TRAINER_UI.en;
