import { Linking } from "react-native";
import { router, type Href } from "expo-router";
import * as WebBrowser from "expo-web-browser";

// Website links inside the library texts, opened in the app. App routes use the same paths as the website, with
// three exceptions: the Quran reader lives at /quran/<surah> (website /surah/<surah>), the Shams Method for one surah
// at /shams/<surah> (website /surah/<surah>?shams=1), and the Today page is the app's first tab.

function param(query: string, key: string): string | null {
  for (const part of query.split("&")) {
    const [k, v = ""] = part.split("=");
    if (decodeURIComponent(k) === key) return decodeURIComponent(v);
  }
  return null;
}

export function appHref(href: string): string {
  const [path, query = ""] = href.split("?");
  const surah = path.match(/^\/surah\/(\d{1,3})$/);
  if (surah) {
    if (param(query, "shams") === "1") return `/shams/${surah[1]}`;
    const v = param(query, "v");
    return v ? `/quran/${surah[1]}?v=${v}` : `/quran/${surah[1]}`;
  }
  if (path === "/today") return "/";
  return href;
}

/** open a website link: the app route with the same path, or the browser for external links */
export function openHref(href: string) {
  if (href.startsWith("mailto:")) { void Linking.openURL(href).catch(() => undefined); return; }
  if (/^https?:/.test(href)) { void WebBrowser.openBrowserAsync(href).catch(() => undefined); return; }
  router.push(appHref(href) as Href);
}

/** the verse reader at a verse */
export function openVerse(surah: number | string, verse?: number | string) {
  router.push((verse ? `/quran/${surah}?v=${verse}` : `/quran/${surah}`) as Href);
}
/** "71:10-12" opens 71:10 (like refLink on the website) */
export function openRef(ref: string) {
  const [s, r = ""] = ref.split(":");
  openVerse(s, r.split(/[-–]/)[0] || undefined);
}
