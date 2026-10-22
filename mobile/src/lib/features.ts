import { TILES, type Tile } from "@/web/tiles";

// Every course and tool of the website, with the same route as on quranmasterclass.com (app/<route>.tsx).
// The AI tutor (/assistant: Dalil, Hidaya for sisters) has a few free questions a day, many more with Pro. Titles: website nav.<key>, texts: home2.<desc>.

/** website paths the app has a screen for (app/<route>.tsx or app/<route>/index.tsx). A tile the website adds later
 *  (web/tiles.ts is synced from the website) stays out of every tile list until its screen exists here. */
const APP_ROUTES = new Set([
  "/shams", "/academy", "/arabic", "/salah", "/islam", "/tajweed", "/plan", "/vocab", "/reciters", "/radio", "/duas", "/map",
  "/khatm", "/assistant", "/world", "/prayer", "/guides", "/secrets", "/how", "/stats", "/ranking", "/dua-generator",
  "/community", "/wudu", "/calendar", "/names", "/search",
  "/feed", "/prophet-stories", // app-only: the Quran Feed and the stories (entry cards on Discover)
  "/hadith", "/nahj", "/nahj-studies", // app-only: hadith collections and the Nahj al-Balagha feed (Shia mode)
]);
export const hasAppRoute = (href: string) => APP_ROUTES.has(href.split("?")[0]);

/** the website's tiles the app has a screen for */
export const APP_TILES: Tile[] = Object.values(TILES).filter((t) => hasAppRoute(t.href));

/** tools that are not poster tiles on the website but reachable from its menu (title and text resolved by the screen) */
export type ExtraTool = { key: "search" | "calendar" | "names"; href: string; ar: string; badge: string; bg: string };
export const EXTRA_TOOLS: Record<ExtraTool["key"], ExtraTool> = {
  search: { key: "search", href: "/search", ar: "بحث", badge: "library", bg: "linear-gradient(160deg,#1f4036 0%,#0a1218 100%)" },
  calendar: { key: "calendar", href: "/calendar", ar: "هجري", badge: "plan", bg: "linear-gradient(160deg,#2a443c 0%,#0d0c18 100%)" },
  names: { key: "names", href: "/names", ar: "أسماء", badge: "library", bg: "linear-gradient(160deg,#3a2a1c 0%,#140e09 100%)" },
};

export const GROUPS: { id: "learn" | "quran" | "islam" | "progress"; title: string; keys: string[] }[] = [
  { id: "learn", title: "nav.groupLearn", keys: ["shams", "courses", "arabic", "tajweed", "vocab", "salah", "wudu", "plan", "how"] },
  { id: "quran", title: "nav.groupQuran", keys: ["search", "reciters", "radio", "khatm", "duas", "duagen", "prayer", "calendar"] },
  { id: "islam", title: "nav.islam", keys: ["islam", "secrets", "guides", "world", "names", "community", "assistant"] },
  { id: "progress", title: "nav.stats", keys: ["map", "stats", "ranking"] },
];

/** a tile the app has a screen for */
export const tile = (key: string): Tile | undefined => APP_TILES.find((t) => t.key === key);
export const extraTool = (key: string): ExtraTool | undefined => (EXTRA_TOOLS as Record<string, ExtraTool | undefined>)[key];
/** website href -> app route (identical paths) */
export const routeOf = (t: { href: string }) => t.href as `/${string}`;
