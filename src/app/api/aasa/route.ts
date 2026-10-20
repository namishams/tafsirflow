export const dynamic = "force-dynamic";

// Apple App Site Association (served as /.well-known/apple-app-site-association, see next.config.mjs):
// tells iOS that quranmasterclass.com links open in the iOS app, and lets saved passwords work in the app.
// IOS_APP_IDS in /srv/tafsirflow/.env.app: "<TeamID>.com.quranmasterclass.app" (comma-separated if several)
export function GET() {
  const ids = (process.env.IOS_APP_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const body = {
    applinks: { details: ids.length ? [{ appIDs: ids, components: [{ "/": "/api/*", exclude: true }, { "/": "/audio/*", exclude: true }, { "/": "/*/admin*", exclude: true }, { "/": "*" }] }] : [] },
    webcredentials: { apps: ids },
  };
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/json", "cache-control": "public, max-age=3600" } });
}
