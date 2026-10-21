import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, FlatList, Modal, Pressable, RefreshControl, ScrollView, Text, View, useWindowDimensions, type ListViewToken } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Icon, type IconName } from "@/components/icons";
import { LogoMark } from "@/components/brand";
import { goBack } from "@/components/page";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { SITE } from "@/lib/api";
import { AR_RIGHT, ARABIC_FONT, CALLIG_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { getChapters, reciterName, type Chapter } from "@/lib/quran";
import { useReciter } from "@/features/quran/reciter";
import { VerseEngine } from "@/features/quran/useVerseAudio";
import { useReducedMotionX } from "@/features/extra/motion";
import { CommentsSheet } from "@/features/extra";
import { HEART } from "@/features/extra/SocialBar";
import { VERSES_OF_THE_DAY } from "@/web/votd";
import { StoryViewer } from "@/features/prophet/StoryViewer";
import { SAVED_KEY, SEEN_KEY, toggleSavedStory, useStories, useStoryQuota } from "@/features/prophet/useStories";
import { useProphetText } from "@/features/prophet/texts";
import { StoryShareCard } from "@/features/prophet/StoryShareCard";
import type { AllahName, Story, StoryGroup } from "@/features/prophet/stories";
import { FeedBackdrop, SpeakerIcon, toneOf } from "./art";
import { tick } from "./haptics";
import { BrandFoot, ShareSheet } from "./share";
import { DiscoverFeed, loadVerse, type FeedVerse } from "./source";
import { countShare, useVerseLike } from "./useLike";
import { fillText, useFeedText } from "./texts";
import { VerseShareCard } from "./VerseShareCard";
import { HeartBurst, useTapGestures } from "./ui";

// The Instagram home-feed view of /feed: logo bar, a stories rail, then one post after the other. A post is a square
// card (the verse or story drawn like the share image) with a slow Ken Burns zoom; the recitation of the post that is
// at least 60 % visible plays, muted by default with the speaker toggle in the corner. Content only from the vetted
// sources (source.ts / library stories); the recitation voice is the one the account may use (useReciter).
const MUTE_KEY = "qmc.home-muted";
const MAX_W = 560;
const BAR_H = 52;
const TABS_H = 40;
type Item = string;
type ShareItem = { kind: "verse"; v: FeedVerse } | { kind: "story"; s: Story } | { kind: "name"; n: AllahName };

/** a local-only flag per id (likes and saves of story posts) */
function useLocalFlag(storageKey: string, id: string) {
  const list = useStored<string[]>(storageKey, []);
  const on = list.includes(id);
  const toggle = useCallback(() => {
    const cur = readJSON<string[]>(storageKey, []);
    writeJSON(storageKey, cur.includes(id) ? cur.filter((k) => k !== id) : [...cur, id], true);
  }, [storageKey, id]);
  return [on, toggle] as const;
}

export function HomeFeed({ tab, onTab }: { tab: "home" | "reels"; onTab: (t: "home" | "reels") => void }) {
  const tx = useFeedText();
  const pt = useProphetText();
  const t = useTheme();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduce = useReducedMotionX();
  const [reciter] = useReciter();
  const [engine] = useState(() => new VerseEngine());
  useEffect(() => () => engine.dispose(), [engine]);
  const stories = useStories();
  const quota = useStoryQuota();
  const seen = useStored<string[]>(SEEN_KEY, []);

  const [keys, setKeys] = useState<Item[]>([]);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(() => readJSON<boolean>(MUTE_KEY, true));
  const [focused, setFocused] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [share, setShare] = useState<ShareItem | null>(null);
  const [comments, setComments] = useState<string | null>(null);
  const [menu, setMenu] = useState<Item | null>(null);
  const [viewer, setViewer] = useState<{ group: number; story: number } | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const list = useRef<FlatList<Item>>(null);
  const discover = useRef<DiscoverFeed | null>(null);
  const latest = useRef({ stories, quota });
  latest.current = { stories, quota };
  const activeRef = useRef(0);
  activeRef.current = active;

  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  const nameOf = useCallback((s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${s}`, [chapters]);
  useFocusEffect(useCallback(() => { setFocused(true); return () => { setFocused(false); engine.pause(); }; }, [engine]));

  // the post sequence: "For you" of the reels view (verses, words, names, story cards), restarted on pull-to-refresh
  const build = useCallback(() => {
    const { stories: st, quota: q } = latest.current;
    const ids = (k: keyof typeof st.groups) => st.groups[k].flatMap((g) => g.stories.map((x) => x.id));
    discover.current = new DiscoverFeed("foryou", { prophet: ids("prophet"), reciters: ids("reciters"), islam: ids("islam"), tips: ids("tips"), secrets: ids("secrets") }, st.names.length, lang !== "ar", undefined);
    return discover.current.next(8, q.left).filter((k) => k !== "pro");
  }, [lang]);
  const storiesReady = stories.byId.size > 0;
  useEffect(() => { engine.stop(); setKeys(build()); setActive(0); list.current?.scrollToOffset({ offset: 0, animated: false }); }, [build, storiesReady, reciter.folder, engine]);

  const more = useCallback(() => {
    const d = discover.current;
    if (!d) return;
    const queued = keys.slice(activeRef.current).filter((k) => k.startsWith("s:")).length;
    const add = d.next(6, Math.max(0, latest.current.quota.left - queued)).filter((k) => k !== "pro");
    if (add.length) setKeys((k) => [...k, ...add]);
  }, [keys]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    engine.stop();
    setTimeout(() => { setKeys(build()); setActive(0); setRefreshing(false); }, reduce ? 0 : 450);
  }, [build, engine, reduce]);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const first = viewableItems.find((x) => x.isViewable && x.index !== null);
    if (first && first.index != null) setActive(first.index);
  }).current;
  const viewConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  // stop the sound when the visible post has no recitation (story post) or the tab is left
  const activeItem = keys[active] ?? "";
  useEffect(() => { if (!/^[vw]:/.test(activeItem) || tab !== "home") engine.pause(); }, [activeItem, tab, engine]);
  const toggleMute = useCallback(() => { setMuted((m) => { const n = !m; writeJSON(MUTE_KEY, n, true); if (n) engine.pause(); return n; }); }, [engine]);
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

  // story circles of every category in one rail
  const groups = useMemo<StoryGroup[]>(() => (["prophet", "reciters", "islam", "tips", "secrets"] as const).flatMap((c) => stories.groups[c]), [stories]);

  const colW = Math.min(width, MAX_W);
  const render = useCallback(({ item, index }: { item: Item; index: number }) => (
    <Post item={item} index={index} width={colW} active={index === active && tab === "home"} sound={focused && !muted && tab === "home"} muted={muted} onMute={toggleMute}
      engine={engine} lang={lang} reciter={reciter} nameOf={nameOf} reduce={reduce} stories={stories} quota={quota}
      onShare={setShare} onComments={setComments} onMenu={setMenu} />
  ), [colW, active, tab, focused, muted, toggleMute, engine, lang, reciter, nameOf, reduce, stories, quota]);

  const sh = useMemo(() => {
    if (!share) return null;
    if (share.kind === "verse") {
      const v = share.v;
      return { link: `${SITE}/${lang}/surah/${v.s}?v=${v.v}`, message: `${v.translation ? `${v.translation}\n\n` : ""}Quran ${v.key}`, onShared: () => countShare(v.key), video: { key: v.key, lang },
        card: (f: "story" | "post") => <VerseShareCard format={f} arabic={v.arabic} translation={v.translation} reference={`${nameOf(v.s)} · ${v.key}`} tone={toneOf(v.key)} /> };
    }
    if (share.kind === "story") {
      const s = share.s;
      return { link: `${SITE}/${lang}${s.webPath}`, message: `${s.title}\n${s.groupTitle}`, card: (f: "story" | "post") => <StoryShareCard story={s} format={f} /> };
    }
    const n = share.n;
    const fake: Story = { id: "name", cat: "islam", group: `name:${n.latin}`, groupTitle: tx.nameTitle, arabic: "", title: n.latin, paragraphs: [], truncated: false, sources: [tx.nameSource], href: "/islam/names", webPath: "/islam/names" };
    return { link: `${SITE}/${lang}/islam/names`, message: `${n.ar} – ${n.latin}: ${n.meaning}`, card: (f: "story" | "post") => <StoryShareCard story={fake} format={f} lines={{ title: `${n.ar}\n${n.latin}`, body: n.meaning, arabic: n.ar }} /> };
  }, [share, lang, nameOf, tx.nameTitle, tx.nameSource]);

  const header = (
    <View style={{ paddingTop: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: t.line, marginBottom: 6 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 14, paddingVertical: 4 }} accessibilityLabel={tx.stories}>
        {groups.length ? groups.map((g, i) => <Bubble key={g.id} g={g} fresh={g.stories.some((s) => !seen.includes(s.id))} onPress={() => setViewer({ group: i, story: 0 })} />)
          : Array.from({ length: 6 }, (_, i) => <Skeleton key={i} reduce={reduce} style={{ width: 68, height: 68, borderRadius: 34, marginHorizontal: 5 }} />)}
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.dark ? "light" : "dark"} />
      <Animated.FlatList
        ref={list as never}
        data={keys}
        keyExtractor={(k: Item, i: number) => `${k}-${i}`}
        renderItem={render as never}
        extraData={`${active}|${muted}|${focused}|${tab}`}
        ListHeaderComponent={header}
        ListFooterComponent={<View style={{ paddingBottom: insets.bottom + 24 }}><PostSkeleton width={colW} reduce={reduce} /></View>}
        ListEmptyComponent={<View><PostSkeleton width={colW} reduce={reduce} /></View>}
        contentContainerStyle={{ paddingTop: headerH, alignItems: "stretch" }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onEndReached={more}
        onEndReachedThreshold={2}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={60}
        windowSize={7}
        removeClippedSubviews
        onViewableItemsChanged={onViewable}
        viewabilityConfig={viewConfig}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} progressViewOffset={headerH} tintColor={t.accent} accessibilityLabel={tx.refresh} />}
      />

      <Animated.View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, top: 0, paddingTop: insets.top, backgroundColor: t.bg, borderBottomWidth: 1, borderBottomColor: t.line, transform: [{ translateY: barY }] }}>
        <View style={{ height: BAR_H, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14 }}>
          <Pressable onPress={toTop} accessibilityRole="button" accessibilityLabel="Quran Masterclass" style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
            <LogoMark size={30} />
            <Text style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>Quran Masterclass</Text>
          </Pressable>
          <Pressable onPress={() => goBack()} accessibilityRole="button" accessibilityLabel={tx.close} hitSlop={10} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
            <Icon name="close" color={t.ink} size={22} />
          </Pressable>
        </View>
        <View accessibilityRole="tablist" style={{ height: TABS_H, flexDirection: "row" }}>
          {(["home", "reels"] as const).map((k) => {
            const on = tab === k;
            return (
              <Pressable key={k} onPress={() => (on ? toTop() : onTab(k))} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ flex: 1, alignItems: "center", justifyContent: "center", borderBottomWidth: 2, borderBottomColor: on ? t.ink : "transparent" }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: on ? t.ink : t.muted }}>{k === "home" ? tx.home : tx.reels}</Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <PostMenu item={menu} onClose={() => setMenu(null)} stories={stories} onShare={(s) => { setMenu(null); setShare(s); }} />
      <CommentsSheet visible={!!comments} verseKey={comments ?? "1:1"} onClose={() => setComments(null)} />
      <StoryViewer groups={groups} start={viewer} onClose={() => setViewer(null)} />
      <ShareSheet visible={!!sh} onClose={() => setShare(null)} link={sh?.link ?? SITE} message={sh?.message ?? ""} onShared={sh?.onShared} video={sh?.video} renderCard={(f) => sh?.card(f) ?? null} />
    </View>
  );
}

// ---------- story circle ----------
const Bubble = memo(function Bubble({ g, fresh, onPress }: { g: StoryGroup; fresh: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${g.title}, ${g.stories.length}${fresh ? "" : ""}`} style={{ width: 78, alignItems: "center", gap: 5 }}>
      <LinearGradient colors={fresh ? ["#f3e2b6", "#c6a65e", "#8a6a2c"] : [t.line, t.line]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 72, height: 72, borderRadius: 36, padding: 2.5 }}>
        <View style={{ flex: 1, borderRadius: 34, padding: 2, backgroundColor: t.bg }}>
          <LinearGradient colors={toneOf(g.id)} style={{ flex: 1, borderRadius: 32, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: CALLIG_FONT, fontSize: 20, lineHeight: 40, color: "rgb(233,207,153)", paddingHorizontal: 6 }}>{g.arabic}</Text>
          </LinearGradient>
        </View>
      </LinearGradient>
      <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 11.5, color: fresh ? t.ink : t.muted, maxWidth: 76 }}>{g.title}</Text>
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
  reciter: ReturnType<typeof useReciter>[0]; nameOf: (s: number) => string; reduce: boolean; stories: ReturnType<typeof useStories>; quota: ReturnType<typeof useStoryQuota>;
  onShare: (s: ShareItem) => void; onComments: (key: string) => void; onMenu: (item: Item) => void;
};

function arabicSize(n: number) { return n < 70 ? 28 : n < 160 ? 23 : n < 320 ? 18 : n < 520 ? 14.5 : 12; }

/** what the media square shows */
type Media = { tone: [string, string]; label: string; arabic?: string; body?: string; big?: boolean };

const Post = memo(function Post(p: PostProps) {
  const tx = useFeedText();
  const pt = useProphetText();
  const ws = useWebT("social");
  const wp = useWebT("player");
  const t = useTheme();
  const isVerse = /^[vw]:/.test(p.item);
  const verseKey = isVerse ? p.item.slice(2) : "";
  const storyId = p.item.startsWith("s:") ? p.item.slice(2) : "";
  const story = storyId ? p.stories.byId.get(storyId) : undefined;
  const nameIdx = p.item.startsWith("n:") ? Number(p.item.slice(2)) : -1;
  const name = nameIdx >= 0 ? p.stories.names[nameIdx] : undefined;

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
  const liked = verseKey ? like.liked : lLocal;
  const saved = verseKey ? marks.includes(verseKey) : saves.includes(storyId);
  const pop = useRef(new Animated.Value(1)).current;
  const popSave = useRef(new Animated.Value(1)).current;
  const bump = (v: Animated.Value) => { if (!p.reduce) Animated.sequence([Animated.timing(v, { toValue: 1.3, duration: 110, useNativeDriver: true }), Animated.spring(v, { toValue: 1, friction: 4, useNativeDriver: true })]).start(); };
  const doLike = () => { tick(); if (!liked) bump(pop); if (verseKey) void like.toggle(); else toggleLocalLike(); };
  const doSave = () => {
    tick(); bump(popSave);
    if (verseKey) { const cur = readJSON<string[]>("tf:bookmarks", []); writeJSON("tf:bookmarks", cur.includes(verseKey) ? cur.filter((k) => k !== verseKey) : [...cur, verseKey]); }
    else if (storyId) toggleSavedStory(storyId);
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
  }
  const [open, setOpen] = useState(false);
  if (!media) return <View style={{ height: 1 }} />;
  const count = verseKey ? like.count : null;
  const n = Intl.NumberFormat(p.lang).format(count ?? 0);
  const likeLine = count === null ? "" : liked && count > 1 ? fillText(tx.likedByYou, { n: Intl.NumberFormat(p.lang).format(count - 1) }) : count === 1 ? tx.like1 : fillText(tx.likesN, { n });
  const W = p.width; const k = W / 360;
  const long = caption.length > 110;
  const onShare = () => { if (verseKey && data) p.onShare({ kind: "verse", v: data }); else if (story) p.onShare({ kind: "story", s: story }); else if (name) p.onShare({ kind: "name", n: name }); };
  const label = [account, media.label, media.body ?? ""].filter(Boolean).join(". ");

  return (
    <View style={{ width: W, alignSelf: "center", paddingBottom: 14 }}>
      {/* header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, height: 56 }}>
        <LinearGradient colors={["#f3e2b6", "#c6a65e", "#8a6a2c"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 38, height: 38, borderRadius: 19, padding: 2 }} accessibilityElementsHidden>
          <View style={{ flex: 1, borderRadius: 17, padding: 1.5, backgroundColor: t.bg }}>
            <LinearGradient colors={tone} style={{ flex: 1, borderRadius: 16, alignItems: "center", justifyContent: "center" }}>
              {initials ? <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 11.5, color: "rgb(233,207,153)" }}>{initials}</Text> : <Icon name={icon} color="rgb(233,207,153)" size={17} />}
            </LinearGradient>
          </View>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{account}</Text>
          {sub ? <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{sub}</Text> : null}
        </View>
        <Pressable onPress={() => p.onMenu(p.item)} accessibilityRole="button" accessibilityLabel={tx.options} hitSlop={10} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
          <View style={{ flexDirection: "row", gap: 3.5 }}>{[0, 1, 2].map((i) => <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: t.ink }} />)}</View>
        </Pressable>
      </View>

      {/* media: the verse / story card, square */}
      <View style={{ width: W, height: W, overflow: "hidden", backgroundColor: stage.deep }}>
        <Pressable {...gestures} accessible accessibilityRole="image" accessibilityLabel={label} accessibilityHint={verseKey ? tx.hint : undefined} style={{ flex: 1 }}>
          <Animated.View style={{ flex: 1, transform: p.reduce ? undefined : [{ scale: zoom.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }, { translateX: zoom.interpolate({ inputRange: [0, 1], outputRange: [0, -6 * k] }) }] }}>
            <FeedBackdrop tone={media.tone} width={W} height={W} still />
            <View style={{ flex: 1, paddingHorizontal: 24 * k, paddingTop: 22 * k, paddingBottom: 16 * k, justifyContent: "space-between" }}>
              <View style={{ alignItems: "center", gap: 6 }}>
                <View style={{ width: 40, height: 1, backgroundColor: stage.goldSoft }} />
                <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 11 * k, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{media.label}</Text>
              </View>
              <View style={{ gap: 12 * k }}>
                {media.arabic ? (
                  <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={media.big ? 2 : 14} adjustsFontSizeToFit minimumFontScale={0.45}
                    style={{ fontFamily: ARABIC_FONT, fontSize: (media.big ? 30 : arabicSize(media.arabic.length)) * k, lineHeight: (media.big ? 30 : arabicSize(media.arabic.length)) * k * 1.85, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{media.arabic}</Text>
                ) : !media.big ? <Text style={{ alignSelf: "center", fontFamily: FONT.regular, fontSize: 13, color: stage.textMuted }}>{tx.loading}</Text> : null}
                {media.body ? (
                  <Text allowFontScaling={false} numberOfLines={media.big ? 6 : (media.arabic?.length ?? 0) > 320 ? 2 : 5}
                    style={{ fontFamily: FONT.regular, fontSize: (media.big ? 14 : 13.5) * k, lineHeight: (media.big ? 14 : 13.5) * k * 1.5, color: "rgba(255,255,255,0.86)", textAlign: "center" }}>{media.body}</Text>
                ) : null}
              </View>
              <BrandFoot />
            </View>
          </Animated.View>
          <HeartBurst n={burst} reduce={p.reduce} />
        </Pressable>
        {verseKey ? (
          <Pressable onPress={p.onMute} accessibilityRole="button" accessibilityLabel={p.muted ? tx.unmute : tx.mute} accessibilityState={{ selected: !p.muted }} hitSlop={8}
            style={{ position: "absolute", end: 10, bottom: 10, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.55)" }}>
            <SpeakerIcon muted={p.muted} color="#fff" size={17} />
          </Pressable>
        ) : null}
      </View>

      {/* actions */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, height: 46 }}>
        <IconBtn label={ws("like")} selected={liked} onPress={doLike} scale={pop}><Icon name="heart" filled={liked} color={liked ? HEART : t.ink} size={25} /></IconBtn>
        {verseKey ? <IconBtn label={tx.viewComments} onPress={() => p.onComments(verseKey)}><Icon name="comment" color={t.ink} size={24} /></IconBtn> : null}
        <IconBtn label={ws("share")} onPress={onShare} disabled={!!verseKey && !data}><Icon name="share" color={t.ink} size={24} /></IconBtn>
        <View style={{ flex: 1 }} />
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
        <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase", color: t.muted, marginTop: 2 }}>{when}</Text>
      </View>
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
function PostMenu({ item, onClose, stories, onShare }: { item: Item | null; onClose: () => void; stories: ReturnType<typeof useStories>; onShare: (s: ShareItem) => void }) {
  const tx = useFeedText();
  const pt = useProphetText();
  const ws = useWebT("social");
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { lang } = useLang();
  const [reciter] = useReciter();
  const verseKey = item && /^[vw]:/.test(item) ? item.slice(2) : "";
  const story = item?.startsWith("s:") ? stories.byId.get(item.slice(2)) : undefined;
  const [s, v] = verseKey.split(":");
  const go = (href: string) => { onClose(); router.push(href as Href); };
  const rows: { label: string; icon: IconName; onPress: () => void }[] = [];
  if (verseKey) {
    rows.push({ label: ws("share"), icon: "share", onPress: () => { void loadVerse(verseKey, lang, reciter).then((d) => onShare({ kind: "verse", v: d })).catch(onClose); } });
    rows.push({ label: tx.reader, icon: "book", onPress: () => go(`/quran/${s}?v=${v}`) });
    rows.push({ label: tx.learn, icon: "cap", onPress: () => go(`/shams/${s}?v=${v}`) });
  } else if (story) {
    rows.push({ label: ws("share"), icon: "share", onPress: () => onShare({ kind: "story", s: story }) });
    rows.push({ label: pt.readFull, icon: "book", onPress: () => go(story.href) });
  }
  return (
    <Modal visible={!!item && rows.length > 0} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }} onPress={onClose} accessibilityLabel={tx.close} accessibilityRole="button">
        <View style={{ backgroundColor: t.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingBottom: insets.bottom + 8, paddingTop: 10 }}>
          <View style={{ alignSelf: "center", width: 36, height: 4, borderRadius: 2, backgroundColor: t.line, marginBottom: 8 }} />
          {rows.map((r) => (
            <Pressable key={r.label} onPress={r.onPress} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, height: 52, backgroundColor: pressed ? t.accentSoft : "transparent" })}>
              <Icon name={r.icon} color={t.ink} size={22} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink }}>{r.label}</Text>
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
