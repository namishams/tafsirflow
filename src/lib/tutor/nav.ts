import type { Doc } from "./corpus";
import { VERSE_COUNTS } from "../counts";
import { fold } from "./text";

// "Find and open": Dalil and Hidaya open any place of the app or website without a model call. A fast route index
// from the app's and website's routes (with German and English words), the library's titles (courses, guides, Islam
// chapters, carousels, adab, sisters), the surah names, verse keys, hadith collections with numbers and Nahj
// al-Balagha sermons. The app opens the link with router.push (features/library/links.ts maps website paths), the
// website with a link; `appOnly` places exist only in the app (the website shows the card with a note).

export type NavHit = { title: string; desc: string; link: string; appOnly?: boolean; score: number };

/** transliterated surah names (same list as learn/garden/catalog.ts SURAHS) */
const SURAHS = ["Al-Fatihah", "Al-Baqarah", "Al Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha", "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takathur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"];

/** the app's and website's own places: link, title, words people use (German and English), app only */
const PLACES: [string, string, string, string, boolean?][] = [
  ["/wudu", "Wudu-Trainer", "wudu trainer waschung ablution gebetswaschung", "Die rituelle Waschung Schritt für Schritt üben."],
  ["/salah", "Gebets-Trainer", "salah gebet trainer prayer beten lernen", "Das Gebet Schritt für Schritt lernen."],
  ["/prayer", "Gebetszeiten", "gebetszeiten prayer times adhan", "Die Gebetszeiten für Ihren Ort."],
  ["/qibla", "Qibla", "qibla kompass richtung compass", "Die Gebetsrichtung finden.", true],
  ["/shams", "Shams-Methode", "shams methode method hifz auswendig", "Auswendiglernen mit der Shams-Methode."],
  ["/shams/wird", "Heutiger Wird", "wird heute today plan sabaq sabqi manzil", "Ihr Plan für heute."],
  ["/shams/makhraj", "Makhraj-Coach", "makhraj aussprache articulation buchstaben", "Die Aussprache der Buchstaben üben."],
  ["/shams/mutashabihat", "Mutashabihat", "mutashabihat ähnliche verse similar verses", "Ähnliche Verse unterscheiden."],
  ["/shams/adab", "Adab des Qurʾān-Trägers", "adab etikette etiquette halal haram erlaubt verboten sunna", "Die tägliche Sunna des Rezitators."],
  ["/tajweed", "Tajwid", "tajweed tajwid regeln rules", "Die Regeln der Rezitation."],
  ["/arabic", "Arabisch-Kurs", "arabisch arabic kurs course sprache", "Arabisch lesen und verstehen."],
  ["/courses", "Kurse", "kurse courses akademie academy lektionen", "Alle Kurse der Akademie."],
  ["/duas", "Bittgebete", "duas bittgebete dua sammlung", "Bittgebete aus Koran und Sunna."],
  ["/dua-generator", "Persönliche Dua", "persönliche dua personal dua", "Ihre persönliche Dua gestalten."],
  ["/names", "Die 99 Namen Allahs", "99 namen names allah asma husna", "Die schönsten Namen Allahs."],
  ["/mishary", "Mishary Alafasy", "mishary alafasy afasy rezitator reciter", "Rezitationen von Mishary Alafasy."],
  ["/reciters", "Rezitatoren", "rezitatoren reciters qari", "Alle Rezitatoren."],
  ["/radio", "Koran-Radio", "radio", "Koran-Radio hören."],
  ["/khatm", "Khatm-Plan", "khatm koran durchlesen read whole", "Den ganzen Koran lesen."],
  ["/stats", "Meine Statistik", "statistik statistics fortschritt progress", "Ihr Fortschritt."],
  ["/together", "Gemeinsam", "gemeinsam together freunde friends kreise circles liga league nachrichten messages", "Freunde, Lernkreise, Liga und Nachrichten."],
  ["/sticker-collection", "Sticker-Sammlung", "sticker laden shop sammlung collection stickerladen stickershop stickers", "Ihre Sticker und der Sticker-Laden.", true],
  ["/garden", "Garten", "garten garden baum tree", "Ihr Garten des Lernens."],
  ["/sisters", "Für Schwestern", "schwestern sisters menstruation hayd", "Hinweise für Schwestern."],
  ["/islam", "Islam verstehen", "islam verstehen understanding kapitel", "Alle Kapitel über den Islam."],
  ["/hadith", "Hadith-Sammlungen", "hadith sammlungen collections bukhari muslim", "Die Hadith-Sammlungen.", true],
  ["/nahj", "Nahj al-Balagha", "nahj balagha predigt sermon", "Predigten, Briefe und Aussprüche.", true],
  ["/vocab", "Koran-Wortschatz", "wortschatz vocab vocabulary wörter", "Die Wörter des Koran lernen."],
  ["/tests", "Prüfungen", "prüfungen tests exam", "Ihr Wissen prüfen."],
  ["/premium", "Pro", "pro premium abo subscription", "Pro freischalten."],
  ["/profile", "Profil und Einstellungen", "profil profile konto account einstellungen settings", "Ihr Konto."],
  ["/feed", "Entdecken", "feed entdecken discover karussell carousels", "Karussells und Beiträge."],
  ["/calendar", "Islamischer Kalender", "kalender calendar hijri", "Der islamische Kalender."],
  ["/haramain", "Haramain", "haramain mekka medina mecca", "Mekka und Medina."],
];

const SUNNI: Record<string, string> = { bukhari: "Sahih al-Bukhari", muslim: "Sahih Muslim", abudawud: "Sunan Abi Dawud", tirmidhi: "Jamiʿ at-Tirmidhi", nasai: "Sunan an-Nasaʾi", ibnmajah: "Sunan Ibn Majah", malik: "Muwatta Malik" };
const COLL = /\b(bukhari|buchari|muslim|abu ?dawud|abi ?dawud|tirmidhi|nasa'?i|ibn ?majah|malik|muwatta)\s*(?:nr\.?|no\.?|#)?\s*(\d{1,5})\b/i;
const collKey = (s: string) => { const f = s.toLowerCase().replace(/[\s']/g, ""); return f.startsWith("bu") ? "bukhari" : f.startsWith("abu") || f.startsWith("abi") ? "abudawud" : f.startsWith("nasa") ? "nasai" : f.startsWith("ibn") ? "ibnmajah" : f.startsWith("muwatta") ? "malik" : f; };

/** words that make a question a request to find or open something */
export const NAV_VERBS = /^\s*(öffne|oeffne|öffnen|zeig(e)?( mir)?|wo (ist|finde ich|sind)|bring mich zu|geh(e)? zu|open|show( me)?|where (is|can i find|are)|take me to|go to|find|finde|افتح|أرني|أين|aç|göster|nerede|ouvre|montre|où est|abre|muestra|dónde está|buka|tunjukkan|di mana|открой|покажи|где)\b/i;
const STOP = new Set(["meine", "mein", "meinen", "meiner", "die", "der", "das", "den", "und", "the", "and", "for", "von", "zum", "zur", "mir", "bitte", "please"]);
const QUESTION =/^\s*(was|wie|warum|wieso|wer|wann|welche\w*|ist|sind|darf|kann|soll|erkläre?|erklären|what|how|why|who|when|which|is|are|can|may|should|does|do|explain|tell|recite|lies|ما|كيف|لماذا|من|هل|ne|nasıl|neden|qu|comment|pourquoi|qué|cómo|por qué|apa|bagaimana|mengapa|что|как|почему)\b/i;
const OPEN =/^\s*(öffne|oeffne|öffnen|open|افتح|aç|ouvre|abre|buka|открой)\b/i;

const norm = (s: string) => fold(s).toLowerCase().replace(/['’ʿʾ`-]/g, "").replace(/\b(al|an|ar|as|at|ad|adh|ash|az)\s?(?=\w)/g, "").replace(/[^\p{L}\p{N}:]+/gu, " ").trim();

/** what the learner wants to open, or null when the text is not a request to find or open something */
export function navIntent(q: string, docs: Doc[] = []): { hits: NavHit[]; auto: boolean } | null {
  const text = String(q ?? "").trim();
  const verb = NAV_VERBS.test(text);
  const rest = text.replace(NAV_VERBS, "").replace(/^(mir|me|bitte|please|den|die|das|the|der)\s+/i, "").replace(/[?!.]+$/, "").trim();
  const short = rest.split(/\s+/).length <= 5;
  if (!verb && !short) return null;
  const r = norm(rest);
  const hits: NavHit[] = [];
  // a verse key ("Vers 2:255", "2:255")
  const vk = /\b(\d{1,3}):(\d{1,3})\b/.exec(rest);
  if (vk) { const s = Number(vk[1]), v = Number(vk[2]); if (s >= 1 && s <= 114 && v >= 1 && v <= VERSE_COUNTS[s - 1]) hits.push({ title: `${SURAHS[s - 1]} ${s}:${v}`, desc: "Vers im Koran lesen und hören", link: `/surah/${s}?v=${v}`, score: 10 }); }
  // a hadith by collection and number
  const hc = COLL.exec(rest);
  if (hc) { const c = collKey(hc[1]); if (SUNNI[c]) hits.push({ title: `${SUNNI[c]} ${hc[2]}`, desc: "Hadith in der Sammlung öffnen", link: `/hadith/${c}?n=${hc[2]}`, appOnly: true, score: 9 }); }
  // a Nahj al-Balagha sermon, letter or saying
  const nj = /\bnahj\b[^\d]*(predigt|sermon|khutba|brief|letter|ausspruch|saying|hikma)?\s*(\d{1,3})/i.exec(rest);
  if (nj) hits.push({ title: `Nahj al-Balagha ${nj[1] ? `${nj[1]} ` : ""}${nj[2]}`, desc: "Nahj al-Balagha öffnen", link: `/nahj?n=${nj[2]}${/brief|letter/i.test(nj[1] ?? "") ? "&t=letter" : /ausspruch|saying|hikma/i.test(nj[1] ?? "") ? "&t=saying" : ""}`, appOnly: true, score: 9 });
  // a surah by name or number ("Sure al-Mulk", "Surah 67")
  const sn = /\b(sure|surah|sura|suren|سورة|sûre|sourate)\s*(\d{1,3})\b/i.exec(rest);
  if (sn && Number(sn[2]) >= 1 && Number(sn[2]) <= 114) hits.push({ title: `Sure ${SURAHS[Number(sn[2]) - 1]}`, desc: "Sure lesen und hören", link: `/surah/${Number(sn[2])}`, score: 9 });
  if (!vk && !sn) SURAHS.forEach((name, i) => {
    const n = norm(name);
    if (n.length >= 3 && new RegExp(`(^|\\s)${n.replace(/\s+/g, "\\s?")}(\\s|$)`).test(r)) hits.push({ title: `Sure ${name}`, desc: "Sure lesen und hören", link: `/surah/${i + 1}`, score: /\b(sure|surah|sura|sourate)\b/i.test(rest) ? 10 : 6 + n.length / 10 });
  });
  // the app's places
  const words = r.split(" ").filter((w) => w.length >= 3 && !/^\d+$/.test(w) && !STOP.has(w));
  for (const [link, title, kw, desc, appOnly] of PLACES) {
    const keys = norm(`${title} ${kw}`).split(" ");
    const m = words.filter((w) => keys.some((k) => k === w || (w.length >= 5 && k.startsWith(w) && k.length - w.length <= 2) || (k.length >= 5 && w.startsWith(k) && w.length - k.length <= 2))).length;
    if (m) hits.push({ title, desc, link, appOnly, score: 4 + (4 * m) / Math.max(1, words.length) + (norm(title) === r ? 3 : 0) });
  }
  // the library's titles (courses, guides, Islam chapters, carousels, adab, sisters): one per page
  const seen = new Set<string>();
  for (const d of docs) {
    if (d.lang !== "de" && d.lang !== "en") continue;
    // a carousel is found by its own title, not by its series ("Surahs in slides", "Names of Allah")
    const parts = d.title.split(" – ");
    const base = d.kind === "carousel" ? parts[1] ?? parts[0] : parts[0];
    const key = `${d.link}`;
    if (seen.has(key)) continue;
    const t = norm(base);
    const tw = t.split(" ").filter((w) => w.length >= 3);
    if (!tw.length || !words.length) continue;
    const m = words.filter((w) => tw.some((k) => k === w || (w.length >= 5 && k.startsWith(w)))).length;
    const cover = m / Math.max(words.length, 1), within = m / tw.length;
    if (m && cover >= 0.6 && within >= 0.4) { seen.add(key); hits.push({ title: base, desc: d.text.replace(/\s+/g, " ").slice(0, 110), link: d.link, score: 4 + 3 * cover + 2 * within + (t === r ? 3 : 0) }); }
  }
  if (!hits.length) return null;
  // without a verb only a short name counts ("meine Nachrichten", "Vers 2:255", "Mishary"), never a question
  if (!verb && (/\?/.test(text) || QUESTION.test(text))) return null;
  const byLink = new Map<string, NavHit>();
  for (const h of hits) { const c = byLink.get(h.link); if (!c || h.score > c.score) byLink.set(h.link, h); }
  const sorted = [...byLink.values()].sort((a, b) => b.score - a.score).slice(0, 3);
  if (!verb && sorted[0].score < 4.5) return null;
  const confident = sorted[0].score >= 6 && (sorted.length === 1 || sorted[0].score - sorted[1].score >= 1.5);
  return { hits: confident ? [sorted[0]] : sorted, auto: confident && OPEN.test(text) };
}
