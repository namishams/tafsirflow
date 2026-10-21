"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWebPage, installSeed, saveCursor, savedCursor, wasSeen, type TopicChoice } from "@/lib/feedWeb/client";
import type { WebCard, WebFeedPage } from "@/lib/feedWeb/types";
import type { Story, StoryGroup } from "@/lib/learn/prophet/stories";
import { loadStoryLibrary } from "./StoryViewer";

// The endless stream of the feed (mobile/src/features/feed/library.ts fetchRemotePage): pages of the server corpus
// (/api/feed/web?v=2) in this browser's own shuffled order; the place in it is kept per language and topic, so the next
// visit continues there. The first page of "All" arrives with the HTML (the day's posts); a returning visitor's own
// stream replaces it as soon as it has loaded (unless they already scrolled). "Stories" is built from the story library.

export type StreamTopic = TopicChoice | "stories";
export type Stream = { cards: WebCard[]; loading: boolean; failed: boolean; more: () => void; reload: () => void; ready: boolean };

const PAGE = 12;

/** a story card as a feed post (kind "article"): the Arabic title word, the first paragraphs, a link to the full text */
function storyCard(s: Story, g: StoryGroup): WebCard {
  return {
    id: `s:${s.id}`, kind: "article", topic: "history", title: s.title, eyebrow: s.kicker ?? g.title, body: s.paragraphs[0] ?? s.points?.items.join(" · ") ?? "",
    arabic: s.arabic || undefined, bullets: s.points?.items.slice(0, 3), source: s.sources[0] ?? "Quran Masterclass", sourceUrl: "", href: s.webPath, cta: "read", lang: "",
  };
}

function shuffled<T>(a: T[], seed: string): T[] {
  let x = 2166136261;
  for (const ch of seed) x = Math.imul(x ^ ch.charCodeAt(0), 16777619) >>> 0;
  const rnd = () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 100000) / 100000; };
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

export function useFeedStream({ locale, topic, initial, enabled = true }: { locale: string; topic: StreamTopic; initial?: WebFeedPage | null; enabled?: boolean }): Stream {
  const [cards, setCards] = useState<WebCard[]>(topic === "all" ? initial?.items ?? [] : []);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(topic === "all" && !!initial?.items.length);
  const cursor = useRef<string | null>(null);
  const busy = useRef(false);
  const gen = useRef(0);
  const known = useRef(new Set<string>((topic === "all" ? initial?.items ?? [] : []).map((c) => c.id)));
  const story = useRef<WebCard[] | null>(null);
  const storyPos = useRef(0);
  const storyEpoch = useRef(0);
  const key = `${locale}|all|${topic}`;

  const add = useCallback((items: WebCard[], replace = false) => {
    const fresh = items.filter((c) => replace || !known.current.has(c.id));
    // already seen in the last seven days: only if the page has enough else (the corpus is endless)
    const unseen = fresh.filter((c) => !wasSeen(c.id));
    const use = unseen.length >= Math.min(6, fresh.length) ? unseen : fresh;
    if (replace) known.current = new Set();
    use.forEach((c) => known.current.add(c.id));
    setCards((prev) => (replace ? use : [...prev, ...use]));
    return use.length;
  }, []);

  const loadStories = useCallback(async (g: number) => {
    if (!story.current) {
      const lib = await loadStoryLibrary(locale);
      const all = (["prophet", "islam", "reciters", "tips", "secrets"] as const).flatMap((c) => (lib.groups[c] ?? []).flatMap((grp) => grp.stories.map((s) => storyCard(s, grp))));
      story.current = shuffled(all, installSeed());
    }
    if (g !== gen.current) return;
    // the story cards in a shuffled order, one page after the other; at the end a new order
    let next = story.current.slice(storyPos.current, storyPos.current + PAGE);
    if (!next.length) {
      // a new round: another order, with ids of their own so a card can appear again
      storyEpoch.current++;
      story.current = shuffled(story.current, `${installSeed()}${storyEpoch.current}`).map((c) => ({ ...c, id: `${c.id.split("~")[0]}~${storyEpoch.current}` }));
      storyPos.current = 0;
      next = story.current.slice(0, PAGE);
    }
    storyPos.current += next.length;
    add(next);
  }, [add, locale]);

  const fetchMore = useCallback(async (first = false) => {
    if (busy.current || !enabled) return;
    busy.current = true;
    const g = gen.current;
    setLoading(true);
    setFailed(false);
    try {
      if (topic === "stories") { await loadStories(g); return; }
      const seed = installSeed();
      for (let attempt = 0; attempt < 4; attempt++) {
        if (g !== gen.current) return;
        const r = await fetchWebPage({ locale, cursor: cursor.current, seed, limit: PAGE, topic: topic as TopicChoice });
        if (g !== gen.current) return;
        if (!r.ok) {
          if (r.badCursor && cursor.current) { cursor.current = null; saveCursor(key, null); continue; }
          setFailed(true);
          return;
        }
        cursor.current = r.page.nextCursor;
        if (r.page.nextCursor?.startsWith("c2.")) saveCursor(key, r.page.nextCursor);
        // a returning visitor's own stream replaces the day's posts of the HTML while nothing was scrolled yet
        const n = add(r.page.items, first && topic === "all" && window.scrollY < 80);
        if (n > 0 || !r.page.nextCursor) break;
      }
    } finally {
      busy.current = false;
      setLoading(false);
      setReady(true);
    }
  }, [add, enabled, key, loadStories, locale, topic]);

  // a new topic or language: start again (All keeps the HTML's first page for a new visitor)
  useEffect(() => {
    gen.current++;
    busy.current = false;
    known.current = new Set(topic === "all" ? (initial?.items ?? []).map((c) => c.id) : []);
    setCards(topic === "all" ? initial?.items ?? [] : []);
    setFailed(false);
    setReady(topic === "all" && !!initial?.items.length);
    if (!enabled) return;
    if (topic === "stories") { story.current = null; storyPos.current = 0; storyEpoch.current = 0; void fetchMore(); return; }
    const saved = savedCursor(key);
    cursor.current = saved;
    // a returning visitor continues their own stream at once; a new one gets the HTML's page and the personal stream behind it
    if (saved || topic !== "all" || !initial?.items.length) void fetchMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  const more = useCallback(() => { void fetchMore(false); }, [fetchMore]);
  const reload = useCallback(() => {
    gen.current++;
    busy.current = false;
    cursor.current = null;
    saveCursor(key, null);
    known.current = new Set();
    setCards([]);
    setReady(false);
    void fetchMore(true);
  }, [fetchMore, key]);
  return { cards, loading, failed, more, reload, ready };
}
