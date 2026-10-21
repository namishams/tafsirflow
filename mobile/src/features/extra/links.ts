import { router, type Href } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { SITE } from "@/lib/api";

// Website paths -> app routes. The app uses the same paths as quranmasterclass.com, except the surah reader
// (website /surah/<n>?v=<verse>, app /quran/<n>?v=<verse>) and the home page (Today tab).
export function appHref(webPath: string): string {
  const [path, query = ""] = webPath.split("?");
  const q = query ? `?${query}` : "";
  const surah = /^\/surah\/(\d{1,3})$/.exec(path);
  if (surah) return `/quran/${surah[1]}${q}`;
  if (path === "" || path === "/" || path === "/today") return `/${q}`;
  if (path === "/blog") return "/guides";
  if (path === "/premium") return "/pro";
  // voluntary support on the website goes through a web payment: never offered inside the app (App Review 3.1.1)
  if (path === "/support" || path.startsWith("/support/")) return "/about";
  return `${path}${q}`;
}

/** open a website path inside the app (internal) or an external address in the in-app browser */
export function openLink(href: string, lang: string) {
  if (href.startsWith("/")) { router.push(appHref(href) as Href); return; }
  if (/^https?:\/\//.test(href)) {
    const own = href.startsWith(SITE) ? href.slice(SITE.length).replace(/^\/(de|en|ar|tr|ur|fa|ps|fr|es|id|ms|bn|ru|zh)(?=\/|$|\?)/, "") : null;
    const path = own === null ? null : own === "" || own.startsWith("?") ? `/${own}` : own;
    if (path !== null && path.startsWith("/") && !path.startsWith("/api")) { router.push(appHref(path) as Href); return; }
    void WebBrowser.openBrowserAsync(href);
    return;
  }
  void WebBrowser.openBrowserAsync(`${SITE}/${lang}`);
}

/** a verse in the reader */
export function openVerse(verseKey: string) {
  const [s, v] = verseKey.split(":");
  router.push({ pathname: "/quran/[surah]", params: { surah: s, v } } as Href);
}

/** a page of the website in the in-app browser (for things that only exist there) */
export const openWebsite = (path: string, lang: string) => WebBrowser.openBrowserAsync(`${SITE}/${lang}${path}`);
