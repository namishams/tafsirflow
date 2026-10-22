// The order of the "Islam" hub by the one tradition setting (src/lib/identity.ts), without the chapter texts, so the
// website's client grid stays small. A Shia learner sees the Ja'fari chapters on the main path and the Sunni school
// chapters behind "Andere Rechtsschulen"; a Sunni learner the other way round; "both" or not chosen: reading order.
export const CHAPTER_TRADITION: Record<string, "sunni" | "shia"> = {
  "prayer-sunni": "sunni", "prayers-special-sunni": "sunni", hanafi: "sunni", maliki: "sunni", shafii: "sunni", hanbali: "sunni",
  "prayer-shia": "shia", "prayers-special-shia": "shia", jafari: "shia", ziyarat: "shia", "reciter-path-shia": "shia",
};
/** indexes into `slugs`: `main` (the own tradition's chapters after the first four on faith), `other` (the expander) */
export function hubOrderOf(slugs: string[], trad: "sunni" | "shia" | "both" | null | undefined): { main: number[]; other: number[] } {
  const all = slugs.map((_, i) => i);
  if (trad !== "shia" && trad !== "sunni") return { main: all, other: [] };
  const own = all.filter((i) => CHAPTER_TRADITION[slugs[i]] === trad);
  const rest = all.filter((i) => !CHAPTER_TRADITION[slugs[i]]);
  const other = all.filter((i) => { const t = CHAPTER_TRADITION[slugs[i]]; return !!t && t !== trad; });
  return { main: [...rest.slice(0, 4), ...own, ...rest.slice(4)], other };
}
