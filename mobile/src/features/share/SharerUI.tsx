import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { useReduceMotion } from "@/features/radio/motion";
import { tick } from "@/features/feed/haptics";
import { fillText } from "@/features/feed/texts";
import { GOLD_TIER, loadTopSharers, onSharerTierUp, type TopSharer } from "./sharer";
import { useSharerText } from "./sharerTexts";

/** the sharer level as a pill: paper plane, "Sharer · Level n"; gold from GOLD_TIER on. Nothing below tier 1. */
export function SharerBadge({ tier, onStage, compact }: { tier: number; onStage?: boolean; compact?: boolean }) {
  const t = useTheme();
  const s = useSharerText();
  const { lang } = useLang();
  if (tier < 1) return null;
  const gold = tier >= GOLD_TIER;
  const label = `${s.badge} · ${fillText(s.level, { n: Intl.NumberFormat(lang).format(tier) })}`;
  const fg = gold ? "#3a2a08" : onStage ? "#ffffff" : t.accent;
  const body = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: compact ? 7 : 9, paddingVertical: compact ? 2 : 3 }}>
      <Icon name="send" color={fg} size={compact ? 11 : 13} />
      <Text style={{ fontFamily: FONT.semibold, fontSize: compact ? 11 : 12, color: fg }}>{label}</Text>
    </View>
  );
  return (
    <View accessible accessibilityLabel={label} style={{ alignSelf: "flex-start", borderRadius: 999, overflow: "hidden", backgroundColor: gold ? undefined : onStage ? "rgba(255,255,255,0.12)" : t.accentSoft }}>
      {gold ? <LinearGradient colors={["#f3e2b6", "#c6a65e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>{body}</LinearGradient> : body}
    </View>
  );
}

/** a golden ring around an avatar from GOLD_TIER on (otherwise the avatar as is) */
export function SharerRing({ tier, size, children }: { tier: number; size: number; children: ReactNode }) {
  if (tier < GOLD_TIER) return <>{children}</>;
  const pad = Math.max(3, Math.round(size * 0.05));
  return (
    <LinearGradient colors={["#f3e2b6", "#c6a65e", "#8a6a2c"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ width: size + pad * 2, height: size + pad * 2, borderRadius: (size + pad * 2) / 2, alignItems: "center", justifyContent: "center" }}>
      {children}
    </LinearGradient>
  );
}

/** celebration on every new sharer tier (haptic comes from sharer.ts): a gold card that pops in and fades out */
export function SharerCelebration() {
  const s = useSharerText();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const [tier, setTier] = useState<number | null>(null);
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => onSharerTierUp((n) => {
    setTier(n);
    v.setValue(0);
    const show = reduce ? Animated.timing(v, { toValue: 1, duration: 1, useNativeDriver: true }) : Animated.timing(v, { toValue: 1, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    Animated.sequence([show, Animated.delay(2600), Animated.timing(v, { toValue: 0, duration: 260, useNativeDriver: true })]).start(({ finished }) => { if (finished) setTier(null); });
  }), [reduce, v]);
  if (tier === null) return null;
  const scale = reduce ? 1 : v.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: insets.top + 12, alignItems: "center", zIndex: 1000 }}>
      <Animated.View accessibilityLiveRegion="assertive" accessible accessibilityLabel={`${fillText(s.tierUp, { n: tier })}. ${s.tierUpLead}`}
        style={{ opacity: v, transform: [{ scale }], borderRadius: R.card, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } }}>
        <LinearGradient colors={[stage.bg, stage.deep]} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 18, borderWidth: 1, borderColor: "rgba(233,207,153,0.45)", borderRadius: R.card }}>
          <LinearGradient colors={["#f3e2b6", "#c6a65e"]} style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }}>
            <Icon name="send" color="#3a2a08" size={20} />
          </LinearGradient>
          <View>
            <Text style={{ fontFamily: FONT.display, fontSize: 17, color: stage.gold }}>{fillText(s.tierUp, { n: Intl.NumberFormat(lang).format(tier) })}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{s.tierUpLead}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

/** "Top sharers this week" from the community API; hidden when the API is not there or nobody shared yet */
export function TopSharers() {
  const t = useTheme();
  const s = useSharerText();
  const { lang } = useLang();
  const [list, setList] = useState<TopSharer[] | null>(null);
  useEffect(() => { void loadTopSharers().then(setList); }, []);
  if (!list || !list.length) return null;
  const nf = (n: number) => Intl.NumberFormat(lang).format(n);
  return (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 16, gap: 4 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 17, color: t.ink }}>{s.topWeek}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, marginBottom: 6 }}>{s.topLead}</Text>
      {list.map((x, i) => (
        <Pressable key={x.username} onPress={() => { tick(); router.push(`/community/u/${x.username}` as Href); }} accessibilityRole="link"
          accessibilityLabel={`${i + 1}. ${x.name}, ${fillText(s.sharedWeek, { n: nf(x.week) })}`}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: t.line, opacity: pressed ? 0.7 : 1 })}>
          <Text style={{ width: 24, fontFamily: FONT.display, fontSize: 16, color: i < 3 ? t.gold : t.muted, textAlign: "center" }}>{nf(i + 1)}</Text>
          <View style={{ flex: 1, gap: 3 }}>
            <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{x.name}</Text>
            <SharerBadge tier={x.tier} compact />
          </View>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{fillText(s.sharedWeek, { n: nf(x.week) })}</Text>
        </Pressable>
      ))}
    </View>
  );
}
