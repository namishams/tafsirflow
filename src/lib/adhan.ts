// Adhan recordings live in /srv/tafsirflow/audio/adhan/<id>.mp3 (served by Nginx), with <id>.label.txt and <id>.credit.txt.
// The owner adds them in the admin area or with scripts/install-adhan.sh. Listeners pick one voice or "random".
export type AdhanFile = { id: string; label: string; credit: string };
export const SUGGESTED = ["makkah", "madinah", "dubai", "tehran", "aqsa"] as const;
export const adhanUrl = (id: string) => `/audio/adhan/${id}.mp3`;
export const isSlug = (id: string) => /^[a-z0-9][a-z0-9-]{0,40}$/.test(id);

let cache: Promise<AdhanFile[]> | null = null;
export function adhanList(): Promise<AdhanFile[]> {
  if (typeof window === "undefined") return Promise.resolve([]);
  cache ??= fetch("/api/adhan", { cache: "no-store" }).then((r) => (r.ok ? r.json() : { files: [] })).then((d) => d.files as AdhanFile[]).catch(() => []);
  return cache;
}
export const resetAdhanCache = () => { cache = null; };
// "random" (default) picks a different recording each time; a missing choice falls back to random
export function pickAdhan(want: string, files: AdhanFile[]): AdhanFile | null {
  if (!files.length) return null;
  return files.find((f) => f.id === want) ?? files[Math.floor(Math.random() * files.length)];
}
