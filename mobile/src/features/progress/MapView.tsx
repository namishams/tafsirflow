import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { FONT, R, stage } from "@/lib/theme";
import { useWebT } from "@/i18n/web";
import { useAuth } from "@/lib/auth";
import { readSrs } from "@/web/learning";
import { MemoryMap } from "./MemoryMap";
import { MapInsights } from "./ProgressPanel";
import { useLive } from "./hooks";
import { go } from "./links";

/**
 * The map on the dark stage (website: MapView.tsx): your own map once you have learned something, otherwise a
 * clearly marked example with the way to your first verse (or to a free account).
 */
export function MapView() {
  const tr = useWebT("map");
  const { user, ready } = useAuth();
  const mine = useLive(() => Object.keys(readSrs()).length > 0);
  if (!ready) return <View style={{ height: 288, borderRadius: R.md, backgroundColor: "rgba(255,255,255,0.05)" }} />;
  const signedIn = !!user;
  return (
    <View>
      {!mine ? (
        <View style={{ marginBottom: 20, borderRadius: R.sm, borderWidth: 1, borderColor: "rgba(214,180,108,0.4)", backgroundColor: "rgba(214,180,108,0.1)", paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.75)" }}>
            <Text style={{ fontFamily: FONT.bold, color: stage.gold }}>{tr("demoTitle")}</Text> {signedIn ? tr("demoSignedIn") : tr("demoBody")}
          </Text>
          <Pressable onPress={() => (signedIn ? go("/surah/1?shams=1") : router.push("/register"))} accessibilityRole="button"
            style={({ pressed }) => ({ alignSelf: "flex-start", borderRadius: R.sm, backgroundColor: stage.gold, paddingHorizontal: 16, paddingVertical: 9, opacity: pressed ? 0.85 : 1 })}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: "rgb(8,38,29)" }}>{signedIn ? tr("demoStart") : tr("demoCta")}</Text>
          </Pressable>
        </View>
      ) : null}
      <MemoryMap demo={!mine} dark />
      {mine ? <MapInsights /> : null}
    </View>
  );
}

export default MapView;
