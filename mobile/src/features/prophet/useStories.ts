import { useCallback, useMemo } from "react";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { usePro } from "@/lib/pro";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { ISLAM } from "@/web/islam";
import { useBioTexts, useChapters, useSecrets } from "@/features/library/content";
import { ISLAM_SLUGS, PROPHET_SLUGS, allahNames, chapterGroup, reciterGroups, secretGroups, tipGroups, type AllahName, type Story, type StoryCat, type StoryGroup } from "./stories";
import { useProphetText } from "./texts";

// Every story group of the app in the reader's language: the library chapters (prophet, prophets, sahaba / history,
// cities, mosques, emirates, art, future, madhahib), the reciters, the Shams Method tips and the Secrets of the Quran.
export type StoryLibrary = { groups: Record<StoryCat, StoryGroup[]>; byId: Map<string, Story>; names: AllahName[] };

export function useStories(): StoryLibrary {
  const { lang } = useLang();
  const chapters = useChapters();
  const secrets = useSecrets();
  const bios = useBioTexts();
  const ws = useWebT("shams");
  const tx = useProphetText();
  return useMemo(() => {
    const chapter = (slug: string) => { const i = ISLAM.findIndex((d) => d.slug === slug); return i >= 0 ? { doc: ISLAM[i], c: chapters[i] } : null; };
    const lib = (slugs: readonly string[], cat: StoryCat) => slugs.map((s) => chapter(s)).filter((x) => !!x?.c).map((x) => chapterGroup(x!.doc.slug, x!.doc.arabic, x!.c, cat)).filter((g) => g.stories.length);
    const groups: Record<StoryCat, StoryGroup[]> = {
      prophet: lib(PROPHET_SLUGS, "prophet"),
      islam: lib(ISLAM_SLUGS, "islam"),
      reciters: reciterGroups(lang, tx.knownFor, bios),
      tips: tipGroups(ws, { method: ws("title"), day: ws("dayTitle") }),
      secrets: secrets ? secretGroups(secrets) : [],
    };
    const byId = new Map<string, Story>();
    for (const list of Object.values(groups)) for (const g of list) for (const s of g.stories) byId.set(s.id, s);
    return { groups, byId, names: allahNames(chapter("names")?.c) };
  }, [chapters, secrets, bios, lang, ws, tx.knownFor]);
}

// ---------- the free daily allowance of story cards ----------
export const FREE_STORIES_PER_DAY = 15;
const QUOTA_KEY = "qmc.story-quota";
type Quota = { day: string; ids: string[] };
const today = () => new Date().toISOString().slice(0, 10);

/** how many story cards a free account has opened today; Pro is unlimited. Verses are never counted. */
export function useStoryQuota() {
  const { pro } = usePro();
  const q = useStored<Quota>(QUOTA_KEY, { day: "", ids: [] });
  const ids = q.day === today() ? q.ids : [];
  /** may this story be shown? (already opened today, or still within the allowance) */
  const allowed = useCallback((id: string) => pro || ids.includes(id) || ids.length < FREE_STORIES_PER_DAY, [pro, ids]);
  /** count a story as opened (once per day) */
  const mark = useCallback((id: string) => {
    if (pro) return;
    const cur = readJSON<Quota>(QUOTA_KEY, { day: "", ids: [] });
    const list = cur.day === today() ? cur.ids : [];
    if (list.includes(id) || list.length >= FREE_STORIES_PER_DAY) return;
    writeJSON(QUOTA_KEY, { day: today(), ids: [...list, id] }, true);
  }, [pro]);
  return { pro, used: ids.length, left: pro ? Infinity : Math.max(0, FREE_STORIES_PER_DAY - ids.length), allowed, mark };
}

// ---------- saved and seen ----------
export const SAVED_KEY = "tf:story-saves";
export const SEEN_KEY = "qmc.stories-seen";
export function toggleSavedStory(id: string) {
  const cur = readJSON<string[]>(SAVED_KEY, []);
  writeJSON(SAVED_KEY, cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
}
export function markSeen(id: string) {
  const cur = readJSON<string[]>(SEEN_KEY, []);
  if (!cur.includes(id)) writeJSON(SEEN_KEY, [...cur.slice(-1500), id], true);
}
