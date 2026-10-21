import { BUNDLED_UI_VERSES } from "./uiVerses";

// Arabic lines of the surah header. The basmala is verse 1:1 from the Quran data (uiVerses.ts, never typed by hand);
// screens read the stored copy with useUiVerses(), this constant is the bundled snapshot.
export const BISMILLAH = BUNDLED_UI_VERSES["1:1"];
export const SURAH_PREFIX = "سورة ";
