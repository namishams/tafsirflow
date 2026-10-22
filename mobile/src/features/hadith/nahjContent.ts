import { useEffect, useSyncExternalStore } from "react";
import { api } from "@/lib/api";
import { usePro } from "@/lib/pro";
import { readCached, writeCached } from "./cache";

// The Nahj al-Balagha editions and the study files are not part of the repository or the app bundle (licence; the repo
// is public). The server serves them from its own content folder (GET /api/nahj/<file>, see the website's
// src/app/api/nahj/[file]/route.ts); the app fetches each file once and keeps it in its documents folder (hadith/…json),
// so the reader and the course also work offline afterwards. Until a file is here the screens show a loading or
// "not available" state, and every synchronous reader (feed, school, knowledge posts) simply sees no passages.
// Pro: for app requests without Pro the server sends a preview (the passages of the first unit and the first few of
// each kind, marked preview: true). A preview is kept in memory only and fetched again in full once Pro is active.
export type NahjFile = "ar" | "de" | "en" | "study-de" | "study-en" | "study-course";
export const NAHJ_FILES: NahjFile[] = ["ar", "de", "en", "study-de", "study-en", "study-course"];
const CACHE_VERSION = 2; // raise when the server files change shape, so devices fetch them again

const data = new Map<NahjFile, unknown>();
const failed = new Set<NahjFile>();
const pending = new Map<NahjFile, Promise<boolean>>();
const previews = new Set<NahjFile>();
let version = 0;
const subs = new Set<() => void>();
const bump = () => { version++; subs.forEach((f) => f()); };

function load(f: NahjFile): Promise<boolean> {
  if (data.has(f)) return Promise.resolve(true);
  let p = pending.get(f);
  if (!p) {
    const name = `nahj-${f}-v${CACHE_VERSION}`;
    p = (async () => {
      const hit = await readCached<unknown>(name);
      if (hit !== null) return { v: hit, preview: false };
      const v = await api<{ preview?: boolean }>(`/api/nahj/${f}`, { timeoutMs: 60000 });
      if (!v.preview) writeCached(name, v);
      return { v, preview: !!v.preview };
    })()
      .then(({ v, preview }) => { data.set(f, v); failed.delete(f); if (preview) previews.add(f); else previews.delete(f); return true; })
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

/** loads the files (again after a failure) */
export const loadNahjFiles = (files: NahjFile[]) => Promise.all(files.map((f) => { failed.delete(f); return load(f); }));
/** true while the content on this device is the free preview (no Pro) */
export const nahjIsPreview = () => previews.size > 0;
/** fetches the full files again (after Pro became active) */
function reloadPreviews() {
  const fs = [...previews];
  fs.forEach((f) => { data.delete(f); previews.delete(f); });
  if (fs.length) { bump(); void loadNahjFiles(fs); }
}
/** changes whenever a file arrived or failed (for caches built from the files) */
export const nahjContentVersion = () => version;

export type NahjStatus = "loading" | "ready" | "missing";
/** the state of the files a screen needs; re-renders when they arrive */
export function useNahjContent(files: NahjFile[]): { status: NahjStatus; preview: boolean; retry: () => void } {
  useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => version, () => version);
  const key = files.join(",");
  const { pro } = usePro();
  useEffect(() => { if (pro) reloadPreviews(); }, [pro]);
  useEffect(() => { files.forEach((f) => { if (!data.has(f) && !failed.has(f)) void load(f); }); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const status: NahjStatus = files.every((f) => data.has(f)) ? "ready" : files.some((f) => failed.has(f) && !pending.has(f)) ? "missing" : "loading";
  return { status, preview: files.some((f) => previews.has(f)), retry: () => void loadNahjFiles(files) };
}
