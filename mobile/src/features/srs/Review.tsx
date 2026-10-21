import { DoneShare } from "@/features/share/SharePrompt";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, PanResponder, Pressable, Text, View, useWindowDimensions } from "react-native";
import { router, type Href } from "expo-router";
import { GoldCard, Stage } from "@/components/brand";
import { R, FONT, stage, useTheme } from "@/lib/theme";
import { useIntl } from "./format";
import { success, tick } from "../feed/haptics";
import { Girih, PracticeCelebrate } from "../coursekit/art";
import { useClip } from "../coursekit/audio";
import { useReduceMotion } from "../coursekit/motion";
import { BigButton } from "../coursekit/ui";
import { today } from "@/web/learning";
import { PlayButton, useCardFace } from "./CardFace";
import { preview, type Grade } from "./fsrs";
import { rateCard, readSrsState } from "./store";
import { useSrsT, type SrsKey } from "./texts";

// One review round: the card turns over on a tap; then Again / Hard / Good / Easy by button or by swiping
// (left / down / right / up). Haptic tick on every turn and rating; Reduce Motion turns every animation off.
const LABEL: Record<Grade, SrsKey> = { 1: "again", 2: "hard", 3: "good", 4: "easy" };

export function ReviewSession({ ids }: { ids: string[] }) {
  const st = useSrsT();
  const t = useTheme();
  const nf = useIntl();
  const [queue, setQueue] = useState(ids);
  const [done, setDone] = useState({ n: 0, ok: 0 });
  const [flipped, setFlipped] = useState(false);
  const [round, setRound] = useState(0);
  const cur = queue[0];
  if (!cur) {
    return (
      <View style={{ alignItems: "center", gap: 14, paddingTop: 24 }}>
        <PracticeCelebrate />
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 26, color: t.ink, textAlign: "center" }}>{st("sessionDone")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 16, color: t.muted, textAlign: "center" }}>{st("sessionStats", { n: nf(done.n), ok: nf(done.ok) })}</Text>
        <BigButton title={st("backToCards")} onPress={() => (router.canGoBack() ? router.back() : router.replace("/cards" as Href))} style={{ alignSelf: "stretch", marginTop: 8 }} />
        {done.n > 0 ? <DoneShare kind="review" title={st("sessionDone")} big={nf(done.n)} body={st("sessionStats", { n: nf(done.n), ok: nf(done.ok) })} /> : null}
      </View>
    );
  }
  const rate = (g: Grade) => {
    rateCard(cur, g);
    if (g >= 3) success(); else tick();
    setDone((d) => ({ n: d.n + 1, ok: d.ok + (g >= 2 ? 1 : 0) }));
    setFlipped(false);
    setRound((r) => r + 1);
    // "again" (and "hard" on a new card) is due today: it comes back at the end of this round
    const due = readSrsState().cards[cur]?.m?.due ?? 0;
    setQueue((q) => (due <= today() && g <= 2 ? [...q.slice(1), cur] : q.slice(1)));
  };
  return (
    <View>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted, textAlign: "center", marginBottom: 10 }}>{`${nf(done.n)} · ${nf(queue.length)}`}</Text>
      <SwipeCard key={`${cur}|${round}`} id={cur} seed={round} flipped={flipped} onFlip={() => { tick(); setFlipped(true); }} onRate={rate} />
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "center", marginTop: 10 }}>{flipped ? st("swipeHint") : st("tapToFlip")}</Text>
      {flipped ? <Ratings id={cur} onRate={rate} /> : <BigButton title={st("tapToFlip")} onPress={() => { tick(); setFlipped(true); }} style={{ marginTop: 14 }} />}
    </View>
  );
}

function Ratings({ id, onRate }: { id: string; onRate: (g: Grade) => void }) {
  const st = useSrsT();
  const t = useTheme();
  const nf = useIntl();
  const p = useMemo(() => preview(readSrsState().cards[id]?.m ?? null, today()), [id]);
  const colors: Record<Grade, string> = { 1: t.danger, 2: t.gold, 3: t.accent, 4: t.accent };
  return (
    <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
      {([1, 2, 3, 4] as Grade[]).map((g) => (
        <Pressable key={g} onPress={() => onRate(g)} accessibilityRole="button" accessibilityLabel={`${st(LABEL[g])}, ${p[g] ? st("inDays", { n: nf(p[g]) }) : st("now")}`}
          style={({ pressed }) => ({ flex: 1, minHeight: 56, borderRadius: R.md, borderWidth: 1, borderColor: colors[g], alignItems: "center", justifyContent: "center", backgroundColor: g === 3 ? t.accentSoft : t.surface, opacity: pressed ? 0.7 : 1 })}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: colors[g] }}>{st(LABEL[g])}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted, marginTop: 2 }}>{p[g] ? st("inDays", { n: nf(p[g]) }) : st("now")}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function SwipeCard({ id, seed, flipped, onFlip, onRate }: { id: string; seed: number; flipped: boolean; onFlip: () => void; onRate: (g: Grade) => void }) {
  const st = useSrsT();
  const reduce = useReduceMotion();
  const face = useCardFace(id, seed);
  const clip = useClip();
  const { width } = useWindowDimensions();
  const turn = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.ValueXY()).current;
  const live = useRef({ flipped, reduce, onRate });
  live.current = { flipped, reduce, onRate };

  useEffect(() => {
    if (!flipped) { turn.setValue(0); return; }
    if (reduce) { turn.setValue(1); return; }
    Animated.timing(turn, { toValue: 1, duration: 520, easing: Easing.bezier(0.3, 0.7, 0.2, 1), useNativeDriver: true }).start();
  }, [flipped, reduce, turn]); // eslint-disable-line react-hooks/exhaustive-deps
  // the word or verse is heard when the card turns over
  useEffect(() => { if (flipped && face.audio) clip.play(face.audio); }, [flipped]); // eslint-disable-line react-hooks/exhaustive-deps

  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => live.current.flipped && (Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10),
    onPanResponderMove: (_, g) => { if (!live.current.reduce) drag.setValue({ x: g.dx, y: g.dy }); },
    onPanResponderRelease: (_, g) => {
      const ax = Math.abs(g.dx), ay = Math.abs(g.dy);
      let grade: Grade | null = null;
      if (ax > 90 && ax > ay) grade = g.dx > 0 ? 3 : 1;
      else if (ay > 90) grade = g.dy < 0 ? 4 : 2;
      if (!grade) { if (live.current.reduce) drag.setValue({ x: 0, y: 0 }); else Animated.spring(drag, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start(); return; }
      const fin = grade;
      if (live.current.reduce) { live.current.onRate(fin); return; }
      Animated.timing(drag, { toValue: { x: Math.sign(g.dx) * (ax > ay ? width : 0), y: ax > ay ? g.dy : Math.sign(g.dy) * 700 }, duration: 180, useNativeDriver: true }).start(() => live.current.onRate(fin));
    },
  }), [drag, width]);

  const rot = drag.x.interpolate({ inputRange: [-300, 0, 300], outputRange: ["-8deg", "0deg", "8deg"] });
  const front = { opacity: turn.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: [1, 1, 0, 0] }), transform: [{ perspective: 1400 }, { rotateY: turn.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }] };
  const back = { opacity: turn.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: [0, 0, 1, 1] }), transform: [{ perspective: 1400 }, { rotateY: turn.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] }) }] };
  const fill = { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };
  return (
    <Animated.View {...pan.panHandlers} style={{ minHeight: 340, transform: [{ translateX: drag.x }, { translateY: drag.y }, { rotate: rot }] }}>
      <Animated.View pointerEvents={flipped ? "none" : "auto"} style={[{ backfaceVisibility: "hidden", flex: 1 }, front]}>
        <Pressable onPress={onFlip} accessibilityRole="button" accessibilityHint={st("tapToFlip")} style={{ flex: 1 }}>
          <Stage rounded={R.card} hairlines={false} pattern={false} style={{ flex: 1, minHeight: 340, borderWidth: 1, borderColor: stage.goldSoft }}>
            <Girih />
            <View style={{ flex: 1, minHeight: 340, alignItems: "center", justifyContent: "center", padding: 22 }}>{face.front}</View>
          </Stage>
        </Pressable>
      </Animated.View>
      <Animated.View pointerEvents={flipped ? "auto" : "none"} style={[{ backfaceVisibility: "hidden" }, fill, back]}>
        <GoldCard style={{ flex: 1, minHeight: 340, alignItems: "center", justifyContent: "center", padding: 22 }}>
          {face.back}
          {face.audio ? <View style={{ marginTop: 12 }}><PlayButton label={st("play")} onPress={() => clip.play(face.audio!)} /></View> : null}
        </GoldCard>
      </Animated.View>
      {face.audio && !flipped ? <View style={{ position: "absolute", top: 12, end: 12 }}><PlayButton onStage label={st("play")} onPress={() => clip.play(face.audio!)} /></View> : null}
    </Animated.View>
  );
}
