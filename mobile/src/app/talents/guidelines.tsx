import { Text, View } from "react-native";
import { SafetyContact } from "@/components/SafetyContact";
import { Stack } from "expo-router";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { Page, PageHero } from "@/components/page";
import { useTT, type TKey } from "@/features/talents/text";

// /talents/guidelines – community guidelines (reachable from every network screen; App Store guideline 1.2).
// Open to everyone, also without an account.
const RULES: TKey[] = ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8"];
export default function Guidelines() {
  const t = useTheme();
  const tt = useTT();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset arcade={false} eyebrow={tt("network")} title={tt("guidelines")} lead={tt("guidelinesLead")} />
        <View style={{ padding: 16, gap: 10 }}>
          {RULES.map((k, i) => (
            <View key={k} style={{ flexDirection: "row", gap: 12, padding: 14, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: goldButton.line, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.gold }}>{i + 1}</Text>
              </View>
              <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{tt(k)}</Text>
            </View>
          ))}
          {/* published contact for safety and moderation with the response time (App Store guideline 1.2) */}
          <SafetyContact />
        </View>
      </Page>
    </>
  );
}
