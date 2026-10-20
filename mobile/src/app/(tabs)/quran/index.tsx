import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, router } from "expo-router";
import { ErrorState, Loading } from "@/components/ui";
import { useLang, useT } from "@/i18n";
import { getChapters, type Chapter } from "@/lib/quran";
import { ARABIC_FONT, radius, type, useTheme } from "@/lib/theme";

// All 114 surahs in one calm list: number, name, meaning, verses, Arabic name
export default function QuranIndex() {
  const t = useT();
  const theme = useTheme();
  const { lang } = useLang();
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");

  const loadAll = useCallback(() => {
    setFailed(false);
    getChapters(lang).then(setChapters).catch(() => setFailed(true));
  }, [lang]);
  useEffect(loadAll, [loadAll]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!chapters || !q) return chapters ?? [];
    return chapters.filter((c) => String(c.id) === q || c.name_simple.toLowerCase().includes(q) || c.translated_name.name.toLowerCase().includes(q) || c.name_arabic.includes(query.trim()));
  }, [chapters, query]);

  if (failed) return <ErrorState text={t("common.offline")} retry={loadAll} retryLabel={t("common.retry")} />;
  if (!chapters) return <Loading />;

  return (
    <>
      <Stack.Screen options={{ headerSearchBarOptions: { placeholder: t("quran.search"), onChangeText: (e) => setQuery(e.nativeEvent.text), hideWhenScrolling: false } }} />
      <FlatList
        style={{ backgroundColor: theme.bg }}
        contentInsetAdjustmentBehavior="automatic"
        data={shown}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={{ paddingVertical: 16 }}
        ItemSeparatorComponent={() => <View style={[s.sep, { backgroundColor: theme.separator }]} />}
        renderItem={({ item: c, index }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/quran/[surah]", params: { surah: String(c.id) } })}
            accessibilityRole="button"
            accessibilityLabel={`${c.id}. ${c.name_simple}, ${c.translated_name.name}, ${t("quran.verses", { n: c.verses_count })}`}
            style={({ pressed }) => [s.row, { backgroundColor: pressed ? theme.fill : theme.card },
              index === 0 && { borderTopLeftRadius: radius, borderTopRightRadius: radius },
              index === shown.length - 1 && { borderBottomLeftRadius: radius, borderBottomRightRadius: radius }]}>
            <Text style={[type.subhead, s.num, { color: theme.secondary }]}>{c.id}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[type.body, { color: theme.text }]}>{c.name_simple}</Text>
              <Text style={[type.subhead, { color: theme.secondary }]} numberOfLines={1}>{c.translated_name.name} · {t("quran.verses", { n: c.verses_count })}</Text>
            </View>
            <Text style={[s.arabic, { color: theme.text, fontFamily: ARABIC_FONT }]}>{c.name_arabic}</Text>
          </Pressable>
        )}
      />
    </>
  );
}

const s = StyleSheet.create({
  row: { marginHorizontal: 16, minHeight: 60, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 14 },
  num: { width: 28, textAlign: "center", fontVariant: ["tabular-nums"] },
  arabic: { fontSize: 22, lineHeight: 34 },
  sep: { height: StyleSheet.hairlineWidth, marginLeft: 16 + 16 + 28 + 14, marginRight: 16 },
});
