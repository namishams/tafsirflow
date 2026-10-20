import { useState } from "react";
import { FlatList, Modal, Pressable, Switch, Text, TextInput, View, type TextInputProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icons";
import { FONT, R, useTheme } from "@/lib/theme";
import { useT } from "@/i18n";

// Form fields in the website's style (h-11 rounded-md border bg-bg px-3, label above in muted text).

export function TextField({ label, ...props }: TextInputProps & { label: string }) {
  const t = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{label}</Text>
      <TextInput {...props} accessibilityLabel={label} placeholderTextColor={t.muted}
        onFocus={(e) => { setFocus(true); props.onFocus?.(e); }} onBlur={(e) => { setFocus(false); props.onBlur?.(e); }}
        style={{ height: 44, borderRadius: R.sm, borderWidth: 1, borderColor: focus ? t.ink : t.line, backgroundColor: t.bg, paddingHorizontal: 12, fontFamily: FONT.regular, fontSize: 15, color: t.ink }} />
    </View>
  );
}

/** a select: the chosen value in a field, the options in a sheet */
export function PickerField<T extends string>({ label, value, options, onChange, hint }: { label: string; value: T | ""; options: { value: T | ""; label: string }[]; onChange: (v: T | "") => void; hint?: string }) {
  const t = useTheme();
  const tr = useT();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label ?? (value || "–");
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{label}</Text>
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${label}: ${current}`}
        style={{ height: 44, borderRadius: R.sm, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{current}</Text>
        <Icon name="chevronDown" size={16} color={t.muted} />
      </Pressable>
      {hint ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.gold }}>{hint}</Text> : null}
      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: t.bg }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: t.line, backgroundColor: t.surface }}>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{label}</Text>
            <Pressable onPress={() => setOpen(false)} accessibilityRole="button" hitSlop={10}><Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.accent }}>{tr("common.done")}</Text></Pressable>
          </View>
          <FlatList data={options} keyExtractor={(o) => o.value || "-"} initialNumToRender={30} contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => { onChange(item.value); setOpen(false); }} accessibilityRole="button" accessibilityState={{ selected: item.value === value }}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", minHeight: 48, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: t.line, backgroundColor: pressed ? t.bg : t.surface })}>
                <Text style={{ flex: 1, fontFamily: item.value === value ? FONT.semibold : FONT.regular, fontSize: 15, color: t.ink }}>{item.label}</Text>
                {item.value === value ? <Icon name="check" size={18} color={t.accent} /> : null}
              </Pressable>
            )} />
        </View>
      </Modal>
    </View>
  );
}

export function SwitchField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: t.accent, false: t.line }} accessibilityLabel={label} />
      <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.ink }}>{label}</Text>
    </View>
  );
}
