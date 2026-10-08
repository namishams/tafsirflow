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
    { href: "/today", key: "today" }, { href: "/academy", key: "courses" }, { href: "/shams", key: "shams" }, { href: "/arabic", key: "arabic" },
    { href: "/salah", key: "salah" }, { href: "/wudu", key: "wudu" }, { href: "/tajweed", key: "tajweed" }, { href: "/vocab", key: "vocab" }, { href: "/plan", key: "plan" }, { href: "/map", key: "map" },
    { href: "/stats", key: "stats" }, { href: "/ranking", key: "ranking" },
  ] },
  { title: "groupQuran", items: [
    { href: "/quran", key: "quran" }, { href: "/search", key: "search" }, { href: "/reciters", key: "reciters" }, { href: "/radio", key: "radio" },
    { href: "/khatm", key: "khatm" }, { href: "/duas", key: "duas" }, { href: "/dua-generator", key: "duagen" }, { href: "/prayer", key: "prayer" }, { href: "/community", key: "community" },
  ] },
  { title: "islam", items: [
    { href: "/islam", key: "islam" }, { href: "/secrets", key: "secrets" }, { href: "/world", key: "world" }, { href: "/assistant", key: "assistant" }, { href: "/guides", key: "guides" },
  ] },
  { title: "groupMore", items: [
    { href: "/how", key: "how" }, { href: "/app", key: "app" }, { href: "/about", key: "about" }, { href: "/feedback", key: "feedback" }, { href: "/changelog", key: "changelog" },
  ] },
];

export function isActive(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`) || (href === "/quran" && path.startsWith("/surah"));
}
