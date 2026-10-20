// Universal links (applinks:quranmasterclass.com, see the website's /api/aasa): website addresses carry the language
// (/en/surah/2?v=255, /de/islam/ramadan). Strip it so the app's routes – the same paths as the website – match, and
// send the e-mail links the app has its own screen for to that screen. Anything unusual is passed on unchanged.
const LOCALES = /^\/(de|en|ar|fr|es|tr|ur|fa|id|ms|ru|zh|bn|ps)(?=\/|$)/;

export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    if (!/^https?:\/\//i.test(path) && !path.startsWith("/")) return path; // quranmasterclass://… and other schemes
    const url = new URL(path, "https://quranmasterclass.com");
    if (!/(^|\.)quranmasterclass\.com$/i.test(url.hostname)) return path;
    const p = url.pathname.replace(LOCALES, "") || "/";
    if (p === "/account/reset") return `/reset-password${url.search}`;
    if (p === "/account") return "/account";
    return `${p}${url.search}`;
  } catch {
    return path;
  }
}
