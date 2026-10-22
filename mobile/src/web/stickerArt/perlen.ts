// Pack "Perlen des Golfs": the pearl heritage of Dubai and the Gulf, pearls, oysters, dhow, diver's gear, the Creek abra.
import { PAL, L, S, circ, ell, halo, lin, metal, part, pearl, poly, rad, rect, shadow, sparkles, sticker, type Part, type Pt, type StickerPack } from "./kit";

const P = "perlen";

/** stylised sea: layered emerald-teal waves with foam lines */
export function sea(y: number, x1 = 18, x2 = 182, id = "sea"): Part {
  const w = (yy: number, amp: number, n: number) => {
    let d = `M${x1} ${yy}`;
    const step = (x2 - x1) / n;
    for (let i = 0; i < n; i++) d += `q${step / 4} ${-amp} ${step / 2} 0t${step / 2} 0`;
    return d;
  };
  const body = (yy: number, amp: number, n: number, depth: number) => `${w(yy, amp, n)}V${yy + depth}H${x1}Z`;
  return part([
    L(body(y, 4, 5, 26), `@${id}1`),
    L(body(y + 8, 3.5, 6, 18), `@${id}2`),
    S(w(y, 4, 5), "#d8fff2", 1.4, 0.75),
    S(w(y + 8, 3.5, 6), "#bff3e4", 1, 0.5),
  ], [lin(`${id}1`, [[0, "#2fb39a"], [1, "#0b5e52"]]), lin(`${id}2`, [[0, "#1d8f7c"], [1, "#05362f"]])]);
}

/** nacre (mother of pearl) gradient */
const nacre = (id: string) => lin(id, [[0, "#fdf7ff"], [0.25, "#dff4f7"], [0.5, "#f7e3f0"], [0.75, "#e2f0e6"], [1, "#f6ecd9"]], 0, 0, 1, 1);

// scallop: fan from the hinge with a scalloped rim of 9 lobes
const fanPt = (deg: number, r: number): Pt => [100 + Math.cos((deg * Math.PI) / 180) * r, 150 + Math.sin((deg * Math.PI) / 180) * r];
const lobes = (r: number) => {
  let d = `M${fanPt(-170, r * 0.35).join(" ")}L${fanPt(-170, r).map((v) => v.toFixed(1)).join(" ")}`;
  for (let i = 0; i < 9; i++) { const a1 = -170 + (i * 160) / 9, a2 = a1 + 160 / 9; const [x, y] = fanPt(a2, r); d += `A${(r * 0.15).toFixed(1)} ${(r * 0.15).toFixed(1)} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`; void a1; }
  return d + `L${fanPt(-10, r * 0.35).map((v) => v.toFixed(1)).join(" ")}Z`;
};
const SCALLOP = lobes(94), SCALLOP_IN = lobes(86);
const RIBS = Array.from({ length: 8 }, (_, i) => { const a = -170 + ((i + 1) * 160) / 9; const [x1, y1] = fanPt(a, 34), [x2, y2] = fanPt(a, 84); return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`; });

const strand = (pts: Pt[], rs: number[], pal: string[], id: string): Part[] =>
  pts.map(([x, y], i) => pearl(x, y, rs[i], pal, `${id}${i % 3}`));

// a catenary arc of points
const arc = (n: number, x1: number, x2: number, y: number, sag: number): Pt[] =>
  Array.from({ length: n }, (_, i) => { const t = i / (n - 1); return [x1 + (x2 - x1) * t, y + sag * Math.sin(Math.PI * t)] as Pt; });

export const PERLEN: StickerPack = {
  id: P,
  name: "Perlen des Golfs",
  stickers: [
    sticker({ id: "perle-weiss", pack: P, name: "Weiße Perle", tier: "common" },
      shadow(100, 166, 50, 8), halo(100, 100, 90, "#fff4e0", 0.5), pearl(100, 100, 58, PAL.pearl, "p"),
      sparkles([[150, 52, 8], [52, 150, 5]])),
    sticker({ id: "perle-gold", pack: P, name: "Goldene Perle", tier: "edel" },
      shadow(100, 166, 50, 8), halo(100, 100, 92, "#ffd77a", 0.5), pearl(100, 100, 58, PAL.goldPearl, "p", ["#ffd6a8", "#fff3b0"]),
      sparkles([[150, 52, 9], [50, 146, 5], [158, 132, 4]], "#fff6d8")),
    sticker({ id: "perle-schwarz", pack: P, name: "Schwarze Perle", tier: "selten" },
      shadow(100, 166, 50, 8), halo(100, 100, 92, "#7fd6c2", 0.35), pearl(100, 100, 58, PAL.blackPearl, "p", ["#b46cff", "#3fe0b0"]),
      sparkles([[150, 52, 9], [50, 146, 5]])),
    // an opened oyster with a pearl on its nacre
    sticker({ id: "auster-offen", pack: P, name: "Offene Auster", tier: "common" },
      shadow(100, 160, 74, 9),
      part([
        // upper shell, opened back
        L("M30 116C24 70 70 30 124 34C160 38 178 70 172 112C150 98 60 98 30 116Z", "@sh", { stroke: "#3d3226", sw: 1 }),
        L("M42 110C42 76 78 48 122 48C150 50 164 74 162 104C136 94 70 94 42 110Z", "@nac"),
        L("M42 110C42 76 78 48 122 48C150 50 164 74 162 104C136 94 70 94 42 110Z", "@nacS"),
        S("M60 60C66 52 76 46 90 42M140 46C150 50 158 58 162 66", "#a69684", 1.2, 0.8),
        // lower shell
        L("M26 118C34 158 78 168 104 166C138 164 170 150 176 116C150 128 52 130 26 118Z", "@sh", { stroke: "#3d3226", sw: 1 }),
        L("M38 120C60 128 140 128 164 119C158 132 132 144 100 144C70 144 46 134 38 120Z", "@nac"),
        S("M40 136C64 150 140 152 162 134M56 152C80 160 124 160 146 150", "#6b5a48", 1.2, 0.8),
        S("M26 118C52 130 150 128 176 116", "#fff6e8", 1.2, 0.8),
      ], [lin("sh", [[0, "#9c8a76"], [0.5, "#6b5a48"], [1, "#3d3226"]], 0, 0, 0.3, 1), nacre("nac"), rad("nacS", [[0, "#ffffff", 0.6], [1, "#ffffff", 0]], "40%", "35%", "60%")]),
      pearl(100, 116, 20, PAL.pearl, "p"),
      sparkles([[128, 100, 6], [62, 66, 4]])),
    // dhow under a lateen sail on emerald water
    sticker({ id: "dhau", pack: P, name: "Dhau", tier: "edel" },
      halo(100, 96, 90, "#ffe9b0", 0.35),
      part([
        L("M98 30L102 30L103 142L97 142Z", "@wood"),
        L("M100 34C70 60 44 104 34 130L100 130Z", "@sail", { stroke: "#b89a62", sw: 0.8 }),
        L("M104 46C130 70 150 104 156 126L104 126Z", "@sail2", { stroke: "#b89a62", sw: 0.8 }),
        S("M100 34C70 60 44 104 34 130", "#c9963a", 2.2),
        S("M58 96L100 96M74 66L100 66", "#d9c49a", 0.8, 0.8),
        L("M102 28L120 22L102 34Z", "#c9333f"),
        L("M22 132L178 132C170 150 150 158 126 158L64 158C44 158 30 150 22 132Z", "@hull", { stroke: "#2a1608", sw: 1 }),
        S("M30 140H170", "#e9c66e", 1.6),
        L("M150 126L184 120L178 134Z", "@hull"),
        S("M24 133C60 136 140 136 178 133", "#f3d4a8", 1, 0.6),
      ], [...metal("m"), lin("wood", [[0, "#7a4a22"], [1, "#4e2c12"]], 0, 0, 1, 0), lin("sail", [[0, "#fffaf0"], [0.6, "#f2e6cc"], [1, "#d9c49a"]], 0, 0, 1, 1), lin("sail2", [[0, "#efe2c4"], [1, "#cdb486"]], 0, 0, 1, 1), lin("hull", [[0, "#a8713f"], [0.5, "#7a4a22"], [1, "#3c200c"]])]),
      sea(150, 14, 186),
      sparkles([[150, 46, 6]], "#fff6d8")),
    // woven diver's basket (diyyin) with pearls and an oyster
    sticker({ id: "taucherkorb", pack: P, name: "Taucherkorb", tier: "common" },
      shadow(100, 170, 64, 8),
      part([
        S("M58 66C60 30 140 30 142 66", "@rope", 5),
        S("M58 66C60 30 140 30 142 66", "#fff1cf", 1.2, 0.5),
        L("M46 66H154L140 160C128 168 72 168 60 160Z", "@bk", { stroke: "#4e2c12", sw: 1.2 }),
        ...Array.from({ length: 8 }, (_, i) => S(`M${50 + i * 14} 68L${62 + i * 10.5} 162`, "#5c3a18", 1, 0.55)),
        ...Array.from({ length: 7 }, (_, i) => S(`M${47 + i * 2} ${80 + i * 12}H${153 - i * 2}`, "#e9c48a", 1.4, 0.55)),
        L(rect(42, 60, 116, 10, 5), "@rope", { stroke: "#4e2c12", sw: 1 }),
        L("M70 62C70 48 98 40 112 50C120 56 112 62 104 62Z", "#6b5a48"),
        L("M74 60C78 52 96 48 106 54", "@nac"),
      ], [lin("bk", [[0, "#d9a96a"], [0.5, "#b07a3e"], [1, "#6b4420"]], 0, 0, 1, 1), lin("rope", [[0, "#e9cf99"], [1, "#a8713f"]]), nacre("nac")]),
      pearl(124, 56, 11, PAL.pearl, "p1"), pearl(140, 62, 8, PAL.goldPearl, "p2"), pearl(92, 58, 7, PAL.pearl, "p1"),
      sparkles([[160, 40, 6]])),
    // the diver's nose clip (fattam), carved from tortoiseshell or horn, on a cord
    sticker({ id: "nasenklemme", pack: P, name: "Nasenklemme (Fattam)", tier: "common" },
      shadow(100, 168, 46, 7), halo(100, 100, 80, "#ffe1a8", 0.3),
      part([
        S("M100 46C80 26 54 40 62 62C68 78 52 92 58 110", "@cord", 2.6),
        L("M100 44C76 44 66 64 68 90L72 152C72 160 86 160 86 152L84 92C84 74 90 64 100 64C110 64 116 74 116 92L114 152C114 160 128 160 128 152L132 90C134 64 124 44 100 44Z", "@ts", { stroke: "#2a1608", sw: 1.1 }),
        ...[[80, 66, 4], [118, 70, 5], [76, 112, 3.5], [122, 124, 4], [78, 140, 3], [120, 98, 3]].map(([x, y, r]) => L(ell(x, y, r, r * 0.7), "#2a1608", { op: 0.4 })),
        L(ell(79, 155, 8, 4), "#2a1608", { op: 0.25 }), L(ell(121, 155, 8, 4), "#2a1608", { op: 0.25 }),
        S("M74 74C74 62 84 52 98 50", "#ffe6b8", 2, 0.7),
        S("M76 96L79 146", "#ffe6b8", 1.2, 0.45),
        L(circ(100, 50, 4.5), "@m", { stroke: "#6e4a14", sw: 0.6 }),
      ], [...metal("m"), lin("ts", [[0, "#e0a34a"], [0.4, "#a8601e"], [1, "#4a2408"]], 0, 0, 1, 1), lin("cord", [[0, "#c6a65e"], [1, "#8a6a2c"]])]),
      sparkles([[140, 60, 6]])),
    sticker({ id: "perlenkette", pack: P, name: "Perlenkette", tier: "edel" },
      halo(100, 100, 90, "#fff4e0", 0.4),
      S("M30 62C34 170 166 170 170 62", "#c9963a", 1, 0.8),
      ...strand(Array.from({ length: 13 }, (_, i) => { const t = ((8 + i * 13.67) * Math.PI) / 180; return [100 + 70 * Math.cos(t), 56 + 86 * Math.sin(t)] as Pt; }), [7, 8, 8.5, 9, 10, 11, 12.5, 11, 10, 9, 8.5, 8, 7], PAL.pearl, "s"),
      part([L("M24 50L36 50L40 62L28 66Z", "@m", { stroke: "#6e4a14", sw: 0.6 }), L("M176 50L164 50L160 62L172 66Z", "@m", { stroke: "#6e4a14", sw: 0.6 }), S("M30 50C28 40 40 38 42 46", "@m", 2), S("M170 50C172 40 160 38 158 46", "@m", 2)], metal("m")),
      sparkles([[100, 168, 6], [150, 40, 5]])),
    // the pearl merchant's balance (al-mizan) on a carved wooden chest
    sticker({ id: "perlenwaage", pack: P, name: "Perlenwaage", tier: "edel" },
      shadow(100, 176, 70, 8),
      part([
        L(rect(40, 150, 120, 24, 4), "@wood", { stroke: "#2a1608", sw: 1 }),
        S("M48 158H152M48 166H152", "#d6a26c", 0.8, 0.5),
        L(rect(92, 144, 16, 8, 2), "@m"),
        L("M98 50H102L104 146H96Z", "@mv"),
        L(circ(100, 46, 6), "@m", { stroke: "#6e4a14", sw: 0.8 }),
        L("M38 54L162 54L162 58L38 58Z", "@m", { stroke: "#6e4a14", sw: 0.6 }),
        L(circ(38, 56, 4), "@m"), L(circ(162, 56, 4), "@m"),
        S("M38 58L22 112M38 58L54 112M162 58L146 112M162 58L178 112", "#c9963a", 0.9),
        L("M16 112H60C58 124 48 130 38 130C28 130 18 124 16 112Z", "@mv", { stroke: "#6e4a14", sw: 0.8 }),
        L("M140 112H184C182 124 172 130 162 130C152 130 142 124 140 112Z", "@mv", { stroke: "#6e4a14", sw: 0.8 }),
        L(rect(152, 98, 10, 14, 1.5), "@m", { stroke: "#6e4a14", sw: 0.5 }), L(rect(164, 104, 8, 8, 1.2), "@m", { stroke: "#6e4a14", sw: 0.5 }),
      ], [...metal("m"), lin("wood", [[0, "#a8713f"], [1, "#4e2c12"]])]),
      pearl(32, 106, 7, PAL.pearl, "p"), pearl(44, 106, 6.5, PAL.pearl, "p"), pearl(38, 98, 6, PAL.goldPearl, "q"),
      sparkles([[100, 30, 6], [70, 80, 4]])),
    // the Dubai Creek abra with its flat canopy
    sticker({ id: "abra", pack: P, name: "Abra am Creek", tier: "common" },
      halo(100, 100, 88, "#ffe9b0", 0.3),
      part([
        L("M30 70H170L176 78H24Z", "@roof", { stroke: "#4e2c12", sw: 1 }),
        L("M24 78H176V84H24Z", "#c9333f"),
        ...[38, 70, 100, 130, 162].map((x) => L(rect(x - 1.6, 84, 3.2, 40, 1), "@wood")),
        L("M14 122H186C180 142 164 150 140 150H62C38 150 20 142 14 122Z", "@hull", { stroke: "#2a1608", sw: 1 }),
        L("M28 122H172V130H28Z", "#f2e6cc"),
        S("M22 136H178", "#e9c66e", 1.6),
        L(rect(44, 108, 112, 6, 2), "@wood"),
        S("M16 123C60 126 140 126 184 123", "#f3d4a8", 1, 0.6),
      ], [lin("roof", [[0, "#e9cf99"], [1, "#a8713f"]]), lin("wood", [[0, "#7a4a22"], [1, "#4e2c12"]], 0, 0, 1, 0), lin("hull", [[0, "#c48a4e"], [0.5, "#8a5a2a"], [1, "#3c200c"]])]),
      sea(144, 10, 190),
      sparkles([[164, 48, 6]], "#fff6d8")),
    // three pearls on a velvet cushion with gold tassels
    sticker({ id: "perlen-kissen", pack: P, name: "Perlen auf Samt", tier: "edel" },
      shadow(100, 164, 78, 9),
      part([
        L("M22 112C20 92 40 84 100 84C160 84 180 92 178 112C180 136 160 150 100 150C40 150 20 136 22 112Z", "@vel", { stroke: "#3a0612", sw: 1 }),
        L("M34 106C36 94 60 90 100 90C140 90 164 94 166 106C150 98 50 98 34 106Z", "#ffffff", { op: 0.16 }),
        S("M30 116C60 126 140 126 170 116", "@m", 2),
        ...[[22, 112], [178, 112]].map(([x, y]) => L(`M${x} ${y}l-6 16h12z`, "@m")),
        ...[[22, 112], [178, 112]].map(([x, y]) => L(circ(x, y, 4.5), "@m", { stroke: "#6e4a14", sw: 0.6 })),
      ], [...metal("m"), rad("vel", [[0, "#c8203f"], [0.7, "#7a0c22"], [1, "#3a0612"]], "45%", "30%", "75%")]),
      pearl(72, 98, 16, PAL.pearl, "a"), pearl(128, 98, 16, PAL.blackPearl, "b", ["#b46cff", "#3fe0b0"]), pearl(100, 92, 20, PAL.goldPearl, "c", ["#ffd6a8", "#fff3b0"]),
      sparkles([[150, 60, 7], [52, 66, 4]])),
    // scallop shell with nacre interior
    sticker({ id: "perlmutt-muschel", pack: P, name: "Perlmuttmuschel", tier: "common" },
      shadow(100, 170, 64, 8), halo(100, 100, 88, "#f7e3f0", 0.4),
      part([
        L(SCALLOP, "@out", { stroke: "#8a6a5a", sw: 1.2 }),
        L(SCALLOP_IN, "@nac"),
        ...RIBS.map((d) => S(d, "#c9b4c8", 1.4, 0.65)),
        L(SCALLOP_IN, "@sh"),
        L("M82 146L70 162H130L118 146Z", "@out", { stroke: "#8a6a5a", sw: 1 }),
      ], [nacre("nac"), lin("out", [[0, "#f7d9cf"], [1, "#c48a7a"]]), rad("sh", [[0, "#ffffff", 0.55], [0.5, "#ffffff", 0.1], [1, "#6b5a48", 0.2]], "40%", "30%", "75%")]),
      pearl(100, 108, 16, PAL.rosePearl, "p", ["#ffd6e6", "#d6fff3"]),
      sparkles([[60, 62, 6], [146, 140, 4]])),
  ],
};
void poly;
