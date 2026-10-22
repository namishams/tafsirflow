import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StarLattice } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, stage } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useStored } from "@/lib/store";
import { NAHJ_EDITION_KEY, nahjAt, nahjEdition, nahjPosition, saveNahjPosition, setNahjEdition, type NahjEdition, type NahjPassage } from "@/features/hadith/nahj";
import { nahjItem, toggleSaved } from "@/features/hadith/data";
import { ContentState, HADITH_FREE_PREVIEW, HadithProCard, HadithShare, useSavedState } from "@/features/hadith/ui";
import { useNahjContent } from "@/features/hadith/nahjContent";
import { useHadithText } from "@/features/hadith/texts";

// /nahj – Nahj al-Balagha as an endless vertical feed: one saying or a short excerpt of a sermon or letter per page,
// Arabic above the translation, with its reference, the compiler and the edition's translator credit. Save, share
// (image with credit), next. After the last passage a new shuffled pass begins; the position is remembered per edition
// (Deutsch / English). Open to everyone from the library; the feed, school and knowledge posts show it only when
// showsNahj(). The text comes from the server (features/hadith/nahjContent.ts); without Pro the first passages are a
// preview, then the Pro card.
export default function NahjFeed() {
  const { lang } = useLang();
  useStored<string | null>(NAHJ_EDITION_KEY, null); // re-render when the edition is switched
  const ed = nahjEdition(lang);
  const content = useNahjContent([ed]);
  if (content.status !== "ready") {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={[stage.bg, stage.deep]} style={{ flex: 1, justifyContent: "center" }}>
          <ContentState status={content.status} onRetry={content.retry} onStage />
        </LinearGradient>
      </>
    );
  }
  return <Feed key={`${ed}:${content.preview}`} ed={ed} preview={content.preview} />;
}

const STEP = 20;

function Feed({ ed, preview }: { ed: NahjEdition; preview: boolean }) {
  const x = useHadithText();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const start = useMemo(() => nahjPosition(ed), [ed]);
  const [count, setCount] = useState(STEP);
  const list = useRef<FlatList<number>>(null);
  const current = useRef(0);
  // without Pro: the first few passages, then one page with the Pro card (index -1)
  const data = useMemo(() => (preview ? [...Array.from({ length: HADITH_FREE_PREVIEW }, (_, i) => start.k + i), -1] : Array.from({ length: count }, (_, i) => start.k + i)), [count, start.k, preview]);

  const onViewable = useRef(({ viewableItems }: { viewableItems: { item?: unknown; index?: number | null }[] }) => {
    const v = viewableItems[0];
    if (typeof v?.item !== "number" || v.item < 0) return;
    current.current = (v.index ?? 0);
    saveNahjPosition(ed, { seed: start.seed, k: v.item });
  }).current;

  const next = useCallback(() => {
    const i = current.current + 1;
    if (i >= data.length) return;
    if (!preview && i >= count - 2) setCount((c) => c + STEP);
    requestAnimationFrame(() => list.current?.scrollToIndex({ index: i, animated: true }));
  }, [count, data.length, preview]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: stage.deep }}>
        <FlatList
          ref={list}
          data={data}
          keyExtractor={(k) => String(k)}
          renderItem={({ item: k }) => {
            const p = k >= 0 ? nahjAt(ed, start.seed, k) : null;
            if (!p) return <View style={{ height, width, justifyContent: "center", backgroundColor: stage.deep }}><HadithProCard /></View>;
            return <Page p={p} height={height} width={width} top={insets.top + 64} bottom={insets.bottom + 24} onNext={next} />;
          }}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          onEndReached={() => { if (!preview) setCount((c) => c + STEP); }}
          onEndReachedThreshold={2}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          windowSize={5}
          initialNumToRender={2}
          maxToRenderPerBatch={3}
        />
        {/* top bar: back, title, edition switch */}
        <View style={{ position: "absolute", top: insets.top + 8, left: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/" as Href))} accessibilityRole="button" accessibilityLabel={x.close} hitSlop={8}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.25)" }}>
            <Icon name="close" color="#fff" size={20} />
          </Pressable>
          <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 15, color: "#fff" }} numberOfLines={1}>{x.nahj}</Text>
          <View style={{ flexDirection: "row", borderRadius: R.pill, borderWidth: 1, borderColor: stage.goldSoft, overflow: "hidden" }} accessibilityRole="tablist">
            {(["de", "en"] as const).map((e) => (
              <Pressable key={e} onPress={() => setNahjEdition(e)} accessibilityRole="tab" accessibilityState={{ selected: ed === e }} accessibilityLabel={e === "de" ? x.langDe : x.langEn}
                style={{ paddingHorizontal: 12, height: 34, justifyContent: "center", backgroundColor: ed === e ? "rgba(214,180,108,0.25)" : "transparent" }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: ed === e ? stage.cream : stage.textSoft }}>{e === "de" ? x.langDe : x.langEn}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </>
  );
}

function Page({ p, height, width, top, bottom, onNext }: { p: NahjPassage; height: number; width: number; top: number; bottom: number; onNext: () => void }) {
  const x = useHadithText();
  const item = useMemo(() => nahjItem(p), [p]);
  const saved = useSavedState(item.id);
  const [share, setShare] = useState(false);
  const words = p.text.split(" ").length + (p.arabic ? p.arabic.split(" ").length : 0);
  const size = words > 170 ? 16.5 : words > 120 ? 18 : words > 70 ? 20 : words > 35 ? 22.5 : 25;
  return (
    <LinearGradient colors={[stage.bg, stage.deep]} style={{ height, width, paddingTop: top, paddingBottom: bottom, paddingHorizontal: 22, flexDirection: "row" }}>
      <StarLattice opacity={0.05} />
      <Text allowFontScaling={false} style={{ position: "absolute", bottom: bottom + 40, start: 16, fontFamily: CALLIG_FONT, fontSize: 64, lineHeight: 110, color: "rgba(214,180,108,0.08)" }}>نهج البلاغة</Text>
      <View style={{ flex: 1, justifyContent: "center", paddingEnd: 14 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 8 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.8, textTransform: "uppercase", color: stage.gold }}>{p.ref}</Text>
          {p.arabic ? <Text lang="ar" selectable style={{ fontFamily: ARABIC_FONT, fontSize: Math.max(20, size + 2), lineHeight: Math.max(20, size + 2) * 1.9, color: stage.cream, writingDirection: "rtl", textAlign: "right", marginTop: 14 }}>{p.arabic}</Text> : null}
          <Text lang={p.edition} selectable style={{ fontFamily: FONT.regular, fontSize: size, lineHeight: size * 1.5, color: "#fff", marginTop: 14 }} accessibilityLabel={`${p.ref}. ${p.text}`}>{p.text}</Text>
          {p.machine ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: stage.gold, marginTop: 12 }}>{x.machine}</Text> : null}
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted, marginTop: 12 }}>{p.credit}</Text>
        </ScrollView>
      </View>
      {/* actions on the side */}
      <View style={{ justifyContent: "flex-end", gap: 18, paddingBottom: 12 }}>
        <Side icon="bookmark" label={saved ? x.saved : x.save} on={saved} onPress={() => toggleSaved(item)} />
        <Side icon="send" label={x.share} onPress={() => setShare(true)} />
        <Side icon="chevronDown" label={x.next} onPress={onNext} hint={x.nahjSwipe} />
      </View>
      {share ? <HadithShare item={item} onClose={() => setShare(false)} /> : null}
    </LinearGradient>
  );
}

function Side({ icon, label, on, onPress, hint }: { icon: IconName; label: string; on?: boolean; onPress: () => void; hint?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityHint={hint} accessibilityState={on !== undefined ? { selected: on } : undefined} hitSlop={6} style={{ alignItems: "center", gap: 4 }}>
      <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: on ? stage.gold : stage.goldSoft, backgroundColor: on ? "rgba(214,180,108,0.2)" : "rgba(255,255,255,0.06)" }}>
        <Icon name={icon} color={on ? stage.cream : stage.gold} size={21} />
      </View>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: stage.textSoft }}>{label}</Text>
    </Pressable>
  );
}
