import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { OutlineButton } from "@/components/brand";
import { FONT, useTheme } from "@/lib/theme";
import { TutorFace } from "./Face";
import { useTutor } from "./hooks";
import { GOLD, alpha } from "./Parts";
import { clearChat, hasConsent, savePersona, useTutorPrefs, withdrawConsent, type Persona } from "./prefs";

/** Account → Settings: the tutor (sisters choose Hidaya or Dalil), withdrawing the AI consent and deleting the
 *  conversation. Brother / sister itself is the identity setting just above (lib/identity.ts). */
export function TutorSetting() {
  const t = useTheme();
  const { ui, f, persona, address, name } = useTutor();
  const prefs = useTutorPrefs();
  return (
    <View style={{ marginTop: 16, gap: 12 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", color: t.muted }}>{ui.tutor}</Text>
      {address === "sister" ? (
        <View style={{ flexDirection: "row", gap: 12 }}>
          {(["hidaya", "dalil"] as Persona[]).map((p) => (
            <Pressable key={p} onPress={() => savePersona(p)} accessibilityRole="radio" accessibilityState={{ selected: persona === p }}
              style={{ flex: 1, alignItems: "center", gap: 8, paddingVertical: 12, borderRadius: 18, borderWidth: persona === p ? 2 : StyleSheet.hairlineWidth, borderColor: persona === p ? GOLD : t.line, backgroundColor: persona === p ? alpha(GOLD, 0.08) : "transparent" }}>
              <TutorFace persona={p} size={56} still />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{p === "hidaya" ? "Hidaya" : "Dalil"}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TutorFace persona={persona} size={48} still />
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.ink }}>{f(ui.title)}</Text>
        </View>
      )}
      {address === "sister" ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{ui.sisterOnly}</Text> : null}
      {hasConsent(prefs) ? (
        <OutlineButton title={ui.withdraw} compact onPress={() => Alert.alert(name, ui.withdraw, [
          { text: ui.later, style: "cancel" },
          { text: ui.withdraw, style: "destructive", onPress: () => { withdrawConsent(); clearChat(); } },
        ])} />
      ) : null}
    </View>
  );
}
