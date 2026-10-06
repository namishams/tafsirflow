// Quran Masterclass service worker: the app keeps working offline for pages you have opened, and surahs you saved
// ("Save offline" in the surah settings) play without a connection. Audio is only cached when you ask for it.
const V = "qm-v1";
const STATIC = `${V}-static`, PAGES = `${V}-pages`, DATA = `${V}-data`, AUDIO = "qm-audio";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("qm-v") && !k.startsWith(V)) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/audio/")) return e.respondWith(audio(req, url));
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/fonts/") || /\.(woff2?|png|svg|ico|webp)$/.test(url.pathname)) return e.respondWith(cacheFirst(req, STATIC));
  if (url.pathname.startsWith("/api/q/")) return e.respondWith(networkFirst(req, DATA));
  if (req.mode === "navigate") return e.respondWith(networkFirst(req, PAGES, true));
});

async function cacheFirst(req, name) {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) (await caches.open(name)).put(req, res.clone());
  return res;
}

async function networkFirst(req, name, page = false) {
  try {
    const res = await fetch(req);
    if (res.ok && res.type === "basic") (await caches.open(name)).put(req, res.clone());
    return res;
  } catch {
    const hit = await caches.match(req, { ignoreVary: true });
    if (hit) return hit;
    if (page) return new Response(OFFLINE, { status: 503, headers: { "content-type": "text/html; charset=utf-8" } });
    return new Response(JSON.stringify({ error: "offline" }), { status: 503, headers: { "content-type": "application/json" } });
  }
}

// saved verses come from the cache; media players ask for byte ranges, so answer those with 206 slices
async function audio(req, url) {
  const hit = await (await caches.open(AUDIO)).match(url.pathname);
  if (!hit) return fetch(req);
  const range = req.headers.get("range");
  if (!range) return hit;
  const buf = await hit.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const start = m[1] ? Number(m[1]) : 0;
  const end = m[2] ? Math.min(Number(m[2]), buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), { status: 206, headers: {
    "content-type": hit.headers.get("content-type") || "audio/mpeg", "content-range": `bytes ${start}-${end}/${buf.byteLength}`,
    "content-length": String(end - start + 1), "accept-ranges": "bytes" } });
}

const OFFLINE = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline · Quran Masterclass</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#08261d;color:#eef0f3;font-family:system-ui,sans-serif;text-align:center;padding:24px}p{opacity:.75;max-width:30rem;line-height:1.6}b{color:#d6b46c;font-size:28px;font-family:serif}</style></head>
<body><div><b>بِسْمِ ٱللَّهِ</b><h1>Offline</h1><p>Diese Seite ist noch nicht auf deinem Gerät gespeichert. Gespeicherte Suren und bereits besuchte Seiten funktionieren weiter.<br><br>This page is not saved on your device yet. Saved surahs and pages you have visited keep working.</p></div></body></html>`;
