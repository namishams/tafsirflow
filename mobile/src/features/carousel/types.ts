// Mirror of the website's src/lib/feed/carousels/types.ts (what /api/feed/page sends with postKind "carousel" /
// "wisdom"). Slide texts are the editors' own words; scripture is a reference the app loads from its sources.
export type PaletteId = "night" | "emerald" | "dawn" | "parchment" | "marble";
export type HadithCollection = "bukhari" | "muslim" | "nawawi";
export type Tradition = "all" | "sunni" | "shia";

export type CarouselSlide = {
  n: number;
  t: "text" | "verse" | "pair" | "hadith" | "dua";
  title?: string;
  body?: string;
  arabic?: string;
  list?: string[];
  key?: string;
  to?: number;
  keys?: [string, string];
  c?: HadithCollection;
  num?: number;
  h?: number;
  i?: number;
};
export type CarouselSource = { label: string; url?: string };
export type CarouselPayload = {
  id: string;
  series: string;
  seriesLabel: string;
  topic: string;
  tradition: Tradition;
  lang: string;
  palette: PaletteId;
  cover: { kicker: string; title: string; sub?: string; arabic?: string };
  slides: CarouselSlide[];
  sources: CarouselSource[];
  review: boolean;
};
export type WisdomKind = "verse" | "hadith" | "saying" | "reflection" | "nahj";
export type WisdomPayload = {
  id: string;
  kind: WisdomKind;
  theme: string;
  themeLabel: string;
  tradition: Tradition;
  lang: string;
  palette: PaletteId;
  key?: string;
  to?: number;
  c?: HadithCollection;
  num?: number;
  text?: string;
  arabic?: string;
  by?: string;
  work?: string;
  source: CarouselSource;
  review: boolean;
};

/** the text of a reference slide, loaded from the app's sources */
export type Scripture = { arabic?: string; text?: string; ref: string; url?: string; repeat?: number };
