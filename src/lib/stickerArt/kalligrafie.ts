// Pack "Kalligrafie Gold": phrases of remembrance in gold on emerald, sapphire and night cartouches.
// The letterforms come from real Arabic fonts (see kalligrafiePfade.ts). No Quran verse text. All pieces are sacred.
import { type StickerTier, L, S, circ, ell, lin, metal, octStar, part, rad, rect, shift, sparkles, sticker, type Part, type StickerPack } from "./kit";
import { CALLI_PATHS, type CalliStyle } from "./kalligrafiePfade";

const P = "kalligrafie";

const cart = (k: number) => {
  const a = 92 * k, b = 62 * k, c = 100;
  return `M${c - a} 100C${c - a + 22 * k} ${100 - b + 8 * k} ${c - 40 * k} ${100 - b} ${c} ${100 - b}C${c + 40 * k} ${100 - b} ${c + a - 22 * k} ${100 - b + 8 * k} ${c + a} 100C${c + a - 22 * k} ${100 + b - 8 * k} ${c + 40 * k} ${100 + b} ${c} ${100 + b}C${c - 40 * k} ${100 + b} ${c - a + 22 * k} ${100 + b - 8 * k} ${c - a} 100Z`;
};

const BACK: Record<string, [string, string, string]> = {
  emerald: ["#1b8a5c", "#0a4d33", "#03241a"],
  sapphire: ["#2a5fc4", "#123479", "#071a42"],
  night: ["#24485a", "#10293a", "#06131d"],
  ruby: ["#a8213f", "#5e0c22", "#2c0410"],
  black: ["#3a3a3a", "#141414", "#050505"],
  wine: ["#7a1020", "#3e0610", "#1a0206"],
};

export type CalliTone = keyof typeof BACK;
export function backing(style: CalliStyle, tone: keyof typeof BACK): Part {
  const [a, b, c] = BACK[tone];
  const grads = [...metal("m"), rad("bg", [[0, a], [0.6, b], [1, c]], "50%", "40%", "70%"), rad("sheen", [[0, "#ffffff", 0.16], [1, "#ffffff", 0]], "40%", "25%", "60%")];
  if (style === "thuluth") {
    return part([
      L(ell(100, 172, 70, 7), "#000000", { op: 0.22 }),
      L(cart(1.04), "@m", { stroke: "#6e4a14", sw: 0.8 }),
      L(cart(0.96), "@bg"),
      S(cart(0.9), "#e9c66e", 1, 0.75),
      L(cart(0.96), "@sheen"),
      L(octStar(6, 100, 7), "@m"), L(octStar(194, 100, 7), "@m"),
      L(circ(100, 37, 3), "#f6e2a8"), L(circ(100, 163, 3), "#f6e2a8"),
    ], grads);
  }
  if (style === "diwani") {
    const scallop = Array.from({ length: 24 }, (_, i) => { const t = (i / 24) * Math.PI * 2; return `M${(100 + Math.cos(t) * 88).toFixed(1)} ${(100 + Math.sin(t) * 88).toFixed(1)}m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0`; }).join("");
    return part([
      L(ell(100, 186, 66, 7), "#000000", { op: 0.22 }),
      L(scallop, "@m"),
      L(circ(100, 100, 88), "@m", { stroke: "#6e4a14", sw: 0.8 }),
      L(circ(100, 100, 80), "@bg"),
      S(circ(100, 100, 75), "#e9c66e", 1, 0.7),
      S(circ(100, 100, 72), "#e9c66e", 0.5, 0.45),
      L(circ(100, 100, 80), "@sheen"),
    ], grads);
  }
  return part([
    L(ell(100, 180, 70, 7), "#000000", { op: 0.22 }),
    L(rect(14, 22, 172, 156, 18), "@m", { stroke: "#6e4a14", sw: 0.8 }),
    L(rect(21, 29, 158, 142, 13), "@bg"),
    S(rect(26, 34, 148, 132, 10), "#e9c66e", 1, 0.7),
    ...[[30, 38], [170, 38], [30, 162], [170, 162]].map(([x, y]) => L(octStar(x, y, 8), "@m")),
    L(rect(21, 29, 158, 142, 13), "@sheen"),
  ], grads);
}

type CalliPath = { id: string; style: CalliStyle; name: string; d: string };

/** a gold calligraphy cartouche from a generated path */
export function calliSticker(c: CalliPath, meta: { id: string; pack: string; name?: string; tier?: StickerTier; shimmer?: boolean }, tone: CalliTone) {
  const d = c.d;
  return sticker({ id: meta.id, pack: meta.pack, name: meta.name ?? c.name, tier: meta.tier ?? "common", sacred: true, ...(meta.shimmer ? { shimmer: true } : {}) },
    backing(c.style, tone),
    part([
      L(shift(d, 1.6, 2.4), "#000000", { op: 0.45 }),
      L(shift(d, 0.5, 0.7), "#6e4a14"),
      L(d, "@g"),
      L(d, "@gl"),
    ], [lin("g", [[0, "#fff4c4"], [0.35, "#f0cf7a"], [0.6, "#c99638"], [1, "#f7dd92"]], 0, 0, 0.3, 1), lin("gl", [[0, "#ffffff", 0.45], [0.4, "#ffffff", 0], [1, "#ffffff", 0]], 0, 0, 0, 1)]),
    sparkles([[40, 56, 5], [162, 146, 4]], "#fff6d8"),
  );
}

function calli(id: string, tone: CalliTone) {
  const c = CALLI_PATHS.find((p) => p.id === id);
  if (!c) throw new Error(`calligraphy ${id} missing`);
  return calliSticker(c, { id: `kalligrafie-${id}`, pack: P, tier: id === "allah" ? "edel" : "common" }, tone);
}

export const KALLIGRAFIE: StickerPack = {
  id: P,
  name: "Kalligrafie Gold",
  stickers: [
    calli("mashaallah", "emerald"),
    calli("subhanallah", "emerald"),
    calli("alhamdulillah", "sapphire"),
    calli("allahu-akbar", "emerald"),
    calli("bismillah", "night"),
    calli("inshaallah", "sapphire"),
    calli("jazakallahu-khayran", "emerald"),
    calli("barakallahu-fik", "ruby"),
    calli("ramadan-kareem", "night"),
    calli("eid-mubarak", "ruby"),
    calli("allah", "emerald"),
    calli("salam", "sapphire"),
  ],
};
