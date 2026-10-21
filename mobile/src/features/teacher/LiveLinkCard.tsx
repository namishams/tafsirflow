import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { Icon } from "@/components/icons";
import { FONT, R, useTheme } from "@/lib/theme";
import { useTT } from "./text";

// Entry on the old share-code teacher screen: the live link through the Quran Talents network (/teacher).
export function LiveLinkCard() {
  const t = useTheme();
  const tt = useTT();
  return (
    <Pressable onPress={() => router.push("/teacher" as Href)} accessibilityRole="button" accessibilityLabel={`${tt("openLive")}. ${tt("openLiveSub")}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(201,166,94,0.55)", backgroundColor: t.surface, opacity: pressed ? 0.85 : 1 })}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink, textAlign: "left" }}>{tt("openLive")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "left" }}>{tt("openLiveSub")}</Text>
      </View>
      <Icon name="chevronRight" size={16} color={t.muted} />
    </Pressable>
  );
}
