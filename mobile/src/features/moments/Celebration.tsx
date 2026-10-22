import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { AccessibilityInfo, Animated, Easing, PixelRatio, Platform, Pressable, Share, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { GlassButton, GoldButton, StarLattice, TextButton } from "@/components/brand";
import { FONT, stage } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { usePro } from "@/lib/pro";
import { readJSON, useStoreVersion, writeJSON } from "@/lib/store";
import { getChapters } from "@/lib/quran";
import { stats } from "@/web/learning";
import { levelOf, readProgress, streakOf } from "@/web/academy";
import { TOTAL_VERSES, juzOf } from "@/web/quranIndex";
import { activeTree, holdCelebrations, readGarden, seasonNow, treeStage, type TreeType } from "@/features/garden/garden";
import { TreeArt } from "@/features/garden/Tree";
import { chime } from "@/features/garden/widgets";
import { APP_LINK, BrandFoot } from "@/features/feed/share";
import { statShare } from "@/features/feed/statsStore";
import { useReducedMotionX } from "@/features/extra/motion";
import { ChatSendSheet } from "./ChatSend";
import { useMomentT } from "./texts";

// Success moments: a completed surah (Shams Method), a new learning level, a part (juz) or a whole Khatm, and streak
// milestones. Each one gets the garden's tree glowing under falling gold leaves and a share card of 1080 × 1350 with
// the achievement, the member's name and the app's name (no points, no amounts). Levels, Khatm parts and streaks are
// noticed by comparing the store with what was celebrated last; the surah comes from the Shams completion screen.
// An overlay of the root layout, not a Modal: the garden's own stage-up cinematic (a Modal) may stand above it, and
// the garden's celebrations wait while this one is open (holdCelebrations).

export type Moment = { kind: "surah"; surah: number } | { kind: "level"; n: number } | { kind: "juz"; n: number } | { kind: "khatm" } | { kind: "streak"; n: number };

const subs = new Set<(m: Moment) => void>();
/** shows a success moment (queued when another one is open) */
export function celebrateMoment(m: Moment) { setTimeout(() => subs.forEach((f) => f(m)), 350); }

// ---------- watching the store ----------
const SEEN = "qmc.moments.seen";
type Seen = { level: number; round: number; juz: number; streak: number };
export const STREAK_MILESTONES = [3, 7, 14, 30, 40, 60, 100, 200, 365, 500, 1000];
type Khatm = { pos: number; round?: number; deleted?: boolean } | null;
function snapshot(): Seen {
  const ac = readProgress();
  const k = readJSON<Khatm>("tf:khatm", null);
  const pos = k && !k.deleted ? k.pos : 0;
  const streak = Math.max(stats().streak, streakOf(ac));
  return { level: levelOf(ac.xp), round: k && !k.deleted ? k.round ?? 1 : 0, juz: pos >= TOTAL_VERSES ? 30 : pos > 0 ? juzOf(pos) - 1 : 0, streak };
}
const milestoneOf = (n: number) => STREAK_MILESTONES.filter((m) => m <= n).pop() ?? 0;
/** compares the store with what was celebrated last; the first run only notes where the learner stands */
function check(): Moment[] {
  const now = snapshot();
  const seen = readJSON<Seen | null>(SEEN, null);
  const next: Seen = { ...now, streak: milestoneOf(now.streak) };
  if (!seen) { writeJSON(SEEN, next, true); return []; }
  const out: Moment[] = [];
  if (now.level > seen.level) out.push({ kind: "level", n: now.level });
  if (now.round === seen.round && now.juz > seen.juz) out.push(now.juz >= 30 ? { kind: "khatm" } : { kind: "juz", n: now.juz });
  if (next.streak > seen.streak) out.push({ kind: "streak", n: next.streak });
  // a level never goes back; a new Khatm round and a broken streak start counting again
  if (now.level !== seen.level || now.round !== seen.round || now.juz !== seen.juz || next.streak !== seen.streak) writeJSON(SEEN, { ...next, level: Math.max(now.level, seen.level) }, true);
  return out;
}

// ---------- the host in the root layout ----------
export function MomentsHost() {
  const version = useStoreVersion();
  const [queue, setQueue] = useState<Moment[]>([]);
  useEffect(() => { const f = (m: Moment) => setQueue((q) => (q.length > 4 ? q : [...q, m])); subs.add(f); return () => { subs.delete(f); }; }, []);
  useEffect(() => {
    const id = setTimeout(() => { const found = check(); if (found.length) setQueue((q) => [...q, ...found].slice(0, 5)); }, 900);
    return () => clearTimeout(id);
  }, [version]);
  const cur = queue[0];
  if (!cur) return null;
  return <Celebration key={JSON.stringify(cur)} m={cur} onClose={() => setQueue((q) => q.slice(1))} />;
}

function useTitle(m: Moment): { title: string; body: string } {
  const tx = useMomentT();
  const { lang } = useLang();
  const [surah, setSurah] = useState("");
  useEffect(() => {
    if (m.kind !== "surah") return;
    getChapters(lang).then((cs) => setSurah(cs.find((c) => c.id === m.surah)?.name_simple ?? String(m.surah))).catch(() => setSurah(String(m.surah)));
  }, [m, lang]);
  switch (m.kind) {
    case "surah": return { title: tx("surahTitle", { name: surah || String(m.surah) }), body: tx("surahBody") };
    case "level": return { title: tx("levelTitle", { n: m.n }), body: tx("levelBody") };
    case "juz": return { title: tx("juzTitle", { n: m.n }), body: tx("juzBody") };
    case "khatm": return { title: tx("khatmTitle"), body: tx("khatmBody") };
    case "streak": return { title: tx("streakTitle", { n: m.n }), body: tx("streakBody") };
  }
}

/** the member's tree from the garden, or a young palm for someone who has not planted one yet */
function useTree(): { id: string; type: TreeType; stage: number } {
  const { pro } = usePro();
  return useMemo(() => {
    const t = activeTree(readGarden(), pro);
    return t ? { id: t.id, type: t.type, stage: Math.max(3, treeStage(t, pro)) } : { id: "moment", type: "palm", stage: 6 };
  }, [pro]);
}

function Celebration({ m, onClose }: { m: Moment; onClose: () => void }) {
  const tx = useMomentT();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const reduce = useReducedMotionX();
  const { title, body } = useTitle(m);
  const tree = useTree();
  const name = user?.name?.trim() || "";
  const shot = useRef<ComponentRef<typeof View>>(null);
  const [chat, setChat] = useState(false);
  const [busy, setBusy] = useState(false);

  const enter = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  const glow = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  useEffect(() => holdCelebrations(), []); // the garden's stage-up waits until this moment is closed
  useEffect(() => {
    chime();
    AccessibilityInfo.announceForAccessibility(`${title}. ${body}`);
    if (reduce) { enter.setValue(1); glow.setValue(1); return; }
    const a = Animated.parallel([
      Animated.timing(enter, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.loop(Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.55, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])),
    ]);
    a.start();
    return () => a.stop();
  }, [reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const capture = async (): Promise<string> => {
    const k = Platform.OS === "ios" ? PixelRatio.get() : 1;
    const uri = await captureRef(shot as unknown as Parameters<typeof captureRef>[0], { format: "png", quality: 1, result: "tmpfile", width: 1080 / k, height: 1350 / k });
    return uri.startsWith("/") ? `file://${uri}` : uri;
  };
  const message = `${title}\n${tx("cardLead")} Quran Masterclass\n${APP_LINK}`;
  const share = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (Platform.OS !== "web" && (await Sharing.isAvailableAsync())) await Sharing.shareAsync(await capture(), { mimeType: "image/png", UTI: "public.png", dialogTitle: title });
      else await Share.share({ message });
      statShare();
    } catch { /* the reader closed the sheet */ } finally { setBusy(false); }
  };

  const size = Math.min(250, width * 0.6);
  const card = { opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }] };
  const treeIn = { opacity: enter, transform: [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] };
  const halo = { opacity: glow, transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1.06] }) }] };

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 60, elevation: 60 }]} accessibilityViewIsModal>
      <LinearGradient colors={["#020d09", "#05211a", "#020d09"]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}><StarLattice opacity={0.05} size={72} /></View>
      {!reduce ? <Leaves width={width} height={height} /> : null}

      {/* the share card, drawn at 360 × 450 points out of sight and captured at 1080 × 1350 pixels */}
      <View pointerEvents="none" style={{ position: "absolute", left: -2000, top: 0 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View ref={shot} collapsable={false} style={{ width: 360, height: 450 }}>
          <ShareCard title={title} kicker={tx("kicker")} name={name} tree={tree} />
        </View>
      </View>

      <View style={{ flex: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 18, paddingHorizontal: 22, justifyContent: "center" }}>
        <Animated.View style={[{ alignItems: "center", height: size * 1.25, justifyContent: "flex-end" }, treeIn]}>
          <Animated.View pointerEvents="none" style={[{ position: "absolute", width: size * 1.9, height: size * 1.9, top: size * 1.25 / 2 - size * 0.95 }, halo]}>
            <Halo size={size * 1.9} />
          </Animated.View>
          <TreeArt id={tree.id} type={tree.type} stage={tree.stage} traits={readGarden().traits} season={seasonNow()} size={size} still={reduce} />
        </Animated.View>
        <Animated.View style={[{ alignItems: "center", marginTop: 18 }, card]}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: stage.gold }}>{tx("kicker")}</Text>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.4, color: stage.cream, textAlign: "center", marginTop: 8 }}>{title}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 23, color: stage.textSoft, textAlign: "center", marginTop: 10, maxWidth: 360 }}>{body}</Text>
          <View style={{ alignSelf: "stretch", maxWidth: 400, width: "100%", alignItems: "stretch", marginTop: 24, gap: 10 }}>
            <GoldButton title={tx("share")} icon="send" busy={busy} onPress={() => void share()} />
            {Platform.OS !== "web" ? <GlassButton onStage title={tx("sendChat")} icon="comment" onPress={() => setChat(true)} /> : null}
            <TextButton onStage title={tx("continue")} onPress={onClose} style={{ alignSelf: "center" }} />
          </View>
        </Animated.View>
      </View>
      {chat ? <ChatSendSheet payload={{ text: message, image: () => capture() }} onClose={() => setChat(false)} /> : null}
    </View>
  );
}

function Halo({ size }: { size: number }) {
  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id="moment-halo" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#ffe9a8" stopOpacity={0.55} />
          <Stop offset="0.55" stopColor="#d6b46c" stopOpacity={0.16} />
          <Stop offset="1" stopColor="#d6b46c" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#moment-halo)" />
    </Svg>
  );
}

const LEAF = "M10 0C16 5 17 14 10 24C3 14 4 5 10 0Z";
function Leaf({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 20 24">
      <Path d={LEAF} fill={color} />
      <Path d="M10 3V22" stroke="rgba(8,38,29,0.35)" strokeWidth={0.8} />
    </Svg>
  );
}
/** gold leaves drifting down once, each on its own path; none with Reduce Motion */
function Leaves({ width, height }: { width: number; height: number }) {
  const leaves = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    x: ((i * 37) % 100) / 100 * width, delay: (i % 8) * 260, dur: 3200 + ((i * 53) % 1600), size: 10 + ((i * 7) % 9),
    sway: 18 + ((i * 11) % 26), turn: i % 2 ? 1 : -1, color: ["#e9cf99", "#d6b46c", "#c6a65e", "#f3e2b6"][i % 4],
  })), [width]);
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{leaves.map((l, i) => <FallingLeaf key={i} {...l} height={height} />)}</View>;
}
function FallingLeaf({ x, delay, dur, size, sway, turn, color, height }: { x: number; delay: number; dur: number; size: number; sway: number; turn: number; color: string; height: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(v, { toValue: 1, duration: dur, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [v, dur, delay]);
  return (
    <Animated.View style={{
      position: "absolute", left: x, top: -30,
      opacity: v.interpolate({ inputRange: [0, 0.08, 0.8, 1], outputRange: [0, 1, 0.9, 0] }),
      transform: [
        { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.82] }) },
        { translateX: v.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, sway, 0, -sway, 0] }) },
        { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${turn * 300}deg`] }) },
      ],
    }}>
      <Leaf size={size} color={color} />
    </Animated.View>
  );
}

/** the share card: 360 × 450 points (4:5), captured at 1080 × 1350; the achievement, the name, the app */
function ShareCard({ title, kicker, name, tree }: { title: string; kicker: string; name: string; tree: { id: string; type: TreeType; stage: number } }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#05211a", overflow: "hidden" }}>
      <LinearGradient colors={["#0b3d2e", "#05211a", "#03140e"]} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      <View style={StyleSheet.absoluteFill}><StarLattice opacity={0.07} size={48} /></View>
      <View style={{ position: "absolute", left: 12, right: 12, top: 12, bottom: 12, borderWidth: 1, borderColor: "rgba(214,180,108,0.55)", borderRadius: 18 }} />
      <View style={{ position: "absolute", left: 17, right: 17, top: 17, bottom: 17, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(214,180,108,0.3)", borderRadius: 14 }} />
      <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 34, paddingTop: 34, paddingBottom: 26 }}>
        <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: stage.gold }}>{kicker}</Text>
        <View style={{ width: 200, height: 196, alignItems: "center", justifyContent: "flex-end", marginTop: 8 }}>
          <View style={{ position: "absolute", top: -20 }}><Halo size={240} /></View>
          <TreeArt id={tree.id} type={tree.type} stage={tree.stage} traits={readGarden().traits} season={seasonNow()} size={160} still />
        </View>
        <Text allowFontScaling={false} numberOfLines={3} style={{ fontFamily: FONT.display, fontSize: 25, lineHeight: 30, letterSpacing: -0.3, color: stage.cream, textAlign: "center", marginTop: 12 }}>{title}</Text>
        {name ? <Text allowFontScaling={false} numberOfLines={1} style={{ fontFamily: FONT.italic, fontSize: 15, color: stage.gold, marginTop: 8 }}>{name}</Text> : null}
        <View style={{ flex: 1 }} />
        <BrandFoot />
      </View>
    </View>
  );
}
