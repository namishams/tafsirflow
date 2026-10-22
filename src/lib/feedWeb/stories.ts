// The story groups of the feed (prophet, Companions, Islam then and now, reciters, Shams tips, Secrets of the Quran),
// built on the server from the website's own content exactly like the app's useStories (mobile/src/features/prophet/
// useStories.ts): the Islam library chapters, the reciter biographies, the Shams Method texts and the Secrets of the
// Quran. Nothing is written here; the builders only cut the existing texts into short cards.
import { getTranslations } from "next-intl/server";
import { ISLAM, loadChapters } from "@/lib/islam";
import { withChapterHadith } from "@/lib/islam/hadithQuote";
import { sunniHadith } from "@/lib/learn/journey/hadith";
import { secretsContent } from "@/lib/secrets/content";
import { loadBioTexts } from "@/lib/reciters";
import { ISLAM_SLUGS, PROPHET_SLUGS, allahNames, chapterGroup, reciterGroups, secretGroups, tipGroups, type AllahName, type Story, type StoryCat, type StoryGroup } from "@/lib/learn/prophet/stories";

export type StoryLibrary = { groups: Record<StoryCat, StoryGroup[]>; names: AllahName[] };
/** what the rail needs: no texts, just the ids (to know which circles are new) */
export type StoryRailGroup = { id: string; cat: StoryCat; title: string; arabic: string; ids: string[] };

export const STORY_CATS: StoryCat[] = ["prophet", "reciters", "islam", "tips", "secrets"];

export async function buildStories(locale: string, knownFor: string): Promise<StoryLibrary> {
  // the chapters with their hadith quotes filled in from the published edition (lib/islam/hadithQuote.ts)
  const [chapters, secrets, ws, bios] = await Promise.all([loadChapters(locale).then((cs) => Promise.all(cs.map((c) => withChapterHadith(c, sunniHadith)))), secretsContent(locale).catch(() => null), getTranslations({ locale, namespace: "shams" }), loadBioTexts(locale)]);
  const chapter = (slug: string) => { const i = ISLAM.findIndex((d) => d.slug === slug); return i >= 0 ? { doc: ISLAM[i], c: chapters[i] } : null; };
  const lib = (slugs: readonly string[], cat: StoryCat) => slugs.map((s) => chapter(s)).filter((x) => !!x?.c).map((x) => chapterGroup(x!.doc.slug, x!.doc.arabic, x!.c, cat)).filter((g) => g.stories.length);
  const t = (k: string) => (ws.has(k) ? ws(k) : k);
  const strip = (g: StoryGroup): StoryGroup => ({ ...g, stories: g.stories.map((s): Story => ({ ...s, reciter: undefined })) });
  const groups: Record<StoryCat, StoryGroup[]> = {
    prophet: lib(PROPHET_SLUGS, "prophet"),
    islam: lib(ISLAM_SLUGS, "islam"),
    reciters: reciterGroups(locale, knownFor, bios).map(strip),
    tips: tipGroups(t, { method: t("title"), day: t("dayTitle") }),
    secrets: secrets ? secretGroups(secrets) : [],
  };
  return { groups, names: allahNames(chapter("names")?.c) };
}

export const railOf = (lib: StoryLibrary): StoryRailGroup[] =>
  STORY_CATS.flatMap((c) => lib.groups[c]).map((g) => ({ id: g.id, cat: g.cat, title: g.title, arabic: g.arabic, ids: g.stories.map((s) => s.id) }));
