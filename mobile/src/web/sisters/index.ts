// "Für Schwestern" – the texts in every language (one file per language), the sources and the device-only state.
// Pure module, mirrored into the app by mobile/scripts/sync-web.mjs (src/web/sisters/).
import type { SistersText } from "./types";
import de from "./de";
import en from "./en";
import arText from "./ar";
import trText from "./tr";
import urText from "./ur";
import faText from "./fa";
import psText from "./ps";
import frText from "./fr";
import esText from "./es";
import idText from "./id";
import msText from "./ms";
import bnText from "./bn";
import ruText from "./ru";
import zhText from "./zh";

const TEXTS: Record<string, SistersText> = { de, en, ar: arText, tr: trText, ur: urText, fa: faText, ps: psText, fr: frText, es: esText, id: idText, ms: msText, bn: bnText, ru: ruText, zh: zhText };

/** the section's texts in this language; English for a language without its own file */
export const sistersText = (lang: string): SistersText => TEXTS[lang] ?? en;
export type { SistersText } from "./types";
export { SOURCES, SISTERS_REVIEW, SISTERS_ROUTES } from "./sources";
