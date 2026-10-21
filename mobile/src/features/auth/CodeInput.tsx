import { useEffect, useRef, useState } from "react";
import { I18nManager, Platform, Text, TextInput, View, type TextInputInstance } from "react-native";
import * as Clipboard from "expo-clipboard";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { TextLink } from "@/components/brand";
import { useAuthT } from "./text";

// Six boxes for the 6-digit code. One real text field lies invisibly over the boxes: the keyboard's code suggestion
// (iOS offers codes from Mail, Android from SMS/e-mail), long press "Paste" and typing all go into it; the boxes only
// show the digits. "Paste code" reads a copied code. onComplete fires with the sixth digit. Digits run left to right.
export function CodeInput({ value, onChange, onComplete, disabled, invalid, autoFocus = true }: {
  value: string; onChange: (v: string) => void; onComplete?: (v: string) => void; disabled?: boolean; invalid?: boolean; autoFocus?: boolean;
}) {
  const t = useTheme();
  const tx = useAuthT();
  const ref = useRef<TextInputInstance>(null);
  const [focus, setFocus] = useState(false);
  const [canPaste, setCanPaste] = useState(false);

  useEffect(() => {
    if (!autoFocus) return;
    const id = setTimeout(() => ref.current?.focus(), 300);
    return () => clearTimeout(id);
  }, [autoFocus]);
  // checking for text does not read the clipboard (no system prompt); reading happens only on "Paste code"
  useEffect(() => { Clipboard.hasStringAsync().then(setCanPaste).catch(() => setCanPaste(false)); }, [value]);

  const set = (raw: string) => {
    const v = raw.replace(/\D/g, "").slice(0, 6);
    onChange(v);
    if (v.length === 6) onComplete?.(v);
  };
  const paste = async () => {
    const s = (await Clipboard.getStringAsync().catch(() => "")).replace(/\D/g, "");
    if (s.length >= 6) set(s.slice(0, 6));
  };

  return (
    <View style={{ gap: 10 }}>
      <View>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none"
          style={{ flexDirection: I18nManager.isRTL ? "row-reverse" : "row", gap: 8 }}>
          {Array.from({ length: 6 }, (_, i) => {
            const active = focus && (i === value.length || (i === 5 && value.length === 6));
            return (
              <View key={i} style={{ flex: 1, height: 58, borderRadius: R.md, borderWidth: active ? 2 : 1, alignItems: "center", justifyContent: "center",
                borderColor: invalid ? t.danger : active ? goldButton.line : t.line, backgroundColor: t.surface }}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 26, color: t.ink }} allowFontScaling={false}>{value[i] ?? ""}</Text>
              </View>
            );
          })}
        </View>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={set}
          editable={!disabled}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
          maxLength={6}
          caretHidden
          contextMenuHidden={false}
          selectionColor="transparent"
          accessibilityLabel={tx("codeLabel")}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, color: "transparent", fontSize: 26, opacity: 0.02, textAlign: "center" }}
        />
      </View>
      {canPaste && value.length < 6 && !disabled ? (
        <TextLink title={tx("paste")} onPress={() => void paste()} style={{ alignSelf: "flex-start", fontSize: 14, paddingVertical: 2 }} />
      ) : null}
    </View>
  );
}
