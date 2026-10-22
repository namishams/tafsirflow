import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useGlobalSearchParams, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { GlassSurface, GoldButton, StarLattice } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FONT, stage } from "@/lib/theme";
import { intlLocale, useLang } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { readJSON, writeJSON } from "@/lib/store";
import { getChapters, type Chapter } from "@/lib/quran";
import { dueVerses, stats, today } from "@/web/learning";
import { readProgress, streakOf } from "@/web/academy";
import { TRACKS, dayOfPlan, portion, readPlan } from "@/web/plans";
import { continueHref, readShamsMode } from "@/features/shams2/mode";
import { shouldOnboard } from "@/features/extra/Onboarding";
import { quizPending } from "@/features/plan/Funnel";
import { useReducedMotionX } from "@/features/extra/motion";
import { tick } from "@/features/feed/haptics";
import { Sun } from "@/features/library/shamsArt";
import { useMomentT } from "./texts";

// The start greeting: once a day, when the app opens, the gold شمس sun rises with a salam (at most 1.2 s), then today's
// personal plan: the next verse, the reviews that are due and the streak, with one gold "Learn now". It never blocks:
// a tap anywhere closes it, and it does not appear on the very first start (the onboarding comes first) or a second
// time on the same day. Reduce Motion: everything is there at once, without movement.
const KEY = "qmc.greeting.day";

let open = false;
const waiting = new Set<() => void>();
/** runs `f` once the greeting is gone (immediately when there is none); the daily moment waits for it */
export function afterGreeting(f: () => void): () => void {
  if (!open) { f(); return () => undefined; }
  waiting.add(f);
  return () => { waiting.delete(f); };
}
const release = () => { open = false; const fs = [...waiting]; waiting.clear(); fs.forEach((f) => f()); };

/** decided synchronously at the first render of the root layout (the store is hydrated by then) */
function dueToday(): boolean {
  if (quizPending() || shouldOnboard() || !readJSON<boolean>("tf:onboardShown", false)) return false;
  return readJSON<number>(KEY, 0) < today();
}

type Plan = { verse: { s: number; v: number } | null; due: number; streak: number; href: string };
function planNow(): Plan {
  const due = dueVerses();
  const mode = readShamsMode();
  const p = readPlan();
  const tr = p ? TRACKS.find((x) => x.id === p.track) : null;
  const part = p && tr ? portion(tr, dayOfPlan(p)) : [];
  const last = readJSON<{ chapter: number; verse: number } | null>("tf:last", null);
  const verse = part[0] ?? (last ? { s: last.chapter, v: last.verse } : { s: 1, v: 1 });
  const first = due[0];
  // reviews first (they fade when they wait), then the plan's new verse, then where the learner stopped
  const href = first
    ? mode !== "classic" ? "/shams/wird" : `/shams/${first.split(":")[0]}?v=${first.split(":")[1]}`
    : continueHref(mode, { surah: verse.s, verse: verse.v });
  return { verse, due: due.length, streak: Math.max(stats().streak, streakOf(readProgress())), href };
}

export function StartGreeting() {
  const [show, setShow] = useState(() => { const d = dueToday(); open = d; return d; });
  // ?greet=1 opens it again on purpose (a link from the reminder, review of the design)
  const params = useGlobalSearchParams<{ greet?: string }>();
  useEffect(() => { if (params.greet === "1") { open = true; setShow(true); } }, [params.greet]);
  useEffect(() => { if (show) writeJSON(KEY, today(), true); }, [show]);
  if (!show) return null;
  return <GreetingView onDone={() => { setShow(false); release(); }} />;
}

function GreetingView({ onDone }: { onDone: () => void }) {
  const tx = useMomentT();
  const { lang } = useLang();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotionX();
  const plan = useMemo(planNow, []);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  const surah = plan.verse ? chapters.find((c) => c.id === plan.verse!.s)?.name_simple ?? String(plan.verse.s) : "";
  const nf = (n: number) => n.toLocaleString(intlLocale(lang));
  const first = user?.name?.trim().split(/\s+/)[0];
  const salam = first ? tx("salamName", { name: first }) : tx("salam");

  // sun and salam rise together (0–700 ms), the plan follows (500–1200 ms); leaving fades out in 220 ms
  const rise = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  const card = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const closing = useRef(false);
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`${salam}. ${tx("planTitle")}`);
    if (reduce) { rise.setValue(1); card.setValue(1); return; }
    const a = Animated.parallel([
      Animated.timing(rise, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(card, { toValue: 1, duration: 700, delay: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]);
    a.start();
    return () => a.stop();
  }, [reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = (then?: () => void) => {
    if (closing.current) return;
    closing.current = true;
    const end = () => { onDone(); then?.(); };
    if (reduce) { end(); return; }
    Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }).start(end);
  };
  const learn = () => { tick(); close(() => router.push(plan.href as Href)); };

  const sunStyle = { opacity: rise, transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }, { scale: rise.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) }] };
  const cardStyle = { opacity: card, transform: [{ translateY: card.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] };

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 50, elevation: 50, opacity: fade }]} accessibilityViewIsModal>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} accessibilityRole="button" accessibilityLabel={tx("skip")} accessibilityHint={tx("skipHint")}>
        <LinearGradient colors={["#03140e", stage.bg, "#04170f"]} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
        <View pointerEvents="none" style={StyleSheet.absoluteFill}><StarLattice opacity={0.06} size={72} /></View>
      </Pressable>
      <View pointerEvents="box-none" style={{ flex: 1, justifyContent: "center", paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16, paddingHorizontal: 20 }}>
        <Animated.View pointerEvents="none" style={[{ alignItems: "center" }, sunStyle]}>
          <Sun size={168} />
          <Text accessibilityRole="header" numberOfLines={2} style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.5, color: stage.cream, textAlign: "center", marginTop: 14 }}>{salam}</Text>
        </Animated.View>
        <Animated.View style={[{ marginTop: 26, alignSelf: "center", width: "100%", maxWidth: 420 }, cardStyle]}>
          <GlassSurface onStage strong style={{ borderRadius: 26, padding: 18 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.4, textTransform: "uppercase", color: stage.gold }}>{tx("planTitle")}</Text>
            <View style={{ flexDirection: "row", marginTop: 14 }}>
              <Stat icon="book" value={plan.verse ? `${plan.verse.s}:${plan.verse.v}` : "–"} label={tx("nextVerse")} sub={surah} />
              <Stat icon="repeat" value={plan.due ? nf(plan.due) : "0"} label={tx("reviews")} sub={plan.due ? tx("reviewsDue", { n: nf(plan.due) }) : tx("reviewsNone")} border />
              <Stat icon="flame" value={nf(plan.streak)} label={tx("streak")} border />
            </View>
            <GoldButton title={tx("learnNow")} icon="play" onPress={learn} style={{ marginTop: 18 }} />
          </GlassSurface>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

function Stat({ icon, value, label, sub, border }: { icon: "book" | "repeat" | "flame"; value: string; label: string; sub?: string; border?: boolean }) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}${sub ? `, ${sub}` : ""}`} style={{ flex: 1, alignItems: "center", gap: 3, paddingHorizontal: 4, borderStartWidth: border ? StyleSheet.hairlineWidth : 0, borderColor: stage.goldSoft }}>
      <Icon name={icon} color={stage.gold} size={17} />
      <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: FONT.display, fontSize: 22, color: "#fff", fontVariant: ["tabular-nums"] }}>{value}</Text>
      <Text numberOfLines={2} style={{ fontFamily: FONT.medium, fontSize: 11.5, lineHeight: 14, color: stage.textSoft, textAlign: "center" }}>{label}</Text>
      {sub ? <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 11, color: stage.textMuted, textAlign: "center" }}>{sub}</Text> : null}
    </View>
  );
}
