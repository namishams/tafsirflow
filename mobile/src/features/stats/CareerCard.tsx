import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FONT } from "@/lib/theme";
import { StarLattice } from "@/components/brand";
import { CARD_SIZE, type ShareFormat } from "@/features/share/formats";
import { TalentAvatar } from "@/features/talents/ui";
import { BadgeMark } from "@/features/talents/badges";
import { CountryBadge } from "@/features/rankings/Flag";
import { TierEmblem } from "./TierEmblem";
import type { Career } from "./career";

// The shareable career card in the app at CARD_SIZE[format] (captured at 1080 × 1350 for 4:5, 1080 × 1920 for 9:16):
// deep emerald with the star lattice, a gold frame, avatar and name, the tier emblem in its progress ring, the tier and
// career points, four big numbers, place and member since, and the profile link. Same content as the website's canvas
// card (src/components/stats/careerCard.ts).
export type CareerCardData = {
  name: string; username: string; avatar: string | null; badge: "emerald" | "gold" | "official" | "founder" | null; country: string | null;
  title: string; tierLabel: string; pointsLabel: string; career: Career;
  stats: { value: string; label: string }[]; place: string; since: string; url: string;
};

export function CareerCard({ d, format }: { d: CareerCardData; format: ShareFormat }) {
  const { w, h } = CARD_SIZE[format];
  const story = format === "story";
  const E = story ? 124 : 80;
  return (
    <LinearGradient colors={["#0E4A38", "#072C21", "#03140E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ width: w, height: h, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingTop: story ? 22 : 30, paddingBottom: story ? 50 : 44, gap: story ? 9 : 3, overflow: "hidden" }}>
      <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}><StarLattice opacity={0.06} size={48} /></View>
      <View pointerEvents="none" style={{ position: "absolute", top: 13, left: 13, right: 13, bottom: 13, borderRadius: 14, borderWidth: 1, borderColor: "rgba(214,180,108,0.75)" }} />
      <View pointerEvents="none" style={{ position: "absolute", top: 19, left: 19, right: 19, bottom: 19, borderRadius: 10, borderWidth: 0.5, borderColor: "rgba(214,180,108,0.3)" }} />
      <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: story ? 17 : 15, color: "#D6B46C" }}>Quran Masterclass</Text>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 10.5, color: "rgba(244,227,180,0.75)", marginTop: -4 }}>{d.title}</Text>
      <View style={{ marginTop: story ? 14 : 4 }}><TalentAvatar name={d.name} size={story ? 52 : 34} uri={d.avatar} badge={d.badge} /></View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, maxWidth: w - 70 }}>
        <Text allowFontScaling={false} numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.display, fontSize: story ? 19 : 16, color: "#fff" }}>{d.name}</Text>
        {d.badge ? <BadgeMark badge={d.badge} size={story ? 16 : 13} /> : null}
      </View>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 11, color: "rgba(255,255,255,0.7)", writingDirection: "ltr", marginTop: -3 }}>@{d.username}</Text>
      <View style={{ marginTop: story ? 12 : 2 }}><TierEmblem tier={d.career.tier} division={d.career.division} size={E} progress={d.career.into} /></View>
      <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.display, fontSize: story ? 22 : 18, color: "#F4E3B4" }}>{d.tierLabel}</Text>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 10.5, color: "rgba(244,227,180,0.7)", marginTop: -3 }}>{d.pointsLabel}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: story ? 12 : 4, width: w - 60 }}>
        {d.stats.slice(0, 4).map((s) => (
          <View key={s.label} style={{ width: (w - 66) / 2, paddingVertical: story ? 10 : 5, borderRadius: 9, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center" }}>
            <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.display, fontSize: story ? 20 : 16, color: "#fff", fontVariant: ["tabular-nums"] }}>{s.value}</Text>
            <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.medium, fontSize: 9.5, color: "rgba(255,255,255,0.62)" }}>{s.label}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: story ? 10 : 3 }}>
        {d.country ? <CountryBadge code={d.country} size={15} /> : null}
        <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 10.5, color: "rgba(255,255,255,0.8)" }}>{d.place}</Text>
      </View>
      {d.since && story ? <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: 9.5, color: "rgba(255,255,255,0.6)" }}>{d.since}</Text> : null}
      <Text allowFontScaling={false} style={{ position: "absolute", bottom: story ? 26 : 24, fontFamily: FONT.semibold, fontSize: 9.5, color: "#D6B46C", writingDirection: "ltr" }}>{d.url}</Text>
    </LinearGradient>
  );
}
