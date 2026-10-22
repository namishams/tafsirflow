// Packs "Asma ul-Husna" (the Beautiful Names, first 33 so far, all sacred) and "Starke Frauen" (gold name cartouches
// of Khadija, Fatima az-Zahra, Aisha, Maryam, Asiya and Zaynab, names only, plus ornaments). Paths: namenPfade.ts.
import { PAL, L, S, brilliant, circ, crescent, halo, lantern, lin, metal, octStar, part, pearl, polar, rad, sparkles, star, sticker, type StickerPack } from "./kit";
import { calliSticker, type CalliTone } from "./kalligrafie";
import { NAMEN_PATHS } from "./namenPfade";
import { rose } from "./schwestern";
import { wreath } from "./rar";

const path = (id: string) => {
  const c = NAMEN_PATHS.find((p) => p.id === id);
  if (!c) throw new Error(`name ${id} missing`);
  return c;
};

/** the first 33 of the 99 Names, in the traditional order */
export const ASMA_IDS = [
  "ar-rahman", "ar-rahim", "al-malik", "al-quddus", "as-salam", "al-mumin", "al-muhaymin", "al-aziz", "al-jabbar", "al-mutakabbir", "al-khaliq",
  "al-bari", "al-musawwir", "al-ghaffar", "al-qahhar", "al-wahhab", "ar-razzaq", "al-fattah", "al-alim", "al-qabid", "al-basit", "al-khafid",
  "ar-rafi", "al-muizz", "al-mudhill", "as-sami", "al-basir", "al-hakam", "al-adl", "al-latif", "al-khabir", "al-halim", "al-azim",
];
const ASMA_TONES: CalliTone[] = ["emerald", "sapphire", "night"];

export const ASMA_UL_HUSNA: StickerPack = {
  id: "asma_ul_husna",
  name: "Asma ul-Husna",
  stickers: ASMA_IDS.map((id, i) => calliSticker(path(id), { id: `asma-${String(i + 1).padStart(2, "0")}-${id}`, pack: "asma_ul_husna", tier: "edel" }, ASMA_TONES[i % 3])),
};

const W = "strong_women";
const G = metal("m");

export const STRONG_WOMEN: StickerPack = {
  id: W,
  name: "Starke Frauen",
  stickers: [
    calliSticker(path("khadija"), { id: "frau-khadija", pack: W, tier: "edel" }, "emerald"),
    calliSticker(path("fatima-az-zahra"), { id: "frau-fatima-az-zahra", pack: W, tier: "edel" }, "sapphire"),
    calliSticker(path("aisha"), { id: "frau-aisha", pack: W, tier: "edel" }, "ruby"),
    calliSticker(path("maryam"), { id: "frau-maryam", pack: W, tier: "edel" }, "sapphire"),
    calliSticker(path("asiya"), { id: "frau-asiya", pack: W, tier: "edel" }, "night"),
    calliSticker(path("zaynab"), { id: "frau-zaynab", pack: W, tier: "edel" }, "wine"),
    // ornaments
    sticker({ id: "zier-perlenstern", pack: W, name: "Perlenstern", tier: "common" },
      halo(100, 100, 92, "#f3dfa2", 0.4),
      part([L(octStar(100, 100, 80), "@m", { stroke: "#6e4a14", sw: 0.8 }), L(octStar(100, 100, 70), "@bg"), S(circ(100, 100, 44), "#e9c66e", 1.2, 0.8)], [...G, rad("bg", [[0, "#1f9a68"], [1, "#03241a"]])]),
      ...Array.from({ length: 8 }, (_, i) => { const [x, y] = polar(100, 100, 56, i * 45 - 90); return pearl(x, y, 6.5, PAL.pearl, "p"); }),
      pearl(100, 100, 24, PAL.rosePearl, "c", ["#ffd6e6", "#d6fff3"]),
      sparkles([[40, 40, 6], [160, 160, 5]])),
    sticker({ id: "zier-rose", pack: W, name: "Rose der Frauen", tier: "common" },
      wreath(100, 100, 62), rose(100, 100, 46, "r"), sparkles([[150, 40, 6]], "#fff0f3")),
    sticker({ id: "zier-kranz", pack: W, name: "Goldkranz", tier: "common" },
      halo(100, 100, 90, "#ffe6a0", 0.35), wreath(100, 100, 66),
      ...[0, 1, 2].map((i) => pearl(84 + i * 16, 168, 6, PAL.pearl, "p")),
      sparkles([[100, 100, 12], [60, 60, 5], [140, 70, 4]], "#fff6d8")),
    sticker({ id: "zier-laterne", pack: W, name: "Laterne der Geduld", tier: "edel" },
      lantern(100, 22, 1.05, PAL.sapphire, "l", PAL.gold, PAL.pearl), sparkles([[44, 70, 6], [158, 124, 5]], "#fff6d8")),
    sticker({ id: "zier-halbmond", pack: W, name: "Halbmond mit Perle", tier: "common" },
      halo(100, 100, 90, "#f3dfa2", 0.4),
      part([L(crescent(96, 100, 68, 30, 58, -35), "@m", { stroke: "#6e4a14", sw: 0.8 }), L(star(146, 62, 5, 14, 6), "@m")], G),
      pearl(118, 112, 14, PAL.pearl, "p"),
      sparkles([[40, 60, 6], [160, 150, 5]])),
    sticker({ id: "zier-medaillon", pack: W, name: "Juwelen-Medaillon", tier: "edel" },
      part([L(star(100, 100, 24, 86, 78), "@m", { stroke: "#6e4a14", sw: 0.7 }), L(circ(100, 100, 74), "@bg"), S(circ(100, 100, 66), "#e9c66e", 1.2, 0.8)], [...G, lin("bg", [[0, "#7a1030"], [1, "#2c0410"]], 0, 0, 1, 1)]),
      brilliant(100, 100, 36, PAL.ruby, "r", "heart"),
      ...Array.from({ length: 12 }, (_, i) => { const [x, y] = polar(100, 100, 66, i * 30); return pearl(x, y, 4.4, PAL.pearl, "s"); }),
      sparkles([[40, 40, 7], [160, 160, 5]])),
  ],
};
