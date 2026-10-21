import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FONT, FWD, R, stage, useTheme } from "@/lib/theme";
import { useIntl } from "./format";
import { useDueCount } from "./store";
import { useSrsT } from "./texts";

/** Masterclass tab: "Review today: N cards" plus links to the Hifz tracker and the tests */
export function SrsEntryCard() {
  const t = useTheme();
  const st = useSrsT();
  const nf = useIntl();
  const n = useDueCount();
  return (
    <View style={{ gap: 10 }}>
      <Pressable onPress={() => router.push("/cards" as Href)} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
        <Stage rounded={R.card} style={{ padding: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: n ? stage.gold : stage.hair, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontFamily: FONT.display, fontSize: 18, color: stage.cream }}>{nf(n)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: "#fff", textAlign: "left" }}>{n ? st("reviewToday", { n: nf(n) }) : st("reviewNone")}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: stage.textMuted, marginTop: 2, textAlign: "left" }}>{st("title")}</Text>
            </View>
            <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: stage.gold }}>{FWD}</Text>
          </View>
        </Stage>
      </Pressable>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {([["hifz", "/cards/hifz", "map"], ["tests", "/tests", "trophy"]] as const).map(([k, href, icon]) => (
          <Pressable key={k} onPress={() => router.push(href as Href)} accessibilityRole="button"
            style={({ pressed }) => ({ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, opacity: pressed ? 0.7 : 1 })}>
            <Icon name={icon} size={18} color={t.gold} />
            <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 14.5, color: t.ink, textAlign: "left" }}>{st(k)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
