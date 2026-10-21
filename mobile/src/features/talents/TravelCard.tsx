import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { usePT } from "./profileText";
import { isHaramain, useTravel } from "./travel";

// Travel mode on the prayer page and in the feed (owner, 21.10.2026). Only while travel mode is on.
// SCHOLAR REVIEW: the note on praying while travelling (texts qasrGeneral, qasrHanafi, qasrNote in profileText.ts and
// the twelve translations) is new religious content and must be checked by a scholar before release (BLUEPRINT 4). It
// only describes the schools (qasr for the four schools; jam' in the Shafi'i, Maliki and Hanbali schools; Hanafi jam'
// only at Arafa and Muzdalifa) without distances or durations and sends questions to scholars; it is not a fatwa.

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
  if (!trip.on) return null;
  return (
    <View style={{ marginHorizontal: 14, marginTop: 12, padding: 12, borderRadius: R.card, borderWidth: 1, borderColor: goldButton.line, backgroundColor: stage.bg, gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="compass" color={stage.gold} size={17} />
        <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.bold, fontSize: 14.5, color: stage.cream }}>{trip.city ? pt("travellingTo", { c: trip.city }) : pt("travelling")}</Text>
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
export function TravelBadge({ city }: { city?: string }) {
  const t = useTheme();
  const pt = usePT();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 3, borderRadius: R.pill, backgroundColor: "rgba(201,166,94,0.14)", borderWidth: 1, borderColor: goldButton.line, flexShrink: 1 }}>
      <Icon name="compass" color={t.gold} size={12} />
      <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.semibold, fontSize: 12, color: t.gold }}>{city ? pt("travellingTo", { c: city }) : pt("travelling")}</Text>
    </View>
  );
}
