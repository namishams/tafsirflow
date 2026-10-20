import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { Chip, GoldButton, GoldProgress, StarNumber } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ErrorState, Loading, PageHero } from "@/components/page";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { useStored } from "@/lib/store";
import { getChapters, type Chapter } from "@/lib/quran";
import { surahProgress } from "@/web/coach";
import { readSrs } from "@/web/learning";

// All 114 surahs (website SurahBrowser): search, continue where you stopped, bookmarks, filters, learning progress.
type Filter = "all" | "juzamma" | "makki" | "madani" | "learning";

export default function QuranIndex() {
  const t = useTheme();
  const w = useWebT("home");
  const wn = useWebT("nav");
  const wsr = useWebT("search");
  const { lang } = useLang();
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const last = useStored<{ chapter: number; verse: number } | null>("tf:last", null);
  const marks = useStored<string[]>("tf:bookmarks", []);
  const srs = useStored("tf:srs", {});
  const progress = useMemo(() => surahProgress(readSrs()), [srs]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(() => { setFailed(false); getChapters(lang).then(setChapters).catch(() => setFailed(true)); }, [lang]);
  useEffect(load, [load]);

  const shown = useMemo(() => {
    if (!chapters) return [];
    const q = query.trim().toLowerCase();
    return chapters.filter((c) => {
      if (filter === "juzamma" && c.id < 78) return false;
      if (filter === "makki" && c.revelation_place !== "makkah") return false;
      if (filter === "madani" && c.revelation_place !== "madinah") return false;
      if (filter === "learning" && !progress[c.id - 1]?.learned) return false;
      if (!q) return true;
      return String(c.id) === q || c.name_simple.toLowerCase().includes(q) || c.translated_name.name.toLowerCase().includes(q) || c.name_arabic.includes(query.trim());
    });
  }, [chapters, query, filter, progress]);

  if (failed) return <ErrorState retry={load} />;
  if (!chapters) return <Loading />;
  const lastChapter = last ? chapters.find((c) => c.id === last.chapter) : undefined;
  const filters: [Filter, string][] = [["all", w("surahs")], ["juzamma", "Juz ʿAmma"], ["makki", w("makki")], ["madani", w("madani")], ["learning", wn("map")]];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        style={{ backgroundColor: t.bg }}
        data={shown}
        keyExtractor={(c) => String(c.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 130 }}
        ListHeaderComponent={
          <View>
            <PageHero topInset eyebrow="Quran Masterclass" title={wn("quran")} arcade>
              {lastChapter && last ? (
                <GoldButton title={`${w("resume")} · ${lastChapter.name_simple} ${last.verse}`} icon="play" onPress={() => router.push(`/quran/${last.chapter}?v=${last.verse}` as Href)} />
              ) : null}
            </PageHero>
            <View style={{ paddingHorizontal: 16, paddingTop: 18, gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: R.pill, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 16 }}>
                <Icon name="search" color={t.muted} size={18} />
                <TextInput value={query} onChangeText={setQuery} placeholder={w("search")} placeholderTextColor={t.muted} accessibilityLabel={w("search")} returnKeyType="search"
                  style={{ flex: 1, fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
                {query ? <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear"><Icon name="close" color={t.muted} size={16} /></Pressable> : null}
              </View>
              {query.trim().length > 2 ? (
                <Pressable onPress={() => router.push(`/search?q=${encodeURIComponent(query.trim())}` as Href)} accessibilityRole="button">
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{w("searchVerses")} · „{query.trim()}“ · {wsr("go")}</Text>
                </Pressable>
              ) : null}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {filters.map(([f, label]) => <Chip key={f} label={label} selected={filter === f} onPress={() => setFilter(f)} />)}
              </View>
              {marks.length > 0 && filter === "all" && !query ? (
                <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 14 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink, marginBottom: 8 }}>{w("bookmarks")}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {marks.slice(-12).reverse().map((k) => { const [s, v] = k.split(":"); const c = chapters.find((x) => x.id === Number(s)); return (
                      <Chip key={k} label={`${c?.name_simple ?? s} ${v}`} onPress={() => router.push(`/quran/${s}?v=${v}` as Href)} />); })}
                  </View>
                </View>
              ) : null}
            </View>
            <View style={{ height: 12 }} />
          </View>
        }
        ListEmptyComponent={<Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: "center", marginTop: 30 }}>{w("noResults")}</Text>}
        renderItem={({ item: c, index }) => {
          const p = progress[c.id - 1];
          return (
            <Pressable onPress={() => router.push(`/quran/${c.id}` as Href)} accessibilityRole="button" accessibilityLabel={`${c.id}. ${c.name_simple}, ${c.translated_name.name}, ${c.verses_count} ${w("verses")}`}
              style={({ pressed }) => [{ marginHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: pressed ? t.bg : t.surface, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: t.line },
                index === 0 && { borderTopWidth: 1, borderTopLeftRadius: R.lg, borderTopRightRadius: R.lg },
                index === shown.length - 1 && { borderBottomLeftRadius: R.lg, borderBottomRightRadius: R.lg }]}>
              <StarNumber n={c.id} size={36} active={!!p?.learned} />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink }} numberOfLines={1}>{c.name_simple}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }} numberOfLines={1}>{c.translated_name.name} · {c.verses_count} {w("verses")} · {c.revelation_place === "madinah" ? w("madani") : w("makki")}</Text>
                {p?.learned ? <View style={{ marginTop: 3 }}><GoldProgress value={p.learned / Math.max(1, p.total)} /></View> : null}
              </View>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 21, color: t.ink }}>{c.name_arabic}</Text>
            </Pressable>
          );
        }}
      />
    </>
  );
}
