// One navigation for the whole site: header (desktop links + "More" panel), phone menu and footer all read from here.
export type NavItem = { href: string; key: string };
export type NavGroup = { title: string; items: NavItem[] };

// Always visible in the desktop header; the last two only from xl on
export const PRIMARY: NavItem[] = [
  { href: "/today", key: "today" },
  { href: "/quran", key: "quran" },
  { href: "/academy", key: "courses" },
  { href: "/shams", key: "shams" },
  { href: "/arabic", key: "arabic" },
  { href: "/islam", key: "islam" },
];

export const GROUPS: NavGroup[] = [
  { title: "groupLearn", items: [
    { href: "/today", key: "today" }, { href: "/masterclass", key: "masterclass" }, { href: "/academy", key: "courses" }, { href: "/shams", key: "shams" }, { href: "/arabic", key: "arabic" },
    { href: "/salah", key: "salah" }, { href: "/wudu", key: "wudu" }, { href: "/tajweed", key: "tajweed" }, { href: "/vocab", key: "vocab" }, { href: "/plan", key: "plan" }, { href: "/map", key: "map" },
    { href: "/stats", key: "stats" }, { href: "/ranking", key: "ranking" },
  ] },
  // the courses ported from the app (school, courses, Arabic, Reciter Path, cards, tests) – free on the website
  { title: "groupSchool", items: [
    { href: "/school", key: "school" }, { href: "/courses", key: "academyCourses" }, { href: "/arabic/read", key: "arabicRead" }, { href: "/arabic/lang", key: "arabicLang" },
    { href: "/reciter-path", key: "reciterPath" }, { href: "/shams/method", key: "shamsMethod" }, { href: "/journey", key: "journey" }, { href: "/garden", key: "garden" },
    { href: "/mishary", key: "mishary" }, { href: "/cards", key: "cards" }, { href: "/tests", key: "tests" }, { href: "/abrahamic", key: "abrahamic" },
    { href: "/haramain", key: "haramain" }, { href: "/school/certificates", key: "certificates" },
  ] },
  { title: "groupQuran", items: [
    { href: "/quran", key: "quran" }, { href: "/search", key: "search" }, { href: "/reciters", key: "reciters" }, { href: "/radio", key: "radio" },
    { href: "/khatm", key: "khatm" }, { href: "/duas", key: "duas" }, { href: "/dua-generator", key: "duagen" }, { href: "/prayer", key: "prayer" }, { href: "/community", key: "community" }, { href: "/talents", key: "talents" },
  ] },
  { title: "islam", items: [
    { href: "/islam", key: "islam" }, { href: "/islam/halal-haram", key: "halal" }, { href: "/secrets", key: "secrets" }, { href: "/world", key: "world" }, { href: "/assistant", key: "assistant" }, { href: "/guides", key: "guides" },
  ] },
  { title: "groupMore", items: [
    { href: "/how", key: "how" }, { href: "/app", key: "app" }, { href: "/premium", key: "premium" }, { href: "/about", key: "about" }, { href: "/support", key: "support" }, { href: "/feedback", key: "feedback" }, { href: "/changelog", key: "changelog" },
  ] },
];

export function isActive(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`) || (href === "/quran" && path.startsWith("/surah"));
}
