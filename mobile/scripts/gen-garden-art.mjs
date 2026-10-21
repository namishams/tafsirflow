// Generates the painted landscape layers of the garden and the onboarding (mobile/assets/garden/*.webp).
// Layered, misty, softly lit vector paintings (an Islamic take on the new East Asian landscape style): distant
// mountains and dunes, a horizon of domes and minarets, cypress and palm groves, an Alhambra arcade and a Mughal
// pavilion. Each scene layer comes in a day and a night variant; the app cross-fades them with the prayer times.
// Run: node scripts/gen-garden-art.mjs  (needs sharp from the repository root)
import { createRequire } from "node:module";
import { mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("../../node_modules/sharp");
const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "..", "assets", "garden");
mkdirSync(OUT, { recursive: true });

// ---------- helpers ----------
const rng = (seed) => { let x = seed * 2654435761 >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return (x % 100000) / 100000; }; };
const f = (n) => Math.round(n * 10) / 10;
/** a fractal ridge line (midpoint displacement) from x0 to x1 */
function ridge(x0, x1, y, amp, rough, seed, steps = 7) {
  const r = rng(seed);
  let pts = [[x0, y + (r() - 0.5) * amp], [x1, y + (r() - 0.5) * amp]];
  let a = amp;
  for (let s = 0; s < steps; s++) {
    const nx = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      nx.push([ax, ay], [(ax + bx) / 2, (ay + by) / 2 + (r() - 0.5) * a]);
    }
    nx.push(pts[pts.length - 1]);
    pts = nx; a *= rough;
  }
  return pts;
}
/** a filled ridge whose ends slope down softly (no hard vertical edges) */
const fill = (pts, bottom) => { const a = pts[0], b = pts[pts.length - 1], k = (bottom - Math.min(a[1], b[1])) * 1.4; return `M${f(a[0] - k)} ${bottom} Q${f(a[0] - k * 0.2)} ${f(a[1])} ${f(a[0])} ${f(a[1])} ` + pts.map(([x, y]) => `L${f(x)} ${f(y)}`).join(" ") + ` Q${f(b[0] + k * 0.2)} ${f(b[1])} ${f(b[0] + k)} ${bottom} Z`; };
/** smooth dunes from a few sine waves */
function dunes(x0, x1, y, amp, seed) {
  const r = rng(seed), ph = [r() * 6, r() * 6, r() * 6];
  const pts = [];
  for (let x = x0; x <= x1; x += 8) pts.push([x, y - Math.sin(x / 140 + ph[0]) * amp - Math.sin(x / 61 + ph[1]) * amp * 0.35 - Math.abs(Math.sin(x / 230 + ph[2])) * amp * 0.8]);
  return pts;
}
const defs = (W, H) => `
  <filter id="brush" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.018 0.05" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>
  <filter id="wash" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.011 0.02" numOctaves="3" seed="11" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 1  0 0 0 0 0.98  0 0 0 0 0.9  0.55 0 0 0 -0.22" result="lt"/><feComposite in="lt" in2="SourceAlpha" operator="in" result="lm"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="lm"/></feMerge></filter>
  <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="blur14" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="blur26" x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur stdDeviation="26"/></filter>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5"/></filter>`;
const svg = (W, H, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs(W, H)}</defs>${body}</svg>`;
const vgrad = (id, stops) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join("")}</linearGradient>`;

// ---------- architecture ----------
const onion = (cx, by, w, h) => `M${f(cx - w / 2)} ${f(by)} C${f(cx - w * 0.66)} ${f(by - h * 0.42)} ${f(cx - w * 0.28)} ${f(by - h * 0.66)} ${f(cx)} ${f(by - h)} C${f(cx + w * 0.28)} ${f(by - h * 0.66)} ${f(cx + w * 0.66)} ${f(by - h * 0.42)} ${f(cx + w / 2)} ${f(by)} Z`;
const hemi = (cx, by, r, k = 1) => `M${f(cx - r)} ${f(by)} A${f(r)} ${f(r * k)} 0 0 1 ${f(cx + r)} ${f(by)} Z`;
const finial = (cx, ty, s, col) => `<path d="M${f(cx)} ${f(ty)} v${f(-s * 1.6)}" stroke="${col}" stroke-width="${f(s * 0.22)}"/><circle cx="${f(cx)}" cy="${f(ty - s * 0.7)}" r="${f(s * 0.32)}" fill="${col}"/><path d="M${f(cx + s * 0.35)} ${f(ty - s * 2.3)} a${f(s * 0.5)} ${f(s * 0.5)} 0 1 0 0 ${f(s)} a${f(s * 0.38)} ${f(s * 0.38)} 0 1 1 0 ${f(-s)} Z" fill="${col}"/>`;
function minaret(x, by, w, h, style, c) {
  let s = `<rect x="${f(x - w / 2)}" y="${f(by - h)}" width="${f(w)}" height="${f(h)}" fill="${c.body}"/>`;
  for (const k of [0.45, 0.72]) s += `<rect x="${f(x - w * 0.8)}" y="${f(by - h * k)}" width="${f(w * 1.6)}" height="${f(Math.max(2, w * 0.28))}" fill="${c.body}"/>`;
  if (style === "pencil") s += `<path d="M${f(x - w * 0.62)} ${f(by - h)} L${f(x)} ${f(by - h - w * 3.6)} L${f(x + w * 0.62)} ${f(by - h)} Z" fill="${c.dome}"/>` + finial(x, by - h - w * 3.6, w * 0.5, c.gold);
  else if (style === "onion") s += `<rect x="${f(x - w * 0.7)}" y="${f(by - h - w * 0.9)}" width="${f(w * 1.4)}" height="${f(w * 0.9)}" fill="${c.body}"/><path d="${onion(x, by - h - w * 0.9, w * 1.4, w * 1.8)}" fill="${c.dome}"/>` + finial(x, by - h - w * 2.7, w * 0.4, c.gold);
  else s += `<rect x="${f(x - w * 0.42)}" y="${f(by - h - w * 1.2)}" width="${f(w * 0.84)}" height="${f(w * 1.2)}" fill="${c.body}"/><path d="${hemi(x, by - h - w * 1.2, w * 0.42)}" fill="${c.dome}"/>` + finial(x, by - h - w * 1.62, w * 0.35, c.gold);
  if (c.win) s += `<rect x="${f(x - w * 0.14)}" y="${f(by - h * 0.62)}" width="${f(w * 0.28)}" height="${f(w * 0.7)}" rx="${f(w * 0.14)}" fill="${c.win}"/>`;
  return s;
}
/** a horseshoe arch opening (Andalusian) */
const horseshoe = (x, by, w, h) => `M${f(x)} ${f(by)} V${f(by - h + w * 0.55)} A${f(w * 0.56)} ${f(w * 0.6)} 0 1 1 ${f(x + w)} ${f(by - h + w * 0.55)} V${f(by)} Z`;
/** a pointed (Mughal/Persian) arch opening */
const pointed = (x, by, w, h) => `M${f(x)} ${f(by)} V${f(by - h + w * 0.5)} Q${f(x)} ${f(by - h + w * 0.08)} ${f(x + w / 2)} ${f(by - h)} Q${f(x + w)} ${f(by - h + w * 0.08)} ${f(x + w)} ${f(by - h + w * 0.5)} V${f(by)} Z`;

// ---------- vegetation ----------
const cypress = (x, by, w, h, col, hi) => `<path d="M${f(x)} ${f(by - h)} C${f(x + w * 0.42)} ${f(by - h * 0.78)} ${f(x + w * 0.62)} ${f(by - h * 0.3)} ${f(x + w * 0.18)} ${f(by)} L${f(x - w * 0.18)} ${f(by)} C${f(x - w * 0.62)} ${f(by - h * 0.3)} ${f(x - w * 0.42)} ${f(by - h * 0.78)} ${f(x)} ${f(by - h)} Z" fill="${col}"/>` + (hi ? `<path d="M${f(x - w * 0.05)} ${f(by - h * 0.92)} C${f(x - w * 0.36)} ${f(by - h * 0.7)} ${f(x - w * 0.46)} ${f(by - h * 0.32)} ${f(x - w * 0.16)} ${f(by - h * 0.06)}" stroke="${hi}" stroke-width="${f(w * 0.12)}" fill="none" opacity="0.5" stroke-linecap="round"/>` : "");
function palm(x, by, h, lean, seed, col, hi) {
  const r = rng(seed);
  const tx = x + lean * h, ty = by - h;
  let s = `<path d="M${f(x - 5)} ${f(by)} Q${f(x + lean * h * 0.2)} ${f(by - h * 0.5)} ${f(tx - 2.5)} ${f(ty)} L${f(tx + 2.5)} ${f(ty)} Q${f(x + lean * h * 0.2 + 8)} ${f(by - h * 0.5)} ${f(x + 5)} ${f(by)} Z" fill="${col}"/>`;
  const n = 11;
  for (let i = 0; i < n; i++) {
    const a = Math.PI + (i / (n - 1)) * Math.PI + (r() - 0.5) * 0.3;
    const len = h * (0.34 + r() * 0.14);
    const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * 0.45 + len * 0.38;
    const mx = tx + Math.cos(a) * len * 0.5, my = ty + Math.sin(a) * len * 0.5 - len * 0.12;
    s += `<path d="M${f(tx)} ${f(ty)} Q${f(mx)} ${f(my - 6)} ${f(ex)} ${f(ey)} Q${f(mx)} ${f(my + 7)} ${f(tx)} ${f(ty + 3)} Z" fill="${col}"/>`;
    for (let j = 1; j < 8; j++) { const t = j / 8, px = tx + (ex - tx) * t, py = ty + (ey - ty) * t - Math.sin(t * Math.PI) * len * 0.1; s += `<path d="M${f(px)} ${f(py)} l${f(Math.cos(a + 1.1) * 10)} ${f(Math.sin(a + 1.1) * 10 + 6)}" stroke="${col}" stroke-width="2.2" stroke-linecap="round"/>`; }
    if (hi && i % 3 === 0) s += `<path d="M${f(tx)} ${f(ty)} Q${f(mx)} ${f(my - 6)} ${f(ex)} ${f(ey)}" stroke="${hi}" stroke-width="1.6" fill="none" opacity="0.55"/>`;
  }
  return s;
}
/** a soft bushy mass (orange trees, myrtle hedges) */
function bush(cx, by, w, h, seed, col, hi) {
  const r = rng(seed); let s = "";
  for (let i = 0; i < 9; i++) { const x = cx + (r() - 0.5) * w * 0.8, y = by - h * 0.35 - r() * h * 0.45, rr = w * (0.16 + r() * 0.14); s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="${col}"/>`; }
  s += `<rect x="${f(cx - w * 0.45)}" y="${f(by - h * 0.4)}" width="${f(w * 0.9)}" height="${f(h * 0.4)}" fill="${col}"/>`;
  if (hi) s += `<path d="M${f(cx - w * 0.38)} ${f(by - h * 0.62)} Q${f(cx - w * 0.1)} ${f(by - h * 0.95)} ${f(cx + w * 0.2)} ${f(by - h * 0.78)}" stroke="${hi}" stroke-width="${f(w * 0.06)}" fill="none" opacity="0.35" stroke-linecap="round"/>`;
  return s;
}

// ---------- palettes ----------
const DAY = {
  far: ["#c9d8c4", "#b3c9b2", "#9ab69f", "#86a68d"], farMist: "#f4f1e2", dune: ["#e6d3a6", "#d8c08c"],
  city: { body: "#8fae98", dome: "#86a690", gold: "#e9cf99", win: null, wall: "#98b59f" }, cityMist: "#eef0e0",
  mid: { cyp: "#2d5a45", cypHi: "#6f9c7a", palm: "#355f45", palmHi: "#89b27c", bush: "#3c6a4c", bushHi: "#a3c48a", wall: "#d8c7a2", wallSh: "#b8a47c", gold: "#c6a65e", open: "#7a6a4a" },
  arc: { wall: "#e2d3ae", sh: "#c2ad82", open: "#5d543c", gold: "#c6a65e", tile: "#1d6b52", glow: null },
};
const NIGHT = {
  far: ["#16382f", "#123128", "#0e2a22", "#0b231c"], farMist: "#3b6656", dune: ["#1b3a2e", "#163126"],
  city: { body: "#0c271f", dome: "#0b241c", gold: "#b9944f", win: "#f2c46a", wall: "#0d2a21" }, cityMist: "#2a5546",
  mid: { cyp: "#061a13", cypHi: null, palm: "#071c15", palmHi: null, bush: "#08201a", bushHi: null, wall: "#163a2f", wallSh: "#0f2c23", gold: "#8a6a2c", open: "#2a2412" },
  arc: { wall: "#1b4034", sh: "#123027", open: "#e3b45a", gold: "#a8843f", tile: "#0b3d2e", glow: "#f6c869" },
};

// ---------- layers ----------
function far(P, night) {
  const W = 1200, H = 420;
  let b = vgrad("m1", [[0, P.far[0]], [1, P.far[0], 0.2]]) + vgrad("m2", [[0, P.far[1]], [1, P.far[1], 0.3]]) + vgrad("m3", [[0, P.far[2]], [1, P.far[2], 0.5]]) + vgrad("m4", [[0, P.far[3]], [1, P.far[3]]]) + vgrad("dn", [[0, P.dune[0]], [1, P.dune[1]]]);
  b = `<defs>${b}</defs>`;
  b += `<g filter="url(#brush)"><path d="${fill(ridge(-20, 1220, 170, 170, 0.55, 3), H)}" fill="url(#m1)" opacity="0.8"/></g>`;
  b += `<rect x="-50" y="230" width="${W + 100}" height="70" fill="${P.farMist}" opacity="${night ? 0.2 : 0.6}" filter="url(#blur26)"/>`;
  b += `<g filter="url(#brush)"><path d="${fill(ridge(-20, 720, 235, 120, 0.5, 9), H)}" fill="url(#m2)"/><path d="${fill(ridge(640, 1220, 250, 90, 0.55, 21), H)}" fill="url(#m2)" opacity="0.8"/></g>`;
  // the desert to the right: soft dunes in gold
  b += `<g filter="url(#brush)"><path d="${fill(dunes(560, 1220, 300, 26, 5), H)}" fill="url(#dn)" opacity="${night ? 0.9 : 0.85}"/></g>`;
  b += `<rect x="-50" y="290" width="${W + 100}" height="60" fill="${P.farMist}" opacity="${night ? 0.3 : 0.7}" filter="url(#blur26)"/>`;
  b += `<g filter="url(#brush)"><path d="${fill(ridge(-20, 620, 318, 70, 0.5, 33), H)}" fill="url(#m3)"/><path d="${fill(dunes(500, 1220, 345, 16, 8), H)}" fill="url(#m4)" opacity="0.9"/></g>`;
  // a far oasis: tiny palms on the dunes
  for (const [x, h, l] of [[880, 46, 0.08], [905, 38, -0.12], [930, 52, 0.04], [1040, 34, -0.06]]) b += palm(x, 336, h, l, x, P.far[3], null);
  b += `<rect x="-50" y="360" width="${W + 100}" height="80" fill="${P.farMist}" opacity="${night ? 0.25 : 0.6}" filter="url(#blur26)"/>`;
  return [svg(W, H, `<g>${b}</g>`), W, H];
}

function city(P, night) {
  const W = 1600, H = 360, by = 300, c = P.city;
  let b = "";
  // the hill of a palace on the left (Alhambra): walls with merlons and square towers
  b += `<path d="${fill(ridge(80, 700, 300, 26, 0.5, 14, 5), H)}" fill="${c.wall}"/>`;
  b += `<rect x="140" y="250" width="520" height="60" fill="${c.wall}"/>`;
  for (let x = 140; x < 660; x += 14) b += `<path d="M${x} 250 v-8 l4 -4 l4 4 v8 Z" fill="${c.wall}"/>`;
  for (const [x, w, h] of [[170, 40, 70], [300, 54, 96], [470, 46, 80], [600, 38, 62]]) {
    b += `<rect x="${x}" y="${250 - h}" width="${w}" height="${h}" fill="${c.body}"/>`;
    for (let k = 0; k < w; k += 10) b += `<rect x="${x + k}" y="${250 - h - 8}" width="6" height="8" fill="${c.body}"/>`;
    if (c.win) for (let k = 0; k < 3; k++) b += `<rect x="${x + w / 2 - 3 + (k - 1) * 11}" y="${250 - h + 16}" width="5" height="9" rx="2.5" fill="${c.win}" opacity="${0.6 + k * 0.12}"/>`;
  }
  // an Ottoman mosque in the centre: a cascade of domes and pencil minarets
  const mx = 860;
  b += `<rect x="${mx - 120}" y="${by - 60}" width="240" height="70" fill="${c.body}"/>`;
  b += `<path d="${hemi(mx, by - 60, 92, 0.72)}" fill="${c.dome}"/><rect x="${mx - 60}" y="${by - 110}" width="120" height="44" fill="${c.body}"/><path d="${hemi(mx, by - 110, 64, 0.78)}" fill="${c.dome}"/>` + finial(mx, by - 160, 7, c.gold);
  for (const dx of [-100, 100]) b += `<path d="${hemi(mx + dx, by - 60, 26)}" fill="${c.dome}"/>`;
  for (const dx of [-150, 150]) b += minaret(mx + dx, by + 6, 10, 150, "pencil", c);
  if (!night) b += `<path d="M${mx - 60} ${by - 112} A64 50 0 0 1 ${mx - 6} ${by - 158}" stroke="${c.gold}" stroke-width="3" fill="none" opacity="0.8"/>`;
  if (c.win) for (let k = -4; k <= 4; k++) b += `<rect x="${mx + k * 22 - 3}" y="${by - 34}" width="6" height="14" rx="3" fill="${c.win}" opacity="0.8"/>`;
  // a Mughal tomb garden on the right: onion dome, chhatris, four minarets
  const tx = 1290;
  b += `<rect x="${tx - 150}" y="${by - 20}" width="300" height="30" fill="${c.wall}"/><rect x="${tx - 90}" y="${by - 110}" width="180" height="92" fill="${c.body}"/>`;
  b += `<path d="${pointed(tx - 22, by - 30, 44, 66)}" fill="${night ? "#2c2612" : "#6f8f79"}"/>`;
  b += `<rect x="${tx - 40}" y="${by - 140}" width="80" height="32" fill="${c.body}"/><path d="${onion(tx, by - 138, 104, 112)}" fill="${c.dome}"/>` + finial(tx, by - 250, 8, c.gold);
  for (const dx of [-70, 70]) b += `<rect x="${tx + dx - 14}" y="${by - 132}" width="28" height="22" fill="${c.body}"/><path d="${onion(tx + dx, by - 130, 34, 34)}" fill="${c.dome}"/>`;
  for (const dx of [-140, 140]) b += minaret(tx + dx, by - 18, 9, 122, "onion", c);
  if (!night) b += `<path d="M${tx - 40} ${by - 160} C${tx - 34} ${by - 200} ${tx - 14} ${by - 222} ${tx} ${by - 248}" stroke="${c.gold}" stroke-width="3" fill="none" opacity="0.8"/>`;
  if (c.win) b += `<path d="${pointed(tx - 14, by - 32, 28, 50)}" fill="${c.win}" opacity="0.85"/>`;
  // cypresses between the buildings
  for (const [x, h] of [[700, 70], [724, 92], [1010, 80], [1036, 104], [1062, 74], [1480, 88], [1506, 66]]) b += cypress(x, by + 8, h * 0.18, h, c.body, null);
  b += `<rect x="0" y="${by - 4}" width="${W}" height="${H - by + 4}" fill="${c.wall}"/>`;
  b += `<rect x="-60" y="${by - 26}" width="${W + 120}" height="70" fill="${P.cityMist}" opacity="${night ? 0.22 : 0.6}" filter="url(#blur14)"/>`;
  return [svg(W, H, `<g>${b}</g>`), W, H];
}

function mid(P, night) {
  const W = 1800, H = 560, by = 520, c = P.mid;
  let b = "";
  // a low garden wall with a gold coping, running across
  b += `<rect x="0" y="${by - 46}" width="${W}" height="46" fill="${c.wall}"/><rect x="0" y="${by - 50}" width="${W}" height="6" fill="${c.gold}" opacity="0.8"/>`;
  for (let x = 20; x < W; x += 60) b += `<path d="${horseshoe(x, by - 8, 22, 30)}" fill="${c.wallSh}"/>`;
  // groves: left, right, with a calm centre for the tree
  const L = [[90, 300, "cyp"], [150, 360, "cyp"], [205, 280, "cyp"], [320, 330, "palm", 0.12], [400, 250, "palm", -0.1], [470, 200, "bush"], [560, 260, "cyp"], [610, 220, "cyp"], [690, 170, "bush"]];
  const R = [[1110, 170, "bush"], [1190, 230, "cyp"], [1240, 280, "cyp"], [1330, 300, "palm", -0.12], [1420, 360, "palm", 0.08], [1500, 200, "bush"], [1590, 330, "cyp"], [1650, 270, "cyp"], [1720, 310, "palm", -0.06]];
  for (const [x, h, k, l] of [...L, ...R]) {
    if (k === "cyp") b += cypress(x, by - 30, h * 0.17, h, c.cyp, c.cypHi);
    else if (k === "palm") b += palm(x, by - 30, h, l, x, c.palm, c.palmHi);
    else b += bush(x, by - 30, h * 0.9, h * 0.7, x, c.bush, c.bushHi);
  }
  b += `<rect x="0" y="${by - 34}" width="${W}" height="${H - by + 34}" fill="${c.bush}" opacity="0.0"/>`;
  return [svg(W, H, `<g>${b}</g>`), W, H];
}

/** stage 5+: the arcade of a courtyard (Court of the Myrtles) behind the tree */
function arcade(P, night) {
  const W = 1800, H = 300, by = 300, c = P.arc;
  let b = `<defs>${vgrad("aw", [[0, c.wall], [1, c.sh]])}<radialGradient id="ag" cx="0.5" cy="0.7" r="0.6"><stop offset="0" stop-color="#ffe8a8" stop-opacity="${night ? 0.9 : 0}"/><stop offset="1" stop-color="#ffe8a8" stop-opacity="0"/></radialGradient></defs>`;
  const x0 = 420, x1 = 1380;
  b += `<rect x="${x0}" y="${by - 190}" width="${x1 - x0}" height="190" fill="url(#aw)"/>`;
  b += `<rect x="${x0 - 6}" y="${by - 198}" width="${x1 - x0 + 12}" height="10" fill="${c.gold}"/>`;
  // a band of zellige under the cornice
  for (let x = x0; x < x1; x += 16) b += `<path d="M${x + 8} ${by - 186} l6 6 l-6 6 l-6 -6 Z" fill="${c.tile}" opacity="0.85"/>`;
  for (let x = x0; x < x1; x += 10) b += `<rect x="${x}" y="${by - 206}" width="6" height="8" fill="${c.wall}"/>`;
  const n = 12, w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const x = x0 + i * w + w * 0.16, ow = w * 0.68;
    b += `<path d="${horseshoe(x - 4, by, ow + 8, 150)}" fill="${c.gold}" opacity="0.6"/>`;
    b += `<path d="${horseshoe(x, by, ow, 144)}" fill="${c.open}"/>`;
    if (night) b += `<path d="${horseshoe(x, by, ow, 144)}" fill="url(#ag)"/>`;
    else b += `<path d="M${f(x + ow * 0.2)} ${by} V${by - 80} A${f(ow * 0.3)} 30 0 0 1 ${f(x + ow * 0.8)} ${by - 80} V${by} Z" fill="#3f3826" opacity="0.5"/>`;
  }
  // a central gate with a pointed arch and calligraphic band (abstract)
  b += `<rect x="830" y="${by - 250}" width="140" height="250" fill="url(#aw)"/><rect x="826" y="${by - 256}" width="148" height="8" fill="${c.gold}"/>`;
  b += `<path d="${pointed(852, by, 96, 200)}" fill="${c.gold}" opacity="0.7"/><path d="${pointed(858, by, 84, 192)}" fill="${c.open}"/>`;
  if (night) b += `<path d="${pointed(858, by, 84, 192)}" fill="url(#ag)"/>`;
  b += `<path d="M846 ${by - 228} q12 -8 24 0 t24 0 t24 0 t24 0 t24 0" stroke="${c.gold}" stroke-width="2.4" fill="none"/>`;
  return [svg(W, H, `<g>${b}</g>`), W, H];
}

/** stage 8+: a Mughal pavilion (iwan) with an onion dome and two minarets */
function iwan(P, night) {
  const W = 700, H = 560, by = 560, c = P.arc, cx = 350;
  let b = `<defs>${vgrad("iw", [[0, c.wall], [1, c.sh]])}<radialGradient id="ig" cx="0.5" cy="0.75" r="0.6"><stop offset="0" stop-color="#ffe8a8" stop-opacity="${night ? 0.95 : 0}"/><stop offset="1" stop-color="#ffe8a8" stop-opacity="0"/></radialGradient></defs>`;
  b += `<rect x="${cx - 190}" y="${by - 290}" width="380" height="290" fill="url(#iw)"/><rect x="${cx - 196}" y="${by - 298}" width="392" height="10" fill="${c.gold}"/>`;
  for (let x = cx - 190; x < cx + 190; x += 12) b += `<rect x="${x}" y="${by - 310}" width="7" height="12" fill="${c.wall}"/>`;
  b += `<rect x="${cx - 60}" y="${by - 352}" width="120" height="58" fill="url(#iw)"/>`;
  b += `<path d="${onion(cx, by - 350, 170, 180)}" fill="${c.wall}"/><path d="M${cx - 70} ${by - 380} C${cx - 60} ${by - 440} ${cx - 30} ${by - 480} ${cx} ${by - 528}" stroke="${night ? c.gold : "#fff7e0"}" stroke-width="5" fill="none" opacity="0.7"/>` + finial(cx, by - 530, 10, c.gold);
  for (const dx of [-140, 140]) b += `<rect x="${cx + dx - 22}" y="${by - 336}" width="44" height="30" fill="${c.wall}"/><path d="${onion(cx + dx, by - 334, 56, 54)}" fill="${c.wall}"/>` + finial(cx + dx, by - 388, 5, c.gold);
  b += `<path d="${pointed(cx - 82, by, 164, 250)}" fill="${c.gold}" opacity="0.75"/><path d="${pointed(cx - 72, by, 144, 238)}" fill="${c.open}"/>`;
  if (night) b += `<path d="${pointed(cx - 72, by, 144, 238)}" fill="url(#ig)"/>`;
  // muqarnas hint: rows of small arches in the hood of the iwan
  for (let r = 0; r < 3; r++) for (let k = -3 + r; k <= 3 - r; k++) b += `<path d="${pointed(cx + k * 20 - 8, by - 180 + r * -18, 16, 18)}" fill="${night ? "#c8963e" : "#4e4630"}" opacity="0.6"/>`;
  for (const dx of [-150, 150]) b += `<path d="${pointed(cx + dx - 24, by - 30, 48, 120)}" fill="${c.open}"/>` + (night ? `<path d="${pointed(cx + dx - 24, by - 30, 48, 120)}" fill="url(#ig)"/>` : "");
  for (const dx of [-230, 230]) b += minaret(cx + dx, by, 22, 330, "onion", { body: c.wall, dome: c.wall, gold: c.gold, win: night ? c.glow : null });
  return [svg(W, H, `<g>${b}</g>`), W, H];
}

/** a dark, softly blurred palm frond framing the left edge (mirrored for the right) */
function frond() {
  const W = 520, H = 820;
  const jr = rng(5);
  const leaf = (x0, y0, a, len, col) => {
    const ex = x0 + Math.cos(a) * len, ey = y0 + Math.sin(a) * len + len * 0.12;
    const at = (t) => [x0 + (ex - x0) * t, y0 + (ey - y0) * t - Math.sin(t * Math.PI) * len * 0.16];
    let s = `<path d="M${x0} ${y0} Q${f((x0 + ex) / 2)} ${f((y0 + ey) / 2 - len * 0.32)} ${f(ex)} ${f(ey)}" stroke="${col}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    for (let j = 1; j < 22; j++) {
      const t = j / 22, [px, py] = at(t), l = len * 0.36 * Math.sin(t * Math.PI * 0.85 + 0.25);
      for (const sgn of [-1, 1]) {
        const b = a + (sgn < 0 ? -0.75 : 0.95) + (jr() - 0.5) * 0.35; // leaflets fan out and droop
        const ll = l * (sgn < 0 ? 0.7 : 1) * (0.8 + jr() * 0.4);
        const tx = px + Math.cos(b) * ll, ty = py + Math.sin(b) * ll + ll * 0.3;
        const nx = -Math.sin(b) * 5, ny = Math.cos(b) * 5;
        s += `<path d="M${f(px + nx)} ${f(py + ny)} Q${f((px + tx) / 2 + nx * 1.4)} ${f((py + ty) / 2 + ny * 1.4 - l * 0.08)} ${f(tx)} ${f(ty)} Q${f((px + tx) / 2 - nx)} ${f((py + ty) / 2 - ny - l * 0.08)} ${f(px - nx)} ${f(py - ny)} Z" fill="${col}"/>`;
      }
    }
    return s;
  };
  const b = `<g filter="url(#blur6)">${leaf(-30, 40, 0.42, 560, "#02100b")}${leaf(-50, 380, 0.02, 500, "#03150e")}${leaf(-30, 690, -0.35, 440, "#02100b")}</g>`;
  return [svg(W, H, b), W, H];
}

function mist() {
  const W = 1200, H = 220;
  let b = "";
  const r = rng(77);
  for (let i = 0; i < 9; i++) b += `<ellipse cx="${f(i * 150 + r() * 60)}" cy="${f(110 + (r() - 0.5) * 40)}" rx="${f(160 + r() * 120)}" ry="${f(30 + r() * 26)}" fill="#ffffff" opacity="${f(0.45 + r() * 0.35)}"/>`;
  return [svg(W, H, `<g filter="url(#blur26)">${b}</g>`), W, H];
}

// ---------- render ----------
const jobs = [];
for (const [name, fn, scale] of [["far", far, 1], ["city", city, 1], ["mid", mid, 1], ["arcade", arcade, 1], ["iwan", iwan, 1]]) {
  jobs.push([`${name}-day`, fn(DAY, false), scale]);
  jobs.push([`${name}-night`, fn(NIGHT, true), scale]);
}
jobs.push(["frond", frond(), 1], ["mist", mist(), 0.5]);
let total = 0;
for (const [name, [s, W], scale] of jobs) {
  const file = join(OUT, `${name}.webp`);
  await sharp(Buffer.from(s), { density: 72 }).resize(Math.round(W * scale)).webp({ quality: name.startsWith("far") || name === "mist" ? 70 : 82, alphaQuality: 80, effort: 6 }).toFile(file);
  if (process.argv.includes("--png")) await sharp(Buffer.from(s)).png().toFile(join(process.argv[process.argv.indexOf("--png") + 1], `${name}.png`));
  const kb = statSync(file).size / 1024; total += kb;
  console.log(name.padEnd(14), `${kb.toFixed(0)} KB`);
}
console.log("total", `${(total / 1024).toFixed(2)} MB`);
