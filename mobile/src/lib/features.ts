import { TILES, type Tile } from "@/web/tiles";

// Every course and tool of the website, with the same route as on quranmasterclass.com (app/<route>.tsx).
// The AI assistant is part of Pro in the app. Titles: website nav.<key>, texts: home2.<desc>.
export const APP_TILES = Object.values(TILES);

export const GROUPS: { id: "learn" | "quran" | "islam" | "progress"; title: string; keys: string[] }[] = [
  { id: "learn", title: "nav.groupLearn", keys: ["shams", "courses", "arabic", "tajweed", "vocab", "salah", "wudu", "plan", "how"] },
  { id: "quran", title: "nav.groupQuran", keys: ["reciters", "radio", "khatm", "duas", "duagen", "prayer"] },
  { id: "islam", title: "nav.islam", keys: ["islam", "secrets", "guides", "world", "assistant"] },
  { id: "progress", title: "nav.stats", keys: ["map", "stats", "ranking"] },
];

export const tile = (key: string): Tile | undefined => TILES[key];
/** website href -> app route (identical paths) */
export const routeOf = (t: Tile) => t.href as `/${string}`;
