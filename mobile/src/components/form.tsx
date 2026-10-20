import { useState, type ReactNode } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { Icon } from "./icons";

// Form controls like the website's account forms (AuthShell, AccountForm): label above, 52 px fields with a hairline
// border that turns gold on focus, show/hide for passwords, square checkboxes, a select row.
export function LabeledField({ label, hint, secure, style, ...rest }: TextInputProps & { label: string; hint?: string; secure?: boolean }) {
  const t = useTheme();
  const [focus, setFocus] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", height: 52, borderRadius: R.md, borderWidth: 1, borderColor: focus ? goldButton.line : t.line, backgroundColor: t.surface, paddingHorizontal: 14 }}>
        <TextInput accessibilityLabel={label} placeholderTextColor={t.muted} secureTextEntry={secure && !show}
          onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }} onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
          style={[{ flex: 1, fontFamily: FONT.regular, fontSize: 16, color: t.ink, paddingVertical: 0 }, style]} {...rest} />
        {secure ? (
          <Pressable onPress={() => setShow(!show)} accessibilityRole="button" accessibilityLabel={show ? "Hide" : "Show"} hitSlop={10}>
            <Icon name="eye" color={show ? t.accent : t.muted} size={18} />
          </Pressable>
        ) : null}
      </View>
      {hint ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{hint}</Text> : null}
    </View>
  );
}

export function CheckRow({ checked, onChange, children, label }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; label: string }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => onChange(!checked)} accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={label}
      style={{ flexDirection: "row", gap: 12, alignItems: "flex-start", paddingVertical: 4 }}>
      <View style={{ width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: checked ? goldButton.line : t.line, backgroundColor: checked ? "rgba(201,166,94,0.18)" : t.surface, alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        {checked ? <Icon name="check" color={t.accent} size={15} weight={2.4} /> : null}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </Pressable>
  );
}

export function SelectRow({ label, value, placeholder, onPress }: { label: string; value?: string; placeholder: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{label}</Text>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}: ${value ?? placeholder}`}
        style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", height: 52, borderRadius: R.md, borderWidth: 1, borderColor: pressed ? goldButton.line : t.line, backgroundColor: t.surface, paddingHorizontal: 14 })}>
        <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 16, color: value ? t.ink : t.muted }}>{value ?? placeholder}</Text>
        <Icon name="chevronDown" color={t.muted} size={16} />
      </Pressable>
    </View>
  );
}

export function FormError({ text }: { text: string }) {
  const t = useTheme();
  if (!text) return null;
  return <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: t.danger, backgroundColor: "rgba(190,84,104,0.08)", borderRadius: R.sm, padding: 12 }}>{text}</Text>;
}
