let onWrite: ((key: string) => void) | null = null;
export const setWriteHook = (fn: ((key: string) => void) | null) => { onWrite = fn; };

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown, silent = false) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) – feature degrades silently */
  }
  if (!silent) onWrite?.(key);
}
