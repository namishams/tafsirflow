import { useState, type ReactNode } from "react";
import { FlatList, Modal, Pressable, Switch, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { useTx } from "./text";

// Native stand-ins for the website's form controls (select, checkbox, number and date inputs), in the website's look:
// a light field with a hairline border that turns gold when active, options in a calm sheet from below.

export type Option<T> = { value: T; label: string };

/** a <select>: shows the chosen option; tapping opens the options in a sheet */
export function SelectField<T extends string | number>({ label, value, options, onChange, style, dark = false, title, compact = false }: {
  label?: string; value: T; options: Option<T>[]; onChange: (v: T) => void; style?: StyleProp<ViewStyle>; dark?: boolean; title?: string; compact?: boolean;
}) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label ?? "";
  return (
    <View style={[{ gap: 6, minWidth: 0 }, style]}>
      {label ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: dark ? "rgba(255,255,255,0.6)" : t.muted }}>{label}</Text> : null}
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${label ?? title ?? ""} ${current}`.trim()} accessibilityHint={title}
        style={({ pressed }) => [{ minHeight: compact ? 40 : 44, borderRadius: dark ? R.pill : R.sm, borderWidth: 1, paddingHorizontal: dark ? 16 : 12, flexDirection: "row", alignItems: "center", gap: 8 },
          dark ? { borderColor: "rgba(214,180,108,0.4)", backgroundColor: pressed ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)" }
            : { borderColor: pressed ? goldButton.line : t.line, backgroundColor: t.bg }]}>
        <Text numberOfLines={1} style={{ flex: 1, fontFamily: dark ? FONT.bold : FONT.medium, fontSize: dark ? 15 : 15, color: dark ? "#ffffff" : t.ink }}>{current}</Text>
        <Icon name="chevronDown" color={dark ? stage.gold : t.muted} size={16} />
      </Pressable>
      <OptionSheet open={open} title={title ?? label ?? ""} value={value} options={options} onClose={() => setOpen(false)} onPick={(v) => { setOpen(false); onChange(v); }} />
    </View>
  );
}

export function OptionSheet<T extends string | number>({ open, title, value, options, onClose, onPick }: { open: boolean; title: string; value: T; options: Option<T>[]; onClose: () => void; onPick: (v: T) => void }) {
  const t = useTheme();
  const tx = useTx();
  const insets = useSafeAreaInsets();
  const start = Math.max(0, options.findIndex((o) => o.value === value) - 3);
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(4,20,15,0.45)" }} onPress={onClose} accessibilityLabel={tx("done")} />
      <View style={{ maxHeight: "72%", backgroundColor: t.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingBottom: insets.bottom + 8, borderTopWidth: 1, borderColor: "rgba(201,166,94,0.35)" }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, gap: 12 }}>
          <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 16, color: t.ink }} accessibilityRole="header" numberOfLines={2}>{title}</Text>
          <Text onPress={onClose} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.accent, padding: 6 }}>{tx("done")}</Text>
        </View>
        <FlatList data={options} keyExtractor={(o) => String(o.value)} initialScrollIndex={start} getItemLayout={(_, i) => ({ length: 52, offset: 52 * i, index: i })}
          renderItem={({ item }) => {
            const on = item.value === value;
            return (
              <Pressable onPress={() => onPick(item.value)} accessibilityRole="button" accessibilityState={{ selected: on }}
                style={({ pressed }) => ({ height: 52, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: pressed ? t.bg : on ? "rgba(201,166,94,0.12)" : "transparent", borderTopWidth: 1, borderTopColor: t.line })}>
                <Text numberOfLines={1} style={{ flex: 1, fontFamily: on ? FONT.bold : FONT.regular, fontSize: 15.5, color: t.ink }}>{item.label}</Text>
                {on ? <Icon name="check" color={goldButton.line} size={18} /> : null}
              </Pressable>
            );
          }} />
      </View>
    </Modal>
  );
}

/** checkbox row (label beside a gold check) */
export function CheckRow({ label, value, onChange, style }: { label: string; value: boolean; onChange: (v: boolean) => void; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => onChange(!value)} accessibilityRole="checkbox" accessibilityState={{ checked: value }} accessibilityLabel={label}
      style={[{ flexDirection: "row", alignItems: "flex-start", gap: 12, minHeight: 32 }, style]}>
      <View style={{ width: 22, height: 22, marginTop: 1, borderRadius: 6, borderWidth: 1.5, borderColor: value ? goldButton.line : t.muted, backgroundColor: value ? goldButton.to : "transparent", alignItems: "center", justifyContent: "center" }}>
        {value ? <Icon name="check" color={goldButton.text} size={15} /> : null}
      </View>
      <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{label}</Text>
    </Pressable>
  );
}

/** switch row (per-prayer reminders) */
export function SwitchRow({ label, sub, value, onChange, disabled }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{label}</Text>
        {sub ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, marginTop: 1 }}>{sub}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} disabled={disabled} accessibilityLabel={label}
        trackColor={{ true: goldButton.to, false: t.line }} thumbColor="#ffffff" ios_backgroundColor={t.line} />
    </View>
  );
}

/** number input with − and + (minute corrections) */
export function Stepper({ label, value, min, max, onChange, unit }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit?: string }) {
  const t = useTheme();
  const btn = (d: number, icon: "minus" | "plus") => (
    <Pressable onPress={() => onChange(Math.max(min, Math.min(max, value + d)))} disabled={d < 0 ? value <= min : value >= max} hitSlop={6}
      accessibilityRole="button" accessibilityLabel={`${label} ${d < 0 ? "−1" : "+1"}`}
      style={({ pressed }) => ({ width: 30, height: 34, alignItems: "center", justifyContent: "center", opacity: (d < 0 ? value <= min : value >= max) ? 0.3 : pressed ? 0.6 : 1 })}>
      {icon === "plus" ? <Icon name="plus" color={t.ink} size={16} /> : <View style={{ width: 12, height: 1.7, borderRadius: 1, backgroundColor: t.ink }} />}
    </Pressable>
  );
  return (
    <View style={{ gap: 4, minWidth: 0 }} accessible={false}>
      <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{label}</Text>
      <View style={{ height: 40, borderRadius: R.sm, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
        accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ min, max, now: value, text: `${value}${unit ? ` ${unit}` : ""}` }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(e) => onChange(Math.max(min, Math.min(max, value + (e.nativeEvent.actionName === "increment" ? 1 : -1))))}>
        {btn(-1, "minus")}
        <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink, fontVariant: ["tabular-nums"] }}>{value > 0 ? `+${value}` : value}</Text>
        {btn(1, "plus")}
      </View>
    </View>
  );
}

/** text field in the website's style (rounded-xl, bg-bg, gold border on focus) */
export function Field({ style, ...rest }: TextInputProps & { style?: StyleProp<import("react-native").TextStyle> }) {
  const t = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <TextInput placeholderTextColor={t.muted} {...rest}
      onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }} onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
      style={[{ minHeight: 48, borderRadius: R.lg, borderWidth: 1, borderColor: focus ? "rgb(201,166,94)" : t.line, backgroundColor: t.bg, paddingHorizontal: 16, paddingVertical: 12, fontFamily: FONT.regular, fontSize: 16, color: t.ink }, style]} />
  );
}

/** a calendar date chosen with day, month and year (the website's <input type="date">); value "YYYY-MM-DD" or "" */
export function DateField({ value, onChange, minYear, maxYear, monthName, allowEmpty = false, label }: {
  value: string; onChange: (v: string) => void; minYear: number; maxYear: number; monthName: (m: number) => string; allowEmpty?: boolean; label: string;
}) {
  const tx = useTx();
  const t = useTheme();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const now = new Date();
  const y = m ? +m[1] : now.getFullYear(), mo = m ? +m[2] : now.getMonth() + 1, d = m ? +m[3] : now.getDate();
  const dim = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const set = (yy: number, mm: number, dd: number) => {
    const max = new Date(Date.UTC(yy, mm, 0)).getUTCDate();
    onChange(`${String(yy).padStart(4, "0")}-${String(mm).padStart(2, "0")}-${String(Math.min(dd, max)).padStart(2, "0")}`);
  };
  if (allowEmpty && !m) {
    return (
      <Pressable onPress={() => set(y, mo, d)} accessibilityRole="button" accessibilityLabel={label}
        style={{ minHeight: 48, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "flex-start", minWidth: 220 }}>
        <Icon name="calendar" color={t.muted} size={18} />
        <Text style={{ fontFamily: FONT.regular, fontSize: 16, color: t.muted }}>{tx("noDate")}</Text>
      </Pressable>
    );
  }
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <SelectField title={label} style={{ flex: 1 }} value={d} options={Array.from({ length: dim }, (_, i) => ({ value: i + 1, label: String(i + 1) }))} onChange={(v) => set(y, mo, v)} />
        <SelectField title={label} style={{ flex: 2 }} value={mo} options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: monthName(i + 1) }))} onChange={(v) => set(y, v, d)} />
        <SelectField title={label} style={{ flex: 1.4 }} value={y} options={Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({ value: maxYear - i, label: String(maxYear - i) }))} onChange={(v) => set(v, mo, d)} />
      </View>
      {allowEmpty ? <Text onPress={() => onChange("")} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted, alignSelf: "flex-start", paddingVertical: 4 }}>{tx("clear")}</Text> : null}
    </View>
  );
}

/** card section with the website's pa-card padding */
export function CardTitle({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {icon}
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 18, lineHeight: 24, color: t.ink }}>{children}</Text>
    </View>
  );
}
