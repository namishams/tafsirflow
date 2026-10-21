import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, Text, View, useWindowDimensions, type ListViewToken } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Icon } from "@/components/icons";
import { goBack } from "@/components/page";
import { useLang } from "@/i18n";
import { SITE } from "@/lib/api";
import { ARABIC_FONT, FONT, R, stage } from "@/lib/theme";
import { readJSON, writeJSON } from "@/lib/store";
import { getChapters, reciterName, type Chapter } from "@/lib/quran";
import { useReciter } from "@/features/quran/reciter";
import { VerseEngine } from "@/features/quran/useVerseAudio";
import { useReducedMotionX } from "@/features/extra/motion";
import { VERSE_COUNTS } from "@/web/counts";
import { useStories, useStoryQuota } from "@/features/prophet/useStories";
import { useProphetText } from "@/features/prophet/texts";
import { StoryShareCard } from "@/features/prophet/StoryShareCard";
import type { AllahName, Story } from "@/features/prophet/stories";
import { SpeakerIcon, toneOf } from "./art";
import { FeedPage } from "./FeedPage";
import { HadithPage, NamePage, ProPage, StoryPage } from "./StoryPage";
import { HADITH_AVAILABLE, hadithFeedItems, type HadithFeedItem } from "./hadith";
import { ShareSheet } from "./share";
import { DiscoverFeed, FEED_CATS, keyOfItem, preloadSurah, surahKeys, validKey, type FeedCat, type FeedMode, type FeedVerse } from "./source";
import { countShare } from "./useLike";
import { useFeedText } from "./texts";
import { VerseShareCard } from "./VerseShareCard";

// The Quran Feed: an endless, full-screen vertical feed like Instagram Reels. Discover ("For you") mixes verses with
// word-of-the-verse cards, names of Allah and story cards (prophet, reciters, Islam then and now, tips, secrets);
// the chips narrow it to one kind. Surah mode walks through a surah verse by verse (and on into the next surah).
// Free accounts get every verse and FREE_STORIES_PER_DAY story cards a day, then the Pro card.
// Route params: ?mode=surah&s=18&v=10, ?key=2:255 (Discover starting with that verse), ?cat=prophet.
const MUTE_KEY = "qmc.feed-muted";
const AUTO_KEY = "qmc.feed-autoplay";
const STORY_MS = 8000; // story cards in "For you" stay about 8 s
const MUTED_VERSE_MS = 10000; // a muted verse (no recitation to wait for)
type ShareItem = { kind: "verse"; v: FeedVerse } | { kind: "story"; s: Story } | { kind: "name"; n: AllahName };

export function FeedScreen() {
  const params = useLocalSearchParams<{ mode?: string; s?: string; v?: string; key?: string; cat?: string }>();
  const tx = useFeedText();
  const pt = useProphetText();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduce = useReducedMotionX();
  const [reciter] = useReciter(); // the allowed voice: without Pro always a free reciter
  const [engine] = useState(() => new VerseEngine());
  useEffect(() => () => engine.dispose(), [engine]);
  const stories = useStories();
  const quota = useStoryQuota();

  const startS = Math.min(114, Math.max(1, Number(params.s) || 1));
  const [mode, setMode] = useState<FeedMode>(params.mode === "surah" || params.s ? "surah" : params.mode === "hadith" && HADITH_AVAILABLE ? "hadith" : "discover");
  const [autoplay, setAutoplay] = useState(() => readJSON<boolean>(AUTO_KEY, true));
  const [cat, setCat] = useState<FeedCat>(FEED_CATS.includes(params.cat as FeedCat) ? (params.cat as FeedCat) : "foryou");
  const [surah, setSurah] = useState(startS);
  const [keys, setKeys] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [pageH, setPageH] = useState(0);
  const [muted, setMuted] = useState(() => readJSON<boolean>(MUTE_KEY, false));
  const [focused, setFocused] = useState(true);
  const [share, setShare] = useState<ShareItem | null>(null);
  const [picker, setPicker] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const list = useRef<FlatList<string>>(null);
  const discover = useRef<DiscoverFeed | null>(null);
  const loadedSurahs = useRef(new Set<number>());
  const initialIndex = useRef(0);
  const activeRef = useRef(0);
  activeRef.current = active;
  const hadith = useRef<{ byId: Map<string, HadithFeedItem>; cursor: string | null }>({ byId: new Map(), cursor: null });
  const latest = useRef({ stories, quota });
  latest.current = { stories, quota };

  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  const nameOf = useCallback((s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${s}`, [chapters]);

  // pause when another screen (reader, Shams, Pro) opens on top; play again when the feed is visible
  useFocusEffect(useCallback(() => { setFocused(true); return () => { setFocused(false); engine.pause(); }; }, [engine]));

  // the hadith stream (features/hadith via ./hadith): loops – when the source is through it starts again
  const nextHadith = useCallback((): string[] => {
    const h = hadith.current;
    let page = hadithFeedItems(lang, "all", h.cursor);
    if (!page.items.length && h.cursor !== null) page = hadithFeedItems(lang, "all", null);
    h.cursor = page.cursor;
    const round = h.byId.size;
    return page.items.map((it, i) => { const id = `h:${round + i}`; h.byId.set(id, it); return id; });
  }, [lang]);

  const newDiscover = useCallback((c: FeedCat, first?: string) => {
    const { stories: st } = latest.current;
    const ids = (k: keyof typeof st.groups) => st.groups[k].flatMap((g) => g.stories.map((x) => x.id));
    return new DiscoverFeed(c, { prophet: ids("prophet"), reciters: ids("reciters"), islam: ids("islam"), tips: ids("tips"), secrets: ids("secrets") }, st.names.length, lang !== "ar", first);
  }, [lang]);

  // (re)build the list when the mode, the category, the surah, the language or the voice changes
  useEffect(() => {
    loadedSurahs.current = new Set();
    if (mode === "hadith") {
      hadith.current = { byId: new Map(), cursor: null };
      initialIndex.current = 0;
      setKeys(nextHadith());
    } else if (mode === "discover") {
      discover.current = newDiscover(cat, cat === "foryou" || cat === "verses" ? (params.key && validKey(params.key) ? params.key : undefined) : undefined);
      initialIndex.current = 0;
      setKeys(discover.current.next(10, latest.current.quota.left));
    } else {
      const v = surah === startS ? Math.min(VERSE_COUNTS[surah - 1], Math.max(1, Number(params.v) || 1)) : 1;
      loadedSurahs.current.add(surah);
      void preloadSurah(surah, lang, reciter).catch(() => undefined);
      initialIndex.current = v - 1;
      setKeys(surahKeys(surah));
    }
    setActive(initialIndex.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, cat, surah, lang, reciter.folder]);

  const more = useCallback(() => {
    if (mode === "hadith") { const add = nextHadith(); if (add.length) setKeys((k) => [...k, ...add]); return; }
    if (mode === "discover") {
      const d = discover.current;
      if (d) {
        // stories already in the list count against today's allowance before they are seen
        const queued = keys.slice(activeRef.current).filter((k) => k.startsWith("s:")).length;
        const add = d.next(10, Math.max(0, latest.current.quota.left - queued));
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
  }, [mode, surah, lang, reciter, keys]);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const first = viewableItems.find((x) => x.isViewable && x.index !== null);
    if (first?.index !== null && first?.index !== undefined) setActive(first.index);
  }).current;
  const viewConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const toggleAuto = () => { const a = !autoplay; setAutoplay(a); writeJSON(AUTO_KEY, a, true); };
  const toggleMute = () => { const m = !muted; setMuted(m); writeJSON(MUTE_KEY, m, true); if (m) engine.pause(); };
  const switchMode = (m: FeedMode) => { if (m === mode) { if (m === "surah") setPicker(true); return; } engine.stop(); setMode(m); };
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
  const reciterLabel = reciterName(reciter, lang);
  const chrome = mode === "discover" ? 40 : 0; // the category chips need room

  const renderItem = useCallback(({ item, index }: { item: string; index: number }) => {
    const common = { width, height: pageH, active: index === active, topInset: insets.top + chrome, bottomInset: insets.bottom, reduce, engine, lang };
    if (item.startsWith("v:") || item.startsWith("w:")) {
      const key = item.slice(2);
      return <FeedPage {...common} verseKey={key} variant={item[0] === "w" ? "word" : "verse"} near={Math.abs(index - active) <= 2}
        sound={focused && !muted} reciter={reciter} reciterLabel={reciterLabel} surahName={nameOf(Number(key.split(":")[0]))}
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
    if (item.startsWith("h:")) {
      const h = hadith.current.byId.get(item);
      return h ? <HadithPage {...common} item={h} /> : <View style={{ width, height: pageH }} />;
    }
    return <ProPage {...common} onLater={later} />;
  }, [width, pageH, active, focused, muted, lang, reciter, reciterLabel, nameOf, insets.top, insets.bottom, chrome, reduce, engine, stories, quota, later]);

  // what the share sheet shares
  const sh = useMemo(() => {
    if (!share) return null;
    if (share.kind === "verse") {
      const v = share.v;
      return {
        link: `${SITE}/${lang}/surah/${v.s}?v=${v.v}`, message: `${v.translation ? `${v.translation}\n\n` : ""}Quran ${v.key}`, onShared: () => countShare(v.key), video: { key: v.key, lang },
        card: (f: "story" | "post") => <VerseShareCard format={f} arabic={v.arabic} translation={v.translation} reference={`${nameOf(v.s)} · ${v.key}`} tone={toneOf(v.key)} />,
      };
    }
    if (share.kind === "story") {
      const s = share.s;
      return { link: `${SITE}/${lang}${s.webPath}`, message: `${s.title}\n${s.groupTitle}`, card: (f: "story" | "post") => <StoryShareCard story={s} format={f} /> };
    }
    const n = share.n;
    const fake: Story = { id: "name", cat: "islam", group: `name:${n.latin}`, groupTitle: tx.nameTitle, arabic: "", title: n.latin, paragraphs: [], truncated: false, sources: [tx.nameSource], href: "/islam/names", webPath: "/islam/names" };
    return { link: `${SITE}/${lang}/islam/names`, message: `${n.ar} – ${n.latin}: ${n.meaning}`, card: (f: "story" | "post") => <StoryShareCard story={fake} format={f} lines={{ title: `${n.ar}\n${n.latin}`, body: n.meaning, arabic: n.ar }} /> };
  }, [share, lang, nameOf, tx.nameTitle, tx.nameSource]);

  const catLabel: Record<FeedCat, string> = { foryou: pt.catForYou, verses: pt.catVerses, prophet: pt.catProphet, reciters: pt.catReciters, islam: pt.catIslam, tips: pt.catTips };

  return (
    <View style={{ flex: 1, backgroundColor: stage.deep }} onTouchStart={onTouch} onLayout={(e) => {
      // a new size (rotation, iPad split view): the list is rebuilt at the page that was visible
      const h = Math.round(e.nativeEvent.layout.height);
      if (h !== pageH) { initialIndex.current = activeRef.current; setPageH(h); }
    }}>
      <StatusBar style="light" />
      {pageH > 0 && keys.length ? (
        <FlatList
          ref={list}
          key={`${mode}-${cat}-${surah}-${lang}-${pageH}`}
          data={keys}
          keyExtractor={(k, i) => `${k}-${i}`}
          renderItem={renderItem}
          extraData={active}
          pagingEnabled
          decelerationRate="fast"
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
      ) : null}

      {/* top bar over the feed */}
      <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, top: 0, paddingTop: insets.top + 8 }}>
        <View pointerEvents="box-none" style={{ paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <RoundButton label={tx.close} onPress={() => goBack()}><Icon name="chevronLeft" color="#fff" size={22} /></RoundButton>
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", gap: 6 }}>
            <Pill label={pt.catForYou} selected={mode === "discover"} onPress={() => switchMode("discover")} />
            <Pill label={mode === "surah" ? nameOf(activeSurah) : tx.surah} selected={mode === "surah"} onPress={() => switchMode("surah")} hint={tx.chooseSurah} chevron={mode === "surah"} />
            {HADITH_AVAILABLE ? <Pill label={tx.hadith} selected={mode === "hadith"} onPress={() => switchMode("hadith")} /> : null}
          </View>
          <RoundButton label={tx.autoplay} selected={autoplay} onPress={toggleAuto}><Icon name="repeat" color={autoplay ? stage.gold : "rgba(255,255,255,0.6)"} size={20} /></RoundButton>
          <RoundButton label={muted ? tx.unmute : tx.mute} selected={!muted} onPress={toggleMute}><SpeakerIcon muted={muted} color="#fff" /></RoundButton>
        </View>
        {mode === "discover" ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 12, gap: 6 }} accessibilityRole="tablist">
            {FEED_CATS.map((c) => <Chip key={c} label={catLabel[c]} selected={cat === c} onPress={() => pickCat(c)} />)}
          </ScrollView>
        ) : null}
      </View>

      <ShareSheet visible={!!sh} onClose={() => setShare(null)} link={sh?.link ?? SITE} message={sh?.message ?? ""} onShared={sh?.onShared} video={sh?.video}
        renderCard={(f) => sh?.card(f) ?? null} />

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
