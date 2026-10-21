import { Pressable, Text } from "react-native";
import { router, type Href } from "expo-router";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { FONT, R, useTheme } from "@/lib/theme";
import { useStored } from "@/lib/store";
import { FEED_STATS_KEY, todayWords, type FeedStats } from "./seen";
import { fillText, useFeedText } from "./texts";

/** Account: "Today you learned N words in the feed" (only when there is something to show); opens the Feed tab */
export function FeedStatsRow() {
  const t = useTheme();
  const tx = useFeedText();
  const { lang } = useLang();
  const n = todayWords(useStored<FeedStats>(FEED_STATS_KEY, { day: 0, words: 0 }));
  if (!n) return null;
  return (
    <Pressable onPress={() => router.navigate("/foryou" as Href)} accessibilityRole="button"
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: pressed ? t.accentSoft : t.surface })}>
      <Icon name="reels" color={t.accent} size={22} />
      <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{fillText(tx.statsToday, { n: Intl.NumberFormat(lang).format(n) })}</Text>
    </Pressable>
  );
}

/** Account: the feed statistics and the Today screen (its cards live in the Feed's stories rail now) */
export function FeedLinks() {
  const t = useTheme();
  const tx = useFeedText();
  const row = (label: string, icon: "trophy" | "sun", href: string) => (
    <Pressable onPress={() => router.push(href as Href)} accessibilityRole="button"
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: pressed ? t.accentSoft : t.surface })}>
      <Icon name={icon} color={t.accent} size={22} />
      <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{label}</Text>
      <Icon name="chevronRight" color={t.muted} size={18} />
    </Pressable>
  );
  return <>{row(tx.statsTitle, "trophy", "/feed-stats")}{row(tx.todayLink, "sun", "/")}</>;
}
