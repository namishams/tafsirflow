import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Modal, ScrollView, Pressable, Text, View, useWindowDimensions } from "react-native";
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
import { useFeedText } from "./texts";
import { useFeedVoice } from "./voice";

// Explore (a 3-column grid of square tiles, like Instagram Explore) and the Saved collection. A tile opens the Reels
// view at that item. Every text on a tile comes from the vetted sources (Quran API, library stories, hadith APIs).

export type OpenItem = (item: string, hadith?: HadithFeedItem) => void;
type Entry = { item: string; hadith?: HadithFeedItem };

const Tile = memo(function Tile({ e, size, onPress }: { e: Entry; size: number; onPress: () => void }) {
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
  let label = ""; let ar = ""; let body = ""; let tone = toneOf(e.item);
  if (verseKey) { label = `Quran ${verseKey}`; ar = arabic; tone = toneOf(verseKey); }
  else if (e.item.startsWith("s:")) { const s = stories.byId.get(e.item.slice(2)); if (s) { label = s.groupTitle; ar = s.arabic; body = s.title; tone = toneOf(s.group); } }
  else if (e.item.startsWith("n:")) { const n = stories.names[Number(e.item.slice(2))]; if (n) { label = n.latin; ar = n.ar; body = n.meaning; tone = toneOf(`name:${n.latin}`); } }
  else if (e.hadith) { label = e.hadith.source; ar = e.hadith.arabic ?? ""; body = ar ? "" : e.hadith.text; tone = toneOf(`hadith:${e.hadith.source}`); }
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={[label, body].filter(Boolean).join(". ")} style={({ pressed }) => ({ width: size, height: size, padding: 1, opacity: pressed ? 0.8 : 1 })}>
      <LinearGradient colors={tone} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, padding: 8, justifyContent: "space-between", overflow: "hidden" }}>
        <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: stage.gold }}>{label}</Text>
        {ar ? <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={4} style={{ fontFamily: ARABIC_FONT, fontSize: 14, lineHeight: 26, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{ar}</Text> : null}
        {body ? <Text numberOfLines={ar ? 1 : 5} style={{ fontFamily: FONT.regular, fontSize: 11, lineHeight: 15, color: "rgba(255,255,255,0.86)", textAlign: "center" }}>{body}</Text> : <View />}
      </LinearGradient>
    </Pressable>
  );
});

function Grid({ data, onOpen, onEnd, empty }: { data: Entry[]; onOpen: OpenItem; onEnd?: () => void; empty?: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const size = Math.floor(Math.min(width, 700) / 3);
  return (
    <FlatList
      data={data}
      numColumns={3}
      keyExtractor={(e, i) => `${e.item}-${i}`}
      renderItem={({ item: e }) => <Tile e={e} size={size} onPress={() => onOpen(e.item, e.hadith)} />}
      contentContainerStyle={{ alignSelf: "center", width: size * 3, paddingBottom: insets.bottom + 24 }}
      onEndReached={onEnd}
      onEndReachedThreshold={3}
      maxToRenderPerBatch={12}
      removeClippedSubviews
      ListEmptyComponent={empty as never}
      initialNumToRender={15}
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

export function ExploreSheet({ visible, onClose, onOpen }: { visible: boolean; onClose: () => void; onOpen: OpenItem }) {
  const tx = useFeedText();
  const pt = useProphetText();
  const t = useTheme();
  const { lang } = useLang();
  const stories = useStories();
  const label = { all: tx.topicAll, verses: pt.catVerses, names: tx.topicNames, stories: tx.topicStories, hadith: tx.hadith };
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
      // the hadith view fills as pages arrive (and keeps prefetching the next one)
      if (topicRef.current === "hadith") setData((d) => [...d, ...h.queue.splice(0).map((x) => ({ item: `h:${x.id}`, hadith: x }))]);
    }).catch(() => undefined).finally(() => { h.loading = false; });
  }, [lang]);

  const [topic, setTopic] = useState<"all" | "verses" | "names" | "stories" | "hadith">("all");
  const topicRef = useRef(topic);
  topicRef.current = topic;
  const page = useCallback((n: number): Entry[] => {
    const d = feed.current;
    if (!d) return [];
    const tp = topicRef.current;
    const names = latest.current.stories.names.length;
    if (tp === "names") return names ? Array.from({ length: n }, () => ({ item: `n:${Math.floor(Math.random() * names)}` })) : [];
    if (tp === "hadith") { fetchHadith(); return hadith.current.queue.splice(0, n).map((h) => ({ item: `h:${h.id}`, hadith: h })); }
    const draw = d.next(tp === "stories" ? n * 4 : n, latest.current.quota.left).filter((k) => k !== "pro" && (tp === "all" || (tp === "stories" ? k.startsWith("s:") : /^[vw]:/.test(k))));
    const out: Entry[] = [];
    for (const item of draw) {
      out.push({ item });
      if (out.length % 5 === 4) { const h = hadith.current.queue.shift(); if (h) out.push({ item: `h:${h.id}`, hadith: h }); }
    }
    fetchHadith();
    return out;
  }, [fetchHadith]);

  const ready = stories.byId.size > 0;
  useEffect(() => {
    if (!visible) return;
    const st = latest.current.stories;
    const ids = (k: keyof typeof st.groups) => st.groups[k].flatMap((g) => g.stories.map((x) => x.id));
    feed.current = new DiscoverFeed("foryou", { prophet: ids("prophet"), reciters: ids("reciters"), islam: ids("islam"), tips: ids("tips"), secrets: ids("secrets") }, st.names.length, false, undefined);
    hadith.current = { queue: [], cursor: null, loading: false };
    fetchHadith();
    setData(page(30));
  }, [visible, ready, lang, topic, fetchHadith, page]);

  return (
    <Sheet visible={visible} title={tx.explore} onClose={onClose}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} accessibilityRole="tablist" contentContainerStyle={{ gap: 8, paddingHorizontal: 14, paddingVertical: 10 }}>
        {(["all", "verses", "names", "stories", "hadith"] as const).map((k) => {
          const on = topic === k;
          return (
            <Pressable key={k} onPress={() => setTopic(k)} accessibilityRole="tab" accessibilityState={{ selected: on }}
              style={{ height: 32, paddingHorizontal: 14, justifyContent: "center", borderRadius: R.pill, backgroundColor: on ? t.ink : "transparent", borderWidth: 1, borderColor: on ? t.ink : t.line }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: on ? t.bg : t.ink }}>{label[k]}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Grid key={topic} data={data} onOpen={(i, h) => { onClose(); onOpen(i, h); }} onEnd={() => setData((d) => [...d, ...page(24)])} />
    </Sheet>
  );
}

export function SavedSheet({ visible, onClose, onOpen }: { visible: boolean; onClose: () => void; onOpen: OpenItem }) {
  const tx = useFeedText();
  const t = useTheme();
  const verses = useStored<string[]>("tf:bookmarks", []);
  const storyIds = useStored<string[]>(SAVED_KEY, []);
  const hadiths = useStored<HadithItem[]>(HADITH_SAVED_KEY, []);
  const stories = useStories();
  const data = useMemo<Entry[]>(() => [
    ...hadiths.map((h) => { const f = toFeedItem(h); return { item: `h:${f.id}`, hadith: f }; }),
    ...storyIds.filter((id) => stories.byId.has(id)).map((id) => ({ item: `s:${id}` })),
    ...verses.filter((k) => /^\d+:\d+$/.test(k)).map((k) => ({ item: `v:${k}` })),
  ], [hadiths, storyIds, verses, stories]);
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
