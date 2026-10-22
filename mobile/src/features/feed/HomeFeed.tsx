import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { APP_STORE_URL } from "@/lib/review";
import { Animated, AppState, Easing, FlatList, Linking, Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ListViewToken } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router, useNavigation, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Icon, type IconName } from "@/components/icons";
import { Chip, Wordmark } from "@/components/brand";
import { goBack } from "@/components/page";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { SITE } from "@/lib/api";
import { ARABIC_BOLD, ARABIC_FONT, CALLIG_FONT, FONT, GOLD_RING, R, stage, useTheme } from "@/lib/theme";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { getChapters, reciterName, type Chapter, type Reciter } from "@/lib/quran";
import { VerseEngine } from "@/features/quran/useVerseAudio";
import { useReducedMotionX } from "@/features/extra/motion";
import { CommentsSheet } from "@/features/extra";
import { HEART } from "@/features/extra/SocialBar";
import { VERSES_OF_THE_DAY } from "@/web/votd";
import { StoryViewer } from "@/features/prophet/StoryViewer";
import { SAVED_KEY, SEEN_KEY, toggleSavedStory, useStories, useStoryQuota } from "@/features/prophet/useStories";
import { useProphetText } from "@/features/prophet/texts";
import type { AllahName, Story, StoryGroup } from "@/features/prophet/stories";
import { SpeakerIcon, toneOf } from "./art";
import { tick } from "./haptics";
import { SpecShareSheet, StoryGlyph, hadithSpec, nameSpec, storySpec, useShareCtx, verseSpec } from "@/features/share/feedShare";
import { useTemplateText } from "@/features/share/templateTexts";
import { PALETTES, paletteFor } from "@/features/share/formats";
import { LAYOUT, OrnamentRule, ShareFrame, ShareGround } from "@/features/share/ShareTemplates";
import { DiscoverFeed, loadVerse, rand, shuffle, type FeedVerse } from "./source";
import { countShare, useVerseLike } from "./useLike";
import { fillText, useFeedText } from "./texts";
import { SharePromptCard } from "@/features/share/SharePrompt";
import { CalendarPost, CarouselPost, ChaptersPost, LearnLink, MemoPost, PrayerPost, ProgressPost, QuizPost, RadioPost, RecitersPost, TranslitPost, WordPost, prayerNow } from "./Extras";
import { allowedReciter, isFreeReciter } from "@/features/quran/reciter";
import { lastVisit, markSeen, touchVisit, wasSeen } from "./seen";
import { ExploreSheet, SavedSheet, type OpenItem } from "./Explore";
import { usePT } from "@/features/talents/profileText";
import { TravelFeedBanner } from "@/features/talents/TravelCard";
import { hadithFeedItems, type HadithFeedItem } from "./hadith";
import { SAVED_NAMES_KEY, toggleSavedName } from "./savedNames";
import { ReciterSheet, useFeedAudioGuard, useFeedVoice } from "./voice";
import { SAVED_KEY as HADITH_SAVED_KEY, toggleSaved as toggleSavedHadith, type HadithItem } from "@/features/hadith/data";
import { readTradition } from "@/lib/tradition";
import { FeedEmpty, HeartBurst, useStalled, useTapGestures } from "./ui";
import { LIB_TOPICS, LibScheduler, isLibId, onLibData, takeRemoteNew, type LibTopic } from "./library";
import { flagOn, loadRemoteConfig, remoteConfigLang, updateAvailable, useRemoteConfig } from "./remote";
import Constants from "expo-constants";
import { statListen, statLike, statPost, statSave, statVerse, kindOfItem, useFeedTimer } from "./statsStore";
import { LIB } from "./library";
import { TodayRings } from "./Rings";
import { Celebrations } from "./Celebrate";
import { initGamify } from "./gamify";
import { AdSlotCap, AdSlot } from "./adSlots";
import { AccountNudge, PromoCap, PromoPost, nudgeAccount } from "./Promo";
import { MomentCard, MonetizeCap, OfferWrap, PaywallCard, PremiumPost, markShareMoment, usePurchaseAttribution } from "./monetize";
import { dwell, engaged, isBored } from "./interest";
import { LibraryPost, topicLabel as libTopicLabel } from "./LibraryPost";
import { Rule } from "./ornament";
import { isCarouselId, isWisdomId } from "@/features/carousel/registry";
import { CarouselPost as CarouselFeedPost, WisdomPost } from "@/features/carousel/Posts";
import { useSwipeT } from "@/features/swipe/texts";

// The Instagram home-feed view of /feed: logo bar, a stories rail, then one post after the other. A post is a square
// card (the verse or story drawn like the share image) with a slow Ken Burns zoom; the recitation of the post that is
// at least 60 % visible plays, muted by default with the speaker toggle in the corner. Content only from the vetted
// sources (source.ts / library stories); the recitation voice is the one the account may use (useReciter).
const MUTE_KEY = "qmc.home-muted";
const HINT_KEY = "qmc.feed-hint-seen";
const MAX_W = 560;
const BAR_H = 52;
const TABS_H = 40;
type Item = string;
type ShareItem = { kind: "verse"; v: FeedVerse } | { kind: "story"; s: Story } | { kind: "name"; n: AllahName } | { kind: "hadith"; h: HadithFeedItem };
export type Topic = "all" | "verses" | "names" | "stories" | "hadith" | Exclude<LibTopic, "hadith">;
const TOPICS: Topic[] = ["all", "verses", "tafsir", "hadith", "duas", "stories", "prayer", "seerah", "quran", "holy", "names", "scholars", "history", "art"];
const isLibTopic = (t: Topic): t is Exclude<LibTopic, "hadith"> => (LIB_TOPICS as string[]).includes(t) && t !== "hadith";
const HADITH_EVERY = 4;
/** the Home list keeps at most this many items (older ones are dropped from the front) */
const WINDOW = 400;
let savesThisSession = 0;
/** a promo card in the story viewer after every this many groups */
const PROMO_EVERY = 4; // in "All" a hadith post after every few posts
/** the hadith posts of the feed by item id ("h:<id>"), filled from features/hadith (never typed by hand) */
const HADITH = new Map<string, HadithFeedItem>();

/** a local-only flag per id (likes and saves of story posts) */
function useLocalFlag(storageKey: string, id: string) {
  const list = useStored<string[]>(storageKey, []);
  const on = list.includes(id);
  const toggle = useCallback(() => {
    const cur = readJSON<string[]>(storageKey, []);
    writeJSON(storageKey, cur.includes(id) ? cur.filter((k) => k !== id) : [...cur, id]);
  }, [storageKey, id]);
  return [on, toggle] as const;
}

export function HomeFeed({ tab, onTab, inTab, bottomSpace = 0, onOpen }: { tab: "home" | "reels"; onTab: (t: "home" | "reels") => void; inTab?: boolean; bottomSpace?: number; onOpen?: OpenItem }) {
  const tx = useFeedText();
  const tpp = usePT();
  const swipeT = useSwipeT();
  const pt = useProphetText();
  const t = useTheme();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduce = useReducedMotionX();
  const voice = useFeedVoice();
  const reciter = voice.reciter;
  const [engine] = useState(() => new VerseEngine());
  useEffect(() => () => engine.dispose(), [engine]);
  const stories = useStories();
  const quota = useStoryQuota();
  const seen = useStored<string[]>(SEEN_KEY, []);

  const [keys, setKeys] = useState<Item[]>([]);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(() => readJSON<boolean>(MUTE_KEY, true));
  const [topic, setTopic] = useState<Topic>("all");
  const hintSeen = useStored<boolean>(HINT_KEY, false);
  const [sheet, setSheet] = useState<"explore" | "saved" | "voices" | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [share, setShareRaw] = useState<ShareItem | null>(null);
  const [quickShare, setQuickShare] = useState(false);
  const setShare = useCallback((s: ShareItem | null, quick = false) => { setQuickShare(quick); setShareRaw(s); }, []);
  const [comments, setComments] = useState<string | null>(null);
  const [menu, setMenu] = useState<Item | null>(null);
  const [viewer, setViewer] = useState<{ group: number; story: number } | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const list = useRef<FlatList<Item>>(null);
  const discover = useRef<DiscoverFeed | null>(null);
  const latest = useRef({ stories, quota });
  latest.current = { stories, quota };
  const activeRef = useRef(0);
  const trimmed = useRef(0);
  activeRef.current = active;

  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  const nameOf = useCallback((s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${s}`, [chapters]);
  // stops on tab switch, back gesture, a screen on top, app background and unmount
  const focused = useFeedAudioGuard(engine);

  // the post sequence: "For you" of the reels view (verses, words, names, story cards), restarted on pull-to-refresh
  // hadith posts: a small queue from features/hadith (Sunni / Shia / Nahj by the tradition setting)
  const hq = useRef<{ queue: string[]; cursor: string | null; loading: boolean; gen: number }>({ queue: [], cursor: null, loading: false, gen: 0 });
  const topicRef = useRef(topic);
  topicRef.current = topic;
  const fetchHadith = useCallback(() => {
    const h = hq.current;
    if (h.loading || h.queue.length > 4) return;
    h.loading = true;
    const gen = h.gen;
    void hadithFeedItems(lang, readTradition(), h.cursor).then((page) => {
      if (gen !== hq.current.gen) return;
      h.cursor = page.cursor;
      const ids = page.items.map((it) => { const id = `h:${it.id}`; HADITH.set(id, it); return id; });
      // an empty page means offline: the hadith topic says so at once instead of loading on
      if (topicRef.current === "hadith") { if (!ids.length) failRef.current(); setKeys((k) => [...k, ...ids]); return; }
      h.queue.push(...ids);
      // the first page came after the posts: one hadith a few posts ahead of the reader
      setKeys((k) => {
        if (topicRef.current !== "all" || k.some((x) => x.startsWith("h:")) || !h.queue.length) return k;
        const at = Math.min(k.length, Math.max(3, activeRef.current + 2));
        return [...k.slice(0, at), h.queue.shift()!, ...k.slice(at)];
      });
    }).catch(() => { if (topicRef.current === "hadith") failRef.current(); }).finally(() => { h.loading = false; });
  }, [lang]);
  const failRef = useRef(() => undefined as void);

  const storyQueue = useRef<string[]>([]);
  const shownPrayer = useRef(new Set<string>());
  const extraState = useRef({ n: 0, calendar: false, progress: false });
  const lib = useRef<LibScheduler | null>(null);
  // our own products: frequency-capped (Promo.tsx); the position counts from the start of the session
  const promo = useRef(new PromoCap());
  // Pro posts, the paywall card and the celebration cards (monetize.tsx)
  const mon = useRef(new MonetizeCap());
  // future ad posts: placeholder slots, off unless the server config enables them (adSlots.ts)
  const adSlots = useRef(new AdSlotCap());
  const keysLenRef = useRef(0);
  const proRef = useRef(false);
  proRef.current = voice.pro;
  const nextPosts = useCallback((n: number, queuedStories: number): string[] => {
    const { stories: st, quota: q } = latest.current;
    const left = Math.max(0, q.left - queuedStories);
    const tp = topicRef.current;
    if (tp === "hadith") { fetchHadith(); return []; }
    if (isLibTopic(tp)) return lib.current?.take(n) ?? [];
    if (tp === "names") return st.names.length ? Array.from({ length: n }, () => `n:${Math.floor(rand() * st.names.length)}`) : [];
    if (tp === "stories") {
      const all = (["prophet", "reciters", "islam", "tips", "secrets"] as const).flatMap((c) => st.groups[c].flatMap((g) => g.stories.map((x) => x.id)));
      const out: string[] = [];
      for (let i = 0; i < Math.min(n, left) && all.length; i++) { if (!storyQueue.current.length) storyQueue.current = shuffle(all); out.push(`s:${storyQueue.current.pop()}`); }
      return out;
    }
    const d = discover.current;
    if (!d) return [];
    const got = d.next(n, left).filter((k) => k !== "pro" && (tp !== "verses" || /^[vw]:/.test(k)));
    // weighted variants of a verse post, so the stream never feels the same: quiz, carousel, memorise
    // weights: quiz 7 %, carousel 5 %, memorise 5 %, reciters 5 %, transliteration 5 %, word in depth 6 %, verse 67 %
    const VARIANTS: [string, number][] = [["q", 0.07], ["c", 0.05], ["m", 0.05], ["r", 0.05], ["t", 0.05], ["d", 0.06]];
    const vary = (k: string) => {
      if (!k.startsWith("v:")) return k;
      let x = rand();
      for (const [pre, w] of VARIANTS) { if (x < w) return `${pre}:${k.slice(2)}`; x -= w; }
      return k;
    };
    // the occasional extra cards of "All": calendar and progress once per session, radio and story chapters now and then
    const extras = (): string | null => {
      const e = extraState.current;
      e.n++;
      if (!e.calendar && e.n >= 5) { e.calendar = true; return `cal:${new Date().toDateString()}`; }
      if (!e.progress && e.n >= 18) { e.progress = true; return "prog"; }
      if (e.n % 37 === 0) return "radio";
      if (e.n % 23 === 0) {
        const gs = (["prophet", "islam"] as const).flatMap((c) => st.groups[c]).filter((g) => g.stories.length > 2);
        if (gs.length) return `k:${gs[Math.floor(rand() * gs.length)].id}`;
      }
      return null;
    };
    const pr = prayerNow();
    const prayerCard = pr && !shownPrayer.current.has(`${pr.prayer}:${pr.at.toDateString()}`) ? (shownPrayer.current.add(`${pr.prayer}:${pr.at.toDateString()}`), [`p:${pr.prayer}`]) : [];
    if (tp !== "all") return [...prayerCard, ...(tp === "verses" ? got.map(vary) : got)];
    fetchHadith();
    const out: string[] = [...prayerCard];
    for (const k0 of got) {
      const k = vary(k0);
      out.push(k);
      const x = extras();
      if (x) out.push(x);
      // the content libraries: about every second post (as far as their pages have arrived)
      if (rand() < 0.5) out.push(...(lib.current?.take(1) ?? []));
      const ad = promo.current.at(keysLenRef.current + out.length, proRef.current);
      const slot = ad ? null : adSlots.current.at(keysLenRef.current + out.length, proRef.current);
      if (ad) out.push(ad);
      else if (slot) out.push(slot);
      else { const m = mon.current.at(keysLenRef.current + out.length, proRef.current); if (m) out.push(m); }
      if (out.length % (HADITH_EVERY + 1) === HADITH_EVERY && hq.current.queue.length) out.push(hq.current.queue.shift()!);
    }
    return out;
  }, [fetchHadith]);

  const build = useCallback(() => {
    const { stories: st } = latest.current;
    const ids = (k: keyof typeof st.groups) => st.groups[k].flatMap((g) => g.stories.map((x) => x.id));
    discover.current = new DiscoverFeed(topicRef.current === "verses" ? "verses" : "foryou", { prophet: ids("prophet"), reciters: ids("reciters"), islam: ids("islam"), tips: ids("tips"), secrets: ids("secrets") }, st.names.length, lang !== "ar", undefined);
    storyQueue.current = [];
    lib.current = new LibScheduler(lang, isLibTopic(topicRef.current) ? topicRef.current : "all");
    hq.current = { queue: [], cursor: null, loading: false, gen: hq.current.gen + 1 };
    return nextPosts(8, 0);
  }, [lang, nextPosts]);
  const storiesReady = stories.byId.size > 0;
  useEffect(() => { engine.stop(); setKeys(build()); setActive(0); list.current?.scrollToOffset({ offset: 0, animated: false }); }, [build, storiesReady, voice.sig, topic, engine]);
  // a topic without posts: the skeleton while they load, then (nothing arrived: offline, a source down) the reason
  // with "Try again", which builds the topic again
  const [retries, setRetries] = useState(0);
  const [stalled, setStalled] = useStalled(keys.length === 0, [topic, retries, lang]);
  failRef.current = () => setStalled(true);
  const retryEmpty = useCallback(() => { setRetries((n) => n + 1); engine.stop(); setKeys(build()); setActive(0); }, [build, engine]);

  const more = useCallback(() => {
    const queued = keys.slice(activeRef.current).filter((k) => k.startsWith("s:")).length;
    const add = nextPosts(6, queued);
    if (!add.length) return;
    setKeys((k) => {
      const next = [...k, ...add];
      // memory stays bounded: drop the oldest items far above the reader (keys stay stable through `trimmed`)
      const drop = next.length - WINDOW;
      if (drop <= 0 || activeRef.current - drop < 20) return next;
      trimmed.current += drop;
      setActive((a) => Math.max(0, a - drop));
      return next.slice(drop);
    });
  }, [keys, nextPosts]);

  // a library topic fills as its pages arrive
  const moreRef = useRef(more);
  moreRef.current = more;
  const keysLen = useRef(0);
  keysLen.current = keys.length;
  keysLenRef.current = keys.length + trimmed.current;
  useEffect(() => onLibData(() => { if (keysLen.current - activeRef.current < 6) moreRef.current(); }), []);

  // pull-to-refresh as on Instagram: haptic, then /config and /new from the server (offline: cache / local), fresh
  // rings, the new server posts on top, then a rebuilt pool with unseen posts before already seen ones; short fade
  const fade = useRef(new Animated.Value(1)).current;
  const refresh = useCallback(() => {
    setRefreshing(true);
    tick();
    engine.stop();
    setNewPill(false);
    const started = Date.now();
    void Promise.all([loadRemoteConfig(lang).catch(() => null), takeRemoteNew(lang).catch(() => [] as string[])]).then(([, fresh]) => {
      pendingNew.current = [];
      const wait = reduce ? 0 : Math.max(0, 450 - (Date.now() - started));
      setTimeout(() => {
        const built = build();
        const rest = [...built.filter((k) => !wasSeen(k)), ...built.filter((k) => wasSeen(k))].filter((k) => !fresh.includes(k));
        setKeys([...fresh.filter((k) => !wasSeen(k)), ...rest, ...fresh.filter((k) => wasSeen(k))]);
        setActive(0);
        setRefreshing(false);
        if (!reduce) { fade.setValue(0.4); Animated.timing(fade, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(); }
      }, wait);
    });
  }, [build, engine, reduce, lang, fade]);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const first = viewableItems.find((x) => x.isViewable && x.index !== null);
    if (first && first.index != null) setActive(first.index);
  }).current;
  const viewConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  // stop the sound when the visible post has no recitation (story post) or the tab is left
  const activeItem = keys[active] ?? "";
  // interest: how long each post stayed; a run of fast skips switches the next post to another format right away
  const shownAt = useRef<{ item: string; at: number } | null>(null);
  useEffect(() => {
    const prev = shownAt.current;
    if (prev) dwell(kindOfItem(prev.item, LIB.get(prev.item)?.kind), Date.now() - prev.at);
    shownAt.current = activeItem ? { item: activeItem, at: Date.now() } : null;
    if (!activeItem) return;
    markSeen(activeItem);
    if (!activeItem.startsWith("ad:")) statPost(kindOfItem(activeItem, LIB.get(activeItem)?.kind), activeItem);
    if (isBored() && lib.current) {
      lib.current.bored();
      const at = activeRef.current + 1;
      const k0 = keys[at] ?? "";
      const swap = lib.current.take(1);
      // an image post (or a quiz / carousel of the next verse) instead of more of the same
      const alt = swap.length ? swap : /^v:/.test(k0) ? [`${rand() < 0.5 ? "q" : "c"}:${k0.slice(2)}`] : [];
      if (alt.length) setKeys((k) => [...k.slice(0, at), ...alt, ...k.slice(at)]);
    }
  }, [activeItem]); // eslint-disable-line react-hooks/exhaustive-deps
  // statistics: time while the Home view is on screen; a verse counts as heard after a few seconds with sound
  useFeedTimer(focused && tab === "home");
  useEffect(() => { initGamify(); }, []);
  useEffect(() => {
    if (!/^[vw]:/.test(activeItem) || !focused || muted || tab !== "home") return;
    const id = setTimeout(statVerse, 4000);
    const from = Date.now();
    return () => { clearTimeout(id); statListen(Date.now() - from); };
  }, [activeItem, focused, muted, tab]);
  // "New for you": items not seen before, counted when a batch is built; the pill after returning a while later
  const freshCount = useMemo(() => keys.filter((k) => !wasSeen(k)).length, [keys]); // eslint-disable-line react-hooks/exhaustive-deps
  const [updateHidden, setUpdateHidden] = useState(false);
  const [newPill, setNewPill] = useState(false);
  const pendingNew = useRef<string[]>([]);
  useEffect(() => {
    const away = Date.now() - lastVisit();
    if (lastVisit() && away > 30 * 60000) setNewPill(true);
    touchVisit();
    const sub = AppState.addEventListener("change", (st) => {
      if (st === "active") { if (Date.now() - lastVisit() > 30 * 60000) setNewPill(true); touchVisit(); }
      else touchVisit();
    });
    return () => { sub.remove(); touchVisit(); };
  }, []);
  const takeNew = useCallback(() => {
    setNewPill(false); engine.stop();
    const fresh = pendingNew.current; pendingNew.current = [];
    const built = build();
    setKeys([...fresh, ...built.filter((k) => !fresh.includes(k))]); setActive(0);
    list.current?.scrollToOffset({ offset: 0, animated: !reduce });
  }, [build, engine, reduce]);
  // the server's /new: unseen items wait behind the "New posts" pill (flags.newPostsTab); config is loaded alongside
  const remote = useRemoteConfig();
  useEffect(() => {
    let alive = true;
    const check = () => {
      void loadRemoteConfig(lang).catch(() => null);
      void takeRemoteNew(lang, new Date(lastVisit() || Date.now() - 86400000).toISOString()).then((ids) => {
        const fresh = ids.filter((k) => !wasSeen(k));
        if (!alive || !fresh.length) return;
        pendingNew.current = [...fresh, ...pendingNew.current.filter((k) => !fresh.includes(k))];
        if (flagOn("newPostsTab")) setNewPill(true);
      }).catch(() => undefined);
    };
    check();
    const sub = AppState.addEventListener("change", (st) => { if (st === "active") check(); });
    return () => { alive = false; sub.remove(); };
  }, [lang]);
  useEffect(() => { if (!/^[vwr]:/.test(activeItem) || tab !== "home") engine.pause(); }, [activeItem, tab, engine]);
  const close = useCallback(() => { engine.stop(); goBack(); }, [engine]);
  // side effects outside the state updater: writeJSON notifies other components, which must not happen during render
  const toggleMute = useCallback(() => { const n = !muted; setMuted(n); writeJSON(MUTE_KEY, n, true); if (n) engine.pause(); }, [engine, muted]);
  const toTop = useCallback(() => list.current?.scrollToOffset({ offset: 0, animated: !reduce }), [reduce]);

  // the bar hides when scrolling down and shows again when scrolling up (diffClamp over the scroll offset)
  const headerH = insets.top + BAR_H + TABS_H;
  const scrollY = useRef(new Animated.Value(0)).current;
  const hide = useMemo(() => {
    const clamped = scrollY.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolateLeft: "clamp" });
    return Animated.diffClamp(clamped, 0, BAR_H + TABS_H + insets.top);
  }, [scrollY, insets.top]);
  const barY = hide.interpolate({ inputRange: [0, BAR_H + TABS_H + insets.top], outputRange: [0, -(BAR_H + TABS_H + insets.top)] });
  const onScroll = useMemo(() => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true }), [scrollY]);
  // the Feed tab icon: a tap scrolls to the top, a second tap at the top refreshes (as on Instagram)
  const navigation = useNavigation();
  const atTop = useRef(true);
  useEffect(() => {
    const sub = scrollY.addListener(({ value }) => { atTop.current = value < 8; });
    return () => scrollY.removeListener(sub);
  }, [scrollY]);
  useEffect(() => {
    if (!inTab) return;
    type Nav = { addListener: (e: "tabPress", f: () => void) => () => void; isFocused: () => boolean; getParent: () => Nav | undefined };
    const nav = navigation as unknown as Nav;
    // the Feed tab's navigator is the parent of this stack screen
    const tabs = nav.getParent() ?? nav;
    return tabs.addListener("tabPress", () => {
      if (!nav.isFocused()) return;
      if (atTop.current) refresh(); else toTop();
    });
  }, [navigation, inTab, refresh, toTop]);

  // story circles of every category in one rail
  // unseen groups first (after a refresh new ones move to the front with the gradient ring)
  const groups = useMemo<StoryGroup[]>(() => {
    const all = (["prophet", "reciters", "islam", "tips", "secrets"] as const).flatMap((c) => stories.groups[c]);
    const fresh = (g: StoryGroup) => g.stories.some((x) => !seen.includes(x.id));
    return [...all.filter(fresh), ...all.filter((g) => !fresh(g))];
  }, [stories, refreshing]); // eslint-disable-line react-hooks/exhaustive-deps

  // the story viewer: a story-style card of our own products after every few groups (none for Pro users)
  const viewerGroups = useMemo<StoryGroup[]>(() => {
    if (voice.pro) return groups;
    const promo = (i: number): StoryGroup => {
      const shams = i % 2 === 0;
      const st: Story = { id: shams ? "promo-shams" : "promo-pro", cat: "tips", group: "promo", groupTitle: tx.promoLabel, arabic: "", title: shams ? tx.promoShamsTitle : tx.promoProTitle,
        paragraphs: [shams ? tx.promoShamsBody : tx.promoProBody], truncated: false, sources: [tx.promoLabel], href: shams ? "/shams" : "/pro", webPath: shams ? "/shams" : "/pro" };
      return { id: `promo-${i}`, cat: "tips", title: tx.promoLabel, arabic: "", stories: [st] };
    };
    return groups.flatMap((g, i) => ((i + 1) % PROMO_EVERY === 0 ? [g, promo(i)] : [g]));
  }, [groups, voice.pro, tx]);
  // the opened card in viewerGroups (a promo after every PROMO_EVERY groups shifts the index); one stable object per
  // opening, so a re-render of the feed while the viewer is open never moves it back to this card
  const viewerStart = useMemo(() => (viewer ? { group: viewer.group + Math.floor(viewer.group / PROMO_EVERY) * (voice.pro ? 0 : 1), story: viewer.story } : null), [viewer, voice.pro]);
  const colW = Math.min(width, MAX_W);
  // voices of the "same verse, different reciters" post: only the allowed ones (allowedReciter)
  const voices = useMemo(() => voice.all.filter((r) => voice.pro || isFreeReciter(r)).map((r) => allowedReciter(r, voice.pro, voice.all)), [voice.all, voice.pro]);
  // a tile of Explore / Saved: the Reels view at that item (in the Feed tab), otherwise the Reels route
  const openItem = useCallback<OpenItem>((item, h) => {
    engine.stop();
    if (onOpen) { onOpen(item, h); return; }
    if (/^[vw]:/.test(item)) router.push(`/feed?key=${item.slice(2)}` as Href);
    else onTab("reels");
  }, [engine, onOpen, onTab]);
  usePurchaseAttribution(voice.pro);
  const renderPost = useCallback(({ item, index }: { item: Item; index: number }) => {
    const ex = { item, width: colW, lang, reciter: voice.voiceFor(item), nameOf, reduce };
    if (isCarouselId(item)) return <CarouselFeedPost id={item} width={colW} />;
    if (isWisdomId(item)) return <WisdomPost id={item} width={colW} />;
    if (item.startsWith("q:")) return <QuizPost {...ex} />;
    if (item.startsWith("c:")) return <CarouselPost {...ex} />;
    if (item.startsWith("m:")) return <MemoPost {...ex} />;
    if (item.startsWith("ad:")) return <PromoPost item={item} width={colW} />;
    if (item.startsWith("pp:")) return <PremiumPost item={item} width={colW} pro={voice.pro} />;
    if (item.startsWith("pw:")) return voice.pro ? <View style={{ height: 1 }} /> : <PaywallCard width={colW} />;
    if (item.startsWith("mo:")) return <MomentCard item={item} width={colW} />;
    if (item.startsWith("ad:")) return <AdSlot item={item} width={colW} />;
    if (isLibId(item)) return <LibraryPost id={item} width={colW} reduce={reduce} active={index === active && tab === "home" && focused} />;
    if (item.startsWith("r:")) return <RecitersPost {...ex} voices={voices} engine={engine} active={index === active && tab === "home"} sound={focused && tab === "home"} />;
    if (item.startsWith("t:")) return <TranslitPost {...ex} />;
    if (item.startsWith("d:")) return <WordPost {...ex} />;
    if (item.startsWith("cal:")) return <CalendarPost width={colW} lang={lang} />;
    if (item === "prog") return <ProgressPost width={colW} lang={lang} />;
    if (item === "radio") return <RadioPost width={colW} nameOf={nameOf} active={index === active && tab === "home"} sound={focused && tab === "home"} onStart={() => engine.stop()} />;
    if (item.startsWith("k:")) {
      const gi = groups.findIndex((g) => g.id === item.slice(2));
      return gi < 0 ? <View style={{ height: 1 }} /> : <ChaptersPost group={groups[gi]} width={colW} onOpen={(story) => { engine.stop(); setViewer({ group: gi, story }); }} />;
    }
    if (item.startsWith("p:")) return <PrayerPost item={item} width={colW} lang={lang} onOpen={() => { engine.stop(); router.push("/prayer" as Href); }} />;
    return <Post item={item} index={index} width={colW} active={index === active && tab === "home"} sound={focused && !muted && tab === "home"} muted={muted} onMute={toggleMute}
      engine={engine} lang={lang} reciter={voice.voiceFor(item)} nameOf={nameOf} reduce={reduce} stories={stories} quota={quota}
      onShare={setShare} onComments={setComments} onMenu={setMenu} />;
  }, [colW, active, tab, focused, muted, toggleMute, engine, lang, voice, voices, groups, nameOf, reduce, stories, quota]);
  // contextual offers (personal dua, name report, Shams lesson, more reciters) under fitting posts
  const render = useCallback((a: { item: Item; index: number }) => <OfferWrap item={a.item} pro={voice.pro} width={colW}>{renderPost(a)}</OfferWrap>, [renderPost, voice.pro, colW]);

  // what the share sheet shares: the share templates (features/share/feedShare.tsx); `quick` = the one-tap story pill
  const shareCtx = useShareCtx();
  const sh = useMemo(() => {
    if (!share) return null;
    if (share.kind === "verse") { const v = share.v; return verseSpec(shareCtx, v, nameOf(v.s), { onShared: () => countShare(v.key) }); }
    if (share.kind === "story") return storySpec(shareCtx, share.s);
    if (share.kind === "hadith") return { ...hadithSpec(shareCtx, share.h), onShared: markShareMoment };
    return nameSpec(shareCtx, share.n);
  }, [share, nameOf, shareCtx.lang, shareCtx.tt, shareCtx.stx]); // eslint-disable-line react-hooks/exhaustive-deps

  const topicLabel: Record<Topic, string> = { all: tx.topicAll, verses: pt.catVerses, names: tx.topicNames, stories: tx.topicStories, hadith: tx.hadith,
    ...(Object.fromEntries(LIB_TOPICS.filter((x) => x !== "hadith").map((x) => [x, libTopicLabel(tx, x)])) as Record<Exclude<LibTopic, "hadith">, string>),
    // labels of the remote topic chip groups (same ids as the app's topics) win – only in the language they were loaded
    // in: right after a language switch the old config (e.g. Turkish "Dualar") is still there until the new one arrives
    ...(Object.fromEntries((remoteConfigLang() === lang ? remote?.topicChipGroups ?? [] : []).filter((g) => g.label && (TOPICS as string[]).includes(g.id)).map((g) => [g.id, g.label])) as Partial<Record<Topic, string>>) };
  const showUpdate = updateAvailable(remote) && !updateHidden;
  const header = (
    <View style={{ paddingTop: 8, paddingBottom: 12, marginBottom: 6 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 14, paddingVertical: 4 }} accessibilityLabel={tx.stories}>
        <TodayRings onVerse={(it) => openItem(it)} />
        {groups.length ? groups.map((g, i) => <Bubble key={g.id} g={g} fresh={g.stories.some((s) => !seen.includes(s.id))} onPress={() => setViewer({ group: i, story: 0 })} />)
          : Array.from({ length: 6 }, (_, i) => <Skeleton key={i} reduce={reduce} style={{ width: 68, height: 68, borderRadius: 34, marginHorizontal: 5 }} />)}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist" accessibilityLabel={tx.topics} contentContainerStyle={{ gap: 8, paddingHorizontal: 14, paddingTop: 10 }}>
        {TOPICS.map((k) => {
          const on = topic === k;
          return (
            <Chip key={k} small role="tab" selected={on} label={topicLabel[k]} onPress={() => { if (on) toTop(); else { tick(); setTopic(k); } }} />
          );
        })}
      </ScrollView>
      <View style={{ paddingHorizontal: 14 }}><SharePromptCard /></View>
      {/* travel mode (owner, 21.10.2026): travel duas and, for Makkah or Madinah, Umrah and Hajj */}
      <TravelFeedBanner />
      {showUpdate ? (
        <View style={{ marginHorizontal: 14, marginTop: 12, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, gap: 6 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{tx.updateTitle}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted }}>{tx.updateBody}</Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 18 }}>
            <Text onPress={() => setUpdateHidden(true)} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted, paddingVertical: 4 }}>{tx.gotIt}</Text>
            <Text onPress={() => { const pkg = Constants.expoConfig?.android?.package; void Linking.openURL(Platform.OS === "android" && pkg ? `market://details?id=${pkg}` : Platform.OS === "ios" ? APP_STORE_URL : SITE).catch(() => undefined); }} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent, paddingVertical: 4 }}>{tx.updateCta}</Text>
          </View>
        </View>
      ) : null}
      {hintSeen ? null : (
        <View style={{ marginHorizontal: 14, marginTop: 12, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, gap: 6 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{tx.hintTitle}</Text>
          {[tx.hint1, tx.hint2, tx.hint3].map((h) => <Text key={h} style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted }}>{h}</Text>)}
          <Pressable onPress={() => writeJSON(HINT_KEY, true, true)} accessibilityRole="button" hitSlop={6} style={{ alignSelf: "flex-end", paddingVertical: 4 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{tx.gotIt}</Text>
          </Pressable>
        </View>
      )}
      {freshCount > 0 ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingTop: 12 }}>
          <View style={{ width: 7, height: 7, transform: [{ rotate: "45deg" }], backgroundColor: t.gold }} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{tx.newForYou}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{Intl.NumberFormat(lang).format(freshCount)}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.dark ? "light" : "dark"} />
      <Animated.FlatList
        ref={list as never}
        style={{ opacity: fade }}
        data={keys}
        keyExtractor={(k: Item, i: number) => `${k}-${i + trimmed.current}`}
        maintainVisibleContentPosition={{ minIndexForVisible: 0, autoscrollToTopThreshold: 24 }} // at the top: a dismissed header card must not leave a gap
        renderItem={render as never}
        extraData={`${active}|${muted}|${focused}|${tab}`}
        ListHeaderComponent={header}
        ListFooterComponent={<View style={{ paddingBottom: insets.bottom + bottomSpace + 24 }}>{keys.length ? <PostSkeleton width={colW} reduce={reduce} /> : null}</View>}
        ListEmptyComponent={stalled ? <FeedEmpty state="failed" onRetry={retryEmpty} /> : <View accessible accessibilityLabel={tx.loadingPosts}><PostSkeleton width={colW} reduce={reduce} /></View>}
        contentContainerStyle={{ paddingTop: headerH, alignItems: "stretch" }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onEndReached={more}
        onEndReachedThreshold={2}
        decelerationRate="normal"
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={60}
        windowSize={7}
        removeClippedSubviews
        onViewableItemsChanged={onViewable}
        viewabilityConfig={viewConfig}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} progressViewOffset={headerH} tintColor={t.accent} colors={[t.accent]} accessibilityLabel={tx.refresh} />}
      />

      <Animated.View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, top: 0, paddingTop: insets.top, overflow: "hidden", backgroundColor: reduce || Platform.OS === "android" ? t.bg : t.dark ? "rgba(7,22,17,0.62)" : "rgba(245,247,246,0.7)", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.dark ? "rgba(214,180,108,0.35)" : "rgba(150,116,52,0.35)", transform: [{ translateY: barY }] }}>
        {/* frosted glass under the bar (a solid canvas with Reduce Motion / on Android) */}
        {reduce || Platform.OS === "android" ? null : <BlurView pointerEvents="none" intensity={50} tint={t.dark ? "dark" : "light"} style={StyleSheet.absoluteFill} />}
        <View style={{ height: BAR_H, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14 }}>
          <Pressable onPress={toTop} accessibilityRole="button" accessibilityLabel="Quran Masterclass" style={{ flexDirection: "row", alignItems: "center", gap: 9, flexShrink: 1 }}>
            <Wordmark variant="stacked" height={32} />
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* search (owner, 21.10.2026): accounts and learning content, like Instagram / TikTok */}
            <HeadBtn label={tpp("searchLabel")} onPress={() => router.push("/talents/search" as Href)}><Icon name="search" color={t.ink} size={22} /></HeadBtn>
            <HeadBtn label={tx.explore} onPress={() => setSheet("explore")}><Icon name="compass" color={t.ink} size={23} /></HeadBtn>
            <HeadBtn label={tx.saved} onPress={() => setSheet("saved")}><Icon name="bookmark" color={t.ink} size={22} /></HeadBtn>
            <HeadBtn label={tx.statsOpen} onPress={() => router.push("/feed-stats" as Href)}><Icon name="trophy" color={t.ink} size={22} /></HeadBtn>
            <HeadBtn label={tx.reciters} onPress={() => setSheet("voices")}><Icon name="radio" color={voice.rotate ? t.accent : t.ink} size={22} /></HeadBtn>
            {inTab ? null : <HeadBtn label={tx.close} onPress={close}><Icon name="close" color={t.ink} size={22} /></HeadBtn>}
          </View>
        </View>
        <View accessibilityRole="tablist" style={{ height: TABS_H, flexDirection: "row" }}>
          {(["home", "reels", "explore", "learn"] as const).map((k) => {
            const on = tab === k;
            // Explore opens the full-screen Explore grid (same as the compass), like Instagram's third view;
            // Learn opens Swipe & Learn (features/swipe)
            const press = () => (k === "learn" ? router.push("/swipe" as Href) : k === "explore" ? setSheet("explore") : on ? toTop() : onTab(k));
            return (
              <Pressable key={k} onPress={press} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: on ? FONT.semibold : FONT.medium, fontSize: 14, letterSpacing: 0.3, color: on ? t.ink : t.muted }}>{k === "home" ? tx.home : k === "reels" ? tx.reels : k === "learn" ? swipeT("tab") : tx.explore}</Text>
                {/* the selected view: a fine gold rule with a small lozenge, like a mushaf divider */}
                {on ? <View style={{ position: "absolute", bottom: 0, alignItems: "center", justifyContent: "center", width: 64, height: 7 }}>
                  <LinearGradient colors={["rgba(214,180,108,0)", "rgb(201,166,94)", "rgba(214,180,108,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", left: 0, right: 0, height: 1.5 }} />
                  <View style={{ width: 5, height: 5, transform: [{ rotate: "45deg" }], backgroundColor: "rgb(201,166,94)" }} />
                </View> : null}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* the status bar area stays blurred while the bar scrolls away */}
      <BlurView pointerEvents="none" intensity={reduce ? 0 : 40} tint="systemChromeMaterial" style={{ position: "absolute", left: 0, right: 0, top: 0, height: insets.top, backgroundColor: reduce ? t.bg : "transparent" }} />
      {newPill ? (
        <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, top: headerH + 10, alignItems: "center" }}>
          <Pressable onPress={takeNew} accessibilityRole="button" accessibilityLabel={tx.newPosts}
            style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingHorizontal: 18, borderRadius: R.pill, backgroundColor: stage.bg, borderWidth: 1, borderColor: stage.gold, opacity: pressed ? 0.85 : 1, shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } })}>
            <View style={{ transform: [{ rotate: "180deg" }] }}><Icon name="chevronDown" color={stage.gold} size={14} /></View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, letterSpacing: 0.3, color: stage.cream }}>{tx.newPosts}</Text>
          </Pressable>
        </View>
      ) : null}
      <PostMenu item={menu} onClose={() => setMenu(null)} stories={stories} onShare={(s) => { setMenu(null); setShare(s); }} onVoices={() => { setMenu(null); setSheet("voices"); }} />
      <ExploreSheet visible={sheet === "explore"} onClose={() => setSheet(null)} onOpen={openItem} onSearch={() => router.push("/talents/search" as Href)} />
      <SavedSheet visible={sheet === "saved"} onClose={() => { setSheet(null); setTimeout(nudgeAccount, 500); }} onOpen={openItem} />
      <ReciterSheet visible={sheet === "voices"} onClose={() => setSheet(null)} />
      <AccountNudge />
      <CommentsSheet visible={!!comments} verseKey={comments ?? "1:1"} onClose={() => setComments(null)} />
      <StoryViewer groups={viewerGroups} start={viewerStart} onClose={() => setViewer(null)} />
      <Celebrations />
      {sh ? <SpecShareSheet spec={sh} quick={quickShare} onClose={() => setShare(null)} /> : null}
    </View>
  );
}

function HeadBtn({ children, label, onPress }: { children: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={({ pressed }) => ({ width: 40, height: 40, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
      {children}
    </Pressable>
  );
}

// ---------- story circle ----------
const Bubble = memo(function Bubble({ g, fresh, onPress }: { g: StoryGroup; fresh: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${g.title}, ${g.stories.length}${fresh ? "" : ""}`} style={{ width: 78, alignItems: "center", gap: 5 }}>
      <LinearGradient colors={fresh ? ["#f6e7bf", "#d6b46c", "#8a6a2c", "#e9cf99"] : [t.line, t.line]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 72, height: 72, borderRadius: 36, padding: 2 }}>
        <View style={{ flex: 1, borderRadius: 34, padding: 2.5, backgroundColor: t.bg }}>
          <LinearGradient colors={toneOf(g.id)} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ flex: 1, borderRadius: 32, alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(214,180,108,0.55)" }}>
            <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: CALLIG_FONT, fontSize: 20, lineHeight: 40, color: "rgb(233,207,153)", paddingHorizontal: 6 }}>{g.arabic}</Text>
          </LinearGradient>
        </View>
      </LinearGradient>
      <Text numberOfLines={1} style={{ fontFamily: FONT.medium, fontSize: 11, letterSpacing: 0.2, color: fresh ? t.ink : t.muted, maxWidth: 76 }}>{g.title}</Text>
    </Pressable>
  );
});

// ---------- skeletons ----------
function Skeleton({ style, reduce }: { style: object; reduce: boolean }) {
  const t = useTheme();
  const v = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    if (reduce) { v.setValue(0.6); return; }
    const a = Animated.loop(Animated.sequence([Animated.timing(v, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }), Animated.timing(v, { toValue: 0.5, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true })]));
    a.start();
    return () => a.stop();
  }, [reduce, v]);
  return <Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[{ backgroundColor: t.line, opacity: v }, style]} />;
}
function PostSkeleton({ width, reduce }: { width: number; reduce: boolean }) {
  return (
    <View style={{ width, alignSelf: "center", paddingTop: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12 }}>
        <Skeleton reduce={reduce} style={{ width: 36, height: 36, borderRadius: 18 }} />
        <View style={{ gap: 6 }}><Skeleton reduce={reduce} style={{ width: 150, height: 11, borderRadius: 6 }} /><Skeleton reduce={reduce} style={{ width: 90, height: 9, borderRadius: 5 }} /></View>
      </View>
      <Skeleton reduce={reduce} style={{ width, height: width }} />
      <View style={{ padding: 12, gap: 8 }}><Skeleton reduce={reduce} style={{ width: 120, height: 11, borderRadius: 6 }} /><Skeleton reduce={reduce} style={{ width: "90%", height: 10, borderRadius: 5 }} /></View>
    </View>
  );
}

// ---------- the post ----------
type PostProps = {
  item: Item; index: number; width: number; active: boolean; sound: boolean; muted: boolean; onMute: () => void; engine: VerseEngine; lang: string;
  reciter: Reciter; nameOf: (s: number) => string; reduce: boolean; stories: ReturnType<typeof useStories>; quota: ReturnType<typeof useStoryQuota>;
  onShare: (s: ShareItem, quick?: boolean) => void; onComments: (key: string) => void; onMenu: (item: Item) => void;
};

const toArDigits = (n: string) => n.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
function arabicSize(n: number) { return n < 70 ? 28 : n < 160 ? 23 : n < 320 ? 18 : n < 520 ? 14.5 : 12; }

/** what the media square shows */
type Media = { tone: [string, string]; label: string; arabic?: string; body?: string; big?: boolean };

const Post = memo(function Post(p: PostProps) {
  const tx = useFeedText();
  const pt = useProphetText();
  const ws = useWebT("social");
  const wp = useWebT("player");
  const ttx = useTemplateText();
  const t = useTheme();
  const isVerse = /^[vw]:/.test(p.item);
  const verseKey = isVerse ? p.item.slice(2) : "";
  const storyId = p.item.startsWith("s:") ? p.item.slice(2) : "";
  const story = storyId ? p.stories.byId.get(storyId) : undefined;
  const nameIdx = p.item.startsWith("n:") ? Number(p.item.slice(2)) : -1;
  const name = nameIdx >= 0 ? p.stories.names[nameIdx] : undefined;
  const hadith = p.item.startsWith("h:") ? HADITH.get(p.item) : undefined;

  // ----- verse data -----
  const [data, setData] = useState<FeedVerse | null>(null);
  const sig = `${p.lang}|${p.reciter.folder}`;
  useEffect(() => {
    if (!verseKey) return;
    let ok = true;
    setData(null);
    loadVerse(verseKey, p.lang, p.reciter).then((d) => { if (ok) setData(d); }).catch(() => undefined);
    return () => { ok = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verseKey, sig]);

  const reciterLabel = reciterName(p.reciter, p.lang);
  const a = p.engine;
  useEffect(() => {
    if (!p.active || !data) return;
    if (!p.sound) { if (a.url === data.audio) a.pause(); return; }
    const snap = a.getSnapshot();
    if (a.url === data.audio && !snap.ended && snap.loadedUrl) a.resume();
    else a.play(data.audio, { fallback: data.fallback || undefined, title: `${p.nameOf(data.s)} ${data.key}`, artist: reciterLabel });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.active, p.sound, data]);

  // ----- like / save -----
  const like = useVerseLike(verseKey || "1:1", p.active && !!verseKey);
  const [lLocal, toggleLocalLike] = useLocalFlag("tf:feed-likes", p.item);
  const marks = useStored<string[]>("tf:bookmarks", []);
  const saves = useStored<string[]>(SAVED_KEY, []);
  const hSaves = useStored<HadithItem[]>(HADITH_SAVED_KEY, []);
  const nSaves = useStored<string[]>(SAVED_NAMES_KEY, []);
  const liked = verseKey ? like.liked : lLocal;
  const saved = verseKey ? marks.includes(verseKey) : hadith ? hSaves.some((x) => x.id === hadith.item.id) : name ? nSaves.includes(name.ar) : saves.includes(storyId);
  const pop = useRef(new Animated.Value(1)).current;
  const popSave = useRef(new Animated.Value(1)).current;
  const bump = (v: Animated.Value) => { if (!p.reduce) Animated.sequence([Animated.timing(v, { toValue: 1.12, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }), Animated.timing(v, { toValue: 1, duration: 220, easing: Easing.inOut(Easing.quad), useNativeDriver: true })]).start(); };
  const doLike = () => { tick(); if (!liked) bump(pop); if (verseKey) void like.toggle(); else { if (!liked) statLike(); toggleLocalLike(); } if (!liked) engaged(kindOfItem(p.item), "like"); };
  const doSave = () => {
    tick(); bump(popSave);
    if (!saved) { statSave(); engaged(kindOfItem(p.item), "save"); if (++savesThisSession === 3) nudgeAccount(); }
    if (verseKey) { const cur = readJSON<string[]>("tf:bookmarks", []); writeJSON("tf:bookmarks", cur.includes(verseKey) ? cur.filter((k) => k !== verseKey) : [...cur, verseKey]); }
    else if (storyId) toggleSavedStory(storyId);
    else if (hadith) toggleSavedHadith(hadith.item);
    else if (name) toggleSavedName(name.ar);
  };
  const [burst, setBurst] = useState(0);
  const gestures = useTapGestures({
    onTap: () => { if (verseKey) p.onMute(); },
    onDouble: () => { setBurst((n) => n + 1); if (!liked) doLike(); },
  });

  // ----- Ken Burns: a slow zoom while the post is the visible one (not with Reduce Motion) -----
  const zoom = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!p.active || p.reduce) { zoom.stopAnimation(); zoom.setValue(0); return; }
    const an = Animated.timing(zoom, { toValue: 1, duration: 18000, easing: Easing.linear, useNativeDriver: true });
    an.start();
    return () => an.stop();
  }, [p.active, p.reduce, zoom]);

  // ----- what to show -----
  const surahNo = verseKey ? Number(verseKey.split(":")[0]) : 0;
  const surahName = verseKey ? p.nameOf(surahNo) : "";
  const votd = verseKey ? (VERSES_OF_THE_DAY as readonly string[]).includes(verseKey) : false;
  const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(" ", n))} …`);
  let account = "Quran Masterclass"; let sub = ""; let icon: IconName = "book"; let initials = ""; let caption = ""; let captionHead = ""; let when = "";
  let media: Media | null = null; let tone: [string, string] = toneOf(p.item);
  if (verseKey) {
    tone = toneOf(verseKey);
    account = `Quran Masterclass · ${surahName}`; sub = reciterLabel; initials = reciterLabel.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    captionHead = `${surahName} · ${verseKey}`; caption = data?.translation ?? ""; when = votd ? tx.votd : tx.verseLabel;
    media = { tone, label: `${surahName} · ${verseKey}`, arabic: data?.arabic, body: data?.translation };
  } else if (story) {
    tone = toneOf(story.group);
    account = story.groupTitle; sub = story.kicker ?? ""; icon = story.cat === "reciters" ? "user" : story.cat === "tips" ? "cap" : story.cat === "secrets" ? "starBig" : "mosque";
    captionHead = story.title; caption = story.paragraphs[0] ?? story.points?.items.join(" · ") ?? ""; when = story.groupTitle;
    media = { tone, label: story.groupTitle, arabic: story.arabic, body: clip(story.paragraphs.join(" ") || (story.points?.items.join(" · ") ?? ""), 260), big: true };
  } else if (name) {
    tone = toneOf(`name:${name.latin}`);
    account = tx.nameTitle; sub = "Quran Masterclass"; icon = "hands"; captionHead = name.latin; caption = name.meaning; when = tx.nameTitle;
    media = { tone, label: tx.nameTitle, arabic: name.ar, body: `${name.latin} · ${name.meaning}`, big: true };
  } else if (hadith) {
    tone = toneOf(`hadith:${hadith.source}`);
    const h = hadith.item;
    account = h.collectionName || tx.hadith; sub = [hadith.narrator, hadith.grade].filter(Boolean).join(" · "); icon = "book";
    captionHead = hadith.source; caption = hadith.text; when = [tx.hadith, h.credit].filter(Boolean).join(" · ");
    media = { tone, label: hadith.source, arabic: hadith.arabic ? clip(hadith.arabic, 420) : undefined, body: clip(hadith.text, hadith.arabic ? 200 : 360), big: false };
  }
  const [open, setOpen] = useState(false);
  // the design of the post and of its share image (features/share/formats.ts paletteFor, same seed as feedShare.tsx)
  const palSeed = verseKey || (story ? story.group : name ? `name:${name.latin}` : hadith ? `hadith:${hadith.item.collection}` : p.item);
  const pal = PALETTES[paletteFor(palSeed)];
  if (!media) return <View style={{ height: 1 }} />;
  const count = verseKey ? like.count : null;
  const n = Intl.NumberFormat(p.lang).format(count ?? 0);
  const likeLine = count === null ? "" : liked && count > 1 ? fillText(tx.likedByYou, { n: Intl.NumberFormat(p.lang).format(count - 1) }) : count === 1 ? tx.like1 : fillText(tx.likesN, { n });
  const W = p.width; const k = W / 360;
  const long = caption.length > 110;
  const onShare = (quick = false) => { engaged(kindOfItem(p.item), "share"); if (verseKey && data) p.onShare({ kind: "verse", v: data }, quick); else if (story) p.onShare({ kind: "story", s: story }, quick); else if (name) p.onShare({ kind: "name", n: name }, quick); else if (hadith) p.onShare({ kind: "hadith", h: hadith }, quick); };
  const label = [account, media.label, media.body ?? ""].filter(Boolean).join(". ");

  return (
    <View style={{ width: W, alignSelf: "center", paddingBottom: 14 }}>
      {/* header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, height: 56 }}>
        <LinearGradient colors={[...GOLD_RING]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 38, height: 38, borderRadius: 19, padding: 1.5 }} accessibilityElementsHidden>
          <View style={{ flex: 1, borderRadius: 17, padding: 1.5, backgroundColor: t.bg }}>
            <LinearGradient colors={tone} style={{ flex: 1, borderRadius: 16, alignItems: "center", justifyContent: "center" }}>
              {initials ? <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 11.5, color: "rgb(233,207,153)" }}>{initials}</Text> : <Icon name={icon} color="rgb(233,207,153)" size={17} />}
            </LinearGradient>
          </View>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 14, letterSpacing: -0.1, color: t.ink }}>{account}</Text>
          {sub ? <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 11.5, letterSpacing: 0.2, color: t.muted }}>{sub}</Text> : null}
        </View>
        {verseKey ? <LearnLink href={`/shams/${surahNo}?v=${verseKey.split(":")[1]}`} label={tx.learnThis} />
          : story ? <LearnLink href={story.href} label={tx.learnThis} />
          : name ? <LearnLink href="/islam/names" label={tx.learnThis} /> : null}
        {/* the options (PostMenu): only for posts that have some (verse, story, name, hadith), never a button that does nothing */}
        {verseKey || story || name || hadith ? (
          <Pressable onPress={() => p.onMenu(p.item)} accessibilityRole="button" accessibilityLabel={tx.options} hitSlop={10} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
            <View style={{ flexDirection: "row", gap: 3.5 }}>{[0, 1, 2].map((i) => <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: t.ink }} />)}</View>
          </Pressable>
        ) : null}
      </View>

      {/* media: the verse / story card, square */}
      <View style={{ width: W, height: W, overflow: "hidden", backgroundColor: stage.deep }}>
        <Pressable {...gestures} accessible accessibilityRole="image" accessibilityLabel={label} accessibilityHint={verseKey ? tx.hint : undefined} style={{ flex: 1 }}>
          <Animated.View style={{ flex: 1, transform: p.reduce ? undefined : [{ scale: zoom.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }, { translateX: zoom.interpolate({ inputRange: [0, 1], outputRange: [0, -6 * k] }) }] }}>
            {/* the post in its design (the same as its share image): ground, girih, gold frame with khatam corners */}
            <ShareGround p={pal} w={W} h={W} seed={palSeed} />
            <ShareFrame p={pal} w={W} h={W} l={LAYOUT.square} />
            <View style={{ flex: 1, paddingHorizontal: 30 * k, paddingTop: 30 * k, paddingBottom: 22 * k, justifyContent: "space-between" }}>
              <View style={{ alignItems: "center", gap: 6 }}>
                <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 11 * k, letterSpacing: 1.8, color: pal.accent }}>{media.label}</Text>
                <OrnamentRule p={pal} width={104 * k} />
              </View>
              <View style={{ gap: 8 * k, alignItems: "center", flexShrink: 1, overflow: "hidden" }}>
                {media.arabic ? (
                  <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={media.big ? 2 : 14} adjustsFontSizeToFit minimumFontScale={0.45}
                    style={{ fontFamily: media.big ? ARABIC_BOLD : ARABIC_FONT, fontSize: (media.big ? 34 : arabicSize(media.arabic.length)) * k, lineHeight: (media.big ? 34 : arabicSize(media.arabic.length)) * k * 1.85, color: pal.arabic, textAlign: "center", writingDirection: "rtl" }}>
                    {media.arabic}{verseKey ? <Text style={{ color: pal.accent, fontSize: arabicSize(media.arabic.length) * k * 0.78 }}>{` \uFD3F${toArDigits(verseKey.split(":")[1])}\uFD3E`}</Text> : null}
                  </Text>
                ) : !media.big ? <Text style={{ alignSelf: "center", fontFamily: FONT.regular, fontSize: 13, color: pal.muted }}>{tx.loading}</Text> : null}
                {media.arabic && media.body ? <OrnamentRule p={pal} width={56 * k} /> : null}
                {media.body ? (
                  <Text allowFontScaling={false} numberOfLines={media.big ? 6 : (media.arabic?.length ?? 0) > 320 ? 2 : (media.arabic?.length ?? 0) > 160 ? 3 : 4} adjustsFontSizeToFit minimumFontScale={0.8}
                    style={{ fontFamily: verseKey || hadith ? "Fraunces_400Regular_Italic" : FONT.regular, fontSize: (media.big ? 14.5 : 14) * k, lineHeight: (media.big ? 14.5 : 14) * k * 1.5, color: pal.soft, textAlign: "center" }}>{media.body}</Text>
                ) : null}
              </View>
              <View style={{ alignItems: "center" }}><Wordmark tone={pal.wordmark} height={18 * k} /></View>
            </View>
          </Animated.View>
          <HeartBurst n={burst} reduce={p.reduce} />
        </Pressable>
        {verseKey ? (
          <Pressable onPress={p.onMute} accessibilityRole="button" accessibilityLabel={p.muted ? tx.unmute : tx.mute} accessibilityState={{ selected: !p.muted }} hitSlop={8}
            style={{ position: "absolute", end: 16, bottom: 16, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,28,21,0.7)", borderWidth: StyleSheet.hairlineWidth, borderColor: stage.goldSoft }}>
            <SpeakerIcon muted={p.muted} color={stage.cream} size={16} />
          </Pressable>
        ) : null}
      </View>

      {/* actions */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, height: 46 }}>
        <IconBtn label={ws("like")} selected={liked} onPress={doLike} scale={pop}><Icon name="heart" filled={liked} color={liked ? HEART : t.ink} size={25} /></IconBtn>
        {verseKey ? <IconBtn label={tx.viewComments} onPress={() => p.onComments(verseKey)}><Icon name="comment" color={t.ink} size={24} /></IconBtn> : null}
        <IconBtn label={ws("share")} onPress={() => onShare()} disabled={!!verseKey && !data}><Icon name="send" color={t.ink} size={24} /></IconBtn>
        <View style={{ flex: 1 }} />
        {/* one tap: the post as a story image (the share template) straight to the system sheet */}
        <Pressable onPress={() => onShare(true)} disabled={!!verseKey && !data} accessibilityRole="button" accessibilityLabel={ttx.shareStory} hitSlop={4}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 7, height: 34, paddingHorizontal: 13, marginEnd: 2, borderRadius: R.pill, borderWidth: 1, borderColor: t.gold, backgroundColor: t.dark ? "rgba(214,178,106,0.12)" : "rgba(150,116,52,0.08)", opacity: !!verseKey && !data ? 0.4 : pressed ? 0.7 : 1 })}>
          <StoryGlyph color={t.gold} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{ttx.story}</Text>
        </Pressable>
        <IconBtn label={saved ? wp("bookmarked") : wp("bookmark")} selected={saved} onPress={doSave} scale={popSave}><Icon name="bookmark" filled={saved} color={saved ? stage.gold : t.ink} size={24} /></IconBtn>
      </View>

      {/* likes, caption, label */}
      <View style={{ paddingHorizontal: 14, gap: 4 }}>
        {likeLine ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{likeLine}</Text> : null}
        <Text numberOfLines={open ? undefined : 2} style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.ink }}>
          <Text style={{ fontFamily: FONT.semibold }}>{captionHead}</Text>{caption ? `  ${caption}` : ""}
        </Text>
        {long && !open ? <Pressable onPress={() => setOpen(true)} accessibilityRole="button" hitSlop={6}><Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{tx.moreCaption}</Text></Pressable> : null}
        {verseKey ? <Pressable onPress={() => p.onComments(verseKey)} accessibilityRole="button" hitSlop={6}><Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{tx.viewComments}</Text></Pressable> : null}
        <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: t.gold, marginTop: 3 }}>{when}</Text>
      </View>
      <View style={{ alignItems: "center", marginTop: 16 }}><Rule width={W * 0.42} color={t.dark ? "rgba(214,180,108,0.4)" : "rgba(150,116,52,0.35)"} /></View>
    </View>
  );
});

function IconBtn({ children, label, onPress, selected, disabled, scale }: { children: React.ReactNode; label: string; onPress: () => void; selected?: boolean; disabled?: boolean; scale?: Animated.Value }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected, disabled }} hitSlop={4}
      style={({ pressed }) => ({ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : pressed ? 0.6 : 1 })}>
      <Animated.View style={scale ? { transform: [{ scale }] } : undefined}>{children}</Animated.View>
    </Pressable>
  );
}

// ---------- the "…" menu of a post ----------
function PostMenu({ item, onClose, stories, onShare, onVoices }: { item: Item | null; onClose: () => void; stories: ReturnType<typeof useStories>; onShare: (s: ShareItem) => void; onVoices: () => void }) {
  const voice = useFeedVoice();
  const tx0 = useFeedText();
  const tx = useFeedText();
  const pt = useProphetText();
  const ws = useWebT("social");
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { lang } = useLang();
  const reciter = item ? voice.voiceFor(item) : voice.reciter;
  const verseKey = item && /^[vw]:/.test(item) ? item.slice(2) : "";
  const story = item?.startsWith("s:") ? stories.byId.get(item.slice(2)) : undefined;
  const name = item?.startsWith("n:") ? stories.names[Number(item.slice(2))] : undefined;
  const hSaves = useStored<HadithItem[]>(HADITH_SAVED_KEY, []);
  const [s, v] = verseKey.split(":");
  const go = (href: string) => { onClose(); router.push(href as Href); };
  const rows: { label: string; icon: IconName; onPress: () => void }[] = [];
  if (verseKey) {
    rows.push({ label: ws("share"), icon: "send", onPress: () => { void loadVerse(verseKey, lang, reciter).then((d) => onShare({ kind: "verse", v: d })).catch(onClose); } });
    rows.push({ label: tx.reader, icon: "book", onPress: () => go(`/quran/${s}?v=${v}`) });
    rows.push({ label: tx.learn, icon: "cap", onPress: () => go(`/shams/${s}?v=${v}`) });
    rows.push({ label: tx0.reciters, icon: "radio", onPress: onVoices });
  } else if (story) {
    rows.push({ label: ws("share"), icon: "send", onPress: () => onShare({ kind: "story", s: story }) });
    rows.push({ label: pt.readFull, icon: "book", onPress: () => go(story.href) });
  } else if (name) {
    // a name of Allah: share its image, or the whole list of the 99 names in the Islam library
    rows.push({ label: ws("share"), icon: "send", onPress: () => onShare({ kind: "name", n: name }) });
    rows.push({ label: tx.topicNames, icon: "book", onPress: () => go("/islam/names") });
  } else if (item?.startsWith("h:") && HADITH.get(item)) {
    const h = HADITH.get(item)!;
    const hSaved = hSaves.some((x) => x.id === h.item.id);
    rows.push({ label: ws("share"), icon: "send", onPress: () => onShare({ kind: "hadith", h }) });
    rows.push({ label: hSaved ? pt.unsave : pt.save, icon: "bookmark", onPress: () => { if (!hSaved) statSave(); toggleSavedHadith(h.item); onClose(); } });
    // the collection it comes from (Sunni collections and Thaqalayn books; the Nahj al-Balagha passages have their own page)
    const coll = h.item.source === "nahj" ? "/nahj" : `/hadith/${encodeURIComponent(h.item.collection)}`;
    if (h.item.collectionName) rows.push({ label: h.item.collectionName, icon: "book", onPress: () => go(coll) });
  }
  return (
    <Modal visible={!!item && rows.length > 0} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }} onPress={onClose} accessibilityLabel={tx.close} accessibilityRole="button">
        <View style={{ backgroundColor: t.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingBottom: insets.bottom + 8, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderColor: t.dark ? "rgba(214,180,108,0.35)" : "rgba(150,116,52,0.3)" }}>
          <View style={{ alignSelf: "center", width: 36, height: 4, borderRadius: 2, backgroundColor: t.line, marginBottom: 8 }} />
          {rows.map((r) => (
            <Pressable key={r.label} onPress={r.onPress} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, height: 52, backgroundColor: pressed ? t.accentSoft : "transparent" })}>
              <Icon name={r.icon} color={t.gold} size={21} />
              <Text style={{ fontFamily: FONT.medium, fontSize: 15.5, color: t.ink }}>{r.label}</Text>
            </Pressable>
          ))}
          <Pressable onPress={onClose} accessibilityRole="button" style={{ height: 52, alignItems: "center", justifyContent: "center", borderTopWidth: 1, borderTopColor: t.line, marginTop: 4 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.muted }}>{tx.close}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
