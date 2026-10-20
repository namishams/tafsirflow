import { Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { GoldButton, OutlineButton } from "@/components/brand";
import { FONT, useTheme } from "@/lib/theme";
import { useHm } from "./art";
import { useX } from "./strings";

/** the website's localised 404 (not-found.tsx): gold 404, title, a way home and a way to the Quran */
export function NotFoundView() {
  const t = useTheme();
  const hm = useHm(t);
  const x = useX().notFound;
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: t.bg, padding: 32 }}>
      <Text style={{ fontFamily: FONT.display, fontSize: 72, letterSpacing: -2, color: hm.goldD }}>{x.code}</Text>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 28, lineHeight: 32, letterSpacing: -0.6, color: t.ink, textAlign: "center", marginTop: 12 }}>{x.title}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: t.muted, textAlign: "center", marginTop: 10 }}>{x.body}</Text>
      <View style={{ alignSelf: "stretch", gap: 12, marginTop: 28 }}>
        <GoldButton title={x.home} onPress={() => router.replace("/" as Href)} />
        <OutlineButton title={x.quran} onPress={() => router.replace("/quran" as Href)} />
      </View>
    </View>
  );
}
