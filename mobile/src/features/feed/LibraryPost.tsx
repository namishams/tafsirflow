import { memo, useRef, useState } from "react";
import { Animated, FlatList, Image, Linking, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GoldFrame } from "./ornament";
import { StarLattice } from "@/components/brand";
import { router, type Href } from "expo-router";
import { Icon, type IconName } from "@/components/icons";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { RECITERS } from "@/lib/quran";
import { RECITER_BIOS } from "@/web/reciters";
import type { ExtraItem } from "@/content/extra";
import type { SourceItem } from "@/content/sources";
import { toneOf } from "./art";
import { LIB, topicOfKind, type LibItem, type LibKind, type LibTopic } from "./library";
import { fillText, useFeedText, type FeedText } from "./texts";

// The posts of the content libraries: image posts (mosques, art, Met objects) with the image credit and licence link
// always shown, text cards with the Arabic on top (hadith, tafsir, duas, names, words), carousels (scholar timeline,
// seerah) and a source line on every post. Reciter posts link to the reciter's profile.

const KIND_ICON: Partial<Record<LibKind, IconName>> = {
  tafsir: "book", "surah-info": "book", "word-root": "cap", "word-of-day": "cap", "arabic-word": "cap", hadith: "note", "hadith-of-day": "note", "shia-hadith": "note",
  dua: "hands", asma: "starBig", "islamic-date": "calendar", "reciter-bio": "radio", "reciter-fact": "radio", mosque: "mosque", art: "pen", "met-art": "pen",
  "scholar-bio": "user", "scholar-work": "book", "scholar-timeline": "clock", seerah: "moon", history: "clock",
};
export const kindTopic = (kind: LibKind): LibTopic => topicOfKind(kind);
export const topicLabel = (tx: FeedText, t: LibTopic) => ({ tafsir: tx.topicTafsir, hadith: tx.hadith, duas: tx.topicDuas, prayer: tx.topicPrayer, holy: tx.topicHoly, seerah: tx.topicSeerah, quran: tx.topicQuran, scholars: tx.topicScholars, history: tx.topicHistory, art: tx.topicArt }[t]);

const ex = (i: LibItem) => i as ExtraItem;
const src = (i: LibItem) => i as SourceItem;
/** the profile of a reciter item (bio slug of the website's reciter pages) */
export function reciterHref(i: LibItem): Href | null {
  const folder = ex(i).reciterFolder;
  if (!folder) return null;
  const player = RECITERS.find((r) => r.folder === folder);
  const bio = player ? RECITER_BIOS.find((b) => b.playerSlug === player.slug) : undefined;
  return bio ? (`/reciters/${bio.slug}` as Href) : ("/reciters" as Href);
}
/** plain text of a post (Explore search) */
export const libText = (id: string) => { const p = LIB.get(id); return p ? p.items.map((i) => `${i.title} ${i.body} ${src(i).arabic ?? ""}`).join(" ") : ""; };

/** the source line: name, licence and a link to the original */
export function SourceLine({ item, light }: { item: LibItem; light?: boolean }) {
  const t = useTheme();
  const tx = useFeedText();
  const lic = ex(item).license;
  const color = light ? "rgba(255,255,255,0.7)" : t.muted;
  return (
    <Text onPress={() => { if (item.sourceUrl) void Linking.openURL(item.sourceUrl); }} accessibilityRole="link" numberOfLines={2}
      style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 16, color, paddingHorizontal: 14, marginTop: 8 }}>
      {tx.sourceLabel}: {item.source}{lic ? ` · ${lic}` : ""}
    </Text>
  );
}

/** an image that fades in over the post's colour (Reduce Motion: no fade); credit and licence link below it */
function LibImage({ item, w, h, reduce }: { item: ExtraItem; w: number; h: number; reduce: boolean }) {
  const tx = useFeedText();
  const op = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  const tone = toneOf(item.id);
  return (
    <View>
      <LinearGradient colors={tone} style={{ width: w, height: h, overflow: "hidden" }}>
        <StarLattice opacity={0.05} />
        <GoldFrame inset={7} />
        <Animated.View style={{ flex: 1, opacity: op }}>
          <Image source={{ uri: item.image }} resizeMode="cover" style={{ flex: 1 }} accessibilityIgnoresInvertColors accessibilityLabel={item.title}
            onLoad={() => { if (!reduce) Animated.timing(op, { toValue: 1, duration: 260, useNativeDriver: true }).start(); }} />
        </Animated.View>
      </LinearGradient>
      {item.imageCredit ? (
        <Text onPress={() => { const u = item.imageLicenseUrl ?? item.licenseUrl; if (u) void Linking.openURL(u); }} accessibilityRole="link" numberOfLines={2}
          style={{ fontFamily: FONT.regular, fontSize: 10.5, lineHeight: 14, color: "rgba(127,127,127,0.95)", paddingHorizontal: 14, marginTop: 6 }}>
          {fillText(tx.imageBy, { credit: item.imageCredit })}
        </Text>
      ) : null}
    </View>
  );
}

function Card({ item, w, tall }: { item: LibItem; w: number; tall?: boolean }) {
  const ar = src(item).arabic;
  const tone = toneOf(item.id);
  return (
    <LinearGradient colors={tone} style={{ width: w, minHeight: tall ? w * 1.1 : undefined, padding: 22, gap: 12, justifyContent: "center", overflow: "hidden" }}>
        <StarLattice opacity={0.05} />
        <GoldFrame inset={7} />
      {ar ? <Text accessibilityLanguage="ar" numberOfLines={tall ? 10 : 7} adjustsFontSizeToFit minimumFontScale={0.6} style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 42, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{ar}</Text> : null}
      <Text style={{ fontFamily: FONT.display, fontSize: 18, color: stage.gold, textAlign: "center" }}>{item.title}</Text>
      {item.body ? <Text numberOfLines={tall ? 14 : 9} style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: "rgba(255,255,255,0.9)", textAlign: "center" }}>{item.body}</Text> : null}
    </LinearGradient>
  );
}

export const LibraryPost = memo(function LibraryPost({ id, width, reduce, onDark }: { id: string; width: number; reduce: boolean; onDark?: boolean }) {
  const th = useTheme();
  const t = onDark ? { ...th, ink: "#fff", muted: "rgba(255,255,255,0.65)", line: "rgba(255,255,255,0.25)" } : th;
  const tx = useFeedText();
  const p = LIB.get(id);
  const [page, setPage] = useState(0);
  if (!p) return <View style={{ height: 1 }} />;
  const first = p.items[0];
  const topic = kindTopic(p.kind);
  const tone = toneOf(`lib:${p.kind}`);
  const profile = p.kind.startsWith("reciter") ? reciterHref(first) : null;
  return (
    <View style={{ width, alignSelf: "center", paddingBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, height: 56 }}>
        <LinearGradient colors={tone} style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" }}>
          <Icon name={KIND_ICON[p.kind] ?? "book"} color="rgb(233,207,153)" size={17} />
        </LinearGradient>
        <Pressable style={{ flex: 1 }} disabled={!profile} onPress={() => profile && router.push(profile)} accessibilityRole={profile ? "link" : undefined}>
          <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 14, color: profile ? t.accent : t.ink }}>{p.items.length > 1 ? topicLabel(tx, topic) : first.title}</Text>
          <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{ex(first).onThisDay ? tx.onThisDay : topicLabel(tx, topic)}</Text>
        </Pressable>
        {profile ? <Pressable onPress={() => router.push(profile)} accessibilityRole="button" hitSlop={6} style={{ height: 32, paddingHorizontal: 12, borderRadius: R.pill, justifyContent: "center", borderWidth: 1, borderColor: t.line }}><Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.accent }}>{tx.reciterProfile}</Text></Pressable> : null}
      </View>
      {p.items.length > 1 ? (
        <>
          <FlatList horizontal pagingEnabled showsHorizontalScrollIndicator={false} data={p.items} keyExtractor={(i) => i.id}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => ex(item).image ? (
              <View style={{ width }}><LibImage item={ex(item)} w={width} h={width * 0.75} reduce={reduce} /><Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, paddingHorizontal: 14, marginTop: 8 }}>{item.title}{ex(item).date ? ` · ${ex(item).date!.slice(0, 4).replace(/^0+/, "")}` : ""}</Text><Text numberOfLines={5} style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, paddingHorizontal: 14, marginTop: 4 }}>{item.body}</Text></View>
            ) : <Card item={item} w={width} tall />} />
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 10 }} accessibilityElementsHidden>
            {p.items.map((i, k) => <View key={i.id} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: k === page ? t.accent : t.line }} />)}
          </View>
          <SourceLine item={p.items[page] ?? first} light={onDark} />
        </>
      ) : ex(first).image ? (
        <>
          <LibImage item={ex(first)} w={width} h={width} reduce={reduce} />
          {first.body ? <Text numberOfLines={6} style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.ink, paddingHorizontal: 14, marginTop: 8 }}>{first.body}</Text> : null}
          <SourceLine item={first} light={onDark} />
        </>
      ) : (
        <>
          <View style={{ marginHorizontal: 12, borderRadius: R.card, overflow: "hidden" }}><Card item={first} w={width - 24} /></View>
          <SourceLine item={first} light={onDark} />
        </>
      )}
    </View>
  );
});
