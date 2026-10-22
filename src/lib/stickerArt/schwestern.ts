// Pack "Für Schwestern": damask rose, jasmine, henna, rose gold and pearls. The khimar is an abstract drape seen from
// behind: no face, no body.
import { PAL, L, alongCrescent, S, circ, crescent, ell, halo, lantern, leaf, lin, metal, part, pearl, polar, rad, rect, shadow, sparkles, star, sticker, type Part, type Pt, type StickerPack } from "./kit";

const P = "schwestern";
const RG = metal("r", PAL.roseGold);
const HENNA = "#8a3216";
const KH = "M100 30C122 30 134 46 134 66C134 80 128 88 124 94C146 104 164 130 170 166Q150 174 130 170Q115 176 100 172Q85 176 70 170Q50 174 30 166C36 130 54 104 76 94C72 88 66 80 66 66C66 46 78 30 100 30Z";

/** a damask rose seen from above: three rings of cupped petals and a spiral heart */
function rose(cx: number, cy: number, r: number, id: string, pal = ["#5c0a22", "#9c1838", "#d23a5c", "#f27a96", "#ffc4d2"]): Part {
  const ring = (n: number, dist: number, pr: number, rot: number, col: string, edge: string) =>
    Array.from({ length: n }, (_, i) => { const [x, y] = polar(cx, cy, dist, rot + (i * 360) / n); return L(circ(x, y, pr), col, { stroke: edge, sw: r * 0.025 }); });
  return part([
    ...ring(5, r * 0.5, r * 0.52, -90, pal[1], pal[3]),
    L(circ(cx, cy, r * 0.95), `@${id}d`),
    ...ring(5, r * 0.3, r * 0.4, -54, pal[2], pal[4]),
    ...ring(4, r * 0.14, r * 0.3, -20, pal[2], pal[4]),
    L(circ(cx, cy, r * 0.22), pal[1]),
    S(`M${cx - r * 0.12} ${cy}a${r * 0.12} ${r * 0.12} 0 1 1 ${r * 0.16} ${r * 0.08}M${cx + r * 0.04} ${cy - r * 0.18}a${r * 0.2} ${r * 0.18} 0 0 1 ${r * 0.08} ${r * 0.3}`, pal[4], r * 0.03, 0.9),
    L(ell(cx - r * 0.35, cy - r * 0.45, r * 0.25, r * 0.12), "#ffffff", { op: 0.35 }),
  ], [rad(`${id}d`, [[0, pal[0], 0.55], [0.4, pal[0], 0.15], [0.7, pal[0], 0], [1, pal[0], 0.2]])]);
}

/** a five-petal jasmine flower */
function jasmine(cx: number, cy: number, r: number, rot = -90, id = "j"): Part {
  return part([
    ...Array.from({ length: 5 }, (_, i) => { const [x, y] = polar(cx, cy, r, rot + i * 72); return L(leaf(cx, cy, x, y, r * 0.42, r * 0.06), `@${id}p`, { stroke: "#d9cfe0", sw: 0.5 }); }),
    ...Array.from({ length: 5 }, (_, i) => { const [x, y] = polar(cx, cy, r * 0.75, rot + i * 72 - 6); return S(`M${cx} ${cy}L${x.toFixed(1)} ${y.toFixed(1)}`, "#e6dcef", r * 0.04, 0.8); }),
    L(circ(cx, cy, r * 0.17), `@${id}c`),
  ], [rad(`${id}p`, [[0, "#fff6d8"], [0.35, "#ffffff"], [1, "#f1eaf4"]], "50%", "50%", "70%"), rad(`${id}c`, [[0, "#fff1a8"], [1, "#e0a83a"]])]);
}

const leafPart = (x1: number, y1: number, x2: number, y2: number, w: number, b = 0): Part =>
  part([L(leaf(x1, y1, x2, y2, w, b), "@lf"), S(`M${x1} ${y1}L${x1 + (x2 - x1) * 0.85} ${y1 + (y2 - y1) * 0.85}`, "#a8e6c4", 0.8, 0.6)], [lin("lf", [[0, "#3fae74"], [1, "#0b5e3c"]], 0, 0, 1, 1)]);

/** a paisley (boteh) outline with curled tip, s = scale around (100,100) */
const paisley = (s: number, dx = 0, dy = 0) => {
  const X = (v: number) => (100 + (v - 100) * s + dx).toFixed(1), Y = (v: number) => (100 + (v - 100) * s + dy).toFixed(1);
  return `M${X(100)} ${Y(178)}C${X(52)} ${Y(178)} ${X(34)} ${Y(140)} ${X(44)} ${Y(106)}C${X(56)} ${Y(66)} ${X(104)} ${Y(64)} ${X(122)} ${Y(40)}C${X(132)} ${Y(28)} ${X(150)} ${Y(26)} ${X(150)} ${Y(40)}C${X(150)} ${Y(50)} ${X(138)} ${Y(52)} ${X(134)} ${Y(44)}C${X(154)} ${Y(64)} ${X(166)} ${Y(96)} ${X(160)} ${Y(126)}C${X(154)} ${Y(158)} ${X(130)} ${Y(178)} ${X(100)} ${Y(178)}Z`;
};

const heartPts = (n: number, cx: number, cy: number, s: number): Pt[] =>
  Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return [cx + s * 16 * Math.pow(Math.sin(t), 3), cy - s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))] as Pt; });

export const SCHWESTERN: StickerPack = {
  id: P,
  name: "Für Schwestern",
  stickers: [
    sticker({ id: "damaszener-rose", pack: P, name: "Damaszener Rose", tier: "edel" },
      shadow(100, 176, 58, 7),
      leafPart(100, 112, 24, 160, 18, 6), leafPart(100, 112, 178, 162, 18, -6), leafPart(100, 100, 172, 72, 13, 4),
      rose(100, 98, 62, "r"),
      sparkles([[48, 46, 7], [158, 40, 5]], "#fff0f3")),
    sticker({ id: "jasmin", pack: P, name: "Jasmin", tier: "common" },
      shadow(100, 176, 52, 6),
      part([S("M60 168C80 140 96 124 120 108", "#2f8a5e", 3)], []),
      leafPart(74, 150, 40, 128, 11, 4), leafPart(98, 124, 126, 150, 11, -4), leafPart(112, 114, 150, 104, 10, 3),
      jasmine(108, 82, 44, -90, "a"), jasmine(56, 112, 26, -60, "b"),
      part([L(leaf(146, 74, 162, 50, 6), "#ffffff", { stroke: "#d9cfe0", sw: 0.6 }), S("M146 74C140 84 132 96 122 106", "#2f8a5e", 1.6)]),
      sparkles([[150, 140, 6], [40, 50, 5]])),
    // abstract khimar drape seen from behind, rose-gold arch, a jasmine sprig
    sticker({ id: "khimar", pack: P, name: "Khimar", tier: "edel" },
      shadow(100, 184, 66, 7),
      part([
        L(circ(100, 100, 88), "@ring", { stroke: "#985440", sw: 0.6 }),
        L(circ(100, 100, 82), "@bg"),
        L(KH, "@kh"),
        S("M84 98C76 120 66 146 60 170M116 98C124 120 134 146 140 170M100 100V172M92 100C90 130 84 150 82 172", "#6a4560", 1.4, 0.4),
        S("M100 30C122 30 134 46 134 66C134 80 128 88 124 94C146 104 164 130 170 166", "#ffe0d2", 1.6, 0.7),
        L("M78 50C84 40 94 36 104 36C92 42 84 52 82 66Z", "#ffffff", { op: 0.25 }),
        S("M30 166Q50 174 70 170Q85 176 100 172Q115 176 130 170Q150 174 170 166", "@r", 2.4),
      ], [...RG, lin("ring", [[0, "#ffe0d2"], [0.5, "#c98168"], [1, "#ebb39c"]], 0, 0, 1, 1), rad("bg", [[0, "#fff5f0"], [1, "#f2d4cc"]], "50%", "35%", "70%"), lin("kh", [[0, "#c7a3b8"], [0.5, "#9a7088"], [1, "#6a4560"]], 0, 0, 1, 1)]),
      jasmine(150, 50, 13, -90, "j"), jasmine(162, 70, 9, -70, "k"),
      sparkles([[46, 46, 5]], "#ffffff")),
    // henna paisley on a cream card with a rose-gold edge
    sticker({ id: "henna-paisley", pack: P, name: "Henna-Paisley", tier: "common" },
      shadow(100, 186, 50, 6),
      part([
        L(paisley(1.02), "@r", { stroke: "#985440", sw: 0.6 }),
        L(paisley(0.94, 1, 2), "@card"),
        S(paisley(0.78, 2, 6), HENNA, 2.2),
        S(paisley(0.6, 3, 12), HENNA, 1.4),
        ...Array.from({ length: 6 }, (_, i) => { const [x, y] = polar(98, 130, 18, -90 + i * 60); return L(leaf(98, 130, x, y, 6), HENNA, { op: 0.9 }); }),
        L(circ(98, 130, 5), "#fff7ef"), L(circ(98, 130, 2.6), HENNA),
        ...Array.from({ length: 12 }, (_, i) => { const [x, y] = polar(98, 130, 28, i * 30); return L(circ(x, y, 1.8), HENNA); }),
        S("M74 98C86 84 104 80 118 70M78 106C92 94 108 90 124 82", HENNA, 1.2, 0.9),
        ...[0, 1, 2, 3, 4, 5, 6].map((i) => L(circ(70 + i * 9, 160 - Math.abs(i - 3) * 2, 1.6), HENNA)),
      ], [...RG, lin("card", [[0, "#fff8ee"], [1, "#f3dfc8"]])]),
      sparkles([[40, 52, 6], [160, 160, 4]], "#fff0e0")),
    // henna mandala
    sticker({ id: "henna-mandala", pack: P, name: "Henna-Mandala", tier: "common" },
      shadow(100, 186, 56, 6),
      part([
        L(circ(100, 100, 86), "@r", { stroke: "#985440", sw: 0.6 }),
        L(circ(100, 100, 79), "@card"),
        ...Array.from({ length: 12 }, (_, i) => { const [x, y] = polar(100, 100, 70, i * 30); return L(leaf(100 + (x - 100) * 0.45, 100 + (y - 100) * 0.45, x, y, 9), "none", { stroke: HENNA, sw: 1.6 }); }),
        ...Array.from({ length: 12 }, (_, i) => { const [x, y] = polar(100, 100, 62, i * 30 + 15); return L(circ(x, y, 2.2), HENNA); }),
        ...Array.from({ length: 8 }, (_, i) => { const [x, y] = polar(100, 100, 30, i * 45); return L(leaf(100, 100, x, y, 7), HENNA); }),
        S(circ(100, 100, 32), HENNA, 1.4), S(circ(100, 100, 74), HENNA, 1),
        ...Array.from({ length: 36 }, (_, i) => L(circ(...polar(100, 100, 76.5, i * 10), 1.1), HENNA)),
        L(circ(100, 100, 7), "#fff7ef", { stroke: HENNA, sw: 1.6 }), L(circ(100, 100, 2.6), HENNA),
      ], [...RG, rad("card", [[0, "#fffaf2"], [1, "#f1d9c2"]])]),
      sparkles([[164, 36, 6]], "#fff0e0")),
    sticker({ id: "laterne-rosegold", pack: P, name: "Rosé-Laterne", tier: "edel" },
      lantern(100, 22, 1.05, PAL.rosePearl, "l", PAL.roseGold, PAL.ruby), sparkles([[44, 70, 6], [158, 124, 5]], "#fff0f3")),
    // a heart of rose pearls
    sticker({ id: "perlenherz", pack: P, name: "Perlenherz", tier: "edel" },
      halo(100, 100, 90, "#ffd6e0", 0.4),
      ...heartPts(30, 100, 98, 4.6).map(([x, y], i) => pearl(x, y, 7.6, i % 5 === 0 ? PAL.pearl : PAL.rosePearl, i % 5 === 0 ? "w" : "p", ["#ffd6e6", "#d6fff3"])),
      
      sparkles([[44, 40, 6], [160, 156, 5]], "#ffffff")),
    // rose-gold crescent with hanging pearls
    sticker({ id: "halbmond-rosegold", pack: P, name: "Rosé-Halbmond", tier: "edel" },
      halo(100, 96, 90, "#ffd6c8", 0.4),
      part([
        L(crescent(96, 96, 64, 30, 56, -40), "@r", { stroke: "#985440", sw: 0.8 }),
        L(crescent(96, 96, 64, 30, 56, -40), "none", { stroke: "#fff7f2", sw: 1, op: 0.6 }),
        L(star(150, 78, 5, 10, 4.2), "@r"),
      ], RG),
      ...alongCrescent(96, 96, 64, 30, 56, -40, [90, 115, 140, 165, 190, 215]).map(([x, y, th], i) => pearl(x - 2, y + 2, Math.max(3.5, Math.min(9, th * 0.32)), i % 2 ? PAL.pearl : PAL.rosePearl, i % 2 ? "a" : "b", ["#ffd6e6", "#d6fff3"])),
      sparkles([[44, 60, 6], [150, 160, 5]], "#fff0f3")),
    // attar bottle with faceted glass and a rose-gold stopper
    sticker({ id: "attar-flakon", pack: P, name: "Attar-Flakon", tier: "common" },
      shadow(100, 180, 48, 7), halo(100, 110, 80, "#ffc4d2", 0.4),
      part([
        L("M100 60C126 60 150 86 150 120C150 152 128 172 100 172C72 172 50 152 50 120C50 86 74 60 100 60Z", "@glass", { stroke: "#985440", sw: 0.8 }),
        L("M100 84C118 84 136 102 136 124C136 146 120 160 100 160C80 160 64 146 64 124C64 102 82 84 100 84Z", "@liq"),
        S("M100 60L82 92L100 172M100 60L118 92L100 172M50 120H150M64 92H136", "#ffffff", 0.8, 0.35),
        L("M62 104C66 88 78 72 92 68C80 80 72 96 70 118Z", "#ffffff", { op: 0.5 }),
        L(rect(90, 44, 20, 18, 3), "@rv"),
        L("M100 6C112 18 116 30 110 42H90C84 30 88 18 100 6Z", "@r", { stroke: "#985440", sw: 0.6 }),
        L(circ(100, 26, 4), "#d23a5c"), L(circ(99, 25, 1.4), "#ffffff", { op: 0.8 }),
      ], [...RG, rad("glass", [[0, "#fff2f5", 0.9], [0.7, "#f7c9d4", 0.75], [1, "#c48a93", 0.85]], "45%", "40%", "65%"), lin("liq", [[0, "#ff9ab0", 0.85], [1, "#b5113f", 0.9]])]),
      sparkles([[146, 70, 6], [52, 160, 4]], "#ffffff")),
    sticker({ id: "rosenknospe", pack: P, name: "Rosenknospe", tier: "common" },
      shadow(100, 182, 40, 6),
      part([S("M100 180C98 150 102 120 100 96", "#2f8a5e", 3.4)]),
      leafPart(100, 150, 60, 130, 12, 4), leafPart(100, 134, 140, 118, 11, -4),
      part([
        L("M100 32C126 46 134 76 120 96C112 106 88 106 80 96C66 76 74 46 100 32Z", "@bud", { stroke: "#5c0a22", sw: 0.6 }),
        L("M100 40C114 54 116 76 106 92C100 98 92 96 90 90C84 72 88 52 100 40Z", "#f27a96"),
        S("M100 40C92 54 92 74 100 92", "#ffc4d2", 1, 0.7),
        L("M80 96C72 84 70 72 74 64C82 80 92 92 100 100Z", "@sep"), L("M120 96C128 84 130 72 126 64C118 80 108 92 100 100Z", "@sep"),
        L("M88 100C92 110 108 110 112 100L100 106Z", "@sep"),
      ], [lin("bud", [[0, "#ff9ab0"], [0.5, "#d23a5c"], [1, "#7a0c2e"]], 0, 0, 1, 1), lin("sep", [[0, "#56c48a"], [1, "#0b5e3c"]])]),
      sparkles([[146, 40, 6]], "#fff0f3")),
    // wreath of jasmine
    sticker({ id: "jasmin-kranz", pack: P, name: "Jasminkranz", tier: "edel" },
      part([S(circ(100, 100, 62), "#2f8a5e", 3)]),
      ...Array.from({ length: 12 }, (_, i) => { const [x, y] = polar(100, 100, 62, i * 30 + 15), [x2, y2] = polar(100, 100, 78, i * 30 + 28); return leafPart(x, y, x2, y2, 7, 2); }),
      ...Array.from({ length: 8 }, (_, i) => { const [x, y] = polar(100, 100, 62, i * 45); return jasmine(x, y, i % 2 ? 13 : 17, -90 + i * 20, "j"); }),
      pearl(100, 100, 10, PAL.pearl, "p"),
      sparkles([[100, 22, 5], [36, 160, 4]], "#ffffff")),
    // chandelier earring: rose-gold hook, ruby, pearl drop
    sticker({ id: "perlen-ohrring", pack: P, name: "Perlenohrring", tier: "edel" },
      shadow(100, 186, 30, 5), halo(100, 110, 74, "#ffd6e0", 0.35),
      part([
        S("M100 46C100 22 122 16 128 30C132 40 124 48 118 44", "@r", 2.6),
        L(circ(100, 50, 5), "@r"),
        S("M88 90L80 124M112 90L120 124M100 96V112", "@r", 1.2),
        ...Array.from({ length: 6 }, (_, i) => { const [x, y] = polar(100, 82, 20, -90 + i * 60); return L(leaf(100, 82, x, y, 7), "@r", { stroke: "#985440", sw: 0.5 }); }),
      ], RG),
      ...[[100, 82, 7]].map(([x, y, r]) => part([L(circ(x, y, r), "@rb"), L(circ(x - 2, y - 2.4, 2), "#ffffff", { op: 0.8 })], [rad("rb", [[0, "#ff9aab"], [0.6, "#b5112f"], [1, "#4a0412"]])])),
      pearl(80, 128, 5, PAL.rosePearl, "s"), pearl(120, 128, 5, PAL.rosePearl, "s"),
      pearl(100, 136, 22, PAL.pearl, "d", ["#ffd6e6", "#d6fff3"]),
      sparkles([[148, 60, 6], [52, 150, 4]], "#ffffff")),
  ],
};
