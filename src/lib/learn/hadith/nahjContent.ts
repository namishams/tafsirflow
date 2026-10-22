// mirrors mobile/src/features/hadith/nahjContent.ts for the website. The Nahj al-Balagha files are not in git; the
// server serves them (GET /api/nahj/<file>, src/app/api/nahj/[file]/route.ts) and the browser keeps them in memory
// (and in its HTTP cache). The website is free: it always gets the full files.
import { useEffect, useSyncExternalStore } from "react";

export type NahjFile = "ar" | "de" | "en" | "study-de" | "study-en" | "study-course";
export const NAHJ_FILES: NahjFile[] = ["ar", "de", "en", "study-de", "study-en", "study-course"];

const data = new Map<NahjFile, unknown>();
const failed = new Set<NahjFile>();
const pending = new Map<NahjFile, Promise<boolean>>();
let version = 0;
const subs = new Set<() => void>();
const bump = () => { version++; subs.forEach((f) => f()); };

function load(f: NahjFile): Promise<boolean> {
  if (data.has(f)) return Promise.resolve(true);
  if (typeof window === "undefined") return Promise.resolve(false);
  let p = pending.get(f);
  if (!p) {
    p = fetch(`/api/nahj/${f}`, { headers: { Accept: "application/json" } })
      .then(async (r) => { if (!r.ok) throw new Error(String(r.status)); data.set(f, await r.json()); failed.delete(f); return true; })
      .catch(() => { failed.add(f); return false; })
      .finally(() => { pending.delete(f); bump(); });
    pending.set(f, p);
  }
  return p;
}

/** the file when it is here; otherwise null, and it starts loading in the background */
export function nahjFile<T>(f: NahjFile): T | null {
  const v = data.get(f);
  if (v !== undefined) return v as T;
  if (!pending.has(f) && !failed.has(f)) void load(f);
  return null;
}
export const loadNahjFiles = (files: NahjFile[]) => Promise.all(files.map((f) => { failed.delete(f); return load(f); }));
export const nahjContentVersion = () => version;
export const nahjIsPreview = () => false;

export type NahjStatus = "loading" | "ready" | "missing";
export function useNahjContent(files: NahjFile[]): { status: NahjStatus; preview: boolean; retry: () => void } {
  useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => version, () => -1);
  const key = files.join(",");
  useEffect(() => { files.forEach((f) => { if (!data.has(f) && !failed.has(f)) void load(f); }); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const status: NahjStatus = files.every((f) => data.has(f)) ? "ready" : files.some((f) => failed.has(f) && !pending.has(f)) ? "missing" : "loading";
  return { status, preview: false, retry: () => void loadNahjFiles(files) };
}
