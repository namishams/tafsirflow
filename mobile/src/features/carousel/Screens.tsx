import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { router, type Href } from "expo-router";
import { PageHero, goBack } from "@/components/page";
import { useLang } from "@/i18n";
import { FONT, R, useTheme } from "@/lib/theme";
import { fetchCarousel, fetchCarouselPage, type SeriesInfo } from "./api";
import { CarouselPost, CarouselTile } from "./Posts";
import { registerCarousel } from "./registry";
import { useCarouselTexts } from "./scripture";
import { fill, useCarouselText } from "./text";
import type { CarouselPayload } from "./types";

// /carousels and /carousels/<id> in the app (the website's /[locale]/carousels pages): the gallery with the series as
// chips and the covers in a grid, and one carousel with its slides, sharing and the slides as text.

export function CarouselGalleryScreen({ series: initial }: { series?: string }) {
  const tx = useCarouselText();
  const t = useTheme();
  const { lang } = useLang();
  const { width } = useWindowDimensions();
  const [series, setSeries] = useState<string | undefined>(initial);
  const [list, setList] = useState<string[]>([]);
  const [all, setAll] = useState<SeriesInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const load = useCallback(async (offset: number) => {
    setBusy(true); setErr(false);
    try {
      const p = await fetchCarouselPage(lang, { series, offset, limit: 24 });
      const ids = p.items.map(registerCarousel);
      setList((l) => (offset ? [...l, ...ids.filter((x) => !l.includes(x))] : ids));
      setAll(p.series); setTotal(p.total);
    } catch { setErr(true); } finally { setBusy(false); }
  }, [lang, series]);
  useEffect(() => { setList([]); void load(0); }, [load]);
  const cols = width > 700 ? 4 : width > 480 ? 3 : 2;
  const size = Math.floor((Math.min(width, 900) - 24 - (cols - 1) * 8) / cols);
  const chip = (id: string | undefined, label: string, count?: number) => {
    const on = series === id;
    return (
      <Pressable key={id ?? "all"} onPress={() => setSeries(id)} accessibilityRole="tab" accessibilityState={{ selected: on }}
        style={{ height: 34, paddingHorizontal: 14, borderRadius: R.pill, justifyContent: "center", borderWidth: 1, borderColor: on ? t.ink : t.line, backgroundColor: on ? t.ink : "transparent" }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: on ? t.bg : t.ink }}>{label}{count ? `  ${count}` : ""}</Text>
      </Pressable>
    );
  };
  return (
    <FlatList
      style={{ flex: 1, backgroundColor: t.bg }}
      data={list}
      key={cols}
      numColumns={cols}
      keyExtractor={(id) => id}
      columnWrapperStyle={{ gap: 8, paddingHorizontal: 12 }}
      contentContainerStyle={{ gap: 8, paddingBottom: 120 }}
      ListHeaderComponent={(
        <View>
          <PageHero back eyebrow={tx.carousel} title={tx.carousels} topInset />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist" contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingVertical: 14 }}>
            {chip(undefined, tx.all)}
            {all.map((s) => chip(s.id, s.label, s.count))}
          </ScrollView>
        </View>
      )}
      renderItem={({ item }) => <CarouselTile id={item} size={size} onPress={() => router.push(`/carousels/${item.slice(3)}` as Href)} />}
      onEndReached={() => { if (!busy && list.length < total) void load(list.length); }}
      onEndReachedThreshold={1.5}
      ListFooterComponent={busy ? <ActivityIndicator style={{ marginTop: 20 }} color={t.accent} /> : err ? (
        <Text onPress={() => void load(list.length)} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent, textAlign: "center", marginTop: 20 }}>{tx.offline}</Text>
      ) : undefined}
    />
  );
}

export function CarouselDetailScreen({ id }: { id: string }) {
  const tx = useCarouselText();
  const t = useTheme();
  const { lang } = useLang();
  const { width } = useWindowDimensions();
  const [c, setC] = useState<CarouselPayload | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let live = true;
    setC(null); setErr(false);
    fetchCarousel(id, lang).then((x) => { if (live) { registerCarousel(x); setC(x); } }).catch(() => { if (live) setErr(true); });
    return () => { live = false; };
  }, [id, lang]);
  const { texts } = useCarouselTexts(c, lang, !!c);
  const w = Math.min(width, 560);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 120 }}>
      <PageHero back eyebrow={c?.cover.kicker ?? tx.carousel} title={c?.cover.title ?? " "} lead={c?.cover.sub} topInset arcade={false} />
      {c ? (
        <View style={{ marginTop: 12 }}>
          <CarouselPost id={`cr:${c.id}`} width={w} />
          <View style={{ paddingHorizontal: 16, gap: 14, marginTop: 8, maxWidth: 640, alignSelf: "center", width: "100%" }}>
            {c.slides.map((s) => (
              <View key={s.n} style={{ gap: 4 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.muted }}>{fill(tx.slideOf, { n: s.n + 1, total: c.slides.length + 2 })}</Text>
                {s.title ? <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{s.title}</Text> : null}
                {(texts[s.n] ?? []).map((sc, i) => (
                  <View key={i} style={{ borderStartWidth: 2, borderColor: t.gold, paddingStart: 10, gap: 4 }}>
                    {sc.text ? <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.ink }}>{sc.text}</Text> : null}
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.muted }}>{sc.ref}</Text>
                  </View>
                ))}
                {s.body ? <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.ink }}>{s.body}</Text> : null}
                {s.list?.map((x, i) => <Text key={i} style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.ink }}>{i + 1}. {x}</Text>)}
              </View>
            ))}
          </View>
        </View>
      ) : err ? (
        <Text onPress={goBack} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent, textAlign: "center", marginTop: 30 }}>{tx.offline}</Text>
      ) : <ActivityIndicator style={{ marginTop: 30 }} color={t.accent} />}
    </ScrollView>
  );
}
