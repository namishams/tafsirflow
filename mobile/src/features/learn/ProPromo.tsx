import { Text, View } from "react-native";
import { FONT, R, stage } from "@/lib/theme";
import { Display, Eyebrow, GoldButton, SmallStar, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useT } from "@/i18n";
import { openPro, usePro, type ProFeature } from "@/lib/pro";
import { useProPrice, withPrice } from "@/lib/purchases";

// The calm Pro card shown at natural moments (Today, Masterclass, end of free content). No pop-ups, no countdowns.
export function ProPromo({ title, lead, feature = "general", compact }: { title?: string; lead?: string; feature?: ProFeature; compact?: boolean }) {
  const t = useT();
  const price = useProPrice();
  const { pro } = usePro();
  if (pro) return null;
  const features = compact ? ["f_shams", "f_reciters", "f_courses"] : ["f_shams", "f_reciters", "f_courses", "f_tests", "f_offline"];
  return (
    <Stage rounded={R.card}>
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={11} color={stage.gold} /><Eyebrow onStage>{t("pro.name")}</Eyebrow></View>
        <Display size="title2" onStage style={{ marginTop: 10 }}>{title ?? t("pro.why_general")}</Display>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: stage.textSoft, marginTop: 8 }}>{lead ?? t("pro.lead")}</Text>
        <View style={{ marginTop: 14, gap: 9 }}>
          {features.map((f) => (
            <View key={f} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Icon name="check" color={stage.gold} size={17} />
              <Text style={{ fontFamily: FONT.medium, fontSize: 14.5, color: "#fff", flex: 1 }}>{t(`pro.${f}`)}</Text>
            </View>
          ))}
        </View>
        <GoldButton title={withPrice(t("pro.cta"), price ? t("pro.price", { price }) : null)} onPress={() => openPro(feature)} style={{ marginTop: 18 }} />
      </View>
    </Stage>
  );
}
