// Pack "Islamische Kunst": ornament, architecture and objects of devotion. Holy places and the mushaf are sacred.
// The mushaf is closed and carries only illumination, never verse text; the Kaaba band is drawn as ornament only.
import { PAL, L, S, circ, crescent, ell, halo, lantern, leaf, lin, metal, ngon, octStar, part, polar, poly, rad, rect, shadow, sparkles, star, sticker, type Part, type Pt, type StickerPack } from "./kit";

const P = "kunst";

const G = metal("m");
const gold = (layers: Parameters<typeof part>[0], extra: Parameters<typeof part>[1] = []) => part(layers, [...G, ...extra]);

/** a crescent finial on a short rod, tip at (x, y) */
const finial = (x: number, y: number, s = 1): Part => gold([
  L(rect(x - 1.2 * s, y + 6 * s, 2.4 * s, 14 * s, 1), "@mv"),
  L(circ(x, y + 18 * s, 3.2 * s), "@m"),
  L(circ(x, y + 12 * s, 2.4 * s), "@m"),
  L(crescent(x, y, 6 * s, 3 * s, 5 * s, -90), "@m"),
]);

/** small 8-lobed rosette */
const rosette = (cx: number, cy: number, r: number, fill: string, core: string): StickerArtLayers => [
  ...Array.from({ length: 8 }, (_, i) => L(circ(...polar(cx, cy, r * 0.55, i * 45), r * 0.45), fill)),
  L(circ(cx, cy, r * 0.5), core),
];
type StickerArtLayers = ReturnType<typeof L>[];

// ogee arch outline for the mihrab
const ogee = (x1: number, x2: number, yb: number, ys: number, yt: number) => {
  const cx = (x1 + x2) / 2, w = (x2 - x1) / 2;
  return `M${x1} ${yb}V${ys}C${x1} ${ys - w * 0.7} ${cx - w * 0.3} ${yt + w * 0.5} ${cx} ${yt}C${cx + w * 0.3} ${yt + w * 0.5} ${x2} ${ys - w * 0.7} ${x2} ${ys}V${yb}Z`;
};

const bead = (x: number, y: number, r: number, id: string) => [L(circ(x, y, r), `@${id}`), L(ell(x - r * 0.35, y - r * 0.4, r * 0.35, r * 0.25), "#ffffff", { op: 0.7 })];

export const KUNST: StickerPack = {
  id: P,
  name: "Islamische Kunst",
  stickers: [
    // arabesque medallion: gold rim, emerald field, eight great palmettes and a ruby heart
    sticker({ id: "arabeske-medaillon", pack: P, name: "Arabeske", tier: "edel" },
      shadow(100, 186, 64, 7),
      gold([
        L(star(100, 100, 32, 92, 86), "@m", { stroke: "#6e4a14", sw: 0.5 }),
        L(circ(100, 100, 84), "@bg"),
        L(circ(100, 100, 84), "none", { stroke: "#fff1c2", sw: 1, op: 0.6 }),
        ...Array.from({ length: 8 }, (_, i) => { const [x, y] = polar(100, 100, 74, i * 45 - 90); return L(leaf(100, 100, x, y, 16), "@m", { stroke: "#6e4a14", sw: 0.5 }); }),
        ...Array.from({ length: 8 }, (_, i) => { const [x, y] = polar(100, 100, 56, i * 45 - 67.5); return L(leaf(100, 100, x, y, 8), "@leaf"); }),
        ...Array.from({ length: 8 }, (_, i) => { const [x, y] = polar(100, 100, 74, i * 45 - 90); return L(leaf(100 + (x - 100) * 0.35, 100 + (y - 100) * 0.35, x, y, 6), "@bg", { op: 0.8 }); }),
        S(circ(100, 100, 62), "#e9c66e", 1.2, 0.8),
        ...Array.from({ length: 16 }, (_, i) => L(circ(...polar(100, 100, 78, i * 22.5 - 78.75), 2.2), "#f6e2a8")),
        L(octStar(100, 100, 24), "@m", { stroke: "#6e4a14", sw: 0.6 }),
        L(octStar(100, 100, 16), "@bg"),
      ], [rad("bg", [[0, "#1f9a68"], [0.7, "#0a4d33"], [1, "#03241a"]]), lin("leaf", [[0, "#79e6b2"], [1, "#1fb173"]])]),
      ...Array.from({ length: 1 }, () => ({ layers: [L(circ(100, 100, 9), "@r"), L(circ(97, 97, 3), "#ffffff", { op: 0.7 })], gradients: [rad("r", [[0, "#ff9aab"], [0.6, "#b5112f"], [1, "#4a0412"]], "40%", "35%", "65%")] })),
      sparkles([[44, 40, 7], [160, 160, 5]], "#fff6d8")),
    // girih: ten-pointed star in lapis and turquoise with gold strapwork
    sticker({ id: "girih-stern", pack: P, name: "Girih-Stern", tier: "common" },
      shadow(100, 186, 60, 7),
      gold([
        L(ngon(100, 100, 10, 90, -90), "@m", { stroke: "#6e4a14", sw: 0.6 }),
        L(ngon(100, 100, 10, 84, -90), "@lap"),
        L(star(100, 100, 10, 80, 50), "@tq", { stroke: "#f6e2a8", sw: 2.4 }),
        L(star(100, 100, 10, 50, 34, -72), "@lap", { stroke: "#f6e2a8", sw: 2 }),
        L(ngon(100, 100, 10, 26, -90), "@ivory", { stroke: "#f6e2a8", sw: 2 }),
        L(star(100, 100, 5, 22, 10), "@m"),
        ...Array.from({ length: 10 }, (_, i) => L(circ(...polar(100, 100, 82, -72 + i * 36), 2.4), "#f6e2a8")),
        L(ngon(100, 100, 10, 84, -90), "@sheen"),
      ], [lin("lap", [[0, "#2f5fc8"], [1, "#0b1f5c"]], 0, 0, 1, 1), lin("tq", [[0, "#7ff0dc"], [0.5, "#1fb5a6"], [1, "#0b6b64"]], 0, 0, 1, 1), lin("ivory", [[0, "#fffaf0"], [1, "#e9dcc0"]]), rad("sheen", [[0, "#ffffff", 0.25], [1, "#ffffff", 0]], "35%", "25%", "65%")]),
      sparkles([[164, 40, 6]])),
    // mihrab niche with muqarnas, columns and a hanging lamp
    sticker({ id: "mihrab", pack: P, name: "Mihrab", tier: "edel", sacred: true },
      shadow(100, 186, 70, 7),
      gold([
        L(rect(30, 18, 140, 166, 8), "@m", { stroke: "#6e4a14", sw: 0.6 }),
        L(rect(37, 25, 126, 152, 5), "@tile"),
        ...[[52, 44], [148, 44], [48, 64], [152, 64]].flatMap(([x, y]) => rosette(x, y, 6, "#1fb5a6", "#f6e2a8")),
        L(ogee(54, 146, 177, 92, 34), "@m"),
        L(ogee(60, 140, 177, 94, 44), "@niche"),
        ...[0, 1, 2, 3, 4].map((i) => S(`M${66 + i * 14} 96q7 -10 14 0`, "#e9c66e", 1.2, 0.7)),
        ...[0, 1, 2, 3].map((i) => S(`M${73 + i * 14} 84q7 -10 14 0`, "#e9c66e", 1.2, 0.6)),
        ...[0, 1, 2].map((i) => S(`M${80 + i * 14} 72q7 -10 14 0`, "#e9c66e", 1.2, 0.5)),
        L(rect(54, 100, 6, 77, 2), "@mv"), L(rect(140, 100, 6, 77, 2), "@mv"),
        L(rect(52, 96, 10, 6, 1), "@m"), L(rect(138, 96, 10, 6, 1), "@m"),
        S("M100 54V112", "#c9963a", 0.9),
      ], [lin("tile", [[0, "#f7f1e3"], [1, "#e3d6bb"]]), lin("niche", [[0, "#0d3f52"], [0.5, "#0a4d33"], [1, "#03241a"]])]),
      lantern(100, 108, 0.42, PAL.amber, "l"),
      sparkles([[100, 40, 4]], "#fff6d8")),
    // mashrabiya: carved wooden lattice with a sunlit glow behind
    sticker({ id: "maschrabiyya", pack: P, name: "Maschrabiyya", tier: "common" },
      shadow(100, 186, 64, 7),
      part([
        L(rect(34, 20, 132, 164, 6), "@wood", { stroke: "#2a1608", sw: 1 }),
        L(rect(46, 60, 108, 112, 2), "@sun"),
        ...Array.from({ length: 8 }, (_, i) => L(rect(46 + i * 15.4 - 1.6, 60, 3.2, 112), "@woodL")),
        ...Array.from({ length: 8 }, (_, i) => L(rect(46, 60 + i * 16 - 1.6, 108, 3.2), "@woodL")),
        ...Array.from({ length: 8 }, (_, c) => Array.from({ length: 8 }, (_, r) => L(circ(46 + c * 15.4, 60 + r * 16, 4.2), "@bead", { stroke: "#3c200c", sw: 0.5 }))).flat(),
        L(rect(46, 28, 108, 26, 3), "@woodD"),
        L(ogee(56, 144, 54, 44, 28), "@woodL"),
        L(octStar(100, 42, 9), "@sun"),
        S(rect(46, 60, 108, 112, 2), "#2a1608", 2),
      ], [lin("wood", [[0, "#a8713f"], [1, "#4e2c12"]], 0, 0, 1, 1), lin("woodL", [[0, "#c48a4e"], [1, "#7a4a22"]]), lin("woodD", [[0, "#5c3414"], [1, "#3c200c"]]), rad("bead", [[0, "#e7b57a"], [1, "#7a4a22"]], "38%", "35%", "65%"), rad("sun", [[0, "#fff6d0"], [0.5, "#ffd98a"], [1, "#e09a3a"]], "55%", "40%", "75%")])),
    sticker({ id: "laterne-gold", pack: P, name: "Goldene Laterne", tier: "common" },
      lantern(100, 22, 1.05, PAL.amber, "l"), sparkles([[44, 70, 6], [158, 124, 5]], "#fff6d8")),
    // the Kaaba with its gold band (ornament only, no text)
    sticker({ id: "kaaba", pack: P, name: "Kaaba", tier: "edel", sacred: true },
      shadow(100, 176, 82, 9), halo(100, 100, 96, "#f3dfa2", 0.3),
      gold([
        L("M30 160L110 172L170 156L170 164L110 182L30 168Z", "@marble"),
        L("M34 62L110 74L110 170L34 158Z", "@kisL"),
        L("M110 74L166 58L166 154L110 170Z", "@kisR"),
        L("M34 62L90 50L166 58L110 74Z", "#2a2a2a"),
        L("M34 84L110 96L110 106L34 94Z", "@m"),
        L("M110 96L166 80L166 90L110 106Z", "@mh"),
        S("M34 89L110 101M110 101L166 85", "#6e4a14", 0.5),
        ...[0, 1, 2, 3, 4, 5].map((i) => L(rect(40 + i * 11.5, 86 + i * 1.8 + 1.6, 6, 2.6, 1), "#6e4a14", { op: 0.6 })),
        ...[0, 1, 2, 3].map((i) => L(rect(116 + i * 12.5, 96 - i * 3.6 - 2.2, 6, 2.6, 1), "#6e4a14", { op: 0.6 })),
        L("M66 116L88 119L88 160L66 157Z", "@m", { stroke: "#6e4a14", sw: 0.6 }),
        S("M77 118L77 158", "#6e4a14", 0.6),
        ...[0, 1, 2].map((i) => L(octStar(71.5 + (i % 2) * 11, 128 + i * 10, 2.6), "#6e4a14", { op: 0.45 })),
        S("M110 74L110 170", "#4a4a4a", 0.8),
        S("M34 62L110 74L166 58", "#5a5a5a", 1),
      ], [lin("kisL", [[0, "#2a2a2a"], [1, "#0a0a0a"]], 0, 0, 1, 1), lin("kisR", [[0, "#141414"], [1, "#050505"]]), lin("marble", [[0, "#f4f1ea"], [1, "#bdb5a6"]])]),
      sparkles([[160, 34, 6]], "#fff6d8")),
    // green dome of the Prophet's mosque, Medina
    sticker({ id: "gruene-kuppel", pack: P, name: "Grüne Kuppel", tier: "edel", sacred: true },
      shadow(100, 182, 72, 8), halo(100, 96, 92, "#a8f0c8", 0.3),
      part([
        L(rect(28, 140, 144, 38, 3), "@stone"),
        ...[0, 1, 2, 3, 4, 5].map((i) => L(ogee(36 + i * 22.6, 52 + i * 22.6, 172, 156, 146), "#c9b48c", { op: 0.8 })),
        L(rect(26, 136, 148, 6, 2), "@stoneD"),
        L(rect(60, 106, 80, 32, 2), "@grn"),
        ...[0, 1, 2, 3].map((i) => L(ogee(66 + i * 18, 78 + i * 18, 134, 118, 110), "#0a3d28", { op: 0.75 })),
        L(rect(56, 102, 88, 6, 2), "@grnD"),
        L("M58 104C58 66 84 46 100 36C116 46 142 66 142 104Z", "@dome"),
        ...[-28, -14, 0, 14, 28].map((dx) => S(`M${100 + dx * 1.35} 104C${100 + dx * 1.2} 76 ${100 + dx * 0.6} 52 100 38`, "#0a5a36", 1, 0.6)),
        L("M66 100C66 72 86 54 100 44C88 58 78 76 78 100Z", "#ffffff", { op: 0.18 }),
      ], [lin("stone", [[0, "#f4ecd8"], [1, "#d6c6a0"]]), lin("stoneD", [[0, "#e3d4b0"], [1, "#b8a074"]]), lin("grn", [[0, "#1fb173"], [1, "#0b6b45"]], 0, 0, 1, 0), lin("grnD", [[0, "#0b7a4c"], [1, "#06492f"]]), lin("dome", [[0, "#6fe0a8"], [0.35, "#22b876"], [0.75, "#0f8452"], [1, "#065a36"]], 0, 0, 1, 0.2)]),
      finial(100, 14, 1.1),
      sparkles([[154, 50, 6]], "#fff6d8")),
    // golden dome on its octagon in the al-Aqsa sanctuary, Jerusalem
    sticker({ id: "aqsa-kuppel", pack: P, name: "Kuppel von al-Aqsa", tier: "edel", sacred: true },
      shadow(100, 184, 76, 8), halo(100, 92, 94, "#ffe6a0", 0.35),
      gold([
        L(rect(22, 168, 156, 10, 2), "@stone"),
        L("M30 116L62 110V170H30Z", "@tileD"),
        L("M138 110L170 116V170H138Z", "@tileD"),
        L(rect(62, 110, 76, 60), "@tile"),
        ...[70, 88, 106, 124].map((x) => L(ogee(x, x + 8, 150, 128, 120), "#0a1f4a", { op: 0.8 })),
        ...[36, 48, 144, 156].map((x) => L(ogee(x, x + 7, 150, 130, 123), "#0a1f4a", { op: 0.7 })),
        S("M30 120H170M30 156H170", "#f6e2a8", 1, 0.7),
        L(rect(60, 84, 80, 26, 1), "@tile"),
        ...[66, 80, 94, 108, 122].map((x) => L(ogee(x, x + 6, 106, 94, 88), "#0a1f4a", { op: 0.8 })),
        S("M60 88H140", "#f6e2a8", 0.8, 0.7),
        L(rect(56, 80, 88, 6, 2), "@m"),
        L("M56 82C56 44 82 30 100 28C118 30 144 44 144 82Z", "@dome"),
        ...[-30, -15, 0, 15, 30].map((dx) => S(`M${100 + dx * 1.4} 82C${100 + dx * 1.2} 58 ${100 + dx * 0.5} 36 100 29`, "#a8782a", 0.9, 0.5)),
        L("M64 78C64 54 80 40 96 34C84 46 76 60 76 78Z", "#ffffff", { op: 0.3 }),
      ], [lin("tile", [[0, "#3d7ff0"], [0.5, "#1d4fc4"], [1, "#163a8f"]], 0, 0, 1, 1), lin("tileD", [[0, "#16409e"], [1, "#0b2366"]]), lin("stone", [[0, "#f4ecd8"], [1, "#c9b48c"]]), lin("dome", [[0, "#fff4c4"], [0.3, "#f0c860"], [0.7, "#c9963a"], [1, "#8f6420"]], 0, 0, 1, 0.2)]),
      finial(100, 8, 1),
      sparkles([[158, 48, 6], [40, 60, 4]], "#fff6d8")),
    // the closed mushaf: emerald leather with gold shamsa and corner pieces, no text
    sticker({ id: "mushaf", pack: P, name: "Mushaf", tier: "edel", sacred: true },
      shadow(100, 182, 72, 8), halo(100, 100, 92, "#f3dfa2", 0.3),
      gold([
        L(rect(50, 30, 112, 148, 6), "@pages"),
        ...[0, 1, 2, 3, 4, 5].map((i) => S(`M${154 + i * 1.2} 36V172`, "#c9b48c", 0.5, 0.7)),
        L(rect(38, 24, 116, 150, 7), "@cov", { stroke: "#032617", sw: 1 }),
        L("M154 40L178 92L154 144Z", "@cov", { stroke: "#032617", sw: 1 }),
        S("M154 44L174 92L154 140", "#e9c66e", 1, 0.7),
        S(rect(46, 32, 100, 134, 4), "@m", 2.2),
        S(rect(51, 37, 90, 124, 3), "#e9c66e", 0.8, 0.8),
        ...[[51, 37, 0], [141, 37, 90], [141, 161, 180], [51, 161, 270]].map(([x, y, r]) => { const pts: Pt[] = [[0, 0], [18, 0], [14, 6], [6, 6], [6, 14], [0, 18]].map(([a, b]) => { const t = (r * Math.PI) / 180; return [x + a * Math.cos(t) - b * Math.sin(t), y + a * Math.sin(t) + b * Math.cos(t)] as Pt; }); return L(poly(pts), "@m"); }),
        L(star(96, 99, 16, 34, 27), "@m", { stroke: "#6e4a14", sw: 0.6 }),
        L(circ(96, 99, 24), "@cov"),
        L(octStar(96, 99, 20), "@m"),
        L(octStar(96, 99, 13), "@cov"),
        ...rosette(96, 99, 7, "#e9c66e", "#b5112f"),
        L("M96 56L102 64L96 72L90 64Z", "@m"), L("M96 126L102 134L96 142L90 134Z", "@m"),
        L(rect(38, 24, 116, 150, 7), "@sheen"),
      ], [lin("pages", [[0, "#fffaf0"], [1, "#e3d6bb"]], 0, 0, 1, 0), lin("cov", [[0, "#1a8a5a"], [0.5, "#0b5e3c"], [1, "#04301e"]], 0, 0, 1, 1), rad("sheen", [[0, "#ffffff", 0.2], [1, "#ffffff", 0]], "30%", "20%", "70%")]),
      sparkles([[34, 30, 6]], "#fff6d8")),
    // rehal: carved folding stand
    sticker({ id: "rehal", pack: P, name: "Rehal", tier: "common" },
      shadow(100, 176, 72, 8),
      part([
        L("M30 70L58 62L172 162L144 170Z", "@woodD", { stroke: "#2a1608", sw: 1 }),
        L("M170 70L142 62L28 162L56 170Z", "@wood", { stroke: "#2a1608", sw: 1 }),
        S("M50 72L152 160", "@m", 1.2, 0.55),
        S("M150 72L48 160", "@m", 1.6),
        S("M146 76L52 158", "#fff1c2", 0.6, 0.5),
        L(octStar(150, 92, 9), "#2a1608", { op: 0.8 }), L(octStar(150, 92, 5), "#e9c66e"),
        L(octStar(50, 92, 9), "#2a1608", { op: 0.55 }),
        L("M120 100C110 92 102 92 100 82C98 92 90 92 80 100C90 108 98 108 100 118C102 108 110 108 120 100Z", "#2a1608", { op: 0.7 }),
        S("M170 70L142 62", "#f3d4a8", 1.2, 0.7),
        S("M165 76L52 168", "#f3d4a8", 0.8, 0.35),
        L(circ(100, 116, 4), "@m", { stroke: "#6e4a14", sw: 0.6 }),
      ], [...G, lin("wood", [[0, "#d6a26c"], [0.5, "#a8713f"], [1, "#6b3f18"]], 1, 0, 0, 1), lin("woodD", [[0, "#7a4a22"], [1, "#3c200c"]])]),
      sparkles([[100, 48, 5]], "#fff6d8")),
    // misbaha of 33 amber beads with an imam bead and gold tassel
    sticker({ id: "misbaha", pack: P, name: "Misbaha", tier: "common" },
      shadow(100, 186, 46, 6),
      part([
        S("M100 140C40 140 30 30 100 30C170 30 160 140 100 140", "#8a6a2c", 1),
        ...Array.from({ length: 33 }, (_, i) => { const t = -Math.PI / 2 + ((i + 0.5) / 33) * Math.PI * 2 + Math.PI; const x = 100 + Math.cos(t) * 56, y = 82 + Math.sin(t) * 54; return bead(x, y, i === 10 || i === 22 ? 6.5 : 5.4, i === 10 || i === 22 ? "be" : "ba"); }).flat(),
        L(ell(100, 148, 6, 10), "@be"), L(ell(98, 144, 2, 3), "#ffffff", { op: 0.6 }),
        L(rect(97, 157, 6, 6, 2), "@m"),
        ...[-8, -4, 0, 4, 8].map((dx) => S(`M100 162Q${100 + dx * 0.6} 172 ${100 + dx * 1.6} 184`, "@m", 1.4)),
      ], [...G, rad("ba", [[0, "#ffd982"], [0.6, "#e08a12"], [1, "#7a3a05"]], "38%", "35%", "70%"), rad("be", [[0, "#79e6b2"], [0.6, "#0b7a4c"], [1, "#02261a"]], "38%", "35%", "70%")]),
      sparkles([[154, 34, 5]], "#fff6d8")),
    // dallah coffee pot in brass
    sticker({ id: "dallah", pack: P, name: "Dallah", tier: "common" },
      shadow(100, 180, 56, 8), halo(100, 100, 88, "#ffe6a0", 0.3),
      gold([
        L("M76 112C58 104 44 82 30 54C26 48 32 46 36 50C50 70 62 86 80 94Z", "@m", { stroke: "#6e4a14", sw: 0.6 }),
        L("M126 76C150 70 160 92 150 116C146 126 140 132 132 136", "none", { stroke: "@mv", sw: 6 }),
        L("M80 94C80 86 86 82 88 76L86 64C86 60 114 60 114 64L112 76C114 82 120 86 120 94C140 104 146 128 140 150C136 166 124 172 100 172C76 172 64 166 60 150C54 128 60 104 80 94Z", "@body", { stroke: "#6e4a14", sw: 0.8 }),
        L(ell(100, 64, 18, 5), "@m", { stroke: "#6e4a14", sw: 0.6 }),
        L("M86 62C86 46 94 40 100 38C106 40 114 46 114 62Z", "@m", { stroke: "#6e4a14", sw: 0.6 }),
        L("M97 38L100 18L103 38Z", "@m"), L(circ(100, 16, 3.4), "@m"),
        S("M62 132C80 140 120 140 138 132", "#6e4a14", 1, 0.6), S("M64 140C82 148 118 148 136 140", "#fff1c2", 1, 0.5),
        S("M84 92C94 96 106 96 116 92", "#6e4a14", 1, 0.6),
        ...[72, 86, 100, 114, 128].map((x) => L(octStar(x, 136, 2.6), "#6e4a14", { op: 0.5 })),
        L("M72 112C70 126 72 146 80 160C70 150 66 128 72 112Z", "#ffffff", { op: 0.4 }),
      ], [lin("body", [[0, "#fbe7a8"], [0.3, "#e9c66e"], [0.6, "#c9963a"], [1, "#8f6420"]], 0, 0, 1, 0.3)]),
      sparkles([[48, 36, 5], [156, 60, 5]], "#fff6d8")),
  ],
};
void leaf; void ell;
