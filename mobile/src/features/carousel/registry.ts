import { readJSON, writeJSON } from "@/lib/store";
import type { CarouselPayload, WisdomPayload } from "./types";

// Feed ids of carousel and wisdom posts: "cr:<id>" and "ws:<id>" (Home, Reels, Explore render them by these
// prefixes). The payload comes with the server item (/api/feed/page, postKind "carousel" / "wisdom") or from the app
// itself (Nahj sayings in Shia mode, nahj.ts) and is kept here for the session.
export const CAROUSELS = new Map<string, CarouselPayload>();
export const WISDOM = new Map<string, WisdomPayload>();
export const isCarouselId = (id: string) => id.startsWith("cr:");
export const isWisdomId = (id: string) => id.startsWith("ws:");
export const isCarouselOrWisdom = (id: string) => isCarouselId(id) || isWisdomId(id);

export function registerCarousel(c: CarouselPayload): string {
  const id = `cr:${c.id}`;
  CAROUSELS.set(id, c);
  return id;
}
export function registerWisdom(w: WisdomPayload): string {
  const id = `ws:${w.id}`;
  WISDOM.set(id, w);
  return id;
}
export const carouselOf = (feedId: string) => CAROUSELS.get(feedId) ?? null;
export const wisdomOf = (feedId: string) => WISDOM.get(feedId) ?? null;

/** a server item → a feed post of this module, or null (not a carousel / wisdom item, or invalid) */
export function fromServerItem(i: { postKind?: string; carousel?: unknown; wisdom?: unknown }): { feedId: string; kind: string } | null {
  if (i.postKind === "carousel" && valid(i.carousel)) {
    const c = i.carousel as CarouselPayload;
    return { feedId: registerCarousel(c), kind: `carousel-${c.topic}` };
  }
  if (i.postKind === "wisdom" && validW(i.wisdom)) {
    const w = i.wisdom as WisdomPayload;
    return { feedId: registerWisdom(w), kind: `wisdom-${w.kind === "verse" ? "tafsir" : w.kind === "hadith" ? "hadith" : w.kind === "saying" ? "scholars" : "duas"}` };
  }
  return null;
}
const valid = (c: unknown): boolean => {
  const x = c as CarouselPayload | null;
  return !!x && typeof x.id === "string" && !!x.cover?.title && Array.isArray(x.slides) && x.slides.length > 0;
};
const validW = (w: unknown): boolean => {
  const x = w as WisdomPayload | null;
  return !!x && typeof x.id === "string" && (!!x.key || !!x.c || !!x.text);
};

/** "carousel-duas" / "wisdom-hadith" → the library topic (library.ts topicOfKind) */
export function topicOfCarouselKind(kind: string): string | null {
  const m = /^(?:carousel|wisdom)-([a-z]+)$/.exec(kind);
  return m ? m[1] : null;
}

// ---- saved carousels (the bookmark of a post): kept with their payload on the device (new key) ----
export const SAVED_KEY = "qmc.carousel.saved.v1";
export type SavedPost = { k: "c"; p: CarouselPayload } | { k: "w"; p: WisdomPayload };
export function toggleSavedPost(post: SavedPost) {
  const list = readJSON<SavedPost[]>(SAVED_KEY, []);
  const has = list.some((x) => x.k === post.k && x.p.id === post.p.id);
  writeJSON(SAVED_KEY, has ? list.filter((x) => !(x.k === post.k && x.p.id === post.p.id)) : [post, ...list].slice(0, 200), true);
}
/** the saved posts as feed ids (registered, so Home / Reels / Explore can render them), newest first */
export function savedPostIds(list: SavedPost[] = readJSON<SavedPost[]>(SAVED_KEY, [])): string[] {
  return list.map((x) => (x.k === "c" ? registerCarousel(x.p) : registerWisdom(x.p)));
}

/** the searchable text of a carousel / wisdom post (Explore search) */
export function postSearchText(feedId: string): string {
  const c = CAROUSELS.get(feedId);
  if (c) return `${c.cover.title} ${c.cover.sub ?? ""} ${c.seriesLabel} ${c.slides.map((s) => `${s.title ?? ""} ${s.body ?? ""}`).join(" ")}`;
  const w = WISDOM.get(feedId);
  return w ? `${w.themeLabel} ${w.text ?? ""} ${w.by ?? ""} ${w.source.label}` : "";
}
