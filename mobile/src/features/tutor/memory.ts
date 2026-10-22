import { readJSON, useStored, writeJSON } from "@/lib/store";
import { EMPTY_MEMORY, MEMORY_KEY, MEMORY_SYNC_KEY, type MemoryItem, type MemoryState } from "./next";

// The tutor's memory on this device (website: src/components/tutor/memory.ts): goals and preferences the learner
// confirmed. Kept on this device (never synced); a second key holds the copy for the account sync (lib/syncExtra.ts)
// and is written only while the learner allows syncing – when they stop, it is emptied with a newer time.

type Stored = MemoryState & { at?: number };
type Synced = { items?: MemoryItem[]; at?: number } | null;
const okItems = (x: unknown): x is MemoryItem[] => Array.isArray(x) && x.every((i) => i && typeof (i as MemoryItem).text === "string");

function resolve(raw: Partial<Stored> | null, synced: Synced): MemoryState {
  // a new device of a learner who allowed syncing: take the account's copy (and keep syncing)
  if (!raw && synced && okItems(synced.items) && synced.items.length) return { items: synced.items, use: true, sync: true };
  const local: MemoryState = { ...EMPTY_MEMORY, ...(raw ?? {}), items: okItems(raw?.items) ? raw.items : [] };
  if (local.sync && synced && okItems(synced.items) && (synced.at ?? 0) > (raw?.at ?? 0)) return { ...local, items: synced.items };
  return local;
}

export const readMemory = (): MemoryState => resolve(readJSON<Partial<Stored> | null>(MEMORY_KEY, null), readJSON<Synced>(MEMORY_SYNC_KEY, null));
export function useMemory(): MemoryState {
  return resolve(useStored<Partial<Stored> | null>(MEMORY_KEY, null), useStored<Synced>(MEMORY_SYNC_KEY, null));
}

export function saveMemory(m: MemoryState) {
  const at = Date.now();
  writeJSON(MEMORY_KEY, { items: m.items, use: m.use, sync: m.sync, at }, true);
  if (m.sync) writeJSON(MEMORY_SYNC_KEY, { items: m.items, at });
  else if (readJSON<Synced>(MEMORY_SYNC_KEY, null)?.items?.length) writeJSON(MEMORY_SYNC_KEY, { items: [], at });
}
