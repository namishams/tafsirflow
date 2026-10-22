import { rateGrade, restoreSrsEntry, srsEntry, type Rating4, type Srs } from "@/web/learning";
import { readJSON, writeJSON } from "@/lib/store";
import { K2, noteLinks, type LinkStat, type Links } from "./store2";

// Saving the ratings of one session (blind recitation, self check) more than once: the first save rates every verse
// and transition that has a rating; a later save applies only what changed since, and a changed rating replaces the
// earlier one (the review entry and the transition's counters are put back to their state before this session, then
// rated again) instead of counting as a second review. Mirrored for the website in src/lib/learn/shams2/rated.ts.
export type SavedRatings = {
  grades: Record<string, Rating4>;
  links: Record<string, boolean>;
  /** state before this session's first rating (null: there was none) */
  srsBefore: Record<string, Srs[string] | null>;
  linkBefore: Record<string, LinkStat | null>;
};
export const NOTHING_SAVED: SavedRatings = { grades: {}, links: {}, srsBefore: {}, linkBefore: {} };
export const wasSaved = (s: SavedRatings) => Object.keys(s.grades).length > 0 || Object.keys(s.links).length > 0;

/** applies the changes since `prev`; returns the new snapshot and the verses that are now rated good (3 or 4) for the
 *  first time in this session */
export function saveRatings(prev: SavedRatings, grades: Record<string, Rating4 | null | undefined>, links: Record<string, boolean | undefined>): { saved: SavedRatings; newlyGood: string[] } {
  const saved: SavedRatings = { grades: { ...prev.grades }, links: { ...prev.links }, srsBefore: { ...prev.srsBefore }, linkBefore: { ...prev.linkBefore } };
  const newlyGood: string[] = [];
  for (const [key, g] of Object.entries(grades)) {
    if (!g || prev.grades[key] === g) continue;
    if (key in prev.grades) { restoreSrsEntry(key, prev.srsBefore[key] ?? undefined); rateGrade(key, g, true); }
    else { saved.srsBefore[key] = srsEntry(key) ?? null; rateGrade(key, g); }
    if (g >= 3 && (prev.grades[key] ?? 0) < 3) newlyGood.push(key);
    saved.grades[key] = g;
  }
  const changed = Object.entries(links).filter((e): e is [string, boolean] => typeof e[1] === "boolean" && prev.links[e[0]] !== e[1]);
  if (changed.length) {
    const all = { ...readJSON<Links>(K2.links, {}) };
    let restored = false;
    for (const [key] of changed) {
      if (key in prev.links) { const b = prev.linkBefore[key]; if (b) all[key] = b; else delete all[key]; restored = true; }
      else saved.linkBefore[key] = all[key] ?? null;
    }
    if (restored) writeJSON(K2.links, all);
    noteLinks(changed.map(([key, ok]) => ({ key, ok })));
    for (const [key, ok] of changed) saved.links[key] = ok;
  }
  return { saved, newlyGood };
}
