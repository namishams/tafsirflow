import { readJSON, writeJSON } from "@/lib/store";

// Saved names of Allah (the feed's name posts): a new device key, stored by the Arabic name, which is the same in every
// app language (the transliteration and the meaning come in the reader's language and may differ between them).
export const SAVED_NAMES_KEY = "qmc.saved-names";

export function toggleSavedName(ar: string) {
  const cur = readJSON<string[]>(SAVED_NAMES_KEY, []);
  writeJSON(SAVED_NAMES_KEY, cur.includes(ar) ? cur.filter((x) => x !== ar) : [...cur, ar]);
}
