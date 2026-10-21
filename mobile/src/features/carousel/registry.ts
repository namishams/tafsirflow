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
