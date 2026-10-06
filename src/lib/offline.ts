import { readJSON, writeJSON } from "./storage";

// "Save offline": puts every verse file of a surah (and the page itself) into the browser cache that public/sw.js serves
const AUDIO = "qm-audio";
const KEY = "tf:offline"; // { "<chapter>:<reciter folder>": bytes }
export const offlineReady = () => typeof window !== "undefined" && "caches" in window && "serviceWorker" in navigator;
export const savedSurahs = () => readJSON<Record<string, number>>(KEY, {});

export async function saveSurah(chapter: number, folder: string, urls: string[], pageUrl: string, onProgress: (done: number) => void): Promise<number> {
  const cache = await caches.open(AUDIO);
  let bytes = 0, done = 0;
  const queue = [...urls];
  const worker = async () => {
    for (let u = queue.shift(); u; u = queue.shift()) {
      const path = new URL(u, location.href).pathname;
      let res = await cache.match(path);
      if (!res) { const r = await fetch(u, { cache: "no-store" }); if (!r.ok) throw new Error(`audio ${r.status}`); await cache.put(path, r.clone()); res = r; }
      bytes += Number(res.headers.get("content-length")) || 0;
      onProgress(++done);
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  await fetch(pageUrl).catch(() => undefined); // the service worker keeps the page itself
  writeJSON(KEY, { ...savedSurahs(), [`${chapter}:${folder}`]: bytes });
  return bytes;
}

export async function removeSurah(chapter: number, folder: string, urls: string[]) {
  const cache = await caches.open(AUDIO);
  await Promise.all(urls.map((u) => cache.delete(new URL(u, location.href).pathname)));
  const s = savedSurahs(); delete s[`${chapter}:${folder}`]; writeJSON(KEY, s);
}
