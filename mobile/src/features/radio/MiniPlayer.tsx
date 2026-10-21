import { useEffect, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, usePathname, type Href } from "expo-router";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { BlurView } from "expo-blur";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { TAB_BAR_HEIGHT } from "@/components/TabBar";
import { useWebT } from "@/i18n/web";
import { isRTL, useLang } from "@/i18n";
import { reciterName } from "@/lib/quran";
import { useReciterGuard } from "@/features/quran/reciter";
import * as vp from "@/features/reader/versePlayback";
import { currentReciter, initials, radio, useBackToLive, useRadio } from "./engine";
import { useAppT } from "./strings";
import { useLoop, useReduceMotion } from "./motion";

// One now-playing bar for the whole app, like Apple Music: a Liquid Glass capsule floating just above the tab bar that
// shows the source the listener used last – the radio (always on air) or a verse session that carries on after the
// reader was left (versePlayback.ts). Starting one source hides the other's bar (the audio itself already pauses via the
// tf-audio-start / tf-radio-start events). Nothing shows until something played in this session; close stops the
// source and hides the bar until something plays again. In the reader (its own player dock) and on the full radio
// player it steps aside. Mounted once in the root layout.

type Source = "radio" | "verse";
const TAB_ROOTS = ["/quran", "/learn", "/library", "/account"];
const READER = ["/quran/", "/shams/"];
const GLASS = Platform.OS === "ios" && isLiquidGlassAvailable();
export const BAR_HEIGHT = 64;
/** height to keep free at the bottom of a scrolling screen while the bar shows */
export const MINI_SPACE = BAR_HEIGHT + 20;

// the radio screen hides the bar while its own big controls are on screen (RadioMiniPlayer visible={false})
let heroOnScreen = false;
const heroListeners = new Set<() => void>();
function setHero(v: boolean) { if (v !== heroOnScreen) { heroOnScreen = v; heroListeners.forEach((l) => l()); } }
function useHero() {
  const [v, setV] = useState(heroOnScreen);
  useEffect(() => { const l = () => setV(heroOnScreen); heroListeners.add(l); l(); return () => { heroListeners.delete(l); }; }, []);
  return v;
}

export function NowPlayingBar() {
  useReciterGuard();
  const r = useRadio();
  const v = vp.useVersePlayback();
  const path = usePathname();
  const hero = useHero();
  const [src, setSrc] = useState<Source | null>(null);
  // whatever starts to play becomes the bar's source
  useEffect(() => { if (v.playing) setSrc("verse"); }, [v.playing]);
  useEffect(() => { if (r.playing) setSrc("radio"); }, [r.playing]);

  const verseOn = !!v.session && !v.attached;
  const active: Source | null = src === "verse" && verseOn ? "verse" : src === "radio" && r.started ? "radio" : null;
  if (!active) return null;
  if (READER.some((p) => path.startsWith(p)) || path.startsWith("/radio/now")) return null;
  if (hero && path.startsWith("/radio")) return null;
  const onTabs = path === "/" || TAB_ROOTS.some((p) => path === p || path.startsWith(`${p}/`));
  return active === "radio" ? <RadioBar onTabs={onTabs} /> : <VerseBar onTabs={onTabs} />;
}

function useBottom(onTabs: boolean) {
  const insets = useSafeAreaInsets();
  // the tab bar floats at max(inset - 6, 12) (TabBar.tsx); the capsule sits 8 pt above it
  return onTabs ? Math.max(insets.bottom - 6, 12) + TAB_BAR_HEIGHT + 8 : insets.bottom + 10;
}

function Capsule({ onTabs, children }: { onTabs: boolean; children: ReactNode }) {
  const th = useTheme();
  const bottom = useBottom(onTabs);
  const { width } = useWindowDimensions();
  const w = Math.min(width - 24, 520);
  const shadow = { shadowColor: "#000", shadowOpacity: th.dark ? 0.45 : 0.14, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } };
  return (
    <View pointerEvents="box-none" style={[s.wrap, { bottom }]}>
      <View style={[{ width: w, borderRadius: BAR_HEIGHT / 2 }, shadow]}>
        {GLASS ? (
          <GlassView glassEffectStyle="regular" isInteractive tintColor={th.dark ? "rgba(7,22,17,0.35)" : "rgba(255,255,255,0.45)"} style={s.capsule}>
            <View style={s.row}>{children}</View>
          </GlassView>
        ) : (
          <View style={[s.capsule, { borderWidth: StyleSheet.hairlineWidth, borderColor: th.line, elevation: 8, backgroundColor: th.dark ? "rgba(13,33,26,0.6)" : "rgba(255,255,255,0.6)" }]}>
            <BlurView intensity={70} tint={th.dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"} style={StyleSheet.absoluteFill} />
            <View style={s.row}>{children}</View>
          </View>
        )}
      </View>
    </View>
  );
}

function Controls({ playing, onToggle, onNext, nextDisabled, onClose, labels }: {
  playing: boolean; onToggle: () => void; onNext: () => void; nextDisabled?: boolean; onClose: () => void;
  labels: { play: string; pause: string; next: string; close: string };
}) {
  const th = useTheme();
  return (
    <>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={playing ? labels.pause : labels.play}
        style={({ pressed }) => [s.btn, { borderRadius: 22, backgroundColor: th.accent, opacity: pressed ? 0.85 : 1 }]}>
        <Icon name={playing ? "pause" : "play"} color={th.onAccent} size={20} />
      </Pressable>
      <Pressable onPress={onNext} disabled={nextDisabled} accessibilityRole="button" accessibilityLabel={labels.next} accessibilityState={{ disabled: !!nextDisabled }}
        style={({ pressed }) => [s.btn, { opacity: nextDisabled ? 0.35 : pressed ? 0.6 : 1 }]}>
        <Icon name="next" color={th.ink} size={20} />
      </Pressable>
      <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={labels.close}
        style={({ pressed }) => [s.btn, { width: 40, opacity: pressed ? 0.6 : 1 }]}>
        <Icon name="close" color={th.muted} size={18} />
      </Pressable>
    </>
  );
}

function RadioBar({ onTabs }: { onTabs: boolean }) {
  const r = useRadio();
  const t = useWebT("radio");
  const a = useAppT();
  const { lang } = useLang();
  const th = useTheme();
  const reduce = useReduceMotion();
  const pulse = useLoop(r.playing && !reduce, 1600);
  const back = useBackToLive();
  useEffect(() => { if (back) AccessibilityInfo.announceForAccessibility(a("backToLive")); }, [back]); // eslint-disable-line react-hooks/exhaustive-deps
  const reciter = currentReciter(r);
  const ch = r.chapters.find((c) => c.id === r.now.s);
  const title = `${ch ? `${ch.id}. ${ch.name_simple}` : `${r.now.s}`} · ${r.now.v}`;
  const sub = `${t(`st_${r.station.id}`)} · ${reciterName(reciter, lang)}`;
  const dot = { opacity: r.playing && !reduce ? pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.3, 1] }) : 1 };
  return (
    <Capsule onTabs={onTabs}>
      <Pressable onPress={() => router.push("/radio/now" as Href)} accessibilityRole="button" accessibilityHint={t("openRadio")}
        accessibilityLabel={`${t("onAir")}. ${title}, ${sub}`} style={s.main}>
        <View style={[s.art, { backgroundColor: stage.bg }]}>
          <View style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: stage.gold, alignItems: "center", justifyContent: "center" }}>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={{ fontFamily: FONT.bold, fontSize: 10.5, color: stage.gold, letterSpacing: isRTL(lang) ? 0 : 0.5 }}>{initials(reciter.name) || "Q"}</Text>
          </View>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={[s.title, { color: th.ink }]}>{title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
            <View style={s.live}>
              <Animated.View style={[s.liveDot, dot]} />
              <Text style={[s.liveText, { letterSpacing: isRTL(lang) ? 0 : 0.8 }]}>{t("onAir")}</Text>
            </View>
            <Text numberOfLines={1} style={[s.sub, { flex: 1, color: back ? th.accent : th.muted, fontFamily: back ? FONT.semibold : FONT.regular }]}
              accessibilityLiveRegion="polite">{back ? a("backToLive") : sub}</Text>
          </View>
        </View>
      </Pressable>
      <Controls playing={r.playing} onToggle={radio.toggle} onNext={radio.skipVerse} onClose={radio.stop}
        labels={{ play: t("play"), pause: t("pause"), next: t("nextVerse"), close: a("closePlayer") }} />
    </Capsule>
  );
}

function VerseBar({ onTabs }: { onTabs: boolean }) {
  const v = vp.useVersePlayback();
  const t = useWebT("radio");
  const a = useAppT();
  const { lang } = useLang();
  const th = useTheme();
  const s0 = v.session;
  if (!s0) return null;
  const title = `${s0.chapterName} · ${s0.idx + 1}`;
  const sub = reciterName({ folder: s0.reciterFolder, name: s0.reciterName }, lang);
  const last = s0.idx >= s0.items.length - 1;
  return (
    <Capsule onTabs={onTabs}>
      <Pressable onPress={() => router.push(`/quran/${s0.chapterId}?v=${s0.idx + 1}` as Href)} accessibilityRole="button"
        accessibilityLabel={`${t("openSurah")}: ${title}, ${sub}`} style={s.main}>
        <View style={[s.art, { backgroundColor: th.accentSoft }]}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: th.accent, fontVariant: ["tabular-nums"] }}>{s0.chapterId}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={[s.title, { color: th.ink }]}>{title}</Text>
          <Text numberOfLines={1} style={[s.sub, { color: th.muted, marginTop: 2 }]}>{sub}</Text>
        </View>
      </Pressable>
      <Controls playing={v.playing} onToggle={vp.toggle} onNext={() => vp.step(1)} nextDisabled={last} onClose={vp.stop}
        labels={{ play: t("play"), pause: t("pause"), next: t("nextVerse"), close: a("closePlayer") }} />
    </Capsule>
  );
}

/**
 * Older per-screen mini player. The one bar now lives in the root layout (NowPlayingBar); a screen copy draws nothing.
 * The radio screen passes `visible={false}` while its own controls are on screen, which keeps the bar out of the way.
 */
export function RadioMiniPlayer({ visible = true }: { global?: boolean; visible?: boolean; bottomOffset?: number }) {
  useEffect(() => { setHero(!visible); }, [visible]);
  useEffect(() => () => setHero(false), []);
  return null;
}

const s = StyleSheet.create({
  wrap: { position: "absolute", start: 0, end: 0, alignItems: "center" },
  capsule: { height: BAR_HEIGHT, borderRadius: BAR_HEIGHT / 2, overflow: "hidden" },
  row: { flex: 1, flexDirection: "row", alignItems: "center", paddingStart: 10, paddingEnd: 8, gap: 2 },
  main: { flex: 1, minWidth: 0, minHeight: 44, flexDirection: "row", alignItems: "center", gap: 10, marginEnd: 4 },
  art: { width: 44, height: 44, borderRadius: R.sm, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  title: { fontFamily: FONT.bold, fontSize: 14 },
  sub: { fontFamily: FONT.regular, fontSize: 12 },
  btn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  live: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1.5, backgroundColor: "rgb(220,38,38)" },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#ffffff" },
  liveText: { fontFamily: FONT.display, fontSize: 9.5, color: "#ffffff" },
});
