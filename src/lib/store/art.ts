// Sticker art as SVG strings, in the garden's seal style: a seal shape in emerald, gold or night tones, a thin gold
// rim, one geometric motif (no people, no animals' faces, no prophets) and a short Arabic word on a ribbon.
// The strings are served to the app (/api/app/store) and drawn there with SvgXml, so new packs need no app update.
export type Tone = "emerald" | "gold" | "night" | "rose" | "dawn" | "sea" | "leaf" | "foil" | "rosegold" | "ivory" | "rosefoil" | "pearlsea";
export type Shape = "circle" | "rosette" | "arch" | "star" | "hex";
export type Motif =
  | "crescent" | "star8" | "lantern" | "dome" | "minaret" | "kaaba" | "arch" | "palm" | "blossom" | "tulip" | "rose" | "bird"
  | "dates" | "cup" | "candle" | "ribbon" | "book" | "mihrab" | "lamp" | "drop" | "mountain" | "tent" | "pen" | "text" | "flag" | "tree"
  | "girih" | "mashrabiya" | "mushaf" | "rehal" | "misbaha" | "aqsa" | "medallion"
  | "khimar" | "paisley" | "pearl" | "damask" | "cartouche"
  | "gem" | "pearl3d" | "dhow" | "diver" | "oyster" | "necklace" | "falcon";

const TONES: Record<Tone, { a: string; b: string; rim: string; ink: string; band: string; bandInk: string }> = {
  emerald: { a: "#1d6b52", b: "#0b3d2e", rim: "#c6a65e", ink: "#f3e2b6", band: "#c6a65e", bandInk: "#0b3d2e" },
  gold: { a: "#e3c98a", b: "#a07a32", rim: "#f8ecc8", ink: "#0b3d2e", band: "#0b3d2e", bandInk: "#f3e2b6" },
  night: { a: "#1b2f5a", b: "#0a1430", rim: "#c6a65e", ink: "#f3e2b6", band: "#c6a65e", bandInk: "#0a1430" },
  rose: { a: "#c98c8c", b: "#7a3f48", rim: "#f3e2b6", ink: "#fff6e6", band: "#f3e2b6", bandInk: "#5a2a33" },
  dawn: { a: "#f0b67f", b: "#b0603a", rim: "#fff1d6", ink: "#3a1d10", band: "#3a1d10", bandInk: "#fff1d6" },
  sea: { a: "#2f8a9a", b: "#0f4652", rim: "#c6a65e", ink: "#eaf6f2", band: "#c6a65e", bandInk: "#0f4652" },
  leaf: { a: "#7fae5a", b: "#2f5e2a", rim: "#f3e2b6", ink: "#fbf6e6", band: "#f3e2b6", bandInk: "#2f5e2a" },
  rosegold: { a: "#efc2b0", b: "#a8695a", rim: "#fff1ea", ink: "#4a2620", band: "#4a2620", bandInk: "#fbe3d9" },
  ivory: { a: "#fbf6ea", b: "#e2d6bc", rim: "#c6a65e", ink: "#0b3d2e", band: "#0b3d2e", bandInk: "#fbf6ea" },
  rosefoil: { a: "#ffe4d8", b: "#a35f4f", rim: "#fff6f0", ink: "#3f1d17", band: "#3f1d17", bandInk: "#ffe4d8" },
  pearlsea: { a: "#1f6f86", b: "#06263a", rim: "#e9dcc0", ink: "#f6efe2", band: "#e9dcc0", bandInk: "#06263a" },
  foil: { a: "#fff1c2", b: "#9c7425", rim: "#fffaf0", ink: "#3b2a08", band: "#3b2a08", bandInk: "#fff1c2" },
};

const f = (n: number) => n.toFixed(1);
const star = (cx: number, cy: number, r1: number, r2: number, pts = 8) =>
  `M${Array.from({ length: pts * 2 }, (_, i) => { const a = (i * Math.PI) / pts - Math.PI / 2; const r = i % 2 ? r2 : r1; return `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`; }).join("L")}Z`;
const poly = (cx: number, cy: number, r: number, n: number, rot = 0) =>
  `M${Array.from({ length: n }, (_, i) => { const a = (i * 2 * Math.PI) / n + rot; return `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`; }).join("L")}Z`;
function scallop(cx: number, cy: number, r: number, n: number) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = (i * 2 * Math.PI) / n, a1 = ((i + 1) * 2 * Math.PI) / n, am = (a0 + a1) / 2;
    if (!i) d += `M${f(cx + r * Math.cos(a0))},${f(cy + r * Math.sin(a0))}`;
    d += `Q${f(cx + (r + 7) * Math.cos(am))},${f(cy + (r + 7) * Math.sin(am))} ${f(cx + r * Math.cos(a1))},${f(cy + r * Math.sin(a1))}`;
  }
  return `${d}Z`;
}
const SHAPES: Record<Shape, [string, string]> = {
  circle: ["M50,4A46,46 0 1 1 49.9,4Z", "M50,11A39,39 0 1 1 49.9,11Z"],
  rosette: [scallop(50, 50, 40, 12), "M50,14A36,36 0 1 1 49.9,14Z"],
  arch: ["M8,96V44A42,42 0 0 1 92,44V96Z", "M15,90V45A35,35 0 0 1 85,45V90Z"],
  star: [star(50, 50, 47, 39), star(50, 50, 40, 33)],
  hex: [poly(50, 50, 47, 6, Math.PI / 6), poly(50, 50, 40, 6, Math.PI / 6)],
};

function motif(m: Motif, c: string, word: string, style: Script = "thuluth", gem = "#2fbf71", uid = "x"): string {
  const s = `fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
  switch (m) {
    case "crescent": return `<path d="M57,24A24,24 0 1 0 57,72A18,18 0 1 1 57,24Z" fill="${c}"/><path d="${star(66, 38, 6, 2.5, 5)}" fill="${c}"/>`;
    case "star8": return `<path d="${star(50, 46, 22, 15)}" ${s}/><path d="${star(50, 46, 9, 5)}" fill="${c}"/>`;
    case "lantern": return `<g ${s}><path d="M50,20V26"/><path d="M42,26H58L62,34H38Z"/><path d="M38,34Q34,48 40,62H60Q66,48 62,34"/><path d="M44,62L46,68H54L56,62"/><path d="M50,40V56"/></g><circle cx="50" cy="48" r="4" fill="${c}"/>`;
    case "dome": return `<g ${s}><path d="M30,66H70"/><path d="M33,66V52H67V66"/><path d="M33,52Q33,30 50,26Q67,30 67,52"/><path d="M50,26V18"/></g><path d="M50,14A3,3 0 1 1 49.9,14Z" fill="${c}"/>`;
    case "minaret": return `<g ${s}><path d="M44,70V34H56V70"/><path d="M41,34H59"/><path d="M41,48H59"/><path d="M44,34Q50,22 56,34"/><path d="M50,24V16"/><path d="M36,70H64"/></g>`;
    case "kaaba": return `<path d="M32,36L50,28L68,36V64L50,72L32,64Z" fill="#111" stroke="${c}" stroke-width="2"/><path d="M32,42L50,34L68,42" fill="none" stroke="${c}" stroke-width="3.5"/><path d="M44,60V70" stroke="${c}" stroke-width="2"/>`;
    case "arch": return `<g ${s}><path d="M32,70V44Q32,26 50,22Q68,26 68,44V70"/><path d="M38,70V46Q38,32 50,28Q62,32 62,46V70"/><path d="M28,70H72"/></g>`;
    case "palm": return `<g ${s}><path d="M50,72Q52,54 50,38"/><path d="M50,38Q38,28 26,34"/><path d="M50,38Q62,28 74,34"/><path d="M50,38Q42,24 34,22"/><path d="M50,38Q58,24 66,22"/><path d="M50,38Q48,26 50,18"/></g><circle cx="46" cy="44" r="2.5" fill="${c}"/><circle cx="54" cy="44" r="2.5" fill="${c}"/>`;
    case "blossom": return `${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="50" cy="35" rx="7" ry="12" fill="${c}" opacity="0.9" transform="rotate(${a} 50 48)"/>`).join("")}<circle cx="50" cy="48" r="5" fill="#c6a65e"/>`;
    case "tulip": return `<g ${s}><path d="M50,70V46"/><path d="M50,60Q40,56 38,48"/></g><path d="M38,30Q38,46 50,48Q62,46 62,30L56,36L50,26L44,36Z" fill="${c}"/>`;
    case "rose": return `<g ${s}><path d="M50,46m-14,0a14,14 0 1 0 28,0a14,14 0 1 0 -28,0"/><path d="M50,46m-7,0a7,7 0 1 0 14,0"/><path d="M50,60V72"/><path d="M50,66Q58,62 62,66"/></g>`;
    case "bird": return `<path d="M26,52Q40,36 54,46Q62,38 74,40Q66,44 64,52Q58,64 42,62Q34,60 26,52Z" fill="${c}"/><path d="M30,64Q50,70 70,62" ${s}/>`;
    case "dates": return `${[[42, 40], [56, 38], [48, 52], [62, 52], [36, 54]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="9" fill="${c}" transform="rotate(-20 ${x} ${y})"/>`).join("")}<path d="M50,24Q46,30 48,36" ${s}/>`;
    case "cup": return `<g ${s}><path d="M34,40H62V54Q62,66 48,66Q34,66 34,54Z"/><path d="M62,44Q70,44 70,50Q70,56 62,56"/><path d="M30,70H66"/><path d="M44,32Q42,26 46,22"/><path d="M52,32Q50,26 54,22"/></g>`;
    case "candle": return `<g ${s}><path d="M42,40H58V70H42Z"/><path d="M36,70H64"/></g><path d="M50,22Q56,30 50,36Q44,30 50,22Z" fill="${c}"/>`;
    case "ribbon": return `<path d="M22,40Q36,30 50,40Q64,50 78,40L78,56Q64,66 50,56Q36,46 22,56Z" fill="${c}" opacity="0.92"/><path d="M50,44V52" stroke="#c6a65e" stroke-width="3"/>`;
    case "book": return `<g ${s}><path d="M26,36Q38,30 50,37Q62,30 74,36V64Q62,58 50,65Q38,58 26,64Z"/><path d="M50,37V65"/></g>`;
    case "mihrab": return `<g ${s}><path d="M34,72V42Q34,24 50,20Q66,24 66,42V72Z"/><path d="M42,72V48Q42,38 50,34Q58,38 58,48V72"/></g><path d="${star(50, 30, 4, 2, 8)}" fill="${c}"/>`;
    case "lamp": return `<g ${s}><path d="M30,54Q30,44 46,44H58Q68,44 72,38"/><path d="M30,54Q40,62 56,58Q66,56 68,48"/><path d="M42,44Q44,36 50,36Q56,36 56,44"/></g><path d="M74,28Q78,34 74,38Q70,34 74,28Z" fill="${c}"/>`;
    case "drop": return `<path d="M50,22Q66,44 64,54A14,14 0 0 1 36,54Q34,44 50,22Z" fill="${c}"/>`;
    case "mountain": return `<path d="M22,68L42,38L52,50L60,40L78,68Z" fill="${c}"/><path d="${star(68, 28, 5, 2, 5)}" fill="${c}"/>`;
    case "tent": return `<g ${s}><path d="M24,68L50,30L76,68Z"/><path d="M50,30V68"/><path d="M44,68L50,52L56,68"/></g>`;
    case "pen": return `<g ${s}><path d="M64,24L74,34L44,64L32,68L36,56Z"/><path d="M58,30L68,40"/></g><path d="M28,74Q40,70 52,74" ${s}/>`;
    case "flag": return `<g ${s}><path d="M34,72V24"/></g><path d="M34,26Q50,20 64,28Q56,36 66,44Q50,40 34,46Z" fill="${c}"/>`;
    case "tree": return `<path d="M50,24Q70,30 68,46Q66,58 50,58Q34,58 32,46Q30,30 50,24Z" fill="${c}"/><path d="M50,58V74M42,74H58" ${s}/>`;
    case "girih": return `<path d="${star(50, 46, 24, 12, 10)}" ${s}/><path d="${poly(50, 46, 10, 10)}" fill="${c}"/>`;
    case "mashrabiya": return `<g ${s}><path d="M32,72V40Q32,24 50,22Q68,24 68,40V72Z"/>${[0, 1, 2].map((r) => [0, 1, 2].map((k) => `<path d="${poly(41 + k * 9, 44 + r * 9, 4, 6)}"/>`).join("")).join("")}</g>`;
    case "mushaf": return `<path d="M30,28H66Q70,28 70,32V68Q70,72 66,72H30Z" fill="${c}"/><path d="M30,28V72" stroke="#0b3d2e" stroke-width="4"/><path d="${star(50, 50, 11, 7)}" fill="none" stroke="#0b3d2e" stroke-width="2"/><path d="M38,34H64M38,66H64" stroke="#0b3d2e" stroke-width="1.5"/>`;
    case "rehal": return `<g ${s}><path d="M26,40L50,58L74,40"/><path d="M30,74L70,46"/><path d="M70,74L30,46"/></g><path d="M34,36Q42,32 50,38Q58,32 66,36" ${s}/>`;
    case "misbaha": return `${Array.from({ length: 15 }, (_, i) => { const a = (i / 15) * Math.PI * 2; return `<circle cx="${f(50 + 18 * Math.cos(a))}" cy="${f(42 + 18 * Math.sin(a))}" r="3.4" fill="${c}"/>`; }).join("")}<path d="M50,60V70" ${s}/><path d="M46,70H54L50,76Z" fill="${c}"/>`;
    case "aqsa": return `<g ${s}><path d="M28,68H72"/><path d="M32,68V54H68V68"/><path d="M38,54V48H62V54"/></g><path d="M38,48Q38,30 50,28Q62,30 62,48Z" fill="${c}"/><path d="M50,28V20" ${s}/>`;
    case "medallion": return `<path d="${scallop(50, 46, 20, 16)}" ${s}/><path d="${star(50, 46, 14, 9, 8)}" fill="${c}"/><circle cx="50" cy="46" r="4" fill="#0b3d2e"/>`;
    // an abstract, faceless draped silhouette: a soft arch of cloth, no face, no body shape
    case "khimar": return `<path d="M50,22Q66,22 68,40Q70,54 76,72H24Q30,54 32,40Q34,22 50,22Z" fill="${c}"/><path d="M38,40Q50,30 62,40" fill="none" stroke="#c6a65e" stroke-width="2.5" stroke-linecap="round"/>`;
    case "paisley": return `<g ${s}><path d="M58,26Q74,34 70,52Q66,70 48,70Q32,68 34,54Q36,44 48,46Q56,48 54,56"/><path d="M58,26Q50,30 52,38"/></g><circle cx="50" cy="56" r="3" fill="${c}"/>${[0, 1, 2, 3].map((i) => `<circle cx="${f(62 - i * 2)}" cy="${f(36 + i * 8)}" r="1.6" fill="${c}"/>`).join("")}`;
    case "pearl": return `${[[50, 30, 7], [36, 42, 6], [64, 42, 6], [42, 58, 6.5], [58, 58, 6.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x - 2}" cy="${y - 2}" r="${r / 3}" fill="#ffffff" opacity="0.7"/>`).join("")}`;
    case "damask": return `<g ${s}>${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M50,46Q44,32 50,24Q56,32 50,46" transform="rotate(${a} 50 46)"/>`).join("")}</g><circle cx="50" cy="46" r="5" fill="${c}"/>`;
    case "cartouche": return `<path d="M24,36Q30,30 36,34H64Q70,30 76,36V56Q70,62 64,58H36Q30,62 24,56Z" fill="none" stroke="${c}" stroke-width="2.5"/><text x="50" y="51" font-size="${word.length > 8 ? 9.5 : 12}" text-anchor="middle" fill="${c}" font-family="${FONTS[style]}" font-weight="700">${esc(word)}</text>`;
    // a faceted gem: crown and pavilion facets, a table, light refraction and a sparkle
    case "gem": {
      const lt = shade(gem, 0.55), dk = shade(gem, -0.45);
      return `<defs><linearGradient id="${uid}g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lt}"/><stop offset="0.5" stop-color="${gem}"/><stop offset="1" stop-color="${dk}"/></linearGradient>`
        + `<linearGradient id="${uid}g2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lt}"/><stop offset="1" stop-color="${dk}"/></linearGradient></defs>`
        + `<path d="M34,36L42,26H58L66,36L50,72Z" fill="url(#${uid}g1)" stroke="${shade(gem, 0.75)}" stroke-width="0.8"/>`
        + `<path d="M34,36H66L50,72Z" fill="url(#${uid}g2)" opacity="0.85"/><path d="M42,26L46,36L50,26L54,36L58,26" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="0.8"/>`
        + `<path d="M34,36L46,36L50,72M66,36L54,36L50,72" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="0.7"/>`
        + `<path d="M44,28L48,28L45,34Z" fill="#ffffff" opacity="0.8"/><path d="${star(60, 30, 4, 1, 4)}" fill="#ffffff"/>`;
    }
    // a pearl with nacre: radial body, soft rim light and a bright highlight
    case "pearl3d": {
      const lt = shade(gem, 0.7), dk = shade(gem, -0.35);
      return `<defs><radialGradient id="${uid}p" cx="0.38" cy="0.35" r="0.7"><stop offset="0" stop-color="#ffffff"/><stop offset="0.25" stop-color="${lt}"/><stop offset="0.8" stop-color="${gem}"/><stop offset="1" stop-color="${dk}"/></radialGradient></defs>`
        + `<circle cx="50" cy="48" r="20" fill="url(#${uid}p)"/><ellipse cx="43" cy="40" rx="6" ry="4" fill="#ffffff" opacity="0.85" transform="rotate(-30 43 40)"/>`
        + `<path d="M36,58Q50,68 64,58" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.5"/><path d="${star(64, 32, 4, 1, 4)}" fill="#ffffff"/>`;
    }
    case "dhow": return `<path d="M24,62H78L70,72H32Z" fill="${c}"/><path d="M50,62V22" stroke="${c}" stroke-width="2.5"/><path d="M50,24Q70,36 72,58H50Z" fill="${c}" opacity="0.9"/><path d="M48,30Q34,44 32,58H48Z" fill="${c}" opacity="0.6"/><path d="M20,76Q35,72 50,76Q65,80 80,76" ${s}/>`;
    case "diver": return `<g ${s}><path d="M36,30Q50,22 64,30"/><path d="M40,30V38Q50,44 60,38V30"/><path d="M34,54H66L62,74H38Z"/><path d="M38,62H62"/></g><circle cx="45" cy="68" r="3" fill="${c}"/><circle cx="53" cy="68" r="3" fill="${c}"/>`;
    case "oyster": return `<defs><radialGradient id="${uid}o" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#f3ead8"/><stop offset="1" stop-color="#cbb98f"/></radialGradient></defs>`
      + `<path d="M24,56Q50,74 76,56Q66,66 50,68Q34,66 24,56Z" fill="${c}"/><path d="M24,52Q30,26 50,24Q70,26 76,52Q62,44 50,44Q38,44 24,52Z" fill="${c}" opacity="0.85"/>`
      + `${[32, 40, 50, 60, 68].map((x) => `<path d="M${x},${x === 50 ? 26 : 30}Q50,40 50,44" fill="none" stroke="#0b3d2e" stroke-opacity="0.25" stroke-width="1"/>`).join("")}<circle cx="50" cy="56" r="8" fill="url(#${uid}o)"/><circle cx="47" cy="53" r="2.2" fill="#ffffff"/>`;
    case "necklace": return `<defs><radialGradient id="${uid}n" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#f1e9da"/><stop offset="1" stop-color="#bfae88"/></radialGradient></defs>`
      + `<path d="M26,30Q50,78 74,30" fill="none" stroke="${c}" stroke-width="1"/>${Array.from({ length: 11 }, (_, i) => { const tt = i / 10; const x = (1 - tt) ** 2 * 26 + 2 * (1 - tt) * tt * 50 + tt ** 2 * 74; const y = (1 - tt) ** 2 * 30 + 2 * (1 - tt) * tt * 78 + tt ** 2 * 30; return `<circle cx="${f(x)}" cy="${f(y)}" r="${i === 5 ? 5.5 : 3.8}" fill="url(#${uid}n)"/>`; }).join("")}`;
    // a stylised falcon in flight, geometric planes only (no eyes, no face)
    case "falcon": return `<path d="M50,30L58,40L80,34L64,48L70,52L58,54L54,70L50,62L46,70L42,54L30,52L36,48L20,34L42,40Z" fill="${c}"/><path d="M50,30L54,26L50,22L46,26Z" fill="${c}"/><path d="M42,40L50,48L58,40M46,54L50,48L54,54" fill="none" stroke="#ffffff" stroke-opacity="0.4" stroke-width="0.8"/>`;
    case "text": return `<text x="50" y="56" font-size="${word.length > 10 ? 11 : word.length > 6 ? 14 : 19}" text-anchor="middle" fill="${c}" font-family="${FONTS[style]}" font-weight="700">${esc(word)}</text>`;
  }
}
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** calligraphic style of a word sticker (drawn with the matching Arabic typeface, falling back to Naskh) */
export type Script = "thuluth" | "diwani" | "kufi" | "naskh";
const FONTS: Record<Script, string> = {
  thuluth: "Amiri, 'Noto Naskh Arabic', serif", diwani: "'Aref Ruqaa', Amiri, serif", kufi: "'Reem Kufi', 'Noto Kufi Arabic', sans-serif", naskh: "'Noto Naskh Arabic', Amiri, serif",
};
/** sacred: carries the name of Allah, one of His names or another sacred word. Such stickers are never placed on the
 *  ground of the garden or fed to the tree: only on high spots (crown, arch), in the showcase, in chats, or framed. */
/** gem: the stone's colour (gems and pearls); glow: hangs on the tree as a glowing ornament */
export type StickerSpec = { id: string; ar: string; motif: Motif; tone: Tone; shape: Shape; script?: Script; sacred?: boolean; gem?: string; glow?: boolean };
/** lighten (amt > 0) or darken (amt < 0) a hex colour */
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt));
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** one sticker as a complete SVG document (viewBox 0 0 100 100) */
export function stickerSvg(s: StickerSpec): string {
  const t = TONES[s.tone];
  const [outer, inner] = SHAPES[s.shape];
  const g = `g${s.id.replace(/[^a-z0-9]/gi, "")}`;
  const stops = s.tone === "rosefoil"
    ? `<stop offset="0" stop-color="#fff0e8"/><stop offset="0.35" stop-color="#e4a990"/><stop offset="0.55" stop-color="#ffe9df"/><stop offset="0.8" stop-color="#b8735f"/><stop offset="1" stop-color="#7a3f33"/>`
    : s.tone === "foil"
    ? `<stop offset="0" stop-color="#fff6d5"/><stop offset="0.35" stop-color="#e6c26a"/><stop offset="0.55" stop-color="#fff3c4"/><stop offset="0.8" stop-color="#b88a2e"/><stop offset="1" stop-color="#7d5a16"/>`
    : `<stop offset="0" stop-color="${t.a}"/><stop offset="1" stop-color="${t.b}"/>`;
  const label = s.motif === "text" || s.motif === "cartouche" ? "" :
    `<path d="M18,80H82L78,88H22Z" fill="${t.band}"/><text x="50" y="86.5" font-size="7.5" text-anchor="middle" fill="${t.bandInk}" font-family="Amiri, 'Noto Naskh Arabic', serif" font-weight="700">${esc(s.ar)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient></defs>`
    + `<path d="${outer}" fill="url(#${g})" stroke="${t.rim}" stroke-width="2"/><path d="${inner}" fill="none" stroke="${t.rim}" stroke-width="1" opacity="0.7"/>`
    + `<g transform="translate(0,-4)">${motif(s.motif, t.ink, s.ar, s.script, s.gem, g)}</g>${label}</svg>`;
}
