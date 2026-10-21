import { readJSON, useStored, writeJSON } from "@/lib/store";
import { VERSE_COUNTS } from "@/web/counts";
import { TOTAL_VERSES, indexOf, juzOf, keyAt } from "@/web/quranIndex";
import { toHijri, todayUtc } from "@/web/hijri";
import { readTradition, showsShia } from "@/lib/tradition";
import { dayNum } from "@/features/feed/statsStore";

// The large sticker collection that feeds the garden: about 6,700 stickers in series (every verse, every surah and
// juz, the 99 names, prophets, months, letters, roots, tajweed rules, holy places, scholars, seasons). Nothing is
// stored per sticker except counts: verse ownership is a bitset, other ids a small count map. The art is generated on
// demand from the id (CatalogArt.tsx): frame × pattern × palette × rarity. No people, faces or living beings.
export const CATALOG_KEY = "qmc.stickers2";

export type Series = "ayah" | "surah" | "juz" | "names" | "prophets" | "months" | "letters" | "roots" | "tajweed" | "places" | "scholars" | "seasonal";
export const SERIES: Series[] = ["ayah", "surah", "juz", "names", "prophets", "months", "letters", "roots", "tajweed", "places", "scholars", "seasonal"];
export type Rarity = "common" | "rare" | "epic" | "legendary";
export const RARITY_GP: Record<Rarity, number> = { common: 6, rare: 15, epic: 35, legendary: 80 };

export const SURAHS = ["Al-Fatihah", "Al-Baqarah", "Al Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha", "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takathur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"];
const NAMES = "Ar-Rahman Ar-Rahim Al-Malik Al-Quddus As-Salam Al-Mu'min Al-Muhaymin Al-'Aziz Al-Jabbar Al-Mutakabbir Al-Khaliq Al-Bari' Al-Musawwir Al-Ghaffar Al-Qahhar Al-Wahhab Ar-Razzaq Al-Fattah Al-'Alim Al-Qabid Al-Basit Al-Khafid Ar-Rafi' Al-Mu'izz Al-Mudhill As-Sami' Al-Basir Al-Hakam Al-'Adl Al-Latif Al-Khabir Al-Halim Al-'Azim Al-Ghafur Ash-Shakur Al-'Aliyy Al-Kabir Al-Hafiz Al-Muqit Al-Hasib Al-Jalil Al-Karim Ar-Raqib Al-Mujib Al-Wasi' Al-Hakim Al-Wadud Al-Majid Al-Ba'ith Ash-Shahid Al-Haqq Al-Wakil Al-Qawiyy Al-Matin Al-Waliyy Al-Hamid Al-Muhsi Al-Mubdi' Al-Mu'id Al-Muhyi Al-Mumit Al-Hayy Al-Qayyum Al-Wajid Al-Majid Al-Wahid Al-Ahad As-Samad Al-Qadir Al-Muqtadir Al-Muqaddim Al-Mu'akhkhir Al-Awwal Al-Akhir Az-Zahir Al-Batin Al-Wali Al-Muta'ali Al-Barr At-Tawwab Al-Muntaqim Al-'Afuww Ar-Ra'uf Malik-ul-Mulk Dhul-Jalali-wal-Ikram Al-Muqsit Al-Jami' Al-Ghaniyy Al-Mughni Al-Mani' Ad-Darr An-Nafi' An-Nur Al-Hadi Al-Badi' Al-Baqi Al-Warith Ar-Rashid As-Sabur".split(" ");
const PROPHETS: [string, string][] = [["Adam", "آدم"], ["Idris", "إدريس"], ["Nuh", "نوح"], ["Hud", "هود"], ["Salih", "صالح"], ["Ibrahim", "إبراهيم"], ["Lut", "لوط"], ["Isma'il", "إسماعيل"], ["Ishaq", "إسحاق"], ["Ya'qub", "يعقوب"], ["Yusuf", "يوسف"], ["Ayyub", "أيوب"], ["Shu'ayb", "شعيب"], ["Musa", "موسى"], ["Harun", "هارون"], ["Dhul-Kifl", "ذو الكفل"], ["Dawud", "داود"], ["Sulayman", "سليمان"], ["Ilyas", "إلياس"], ["Al-Yasa'", "اليسع"], ["Yunus", "يونس"], ["Zakariyya", "زكريا"], ["Yahya", "يحيى"], ["'Isa", "عيسى"], ["Muhammad ﷺ", "محمد ﷺ"]];
const MONTHS: [string, string][] = [["Muharram", "محرم"], ["Safar", "صفر"], ["Rabi' al-Awwal", "ربيع الأول"], ["Rabi' ath-Thani", "ربيع الثاني"], ["Jumada al-Ula", "جمادى الأولى"], ["Jumada ath-Thaniyah", "جمادى الآخرة"], ["Rajab", "رجب"], ["Sha'ban", "شعبان"], ["Ramadan", "رمضان"], ["Shawwal", "شوال"], ["Dhul-Qa'dah", "ذو القعدة"], ["Dhul-Hijjah", "ذو الحجة"]];
const LETTERS = "ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي".split(" ");
const ROOTS = "ك ت ب|ع ل م|ق ر أ|ر ح م|س ل م|ص ب ر|ش ك ر|ذ ك ر|ه د ي|ن و ر|ح م د|ع ب د|ق و ل|خ ل ق|ر ز ق|غ ف ر|ت و ب|ص ل و|ز ك و|ص و م|ح ج ج|ج ن ن|ء م ن|ع ق ل|ف ك ر|س م ع|ب ص ر|ح ك م|ع د ل|ح ق ق".split("|");
const TAJWEED = ["Izhar", "Idgham", "Iqlab", "Ikhfa'", "Ghunnah", "Qalqalah", "Madd Tabi'i", "Madd Muttasil", "Madd Munfasil", "Madd Lazim", "Tafkhim", "Tarqiq", "Lam Shamsiyyah", "Lam Qamariyyah", "Waqf", "Hamzat al-Wasl"];
const PLACES = ["Al-Ka'bah", "Al-Masjid an-Nabawi", "Al-Masjid al-Aqsa", "Jabal an-Nur", "Ghar Hira'", "Ghar Thawr", "'Arafat", "Muzdalifah", "Mina", "Masjid Quba'", "Zamzam", "As-Safa wa-l-Marwah"];
const SCHOLARS = ["Al-Bukhari", "Muslim", "Abu Hanifah", "Malik", "Ash-Shafi'i", "Ahmad ibn Hanbal", "At-Tabari", "Ibn Kathir", "Al-Qurtubi", "An-Nawawi", "Al-Ghazali", "Ja'far as-Sadiq"];
const SEASONAL = [...Array.from({ length: 30 }, (_, i) => `ramadan-${i + 1}`), ...[21, 23, 25, 27, 29].map((n) => `qadr-${n}`), "ramadan-lantern", "ramadan-garland", "iftar-dates", "suhoor-moon",
  "eid-fitr", "eid-adha", ...Array.from({ length: 10 }, (_, i) => `dhulhijjah-${i + 1}`), "laylat-qadr", "arafah", "jumuah", "hijri-new-year", "ashura", "ghadir"];
/** the Ramadan stickers that only drop during Ramadan (by chance, while learning) */
const RAMADAN_RARE = ["ramadan-lantern", "ramadan-garland", "iftar-dates", "suhoor-moon"];
const SHIA_ONLY = new Set(["ghadir"]);

export type CatItem = { id: string; series: Series; idx: number; label: string; sub?: string; ar?: string };
/** the size of each series (ayah is generated on demand, never as a list in memory) */
export const SERIES_SIZE: Record<Series, number> = { ayah: TOTAL_VERSES, surah: 114, juz: 30, names: NAMES.length, prophets: PROPHETS.length, months: 12, letters: LETTERS.length, roots: ROOTS.length, tajweed: TAJWEED.length, places: PLACES.length, scholars: SCHOLARS.length, seasonal: SEASONAL.length };
export const CATALOG_SIZE = SERIES.reduce((a, s) => a + SERIES_SIZE[s], 0);

export function itemAt(series: Series, i: number): CatItem {
  switch (series) {
    case "ayah": { const { s, v } = keyAt(i); return { id: `a:${s}:${v}`, series, idx: i, label: `${s}:${v}`, sub: SURAHS[s - 1] }; }
    case "surah": return { id: `s:${i + 1}`, series, idx: i, label: SURAHS[i], sub: String(i + 1) };
    case "juz": return { id: `j:${i + 1}`, series, idx: i, label: `Juz ${i + 1}`, ar: `${i + 1}` };
    case "names": return { id: `n:${i + 1}`, series, idx: i, label: NAMES[i], sub: String(i + 1) };
    case "prophets": return { id: `p:${i + 1}`, series, idx: i, label: PROPHETS[i][0], ar: PROPHETS[i][1] };
    case "months": return { id: `m:${i + 1}`, series, idx: i, label: MONTHS[i][0], ar: MONTHS[i][1] };
    case "letters": return { id: `l:${i + 1}`, series, idx: i, label: LETTERS[i], ar: LETTERS[i] };
    case "roots": return { id: `r:${i + 1}`, series, idx: i, label: ROOTS[i].replace(/ /g, "-"), ar: ROOTS[i] };
    case "tajweed": return { id: `t:${i + 1}`, series, idx: i, label: TAJWEED[i] };
    case "places": return { id: `h:${i + 1}`, series, idx: i, label: PLACES[i] };
    case "scholars": return { id: `c:${i + 1}`, series, idx: i, label: SCHOLARS[i] };
    case "seasonal": return { id: `e:${SEASONAL[i]}`, series, idx: i, label: SEASONAL[i] };
  }
}
const PREFIX: Record<string, Series> = { a: "ayah", s: "surah", j: "juz", n: "names", p: "prophets", m: "months", l: "letters", r: "roots", t: "tajweed", h: "places", c: "scholars", e: "seasonal" };
export function itemById(id: string): CatItem | null {
  const [p, a, b] = id.split(":");
  const series = PREFIX[p];
  if (!series) return null;
  if (series === "ayah") { const s = Number(a), v = Number(b); if (!(s >= 1 && s <= 114 && v >= 1 && v <= VERSE_COUNTS[s - 1])) return null; return itemAt("ayah", indexOf(s, v)); }
  if (series === "seasonal") { const i = SEASONAL.indexOf(a); return i < 0 ? null : itemAt("seasonal", i); }
  const i = Number(a) - 1;
  return i >= 0 && i < SERIES_SIZE[series] ? itemAt(series, i) : null;
}
export const visibleSeasonal = (shia: boolean) => SEASONAL.filter((s) => shia || !SHIA_ONLY.has(s));

export const hashId = (x: string) => { let h = 2166136261; for (let i = 0; i < x.length; i++) h = Math.imul(h ^ x.charCodeAt(i), 16777619); return h >>> 0; };
const LEGENDARY = new Set(["e:qadr-21", "e:qadr-23", "e:qadr-25", "e:qadr-27", "e:qadr-29", "e:ramadan-garland", "a:1:1", "a:2:255", "a:112:1", "a:36:1", "a:55:13", "a:24:35", "s:1", "s:36", "s:112", "n:1", "p:25", "h:1", "e:laylat-qadr", "e:eid-fitr", "e:eid-adha", "m:9"]);
export function rarityOf(id: string): Rarity {
  if (LEGENDARY.has(id)) return "legendary";
  const r = hashId(id) % 100;
  return r < 2 ? "legendary" : r < 10 ? "epic" : r < 30 ? "rare" : "common";
}

// ---------- storage: verse bitset + counts ----------
type Cat = { friday?: number; ad?: { d: number; n: Record<string, number> }; b: string; c: Record<string, number>; d: Record<string, number>; gv: string[]; done: string[]; pack: number; month: string; at: number };
const empty = (): Cat => ({ b: "", c: {}, d: {}, gv: [], done: [], pack: 0, month: "", at: 0 });
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
let bits: Uint8Array | null = null;
let cache: Cat | null = null;
function c(): Cat {
  if (!cache) { const r = readJSON<Partial<Cat>>(CATALOG_KEY, {}); cache = { ...empty(), ...r, c: r.c ?? {}, d: r.d ?? {}, gv: r.gv ?? [], done: r.done ?? [] }; bits = null; }
  return cache;
}
const nBytes = Math.ceil(TOTAL_VERSES / 6);
function verseBits(): Uint8Array {
  if (bits) return bits;
  const s = c().b; bits = new Uint8Array(nBytes);
  for (let i = 0; i < Math.min(s.length, nBytes); i++) bits[i] = Math.max(0, B64.indexOf(s[i]));
  return bits;
}
function saveBits() { const b = verseBits(); let s = ""; let last = 0; for (let i = 0; i < b.length; i++) if (b[i]) last = i + 1; for (let i = 0; i < last; i++) s += B64[b[i]]; c().b = s; }
const hasVerse = (i: number) => (verseBits()[Math.floor(i / 6)] >> (i % 6)) & 1;
function setVerse(i: number) { const b = verseBits(); b[Math.floor(i / 6)] |= 1 << (i % 6); }
function save() { c().at = Date.now(); writeJSON(CATALOG_KEY, c()); }
export const reloadCatalog = () => { cache = null; bits = null; };
export function useCatalog(): Cat { useStored(CATALOG_KEY, {}); return c(); }

/** copies owned (0 = not collected); duplicates = copies - 1 */
export function countOf(id: string): number {
  const s = c();
  if (id.startsWith("a:")) { const it = itemById(id); if (!it) return 0; return hasVerse(it.idx) ? 1 + (s.d[id] ?? 0) : 0; }
  return s.c[id] ?? 0;
}
export const isGiven = (id: string) => c().gv.includes(id);
export function seriesOwned(series: Series): number {
  if (series === "ayah") { let n = 0; const b = verseBits(); for (let i = 0; i < b.length; i++) { let x = b[i]; while (x) { n += x & 1; x >>= 1; } } return n; }
  let n = 0; const size = SERIES_SIZE[series];
  for (let i = 0; i < size; i++) if ((c().c[itemAt(series, i).id] ?? 0) > 0) n++;
  return n;
}
export const totalOwned = () => SERIES.reduce((a, s) => a + seriesOwned(s), 0);

// ---------- drops ----------
export type Drop = { id: string; fresh: boolean };
const listeners = new Set<(d: Drop[], why: string) => void>();
export const onDrops = (f: (d: Drop[], why: string) => void) => { listeners.add(f); return () => { listeners.delete(f); }; };
function add(id: string): Drop | null {
  const it = itemById(id);
  if (!it) return null;
  const s = c();
  let fresh: boolean;
  if (it.series === "ayah") { fresh = !hasVerse(it.idx); if (fresh) setVerse(it.idx); else s.d[id] = Math.min(99, (s.d[id] ?? 0) + 1); }
  else { fresh = !s.c[id]; s.c[id] = Math.min(99, (s.c[id] ?? 0) + 1); }
  return { id, fresh };
}
function commit(drops: Drop[], why: string) {
  if (!drops.length) return drops;
  if (drops.some((d) => d.id.startsWith("a:"))) { saveBits(); deriveFromVerses(drops); }
  save();
  setTimeout(() => listeners.forEach((f) => f(drops, why)), 0);
  return drops;
}
/** surah and juz stickers follow from collecting all of their verses */
function deriveFromVerses(drops: Drop[]) {
  const s = c();
  for (const d of [...drops]) {
    const it = itemById(d.id);
    if (!it || it.series !== "ayah") continue;
    const sur = Number(d.id.split(":")[1]);
    if (!s.c[`s:${sur}`]) { let all = true; for (let v = 1; v <= VERSE_COUNTS[sur - 1] && all; v++) all = !!hasVerse(indexOf(sur, v)); if (all) { const x = add(`s:${sur}`); if (x) drops.push(x); } }
    const j = juzOf(it.idx);
    if (!s.c[`j:${j}`]) { let all = true; for (let i = 0; i < TOTAL_VERSES && all; i++) if (juzOf(i) === j && !hasVerse(i)) all = false; if (all) { const x = add(`j:${j}`); if (x) drops.push(x); } }
  }
}
/** a verse was learned or heard (Shams Method, reader): its own sticker */
export function dropVerse(surah: number, verse: number): Drop[] { const d = add(`a:${surah}:${verse}`); return commit(d ? [d] : [], "verse"); }

/** a pack: n stickers, mostly unowned ones, from the open series (not surah/juz, those are earned) */
const PACK_SERIES: Series[] = ["ayah", "ayah", "ayah", "names", "prophets", "letters", "roots", "tajweed", "places", "scholars", "names", "letters"];
function rand(seed: number) { let x = seed >>> 0 || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 100000) / 100000; }; }
export function openPack(n: number, why: "daily" | "quest" | "harvest"): Drop[] {
  const r = rand(Date.now() ^ hashId(why));
  const out: Drop[] = [];
  for (let k = 0; k < n; k++) {
    const series = PACK_SERIES[Math.floor(r() * PACK_SERIES.length)];
    let id = itemAt(series, Math.floor(r() * SERIES_SIZE[series])).id;
    // two chances to find a missing one, then a duplicate is fine (they feed the tree)
    for (let t = 0; t < 2 && countOf(id) > 0; t++) id = itemAt(series, Math.floor(r() * SERIES_SIZE[series])).id;
    const d = add(id); if (d) out.push(d);
  }
  return commit(out, why);
}
export const dailyPackReady = () => c().pack !== dayNum();
export function openDailyPack(): Drop[] { if (!dailyPackReady()) return []; c().pack = dayNum(); return openPack(3, "daily"); }

/** seasonal and month stickers on the day they belong to (called on app start / garden tick) */
export function seasonalDrops(): Drop[] {
  const s = c();
  const out: Drop[] = [];
  try {
    const h = toHijri(todayUtc());
    const mk = `${h.y}-${h.m}`;
    if (s.month !== mk) { s.month = mk; const d = add(`m:${h.m}`); if (d) out.push(d); }
    const once = (id: string) => { if (!s.c[id]) { const d = add(id); if (d) out.push(d); } };
    if (h.m === 9) once(`e:ramadan-${h.d}`);
    if (h.m === 9 && h.d >= 21 && h.d % 2 === 1) { once("e:laylat-qadr"); once(`e:qadr-${h.d}`); }
    if (h.m === 12 && h.d <= 10) once(`e:dhulhijjah-${h.d}`);
    if (new Date().getDay() === 5 && s.friday !== dayNum()) { s.friday = dayNum(); const d = add("e:jumuah"); if (d) out.push(d); }
    if (h.m === 10 && h.d <= 3) once("e:eid-fitr");
    if (h.m === 12 && h.d === 9) once("e:arafah");
    if (h.m === 12 && h.d >= 10 && h.d <= 13) once("e:eid-adha");
    if (h.m === 1 && h.d <= 3) once("e:hijri-new-year");
    if (h.m === 1 && (h.d === 9 || h.d === 10)) once("e:ashura");
    if (h.m === 12 && h.d === 18 && showsShia(readTradition())) once("e:ghadir");
  } catch { /* calendar unavailable */ }
  return commit(out, "season");
}
/** the names of Allah the feed has shown (gamify.names: 0-based indices) */
export function syncNames(seen: number[]): Drop[] {
  const out: Drop[] = [];
  for (const i of seen) { const n = i + 1; if (n >= 1 && n <= NAMES.length && !c().c[`n:${n}`]) { const d = add(`n:${n}`); if (d) out.push(d); } }
  return commit(out, "names");
}

/** uses one copy for the tree: a duplicate, or (unique) the only copy, which stays in the album marked as given */
export function spendSticker(id: string, unique: boolean): boolean {
  const s = c();
  const it = itemById(id);
  if (!it) return false;
  const n = countOf(id);
  if (unique) { if (n < 1 || s.gv.includes(id)) return false; s.gv = [...s.gv, id].slice(-2000); save(); return true; }
  if (n < 2) return false;
  if (it.series === "ayah") { if ((s.d[id] ?? 0) > 1) s.d[id]--; else delete s.d[id]; }
  else s.c[id] = n - 1;
  save();
  return true;
}
/** ids with duplicates (for the gift sheet), bounded */
export function duplicates(limit = 300): string[] {
  const s = c();
  return [...Object.entries(s.c).filter(([, n]) => n > 1).map(([k]) => k), ...Object.keys(s.d).filter((k) => (s.d[k] ?? 0) > 0)].slice(0, limit);
}

/** series finished for the first time: returns them once, marked so the reward is given only once */
export function newlyCompleted(): Series[] {
  const s = c();
  const out: Series[] = [];
  for (const se of SERIES) {
    if (s.done.includes(se)) continue;
    const need = se === "seasonal" ? visibleSeasonal(showsShia(readTradition())).length : SERIES_SIZE[se];
    if (seriesOwned(se) >= need) { s.done.push(se); out.push(se); }
  }
  if (out.length) save();
  return out;
}
export const completionGp = (se: Series) => Math.min(1500, 120 + SERIES_SIZE[se] * 4);

// ---------- account sync: union of verse bits, max counts ----------
export function mergeCatalog(a: Cat | undefined, b: Cat | undefined): Cat | undefined {
  if (!a || !b) return a ?? b;
  const len = Math.max(a.b?.length ?? 0, b.b?.length ?? 0);
  let bs = "";
  for (let i = 0; i < len; i++) bs += B64[Math.max(0, B64.indexOf(a.b?.[i] ?? "A")) | Math.max(0, B64.indexOf(b.b?.[i] ?? "A"))];
  const mx = (x: Record<string, number> = {}, y: Record<string, number> = {}) => { const o = { ...y }; for (const [k, v] of Object.entries(x)) o[k] = Math.max(o[k] ?? 0, v); return o; };
  return { ...empty(), ...b, ...a, b: bs, c: mx(a.c, b.c), d: mx(a.d, b.d), gv: Array.from(new Set([...(a.gv ?? []), ...(b.gv ?? [])])).slice(-2000), done: Array.from(new Set([...(a.done ?? []), ...(b.done ?? [])])), pack: Math.max(a.pack ?? 0, b.pack ?? 0), at: Math.max(a.at ?? 0, b.at ?? 0) };
}

// ---------- drops for every activity ----------
// Each activity has a chance to drop a sticker of its series (at most 3 drops per activity and day). The rarity of a
// sticker is fixed by its id: about 70 % common, 20 % rare, 8 % epic, 2 % legendary. Packs are only earned, never sold.
export type Act = "listen" | "verse" | "shams" | "lesson" | "quiz" | "cards" | "wudu" | "hadith" | "dua" | "names" | "holy" | "seerah" | "feed" | "share" | "prayer" | "reciter";
export const ACT_SERIES: Record<Act, Series[]> = {
  listen: ["ayah"], verse: ["ayah"], shams: ["ayah", "tajweed"], lesson: ["letters", "roots"], quiz: ["tajweed"], cards: ["roots", "letters"], wudu: ["places"],
  hadith: ["scholars"], dua: ["names"], names: ["names"], holy: ["places"], seerah: ["prophets"], feed: ["ayah", "names", "prophets"], share: ["places", "months"], prayer: ["months", "places"], reciter: ["ayah", "tajweed"],
};
export const ACT_CHANCE: Record<Act, number> = { listen: 0.15, verse: 0.12, shams: 0.35, lesson: 0.5, quiz: 0.4, cards: 0.1, wudu: 0.5, hadith: 0.2, dua: 0.2, names: 0.25, holy: 0.25, seerah: 0.25, feed: 0.04, share: 0.3, prayer: 0.5, reciter: 0.3 };
export const RARITY_ODDS: [Rarity, number][] = [["common", 70], ["rare", 20], ["epic", 8], ["legendary", 2]];
export function activityDrops(events: Partial<Record<Act, number>>, ramadan: boolean): Drop[] {
  const s = c(), d = dayNum();
  if (s.ad?.d !== d) s.ad = { d, n: {} };
  const out: Drop[] = [];
  for (const [act, times] of Object.entries(events) as [Act, number][]) {
    for (let k = 0; k < Math.min(times ?? 0, 20); k++) {
      if ((s.ad.n[act] ?? 0) >= 3) break;
      if (Math.random() >= ACT_CHANCE[act]) continue;
      const pool = ACT_SERIES[act], se = pool[Math.floor(Math.random() * pool.length)];
      let id = itemAt(se, Math.floor(Math.random() * SERIES_SIZE[se])).id;
      if (countOf(id) > 0) id = itemAt(se, Math.floor(Math.random() * SERIES_SIZE[se])).id;
      s.ad.n[act] = (s.ad.n[act] ?? 0) + 1;
      const x = add(id); if (x) out.push(x);
    }
  }
  // Ramadan-only rare stickers: a small chance with any learning during Ramadan
  if (ramadan && out.length && Math.random() < 0.2) { const x = add(`e:${RAMADAN_RARE[Math.floor(Math.random() * RAMADAN_RARE.length)]}`); if (x) out.push(x); }
  return commit(out, "activity");
}
/** all 30 Ramadan days collected (the Ramadan completion reward) */
export const ramadanComplete = () => Array.from({ length: 30 }, (_, i) => `e:ramadan-${i + 1}`).every((id) => (c().c[id] ?? 0) > 0);
