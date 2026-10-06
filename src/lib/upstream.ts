import { cacheGet, cacheSet } from "./db";

const UPSTREAM = process.env.QURAN_UPSTREAM ?? "https://api.quran.com/api/v4";

// Only these read-only paths may be served/fetched (this is not an open proxy).
const ALLOWED = [
  /^\/chapters(\/\d{1,3})?$/,
  /^\/resources\/(translations|tafsirs)$/,
  /^\/verses\/by_chapter\/\d{1,3}$/,
  /^\/tafsirs\/\d{1,5}\/by_ayah\/\d{1,3}:\d{1,3}$/,
  /^\/search$/,
  /^\/verses\/by_key\/\d{1,3}:\d{1,3}$/,
];

export function isAllowed(path: string) {
  return ALLOWED.some((re) => re.test(path));
}

// Read-through store: own database first, Quran.com only on a miss (then saved for good).
export async function getContent(pathWithQuery: string): Promise<unknown> {
  const searching = pathWithQuery.startsWith("/search");
  const hit = searching ? undefined : await cacheGet(pathWithQuery); // searches are not stored
  if (hit !== undefined) return hit;
  const res = await fetch(`${UPSTREAM}${pathWithQuery}`, { cache: "no-store" });
  if (res.status === 404) return { __missing: true };
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  const json = await res.json();
  if (!searching) await cacheSet(pathWithQuery, json);
  return json;
}
