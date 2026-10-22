// The two AI tutor portraits as plain data (200 x 200 viewBox), drawn in the garden style of the app's illustrations:
// soft rounded shapes, emerald and gold, layered gradients and a gentle rim light, essentially faceless.
// The app gets this file as mobile/src/web/tutorArt.ts through mobile/scripts/sync-web.mjs (never edit the copy).
//   Dalil   a dignified Dubai sheikh: white thobe with folds, black bisht with a fine gold trim, white ghutra and agal,
//           a short neat beard
//   Hidaya  a veiled ustadha: ivory khimar and niqab with a gold edge and modest folds
// Both stand before a gold arabesque arch. Layers: `back` (static disc and arch), `bust` (breathes), `eyes` and `lids`
// (the blink swaps one for the other). `min` hides a fine detail below that rendered size in px, so 28 px stays clean.

export type TutorPersonaArt = "dalil" | "hidaya";
/** a gradient; `id` is local and gets prefixed by the renderer */
export type ArtGrad = { id: string; radial?: boolean; x1?: number; y1?: number; x2?: number; y2?: number; cx?: string; cy?: string; r?: string; stops: [offset: number, color: string, opacity?: number][] };
/** one path; a paint of the form "@id" refers to a gradient */
export type ArtShape = { d: string; fill?: string; stroke?: string; sw?: number; op?: number; min?: number };
export type TutorArt = { label: string; grads: ArtGrad[]; back: ArtShape[]; bust: ArtShape[]; eyes: ArtShape[]; lids: ArtShape[] };

/** an ellipse as a path, so renderers only need <path> */
const ell = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;

const GOLD = "#e8c877";
const SHARED_GRADS: ArtGrad[] = [
  { id: "bg", radial: true, cx: "50%", cy: "38%", r: "64%", stops: [[0, "#4fa878"], [0.55, "#1f6b4a"], [1, "#0b4434"]] },
  { id: "glow", radial: true, cx: "50%", cy: "42%", r: "50%", stops: [[0, "#f3dfa2", 0.38], [0.6, "#e8c877", 0.1], [1, "#e8c877", 0]] },
  { id: "gold", x1: 0, y1: 0, x2: 1, y2: 1, stops: [[0, "#f6e6b4"], [0.5, "#c9a14a"], [1, "#e8c877"]] },
  { id: "leaf", x1: 0, y1: 0, x2: 0, y2: 1, stops: [[0, "#6cc092", 0.55], [1, "#2f8a5e", 0.15]] },
];

// gold arabesque arch (an ogee niche) with an inner line, small lobes along it and two garden leaves at its foot
const ARCH = "M40 182L40 96C40 66 66 52 84 40C93 34 98 27 100 16C102 27 107 34 116 40C134 52 160 66 160 96L160 182";
const ARCH_IN = "M47 182L47 97C47 71 70 58 87 46C95 40 98.5 34 100 26C101.5 34 105 40 113 46C130 58 153 71 153 97L153 182";
const LOBES = [[40, 120], [160, 120], [40, 150], [160, 150], [52, 66], [148, 66], [74, 46], [126, 46]].map(([x, y]) => ell(x, y, 2.2, 2.2)).join("");
const BACK: ArtShape[] = [
  { d: ell(100, 100, 98, 98), fill: "@bg" },
  { d: "M40 182L40 96C40 66 66 52 84 40C93 34 98 27 100 16C102 27 107 34 116 40C134 52 160 66 160 96L160 182Z", fill: "@glow" },
  { d: "M18 150C26 128 42 120 52 122C46 136 34 148 18 150Z", fill: "@leaf", min: 56 },
  { d: "M182 150C174 128 158 120 148 122C154 136 166 148 182 150Z", fill: "@leaf", min: 56 },
  { d: "M10 120C16 104 28 98 36 100C32 110 22 118 10 120Z", fill: "@leaf", min: 96 },
  { d: "M190 120C184 104 172 98 164 100C168 110 178 118 190 120Z", fill: "@leaf", min: 96 },
  { d: ARCH, stroke: "@gold", sw: 2.4, op: 0.85 },
  { d: ARCH_IN, stroke: GOLD, sw: 0.9, op: 0.5, min: 48 },
  { d: LOBES, fill: GOLD, op: 0.75, min: 64 },
  { d: "M100 9L102.6 13L100 17L97.4 13Z", fill: GOLD, min: 40 },
];

const DALIL: TutorArt = {
  label: "Dalil",
  grads: [
    ...SHARED_GRADS,
    { id: "ghutra", x1: 0, y1: 0, x2: 1, y2: 0, stops: [[0, "#fffdf6"], [0.4, "#f6f2e8"], [1, "#d9d2c3"]] },
    { id: "thobe", x1: 0, y1: 0, x2: 1, y2: 0, stops: [[0, "#e2dccf"], [0.45, "#fbf8f1"], [1, "#d6cfc0"]] },
    { id: "bisht", x1: 0, y1: 0, x2: 1, y2: 1, stops: [[0, "#3a4046"], [0.45, "#1c2024"], [1, "#0c0e10"]] },
    { id: "skin", x1: 0, y1: 0, x2: 0, y2: 1, stops: [[0, "#d9a986"], [1, "#b98468"]] },
    { id: "beard", x1: 0, y1: 0, x2: 0, y2: 1, stops: [[0, "#2c2420"], [1, "#4a4038"]] },
    { id: "trim", x1: 0, y1: 0, x2: 0, y2: 1, stops: [[0, "#f6e6b4"], [1, "#c9a14a"]] },
  ],
  back: BACK,
  bust: [
    // bisht over the shoulders, with soft fold shading
    { d: "M6 200C12 166 40 146 72 130L128 130C160 146 188 166 194 200Z", fill: "@bisht" },
    { d: "M40 166C46 176 50 188 51 200M160 166C154 176 150 188 149 200", stroke: "#4b535b", sw: 1.6, op: 0.7, min: 48 },
    { d: "M24 178C28 186 30 194 30 200M176 178C172 186 170 194 170 200", stroke: "#4b535b", sw: 1.2, op: 0.5, min: 96 },
    // white thobe in the opening, with folds
    { d: "M76 130L124 130L114 200L86 200Z", fill: "@thobe" },
    { d: "M95 156Q93 178 92 200M106 158Q108 180 109 200", stroke: "#cfc7b6", sw: 1.4, min: 40 },
    { d: "M100 150L100 176", stroke: "#e0d9ca", sw: 1.6, min: 64 },
    // gold trim on the bisht's opening (fine second line from 64 px)
    { d: "M78 145C81 166 85 186 87 200M122 145C119 166 115 186 113 200", stroke: "@trim", sw: 3 },
    { d: "M73.5 146C76 166 80 186 82 200M126.5 146C124 166 120 186 118 200", stroke: GOLD, sw: 0.9, op: 0.75, min: 64 },
    // neck and collar
    { d: "M88 116L112 116L113 146C106 150 94 150 87 146Z", fill: "#a87458" },
    { d: "M87 145C94 151 106 151 113 145", stroke: "#efe9dc", sw: 2.2, min: 40 },
    // ghutra hanging from the head over both shoulders, open at the face
    { d: "M100 38C131 38 149 57 150 86C151 112 154 132 160 150C163 160 160 172 150 178L128 172C124 160 122 146 120 132L80 132C78 146 76 160 72 172L50 178C40 172 37 160 40 150C46 132 49 112 50 86C51 57 69 38 100 38Z", fill: "@ghutra" },
    { d: "M60 104C62 126 62 146 56 166M140 104C138 126 138 146 144 166", stroke: "#c9c1b0", sw: 1.4, min: 48 },
    { d: "M68 118C70 138 68 156 64 170M132 118C130 138 132 156 136 170", stroke: "#d6cfbf", sw: 1, op: 0.8, min: 96 },
    { d: ell(100, 100, 29, 37), fill: "#cfc6b4" },
    // face and the short neat beard
    { d: ell(100, 98, 21, 26), fill: "@skin" },
    { d: "M79 98C79.5 114 88 128 100 130C112 128 120.5 114 121 98C117 109 110 113 100 113C90 113 83 109 79 98Z", fill: "@beard" },
    { d: "M89.5 110Q100 104.5 110.5 110Q100 113 89.5 110Z", fill: "#2a221d", min: 40 },
    { d: "M84 118Q90 125 96 127M116 118Q110 125 104 127", stroke: "#8a8178", sw: 0.8, op: 0.6, min: 96 },
    { d: "M85.5 89.5Q91 87 96 89M104 89Q109 87 114.5 89.5", stroke: "#3a2d24", sw: 1.4, op: 0.55, min: 64 },
    // ghutra fold over the forehead, the black agal, and a gentle rim light
    { d: "M70 100C68 70 82 52 100 52C118 52 132 70 130 100C126 84 116 75 100 75C84 75 74 84 70 100Z", fill: "@ghutra" },
    { d: "M74 92C78 82 88 77 100 77C112 77 122 82 126 92", stroke: "#bdb4a2", sw: 1.4, op: 0.7, min: 48 },
    { d: "M64 62Q100 40 136 62", stroke: "#17181a", sw: 5.5 },
    { d: "M66 51Q100 29 134 51", stroke: "#17181a", sw: 4.8 },
    { d: "M68 59.5Q100 40 132 59.5M70 48.5Q100 30 130 48.5", stroke: "#5c5f66", sw: 0.9, op: 0.7, min: 64 },
    { d: "M55 92C54 64 72 42 100 40", stroke: "#fff8e2", sw: 2.2, op: 0.75, min: 40 },
    { d: "M42 150C46 132 49 116 50 98", stroke: "#fff8e2", sw: 1.6, op: 0.5, min: 64 },
  ],
  eyes: [{ d: ell(91.5, 95, 2.3, 1.5) + ell(108.5, 95, 2.3, 1.5), fill: "#2a1f18", min: 40 }],
  lids: [{ d: "M89 95.4Q91.5 96.8 94 95.4M106 95.4Q108.5 96.8 111 95.4", stroke: "#5a3d2c", sw: 1.2, min: 40 }],
};

const HIDAYA: TutorArt = {
  label: "Hidaya",
  grads: [
    ...SHARED_GRADS,
    { id: "khimar", x1: 0, y1: 0, x2: 1, y2: 1, stops: [[0, "#fffaf0"], [0.45, "#f1e8d4"], [1, "#cdbd99"]] },
    { id: "niqab", x1: 0, y1: 0, x2: 0, y2: 1, stops: [[0, "#fbf4e6"], [1, "#e2d6bb"]] },
    { id: "skin", x1: 0, y1: 0, x2: 0, y2: 1, stops: [[0, "#d9a986"], [1, "#c08a6c"]] },
  ],
  back: BACK,
  bust: [
    // the khimar, flowing from the head over the shoulders, with modest folds
    { d: "M100 34C134 34 152 58 152 92C152 120 160 146 178 168C186 180 190 192 190 200L10 200C10 192 14 180 22 168C40 146 48 120 48 92C48 58 66 34 100 34Z", fill: "@khimar" },
    { d: "M22 168C40 146 48 120 48 92M178 168C160 146 152 120 152 92", stroke: "@gold", sw: 1.6, op: 0.9, min: 40 },
    { d: "M60 122C62 150 54 176 40 200M140 122C138 150 146 176 160 200", stroke: "#b29f78", sw: 1.8, op: 0.7, min: 40 },
    { d: "M84 156C86 172 84 188 80 200M116 156C114 172 116 188 120 200", stroke: "#b29f78", sw: 1.4, op: 0.6, min: 48 },
    { d: "M66 128C68 152 62 178 52 200M134 128C132 152 138 178 148 200", stroke: "#fffdf6", sw: 1.1, op: 0.7, min: 96 },
    // shadowed face opening, the eye band, and the niqab with its gold edge
    { d: ell(100, 94, 27, 33), fill: "#c4b392" },
    { d: ell(100, 92, 22, 24), fill: "@skin" },
    { d: "M76 98Q100 94 124 98C127 120 128 148 120 168Q100 176 80 168C72 148 73 120 76 98Z", fill: "@niqab" },
    { d: "M84 120Q86 144 84 164M116 120Q114 144 116 164", stroke: "#c2b08a", sw: 1.2, op: 0.7, min: 48 },
    { d: "M100 110L100 170", stroke: "#c2b08a", sw: 1, op: 0.5, min: 96 },
    { d: "M76 98Q100 94 124 98", stroke: "@gold", sw: 1.8 },
    // the khimar's band over the forehead with a gold edge, and a gentle rim light
    { d: "M72 98C70 68 84 54 100 54C116 54 130 68 128 98C124 84 114 78 100 78C86 78 76 84 72 98Z", fill: "@khimar" },
    { d: "M73 94C77 83 87 78 100 78C113 78 123 83 127 94", stroke: "@gold", sw: 1.5, min: 40 },
    { d: "M53 96C52 64 70 40 100 37", stroke: "#fffdf6", sw: 2.2, op: 0.9, min: 40 },
    { d: "M30 160C42 140 49 120 50 100", stroke: "#fffdf6", sw: 1.5, op: 0.7, min: 64 },
  ],
  eyes: [{ d: ell(91.5, 89.5, 2.3, 1.5) + ell(108.5, 89.5, 2.3, 1.5), fill: "#2a1f18", min: 40 }],
  lids: [{ d: "M89 89.9Q91.5 91.3 94 89.9M106 89.9Q108.5 91.3 111 89.9", stroke: "#5a3d2c", sw: 1.2, min: 40 }],
};

export const TUTOR_ART: Record<TutorPersonaArt, TutorArt> = { dalil: DALIL, hidaya: HIDAYA };

/** the shapes of a layer that are drawn at this rendered size */
export const shapesAt = (shapes: ArtShape[], size: number) => shapes.filter((s) => !s.min || size >= s.min);
/** resolves "@id" to the renderer's prefixed gradient url */
export const paint = (p: string | undefined, prefix: string) => (p === undefined ? "none" : p.startsWith("@") ? `url(#${prefix}${p.slice(1)})` : p);
