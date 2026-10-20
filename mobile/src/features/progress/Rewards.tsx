import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, AppState, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stage } from "@/components/brand";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, stage } from "@/lib/theme";
import { useWebT } from "@/i18n/web";
import { api } from "@/lib/api";
import { readJSON, useStoreVersion, writeJSON } from "@/lib/store";
import { onWebEvent } from "@/lib/webshim";
import { LOUD, addActiveMinute, levelOf, setRuleOverrides, totalPoints, type PointKind } from "@/web/points";
import { buildCtx, earnedIds, markSeen, readSeen, stickerById } from "@/web/stickers";
import { LevelSeal, STAGE } from "./art";
import { Sticker } from "./Sticker";
import { Rays, StickerPop } from "./motion";
import { go } from "./links";
import { GoldPill, OutlinePill } from "./ui";

// Points and celebrations, like the website's Rewards.tsx: counts active learning time (1 point per active minute),
// shows a small "+n" when points are earned, and celebrates every new sticker and level once.

type Moment = { kind: "sticker"; id: string } | { kind: "level"; n: number };
type Cfg = { features?: { celebrations?: boolean }; points?: Parameters<typeof setRuleOverrides>[0] };

// recitation or radio playing counts as active time even without touches (the players call reportPlaying)
let playing = false;
let lastInput = Date.now();
/** the verse player / radio report whether audio is playing, so listening counts as active learning time */
export function reportPlaying(on: boolean) { playing = on; }
/** any interaction with the app keeps the active-time counter running (RewardsHost does this for its children) */
export function touchActivity() { lastInput = Date.now(); }

/**
 * Mount once around the app's navigator (inside the providers):
 *   <RewardsHost><Routes /></RewardsHost>
 * It needs no props. Without children it only shows the overlays and counts listening time.
 */
export function RewardsHost({ children }: { children?: ReactNode }) {
  const tr = useWebT("rewards");
  const insets = useSafeAreaInsets();
  const [gain, setGain] = useState<{ pts: number; kind: PointKind; key: number } | null>(null);
  const [queue, setQueue] = useState<Moment[]>([]);
  const celebrate = useRef(true);
  const check = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pop = useRef(new Animated.Value(0)).current;

  // switches from the admin dashboard: point rules and celebrations (cached as tf:cfg like on the website)
  useEffect(() => {
    const apply = (c: Cfg) => { setRuleOverrides(c.points); celebrate.current = c.features?.celebrations !== false; };
    apply(readJSON<Cfg>("tf:cfg", {}));
    api<Cfg>("/api/config").then((c) => { writeJSON("tf:cfg", c, true); apply(c); }).catch(() => undefined);
  }, []);

  // active time: the app is in the foreground and the learner did something in the last 90 seconds, or audio plays
  useEffect(() => {
    let acc = 0;
    const iv = setInterval(() => {
      if (AppState.currentState !== "active" && !playing) return;
      if (!playing && Date.now() - lastInput > 90_000) return;
      acc += 15;
      if (acc >= 60) { acc -= 60; addActiveMinute(); }
    }, 15_000);
    return () => clearInterval(iv);
  }, []);

  // new stickers and levels; on the very first run everything already earned is taken as seen (no flood of celebrations)
  const run = useCallback(() => {
    const earned = earnedIds(buildCtx());
    const first = readJSON<string[] | null>("tf:stickers", null) === null;
    const seen = new Set(readSeen());
    const fresh = first ? [] : earned.filter((id) => !seen.has(id));
    if (first || fresh.length) markSeen(earned); // write only when something changed (the store re-runs this check)
    const lvl = levelOf(totalPoints()).n;
    const prevLvl = readJSON<number>("tf:level", 0);
    if (prevLvl !== lvl) writeJSON("tf:level", lvl, true);
    const moments: Moment[] = fresh.map((id) => ({ kind: "sticker" as const, id }));
    if (prevLvl > 0 && lvl > prevLvl) moments.unshift({ kind: "level", n: lvl });
    if (moments.length && celebrate.current) setQueue((q) => [...q, ...moments]);
  }, []);
  const later = useCallback(() => { if (check.current) clearTimeout(check.current); check.current = setTimeout(run, 900); }, [run]);
  useEffect(() => {
    const off = onWebEvent("tf-points", (e) => {
      const d = e.detail as { pts: number; kind: PointKind };
      if (d && LOUD.includes(d.kind) && celebrate.current) setGain((g) => ({ pts: (g && Date.now() - g.key < 1600 ? g.pts : 0) + d.pts, kind: d.kind, key: Date.now() }));
      later();
    });
    run();
    return () => { off(); if (check.current) clearTimeout(check.current); };
  }, [run, later]);
  // after a sync with the account (the store changes) the check runs again
  const version = useStoreVersion();
  useEffect(() => { later(); }, [version, later]);

  useEffect(() => {
    if (!gain) return;
    pop.setValue(0);
    Animated.sequence([
      Animated.timing(pop, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(pop, { toValue: 2, duration: 360, useNativeDriver: true }),
    ]).start();
    const id = setTimeout(() => setGain(null), 1800);
    return () => clearTimeout(id);
  }, [gain, pop]);

  const m = queue[0];
  const close = () => setQueue((q) => q.slice(1));
  const def = m?.kind === "sticker" ? stickerById(m.id) : undefined;

  const overlays = (
    <>
      {gain ? (
        <Animated.View pointerEvents="none" accessibilityLiveRegion="polite"
          style={{ position: "absolute", left: 0, right: 0, top: insets.top + 60, alignItems: "center",
            opacity: pop.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 1, 0] }),
            transform: [{ translateY: pop.interpolate({ inputRange: [0, 1, 2], outputRange: [-10, 0, -6] }) }, { scale: pop.interpolate({ inputRange: [0, 1, 2], outputRange: [0.9, 1, 1] }) }] }}>
          <View style={{ borderRadius: R.pill, borderWidth: 1, borderColor: "rgba(214,180,108,0.5)", backgroundColor: STAGE, paddingHorizontal: 16, paddingVertical: 6, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: stage.gold }}>+{gain.pts} {tr("pts")} · {tr(`k_${gain.kind}`)}</Text>
          </View>
        </Animated.View>
      ) : null}
      <Modal visible={!!m} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
        <Pressable onPress={close} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 20 }} accessibilityLabel={tr("continue")}>
          {m ? (
            <Pressable onPress={() => undefined} style={{ width: "100%", maxWidth: 384 }} accessibilityViewIsModal>
              <Stage rounded={16} style={{ borderWidth: 1, borderColor: "rgba(214,180,108,0.3)" }}>
                <View style={{ padding: 28, alignItems: "center" }}>
                  <Rays size={420} style={{ top: 110 - 210, left: "50%", marginLeft: -210 }} />
                  <Text style={{ fontFamily: FONT.bold, fontSize: 11, letterSpacing: 2.2, textTransform: "uppercase", color: stage.gold }}>{m.kind === "level" ? tr("newLevel") : tr("newSticker")}</Text>
                  <StickerPop key={m.kind === "level" ? `l${m.n}` : m.id} style={{ marginTop: 16 }}>
                    {def ? <Sticker def={def} size={148} /> : <LevelSeal n={m.kind === "level" ? m.n : 1} />}
                  </StickerPop>
                  {m.kind === "level" ? (
                    <>
                      <Text style={{ fontFamily: CALLIG_FONT, fontSize: 36, lineHeight: 54, color: stage.gold, marginTop: 16 }}>{levelOf(totalPoints()).ar}</Text>
                      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 24, color: "#eef0f3", marginTop: 4, textAlign: "center" }}>{tr(`l${m.n}`)}</Text>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.7)", marginTop: 8, textAlign: "center" }}>{tr("levelBody", { n: m.n })}</Text>
                    </>
                  ) : def ? (
                    <>
                      <Text style={{ fontFamily: CALLIG_FONT, fontSize: 36, lineHeight: 54, color: stage.gold, marginTop: 16 }}>{def.ar}</Text>
                      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 24, color: "#eef0f3", marginTop: 4, textAlign: "center" }}>{tr(`s_${def.id}`)}</Text>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.7)", marginTop: 8, textAlign: "center" }}>{tr(`d_${def.id}`)}</Text>
                      {def.verse ? (
                        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 40, color: "rgba(255,255,255,0.9)", marginTop: 16, textAlign: "center", writingDirection: "rtl" }}>
                          {def.verse} <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>({def.ref})</Text>
                        </Text>
                      ) : null}
                    </>
                  ) : null}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 24 }}>
                    <GoldPill pill={false} arrow={false} title={tr("seeAll")} onPress={() => { close(); go("/stats"); }} />
                    <OutlinePill onStage title={tr("continue")} onPress={close} style={{ minHeight: 44 }} />
                  </View>
                </View>
              </Stage>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );

  if (!children) return <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>{overlays}</View>;
  return (
    <View style={{ flex: 1 }} onTouchStart={touchActivity}>
      {children}
      {overlays}
    </View>
  );
}

export default RewardsHost;
