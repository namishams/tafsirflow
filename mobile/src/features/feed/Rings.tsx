import { memo, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { Icon, type IconName } from "@/components/icons";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { FONT, useTheme } from "@/lib/theme";
import { openPro, usePro } from "@/lib/pro";
import { readTradition } from "@/lib/tradition";
import { VERSES_OF_THE_DAY } from "@/web/votd";
import { dayFor, fmtTime, type Prayer } from "@/web/prayer";
import { countdown, todayUtc } from "@/web/hijri";
import { useRadioSelect } from "@/features/radio/engine";
import { spotNow } from "./Extras";
import { streakOf, useFeedStats } from "./statsStore";
import { statPromo } from "./statsStore";
import { useFeedText } from "./texts";
import { flagOn, openDeeplink, useRemoteConfig } from "./remote";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import Svg, { Circle } from "react-native-svg";
import { mondayOf, todaysQuests, useGamify } from "./gamify";
import { useGameText } from "./gamifyTexts";
import { dayNum } from "./statsStore";

const ANN_SEEN = "qmc.feed-ann-seen";

// Today's key cards as rings at the start of the Home stories rail: next prayer, countdown to the next Islamic day,
// feed streak, radio live, verse of the day, feed statistics, the Shams Method and (without Pro) Pro.
type Ring = { id: string; label: string; value: string; icon: IconName; tone: [string, string]; on: () => void; live?: boolean; fresh?: boolean; progress?: number };

export const TodayRings = memo(function TodayRings({ onVerse }: { onVerse: (item: string) => void }) {
  const t = useTheme();
  const tx = useFeedText();
  const wp = useWebT("prayer");
  const { lang } = useLang();
  const { pro } = usePro();
  const stats = useFeedStats();
  const radioOn = useRadioSelect((r) => r.started && r.playing);
  const next = useMemo(() => {
    try {
      const sp = spotNow();
      const d = dayFor(sp, new Date());
      const now = Date.now();
      for (const p of ["fajr", "dhuhr", "asr", "maghrib", "isha"] as Prayer[]) { const at = d.times[p]; if (at && at.getTime() > now) return { p, time: fmtTime(at, sp.tz, lang) }; }
    } catch { /* no prayer times */ }
    return null;
  }, [lang]);
  const days = useMemo(() => { try { return countdown(readTradition(), todayUtc(), 1)?.days ?? null; } catch { return null; } }, []);
  const votd = VERSES_OF_THE_DAY[Math.floor(Date.now() / 86400000) % VERSES_OF_THE_DAY.length];
  // announcements of the remote config: first in the rail, with the unseen ring until opened
  const rc = useRemoteConfig();
  const annSeen = useStored<string[]>(ANN_SEEN, []);
  const now = Date.now();
  const ann: Ring[] = flagOn("announcements") ? (rc?.announcements ?? [])
    .filter((a) => Date.parse(a.startsAt) <= now && Date.parse(a.endsAt) > now)
    .map((a) => ({ id: `ann:${a.id}`, label: a.title, value: "", icon: "moon" as IconName, tone: ["#3d2a0b", "#8c6a1d"] as [string, string], fresh: !annSeen.includes(a.id),
      on: () => { writeJSON(ANN_SEEN, [...readJSON<string[]>(ANN_SEEN, []).filter((x) => x !== a.id), a.id].slice(-50), true); statPromo(`ann:${a.id}`, "tap"); openDeeplink(a.deeplink); } }))
    .sort((a, b) => Number(!!b.fresh) - Number(!!a.fresh)) : [];
  // today's three quests as a progress ring; on Mondays the recap of last week until it was opened
  const gt = useGameText();
  const gm = useGamify();
  const quests = todaysQuests();
  const qDone = quests.filter((q) => q.p >= q.n).length;
  const qFrac = quests.length ? quests.reduce((a, q) => a + Math.min(1, q.p / q.n), 0) / quests.length : 0;
  const today = dayNum();
  const recapDue = today === mondayOf(today) && gm.recapSeen.week !== mondayOf(today) - 7 && stats.days[String(today - 1)] !== undefined;
  const rings: Ring[] = [
    ...ann,
    ...(recapDue ? [{ id: "recap", label: gt.weekRecap, value: "", icon: "calendar" as IconName, tone: ["#0b3d2e", "#c6a65e"] as [string, string], fresh: true, on: () => router.push("/feed-stats?recap=week" as Href) }] : []),
    { id: "quests", label: gt.questsRing, value: `${qDone}/${quests.length}`, icon: "checkCircle", tone: ["#0b3d2e", "#1d6b52"], progress: qFrac, on: () => router.push("/feed-stats" as Href) },
    { id: "prayer", label: next ? wp(next.p) : tx.ringPrayer, value: next?.time ?? "", icon: "mosque", tone: ["#0b3d2e", "#1d6b52"], on: () => router.push("/prayer" as Href) },
    { id: "countdown", label: tx.ringCountdown, value: days !== null ? fillDays(days) : "", icon: "moon", tone: ["#1f2b47", "#3e5a8c"], on: () => router.push("/calendar" as Href) },
    { id: "streak", label: tx.ringStreak, value: String(streakOf(stats)), icon: "flame", tone: ["#47301f", "#b0662a"], on: () => router.push("/feed-stats" as Href) },
    { id: "radio", label: tx.ringRadio, value: "", icon: "radio", tone: ["#47141f", "#a3283c"], on: () => router.push("/radio" as Href), live: true },
    { id: "verse", label: tx.ringVerse, value: votd, icon: "book", tone: ["#2b1f47", "#5a3e8c"], on: () => onVerse(`v:${votd}`) },
    { id: "stats", label: tx.statsOpen, value: "", icon: "trophy", tone: ["#0b2f3d", "#1d5a6b"], on: () => router.push("/feed-stats" as Href) },
    { id: "shams", label: tx.ringShams, value: "", icon: "sun", tone: ["#3d2a0b", "#8c6a1d"], on: () => { statPromo("shams-ring", "tap"); router.push("/shams" as Href); } },
    ...(pro ? [] : [{ id: "pro", label: tx.ringPro, value: "", icon: "starBig" as IconName, tone: ["#0b3d2e", "#c6a65e"] as [string, string], on: () => { statPromo("pro-ring", "tap"); openPro("general"); } }]),
  ];
  function fillDays(n: number) { return Intl.NumberFormat(lang).format(n); }
  return (
    <>
      {rings.map((r) => (
        <Pressable key={r.id} onPress={r.on} accessibilityRole="button" accessibilityLabel={[r.label, r.value].filter(Boolean).join(", ")}
          style={({ pressed }) => ({ width: 78, alignItems: "center", gap: 5, transform: pressed ? [{ scale: 0.97 }] : undefined })}>
          {r.progress !== undefined ? (
            <View style={{ width: 72, height: 72 }}>
              <Svg width={72} height={72} style={{ position: "absolute" }}>
                <Circle cx={36} cy={36} r={34} stroke={t.line} strokeWidth={3} fill="none" />
                {r.progress > 0 ? <Circle cx={36} cy={36} r={34} stroke="#c6a65e" strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={`${(2 * Math.PI * 34 * Math.min(1, r.progress)).toFixed(1)} 999`} transform="rotate(-90 36 36)" /> : null}
              </Svg>
              <View style={{ flex: 1, margin: 4.5, borderRadius: 32, overflow: "hidden" }}>
                <LinearGradient colors={r.tone} style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <Icon name={r.icon} color="rgb(233,207,153)" size={17} />
                  <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 12, color: "#fff" }}>{r.value}</Text>
                </LinearGradient>
              </View>
            </View>
          ) : <LinearGradient colors={r.id === "radio" && radioOn ? ["#ff5a6e", "#d63031"] : r.fresh === false ? [t.line, t.line] : r.fresh ? ["#f3e2b6", "#c6a65e", "#8a6a2c"] : ["#f3e2b6", "#c6a65e"]} style={{ width: 72, height: 72, borderRadius: 36, padding: 2.5 }}>
            <View style={{ flex: 1, borderRadius: 34, padding: 2, backgroundColor: t.bg }}>
              <LinearGradient colors={r.tone} style={{ flex: 1, borderRadius: 32, alignItems: "center", justifyContent: "center", gap: 1 }}>
                <Icon name={r.icon} color="rgb(233,207,153)" size={r.value ? 17 : 24} />
                {r.value ? <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: FONT.bold, fontSize: 12, color: "#fff", paddingHorizontal: 6 }}>{r.value}</Text> : null}
              </LinearGradient>
            </View>
          </LinearGradient>}
          {r.live ? <View style={{ position: "absolute", top: 58, paddingHorizontal: 5, borderRadius: 4, backgroundColor: "rgb(214,48,49)" }}><Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 9, color: "#fff", textTransform: "uppercase" }}>{tx.onAir}</Text></View> : null}
          <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.ink, maxWidth: 76 }}>{r.label}</Text>
        </Pressable>
      ))}
    </>
  );
});
