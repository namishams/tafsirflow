import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CALLIG_FONT, FONT, R, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { StarNumber } from "@/components/brand";
import { useWebT } from "@/i18n/web";
import type { Chapter } from "@/lib/quran";
import { useQ } from "@/features/radio/art";

// The website's SurahPicker: a quiet pill with the current surah that opens a searchable sheet with all 114 surahs.
export function SurahPicker({ current, chapters, onPick }: { current: Chapter; chapters: Chapter[]; onPick: (id: number) => void }) {
  const t = useWebT("player");
  const th = useTheme();
  const q = useQ();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const s = query.trim().toLowerCase();
    const all = chapters.length ? chapters : [current];
    if (!s) return all;
    return all.filter((c) => String(c.id) === s || c.name_simple.toLowerCase().includes(s) || c.name_arabic.includes(s) || (c.translated_name?.name ?? "").toLowerCase().includes(s));
  }, [query, chapters, current]);
  const close = () => { setOpen(false); setQuery(""); };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${t("goSurah")}: ${current.id}. ${current.name_simple}`}
        style={({ pressed }) => ({ height: 40, borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? th.ink : th.line, backgroundColor: th.surface, paddingStart: 16, paddingEnd: 12, flexDirection: "row", alignItems: "center", gap: 8 })}>
        <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: th.ink }}>{current.id}. {current.name_simple}</Text>
        <Icon name="chevronDown" color={th.muted} size={16} />
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={close} accessibilityLabel={t("closeTafsir")} />
          <View style={{ maxHeight: "85%", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: "rgba(201,166,94,0.45)", backgroundColor: th.surface, overflow: "hidden" }}>
            <LinearGradient colors={["rgba(201,166,94,0)", "rgb(201,166,94)", "rgba(201,166,94,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 2 }} />
            <View style={{ padding: 16, paddingBottom: 8 }}>
              <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: th.line, marginBottom: 12 }} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <TextInput autoFocus value={query} onChangeText={setQuery} placeholder={t("goSurah")} placeholderTextColor={th.muted} accessibilityLabel={t("goSurah")}
                  style={{ flex: 1, height: 44, borderRadius: R.pill, borderWidth: 1, borderColor: "rgba(201,166,94,0.4)", backgroundColor: th.bg, paddingHorizontal: 16, fontFamily: FONT.regular, fontSize: 15, color: th.ink }} />
                <Pressable onPress={close} accessibilityRole="button" hitSlop={8} style={{ height: 44, justifyContent: "center", paddingHorizontal: 8 }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.muted }}>{t("closeTafsir")}</Text>
                </Pressable>
              </View>
            </View>
            <FlatList
              data={list}
              keyExtractor={(c) => String(c.id)}
              keyboardShouldPersistTaps="handled"
              initialScrollIndex={!query && current.id > 3 && list.length === 114 ? current.id - 3 : undefined}
              getItemLayout={(_, i) => ({ length: 60, offset: 60 * i, index: i })}
              contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: insets.bottom + 16 }}
              renderItem={({ item: c }) => {
                const on = c.id === current.id;
                return (
                  <Pressable onPress={() => { close(); if (!on) onPick(c.id); }} accessibilityRole="button" accessibilityState={{ selected: on }}
                    accessibilityLabel={`${c.id}. ${c.name_simple}, ${c.translated_name?.name ?? ""}, ${c.verses_count} ${t("verse")}`}
                    style={({ pressed }) => ({ height: 60, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 10, borderRadius: R.lg,
                      backgroundColor: on ? "rgba(201,166,94,0.12)" : pressed ? "rgba(201,166,94,0.08)" : "transparent", borderWidth: on ? 1 : 0, borderColor: "rgba(201,166,94,0.45)" })}>
                    <StarNumber n={c.id} size={40} active={on} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 15, color: th.ink }}>{c.name_simple}</Text>
                      <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted }}>{[c.translated_name?.name, `${c.verses_count} ${t("verse").toLowerCase()}`].filter(Boolean).join(" · ")}</Text>
                    </View>
                    <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 20, lineHeight: 32, color: q.inkGold, writingDirection: "rtl" }}>{c.name_arabic}</Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
