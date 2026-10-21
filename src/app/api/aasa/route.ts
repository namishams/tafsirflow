export const dynamic = "force-dynamic";

// Apple App Site Association (served as /.well-known/apple-app-site-association, see next.config.mjs):
// tells iOS that quranmasterclass.com links open in the iOS app, and lets saved passwords and passkeys of
// quranmasterclass.com work in the app (webcredentials, entitlement webcredentials:quranmasterclass.com in app.json).
// Default app: Team ID XUBV8LPT65, bundle com.quranmasterclass.app. IOS_APP_IDS in /srv/tafsirflow/.env.app overrides
// it ("<TeamID>.com.quranmasterclass.app", comma-separated if several).
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
          { "/": "*" },
        ],
      }],
    },
    webcredentials: { apps: ids },
  };
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/json", "cache-control": "public, max-age=3600" } });
}
