// Sources of "Für Schwestern" (src/lib/sisters). Every position and fact in the texts points here. Opened and checked
// on 22.10.2026; sunnah.com numbers follow sunnah.com's numbering (checked against the fawazahmed0 hadith-api edition
// with the same numbering). Language-neutral: titles stay in the form the source publishes.
export type Source = { title: string; url?: string };

// Review state, like the carousels (needs_review): until the owner sets it, the pages show "Inhalt wird von Gelehrten
// geprüft". Set `needs_review: false` and `reviewedBy` only after a scholar has checked every text in every language.
export const SISTERS_REVIEW = { needs_review: true, reviewedBy: null as string | null, version: 1 };

export const SOURCES: Record<string, Source> = {
  // recitation, hayd and nifas
  arij: { title: "Arij Canada (Hanafi), via islamqa.org – Fatawa Hindiyya, Maraqi al-Falah", url: "https://islamqa.org/hanafi/arij-canada/230596/" },
  sgHanafi: { title: "Faraz Rabbani, SeekersGuidance: The Quran and menstruation (Hanafi)", url: "https://seekersguidance.org/uncategorized/the-quran-menstruation/" },
  sgShafii: { title: "Irshaad Sedick, SeekersGuidance (Shafi'i) – al-Nawawi, al-Majmu' 2/182; al-Khatib al-Shirbini, al-Iqna' 1/236–7", url: "https://seekersguidance.org/answers/purity-shafii-fiqh/can-a-menstruating-woman-read-and-touch-the-quran/" },
  ifta12343: { title: "Dar al-Ifta al-Misriyya, Fatwa 2841 (2016) – al-Dasuqi, Hashiya 1/174; al-Dardir, al-Sharh al-Kabir 1/125–6", url: "https://www.dar-alifta.org/ar/fatwa/details/12343" },
  muftiwp18: { title: "Mufti of the Federal Territories (Malaysia), Irsyad al-Fatwa 18 – al-Mardawi, al-Insaf; Ibn Taymiyya", url: "https://www.muftiwp.gov.my/en/artikel/irsyad-fatwa/irsyad-fatwa-umum-cat/2057-irsyad-al-fatwa-18-the-ruling-of-reciting-and-reviewing-one-s-memorization-of-the-quran-during-menstruation" },
  iqa2564: { title: "islamqa.info, Question 2564", url: "https://islamqa.info/en/answers/2564" },
  bham: { title: "Darul Iftaa Birmingham (Hanafi), via islamqa.org – Fatawa Alamgiri 1/238–9", url: "https://islamqa.org/hanafi/daruliftaa-birmingham/170727/can-women-touch-the-quran-on-their-periods/" },
  iqa106961: { title: "islamqa.info, Question 106961 (quoting al-Barrak)", url: "https://islamqa.info/en/answers/106961" },
  azaad: { title: "Darul Iftaa Azaadville (Hanafi), via islamqa.org", url: "https://islamqa.org/hanafi/darulifta-azaadville/164735/menstruating-women-touching-the-icons-on-a-quraan-app/" },
  ifta7815: { title: "Dar al-Ifta al-Misriyya, Fatwa 7815", url: "https://dar-alifta.org/en/fatwa/details/7815/" },
  sistani354: { title: "Ayatollah al-Sistani, Islamic Laws, rulings 354–355", url: "https://www.sistani.org/english/book/48/2163/" },
  sistani448: { title: "Ayatollah al-Sistani, Islamic Laws, ruling 448", url: "https://www.sistani.org/english/book/48/2172/" },
  sistani502: { title: "Ayatollah al-Sistani, Islamic Laws, ruling 502", url: "https://www.sistani.org/english/book/48/2181/" },
  // sajdat al-tilawa
  sgSajda: { title: "Tabraze Azam, SeekersGuidance (Hanafi) – Maraqi al-Falah; al-Hadiyya al-'Ala'iyya", url: "https://seekersguidance.org/answers/hanafi-fiqh/does-one-have-to-make-up-prostrations-of-recital-heard-during-menstruation/" },
  ifta24156: { title: "Dar al-Ifta al-Misriyya, Fatwa 24156 – al-Sarakhsi, Ibn Juzayy, al-Nawawi, al-Ruhaybani; Ibn Taymiyya, al-Shawkani", url: "https://dar-alifta.org/ar/fatwa/details/24156/" },
  sistani1079: { title: "Ayatollah al-Sistani, Islamic Laws, rulings 1079–1083", url: "https://www.sistani.org/english/book/48/2238/" },
  // hadith (collection and number only)
  bukhari297: { title: "Sahih al-Bukhari 297", url: "https://sunnah.com/bukhari:297" },
  muslim301: { title: "Sahih Muslim 301", url: "https://sunnah.com/muslim:301" },
  bukhari4986: { title: "Sahih al-Bukhari 4986", url: "https://sunnah.com/bukhari:4986" },
  bukhari4987: { title: "Sahih al-Bukhari 4987", url: "https://sunnah.com/bukhari:4987" },
  abudawud591: { title: "Sunan Abi Dawud 591", url: "https://sunnah.com/abudawud:591" },
  abudawud592: { title: "Sunan Abi Dawud 592", url: "https://sunnah.com/abudawud:592" },
  bukhari1643: { title: "Sahih al-Bukhari 1643", url: "https://sunnah.com/bukhari:1643" },
  muslim3018: { title: "Sahih Muslim 3018", url: "https://sunnah.com/muslim:3018" },
  abudawud4001: { title: "Sunan Abi Dawud 4001", url: "https://sunnah.com/abudawud:4001" },
  tirmidhi2927: { title: "Jami' al-Tirmidhi 2927", url: "https://sunnah.com/tirmidhi:2927" },
  // women scholars and reciters
  karima: { title: "Karima al-Marwaziyya – Wikipedia, citing C. Pavlovitch, Encyclopaedia of Islam THREE (2021)", url: "https://en.wikipedia.org/wiki/Karima_al-Marwaziyya" },
  samarqandi: { title: "islamweb.net: Fatima bint Muhammad al-Samarqandi", url: "https://islamweb.net/en/print.php?id=149454" },
  nadwi: { title: "Mohammad Akram Nadwi, Al-Muhaddithat: The Women Scholars in Islam, Oxford: Interface Publications, 2nd ed. 2013, ISBN 9780955454547", url: "https://catalogue.bnf.fr/ark:/12148/cb457736784" },
  mtq: { title: "International Quran Recital Competition (Malaysia) – Wikipedia, list of winners (Qari'ah)", url: "https://en.wikipedia.org/wiki/International_Quran_Recital_Competition" },
  aljazeera: { title: "Al Jazeera, 8 May 2021: Muslim women are reviving forgotten tradition of Quran recitation", url: "https://www.aljazeera.com/features/2021/5/8/muslim-women-are-reviving-forgotten-tradition-of-quran-recitation" },
};

/** app/website routes the section links to (the same paths on both) */
export const SISTERS_ROUTES = {
  page: "/sisters",
  understand: "/shams/tadabbur",
  words: "/vocab",
  tajweed: "/tajweed",
  makhraj: "/shams/makhraj",
  duas: "/duas",
  teacher: "/shams/teacher",
  circles: "/together/circles",
  verse: (ref: string) => { const [s, v] = ref.split(":"); return `/surah/${s}?v=${v}`; },
} as const;
