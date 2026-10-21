import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Modal, Pressable, RefreshControl, ScrollView, Text, View, useWindowDimensions, type ListViewToken } from "react-native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Icon } from "@/components/icons";
import { goBack } from "@/components/page";
import { useLang } from "@/i18n";
import { ARABIC_FONT, FONT, R, stage } from "@/lib/theme";
import { readJSON, writeJSON } from "@/lib/store";
import { getChapters, reciterName, type Chapter } from "@/lib/quran";
import { VerseEngine } from "@/features/quran/useVerseAudio";
import { useReducedMotionX } from "@/features/extra/motion";
import { VERSE_COUNTS } from "@/web/counts";
import { readTradition } from "@/lib/tradition";
import { useStories, useStoryQuota } from "@/features/prophet/useStories";
import { useProphetText } from "@/features/prophet/texts";
import type { AllahName, Story } from "@/features/prophet/stories";
import { SpeakerIcon } from "./art";
import { FeedPage } from "./FeedPage";
import { HadithPage, NamePage, ProPage, StoryPage } from "./StoryPage";
import { HADITH_AVAILABLE, hadithFeedItems, type HadithFeedItem } from "./hadith";
import { SpecShareSheet, hadithSpec, nameSpec, storySpec, useShareCtx, verseSpec } from "@/features/share/feedShare";
import { FeedEmpty, useStalled } from "./ui";
import { tick } from "./haptics";
import { LibScheduler, isLibId, takeRemoteNew } from "./library";
import { loadRemoteConfig } from "./remote";
import { wasSeen } from "./seen";
import { LibraryPost } from "./LibraryPost";
import { KnowledgePage, isKnowId } from "./KnowledgePost";
import { LIB } from "./library";
import { kindOfItem, statPost, statVerse, useFeedTimer } from "./statsStore";
import { rand } from "./source";
import { isCarouselId, isWisdomId } from "@/features/carousel/registry";
import { CarouselReel, WisdomReel } from "@/features/carousel/Posts";
import { DiscoverFeed, FEED_CATS, keyOfItem, loadVerse, preloadSurah, surahKeys, validKey, type FeedCat, type FeedMode, type FeedVerse } from "./source";
import { countShare } from "./useLike";
import { useFeedText } from "./texts";
import { ReciterSheet, useFeedAudioGuard, useFeedVoice } from "./voice";
import { ClipPlayer } from "@/features/talents/Player";
import { T } from "@/features/talents/api";
import { useTT } from "@/features/talents/text";
import { useSijillFlags } from "@/features/sijill/config";
import { useST } from "@/features/sijill/text";

// The Quran Feed: an endless, full-screen vertical feed like Instagram Reels. Discover ("For you") mixes verses with
// word-of-the-verse cards, names of Allah and story cards (prophet, reciters, Islam then and now, tips, secrets);
// the chips narrow it to one kind. Surah mode walks through a surah verse by verse (and on into the next surah).
// Free accounts get every verse and FREE_STORIES_PER_DAY story cards a day, then the Pro card.
// Route params: ?mode=surah&s=18&v=10, ?key=2:255 (Discover starting with that verse), ?cat=prophet.
const MUTE_KEY = "qmc.feed-muted";
const AUTO_KEY = "qmc.feed-autoplay";
const STORY_MS = 8000; // story cards in "For you" stay about 8 s
const MUTED_VERSE_MS = 10000; // a muted verse (no recitation to wait for)
type ShareItem = { kind: "verse"; v: FeedVerse } | { kind: "story"; s: Story } | { kind: "name"; n: AllahName } | { kind: "hadith"; h: HadithFeedItem };

/** `start`: an item to open first (Explore / Saved), with its hadith data when it is one; `bottomSpace`: room for the
 *  floating tab bar when the feed lives in the Feed tab */
export function FeedScreen({ onHome, start, startHadith, bottomSpace = 0 }: { onHome?: () => void; start?: string; startHadith?: HadithFeedItem; bottomSpace?: number } = {}) {
  const params = useLocalSearchParams<{ mode?: string; s?: string; v?: string; key?: string; cat?: string }>();
  const tx = useFeedText();
  const pt = useProphetText();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduce = useReducedMotionX();
  const voice = useFeedVoice(); // the allowed voice(s): without Pro always a free reciter
  const reciter = voice.reciter;
  const [engine] = useState(() => new VerseEngine());
  useEffect(() => () => engine.dispose(), [engine]);
  const stories = useStories();
  const quota = useStoryQuota();

  const startS = Math.min(114, Math.max(1, Number(params.s) || 1));
  // Quran Talents: approved recitation clips of verified members as a separate reels stream
  const [talents, setTalents] = useState(false);
  const ttal = useTT();
  // Sijill (owner decision 21.10.2026): the clip stream only while posting is on; friends' achievements when configured
  const sflags = useSijillFlags();
  const postingOn = sflags.posting;
  const sst = useST();
  const [mode, setMode] = useState<FeedMode>(params.mode === "surah" || params.s ? "surah" : params.mode === "hadith" && HADITH_AVAILABLE ? "hadith" : "discover");
  const [autoplay, setAutoplay] = useState(() => readJSON<boolean>(AUTO_KEY, true));
  const [cat, setCat] = useState<FeedCat>(FEED_CATS.includes(params.cat as FeedCat) ? (params.cat as FeedCat) : "foryou");
  const [surah, setSurah] = useState(startS);
  const [keys, setKeys] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [pageH, setPageH] = useState(0);
  const [muted, setMuted] = useState(() => readJSON<boolean>(MUTE_KEY, false));
  const [voices, setVoices] = useState(false);
  const [share, setShare] = useState<ShareItem | null>(null);
  const [picker, setPicker] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const list = useRef<FlatList<string>>(null);
  const discover = useRef<DiscoverFeed | null>(null);
  const loadedSurahs = useRef(new Set<number>());
  const initialIndex = useRef(0);
  const startUsed = useRef(false);
  const activeRef = useRef(0);
  activeRef.current = active;
  // swipe down at the top: a fresh sequence
  const [gen, setGen] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const freshIds = useRef<string[]>([]);
  const lib = useRef<LibScheduler | null>(null);
  const hadith = useRef<{ byId: Map<string, HadithFeedItem>; cursor: string | null; loading: boolean; gen: number }>({ byId: new Map(), cursor: null, loading: false, gen: 0 });
  const latest = useRef({ stories, quota });
  latest.current = { stories, quota };

  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  const nameOf = useCallback((s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${s}`, [chapters]);

  // pause when another screen (reader, Shams, Pro) opens on top; play again when the feed is visible
  // also stops on tab switch, back gesture, app background and unmount
  const focused = useFeedAudioGuard(engine);
  useFeedTimer(focused);

  // the hadith stream (features/hadith via ./hadith): loops – when the source is through it starts again
  const nextHadith = useCallback((): string[] => {
    const h = hadith.current;
    if (h.loading) return [];
    h.loading = true;
    const gen = h.gen;
    void hadithFeedItems(lang, readTradition(), h.cursor).then((page) => {
      if (gen !== hadith.current.gen) return;
      h.cursor = page.cursor;
      const round = h.byId.size;
      const add = page.items.map((it, i) => { const id = `h:${round + i}`; h.byId.set(id, it); return id; });
      if (add.length) setKeys((k) => [...k, ...add]);
      // nothing at all on the first page: offline (the stream says so instead of staying blank)
      else if (!round) setHadithFailed(true);
    }).catch(() => { if (gen === hadith.current.gen && !h.byId.size) setHadithFailed(true); }).finally(() => { h.loading = false; });
    return [];
  }, [lang]);
  const [hadithFailed, setHadithFailed] = useState(false);

  const newDiscover = useCallback((c: FeedCat, first?: string) => {
    const { stories: st } = latest.current;
    const ids = (k: keyof typeof st.groups) => st.groups[k].flatMap((g) => g.stories.map((x) => x.id));
    return new DiscoverFeed(c, { prophet: ids("prophet"), reciters: ids("reciters"), islam: ids("islam"), tips: ids("tips"), secrets: ids("secrets") }, st.names.length, lang !== "ar", first);
  }, [lang]);

  // (re)build the list when the mode, the category, the surah, the language or the voice changes
  useEffect(() => {
    loadedSurahs.current = new Set();
    setHadithFailed(false);
    if (mode === "hadith") {
      hadith.current = { byId: new Map(), cursor: null, loading: false, gen: hadith.current.gen + 1 };
      initialIndex.current = 0;
      setKeys([]);
      nextHadith();
    } else if (mode === "discover") {
      const startKey = start && /^[vw]:/.test(start) && !startUsed.current ? start.slice(2) : params.key;
      if (startKey === start?.slice(2)) startUsed.current = true;
      discover.current = newDiscover(cat, cat === "foryou" || cat === "verses" ? (startKey && validKey(startKey) ? startKey : undefined) : undefined);
      initialIndex.current = 0;
      const first = discover.current.next(10, latest.current.quota.left);
      // opened from Explore / Saved: that item first (a verse already comes first through the DiscoverFeed)
      if (start && !startUsed.current && cat === "foryou" && !/^[vw]:/.test(start)) {
        startUsed.current = true;
        if (start.startsWith("h:") && startHadith) { hadith.current.byId.set(start, startHadith); first.unshift(start); }
        else if (!start.startsWith("h:")) first.unshift(start);
      }
      // after a pull-to-refresh: the new server posts first, then unseen before already seen
      const fresh = cat === "foryou" ? freshIds.current : [];
      freshIds.current = [];
      setKeys([...fresh, ...first.filter((k) => !wasSeen(k) && !fresh.includes(k)), ...first.filter((k) => wasSeen(k) && !fresh.includes(k))]);
    } else {
      const v = surah === startS ? Math.min(VERSE_COUNTS[surah - 1], Math.max(1, Number(params.v) || 1)) : 1;
      loadedSurahs.current.add(surah);
      void preloadSurah(surah, lang, reciter).catch(() => undefined);
      initialIndex.current = v - 1;
      setKeys(surahKeys(surah));
    }
    setActive(initialIndex.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, cat, surah, lang, voice.sig, gen]);

  const more = useCallback(() => {
    if (mode === "hadith") { nextHadith(); return; }
    if (mode === "discover") {
      const d = discover.current;
      if (d) {
        // stories already in the list count against today's allowance before they are seen
        const queued = keys.slice(activeRef.current).filter((k) => k.startsWith("s:")).length;
        const add0 = d.next(10, Math.max(0, latest.current.quota.left - queued));
        // "For you": the content libraries between the reels (variety rule in library.ts)
        if (cat === "foryou") { lib.current ??= new LibScheduler(lang, "all"); }
        const add = cat === "foryou" ? add0.flatMap((k) => (rand() < 0.35 ? [k, ...(lib.current?.take(1) ?? [])] : [k])) : add0;
        if (add.length) setKeys((k) => [...k, ...add]);
      }
      return;
    }
    // never-ending: after the last verse of a surah the next one, after an-Nas back to al-Fatiha
    setKeys((k) => {
      if (k.length - activeRef.current > 40) return k;
      const last = Number(k[k.length - 1]?.split(":")[1] ?? surah);
      const next = last >= 114 ? 1 : last + 1;
      void preloadSurah(next, lang, reciter).catch(() => undefined);
      return [...k, ...surahKeys(next)];
    });
  }, [mode, surah, lang, reciter, keys, cat]);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const first = viewableItems.find((x) => x.isViewable && x.index !== null);
    if (first?.index !== null && first?.index !== undefined) setActive(first.index);
  }).current;
  const viewConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  // a light haptic on each page change; the next reel's verse data (text, words, audio URL) is loaded ahead
  const firstPage = useRef(true);
  useEffect(() => {
    const it = keys[active];
    if (it) statPost(kindOfItem(it, LIB.get(it)?.kind), it);
    if (firstPage.current) { firstPage.current = false; return; }
    tick();
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const it = keys[active] ?? "";
    if (!/^[vw]:/.test(it) || !focused || muted) return;
    const id = setTimeout(statVerse, 4000);
    return () => clearTimeout(id);
  }, [active, keys, focused, muted]);
  useEffect(() => {
    for (const k of keys.slice(active + 1, active + 3)) { const vk = keyOfItem(k); if (vk) void loadVerse(vk, lang, voice.voiceFor(k)).then((d) => { void fetch(d.audio, { method: "HEAD" }).catch(() => undefined); }).catch(() => undefined); }
  }, [active, keys, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAuto = () => { const a = !autoplay; setAutoplay(a); writeJSON(AUTO_KEY, a, true); };
  const toggleMute = () => { const m = !muted; setMuted(m); writeJSON(MUTE_KEY, m, true); if (m) engine.pause(); };
  const switchMode = (m: FeedMode) => { if (talents) { setTalents(false); if (m === mode) return; } if (m === mode) { if (m === "surah") setPicker(true); return; } engine.stop(); setMode(m); };
  const pickSurah = (s: number) => { setPicker(false); engine.stop(); setSurah(s); setMode("surah"); };
  const pickCat = (c: FeedCat) => { if (c === cat) return; engine.stop(); setCat(c); };
  const later = useCallback(() => {
    if (cat !== "foryou" && cat !== "verses") { setCat("verses"); return; }
    const i = activeRef.current + 1;
    list.current?.scrollToIndex({ index: Math.min(i, keys.length - 1), animated: !reduce });
  }, [cat, keys.length, reduce]);

  // ---------- auto-play like Reels: when the recitation of a verse ends, the feed moves on by itself ----------
  const advance = useCallback(() => {
    const i = activeRef.current + 1;
    if (i >= keys.length) return;
    list.current?.scrollToIndex({ index: i, animated: !reduce }); // Reduce Motion: a cut instead of a scroll
  }, [keys.length, reduce]);
  const touched = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRef = useRef({ autoplay, focused, advance, item: "" });
  autoRef.current = { autoplay, focused, advance, item: keys[active] ?? "" };
  useEffect(() => { touched.current = false; }, [active]);
  useEffect(() => {
    let was = engine.getSnapshot().ended;
    return engine.subscribe(() => {
      const snap = engine.getSnapshot();
      const r = autoRef.current;
      if (snap.ended && !was && r.autoplay && r.focused && !touched.current && /^[vw]:/.test(r.item)) r.advance();
      was = snap.ended;
    });
  }, [engine]);
  useEffect(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    const item = keys[active] ?? "";
    if (!autoplay || !focused || !item) return;
    const verse = /^[vw]:/.test(item);
    const ms = verse ? (muted ? MUTED_VERSE_MS : 0) : (mode === "discover" && cat === "foryou" && /^[sn]:/.test(item)) || mode === "hadith" ? STORY_MS : 0;
    if (!ms) return;
    timer.current = setTimeout(() => { if (!touched.current) advance(); }, ms);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [active, autoplay, focused, muted, mode, cat, keys, advance]);
  const onTouch = () => { touched.current = true; if (timer.current) { clearTimeout(timer.current); timer.current = null; } };

  const activeKey = keyOfItem(keys[active] ?? "");
  const activeSurah = activeKey ? Number(activeKey.split(":")[0]) : surah;
    const chrome = mode === "discover" ? 40 : 0; // the category chips need room

  const renderItem = useCallback(({ item, index }: { item: string; index: number }) => {
    const common = { width, height: pageH, active: index === active, topInset: insets.top + chrome, bottomInset: insets.bottom + bottomSpace, reduce, engine, lang };
    if (item.startsWith("v:") || item.startsWith("w:")) {
      const key = item.slice(2);
      return <FeedPage {...common} verseKey={key} variant={item[0] === "w" ? "word" : "verse"} near={Math.abs(index - active) <= 2}
        sound={focused && !muted} reciter={voice.voiceFor(item)} reciterLabel={reciterName(voice.voiceFor(item), lang)} surahName={nameOf(Number(key.split(":")[0]))}
        onShare={(v) => setShare({ kind: "verse", v })} />;
    }
    if (item.startsWith("s:")) {
      const st = stories.byId.get(item.slice(2));
      if (!st) return <View style={{ width, height: pageH }} />;
      return <StoryPage {...common} story={st} allowed={quota.allowed(st.id)} onSeen={quota.mark} onShare={(s) => setShare({ kind: "story", s })} onLater={later} />;
    }
    if (item.startsWith("n:")) {
      const n = stories.names[Number(item.slice(2))];
      if (!n) return <View style={{ width, height: pageH }} />;
      return <NamePage {...common} name={n} onShare={(x) => setShare({ kind: "name", n: x })} />;
    }
    // carousels (slides swiped horizontally) and wisdom posts (features/carousel)
    if (isCarouselId(item)) return <CarouselReel id={item} width={width} height={pageH} topInset={insets.top + chrome} bottomInset={insets.bottom + bottomSpace} />;
    if (isWisdomId(item)) return <WisdomReel id={item} width={width} height={pageH} topInset={insets.top + chrome} bottomInset={insets.bottom + bottomSpace} />;
    // knowledge posts: a full-screen page of their own
    if (isKnowId(item)) return <KnowledgePage id={item} width={width} height={pageH} topInset={insets.top + chrome} bottomInset={insets.bottom + bottomSpace} active={index === active && focused} />;
    if (isLibId(item)) {
      return (
        <View style={{ width, height: pageH, justifyContent: "center", paddingTop: insets.top + chrome, paddingBottom: insets.bottom + bottomSpace, backgroundColor: stage.bg }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
            <LibraryPost id={item} width={Math.min(width, 560)} reduce={reduce} onDark active={index === active && focused} />
          </ScrollView>
        </View>
      );
    }
    if (item.startsWith("h:")) {
      const h = hadith.current.byId.get(item);
      return h ? <HadithPage {...common} item={h} onShare={(x) => setShare({ kind: "hadith", h: x })} /> : <View style={{ width, height: pageH }} />;
    }
    return <ProPage {...common} onLater={later} />;
  }, [width, pageH, active, focused, muted, lang, voice, nameOf, insets.top, insets.bottom, bottomSpace, chrome, reduce, engine, stories, quota, later]);

  // what the share sheet shares: the share templates (features/share/feedShare.tsx)
  const shareCtx = useShareCtx();
  const sh = useMemo(() => {
    if (!share) return null;
    if (share.kind === "verse") { const v = share.v; return verseSpec(shareCtx, v, nameOf(v.s), { onShared: () => countShare(v.key) }); }
    if (share.kind === "story") return storySpec(shareCtx, share.s);
    if (share.kind === "hadith") return hadithSpec(shareCtx, share.h);
    return nameSpec(shareCtx, share.n);
  }, [share, nameOf, shareCtx.lang, shareCtx.tt, shareCtx.stx]); // eslint-disable-line react-hooks/exhaustive-deps
  // an empty stream (the hadith mode before its first page, or offline): a spinner, then the reason with "Try again"
  const [stalled] = useStalled(keys.length === 0 && !talents, [mode, cat, surah, lang, gen]);

  const catLabel: Record<FeedCat, string> = { foryou: pt.catForYou, verses: pt.catVerses, prophet: pt.catProphet, reciters: pt.catReciters, islam: pt.catIslam, tips: pt.catTips };

  return (
    <View style={{ flex: 1, backgroundColor: stage.deep }} onTouchStart={onTouch} onLayout={(e) => {
      // a new size (rotation, iPad split view): the list is rebuilt at the page that was visible
      const h = Math.round(e.nativeEvent.layout.height);
      if (h !== pageH) { initialIndex.current = activeRef.current; setPageH(h); }
    }}>
      <StatusBar style="light" />
      {talents && postingOn ? (
        <ClipPlayer load={(c) => T.reels(c)} bottomSpace={bottomSpace} emptyText={ttal("noClipsFeed")} />
      ) : pageH > 0 && keys.length ? (
        <FlatList
          ref={list}
          key={`${mode}-${cat}-${surah}-${lang}-${pageH}`}
          data={keys}
          keyExtractor={(k, i) => `${k}-${i}`}
          renderItem={renderItem}
          extraData={active}
          pagingEnabled
          snapToInterval={pageH}
          snapToAlignment="start"
          disableIntervalMomentum
          decelerationRate="fast"
          refreshControl={<RefreshControl refreshing={refreshing} tintColor={stage.gold} colors={[stage.gold]} onRefresh={() => {
            engine.stop(); tick(); setRefreshing(true);
            void Promise.all([loadRemoteConfig(lang).catch(() => null), takeRemoteNew(lang).catch(() => [] as string[])]).then(([, ids]) => {
              freshIds.current = ids.filter((k) => !wasSeen(k));
              setGen((g) => g + 1); setRefreshing(false);
            });
          }} />}
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, i) => ({ length: pageH, offset: pageH * i, index: i })}
          initialScrollIndex={Math.min(initialIndex.current, keys.length - 1)}
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          windowSize={5}
          onEndReached={more}
          onEndReachedThreshold={3}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={viewConfig}
          accessibilityHint={tx.hint}
        />
      ) : pageH > 0 ? (
        <View style={{ flex: 1, justifyContent: "center", paddingTop: insets.top + 60, paddingBottom: insets.bottom + bottomSpace }}>
          <FeedEmpty onDark state={hadithFailed || stalled ? "failed" : "loading"} onRetry={() => { engine.stop(); setGen((g) => g + 1); }} />
        </View>
      ) : null}

      {/* top bar over the feed */}
      <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, top: 0, paddingTop: insets.top + 8 }}>
        <View pointerEvents="box-none" style={{ paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <RoundButton label={onHome ? tx.home : tx.close} onPress={() => { engine.stop(); if (onHome) onHome(); else goBack(); }}><Icon name="chevronLeft" color="#fff" size={22} /></RoundButton>
          {/* the modes scroll sideways when they do not fit between the buttons (long surah names, German, larger text) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", gap: 6 }} accessibilityRole="tablist">
            <Pill label={pt.catForYou} selected={!talents && mode === "discover"} onPress={() => switchMode("discover")} />
            <Pill label={mode === "surah" ? nameOf(activeSurah) : tx.surah} selected={!talents && mode === "surah"} onPress={() => switchMode("surah")} hint={tx.chooseSurah} chevron={mode === "surah"} />
            {HADITH_AVAILABLE ? <Pill label={tx.hadith} selected={!talents && mode === "hadith"} onPress={() => switchMode("hadith")} /> : null}
            {postingOn ? <Pill label={ttal("feedTab")} selected={talents} onPress={() => { engine.stop(); setTalents(true); }} /> : null}
            {sflags.momentsInFeed ? <Pill label={sst("tabMoments")} selected={false} onPress={() => { engine.stop(); router.push("/talents/friends" as Href); }} /> : null}
          </ScrollView>
          <RoundButton label={tx.reciters} onPress={() => setVoices(true)}><Icon name="radio" color={voice.rotate ? stage.gold : "#fff"} size={20} /></RoundButton>
          <RoundButton label={tx.autoplay} selected={autoplay} onPress={toggleAuto}><Icon name="repeat" color={autoplay ? stage.gold : "rgba(255,255,255,0.6)"} size={20} /></RoundButton>
          <RoundButton label={muted ? tx.unmute : tx.mute} selected={!muted} onPress={toggleMute}><SpeakerIcon muted={muted} color="#fff" /></RoundButton>
        </View>
        {mode === "discover" && !talents ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 12, gap: 6 }} accessibilityRole="tablist">
            {FEED_CATS.map((c) => <Chip key={c} label={catLabel[c]} selected={cat === c} onPress={() => pickCat(c)} />)}
          </ScrollView>
        ) : null}
      </View>

      {sh ? <SpecShareSheet spec={sh} onClose={() => setShare(null)} /> : null}

      <ReciterSheet visible={voices} onClose={() => setVoices(false)} dark />
      <SurahPicker visible={picker} chapters={chapters} current={activeSurah} onPick={pickSurah} onClose={() => setPicker(false)} />
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={label}
      style={{ height: 30, paddingHorizontal: 12, justifyContent: "center", borderRadius: R.pill, backgroundColor: selected ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.3)", borderWidth: 1, borderColor: selected ? "transparent" : "rgba(255,255,255,0.14)" }}>
      <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 13, color: selected ? stage.bg : "#fff" }}>{label}</Text>
    </Pressable>
  );
}

function RoundButton({ children, label, onPress, selected }: { children: React.ReactNode; label: string; onPress: () => void; selected?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={selected === undefined ? undefined : { selected }} hitSlop={6}
      style={({ pressed }) => ({ width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" })}>
      {children}
    </Pressable>
  );
}

function Pill({ label, selected, onPress, hint, chevron }: { label: string; selected: boolean; onPress: () => void; hint?: string; chevron?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected }} accessibilityHint={hint} accessibilityLabel={label}
      style={{ flexDirection: "row", alignItems: "center", gap: 4, height: 36, paddingHorizontal: 14, borderRadius: R.pill, maxWidth: 170, backgroundColor: selected ? "rgba(214,180,108,0.22)" : "rgba(0,0,0,0.28)", borderWidth: 1, borderColor: selected ? stage.goldSoft : "rgba(255,255,255,0.12)" }}>
      <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 14, color: selected ? "#fff" : stage.textSoft, flexShrink: 1 }}>{label}</Text>
      {chevron ? <Icon name="chevronDown" color={stage.gold} size={14} /> : null}
    </Pressable>
  );
}

function SurahPicker({ visible, chapters, current, onPick, onClose }: { visible: boolean; chapters: Chapter[]; current: number; onPick: (s: number) => void; onClose: () => void }) {
  const tx = useFeedText();
  const insets = useSafeAreaInsets();
  const data = useMemo(() => (chapters.length ? chapters : Array.from({ length: 114 }, (_, i) => ({ id: i + 1, name_simple: String(i + 1), name_arabic: "", verses_count: VERSE_COUNTS[i], translated_name: { name: "" } } as Chapter))), [chapters]);
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: stage.bg }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 58, borderBottomWidth: 1, borderBottomColor: stage.hair }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 19, color: "#fff" }}>{tx.chooseSurah}</Text>
          <Text onPress={onClose} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 15, color: stage.gold, paddingVertical: 8 }}>{tx.close}</Text>
        </View>
        <FlatList
          data={data}
          keyExtractor={(c) => String(c.id)}
          initialScrollIndex={Math.max(0, current - 3)}
          getItemLayout={(_, i) => ({ length: 56, offset: 56 * i, index: i })}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          renderItem={({ item: c }) => (
            <Pressable onPress={() => onPick(c.id)} accessibilityRole="button" accessibilityState={{ selected: c.id === current }} accessibilityLabel={`${c.id}. ${c.name_simple}${c.translated_name?.name ? `, ${c.translated_name.name}` : ""}`}
              style={({ pressed }) => ({ height: 56, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, backgroundColor: pressed || c.id === current ? "rgba(214,180,108,0.1)" : "transparent" })}>
              <Text style={{ width: 32, fontFamily: FONT.semibold, fontSize: 13, color: stage.gold, fontVariant: ["tabular-nums"] }}>{c.id}</Text>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: "#fff" }}>{c.name_simple}</Text>
                {c.translated_name?.name ? <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted }}>{c.translated_name.name}</Text> : null}
              </View>
              {c.name_arabic ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 18, color: stage.cream }}>{c.name_arabic}</Text> : null}
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}
