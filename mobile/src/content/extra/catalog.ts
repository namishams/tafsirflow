// Curated English Wikipedia article titles per feed kind. Only the titles are hand-picked here; every text, date and
// image is fetched at runtime from Wikipedia (CC BY-SA 4.0), Wikidata (CC0) or Wikimedia Commons (per-file free
// license) and shown with attribution. Nothing from the Quran or hadith is typed here.
import type { Tradition } from "./types";

export type CatalogEntry = { title: string; tradition: Tradition };
const all = (...titles: string[]): CatalogEntry[] => titles.map((title) => ({ title, tradition: "all" }));
const sunni = (...titles: string[]): CatalogEntry[] => titles.map((title) => ({ title, tradition: "sunni" }));
const shia = (...titles: string[]): CatalogEntry[] => titles.map((title) => ({ title, tradition: "shia" }));

/** app reciter folder (see /api/reciters and src/features/quran/reciter.ts) -> English Wikipedia article */
export const RECITER_ARTICLES: Record<string, string> = {
  Alafasy_128kbps: "Mishary Rashid Alafasy",
  Abdul_Basit_Murattal_192kbps: "Abdul Basit Abdus Samad",
  Abdul_Basit_Mujawwad_128kbps: "Abdul Basit Abdus Samad",
  "AbdulSamad_64kbps_QuranExplorer.Com": "Abdul Basit Abdus Samad",
  Husary_128kbps: "Mahmoud Khalil Al-Hussary",
  Minshawy_Murattal_128kbps: "Mohamed Siddiq El-Minshawi",
  "Abdullaah_3awwaad_Al-Juhaynee_128kbps": "Abdullah Awad Al Juhany",
  "Abdurrahmaan_As-Sudais_192kbps": "Abdul Rahman Al-Sudais",
  "Abu_Bakr_Ash-Shaatree_128kbps": "Abu Bakr ash-Shatry",
  ahmed_ibn_ali_al_ajamy_128kbps: "Ahmad bin Ali Al-Ajmi",
  Ali_Jaber_64kbps: "Ali Jaber",
};

export const MOSQUES: CatalogEntry[] = all(
  "Kaaba", "Great Mosque of Mecca", "Prophet's Mosque", "Al-Aqsa Mosque", "Dome of the Rock", "Quba Mosque",
  "Masjid al-Qiblatayn", "Umayyad Mosque", "Mosque of Uqba", "Great Mosque of Kairouan", "Mosque–Cathedral of Córdoba",
  "Al-Azhar Mosque", "Mosque of Ibn Tulun", "Sultan Ahmed Mosque", "Süleymaniye Mosque", "Hagia Sophia", "Selimiye Mosque",
  "Shah Mosque (Isfahan)", "Sheikh Lotfollah Mosque", "Jama Masjid, Delhi", "Badshahi Mosque",
  "Faisal Mosque", "Hassan II Mosque", "Sheikh Zayed Grand Mosque", "Great Mosque of Djenné", "Great Mosque of Samarra",
  "Al-Qarawiyyin", "Istiqlal Mosque", "Sultan Omar Ali Saifuddien Mosque", "Bibi-Khanym Mosque", "Great Mosque of Xi'an",
  "Muhammad Ali Mosque", "Blue Mosque, Mazar-i-Sharif", "Nasir al-Mulk Mosque", "Kul Sharif Mosque",
).concat(shia("Imam Husayn Shrine", "Imam Ali Shrine", "Imam Reza shrine", "Al-Askari Shrine", "Al-Kadhimiya Mosque", "Fatima Masumeh Shrine"));

export const ART: CatalogEntry[] = all(
  "Islamic art", "Islamic calligraphy", "Islamic architecture", "Islamic geometric patterns", "Arabesque", "Kufic",
  "Naskh (script)", "Thuluth", "Nastaliq", "Diwani", "Maghrebi script", "Muqarnas", "Iwan", "Mihrab", "Minbar", "Minaret",
  "Zellij", "Girih", "Iznik pottery", "Persian miniature", "Ottoman illumination", "Blue Quran", "Mamluk architecture",
  "Ottoman architecture", "Moorish architecture", "Mughal architecture", "Alhambra", "Taj Mahal", "Tughra", "Hilya",
);

export const SCHOLARS: CatalogEntry[] = [
  ...all("Ali", "Fatimah", "Khadija bint Khuwaylid", "Hasan ibn Ali", "Husayn ibn Ali", "Salman the Persian", "Bilal ibn Rabah",
    "Ammar ibn Yasir", "Abu Dharr al-Ghifari", "Miqdad ibn Aswad", "Abd Allah ibn Abbas", "Ja'far al-Sadiq", "Muhammad al-Baqir",
    "Zayd ibn Thabit", "Ubayy ibn Ka'b", "Abd Allah ibn Mas'ud", "Mus'ab ibn Umayr", "Hamza ibn Abd al-Muttalib",
    "Ja'far ibn Abi Talib", "Al-Tabari", "Ibn Kathir", "Al-Qurtubi", "Fakhr al-Din al-Razi", "Al-Zamakhshari",
    "Nafiʽ al-Madani", "Hafs", "Warsh", "Al-Khalil ibn Ahmad al-Farahidi", "Sibawayh"),
  ...sunni("Abu Bakr", "Umar", "Uthman", "Aisha", "Abu Hurayra", "Abu Hanifa", "Malik ibn Anas", "Al-Shafi'i",
    "Ahmad ibn Hanbal", "Muhammad al-Bukhari", "Muslim ibn al-Hajjaj", "Abu Dawud al-Sijistani", "Al-Tirmidhi", "Al-Nasa'i",
    "Ibn Majah", "Al-Nawawi", "Ibn Taymiyya", "Ibn Qayyim al-Jawziyya", "Al-Dhahabi", "Ibn al-Jawzi", "Abu al-Hasan al-Ash'ari",
    "Abu Mansur al-Maturidi", "Al-Hakim al-Nishapuri", "Al-Bayhaqi", "Ibn Abd al-Barr", "Qadi Iyad", "Ibn Qudamah",
    "Muhammad Metwalli al-Sha'rawi", "Ibn Hajar al-Asqalani", "Jalal al-Din al-Suyuti", "Al-Ghazali", "Al-Baghawi"),
  ...shia("Ali al-Sajjad", "Musa al-Kazim", "Ali al-Rida", "Muhammad al-Jawad", "Ali al-Hadi", "Hasan al-Askari",
    "Muhammad al-Mahdi", "Muhammad ibn Ya'qub al-Kulayni", "Al-Shaykh al-Saduq", "Shaykh Tusi", "Al-Shaykh al-Mufid",
    "Allamah Tabatabai", "Al-Tabarsi", "Mohammad-Baqer Majlesi", "Al-Sharif al-Radi", "Al-Sharif al-Murtada", "Al-Hilli",
    "Shaykh Baha'i", "Mulla Sadra", "Al-Hurr al-Amili", "Murtadha al-Ansari", "Abu al-Qasim al-Khoei"),
  // teachers in the chains of the recitations the app plays
  ...all("Ibn al-Jazari", "Al-Shatibi", "Qalun", "Ibn Kathir al-Makki", "Abu 'Amr ibn al-'Ala'", "Ibn Amir ad-Dimashqi", "Al-Kisa'i"),
];

/** the Prophet's life (seerah) */
export const SEERAH: CatalogEntry[] = all(
  "Muhammad", "Mawlid", "Year of the Elephant", "Muhammad's first revelation", "Cave of Hira", "Migration to Abyssinia",
  "Year of Sorrow", "Isra' and Mi'raj", "Second pledge at al-Aqabah", "Hijrah", "Constitution of Medina", "Battle of Badr",
  "Battle of Uhud", "Battle of the Trench", "Treaty of Hudaybiyyah", "Battle of Khaybar", "Conquest of Mecca",
  "Battle of Hunayn", "Expedition of Tabuk", "Farewell Pilgrimage", "Death of Muhammad", "Amina bint Wahb",
  "Abd al-Muttalib", "Abu Talib ibn Abd al-Muttalib", "Halima bint Abi Dhu'ayb", "Banu Hashim", "Quraysh", "Ansar (Islam)",
  "Muhajirun",
).concat(shia("Event of Ghadir Khumm", "Event of Mubahala"));

/** later Islamic history (events with a date on Wikidata feed the "this day" ordering) */
export const HISTORY: CatalogEntry[] = all(
  "Rashidun Caliphate", "Umayyad Caliphate", "Abbasid Caliphate", "House of Wisdom",
  "Battle of Karbala", "Islamic Golden Age", "Al-Andalus", "Emirate of Granada", "Fatimid Caliphate", "Ayyubid dynasty",
  "Siege of Jerusalem (1187)", "Mamluk Sultanate", "Siege of Baghdad (1258)", "Battle of Ain Jalut", "Ottoman Empire",
  "Fall of Constantinople", "Mughal Empire", "Safavid Iran", "Mali Empire", "Mansa Musa", "Ibn Battuta", "Timbuktu",
  "Rihla", "Ibn Khaldun", "Al-Khwarizmi", "Ibn Sina", "Ibn al-Haytham", "Al-Biruni", "Fatima al-Fihri",
  "Islamic calendar", "Hajj", "Ramadan", "Eid al-Fitr", "Eid al-Adha", "Laylat al-Qadr", "Ashura", "Uthmanic codex",
  "Topkapı manuscript", "Birmingham Quran manuscript", "Sana'a manuscript",
);

/** famous works (scholar-work) */
export const WORKS: CatalogEntry[] = [
  ...all("Kitab al-Ayn", "Tafsir al-Tabari", "Tafsir ibn Kathir", "Tafsir al-Qurtubi", "Tafsir al-Kabir",
    "Al-Kashshaf", "Muqaddimah"),
  ...sunni("Sahih al-Bukhari", "Sahih Muslim", "Muwatta Imam Malik", "Musnad Ahmad ibn Hanbal", "Sunan Abi Dawud", "Sunan al-Tirmidhi",
    "Sunan al-Nasa'i", "Sunan ibn Majah", "Al-Risala (al-Shafi'i book)", "The Revival of the Religious Sciences", "Riyad as-Salihin",
    "Al-Nawawi's Forty Hadith", "Fath al-Bari", "Tafsir al-Jalalayn", "Al-Shifa bi Ta'rif Huquq al-Mustafa"),
  ...shia("Kitab al-Kafi", "Man La Yahduruhu al-Faqih", "Tahdhib al-Ahkam", "Al-Istibsar", "Nahj al-Balagha", "Bihar al-Anwar",
    "Tafsir al-Mizan", "Al-Sahifa al-Sajjadiyya", "Majma' al-Bayan", "Wasa'il al-Shia"),
];
