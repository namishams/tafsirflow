export const dynamic = "force-dynamic";

// Apple App Site Association (served as /.well-known/apple-app-site-association, see next.config.mjs):
// tells iOS that quranmasterclass.com links open in the iOS app, and lets saved passwords and passkeys of
// quranmasterclass.com work in the app (webcredentials, entitlement webcredentials:quranmasterclass.com in app.json).
// Default app: Team ID XUBV8LPT65, bundle com.quranmasterclass.app. IOS_APP_IDS in /srv/tafsirflow/.env.app overrides
// it ("<TeamID>.com.quranmasterclass.app", comma-separated if several).
// first path segments the iOS app has its own screen for (mobile/src/app, after +native-intent strips the language);
// keep in sync when the app gains or loses a top-level route
const APP_ROUTES = [
  "about", "abrahamic", "academy", "account", "arabic", "assistant", "blog", "calendar", "cards", "carousels", "changelog",
  "community", "courses", "dua-generator", "duas", "exams", "explore", "feed", "feedback", "garden", "guides", "hadith",
  "haramain", "how", "islam", "journey", "khatm", "learn", "legal", "library", "map", "mishary", "nahj", "nahj-studies",
  "names", "plan", "prayer", "premium", "pro", "profile", "prophet-stories", "qibla", "quran", "radio", "ranking",
  "reciter-path", "reciters", "salah", "school", "search", "secrets", "shams", "sisters", "stats", "sticker-collection",
  "sticker-store", "surah", "swipe", "tajweed", "talents", "teacher", "tests", "together", "u", "unlock", "vocab",
  "vocab-decks", "world", "wudu",
];
const DEFAULT_APP_IDS = ["XUBV8LPT65.com.quranmasterclass.app"];

export function GET() {
  const env = (process.env.IOS_APP_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const ids = env.length ? env : DEFAULT_APP_IDS;
  const body = {
    applinks: {
      details: [{
        appIDs: ids,
        components: [
          { "/": "/api/*", exclude: true },
          { "/": "/audio/*", exclude: true },
          { "/": "/*/admin*", exclude: true },
          // the passkey page runs inside the app's sign-in sheet and must stay in the browser
          { "/": "/*/account/passkey*", exclude: true },
          { "/": "/account/passkey*", exclude: true },
          // website-only pages under routes the app also has
          ...["/reciters/apply", "/talents/discover"].flatMap((r) => [{ "/": `${r}*`, exclude: true }, { "/": `/??${r}*`, exclude: true }]),
          // only paths the iOS app has a screen for open in the app (start page with or without language);
          // everything else (support, supporters, partners, messages, legal hubs …) stays in Safari instead of an in-app 404
          { "/": "/" },
          { "/": "/??" },
          ...APP_ROUTES.flatMap((r) => [{ "/": `/${r}` }, { "/": `/${r}/*` }, { "/": `/??/${r}` }, { "/": `/??/${r}/*` }]),
        ],
      }],
    },
    webcredentials: { apps: ids },
  };
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/json", "cache-control": "public, max-age=3600" } });
}
