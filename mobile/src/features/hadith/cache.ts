import { Directory, File, Paths } from "expo-file-system";

// Every hadith text the app shows was fetched from a published API; what was fetched once is kept in the app's
// documents folder (hadith/…json), so a book opened before also reads without a connection.
const dir = () => new Directory(Paths.document, "hadith");
const fileOf = (name: string) => new File(dir(), `${name.replace(/[^A-Za-z0-9._-]/g, "_")}.json`);
const mem = new Map<string, unknown>();
const pending = new Map<string, Promise<unknown>>();

export async function readCached<T>(name: string): Promise<T | null> {
  if (mem.has(name)) return mem.get(name) as T;
  try {
    const f = fileOf(name);
    if (!f.exists) return null;
    const v = JSON.parse(await f.text()) as T;
    mem.set(name, v);
    return v;
  } catch {
    return null;
  }
}

export function writeCached(name: string, v: unknown) {
  mem.set(name, v);
  try {
    const d = dir();
    if (!d.exists) d.create({ intermediates: true, idempotent: true });
    const f = fileOf(name);
    if (!f.exists) f.create();
    f.writeSync(JSON.stringify(v));
  } catch { /* the screen still has it in memory */ }
}

async function fetchJSON<T>(url: string, timeoutMs = 15000): Promise<T> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error(`${r.status}`);
    return (await r.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

/** the JSON at url, from the device when it was fetched before (name = the cache file) */
export function cachedJSON<T>(name: string, url: string): Promise<T> {
  const run = async () => {
    const hit = await readCached<T>(name);
    if (hit !== null) return hit;
    const v = await fetchJSON<T>(url);
    writeCached(name, v);
    return v;
  };
  if (!pending.has(name)) pending.set(name, run().finally(() => pending.delete(name)));
  return pending.get(name) as Promise<T>;
}

/** a value derived from several requests (one reader page of the Thaqalayn API), cached under one name */
export async function cachedValue<T>(name: string, make: () => Promise<T>): Promise<T> {
  const hit = await readCached<T>(name);
  if (hit !== null) return hit;
  const v = await make();
  writeCached(name, v);
  return v;
}
