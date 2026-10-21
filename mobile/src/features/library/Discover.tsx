import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { Poster, SectionTitle, gradientColors } from "@/components/brand";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { calText } from "@/web/hijri";
import { namesText } from "@/web/names";
import { extraTool, routeOf, tile } from "@/lib/features";
import { useNahjVisible, useTradition, type TraditionChoice } from "@/lib/tradition";
import { nahjCourseText } from "@/features/nahj-course/text";
import { EXTRA_KINDS, extraFeedItems, type ExtraItem } from "@/content/extra";
import { kindsFor, sourceFeedItems, type SourceItem } from "@/content/sources";
import { toneOf } from "@/features/feed/art";
import { kindTopic, topicLabel } from "@/features/feed/LibraryPost";
import { fillText, useFeedText } from "@/features/feed/texts";
import { tick } from "@/features/feed/haptics";
import { useDiscoverText, type DiscoverText } from "./discoverTexts";

// The endless Discover: every course, tool and section as rich poster cards in themed rows (no "more" button),
// followed by a stream of discovery cards from the content libraries (src/content/extra and src/content/sources)
// that keeps loading while the listener scrolls. Used by the Discover screen and the Masterclass tab.

type Card = { key: string; href: string; title: string; desc: string; badge: string; ar: string; colors: [string, string] };
type AppOnly = { key: keyof DiscoverText; href: string; ar: string; colors: [string, string]; badge: string };

const APP_ONLY: Record<string, AppOnly> = {
  reciterPath: { key: "reciterPath", href: "/reciter-path", ar: "تلاوة", colors: ["#1d4a3a", "#08140f"], badge: "course" },
  cards: { key: "cards", href: "/cards", ar: "حفظ", colors: ["#3b2f12", "#14110a"], badge: "progress" },
  tests: { key: "tests", href: "/tests", ar: "امتحان", colors: ["#21483c", "#0d0a18"], badge: "progress" },
  abrahamic: { key: "abrahamic", href: "/abrahamic", ar: "إبراهيم", colors: ["#42301b", "#140e09"], badge: "library" },
  haramain: { key: "haramain", href: "/haramain", ar: "الحرمين", colors: ["#1b4035", "#08161a"], badge: "library" },
  hadith: { key: "hadith", href: "/hadith", ar: "حديث", colors: ["#2b3b1b", "#0d140a"], badge: "library" },
  nahj: { key: "nahj", href: "/nahj", ar: "نهج", colors: ["#1b4438", "#090d18"], badge: "library" },
  qibla: { key: "qibla", href: "/qibla", ar: "قبلة", colors: ["#123a2c", "#06140f"], badge: "live" },
  stories: { key: "stories", href: "/prophet-stories", ar: "قصص", colors: ["#46381b", "#160b08"], badge: "library" },
  feed: { key: "feed", href: "/feed", ar: "آية", colors: ["#473a1f", "#0e0a18"], badge: "live" },
};

const ROWS: { title: keyof DiscoverText; keys: string[] }[] = [
  { title: "rowLearn", keys: ["shams", "reciterPath", "courses", "arabic", "tajweed", "vocab", "cards", "tests", "plan", "how"] },
  { title: "rowQuran", keys: ["feed", "radio", "reciters", "search", "khatm", "map"] },
  { title: "rowDaily", keys: ["prayer", "qibla", "calendar", "salah", "wudu", "duas", "duagen", "names"] },
  { title: "rowHeritage", keys: ["hadith", "nahjStudy", "nahj", "stories", "abrahamic", "haramain", "islam", "secrets", "guides", "world"] },
  { title: "rowCommunity", keys: ["community", "ranking", "stats", "assistant"] },
];

function useCards(_tradition: TraditionChoice | null) {
  const nahjOn = useNahjVisible();
  const w = useWebT();
  const d = useDiscoverText();
  const { lang } = useLang();
  const cal = calText(lang).t;
  const nm = namesText(lang);
  return ROWS.map((row) => ({
    title: d[row.title],
    cards: row.keys.flatMap((k): Card[] => {
      if (k === "nahj" && !nahjOn) return [];
      if (k === "nahjStudy") {
        const nc = nahjCourseText(lang);
        return [{ key: k, href: "/nahj-studies", title: nahjOn ? nc.short : nc.optInTitle, desc: nahjOn ? nc.lead : nc.optInNote, badge: w("home2.badge_course"), ar: "نهج", colors: ["#1b4438", "#090d18"] }];
      }
      const t = tile(k);
      if (t) return [{ key: k, href: routeOf(t), title: w(`nav.${t.key}`), desc: w(`home2.${t.desc}`), badge: w(`home2.badge_${t.badge}`), ar: t.ar, colors: gradientColors(t.bg) }];
      const x = extraTool(k);
      if (x) {
        const [title, desc] = k === "search" ? [w("nav.search"), w("search.title")] : k === "calendar" ? [cal("title"), cal("lead")] : [nm("title"), nm("lead")];
        return [{ key: k, href: routeOf(x), title, desc, badge: w(`home2.badge_${x.badge}`), ar: x.ar, colors: gradientColors(x.bg) }];
      }
      const a = APP_ONLY[k];
      if (!a) return [];
      return [{ key: k, href: a.href, title: d[a.key], desc: d[`${a.key}D` as keyof DiscoverText], badge: w(`home2.badge_${a.badge}`), ar: a.ar, colors: a.colors }];
    }),
  }));
}

/** every course, tool and section, in themed rows of posters that scroll sideways */
export function DiscoverRows() {
  const { tradition } = useTradition();
  const rows = useCards(tradition);
  const w = useWebT();
  return (
    <View style={{ gap: 28 }}>
      {rows.map((row) => (
        <View key={row.title}>
          <View style={{ paddingHorizontal: 16 }}><SectionTitle title={row.title} /></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {row.cards.map((c) => (
              <View key={c.key} style={{ width: 172 }}>
                <Poster title={c.title} desc={c.desc} badge={c.badge} arabic={c.ar} colors={c.colors} cta={w("home2.open")}
                  onPress={() => { tick(); router.push(c.href as Href); }} />
              </View>
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
}

// ---------- the endless stream ----------

type Item = (ExtraItem | SourceItem) & { kind: string };

/** round-robin over every content kind (extra and sources), one page at a time, de-duplicated by id */
export function useDiscoverStream() {
  const { lang } = useLang();
  const { tradition } = useTradition();
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const seen = useRef(new Set<string>());
  const pages = useRef(new Map<string, number>());
  const turn = useRef(0);
  const busyRef = useRef(false);
  const empty = useRef(0);

  const kinds = useRef<{ src: boolean; kind: string }[]>([]);
  useEffect(() => {
    const t = tradition === "sunni" || tradition === "shia" ? tradition : "all";
    const src = kindsFor(t).filter((k) => k !== "islamic-date").map((kind) => ({ src: true, kind }));
    const ext = EXTRA_KINDS.filter((k) => k !== "reciter-fact").map((kind) => ({ src: false, kind: kind as string }));
    // interleave: two library kinds, then one source kind
    const mixed: { src: boolean; kind: string }[] = [];
    for (let i = 0; mixed.length < src.length + ext.length; i++) {
      if (ext[2 * i]) mixed.push(ext[2 * i]);
      if (ext[2 * i + 1]) mixed.push(ext[2 * i + 1]);
      if (src[i]) mixed.push(src[i]);
    }
    kinds.current = mixed;
    seen.current = new Set(); pages.current = new Map(); turn.current = 0; empty.current = 0;
    setItems([]);
  }, [lang, tradition]);

  const more = useCallback(async () => {
    if (busyRef.current || !kinds.current.length || empty.current > kinds.current.length) return;
    busyRef.current = true; setBusy(true);
    try {
      const fresh: Item[] = [];
      // up to three kinds per round, until a handful of new cards came in
      for (let n = 0; n < 3 && fresh.length < 4; n++) {
        const k = kinds.current[turn.current % kinds.current.length];
        turn.current++;
        const p = pages.current.get(k.kind) ?? 0;
        pages.current.set(k.kind, p + 1);
        const t = tradition === "sunni" || tradition === "shia" ? tradition : "all";
        const got: Item[] = k.src
          ? await sourceFeedItems(k.kind as never, lang, p, { tradition: t, pageSize: 3 })
          : (await extraFeedItems(k.kind as never, lang, p, tradition)).slice(0, 3);
        const add = got.filter((i) => !seen.current.has(i.id));
        add.forEach((i) => seen.current.add(i.id));
        empty.current = add.length ? 0 : empty.current + 1;
        fresh.push(...add);
      }
      if (fresh.length) setItems((x) => [...x, ...fresh]);
    } finally {
      busyRef.current = false; setBusy(false);
    }
  }, [lang, tradition]);

  useEffect(() => { if (items.length === 0) void more(); }, [items.length, more]);

  /** pass to the page's ScrollView: loads more when the end comes near */
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height > contentSize.height - 1400) void more();
  }, [more]);

  return { items, busy, more, onScroll };
}

export function DiscoverStream({ s }: { s: ReturnType<typeof useDiscoverStream> }) {
  const d = useDiscoverText();
  const t = useTheme();
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 36 }}>
      <SectionTitle title={d.rowStream} />
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.muted, marginTop: -6, marginBottom: 14 }}>{d.streamLead}</Text>
      <View style={{ gap: 14 }}>
        {s.items.map((i) => <StreamCard key={i.id} item={i} />)}
      </View>
      <View style={{ paddingVertical: 24, alignItems: "center" }} accessibilityLiveRegion="polite">
        {s.busy ? <ActivityIndicator color={t.gold} accessibilityLabel={d.loading} /> : (
          <Pressable onPress={() => void s.more()} accessibilityRole="button" hitSlop={10}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{d.rowStream}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/** a discovery card: image (with credit) or the Arabic, topic label, title, text and the source line */
const StreamCard = memo(function StreamCard({ item }: { item: Item }) {
  const t = useTheme();
  const tx = useFeedText();
  const ex = item as ExtraItem;
  const ar = (item as SourceItem).arabic;
  const tone = toneOf(item.id);
  const label = topicLabel(tx, kindTopic(item.kind as never));
  const open = () => { tick(); if (item.sourceUrl) void Linking.openURL(item.sourceUrl); };
  return (
    <Pressable onPress={open} accessibilityRole="link" accessibilityLabel={`${label}. ${item.title}`}
      style={({ pressed }) => ({ borderRadius: R.card, overflow: "hidden", borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, transform: [{ scale: pressed ? 0.99 : 1 }] })}>
      {ex.image ? (
        <LinearGradient colors={tone} style={{ height: 190 }}>
          <Image source={{ uri: ex.image }} resizeMode="cover" style={{ flex: 1 }} accessibilityIgnoresInvertColors />
        </LinearGradient>
      ) : ar ? (
        <LinearGradient colors={tone} style={{ padding: 20 }}>
          <Text accessibilityLanguage="ar" numberOfLines={5} style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 42, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{ar}</Text>
        </LinearGradient>
      ) : <LinearGradient colors={tone} style={{ height: 6 }} />}
      <View style={{ padding: 16, gap: 6 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: stage.gold }}>{label}</Text>
        <Text style={{ fontFamily: FONT.display, fontSize: 18, lineHeight: 23, color: t.ink }} numberOfLines={2}>{item.title}</Text>
        {item.body ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted }} numberOfLines={5}>{item.body}</Text> : null}
        {ex.imageCredit ? <Text style={{ fontFamily: FONT.regular, fontSize: 10.5, lineHeight: 14, color: t.muted }} numberOfLines={2}>{fillText(tx.imageBy, { credit: ex.imageCredit })}</Text> : null}
        <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted }} numberOfLines={1}>{tx.sourceLabel}: {item.source}{ex.license ? ` · ${ex.license}` : ""}</Text>
      </View>
    </Pressable>
  );
});
