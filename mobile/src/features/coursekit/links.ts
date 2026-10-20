import { router, type Href } from "expo-router";

// Website links inside course content, mapped to the app's routes (the app uses the website's paths where it can):
//   /surah/113?v=1     → the Quran reader at that verse (/quran/113 with v=1)
//   /surah/1?shams=1   → the Shams Method for that surah (/shams/1)
//   everything else    → the same path in the app (/shams, /tajweed, /academy …)
export function websiteHref(path: string): Href {
  const m = path.match(/^\/surah\/(\d+)(?:\?(.*))?$/);
  if (m) {
    const q = Object.fromEntries((m[2] ?? "").split("&").filter(Boolean).map((p) => p.split("=") as [string, string]));
    if (q.shams) return { pathname: "/shams/[surah]", params: { surah: m[1] } } as unknown as Href;
    const v = q.v;
    return { pathname: "/quran/[surah]", params: v ? { surah: m[1], v } : { surah: m[1] } } as unknown as Href;
  }
  return path as Href;
}

export const openWebsitePath = (path: string) => router.push(websiteHref(path));

/** a verse key like "113:1" → the reader at that verse */
export const openVerse = (key: string) => {
  const [s, a] = key.split(":");
  openWebsitePath(`/surah/${s}?v=${a}`);
};
