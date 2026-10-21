// Copied verbatim from the website (src/components/RadioProvider.tsx: stations; src/components/RadioPlayer.tsx: posters).
// Do not edit by hand: change the website and copy again, so app and website play exactly the same stations.
export type Mode = "full" | "range" | "single" | "random" | "list" | "juzday";
// mix: a different (random) reciter for every surah
export type Station = { id: string; mode: Mode; from: number; to: number; list?: number[]; mix?: boolean; group: "main" | "surah" | "theme" | "mix" };
export type Pos = { s: number; v: number };

export const STATIONS: Station[] = [
  { id: "quran", mode: "full", from: 1, to: 114, group: "main" },
  { id: "quranmix", mode: "full", from: 1, to: 114, mix: true, group: "mix" },
  { id: "random", mode: "random", from: 1, to: 114, group: "main" },
  { id: "randommix", mode: "random", from: 1, to: 114, mix: true, group: "mix" },
  { id: "juzamma", mode: "range", from: 78, to: 114, group: "main" },
  { id: "juzammamix", mode: "range", from: 78, to: 114, mix: true, group: "mix" },
  { id: "tabarak", mode: "range", from: 67, to: 77, group: "main" },
  { id: "juzday", mode: "juzday", from: 1, to: 114, group: "main" },
  { id: "juz28", mode: "range", from: 58, to: 66, group: "main" },
  { id: "kids", mode: "list", from: 1, to: 1, list: [1, 114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100, 99, 97, 95, 94, 93], group: "theme" },
  { id: "night", mode: "list", from: 32, to: 32, list: [32, 67, 112, 113, 114], group: "theme" },
  { id: "friday", mode: "list", from: 18, to: 18, list: [18, 62, 63, 87, 88], group: "theme" },
  { id: "prophets", mode: "list", from: 12, to: 12, list: [12, 19, 20, 21, 28, 71], group: "theme" },
  { id: "beloved", mode: "list", from: 36, to: 36, list: [36, 55, 56, 67, 18, 32, 48], group: "theme" },
  { id: "dhikr", mode: "list", from: 1, to: 1, list: [1, 2, 112, 113, 114], group: "theme" },
  // the early surahs in the order of revelation of the widespread Egyptian (Azhar) count
  { id: "revelation", mode: "list", from: 96, to: 96, list: [96, 68, 73, 74, 1, 111, 81, 87, 92, 89, 93, 94, 103, 100, 108, 102, 107, 109, 105, 113, 114, 112], group: "theme" },
  { id: "ramadan", mode: "list", from: 2, to: 2, list: [2, 97, 44], group: "theme" },
  { id: "comfort", mode: "list", from: 93, to: 93, list: [93, 94, 12], group: "theme" },
  { id: "kahf", mode: "single", from: 18, to: 18, group: "surah" },
  { id: "yasin", mode: "single", from: 36, to: 36, group: "surah" },
  { id: "rahman", mode: "single", from: 55, to: 55, group: "surah" },
  { id: "waqiah", mode: "single", from: 56, to: 56, group: "surah" },
  { id: "mulk", mode: "single", from: 67, to: 67, group: "surah" },
  { id: "baqarah", mode: "single", from: 2, to: 2, group: "surah" },
  { id: "maryam", mode: "single", from: 19, to: 19, group: "surah" },
  { id: "yusuf", mode: "single", from: 12, to: 12, group: "surah" },
  { id: "fath", mode: "single", from: 48, to: 48, group: "surah" },
  { id: "hujurat", mode: "single", from: 49, to: 49, group: "surah" },
  { id: "luqman", mode: "single", from: 31, to: 31, group: "surah" },
  { id: "insan", mode: "single", from: 76, to: 76, group: "surah" },
  { id: "muzzammil", mode: "single", from: 73, to: 73, group: "surah" },
  { id: "hashr", mode: "single", from: 59, to: 59, group: "surah" },
  { id: "taha", mode: "single", from: 20, to: 20, group: "surah" },
  { id: "sajdah", mode: "single", from: 32, to: 32, group: "surah" },
];

// jewel tones of Islamic art (emerald, lapis, garnet, Iznik turquoise, amber, aubergine, olive)
export const J = { emerald: "linear-gradient(165deg,#13644b 0%,#073024 55%,#04190f 100%)", lapis: "linear-gradient(165deg,#268468 0%,#134334 55%,#070f22 100%)", garnet: "linear-gradient(165deg,#7a5d24 0%,#392b0e 55%,#1a0509 100%)", turquoise: "linear-gradient(165deg,#0f6b6c 0%,#06393b 55%,#031b1c 100%)", amber: "linear-gradient(165deg,#7c5617 0%,#3b2707 55%,#1c1203 100%)", aubergine: "linear-gradient(165deg,#604d27 0%,#2f2510 55%,#110616 100%)", olive: "linear-gradient(165deg,#4f5a22 0%,#262c0d 55%,#111405 100%)" };
// station posters: calligraphy and colour per station
export const POSTER: Record<string, { ar: string; bg: string }> = {
  quran: { ar: "القرآن", bg: J.emerald },
  juzamma: { ar: "عمّ", bg: J.amber },
  kahf: { ar: "الكهف", bg: J.lapis },
  yasin: { ar: "يس", bg: J.garnet },
  rahman: { ar: "الرحمن", bg: J.turquoise },
  mulk: { ar: "الملك", bg: J.aubergine },
  random: { ar: "مفاجأة", bg: J.garnet },
  quranmix: { ar: "أصوات", bg: J.turquoise },
  randommix: { ar: "تنوع", bg: J.amber },
  juzammamix: { ar: "عمّ", bg: J.aubergine },
  tabarak: { ar: "تبارك", bg: J.lapis },
  kids: { ar: "أطفال", bg: J.olive },
  night: { ar: "الليل", bg: J.lapis },
  friday: { ar: "الجمعة", bg: J.amber },
  prophets: { ar: "الأنبياء", bg: J.garnet },
  beloved: { ar: "المحبوبة", bg: J.aubergine },
  dhikr: { ar: "الحفظ", bg: J.emerald },
  waqiah: { ar: "الواقعة", bg: J.turquoise },
  baqarah: { ar: "البقرة", bg: J.amber },
  maryam: { ar: "مريم", bg: J.aubergine },
  yusuf: { ar: "يوسف", bg: J.amber },
  juzday: { ar: "جزء", bg: J.emerald },
  juz28: { ar: "قد سمع", bg: J.lapis },
  revelation: { ar: "اقرأ", bg: J.olive },
  ramadan: { ar: "رمضان", bg: J.lapis },
  comfort: { ar: "الضحى", bg: J.amber },
  fath: { ar: "الفتح", bg: J.emerald },
  hujurat: { ar: "الحجرات", bg: J.olive },
  luqman: { ar: "لقمان", bg: J.garnet },
  insan: { ar: "الإنسان", bg: J.turquoise },
  muzzammil: { ar: "المزمل", bg: J.lapis },
  hashr: { ar: "الحشر", bg: J.garnet },
  taha: { ar: "طه", bg: J.aubergine },
  sajdah: { ar: "السجدة", bg: J.turquoise },
};
export const GROUPS = ["main", "mix", "theme", "surah"] as const;
