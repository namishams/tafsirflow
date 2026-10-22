// Pack "Garten-Schmuck": ornaments for the garden tree, lanterns, gold ribbons, stylised birds, dates, blossoms and
// glowing fruit. Pieces that hang have their hook or stalk at the top centre (around x 100, y 10..30).
import { PAL, L, S, circ, ell, halo, lantern, leaf, lin, metal, part, polar, rad, shadow, sparkles, sticker, type Part, type StickerPack } from "./kit";

const P = "garten";
const G = metal("m");

const leafP = (x1: number, y1: number, x2: number, y2: number, w: number, b = 0): Part =>
  part([L(leaf(x1, y1, x2, y2, w, b), "@lf"), S(`M${x1} ${y1}L${x1 + (x2 - x1) * 0.85} ${y1 + (y2 - y1) * 0.85}`, "#a8e6c4", 0.8, 0.6)], [lin("lf", [[0, "#56c48a"], [1, "#0b5e3c"]], 0, 0, 1, 1)]);

const chain = (x: number, y1: number, y2: number): Part =>
  part([
    ...Array.from({ length: Math.floor((y2 - y1) / 6) }, (_, i) => S(ell(x, y1 + 3 + i * 6, i % 2 ? 1.2 : 2.2, 3), "@m", 1.2)),
    S(`M${x} ${y1}c-8 0 -8 -10 0 -10`, "@m", 2),
  ], G);

/** satin ribbon bow */
function bow(cx: number, cy: number, s: number, id = "rb"): Part {
  const X = (v: number) => (cx + v * s).toFixed(1), Y = (v: number) => (cy + v * s).toFixed(1);
  return part([
    L(`M${X(-6)} ${Y(4)}C${X(-20)} ${Y(30)} ${X(-30)} ${Y(56)} ${X(-34)} ${Y(74)}L${X(-22)} ${Y(66)}L${X(-14)} ${Y(78)}C${X(-10)} ${Y(56)} ${X(-4)} ${Y(30)} ${X(2)} ${Y(8)}Z`, `@${id}d`),
    L(`M${X(6)} ${Y(4)}C${X(20)} ${Y(30)} ${X(30)} ${Y(56)} ${X(34)} ${Y(74)}L${X(22)} ${Y(66)}L${X(14)} ${Y(78)}C${X(10)} ${Y(56)} ${X(4)} ${Y(30)} ${X(-2)} ${Y(8)}Z`, `@${id}d`),
    L(`M${X(-4)} ${Y(0)}C${X(-30)} ${Y(-30)} ${X(-64)} ${Y(-24)} ${X(-60)} ${Y(-2)}C${X(-58)} ${Y(16)} ${X(-30)} ${Y(14)} ${X(-4)} ${Y(4)}Z`, `@${id}`),
    L(`M${X(4)} ${Y(0)}C${X(30)} ${Y(-30)} ${X(64)} ${Y(-24)} ${X(60)} ${Y(-2)}C${X(58)} ${Y(16)} ${X(30)} ${Y(14)} ${X(4)} ${Y(4)}Z`, `@${id}`),
    L(`M${X(-10)} ${Y(-2)}C${X(-28)} ${Y(-14)} ${X(-44)} ${Y(-12)} ${X(-48)} ${Y(-4)}C${X(-36)} ${Y(-6)} ${X(-22)} ${Y(-2)} ${X(-10)} ${Y(4)}Z`, "#6e4a14", { op: 0.35 }),
    L(`M${X(10)} ${Y(-2)}C${X(28)} ${Y(-14)} ${X(44)} ${Y(-12)} ${X(48)} ${Y(-4)}C${X(36)} ${Y(-6)} ${X(22)} ${Y(-2)} ${X(10)} ${Y(4)}Z`, "#6e4a14", { op: 0.35 }),
    S(`M${X(-12)} ${Y(-12)}C${X(-28)} ${Y(-24)} ${X(-48)} ${Y(-22)} ${X(-54)} ${Y(-10)}`, "#fffaf0", 1.4 * s, 0.75),
    S(`M${X(12)} ${Y(-12)}C${X(28)} ${Y(-24)} ${X(48)} ${Y(-22)} ${X(54)} ${Y(-10)}`, "#fffaf0", 1.2 * s, 0.5),
    L(ell(cx, cy + 2 * s, 10 * s, 9 * s), `@${id}`, { stroke: "#8f6420", sw: 0.6 }),
    L(ell(cx - 3 * s, cy - 1 * s, 4 * s, 2.6 * s), "#ffffff", { op: 0.5 }),
  ], [lin(id, [[0, "#fff4c4"], [0.3, "#f0cf7a"], [0.65, "#c9963a"], [1, "#f6e2a8"]], 0, 0, 1, 1), lin(`${id}d`, [[0, "#e9c66e"], [1, "#8f6420"]])]);
}

/** a date: glossy oval */
const date = (x: number, y: number, rot: number, id: string) => {
  const [hx, hy] = polar(x, y, 3, rot - 120);
  return [L(ellRot(x, y, 6, 9.5, rot), `@${id}`, { stroke: "#3a1604", sw: 0.4 }), L(ellRot(hx, hy, 1.6, 3.4, rot), "#ffffff", { op: 0.55 })];
};
function ellRot(cx: number, cy: number, rx: number, ry: number, deg: number) {
  const pts = Array.from({ length: 24 }, (_, i) => { const t = (i / 24) * Math.PI * 2; const x = Math.cos(t) * rx, y = Math.sin(t) * ry; const a = (deg * Math.PI) / 180; return [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)]; });
  return "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z";
}
function dateCluster(id: string, pal: [string, string, string]): Part {
  const strands = [-34, -22, -10, 2, 14, 26, 38];
  const layers = [S("M100 14C100 26 98 36 100 46", "#c48a4e", 4), ...strands.map((dx) => S(`M100 44C${100 + dx * 0.4} 60 ${100 + dx} 80 ${100 + dx * 1.15} 150`, "#d6a26c", 1.4))];
  const dates: ReturnType<typeof date> = [];
  strands.forEach((dx, si) => { for (let k = 0; k < 6; k++) { const t = 0.3 + k * 0.13; const x = 100 + dx * (0.4 + t * 0.8) + (k % 2 ? 6 : -6); const y = 50 + t * 104; if ((si + k) % 7 !== 3) dates.push(...date(x, y, (k % 2 ? 18 : -18) + dx * 0.4, id)); } });
  return part([...layers, ...dates], [rad(id, [[0, pal[0]], [0.55, pal[1]], [1, pal[2]]], "35%", "30%", "75%")]);
}

/** five-petal blossom */
function blossom(cx: number, cy: number, r: number, id: string, cols: [string, string, string]): Part {
  return part([
    ...Array.from({ length: 5 }, (_, i) => { const [x, y] = polar(cx, cy, r * 0.52, -90 + i * 72); return L(circ(x, y, r * 0.5), `@${id}`, { stroke: cols[2], sw: 0.5 }); }),
    ...Array.from({ length: 5 }, (_, i) => { const [x, y] = polar(cx, cy, r * 0.6, -90 + i * 72); return S(`M${cx} ${cy}L${x.toFixed(1)} ${y.toFixed(1)}`, cols[2], 0.8, 0.5); }),
    ...Array.from({ length: 10 }, (_, i) => { const [x, y] = polar(cx, cy, r * 0.32, i * 36); return S(`M${cx} ${cy}L${x.toFixed(1)} ${y.toFixed(1)}`, "#c9963a", 0.8); }),
    ...Array.from({ length: 10 }, (_, i) => L(circ(...polar(cx, cy, r * 0.34, i * 36), r * 0.05), "#ffd24a")),
    L(circ(cx, cy, r * 0.12), "#d6a650"),
  ], [rad(id, [[0, cols[0]], [0.7, cols[1]], [1, cols[2]]], "50%", "50%", "60%")]);
}

export const GARTEN: StickerPack = {
  id: P,
  name: "Garten-Schmuck",
  stickers: [
    sticker({ id: "laterne-haengend", pack: P, name: "Hängende Laterne", tier: "common" },
      chain(100, 12, 40), lantern(100, 38, 0.9, PAL.amber, "l"), sparkles([[50, 90, 6], [152, 130, 4]], "#fff6d8")),
    sticker({ id: "laterne-smaragd", pack: P, name: "Smaragd-Laterne", tier: "edel" },
      chain(100, 12, 40), lantern(100, 38, 0.9, PAL.emerald, "l", PAL.gold, PAL.ruby), sparkles([[50, 90, 6], [152, 130, 4]], "#fff6d8")),
    sticker({ id: "goldband-schleife", pack: P, name: "Goldschleife", tier: "common" },
      shadow(100, 176, 40, 5), bow(100, 78, 1.3), sparkles([[160, 50, 6], [40, 140, 4]], "#fff6d8")),
    // ribbon garland swag with two small bows
    sticker({ id: "goldband-girlande", pack: P, name: "Goldgirlande", tier: "common" },
      part([
        L("M28 66C60 130 140 130 172 66L172 78C140 144 60 144 28 78Z", "@sw"),
        S("M28 68C60 132 140 132 172 68", "#fffaf0", 1.2, 0.7),
      ], [lin("sw", [[0, "#c9963a"], [0.3, "#f6e2a8"], [0.5, "#e9c66e"], [0.75, "#fff4c4"], [1, "#a8782a"]], 0, 0, 1, 0)]),
      bow(28, 66, 0.45, "b1"), bow(172, 66, 0.45, "b1"),
      part([S("M100 133V150", "@m", 1.2)], G),
      sparkles([[100, 158, 6], [60, 40, 4], [140, 40, 4]], "#fff6d8")),
    // hoopoe on a twig, stylised
    sticker({ id: "wiedehopf", pack: P, name: "Wiedehopf", tier: "edel" },
      shadow(100, 176, 56, 6),
      part([
        S("M30 150C70 144 130 146 176 140", "#7a4a22", 5),
        L(leaf(150, 142, 172, 122, 7), "#2f8a5e"), L(leaf(52, 148, 34, 130, 6), "#2f8a5e"),
        // tail
        L("M128 112L176 132L172 144L122 124Z", "#1f1a17"), L("M150 121L166 128L163 135L147 128Z", "#f7efe2"),
        // body
        L("M60 96C70 80 104 80 128 100C140 112 134 128 112 130C86 134 62 122 60 96Z", "@body"),
        // wing with bars
        L("M84 102C100 94 124 102 134 118C120 126 98 126 84 116Z", "#1f1a17"),
        ...[0, 1, 2, 3].map((i) => L(`M${94 + i * 9} ${103 + i * 1.5}l5 0l2 16l-5 0z`, "#f7efe2")),
        // head, beak, crest
        L(circ(62, 86, 14), "@body"),
        L("M50 88C40 92 28 100 18 108C30 102 42 96 52 94Z", "#2a2a2a"),
        ...[-160, -135, -110, -85, -60].map((a, i) => { const [x, y] = polar(66, 80, 30, a + 20); return L(leaf(64, 78, x, y, 5.4), i % 2 ? "@crest" : "@crest2"); }),
        ...[-160, -135, -110, -85, -60].map((a) => { const [x, y] = polar(66, 80, 30, a + 20), [x2, y2] = polar(66, 80, 24, a + 20); return L(leaf(x2, y2, x, y, 2.6), "#1f1a17"); }),
        L(circ(57, 84, 2.2), "#1f1a17"),
        S("M92 128L88 146M106 130L104 146", "#5a3a20", 2),
        S("M66 88C76 82 96 82 110 92", "#ffe6c0", 1.2, 0.6),
      ], [lin("body", [[0, "#f6c58a"], [0.6, "#d9904a"], [1, "#a8602a"]], 0, 0, 1, 1), lin("crest", [[0, "#f6b36a"], [1, "#e08a3a"]]), lin("crest2", [[0, "#ffd08a"], [1, "#f0a050"]])]),
      sparkles([[160, 50, 5]], "#fff6d8")),
    // white dove in flight
    sticker({ id: "taube", pack: P, name: "Taube", tier: "common" },
      halo(100, 96, 84, "#eaf6ff", 0.4),
      part([
        L("M100 92C92 60 74 34 40 22C52 50 58 76 78 100Z", "@wingB"),
        L("M150 110L184 98L178 116L188 124L150 122Z", "@tail"),
        L("M40 112C56 96 90 92 124 100C144 104 156 112 152 122C140 132 104 134 76 128C60 124 46 120 40 112Z", "@body"),
        L(circ(48, 104, 12), "@body"),
        L("M37 104L26 108L37 110Z", "#e9c66e"),
        L(circ(45, 101, 1.8), "#2a2a2a"),
        L("M96 104C110 66 130 40 168 26C160 58 148 86 118 112Z", "@wingF", { stroke: "#c9d8e6", sw: 0.6 }),
        ...[0, 1, 2, 3].map((i) => S(`M${112 + i * 10} ${100 - i * 14}L${132 + i * 9} ${78 - i * 14}`, "#c9d8e6", 0.9, 0.8)),
        S("M44 116C70 126 110 128 148 120", "#ffffff", 1.2, 0.7),
        L(leaf(28, 112, 14, 132, 4), "#2f8a5e"), L(leaf(26, 112, 6, 116, 3.6), "#3fae74"),
      ], [lin("body", [[0, "#ffffff"], [0.6, "#eef4fa"], [1, "#c9d8e6"]]), lin("wingF", [[0, "#ffffff"], [1, "#dfe9f3"]], 0, 1, 1, 0), lin("wingB", [[0, "#dfe9f3"], [1, "#b8c8d8"]]), lin("tail", [[0, "#eef4fa"], [1, "#b8c8d8"]])]),
      sparkles([[160, 150, 5]], "#ffffff")),
    sticker({ id: "dattel-rispe", pack: P, name: "Dattelrispe", tier: "common" },
      dateCluster("dt", ["#e8a35a", "#9a4a12", "#4a1a04"]), leafP(100, 22, 54, 10, 7, 2), leafP(100, 22, 148, 12, 7, -2),
      sparkles([[160, 120, 5]], "#fff6d8")),
    sticker({ id: "dattel-gold", pack: P, name: "Goldene Datteln", tier: "selten", shimmer: true },
      halo(100, 100, 90, "#ffe6a0", 0.5),
      dateCluster("dg", ["#fff4c4", "#e0aa45", "#7a5014"]), leafP(100, 22, 54, 10, 7, 2), leafP(100, 22, 148, 12, 7, -2),
      sparkles([[40, 60, 7], [164, 130, 6], [150, 40, 4]], "#fff6d8")),
    sticker({ id: "bluete-weiss", pack: P, name: "Orangenblüte", tier: "common" },
      leafP(100, 100, 30, 150, 14, 4), leafP(100, 100, 168, 150, 14, -4),
      blossom(100, 92, 70, "bw", ["#ffffff", "#fbf7ee", "#d9cfc0"]),
      sparkles([[160, 40, 6]], "#ffffff")),
    sticker({ id: "bluete-rosa", pack: P, name: "Mandelblüte", tier: "common" },
      part([S("M20 170C60 140 90 130 120 120", "#5a3a20", 4)]),
      blossom(110, 90, 64, "br", ["#fff3f5", "#f7c3cf", "#d98a9c"]), blossom(48, 146, 26, "br", ["#fff3f5", "#f7c3cf", "#d98a9c"]),
      part([L(ell(150, 150, 8, 10), "#f7c3cf", { stroke: "#d98a9c", sw: 0.5 })]),
      sparkles([[40, 50, 6]], "#ffffff")),
    // glowing pomegranate
    sticker({ id: "granatapfel", pack: P, name: "Leuchtender Granatapfel", tier: "edel" },
      halo(100, 108, 92, "#ff8a8a", 0.5),
      part([
        S("M100 10V34", "#7a4a22", 3),
        L(leaf(100, 30, 136, 18, 9, 2), "@lf"),
        L(circ(100, 112, 58), "@pg"),
        L("M84 58L88 46L94 56L100 42L106 56L112 46L116 58C112 64 88 64 84 58Z", "@cr"),
        L(circ(100, 112, 58), "@pgS"),
        L(ell(78, 86, 16, 10), "#ffffff", { op: 0.45 }),
        S("M140 96C150 116 146 140 128 156", "#ffd0c8", 1.6, 0.6),
      ], [lin("lf", [[0, "#56c48a"], [1, "#0b5e3c"]]), rad("pg", [[0, "#ff8a7a"], [0.55, "#d61f3a"], [1, "#6e0619"]], "40%", "38%", "65%"), lin("cr", [[0, "#ff6a6a"], [1, "#8a0a22"]]), rad("pgS", [[0.7, "#000000", 0], [1, "#000000", 0.25]])]),
      sparkles([[44, 50, 7], [160, 160, 5], [154, 70, 4]], "#fff6d8")),
    // glowing golden quince
    sticker({ id: "frucht-gold", pack: P, name: "Goldene Frucht", tier: "selten", shimmer: true },
      halo(100, 108, 94, "#ffe6a0", 0.6),
      part([
        S("M100 16C100 26 98 34 100 44", "#7a4a22", 3),
        L(leaf(100, 34, 144, 22, 10, 3), "@lf"), S("M100 34L138 24", "#a8e6c4", 0.8, 0.6),
        L("M100 46C130 40 158 66 156 106C154 146 128 170 100 170C72 170 46 146 44 106C42 66 70 40 100 46Z", "@fr", { stroke: "#a8782a", sw: 0.6 }),
        L(ell(76, 84, 14, 20), "#ffffff", { op: 0.5 }),
        S("M140 80C152 104 148 134 130 154", "#fffaf0", 1.6, 0.6),
      ], [lin("lf", [[0, "#56c48a"], [1, "#0b5e3c"]]), rad("fr", [[0, "#fffbe8"], [0.35, "#ffe08a"], [0.75, "#e0aa45"], [1, "#a8782a"]], "40%", "35%", "70%")]),
      sparkles([[40, 60, 8], [164, 150, 6], [158, 60, 4]], "#fff6d8")),
  ],
};
void ell;
