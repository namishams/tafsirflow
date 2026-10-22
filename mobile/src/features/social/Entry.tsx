import { Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { GlassButton, GlassCard } from "@/components/brand";
import { FONT, useTheme } from "@/lib/theme";
import { useSx } from "./api";

/** entry to "Together, deeper" on the Together hub */
export function SocialEntryCard() {
  const t = useTheme();
  const sx = useSx();
  return (
    <GlassCard onPress={() => router.push("/together/social" as Href)} accessibilityLabel={sx("hubTitle")}>
      <View style={{ gap: 6 }}>
        <Text style={{ fontFamily: FONT.display, fontSize: 20, color: t.ink }}>{sx("hubTitle")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted }}>{sx("hubLead")}</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold }}>{[sx("khatm"), sx("halaqa"), sx("recap"), sx("duels"), sx("classes")].join(" · ")}</Text>
      </View>
    </GlassCard>
  );
}

/** "Halaqa now" in a study circle */
export function HalaqaButton({ circleId }: { circleId: string }) {
  const sx = useSx();
  return <GlassButton title={sx("halaqa")} icon="mosque" onPress={() => router.push(`/together/social?v=halaqa&id=${encodeURIComponent(circleId)}` as Href)} />;
}
