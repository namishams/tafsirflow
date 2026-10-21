import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { FONT, R, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { countryList } from "@/lib/countries";
import { useLang } from "@/i18n";
import { useTT } from "./text";

// country list in a sheet (search, "all countries" first); used by the talent filters and the profile editor
export function CountryPicker({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (code: string | null) => void }) {
  const t = useTheme();
  const tt = useTT();
  const { lang } = useLang();
  const [f, setF] = useState("");
  const all = useMemo(() => countryList(lang), [lang]);
  const rows = useMemo(() => [{ code: "", name: tt("anyCountry") }, ...all.filter((c) => !f || c.name.toLowerCase().includes(f.toLowerCase()))], [all, f]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 10 }}>
          <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 20, color: t.ink }}>{tt("chooseCountry")}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={tt("cancel")} hitSlop={10} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
            <Icon name="close" color={t.muted} size={20} />
          </Pressable>
        </View>
        <View style={{ margin: 16, height: 46, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 14, justifyContent: "center" }}>
          <TextInput value={f} onChangeText={setF} placeholder={tt("filterCountry")} placeholderTextColor={t.muted} accessibilityLabel={tt("filterCountry")} style={{ fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
        </View>
        <FlatList data={rows} keyExtractor={(c) => c.code || "all"} keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable onPress={() => onPick(item.code || null)} accessibilityRole="button" style={({ pressed }) => ({ minHeight: 50, paddingHorizontal: 20, justifyContent: "center", borderBottomWidth: 1, borderBottomColor: t.line, backgroundColor: pressed ? t.surface : t.bg })}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, color: t.ink }}>{item.name}</Text>
            </Pressable>
          )} />
      </View>
    </Modal>
  );
}
