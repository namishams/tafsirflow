import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { Page, PageHero, ProGate } from "@/components/page";
import { AssistantChat, AssistantSuggestions } from "@/features/extra/AssistantChat";
import { useX } from "@/features/extra/strings";
import { usePro } from "@/lib/pro";
import { FONT, useTheme } from "@/lib/theme";

// Website /assistant. In the app the assistant is part of Pro: free users see what it does and the way to Pro.
export default function AssistantScreen() {
  const x = useX().assistant;
  const t = useTheme();
  const { pro } = usePro();
  const hero = <PageHero back topInset eyebrow={x.kicker} title={x.title} lead={x.lead} />;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {pro ? <AssistantChat header={hero} /> : (
        <Page>
          {hero}
          <ProGate feature="general" title={x.proTitle} text={x.proText} />
          <View style={{ paddingHorizontal: 16, marginTop: 24, gap: 12 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase", color: t.muted }}>{x.examples}</Text>
            <AssistantSuggestions />
            <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, marginTop: 8 }}>{x.note}</Text>
          </View>
        </Page>
      )}
    </>
  );
}
