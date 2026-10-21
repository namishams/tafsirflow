// mirrors mobile/src/content/extra/catalog2.ts (copied for the website; keep both in step)
// More curated English Wikipedia titles (checked against the API). Encyclopedia articles only – no rulings, no quotes.
import { type CatalogEntry } from "./catalog";

const all = (...t: string[]): CatalogEntry[] => t.map((title) => ({ title, tradition: "all" }));
const shia = (...t: string[]): CatalogEntry[] => t.map((title) => ({ title, tradition: "shia" }));
const sunni = (...t: string[]): CatalogEntry[] => t.map((title) => ({ title, tradition: "sunni" }));

export const SALAH: CatalogEntry[] = [
  ...all("Salah", "Fajr prayer", "Dhuhr", "Asr prayer", "Maghrib prayer", "Isha prayer", "Rak'a", "Adhan", "Iqama", "Wudu",
    "Ghusl", "Tayammum", "Qibla", "Friday prayer", "Khutbah", "Tarawih", "Tahajjud", "Eid prayers", "Funeral prayer (Islam)",
    "Witr", "Sunnah prayer", "Nafl prayer", "Duha prayer", "Istikhara", "Sujud", "Ruku", "Takbir", "Tashahhud", "Taslim", "Qunut",
    "Prayer rug", "Misbaha", "Dhikr", "Dua", "Muezzin", "Imam", "Salat al-Kusuf"),
  ...shia("Turbah"),
];

export const PILLARS_FAITH: CatalogEntry[] = [
  ...all("Five Pillars of Islam", "Shahada", "Salah", "Zakat", "Sawm", "Hajj", "Iman (Islam)", "Tawhid", "Angels in Islam",
    "Islamic holy books", "Prophets and messengers in Islam", "Islamic eschatology", "Predestination in Islam", "Islam", "Ihsan",
    "Sadaqah", "Fasting in Islam", "Niyyah"),
    ...shia("Usul al-Din", "Imamate in Twelver doctrine", "Khums", "Tawalli", "Tabarri"),
];

export const HOLY_PLACES: CatalogEntry[] = [
  ...all("Kaaba", "Great Mosque of Mecca", "Black Stone", "Zamzam Well", "Maqam Ibrahim", "Safa and Marwa", "Mina, Saudi Arabia",
    "Mount Arafat", "Muzdalifah", "Prophet's Mosque", "Green Dome", "Quba Mosque", "Al-Baqi Cemetery", "Mount Uhud",
    "Cave of Hira", "Jabal al-Nour", "Cave of Thawr", "Al-Aqsa Mosque", "Dome of the Rock", "Ibrahimi Mosque", "Masjid al-Qiblatayn",
    "Hateem", "Jamarat Bridge", "Mosque of the Companions"),
  ...shia("Imam Husayn Shrine", "Imam Ali Shrine", "Imam Reza shrine", "Al-Askari Shrine", "Al-Kadhimiya Mosque", "Fatima Masumeh Shrine",
    "Al-Abbas Shrine", "Sayyida Zaynab Mosque", "Great Mosque of Kufa", "Wadi-us-Salaam"),
];

export const SAUDI_HERITAGE: CatalogEntry[] = all(
  "Mecca", "Medina", "Taif", "Badr, Saudi Arabia", "History of Mecca", "History of Medina", "Hejaz", "Jannat al-Mu'alla",
  "Mount Uhud", "Khaybar", "Tabuk, Saudi Arabia",
  "Abraj Al Bait", "Hejaz Railway", "Hegra (Mada'in Salih)", "Mount Thawr", "Jabal al-Rahmah", "Al-Kiswah",
  "Dumat al-Jandal", "Diriyah", "Historic Jeddah",
);

export const QURAN_FACTS: CatalogEntry[] = all(
  "Quran", "History of the Quran", "Revelation in Islam", "Wahy", "Laylat al-Qadr", "Uthmanic codex",
  "Qira'at", "Ahruf", "Tajwid", "Surah", "Meccan surah", "Medinan surah", "Juz'", "Hizb", "Manzil", "Ayah", "Sajdah", "Muqatta'at",
  "Basmala", "Al-Fatiha", "Tafsir", "Asbab al-nuzul", "Naskh (tafsir)", "Hafiz (Quran)", "Mushaf", "Rasm", "Arabic diacritics",
  "Quran translations", "Quran reading", "Sana'a manuscript", "Birmingham Quran manuscript",
  "Topkapı manuscript", "King Fahd Complex for the Printing of the Holy Quran", "Cairo edition",
);

export const UNSEEN: CatalogEntry[] = all(
  "Angels in Islam", "Gabriel", "Michael (archangel)", "Israfil", "Azrael", "Kiraman Katibin", "Munkar and Nakir",
  "Harut and Marut", "Jinn", "Iblis", "Shayatin", "Ghayb", "Barzakh", "Jannah", "Jahannam", "Sirat",
  "Day of Judgment in Islam", "Mizan", "Throne of God", "Kursi", "Sidrat al-Muntaha", "Al-Kawthar", "Ruh",
  "Qareen", "Dajjal", "Mahdi", "Gog and Magog in Islam",
);

export const ETHICS: CatalogEntry[] = all(
  "Akhlaq", "Islamic ethics", "Adab (Islam)", "Ihsan", "Taqwa", "Sabr", "Shukr", "Tawakkul", "Ikhlas", "Haya (Islam)", "Rahmah",
  "Adl", "Amanah", "Tawbah", "Zuhd", "Tazkiyah", "Nafs", "Riya", "Ghibah", "Hasad", "Islam and animals",
  "Hospitality", "Islamic environmentalism", "Waqf", "Ummah",
);

export const FAMILY: CatalogEntry[] = [
  ...all("Family tree of Muhammad", "Ahl al-Bayt", "Wives of Muhammad", "Children of Muhammad", "Khadija bint Khuwaylid", "Fatimah",
    "Ali", "Hasan ibn Ali", "Husayn ibn Ali", "Zaynab bint Ali", "Umm Kulthum bint Muhammad", "Ruqayya bint Muhammad",
    "Zainab bint Muhammad", "Ibrahim ibn Muhammad", "Qasim ibn Muhammad", "Abd Allah ibn Abd al-Muttalib", "Amina bint Wahb",
    "Abd al-Muttalib", "Abu Talib ibn Abd al-Muttalib", "Hamza ibn Abd al-Muttalib", "Al-Abbas ibn Abd al-Muttalib", "Ja'far ibn Abi Talib",
    "Fatima bint Asad", "Umm Salama", "Hafsa bint Umar", "Zaynab bint Jahsh", "Maymunah bint al-Harith", "Safiyya bint Huyayy",
    "Juwayriyya bint al-Harith", "Maria al-Qibtiyya", "Zayd ibn Harithah", "Umm Ayman", "Banu Hashim"),
  ...sunni("Aisha"),
  ...shia("Event of the Cloak", "Abbas ibn Ali", "Ali al-Akbar ibn Husayn", "Umm al-Banin"),
];

export const BATTLES: CatalogEntry[] = [
  ...all("Military career of Muhammad", "Battle of Badr", "Battle of Uhud", "Battle of the Trench", "Treaty of Hudaybiyyah", "Battle of Khaybar",
    "Conquest of Mecca", "Battle of Hunayn", "Siege of Ta'if", "Battle of Mu'tah", "Expedition of Tabuk", "Invasion of Banu Qaynuqa",
    "Invasion of Banu Nadir", "Battle of Hamra al-Asad", "Expedition of Dhat al-Riqa", "Expedition of Dumat al-Jandal", "Pledge of the Tree",
    "Expedition of Usama bin Zayd", "Battle of Waddan", "Invasion of Banu Mustaliq"),
];

export const FINANCE: CatalogEntry[] = all(
  "Islamic banking and finance", "Riba", "Gharar", "Maysir", "Murabaha", "Mudarabah", "Musharakah", "Ijara", "Sukuk", "Takaful",
  "Islamic economics", "Zakat", "Nisab", "Waqf", "Sadaqah", "Bayt al-mal", "Islamic Development Bank", "Hawala",
  "Islamic mortgage", "AAOIFI", "Islamic Financial Services Board",
  "Dinar", "Dirham",
);

export const HALAL: CatalogEntry[] = all(
  "Halal", "Haram", "Islamic dietary laws", "Dhabihah", "Halal certification", "Halal tourism", "Iftar", "Suhur",
  "Dates (fruit)", "Zamzam water", "Arab cuisine", "Ottoman cuisine", "Mughlai cuisine", "Malay cuisine", "Biryani", "Haleem",
  "Harira", "Qatayef", "Kunafa", "Ma'amoul", "Sheer khurma", "Ketupat", "Mansaf", "Kabsa", "Arabic coffee",
  "Makruh", "Mustahabb", "Mubah",
);

export const PHRASES: CatalogEntry[] = all(
  "Basmala", "Insha'Allah", "Masha'Allah", "Subhan Allah", "Alhamdulillah", "Takbir", "Astaghfirullah", "As-salamu alaykum",
  "Jazakallah", "Barakallah", "Inna lillahi wa inna ilayhi raji'un", "La hawla wa la quwwata illa billah", "Peace be upon him",
  "Tasbih", "Tahlil", "Ta'awwudh", "Hawqala", "Eid Mubarak", "Ramadan Mubarak", "Ya Allah", "Wallahi", "Names of God in Islam",
  "Salawat", "Amin", "Allah", "Islamic honorifics", "Shahada",
);
