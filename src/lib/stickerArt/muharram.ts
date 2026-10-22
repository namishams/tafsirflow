// Pack "Muharram": quiet mourning for Imam Husain and Karbala in black, deep red and gold. No figures, no blood.
import { PAL, L, S, brilliant, circ, crescent, ell, halo, lantern, leaf, lin, metal, octStar, part, pearl, polar, rad, rect, shadow, sparkles, sticker, type StickerPack } from "./kit";
import { calliSticker } from "./kalligrafie";
import { NAMEN_PATHS } from "./namenPfade";
import { rose } from "./schwestern";

const P = "muharram";
const G = metal("m");
const dusk = rad("dusk", [[0, "#8a1a24"], [0.55, "#3e0610"], [1, "#0a0204"]], "50%", "70%", "75%");

/** a tear drop */
const tear = (cx: number, cy: number, s: number) =>
  `M${cx} ${cy - 14 * s}C${cx + 4 * s} ${cy - 6 * s} ${cx + 9 * s} ${cy} ${cx + 9 * s} ${cy + 5 * s}C${cx + 9 * s} ${cy + 11 * s} ${cx + 5 * s} ${cy + 14 * s} ${cx} ${cy + 14 * s}C${cx - 5 * s} ${cy + 14 * s} ${cx - 9 * s} ${cy + 11 * s} ${cx - 9 * s} ${cy + 5 * s}C${cx - 9 * s} ${cy} ${cx - 4 * s} ${cy - 6 * s} ${cx} ${cy - 14 * s}Z`;
const tearPart = (cx: number, cy: number, s: number, id = "t") =>
  part([L(tear(cx, cy, s), `@${id}`, { stroke: "#9cc4ff", sw: 0.5 }), L(ell(cx - 3 * s, cy + 2 * s, 2 * s, 4 * s), "#ffffff", { op: 0.7 })],
    [rad(id, [[0, "#f0f7ff"], [0.6, "#9cc4ff"], [1, "#3d7ff0"]], "40%", "60%", "70%")]);

/** dark disc with gold rim */
const disc = (fill = "@dusk") => part([L(circ(100, 100, 90), "@m", { stroke: "#6e4a14", sw: 0.8 }), L(circ(100, 100, 84), fill)], [...G, dusk]);

export const MUHARRAM: StickerPack = {
  id: P,
  name: "Muharram",
  stickers: [
    // black alam banner on a gold pole
    sticker({ id: "alam-banner", pack: P, name: "Alam", tier: "edel" },
      shadow(100, 186, 40, 5),
      part([
        L(rect(97, 30, 6, 154, 2), "@mv"),
        L("M100 6C108 14 110 22 104 30H96C90 22 92 14 100 6Z", "@m", { stroke: "#6e4a14", sw: 0.6 }),
        L("M103 38H168C160 60 160 84 168 106H103Z", "@flag"),
        S("M107 42H160C154 62 154 82 160 102H107Z", "@m", 1.4),
        ...Array.from({ length: 12 }, (_, i) => L(rect(105 + i * 5.2, 106, 2.6, 9, 1), "#8a1020")),
        L(octStar(132, 72, 11), "@m"), L(octStar(132, 72, 6), "#8a1020"),
        L(rect(92, 32, 16, 6, 2), "@m"),
        L("M103 38H168C164 48 162 56 162 64C140 56 120 52 103 52Z", "#ffffff", { op: 0.06 }),
      ], [...G, lin("flag", [[0, "#2a2a2a"], [1, "#050505"]], 0, 0, 1, 1)]),
      sparkles([[50, 50, 5]], "#fff6d8")),
    // the shrine of Karbala: golden dome and two minarets against a red dusk
    sticker({ id: "karbala-kuppel", pack: P, name: "Kuppel von Karbala", tier: "edel", sacred: true },
      disc(),
      part([
        L(rect(44, 60, 12, 100, 2), "@m"), L(rect(144, 60, 12, 100, 2), "@m"),
        L("M42 62L50 40L58 62Z", "@m"), L("M142 62L150 40L158 62Z", "@m"),
        L(rect(41, 82, 18, 5, 1), "@mv"), L(rect(141, 82, 18, 5, 1), "@mv"),
        L(rect(60, 126, 80, 38, 2), "@mv"),
        ...[66, 82, 98, 114, 130].map((x) => L(`M${x} 160V142q4 -8 8 0V160Z`, "#3e0610", { op: 0.9 })),
        L(rect(68, 110, 64, 18, 2), "@m"),
        L("M64 112C64 76 86 58 100 52C114 58 136 76 136 112Z", "@dome"),
        L("M72 108C72 84 86 70 98 62C88 76 82 90 82 108Z", "#ffffff", { op: 0.3 }),
        L(rect(98.8, 38, 2.4, 16, 1), "@m"), L(crescent(100, 36, 5, 2.4, 4.2, -90), "@m"),
        L(rect(16, 164, 168, 4, 2), "@m", { op: 0.7 }),
      ], [...G, lin("dome", [[0, "#fff4c4"], [0.35, "#f0c860"], [0.7, "#c9963a"], [1, "#8f6420"]], 0, 0, 1, 0.2)]),
      sparkles([[150, 34, 4]], "#fff6d8")),
    // the water skin (mashk)
    sticker({ id: "mashk", pack: P, name: "Wasserschlauch", tier: "common" },
      shadow(100, 182, 52, 7),
      part([
        S("M64 66C70 24 132 24 138 66", "@strap", 5),
        L("M64 62C40 80 38 132 62 158C80 176 122 176 140 158C164 132 160 80 138 62C120 54 82 54 64 62Z", "@skin", { stroke: "#2a1608", sw: 1 }),
        L(rect(88, 46, 24, 14, 4), "@skin", { stroke: "#2a1608", sw: 1 }),
        S("M86 52H114", "@m", 3),
        S("M58 120C78 130 124 130 144 118", "#2a1608", 1.2, 0.5),
        L("M66 82C58 100 58 124 66 142C60 120 60 100 70 82Z", "#ffe6c0", { op: 0.4 }),
      ], [...G, lin("skin", [[0, "#a8713f"], [0.5, "#7a4a22"], [1, "#3c200c"]], 0, 0, 1, 1), lin("strap", [[0, "#8a1020"], [1, "#3e0610"]])]),
      tearPart(146, 164, 0.6), tearPart(160, 140, 0.45, "t2"),
      sparkles([[44, 44, 5]], "#fff6d8")),
    sticker({ id: "halbmond-traene", pack: P, name: "Halbmond mit Träne", tier: "common" },
      disc("@night"),
      part([L(crescent(92, 96, 56, 26, 48, -30), "@m", { stroke: "#6e4a14", sw: 0.8 })], [...G, rad("night", [[0, "#2a2a34"], [1, "#050508"]])]),
      tearPart(132, 128, 1.1),
      sparkles([[146, 52, 4], [60, 150, 3]], "#fff6d8")),
    // three candles
    sticker({ id: "kerzen", pack: P, name: "Kerzen", tier: "common" },
      shadow(100, 178, 64, 7), halo(100, 80, 80, "#ffd98a", 0.4),
      ...[[64, 96, 0.85], [100, 72, 1], [136, 104, 0.8]].map(([x, top, s], i) => part([
        L(rect(x - 13 * s, top, 26 * s, 172 - top, 3), i === 1 ? "@cr" : "@cw"),
        L(rect(x - 13 * s, top, 7 * s, 172 - top, 3), "#ffffff", { op: 0.25 }),
        L(ell(x, top, 13 * s, 3), "#3e0610", { op: 0.5 }),
        S(`M${x} ${top}V${top - 6}`, "#2a2a2a", 1.2),
        L(`M${x} ${top - 26 * s}C${x + 7 * s} ${top - 14 * s} ${x + 6 * s} ${top - 6} ${x} ${top - 5}C${x - 6 * s} ${top - 6} ${x - 7 * s} ${top - 14 * s} ${x} ${top - 26 * s}Z`, "@fl"),
        L(ell(x, top - 10, 2 * s, 4 * s), "#ffffff", { op: 0.9 }),
      ], [lin("cr", [[0, "#b5112f"], [1, "#4a0412"]], 0, 0, 1, 0), lin("cw", [[0, "#fffaf0"], [1, "#d9cdb4"]], 0, 0, 1, 0), lin("fl", [[0, "#fff6c8"], [0.6, "#ffc24a"], [1, "#ff8a2a"]])])),
      part([L(rect(36, 170, 128, 8, 3), "@m")], G)),
    // a date palm in gold against the dusk
    sticker({ id: "palme", pack: P, name: "Palme", tier: "common" },
      disc(),
      part([
        L("M96 168C98 130 100 96 98 62L104 62C106 96 104 130 106 168Z", "@m"),
        ...Array.from({ length: 6 }, (_, i) => S(`M96 ${80 + i * 15}L106 ${78 + i * 15}`, "#6e4a14", 1, 0.6)),
        ...[-160, -130, -100, -70, -40, -15, -190].map((a, i) => { const [x, y] = polar(101, 62, i % 2 ? 56 : 62, a); return L(leaf(101, 62, x, y + 14, 9, i % 2 ? 6 : -6), "@m", { stroke: "#6e4a14", sw: 0.4 }); }),
        L(circ(94, 70, 4), "#c9963a"), L(circ(108, 70, 4), "#c9963a"), L(circ(101, 74, 4), "#a8782a"),
        L(rect(16, 164, 168, 4, 2), "@m", { op: 0.7 }),
      ], G),
      sparkles([[150, 50, 4]], "#fff6d8")),
    calliSticker((() => { const c = NAMEN_PATHS.find((p) => p.id === "ya-husain"); if (!c) throw new Error("ya-husain"); return c; })(), { id: "ya-husain", pack: P, tier: "edel" }, "black"),
    // black mourning ribbon with red edge and gold pin
    sticker({ id: "trauerband", pack: P, name: "Trauerband", tier: "common" },
      shadow(100, 182, 40, 6),
      part([
        L("M100 70C80 100 66 140 56 178L76 168L84 182C90 140 96 104 104 78Z", "@rb", { stroke: "#8a1020", sw: 1.4 }),
        L("M100 70C120 100 134 140 144 178L124 168L116 182C110 140 104 104 96 78Z", "@rb", { stroke: "#8a1020", sw: 1.4 }),
        L(circ(100, 64, 26), "@rb", { stroke: "#8a1020", sw: 1.6 }),
        L(circ(100, 64, 12), "@m", { stroke: "#6e4a14", sw: 0.6 }),
      ], [...G, lin("rb", [[0, "#3a3a3a"], [0.5, "#141414"], [1, "#050505"]], 0, 0, 1, 1)]),
      brilliant(100, 64, 7, PAL.ruby, "r")),
    sticker({ id: "laterne-trauer", pack: P, name: "Laterne der Trauer", tier: "edel" },
      lantern(100, 22, 1.05, PAL.ruby, "l", PAL.gold), sparkles([[44, 70, 5]], "#fff6d8")),
    sticker({ id: "rose-karbala", pack: P, name: "Rose von Karbala", tier: "edel" },
      disc("@night"),
      part([], [rad("night", [[0, "#2a2a34"], [1, "#050508"]])]),
      rose(100, 100, 52, "r", ["#2a0206", "#5e0614", "#8a1020", "#b5203a", "#e06070"]),
      tearPart(146, 148, 0.6)),
    // a drop of water of the Euphrates in a gold frame
    sticker({ id: "euphrat-tropfen", pack: P, name: "Tropfen des Euphrat", tier: "edel" },
      part([L(octStar(100, 100, 86), "@m", { stroke: "#6e4a14", sw: 0.8 }), L(octStar(100, 100, 76), "@night"), S(circ(100, 100, 50), "#e9c66e", 1, 0.6)], [...G, rad("night", [[0, "#1a2a3a"], [1, "#050508"]])]),
      halo(100, 100, 54, "#9cc4ff", 0.4), tearPart(100, 96, 2.6),
      sparkles([[150, 50, 5]], "#ffffff")),
    sticker({ id: "trauer-medaillon", pack: P, name: "Medaillon des Gedenkens", tier: "edel" },
      part([
        L(octStar(100, 100, 88), "@m", { stroke: "#6e4a14", sw: 0.8 }),
        L(circ(100, 100, 70), "@blk"),
        S(circ(100, 100, 62), "#8a1020", 3),
        S(circ(100, 100, 56), "#e9c66e", 1, 0.8),
        ...Array.from({ length: 12 }, (_, i) => L(circ(...polar(100, 100, 62, i * 30), 2.4), "#e9c66e")),
        L(octStar(100, 100, 34), "@m"), L(octStar(100, 100, 24), "@blk"),
      ], [...G, rad("blk", [[0, "#2a2a2a"], [1, "#050505"]])]),
      brilliant(100, 100, 16, PAL.ruby, "r")),
  ],
};
