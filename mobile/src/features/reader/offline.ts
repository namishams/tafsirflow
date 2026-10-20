import { Directory, File, Paths } from "expo-file-system";
import { readJSON, writeJSON } from "@/lib/store";

// Surahs saved for listening without a connection (Pro), like the website's lib/offline.ts: every verse file of the
// surah for one reciter is stored in documents/audio/<folder>/<SSSAAA>.mp3; an index in "qmc.offline" remembers
// what is complete and how big it is. A saved surah plays from these files.
const KEY = "qmc.offline";
export type OfflineIndex = Record<string, { bytes: number; n: number; at: number }>;
const keyOf = (surah: number, folder: string) => `${surah}:${folder}`;
const pad = (n: number) => String(n).padStart(3, "0");

export const savedSurahs = () => readJSON<OfflineIndex>(KEY, {});
export const savedInfo = (surah: number, folder: string) => savedSurahs()[keyOf(surah, folder)] ?? null;

function dirOf(folder: string): Directory {
  return new Directory(Paths.document, "audio", ...folder.split("/").filter(Boolean));
}
function fileOf(folder: string, surah: number, verse: number): File {
  return new File(dirOf(folder), `${pad(surah)}${pad(verse)}.mp3`);
}

/** the local file of a verse when the surah is saved, otherwise null (the player then streams) */
export function localVerseUri(surah: number, folder: string, verse: number): string | null {
  if (!savedInfo(surah, folder)) return null;
  try {
    const f = fileOf(folder, surah, verse);
    return f.exists ? f.uri : null;
  } catch {
    return null;
  }
}

/** downloads every verse file (three at a time); progress = files done. Resolves with the bytes on disk. */
export async function saveSurah(surah: number, folder: string, urls: string[], onProgress: (done: number) => void, signal?: AbortSignal): Promise<number> {
  const dir = dirOf(folder);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  let done = 0, bytes = 0, next = 0;
  const worker = async () => {
    while (next < urls.length) {
      if (signal?.aborted) throw new Error("aborted");
      const i = next++;
      const f = fileOf(folder, surah, i + 1);
      if (!f.exists || !f.size) await File.downloadFileAsync(urls[i], f, { idempotent: true, signal });
      bytes += f.size || 0;
      done += 1;
      onProgress(done);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  const index = savedSurahs();
  index[keyOf(surah, folder)] = { bytes, n: urls.length, at: Date.now() };
  writeJSON(KEY, index, true);
  return bytes;
}

/** removes the files of a saved surah and its entry in the index */
export function removeSurah(surah: number, folder: string, count: number) {
  for (let v = 1; v <= count; v++) {
    try { const f = fileOf(folder, surah, v); if (f.exists) f.delete(); } catch { /* already gone */ }
  }
  removeText(surah, folder);
  const index = savedSurahs();
  delete index[keyOf(surah, folder)];
  writeJSON(KEY, index, true);
}

/** the surah's text (chapter and verses) saved next to the audio, so a saved surah also opens without a connection */
export function saveText(surah: number, folder: string, lang: string, data: unknown) {
  try {
    const dir = dirOf(folder);
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    new File(dir, `${pad(surah)}.${lang}.json`).write(JSON.stringify(data));
  } catch { /* the audio is what matters */ }
}
export async function loadText<T>(surah: number, folder: string, lang: string): Promise<T | null> {
  if (!savedInfo(surah, folder)) return null;
  try {
    const f = new File(dirOf(folder), `${pad(surah)}.${lang}.json`);
    return f.exists ? (JSON.parse(await f.text()) as T) : null;
  } catch {
    return null;
  }
}
export function removeText(surah: number, folder: string) {
  try {
    for (const item of dirOf(folder).list()) if (item instanceof File && item.name.startsWith(`${pad(surah)}.`) && item.name.endsWith(".json")) item.delete();
  } catch { /* nothing saved */ }
}
