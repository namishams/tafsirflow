import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { names as namesDoc } from "@/lib/islam/names";
import { stickerSvg, type Motif, type Script, type Shape, type StickerSpec, type Tone } from "./art";
import { STICKER_PACKS, stickerArt } from "@/lib/stickerArt";
import { artSvg } from "@/lib/stickerArt/render";

// Everything sold in the app besides Pro, in one place (owner 22.10.2026). The website stays free; these are
// app-only. No randomness anywhere: every pack shows exactly which stickers it holds before it is bought, and rare
// stickers are rare because they are exclusive (and numbered editions with a fixed total stated upfront), never by chance.
// Prices are set only by the owner in App Store Connect; the app shows the store's price and nothing before it.
export const APP = "com.quranmasterclass.app";
/** App Store product ids allow only letters, digits, underscores and periods: slugs use "_" there instead of "-" */
export const pid = (slug: string) => slug.replace(/-/g, "_");

// ---------- single courses (non-consumable; the first FREE_LEVELS levels are free for everyone) ----------
export const FREE_LEVELS = 3;
export const COURSE_SLUGS = ["arabic", "islam", "prophet-stories", "halal-haram", "exams"] as const;
export type CourseSlug = (typeof COURSE_SLUGS)[number];
export const courseProduct = (slug: CourseSlug) => `${APP}.course.${pid(slug)}`;

// ---------- avatar frames (non-consumable); "collector" is not sold: it is the reward for a completed album ----------
export const FRAME_SLUGS = ["emerald", "gold-arabesque", "night-sky", "haramain-arch", "rose-garden"] as const;
export const REWARD_FRAME = "collector";
export const frameProduct = (slug: string) => `${APP}.frame.${pid(slug)}`;

// ---------- sticker packs ----------
export type Season = "ramadan" | "eid" | "hajj" | "muharram";
export type PackDef = {
  slug: string; order: number;
  /** titles: en/de/ar here; the app has all 14 languages for the built-in packs */
  title: { en: string; de: string; ar: string } & Record<string, string>;
  /** monthly Pro pack rotation: only the regular packs take part */
  rotation: boolean;
  season?: Season;
  /** shown only to learners who chose this tradition (Muharram remembrance: Shia) */
  tradition?: "shia";
  /** featured first for this identity (everyone can see and buy it) */
  featured?: "sister";
  /** placeholder art (generated, art.ts) for packs without drawn art */
  stickers: StickerSpec[];
  /** the drawn art (src/lib/stickerArt) by sticker id; when set it replaces `stickers` */
  art?: string[];
};
export const packProduct = (slug: string) => `${APP}.stickers.${pid(slug)}`;
/** the same pack bought for someone else (consumable: one gift per purchase, sent through the messenger) */
export const giftProduct = (slug: string) => `${APP}.gift.stickers.${pid(slug)}`;
export const BUNDLE_PRODUCT = `${APP}.stickers.all`;

const S = (pack: string, list: [Motif, string, Tone, Shape, Partial<StickerSpec>?][]): StickerSpec[] =>
  list.map(([motif, ar, tone, shape, more], i) => ({ id: `${pack}-${String(i + 1).padStart(2, "0")}`, motif, ar, tone, shape, ...more }));
const W = (script: Script) => ({ script, sacred: true });

// store packs made of the drawn art: whole art packs or chosen subsets (an art sticker may sit in several packs;
// owning any of them lets it be placed). Packs without matching art keep the generated placeholder art:
// muharram, asma-ul-husna, strong-women.
const ids = (pack: string) => STICKER_PACKS.find((p) => p.id === pack)?.stickers.map((s) => s.id) ?? [];
const ART = {
  ramadan: ["halbmond-juwelen", "laterne-gold", "laterne-haengend", "laterne-smaragd", "dattel-rispe", "dattel-gold", "dallah", "kalligrafie-ramadan-kareem", "mushaf", "misbaha", "juwelen-stern", "rehal"],
  haramain: ["kaaba", "gruene-kuppel", "aqsa-kuppel", "mihrab", "maschrabiyya", "laterne-gold", "mushaf", "rehal", "misbaha", "taube", "dattel-rispe", "girih-stern"],
  eid: ["laterne-haengend", "laterne-smaragd", "juwelen-laterne", "juwelen-stern", "halbmond-juwelen", "goldband-schleife", "goldband-girlande", "kalligrafie-eid-mubarak", "dallah", "dattel-gold", "granatapfel", "bluete-rosa"],
  hajj: ["kaaba", "gruene-kuppel", "mihrab", "misbaha", "rehal", "dattel-rispe", "taube", "laterne-gold", "girih-stern", "dallah", "mushaf", "maschrabiyya"],
  rose: ["damaszener-rose", "rosenknospe", "jasmin", "jasmin-kranz", "attar-flakon", "bluete-rosa", "bluete-weiss", "granatapfel", "wiedehopf", "goldband-schleife", "henna-mandala", "perlenherz"],
  hijab: ["khimar", "perlen-ohrring", "perlenherz", "halbmond-rosegold", "laterne-rosegold", "jasmin-kranz", "damaszener-rose", "attar-flakon", "rosenknospe", "perle-weiss", "goldband-schleife", "maschrabiyya"],
  henna: ["henna-paisley", "henna-mandala", "arabeske-medaillon", "girih-stern", "maschrabiyya", "damaszener-rose", "jasmin", "goldband-girlande", "bluete-weiss", "rosenknospe", "halbmond-rosegold", "laterne-rosegold"],
  pearlsLanterns: ["perle-weiss", "perle-gold", "perlenkette", "perlen-ohrring", "perlenherz", "perlmutt-muschel", "laterne-rosegold", "halbmond-rosegold", "maschrabiyya", "laterne-haengend", "juwelen-laterne", "auster-offen"],
};

const BUILT_IN: PackDef[] = [
  { slug: "ramadan-nights", art: ART.ramadan, order: 1, rotation: true, season: "ramadan", title: { en: "Ramadan Nights", de: "Ramadan-Nächte", ar: "ليالي رمضان" }, stickers: S("ramadan-nights", [
    ["crescent", "هلال", "night", "circle"], ["lantern", "فانوس", "night", "arch"], ["dates", "تمر", "dawn", "rosette"], ["cup", "سحور", "emerald", "circle"],
    ["star8", "نجمة", "gold", "star"], ["drop", "ماء", "sea", "circle"], ["lamp", "قنديل", "gold", "arch"], ["minaret", "أذان", "night", "arch"],
    ["book", "تلاوة", "emerald", "rosette"], ["candle", "سكينة", "night", "hex"], ["text", "رمضان كريم", "gold", "rosette", W("diwani")], ["mountain", "فجر", "dawn", "circle"],
  ]) },
  { slug: "haramain", art: ART.haramain, order: 2, rotation: true, title: { en: "Haramain", de: "Haramain", ar: "الحرمان" }, stickers: S("haramain", [
    ["kaaba", "الكعبة", "gold", "rosette", { sacred: true }], ["dome", "القبة الخضراء", "emerald", "arch", { sacred: true }], ["minaret", "مئذنة", "emerald", "arch"], ["aqsa", "الأقصى", "gold", "arch", { sacred: true }],
    ["arch", "رواق", "sea", "arch"], ["mihrab", "محراب", "gold", "arch"], ["mashrabiya", "مشربية", "dawn", "arch"], ["drop", "زمزم", "sea", "circle"],
    ["palm", "نخيل", "leaf", "circle"], ["mountain", "جبل النور", "night", "circle"], ["tent", "منى", "dawn", "hex"], ["lantern", "مصباح", "night", "arch"],
  ]) },
  { slug: "calligraphy-gold", art: ids("kalligrafie"), order: 3, rotation: true, title: { en: "Calligraphy Gold", de: "Kalligrafie Gold", ar: "الخط الذهبي" }, stickers: S("calligraphy-gold", [
    ["text", "ما شاء الله", "gold", "rosette", W("thuluth")], ["text", "سبحان الله", "emerald", "circle", W("thuluth")], ["text", "الحمد لله", "gold", "circle", W("diwani")],
    ["text", "الله أكبر", "emerald", "rosette", W("kufi")], ["text", "بسم الله", "gold", "hex", W("thuluth")], ["text", "إن شاء الله", "emerald", "circle", W("diwani")],
    ["text", "جزاك الله خيرا", "gold", "rosette", W("diwani")], ["text", "بارك الله فيك", "emerald", "hex", W("thuluth")], ["text", "رمضان كريم", "night", "rosette", W("diwani")],
    ["text", "عيد مبارك", "gold", "star", W("kufi")], ["text", "أستغفر الله", "emerald", "circle", W("kufi")], ["text", "لا حول ولا قوة إلا بالله", "gold", "rosette", W("naskh")],
  ]) },
  { slug: "garden-blossoms", art: ids("garten"), order: 4, rotation: true, title: { en: "Garden Blossoms", de: "Gartenblüten", ar: "أزهار الحديقة" }, stickers: S("garden-blossoms", [
    ["blossom", "زهرة", "rose", "circle"], ["tulip", "خزامى", "rose", "arch"], ["rose", "وردة", "rose", "rosette"], ["palm", "نخلة", "leaf", "circle"],
    ["tree", "شجرة", "leaf", "rosette"], ["dates", "رطب", "dawn", "circle"], ["drop", "ندى", "sea", "circle"], ["bird", "عصفور", "sea", "circle"],
    ["bird", "حمامة", "emerald", "rosette"], ["blossom", "ياسمين", "gold", "star"], ["ribbon", "شريط", "gold", "hex"], ["star8", "ضياء", "leaf", "star"],
  ]) },
  { slug: "eid-lanterns", art: ART.eid, order: 5, rotation: true, season: "eid", title: { en: "Eid Lanterns", de: "Eid-Laternen", ar: "فوانيس العيد" }, stickers: S("eid-lanterns", [
    ["lantern", "فانوس", "gold", "arch"], ["lantern", "نور", "dawn", "arch"], ["star8", "نجمة", "gold", "star"], ["crescent", "هلال", "night", "circle"],
    ["ribbon", "زينة", "rose", "hex"], ["cup", "ضيافة", "dawn", "circle"], ["dates", "حلوى", "rose", "rosette"], ["flag", "راية", "emerald", "circle"],
    ["candle", "شمعة", "gold", "hex"], ["blossom", "فرحة", "rose", "circle"], ["text", "عيد مبارك", "gold", "rosette", W("diwani")], ["text", "تقبل الله", "emerald", "rosette", W("thuluth")],
  ]) },
  { slug: "islamic-art", art: ids("kunst"), order: 6, rotation: true, title: { en: "Islamic Art", de: "Islamische Kunst", ar: "الفن الإسلامي" }, stickers: S("islamic-art", [
    ["medallion", "أرابيسك", "gold", "rosette"], ["girih", "گره", "emerald", "star"], ["mihrab", "محراب", "gold", "arch"], ["mashrabiya", "مشربية", "dawn", "arch"],
    ["lantern", "فانوس", "night", "arch"], ["kaaba", "الكعبة", "gold", "rosette", { sacred: true }], ["dome", "قبة النبي", "emerald", "arch", { sacred: true }], ["aqsa", "قبة الصخرة", "gold", "arch", { sacred: true }],
    ["mushaf", "مصحف", "gold", "circle", { sacred: true }], ["rehal", "رحل", "emerald", "circle"], ["misbaha", "مسبحة", "night", "circle"], ["pen", "قلم", "gold", "hex"],
  ]) },
  { slug: "hajj-days", art: ART.hajj, order: 7, rotation: false, season: "hajj", title: { en: "Days of Hajj", de: "Tage des Hadsch", ar: "أيام الحج" }, stickers: S("hajj-days", [
    ["kaaba", "الكعبة", "gold", "rosette", { sacred: true }], ["tent", "منى", "dawn", "hex"], ["mountain", "عرفات", "dawn", "circle"], ["drop", "زمزم", "sea", "circle"],
    ["arch", "الصفا", "sea", "arch"], ["arch", "المروة", "emerald", "arch"], ["minaret", "مئذنة", "emerald", "arch"], ["palm", "طريق", "leaf", "circle"],
    ["star8", "مزدلفة", "night", "star"], ["ribbon", "إحرام", "gold", "hex"], ["text", "لبيك", "gold", "rosette", W("thuluth")], ["text", "حج مبرور", "emerald", "rosette", W("diwani")],
  ]) },
  { slug: "muharram", order: 8, rotation: false, season: "muharram", tradition: "shia", title: { en: "Muharram Remembrance", de: "Gedenken an Muharram", ar: "ذكرى محرم" }, stickers: S("muharram", [
    ["dome", "كربلاء", "night", "arch"], ["candle", "شمعة", "night", "hex"], ["drop", "ماء", "sea", "circle"], ["flag", "راية", "emerald", "circle"],
    ["lamp", "قنديل", "night", "arch"], ["book", "زيارة", "emerald", "rosette"], ["palm", "نخيل", "leaf", "circle"], ["mihrab", "محراب", "night", "arch"],
    ["star8", "صبر", "night", "star"], ["crescent", "محرم", "night", "circle"], ["text", "يا حسين", "night", "rosette", W("thuluth")], ["text", "السلام عليك", "emerald", "rosette", W("thuluth")],
  ]) },
  // Gulf pearls and gems (Dubai began as a pearl-diving village): faceted stones and pearls hang on the tree as glowing
  // ornaments, and every one placed adds a pearl to the necklace that grows along the crown
  { slug: "pearls-gems", art: [...ids("perlen"), ...ids("edelsteine")], order: 0, rotation: false, title: { en: "Pearls & Gems of the Gulf", de: "Perlen & Edelsteine des Golfs", ar: "لآلئ الخليج وجواهره" }, stickers: S("pearls-gems", [
    ["pearl3d", "دانة بيضاء", "pearlsea", "circle", { gem: "#f4efe6", glow: true }], ["pearl3d", "دانة ذهبية", "pearlsea", "circle", { gem: "#e7c873", glow: true }],
    ["pearl3d", "دانة سوداء", "pearlsea", "rosette", { gem: "#2b2f3a", glow: true }], ["gem", "زمرد", "pearlsea", "hex", { gem: "#11a36a", glow: true }],
    ["gem", "ياقوت أحمر", "pearlsea", "hex", { gem: "#c8213d", glow: true }], ["gem", "ياقوت أزرق", "pearlsea", "hex", { gem: "#2a55c9", glow: true }],
    ["gem", "كهرمان", "pearlsea", "star", { gem: "#e39a2a", glow: true }], ["gem", "فيروز", "pearlsea", "star", { gem: "#2fb8b0", glow: true }],
    ["dhow", "محمل", "pearlsea", "circle"], ["diver", "غوص", "pearlsea", "circle"], ["oyster", "محار", "pearlsea", "rosette", { glow: true }], ["necklace", "عقد", "pearlsea", "rosette", { glow: true }],
  ]) },
  // featured for sisters (identity gender "sister"), available to everyone
  { slug: "rose-garden", art: ART.rose, order: 10, rotation: true, featured: "sister", title: { en: "Rose Garden", de: "Rosengarten", ar: "حديقة الورد" }, stickers: S("rose-garden", [
    ["rose", "ورد جوري", "rosegold", "rosette"], ["damask", "وردة دمشقية", "gold", "circle"], ["blossom", "ياسمين", "ivory", "circle"], ["rose", "وردة", "rose", "circle"],
    ["tulip", "زهرة", "rosegold", "arch"], ["damask", "دمشق", "rosegold", "rosette"], ["blossom", "زهر", "rose", "star"], ["drop", "ماء ورد", "rosegold", "circle"],
    ["tree", "بستان", "leaf", "rosette"], ["ribbon", "شريط", "rosegold", "hex"], ["bird", "بلبل", "ivory", "circle"], ["damask", "عطر", "gold", "rosette"],
  ]) },
  { slug: "hijab-elegance", art: ART.hijab, order: 11, rotation: true, featured: "sister", title: { en: "Hijab Elegance", de: "Hijab-Eleganz", ar: "أناقة الحجاب" }, stickers: S("hijab-elegance", [
    ["khimar", "حياء", "emerald", "arch"], ["khimar", "سكينة", "rosegold", "arch"], ["khimar", "وقار", "ivory", "arch"], ["khimar", "نور", "emerald", "rosette"],
    ["khimar", "طمأنينة", "rosegold", "rosette"], ["khimar", "رحمة", "ivory", "circle"], ["blossom", "ياسمين", "rosegold", "circle"], ["star8", "ضياء", "emerald", "star"],
    ["crescent", "هلال", "ivory", "circle"], ["pearl", "لؤلؤ", "rosegold", "circle"], ["ribbon", "حرير", "emerald", "hex"], ["lantern", "فانوس", "rosegold", "arch"],
  ]) },
  { slug: "henna-arabesque", art: ART.henna, order: 12, rotation: true, featured: "sister", title: { en: "Henna & Arabesque", de: "Henna & Arabeske", ar: "حناء وأرابيسك" }, stickers: S("henna-arabesque", [
    ["paisley", "حناء", "dawn", "circle"], ["paisley", "نقش", "rosegold", "rosette"], ["medallion", "أرابيسك", "dawn", "rosette"], ["damask", "زخرفة", "dawn", "circle"],
    ["paisley", "بوتة", "ivory", "arch"], ["girih", "هندسة", "dawn", "star"], ["blossom", "زهرة", "dawn", "circle"], ["medallion", "دائرة", "rosegold", "circle"],
    ["paisley", "فرح", "gold", "hex"], ["damask", "نجمة", "ivory", "rosette"], ["ribbon", "زينة", "dawn", "hex"], ["star8", "بهجة", "rosegold", "star"],
  ]) },
  { slug: "pearls-lanterns", art: ART.pearlsLanterns, order: 13, rotation: true, featured: "sister", title: { en: "Pearls & Lanterns", de: "Perlen & Laternen", ar: "لآلئ وفوانيس" }, stickers: S("pearls-lanterns", [
    ["pearl", "لؤلؤ", "rosegold", "circle"], ["lantern", "فانوس", "rosegold", "arch"], ["crescent", "هلال", "rosegold", "circle"], ["mashrabiya", "مشربية", "rosegold", "arch"],
    ["pearl", "مرجان", "ivory", "rosette"], ["lantern", "نور", "ivory", "arch"], ["lamp", "قنديل", "rosegold", "arch"], ["star8", "نجمة", "rosegold", "star"],
    ["mashrabiya", "نافذة", "ivory", "arch"], ["pearl", "عقد", "rosegold", "hex"], ["crescent", "ليل", "night", "circle"], ["candle", "شمعة", "rosegold", "hex"],
  ]) },
  // names only, as calligraphy cartouches: no depiction of these women in any form
  { slug: "strong-women", order: 14, rotation: true, featured: "sister", title: { en: "Strong Women in Islam", de: "Starke Frauen im Islam", ar: "نساء عظيمات في الإسلام" }, stickers: S("strong-women", [
    ["cartouche", "خديجة", "gold", "rosette", W("thuluth")], ["cartouche", "فاطمة الزهراء", "emerald", "rosette", W("thuluth")], ["cartouche", "عائشة", "gold", "circle", W("diwani")],
    ["cartouche", "مريم", "rosegold", "rosette", W("thuluth")], ["cartouche", "آسية", "emerald", "circle", W("diwani")], ["cartouche", "زينب", "gold", "rosette", W("kufi")],
    ["cartouche", "خديجة", "ivory", "hex", W("kufi")], ["cartouche", "فاطمة الزهراء", "rosegold", "hex", W("diwani")], ["cartouche", "عائشة", "emerald", "hex", W("kufi")],
    ["cartouche", "مريم", "ivory", "circle", W("diwani")], ["cartouche", "آسية", "rosegold", "hex", W("kufi")], ["cartouche", "زينب", "emerald", "circle", W("thuluth")],
  ]) },
];

/** the 99 Names: one premium collection pack, built from the vetted library list (never typed by hand here) */
function namesPack(): PackDef | null {
  const out: string[] = [];
  for (const line of namesDoc.en.body.split("\n")) {
    const m = line.match(/^\s*-\s+\*\*([؀-ۿ\s]+)\*\*\s+[–-]\s+/);
    if (m) out.push(m[1].trim());
  }
  if (out.length < 90) return null;
  const tones: Tone[] = ["gold", "emerald", "night"];
  const scripts: Script[] = ["thuluth", "kufi", "diwani"];
  return {
    slug: "asma-ul-husna", order: 9, rotation: false, title: { en: "The 99 Names of Allah", de: "Die 99 Namen Allahs", ar: "أسماء الله الحسنى" },
    stickers: out.slice(0, 99).map((ar, i) => ({ id: `asma-ul-husna-${String(i + 1).padStart(2, "0")}`, ar, motif: "text", tone: tones[i % 3], shape: i % 2 ? "rosette" : "circle", script: scripts[i % 3], sacred: true })),
  };
}

// ---------- special stickers: rare editions, one-of-one "Unikate" and earned ones ----------
// rare: numbered editions with a fixed total stated upfront. Nr. 1-10 are a separate product ("founder series",
//   rare.<slug>.founder), Nr. 11-300 the regular one (rare.<slug>); numbers go in order of purchase within each product,
//   and the buyer sees the next number before buying. When an edition is complete it is gone for good.
// unique: exists exactly once worldwide; reserved before the purchase sheet opens, engraved with the owner's
//   username afterwards; a refund releases it again.
// earned: cannot be bought at all; granted by the server for real achievements (see earned.ts).
// No randomness and no auctions anywhere: price (from the App Store) and exactly what one gets are shown upfront.
export type Tier = "rare" | "unique" | "earned";
export type SpecialDef = { slug: string; tier: Tier; edition: number | null; title: { en: string; de: string; ar: string }; sticker: StickerSpec; /** drawn art id (rar pack); without it the placeholder art is used */ art?: string };
export const EDITION = 300;
export const FOUNDER_MAX = 10;
export const rareProduct = (slug: string) => `${APP}.rare.${pid(slug)}`;
export const founderProduct = (slug: string) => `${APP}.rare.${pid(slug)}.founder`;
export const uniqueProduct = (slug: string) => `${APP}.unique.${pid(slug)}`;
export const earnedProduct = (slug: string) => `${APP}.earned.${pid(slug)}`;
const R = (slug: string, en: string, de: string, ar: string, sticker: Omit<StickerSpec, "id">): SpecialDef => ({ slug, tier: "rare", edition: EDITION, title: { en, de, ar }, sticker: { id: `rare-${slug}`, glow: true, ...sticker } });
const U = (slug: string, en: string, de: string, ar: string, sticker: Omit<StickerSpec, "id">, art?: string): SpecialDef => ({ slug, tier: "unique", edition: 1, title: { en, de, ar }, sticker: { id: art ?? `unique-${slug}`, glow: true, ...sticker, sacred: art ? !!stickerArt(art)?.sacred : sticker.sacred }, art });
const E = (slug: string, en: string, de: string, ar: string, sticker: Omit<StickerSpec, "id">, art?: string): SpecialDef => ({ slug, tier: "earned", edition: null, title: { en, de, ar }, sticker: { id: art ?? `earned-${slug}`, glow: true, ...sticker, sacred: art ? !!stickerArt(art)?.sacred : sticker.sacred }, art });
export const SPECIALS: SpecialDef[] = [
  R("kaaba-seal", "Kaaba Gold Seal", "Goldsiegel der Kaaba", "ختم الكعبة الذهبي", { ar: "الكعبة المشرفة", motif: "kaaba", tone: "foil", shape: "rosette", sacred: true }),
  R("qalam-medallion", "Burj al-Qalam Medallion", "Medaillon Burj al-Qalam", "وسام برج القلم", { ar: "القلم", motif: "pen", tone: "foil", shape: "star" }),
  R("nabawi-dome", "Golden Dome of al-Masjid an-Nabawi", "Goldene Kuppel der Prophetenmoschee", "قبة المسجد النبوي الذهبية", { ar: "المسجد النبوي", motif: "dome", tone: "foil", shape: "arch", sacred: true }),
  R("qadr-star", "Star of the Night of Qadr", "Stern der Nacht der Bestimmung", "نجمة ليلة القدر", { ar: "ليلة القدر", motif: "star8", tone: "foil", shape: "star", sacred: true }),
  R("rose-gold-rose", "Rose Gold Damask Rose", "Damaszenerrose in Roségold", "الوردة الدمشقية بالذهب الوردي", { ar: "الوردة الدمشقية", motif: "damask", tone: "rosefoil", shape: "rosette" }),
  R("golden-gulf-pearl", "Golden Gulf Pearl", "Goldene Golfperle", "لؤلؤة الخليج الذهبية", { ar: "دانة", motif: "pearl3d", tone: "foil", shape: "circle", gem: "#e7c873" }),
  R("royal-sapphire", "Royal Sapphire", "Königlicher Saphir", "الياقوت الأزرق الملكي", { ar: "ياقوت", motif: "gem", tone: "foil", shape: "hex", gem: "#2a55c9" }),
  R("dhow-of-gold", "Golden Pearl Dhow", "Goldene Perlen-Dau", "سفينة اللؤلؤ الذهبية", { ar: "محمل", motif: "dhow", tone: "foil", shape: "circle" }),
  U("black-pearl", "The Black Pearl of the Gulf", "Die Schwarze Perle des Golfs", "اللؤلؤة السوداء للخليج", { ar: "الدانة السوداء", motif: "pearl3d", tone: "foil", shape: "rosette", gem: "#2b2f3a" }, "schwarze-perle-golf"),
  U("emerald-haramain", "The Emerald of the Haramain", "Der Smaragd der Haramain", "زمرد الحرمين", { ar: "زمرد", motif: "gem", tone: "foil", shape: "arch", gem: "#13a065" }, "smaragd-haramain"),
  U("gold-falcon", "The Gold Falcon", "Der Goldfalke", "الصقر الذهبي", { ar: "الصقر", motif: "falcon", tone: "foil", shape: "star" }, "goldfalke"),
  U("qalam-masterpiece", "Burj al-Qalam Masterpiece", "Meisterstück Burj al-Qalam", "تحفة برج القلم", { ar: "تحفة القلم", motif: "medallion", tone: "foil", shape: "star" }),
  E("hafiz-pearl", "Hafiz Pearl", "Hafiz-Perle", "لؤلؤة الحافظ", { ar: "حافظ", motif: "pearl3d", tone: "pearlsea", shape: "rosette", gem: "#f4efe6" }, "hafiz-perle"),
  E("khatm-emerald", "Khatm Emerald", "Khatm-Smaragd", "زمرد الختمة", { ar: "ختمة", motif: "gem", tone: "pearlsea", shape: "rosette", gem: "#11a36a" }, "khatm-smaragd"),
  E("qadr-nights-star", "Star of Laylat al-Qadr", "Laylat-al-Qadr-Stern", "نجمة ليلة القدر", { ar: "العشر الأواخر", motif: "star8", tone: "night", shape: "star" }, "stern-laylat-al-qadr"),
  E("streak-100", "Ruby of 100 Days", "Rubin der 100 Tage", "ياقوتة المئة يوم", { ar: "١٠٠ يوم", motif: "gem", tone: "pearlsea", shape: "hex", gem: "#c8213d" }, "edelstein-100-tage"),
  E("streak-365", "Diamond of a Whole Year", "Diamant eines ganzen Jahres", "ماسة العام", { ar: "٣٦٥ يومًا", motif: "gem", tone: "pearlsea", shape: "star", gem: "#cfe8f2" }, "edelstein-365-tage"),
];
/** compatibility: the buyable numbered rare stickers */
export const RARE = SPECIALS.filter((x) => x.tier === "rare");
export const UNIQUE = SPECIALS.filter((x) => x.tier === "unique");
export const EARNED = SPECIALS.filter((x) => x.tier === "earned");
/** every product that gives a special sticker */
export const productsOfSpecial = (x: SpecialDef): string[] =>
  x.tier === "rare" ? [rareProduct(x.slug), founderProduct(x.slug)] : x.tier === "unique" ? [uniqueProduct(x.slug)] : [earnedProduct(x.slug)];

// ---------- seasonal packs added later from the server's content folder (no app update needed) ----------
// <STORE_CONTENT_DIR or /srv/tafsirflow/content>/sticker-packs/<slug>.json = PackDef (stickers as StickerSpec).
// Each new pack still needs its product (stickers.<slug> and gift.stickers.<slug>) in App Store Connect.
function contentDir() {
  const env = process.env.STORE_CONTENT_DIR;
  if (env) return env;
  return existsSync("/srv/tafsirflow/content") ? "/srv/tafsirflow/content" : path.join(process.cwd(), "mobile", "assets", "content");
}
const SLUG = /^[a-z0-9-]{2,40}$/;
async function extraPacks(): Promise<PackDef[]> {
  const dir = path.join(contentDir(), "sticker-packs");
  const files = await readdir(dir).catch(() => [] as string[]);
  const out: PackDef[] = [];
  for (const f of files.filter((x) => x.endsWith(".json"))) {
    try {
      const p = JSON.parse(await readFile(path.join(dir, f), "utf8")) as PackDef;
      if (!SLUG.test(p.slug) || !Array.isArray(p.stickers) || !p.title?.en) continue;
      out.push({ ...p, rotation: !!p.rotation, stickers: p.stickers.filter((s) => SLUG.test(s.id)).slice(0, 120) });
    } catch { /* skip a broken file */ }
  }
  return out;
}

let cached: { at: number; packs: PackDef[] } | null = null;
export async function allPacks(): Promise<PackDef[]> {
  if (cached && Date.now() - cached.at < 5 * 60_000) return cached.packs;
  const names = namesPack();
  const extra = await extraPacks();
  const known = new Set(BUILT_IN.map((p) => p.slug));
  const packs = [...BUILT_IN, ...(names ? [names] : []), ...extra.filter((p) => !known.has(p.slug))].sort((a, b) => a.order - b.order);
  cached = { at: Date.now(), packs };
  return packs;
}

/** the regular pack Pro members can take this month (rotates through the regular packs, the same for everyone) */
export function proPackOf(packs: PackDef[], now = new Date()): string | null {
  const reg = packs.filter((p) => p.rotation);
  if (!reg.length) return null;
  return reg[(now.getUTCFullYear() * 12 + now.getUTCMonth()) % reg.length].slug;
}
export const monthKey = (now = new Date()) => `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

// ---------- product id kinds ----------
export type ProductKind =
  | { kind: "course"; slug: string } | { kind: "frame"; slug: string } | { kind: "pack"; slug: string } | { kind: "bundle" }
  | { kind: "rare"; slug: string; founder: boolean } | { kind: "unique"; slug: string } | { kind: "gift"; slug: string };
export async function productKind(id: string): Promise<ProductKind | null> {
  if (!id.startsWith(`${APP}.`)) return null;
  const rest = id.slice(APP.length + 1);
  if (id === BUNDLE_PRODUCT) return { kind: "bundle" };
  const [head, ...tail] = rest.split(".");
  const slug = tail.join(".");
  const bySlug = <T extends string>(list: readonly T[], x: string) => list.find((y) => pid(y) === x);
  const course = bySlug(COURSE_SLUGS, slug), frame = bySlug(FRAME_SLUGS, slug);
  if (head === "course" && course) return { kind: "course", slug: course };
  if (head === "frame" && frame) return { kind: "frame", slug: frame };
  if (head === "rare") {
    const founder = slug.endsWith(".founder");
    const base = founder ? slug.slice(0, -".founder".length) : slug;
    const r = RARE.find((x) => pid(x.slug) === base);
    if (r) return { kind: "rare", slug: r.slug, founder };
  }
  const u = UNIQUE.find((x) => pid(x.slug) === slug);
  if (head === "unique" && u) return { kind: "unique", slug: u.slug };
  const packs = await allPacks();
  const pack = packs.find((p) => pid(p.slug) === slug), gift = packs.find((p) => pid(p.slug) === tail.slice(1).join("."));
  if (head === "stickers" && pack) return { kind: "pack", slug: pack.slug };
  if (head === "gift" && tail[0] === "stickers" && gift) return { kind: "gift", slug: gift.slug };
  return null;
}

/** one sticker for the app: drawn art when there is some, else the placeholder; tier and shimmer drive the gloss */
export type PublicSticker = { id: string; ar: string; sacred: boolean; glow: boolean; tier: "common" | "edel" | "selten" | "unikat"; shimmer: boolean; svg: string };
export function packStickers(p: PackDef): PublicSticker[] {
  if (p.art?.length) {
    return p.art.map((id) => stickerArt(id)).filter((a) => !!a).map((a) => ({
      id: a.id, ar: a.name, sacred: !!a.sacred, glow: a.pack === "perlen" || a.pack === "edelsteine" || !!a.shimmer, tier: a.tier, shimmer: !!a.shimmer, svg: artSvg(a),
    }));
  }
  return p.stickers.map((s) => ({ id: s.id, ar: s.ar, sacred: !!s.sacred, glow: !!s.glow, tier: "edel" as const, shimmer: false, svg: stickerSvg(s) }));
}
export function specialSticker(x: SpecialDef): PublicSticker {
  const a = x.art ? stickerArt(x.art) : undefined;
  if (a) return { id: a.id, ar: a.name, sacred: !!a.sacred, glow: true, tier: a.tier, shimmer: true, svg: artSvg(a) };
  return { id: x.sticker.id, ar: x.sticker.ar, sacred: !!x.sticker.sacred, glow: true, tier: x.tier === "unique" ? "unikat" : "selten", shimmer: true, svg: stickerSvg(x.sticker) };
}
/** the gold number-plate frame for numbered editions (drawn art; the number goes into its dark field) */
export const plateSvg = () => { const a = stickerArt("kennzeichen-rahmen"); return a ? artSvg(a) : null; };

/** the store catalogue for the app: packs with their SVG art, rare stickers, frames, courses and product ids */
export async function publicCatalog() {
  const packs = await allPacks();
  return {
    freeLevels: FREE_LEVELS,
    plate: plateSvg(),
    proPack: proPackOf(packs),
    bundle: BUNDLE_PRODUCT,
    courses: COURSE_SLUGS.map((slug) => ({ slug, product: courseProduct(slug) })),
    frames: [...FRAME_SLUGS.map((slug) => ({ slug, product: frameProduct(slug), reward: false })), { slug: REWARD_FRAME, product: frameProduct(REWARD_FRAME), reward: true }],
    packs: packs.map((p) => ({
      slug: p.slug, title: p.title, season: p.season ?? null, tradition: p.tradition ?? null, featured: p.featured ?? null, rotation: p.rotation,
      product: packProduct(p.slug), gift: giftProduct(p.slug),
      stickers: packStickers(p),
    })),
    rare: SPECIALS.map((r) => ({
      slug: r.slug, tier: r.tier, title: r.title, edition: r.edition,
      product: r.tier === "rare" ? rareProduct(r.slug) : r.tier === "unique" ? uniqueProduct(r.slug) : earnedProduct(r.slug),
      founder: r.tier === "rare" ? founderProduct(r.slug) : null,
      sticker: specialSticker(r),
    })),
  };
}
