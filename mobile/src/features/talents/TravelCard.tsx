import { useEffect, useState } from "react";
import { Pressable, Switch, Text, TextInput, View } from "react-native";
import { router, useGlobalSearchParams, type Href } from "expo-router";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { usePT } from "./profileText";
import { useLang } from "@/i18n";
import { isHaramain, matchCity, setTravel, useTravel } from "./travel";
import { T } from "./api";

// Travel mode on the prayer page and in the feed (owner, 21.10.2026). Only while travel mode is on.
// SCHOLAR REVIEW: the note on praying while travelling (texts qasrGeneral, qasrHanafi, qasrNote in profileText.ts and
// the twelve translations) is new religious content and must be checked by a scholar before release (BLUEPRINT 4). It
// only describes the schools (qasr for the four schools; jam' in the Shafi'i, Maliki and Hanbali schools; Hanafi jam'
// only at Arafa and Muzdalifa) without distances or durations and sends questions to scholars; it is not a fatwa.

/** a destination from the prayer list in the reader's language (Makkah → Mekke, مكة المكرمة; 22.10.2026 the Turkish and
 *  Arabic feed showed "Makkah"); a name that is not on the list stays as it was typed */
function useCityLabel(city?: string) {
  const { lang } = useLang();
  if (!city) return city;
  return matchCity(city)?.names[lang] || city;
}

/** the prayer-page card: where the times apply, the note on qasr and jam' by school, travel duas, Umrah and Hajj */
export function TravelPrayerCard({ hanafi }: { /** the Asr setting or the city's custom is Hanafi */ hanafi: boolean }) {
  const t = useTheme();
  const pt = usePT();
  const trip = useTravel();
  if (!trip.on) return null;
  return (
    <View accessibilityRole="summary" style={{ borderRadius: R.card, borderWidth: 1, borderColor: goldButton.line, backgroundColor: t.surface, padding: 16, gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="compass" color={t.gold} size={18} />
        <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{pt("qasrTitle")}</Text>
        <TravelBadge city={trip.city} />
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink }}>{hanafi ? pt("qasrHanafi") : pt("qasrGeneral")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{pt("qasrNote")}</Text>
      <TravelLinks city={trip.city} />
    </View>
  );
}

/** the slim banner at the top of the feed while travelling: travel duas and, for Makkah or Madinah, Umrah and Hajj */
export function TravelFeedBanner() {
  const pt = usePT();
  const trip = useTravel();
  const city = useCityLabel(trip.city);
  if (!trip.on) return null;
  return (
    <View style={{ marginHorizontal: 14, marginTop: 12, padding: 12, borderRadius: R.card, borderWidth: 1, borderColor: goldButton.line, backgroundColor: stage.bg, gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="compass" color={stage.gold} size={17} />
        <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.bold, fontSize: 14.5, color: stage.cream }}>{city ? pt("travellingTo", { c: city }) : pt("travelling")}</Text>
      </View>
      <TravelLinks city={trip.city} onStage />
    </View>
  );
}

function TravelLinks({ city, onStage }: { city: string; onStage?: boolean }) {
  const t = useTheme();
  const pt = usePT();
  const pill = (label: string, href: string, icon: "hands" | "mosque") => (
    <Pressable key={href} onPress={() => router.push(href as Href)} accessibilityRole="link"
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 36, paddingHorizontal: 12, borderRadius: R.pill, borderWidth: 1,
        borderColor: onStage ? "rgba(214,180,108,0.55)" : goldButton.line, backgroundColor: onStage ? "rgba(214,180,108,0.12)" : "rgba(201,166,94,0.1)", opacity: pressed ? 0.7 : 1 })}>
      <Icon name={icon} color={onStage ? stage.gold : t.gold} size={15} />
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: onStage ? stage.cream : t.ink }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {pill(pt("travelDuas"), "/duas?cat=travel", "hands")}
      {isHaramain(city) ? pill(pt("umrahGuide"), "/haramain", "mosque") : null}
    </View>
  );
}

/** the small "Travelling · City" badge (profile header, prayer card) */
export function TravelBadge({ city: typed }: { city?: string }) {
  const t = useTheme();
  const pt = usePT();
  const city = useCityLabel(typed);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 3, borderRadius: R.pill, backgroundColor: "rgba(201,166,94,0.14)", borderWidth: 1, borderColor: goldButton.line, flexShrink: 1 }}>
      <Icon name="compass" color={t.gold} size={12} />
      <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.semibold, fontSize: 12, color: t.gold }}>{city ? pt("travellingTo", { c: city }) : pt("travelling")}</Text>
    </View>
  );
}

/** Settings: travel mode on this device (also without a community profile); with a profile the profile shows it too */
export function TravelSetting() {
  const t = useTheme();
  const pt = usePT();
  const trip = useTravel();
  const [city, setCity] = useState(trip.city);
  const [msg, setMsg] = useState("");
  // development only (screenshot audits): /account/settings?travel=Makkah switches travel mode on, ?travel=off off
  const { travel: demo } = useGlobalSearchParams<{ travel?: string }>();
  useEffect(() => {
    if (!__DEV__ || !demo) return;
    void setTravel(demo !== "off", demo === "off" ? "" : demo).then(() => setCity(demo === "off" ? "" : demo));
  }, [demo]);
  const apply = async (on: boolean, name: string) => {
    setMsg("");
    const r = await setTravel(on, name);
    if (on && name) setMsg(r.place ? pt("destinationSet", { c: name }) : pt("destinationNotFound"));
    void T.saveExtras({ travel: { on, city: name } }).catch(() => undefined); // only when a profile exists
  };
  return (
    <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 14, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{pt("travelTitle")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, marginTop: 2 }}>{pt("travelHint")}</Text>
        </View>
        <Switch value={trip.on} onValueChange={(on) => void apply(on, city)} trackColor={{ true: t.accent }} accessibilityLabel={pt("travelTitle")} />
      </View>
      {trip.on ? (
        <TextInput value={city} onChangeText={(v) => setCity(v.replace(/[0-9]/g, "").slice(0, 60))} onEndEditing={() => { if (city !== trip.city) void apply(true, city); }}
          placeholder={pt("destination")} placeholderTextColor={t.muted} accessibilityLabel={pt("destination")} returnKeyType="done" autoCorrect={false}
          style={{ height: 46, borderRadius: R.md, borderWidth: 1, borderColor: t.line, paddingHorizontal: 12, fontFamily: FONT.regular, fontSize: 16, color: t.ink, backgroundColor: t.bg }} />
      ) : null}
      {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{msg}</Text> : null}
    </View>
  );
}
