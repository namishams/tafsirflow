import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Page } from "@/components/page";
import { Icon, type IconName } from "@/components/icons";
import { useLang } from "@/i18n";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { BrandFoot, CARD_SIZE, ShareSheet, type ShareFormat } from "./share";
import { dayNum, dayOf, longestStreak, streakOf, useFeedStats, type DayStats } from "./statsStore";
import { resetInterest } from "./interest";
import { fillText, useFeedText } from "./texts";
import { SITE } from "@/lib/api";
import { useEffect } from "react";
import { AccountNudge, nudgeAccount } from "./Promo";

// /feed-stats: the feed statistics of this device (statsStore.ts): time today / week / all time, counters, a 7-day bar
// chart, a 12-week heatmap, the breakdown per kind, milestones and a shareable "learned today" card.
const READ = ["hadith", "hadith-of-day", "shia-hadith", "tafsir", "dua"];
const FOUND = ["scholar-bio", "scholar-work", "scholar-timeline", "mosque", "reciter-bio"];

export default function StatsScreen() {
  const t = useTheme();
  const tx = useFeedText();
  const { lang } = useLang();
  const s = useFeedStats();
  const [share, setShare] = useState(false);
  const [resetNote, setResetNote] = useState(false);
  useEffect(() => { const id = setTimeout(nudgeAccount, 1500); return () => clearTimeout(id); }, []);
  const nf = (n: number) => Intl.NumberFormat(lang).format(Math.round(n));
  const min = (ms: number) => fillText(tx.statsMinutes, { n: nf(ms / 60000) });
  const today = dayNum();
  const sumDays = (from: number, to: number) => { const o: DayStats = { ms: 0, posts: 0, verses: 0, words: 0, likes: 0, saves: 0, shares: 0, kinds: {} }; for (let d = from; d <= to; d++) { const x = dayOf(s, d); o.ms += x.ms; o.posts += x.posts; o.verses += x.verses; o.words += x.words; } return o; };
  const week = sumDays(today - 6, today);
  const td = dayOf(s, today);
  const kindSum = (ks: string[]) => ks.reduce((a, k) => a + (s.total.kinds[k] ?? 0), 0);
  const streak = streakOf(s);
  const last7 = Array.from({ length: 7 }, (_, i) => dayOf(s, today - 6 + i));
  const max7 = Math.max(1, ...last7.map((d) => d.ms));
  const heat = Array.from({ length: 84 }, (_, i) => dayOf(s, today - 83 + i).posts);
  const maxHeat = Math.max(1, ...heat);
  const kinds = Object.entries(s.total.kinds).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxKind = Math.max(1, ...kinds.map((k) => k[1]));
  const badges: [string, boolean, IconName][] = [
    [tx.badgePosts100, s.total.posts >= 100, "grid"], [tx.badgePosts1000, s.total.posts >= 1000, "trophy"], [tx.badgeVerses100, s.total.verses >= 100, "volume"],
    [tx.badgeWords100, s.total.words >= 100, "cap"], [tx.badgeStreak7, longestStreak(s) >= 7, "flame"], [tx.badgeStreak30, longestStreak(s) >= 30, "starBig"],
  ];
  const card = { borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 16, gap: 12 } as const;
  const h = (x: string) => <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 17, color: t.ink }}>{x}</Text>;
  const Stat = ({ label, value }: { label: string; value: string }) => (
    <View style={{ flexBasis: "47%", flexGrow: 1, padding: 12, borderRadius: 12, backgroundColor: t.bg, gap: 2 }}>
      <Text style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>{value}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{label}</Text>
    </View>
  );
  const learnedCard = (f: ShareFormat) => (
    <LinearGradient colors={[stage.bg, stage.deep]} style={{ width: CARD_SIZE[f].w, height: CARD_SIZE[f].h, padding: 28, justifyContent: "space-between" }}>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>{tx.statsLearned}</Text>
      <View style={{ gap: 16 }}>
        {[[tx.statsWords, td.words], [tx.statsVerses, td.verses], [tx.statsPosts, td.posts]].map(([l, n]) => (
          <View key={l as string} style={{ alignItems: "center" }}>
            <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: 40, color: "#fff" }}>{nf(n as number)}</Text>
            <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{l as string}</Text>
          </View>
        ))}
        {streak ? <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 15, color: stage.gold, textAlign: "center" }}>{tx.statsStreak}: {fillText(tx.statsDays, { n: nf(streak) })}</Text> : null}
      </View>
      <BrandFoot />
    </LinearGradient>
  );
  return (
    <Page padded>
      <Stack.Screen options={{ title: tx.statsTitle }} />
      <View style={{ gap: 14 }}>
        <View style={card}>
          {h(tx.statsLearned)}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Stat label={tx.statsWords} value={nf(td.words)} />
            <Stat label={tx.statsVerses} value={nf(td.verses)} />
            <Stat label={tx.statsPosts} value={nf(td.posts)} />
            <Stat label={tx.statsStreak} value={fillText(tx.statsDays, { n: nf(streak) })} />
          </View>
          <Pressable onPress={() => setShare(true)} accessibilityRole="button" style={({ pressed }) => ({ height: 46, borderRadius: R.pill, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", backgroundColor: t.accent, transform: pressed ? [{ scale: 0.97 }] : undefined })}>
            <Icon name="share" color={t.onAccent} size={18} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.onAccent }}>{tx.shareTitle}</Text>
          </Pressable>
        </View>

        <View style={card}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Stat label={tx.statsDayToday} value={min(td.ms)} />
            <Stat label={tx.statsWeek} value={min(week.ms)} />
            <Stat label={tx.statsAll} value={min(s.total.ms)} />
            <Stat label={tx.statsLongest} value={min(s.longestMs)} />
          </View>
        </View>

        <View style={card}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Stat label={tx.statsPosts} value={nf(s.total.posts)} />
            <Stat label={tx.statsVerses} value={nf(s.total.verses)} />
            <Stat label={tx.statsWords} value={nf(s.total.words)} />
            <Stat label={tx.statsRead} value={nf(kindSum(READ))} />
            <Stat label={tx.statsFound} value={nf(kindSum(FOUND))} />
            <Stat label={tx.statsLikes} value={nf(s.total.likes)} />
            <Stat label={tx.statsSaves} value={nf(s.total.saves)} />
            <Stat label={tx.statsShares} value={nf(s.total.shares)} />
          </View>
        </View>

        <View style={card}>
          {h(tx.statsLast7)}
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, height: 120 }} accessible accessibilityLabel={last7.map((d) => min(d.ms)).join(", ")}>
            {last7.map((d, i) => (
              <View key={i} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                <View style={{ width: "100%", height: Math.max(3, (d.ms / max7) * 96), borderRadius: 6, backgroundColor: i === 6 ? t.accent : t.accentSoft }} />
                <Text style={{ fontFamily: FONT.regular, fontSize: 10.5, color: t.muted }}>{new Intl.DateTimeFormat(lang, { weekday: "narrow" }).format(new Date(Date.now() - (6 - i) * 86400000))}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={card}>
          {h(tx.statsWeeks)}
          <View style={{ flexDirection: "row", gap: 3 }} accessibilityElementsHidden>
            {Array.from({ length: 12 }, (_, w) => (
              <View key={w} style={{ flex: 1, gap: 3 }}>
                {heat.slice(w * 7, w * 7 + 7).map((n, d) => (
                  <View key={d} style={{ aspectRatio: 1, borderRadius: 3, backgroundColor: n ? t.accent : t.line, opacity: n ? 0.25 + 0.75 * (n / maxHeat) : 1 }} />
                ))}
              </View>
            ))}
          </View>
        </View>

        {kinds.length ? (
          <View style={card}>
            {h(tx.statsByKind)}
            {kinds.map(([k, n]) => (
              <View key={k} style={{ gap: 4 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{k}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{nf(n)}</Text>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: t.line }}><View style={{ width: `${(n / maxKind) * 100}%`, height: 6, borderRadius: 3, backgroundColor: t.accent }} /></View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={card}>
          {h(tx.statsBadges)}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {badges.map(([l, on, ic]) => (
              <View key={l} accessible accessibilityLabel={l} accessibilityState={{ disabled: !on }} style={{ flexBasis: "30%", flexGrow: 1, alignItems: "center", gap: 6, padding: 12, borderRadius: 12, backgroundColor: on ? t.accentSoft : t.bg, opacity: on ? 1 : 0.5 }}>
                <Icon name={ic} color={on ? t.accent : t.muted} size={24} />
                <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.ink, textAlign: "center" }}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable onPress={() => { resetInterest(); setResetNote(true); }} accessibilityRole="button" style={{ alignSelf: "center", paddingVertical: 10 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{tx.statsReset}</Text>
        </Pressable>
        {resetNote ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "center" }}>{tx.statsResetDone}</Text> : null}
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "center" }}>{tx.statsLocal}</Text>
      </View>
      <AccountNudge />
      <ShareSheet visible={share} onClose={() => setShare(false)} link={SITE} message={`${tx.statsLearned}: ${nf(td.words)} · ${nf(td.verses)} · ${nf(td.posts)}`} renderCard={learnedCard} />
    </Page>
  );
}
