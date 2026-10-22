import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

// Nahj al-Balagha content on the server. The editions (Arabic, German translation by Nami Shams, English "Peak of
// Eloquence") and the study files are licensed and never in git (the repository is public): they are uploaded
// separately into a content folder on the server – NAHJ_CONTENT_DIR, default /srv/tafsirflow/content – and read from
// there at request time. In development the local, gitignored mobile/assets/content is used when the folder is missing.
export const NAHJ_FILES = ["ar", "de", "en", "study-de", "study-en", "study-course"] as const;
export type NahjFile = (typeof NAHJ_FILES)[number];
export const isNahjFile = (f: string): f is NahjFile => (NAHJ_FILES as readonly string[]).includes(f);

function contentDir(): string {
  const env = process.env.NAHJ_CONTENT_DIR;
  if (env) return env;
  const srv = "/srv/tafsirflow/content";
  if (existsSync(srv)) return srv;
  return path.join(process.cwd(), "mobile", "assets", "content");
}

type Cached = { mtime: number; value: unknown };
const cache = new Map<NahjFile, Cached>();

/** the parsed file, or null when it is not on the server (re-read when the file changes) */
export async function readNahj(f: NahjFile): Promise<unknown | null> {
  const file = path.join(contentDir(), `nahj-${f}.json`);
  try {
    const st = await stat(file);
    const hit = cache.get(f);
    if (hit && hit.mtime === st.mtimeMs) return hit.value;
    const value = JSON.parse(await readFile(file, "utf8")) as unknown;
    cache.set(f, { mtime: st.mtimeMs, value });
    return value;
  } catch {
    return null;
  }
}

// ---------- the free preview for app requests without Pro ----------
/** passages per kind (sermon, letter, saying) that are free besides the first unit of the course */
const FREE_PER_KIND = 3;
type Item = { id: string; kind?: string };
type Book = { items: Item[] } & Record<string, unknown>;
type StudyBook = { items: Record<string, unknown> } & Record<string, unknown>;
type Course = { units: { lessons: { items: string[] }[] }[] };

async function previewIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  const course = (await readNahj("study-course")) as Course | null;
  course?.units[0]?.lessons.forEach((l) => l.items.forEach((id) => ids.add(id)));
  const de = (await readNahj("de")) as Book | null;
  const count: Record<string, number> = {};
  for (const it of de?.items ?? []) {
    const k = it.kind ?? "";
    if ((count[k] ?? 0) < FREE_PER_KIND) { ids.add(it.id); count[k] = (count[k] ?? 0) + 1; }
  }
  return ids;
}

/** the file as a preview: only the free passages (and their study entries), marked preview: true */
export async function nahjPreview(f: NahjFile, full: unknown): Promise<unknown> {
  if (f === "study-course") return full;
  const ids = await previewIds();
  if (f === "study-de" || f === "study-en") {
    const b = full as StudyBook;
    return { ...b, preview: true, items: Object.fromEntries(Object.entries(b.items ?? {}).filter(([id]) => ids.has(id))) };
  }
  const b = full as Book;
  return { ...b, preview: true, items: (b.items ?? []).filter((it) => ids.has(it.id)) };
}
