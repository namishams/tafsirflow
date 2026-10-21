import { Platform } from "react-native";
import { SITE } from "@/lib/api";
import { readTradition } from "@/lib/tradition";
import type { CarouselPayload } from "./types";

// The carousels of the website's /api/feed/carousels (gallery and one carousel), for the app's /carousels screens.
export type SeriesInfo = { id: string; label: string; topic: string; count: number };
export type CarouselPage = { total: number; offset: number; items: CarouselPayload[]; series: SeriesInfo[] };
const trad = () => { try { const t = readTradition(); return t === "sunni" || t === "shia" ? t : "all"; } catch { return "all"; } };

async function get<T>(path: string): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(`${SITE}${path}`, { headers: { Accept: "application/json", "x-qmc-app": Platform.OS }, signal: ctrl.signal });
    if (!r.ok) throw new Error(String(r.status));
    return (await r.json()) as T;
  } finally { clearTimeout(timer); }
}

export const fetchCarouselPage = (lang: string, o: { series?: string; offset?: number; limit?: number } = {}) =>
  get<CarouselPage>(`/api/feed/carousels?locale=${lang}&tradition=${trad()}&offset=${o.offset ?? 0}&limit=${o.limit ?? 24}${o.series ? `&series=${encodeURIComponent(o.series)}` : ""}`);
export const fetchCarousel = (id: string, lang: string) => get<CarouselPayload>(`/api/feed/carousels/${encodeURIComponent(id)}?locale=${lang}`);
