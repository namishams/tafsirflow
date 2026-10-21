// mirrors mobile/src/features/srs/sync.ts (copied for the website; keep both in step)
import { readJSON } from "@/lib/learn/store";
import { VOCAB_DECKS } from "@/lib/vocab";
import { addOwnCards } from "./store";

// Cards that create themselves: saved verses ("tf:bookmarks"), verses and word posts liked in the feed
// ("tf:feed-likes": "2:255", or item ids like "q:2:255" / "d:2:255" / "m:2:255" for word and memorise posts), and
// words the vocabulary trainer has started ("tf:vocab"). Runs whenever the card screens open.
const VERSE = /^(\d{1,3}):(\d{1,3})$/;
const POST = /^[qdmct]:(\d{1,3}:\d{1,3})$/;
const known = new Set(VOCAB_DECKS.flatMap((d) => d.words.map((w) => w.id)));
const names = new Set((VOCAB_DECKS.find((d) => d.id === "allah")?.words ?? []).map((w) => w.id));

export function syncOwnCards(): number {
  const ids: string[] = [];
  for (const k of readJSON<string[]>("tf:bookmarks", [])) if (VERSE.test(k)) ids.push(`verse:${k}`);
  for (const k of readJSON<string[]>("tf:feed-likes", [])) {
    if (VERSE.test(k)) ids.push(`verse:${k}`);
    const m = POST.exec(k);
    if (m) ids.push(`verse:${m[1]}`);
  }
  for (const id of Object.keys(readJSON<Record<string, unknown>>("tf:vocab", {}))) if (known.has(id)) ids.push(`${names.has(id) ? "name" : "word"}:${id}`);
  return addOwnCards(ids);
}
