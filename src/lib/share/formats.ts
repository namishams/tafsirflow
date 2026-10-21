// Port of mobile/src/features/share/formats.ts: the three formats (story 9:16, portrait 4:5, square 1:1), the five
// designs (palettes) of the share images. Pure data, no React: used by the feed cards and by the image renderer.

export type ShareFormat = "story" | "post" | "square";
/** the card's layout size in points; the exported image is scaled to 1080 px wide */
export const CARD_SIZE: Record<ShareFormat, { w: number; h: number; px: [number, number] }> = {
  story: { w: 360, h: 640, px: [1080, 1920] },
  post: { w: 360, h: 450, px: [1080, 1350] },
  square: { w: 360, h: 360, px: [1080, 1080] },
};

export type PaletteId = "night" | "emerald" | "dawn" | "parchment" | "marble";
export const PALETTE_IDS: PaletteId[] = ["night", "emerald", "dawn", "parchment", "marble"];

export type Palette = {
  id: PaletteId;
  dark: boolean;
  /** the ground, top to bottom */
  bg: string[];
  /** the colour of the frame, rules and pattern */
  line: string;
  /** light from above */
  glow: string;
  arabic: string;
  ink: string;
  soft: string;
  muted: string;
  /** small headings (kicker, reference) */
  accent: string;
  /** behind the text: a veil that calms the pattern */
  veil: string;
  wordmark: "gold" | "deep";
  /** the swatch in the share sheet */
  swatch: [string, string];
};

export const PALETTES: Record<PaletteId, Palette> = {
  night: {
    id: "night", dark: true, bg: ["#0B2B21", "#05170F", "#020906"], line: "#D6B46C", glow: "rgba(233,207,153,0.20)",
    arabic: "#FBF1D6", ink: "#FFFFFF", soft: "rgba(243,226,182,0.9)", muted: "rgba(243,226,182,0.62)", accent: "#E2C27F", veil: "#05170F", wordmark: "gold", swatch: ["#0B2B21", "#020906"],
  },
  emerald: {
    id: "emerald", dark: true, bg: ["#13704F", "#0A4A37", "#05281E"], line: "#E4C682", glow: "rgba(246,231,191,0.24)",
    arabic: "#FFFFFF", ink: "#FFFFFF", soft: "rgba(246,236,210,0.92)", muted: "rgba(246,236,210,0.66)", accent: "#EED49A", veil: "#0A4A37", wordmark: "gold", swatch: ["#13704F", "#05281E"],
  },
  dawn: {
    id: "dawn", dark: false, bg: ["#FFF6E6", "#FBE3C0", "#F0C493"], line: "#A77A33", glow: "rgba(255,255,255,0.75)",
    arabic: "#0B3D2E", ink: "#173B2E", soft: "rgba(23,59,46,0.88)", muted: "rgba(23,59,46,0.62)", accent: "#94661F", veil: "#FBE3C0", wordmark: "deep", swatch: ["#FFF1DA", "#EDBB86"],
  },
  parchment: {
    id: "parchment", dark: false, bg: ["#F8F0DE", "#F0E3C5", "#E5D2A9"], line: "#9C7634", glow: "rgba(255,252,240,0.6)",
    arabic: "#22190C", ink: "#2A2214", soft: "rgba(42,34,20,0.86)", muted: "rgba(42,34,20,0.6)", accent: "#0B5A43", veil: "#F0E3C5", wordmark: "deep", swatch: ["#F6EBD3", "#DCC594"],
  },
  marble: {
    id: "marble", dark: false, bg: ["#FCFCFA", "#F1F1ED", "#E4E5E0"], line: "#B08D4A", glow: "rgba(255,255,255,0.8)",
    arabic: "#0E3B2D", ink: "#13261F", soft: "rgba(19,38,31,0.84)", muted: "rgba(19,38,31,0.58)", accent: "#A07B36", veil: "#F1F1ED", wordmark: "deep", swatch: ["#FAFAF8", "#D9DAD4"],
  },
};

const hash = (s: string) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
/** a stable design per post, so the shared images of the feed vary (verses of one surah share it) */
export function paletteFor(seed: string): PaletteId {
  const base = /^\d+:\d+$/.test(seed) ? seed.split(":")[0] : seed;
  return PALETTE_IDS[hash(base) % PALETTE_IDS.length];
}
/** night or emerald (for cards whose text is drawn in white) */
export function darkPaletteFor(seed: string): PaletteId {
  return hash(seed) % 2 ? "night" : "emerald";
}

/** the member who shares (only when they switch it on in the share sheet) */
export type Sharer = { username: string; badge: string | null };
/** what the share sheet hands to the renderer */
export type ShareOpts = { palette: PaletteId; sharer: Sharer | null };
export const DEFAULT_OPTS: ShareOpts = { palette: "night", sharer: null };

/**
 * What a card says, declaratively (the web counterpart of the app's templates in ShareTemplates.tsx):
 *  - verse: Arabic verse text with the end-of-verse number, the translation as a serif italic quotation, `reference` as kicker
 *  - text: hadith, tafsir, course insight, dua, story: optional rosette icon, Arabic, title, body (a quotation when `quote`), source line
 *  - name: a name of Allah in a rosette with latin name and meaning
 *  - quiz: question with the four options, the correct one marked, and the explanation ("Answer: …")
 *  - achievement: a rosette with a big figure or icon, title and sub line
 */
export type ShareCard =
  | { t: "verse"; arabic: string; translation: string; reference: string; verseKey?: string }
  | { t: "text"; kicker: string; seed?: string; arabic?: string; title?: string; body?: string; source?: string; quote?: boolean; icon?: ShareIcon }
  | { t: "name"; kicker: string; arabic: string; latin: string; meaning: string }
  | { t: "quiz"; kicker: string; question: string; arabic?: string; options: string[]; answer: number; explain?: string }
  | { t: "achievement"; kicker: string; big?: string; title?: string; sub?: string; icon?: ShareIcon; seed?: string };
/** icons the rosette of a share card can carry (drawn by the renderer as simple gold line icons) */
export type ShareIcon = "book" | "note" | "hands" | "starBig" | "cap" | "moon" | "trophy" | "mosque" | "pen" | "compass" | "clock" | "calendar" | "heart";

/** what a post shares: the link, the message, the seed of its design and the card the renderer draws */
export type ShareSpec = {
  link: string;
  message: string;
  /** picks the default design (a post keeps its design) */
  seed: string;
  card: ShareCard;
  onShared?: () => void;
};
/** the app download page every shared message carries (mobile/src/features/feed/share.tsx APP_LINK) */
export const APP_LINK = "https://quranmasterclass.com/app";
