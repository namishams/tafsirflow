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
    // Quran Talents: website profiles /talents/<username>(/followers|/following) open the app's profile screens
    const tal = /^\/talents\/([a-z0-9_.]{3,20})(?:\/(followers|following))?\/?$/.exec(p);
    const APP_TALENT_ROUTES = new Set(["me", "record", "player", "badges", "notifications", "blocked", "settings", "list", "requests", "messages", "guidelines", "admin", "invite", "search"]);
    if (tal && !APP_TALENT_ROUTES.has(tal[1])) return tal[2] ? `/talents/list?u=${tal[1]}&kind=${tal[2]}` : `/talents/u/${tal[1]}`;
    // own profile (21.10.2026: the Account tab is the own profile) and its edit view
    if (p === "/talents/me") return "/account";
    if (p === "/talents/me/edit") return "/community/me";
    // short profile links quranmasterclass.com/u/<username>
    const short = /^\/u\/([a-z0-9_.]{3,20})\/?$/i.exec(p);
    if (short) return `/talents/u/${short[1].toLowerCase()}`;
    return `${p}${url.search}`;
  } catch {
    return path;
  }
}
