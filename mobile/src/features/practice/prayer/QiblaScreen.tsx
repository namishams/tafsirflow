import { useEffect } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { qiblaOf } from "@/web/prayer";
import { useWebT } from "@/i18n/web";
import { FONT, stage } from "@/lib/theme";
import { Arcade, GoldButton, OutlineButton, Stage } from "@/components/brand";
import { DarkChip, HeroBack } from "../art";
import { SelectField } from "../ui";
import { useTx } from "../text";
import { usePrayerPlace } from "./place";
import { QiblaDial, turnBy, useHeading } from "./Compass";

// /qibla: the live compass on its own screen – the rose turns with the phone, the needle points to the Kaaba.
// The place is the one chosen on /prayer (a city or the device's own position).
export default function QiblaScreen() {
  const t = useWebT("prayer");
  const tx = useTx();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { spots, main, label, pick, locate, geoMsg, setGeoMsg } = usePrayerPlace();
  const compass = useHeading();
  const qibla = qiblaOf(main);
  const size = Math.min(width - 64, 320);

  // start right away when the location permission was already given; otherwise wait for the button
  useEffect(() => {
    Location.getForegroundPermissionsAsync().then((p) => { if (p.status === "granted") void compass.start(false); }).catch(() => undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const h = compass.heading;
  const d = h ? turnBy(qibla, h.deg) : null;
  const aligned = d !== null && Math.abs(d) <= 5;
  const small = { fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.65)", textAlign: "center" as const };

  return (
    <Stage hairlines={false} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32, flexGrow: 1 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <HeroBack />
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 38, lineHeight: 42, letterSpacing: -1, color: "#eef0f3", marginTop: 16 }}>{t("qibla")}</Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.6, textTransform: "uppercase", color: stage.gold, marginTop: 12 }}>{tx("forPlace", { place: label(main) })}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 16 }}>
            <SelectField dark title={tx("changePlace")} value={main.id} options={spots.map((s) => ({ value: s.id, label: label(s) }))} onChange={(id) => { setGeoMsg(""); pick(id); }} style={{ flexShrink: 1, maxWidth: "100%" }} />
            <DarkChip label={t("useLocation")} onPress={() => void locate()} />
          </View>
          {geoMsg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>{geoMsg}</Text> : null}
        </View>

        <View style={{ alignItems: "center", marginTop: 36 }}>
          <QiblaDial qibla={qibla} heading={h?.deg ?? null} size={size} />
          <Text style={{ fontFamily: FONT.display, fontSize: 48, lineHeight: 56, color: stage.gold, fontVariant: ["tabular-nums"], marginTop: 24 }}>{Math.round(qibla)}°</Text>
          <Text style={small}>{t("qiblaHint")}</Text>
        </View>

        <View style={{ paddingHorizontal: 24, marginTop: 24, gap: 10, alignItems: "center" }} accessibilityLiveRegion="polite">
          {compass.state === "on" && d !== null ? (
            <>
              <Text style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 28, color: aligned ? stage.gold : "#eef0f3", textAlign: "center" }}>
                {aligned ? tx("facing") : `${d > 0 ? tx("turnRight") : tx("turnLeft")} · ${Math.abs(Math.round(d))}°`}
              </Text>
              <Text style={small}>{tx("compassHint")}</Text>
              {h && h.accuracy <= 1 ? <Text style={small}>{tx("calibrate")}</Text> : null}
              {h?.magnetic ? <Text style={small}>{tx("magnetic")}</Text> : null}
              <OutlineButton onStage compact title={tx("compassOff")} onPress={compass.stop} style={{ alignSelf: "center", marginTop: 8 }} />
            </>
          ) : (
            <>
              {compass.state === "denied" ? <Text style={small}>{tx("compassPermission")}</Text> : null}
              {compass.state === "unavailable" ? <Text style={small}>{tx("noCompass")}</Text> : null}
              {compass.state !== "unavailable" ? <GoldButton compact title={t("compass")} busy={compass.state === "starting"} onPress={() => void compass.start()} style={{ alignSelf: "center" }} /> : null}
              <Text style={[small, { marginTop: 6 }]}>{tx("compassHint")}</Text>
            </>
          )}
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ marginTop: 32 }}><Arcade /></View>
      </ScrollView>
    </Stage>
  );
}
