// Pack "Rare und Unikate": the most precious pieces, all with shimmer. Tiers "selten" and "unikat".
// `kennzeichen-rahmen` is the gold licence-plate frame for numbered editions (viewBox 320 x 120, the number goes into the
// empty dark field 60..260 x 30..90).
import { PAL, L, S, brilliant, circ, crescent, ell, halo, leaf, lin, metal, octStar, part, pearl, polar, rad, rect, shadow, shift, sparkles, star, sticker, stepCut, type Part, type StickerPack } from "./kit";
import { ZIFFERN } from "./ziffernPfade";

const P = "rar";
const G = metal("m");

/** golden rays behind a treasure */
const rays = (cx: number, cy: number, r: number, n = 16, id = "ray"): Part =>
  part(Array.from({ length: n }, (_, i) => { const a = (i * 360) / n; const [x1, y1] = polar(cx, cy, r, a - 360 / n / 4), [x2, y2] = polar(cx, cy, r, a + 360 / n / 4); return L(`M${cx} ${cy}L${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}Z`, `@${id}`); }),
    [rad(id, [[0, "#fff4c4", 0.75], [0.6, "#f0cf7a", 0.25], [1, "#f0cf7a", 0]], "50%", "50%", "50%")]);

/** laurel (olive) wreath of gold leaves, open at the top */
const wreath = (cx: number, cy: number, r: number): Part =>
  part([
    ...[-1, 1].flatMap((side) => Array.from({ length: 9 }, (_, i) => {
      const a = 90 + side * (14 + i * 15), [x, y] = polar(cx, cy, r, a), [x2, y2] = polar(cx, cy, r + 15, a + side * 18);
      return L(leaf(x, y, x2, y2, 5, side * 1.5), "@m", { stroke: "#6e4a14", sw: 0.4 });
    })),
    ...[-1, 1].flatMap((side) => Array.from({ length: 8 }, (_, i) => {
      const a = 90 + side * (20 + i * 15), [x, y] = polar(cx, cy, r, a), [x2, y2] = polar(cx, cy, r - 13, a + side * 16);
      return L(leaf(x, y, x2, y2, 4, -side), "@mv", { stroke: "#6e4a14", sw: 0.4 });
    })),
  ], G);

/** a gold banner with a number */
const banner = (cx: number, cy: number, num: "100" | "365"): Part =>
  part([
    L(`M${cx - 52} ${cy - 4}L${cx - 64} ${cy + 10}L${cx - 50} ${cy + 22}L${cx - 40} ${cy + 18}Z`, "@mv"),
    L(`M${cx + 52} ${cy - 4}L${cx + 64} ${cy + 10}L${cx + 50} ${cy + 22}L${cx + 40} ${cy + 18}Z`, "@mv"),
    L(`M${cx - 46} ${cy - 12}Q${cx} ${cy - 2} ${cx + 46} ${cy - 12}L${cx + 46} ${cy + 14}Q${cx} ${cy + 24} ${cx - 46} ${cy + 14}Z`, "@m", { stroke: "#6e4a14", sw: 0.7 }),
    L(shift(ZIFFERN[num], cx + 0.6, cy + 5.8), "#6e4a14", { op: 0.6 }),
    L(shift(ZIFFERN[num], cx, cy + 5), "@num"),
  ], [...G, lin("num", [[0, "#0b7a4c"], [1, "#03281a"]])]);

export const RAR: StickerPack = {
  id: P,
  name: "Rare und Unikate",
  stickers: [
    sticker({ id: "schwarze-perle-golf", pack: P, name: "Schwarze Perle des Golfs", tier: "unikat", shimmer: true },
      rays(100, 96, 96, 20), halo(100, 96, 80, "#7fd6c2", 0.4),
      part([
        L("M24 128C30 160 70 176 100 176C130 176 170 160 176 128C150 140 50 140 24 128Z", "@m", { stroke: "#6e4a14", sw: 0.8 }),
        L("M34 132C60 142 140 142 166 132C156 152 128 164 100 164C72 164 44 152 34 132Z", "@vel"),
        S("M24 128C50 140 150 140 176 128", "#fff4c4", 1.2, 0.8),
        ...[40, 70, 100, 130, 160].map((x) => L(circ(x, 164 + (Math.abs(x - 100) > 40 ? -10 : Math.abs(x - 100) > 10 ? -2 : 2), 3.4), "#fff4c4")),
      ], [...G, rad("vel", [[0, "#1f9a68"], [1, "#03241a"]], "50%", "20%", "80%")]),
      pearl(100, 92, 50, PAL.blackPearl, "p", ["#c07cff", "#3fe0b0"]),
      sparkles([[44, 40, 10], [160, 46, 7], [168, 110, 5], [34, 104, 4]])),
    sticker({ id: "smaragd-haramain", pack: P, name: "Smaragd der Haramain", tier: "unikat", shimmer: true },
      rays(100, 100, 96, 16),
      part([
        L(octStar(100, 100, 86), "@m", { stroke: "#6e4a14", sw: 0.8 }),
        L(octStar(100, 100, 76), "@bg"),
        L(rect(56, 46, 88, 108, 14), "@m", { stroke: "#6e4a14", sw: 0.8 }),
        S(rect(56, 46, 88, 108, 14), "#fff4c4", 1, 0.6),
      ], [...G, rad("bg", [[0, "#0f6a45"], [1, "#02160e"]])]),
      stepCut(100, 100, 74, 94, PAL.emerald, "e"),
      ...[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const [x, y] = polar(100, 100, 70, a - 90); return brilliant(x, y, 5, PAL.diamond, "d"); }),
      sparkles([[40, 40, 10], [162, 160, 7], [164, 44, 5]])),
    // gold falcon, stylised, perched
    sticker({ id: "goldfalke", pack: P, name: "Goldfalke", tier: "selten", shimmer: true },
      rays(100, 96, 92, 16), halo(100, 96, 70, "#ffe6a0", 0.4),
      part([
        L(rect(40, 158, 120, 10, 5), "@mv", { stroke: "#6e4a14", sw: 0.6 }),
        // tail
        L("M110 140L128 174L112 176L100 146Z", "@d"),
        // body
        L("M78 60C96 52 118 64 124 90C130 116 122 140 108 150C94 158 80 152 76 138C70 118 66 84 78 60Z", "@m", { stroke: "#6e4a14", sw: 0.8 }),
        ...Array.from({ length: 4 }, (_, r) => Array.from({ length: 3 }, (_, c) => S(`M${86 + c * 9 + (r % 2) * 4} ${92 + r * 12}q4 5 8 0`, "#8f6420", 1, 0.7))).flat(),
        // wing
        L("M94 70C122 70 140 100 136 132C134 150 128 166 122 178C114 150 108 104 94 70Z", "@d", { stroke: "#6e4a14", sw: 0.8 }),
        ...[0, 1, 2, 3].map((i) => S(`M${110 + i * 5} ${88 + i * 14}C${120 + i * 4} ${98 + i * 14} ${126 + i * 2} ${110 + i * 12} ${128} ${118 + i * 10}`, "#fff4c4", 0.9, 0.55)),
        // head
        L("M68 44C72 32 92 28 102 38C108 46 106 58 98 64C88 70 70 62 68 44Z", "@m", { stroke: "#6e4a14", sw: 0.8 }),
        L("M72 42C64 40 58 46 58 54C58 58 60 62 62 63C62 58 64 54 70 54Z", "@d", { stroke: "#6e4a14", sw: 0.6 }),
        L(circ(82, 46, 2.6), "#2a1a08"), L(circ(81.4, 45.4, 0.8), "#ffffff"),
        S("M80 50C77 56 77 62 80 68", "#6e4a14", 3.2, 0.85),
        S("M88 150L84 160M100 152L98 160", "#8f6420", 3),
        S("M80 62C76 84 76 116 82 140", "#fffaf0", 1.6, 0.6),
      ], [...G, lin("d", [[0, "#e9c66e"], [0.5, "#a8782a"], [1, "#6e4a14"]], 0, 0, 1, 1)]),
      sparkles([[150, 46, 8], [44, 120, 5]], "#fff6d8")),
    // the night of Laylat al-Qadr: a radiant star, a crescent and a sky of small stars
    sticker({ id: "stern-laylat-al-qadr", pack: P, name: "Stern der Laylat al-Qadr", tier: "unikat", shimmer: true, sacred: true },
      part([
        L(circ(100, 100, 90), "@m", { stroke: "#6e4a14", sw: 0.8 }),
        L(circ(100, 100, 84), "@sky"),
        ...[[40, 70, 1.6], [56, 140, 1.2], [150, 150, 1.6], [160, 66, 1.2], [70, 40, 1], [130, 34, 1.4], [120, 160, 1], [44, 110, 1], [170, 110, 1.2], [90, 168, 1.4]].map(([x, y, r]) => L(circ(x, y, r), "#fff6d8", { op: 0.9 })),
        L(crescent(62, 62, 18, 8, 15, -30), "@m"),
      ], [...G, rad("sky", [[0, "#2a4a8a"], [0.6, "#0f1f4a"], [1, "#050a1e"]], "60%", "55%", "70%")]),
      halo(112, 106, 70, "#fff4c4", 0.7),
      rays(112, 106, 70, 16, "r2"),
      part([L(octStar(112, 106, 30), "@m", { stroke: "#fff4c4", sw: 0.8 }), L(octStar(112, 106, 18, 22.5), "#fffbe8"), L(circ(112, 106, 6), "#ffffff")], G),
      sparkles([[150, 70, 7], [70, 150, 5]], "#ffffff")),
    // the Hafiz pearl: a luminous pearl on a gold stand with an emerald ribbon and wreath
    sticker({ id: "hafiz-perle", pack: P, name: "Hafiz-Perle", tier: "unikat", shimmer: true },
      rays(100, 84, 90, 20), wreath(100, 92, 64),
      part([
        L("M70 144H130L120 130H80Z", "@m", { stroke: "#6e4a14", sw: 0.7 }),
        L(rect(62, 144, 76, 12, 3), "@mv", { stroke: "#6e4a14", sw: 0.7 }),
        L("M76 160L86 182L94 170L100 182L106 170L114 182L124 160Z", "@rib"),
        L(rect(56, 154, 88, 10, 3), "@rib"),
      ], [...G, lin("rib", [[0, "#1fb173"], [1, "#06492f"]])]),
      pearl(100, 92, 36, PAL.pearl, "p"),
      sparkles([[48, 44, 9], [156, 40, 7], [160, 140, 4]])),
    // Khatm emerald: completion of the Quran, an emerald inside a ring of pearls
    sticker({ id: "khatm-smaragd", pack: P, name: "Khatm-Smaragd", tier: "selten", shimmer: true },
      rays(100, 100, 94, 16),
      part([
        L(star(100, 100, 24, 84, 76), "@m", { stroke: "#6e4a14", sw: 0.7 }),
        L(circ(100, 100, 72), "@bg"),
        S(circ(100, 100, 64), "#e9c66e", 1.2, 0.8),
      ], [...G, rad("bg", [[0, "#0f6a45"], [1, "#02160e"]])]),
      ...Array.from({ length: 16 }, (_, i) => { const [x, y] = polar(100, 100, 64, i * 22.5); return pearl(x, y, 5.4, PAL.pearl, "s"); }),
      brilliant(100, 100, 44, PAL.emerald, "e", "round", false, 10),
      sparkles([[40, 40, 9], [160, 160, 6]])),
    sticker({ id: "edelstein-100-tage", pack: P, name: "100-Tage-Juwel", tier: "selten", shimmer: true },
      rays(100, 84, 90, 16), wreath(100, 84, 58),
      brilliant(100, 82, 40, PAL.sapphire, "g", "round", false, 10),
      banner(100, 150, "100"),
      sparkles([[44, 40, 8], [160, 44, 6]])),
    sticker({ id: "edelstein-365-tage", pack: P, name: "365-Tage-Juwel", tier: "unikat", shimmer: true },
      rays(100, 84, 96, 24), halo(100, 84, 80, "#ffffff", 0.4), wreath(100, 84, 60),
      brilliant(100, 82, 42, PAL.diamond, "g", "round", true, 10),
      ...[-60, -30, 0, 30, 60].map((a, i) => { const [x, y] = polar(100, 82, 54, a - 90); return brilliant(x, y, i === 2 ? 8 : 6, [PAL.emerald, PAL.ruby, PAL.emerald, PAL.ruby, PAL.emerald][i], ["e", "r", "e2", "r", "e"][i]); }),
      banner(100, 154, "365"),
      sparkles([[40, 36, 10], [164, 40, 7], [168, 120, 5], [30, 120, 4]])),
    // gold licence-plate frame for numbered editions; the dark field stays empty for the number
    sticker({ id: "kennzeichen-rahmen", pack: P, name: "Goldrahmen für Nummern", tier: "unikat", shimmer: true, viewBox: "0 0 320 120" },
      part([
        L(ell(160, 112, 140, 6), "#000000", { op: 0.25 }),
        L(rect(8, 10, 304, 100, 18), "@m", { stroke: "#6e4a14", sw: 1 }),
        S(rect(13, 15, 294, 90, 14), "#fff4c4", 1.2, 0.6),
        L(rect(20, 22, 280, 76, 11), "@mv"),
        L(rect(26, 28, 268, 64, 8), "@field", { stroke: "#6e4a14", sw: 0.8 }),
        S(rect(30, 32, 260, 56, 6), "#e9c66e", 0.8, 0.5),
        L("M160 2L170 10L160 18L150 10Z", "@m", { stroke: "#6e4a14", sw: 0.6 }),
        L(rect(26, 28, 268, 26, 8), "#ffffff", { op: 0.06 }),
        ...[[40, 42], [280, 42], [40, 78], [280, 78]].map(([x, y]) => L(octStar(x, y, 5), "@m")),
        L(rect(8, 10, 304, 40, 18), "#ffffff", { op: 0.12 }),
      ], [...G, lin("field", [[0, "#0d4a33"], [1, "#03241a"]])]),
      brilliant(14, 60, 7, PAL.emerald, "e"), brilliant(306, 60, 7, PAL.emerald, "e"), brilliant(160, 10, 4.4, PAL.ruby, "r"),
      sparkles([[300, 16, 7], [22, 104, 5]])),
  ],
};
void shadow; void S;
