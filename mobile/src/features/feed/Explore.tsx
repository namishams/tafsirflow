import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Modal, RefreshControl, ScrollView, Pressable, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useProphetText } from "@/features/prophet/texts";
import { useStored } from "@/lib/store";
import { readTradition } from "@/lib/tradition";
import { SAVED_KEY, useStories, useStoryQuota } from "@/features/prophet/useStories";
import { SAVED_KEY as HADITH_SAVED_KEY, type HadithItem } from "@/features/hadith/data";
import { toneOf } from "./art";
import { hadithFeedItems, toFeedItem, type HadithFeedItem } from "./hadith";
import { DiscoverFeed, loadVerse } from "./source";
import { fillText, useFeedText } from "./texts";
import { useFeedVoice } from "./voice";
import { FeedEmpty, useStalled } from "./ui";
import { SAVED_NAMES_KEY } from "./savedNames";
import { useReducedMotionX } from "@/features/extra/motion";
import { Image, TextInput } from "react-native";
import { LIB, LIB_TOPICS, LibScheduler, isLibId, isSubTopic, onLibData, takeRemoteNew, type LibTopic, type SubTopic } from "./library";
import { KNOW_SUBJECTS } from "./knowKinds";
import { knowItemOf, knowKindLabel } from "./KnowledgePost";
import { useKnowText } from "./knowTexts";
import { useSchoolT } from "@/features/school/texts";
import { loadRemoteConfig } from "./remote";
import { tick } from "./haptics";
import { wasSeen } from "./seen";
import { kindTopic, libText, topicLabel as libTopicLabel } from "./LibraryPost";
import { SAVED_KEY as CAROUSEL_SAVED_KEY, isCarouselOrWisdom, postSearchText, savedPostIds, type SavedPost } from "@/features/carousel/registry";
import { CarouselTile } from "@/features/carousel/Posts";

// Explore (a 3-column grid of square tiles, like Instagram Explore) and the Saved collection. A tile opens the Reels
// view at that item. Every text on a tile comes from the vetted sources (Quran API, library stories, hadith APIs).

export type OpenItem = (item: string, hadith?: HadithFeedItem) => void;
type Entry = { item: string; hadith?: HadithFeedItem };

const Tile = memo(function Tile({ e, size, onPress, big }: { e: Entry; size: number; onPress: () => void; big?: boolean }) {
  const reduce = useReducedMotionX();
  const { lang } = useLang();
  const stories = useStories();
  const { reciter } = useFeedVoice();
  const verseKey = /^[vw]:/.test(e.item) ? e.item.slice(2) : "";
  const [arabic, setArabic] = useState<string>("");
  useEffect(() => {
    if (!verseKey) return;
    let ok = true;
    loadVerse(verseKey, lang, reciter).then((d) => { if (ok) setArabic(d.arabic); }).catch(() => undefined);
    return () => { ok = false; };
  }, [verseKey, lang, reciter]);
  const tx = useFeedText();
  const kt = useKnowText();
  let label = ""; let ar = ""; let body = ""; let tone = toneOf(e.item); let img = "";
  const kn = knowItemOf(e.item);
  if (verseKey) { label = `Quran ${verseKey}`; ar = arabic; tone = toneOf(verseKey); }
  else if (e.item.startsWith("s:")) { const s = stories.byId.get(e.item.slice(2)); if (s) { label = s.groupTitle; ar = s.arabic; body = s.title; tone = toneOf(s.group); } }
  else if (e.item.startsWith("n:")) { const n = stories.names[Number(e.item.slice(2))]; if (n) { label = n.latin; ar = n.ar; body = n.meaning; tone = toneOf(`name:${n.latin}`); } }
  else if (kn) { label = knowKindLabel(kt, kn.kind); ar = kn.arabic ?? ""; body = kn.title; tone = toneOf(kn.id); }
  else if (isLibId(e.item)) { const lp = LIB.get(e.item); const f = lp?.items[0]; if (lp && f) { label = libTopicLabel(tx, kindTopic(lp.kind)); ar = (f as { arabic?: string }).arabic ?? ""; body = f.title; tone = toneOf(f.id); img = (f as { image?: string }).image ?? ""; } }
  else if (e.hadith) { label = e.hadith.source; ar = e.hadith.arabic ?? ""; body = ar ? "" : e.hadith.text; tone = toneOf(`hadith:${e.hadith.source}`); }
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={[label, body].filter(Boolean).join(". ")} style={({ pressed }) => ({ width: size, height: size, padding: 1, opacity: pressed && reduce ? 0.8 : 1, transform: [{ scale: pressed && !reduce ? 0.97 : 1 }] })}>
      <LinearGradient colors={tone} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, padding: 8, justifyContent: "space-between", overflow: "hidden" }}>
        {img ? <Image source={{ uri: img }} resizeMode="cover" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} accessibilityIgnoresInvertColors /> : null}
        <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: stage.gold }}>{label}</Text>
        {ar ? <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={big ? 7 : 4} style={{ fontFamily: ARABIC_FONT, fontSize: big ? 22 : 14, lineHeight: big ? 40 : 26, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{ar}</Text> : null}
        {body ? <Text numberOfLines={ar ? 1 : 5} style={{ fontFamily: FONT.regular, fontSize: 11, lineHeight: 15, color: "rgba(255,255,255,0.86)", textAlign: "center" }}>{body}</Text> : <View />}
      </LinearGradient>
    </Pressable>
  );
});

/** Explore like Instagram: rows of three, and every other block of six has one large 2x2 tile (alternating sides) */
type Block = { id: string; items: Entry[]; big: boolean; left: boolean };
function Grid({ data, onOpen, onEnd, empty, refresh }: { data: Entry[]; onOpen: OpenItem; onEnd?: () => void; empty?: React.ReactNode; refresh?: React.ReactElement<React.ComponentProps<typeof RefreshControl>> }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const size = Math.floor(Math.min(width, 700) / 3);
  const blocks = useMemo<Block[]>(() => {
    const out: Block[] = [];
    for (let i = 0, b = 0; i < data.length; i += 6, b++) out.push({ id: `${data[i].item}-${i}`, items: data.slice(i, i + 6), big: b % 2 === 1 && data.length - i >= 6, left: b % 4 === 1 });
    return out;
  }, [data]);
  const tile = (e: Entry, big = false) => isCarouselOrWisdom(e.item)
    ? <CarouselTile key={e.item} id={e.item} size={big ? size * 2 : size} onPress={() => onOpen(e.item)} />
    : <Tile key={e.item} e={e} big={big} size={big ? size * 2 : size} onPress={() => onOpen(e.item, e.hadith)} />;
  return (
    <FlatList
      data={blocks}
      keyExtractor={(b) => b.id}
      renderItem={({ item: b }) => b.big ? (
        <View>
          <View style={{ flexDirection: b.left ? "row" : "row-reverse" }}>
            {tile(b.items[0], true)}
            <View>{tile(b.items[1])}{tile(b.items[2])}</View>
          </View>
          <View style={{ flexDirection: "row" }}>{b.items.slice(3).map((e) => tile(e))}</View>
        </View>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", width: size * 3 }}>{b.items.map((e) => tile(e))}</View>
      )}
      contentContainerStyle={{ alignSelf: "center", width: size * 3, paddingBottom: insets.bottom + 24 }}
      onEndReached={onEnd}
      refreshControl={refresh}
      onEndReachedThreshold={3}
      maxToRenderPerBatch={4}
      removeClippedSubviews
      ListEmptyComponent={empty as never}
      initialNumToRender={4}
      windowSize={7}
    />
  );
}

function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const t = useTheme();
  const tx = useFeedText();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 58, borderBottomWidth: 1, borderBottomColor: t.line }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 19, color: t.ink }}>{title}</Text>
          <Text onPress={onClose} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.accent, paddingVertical: 8 }}>{tx.close}</Text>
        </View>
        {children}
      </View>
    </Modal>
  );
}

type ExTopic = "all" | "verses" | "names" | "stories" | "hadith" | Exclude<LibTopic, "hadith"> | SubTopic;
// after the topics: one chip per Madrasa subject (knowledge posts of that subject, knowledge.ts)
const EX_TOPICS: ExTopic[] = ["all", "verses", "tafsir", "hadith", "duas", "stories", "prayer", "seerah", "quran", "holy", "names", "scholars", "history", "art", ...KNOW_SUBJECTS.map((s): SubTopic => `sub:${s}`)];
const isLibTopic = (t: ExTopic): t is Exclude<LibTopic, "hadith"> => (LIB_TOPICS as string[]).includes(t) && t !== "hadith";

export function ExploreSheet({ visible, onClose, onOpen, onSearch }: { visible: boolean; onClose: () => void; onOpen: OpenItem; /** the search bar opens the full search screen */ onSearch?: () => void }) {
  const tx = useFeedText();
  return (
    <Sheet visible={visible} title={tx.explore} onClose={onClose}>
      {visible ? <ExploreBody active onOpen={(i, h) => { onClose(); onOpen(i, h); }} onSearch={onSearch ? () => { onClose(); onSearch(); } : undefined} /> : null}
    </Sheet>
  );
}

/** the Explore grid with a search field and topic chips (the Explore tab and the sheet of the Home feed) */
export function ExploreBody({ active, onOpen, top = 0, onSearch, initialQuery }: {
  active: boolean; onOpen: OpenItem; top?: number;
  /** owner, 21.10.2026 (Instagram / TikTok): the empty search bar opens the full search screen (accounts and content);
   * a query that comes back from there ("Posts about … in Explore") filters the grid here as before */
  onSearch?: () => void; initialQuery?: string;
}) {
  const tx = useFeedText();
  const pt = useProphetText();
  const t = useTheme();
  const { lang } = useLang();
  const stories = useStories();
  const sch = useSchoolT();
  // the subject chips: the Madrasa's subject names, shortened to the part before a colon or bracket
  const subLabel = (s: string) => { const full = sch(`subj_${s}` as never); return full.split(/[:(（]/)[0].trim() || full; };
  const label: Record<ExTopic, string> = { all: tx.topicAll, verses: pt.catVerses, names: tx.topicNames, stories: tx.topicStories, hadith: tx.hadith,
    ...(Object.fromEntries(LIB_TOPICS.filter((x) => x !== "hadith").map((x) => [x, libTopicLabel(tx, x)])) as Record<Exclude<LibTopic, "hadith">, string>),
    ...(Object.fromEntries(KNOW_SUBJECTS.map((s) => [`sub:${s}`, subLabel(s)])) as Record<SubTopic, string>) };
  const [query, setQuery] = useState(initialQuery ?? "");
  useEffect(() => { if (initialQuery !== undefined) setQuery(initialQuery); }, [initialQuery]);
  const lib = useRef<LibScheduler | null>(null);
  const quota = useStoryQuota();
  const [data, setData] = useState<Entry[]>([]);
  const feed = useRef<DiscoverFeed | null>(null);
  const hadith = useRef<{ queue: HadithFeedItem[]; cursor: string | null; loading: boolean }>({ queue: [], cursor: null, loading: false });
  const latest = useRef({ stories, quota });
  latest.current = { stories, quota };

  const fetchHadith = useCallback(() => {
    const h = hadith.current;
    if (h.loading || h.queue.length > 12) return;
    h.loading = true;
    void hadithFeedItems(lang, readTradition(), h.cursor, 12).then((p) => {
      h.cursor = p.cursor; h.queue.push(...p.items);
      // an empty page means offline: the hadith view says so at once
      if (topicRef.current === "hadith" && !p.items.length) failRef.current();
      // the hadith view fills as pages arrive (and keeps prefetching the next one)
      if (topicRef.current === "hadith") setData((d) => [...d, ...h.queue.splice(0).map((x) => ({ item: `h:${x.id}`, hadith: x }))]);
    }).catch(() => { if (topicRef.current === "hadith") failRef.current(); }).finally(() => { h.loading = false; });
  }, [lang]);
  const failRef = useRef(() => undefined as void);

  const [topic, setTopic] = useState<ExTopic>("all");
  const topicRef = useRef(topic);
  topicRef.current = topic;
  const page = useCallback((n: number): Entry[] => {
    const d = feed.current;
    if (!d) return [];
    const tp = topicRef.current;
    const names = latest.current.stories.names.length;
    if (tp === "names") return names ? Array.from({ length: n }, () => ({ item: `n:${Math.floor(Math.random() * names)}` })) : [];
    if (isLibTopic(tp) || isSubTopic(tp)) return (lib.current?.take(n) ?? []).map((item) => ({ item }));
    if (tp === "hadith") { fetchHadith(); return hadith.current.queue.splice(0, n).map((h) => ({ item: `h:${h.id}`, hadith: h })); }
    const draw = d.next(tp === "stories" ? n * 4 : n, latest.current.quota.left).filter((k) => k !== "pro" && (tp === "all" || (tp === "stories" ? k.startsWith("s:") : /^[vw]:/.test(k))));
    const out: Entry[] = [];
    for (const item of draw) {
      out.push({ item });
      if (out.length % 5 === 4) { const h = hadith.current.queue.shift(); if (h) out.push({ item: `h:${h.id}`, hadith: h }); }
      if (tp === "all" && out.length % 3 === 2) for (const x of lib.current?.take(1) ?? []) out.push({ item: x });
    }
    fetchHadith();
    return out;
  }, [fetchHadith]);

  const ready = stories.byId.size > 0;
  // pull-to-refresh: haptic, /config and /new from the server, then a reshuffled grid with the new tiles first
  const [gen, setGen] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const freshIds = useRef<string[]>([]);
  const refresh = useCallback(() => {
    setRefreshing(true);
    tick();
    void Promise.all([loadRemoteConfig(lang).catch(() => null), takeRemoteNew(lang).catch(() => [] as string[])]).then(([, ids]) => {
      freshIds.current = ids.filter((k) => !wasSeen(k));
      setGen((g) => g + 1);
      setRefreshing(false);
    });
  }, [lang]);
  useEffect(() => {
    if (!active) return;
    const st = latest.current.stories;
    const ids = (k: keyof typeof st.groups) => st.groups[k].flatMap((g) => g.stories.map((x) => x.id));
    feed.current = new DiscoverFeed("foryou", { prophet: ids("prophet"), reciters: ids("reciters"), islam: ids("islam"), tips: ids("tips"), secrets: ids("secrets") }, st.names.length, false, undefined);
    hadith.current = { queue: [], cursor: null, loading: false };
    lib.current = new LibScheduler(lang, isLibTopic(topicRef.current) || isSubTopic(topicRef.current) ? topicRef.current : "all");
    fetchHadith();
    const fresh = topicRef.current === "all" ? freshIds.current.map((item) => ({ item })) : [];
    freshIds.current = [];
    const got = page(30).filter((e) => !fresh.some((f) => f.item === e.item));
    setData([...fresh, ...got.filter((e) => !wasSeen(e.item)), ...got.filter((e) => wasSeen(e.item))]);
  }, [active, ready, lang, topic, fetchHadith, page, gen]);
  // an empty grid: a spinner while the first tiles load, then (nothing arrived) the reason with "Try again"
  const [stalled, setStalled] = useStalled(data.length === 0, [topic, gen, lang]);
  failRef.current = () => setStalled(true);
  // library topics fill as their pages arrive
  const dataLen = useRef(0);
  dataLen.current = data.length;
  useEffect(() => onLibData(() => { if (dataLen.current < 30) setData((d) => [...d, ...page(12)]); }), [page]);
  // search: what is loaded (library posts, stories, names) plus a verse reference like 2:255
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    const st = latest.current.stories;
    const hits = data.filter((e) => {
      if (isLibId(e.item)) return libText(e.item).toLowerCase().includes(q);
      if (isCarouselOrWisdom(e.item)) return postSearchText(e.item).toLowerCase().includes(q);
      if (e.item.startsWith("s:")) { const x = st.byId.get(e.item.slice(2)); return !!x && `${x.title} ${x.groupTitle}`.toLowerCase().includes(q); }
      if (e.item.startsWith("n:")) { const n = st.names[Number(e.item.slice(2))]; return !!n && `${n.latin} ${n.meaning} ${n.ar}`.toLowerCase().includes(q); }
      if (e.hadith) return `${e.hadith.text ?? ""} ${e.hadith.source}`.toLowerCase().includes(q);
      return e.item.includes(q);
    });
    const extra: Entry[] = [];
    for (const [id] of LIB) if (!hits.some((h) => h.item === id) && libText(id).toLowerCase().includes(q)) extra.push({ item: id });
    for (const x of st.byId.values()) if (`${x.title} ${x.groupTitle}`.toLowerCase().includes(q)) extra.push({ item: `s:${x.id}` });
    const ref = q.match(/^(\d{1,3})[:.\s](\d{1,3})$/);
    return [...(ref ? [{ item: `v:${Number(ref[1])}:${Number(ref[2])}` }] : []), ...hits, ...extra.slice(0, 60)];
  }, [query, data]);


  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <Pressable onPress={onSearch && !query ? onSearch : undefined} disabled={!onSearch || !!query} accessibilityRole={onSearch && !query ? "search" : undefined} accessibilityLabel={onSearch && !query ? tx.exploreSearch : undefined}
        style={{ flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 14, marginTop: 10, height: 40, borderRadius: 12, paddingHorizontal: 12, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line }}>
        <Icon name="search" color={t.muted} size={16} />
        <TextInput value={query} onChangeText={setQuery} placeholder={tx.exploreSearch} placeholderTextColor={t.muted} accessibilityLabel={tx.exploreSearch} returnKeyType="search" autoCorrect={false} clearButtonMode="while-editing"
          editable={!onSearch || !!query} pointerEvents={onSearch && !query ? "none" : "auto"}
          style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, color: t.ink, paddingVertical: 0 }} />
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} accessibilityRole="tablist" contentContainerStyle={{ gap: 8, paddingHorizontal: 14, paddingVertical: 10 }}>
        {EX_TOPICS.map((k) => {
          const on = topic === k;
          return (
            <Pressable key={k} onPress={() => setTopic(k)} accessibilityRole="tab" accessibilityState={{ selected: on }}
              style={({ pressed }) => ({ height: 32, paddingHorizontal: 14, justifyContent: "center", borderRadius: R.pill, backgroundColor: on ? t.ink : "transparent", borderWidth: 1, borderColor: on ? t.ink : t.line, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: on ? t.bg : t.ink }}>{label[k]}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Grid key={topic} data={shown} onOpen={onOpen} onEnd={query ? undefined : () => setData((d) => [...d, ...page(24)])}
        refresh={query ? undefined : <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={t.accent} colors={[t.accent]} />}
        empty={query.trim() ? <FeedEmpty state="message" message={fillText(tx.noResults, { q: query.trim() })} />
          : stalled ? <FeedEmpty state="failed" onRetry={() => setGen((g) => g + 1)} /> : <FeedEmpty state="loading" />} />
    </View>
  );
}

export function SavedSheet({ visible, onClose, onOpen }: { visible: boolean; onClose: () => void; onOpen: OpenItem }) {
  const tx = useFeedText();
  const t = useTheme();
  const verses = useStored<string[]>("tf:bookmarks", []);
  const storyIds = useStored<string[]>(SAVED_KEY, []);
  const hadiths = useStored<HadithItem[]>(HADITH_SAVED_KEY, []);
  const names = useStored<string[]>(SAVED_NAMES_KEY, []);
  const stories = useStories();
  const carousels = useStored<SavedPost[]>(CAROUSEL_SAVED_KEY, []);
  const data = useMemo<Entry[]>(() => [
    ...savedPostIds(carousels).map((item) => ({ item })),
    ...hadiths.map((h) => { const f = toFeedItem(h); return { item: `h:${f.id}`, hadith: f }; }),
    ...storyIds.filter((id) => stories.byId.has(id)).map((id) => ({ item: `s:${id}` })),
    // saved names of Allah (kept by their Arabic name) as the name posts of the current list
    ...names.map((ar) => stories.names.findIndex((n) => n.ar === ar)).filter((i) => i >= 0).map((i) => ({ item: `n:${i}` })),
    ...verses.filter((k) => /^\d+:\d+$/.test(k)).map((k) => ({ item: `v:${k}` })),
  ], [hadiths, storyIds, names, verses, stories, carousels]);
  return (
    <Sheet visible={visible} title={tx.saved} onClose={onClose}>
      <Grid data={data} onOpen={(i, h) => { onClose(); onOpen(i, h); }} empty={
        <View style={{ alignItems: "center", gap: 10, padding: 40 }}>
          <Icon name="bookmark" color={t.muted} size={34} />
          <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.muted, textAlign: "center" }}>{tx.savedEmpty}</Text>
        </View>
      } />
    </Sheet>
  );
}
