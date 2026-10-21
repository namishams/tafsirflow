// mirrors the storage part of mobile/src/features/mishary/Journal.tsx – the daily recording journal, private in this
// browser. The index (numbers per day) lives under the app's key "qmc.mishary.journal" in localStorage, written
// silently so the account sync never carries it; the audio of each day lives in IndexedDB ("qmc-mishary-journal",
// store "audio", key = day). Nothing is uploaded. The app keeps its audio files on the phone, so recordings made in
// the app and on the website stay apart (the website's entries carry file "idb:<day>").
import { readJSON, writeJSON } from "@/lib/learn/store";

export const JOURNAL_KEY = "qmc.mishary.journal";
export type JournalEntry = { day: string; verseKey: string; durMs: number; avgDb: number; words: number; wpm: number; acc: number | null; file: string };
export const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
/** Monday of the week of a YYYY-MM-DD day */
export const weekOf = (day: string) => { const d = new Date(`${day}T12:00:00`); const w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return dayStr(d); };

/** average level in dB of the voiced part (levels are dB -60..0, like the app's metering) */
export function avgLoudness(levels: number[]): number {
  const voiced = levels.filter((v) => v > -50);
  const xs = voiced.length >= levels.length / 4 ? voiced : levels;
  return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : -60;
}

const DB = "qmc-mishary-journal", STORE = "audio";
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE); };
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    } catch (e) { reject(e); }
  });
}
async function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const req = run(t.objectStore(STORE));
      t.oncomplete = () => resolve(req.result as T);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  } finally { db.close(); }
}
export async function audioOf(day: string): Promise<Blob | null> {
  try { return ((await tx<Blob | undefined>("readonly", (s) => s.get(day))) ?? null); } catch { return null; }
}

export async function saveEntry(e: Omit<JournalEntry, "file">, blob: Blob): Promise<boolean> {
  try {
    await tx("readwrite", (s) => s.put(blob, e.day));
    const list = readJSON<JournalEntry[]>(JOURNAL_KEY, []).filter((x) => x.day !== e.day);
    writeJSON(JOURNAL_KEY, [...list, { ...e, file: `idb:${e.day}` }].sort((a, b) => a.day.localeCompare(b.day)).slice(-800), true);
    return true;
  } catch { return false; }
}
export async function deleteEntry(day: string) {
  try { await tx("readwrite", (s) => s.delete(day)); } catch { /* already gone */ }
  try { writeJSON(JOURNAL_KEY, readJSON<JournalEntry[]>(JOURNAL_KEY, []).filter((x) => x.day !== day), true); } catch { /* storage unavailable */ }
}
