// The Kaaba, Mecca, Medina and the Hejaz: encyclopedia articles only (canonical English Wikipedia titles checked against
// the API on 21.10.2026; missing titles dropped). Shared history is "all"; the demolition of al-Baqi is listed as
// "shia" because its remembrance is a Shia-specific topic. Factual, no polemics.
import { type CatalogEntry } from "./catalog";

const all = (...t: string[]): CatalogEntry[] => t.map((title) => ({ title, tradition: "all" }));

export const KAABA: CatalogEntry[] = all(
  "Kaaba", "Black Stone", "Hijr Ismail", "Kiswah", "Maqam Ibrahim", "Zamzam Well", "Masjid al-Haram",
  "Siege of Mecca (683)", "Siege of Mecca (692)", "Qarmatians", "Abd al-Muttalib",
);

export const MECCA_HISTORY: CatalogEntry[] = all(
  "Pre-Islamic Arabia", "Religion in pre-Islamic Arabia", "Jahiliyyah", "Quraysh", "Qusayy ibn Kilab", "Abd Manaf ibn Qusai",
  "Hashim ibn Abd Manaf", "Year of the Elephant", "Abraha", "Hilf al-Fudul", "Hubal", "Al-Lat", "Al-Uzza", "Manat",
  "Al-Arqam ibn Abi al-Arqam", "Jabal al-Nour", "Jabal Thawr", "Hijrah", "Conquest of Mecca", "Jannat al-Mu'alla",
  "Sharif of Mecca", "Ottoman architecture", "Mecca", "The Clock Towers", "Mina", "Mount Arafat", "Muzdalifah", "Mecca Province",
);

export const MEDINA_HISTORY: CatalogEntry[] = [
  ...all(
    "Medina", "Banu Aws", "Banu Khazraj", "Banu Qaynuqa", "Banu Nadir", "Banu Qurayza", "History of the Jews in Saudi Arabia",
    "Constitution of Medina", "Prophet's Mosque", "Green Dome", "Quba Mosque", "Masjid al-Qiblatayn", "Battle of Badr",
    "Battle of Uhud", "Mount Uhud", "Battle of the Trench", "Al-Baqi Cemetery", "Hejaz railway", "Siege of Medina",
  ),
  { title: "Demolition of al-Baqi", tradition: "shia" },
];

export const HEJAZ_GEOGRAPHY: CatalogEntry[] = all(
  "Hejaz", "Tihamah", "Sarawat Mountains", "Hejaz Mountains", "Harrat Rahat", "Wadi", "Wadi al-Aqiq", "Climate of Saudi Arabia",
  "Taif", "Red Sea", "Arabian Peninsula",
);
