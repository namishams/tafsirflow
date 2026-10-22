// Pack "Edelsteine": faceted gems with refraction, a gem-set crescent and a jeweled lantern.
import { PAL, L, alongCrescent, S, brilliant, cabochon, circ, crescent, ell, halo, lantern, lin, metal, octStar, part, rad, shadow, sparkles, sticker, stepCut, type StickerPack } from "./kit";

const P = "edelsteine";

/** gems along the middle of a crescent band, sized by the band's thickness */
export const crescentGems = (cx: number, cy: number, r: number, off: number, ir: number, rot: number, angles: number[], pals: string[][]) =>
  alongCrescent(cx, cy, r, off, ir, rot, angles).map(([x, y, th], i) => brilliant(x, y, Math.max(3, Math.min(11, th * 0.36)), pals[i % pals.length], `cg${i}`));

// thin gold claws around a gem
const prongs = (cx: number, cy: number, r: number, n: number, rot = -90) =>
  part(Array.from({ length: n }, (_, i) => {
    const a = ((rot + (i * 360) / n) * Math.PI) / 180;
    return L(ell(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4.2, 4.2), "@pr", { stroke: "#7a5216", sw: 0.6 });
  }), [rad("pr", [[0, "#fff6d6"], [0.5, "#e9c66e"], [1, "#9a6a22"]], "35%", "30%", "70%")]);

const turquoiseVeins = "M44 96L62 90L70 104L88 98L96 112L114 104L126 116L146 108M62 90L66 72L82 66M88 98L92 80M96 112L90 132L108 140M114 104L120 86L138 82M126 116L130 136M70 104L60 124L76 136";

export const EDELSTEINE: StickerPack = {
  id: P,
  name: "Edelsteine",
  stickers: [
    sticker({ id: "smaragd", pack: P, name: "Smaragd", tier: "edel" },
      shadow(100, 170, 62, 9), halo(100, 98, 92, "#5fe3a0", 0.4), stepCut(100, 98, 108, 132, PAL.emerald, "g"),
      sparkles([[64, 50, 9], [140, 150, 6], [150, 60, 4]])),
    sticker({ id: "rubin", pack: P, name: "Rubin", tier: "edel" },
      shadow(100, 172, 60, 9), halo(100, 98, 92, "#ff4d6d", 0.42), brilliant(100, 98, 66, PAL.ruby, "g", "oval"),
      sparkles([[62, 44, 9], [146, 148, 6], [150, 54, 4]])),
    sticker({ id: "saphir", pack: P, name: "Saphir", tier: "edel" },
      shadow(100, 170, 62, 9), halo(100, 100, 92, "#4d8dff", 0.42), brilliant(100, 100, 70, PAL.sapphire, "g", "round", false, 10),
      sparkles([[56, 46, 9], [150, 150, 6], [154, 58, 4]])),
    sticker({ id: "bernstein", pack: P, name: "Bernstein", tier: "common" },
      shadow(100, 168, 60, 9), halo(100, 100, 88, "#ffb347", 0.38), cabochon(100, 102, 66, 56, PAL.amber, "g"), part([L(ell(112, 118, 26, 18), "@ig")], [rad("ig", [[0, "#fff1b0", 0.7], [1, "#ffb43a", 0]])]),
      sparkles([[60, 58, 7], [146, 136, 4]])),
    sticker({ id: "tuerkis", pack: P, name: "Türkis", tier: "common" },
      shadow(100, 168, 62, 9), halo(100, 100, 88, "#4fe3cf", 0.34), cabochon(100, 100, 68, 60, PAL.turquoise, "g", turquoiseVeins),
      sparkles([[56, 56, 7], [150, 140, 4]])),
    sticker({ id: "diamant", pack: P, name: "Diamant", tier: "selten" },
      shadow(100, 172, 64, 9), halo(100, 98, 96, "#e9f6ff", 0.55), brilliant(100, 98, 72, PAL.diamond, "g", "round", true, 8),
      sparkles([[50, 40, 12], [152, 150, 8], [158, 50, 6], [44, 148, 5]])),
    sticker({ id: "smaragd-tropfen", pack: P, name: "Smaragd-Tropfen", tier: "edel" },
      shadow(100, 176, 52, 8), halo(100, 100, 90, "#5fe3a0", 0.36), brilliant(100, 100, 64, PAL.emerald, "g", "pear"),
      sparkles([[60, 60, 8], [146, 146, 5]])),
    sticker({ id: "rubin-herz", pack: P, name: "Rubinherz", tier: "edel" },
      shadow(100, 172, 58, 9), halo(100, 100, 90, "#ff4d6d", 0.36), brilliant(100, 98, 68, PAL.ruby, "g", "heart"),
      sparkles([[58, 48, 8], [150, 150, 5]])),
    sticker({ id: "amethyst", pack: P, name: "Amethyst", tier: "common" },
      shadow(100, 170, 60, 9), halo(100, 98, 90, "#b77cff", 0.36), stepCut(100, 98, 122, 104, PAL.amethyst, "g", 0.16),
      sparkles([[54, 54, 8], [150, 146, 5]])),
    // crescent set with a row of gems
    sticker({ id: "halbmond-juwelen", pack: P, name: "Juwelen-Halbmond", tier: "selten" },
      halo(100, 100, 94, "#f3dfa2", 0.4),
      part([
        L(crescent(100, 100, 74, 34, 64, -30), "@m", { stroke: "#7a5216", sw: 1 }),
        L(crescent(100, 100, 66, 30, 58, -30), "@mi"),
        L(crescent(100, 100, 74, 34, 64, -30), "none", { stroke: "#fff3c9", sw: 1.2, op: 0.55 }),
      ], [...metal("m"), lin("mi", [[0, "#0b5e3c"], [1, "#04301e"]], 0, 0, 1, 1)]),
      ...crescentGems(100, 100, 74, 34, 64, -30, [80, 108, 130, 150, 170, 192, 220], [PAL.emerald, PAL.ruby, PAL.diamond, PAL.emerald, PAL.diamond, PAL.ruby, PAL.emerald]),
      part([L(octStar(152, 52, 15), "@m", { stroke: "#7a5216", sw: 0.8 })], metal("m")),
      brilliant(152, 52, 7, PAL.sapphire, "c3"),
      sparkles([[46, 150, 7], [168, 128, 5]])),
    sticker({ id: "juwelen-laterne", pack: P, name: "Juwelen-Laterne", tier: "selten" },
      lantern(100, 22, 1.05, PAL.emerald, "l", PAL.gold, PAL.ruby), sparkles([[46, 72, 7], [156, 120, 5], [150, 40, 4]])),
    // eight-pointed gold star with a central diamond and four emeralds
    sticker({ id: "juwelen-stern", pack: P, name: "Juwelenstern", tier: "selten" },
      halo(100, 100, 96, "#f3dfa2", 0.45),
      part([
        L(octStar(100, 100, 82), "@m", { stroke: "#6e4a14", sw: 1.2 }),
        L(octStar(100, 100, 70), "@mi"),
        L(octStar(100, 100, 82), "none", { stroke: "#fff3c9", sw: 1, op: 0.6 }),
        S(circ(100, 100, 44), "#e9c66e", 1.4, 0.8),
      ], [...metal("m"), rad("mi", [[0, "#0f6a45"], [1, "#03281a"]])]),
      brilliant(100, 100, 30, PAL.diamond, "d", "round", true),
      ...[0, 90, 180, 270].map((a) => { const r = 58, x = 100 + Math.cos(((a - 90) * Math.PI) / 180) * r, y = 100 + Math.sin(((a - 90) * Math.PI) / 180) * r; return brilliant(x, y, 8, PAL.emerald, "e"); }),
      ...[45, 135, 225, 315].map((a) => { const r = 56, x = 100 + Math.cos(((a - 90) * Math.PI) / 180) * r, y = 100 + Math.sin(((a - 90) * Math.PI) / 180) * r; return brilliant(x, y, 6, PAL.ruby, "r"); }),
      sparkles([[60, 64, 6], [150, 150, 5]])),
  ],
};
void prongs;
