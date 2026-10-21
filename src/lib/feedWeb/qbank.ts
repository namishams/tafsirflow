// The exam centre's question bank for the web feed. The data is generated from the app's bank by
// scripts/sync-qbank-web.mjs into src/lib/feedWeb/data/qbank-<en|de|ar>.json and read lazily with fs from the project
// folder (not bundled, not imported): one file per language is loaded the first time it is needed and kept in memory.
// Without the file (not deployed) quiz cards are simply left out.
import fs from "node:fs";
import path from "node:path";

/** compact question row: s subject, d difficulty 1-7, tr tradition tags, v verse key, w word position, src source,
 *  rv review status, q stem, o options (o[0] is the correct one), e explanation */
export type QRow = { s: string; d: number; tr?: string[]; v?: string; w?: number; src: string; rv: string; q: string; o: [string, string, string, string]; e: string };
export type QLang = "en" | "de" | "ar";

/** question language: German and Arabic have their own text, every other language reads the English one (the app's qLangOf) */
export const qLangOf = (appLang: string): QLang => (appLang === "de" ? "de" : appLang === "ar" ? "ar" : "en");

const banks = new Map<QLang, Record<string, QRow> | null>();
function bank(lang: QLang): Record<string, QRow> | null {
  if (banks.has(lang)) return banks.get(lang) ?? null;
  let data: Record<string, QRow> | null = null;
  try {
    data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src", "lib", "feedWeb", "data", `qbank-${lang}.json`), "utf8")) as Record<string, QRow>;
  } catch {
    data = null;
  }
  banks.set(lang, data);
  return data;
}

/** the question with this bank id in the reader's question language, or null (unknown id, missing data file) */
export function questionById(id: string, appLang: string): QRow | null {
  const b = bank(qLangOf(appLang));
  const q = b ? b[id] : undefined;
  return q && Array.isArray(q.o) && q.o.length === 4 ? q : null;
}
