// The refined gold wordmark (v2) as PNG files in assets/brand/ (@1x/@2x/@3x, rendered from website public/brand/*.svg).
// "gold" = light foil for the emerald stage and dark mode, "deep" = darker foil for light canvases.
// Latin: Fraunces (SIL OFL 1.1); Arabic calligraphy: Aref Ruqaa (SIL OFL 1.1). w/h = aspect of the artwork.
import type { ImageSourcePropType } from "react-native";

type Entry = { w: number; h: number; gold: ImageSourcePropType; deep: ImageSourcePropType };
export const WORDMARK_FILES = {
  inline: { w: 788.8, h: 87.6, gold: require("../../assets/brand/wordmark-gold.png"), deep: require("../../assets/brand/wordmark-deep.png") },
  stacked: { w: 245.7, h: 132.6, gold: require("../../assets/brand/wordmark-stacked-gold.png"), deep: require("../../assets/brand/wordmark-stacked-deep.png") },
  stackedAr: { w: 245.7, h: 182, gold: require("../../assets/brand/wordmark-stacked-ar-gold.png"), deep: require("../../assets/brand/wordmark-stacked-ar-deep.png") },
  ar: { w: 498.6, h: 98, gold: require("../../assets/brand/wordmark-ar-gold.png"), deep: require("../../assets/brand/wordmark-ar-deep.png") },
  arStacked: { w: 282.6, h: 211.9, gold: require("../../assets/brand/wordmark-ar-stacked-gold.png"), deep: require("../../assets/brand/wordmark-ar-stacked-deep.png") },
  bilingual: { w: 489.2, h: 137.8, gold: require("../../assets/brand/wordmark-bilingual-gold.png"), deep: require("../../assets/brand/wordmark-bilingual-deep.png") },
} satisfies Record<string, Entry>;
export type WordmarkFile = keyof typeof WORDMARK_FILES;
/** the Arabic lockup replaces the Latin one when the app is in Arabic */
export const ARABIC_VARIANT: Partial<Record<WordmarkFile, WordmarkFile>> = { inline: "ar", stacked: "arStacked" };
