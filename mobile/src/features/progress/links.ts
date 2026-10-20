import { router, type Href } from "expo-router";
import { openPro } from "@/lib/pro";

// URLSearchParams is only partly implemented in React Native: a tiny reader is enough here
class URLSearchParamsLite {
  private m = new Map<string, string>();
  constructor(q: string) {
    for (const part of q.split("&")) {
      if (!part) continue;
      const [k, v = ""] = part.split("=");
      this.m.set(decodeURIComponent(k), decodeURIComponent(v));
    }
  }
  get(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
}

// The website's links, mapped onto the app's routes. Every course and tool has the same path as on the website;
// only the verse player differs:
//   /surah/S?v=V&shams=1  -> /shams/S?v=V        (learn the verse with the Shams Method)
//   /surah/S?v=V&m=2&r=1  -> /quran/S?v=V&m=2&r=1 (memorise / review mode of the reader)
//   /surah/S              -> /quran/S
//   /today                -> /  (Today tab)
//   /account              -> /sign-in
export function appHref(web: string): Href | null {
  const [path, query = ""] = web.split("?");
  const params = new URLSearchParamsLite(query);
  const surah = /^\/surah\/(\d{1,3})$/.exec(path);
  if (surah) {
    const s = surah[1];
    if (params.get("shams") === "1") {
      const v = params.get("v");
      return (`/shams/${s}${v ? `?v=${v}` : ""}`) as Href;
    }
    const keep = ["v", "m", "r"].filter((k) => params.get(k) !== null).map((k) => `${k}=${params.get(k)}`);
    return (`/quran/${s}${keep.length ? `?${keep.join("&")}` : ""}`) as Href;
  }
  if (path === "/today") return "/" as Href;
  if (path === "/account") return "/sign-in" as Href;
  if (path === "/premium") return null;
  return web as Href;
}

/** open a website link inside the app */
export function go(web: string) {
  const href = appHref(web);
  if (!href) { openPro("stats"); return; }
  if (href === "/") { router.navigate(href); return; }
  router.push(href);
}
