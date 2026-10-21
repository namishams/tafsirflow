// The refined gold wordmark (v2) as files in public/brand/ (outlined, no font needed): name → viewBox width/height.
// "gold" = light foil for the emerald stage and dark mode, "deep" = darker foil for light canvases.
// Latin: Fraunces (SIL OFL 1.1); Arabic calligraphy: Aref Ruqaa (SIL OFL 1.1). v1 files are kept as *-v1.svg.
export const WORDMARK_FILES = {
  inline: { file: "wordmark", w: 788.8, h: 87.6 },
  stacked: { file: "wordmark-stacked", w: 245.7, h: 132.6 },
  stackedAr: { file: "wordmark-stacked-ar", w: 245.7, h: 182 },
  ar: { file: "wordmark-ar", w: 498.6, h: 98 },
  arStacked: { file: "wordmark-ar-stacked", w: 282.6, h: 211.9 },
  bilingual: { file: "wordmark-bilingual", w: 489.2, h: 137.8 },
} as const;
export type WordmarkFile = keyof typeof WORDMARK_FILES;
export const wordmarkSrc = (v: WordmarkFile, tone: "gold" | "deep") => `/brand/${WORDMARK_FILES[v].file}-${tone}.svg`;
/** the Arabic lockup replaces the Latin one when the page is in Arabic */
export const ARABIC_VARIANT: Partial<Record<WordmarkFile, WordmarkFile>> = { inline: "ar", stacked: "arStacked" };
