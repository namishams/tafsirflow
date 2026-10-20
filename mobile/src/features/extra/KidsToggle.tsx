import { Pressable, Switch, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { useKids } from "./kids";
import { useX } from "./strings";

/**
 * Kids mode switch (website KidsToggle). variant "pill": the round button of the website (icon + label, for a header
 * or a card); variant "row": a settings row with title, short explanation and a switch (account tab, onboarding).
 * The website shows emojis here; the app uses the outline icons "kid" / "cap" instead.
 */
export function KidsToggle({ variant = "pill", onStage, style }: { variant?: "pill" | "row"; onStage?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const w = useWebT("landing");
  const x = useX();
  const [on, setOn] = useKids();

  if (variant === "row") {
    return (
      <Pressable onPress={() => setOn(!on)} accessibilityRole="switch" accessibilityState={{ checked: on }} accessibilityLabel={x.kids.title}
        style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, minHeight: 64, backgroundColor: pressed ? t.bg : t.surface }, style]}>
        <View style={{ width: 36, height: 36, borderRadius: R.md, backgroundColor: on ? "rgba(201,166,94,0.18)" : t.accentSoft, alignItems: "center", justifyContent: "center" }}>
          <Icon name="kid" color={on ? goldButton.line : t.accent} size={20} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink }}>{x.kids.title}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted, marginTop: 2 }}>{on ? x.kids.on : x.kids.off}</Text>
        </View>
        <Switch value={on} onValueChange={setOn} trackColor={{ true: goldButton.to, false: t.line }} thumbColor="#ffffff" accessibilityLabel={x.kids.title} />
      </Pressable>
    );
  }

  const color = onStage ? "#ffffff" : t.ink;
  return (
    <Pressable onPress={() => setOn(!on)} accessibilityRole="switch" accessibilityState={{ checked: on }} accessibilityLabel={on ? w("kidsOff") : w("kidsOn")} hitSlop={6}
      style={({ pressed }) => [{
        flexDirection: "row", alignItems: "center", gap: 7, alignSelf: "flex-start", height: 36, paddingHorizontal: 13, borderRadius: R.pill, borderWidth: 1,
        borderColor: pressed ? goldButton.line : onStage ? "rgba(255,255,255,0.25)" : t.line,
        backgroundColor: onStage ? "rgba(255,255,255,0.05)" : t.surface,
      }, style]}>
      <Icon name={on ? "cap" : "kid"} color={onStage ? "rgb(214,180,108)" : t.accent} size={17} />
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color }}>{on ? w("kidsOff") : w("kidsOn")}</Text>
    </Pressable>
  );
}
