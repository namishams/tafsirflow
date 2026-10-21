import { memo, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { FlatList, Linking, Pressable, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { CARD_SIZE, PALETTES } from "@/features/share/formats";
import { Rosette } from "@/features/share/ShareTemplates";
import { StoryGlyph } from "@/features/share/feedShare";
import { useTemplateText } from "@/features/share/templateTexts";
import { tick } from "@/features/feed/haptics";
import { SAVED_KEY, carouselOf, toggleSavedPost, wisdomOf, type SavedPost } from "./registry";
import { useCarouselTexts, useWisdomText } from "./scripture";
import { CarouselSlideView, CoverSlide, WisdomCard, slideCount } from "./Slide";
import { CarouselShareSheet, Scaled, SlideShareSheet, WisdomShareSheet } from "./Export";
import { fill, useCarouselText } from "./text";
import type { CarouselPayload, WisdomPayload } from "./types";

// Carousel and wisdom posts in the feed: Home (an Instagram post: header, slides swiped horizontally inside the post
// with dots, actions, caption), Reels (full screen, swiped horizontally), Explore (a tile with the cover and the
// carousel mark). Likes and saves are local (new keys); sharing exports every slide (Export.tsx).

const LIKES = "qmc.carousel.likes";
function useFlag(key: string, id: string) {
  const list = useStored<string[]>(key, []);
  const on = list.includes(id);
  const toggle = useCallback(() => {
    const cur = readJSON<string[]>(key, []);
    writeJSON(key, cur.includes(id) ? cur.filter((x) => x !== id) : [...cur.slice(-499), id], true);
    tick();
  }, [key, id]);
  return [on, toggle] as const;
}
/** saved posts keep their payload on the device, so the Saved collection can show them later (registry.ts) */
function useSaved(post: SavedPost | null) {
  const list = useStored<SavedPost[]>(SAVED_KEY, []);
  const id = post ? post.p.id : "";
  const on = !!post && list.some((x) => x.k === post.k && x.p.id === id);
  const toggle = useCallback(() => { if (post) { toggleSavedPost(post); tick(); } }, [post]);
  return [on, toggle] as const;
}

function Dots({ n, at, color, dim }: { n: number; at: number; color: string; dim: string }) {
  // Instagram shows at most a handful of dots; the active one is larger
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: n }, (_, i) => <View key={i} style={{ width: i === at ? 7 : 5.5, height: i === at ? 7 : 5.5, borderRadius: 4, backgroundColor: i === at ? color : dim }} />)}
    </View>
  );
}

/** the horizontal pager of the slides (4:5), shared by Home and Reels */
function Pager({ c, width, texts, at, onAt, onDouble }: { c: CarouselPayload; width: number; texts: Record<number, import("./types").Scripture[]>; at: number; onAt: (i: number) => void; onDouble?: () => void }) {
  const tx = useCarouselText();
  const total = slideCount(c);
  const list = useRef<FlatList<number>>(null);
  const size = CARD_SIZE.post;
  const lastTap = useRef(0);
  const go = (i: number) => { const k = Math.max(0, Math.min(total - 1, i)); list.current?.scrollToIndex({ index: k, animated: true }); onAt(k); };
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => { const i = Math.round(e.nativeEvent.contentOffset.x / width); if (i !== at) { onAt(i); tick(); } };
  return (
    <View accessible accessibilityRole="adjustable" accessibilityLabel={`${c.cover.title}. ${fill(tx.slideOf, { n: at + 1, total })}`}
      accessibilityActions={[{ name: "increment", label: tx.next }, { name: "decrement", label: tx.prev }]}
      onAccessibilityAction={(e) => go(at + (e.nativeEvent.actionName === "increment" ? 1 : -1))}>
      <FlatList
        ref={list}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false} nestedScrollEnabled
        data={Array.from({ length: total }, (_, i) => i)}
        keyExtractor={(i) => String(i)}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={onEnd}
        initialNumToRender={2} windowSize={3} maxToRenderPerBatch={2}
        renderItem={({ item }) => (
          <Pressable onPress={() => { const now = Date.now(); if (now - lastTap.current < 280) onDouble?.(); lastTap.current = now; }} accessible={false}>
            <Scaled w={size.w} h={size.h} width={width}><CarouselSlideView c={c} index={item} format="post" texts={texts} /></Scaled>
          </Pressable>
        )}
      />
    </View>
  );
}

function ActionIcon({ name, label, on, color, onPress, children }: { name?: Parameters<typeof Icon>[0]["name"]; label: string; on?: boolean; color: string; onPress: () => void; children?: ReactNode }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={on !== undefined ? { selected: on } : undefined} hitSlop={6}
      style={({ pressed }) => ({ width: 40, height: 40, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
      {children ?? (name ? <Icon name={name} color={color} size={24} /> : null)}
    </Pressable>
  );
}

// ---------- Home ----------
export const CarouselPost = memo(function CarouselPost({ id, width, onDark }: { id: string; width: number; onDark?: boolean }) {
  const c = carouselOf(id);
  return c ? <CarouselPostInner c={c} width={width} onDark={onDark} /> : <View style={{ height: 1 }} />;
});
function CarouselPostInner({ c, width, onDark }: { c: CarouselPayload; width: number; onDark?: boolean }) {
  const th = useTheme();
  const t = onDark ? { ...th, ink: "#fff", muted: "rgba(255,255,255,0.65)", line: "rgba(255,255,255,0.25)", accent: stage.gold } : th;
  const tx = useCarouselText();
  const tt = useTemplateText();
  const { lang } = useLang();
  const { texts } = useCarouselTexts(c, lang);
  const [at, setAt] = useState(0);
  const [liked, like] = useFlag(LIKES, c.id);
  const [saved, save] = useSaved(useMemo(() => ({ k: "c" as const, p: c }), [c]));
  const [sheet, setSheet] = useState<"all" | "story" | "storyQuick" | null>(null);
  const p = PALETTES[c.palette];
  const total = slideCount(c);
  return (
    <View style={{ width, alignSelf: "center", paddingBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, height: 56 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: p.bg[1], borderWidth: 1, borderColor: p.line }}>
          <Rosette p={p} size={30}><Icon name="grid" color={p.line} size={12} /></Rosette>
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{c.seriesLabel}</Text>
          <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{tx.carousel} · {total}</Text>
        </View>
        <Pressable onPress={() => setSheet("storyQuick")} accessibilityRole="button" accessibilityLabel={tx.shareSlideStory} hitSlop={4}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, height: 32, paddingHorizontal: 12, borderRadius: R.pill, borderWidth: 1, borderColor: onDark ? stage.gold : t.gold, opacity: pressed ? 0.7 : 1 })}>
          <StoryGlyph color={onDark ? stage.gold : t.gold} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.ink }}>{tt.story}</Text>
        </Pressable>
      </View>
      <Pager c={c} width={width} texts={texts} at={at} onAt={setAt} onDouble={() => { if (!liked) like(); }} />
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 6, marginTop: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <ActionIcon name="heart" label={tx.like} on={liked} color={liked ? "#b8913f" : t.ink} onPress={like} />
          <ActionIcon name="send" label={tx.shareAll} color={t.ink} onPress={() => setSheet("all")} />
        </View>
        <Dots n={total} at={at} color={t.accent} dim={t.line} />
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <ActionIcon name="bookmark" label={tx.save} on={saved} color={saved ? t.gold : t.ink} onPress={save} />
        </View>
      </View>
      <View style={{ paddingHorizontal: 14, gap: 3 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, lineHeight: 20, color: t.ink }}>{c.cover.title}</Text>
        {c.cover.sub ? <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.ink }}>{c.cover.sub}</Text> : null}
        <Text numberOfLines={1} onPress={c.sources[0]?.url ? () => void Linking.openURL(c.sources[0].url!) : undefined} style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted, marginTop: 2 }}>
          {tx.sources}: {c.sources.map((s) => s.label).join(" · ")}
        </Text>
        {c.review ? <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted }}>{tx.review}</Text> : null}
      </View>
      {sheet === "all" ? <CarouselShareSheet visible c={c} texts={texts} onClose={() => setSheet(null)} /> : null}
      {sheet === "story" || sheet === "storyQuick" ? <SlideShareSheet c={c} index={at} texts={texts} quick={sheet === "storyQuick"} onClose={() => setSheet(null)} /> : null}
    </View>
  );
}

// ---------- Reels: full screen, slides swiped horizontally ----------
export const CarouselReel = memo(function CarouselReel({ id, width, height, topInset, bottomInset }: { id: string; width: number; height: number; topInset: number; bottomInset: number }) {
  const c = carouselOf(id);
  const tx = useCarouselText();
  const { lang } = useLang();
  const { texts } = useCarouselTexts(c, lang, !!c);
  const [at, setAt] = useState(0);
  const [liked, like] = useFlag(LIKES, c?.id ?? "");
  const [saved, save] = useSaved(useMemo(() => (c ? { k: "c" as const, p: c } : null), [c]));
  const [sheet, setSheet] = useState<"all" | "story" | null>(null);
  if (!c) return <View style={{ width, height, backgroundColor: stage.deep }} />;
  const total = slideCount(c);
  // the largest 4:5 that fits between the chrome
  const room = height - topInset - bottomInset - 120;
  const w = Math.min(width, Math.max(200, room * 0.8));
  const side = (
    <View style={{ position: "absolute", end: 8, bottom: bottomInset + 96, alignItems: "center", gap: 6 }}>
      <ActionIcon name="heart" label={tx.like} on={liked} color={liked ? "#d6b46c" : "#fff"} onPress={like} />
      <ActionIcon name="send" label={tx.shareAll} color="#fff" onPress={() => setSheet("all")} />
      <ActionIcon label={tx.shareSlideStory} color="#fff" onPress={() => setSheet("story")}><StoryGlyph color="#fff" size={19} /></ActionIcon>
      <ActionIcon name="bookmark" label={tx.save} on={saved} color={saved ? "#d6b46c" : "#fff"} onPress={save} />
    </View>
  );
  return (
    <View style={{ width, height, backgroundColor: PALETTES[c.palette].bg[2] ?? stage.deep, paddingTop: topInset, paddingBottom: bottomInset, justifyContent: "center" }}>
      <View style={{ alignSelf: "center", width: w }}>
        <Pager c={c} width={w} texts={texts} at={at} onAt={setAt} onDouble={() => { if (!liked) like(); }} />
        <View style={{ marginTop: 10 }}><Dots n={total} at={at} color={stage.gold} dim="rgba(255,255,255,0.3)" /></View>
      </View>
      <View style={{ paddingHorizontal: 16, paddingEnd: 64, marginTop: 12, gap: 3 }}>
        <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold }}>{c.seriesLabel} · {tx.carousel}</Text>
        <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 15, lineHeight: 21, color: "#fff" }}>{c.cover.title}</Text>
        {c.review ? <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{tx.review}</Text> : null}
      </View>
      {side}
      {sheet === "all" ? <CarouselShareSheet visible c={c} texts={texts} onClose={() => setSheet(null)} /> : null}
      {sheet === "story" ? <SlideShareSheet c={c} index={at} texts={texts} onClose={() => setSheet(null)} /> : null}
    </View>
  );
});

// ---------- wisdom: one image ----------
export const WisdomPost = memo(function WisdomPost({ id, width, onDark }: { id: string; width: number; onDark?: boolean }) {
  const w = wisdomOf(id);
  return w ? <WisdomPostInner w={w} width={width} onDark={onDark} /> : <View style={{ height: 1 }} />;
});
function WisdomPostInner({ w, width, onDark }: { w: WisdomPayload; width: number; onDark?: boolean }) {
  const th = useTheme();
  const t = onDark ? { ...th, ink: "#fff", muted: "rgba(255,255,255,0.65)", line: "rgba(255,255,255,0.25)" } : th;
  const tx = useCarouselText();
  const tt = useTemplateText();
  const { lang } = useLang();
  const { s, ready } = useWisdomText(w, lang);
  const [liked, like] = useFlag(LIKES, `w:${w.id}`);
  const [sheet, setSheet] = useState<"full" | "quick" | null>(null);
  const p = PALETTES[w.palette];
  // a reference that could not be loaded is not shown (never a wisdom card without its source text)
  if ((w.key || w.c) && ready && !s) return <View style={{ height: 1 }} />;
  const size = CARD_SIZE.post;
  return (
    <View style={{ width, alignSelf: "center", paddingBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, height: 56 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: p.bg[1], borderWidth: 1, borderColor: p.line }}>
          <Rosette p={p} size={30}><Icon name="starBig" color={p.line} size={11} /></Rosette>
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{w.kind === "reflection" ? tx.reflection : tx.wisdom}</Text>
          <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{w.themeLabel}</Text>
        </View>
        <Pressable onPress={() => setSheet("quick")} accessibilityRole="button" accessibilityLabel={tt.shareStory} hitSlop={4}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, height: 32, paddingHorizontal: 12, borderRadius: R.pill, borderWidth: 1, borderColor: onDark ? stage.gold : t.gold, opacity: pressed ? 0.7 : 1 })}>
          <StoryGlyph color={onDark ? stage.gold : t.gold} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.ink }}>{tt.story}</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => undefined} onLongPress={() => setSheet("full")} accessible accessibilityRole="image"
        accessibilityLabel={[w.themeLabel, w.text ?? s?.text ?? "", s?.ref ?? w.source.label].filter(Boolean).join(". ")}>
        <Scaled w={size.w} h={size.h} width={width}><WisdomCard w={w} format="post" scripture={s} /></Scaled>
      </Pressable>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 6, marginTop: 4 }}>
        <ActionIcon name="heart" label={tx.like} on={liked} color={liked ? "#b8913f" : t.ink} onPress={like} />
        <ActionIcon name="send" label={tt.shareNow} color={t.ink} onPress={() => setSheet("full")} />
      </View>
      <Text numberOfLines={2} onPress={s?.url || w.source.url ? () => void Linking.openURL((s?.url ?? w.source.url)!) : undefined}
        style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted, paddingHorizontal: 14 }}>
        {tx.source}: {s?.ref ?? w.source.label}{w.review && w.kind !== "verse" ? ` · ${tx.review}` : ""}
      </Text>
      {sheet ? <WisdomShareSheet w={w} scripture={s} quick={sheet === "quick"} onClose={() => setSheet(null)} /> : null}
    </View>
  );
}

export const WisdomReel = memo(function WisdomReel({ id, width, height, topInset, bottomInset }: { id: string; width: number; height: number; topInset: number; bottomInset: number }) {
  const w = wisdomOf(id);
  const { lang } = useLang();
  const { s } = useWisdomText(w, lang);
  const tt = useTemplateText();
  const [sheet, setSheet] = useState(false);
  if (!w) return <View style={{ width, height, backgroundColor: stage.deep }} />;
  // the 9:16 card fills the screen (its own safe zones keep the text clear of the chrome)
  const size = CARD_SIZE.story;
  const k = Math.min(width / size.w, (height - topInset - bottomInset * 0.3) / size.h);
  return (
    <View style={{ width, height, backgroundColor: PALETTES[w.palette].bg[2] ?? stage.deep, alignItems: "center", justifyContent: "center" }}>
      <Scaled w={size.w} h={size.h} width={size.w * k}><WisdomCard w={w} format="story" scripture={s} /></Scaled>
      <View style={{ position: "absolute", end: 8, bottom: bottomInset + 96 }}>
        <ActionIcon name="send" label={tt.shareStory} color="#fff" onPress={() => setSheet(true)} />
      </View>
      {sheet ? <WisdomShareSheet w={w} scripture={s} onClose={() => setSheet(false)} /> : null}
    </View>
  );
});

// ---------- Explore tiles ----------
/** the cover (square) with Instagram's carousel mark in the corner */
export const CarouselTile = memo(function CarouselTile({ id, size, onPress }: { id: string; size: number; onPress: () => void }) {
  const c = carouselOf(id);
  const w = c ? null : wisdomOf(id);
  const { lang } = useLang();
  const { s } = useWisdomText(w, lang);
  if (!c && !w) return <View style={{ width: size, height: size }} />;
  const sq = CARD_SIZE.square;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={c ? `${c.cover.title}. ${c.seriesLabel}` : `${w!.themeLabel}. ${w!.text ?? s?.ref ?? ""}`}
      style={({ pressed }) => ({ width: size, height: size, padding: 1, opacity: pressed ? 0.85 : 1 })}>
      <View style={{ flex: 1, overflow: "hidden" }}>
        <Scaled w={sq.w} h={sq.h} width={size - 2}>
          {c ? <CoverSlide c={c} format="square" total={slideCount(c)} /> : <WisdomCard w={w!} format="square" scripture={s} />}
        </Scaled>
        {c ? (
          <View style={[StyleSheet.absoluteFill, { alignItems: "flex-end", padding: 6 }]} pointerEvents="none">
            {/* two stacked squares: the carousel mark */}
            <View style={{ width: 15, height: 15 }}>
              <View style={{ position: "absolute", top: 0, right: 0, width: 11, height: 11, borderRadius: 2, borderWidth: 1.4, borderColor: "#fff" }} />
              <View style={{ position: "absolute", bottom: 0, left: 0, width: 11, height: 11, borderRadius: 2, borderWidth: 1.4, borderColor: "#fff", backgroundColor: "rgba(0,0,0,0.25)" }} />
            </View>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});
