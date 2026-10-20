// Poster tiles ("Courses and tools") – one catalogue, shown on the home page, the Today dashboard and at the end
// of many pages. Title = nav.<key>, text = home2.<desc>, label = home2.badge_<badge>.
export type Tile = { key: string; href: string; ar: string; desc: string; badge: string; bg: string };

export const TILES: Record<string, Tile> = {
  shams: { key: "shams", href: "/shams", ar: "شمس", desc: "tool_shamsD", badge: "method", bg: "linear-gradient(160deg,#3a2f12 0%,#14110a 100%)" },
  courses: { key: "courses", href: "/academy", ar: "أكاديمية", desc: "tool_academyD", badge: "course", bg: "linear-gradient(160deg,#0c4a37 0%,#06221a 100%)" },
  arabic: { key: "arabic", href: "/arabic", ar: "اقرأ", desc: "arabicD", badge: "course", bg: "linear-gradient(160deg,#1d3b2c 0%,#081a12 100%)" },
  salah: { key: "salah", href: "/salah", ar: "صلاة", desc: "salahD", badge: "course", bg: "linear-gradient(160deg,#173a35 0%,#06171a 100%)" },
  islam: { key: "islam", href: "/islam", ar: "إسلام", desc: "islamD", badge: "library", bg: "linear-gradient(160deg,#0f3b2e 0%,#05170f 100%)" },
  tajweed: { key: "tajweed", href: "/tajweed", ar: "تجويد", desc: "tool_tajweedD", badge: "course", bg: "linear-gradient(160deg,#3b1f2b 0%,#160b10 100%)" },
  plan: { key: "plan", href: "/plan", ar: "حفظ", desc: "planD", badge: "plan", bg: "linear-gradient(160deg,#1f2b44 0%,#0b101b 100%)" },
  vocab: { key: "vocab", href: "/vocab", ar: "كلمات", desc: "tool_vocabD", badge: "course", bg: "linear-gradient(160deg,#2c3a1a 0%,#10160a 100%)" },
  reciters: { key: "reciters", href: "/reciters", ar: "قرّاء", desc: "recitersD", badge: "library", bg: "linear-gradient(160deg,#3a2a18 0%,#140e08 100%)" },
  radio: { key: "radio", href: "/radio", ar: "إذاعة", desc: "radioD", badge: "live", bg: "linear-gradient(160deg,#401c14 0%,#170a07 100%)" },
  duas: { key: "duas", href: "/duas", ar: "دعاء", desc: "duasD", badge: "library", bg: "linear-gradient(160deg,#173640 0%,#081418 100%)" },
  map: { key: "map", href: "/map", ar: "خريطة", desc: "mapD", badge: "progress", bg: "linear-gradient(160deg,#30254a 0%,#100c19 100%)" },
  khatm: { key: "khatm", href: "/khatm", ar: "ختمة", desc: "tool_khatmD", badge: "plan", bg: "linear-gradient(160deg,#24324a 0%,#0a0f18 100%)" },
  assistant: { key: "assistant", href: "/assistant", ar: "سؤال", desc: "assistantD", badge: "help", bg: "linear-gradient(160deg,#1c3440 0%,#081217 100%)" },
  world: { key: "world", href: "/world", ar: "الأمة", desc: "worldD", badge: "library", bg: "linear-gradient(160deg,#20353a 0%,#091315 100%)" },
  prayer: { key: "prayer", href: "/prayer", ar: "مواقيت", desc: "prayerD", badge: "live", bg: "linear-gradient(160deg,#2a2440 0%,#0d0b16 100%)" },
  guides: { key: "guides", href: "/guides", ar: "دليل", desc: "tool_guidesD", badge: "library", bg: "linear-gradient(160deg,#33301a 0%,#121108 100%)" },
  secrets: { key: "secrets", href: "/secrets", ar: "أسرار", desc: "secretsD", badge: "library", bg: "linear-gradient(160deg,#3a2f12 0%,#0e1a14 100%)" },
  how: { key: "how", href: "/how", ar: "منهج", desc: "howD", badge: "method", bg: "linear-gradient(160deg,#283a22 0%,#0c140a 100%)" },
  stats: { key: "stats", href: "/stats", ar: "إحصاء", desc: "statsD", badge: "progress", bg: "linear-gradient(160deg,#3a2f12 0%,#120e06 100%)" },
  ranking: { key: "ranking", href: "/ranking", ar: "تنافس", desc: "rankingD", badge: "social", bg: "linear-gradient(160deg,#402a1a 0%,#140c07 100%)" },
  duagen: { key: "duagen", href: "/dua-generator", ar: "دعاء", desc: "duagenD", badge: "help", bg: "linear-gradient(160deg,#2f2a44 0%,#0e0c18 100%)" },
  community: { key: "community", href: "/community", ar: "معًا", desc: "communityD", badge: "social", bg: "linear-gradient(160deg,#3b2a33 0%,#120b0f 100%)" },
  wudu: { key: "wudu", href: "/wudu", ar: "وضوء", desc: "wuduD", badge: "course", bg: "linear-gradient(160deg,#123a44 0%,#06161b 100%)" },
};

export const HOME_TILES = ["shams", "courses", "arabic", "salah", "wudu", "islam", "secrets", "tajweed", "plan", "reciters", "radio", "duas", "duagen", "map", "stats", "ranking"];

export const tileFor = (href: string) => Object.values(TILES).find((t) => t.href === href || href.startsWith(`${t.href}/`) || href.startsWith(`${t.href}?`));
