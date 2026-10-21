// Abrahamic religions from an Islamic perspective: encyclopedia articles only (English Wikipedia titles checked
// against the API on 21.10.2026). Respectful and factual: no polemics, no comparison or ranking, no rulings.
import { type CatalogEntry } from "./catalog";

const all = (...t: string[]): CatalogEntry[] => t.map((title) => ({ title, tradition: "all" }));

/** the figure in Islam next to the general article (Jewish and Christian traditions) */
export const ABRAHAMIC_PROPHETS: CatalogEntry[] = all(
  "Abraham in Islam", "Abraham", "Hagar in Islam", "Ishmael in Islam", "Ishmael", "Isaac in Islam", "Isaac",
  "Jacob in Islam", "Jacob", "Joseph in Islam", "Joseph (Genesis)", "Moses in Islam", "Moses", "Aaron in Islam", "Aaron",
  "David in Islam", "David", "Solomon in Islam", "Solomon", "Zechariah in Islam", "Zechariah, father of John the Baptist",
  "John the Baptist in Islam", "John the Baptist", "Jesus in Islam", "Jesus", "Mary in Islam", "Mary, mother of Jesus",
);

export const ABRAHAMIC_RELIGIONS: CatalogEntry[] = all(
  "Abrahamic religions", "People of the Book", "Judaism", "Christianity", "Islam", "Islam and other religions",
  "Torah", "Torah in Islam", "Psalms", "Psalms in Islam", "Gospel", "Gospel in Islam", "Hanif", "Millat Ibrahim", "Israelites",
);

export const ABRAHAMIC_PLACES: CatalogEntry[] = all(
  "Cave of the Patriarchs", "Hebron", "Jerusalem", "Temple Mount", "Mount Sinai", "Saint Catherine's Monastery", "Mecca",
  "Kaaba", "Maqam Ibrahim", "Zamzam Well", "Abrahamic Family House", "Saadiyat Island",
);

/** neutral historical articles */
export const INTERFAITH_HISTORY: CatalogEntry[] = all(
  "Constitution of Medina", "Pact of Umar", "Dhimmi", "Convivencia", "Ashtiname of Muhammad", "Diplomatic career of Muhammad",
  "Amman Message", "A Common Word between Us and You", "Document on Human Fraternity", "Abrahamic Family House",
);
