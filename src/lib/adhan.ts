// Adhan voices. The recordings are uploaded by the owner in the admin area (only recordings he has the right to use)
// and served by Nginx from /srv/tafsirflow/audio/adhan/<id>.mp3; a <id>.credit.txt holds the credit line.
export const ADHAN_VOICES = ["makkah", "madinah", "dubai", "tehran", "aqsa", "default"] as const;
export type AdhanVoice = (typeof ADHAN_VOICES)[number];
export const adhanUrl = (id: string) => `/audio/adhan/${id}.mp3`;
export const adhanCreditUrl = (id: string) => `/audio/adhan/${id}.credit.txt`;

// availability of every voice (HEAD requests, cached for the page lifetime)
let cache: Promise<Record<string, boolean>> | null = null;
export function adhanAvailability(): Promise<Record<string, boolean>> {
  if (typeof window === "undefined") return Promise.resolve({});
  cache ??= Promise.all(ADHAN_VOICES.map((id) => fetch(adhanUrl(id), { method: "HEAD", cache: "no-store" }).then((r) => [id, r.ok] as const).catch(() => [id, false] as const))).then((x) => Object.fromEntries(x));
  return cache;
}
export const resetAdhanCache = () => { cache = null; };
// the chosen voice if installed, otherwise the first installed one
export const pickVoice = (want: string, have: Record<string, boolean>) => (have[want] ? want : ADHAN_VOICES.find((v) => have[v]) ?? null);
