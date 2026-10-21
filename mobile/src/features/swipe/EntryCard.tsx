import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { Eyebrow, GoldButton, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, R, stage } from "@/lib/theme";
import { useDueCount } from "@/features/srs/store";
import { useIntl } from "@/features/srs/format";
import { useSwipeConfig } from "./config";
import { STREAK_MIN, swipeStreak, useSwipeStats } from "./store";
import { useSwipeT } from "./texts";

/** the big card on the Masterclass tab: Swipe & Learn with today's count, the streak and the due review cards */
export function SwipeEntryCard() {
  const st = useSwipeT();
  const nf = useIntl();
  const cfg = useSwipeConfig();
  const s = useSwipeStats();
  const due = useDueCount();
  if (!cfg.enabled) return null;
  const streak = swipeStreak(s);
  const open = () => router.push("/swipe" as Href);
  return (
    <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`${st("title")}. ${st("entryLead", { n: cfg.minSeconds })}`} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
      <Stage rounded={R.card} hairlines={false} style={{ borderWidth: 1, borderColor: "rgba(214,180,108,0.45)" }}>
        <View style={{ padding: 20, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
            <View style={{ flex: 1, gap: 8 }}>
              <Eyebrow onStage>{st("kicker")}</Eyebrow>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 26, lineHeight: 30, color: "#fff" }}>{st("title")}</Text>
            </View>
            {/* a small stack of cards, the top one leaning to the left */}
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 70, height: 84 }}>
              {[2, 1, 0].map((i) => (
                <View key={i} style={{ position: "absolute", top: i * 4, left: i * 5, width: 56, height: 74, borderRadius: 9, borderWidth: 1, borderColor: stage.gold,
                  backgroundColor: i ? "rgba(8,38,29,0.9)" : "rgb(11,54,40)", transform: [{ rotate: i === 0 ? "-9deg" : i === 1 ? "-2deg" : "5deg" }], alignItems: "center", justifyContent: "center" }}>
                  {i === 0 ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, color: stage.cream }}>عِلْم</Text> : null}
                </View>
              ))}
            </View>
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: stage.textSoft }}>{st("entryLead", { n: nf(cfg.minSeconds) })}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[
              { icon: "book" as const, text: st("entryToday", { n: nf(s.today) }), on: s.today >= STREAK_MIN },
              { icon: "flame" as const, text: st("entryStreak", { n: nf(streak) }), on: streak > 0 },
              ...(due ? [{ icon: "repeat" as const, text: st("entryDue", { n: nf(due) }), on: true }] : []),
            ].map((x) => (
              <View key={x.text} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, minHeight: 30, borderRadius: R.pill, borderWidth: 1, borderColor: x.on ? stage.goldSoft : stage.hair, backgroundColor: "rgba(255,255,255,0.04)" }}>
                <Icon name={x.icon} size={13} color={x.on ? stage.gold : stage.textMuted} />
                <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: x.on ? stage.cream : stage.textMuted }}>{x.text}</Text>
              </View>
            ))}
          </View>
          <GoldButton title={st("start")} icon="play" onPress={open} />
        </View>
      </Stage>
    </Pressable>
  );
}
