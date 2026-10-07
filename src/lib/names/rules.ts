import { NAMES, findName, hasArabic, isAbd, isEasy, lengthOf, letterOf, normArabic, normLatin, type BabyName, type Gender, type Lang, type Theme } from "./index";

// Knowledge base of the name finder: which names are never suggested, how names are scored for a family,
// which Hijri month links to which names, and which Quran verse belongs to each name.

// ---- never suggested ----
// Names that belong to Allah alone (only given with "Abd")
export const ALLAH_ONLY = ["الله", "الرحمن", "الخالق", "الرزاق", "القدوس", "الاحد", "الصمد", "الباري", "القيوم", "المهيمن", "المتكبر"].map(normArabic);
// Allowed second parts of "Abd …" names: names of Allah
export const ABD_ALLOWED = ["الله", "الرحمن", "الرحيم", "العزيز", "الملك", "الكريم", "الحميد", "القادر", "السلام", "الوهاب", "الغني", "اللطيف", "الهادي", "الباسط", "الواحد", "الفتاح", "المجيد", "الحي", "الودود", "الغفور", "القدوس", "الخالق", "الرزاق", "الصمد", "الاحد", "القيوم", "الحليم", "الحكيم", "العليم", "الجليل", "الجبار", "الرؤوف", "الباري", "المؤمن", "النور", "الحق", "الشكور", "التواب", "الكبير", "العلي", "الولي"].map(normArabic);
// Names with a bad meaning (examples; the data never contains them)
export const BAD = ["عاصيه", "حزن", "حرب", "مره", "كلب", "ظالم"].map(normArabic);

export function isAllowed(n: BabyName) {
  const a = normArabic(n.ar);
  if (ALLAH_ONLY.includes(a) || BAD.includes(a)) return false;
  if (a.startsWith("عبد") && !a.startsWith("عبيد")) return ABD_ALLOWED.includes(a.slice(3));
  return true;
}

// ---- Hijri month of birth → names connected to that month ----
export type MonthLink = { ids: string[]; themes: Theme[]; note: Record<Lang, string> };
export const MONTH_LINKS: Record<number, MonthLink> = {
  1: {
    ids: ["musa", "harun", "asiya", "abubakr", "asma", "suhayb"], themes: ["faith", "strength"],
    note: { de: "Muharram – Monat der Hidschra und von ʿAschura: dazu passen Namen aus der Geschichte von Musa und der Auswanderung.", en: "Muharram – the month of the Hijra and of Ashura: names from the story of Musa and the emigration fit well.", ar: "محرم شهر الهجرة وعاشوراء: تناسبه أسماء من قصة موسى عليه السلام والهجرة." },
  },
  3: {
    ids: ["muhammad", "ahmad", "mahmud", "mustafa", "amin", "bashir", "siraj", "munir", "hamid", "qasim", "amina", "halima", "khadija", "fatima", "zahra", "baraka", "shayma"], themes: ["faith", "light"],
    note: { de: "Rabiʿ al-Awwal – nach Ansicht der meisten Gelehrten der Geburtsmonat des Propheten ﷺ: dazu passen Namen, die mit ihm verbunden sind.", en: "Rabi' al-Awwal – according to most scholars the month of the Prophet's ﷺ birth: names connected to him fit well.", ar: "ربيع الأول، وهو عند أكثر العلماء شهر مولد النبي ﷺ: تناسبه أسماء مرتبطة به." },
  },
  7: {
    ids: ["isra", "sidra", "najm", "munir", "burhan", "aya"], themes: ["light", "faith"],
    note: { de: "Radschab – einer der heiligen Monate, mit dem viele die Nachtreise verbinden: dazu passen Namen von Licht und Himmel.", en: "Rajab – one of the sacred months, which many connect with the Night Journey: names of light and the heavens fit well.", ar: "رجب من الأشهر الحرم، ويربطه كثيرون بالإسراء والمعراج: تناسبه أسماء النور والسماء." },
  },
  9: {
    ids: ["ramadan", "nur", "huda", "furqan", "rayyan", "taqwa", "sakina", "sahar", "fajr", "aya", "bushra", "taha", "yasin", "munir", "siraj"], themes: ["light", "faith"],
    note: { de: "Ramadan – der Monat, in dem der Koran herabgesandt wurde (2:185): dazu passen Namen von Licht, Rechtleitung und Koran.", en: "Ramadan – the month in which the Quran was revealed (2:185): names of light, guidance and the Quran fit well.", ar: "رمضان الذي أُنزل فيه القرآن (البقرة: 185): تناسبه أسماء النور والهدى والقرآن." },
  },
  10: {
    ids: ["farah", "basma", "ibtisam", "hana", "saad", "said", "bushra", "naim", "ayman"], themes: ["joy"],
    note: { de: "Schawwal – der Monat des Fastenbrechenfests: dazu passen Namen voller Freude.", en: "Shawwal – the month of Eid al-Fitr: joyful names fit well.", ar: "شوال شهر عيد الفطر: تناسبه أسماء الفرح." },
  },
  11: {
    ids: ["salim", "salma", "salman", "sakina", "amina", "salima", "abdussalam"], themes: ["peace"],
    note: { de: "Dhul-Qaʿda – einer der heiligen Monate: dazu passen Namen des Friedens.", en: "Dhul-Qa'dah – one of the sacred months: names of peace fit well.", ar: "ذو القعدة من الأشهر الحرم: تناسبه أسماء السلام." },
  },
  12: {
    ids: ["ibrahim", "ismail", "hajar", "marwa", "safa", "khalil", "halim", "sara", "ishaq"], themes: ["faith"],
    note: { de: "Dhul-Hiddscha – Monat der Pilgerfahrt und des Opferfests: dazu passen Namen aus der Geschichte von Ibrahim, Ismail und Hadschar.", en: "Dhul-Hijjah – the month of Hajj and Eid al-Adha: names from the story of Ibrahim, Ismail and Hajar fit well.", ar: "ذو الحجة شهر الحج وعيد الأضحى: تناسبه أسماء من قصة إبراهيم وإسماعيل وهاجر." },
  },
};

// ---- the Quran verse for each name ----
// Names without their own verse: a verse with the same root, or with the meaning of the name
export const RELATED: Record<string, string> = {
  abdurrahman: "1:3", abdurrahim: "1:3", abdulaziz: "59:23", abdulmalik: "59:23", abdussalam: "59:23", abdulkarim: "82:6",
  abdulhamid: "31:26", abdulghani: "31:26", abdulqadir: "65:12", abdulwahhab: "3:8", abdullatif: "42:19", abdulhadi: "22:54",
  abdulbasit: "13:26", abdulwahid: "2:163", abdulfattah: "34:26", abdulmajid: "11:73", abdulhayy: "2:255", abdulwadud: "85:14", abdulghafur: "15:49",
  mustafa: "3:33", abubakr: "9:40", ali: "87:1", hasan: "2:201", husayn: "2:201", hassaan: "2:201", bilal: "62:9", saad: "11:108", talha: "56:29",
  muadh: "113:1", yasir: "94:5", salman: "10:25", tamim: "6:115", hakim: "2:269", asim: "3:103", isam: "3:103", faruq: "2:185", habib: "3:31",
  jalal: "55:27", mansur: "110:1", nasir: "110:1", mazin: "56:69", rayyan: "2:183", riyad: "42:22", tahir: "2:222", walid: "90:3", ziyad: "14:7",
  zayed: "14:7", adil: "16:90", anwar: "24:35", nuruddin: "24:35", shamsuddin: "91:1", hamid: "1:2", hamdan: "1:2", humaid: "1:2", labib: "3:190",
  malik: "3:26", mahdi: "1:6", mujahid: "29:69", nasim: "30:46", rafiq: "4:69", yamin: "56:27", muin: "1:5", obaid: "1:5", kerem: "17:70",
  jamal: "12:18", kamal: "6:115", zain: "49:7", zainulabidin: "49:7", majid: "11:73", salahuddin: "18:110",
  hajar: "2:158", hawwa: "2:35", aisha: "69:21", batul: "73:8", safiyya: "3:42", maymuna: "56:27", salma: "10:25", salima: "10:25", asma: "7:180",
  baraka: "7:96", jamila: "12:18", amina: "106:4", hana: "52:19", hiba: "3:8", layla: "97:1", safa: "2:158", wafa: "13:20",
  basma: "27:19", ibtisam: "27:19", habiba: "3:31", hayat: "16:97", kamila: "6:115", karima: "17:70", latifa: "42:19", malika: "3:26", munira: "24:35",
  naima: "82:13", rahima: "21:107", raja: "18:110", sabah: "81:18", widad: "19:96", yumna: "56:27", zakiyya: "91:9", hamida: "1:2", hasna: "2:201",
  tahira: "2:222", nurulayn: "24:35", sajida: "96:19", hira: "96:1", leen: "20:44", tuqa: "3:102", waad: "19:54", shahd: "16:69", hidaya: "1:6",
  alya: "87:1", zaina: "49:7", inshirah: "94:1", mahnoor: "10:5", elif: "2:1", zahra: "24:35",
};
// Last resort: a verse about the meaning of the name's first theme
export const THEME_VERSE: Record<Theme, string> = {
  faith: "49:7", light: "24:35", nature: "6:99", virtue: "68:4", strength: "3:139", peace: "13:28", knowledge: "20:114", beauty: "95:4", joy: "10:58", honour: "17:70",
};

export type VerseKind = "appears" | "about" | "root" | "theme";
export function verseFor(n: BabyName): { key: string; kind: VerseKind; theme?: Theme } {
  if (n.q) return { key: n.q, kind: n.o.includes("quran") ? "appears" : "about" };
  if (RELATED[n.id]) return { key: RELATED[n.id], kind: "root" };
  return { key: THEME_VERSE[n.t[0]], kind: "theme", theme: n.t[0] };
}

// ---- scoring ----
export type OriginPick = "quran" | "prophet" | "companion" | "arabic";
export type LetterPref = "any" | "same" | "diff";
export type FinderInput = {
  father: string; mother: string; family: string; siblings: string;
  themes: Theme[]; origins: OriginPick[]; maxLen: number; easy: boolean; letter: LetterPref;
  hijriMonth: number | null;
};

// Women around the prophets who count for "prophets and their families"
const PROPHET_FAMILY = ["maryam", "asiya", "hajar", "sara", "hawwa", "amina", "khadija"];

export const splitNames = (s: string) => s.split(/[,،;/]+|\s+und\s+|\s+and\s+/i).map((x) => x.trim()).filter(Boolean);

function matchesPick(n: BabyName, p: OriginPick) {
  if (p === "quran") return n.o.includes("quran");
  if (p === "prophet") return n.o.includes("prophet") || n.o.includes("ahl-al-bayt") || PROPHET_FAMILY.includes(n.id);
  if (p === "companion") return n.o.includes("sahabi") || n.o.includes("sahabiyya") || n.o.includes("ahl-al-bayt");
  return n.o.includes("arabic");
}

function typedKeys(typed: string[]) {
  const keys = new Set<string>();
  for (const t of typed) {
    const k = hasArabic(t) ? normArabic(t) : normLatin(t);
    if (k) keys.add(k);
    const known = findName(t);
    if (known) { keys.add(normArabic(known.ar)); known.tr.forEach((x) => keys.add(normLatin(x))); }
  }
  return keys;
}
const isTaken = (n: BabyName, taken: Set<string>) => taken.has(normArabic(n.ar)) || n.tr.some((x) => taken.has(normLatin(x)));

function firstLetters(typed: string[], l: Lang) {
  const out = new Set<string>();
  for (const t of typed) {
    const known = findName(t);
    if (known) out.add(letterOf(known, l));
    else if (l === "ar" && hasArabic(t)) out.add(normArabic(t).charAt(0));
    else if (l !== "ar" && !hasArabic(t)) out.add(normLatin(t).charAt(0).toUpperCase());
  }
  return out;
}

export type Scored = { n: BabyName; score: number; reasons: string[] };

// The best-matching names for one gender, already sorted; the finder picks randomly from the top of this list
export function rankNames(g: Gender, inp: FinderInput, l: Lang): Scored[] {
  const sibs = splitNames(inp.siblings);
  const taken = typedKeys([inp.father, inp.mother, ...sibs].filter(Boolean));
  const sibLetters = firstLetters(sibs, l);
  const month = inp.hijriMonth ? MONTH_LINKS[inp.hijriMonth] : undefined;
  const base = NAMES.filter((n) => n.g === g && isAllowed(n) && !isTaken(n, taken));

  // hard limits, relaxed when they leave too little to choose from
  let pool = base.filter((n) => (!inp.maxLen || lengthOf(n, l) <= inp.maxLen) && (!inp.easy || isEasy(n)));
  if (pool.length < 6) pool = base.filter((n) => !inp.maxLen || lengthOf(n, l) <= inp.maxLen);
  if (pool.length < 6) pool = base;

  const scored = pool.map((n) => {
    let score = 0;
    const reasons: string[] = [];
    const th = inp.themes.filter((x) => n.t.includes(x)).length;
    if (th) { score += 3 * th; reasons.push("theme"); }
    if (inp.origins.some((p) => matchesPick(n, p))) { score += 3; reasons.push("origin"); }
    if (month) {
      if (month.ids.includes(n.id)) { score += 4; reasons.push("month"); }
      score += month.themes.filter((x) => n.t.includes(x)).length * 0.5;
    }
    if (sibLetters.size && inp.letter !== "any") {
      const same = sibLetters.has(letterOf(n, l));
      if (inp.letter === "same" && same) { score += 3; reasons.push("letter"); }
      if (inp.letter === "diff" && same) score -= 4;
    }
    if (n.q) score += 0.5; // the name itself has a verse
    if (isAbd(n) && inp.themes.includes("faith")) score += 1;
    return { n, score, reasons };
  });
  return scored.sort((a, b) => b.score - a.score);
}

// Top of the ranking: everything close to the best score (at least 6 names, so that shuffling shows others)
export function bestPool(ranked: Scored[]) {
  if (!ranked.length) return [];
  const top = ranked[0].score;
  const close = ranked.filter((s) => s.score >= top - 2);
  return close.length >= 6 ? close : ranked.slice(0, 6);
}

// Random pick of k names, avoiding the ones shown last time when possible
export function pickRandom<T extends { n: BabyName }>(pool: T[], k: number, avoid: Set<string>, rnd = Math.random): T[] {
  const fresh = pool.filter((s) => !avoid.has(s.n.key));
  const src = fresh.length >= k ? fresh : pool;
  const a = [...src];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, k);
}
