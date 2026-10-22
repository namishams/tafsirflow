import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, AppState, Easing, I18nManager, PanResponder, Pressable, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useIsFocused, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GoldButton, OutlineButton, StarLattice } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { FONT, R, stage } from "@/lib/theme";
import { useReducedMotionX } from "@/features/extra/motion";
import { success, tick } from "@/features/feed/haptics";
import { useFeedTimer } from "@/features/feed/statsStore";
import { bonusXp, initGamify } from "@/features/feed/gamify";
import { Celebrations } from "@/features/feed/Celebrate";
import { useSrsLimits } from "@/features/srs/gate";
import { useIntl } from "@/features/srs/format";
import { useSwipeConfig } from "./config";
import { SwipeDeck, type SCard } from "./deck";
import { KIND_KEY, LearnCard, hasBack, type MashaView } from "./Card";
import { XP_SET, answered, learned, sendMasha } from "./learn";
import { flushShown, mashaState, swipeStreak, useSwipeStats } from "./store";
import { useSwipeT } from "./texts";

// Swipe & Learn: a full-screen stack of learning cards. A card is read mindfully first: a thin gold bar fills over
// swipe.minSeconds (owner: 10 s, server config); before that the card resists with a soft haptic. Then it is swiped to
// the LEFT ("learned, next", Tinder-style with the thumb); a swipe to the right bounces back with a gentle hint. The gold
// button does the same for everyone who does not swipe (VoiceOver, Switch Control, Reduce Motion). After every
// swipe.sessionSize cards a short summary. Achievement moments of other learners come in between; swiping one to the left
// sends that person a MashaAllah through the existing reaction endpoint and its caps.
const MAX_W = 520;
const AHEAD = 3;
type Toast = { text: string; sub?: string } | null;
type Session = { n: number; words: number; reviews: number; masha: number; xp: number };
const EMPTY_SESSION: Session = { n: 0, words: 0, reviews: 0, masha: 0, xp: 0 };

/** read time of the current card: counts only while the screen is visible and the app active */
function useReadTimer(key: string, seconds: number, on: boolean, reduce: boolean) {
  // the remaining seconds belong to one card: a new card is never "ready" with the time of the card before
  const [left, setLeft] = useState({ key, n: seconds });
  const prog = useRef(new Animated.Value(0)).current;
  const acc = useRef({ key, ms: 0, from: 0 });
  if (acc.current.key !== key) acc.current = { key, ms: 0, from: Date.now() };
  useEffect(() => {
    prog.stopAnimation(); prog.setValue(seconds ? 0 : 1);
    setLeft({ key, n: seconds });
  }, [key, seconds, prog]);
  useEffect(() => {
    if (!on) return;
    const a = acc.current;
    const total = seconds * 1000;
    a.from = Date.now();
    const spent = () => a.ms + (Date.now() - a.from);
    if (!reduce && total > 0) Animated.timing(prog, { toValue: 1, duration: Math.max(0, total - a.ms), easing: Easing.linear, useNativeDriver: true }).start();
    const id = setInterval(() => {
      if (AppState.currentState !== "active") return;
      const ms = spent();
      if (reduce) prog.setValue(Math.min(1, total ? ms / total : 1));
      setLeft({ key, n: Math.max(0, Math.ceil((total - ms) / 1000)) });
    }, 250);
    return () => { clearInterval(id); a.ms = spent(); prog.stopAnimation(); };
  }, [key, seconds, on, reduce, prog]);
  const n = left.key === key ? left.n : seconds;
  return { ready: n <= 0, left: n, prog };
}

export function SwipeScreen() {
  const st = useSwipeT();
  const nf = useIntl();
  const { lang } = useLang();
  const { user } = useAuth();
  const { unlimited } = useSrsLimits();
  const cfg = useSwipeConfig();
  const reduce = useReducedMotionX();
  const focused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const stats = useSwipeStats();

  const deck = useRef<SwipeDeck | null>(null);
  const [stack, setStack] = useState<SCard[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const [masha, setMasha] = useState<MashaView>("open");
  const [session, setSession] = useState<Session>(EMPTY_SESSION);
  const [summary, setSummary] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [hint, setHint] = useState<string | null>(null);
  const cur = stack[0];

  // ---------- the deck ----------
  // the stack lives in a ref as well: taking cards from the deck is a side effect and must not run inside a state updater
  const stackRef = useRef<SCard[]>([]);
  const setCards = useCallback((next: SCard[]) => { stackRef.current = next; setStack(next); }, []);
  const topUp = useCallback(() => {
    const d = deck.current;
    if (!d) return;
    const out = [...stackRef.current];
    while (out.length < AHEAD) { const c = d.take(); if (!c) break; out.push(c); }
    if (out.length !== stackRef.current.length) setCards(out);
  }, [setCards]);
  useEffect(() => {
    initGamify();
    const d = new SwipeDeck(lang, { unlimited, signedIn: !!user, momentEvery: cfg.momentEvery });
    deck.current = d;
    setCards([]);
    const off = d.onChange(topUp);
    topUp();
    const t = setTimeout(topUp, 600);
    return () => { clearTimeout(t); off(); d.dispose(); flushShown(); };
  }, [lang, !!user]); // eslint-disable-line react-hooks/exhaustive-deps
  // nothing ready after a while: offline or slow sources
  useEffect(() => {
    if (cur) { setWaiting(false); return; }
    const t = setTimeout(() => setWaiting(true), 8000);
    const r = setInterval(topUp, 1500);
    return () => { clearTimeout(t); clearInterval(r); };
  }, [cur, topUp]);

  // a new card on top: front side, no answer, the MashaAllah state of a moment
  useEffect(() => {
    setFlipped(false); setAnswer(null); setHint(null);
    if (cur?.kind === "moment" && cur.moment) setMasha(mashaState(cur.moment.author.username) === "open" ? "open" : "already");
  }, [cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const seconds = cur?.kind === "moment" ? Math.min(cfg.momentSeconds, cfg.minSeconds) : cfg.minSeconds;
  const timer = useReadTimer(cur?.id ?? "", seconds, focused && !!cur && !summary, reduce);
  useFeedTimer(focused && !summary);

  // ---------- learning a card ----------
  const showToast = useCallback((t: Toast) => { setToast(t); if (t) setTimeout(() => setToast((x) => (x === t ? null : x)), 3200); }, []);
  const advance = useCallback(() => {
    const c = stack[0];
    if (!c) return;
    if (c.kind === "moment") {
      void sendMasha(c).then((r) => {
        if (r === "sent") { setSession((s) => ({ ...s, masha: s.masha + 1 })); showToast({ text: st("mashaSent") }); }
        if (r === "profile") { deck.current?.stopMoments(); showToast({ text: st("mashaProfile") }); }
        if (r === "dayFull") deck.current?.stopMoments();
      });
    } else {
      const r = learned(c, cfg.dailyGrowth);
      const n = session.n + 1;
      const set = n % cfg.sessionSize === 0;
      if (set) bonusXp(XP_SET);
      setSession((s) => ({ n: s.n + 1, words: s.words + (r.newWord ? 1 : 0), reviews: s.reviews + (r.review ? 1 : 0), masha: s.masha, xp: s.xp + r.xp + (set ? XP_SET : 0) }));
      if (r.streak) {
        if (r.milestone) success();
        showToast({ text: st("streakTitle", { n: nf(r.streak) }), sub: r.xp ? st("summaryXp", { n: nf(r.xp) }) : undefined });
        AccessibilityInfo.announceForAccessibility?.(st("streakTitle", { n: nf(r.streak) }));
      }
      if (set) { setSummary(true); success(); }
    }
    setCards(stackRef.current.slice(1));
    topUp();
  }, [stack, cfg.dailyGrowth, cfg.sessionSize, session.n, showToast, st, nf, topUp, setCards]);

  // ---------- the gesture ----------
  const drag = useRef(new Animated.Value(0)).current;
  const live = useRef({ ready: false, reduce, advance, left: 0, w: width });
  live.current = { ready: timer.ready, reduce, advance, left: timer.left, w: width };
  const leaving = useRef(false);
  useEffect(() => { drag.setValue(0); leaving.current = false; }, [cur?.id, drag]);
  const nudge = useCallback((text: string) => { tick(); setHint(text); AccessibilityInfo.announceForAccessibility?.(text); }, []);
  const dismiss = useCallback(() => {
    const L = live.current;
    if (!L.ready || leaving.current) return;
    leaving.current = true;
    tick();
    if (L.reduce) { L.advance(); return; }
    Animated.timing(drag, { toValue: -L.w * 1.25, duration: 220, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => L.advance());
  }, [drag]);
  const pan = useMemo(() => PanResponder.create({
    // horizontal moves belong to the stack (also over the card's own scroll view); vertical ones scroll the card
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
    onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6,
    onPanResponderTerminationRequest: () => false,
    // before the read time is over the card resists: a soft haptic as soon as it is grabbed
    onPanResponderGrant: () => { if (!live.current.ready) tick(); },
    onPanResponderMove: (_, g) => {
      const L = live.current;
      if (L.reduce) return;
      // left: follows the thumb once the card is read (before: resists); right: only a little rubber band
      drag.setValue(g.dx < 0 ? (L.ready ? g.dx : g.dx * 0.16) : g.dx * 0.3);
    },
    onPanResponderRelease: (_, g) => {
      const L = live.current;
      const back = () => (L.reduce ? drag.setValue(0) : Animated.spring(drag, { toValue: 0, friction: 5, tension: 70, useNativeDriver: true }).start());
      if (g.dx < -90 || (g.dx < -40 && g.vx < -0.6)) {
        if (L.ready) { dismiss(); return; }
        nudge(st("tooEarly", { n: L.left }));
        back();
        return;
      }
      if (g.dx > 50) nudge(st("swipeLeft"));
      back();
    },
    onPanResponderTerminate: () => { Animated.spring(drag, { toValue: 0, useNativeDriver: true }).start(); },
  }), [drag, dismiss, nudge, st]);

  // ---------- layout ----------
  const cardW = Math.min(width - 32, MAX_W);
  const topH = 54, bottomH = 138;
  const cardH = Math.max(380, height - insets.top - insets.bottom - topH - bottomH - 22);
  const rot = drag.interpolate({ inputRange: [-400, 0, 400], outputRange: ["-9deg", "0deg", "9deg"] });
  const nextScale = drag.interpolate({ inputRange: [-cardW, 0, cardW], outputRange: [1, 0.94, 0.94], extrapolate: "clamp" });
  const barW = cardW - 44;
  const barX = timer.prog.interpolate({ inputRange: [0, 1], outputRange: [I18nManager.isRTL ? barW : -barW, 0] });
  const streak = swipeStreak(stats);
  const close = () => (router.canGoBack() ? router.back() : router.replace("/learn" as Href));

  const kindLabel = cur ? st(KIND_KEY[cur.kind]) : "";
  const mom = cur?.kind === "moment";
  const wait = `${st("readMindfully")} · ${st("seconds", { n: nf(timer.left) })}`;
  const buttonTitle = !cur ? st("loading") : !timer.ready ? wait : mom ? (masha === "open" ? st("sendMasha") : st("nextCard")) : st("learned");
  // the button counts down; the line above says what to do (dimmed until the card is read)
  const status = hint ?? (mom && masha === "open" ? st("mashaHint") : st("swipeLeft"));

  return (
    <View style={{ flex: 1, backgroundColor: stage.deep }}>
      <StatusBar style="light" />
      <LinearGradient colors={["rgb(10,48,37)", stage.deep, "rgb(3,18,13)"]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}><StarLattice opacity={0.05} /></View>

      {/* the bar: close, title, progress of the set and the streak */}
      <View style={{ paddingTop: insets.top, height: insets.top + topH, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 }}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel={st("close")} hitSlop={8} style={({ pressed }) => ({ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
          <Icon name="close" size={22} color={stage.cream} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: "#fff" }}>{st("title")}</Text>
          <Text style={{ fontFamily: FONT.medium, fontSize: 12, color: stage.textMuted }}>{st("progress", { n: nf((session.n % cfg.sessionSize) + (summary ? cfg.sessionSize : 0)), total: nf(cfg.sessionSize) })}</Text>
        </View>
        <View accessible accessibilityLabel={st("entryStreak", { n: nf(streak) })} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 3 }}>
          <Icon name="flame" size={16} color={streak ? stage.gold : stage.textMuted} />
          <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: streak ? stage.cream : stage.textMuted }}>{nf(streak)}</Text>
        </View>
      </View>

      {/* the stack */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {summary ? (
          <Summary w={cardW} h={cardH} s={session} size={cfg.sessionSize} streak={streak} onContinue={() => { setSummary(false); topUp(); }} onFinish={close} />
        ) : cur ? (
          <View style={{ width: cardW, height: cardH }}>
            {stack[1] ? (
              <Animated.View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ position: "absolute", top: 0, left: 0, opacity: 0.92, transform: [{ translateY: 12 }, { scale: reduce ? 0.94 : nextScale }] }}>
                <LearnCard card={stack[1]} w={cardW} h={cardH} flipped={false} onFlip={() => undefined} answer={null} onAnswer={() => undefined} />
              </Animated.View>
            ) : null}
            <Animated.View {...pan.panHandlers} accessibilityLabel={st("a11yCard", { kind: kindLabel })}
              style={{ position: "absolute", top: 0, left: 0, borderRadius: 22, boxShadow: "0px 10px 36px rgba(0,0,0,0.35)", transform: [{ translateX: drag }, { rotate: reduce ? "0deg" : rot }] }}>
              <LearnCard key={cur.id} card={cur} w={cardW} h={cardH} flipped={flipped} masha={masha}
                onFlip={() => { if (hasBack(cur)) { tick(); setFlipped((f) => !f); } }}
                answer={answer} onAnswer={(i) => { if (answer !== null) return; const q = (cur.lib as { quiz?: { answer: number } } | undefined)?.quiz; setAnswer(i < 0 ? q?.answer ?? 0 : i); if (i >= 0) { answered(i === q?.answer); tick(); } }} />
              {/* the read timer: a thin gold bar along the top of the card */}
              <View pointerEvents="none" style={{ position: "absolute", top: 14, left: 22, width: barW, height: 3, borderRadius: 2, overflow: "hidden", backgroundColor: "rgba(214,180,108,0.2)" }}>
                <Animated.View style={{ width: barW, height: 3, borderRadius: 2, backgroundColor: stage.gold, transform: [{ translateX: barX }] }} />
              </View>
            </Animated.View>
          </View>
        ) : (
          <View style={{ width: cardW, height: cardH, borderRadius: 22, borderWidth: 1, borderColor: stage.goldSoft, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 }}>
            <Icon name="book" size={26} color={stage.gold} />
            <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 15, color: stage.cream, textAlign: "center" }}>{waiting ? st("offline") : st("loading")}</Text>
          </View>
        )}
      </View>

      {/* status line and the one gold action */}
      {summary ? <View style={{ height: bottomH + insets.bottom }} /> : (
        <View style={{ height: bottomH + insets.bottom, paddingBottom: insets.bottom + 10, paddingHorizontal: 16, alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: 22 }}>
            {timer.ready && cur ? <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: stage.gold }}>←</Text> : null}
            <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.medium, fontSize: 13.5, color: timer.ready ? stage.cream : stage.textMuted, textAlign: "center" }}>{cur ? status : ""}</Text>
          </View>
          <View style={{ width: Math.min(cardW, 420), alignSelf: "center" }}>
            <GoldButton title={buttonTitle} disabled={!cur || !timer.ready} onPress={dismiss} />
          </View>
        </View>
      )}

      {toast ? (
        <View pointerEvents="none" style={{ position: "absolute", top: insets.top + topH + 8, left: 0, right: 0, alignItems: "center" }}>
          <View accessibilityLiveRegion="polite" style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: R.pill, backgroundColor: stage.bg, borderWidth: 1, borderColor: stage.gold, alignItems: "center", maxWidth: cardW }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: stage.cream, textAlign: "center" }}>{toast.text}</Text>
            {toast.sub ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: stage.gold, marginTop: 2 }}>{toast.sub}</Text> : null}
          </View>
        </View>
      ) : null}
      <Celebrations />
    </View>
  );
}

function Summary({ w, h, s, size, streak, onContinue, onFinish }: { w: number; h: number; s: Session; size: number; streak: number; onContinue: () => void; onFinish: () => void }) {
  const st = useSwipeT();
  const nf = useIntl();
  const lines = [
    s.words ? (s.words === 1 ? st("summaryWord1") : st("summaryWords", { n: nf(s.words) })) : null,
    s.reviews ? st("summaryReviews", { n: nf(s.reviews) }) : null,
    s.masha ? st("summaryMasha", { n: nf(s.masha) }) : null,
  ].filter((x): x is string => !!x);
  return (
    <View style={{ width: w, height: h, borderRadius: 22, borderWidth: 1, borderColor: stage.gold, backgroundColor: stage.bg, alignItems: "center", justifyContent: "center", padding: 26, gap: 14 }}>
      <View style={{ width: 78, height: 78, borderRadius: 39, borderWidth: 2, borderColor: stage.gold, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: FONT.display, fontSize: 26, color: stage.cream }}>{nf(size)}</Text>
      </View>
      <Text accessibilityRole="header" style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 30, color: "#fff", textAlign: "center" }}>{st("summaryTitle")}</Text>
      <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: stage.cream, textAlign: "center" }}>{[st("summaryCards", { n: nf(size) }), ...lines].join(" · ")}</Text>
      {s.xp ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.gold }}>{st("summaryXp", { n: nf(s.xp) })}</Text> : null}
      {streak ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: stage.textSoft, textAlign: "center" }}>{st("entryStreak", { n: nf(streak) })}</Text> : null}
      <View style={{ alignSelf: "stretch", gap: 10, marginTop: 10 }}>
        <GoldButton title={st("continue")} onPress={onContinue} />
        <OutlineButton title={st("finish")} onStage onPress={onFinish} />
      </View>
    </View>
  );
}
