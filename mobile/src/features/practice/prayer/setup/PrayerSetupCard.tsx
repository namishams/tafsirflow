import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useStored } from "@/lib/store";
import { FONT, R, stage } from "@/lib/theme";
import { GoldButton, SmallStar, Stage } from "@/components/brand";
import { PracticeWindow, go } from "../../art";
import { useTx } from "../../text";
import { SETUP_KEY, type PrayerSetup } from "../alerts";

/** "Set up prayer reminders": shown on /prayer (and the Today tab) until the guided setup has been finished */
export function PrayerSetupCard({ style, always = false }: { style?: StyleProp<ViewStyle>; always?: boolean }) {
  const tx = useTx();
  const setup = useStored<PrayerSetup>(SETUP_KEY, {});
  if (setup.done && !always) return null;
  return (
    <Stage rounded={R.card} style={[{ borderWidth: 1, borderColor: "rgba(214,180,108,0.3)" }, style]}>
      <PracticeWindow uid="setup-card" lamp height={150} style={{ position: "absolute", right: -18, top: 8, opacity: 0.35 }} />
      <View style={{ padding: 20, paddingRight: 96, gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <SmallStar size={10} color={stage.gold} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{tx("setupKicker")}</Text>
        </View>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 27, letterSpacing: -0.4, color: "#eef0f3" }}>{tx("setupCardTitle")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.7)" }}>{tx("setupCardLead")}</Text>
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <GoldButton compact title={tx("setupStart")} onPress={() => go("/prayer-setup")} />
      </View>
    </Stage>
  );
}
